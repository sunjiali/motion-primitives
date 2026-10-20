# Changelog

All notable changes to motion-primitives are documented here.

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
