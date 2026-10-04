# Skill Lab mascot acceptance · 2026-10-04

## Delivered
- Four TypeScript modules: senses, drives, selection, player. A single100ms tick arbitrates input and weighted autonomous actions; one-second drive updates and position/drive persistence.
- Config: src/mascot.config.ts; manifest: public/mascot/skins/skill-lab/manifest.json;17skins/33slots behavior catalog: src/mascot.behaviors.json. Only Skill Lab is installed here.
- Untouched canonical plate and original sprout with eyes positioned from core/eyes.json. Light uses black ink / dark uses baked white ink. No color filters, extra anatomy, text bubbles, quick access or pointer gaze.
- Shared stage118×129 mobile /132×145 desktop, half-eye rest, bounded bottom travel16–84%, limited autonomous peek, full direct reveal. Breath3400ms, blink5200ms, sprout±6°, hover560ms.
- Single: stone stroke and star pulse with small hop. Double: flinch and equipment recoil. Triple: blush-hide-recover. Rare practice_polish antic after20s idle.40/30/20/10wheel with±20% timing drift and drive weighting.
- Editing focus, visible dialogs, fullscreen, hidden tabs suppress activity; admin routes and active compare bar unmount the pet. Reduced motion suppresses autonomous travel and CSS animation.

## Checks
- 9 temporal engine tests passed: single/double/triple separation and recovery, priorities/guards, tap travel anchor, reduced motion/sleep, hover deduplication, drive clamp/persistence,17skin33slot coverage.
- TypeScript check and Vite production compilation passed. Complete npm build continues into existing Supabase static-page generation; this data-fetch stage was stopped after6000records because it is unrelated to mascot compilation. No full static-export completion claimed. Existing large bundle warning remains.
- Browser confirmed desktop132×145 and375px mobile118×129, original sprout and centered double eyes, all4 rendered layers loaded in both themes, search focus guarded state, click reveal and no rectangular asset backgrounds.
- Copied slot assets checked through corner BFS on near-transparent background (alpha≤16). star_dark cleaned50810connected low-alpha pixels; other3slots required no modification. Canonical core unchanged.
- Request supplied sections1–4; absent sections5–12 were not independently checked as if provided.

## References
[Oneko](https://github.com/adryd325/oneko.js/blob/main/oneko.js): idle ladder, rare antics,100ms pacing and bounded travel.
[VS Code Pets](https://github.com/tonybaloney/vscode-pets/blob/main/src/panel/states.ts): state and instance separation. Runtime adapted from the existing PostSoma integration; no GPL widget implementation copied.

No Git push or production deployment performed.
