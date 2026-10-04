import type { MascotBehaviorId } from "../../mascot.config";

export type MascotMode =
  | "rest" | "peek" | "companion" | "alert" | "shock" | "shy"
  | "shy_hide" | "shy_wait" | "sleep" | "guarded";
export type MascotBehavior =
  | MascotBehaviorId | "hover_wiggle" | "click_react" | "flinch" | "blush" | null;
export type MascotSignal =
  | { type: "tap"; at: number; anchorX: number }
  | { type: "hover"; anchorX: number }
  | { type: "hover_leave" }
  | { type: "nearby" }
  | { type: "pointer_activity"; near: boolean }
  | { type: "scroll" }
  | { type: "theme" }
  | { type: "transition_end" }
  | { type: "document_hidden" | "busy" | "fullscreen"; value: boolean };

export interface Drives { energy: number; curiosity: number; affection: number }
export interface MascotSnapshot {
  mode: MascotMode;
  behavior: MascotBehavior;
  xPercent: number;
  transitionMs: number;
  actionMs: number;
  drives: Drives;
}

export type StorageLike = Pick<Storage, "getItem" | "setItem">;
