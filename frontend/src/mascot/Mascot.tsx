"use client";

import { type CSSProperties, useRef, useState } from "react"
import { mascotConfig } from "../mascot.config"
import { type MascotSignal, type MascotSnapshot } from "./engine/player"
import "./mascot.css"
import { useMascotSenses } from "./engine/senses"

const initialSnapshot: MascotSnapshot = {
  mode: "rest",
  behavior: null,
  xPercent: mascotConfig.motion.startHorizontalPercent,
  transitionMs: 700,
  actionMs: 0,
  drives: { ...mascotConfig.drives.defaults },
}

export default function SkillMascot() {
  const [snapshot, setSnapshot] = useState(initialSnapshot)
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const signalsRef = useRef<MascotSignal[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)

  useMascotSenses(buttonRef, signalsRef, setSnapshot, setTheme)

  const anchorX = () => {
    const box = buttonRef.current?.getBoundingClientRect()
    return box ? (box.left + box.width / 2) / window.innerWidth * 100 : snapshot.xPercent
  }
  const enqueue = (signal: MascotSignal) => signalsRef.current.push(signal)
  const plate = theme === "dark" ? mascotConfig.core.dark : mascotConfig.core.light
  const sprout = theme === "dark" ? mascotConfig.core.sprout.dark : mascotConfig.core.sprout.light
  const style = {
    left: "50%",
    bottom: 0,
    "--skill-breath-ms": mascotConfig.animation.breathMs + "ms",
    "--skill-blink-ms": mascotConfig.animation.blinkMs + "ms",
    "--skill-sprout-angle": mascotConfig.animation.sproutDegrees + "deg",
    "--skill-hover-ms": mascotConfig.scheduler.hoverMs + "ms",
    "--skill-click-ms": mascotConfig.scheduler.clickMs + "ms",
    "--skill-mobile-width": mascotConfig.motion.stage.mobile.width + "px",
    "--skill-mobile-height": mascotConfig.motion.stage.mobile.height + "px",
    "--skill-desktop-width": mascotConfig.motion.stage.desktop.width + "px",
    "--skill-desktop-height": mascotConfig.motion.stage.desktop.height + "px",
    "--skill-mobile-rest": mascotConfig.motion.restOffsetPx.mobile + "px",
    "--skill-desktop-rest": mascotConfig.motion.restOffsetPx.desktop + "px",
    "--skill-mobile-peek": mascotConfig.motion.peekOffsetPx.mobile + "px",
    "--skill-desktop-peek": mascotConfig.motion.peekOffsetPx.desktop + "px",
    "--skill-mobile-hidden": mascotConfig.motion.hiddenOffsetPx.mobile + "px",
    "--skill-desktop-hidden": mascotConfig.motion.hiddenOffsetPx.desktop + "px",
    "--skill-lift": mascotConfig.motion.companionLiftPx + "px",
    "--skill-x": `${snapshot.xPercent - 50}vw`,
    "--skill-transition-ms": `${snapshot.transitionMs}ms`,
    "--skill-action-ms": `${snapshot.actionMs}ms`,
  } as CSSProperties

  return (
    <div className="skill-mascot-boundary">
    <aside aria-label="Skill Lab mascot" className="skill-mascot-dock" data-mode={snapshot.mode}
      data-behavior={snapshot.behavior ?? "idle"} data-theme={theme} style={style}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === "transform")
          enqueue({ type: "transition_end" })
      }}>
      <button ref={buttonRef} type="button" className="skill-mascot-button"
        aria-label="與 Skill Lab 桌寵互動"
        onPointerEnter={(event) => { if (event.pointerType !== "touch") enqueue({ type: "hover", anchorX: anchorX() }) }}
        onPointerLeave={() => enqueue({ type: "hover_leave" })}
        onClick={() => enqueue({ type: "tap", at: Date.now(), anchorX: anchorX() })}>
        <span className="skill-mascot-stage" aria-hidden="true">
          <span className="skill-mascot-core">
            <img className="skill-mascot-plate" src={plate} alt="" draggable={false} />
            <span className="skill-mascot-sprout" style={{
              left: mascotConfig.core.sprout.left,
              top: mascotConfig.core.sprout.top,
              width: mascotConfig.core.sprout.displayWidth,
              height: mascotConfig.core.sprout.displayHeight,
              transformOrigin: mascotConfig.core.sprout.pivot,
            }}><img src={sprout} alt="" draggable={false} /></span>
            {Object.entries(mascotConfig.slots).map(([id, slot]) => (
              <span key={id} className={`skill-mascot-slot skill-mascot-${id}`} style={{
                ...("left" in slot ? { left: slot.left } : { right: slot.right }),
                top: slot.top, width: slot.width, zIndex: slot.zIndex,
                transform: slot.transform, transformOrigin: slot.pivot,
              }}><img src={theme === "dark" ? slot.dark : slot.light} alt="" draggable={false} /></span>
            ))}
            <svg className="skill-mascot-eyes" viewBox={`0 0 ${mascotConfig.core.width} ${mascotConfig.core.height}`}>
              {mascotConfig.core.eyes.map((eye, index) => <g className="skill-mascot-eye" key={index}
                style={{ transformOrigin: `${eye.x}px ${eye.y}px` }}>
                <circle className="skill-mascot-eye-halo" cx={eye.x} cy={eye.y} r={eye.haloRadius} />
                <circle className="skill-mascot-eye-moon" cx={eye.x} cy={eye.y} r={eye.moonRadius} />
              </g>)}
            </svg>
            <span className="skill-mascot-cheek skill-mascot-cheek-left" />
            <span className="skill-mascot-cheek skill-mascot-cheek-right" />
          </span>
        </span>
      </button>
    </aside>
    </div>
  )
}
