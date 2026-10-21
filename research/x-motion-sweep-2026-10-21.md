# Motion Technique Sweep — 2026-10-21

Research sweep for new motion-primitives candidates, deduped against the
58 shipped functions and the existing EFFECTS.md backlog (orbit, swing,
marquee, marchingAnts, highlightBox, waveLine, spotlight, isoWedge,
isoPipe). Only techniques actually seen in search results are listed;
engagement numbers are the values shown on the result pages at sweep
time (2026-10-21 CST).

## Coverage note (read first)

`social.search` indexes Instagram / Threads / Facebook — **it does not
index X**. Four additional X-targeted `browser.search` queries were run,
but they mostly surfaced blogs, Thread Reader mirrors, and YouTube, not
x.com originals. So this corpus is mostly same-topic IG/Threads/FB posts,
plus one genuine X thread recovered via its Thread Reader mirror
(candidate 10). Treat "X coverage" as partial, not exhaustive.

## Queries used

social.search (4 batches, 12 queries):

1. "motion graphics techniques" / "animation breakdown tutorial" / "motion design process breakdown" (49 results)
2. "GSAP animation tips" / "spring physics animation UI" / "easing animation curves tutorial" (48 results)
3. "Remotion video code" / "text animation effect tutorial" / "Lottie animation technique" (43 results — almost entirely Claude+Remotion workflow promos, no new primitives)
4. "isometric animation tutorial" / "kinetic typography technique" / "SVG line animation draw effect" (49 results)

browser.search (X-targeted):

- "motion design animation thread technique threadreaderapp"
- "\"x.com\" motion designer shares animation tips easing anticipation follow through post"
- plus two earlier X-directed variants that returned mostly blogs/YouTube

Queries with nothing useful: "Remotion video code" and "Lottie
animation technique" returned workflow/tooling promos only — no
implementable technique not already in the library.

---

## New candidates (11)

### 1. `maskReveal` — shape-aperture scene reveal

**Spec:** Inputs: outgoing content, incoming content, an aperture shape
(circle / rounded rect / arbitrary SVG path), aperture keyframe path,
duration. Behavior: the incoming scene is visible only through a hole
cut in the outgoing scene; the hole travels/grows along its keyframes
(the classic "next scene appears through a hole in an object" A-to-B
mask). Frame-pure: the mask is a pure function of frame — implement as
an SVG `<mask>` or CSS `clip-path: path()` whose geometry is computed
per frame; both scenes are static layers, only the aperture moves.
Distinct from `wipeReveal` (directional straight-edge clip) and `whip`
(whole-scene translation): this is a *shaped, travelling* aperture.

**Source:** Gin Lee (@ginyboi), "top 5 transitions for motion designers"
— A-to-B Masking is #4. https://www.instagram.com/reel/DVR92iPjRIw/
**Engagement:** 33K likes, 90 comments (author 410K followers).

### 2. `matchCut` — match-cut transition preset

**Spec:** Inputs: outgoing element, incoming element, shared anchor
point/scale. Behavior: both elements ease toward 80% of their travel
with a 1:2 timing ratio (the poster's "golden match-cut ratio"), the cut
happens at the moment of matched position/scale/velocity, so two
different objects read as one continuous motion. Frame-pure: it's a
timing/easing recipe over two transform tracks — a small helper that,
given two elements and a cut frame, returns both elements' transforms
for any frame. The library has transitions (`scene`, `transition`,
`whip`) but no preset encoding this specific 80% + 1:2 rule.

**Source:** Gin Lee (@ginyboi), same countdown — Match-cut is #1, and
commenters singled out the 1:2 ratio tip as the most useful item.
https://www.instagram.com/reel/DVR92iPjRIw/
**Engagement:** 33K likes, 90 comments.

### 3. `inertia` — momentum glide with exponential decay

**Spec:** Inputs: start position, initial velocity v0, decay constant
k. Behavior: position follows the closed form
x(t) = x0 + v0·(1 − e^(−k·t))/k — a fast launch that asymptotically
settles, the GSAP InertiaPlugin feel. Frame-pure by construction: it's
a closed-form function of frame, no integration state needed. Distinct
from `fly`/`travel` (keyframe-to-keyframe) and from spring easings in
`ease`: those are normalised 0→1 curves between fixed endpoints; this
one is velocity-driven with a free endpoint distance = v0/k, which is
what "throw/flick" content (sliders, cards tossed off) needs.

**Source:** @webflow (with Offbrand Studio), GSAP Inertia Slider in a
free template post. https://www.instagram.com/reel/DJcN_jxIADy/
**Engagement:** 530 likes, 14 comments (posted 2025-05-09).

### 4. `pixelDissolve` — pixelation transition

**Spec:** Inputs: two scenes (or one scene + solid), cell size range,
duration, seed. Behavior: the frame is divided into a coarse grid; each
cell flips from scene A to scene B at a per-cell delay from `hash(cell,
seed)`, while the cell size itself swells mid-transition (chunky
mosaic at the midpoint, fine at both ends). Frame-pure: per-cell state
is a pure function of (frame, cell index, seed) — render as an SVG
`<pattern>`/rect grid or a CSS-grid of divs over the two layers.
Distinct from `glitch` (RGB-split slice offsets, corruption aesthetic):
this is an orderly mosaic crossfade usable as a clean scene transition.

**Source:** @webflow, GSAP pixelated page transition demo.
https://www.instagram.com/reel/DEN49RgC__c/
**Engagement:** 350 likes, 5 comments (posted 2024-12-30).

### 5. `charGrid` — living character-grid field

**Spec:** Inputs: grid dimensions, glyph set (e.g. digits 0–9), palette,
phase speed. Behavior: a dense grid of glyphs where each cell's glyph
and color cycle with a per-cell phase from `hash(cell)` plus frame —
a shimmering "data wall" ambience layer. Frame-pure: cell state =
f(frame, cell index) only; render as a monospace text grid or SVG
`<text>` elements. Nothing in the library generates a procedural
*glyph* field — `particleField` moves particles through space, this is
a fixed lattice whose *contents* animate; it doubles as a background
texture for data/tech scenes.

**Source:** Antonin Waterkeyn (@antonin.work), digit-grid loop.
https://www.instagram.com/reel/DYOpylqsP-u/
**Engagement:** 13K likes.

### 6. `assembleText` — glyphs converge into text (and disperse)

**Spec:** Inputs: target string, scatter radius/field, duration,
per-glyph delay. Behavior: each glyph starts at a scattered position
(hash-derived offset/rotation) and flies to its typeset slot, so a
sentence *materialises* out of drifting letters; reversed, a text block
dissolves into a silhouette or disperses. Frame-pure: glyph i's
position = lerp(scatter_i, slot_i, ease(local frame)) with `hash(i)`
scatter — same purity pattern as `confetti`. Distinct from `splitText`
(glyphs reveal in place with stagger, no travel): here the travel *is*
the effect. A second post from the same author shows text blocks
forming/dissolving into silhouettes, which the reversed mode covers.

**Source:** Antonin Waterkeyn (@antonin.work).
https://www.instagram.com/reel/DX6Huhosym8/ (converge-into-sentence);
also https://www.instagram.com/reel/DX8j78TMkxM/ (blocks form/dissolve
silhouettes).
**Engagement:** 28K likes; second post 5.1K likes.

### 7. `textOnPath` — text laid along a path, flowing

**Spec:** Inputs: string, SVG path, offset speed, per-glyph orientation
mode. Behavior: glyphs are placed along the path by arc length (SVG
`<textPath>` semantics, computed manually so it stays deterministic),
each glyph tangent-rotated; a frame-driven offset makes the whole
string flow along the curve, optionally spiralling. Frame-pure: glyph
positions are closed-form in (path, offset(frame)). Distinct from
`pathFly` (moves one element along a path) and `drawText` (stroke
draw-on): this typesets a *whole string* along the curve — kinetic-type
titles, circular badges, credits crawls on a curve.

**Source:** @holke79, kinetic typography carousel (glyphs flowing
along an S-path + spiral rotation).
https://www.instagram.com/p/Ddl8woUjf_M/
**Engagement:** 310 likes.

### 8. `isoTerrain` — isometric pillar field driven by a focus point

**Spec:** Inputs: grid size, unit (reuse the iso kit's projection),
focus path (keyframed point), radius, height range. Behavior: an
isometric field of pillars whose heights are a function of distance to
a moving focus — terrain that rises around the focus like the Hairline
library's "Terrain" piece ("pillars that rise around the cursor";
sibling piece "Riffle": cards that stand up as the focus passes).
Frame-pure: pillar height = f(distance(cell, focus(frame))) — the
cursor is replaced by a scripted focus path, exactly the record/iso
pattern this library already uses. Plugs straight into `isoBox` /
`isoSort` (v0.26 iso core): each pillar is an isoBox with animated h,
painted in isoSort order. Highest synergy of this sweep — it turns the
new iso geometry into living scenes (data landscapes, equaliser
cities, map reveals).

**Source:** Hairline library (github.com/lucasmarkes/hairline), shown
by @repo.creative on Threads:
https://www.threads.com/@repo.creative/post/DeR3E0-DqCH (no like count
shown); walkthrough by @aiadventureryt:
https://www.instagram.com/reel/DeMbYQAMsV1/
**Engagement:** 2.7K likes (walkthrough post).

### 9. `patternField` — seamless tiling pattern layer

**Spec:** Inputs: one small animated tile element, tile size, field
size. Behavior: the tile is repeated in a grid with per-tile phase
offsets so the whole field reads as one endless, seamlessly looping
pattern (the post's point: a single tiny animation becomes an infinite
pattern). Frame-pure: tile phase = f(frame, tile index); seamlessness
is guaranteed by construction when the tile's own loop is periodic and
translations wrap modulo tile size — same wrap trick `marquee` needs,
but 2-D and pattern-oriented. The library has no tiling/pattern
generator; `meshBg` is a gradient mesh, not a repeated-motif field.
Useful as animated wallpaper/backdrop for title cards.

**Source:** Melanie (@studio.baseline), tutorial carousel on turning
one tiny animation into an endless seamless pattern.
https://www.instagram.com/p/Dcv70PiCNfM/
**Engagement:** 1.8K likes.

### 10. `slitScan` — slit-scan / streak time displacement

**Spec:** Inputs: content drawn in horizontal (or vertical) bands,
band count, displacement wave (amplitude/phase over frame), direction.
Behavior: each band renders the scene with a different time/space
offset — band b is shifted by A·sin(phase + b·k) — producing the
classic slit-scan/streak warp (the technique behind the 1978
*Superman* titles): drawn shapes smear into flowing, wavy trails
instead of moving rigidly. Frame-pure in this library's terms when the
content is generated per band (bars, shapes, text lines drawn by the
library's own primitives): each band's offset is closed-form in
(frame, band index). Distinct from `smear` (velocity blur on one
moving element) and `glitch` (random hard slice jumps + RGB split):
this is a smooth, continuous, whole-scene time warp. This is the one
genuine X find of the sweep — a long practitioner thread on
scan-streak/slit-scan mechanics (head/tail channels, per-axis streaks).

**Source:** @CcampFx, X thread "Streaks and Slitscans" (via Thread
Reader mirror): https://threadreaderapp.com/thread/1259914097921085440.html
**Engagement:** not shown in search results.

### 11. `followThrough` — declarative secondary-motion lag

**Spec:** Inputs: a leader's per-frame transform (or keyframes),
follower elements, lag in frames, overshoot amount. Behavior: each
follower replays the leader's motion delayed by its lag and with a
small settle overshoot — hair/labels/shadows that keep moving after
the body stops (the demo's FOLLOW-THROUGH knob, alongside
ANTICIPATION). Frame-pure if the leader's motion is itself a pure
function: follower transform at frame f = leader(f − lag) plus a
decaying spring tail, all closed-form. The library can fake this by
hand with `stagger` delays, but has no helper that *derives* secondary
motion from a leader track. Caveat: the source demo is the OPUS 5.5
Motion Design Lab already studied via @flxrnc — the six-knobs framing
is not new; only this concrete primitive packaging is. Rank last.

**Source:** OPUS 5.5 Motion Design Lab demo (Facebook reel).
https://www.facebook.com/reel/1803347827479920/
**Engagement:** 2 likes.

---

## Also seen, not actionable

- Otsu Animation's 4-step morph breakdown (Facebook) — morphing already covered by `morphShape` / `morphPoly`.
- @em0n33y on first-3-seconds "pattern interruption" (IG, 180K likes) — content/packaging advice, not an implementable primitive.
- @laikastudios smear-frame showcase (IG, 310K likes) — `smear` already shipped.
- @tubexmotion Trim Path tutorial (IG, 9.3K likes) — `drawOn` already shipped.
- GSAP easing-curve infographics (multiple) — `ease` already shipped.
- @sarafatul_rabby "90% restraint" + stagger/counter tips (Threads) — all already in the library.
- @devbymansi Timed Cards Showcase (IG, 5.1K likes) — a `stagger` composition, no new primitive.
- @animmaster_studio scroll-triggered text fill (IG, 270 likes) — scroll input doesn't exist in frame-pure video; nearest equivalent is a `wipeReveal` variant, too close to propose.
- @goro.fujita isometric production shortcuts (Threads, 17 likes) — experience notes, no spec; the iso line is already underway.
- @Lowtwait thread on camera-tilt background design (Thread Reader) — staging advice; the implementable part is covered by `camera` / `parallax`.
- The entire "Remotion video code" result batch — Claude+Remotion workflow promos, no techniques.
