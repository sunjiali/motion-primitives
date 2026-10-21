# EFFECTS — the living effects ledger

Every effect the library can do, and the queue of what gets built next.
Fed by ongoing research rounds (X / GitHub skill ecosystem); each round
ships as a versioned release with a CHANGELOG entry and a verified demo.

## Implemented

### Platform (v0.11)
TypeScript refactor — all sources are strict-mode `.ts`, compiled by
`tsc` to the same committed JavaScript (no behavior change; CI
build-freshness gate). No new effects this round.

### Transitions (v0.16)
- `glitch` — RGB-split glitch transition: content rebuilt from
  horizontal slices with hash jitter (re-rolled every 2 frames) plus
  two channel-isolated ghosts (SVG feColorMatrix, screen/multiply
  blend), all under a sine envelope so the window edges are clean.

### Shapes (v0.15)
- `morphShape` — shape-to-shape morph across seven built-ins
  (circle, square, triangle, diamond, hexagon, star, heart). Both
  shapes are ray-sampled at the same 72 angles around the center and
  lerped point by point; angle (not arc-length) correspondence keeps
  features at their compass positions — no mid-morph swoop, verified
  against render stills after the first cut failed that check.

### Ambience (v0.14)
- `particleField` — ambient particle layer with three modes:
  `float` (stars / dust motes wandering in place), `snow` (falls,
  sways, wraps), `rise` (bubbles / embers climbing, wraps). Particle
  homes, sizes, speeds and twinkle phases all derive from
  `hash(seed, i)` — frame-pure, stackable (stars + snow verified in
  one scene).

### Text (v0.13)
- `drawText` — handwriting-style stroke text: glyph outlines draw
  themselves at pen speed (linear by default), fill settles in over
  the last stretch. Glyph shapes come from the rendered font (SVG
  `<text>` + normalized `pathLength`) rather than a built-in glyph
  set, so Latin, CJK and digits all draw — verified with a bilingual
  still.

### Core (v0.1)
`pop` spring entrance · `fadeUp` · `pulse` (scale value) · `countUp` ·
`stagger` · `fly` arc flight · `trail` ghosts · `squash` · `dot` ·
`ripple` · `burst` · `badge` · `targetSlot` · `scene` · `transition`

### Round 1 (v0.2)
`wiggle` decaying shake · `typewriter` self-typing text

### Advanced (v0.3) — motion vocabulary from the code-video-director
skill, layer stack from remotion-motion-graphics
`beat` anticipation entrance · `drop` gravity fall · `travel` fast-start
glide · `shake` screen shake · `punch` camera punch-in · `flash` impact
flash · `camera` virtual camera (keyframed focus + zoom) · `meshBg`
animated gradient mesh · `drawOn` + `poly` self-drawing strokes ·
`bars` animated bar chart · `scramble` text decode reveal · `kenBurns`
slow zoom/pan · `breathe` idle micro-motion · `fx` film grain + vignette ·
`hash` deterministic pseudo-random

Showcase: `src/compositions/fx-showcase.js` (dark premium reel using the
whole v0.3 stack).

### Numbers (v0.10)
- `counterRoll(frame, {from, to, size, stagger, spin})` — odometer digit
  roll: per-column strips roll forward to their target digits with a
  ones-first stagger, settling in a leftward cascade, perfectly aligned
  at rest. Supersedes nothing — `countUp` stays the plain readout.

### Entrances (v0.9)
- `flipIn(frame, {at, dur, axis, from, perspective})` — 3D flip entrance:
  rotates in from edge-on with a backOut overshoot settle; style string
  like fadeUp, perspective baked into the transform.

### Path flight (v0.8)
- `pathFly(frame, {pts, at, dur, fn})` — constant-speed flight along a
  polyline (arc-length parameterized), returns position + heading angle
  + done. Corners don't surge; easing shapes the distance profile.

### Transitions (v0.7)
- `whip(frame, {at, dur, dir, width, maxBlur})` — whip-pan: strip offset
  on a cubicInOut curve (fastest mid-pan, where the cut hides) plus a
  blur value peaking mid-pan. Pairs with `smear` for element-level streaks.

### Paper-cut pack, core (v0.6)
- `paperEl({x, y, w, h, color, shape, thick, rot})` — cut-paper shape
  (rect / circle / blob) with a hard offset thickness shadow.
- `pivot(frame, {from, to, steps})` — puppet-joint rotation (transform
  value), optionally step-quantized for stiffness.
- `stepped(frame, {steps})` — eased progress snapped to N levels;
  `onTwos(frame, {every})` — frame snap (shot-on-twos) for whole scenes.
  Pack remainder (morphPoly, parallax) still in the style-pack backlog.

### Motion blur (v0.5)
- `smear(frame, {from, to, arc, samples, span, opacity, fullAt})` — exposure
  ghosts sampled at earlier frames along a fly path; blur length follows
  velocity (∝ distance covered inside the span window), so fast moves smear
  and slow moves stay sharp. Knob 03 of @asteri_eth's six knobs. Verified:
  unit tests (speed scaling, ordering, determinism) + stills at peak
  velocity (long ghost chain) vs deceleration (ghosts collapse).
- Tuning-config convention adopted: compositions declare a `TUNE` block
  with their knobs as named numbers (first used in the site smear card).

### Sound (v0.4) — `src/sfx.js`
Deterministic SFX synthesizer: pure math in, 16-bit WAV out, zero audio
assets, seeded noise only (same score → identical file, hash-verified).
Ten synthesized sounds: `pop` `bloop` `ting` `whoosh` `thump` `inhale`
`glide` `shimmer` `swell` `chord`. Scores are JSON event lists written
against video frames (`src/compositions/<name>.sfx.json`); by house rule
each sound lands **one frame after** its visual. Recipes follow the
«Opus 5.5 Motion Lab» write-up (pentatonic event sounds, thumps on
landings, sparkle on reveals). First score: fx-showcase (19 events,
RMS-verified alignment, silent gaps are truly silent).

## Style pack backlog: paper-cut collage

Reference: a paper-cut collage brand film («Paper Cuts», ~60s) seen in an
earlier research read in the same round; its attribution to the @flxrnc
link Robin shared turned out to be wrong (that link is the Motion Lab
article below) — the style pack stays, provenance corrected.
The look is fully procedural and fits this pipeline:

- Every element reads as cut colored paper: flat fills, a consistent
  offset shadow (paper thickness), slightly irregular edges, small
  resting rotations; warm palette (orange/brown/cream + dark teal).
- Layered parallax: near paper layers travel faster than far ones.
- Paper-puppet motion: limbs/heads rotate around pivot points, small
  amplitude, deliberately a touch stiff — quantize to 2-frame steps.
- Shape morphs carry the transitions (sun → mountain → blob…).
- Oversized serif type lives inside the paper world (negative space).
- Photocopy grain over everything; cuts land on the music's beat;
  paper rustle/cut SFX under the track.

Primitives to build for it:
- `paperEl` / `pivot` / `stepped` (+ `onTwos`) — shipped in v0.6
- `morphPoly` — interpolate between two polygon point sets (same count)
- `parallax` — depth-layer offsets from one camera move (pairs with `camera`)

## Backlog (next rounds, roughly in order)

- Beat tools — BPM/beat detection for music-synced cuts (from code-video-director beats.py);
  pairs with the v0.4 SFX kit (scores are frame-based today; a BPM grid
  generator is the missing half for music-first pieces)
- (Future track, not committed) WebGL/three.js liquid-metal logo sting —
  the Motion Lab opener is raymarched SDF chrome with smooth-min blending;
  out of scope for this 2D stack, revisit only if a 3D need appears.

## Rules for new effects

Frame-pure (a function of `frame` only), deterministic (randomness only
via `hash`), no DOM state, no assets. Every effect ships with: a site
demo card, a docs row, a CHANGELOG entry, and a still-frame check.
