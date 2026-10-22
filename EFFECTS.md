# EFFECTS — the living effects ledger

Every effect the library can do, and the queue of what gets built next.
Fed by ongoing research rounds (X / GitHub skill ecosystem); each round
ships as a versioned release with a CHANGELOG entry and a verified demo.

## Implemented

### Shear (v0.52)
- `velocitySkew` — velocity-proportional shear. `trail` mode skews
  by the instantaneous velocity of an eased move (top lags the
  motion); `impact` mode is a decaying ±skew oscillation for hits.
  `anchor:'start'` recenters the sheared box (`-tan(skew)·h/2`).
  (Round-2 sweep: Niek Pronk skew trick, CapCut "Skew Shake".)

### Feel (v0.51)
- `anticipate` — the wind-up: progress dips below 0, then
  releases through 1 with an overshoot. Disney principle 2;
  the cheapest "alive" upgrade for any 0→1 journey.
- `followThrough` — trailing progress rows: each part starts
  `lag` frames later and overshoots more. Disney principle 5.
  (Quality directive, 2026-10-21: polish against the X
  references Robin feeds — feel first, count second.)

### Interface (v0.24)
- `cursor` — animated mouse cursor for UI demos: keyframed path
  travel (cubicInOut per segment, holds at both ends), a press dip
  on each click frame, and an expanding ring from the click point.

### Celebration (v0.23)
- `confetti` — confetti cannon: seeded paper bits burst from a
  point in an upward cone, tumble (rotation + scaleX paper-flip),
  and fall under gravity; fades over the last 18 frames of `life`.

### Reveal (v0.22)
- `wipeReveal` — directional wipe reveal of arbitrary HTML via an
  animated clip-path inset (right / left / up / down). The content
  never moves, only the mask sweeps — the complement to whip's
  whole-scene pan.

### Text (v0.21)
- `splitText` — split-text entrance: every character animates in on
  its own stagger, three modes (rise / pop with easeOutBack
  overshoot / fade). Spans are inline-block, so line layout never
  shifts while letters land.

### Isometric kit (v0.26–0.46)
- `isoBolt` (v0.38) — hex-head prism (all-sides-then-top trick)
  on a short cylinder shaft.
- `isoTerrain` (v0.46) — column-grid data landscape, gaussian
  hill around a fixed or orbiting focus.
- `isoGear` (v0.36) — gear: cylinder body, teeth on the rim
  ellipse, hub hole and face bolts; `rot` animates the turn.
- `isoCone` (v0.37) — cone: true tangent silhouettes from the
  apex to the base ellipse, two-tone side shading.
- `isoWedge` (v0.27) — triangular prism: high edge at x, slope
  descending along +x, two visible faces (slope + side triangle).
- `isoPipe` (v0.28) — pipe runs through world points: constant
  screen-width tube, joint dots at bends, shifted highlight for
  the lit edge. Diagram-style, mixes with the solids.
- `isoBox` / `isoCylinder` / `isoSort` — native isometric solids
  on one fixed camera (30°, no perspective): filled faces shaded
  by orientation from a single base color (top lightest), crisp
  edges, painter's order by (x + y) then z via isoSort. Geometry
  is frame-pure, so compositions animate x / y / z to assemble
  machines part by part — the anatomy direction, native.

### Platform (v0.25)
- Page recorder (`src/record.js`): turns live web pages —
  interactive anatomy figures, WebGL demos — into MP4s. Two
  strategies: `cast` (CDP screencast, real time, works on any
  page; output spans the page's actual motion) and `virtual`
  (virtual-time stepping, deterministic; watchdog aborts pages
  whose main thread starves the queue and points at cast).
  Directing is data: a `--mouse "x1,y1>x2,y2"` glide plus
  `--keys "3.8:i"` timed presses. Bundled into the skill.

### Platform (v0.20)
- Installable skill bundle (`skill/`): self-contained agent skill —
  SKILL.md playbook, vendored runtime synced from the build (drift
  is a CI failure), Chrome-detecting launchers, an environment
  doctor, an annotated example with its SFX score, and an API
  catalog generated from index.d.ts. Verified by a clean-room
  install simulation (fresh folder -> npm install -> doctor ->
  still -> scored 90-frame MP4). Ships as a release zip; the npm
  package remains the library channel.

### Platform (v0.11)
TypeScript refactor — all sources are strict-mode `.ts`, compiled by
`tsc` to the same committed JavaScript (no behavior change; CI
build-freshness gate). No new effects this round.

### Paper-cut pack, depth (v0.19)
- `parallax` — depth-layer offsets from one camera move: consumes
  the same keyframes as `camera()` (shared `camPose` interpolation,
  camera output pinned by tests through the refactor) and returns
  the move felt at `depth` — focus pulled toward stage center,
  zoom raised to depth power. Depth 1 = camera() exactly, depth 0
  = the unmoving sky. Paper pack complete.

### Paper-cut pack, morphs (v0.18)
- `morphPoly` — interpolate between two raw polygon point sets
  (index-paired; uneven counts subdivided at longest-edge midpoints
  so caller vertices survive). The unboxed engine behind
  morphShape, for paper-pack shape-morph transitions.

### Music (v0.17)
- `beatGrid` / `beatFrames` — BPM grid tools: `beatGrid` reports a
  frame's beat index, phase, decay pulse and bar position;
  `beatFrames` generates the grid as frame numbers for SFX scores
  and cut points. (Named beatGrid because `beat` is the older
  anticipation-entrance primitive.)

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
  Pack remainder: none — morphPoly shipped in v0.18, parallax in
  v0.19. Paper-cut pack complete.

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
`glide` `shimmer` `swell` `chord`. (v0.19.1 fixed a v0.4-era bug:
`ting` read the event's frame number as its base frequency; the base
is a fixed 1568 Hz like every other pitched sound in the kit, with a
regression test pinning placement-independence and pitch.) Scores are JSON event lists written
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
- ~~`parallax` — depth-layer offsets from one camera move~~ shipped in v0.19; the style-pack backlog is clear.

## Backlog (next rounds, roughly in order)

Researched 2026-10-21 round 2 (sweep report:
research/x-motion-sweep-2026-10-21-round2.md; the whole 2026-10-21
round-1 backlog is shipped) — take from the top, one per round:

- ~~`velocitySkew`~~ — shipped in v0.52.0: velocity-proportional
  shear with `trail` (skew follows the instantaneous velocity of an
  eased move) and `impact` (decaying ±skew oscillation) modes, plus
  the anchor recenter trick (`anchor:'start'`).
- ~~`noiseGlow`~~ — shipped in v0.53.0: boiling-light glow overlay —
  seeded value noise breathes the core's radius/brightness, six
  satellite blobs pulse on their own noise channels, sparkles burst
  on seeded cycles; `blend` picks the composite ('screen' default,
  'color-dodge' for the Procreate-Dreams blow-out). (Manon Louart
  Procreate Dreams glow tutorial.) The round-2 sweep backlog is now
  fully shipped.

Researched 2026-10-21 (gap analysis against the shipped 55, after
splitText / wipeReveal / confetti / cursor landed) — take from the
top, one per round:

- ~~`orbit`~~ — shipped in v0.29 (as a pose object {x, y, angle,
  scale}, matching travel/pathFly conventions).
- ~~`swing`~~ — shipped in v0.30.
- ~~`marquee`~~ — shipped in v0.31.
- ~~`marchingAnts`~~ — shipped in v0.32 (rect form).
- ~~`highlightBox`~~ — shipped in v0.33 (standalone primitive,
  not a drawOn preset — the wobble + pad ergonomics earned it).
- ~~`waveLine`~~ — shipped in v0.34.
- ~~`spotlight`~~ — shipped in v0.35. The researched-2026-10-21
  general backlog (orbit → spotlight) is now fully shipped.
- ~~`isoGear`~~ — shipped in v0.36 (teeth on the projected rim
  ellipse riding the mid-plane so tips clear both rim arcs,
  tangent-rotated; hub hole + face bolts; `rot` turns it).
- ~~`isoCone`~~ — shipped in v0.37.
- ~~`isoBolt`~~ — shipped in v0.38. The iso kit is complete for
  now: box, cylinder, wedge, pipe, gear, cone, bolt, sort.

From the X/social motion sweep of 2026-10-21 (full specs and
sources in research/x-motion-sweep-2026-10-21.md; engagement is
what the posts showed at sweep time):

- ~~`maskReveal`~~ — shipped in v0.39 (flat-colour cover + SVG
  mask blob hole; the original note's path-shaped aperture is
  a possible later variant).
- ~~`matchCut`~~ — shipped in v0.40 (shared-path driver:
  quadratic out-leg to p = 0.8, derivative-matched in-leg).
- ~~`inertia`~~ — shipped in v0.41.
- ~~`pixelDissolve`~~ — shipped in v0.42 (cells in the outgoing
  colour flip at hash delays, swelling just before they flip).
- (original note) mosaic transition: grid cells flip A→B at
  hash delays while cell size swells mid-transition; the orderly
  counterpart to glitch. (@webflow pixelated transition demo.)
- ~~`charGrid`~~ — shipped in v0.43.
- ~~`assembleText`~~ — shipped in v0.44.
- ~~`textOnPath`~~ — shipped in v0.45 (smoothed-polyline input,
  arc-length placement; a segment-start bug in the sampler was
  caught on the verification still — letters bunched in the
  valley — and fixed).
- (original note) a whole string typeset along an SVG path by arc
  length, tangent-rotated, with a flowing offset: kinetic-type
  titles and circular badges. (@holke79 carousel.)
- ~~`isoTerrain`~~ — shipped in v0.46 (gaussian hill, fixed or
  orbiting focus).
- ~~`patternField`~~ — shipped in v0.47.
- ~~`slitScan`~~ — shipped in v0.48 (band copies overscanned by
  amp on both sides so shifts never open an edge gap). With
  this, the 2026-10-21 sweep backlog is fully shipped.
- (original note) smooth per-band time displacement: band b shifted
  by A·sin(phase + b·k), the Superman-titles streak warp; smooth
  where glitch is jagged. (@CcampFx's X thread on streaks and
  slit-scans — the sweep's one genuine X find.)
- ~~(Future track) WebGL liquid-metal logo sting~~ — committed
  by Robin 2026-10-21 ("实现液态金属这部分") and shipped in
  v0.49 as `liquidMetal`: raw WebGL1 raymarched SDF (no three.js
  dependency — one fullscreen-triangle shader, smooth-min union
  of JS-computed blob positions), players auto-paint the canvas
  after each render; 2-D chrome fallback when WebGL is missing.

## Rules for new effects

Frame-pure (a function of `frame` only), deterministic (randomness only
via `hash`), no DOM state, no assets. Every effect ships with: a site
demo card, a docs row, a CHANGELOG entry, and a still-frame check.
