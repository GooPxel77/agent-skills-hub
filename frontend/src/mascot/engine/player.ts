import { mascotConfig, type MascotBehaviorId } from "../../mascot.config";
import type { MascotBehavior, MascotMode, MascotSnapshot, MascotSignal, StorageLike } from "./types";
import { readMemory, clamp, jitter, decayDrives } from "./drives";
import { selectBehavior } from "./selection";
export type { MascotSnapshot, MascotSignal } from "./types";

/** One 100 ms tick owns all autonomous and interaction timing. No action timers. */
export class MascotEngine {
  private readonly storage: StorageLike | null;
  private readonly random: () => number;
  private view: MascotSnapshot;
  private dirty = true;
  private hidden = false;
  private busy = false;
  private fullscreen = false;
  private priority: number = mascotConfig.priorities.autonomous;
  private actionUntil = 0;
  private phaseUntil = 0;
  private companionUntil = 0;
  private quietUntil = 0;
  private nextActionAt: number;
  private lastActivityAt: number;
  private lastHeartbeatAt: number;
  private lastPersistAt: number;
  private lastAlertAt = Number.NEGATIVE_INFINITY;
  private lastAnticAt = Number.NEGATIVE_INFINITY;
  private hoverInside = false;
  private hoverLeaveAt = Number.POSITIVE_INFINITY;
  private tapCount = 0;
  private tapDueAt = Number.POSITIVE_INFINITY;
  private tapAnchorX: number | null = null;
  private lastBehavior: MascotBehaviorId | null = null;

  constructor(storage: StorageLike | null, now: number, random: () => number = Math.random) {
    this.storage = storage;
    this.random = random;
    const memory = readMemory(storage);
    this.view = {
      mode: "rest",
      behavior: null,
      xPercent: memory.xPercent,
      transitionMs: 700,
      actionMs: 0,
      drives: memory.drives,
    };
    this.nextActionAt = now + mascotConfig.scheduler.firstActionMs;
    this.lastActivityAt = now;
    this.lastHeartbeatAt = now;
    this.lastPersistAt = now;
  }

  snapshot(): MascotSnapshot {
    return { ...this.view, drives: { ...this.view.drives } };
  }

  consumeChanged() {
    const changed = this.dirty;
    this.dirty = false;
    return changed;
  }

  tick(now: number, signals: MascotSignal[], reducedMotion: boolean) {
    for (const signal of signals) this.handle(signal, now, reducedMotion);
    this.flushTaps(now, reducedMotion);
    if (now >= this.hoverLeaveAt) { this.hoverInside = false; this.hoverLeaveAt = Number.POSITIVE_INFINITY; }

    const guarded = this.hidden || this.busy || this.fullscreen;
    if (guarded) {
      if (this.view.mode !== "guarded") {
        this.cancelAction();
        this.view.mode = "guarded";
        this.view.transitionMs = 450;
        this.tapCount = 0;
        this.dirty = true;
      }
      return;
    }
    if (this.view.mode === "guarded") {
      this.returnToRest(now, 1_500);
      return;
    }

    this.advanceDrives(now, this.view.mode === "sleep");

    if (this.view.mode === "shy" && now >= this.phaseUntil) {
      this.view.mode = "shy_hide";
      this.view.behavior = null;
      this.view.transitionMs = reducedMotion ? 1 : mascotConfig.scheduler.shyHideMs;
      this.phaseUntil = now + this.view.transitionMs;
      this.dirty = true;
      return;
    }
    // Shy phases own recovery; generic interrupt completion must not undo hiding.
    if (this.view.mode === "shy") return;
    if (this.view.mode === "shy_hide") {
      if (now >= this.phaseUntil) this.enterShyWait(now);
      return;
    }
    if (this.view.mode === "shy_wait") {
      if (now >= this.phaseUntil) {
        this.quietUntil = now + mascotConfig.scheduler.shyQuietMs;
        this.returnToRest(now, 6_000);
      }
      return;
    }

    if (this.priority > mascotConfig.priorities.autonomous && now >= this.actionUntil) {
      this.finishInterrupt(now);
    }

    if (this.view.mode === "companion" && now >= this.companionUntil &&
      this.priority === mascotConfig.priorities.autonomous) {
      this.returnToRest(now, 1_500);
    }

    if (now - this.lastActivityAt >= mascotConfig.scheduler.sleepAfterMs &&
      this.priority === mascotConfig.priorities.autonomous && this.view.mode !== "sleep") {
      this.cancelAction();
      this.view.mode = "sleep";
      this.view.transitionMs = 800;
      this.nextActionAt = Number.POSITIVE_INFINITY;
      this.dirty = true;
    }

    if (reducedMotion || this.tapCount > 0 || this.priority > mascotConfig.priorities.autonomous || this.view.mode === "sleep") return;

    if (this.view.behavior && now >= this.actionUntil) {
      this.view.behavior = null;
      if (this.view.mode === "peek") this.view.mode = "rest";
      this.view.transitionMs = 650;
      this.nextActionAt = now + this.nextGap();
      this.dirty = true;
    }
    if (!this.view.behavior && now >= this.nextActionAt) this.startAutonomous(now);
  }

  private handle(signal: MascotSignal, now: number, reducedMotion: boolean) {
    if (signal.type === "document_hidden") { this.hidden = signal.value; return; }
    if (signal.type === "busy") { this.busy = signal.value; return; }
    if (signal.type === "fullscreen") { this.fullscreen = signal.value; return; }
    if (signal.type === "transition_end") {
      if (this.view.mode === "shy_hide") this.enterShyWait(now);
      return;
    }
    if (this.hidden || this.busy || this.fullscreen || this.view.mode === "guarded") return;
    if (signal.type === "hover_leave") {
      this.hoverLeaveAt = now + mascotConfig.motion.hoverLeaveMs;
      return;
    }
    if (signal.type === "tap") {
      if (this.priority < mascotConfig.priorities.direct) {
        this.freezeAt(signal.anchorX);
        this.cancelAction();
        this.view.transitionMs = 1;
        this.dirty = true;
      }
      this.lastActivityAt = now;
      this.flushTaps(signal.at, reducedMotion);
      this.tapCount += 1;
      this.tapDueAt = signal.at + mascotConfig.scheduler.tapWindowMs;
      this.tapAnchorX = signal.anchorX;
      if (this.tapCount >= 3) {
        this.tapCount = 0;
        this.tapDueAt = Number.POSITIVE_INFINITY;
        this.tapAnchorX = null;
        this.directAction("triple", now, signal.anchorX, reducedMotion);
      }
      return;
    }
    if (signal.type === "pointer_activity") {
      this.lastActivityAt = now;
      if (signal.near && this.view.mode === "sleep") this.returnToRest(now, 1_000);
      return;
    }
    if (signal.type === "hover") {
      this.hoverLeaveAt = Number.POSITIVE_INFINITY;
      if (this.hoverInside) return;
      this.hoverInside = true;
      this.lastActivityAt = now;
      this.view.drives.affection = clamp(this.view.drives.affection + mascotConfig.drives.hoverAffection, 0, 100);
      if (now < this.quietUntil || this.isShy()) return;
      this.freezeAt(signal.anchorX);
      this.startInterrupt("hover_wiggle", "peek", mascotConfig.priorities.direct,
        mascotConfig.scheduler.hoverMs, now, reducedMotion);
      return;
    }
    if (signal.type === "scroll") this.lastActivityAt = now;
    if (signal.type === "nearby") {
      this.view.drives.curiosity = clamp(this.view.drives.curiosity + mascotConfig.drives.nearbyCuriosity, 0, 100);
    }
    if (this.tapCount > 0 || now < this.quietUntil || this.isShy() || this.priority > mascotConfig.priorities.environment || reducedMotion) return;
    if (now - this.lastAlertAt < mascotConfig.scheduler.minimumAlertGapMs) return;
    if (signal.type === "nearby" && this.random() >= mascotConfig.motion.nearbyChance) return;
    if (signal.type === "scroll" || signal.type === "nearby" || signal.type === "theme") {
      this.lastAlertAt = now;
      this.startInterrupt("peek_curious", "alert", mascotConfig.priorities.environment,
        mascotConfig.scheduler.alertMs, now, reducedMotion);
    }
  }

  private flushTaps(now: number, reducedMotion: boolean) {
    if (!this.tapCount || now < this.tapDueAt) return;
    const count = this.tapCount;
    this.tapCount = 0;
    this.tapDueAt = Number.POSITIVE_INFINITY;
    const anchorX = this.tapAnchorX;
    this.tapAnchorX = null;
    this.directAction(count === 2 ? "double" : "single", now, anchorX, reducedMotion);
  }

  private directAction(kind: "single" | "double" | "triple", now: number,
    anchorX: number | null, reducedMotion: boolean) {
    if (this.isShy()) return;
    if (anchorX !== null) this.freezeAt(anchorX);
    this.view.drives.affection = clamp(this.view.drives.affection + mascotConfig.drives.clickAffection, 0, 100);
    this.lastActivityAt = now;
    this.companionUntil = now + mascotConfig.scheduler.activeIdleMs;
    if (kind === "triple") {
      this.startInterrupt("blush", "shy", mascotConfig.priorities.direct,
        mascotConfig.scheduler.blushMs, now, reducedMotion);
      this.phaseUntil = this.actionUntil;
    } else if (kind === "double") {
      this.startInterrupt("flinch", "shock", mascotConfig.priorities.direct,
        mascotConfig.scheduler.flinchMs, now, reducedMotion);
    } else {
      this.startInterrupt("click_react", "companion", mascotConfig.priorities.direct,
        mascotConfig.scheduler.clickMs, now, reducedMotion);
    }
  }

  private startInterrupt(behavior: Exclude<MascotBehavior, null>, mode: MascotMode,
    priority: number, duration: number, now: number, reducedMotion: boolean) {
    if (priority < this.priority || this.isShy()) return;
    this.view.mode = mode;
    this.view.behavior = reducedMotion ? null : behavior;
    this.view.actionMs = duration;
    this.view.transitionMs = reducedMotion ? 1 : Math.min(duration, 760);
    this.priority = priority;
    this.actionUntil = now + duration;
    this.dirty = true;
  }

  private finishInterrupt(now: number) {
    this.priority = mascotConfig.priorities.autonomous;
    this.view.behavior = null;
    this.view.mode = now < this.companionUntil ? "companion" : "rest";
    this.view.transitionMs = 650;
    this.nextActionAt = now + this.nextGap();
    this.dirty = true;
  }

  private startAutonomous(now: number) {
    const antic = mascotConfig.siteAntic;
    if (now - this.lastActivityAt >= antic.minimumIdleMs &&
      now - this.lastAnticAt >= antic.cooldownMs && this.random() < antic.chance) {
      this.lastAnticAt = now;
      this.view.behavior = antic.id;
      this.view.actionMs = antic.durationMs;
      this.actionUntil = now + antic.durationMs;
      this.view.transitionMs = antic.durationMs;
      this.dirty = true;
      return;
    }
    const behavior = selectBehavior(this.view, this.lastBehavior, this.random);
    const base = mascotConfig.behaviorWheel.find((item) => item.id === behavior)!;
    const duration = Math.round(base.durationMs * jitter(
      1 - mascotConfig.scheduler.durationDrift, 1 + mascotConfig.scheduler.durationDrift, this.random));
    this.lastBehavior = behavior;
    this.view.behavior = behavior;
    this.view.actionMs = duration;
    this.actionUntil = now + duration;
    if (behavior === "peek_curious") {
      this.view.mode = "peek";
      this.view.transitionMs = 720;
    } else if (behavior === "wander_slide") {
      this.view.transitionMs = duration;
      this.chooseWanderPosition();
    } else {
      this.view.transitionMs = 650;
    }
    this.dirty = true;
  }

  private chooseWanderPosition() {
    const step = jitter(mascotConfig.motion.wanderMinStepPercent,
      mascotConfig.motion.wanderMaxStepPercent, this.random);
    const direction = this.random() < 0.5 ? -1 : 1;
    let target = this.view.xPercent + direction * step;
    if (target < mascotConfig.motion.wanderMinPercent || target > mascotConfig.motion.wanderMaxPercent) {
      target = this.view.xPercent - direction * step;
    }
    this.view.xPercent = clamp(target, mascotConfig.motion.wanderMinPercent, mascotConfig.motion.wanderMaxPercent);
    this.dirty = true;
  }

  private freezeAt(xPercent: number) {
    if (this.view.behavior !== "wander_slide") return;
    this.view.xPercent = clamp(xPercent, mascotConfig.motion.minHorizontalPercent,
      mascotConfig.motion.maxHorizontalPercent);
    this.dirty = true;
  }

  private cancelAction() {
    this.view.behavior = null;
    this.priority = mascotConfig.priorities.autonomous;
    this.actionUntil = 0;
  }

  private returnToRest(now: number, nextDelay: number) {
    this.cancelAction();
    this.companionUntil = 0;
    this.view.mode = "rest";
    this.view.transitionMs = 700;
    this.nextActionAt = now + nextDelay;
    this.dirty = true;
  }

  private enterShyWait(now: number) {
    this.view.mode = "shy_wait";
    this.phaseUntil = now + mascotConfig.scheduler.shyHiddenMs;
    this.dirty = true;
  }

  private isShy() {
    return this.view.mode === "shy" || this.view.mode === "shy_hide" || this.view.mode === "shy_wait";
  }

  private nextGap() {
    return jitter(mascotConfig.scheduler.idleGapMinMs,
      mascotConfig.scheduler.idleGapMaxMs, this.random);
  }

  private advanceDrives(now: number, sleeping: boolean) {
    const elapsed = now - this.lastHeartbeatAt;
    if (elapsed < mascotConfig.scheduler.heartbeatMs) return;
    this.lastHeartbeatAt = now;
    const minutes = elapsed / 60_000;
    const drives = this.view.drives;
    decayDrives(drives, minutes, sleeping);
    this.dirty = true;
    if (now - this.lastPersistAt >= mascotConfig.motion.persistenceMs && this.storage) {
      this.lastPersistAt = now;
      try {
        this.storage.setItem(mascotConfig.storageKey, JSON.stringify({
          xPercent: this.view.xPercent,
          drives,
        }));
      } catch {
        // Storage is optional; the mascot works in private browsing too.
      }
    }
  }
}
