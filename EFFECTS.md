# EFFECTS — the living effects ledger

Every effect the library can do, and the queue of what gets built next.
Fed by ongoing research rounds (X / GitHub skill ecosystem); each round
ships as a versioned release with a CHANGELOG entry and a verified demo.

## Implemented

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
- `paperEl` — wrap a shape with paper edge + thickness shadow + tilt
- `pivot` — rotation around a joint point, optional stepped timing
- `stepped` — quantize any frame-driven value to N-frame steps (stop-motion)
- `morphPoly` — interpolate between two polygon point sets (same count)
- `parallax` — depth-layer offsets from one camera move (pairs with `camera`)

## Backlog (next rounds, roughly in order)

- `whip` — whip-pan transition between scenes (camera overshoot + blur streak)
- `pathFly` — flight along an arbitrary bezier/polyline path with heading
- `flipIn` — 3D flip entrance (perspective rotateX/rotateY)
- `counterRoll` — odometer-style digit roll for big numbers
- `drawText` — handwriting-style stroke text (SVG paths for common glyphs)
- `particleField` — ambient drifting particle layer (stars/dust/snow)
- `morphShape` — shape A→B morph (circle→star→heart…) for icons
- `glitch` — RGB-split glitch transition (short, tasteful)
- SFX synth kit — deterministic WAV one-shots (pop/whoosh/thump) + `--sfx` mixing.
  Recipes validated by @flxrnc's «Opus 5.5 Motion Lab» article (Web Audio,
  all synthesized): lay a BPM grid first (their pieces run 120 BPM), one
  event sound per visual event landing **1 frame after** the picture
  (squash inhale, stretch glide, droplet bloops, metal ting, stereo
  shimmer, liquid swell); no voice needed for short loops.
- Beat tools — BPM/beat detection for music-synced cuts (from code-video-director beats.py)
- (Future track, not committed) WebGL/three.js liquid-metal logo sting —
  the Motion Lab opener is raymarched SDF chrome with smooth-min blending;
  out of scope for this 2D stack, revisit only if a 3D need appears.

## Rules for new effects

Frame-pure (a function of `frame` only), deterministic (randomness only
via `hash`), no DOM state, no assets. Every effect ships with: a site
demo card, a docs row, a CHANGELOG entry, and a still-frame check.
