import { useEffect, type RefObject, type Dispatch, type SetStateAction } from "react";
import { mascotConfig } from "../../mascot.config";
import { MascotEngine, type MascotSignal, type MascotSnapshot } from "./player";

function isEditing(target: Element | null) {
  return Boolean(target?.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])"))
}

export function useMascotSenses(buttonRef: RefObject<HTMLButtonElement | null>, signalsRef: RefObject<MascotSignal[]>, setSnapshot: Dispatch<SetStateAction<MascotSnapshot>>, setTheme: Dispatch<SetStateAction<"light" | "dark">>) {
  useEffect(() => {
    let storage: Storage | null = null
    try { storage = window.localStorage } catch { /* Storage is optional. */ }
    const engine = new MascotEngine(storage, Date.now())
    setSnapshot(engine.snapshot())
    engine.consumeChanged()

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const readTheme = () => {
      const root = document.documentElement
      const next = root.classList.contains("dark") || root.dataset.theme === "dark" ? "dark" : "light"
      setTheme((previous) => {
        if (previous !== next) signalsRef.current.push({ type: "theme" })
        return next
      })
    }
    readTheme()
    const themeObserver = new MutationObserver(readTheme)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] })

    let lastScrollPosition = window.scrollY
    const scrollPositions = new WeakMap<Element, number>()
    const onScroll = (event: Event) => {
      const target = event.target
      const next = target instanceof Element ? target.scrollTop : window.scrollY
      const previous = target instanceof Element ? (scrollPositions.get(target) ?? 0) : lastScrollPosition
      if (Math.abs(next - previous) >= mascotConfig.scheduler.scrollThresholdPx) {
        signalsRef.current.push({ type: "scroll" })
        if (target instanceof Element) scrollPositions.set(target, next)
        else lastScrollPosition = next
      }
    }
    let lastPointer = { x: 0, y: 0, at: 0 }
    let lastPointerActivityAt = 0
    let lastPointerSampleAt = 0
    const onPointerMove = (event: PointerEvent) => {
      const now = Date.now()
      if (now - lastPointerSampleAt < mascotConfig.scheduler.tickMs) return
      lastPointerSampleAt = now
      const current = { x: event.clientX, y: event.clientY, at: now }
      const bounds = buttonRef.current?.getBoundingClientRect()
      const near = Boolean(bounds && Math.hypot(current.x - (bounds.left + bounds.width / 2), current.y - (bounds.top + bounds.height / 2)) < mascotConfig.scheduler.nearbyRadiusPx)
      if (now - lastPointerActivityAt >= 1_000) {
        signalsRef.current.push({ type: "pointer_activity", near })
        lastPointerActivityAt = now
      }
      const elapsed = now - lastPointer.at
      if (lastPointer.at && elapsed > 0) {
        const speed = Math.hypot(current.x - lastPointer.x, current.y - lastPointer.y) / elapsed * 1_000
        if (speed >= mascotConfig.scheduler.rapidPointerSpeedPxPerSecond && near)
          signalsRef.current.push({ type: "nearby" })
      }
      lastPointer = current
    }
    let interval: number | undefined
    const step = () => {
      engine.tick(Date.now(), signalsRef.current.splice(0), motionQuery.matches)
      if (engine.consumeChanged()) setSnapshot(engine.snapshot())
    }
    const onVisibility = () => {
      signalsRef.current.push({ type: "document_hidden", value: document.hidden })
      step()
      if (interval !== undefined) window.clearInterval(interval)
      interval = document.hidden ? undefined : window.setInterval(step, mascotConfig.scheduler.tickMs)
    }
    const onFullscreen = () => signalsRef.current.push({ type: "fullscreen", value: Boolean(document.fullscreenElement) })
    let lastBusy: boolean | null = null
    const updateBusy = () => {
      const value = isEditing(document.activeElement) || [...document.querySelectorAll('[data-mascot-busy="true"], [aria-busy="true"], [role="dialog"][aria-modal="true"], [role="dialog"][data-state="open"]')].some(el => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden" && el.getAttribute("aria-hidden") !== "true")
      if (value !== lastBusy) { signalsRef.current.push({ type: "busy", value }); lastBusy = value }
    }
    const onFocusIn = () => updateBusy()
    const onFocusOut = () => queueMicrotask(updateBusy)
    const busyObserver = new MutationObserver(updateBusy)
    busyObserver.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-mascot-busy", "data-state", "aria-busy", "aria-hidden"] })

    document.addEventListener("visibilitychange", onVisibility)
    document.addEventListener("fullscreenchange", onFullscreen)
    document.addEventListener("focusin", onFocusIn)
    document.addEventListener("focusout", onFocusOut)
    document.addEventListener("scroll", onScroll, { capture: true, passive: true })
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    onVisibility()
    onFullscreen()
    updateBusy()

    return () => {
      window.clearInterval(interval)
      themeObserver.disconnect()
      busyObserver.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      document.removeEventListener("fullscreenchange", onFullscreen)
      document.removeEventListener("focusin", onFocusIn)
      document.removeEventListener("focusout", onFocusOut)
      document.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("pointermove", onPointerMove)
      signalsRef.current = []
    }
  }, [buttonRef, signalsRef, setSnapshot, setTheme])

}
