# Changelog

All notable changes to motion-primitives are documented here.

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
