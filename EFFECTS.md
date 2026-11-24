# EFFECTS — the living effects ledger

Every effect the library can do, and the queue of what gets built next.
Fed by ongoing research rounds (X / GitHub skill ecosystem); each round
ships as a versioned release with a CHANGELOG entry and a verified demo.

## Implemented

### FX (v0.82)
- `fisheye` — radial lens distortion over wrapped HTML: the picture
  bends as if shot through a fisheye lens, the centre bulging toward
  the viewer while the edges hold — a true radial displacement
  (output pixel at radius r samples the source at
  r·(1 − strength·(1−(r/R)²)²), the squared falloff keeping the bend
  smooth at the lens rim and exactly zero outside it), driven by an
  SVG feDisplacementMap whose map is a procedurally generated PNG
  (a pure-TS encoder — RGB8, filter 0 per row, DEFLATE stored
  blocks, no assets, no dependencies — cached per lens geometry);
  the animation rides the filter's `scale` attribute, so the map
  itself never changes with the frame. `mode:'in'` (default) bends
  the picture in over the window, eased on `fn` (cubicOut default);
  `mode:'out'` unbends it back to flat; `mode:'sustain'` holds the
  full bend permanently (`at`/`dur` ignored). `strength` (default
  0.6, clamped to ±0.9) is the lens power — positive bulges
  (barrel), negative shrinks (pincushion). `radius` is the lens
  radius in px (default the distance from (`cx`, `cy`) to the
  farthest region corner); `cx`/`cy` is the lens centre (default
  the region centre); `x`/`y`/`w`/`h` confines the lens to a
  region (default the whole stage) while the wrapped html keeps its
  stage coordinates. The 2-D HTML-string form that the backlog
  entry flagged as "a research spike before building" is closed by
  the spike in this round: a low-res map (w/8 × h/8, 160×90 at
  720p) stretched by feImage is smooth, `color-interpolation-filters
  ="sRGB"` keeps the map values exact, and `primitiveUnits=
  "userSpaceOnUse"` aligns the map to the region (verified with a
  sub-region still: the warp stays inside the rect and the grid
  continues seamlessly across its edge). Caveat, documented in the
  code: like every SVG-filter primitive, the first filtered frame
  flips text antialiasing from subpixel to grayscale — geometry is
  pixel-identical at scale 0 (spike: grid delta 0, all >8 diffs
  confined to one text row). Fixed during verification: the filter
  id now carries the animated scale, after the stills caught two
  same-geometry fisheyes sharing one id and rendering at the first
  definition's scale. Source: the Remotion effects reel
  (https://www.instagram.com/reel/DZ47wmCinCV/), corroborated
  2026-11-24 by @motion.easyy's AE Fish Eye text
  (https://www.instagram.com/reel/Dcdsbn4tmqs/), @janek_crtv's
  fisheye text animation
  (https://www.instagram.com/reel/DGTZcCTKhw4/), @deyfilmit's
  Premiere Lens Distortion tutorial
  (https://www.instagram.com/p/De8_QP8GRq0/) and
  @kirill.blokhin_'s UIKit fisheye lens experiment
  (https://www.threads.com/@kirill.blokhin_/post/DfX0pk7DdBo).
  Distinct from `iris` (a circular clip, no warp), from `chroma`
  (RGB channel ghosts) and from `edgeBoil` (noise wobble, no radial
  field). Demo card (hero word bending in + sub-line pincushion) +
  `fisheye` composition (150 f, coral hero bends in 10–55, cream
  sub-line pincushions 60–100, the title unbends 110–150) + Prompt
  Gallery entry. With this, the backlog is empty again.

### FX (v0.81)
- `echo` — AE Echo-style ghost stack over wrapped HTML: the content
  is repeated as `echoes` (default 8) copies at fixed offsets along
  `angle` (default 0, +x; 90 = +y), each fainter than the last — echo
  i sits at `decay`^i opacity (`decay` default 0.8) and i·`step` px
  away (`step` default 12) — so the content trails ghosts behind it
  like the Echo effect's time-offset copies. `mode:'in'` (default)
  stretches the train out from the content over the window, eased on
  `fn` (cubicOut default); `mode:'out'` collapses a standing train
  back into the content; `mode:'sustain'` holds the full train
  permanently (`at`/`dur` ignored). The original is drawn last, on
  top, at full opacity; the ghosts are copies of the same html, so
  the stack is frame-pure with no extra assets. Before `at` an 'in'
  echo passes the html through untouched; after `at + dur` an 'out'
  echo does the same. Source: @asyaleksee's Echo + Displacement Map
  retro-text breakdown
  (https://www.instagram.com/reel/DVEEAofjG5v/ — Echo, 20 echoes at
  -0.003s, over retro typography; the Displacement Map half is
  pixel-based, out of scope). Distinct from `trail` (ghosts at
  earlier frames along a motion path — echo needs no motion at all),
  from `smear` (velocity ghosts) and from `chroma` (RGB channel
  ghosts). Demo card (hero word echoing right + sub-line trailing
  down) + `echo` composition (150 f, coral hero stretches its train
  out 10–55, cream sub-line trails downward 60–100, the title's own
  echoes collapse back in 110–150) + Prompt Gallery entry. With
  this, the remaining backlog is `fisheye` only.

### FX (v0.80)
- `flicker` — neon-sign flicker-on: the content stutters on/off
  on a hash pattern with a decaying off-probability, then settles
  on with a glow. `mode:'on'` (default) is the startup — the sign
  flashes on in brief blips that lengthen as the off-probability
  decays quadratically over `dur`, then burns solid; on-frames
  inside the stutter still wobble a little (the wiggle(2, 50)
  SMOOTH register) instead of sitting at flat 1.
  `mode:'sustain'` is the broken neon that keeps misfiring
  (starts at `at`, never settles); `mode:'pulse'` breathes the
  glow on a |sin| envelope with period `rate` (default 60 frames,
  the ALARM register); `mode:'blink'` toggles on a square wave
  with period `rate` (default 12 frames, 6 on / 6 off). The halo
  is two stacked drop-shadows — a tight hot core and a wide soft
  halo, the @aniakubow layering — scaled by `amount` and by the
  current brightness, so a dim sign casts no light. `glow` is the
  neon colour (default #FF2E88); `dim` leaves the faint tube
  visible when the sign is off (default 0, fully dark); `step` is
  the flicker slot length in frames (default 2 — the 60/90/60 ms
  startup beats of @thestudiodsign's OPEN sign). The stutter
  quantizes time into `step`-frame slots hashed on `seed`, so
  each on/off run lasts at least one slot. Before `at` an
  'on'/'sustain' flicker shows only the dim ghost. Source:
  @shyamx.mov's flicker-glow text
  (https://www.instagram.com/reel/DbafRWxsiN9/), corroborated by
  the neon signboard reveal
  (https://www.instagram.com/reel/DanE-OTzZXg/) and @rize.style_'s
  neon line-trace logo reveal
  (https://www.instagram.com/reel/DZ45Hd7Sa32/), re-corroborated
  2026-11-22 by @rexadewa's six AE opacity expressions
  (https://www.instagram.com/reel/DZei5e-sReB/) — SMOOTH / BROKEN
  NEON / GLITCHY / CANDLELIGHT / ALARM / BLINKING — plus
  @aniakubow's white-hot-core neon
  (https://www.instagram.com/reel/DePTsnVKv3I/) and
  @thestudiodsign's Figma OPEN sign startup
  (https://www.instagram.com/reel/DemfPXOhkH/). Distinct from
  `flash` (one full-frame impact flash) and from `glitch`
  (slices + RGB split). Demo card (hero word flickering on +
  sub-line on a broken neon) + `flicker` composition (150 f,
  coral hero flickers on 10–55 in pink, cream sub-line misfires
  from 60 on in amber, corner dot blinking on a square wave
  throughout) + Prompt Gallery entry. With this, the backlog is
  empty again.

### Transition (v0.79)
- `shatter` — the wrapped content breaks into tiles that fling
  outward from a force centre with rotation under gravity and
  fade, so a title or a whole scene bursts apart and is gone by
  `at + dur` (draw black or the next scene behind it). Each tile
  is a cropped window of the html (the mosaic crop trick: an inner
  div offset back to stage origin inside an overflow-hidden tile),
  launched at a hash-staggered moment inside the first 35% of the
  window so the break reads as one impact, not a wave. The flight
  eases on `fn` (cubicOut default) and gravity adds a t² fall, so
  tiles arc; each tile spins on its own hash angle and fades over
  the last 30% of its flight. `pattern` picks the tile shape:
  `'square'` (default, a plain grid), `'bricks'` (alternate rows
  offset by half a cell — odd rows carry one extra tile),
  `'triangle'` (every cell split diagonally into two flying
  triangles). `strength` (default 260) is the fling distance in px
  at full flight — negative implodes instead, tiles flying toward
  the force centre. `gravity` (default 240) is the extra downward
  fall in px by the end of the window. `fx`/`fy` is the force
  centre (default the region centre), separate from the pattern
  origin (`x`/`y`/`w`/`h`). Before `at` the html passes through
  untouched. Source: Remotion v4.0.539 `shatter`
  (https://www.thereelstack.com/lab/remotion-shatter-curves-hyperframes-gif-export-windows):
  bricks / glass / hexagon / square / triangle patterns, pattern
  origin and force centre separate — hexagon and glass stay a
  future variant. Distinct from `mosaic` (tiles flip in place to
  scene B, no flight) and from `pixelDissolve` (cells flip away,
  no flight, no gravity). Demo card (hero word on square tiles +
  sub-line on bricks) + `shatter` composition (150 f, coral hero
  bursts 10–50 on square tiles, cream sub-line on bricks 60–100,
  whole-stage triangle close 110–150 ending on scattered fading
  tiles one frame before black) + Prompt Gallery entry. With this,
  the remaining backlog is `flicker` only.

### Reveal (v0.78)
- `venetianBlinds` — classic blinds transition: the frame is cut
  into `slats` (default 8) equal horizontal bands and every slat
  wipes at the same moment to reveal the content beneath, so the
  scene arrives in N simultaneous strips instead of behind one
  edge. Each slat is a cropped window of the html (the mosaic crop
  trick: an inner div offset back to stage origin inside an
  overflow-hidden band), and the wipe inside the slat is a
  clip-path inset — `dir:'center'` (default) opens from the slat's
  middle line outward, the true blinds-opening look, `'down'`
  grows from the top edge, `'up'` from the bottom edge.
  `mode:'out'` closes the slats over the content instead;
  `feather` softens each slat's wipe edge with a mask gradient
  (the iris feather pattern, stops clamped so a feather wider
  than the visible band degrades to a soft peak). The wipe eases
  on `fn` (cubicOut opening, cubicIn closing unless overridden).
  Before `at` an 'in' blinds shows nothing; after `at + dur` it
  passes the html through. Source: Remotion @remotion/effects
  `venetianBlinds`, Lumit docs — "The frame is cut into slats of
  equal width and every slat begins wiping at the same moment"
  (https://docs.lumitlab.com/effects/transition/venetian-blinds/).
  Distinct from `sliceWave` (a travelling wave displaces strips)
  and from `wipeReveal` (one edge, not N slats). Demo card (hero
  word in + out, sub-line top-down) + `venetian-blinds`
  composition (150 f, coral hero in 10–40 on 8 slats, cream
  sub-line in 55–85 on 12 slats top-down, whole-stage close
  110–150 ending on thin slivers one frame before black) + Prompt
  Gallery entry. With this, the remaining backlog is `shatter` /
  `flicker`.

### Reveal (v0.77)
- `tvOff` — CRT power-off/on: the picture squashes vertically
  into a glowing horizontal line at (`x`, `y`), the line pinches
  horizontally into a phosphor dot, and the frame dies to black;
  `mode:'on'` runs the whole thing backwards (dot → line → full
  picture, the CRT turn-on). Two phases split at `split`
  (default 0.6) of `dur`: phase 1 is the vertical move (collapse
  off / growth on), phase 2 the horizontal one (pinch off / widen
  on), so the collapse order is tall → line → dot and the turn-on
  is its exact mirror. A glow line div rides the collapse — its
  opacity ramps in as the picture reaches the line, then it
  pinches with the picture and winks out in the last quarter of
  the pinch, so the death is a dot that fades, not a snap.
  `line` is the collapsed line's height in px (default 2),
  `glow` its phosphor colour (default white). The collapse eases
  on `fn` (cubicIn off, cubicOut on unless overridden). Before
  `at` an 'off' tvOff shows the content untouched and an 'on'
  one shows nothing; after `at + dur` the 'off' returns '' (draw
  black behind it) and the 'on' passes the html through.
  Source: Remocn's "TV Power Off"
  (https://remocn.dev/docs/effects). Distinct from `iris` (a
  growing circle, no line/dot phases, no glow) and from
  `wipeReveal` (a mask sweep, no squash). Demo card (hero word
  off + sub-line on) + `tv-off` composition (150 f, coral hero
  off + cream sub-line on + whole-stage off ending on the
  phosphor dot one frame before black) + Prompt Gallery entry.
  With this, the remaining backlog is `shatter` / `flicker`.

### Text (v0.76)
- `varFont` — variable-font kinetic type: no keyframes, no
  transforms — each glyph's `font-variation-settings` rides a
  travelling sine (phase = 2π·i/wl − frame·speed, the waveText
  field convention), so the word itself breathes weight and width
  as the wave passes. `wght` is the weight range the wave sweeps
  (default [100, 900]); `wdth` is the width range (default
  [75, 125]) and rides the wave inverted — heavy pairs with
  narrow, thin with wide. Sustained and looping, no window. The
  caller must load a variable font for `fontFamily` (default
  'Roboto Flex'); the repo vendors Roboto Flex (OFL, latin
  subset, wght 100–1000 / wdth 25–151) at
  site/fonts/RobotoFlex-var.woff2, @font-face'd by the site and
  the composition — the EFFECTS caveat is closed this way, since
  the stock system fonts carry no variable font at all. Source:
  @joshschaub.ch's "kinetic type without keyframes"
  (https://www.instagram.com/reel/DVN0yNWjTnW/), corroborated
  2026-11-18 by Monotype's Weight/Width slider demo
  (https://www.instagram.com/reel/DZXova8FHdd/). Distinct from
  `waveText` (transform drift, no font-axis change) and from
  `splitText` (entrance, not a sustained wave). Demo card (full
  range FLEX) + `var-font` composition (150 f, coral hero on the
  full-range wave + cream sub-line on a gentler wave) + Prompt
  Gallery entry. With this, the backlog is empty again.

### FX (v0.75)
- `edgeBoil` — hand-drawn "boiling line" wobble: an SVG
  feTurbulence + feDisplacementMap filter displaces wrapped HTML
  by `amp` px (default 4) on a noise field of `freq` (default
  0.02, 2 octaves), and the turbulence seed re-rolls every `step`
  frames (default 4 — about 8 swaps a second at 30 fps, the
  old-cartoon rate) on a hash step, so the outline shivers like
  redrawn cartoon lines instead of sliding smoothly. Sustained
  when no `dur` is given (a standing hand-drawn grade); with a
  window the boil ramps in and out over 4 frames so it never pops
  on or off; outside the window the html passes through untouched.
  The filter id is derived from the seed block, amp, freq and
  octaves, so different knobs never share a filter. Source: Chris
  Moran's edge-boil tutorial
  (https://www.instagram.com/reel/DZdCD2YNk4d/), corroborated
  2026-11-17 by @jejestudios' line-boil breakdown — every outline
  redrawn three ways, swapped eight times per second
  (https://www.instagram.com/reel/DemHJJmNEb5/) — plus
  @sewellkillingstad's hand-traced type boil
  (https://www.instagram.com/reel/DVwRHnAjh0g/) and the Vox
  hand-drawn jitter/boil tutorial
  (https://www.instagram.com/reel/Dez2EqWorHx/). Distinct from
  `wiggle` (shakes the whole element, no outline deformation) and
  from `smear` (motion blur, not a wobble). Demo card (sustained
  boil) + `edge-boil` composition (150 f, still title vs boiling
  hero + windowed sub-line) + Prompt Gallery entry. With this, the
  remaining backlog is `varFont` only (2026-11-16 sweep).

### Text (v0.74)
- `textWarp` — field-warped kinetic type: a whole string typeset
  along a 2-D deformation field (concentric arches, mirrored
  ripples), each letter placed on the field and tangent-rotated, so
  the sentence flows like water. `field:'arch'` (default) bends the
  baseline into a parabola peaking `amp` px above the centre — a
  negative `amp` hangs it into a valley — and the arch breathes
  slowly on `speed`; `field:'ripple'` sends mirrored sine ripples
  outward from the string centre (phase = 2π·|x − cx|/wl −
  frame·speed). Sustained and looping, no window. Source:
  @kiel.d.m's STG V.EXPOGRID — "'LAST WAVE FRONT' creating
  concentric arches, 'GOING GONE' producing undulating letter
  flows" (https://www.instagram.com/p/DHly2ppxbdT/). Distinct from
  `waveText` (1-D horizontal sine drift, no rotation, no arch) and
  from `textOnPath` (letters on one fixed path, not a live field).
  Demo card (arch mode) + `text-warp` composition (150 f, coral
  WARP on a breathing arch + cream sub-line on travelling mirrored
  ripples) + Prompt Gallery entry. With this, the remaining backlog
  is `edgeBoil` / `varFont` (2026-11-16 sweep).

### Reveal (v0.73)
- `clockWipe` — radial clock-hand sector reveal: the wrapped
  content is revealed as a pie sector sweeping 0 → 360° around
  (`x`, `y`), like a clock hand — the angular counterpart to `iris`
  (radial) and `wipeReveal` (linear). The sector is a conic-gradient
  mask (CSS conic angles start at 12 o'clock and grow clockwise,
  exactly the clock-hand reading), so the edge is one straight
  radial line from the origin and no path math is needed.
  `mode:'close'` winds it back 360 → 0; `dir:'ccw'` sweeps
  counter-clockwise; `start` moves the hand's home angle in
  degrees (0 = 12 o'clock). The sweep eases on `fn` (cubicOut
  opening, cubicIn closing unless overridden). Source: Remotion
  @remotion/transitions `clockWipe()` — "Reveal the new scene in a
  circular movement" (https://www.remotion.dev/docs/transitions/).
  Distinct from `iris` (a growing circle, no direction of travel)
  and from `wipeReveal` (a straight edge, no pivot). Demo card
  (open mode) + `clock-wipe` composition (150 f, clockwise hero
  sweep 10–60 + counter-clockwise sub-line sweep from the
  bottom-left corner 75–120 + whole-stage close 110–150) +
  Prompt Gallery entry. With this, the remaining backlog is
  `textWarp` only.

### Reveal (v0.72)
- `dotText` — halftone dot-filled text: the letterforms are a field
  of dots — an SVG dot grid over the stage clipped by a text mask —
  so the word reads as a printed halftone poster. `mode:'in'`
  (default) grows the dots in on a hash stagger (the print
  developing), eased on `fn`; `mode:'pulse'` breathes every dot on
  its own hash phase (a living poster, sustained — `at`/`dur`
  ignored); `mode:'out'` shrinks them away. `gap` sets the dot
  spacing (default 16 px), `dot` the dot radius as a fraction of it
  (default 0.42); `pulse` is the breathe amplitude (default 0.25),
  `speed` the pulse period in frames (default 30). Dots carry a
  small deterministic size variation (±8%) so the field reads as
  print. The mask id is derived from the text and geometry, so two
  dotText calls with the same word at different spots never share —
  and overwrite — each other's mask. Adhemas Batista's "Do All Good"
  (https://www.instagram.com/reel/DMjuKnSuaym/), corroborated by
  Figma Motion's pixel-dot letters
  (https://www.instagram.com/p/DbML8Nrks-9/) and by the ecosystem
  (Remotion @remotion/effects `dither()`, React Bits `Dither`).
  Distinct from `charGrid` (a grid of characters, not a dot field),
  `patternField` (a pattern fill, not a text mask) and `waveText`
  (per-letter drift, no dot texture). Demo card (in mode) +
  `dot-text` composition (150 f, coral DOT 10–55 + cream TEXT 60–105
  printed in, teal sub-line breathing in pulse mode all film) +
  Prompt Gallery entry. With this, the remaining backlog is
  `clockWipe` / `textWarp` only.

### Reveal (v0.71)
- `iris` — circular-aperture reveal: the wrapped content is
  clipped to a circle centred at (`x`, `y`) whose radius animates
  0 → the farthest stage corner, so the scene arrives through an
  opening camera iris; `mode:'close'` runs it backwards (the
  content sinks into a dot and vanishes), `mode:'blink'` closes,
  holds as a dot for `hold` frames, then reopens (the Remocn
  iris-wipe cartoon beat); `feather` softens the rim (a mask
  radial-gradient with a `feather`-px falloff band instead of a
  hard clip-path). The radius eases on `fn` (cubicOut opening,
  cubicIn closing, cubicInOut for the blink halves unless
  overridden). Remotion @remotion/transitions `iris()`
  (https://www.remotion.dev/docs/transitions/presentations/iris),
  corroborated by Motion.dev curtains `iris()`
  (https://motion.dev/docs/curtains), Remocn's `iris-wipe`
  (https://remocn.dev/docs/transitions), and Motion Fab's
  chain-reaction showreel
  (https://www.motionfab.app/en/prompts/motion-design-chain-reaction-showreel).
  Distinct from `portalWipe` (a two-scene opaque-disc transition,
  not a single-content clip) and from `wipeReveal` / `maskReveal`
  (linear / flat covers, no aperture). Demo card (blink mode) +
  `iris` composition (150 f, centre open + corner open + full-stage
  iris-out close) + Prompt Gallery entry. With this, the backlog is
  empty again.

### Reveal (v0.70)
- `dominoReveal` — domino topple-chain reveal: a row of standing
  tiles covers the content and falls one after another, each tile
  rotating ~90° around its base edge on a gravity ease (quadIn
  default) and fading out once flat, so the wave uncovers the
  content as it passes; the chain is contact-propagated (tile i
  starts `step` frames after tile i-1, step derived so the last
  tile lands and fades exactly at `at + dur`). `dir:'left'`
  reverses the wave; `x/y/w/h` confines the tiles to a band while
  the wrapped html keeps its stage coordinates. The "Domino
  Reveal" panel of @matt_penny_applied_ai's "9 Claude Animation
  styles" reel (https://www.instagram.com/reel/DfX8t_hGfxY/),
  dominos falling to spell 'PHYSICS'. Distinct from `pivot` (a
  single joint rotation) and from `drop` (a gravity fall): the
  chained propagation timing is the point. Demo card + `domino`
  composition (150 f, cream wave on the hero word + reversed
  coral wave on the sub-line) + Prompt Gallery entry. With this,
  the backlog is empty again.

### FX (v0.69)
- `frost` — animated CSS blur over wrapped HTML: the blur radius
  animates from `from` (default 12 px) to `to` (default 0) on `fn`
  (cubicOut default), so content clears out of frosted glass — or
  sinks behind it when reversed (from 0 to 12). A single
  `filter:blur()` on a wrapper div; outside the window the html
  passes through untouched, empty html returns ''. Distinct from
  `whip`'s blur value (a mid-pan streak blur) and from `smear`'s
  motion blur (ghost copies along a path): frost blurs the content
  itself, in place. Composing note: a window that starts with
  `from` > 0 after a sharp stretch pops (sharp → frosted in one
  frame), and a sink window's end snaps back to sharp — chain
  windows so the radii meet (the `frost` composition's sink and
  re-clear meet at 16 px on frame 110; its opening window starts
  at frame 0 so the film opens frosted, not sharp-then-frosted).
  Demo card + `frost` composition (150 f, clear / sink /
  re-clear + a deeper-frost sub-line) + Prompt Gallery entry.
  Remaining backlog at the time: `dominoReveal` only (shipped
  in v0.70.0).

### FX (v0.68)
- `shine` — one band of light travelling across wrapped HTML: a
  linear-gradient band (transparent edges, bright core) on an
  overlay div with mix-blend-mode 'screen', so it reads as light
  falling across the surface — the classic logo/card shine sweep.
  `angle` steers the travel direction (0 = left→right, 90 =
  top→bottom), `width` is the band as a fraction of the travel
  span, `amount` its peak opacity, `color` its colour (hex-parsed
  so the gradient edges fade to true transparent, not grey), `fn`
  eases the sweep; the band starts and ends fully off-stage, so
  the first and last frames are clean. Distinct from `flash` (a
  full-frame impact flash) and from `fx` (grain + vignette, no
  travelling highlight). The named effect in Remotion's effects
  system (`shine()`, keyframed — 2026-11-10 sweep). Demo card +
  `shine` composition (150 f, two sweeps on the hero word plus a
  top-to-bottom sweep on the sub-line) + Prompt Gallery entry.
  Remaining backlog: `frost` / `blur` only.

### FX (v0.67)
- `chroma` — chromatic-aberration RGB fringe over wrapped HTML: the
  clean content stays centred while red and cyan channel ghosts
  (SVG feColorMatrix isolation, same machinery family as `glitch`)
  drift apart along `angle`, so the scene reads as shot through a
  cheap lens. `mode:'pulse'` (default) rides a sine envelope over
  the window — a beat-locked fringe spike; `mode:'sustain'` holds a
  constant offset with a slow breathing wobble for a permanent
  grade. Distinct from `glitch` (jagged slices + re-rolled jitter,
  a transition window): chroma is smooth, continuous, slice-free,
  and usable as a standing look. The Vox look's signature trick
  (Chris Moran's "What makes Vox animations look so clean?"
  breakdown, 2026-11-09 sweep), corroborated by the Remotion
  Motion Design skill's VFX pipeline. Demo card + `chroma`
  composition (150 f, pulse + sustain scenes) + Prompt Gallery
  entry. With this, the backlog is empty again.

### Text (v0.66)
- `waveText` — travelling sine wave over a typeset string: each
  glyph drifts on one sine field with a per-letter phase stagger
  (phase = 2π·i/wl − frame·speed), so the sentence itself ripples
  instead of entering; `axis:'x'` drifts sideways, `axis:'y'`
  bobs vertically. Sustained and looping, no entrance window.
  The Cavalry kinetic-type move from the 2026-10-29 sweep
  (https://www.instagram.com/reel/DX6Huhosym8/). Distinct from
  `splitText` / `assembleText` (entrances), from `letterTrack`
  (spacing animation), and from `waveLine` (a drawn wavy stroke,
  not text). Demo card + `wave-text` composition (150 f, both
  axes) + Prompt Gallery entry. Released 2026-11-08 after the
  render gate was unblocked with a stock chrome-headless-shell
  installed via the repo's own CI tooling (see CHANGELOG 0.66.0).
  With this, the backlog is empty again.

### Motion (v0.65)
- `speedLines` — anime-style speed lines: thin streaks radiating
  from (x, y) during a fast window — lines pop in hash-staggered,
  stretch outward, fade over the last quarter of `dur`; `angle` +
  `spread` aim the fan (spread 360 = full impact burst, a narrow
  cone re-centred on a moving element each frame = trailing
  lines). The "SPEED LINES" panel of @ersharium's fast-motion
  tutorial (2026-10-28 sweep). Distinct from `smear` (exposure
  ghosts), `trail` (ghost positions) and `burst` (particles):
  straight streaks, not copies of anything. Demo card +
  `speed-lines` composition + Prompt Gallery entry. With this,
  the backlog is empty again.

### Text (v0.64)
- `letterTrack` — animated letter-spacing (tracking) reveal: a
  whole word's letter-spacing eases from `from` to `to` on an
  easeOutCubic curve, opacity riding the same ease, so the word
  arrives as one unit rather than letter by letter (wide `from`
  settles in, tight negative `from` squeezes out). The
  kinetic-type move behind Jitter's letter-spacing animation
  (2026-10-27 sweep). Distinct from `splitText` (per-character
  stagger) and from `drawText`'s static `letterSpacing` option.
  Demo card + `letter-track` composition + Prompt Gallery entry.
  With this, the backlog is empty again.

### Displacement (v0.63)
- `sliceWave` — travelling wave packet over horizontal slices of
  arbitrary HTML: a wavefront crosses the scene over `dur` frames
  and each strip shifts horizontally by a sine field inside a
  gaussian packet around the front, so the wave passes through and
  leaves the scene undisturbed (input HTML returned untouched
  outside the window). Closes the last backlog item in this file.
  Demo card + `slice-wave` composition + Prompt Gallery entry.

### Interface (v0.62)
- `springSheet` — spring-damped bottom sheet: a dock bar springs
  upward to its open height (stiffness 300 / damping 18, one
  visible overshoot before settling), icons pop in staggered as
  it opens, collapses back to the dock at `closeAt` (collapse
  clamped at dockH, never below). Anchored by its bottom edge,
  so the dock never moves. Demo card + `spring-sheet`
  composition + Prompt Gallery entry. Closes the 2026-10-22
  eve backlog; remaining backlog is `sliceWave` only.

### Site (v0.61)
- Site demo-gallery pass (no lib API): editorial header line
  over the demo wall ("Fifty-nine motions, one idea…") with
  a true-count meta line, a tighter grid (3 columns / 14 px
  gap on wide screens, was 2 / 18 px), and hover-feel —
  hovering a card replays its animation from frame 0, the
  lift deepens to −4 px, the title accent dot scales 1.7×.
  Verified in headless Chrome (59 cards, 3 × 368 px columns,
  0 console errors, hover-replay dot trajectory). Closes the
  2026-10-22 eve backlog's site item; remaining backlog is
  `springSheet` and `sliceWave`.

### Formula (v0.60)
- `chapter-formula` (composition, not a primitive) — the house
  chapter formula codified as a film that labels itself while it
  runs: hook 0–2s (one claim, one hero), three chapters of 1.5s
  each holding exactly one hero + one action + one label (arc
  flight / bars rising once / a countUp number), a one-glance
  recap (three cards side by side), and an ink outro card with a
  source line. Clears the last item from the 2026-10-22
  Swiss-style sweep backlog. Prompt Gallery entry ships with it
  (formula items get a gallery entry, no demo card / docs row —
  there is no new API surface).

### Transitions (v0.59)
- `mosaic` — pixel-grid scene transition (the orderly counterpart to
  glitch): every tile shows a cropped window of scene A, then flips to
  the same window of scene B at its hash-staggered moment, swelling
  1.28× around the flip so the cut reads as a tile "turn". Before `at`
  the layer returns full-bleed A, after `at + dur` `''` — draw the
  incoming scene beneath. Clears the last unshipped item from the
  2026-10-21 X sweep backlog. Demo card + `mosaic-demo` composition +
  Prompt Gallery entry.

### Ambience (v0.58)
- `rings` — concentric thin rings around a focal point: one
  geometry (count rings spaced `gap` apart from `r0`), three
  modes — `pulse` (expanding train, phase (frame−at)/dur + i/count,
  opacity fading as rings grow, loops forever), `breathe` (settled
  set swelling on a slow phase-lagged sine), `spin` (dashed arcs,
  neighbours counter-rotating). Thin lines, one muted colour,
  alpha does the depth work; seeded phase jitter keeps stacked
  calls out of lockstep. The ambient half of motionin.design's
  signature framing (portalWipe shipped the transition half in
  v0.57). Demo card + `rings-demo` composition (Pulse./Breathe./
  Spin. three-scene study) + Prompt Gallery entry.

### Transitions (v0.57)
- `portalWipe` — circular portal transition (motionin.design's
  signature move): a flat disc blooms from (x, y) with an
  easeOutCubic pop, swallows the outgoing scene, holds, then
  contracts (cubicInOut) toward (x2, y2), revealing the incoming
  scene drawn underneath. The outgoing scene rides inside the
  primitive as `html` — unclipped before `at`, SVG-mask-clipped to
  outside the disc during the bloom, swallowed at full coverage —
  so the composition's layering is correct by construction; echo
  rings trail the rim. The portal must contrast with both scenes
  (a red disc over a red scene made the contraction phase
  invisible — caught on the verification still, shipped white).
  Demo card + `portal-demo` composition + Prompt Gallery entry.

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
- ~~(original note) mosaic transition~~ — shipped in v0.59.0 as
  `mosaic`: each tile crops a window of scene A (`htmlA`), flips to
  the same window of scene B (`htmlB`) at its hash-staggered moment,
  swelling 1.28× around the flip; before `at` the grid returns
  full-bleed A, after `at + dur` `''`. Demo card + `mosaic-demo`
  composition + Prompt Gallery entry.
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

## Backlog — 2026-10-22 sweep (@guanmo_ai "每天一个设计风格" 02 Swiss Style)

Source: https://x.com/guanmo_ai/status/2113059005555700049 — fully
open-sourced at github.com/guanmo-ai/design-style (styles/002-swiss-style:
storyboard, palette, type params, Remotion source, Python-synthesized
120 BPM score). Studied 2026-10-22 at Robin's request.

- ~~`relayMorph`~~ — shipped in v0.54 as `relay` (name shortened to
  match the library's one-word primitives): keyframed geometry —
  { at, x, y, w, h, r?, opacity? } poses interpolated with one easing,
  so one hero element persists across scene cuts, sliding and
  morphing pose to pose instead of vanishing at the cut.
- ~~Beat-locked cuts convention~~ — shipped in v0.54 inside the
  `swiss-relay` composition: a TUNE block (BPM 120 · fps 30 ·
  framesPerBeat 15 · beats [0, 60, 120, 180, 240]) puts every scene
  boundary and every relay key exactly on a beat.
- ~~Swiss skin / composition study~~ — shipped in v0.54 as the
  `swiss-relay` composition: grid-first layout (12×6, hairlines
  shown), one accent color only (Swiss red #E30613 on paper #F5F4F0 /
  black #111111), a single sans family with hierarchy by size/weight
  only, flush-left ragged-right, all square corners. A "style skin"
  counterpoint to the default STYLE.md look (round hero, capsule
  code bar, rotating scene colors) — candidate for a design-style
  series of our own.
- ~~Chapter formula~~ — shipped in v0.60.0 as the `chapter-formula`
  composition: hook 0–2s, chapters of 1.5s each = one hero + one
  action + one label, recap, outro card with source line — the film
  labels each segment's formula role as it runs. With this, the
  2026-10-22 Swiss sweep backlog is fully shipped.

## Rules for new effects

Frame-pure (a function of `frame` only), deterministic (randomness only
via `hash`), no DOM state, no assets. Every effect ships with: a site
demo card, a docs row, a CHANGELOG entry, and a still-frame check.

## Shipped 2026-10-22 (manual round, Robin: "别等 现在就开始")

- `splitFlap` — shipped in v0.56.0. Source study: React Bits' text
  shelf (via @yanliudreamer's design-resources Article, T-14). Their
  Split Flap was the frame-pure gap in our text kit: `scramble`
  resolves random glyphs; splitFlap cycles an *ordered* charset
  (blank → A → B → … → target), flipEvery/stagger knobs, foreign
  chars appear whole at their turn. Demo card + `flap-board`
  composition (statuses re-flap mid-film) + Prompt Gallery entry.
  React Bits remainder not taken: pointer/scroll-driven items
  (Warp/Pressure/Proximity/Cursor) violate frame-purity; Echo/Fold
  overlap trail/flipIn. Chapter formula still the only backlog item.

## Backlog — 2026-10-22 eve (via @neropursue resource list, Robin: "学习这些持续升级")
Source: Nero's "10 resources" post (9 links actually listed) + its embedded
motionin.design walkthrough video. Full note:
~/workspace/research_notes/neropursue-motion-resources.md
- ~~`portalWipe`~~ — shipped in v0.57: flat disc blooms from
  (x, y), swallows the outgoing scene (passed as `html`, SVG-mask
  clipped during the bloom, swallowed at full cover), holds, then
  contracts toward (x2, y2) revealing the incoming scene beneath;
  echo rings trail the rim.
- ~~`rings`~~ — shipped in v0.58: concentric thin rings around a
  focal point in three modes (pulse train / breathe / spin arcs),
  demo card + `rings-demo` composition + Prompt Gallery entry.
- ~~Site page optimization~~ — shipped in v0.61.0: editorial
  header line, tighter 3-column grid, hover-replay + lift +
  accent-dot scale; verified with before/after headless-Chrome
  screenshots (59 cards, 0 console errors).
- ~~`springSheet`~~ — shipped in v0.62.0: bottom-anchored sheet
  springs from its dock bar to its open height on a damped spring
  (stiffness 300 / damping 18, overshooting briefly before it
  settles), icons pop in staggered as it opens, collapses back to
  the dock at `closeAt` (collapse clamped at dockH). Source:
  @jo_exist "Bouncy Sheet + Dock" reel
  (https://www.instagram.com/reel/Dc9kdvUzeOH/). Demo card +
  `spring-sheet` composition + Prompt Gallery entry. With this,
  the 2026-10-22 eve backlog is fully shipped; remaining backlog
  is `sliceWave` only.
- Not taken: 21st.dev / kokonutui / v0 / base44 / uxpilot are React/web
  component ecosystems — reference only for the site, never the lib
  (frame-pure, no DOM state). skill-issue.in noted for the skill
  package's design-skill shelf, separate track.

## Backlog — 2026-10-23 sweep (motion-graphics techniques, rotated queries)
- ~~`sliceWave`~~ — shipped in v0.63.0: horizontal-slice wave
  displacement of arbitrary HTML — content split into N horizontal
  strips, each strip shifted horizontally by a sine field inside a
  gaussian packet travelling with the wavefront (the packet form
  is what distinguishes it from slitScan's continuous field).
  Technique behind @sebv_tv's hand-drawn frame-by-frame wave feel
  (Sébastien Vincent, OneHealth Summit film breakdown — splitting
  precomps into slices and animating each slice's rotation for 3D
  wave motion, comments answered the technique patiently). Source:
  https://www.instagram.com/p/DaQL-XvAvrD/. Distinct from `waveLine`
  (a drawn wavy stroke) — this displaces content, not geometry.
  Demo card + `slice-wave` composition + Prompt Gallery entry.
  With this, every backlog in this file is shipped — the backlog
  is empty; the next round starts with a fresh research sweep
  (X + GitHub) before picking a build item, per the
  backlog-exhausted rule.
- Not taken this round: ~25 social results were all CapCut/AE
  text-reveal tutorials (text-in-footage masks, glow wipes, track
  mattes) — everything dedupes against the existing text kit
  (typewriter, drawText, maskReveal, wipeReveal, splitText,
  textOnPath, scramble, splitFlap). LAIKA's smear-frame promo
  dedupes against `smear`; @my_english_is_perfect_'s trippy loop
  pattern-combining dedupes against `patternField`. Web sweep
  returned workflow articles (HyperFrames vs Remotion, Opus 5.5
  director prompts) — no new transferable techniques.

## Backlog — 2026-10-27 sweep (stagger/choreography + GitHub skills)

Backlog was empty after sliceWave (v0.63.0); this round's fresh sweep
(social.search rotated queries + X-targeted web + GitHub skills) filed
one buildable primitive. Sources and dedup notes in
research/x-motion-sweep-log.md.

- ~~`letterTrack`~~ — shipped in v0.64.0: animated letter-spacing
  (tracking) reveal — a whole word's letter-spacing animates from a
  wide (or tight) value to its resting value as one unit, with
  opacity riding the same ease — the kinetic-type move behind
  Jitter's letter-spacing animation
  (https://www.instagram.com/reel/Db-6RmFlPJv/). Distinct from
  `splitText` (per-character staggered entrances) and from
  `drawText`'s static `letterSpacing` option (a set value, not an
  animation). With this, the backlog is empty again.
- Not taken this round: stagger-timing tutorials (LottieFiles,
  @webin20sec, @zozaqa_studio, @ginyboi) restate the shipped
  `stagger` primitive and the house stagger rule; pixel-morph
  carousel dedupes against `morphShape`/`pixelDissolve`.
- Skill leads, not implemented: LottieFiles/motion-design-skill
  (choreography patterns — future composition recipes),
  ANVEAI/motion-pack, PHANTOMTONYT/motion-design-skills,
  tecnomanu/motion-video-styles, bypshkn/emaki.

## Backlog — 2026-10-28 sweep (motion graphics techniques / GSAP tips / Remotion / isometric)

Backlog was empty after letterTrack (v0.64.0); this round's fresh
sweep (social.search rotated queries + X-targeted web sweep)
filed one buildable primitive. Sources and dedup notes in
research/x-motion-sweep-log.md.

- ~~`speedLines`~~ — shipped in v0.65.0: anime speed lines —
  thin streaks radiating from a point during a fast window, full
  burst at spread 360 or a narrow trailing cone via angle +
  spread (the "SPEED LINES" panel of @ersharium's fast-motion
  tutorial, https://www.instagram.com/reel/DdtyTzjIiTe/; distinct
  from smear/trail/burst, which are ghosts or particles, not
  streaks). With this, the backlog is empty again.
- Not taken this round: Remotion/AI-workflow reels (Claude-prompted
  motion graphics, terminal inserts, cinematic camera) are
  workflow, not transferable techniques; CC Ball Action dots dedupe
  against pixelDissolve/mosaic; PS1 pixelation dedupes against
  pixelDissolve; orbiting animations dedupe against orbit;
  text-on-curve dedupes against textOnPath; 2.5D camera wipes
  dedupe against parallax + wipeReveal; whip-pans dedupe against
  whip; liquid-blob merge (blur + choker) overlaps liquidMetal's
  liquid territory and stays a recipe, not a primitive.

## Backlog — 2026-10-29 sweep (animation breakdown / Lottie / kinetic typography / UI micro-interaction)

Backlog was empty after speedLines (v0.65.0); this round's fresh
sweep (social.search rotated queries + X-targeted web sweep)
filed one buildable primitive. Sources and dedup notes in
research/x-motion-sweep-log.md.

- ~~`waveText`~~ — shipped in v0.66.0 (released 2026-11-08):
  per-letter travelling sine wave over a typeset string — each
  glyph drifts on a sine field with a per-letter phase stagger,
  so the sentence itself ripples (the Cavalry kinetic-type piece
  where letters drift horizontally and coalesce into a sentence,
  https://www.instagram.com/reel/DX6Huhosym8/; distinct from
  splitText/assembleText which are entrances, from letterTrack's
  spacing animation, and from waveLine's drawn stroke). Demo card
  + `wave-text` composition + Prompt Gallery entry. With this,
  the backlog is empty again.
- Not taken this round: breakdown-pose / anticipation explainers
  restate the shipped `anticipate` primitive; multiplane
  compositing and train parallax dedupe against `parallax`;
  wind-matched camera shake dedupes against `shake`; smear-frame
  multiples and hatched blur lines dedupe against `smear` /
  `speedLines`; Lottie Do's & Don'ts restate the house stagger
  rule; loading-dot / nav-bar micro-interactions dedupe against
  `pulse` / `pop`; Lottie Creator blur/shadow/tint slides are
  tool effects, not a frame-pure primitive.

## Backlog — 2026-11-09 sweep (animation breakdown / Lottie / isometric / spring UI + web + GitHub skills)

Backlog was empty after waveText (v0.66.0); this round's fresh sweep
(social.search rotated queries + X-targeted web sweep + GitHub skills
sweep) filed one buildable primitive. Sources and dedup notes in
research/x-motion-sweep-log.md.

- ~~`chroma`~~ — shipped in v0.67.0: chromatic-aberration RGB fringe
  over wrapped HTML — the clean content stays centred while red and
  cyan channel ghosts drift apart along `angle`; `mode:'pulse'`
  rides a sine envelope over the window (a beat-locked fringe spike),
  `mode:'sustain'` holds a constant offset with a slow breathing
  wobble (a permanent grade). The Vox look's signature trick (Chris
  Moran's "What makes Vox animations look so clean?" breakdown,
  https://www.instagram.com/reel/DLQ4Wp9pqv3/), corroborated by the
  Remotion Motion Design skill's VFX pipeline (ChromaticAberration
  as a subtle grade) and the Claude-motion CapCut finishing pass
  ("chromatic edges with a mask"). Distinct from `glitch` (jagged
  slices + re-rolled jitter, a transition window): chroma is smooth,
  continuous and slice-free. Demo card + `chroma` composition +
  Prompt Gallery entry. With this, the backlog is empty again.
- Not taken this round: Kenson's "Animation Smears" taxonomy dedupes
  against squash/smear/trail/speedLines/glitch (its pixel-sorting
  panel needs pixel-buffer access, outside the HTML-string primitive
  model); LottieFiles' principles/rules carousels restate the
  shipped stagger/morphShape/parallax/kenBurns/pop/anticipate/
  followThrough set; LottieFiles State Machines is an interactive
  tool feature, not frame-pure; the fake-3D "joystick" is a parallax
  recipe; spring onboarding cards and the isometric loader are
  component recipes; 3D/live-action/traditional pieces are out of
  scope. Skill leads, not implemented: nexuslinkproductions
  Remotion Motion Design skill (AE-grade 3D engine incl.
  ChromaticAberration — the chroma corroboration), nessalazne/
  aisocialhub-motion-graphics-skills (4 direction skills:
  purposeful motion / shot cohesion / real demos / focus highlight).

## Backlog — 2026-11-10 sweep (GSAP tips / text animation / easing / Remotion / isometric / spring UI / Lottie + web + GitHub skills)

Backlog was empty after chroma (v0.67.0); this round's fresh sweep
(social.search rotated queries, 75 results + X-targeted web sweep +
GitHub skills sweep) filed two buildable primitives. Sources and dedup
notes in research/x-motion-sweep-log.md.

- ~~`shine`~~ — shipped in v0.68.0: one band of light travelling
  across wrapped HTML (linear-gradient band, transparent edges,
  bright core, screen-blended; `angle` steers the travel
  direction, `width` the band as a fraction of the span, `amount`
  its peak opacity). The classic logo/card shine sweep — Remotion's
  effects system lists `shine()` as a keyframed effect
  (https://www.instagram.com/reel/DZ47wmCinCV/). Distinct from
  `flash` (full-frame impact flash) and from `fx` (grain +
  vignette, no travelling highlight). Demo card + `shine`
  composition + Prompt Gallery entry. With this, the remaining
  backlog is `frost` / `blur` only.
- ~~`frost` / `blur`~~ — shipped in v0.69.0 as `frost`: animated
  CSS blur over wrapped HTML — content starts behind frosted glass
  and clears (or blurs out) over the window. Source: Remotion
  `blur()` in the same reel, corroborated by Magnific Move's "Focus
  Reveal" frosted-glass reveal
  (https://www.instagram.com/p/DfVKp0uiK8P/); the reel re-appeared
  in the 2026-11-11 sweep as further corroboration. Distinct from
  `whip`'s blur value and `smear`'s motion blur. Demo card +
  `frost` composition + Prompt Gallery entry. With this, the
  remaining backlog is `dominoReveal` only.
- Not taken this round: Claude/AI-workflow reels are workflow, not
  techniques; Codrops' GSAP tips dedupe (SplitText masking against
  splitText/maskReveal; stagger direction is a future `stagger`
  option, not a primitive; the rest is GSAP tooling); LottieFiles'
  5 principles and gradient rules dedupe against the shipped
  stagger/morphShape/parallax/kenBurns/pop set and meshBg;
  CameraMotionBlur needs pixel buffers (out of scope); Magnific's
  Tracking/HUD and Reality Split are footage work (out of scope),
  Paper Echo dedupes against trail. Skill leads, not implemented:
  emilkowalski/skills review-animations, iart-ai/web-animation-skills
  (53 skills, 16 packs, MIT), GSAP Skills (official — already noted
  2026-10-21), haidrrrry/claude-remotion-skill (already upstream in
  ~/workspace/tools/).

## Backlog — 2026-11-11 sweep (motion graphics techniques / animation breakdown / spring physics UI animation / isometric animation)

Backlog was empty after frost (v0.69.0) apart from this round's fresh
sweep (social.search rotated queries, 50 results). Sources and dedup
notes in research/x-motion-sweep-log.md.

- ~~`dominoReveal`~~ — shipped in v0.70.0: domino topple-chain
  reveal (see Implemented above). With this, the backlog is empty
  again.
- Not taken this round: Quentin Belluc's anchor-bottom rise / offset
  timing / Bend-Bulge breakdown against pop/fadeUp/stagger; Chris
  Moran's Vox layered textured backgrounds as composition craft
  (meshBg/patternField territory); @studio.baseline's
  one-movement-to-patterns carousel against patternField/stagger/
  marquee; trippy-loop pattern combining against patternField;
  @sonduckfilm's top-5 techniques — CC Ball Action dots against
  pixelDissolve/mosaic, trim-path strokes against drawOn, camera
  focus-distance DOF blur as a tool feature overlapping the frost
  build, orbiting rings against orbit; @motion_ui_interface's
  slow-mo UI micro-interactions (morph-don't-swap, float-don't-
  vanish, draw-fill-wake, drop-then-bounce, fly-into-bin,
  follow-then-return) as component recipes against morphShape/pop/
  springSheet/drop/squash; Aaron Blaise's gibbon-swing arcs and
  @ema_colombo's anticipation/squash/secondary-action breakdown
  against followThrough/anticipate/squash; @redxvfx_'s 3D-camera
  lyric parallax against camera/parallax; the 2.5D wipe against
  parallax + wipeReveal; Kenson's "Animation Smears" taxonomy
  against the shipped smear set; LottieFiles' 5 principles against
  the shipped set; Magnific Move's "Motion Trends" — Focus Reveal
  is the frost corroboration, the rest footage/3D/recipes; the
  isometric message-box loader and Figma Motion demos as recipes/
  tooling; GSAP/Anime/Motion.dev/React-Spring roundups as tooling.

## Backlog — 2026-11-13 sweep (motion graphics / kinetic typography / logo reveal / isometric + UI micro-interaction / spring UI / AE breakdown / parallax + web + GitHub skills)

Backlog was empty after dominoReveal (v0.70.0); this round's fresh
sweep (social.search rotated queries — output files unreadable this
run, see the sweep log — + X-targeted web sweep + GitHub/Remotion
skills sweep) filed one buildable primitive. Sources and dedup notes
in research/x-motion-sweep-log.md.

- ~~`iris`~~ — shipped in v0.71.0: circular-aperture reveal (see
  Implemented above). With this, the backlog is empty again.
- Not taken this round: the kinetic-typography skill's Slam/Reveal
  timing rules (director guidance; Slam overlaps pop +
  velocitySkew); Codrops' GSAP scroll kinetic typography (SlowMo
  hold + zoom + letter trails — scroll-driven, trail overlaps
  `trail`); Chorono's Claude-Code title card (fade-up + underline +
  arc circle — all shipped); Motion Fab's strip-word (alternating
  side strips with motion blur — overlaps `sliceWave`, stays a
  recipe), shape-morph outline interpolation (`morphShape`),
  chrome-ball-to-ink melt (3D/material, out of scope); CapCut's
  masked reveals / blur transitions / parallax / fake-3D camera
  (dedupe against maskReveal / frost / parallax / camera);
  Remotion's HTML-in-canvas shader presentations (zoomBlur /
  dreamyZoom / filmBurn / ripple / crosswarp — per-pixel blending
  behind a Chrome flag, outside the HTML-string primitive model);
  the rest of Remocn's 59 transitions (scene-pair or shader work,
  not single-content primitives).

## Backlog — 2026-11-14 sweep (animation breakdown / GSAP tips / easing curves / Remotion / Lottie / text animation + web + GitHub skills)

Backlog was empty after iris (v0.71.0); this round's fresh sweep
(social.search rotated queries, 100 results across 2 calls — the
output files were readable this round, unlike 2026-11-13 — +
X-targeted web sweep, which returned nothing for site:x.com, +
GitHub/Remotion skills sweep) filed three buildable primitives.
Sources and dedup notes in research/x-motion-sweep-log.md.

- ~~`dotText`~~ — shipped in v0.72.0: halftone dot-filled text (see
  Implemented above). With this, the remaining backlog is
  `clockWipe` / `textWarp` only.
- ~~`clockWipe`~~ — shipped in v0.73.0: radial clock-hand sector
  reveal (see Implemented above). With this, the remaining backlog
  is `textWarp` only.
- ~~`textWarp`~~ — shipped in v0.74.0: field-warped kinetic type
  (see Implemented above). With this, the 2026-11-14 sweep backlog
  is fully shipped.
- Not taken this round: ~10 easing-curve explainers restate the
  shipped `fn` system (Adobevideo's "Niche Easing Curves" are named
  personas of shipped easings; "Buffering" stutter against
  `stepped`); Claude/ChatGPT + Remotion workflow reels are workflow,
  not techniques; LottieFiles' 5 principles re-appear, deduped;
  Mat Voyce's kinetic-type retrospective dedupes piece by piece
  (Inflate → squash/pop, MUTATE flashes / ZERO ENERGY cycling →
  chroma/glitch, HOPE→NOPE morph → morphShape+orbit, DAMN stretch
  → squash, NOW! scale+shadow → pop; MIRROR 3-D distortion out of
  scope); Figma Motion carousel — glitch letters → glitch/chroma,
  inflatable blobs / glossy 3-D Stretch are 3-D tooling, star→flower
  morph → morphShape, liquid-metal WOW → liquidMetal, circle-packing
  is a layout, F-logo assembly → assembleText; @synthymental's
  text-into-flower silhouette is a maskReveal recipe and its
  text-filled "BOO" is a text-fill variant of the dotText family,
  not filed separately; @kiel.d.m V.BOOST/V.SPIN 3-D extrusions are
  generator tooling, out of scope; "NEVER STOP CREATING" —
  word-multiply → marquee, STOP tunnel stays a kenBurns+marquee
  recipe, glitch STOP → glitch/chroma; "Cheesy 80s Zooms" —
  slide/stretch/inflate/flip/zoom/outline all shipped; browser→
  phone→icons morph → morphShape; 3-D planes + virtual camera →
  camera/parallax; parallax scroll → parallax; OLA / CRUX /
  vasilskakun logo reveals → spotlight/assembleText; AE Text
  Animator kinetic type, the Blender kinetic-typography addon and
  GSAP Timed Cards are tooling / component recipes; pop-up text →
  pop/splitText; pendulum reveal → swing; rotating phrases →
  marquee; sepia photo separation is footage work; Remotion's
  HTML-in-canvas shader presentations re-affirmed out of scope;
  Remocn's remaining transitions are scene-pair or shader work;
  @remotion/effects `venetianBlinds` not filed (slat rotation
  overlaps sliceWave's strip machinery — a possible future variant);
  React Bits react-animation — ShinyText → shine, GlitchText →
  glitch, BlurText → frost, DecryptedText → scramble, TextType →
  typewriter, GradientText is a fill style not motion, LetterGlitch
  → glitch, LightRays is background craft (meshBg territory).
  Skill leads, not implemented: remotion-dev/skills (official,
  already noted), nexuslinkproductions Remotion Motion Design
  (already noted 2026-11-10).

## Backlog — 2026-11-16 sweep (motion graphics techniques / kinetic typography / isometric / spring UI + animation breakdown / text warp / Remotion / easing)

Backlog was empty after textWarp shipped (v0.74.0); this round's fresh
sweep (social.search rotated queries, 100 results across 2 calls) filed
two buildable primitives. Sources and dedup notes in
research/x-motion-sweep-log.md.

- ~~`edgeBoil`~~ — shipped in v0.75.0: organic "boiling" outline
  wobble (see Implemented above). The 2026-11-17 sweep corroborated
  it (see below) and fixed the default step at 4 frames from
  @jejestudios' 8-swaps-a-second rate. With this, the remaining
  backlog is `varFont` only.
- ~~`varFont`~~ — shipped in v0.76.0: variable-font kinetic type
  (see Implemented above). The renderer caveat is closed by
  vendoring Roboto Flex at site/fonts/RobotoFlex-var.woff2 — the
  stock system fonts carry no variable font (verified 2026-11-18
  with fc-list + fontTools: wght 100–1000 / wdth 25–151). With
  this, the backlog is empty again.
- Not taken this round: @ginyboi's top-5 transitions and @sonduckfilm's
  top five re-appear, all shipped; @antonin.work's Frutiger digit-grid
  kinetic type dedupes against charGrid; @motiongraphictv's 'BALANCE'
  warping is a further textWarp corroboration; @holke79's blobby
  letterforms against morphShape; @kiel.d.m's STG V.SPIN / V.BOOST are
  3-D extrusion generator tooling, out of scope; Figma Motion carousel,
  Kenson's "Animation Smears", LottieFiles' principles carousels and the
  easing explainers all re-appear, deduped; the 'Animation Breakdown'
  reels (traditional pipeline craft) and the dance/VFX footage reels are
  out of scope; @sophuia's 10 UX animations are component recipes;
  @matt_penny_applied_ai's skill-level reel re-appears (domino panel
  already shipped, the rest are recipes / 3-D).

## Backlog — 2026-11-17 sweep (boiling line / hand-drawn wobble / variable font / SVG turbulence / grain + seamless loops / kinetic typography / logo reveal / isometric)

Backlog was `edgeBoil` / `varFont` after textWarp shipped (v0.74.0);
this round's fresh sweep (social.search rotated queries, ~100
results across 2 calls) filed 0 new buildable primitives — it
corroborated the already-filed `edgeBoil` instead of finding a new
one. Sources and dedup notes in research/x-motion-sweep-log.md.

- `edgeBoil` corroboration (shipped this round, v0.75.0):
  @jejestudios' "line boil" — every outline redrawn three ways and
  swapped eight times per second, mimicking old cartoons
  (https://www.instagram.com/reel/DemHJJmNEb5/) — the 8-swaps/sec
  rate sets the default `step` at 4 frames (30 fps);
  @sewellkillingstad's hand-traced line-boil type animation
  (https://www.instagram.com/reel/DVwRHnAjh0g/); the AE Turbulent
  Displace ×2 hand-drawn look
  (https://www.instagram.com/reel/DFYLGJsNmm_/); the Vox
  hand-drawn jitter/boil tutorial
  (https://www.instagram.com/reel/Dez2EqWorHx/); @osweltos'
  "SQUIGGLY LINE EFFECT" three-methods graphic
  (https://www.instagram.com/reel/Ddf1JqKhYXq/); Blender Grease
  Pencil Noise modifier as the same idea in 3-D
  (https://www.facebook.com/reel/1781056572604889/); the "on twos"
  12-fps fake-hand-drawn look
  (https://www.instagram.com/reel/DfrzCfrjq0u/) restates the
  shipped `onTwos`.
- Not taken this round: "How to make TRIPPY LOOPS vol.2"
  (https://www.instagram.com/reel/DbvAHTdNSwa/) pattern-combining
  dedupes against `patternField`; the letter-spacing three-step
  tutorial (MINNESOTA spreading apart,
  https://www.instagram.com/reel/DcOiUieJf8S/) dedupes against the
  shipped `letterTrack`; the 4-drawing seamless loop
  (https://www.instagram.com/reel/DYr4W5tuNPw/) and the ceiling-panel
  loop tutorial (https://www.instagram.com/reel/DdcD6qqgVEL/) are
  loop craft, not a primitive; LottieFiles' 5 rules
  (https://www.instagram.com/p/DQwZNBQD9y5/) re-appear, deduped;
  @yune75's Wave Warp showcase
  (https://www.facebook.com/reel/969024968876400/) overlaps
  `sliceWave` / `waveText`; the 'liquid appear' logo reveal
  (https://www.facebook.com/reel/1785101602799720/) dedupes against
  `liquidMetal` / `maskReveal`; @motiongraphictv's 'BALANCE'
  warping (https://www.instagram.com/reel/DDXbHHDIzyx/) is a further
  textWarp corroboration; logo-reveal breakdowns (Beyond Pictures,
  https://www.instagram.com/reel/DctDAgYzZVH/; vasilskakun,
  https://www.instagram.com/reel/Dd_dsCfB2k-/; the ST monogram,
  https://www.instagram.com/reel/DMXdObHSuOV/) dedupe against
  `spotlight` / `assembleText`; the isometric eStrude build
  (https://www.instagram.com/p/DQMa7E4kQiE/) and the isometric
  message-box loader (https://www.instagram.com/reel/DbBMsAgt7uT/)
  dedupe against the shipped iso kit; @holke79's kinetic-type
  carousel (https://www.instagram.com/p/DFIxZzhtW3e/) is textWarp /
  waveText territory; the A4 Kinetic Grid System
  (https://www.instagram.com/reel/DbdhuwlJ1Wg/) is layout craft;
  3-D loops, claymation, puppet and Blender breakdowns are footage /
  3-D tooling, out of scope.

## Backlog — 2026-11-18 sweep (variable font animation / kinetic type + spring physics UI animation / GSAP tips / text animation breakdown / logo reveal)

Backlog was `varFont` only after edgeBoil shipped (v0.75.0); this
round's fresh sweep (social.search rotated queries, ~100 results
across 2 calls) filed 0 new buildable primitives — it re-surfaced
the already-filed `varFont` source itself plus fresh corroboration.
Sources and dedup notes in research/x-motion-sweep-log.md.

- `varFont` corroboration (shipped this round, v0.76.0):
  @joshschaub.ch's "KineticType" — Variable Font Axes (Weight,
  Width, Italic) driven by Math.sin(time + textIndex) * 50 + 50,
  font 'lazer x compressed'
  (https://www.instagram.com/reel/DVN0yNWjTnW/); Monotype's
  Weight/Width slider demo cycling TIMELESS / VARIABLE / MODERN
  (https://www.instagram.com/reel/DZXova8FHdd/); Google Design's
  variable-fonts promo (ROBOT → ROBOTO); an Inter Variable
  weight-slider screen recording; @antonin.work's Font Merge
  variable-font tool (https://www.instagram.com/p/DerZbMtDHce/,
  tooling, out of scope); Studio Feixen's MOV Variable specimen
  (Cavalry-made typeface promo).
- Not taken this round: Figma Motion physics springs + Lottie
  export previews (https://www.instagram.com/reel/DfkZHadvRNw/,
  tooling); @walaber_ent's Godot spring blend-shapes (game
  engine, out of scope); LottieFiles Spring Curve / Physics
  Simulator (tooling); react-spring promo (a library, not a
  primitive); OriginOS 6 spring suite (OS UI, out of scope);
  @jermy.builds' 'Motion, Explained' spring explainer (director
  guidance, restates shipped pop / anticipate / springSheet);
  @sophuia's 10 UX animations (component recipes); LottieFiles'
  5 principles of ANIMATION TIMING (re-appears, deduped);
  'Cheesy 80s Zooms' (re-appears, all shipped); Adhemas
  'Do All Good' (the dotText source, re-appears). With this, the
  backlog is empty again.

## Backlog — 2026-11-19 sweep (motion graphics techniques / kinetic typography / text reveal / logo reveal + Remotion / spring UI / isometric / easing + web + GitHub skills)

Backlog was empty after varFont (v0.76.0); this round's fresh sweep
(social.search rotated queries, ~95 results across 2 calls, + a
Remotion @remotion/effects web sweep) filed four buildable
primitives. Sources and dedup notes in
research/x-motion-sweep-log.md.

- ~~`tvOff`~~ — shipped in v0.77.0: CRT power-off/on (see
  Implemented above). With this, the remaining backlog is
  `shatter` / `flicker`.
- ~~`venetianBlinds`~~ — shipped in v0.78.0: classic blinds
  transition (see Implemented above). With this, the remaining
  backlog is `shatter` / `flicker`.
- ~~`shatter`~~ — shipped in v0.79.0: the wrapped content breaks
  into tiles that fling outward with rotation under gravity and
  fade (negative strength implodes instead); square / bricks /
  triangle patterns, pattern origin and force centre separate (see
  Implemented above). With this, the remaining backlog is
  `flicker` only.
- ~~`flicker`~~ — shipped in v0.80.0: neon-sign flicker-on (see
  Implemented above). With this, the backlog is empty again.
- Not taken this round: @ginyboi's top-5 transitions re-appear
  (Hyperspace → speedLines, Gradient wipe → wipeReveal, the rest
  shipped); @sonduckfilm's documentary 3-D camera + DOF →
  camera/parallax; @yune75's Wave Warp / Bend →
  sliceWave/waveText; @em0n33y puppet compositing is footage
  craft; @sophuia's 10 UX animations re-appear (card flip →
  flipIn, number ticker → counterRoll, the rest component
  recipes); mirror-mask text reveals → maskReveal/wipeReveal; CC
  Light Sweep text → shine; Remocn's Paper Wobble → edgeBoil,
  Scribble Circle / Ink Arrow → drawOn/highlightBox, Glass Lens
  needs pixel magnification (out of scope), Keystroke / Cursor
  Gravity are component recipes; Remocn graphic looks — Riso
  Print (chroma-adjacent), Long Shadow, Frosted Clear → frost,
  LED Ticker → marquee, X-Ray Scan → wipeReveal+shine, Duotone
  Beat → dotText; Circuitry's scanlines/crt/dither/led/heatHaze
  are per-pixel grades, outside the HTML-string model; Remotion
  `curves()` is a colour grade, not motion; easing-curve
  explainers restate the shipped `fn` system; LottieFiles /
  Figma Motion / Claude+Remotion workflow reels are workflow or
  tooling.

## Backlog — 2026-11-22 sweep (neon flicker / kinetic typography / GSAP tips / Lottie + spring UI / isometric / motion graphics / Remotion)

Backlog was `flicker` only after shatter shipped (v0.79.0); this
round's fresh sweep (social.search rotated queries, ~91 results
across 2 calls) filed 0 new buildable primitives — it
re-corroborated the already-filed `flicker` instead of finding a
new one. Sources and dedup notes in
research/x-motion-sweep-log.md.

- `flicker` corroboration (shipped this round, v0.80.0):
  @rexadewa's six AE opacity expressions for neon flicker
  (https://www.instagram.com/reel/DZei5e-sReB/) — SMOOTH
  wiggle(2,50), BROKEN NEON wiggle(10,50,4,0.8), GLITCHY
  wiggle(5,20,2,1.2), CANDLELIGHT wiggle(5,15,3,0.2), ALARM
  |sin(time*3)|, BLINKING cos(time*8)>0.5 — the six-register
  taxonomy behind flicker's modes; @aniakubow's white-hot-core
  neon (https://www.instagram.com/reel/DePTsnVKv3I/ — white text
  + 4/12/28/60px layered text-shadows in #ff2e88) sets the glow
  rendering; @thestudiodsign's Figma OPEN sign
  (https://www.instagram.com/reel/DemfPXOhkH/ — Off→On→Off→On
  at 60/90/60ms, one tired letter looping) sets the startup slot
  length; @manueldoesmotion's posterizeTime(8)+seedRandom
  flicker (https://www.instagram.com/reel/DO_BGVyjOhJ/),
  @Noyse's wiggle(15,100) outer-glow flicker
  (https://www.facebook.com/reel/1323083419357180/), @ketutedit's
  FLICKER NEON expression
  (https://www.instagram.com/reel/Dc_PAiUTZMf/), @graffinity3d's
  Blender Noise F-Curve neon
  (https://www.instagram.com/reel/DD2H0tYJQMs/), @RaiyanShuv0's
  "Flicker Loop" AE preset
  (https://www.facebook.com/reel/1397401482513874/).
- Not taken this round: Canva neon tutorials (tooling); 3ds
  Max / Unreal / Blender neon (3-D tooling); spring/UI
  roundups — Figma Motion spring updates, @jermy.builds'
  'Motion, Explained' spring cheat sheet (Snappy 400/30, Smooth
  170/26, Playful 180/9), @kabarza elastic toggles, OriginOS 6
  spring suite, @codewithayansh spring pagination — all tooling /
  component recipes or director guidance restating shipped
  pop / springSheet / anticipate; @josephhaddad's 'Hidden Math'
  fluids explainer (animate physics not time, squircle,
  rubber-banding) is director guidance; @settigation's
  liquid-metal login split dedupes against liquidMetal; library
  roundups (GSAP / Anime / Motion / React-Spring) are tooling.
  With this, the backlog is empty again.

## Backlog — 2026-11-23 sweep (motion graphics techniques / logo reveal / kinetic typography / text reveal + Remotion / spring UI / isometric / easing + web + GitHub skills)

Backlog was empty after flicker (v0.80.0); this round's fresh sweep
(social.search rotated queries, ~100 results across 2 calls, + a web
sweep of the Hyperautomation Labs 20-repo Claude motion roundup +
GitHub skills sweep) filed two buildable primitives. Sources and
dedup notes in research/x-motion-sweep-log.md.

- ~~`echo`~~ — shipped in v0.81.0: AE Echo-style ghost stack over
  wrapped HTML (see Implemented above). With this, the remaining
  backlog is `fisheye` only.
- ~~`fisheye`~~ — shipped in v0.82.0: radial lens distortion over
  wrapped HTML (see Implemented above). The research spike the
  entry called for is done in the same round — feDisplacementMap
  with a procedurally generated radial PNG map, verified in
  headless Chrome before building. With this, the backlog is empty
  again.
- Not taken this round: @sonduckfilm's top-5 techniques re-appear
  (CC Ball Action dots → pixelDissolve/mosaic, trim-path strokes →
  drawOn, DOF focus distance → frost, orbiting ring → orbit,
  auto-orient → pathFly heading); Quentin Belluc's town breakdown
  re-appears (anchor-bottom rise / offset timing / Bend-Bulge, the
  jelly deformation is pixel warp, out of scope); @motionbydk's grid
  text-reveal (converging grid squares as a track matte →
  maskReveal/wipeReveal/pixelDissolve); @cheersjack's squeezy-type
  carousel (variable-metric type play → varFont, the cycling central
  word is a splitText/marquee recipe); Chris Moran's Vox layered
  textured backgrounds (composition craft, meshBg/patternField
  territory); @tsgoodlaz's Moho breakdown (rigging/hold-frame craft,
  out of scope); @matt_penny_applied_ai's '9 Claude Animation styles'
  re-appears (style prompts, not primitives; domino already shipped);
  easing explainers (@farees.shaikh, @kujma.9, @studio.baseline,
  Adobe 'Niche Easing Curves', DaVinci spline) restate the shipped
  `fn` system; Omni Flash / Google Flow logo reveals are AI video-gen
  workflows; LottieFiles' 5 principles re-appear, deduped;
  Claude/Remotion workflow reels are workflow, not techniques.
  Skill leads, not implemented: Hyperautomation Labs' 20-repo Claude
  motion roundup (tested 2026-11-14 — anatomy-reveal, three.quarks,
  react-postprocessing, librosa, WhisperX; no new frame-pure
  primitive), getkeyframes' 6 video skills, vanja.io's motion-graphics
  craft article (Remotion/HyperFrames/claude-motion already noted).

## Backlog — 2026-11-24 sweep (fisheye lens distortion / radial distortion / SVG displacement map + text animation breakdown / isometric animation / spring physics UI animation)

Backlog was `fisheye` only after echo shipped (v0.81.0); this
round's fresh sweep (social.search rotated queries, ~96 results
across 2 calls) filed 0 new buildable primitives — it
corroborated the already-filed `fisheye` instead of finding a new
one. Sources and dedup notes in research/x-motion-sweep-log.md.

- `fisheye` corroboration (shipped this round, v0.82.0):
  @motion.easyy's AE "Fish Eye" text effect — text warped onto a
  rotating sphere via Warp set to FishEye (Horizontal Distortion
  100) plus Optics Compensation at FOV 100
  (https://www.instagram.com/reel/Dcdsbn4tmqs/); @janek_crtv's
  fisheye text animation ("JUST DO IT" morphing into a phrase,
  https://www.instagram.com/reel/DGTZcCTKhw4/); @deyfilmit's
  Premiere Pro Lens Distortion fisheye tutorial
  (https://www.instagram.com/p/De8_QP8GRq0/); @samivart1's
  Paparazzi Animation Trend (IbisPaintX Transform > Fisheye Lens,
  https://www.facebook.com/reel/1524732072177171/);
  @kirill.blokhin_'s UIKit fisheye lens experiment — a translucent
  distorting lens over an icon pattern
  (https://www.threads.com/@kirill.blokhin_/post/DfX0pk7DdBo);
  @paper.design's Lens Distortion shader showcase
  (https://www.instagram.com/reel/Dcg80aYzYJt/).
- Not taken this round: kinetic-typography re-appears — Mat Voyce's
  16-loop retrospective and 2020 practice retrospective dedupe
  piece by piece against the shipped text kit; @kiel.d.m's STG
  V.EXPOGRID / V.BOOST against textWarp; @antonin.work's date-block
  kinetic type against charGrid; @motiongraphictv's 'BALANCE'
  warping against textWarp; Peter Quinn's 'Cheesy 80s Zooms'
  re-appears, all shipped; @cheersjack's 'Find a why' scattered
  words against splitText/marquee recipes; LottieFiles' typography
  rules are design guidance, not motion; @isometricked's ISOMETRICK
  line-work loop against the iso kit; CapCut kinetic-type tutorials
  against splitText/pop; Figma Motion's pixel-dot letters
  re-appear (the dotText source); the 'LENS DISTORTED VAPOR
  EFFECT' heat-haze word against sliceWave/chroma; Sony/Canon
  fisheye-lens promos are hardware marketing, not techniques;
  Blender/Maya fisheye camera tutorials are 3-D tooling;
  Premiere/InVideo fisheye how-tos are tooling for the filed
  fisheye itself. With this, the backlog is empty again.
