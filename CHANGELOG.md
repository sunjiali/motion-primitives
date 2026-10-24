# Changelog

All notable changes to motion-primitives are documented here.

## [0.61.0] — 2026-10-24

### Changed — site demo gallery pass (backlog item, no library API change)

- **Editorial line over the demo wall.** The Live demos section
  now opens with a one-line editorial header ("Fifty-nine
  motions, one idea: every move in this library is a single
  named call.") plus a meta line stating the true card count
  and the new hover behavior — the editorial-hero-line half of
  the 2026-10-22 eve backlog item (motionin.design /
  landing.gallery inspiration).
- **Tighter grid.** The demo wall goes from 2 columns at an
  18 px gap to 3 columns at a 14 px gap on wide screens
  (2 columns below 1100 px, 1 below 900 px as before), and the
  card meta padding tightens from 14/18/16 px to 12/14/14 px —
  59 cards now scan as a wall instead of a long scroll.
- **Hover-feel: replay on hover.** Hovering any demo card
  restarts that card's animation from frame 0 (the card's
  runner re-bases on the current virtual frame); the lift
  deepens to −4 px and the accent dot in the card title
  scales up 1.7× while hovered. Reduced-motion visitors keep
  the static mid-cycle frame — no hover listeners attach.
- **Verified, not asserted.** Headless Chrome on the local
  site: 59 cards, grid computed as 3 × 368 px columns at a
  14 px gap, 0 console errors; hover-replay proven on the pop
  card's dot trajectory (settled 124 px → 0.1 px → 7.3 px →
  95.6 px across the hover, i.e. a fresh entrance, not a
  continuation); a full-wall screenshot shows every card
  animating with the new header in place. `npm run check`
  63/63 green; `npm run build` leaves no compiled-output drift
  (no `.ts` changed this round).
- **No library API change, so no demo card / Docs row /
  `index.d.ts` change** — the site files themselves are the
  deliverable, and the 2026-10-22 eve backlog's site item is
  now closed. Remaining backlog: `springSheet` and `sliceWave`
  (both low priority).
- **Prompt Gallery: no new entry this round.** This is a
  site-only release with no new film; the Gallery obligation is
  explicitly waived here rather than padded with a filler
  entry (same waiver as the 0.60.1 fix-only release).
- **X sweep 2026-10-24** (rotated social.search queries:
  spring-physics UI animation / isometric animation / kinetic
  text animation / easing curves): 0 new backlog candidates —
  spring explainers and physics demos dedupe against
  pop/anticipate/swing, the elastic-toggle reel's
  stretch-on-press overlaps pop/squash, and the LottieFiles
  manual-easing-vs-spring A/B restates the pop-vs-ease
  distinction the library already ships. Logged in
  research/x-motion-sweep-log.md; coverage caveat unchanged
  (social.search does not index X; nothing tonight came from
  a genuine X post).

## [0.60.1] — 2026-10-23

### Fixed — npm tarball no longer swallows client-line compositions

- **Packaging leak closed (2026-10-23 professional audit, gap 2).**
  `package.json`'s `files` whitelist contained the whole
  `src/compositions/` directory, and two untracked Doubao
  commercial-sample compositions (`shangdan-doubao.js`,
  `shangdan-doubao-v2-design.js`) were sitting in it: `npm pack
  --dry-run` listed 32 files including both (≈60 kB of client
  material). The moment npm publishing is enabled they would have
  shipped publicly. Three-layer fix:
  - the two files were moved out of the repo tree to
    `~/workspace/shangdan-sample/compositions/`, byte-identical
    (sha256 verified before/after), with an archive note there;
  - `files` gained the negation `"!src/compositions/shangdan-*"`
    so a client file dropped back into the directory still cannot
    enter the tarball (probe-verified: a scratch `shangdan-*` file
    placed in the directory is excluded from the pack list);
  - `.gitignore` now ignores `src/compositions/shangdan-*`, so the
    files cannot be committed to the public repo either.
- **No shipped content changed.** Pack list diffed item-by-item:
  32 → 30 files, removed exactly the two `shangdan-*` files, added
  none; all 13 tracked demo compositions (incl. `showcase`, which
  the installed-CLI smoke render uses) remain in the tarball.
  `npm run check` 63/63 green; `package:smoke` passed (tarball
  installs, API + SFX ok, installed CLI rendered a still,
  20148 bytes).
- **Prompt Gallery: no new entry this round.** This is a fix-only
  release with no new film; the Gallery obligation is explicitly
  waived here rather than padded with a filler entry.

## [0.60.0] — 2026-10-23

### Added — `chapter-formula` composition (the house formula, codified)

- **Composition `chapter-formula`** (285 f, 9.5 s, silent, house
  style): the chapter formula from the 2026-10-22 Swiss-style sweep
  backlog, codified as a film that labels itself while it runs —
  hook 0–2 s (one claim, the round-faced ball popping in inside a
  ripple), three chapters of exactly 1.5 s each holding one hero +
  one action + one label (01: the ball's arc flight with same-colour
  trail ghosts; 02: four bars rising once, then holding; 03: a
  countUp number whose label is the message), a recap holding all
  three chapters side by side in cards, and an ink outro card with
  the formula and its source line (@guanmo_ai's Swiss-style chapter
  study). No new library API this round — the formula is the
  deliverable, so it ships with a Prompt Gallery entry and no demo
  card / Docs row.
- Verified on stills at frames 30 (hook) / 90 (flight) / 135 (bars
  mid-rise) / 172 (number mid-count) / 215 (recap) / 262 (outro);
  the first chapter-1 still caught the trail ghosts rendered in
  blue against the yellow hero — fixed to same-colour yellow and
  re-verified. Frames 30 / 172 / 262 extracted from the rendered
  MP4 match the stills; ffprobe counted 285 frames =
  `durationInFrames`. With this, the 2026-10-22 Swiss sweep backlog
  is fully shipped; the remaining backlog is site page optimization,
  `springSheet`, and `sliceWave` (all low priority).

## [0.59.0] — 2026-10-23

### Added — `mosaic` primitive + `mosaic-demo` composition

- **`mosaic(frame, { htmlA, htmlB, at?, dur?, w?, h?, cols?, rows?, swell?, gap?, seed? })`** —
  the orderly counterpart to `glitch`: a pixel-grid scene transition
  where every tile shows a cropped window of scene A, then at its
  hash-staggered flip moment swaps to the same window of scene B,
  swelling briefly (default 1.28×, decaying over ±6 frames) around
  the flip so the cut reads as a tile "turn" rather than a wipe.
  Draw the incoming scene (B) first, then this layer: before `at`
  the grid returns full-bleed `htmlA` (hiding B beneath), after
  `at + dur` it returns `''`. Frame-pure, deterministic, zero
  assets — clears the backlog item from the 2026-10-21 X sweep
  (@webflow's pixelated transition demo).
- **Composition `mosaic-demo`** (150 f, silent, house style): ink
  "MOSAIC" title field flips tile-by-tile into a blue→teal "SCENE
  TWO" field (16×9 tiles, gap 3, seed 7, flip window frames
  50–105). Verified on stills at frames 20 (full A) / 70 (mixed
  grid mid-flip) / 110 (full B), plus 4 frames extracted from the
  rendered MP4 itself (55 / 70 / 85 / 100) — the double-gate: swell
  only at tile flips, no leftover A tiles past frame 105;
  ffprobe counted 150 frames = `durationInFrames`.
- Site: new `mosaic` demo card (59 cards) and Docs row; Prompt
  Gallery gains the `mosaic-demo` entry (+1, per the gallery duty).
- X sweep 2026-10-23 (social + web, rotated queries): no new
  primitive candidates beyond the backlog top item; 1 technique
  filed to the backlog as low priority — `sliceWave` (horizontal-
  slice wave displacement, @sebv_tv's precomp slice-splitting
  technique for frame-by-frame wave feel).

## [0.58.0] — 2026-10-23

### Added — `rings` primitive + `rings-demo` composition

- **`rings(frame, { x?, y?, count?, r0?, gap?, color?, width?, at?, dur?, mode?, speed?, dash?, opacity?, seed? })`** —
  concentric thin rings around a focal point, the quiet decoration
  layer across motionin.design's cards. One geometry (`count` rings
  spaced `gap` apart from base radius `r0`), three modes: `pulse`
  (default — an expanding train, each ring riding phase
  `(frame − at)/dur + i/count`, growing from `r0` to `r0 + count·gap`
  while its opacity fades, looping forever); `breathe` (a settled set
  swelling on a slow sine, phase-lagged per ring so the swell travels
  outward); `spin` (dashed arcs rotating in place, neighbouring rings
  counter-rotating at slightly different rates). Thin lines, one muted
  colour, alpha doing the depth work — the shell stays plain and the
  rings carry the calm. A seeded phase jitter (`hash(seed·31 + i·7)`)
  keeps stacked calls from marching in lockstep; frame-pure, returns
  `''` before `at`.
- **Composition `rings-demo`** (180 f, silent, house style): one
  round-faced ball in three hard-cut scenes — Pulse. on cream,
  Breathe. on blue, Spin. on ink — each with its title, Chinese
  subtitle and the exact code pill. Verified on stills at frames 30
  (pulse train mid-expansion, opacity falling outward) and 150
  (spin arcs counter-rotated, gaps readable).
- Site: new `rings` demo card (58 cards) and Docs row; Prompt
  Gallery gains the `rings-demo` entry (+1, per the gallery duty).
- Source study: the 2026-10-23 frame-by-frame teardown of
  motionin.design's walkthrough (research_notes/video-teardowns) —
  concentric rings are its signature framing device; portalWipe
  shipped the transition in v0.57, this round ships the ambient half.

## [0.57.0] — 2026-10-22

### Added — `portalWipe` primitive + `portal-demo` composition

- **`portalWipe(frame, { html, at?, dur?, x?, y?, x2?, y2?, w?, h?, color?, echo?, hold? })`** —
  a circular portal transition (the motionin.design signature move).
  A flat disc blooms from `(x, y)` with an easeOutCubic pop, swallows
  the outgoing scene, holds for `hold` frames, then contracts
  (cubicInOut) toward `(x2, y2)`, revealing the incoming scene drawn
  underneath. Pass the outgoing scene as `html`: before `at` it
  renders unclipped (hiding the incoming scene), during the bloom it
  is clipped to outside the disc via an SVG mask, and once the disc
  reaches full coverage the outgoing scene is swallowed — so the
  composition's layering is correct by construction. `echo` trails
  thin rings behind the rim; the portal color must contrast with both
  scenes or one phase reads as nothing (caught on the verification
  still: a red disc over a red scene made the contraction invisible).
  Frame-pure, no `hash`.
- **Composition `portal-demo`** (180 f, silent): navy title scene →
  white portal blooming from the left with echo rings → red "SCENE
  TWO" revealed as the portal contracts right. Verified: stills at
  all four phases, 180/180 frames, headless-Chrome demo card.
- Site: new `portalWipe` demo card (57 cards) and Docs row; Prompt
  Gallery gains the `portal-demo` entry (+1, per the gallery duty).
- Source study: motionin.design's card transitions via @neropursue's
  2026-10-22 resource list (note:
  ~/workspace/research_notes/neropursue-motion-resources.md).

## [0.56.0] — 2026-10-22

### Added — `splitFlap` primitive + `flap-board` composition

- **`splitFlap(frame, { text, at?, charset?, flipEvery?, stagger? })`** —
  the airport split-flap board. Each character cycles through an
  *ordered* charset starting from blank, one step per `flipEvery`
  frames (default 2), and clacks into place left to right (`stagger`
  frames apart, default 3). Where `scramble` resolves out of *random*
  glyphs, splitFlap's intermediate glyphs are the ordered steps a
  mechanical board passes through — A before B before C. Characters
  outside the charset (lowercase, CJK, symbols) appear whole at their
  turn; before `at`, every position is blank. Frame-pure, no `hash`.
- **Composition `flap-board`** (360 f, silent): a departures board —
  four flights flap in row by row, then mid-film two statuses re-flap
  from blank to their new values (`BOARDING → LAST CALL`,
  `ON TIME → DEPARTED`), the way real Solari boards update.
- Site: new `splitFlap` demo card (56 cards) and Docs row; Prompt
  Gallery gains the `flap-board` entry (+1, per the gallery duty).
- Source study: React Bits' text-animation shelf (via @yanliudreamer's
  design-resources post) — Split Flap was the frame-pure gap in our
  text kit.

## [0.55.0] — 2026-10-22

### Added — Prompt Gallery (site)

A new site page, `prompts.html` (nav: **Prompts**), built on one idea:
every published video ships with the exact prompt that produced it.

- Each entry is a card: the rendered MP4 (`<video controls>`), a
  one-line brief, tags, the iteration-round count, the full prompt in
  a code block, and a one-click **Copy** button (clipboard + feedback).
- The prompts are *production instructions for an AI* — canvas,
  timing, scenes, palette, type, and which primitives to compose —
  meant to be pasted to a user's own AI together with the motion
  skill to rebuild the same video. The page says so up front; these
  are not text-to-video model prompts.
- Data-driven like the demos: entries live in `site/prompts-data.js`
  (`window.PROMPT_GALLERY`), videos in `site/videos/`. Vertical
  (9:16) entries get a tall-card layout.

### Added — first four entries

- **prompt-sting** (new composition `src/compositions/prompt-sting.js`)
  — an 8 s kinetic-type opener for the gallery itself, produced by
  actually iterating its prompt: v1 failed the still-frame review on
  three counts (default four-color burst confetti broke the Morry
  five-color discipline; the closing capsule was pushed off-center by
  its own entrance transform; a mistyped typewriter speed option left
  the typed line half-finished at the cut). All three fixes were
  written into the prompt itself for v2 — single-color burst, a
  full-width centering wrapper, `cpf = 1` — and v2 is the published
  prompt. 2 rounds, notes on the card.
- **liquid-showcase** — the v0.50 WebGL showcase, rendered to MP4 for
  the gallery; prompt transcribed scene-by-scene from the shipped
  composition and labeled a reproduction prompt （复现 prompt).
- **swiss-relay** — the v0.54 Swiss study, same treatment.
- **math-make-ten-kids** — the math series' 40 s vertical kids-skin
  explainer (9 + 4 make-ten), rendered from the mini-remotion
  composition; silent cut (the voiced cut ships on the math channels).

### Process

The daily motion iteration now also carries a Prompt Gallery duty:
each round adds one prompt + video entry (or revises an existing
entry and updates its iteration notes), published with that round's
release. A prompt is only published in the version that actually
rendered the shipped video.

## [0.54.0] — 2026-10-22

### Added — `relay`

Keyframed geometry relay, frame-pure and deterministic:

- One hero element persists across scene cuts: give it poses
  `{ at, x, y, w, h, r?, opacity? }` and every field is interpolated
  between keys with a single easing (`fn`, default `cubicInOut`) —
  the element slides, stretches and morphs from pose to pose
  instead of vanishing at the cut and being replaced.
- Before the first key and after the last, the pose holds; keys
  need not be sorted. Returns `{ x, y, w, h, r, opacity, seg, p,
  done }` — feed the box straight into a div's geometry and `r`
  into its border-radius.
- The "red relay" (红色接力) from @guanmo_ai's Swiss Style film
  (「每天一个设计风格」02, 2026-10-22 sweep): in his cut, each
  scene's single red hero morphs directly into the next scene's.

### Added — composition `swiss-relay`

A Swiss International Style study built on `relay`: paper
#F5F4F0, black #111111, grey #7A7A78, one accent (Swiss red
#E30613), a 12×6 grid with hairlines shown, flush-left type,
square corners, hierarchy by size and weight only. The red hero
relays through four scenes — square → wide bar → big square →
tall column → home. Cuts are beat-locked via a TUNE block
(BPM 120 · fps 30 · 15 frames per beat · scene boundaries at
beats 0 / 60 / 120 / 180 / 240). Silent, 16:9, 240 frames.

Ships with a live demo card (55 total) and behaviour tests
(59 total).

## [0.53.0] — 2026-10-22

### Added — `noiseGlow`

Boiling-light glow overlay, frame-pure and deterministic:

- The glow core never sits still: seeded value noise (hash knots,
  smoothstepped) drives its radius (0.90–1.12× `r`) and brightness
  frame by frame, like a flame breathing.
- Six satellite blobs orbit the core at seeded angles, each pulsing
  on its own noise channel — the luminance "mask" boils instead of
  fading uniformly.
- Sparkles (4-point stars) ignite on seeded cycles around the core:
  fast pop-in, exponential decay — bursts where the light is
  hottest. `sparkles: 0` turns them off.
- The layer composites via `mix-blend-mode`: `screen` by default,
  `color-dodge` for the full blow-out look.
- Knobs: `x / y / r / color / intensity / boil / sparkles / blend /
  seed`. Returns an overlay string; draw it after the light source.

Researched from the 2026-10-21 round-2 sweep (Manon Louart's
Procreate Dreams glow workflow). Ships with a live demo card
(54 total) and behaviour tests (58 total). This clears the round-2
sweep backlog.

## [0.52.0] — 2026-10-21

### Added — `velocitySkew`

Velocity-driven shear, frame-pure and deterministic:

- `trail` mode: the element's skew follows the instantaneous
  velocity of an eased `from`→`to` move — the shape leans into
  its slide, top lagging behind the motion direction, clamped to
  `maxSkew`. Returns the eased position plus a ready-to-paste CSS
  transform (`translate + skewX/skewY`).
- `impact` mode: a decaying ±skew oscillation for hits and
  transition punches (the "skew shake" edit style).
- `anchor: 'start'` shears about the leading edge and recenters
  the box with `-tan(skew)·h/2` so the visual center stays put
  (the AE skew-animator trick); `anchor: 'center'` (default) is
  self-centering.

Researched from the 2026-10-21 round-2 sweep: Niek Pronk's
skew-animator centering trick, the CapCut "Skew Shake" edit style,
and the classic ±15° decaying skew-shake keyframes. Ships with a
live demo card (53 total) and endpoint-exact tests (57 total).

## [0.51.0] — 2026-10-21

### Added — the feel pack

Two of the classic animation principles the library was
missing, as frame-pure progress drivers:

- `anticipate(frame, o)` — the wind-up (principle 2): the
  value dips below 0 during `wind` frames (the crouch, the
  pull-back), then releases through 1 with an easeOutBack
  overshoot and lands exactly on 1. Feed it into any 0→1
  journey and the journey gathers itself before it goes.
- `followThrough(frame, o)` — follow-through and overlapping
  action (principle 5): a row of `count` progress values,
  each starting `lag` frames after the previous and
  overshooting a little more (`boost`), the way a tail or a
  scarf settles after its leader. Every value ends exactly 1.

Both ship with live demo cards (52 total) and endpoint-exact
tests (56 total). An A/B render — plain ease vs anticipate +
followThrough on identical targets — accompanies the release
notes discussion: same targets, different feel.

## [0.50.1] — 2026-10-21

### Fixed

- Site: the Docs section never appeared. Its reveal-on-scroll
  observer used a 10%-of-element threshold, but the docs grid
  is ~9,300 px tall — no phone or laptop viewport can ever
  show 10% of it at once, so it stayed at opacity 0 forever
  (the content was always in the page). The observer now
  reveals on first contact (threshold 0 + root margin).

## [0.50.0] — 2026-10-21

### Added

- `liquid-showcase` composition — four creative cases built on
  one primitive: a logo sting (chrome cluster forms, wordmark
  assembles beneath it), a chrome / gold / oil trio, a
  living-metal loading mark over a progress bar, and a hero
  headline card with a gold orb. Listed in the README examples.

### Changed

- `liquidMetal` polish: the cluster now slowly turns in depth
  (`spin`, default 0.25, 0 holds it still), satellites cap
  raised to 7, and a fourth palette — `oil`, an iridescent
  oil-slick finish computed from the reflection direction in
  the shader.

## [0.49.0] — 2026-10-21

### Added

- `liquidMetal(frame, o)` + `liquidMetalDraw(root)` — the
  library's first WebGL primitive, committed by Robin to close
  the EFFECTS future track: a raymarched SDF liquid-chrome
  cluster (one fullscreen-triangle fragment shader; smooth-min
  union of a core sphere and hash-orbiting satellites that
  merge and split; banded procedural environment reflections,
  fresnel rim, key specular). Raw WebGL1 — no three.js
  dependency. The primitive returns a canvas tag carrying its
  parameters; the bundled player and the site paint it after
  every render via liquidMetalDraw (one shared GL canvas,
  shader compiled once; blob positions are computed in JS from
  the frame, so output stays frame-pure). Palettes: chrome,
  gold, copper. Without WebGL it degrades to soft 2-D chrome
  blobs instead of a blank hole. Software-GL cost ≈ 0.7 s/frame
  at 880×495 — keep the canvas modest and scale with `size`.
  Skill bundle synced (API catalog now 82 functions); site
  demo card #50.

## [0.48.0] — 2026-10-21

### Added

- `slitScan(frame, o)` — a smooth streak warp over wrapped
  HTML: the content is re-rendered in horizontal bands, each
  clipped and shifted by a travelling sine field — the
  Superman-titles smear, continuous where glitch is jagged.
  Band copies are overscanned past both edges so a shift never
  opens a gap (caught on the verification still). Windowed
  with a sine envelope when `dur` is set, sustained otherwise.
  From the 2026-10-21 X sweep (@CcampFx's streak thread).
  Skill bundle synced (API catalog now 80 functions); site
  demo card #49. This completes the sweep backlog.

## [0.47.0] — 2026-10-21

### Added

- `patternField(frame, o)` — a seamless animated pattern
  backdrop: one motif (dot, ring, diamond, cross) tiled across
  the stage, every tile animated with a phase that travels
  across the grid — spin, pulse, or a rocking wave — so the
  whole wall breathes as one surface. From the 2026-10-21 X
  sweep (@studio.baseline's seamless-pattern tutorial). Skill
  bundle synced (API catalog now 79 functions); site demo
  card #48.

## [0.46.0] — 2026-10-21

### Added

- `isoTerrain(frame, o)` — an isometric data landscape: a grid
  of columns whose heights form a gaussian hill around a focus
  point, fixed (fx, fy) or orbiting the centre with `auto`;
  taller columns shade lighter toward the top. One call returns
  the whole painter-sorted field. From the 2026-10-21 X sweep
  (Hairline-style iso data landscapes). Skill bundle synced
  (API catalog now 78 functions); site demo card #47.

## [0.45.0] — 2026-10-21

### Added

- `textOnPath(frame, o)` — a string typeset along a smoothed
  polyline by arc length: every glyph sits on the curve,
  rotated to its tangent, and the string flows along the path
  at `speed` (with optional `loop` wrap). Kinetic type for
  ribbons and labels. From the 2026-10-21 X sweep (@holke79).
  The verification still caught a sampler bug (the segment
  start drifted per step, bunching letters in the valley) —
  fixed and re-verified before release. Skill bundle synced
  (API catalog now 77 functions); site demo card #46.

## [0.44.0] — 2026-10-21

### Added

- `assembleText(frame, o)` — glyphs fly in from a hash scatter
  to their typeset slots, staggered letter by letter, untwisting
  as they land; mode 'out' disperses the sentence again.
  splitText's travelling sibling, from the 2026-10-21 X sweep
  (@antonin.work's flying letters). Also in this release:
  charGrid's API-doc group moves to Text & numbers. Skill bundle
  synced (API catalog now 76 functions); site demo card #45.

## [0.43.0] — 2026-10-21

### Added

- `charGrid(frame, o)` — a living wall of glyphs: every cell
  flips to a new character at hash-staggered intervals, with
  per-flip brightness and the occasional accent cell. Data-wall
  and terminal ambience, frame-pure. From the 2026-10-21 X
  sweep (@antonin.work's digit grid). Skill bundle synced (API
  catalog now 75 functions); site demo card #44.

## [0.42.0] — 2026-10-21

### Added

- `pixelDissolve(frame, o)` — a mosaic scene transition: a grid
  of flat cells in the outgoing scene's colour flips away one
  by one at hash-staggered frames across the transition, each
  cell swelling slightly just before it flips. Full grid before
  `at`, empty string after. From the 2026-10-21 X sweep
  (@webflow's pixel transition). Skill bundle synced (API
  catalog now 74 functions); site demo card #43.

## [0.41.0] — 2026-10-21

### Added

- `inertia(frame, o)` — a thrown object's glide in closed form:
  position x0 + v·(1 − e^(−k·t))/k with the decaying velocity
  alongside. The endpoint is physics, not a keyframe — total
  travel is exactly v0 / k, predictable to the pixel. From the
  2026-10-21 X sweep (@webflow's GSAP Inertia notes). Skill
  bundle synced (API catalog now 73 functions); site demo
  card #42. Note: the v0.40 push's CI/Deploy runs never fired
  (GitHub-side trigger miss; Actions itself verified healthy) —
  the site was deployed by manual dispatch, and this release's
  CI run covers the combined tree.

## [0.40.0] — 2026-10-21

### Added

- `matchCut(frame, o)` — the shared-travel driver for a matched
  cut: the outgoing element accelerates along a shared path
  (quadratic, reaching p = 0.8 at the cut) and the incoming
  element continues from that exact pose at that exact velocity,
  decelerating through the remaining 0.2 to rest. Pose and
  velocity are continuous across the cut, so two different
  objects read as one motion. Returns { phase, p, v }. The
  80% / 1:2 recipe is @ginyboi's #1 transition, from the
  2026-10-21 X sweep. Skill bundle synced (API catalog now 72
  functions); site demo card #41.

## [0.39.0] — 2026-10-21

### Added

- `maskReveal(frame, o)` — a scene-change cover in the outgoing
  scene's colour with an organic blob hole growing through it
  (SVG mask, hash-wobbled rim, seedable), revealing the next
  scene underneath. Whole cover before `at`, nothing left after
  at + dur. Built for the one-flat-colour-per-scene house style.
  From the 2026-10-21 X sweep (@ginyboi's A-to-B masking).
  Skill bundle synced (API catalog now 71 functions); site
  demo card #40.

## [0.38.0] — 2026-10-21

### Added

- `isoBolt(o)` — an isometric bolt: a hex-head prism (a regular
  hexagon projected vertex by vertex; all six side quads drawn
  first and the top face last, which covers the back sides —
  the standard prism trick; sides toned by screen half) on a
  short cylinder shaft. Assembly-scene hardware, pairs with
  isoGear. Skill bundle synced (API catalog now 70 functions);
  the site iso machine gains a bolt on its housing. This
  completes the iso kit's planned parts list.

## [0.37.0] — 2026-10-21

### Added

- `isoCone(o)` — an isometric cone: the silhouette lines are
  the true tangents from the apex to the projected base ellipse
  (chord-of-contact geometry), the front arc closes the base,
  and the surface shades in two halves — lighter left, darker
  right. Funnels, nozzles, spikes. Skill bundle synced (API
  catalog now 69 functions); the site iso machine gains a cone.
  First still caught a flipped arc sweep (kite, not cone) —
  fixed to the cylinder's front-arc convention and re-verified.

## [0.36.0] — 2026-10-21

### Added

- `isoGear(o)` — an isometric gear: an isoCylinder body with
  teeth arranged on the projected rim ellipse (each tooth
  tangent-rotated, riding the mid-plane so its tips clear both
  rim arcs), a dark hub hole, and three face bolts so rotation
  reads. `rot` (radians) turns the whole gear — animate it per
  frame and mesh two gears with opposite signs. Skill bundle
  synced (API catalog now 68 functions); the site iso machine
  gains a spinning brass gear.

## [0.35.0] — 2026-10-21

### Added

- `spotlight(frame, o)` — a dimmed-stage overlay with one lit
  hole (radial gradient, soft feathered edge). The hole is
  static at (x, y) or travels between keyframes with cubicInOut
  easing, holding at the ends — focus-the-eye for walkthroughs,
  pairs with cursor. Place it after the content it dims. Skill
  bundle synced (API catalog now 67 functions); site demo card
  #39.

## [0.34.0] — 2026-10-21

### Added

- `waveLine(frame, o)` — an animated sine wave line: the phase
  scrolls with the frame, `wl` sets the wavelength, and `taper`
  mixes in a sine window so the wave swells in the middle and
  settles at the ends. Voice/audio visuals, dividers, signal
  motifs. Skill bundle synced (API catalog now 66 functions);
  site demo card #38.

## [0.33.0] — 2026-10-21

### Added

- `highlightBox(frame, o)` — a hand-drawn-feeling box that
  sketches itself around a region over `dur` frames and stays:
  corners and side midpoints carry a small deterministic hash
  wobble so it reads as drawn, not stamped; `pad` inflates the
  box around the target. The tutorial "look here" move. Skill
  bundle synced (API catalog now 65 functions); site demo card
  #37.

## [0.32.0] — 2026-10-21

### Added

- `marchingAnts(frame, o)` — the editor selection outline: a
  dashed rect whose dashes crawl around the border as the frame
  advances (dashoffset wraps over the dash period). Options for
  size, corner radius, dash length, crawl speed and color — the
  tutorial "look at this region" language. Skill bundle synced
  (API catalog now 64 functions); site demo card #36.

## [0.31.0] — 2026-10-21

### Added

- `marquee(frame, o)` — a seamless infinite scroll strip: one
  unit of content (`content`, exactly `unit` px wide) repeated
  ceil(width / unit) + 1 times inside a clipped strip and
  translated by (frame · speed) mod unit, so the wrap point is
  invisible. `dir` 'left' (default) or 'right'. Tickers, logo
  walls, promo crawls. Skill bundle synced (API catalog now 63
  functions); site demo card #35.

## [0.30.0] — 2026-10-21

### Added

- `swing(frame, o)` — pendulum rotation as a rotate() transform
  string, in the pivot() convention: angle = maxDeg · sin(2π ·
  frame / period + phase), with an optional exponential `decay`
  so a disturbed hanging sign settles to rest. Hang the element
  from a transform-origin above it — signs, mobiles, tags. Skill
  bundle synced (API catalog now 62 functions); site demo card
  #34 (a slowly settling OPEN sign).

## [0.29.0] — 2026-10-21

### Added

- `orbit(frame, o)` — pose on a circular orbit around (cx, cy):
  returns {x, y, angle, scale} in the travel/pathFly convention.
  `squash` flattens the circle into the classic tilted ellipse;
  `depth` scales the traveller from 0.72 at the back of the
  ellipse to 1.0 at the front. Satellites, orbiting badges,
  loading rings. Skill bundle synced (API catalog now 61
  functions); site demo card #33 (a moon with depth scaling
  passes behind and in front of its planet).

## [0.28.0] — 2026-10-21

### Added

- `isoPipe(o)` — an isometric pipe run through world points
  (`path: [[x, y, z], ...]`): a stylized tube of constant screen
  width (2.2 · r · unit) with round joins, joint dots at the
  bends, and a shifted highlight stroke for the lit edge.
  Diagram-style piping that connects the solid parts — ports,
  tanks, housings. Degenerate paths (fewer than 2 points) draw
  nothing. Skill bundle synced (API catalog now 60 functions).
  Verified with tests (path/joint counts, tube width,
  degenerate path) and a composed render: a pipe rises from a
  column cap, bends across, and drops into a housing. The site
  iso demo gains the pipe as its final assembly step.

## [0.27.0] — 2026-10-21

### Added

- `isoWedge(o)` — an isometric wedge (triangular prism): high
  edge at `x`, slope descending along +x for `len`, depth `d`,
  height `h`. Two visible faces (the slope, lit; the +y side
  triangle, mid tone), shaded from one `color` like the rest of
  the iso kit — ramps, chocks, and loading slopes for machine
  scenes. Skill bundle synced (API catalog now 59 functions).
  Verified with tests (face count, slope/side tone order,
  projected span) and a composed render still alongside the
  v0.26 machine. The site iso demo now drops a ramp in as its
  sixth part.

## [0.26.0] — 2026-10-21

### Added

- **Isometric kit** — native isometric solids in the anatomy
  tradition, on one fixed camera (30°, no perspective):
  - `isoBox(o)` — a solid box (`w` × `d` × `h` world units) whose
    three visible faces are shaded from one `color` by
    orientation (top lightest), with per-face overrides and a
    crisp derived edge stroke.
  - `isoCylinder(o)` — a standing cylinder; its top is the true
    projected circle (axis-aligned ellipse, rx = r·unit·√(3/2),
    ry = r·unit·√(1/2)).
  - `isoSort(parts)` — painter's-order join: sorts part
    descriptors by (x + y), ties by z, concatenates their HTML.
  Geometry is a pure function of the options (`x`, `y`, `z`,
  `ox`, `oy`, `unit`), so a composition animates parts by varying
  coordinates per frame — machines assemble part by part, as the
  site demo does (six parts drop in on staggers). Skill bundle
  synced in lockstep (API catalog now 58 functions). Verified
  with unit tests (tone ordering, projected dimensions, ellipse
  radii, sort order) and mid/end render stills. Site demo
  card #32.

## [0.25.1] — 2026-10-21

### Fixed

- Recorder CLI crashed at load time on Node 18 — before even
  `--help` could run — because `puppeteer-core` 25 (Node ≥ 22.12)
  was required at module top. It is now lazy-loaded inside `main`,
  so help and argument validation work on any Node, and an actual
  recording attempt on an old Node fails with a clear message
  naming the version requirement. Caught by the Node 18 CI compat
  job within minutes of the 0.25.0 push; the library core and the
  renderer were unaffected.

## [0.25.0] — 2026-10-21

### Added

- **Page recorder** (`src/record.js`, `npm run record`, bundled in
  the skill): record a *live web page* — an interactive figure, a
  WebGL demo, a web app — into an MP4. You direct with data: a
  `--mouse "x1,y1>x2,y2"` glide and `--keys "3.8:i"` timed key
  presses; the page's own model drives the motion. Two capture
  strategies:
  - `--mode cast` (default): real-time CDP screencast, frames
    stitched on their compositor timestamps. Works on any page,
    including main-thread-heavy ones (verified against the
    541-solid Raptor 2 anatomy figure: hover takes it apart
    on camera). Output duration is the span over which the page
    actually changed — dead air compresses out.
  - `--mode virtual`: virtual-time stepping (one frame = 1/fps of
    browser clock), screenshot per frame — deterministic and
    reproducible (verified against the dial-indicator figure:
    exactly 90 frames, the live readout changes truthfully as the
    directed hover slides the carriage). A page whose main thread
    starves the task queue wedges this mode; a 20 s watchdog
    aborts with guidance to use `cast`.
  Same finish/draft encode grades as the renderer. Skill bundle
  synced in lockstep, with a `scripts/record.mjs` launcher and a
  SKILL.md section; the doctor now checks for the recorder too.

## [0.24.0] — 2026-10-21

### Added

- `cursor(frame, o)` — an animated mouse cursor for software demos
  and UI walkthroughs. It travels a keyframed `path`
  (`[{f, x, y}, ...]`, cubicInOut per segment, holds at both ends),
  dips to 0.8 scale on each frame listed in `clicks`, and emits an
  expanding ring from the click point. Tunables: `size`, `color`,
  `ring`, `showFrom` / `showTo` (visible by default from the first
  key's frame). The arrow is an inline SVG, hotspot at its origin —
  pair it with a fake UI built from plain divs and the demo stages
  itself. Skill bundle synced in lockstep (API catalog now 55
  functions). Verified with unit tests (key positions, midpoint,
  click dip, ring lifetime, visibility window) and glide/click/
  parked render stills against a mock app window. Site demo
  card #31.

## [0.23.0] — 2026-10-21

### Added

- `confetti(frame, o)` — a confetti cannon: `n` paper bits burst
  from (`x`, `y`) in an upward cone (`spread` degrees around
  vertical, `power` launch speed), tumble as they fly (rotation
  plus a scaleX paper-flip), and fall under `gravity`. Every bit's
  launch, size, color, and tumble derives from `hash()` mixes of
  its index and `seed` — same seed, same celebration. Bits fade
  over the last 18 frames of `life` (default 75). Tunables: `at`,
  `n`, `power`, `spread`, `gravity`, `size`, `colors`. Skill
  bundle synced in lockstep (API catalog now 54 functions).
  Verified with unit tests (bit count, lifetime window, mean-fall
  under gravity, fade value, determinism) and rise/fall render
  stills. Site demo card #30.

## [0.22.0] — 2026-10-21

### Added

- `wipeReveal(frame, o)` — directional wipe reveal of arbitrary
  HTML: the content is wrapped in a full-stage layer whose
  `clip-path` inset sweeps open in `dir` (`right` default, `left`,
  `up`, `down`) over `at`/`dur`/`fn`. Unlike `whip` (which pans
  whole scenes), the content itself never moves — text and diagrams
  land exactly where they will stay, which makes it the reveal for
  titles, panels, screenshots, and code blocks. Skill bundle
  synced in lockstep (API catalog now 53 functions). Verified with
  unit tests (per-direction insets, midpoint, passthrough) and
  mid/end render stills. Site demo card #29.

## [0.21.0] — 2026-10-21

### Added

- `splitText(frame, o)` — split-text entrance: every character of
  `text` animates in on its own `stagger` (default 3 frames), in
  three modes — `rise` (floats up while fading in), `pop` (scales
  in with an easeOutBack overshoot), `fade` (opacity only).
  Characters are inline-block spans inside a wrapper centered on
  (`x`, `y`), so the line's layout never shifts while letters land.
  Plus the usual `size`, `color`, `fontFamily`, `weight`, `at`,
  `dur`, `fn`. The skill bundle is synced to this version (API
  catalog now 52 functions). Verified with unit tests (stagger
  ordering, settled state, escaping) and mid/end render stills.
  Site demo card #28.

## [0.20.0] — 2026-10-21

### Added

- **Installable agent skill** (`skill/`, also a zip on the release):
  install the folder into an agent's skills directory and the agent
  can make motion videos end to end. Contents: `SKILL.md` (the
  playbook — workflow, hard rules, quickstart), a vendored runtime
  synced from the build (`runtime/` — library, renderer, player,
  SFX engine, types), launchers that auto-detect Chrome
  (`scripts/render.mjs`, `scripts/sfx.mjs`), an environment doctor
  (`scripts/doctor.mjs`), the annotated `hello-motion` example with
  its sound score, and references (an API catalog generated from
  `index.d.ts`, the teaching STYLE guide). One dependency
  (puppeteer-core), one `npm install`, no npm package or assets
  required. Skill and library versions move in lockstep.

### Changed

- New repo tooling: `scripts/sync-skill.mjs` (refresh the vendored
  runtime) and `scripts/gen-api-doc.mjs` (regenerate the catalog).
  `test/skill.test.js` pins the bundle: synced files byte-match
  their sources, the catalog covers every export, the example score
  parses — drift is now a CI failure, same discipline as the site
  mirror. Verified end to end by a clean-room simulation: fresh
  folder → `npm install` → doctor (5/5) → still → scored render
  (exactly 90 frames + AAC, 3.000 s).

## [0.19.1] — 2026-10-21

### Fixed

- SFX `ting` used the event's frame number as its base frequency
  (`base = e.f ?? 1568`, a v0.4-era bug): a ting cued at frame 198
  sounded at 198 Hz — a dull thud instead of a metallic ping. The
  base is now the fixed 1568 Hz (G6) the fallback always intended,
  consistent with every other pitched sound in the kit. A new
  regression test pins the sound as byte-identical regardless of
  the frame it is cued at, with its fundamental at 1568 Hz
  (measured: 4131× the power at 198 Hz in the re-rendered
  fx-showcase score). The site's fx-showcase video has been
  remuxed with the corrected audio — video stream bit-identical,
  audio re-rendered from the fixed synth.

## [0.19.0] — 2026-10-21

### Added

- `parallax(frame, keys, depth, stage)` — depth-layer offsets from
  one camera move. It consumes the same keyframes as `camera()` and
  returns that move felt at `depth`: the focus is pulled toward the
  stage center by depth and the zoom is raised to the depth power,
  so depth 1 reproduces `camera()` exactly (the world plane), depth
  0 never moves (the sky), and layered scenes live in between —
  near layers travel faster than far ones. Completes the paper-cut
  pack.

### Changed

- `camera()` now shares its keyframe interpolation with
  `parallax()` through an internal `camPose` helper, so layers can
  never drift from the camera move they belong to. Camera output is
  byte-identical to before — pinned by new tests recorded ahead of
  the refactor. Verified with unit tests (pins, depth 0 / 0.5 / 1
  exact strings) and two render stills a full pan apart (sun fixed,
  mountains at quarter travel, foreground at full travel). Site
  demo card #27.

## [0.18.0] — 2026-10-21

### Added

- `morphPoly(frame, o)` — morph between two raw polygon point sets
  (`from` / `to` as `[[x, y], ...]` in local coordinates, placed at
  `x` / `y`, optional `rot`): the unboxed engine behind morphShape,
  for paper-pack shape-morph transitions and any custom silhouette.
  Points pair index-by-index; when counts differ, the shorter
  polygon's longest edges are split at their midpoints until counts
  match, so every caller vertex survives subdivision. Pairing
  quality depends on listing both sets in the same rotational order
  from a similar start point — the render-still gate caught exactly
  that mistake in this release's first demo data (mid-morph
  collapse), fixed by re-ordering the points. Verified with unit
  tests (exact endpoints, subdivision, vertex survival) and
  mid/end stills. Site demo card #26 (pentagon ⇄ house).

## [0.17.0] — 2026-10-21

### Added

- Beat tools — the BPM half of music-synced work, pairing with the
  v0.4 SFX kit. `beatGrid(frame, { bpm, at, fps, perBar })` reports
  where a frame sits in the grid: `index` (which beat), `phase`
  (0..1 through the beat), `pulse` (a (1-phase)² decay for
  scale/opacity accents), `bar` and `inBar`. `beatFrames({ bpm, at,
  fps, count })` generates the grid itself as frame numbers — drop
  them straight into an SFX score
  (`frames.map(f => ({ f, s: 'kick' }))`) or use them as cut points.
  `fps` defaults to 30. Named `beatGrid` rather than `beat` because
  `beat` is the older anticipation-entrance primitive. Verified with
  unit tests (grid math incl. pre-downbeat negatives and non-integer
  frames-per-beat rounding) and on-beat / mid-beat render stills.
  Site demo card #25.

## [0.16.0] — 2026-10-21

### Added

- `glitch(frame, o)` — RGB-split glitch transition over wrapped HTML.
  Inside the window the content is rebuilt from horizontal slices
  (`slices`, default 6) that jump sideways with hash-driven jitter
  re-rolled every 2 frames, plus two channel-isolated ghosts
  (feColorMatrix red / green+blue) offset behind it — `blend` picks
  `screen` for dark scenes or `multiply` for light ones. A sine
  envelope ramps displacement in and out so the first and last frames
  are perfectly clean, and outside the window the HTML passes through
  untouched. Options: `html`, `at`, `dur` (default 18 — short on
  purpose), `amount`, `slices`, `seed`, `blend`. Verified with unit
  tests (passthrough, copy count, envelope-zero first frame) and
  mid/clean render stills. Site demo card #24.

## [0.15.0] — 2026-10-21

### Added

- `morphShape(frame, o)` — shape-to-shape morph across seven built-in
  shapes: `circle`, `square`, `triangle`, `diamond`, `hexagon`,
  `star`, `heart`. Both shapes are ray-sampled at the same 72 angles
  around their center (sampled points lie exactly on the boundary)
  and interpolated point by point. Angle correspondence — rather than
  arc-length — keeps features at their compass positions during the
  morph: a heart's dip forms at the top and its point at the bottom,
  with no sideways swoop mid-flight. Options: `from`, `to`, `x`, `y`,
  `size` (bounding radius), `color`, `stroke`, `strokeWidth`, `rot`,
  plus `at` / `dur` / `fn`; progress clamps, so the shape holds
  `from` before `at` and `to` afterwards — chain calls for sequences.
  Verified with unit tests (true-shape endpoints, midpoint radii,
  name fallback) and three render stills (circle / mid / heart); the
  mid-frame still is what caught — and then confirmed the fix for —
  the arc-length swoop. Site demo card #23 chains circle → star →
  heart → circle.

## [0.14.0] — 2026-10-21

### Added

- `particleField(frame, o)` — ambient particle layer. Three modes:
  `float` (stars / dust motes wandering in place), `snow` (falls,
  sways, wraps at the bottom), `rise` (bubbles / embers climbing,
  wraps at the top). Every particle's home, size, speed, sway and
  twinkle phase derive from `hash(seed, i)`, so the field is a pure
  function of the frame and layers stack freely (a star layer under a
  snow layer is the canonical night scene). Options: `n`, `w`, `h`,
  `mode`, `speed`, `sway`, `color`, `opacity`, `rMin`, `rMax`,
  `twinkle`, `seed`. Verified with unit tests (count, bounds,
  determinism, mode separation), two render stills 75 frames apart,
  and site demo card #22.

## [0.13.0] — 2026-10-21

### Added

- `drawText(frame, o)` — handwriting-style stroke text. The glyph
  outlines draw themselves at pen speed (linear easing by default),
  then the fill settles in over the final stretch (`fillFrom`, default
  0.65). Glyph shapes come from the rendered font itself — an SVG
  `<text>` with a normalized `pathLength` — so Latin, CJK, and digits
  all draw; there is no built-in glyph set to run out of. Options:
  `text`, `x`, `y`, `size`, `color`, `stroke`, `strokeWidth`,
  `fontFamily`, `weight`, `anchor`, `letterSpacing`, plus the usual
  `at` / `dur` / `fn`. Verified with unit tests (stroke/fill timing,
  XML escaping, determinism), a bilingual render still (mid-draw and
  settled frames), and site demo card #21.

## [0.12.0] — 2026-10-21

### Package — a standard, complete package.json

- Added an `exports` map (the roadmap item from QUALITY.md): the root
  entry with its `types` condition, plus `./src/*` passthrough so the
  documented deep paths keep working, and `./package.json`. Note: with
  an exports map, *extensionless* deep imports (e.g.
  `.../src/sfx` without `.js`) are no longer resolved by Node — use
  the root entry or full paths with extensions.
- Declared `sideEffects` accurately: the entry and the lib scripts
  attach the global namespaces, everything else is pure.
- `src/studio.js` (the preview-page generator) is now in the `files`
  whitelist and ships in the tarball — it was previously repo-only.
- Verified: 17/17 tests, tarball installs into a clean consumer and
  both the root entry and deep imports resolve, package smoke green
  (installed CLI still renders the 20,148-byte baseline still).

## [0.11.0] — 2026-10-21

### Internal — TypeScript refactor (no behavior change)

- All sources are now strict-mode TypeScript: `index.ts`,
  `src/lib/{animation,captions,primitives}.ts`, `src/{render,studio,sfx}.ts`.
  `tsc` (the only build step — no bundler) compiles them to the same
  CommonJS / browser-global JavaScript, which stays committed and
  shipped; consumers still need no build step.
- Every primitive's options bag now has a named interface (mirroring
  the public declarations in `index.d.ts`), and the lib scripts share
  ambient types via `src/lib/globals.d.ts`.
- CI gains a build-freshness gate: the build fails if the committed
  JavaScript drifts from the TypeScript sources. `npm run check` now
  starts with the strict typecheck.
- Verified behavior-identical: 17/17 tests; source and
  tarball-installed still renders byte-identical to the pre-refactor
  baseline (20,148 bytes); the site's 20 demos render with zero page
  errors.

## [0.10.1] — 2026-10-21

### Internal — project quality, benchmarked to mature-OSS practice
- Community profile completed: SECURITY.md (private vulnerability
  reporting), CODE_OF_CONDUCT.md, SUPPORT.md, CODEOWNERS.
- Supply chain: Dependabot (npm + GitHub Actions, weekly) and
  Dependabot security updates enabled; GitHub Actions pinned to
  full-length commit SHAs; CI token cut to `contents: read`;
  credentials no longer persisted at checkout; job timeouts added.
- CI now also exercises Node 18 and 22 (compat job) and runs a package
  smoke gate: the packed tarball is installed into a clean project and
  must render through the installed CLI (`npm run package:smoke`).
  The same commands run locally (`npm run check`, `npm run syntax`).
- CodeQL code scanning enabled with GitHub's default setup; private
  vulnerability reporting and secret-scanning push protection are on.
- RELEASING.md (SemVer, gated checklist, tag + GitHub release per
  version) and QUALITY.md (the bar, the evidence, and the known
  exceptions — solo-maintainer review model, npm pending) added.

## [0.10.0] — 2026-10-21

### Added
- `counterRoll` — odometer digit roll: each decimal column is a digit
  strip that rolls forward to its target digit (plus optional extra
  full turns), starting staggered from the ones place so the number
  settles in a leftward cascade and lands perfectly aligned. Site demo
  card included (20 cards). Unit-tested: start state, exact settle
  digits, cascade ordering.

## [0.9.1] — 2026-10-21

### Internal
- Parity tests (`test/parity.test.js`, runs in CI): the runtime exports,
  the `index.d.ts` function declarations, the `Motion` object type, and
  the site's mirrored lib copies must agree — the three drift classes
  that can silently make the site demo old code or the package lie
  about its API now fail the build instead.

## [0.9.0] — 2026-10-21

### Added
- `flipIn` — 3D flip entrance: rotates in from edge-on around the X or Y
  axis and settles with a slight overshoot; returns a style string with
  perspective baked in, so it drops onto any element like `fadeUp`.
  Site demo card included (19 cards). Unit-tested: start/end states,
  overshoot dip, axis variant.

## [0.8.0] — 2026-10-21

### Added
- `pathFly` — flight along an arbitrary polyline at constant speed:
  arc-length parameterization means long legs don't surge and short ones
  don't crawl; returns `{x, y, angle, p, done}` so the traveler can be
  rotated into its heading. Feed it sampled curve points for smooth
  paths. Site demo card included (18 cards). Unit-tested: corner
  accuracy, heading, equal-distance progress steps.

## [0.7.0] — 2026-10-21

### Added
- `whip` — whip-pan transition helper: the offset for a two-scene strip
  (slow at both ends, fastest mid-pan where the cut hides) plus a blur
  value peaking mid-pan, ready to feed a CSS blur on the strip or to
  pair with `smear` on the moving elements. Site demo card included
  (17 cards). Unit-tested: endpoints, direction, blur peak.

## [0.6.0] — 2026-10-21

### Added — paper-cut pack (core)
- `paperEl` — a cut-paper shape (rect / circle / blob) with flat fill, a
  hard offset shadow for paper thickness, and a resting tilt.
- `pivot` — paper-puppet joint rotation as a CSS transform value, with
  optional step quantization for stop-motion stiffness.
- `stepped` — eased progress snapped to N discrete levels; `onTwos` —
  frame snapping (shot-on-twos) that gives a whole scene stop-motion
  timing. Unit-tested; the site gains a "paper-cut" demo card (16 total)
  built entirely from the pack. Remaining pack items (morphPoly,
  parallax) stay in the backlog.

## [0.5.0] — 2026-10-21

### Added
- `smear` — motion blur, knob 03 of the six-knobs decomposition
  (@asteri_eth). Exposure ghosts are sampled at earlier frames along a
  fly path, and the blur strength follows velocity (distance covered
  inside the exposure window), so fast moves smear and slow moves stay
  sharp; nothing renders before the move starts or after it lands.
  Distinct from `trail`, which spaces ghosts by progress for a comet
  look. Unit-tested for speed scaling, ordering and determinism;
  still-verified at peak velocity and during deceleration.
- Tuning-config convention: compositions declare a `TUNE` block with
  their knobs as named numbers, so revision notes become number edits.
  First used in the new site demo card, which runs the smear card with
  a visible `TUNE.blur`.

### Site
- New live demo card "smear" (15 cards total): the same flight twice,
  bare vs blurred.

## [0.4.2] — 2026-10-21

### Renderer quality
- New default "master" encode: x264 preset slow + tune film (preserves
  grain/texture instead of smoothing it) + aq-mode 3 (more bits for dark
  areas and gradients, fights banding) + CRF 16. `--draft` keeps the old
  fast settings for previews. Measured on fx-showcase frame 90 (gradient
  scene): SSIM vs the lossless source frame 0.9932 -> 0.9944; overall
  bitrate 0.94 -> 1.41 Mbps.

### Package
- Published-package ready: scoped name `@sunjiali/motion-primitives`,
  proper metadata, `files` whitelist, `engines`, keywords.
- The library now loads in Node as well as the browser (root-object shim
  in src/lib) behind a package entry `index.js`, with hand-written
  TypeScript types in `index.d.ts` covering the full public API and the
  SFX module.
- Unit tests (`npm test`, node:test): API surface, frame-purity /
  determinism, spring/count-up/hash contracts, SFX WAV validity and
  determinism. CI now runs the suite plus the smoke render.
- Repo standards: CONTRIBUTING.md, issue/PR templates, .editorconfig.
- Found by install smoke-testing (and fixed): `src/player.html` was
  missing from the package files, and a `const` root shim broke the
  browser build when both lib files are inlined into one page.

## [0.4.1] — 2026-10-21

### Site
- Full UI/UX redesign: dark brand nav with the candy-dot mark; the hero
  now runs the library's own `meshBg` live as its backdrop (the product
  demos itself) with a tilted, framed showcase card; numbered section
  eyebrows (01–05); Examples moved onto a dark ink panel for rhythm;
  demo cards get rotating accent colors and hover lift; playground
  controls stick while scrolling; scroll-reveal on section blocks
  (disabled under prefers-reduced-motion). All 14 live demos, the
  playground and mobile layout re-verified after the rewrite.

## [0.4.0] — 2026-10-21

### Added
- `src/sfx.js`: deterministic SFX synthesizer — ten code-only sounds
  (pop / bloop / ting / whoosh / thump / inhale / glide / shimmer /
  swell / chord), frame-based JSON scores, seeded noise, the
  sound-lands-one-frame-after-the-visual rule. Same score renders a
  bit-identical WAV every time (SHA-256 verified).
- `fx-showcase.sfx.json`: a 19-event score for the advanced reel
  (D-major pentatonic throughout); the site copy of fx-showcase now
  plays with its synthesized soundtrack, RMS-verified alignment
  (event windows ≈ −12…−17 dB, gaps at digital silence).

## [0.3.0] — 2026-10-20

### Added
- Advanced effects batch (see EFFECTS.md): `beat`, `drop`, `travel`,
  `shake`, `punch`, `flash`, `camera` (virtual camera), `meshBg`
  (animated gradient mesh), `drawOn` + `poly` (self-drawing strokes),
  `bars` (animated bar chart), `scramble` (text decode), `kenBurns`,
  `breathe`, `fx` (film grain + vignette), `hash` (deterministic random).
  Motion vocabulary adapted from the code-video-director skill; layer
  stack from remotion-motion-graphics.
- `fx-showcase` composition: an 18-second dark premium reel exercising
  the whole advanced stack, frame-verified (540 frames).
- EFFECTS.md: the living effects ledger and backlog for future rounds.
- Site: four new live demo cards (scramble, camera, drawOn + bars,
  beat + drop) and API table rows for the advanced effects.

## [0.2.0] — 2026-10-20

### Added
- Two new primitives: `wiggle` (decaying rotational shake) and `typewriter`
  (self-typing text with an optional blinking caret), with live site demos.
- Official website: landing page with live in-browser demos, a parameter
  playground, rendered examples and docs, auto-deployed to GitHub Pages
  on every push to `site/**`.
- CI workflow: syntax-checks all JavaScript and smoke-renders a showcase
  still on every code push.
- `STYLE.md`: the house video style (flat vector, per-scene solid
  backgrounds, round-faced balls, EN title + CN translation, code pill,
  hard cuts, silent).
- Custom 404 page; Open Graph / Twitter card metadata and video posters.

### Changed
- Renderer honors the `CHROME_PATH` environment variable (default
  `/opt/meta-chromium/chrome`), so it runs on CI machines too.
- Site demo stages scale to their container (mobile-safe) and pause
  redrawing while off-screen.

## [0.1.0] — 2026-10-20

### Added
- Initial release: frame-pure motion primitives (`pop`, `fadeUp`, `pulse`,
  `countUp`, `stagger`, `fly`, `trail`, `squash`, `dot`, `ripple`, `burst`,
  `badge`, `targetSlot`, `scene`, `transition`) on a headless-Chrome +
  ffmpeg rendering pipeline.
- Two example compositions: `showcase` (1280×720) and `math-make-ten`
  (720×1280).
