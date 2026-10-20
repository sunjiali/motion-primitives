# STYLE.md — House video style

The visual language for videos generated with motion-primitives, distilled
from a reference video (Motion Atoms, by @guanmo_ai on X) — flat, bold,
one idea per scene, code on screen.

## Canvas
- Landscape 16:9, 1280×720, 30fps for explainer/showcase videos.
- (Portrait 720×1280 is reserved for the kids' teaching series, which has its
  own skin — see the math compositions.)

## Look
- **Flat vector.** Solid shapes, no gradients except a whisper of gloss on the
  hero ball. No textures, no shadows beyond a soft contact glow.
- **One solid background per scene, changing every scene.** Palette rotation:
  cream `#FBF6EC` · blue `#2F6DB3` · ink `#26221F` · yellow rays
  (repeating-conic-gradient in `#FFD93D` / `#F5C93F`).
- **The cast is round-faced balls.** A colored circle + two eyes + a small
  smile; eyes blink every ~3 seconds. The face is what makes a primitive feel
  alive — plain dots are for trails and particles only.

## Layout (every scene, no exceptions)
- **Title, top center:** the English term, large and bold, with a period —
  `Pop.` — and its Chinese translation directly underneath, smaller.
- **Code pill, bottom center:** the exact one-line call that produced the
  motion, mono font, light text on a dark rounded pill.
- **Fixed camera.** No pans, no zooms. **Hard cuts** between scenes.

## Sound
- Silent by default (no voice-over, no music) — the reference style is a
  visual demo loop. Add audio only when a specific video asks for it.

## Rhythm
- One concept per scene, ~3 seconds per scene, loop-friendly.
- Motion itself follows the library's physics: springs overshoot, landings
  squash, flights leave trails, successes burst.
