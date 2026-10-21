---
name: motion
description: Create motion-graphics videos from code — explainers, teaching clips, animated titles, data stories, product teasers — with the motion-primitives library (51 frame-pure animation primitives, a headless-Chrome renderer, and a code-synthesized SFX engine; no video assets, no After Effects). Use when the user asks to make, animate, or render a video, motion graphic, animated explainer, or animated text/diagram.
---

# motion — code-video production kit

You make videos by writing a **composition**: a JavaScript file whose
`render(frame, stage)` returns the HTML for one frame, built from the
`window.Motion` (alias `M`) primitives in `runtime/`. A headless
Chrome screenshots every frame; ffmpeg stitches them into an MP4.
Sound is synthesized from a JSON score by `runtime/src/sfx.js` — no
audio files exist anywhere in this kit.

## Setup (once per install)

```bash
cd <this skill folder>
npm install            # installs puppeteer-core, the only dependency
node scripts/doctor.mjs  # verifies Node >= 18, Chrome, ffmpeg
```

If the doctor cannot find Chrome, install Chrome/Chromium or set
`CHROME_PATH` to the browser binary. Everything else is bundled.

## Quickstart

```bash
# 1. Look at one still of the bundled example
node scripts/render.mjs --comp hello-motion --still 45 --out /tmp/hello.png

# 2. Render the example video (90 frames, ~seconds)
node scripts/render.mjs --comp hello-motion --out hello.mp4 --concurrency 4

# 3. Synthesize its sound score and mux it in
node scripts/sfx.mjs --score runtime/src/compositions/hello-motion.sfx.json --out hello.wav
node scripts/render.mjs --comp hello-motion --out hello-sound.mp4 --audio hello.wav --concurrency 4
```

Compositions live in `runtime/src/compositions/<name>.js`. To make a
new video, copy the example, rename, edit, render.

## Workflow (do not skip steps 3 and 5)

1. **Brief.** Pin down: topic, audience, duration, aspect (1280×720
   default; 720×1280 for vertical), silent or scored, style —
   teaching-flat (see `references/STYLE.md`) or premium-dark
   (mesh gradient + camera + grade). Write the acceptance bar down.
2. **Storyboard as events.** List what happens per shot: subject,
   entrance, the one event of the shot, exit. Events happen once —
   ambient layers (particleField, breathe) are the only loops.
3. **Stills first.** Render 4–8 key stills (`--still N`) and LOOK at
   each: subject size, text overflow, overlaps, empty regions. Fix
   the composition, not the render. Never full-render blind.
4. **Sound (if scored).** Write the `.sfx.json` score against the
   visual frame numbers — the engine lands every sound one frame
   after its visual automatically. Sounds: pop, bloop, ting,
   whoosh, thump, inhale, glide, shimmer, swell, chord. For
   music-first pieces, generate cue frames with
   `M.beatFrames({ bpm, count })`.
5. **Verify the render.** `ffprobe` the MP4: frame count must equal
   `durationInFrames`, and an audio stream must exist for scored
   pieces. Extract 3–5 frames and look at them. Only then deliver.
6. **Deliver** the MP4 with one honest paragraph: what it is, the
   style, what you verified, what's weak.

## Hard rules

- **Frame-pure.** The picture is a function of `frame` only. No
  setTimeout, no CSS animations, no rAF. Randomness only through
  `M.hash(n)` (deterministic).
- **The meta field is `durationInFrames`** (plus width/height/fps).
  A wrong name renders 0 frames — the classic first-run failure.
- **Entrances move ≥2 properties** (position + scale/opacity).
  Stagger lists/groups by 3–6 frames (`M.stagger`).
- **Timing dialects.** Landings: 3–4 frames, hard stop + squash.
  Pops: 0.2–0.3 s. Travel: 0.5–0.7 s. Camera moves finish and stop;
  no perpetual slow push.
- **Check return types before concatenating.** Some primitives
  return numbers (`pop`, `pulse`, `countUp`) or transform strings
  (`camera`, `parallax`, `fx`); most return HTML strings. The
  catalog in `references/API.md` says which.
- **Default render is the finish grade** (x264 slow/film, CRF 16).
  `--draft` (veryfast, CRF 23) is for previews only.
- **Facts are not decoration.** Numbers, names and dates in a
  teaching video must be verified or labeled illustrative.

## References

- `references/API.md` — every primitive, grouped, with signatures
  and return types.
- `references/STYLE.md` — the flat teaching style (round-face
  character, scene color rotation, code capsule, hard cuts).
- `runtime/src/compositions/hello-motion.js` — the annotated
  example composition; its `.sfx.json` shows the score format.
- The full library source this runtime was synced from:
  https://github.com/sunjiali/motion-primitives
