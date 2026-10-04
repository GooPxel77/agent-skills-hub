# Skill Lab mascot animation performance · 2026-10-04

Scope: existing Skill Lab mascot only. Canonical body/sprout,118x129 mobile/132x145 desktop sizes, slot anchors (whetstone46%), timing, theme colors, route exclusions and tap semantics preserved.

Changes:
- Mascot.tsx: cropped static SVG eyes inside individual HTML transform layers (~17px desktop), preserving halo/moon geometry and5.2s blink including120ms second-eye phase.
- mascot.css: compositor hints only on small core/sprout/eye layers; layout/style containment does not clip accessories. Hidden/guarded/shy_wait and offscreen loops pause. Existing shadow/blush appearance retained; their filters still have a cost and have not been claimed eliminated.
- engine/senses.ts: pointer proximity sampled at100ms, single bounding-box read per sample instead of two per pointer event. Background stops100ms scheduler; visibility return resumes immediately. Foreground offscreen recovery scheduling stays alive, avoiding a shy-hide deadlock. Observer/listener/timer disposal retained.
- mascot.config.ts: pre-sized transparent WebP display derivatives. originals untouched. plate396px, sprout64px, whetstone244px, star80px, sized for at least3x normal display (whetstone4x). Generate with node scripts/optimize-mascot.mjs. Lossless encoding follows downsampling; not pixel-identical to source resolution.
- Light asset bytes1,990,604 ->90,346; dark1,274,925 ->71,702. Original prepared skin/source files unchanged.

Verification:
- tsc -b,9 mascot engine checks, Vite production compilation pass.
- Browser production preview3189:4 derivatives loaded, two HTML eye layers show5.2s cadence; click reachable; search focus enters guarded, animations computed paused.
- Full npm build's remote Supabase/static export stages not run: frontend compilation is verified, not full data export.
- Safari/Brave GPU-process CPU reduction not measured or guaranteed. No animation removal or cadence reduction.
