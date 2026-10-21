# Changelog

All notable changes to motion-primitives are documented here.

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
