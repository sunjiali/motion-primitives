# motion-primitives API — the full catalog (65 functions)

Generated from `index.d.ts` by `scripts/gen-api-doc.mjs` — do not
edit by hand. All functions hang off `window.Motion` (alias `M`)
in compositions, and off the package export in Node. Unless noted,
`frame` is the current frame and `o` is the options bag; `at` /
`dur` / `fn` (easing name) recur everywhere via `AtOpts`.

## Timing & math

### `pop`

```ts
M.pop(frame: number, o?: AtOpts & { from?: number }): number
```

Springy scale-in with physical overshoot. Returns a scale factor.

### `ease`

```ts
M.ease(frame: number, o?: AtOpts & { ease?: string }): number
```

Generic eased progress helper. Returns 0..1 (eased).

### `hash`

```ts
M.hash(n: number): number
```

Deterministic 0..1 hash of an integer (seeded randomness that never changes).

### `stagger`

```ts
M.stagger(i: number, o?: { at?: number; gap?: number }): number
```

Start-frame helper for staggered groups.

### `pulse`

```ts
M.pulse(frame: number, o?: { amp?: number; speed?: number }): number
```

Breathing scale for "look here" targets. Returns a scale factor.

### `breathe`

```ts
M.breathe(frame: number, o?: { amp?: number; speed?: number }): number
```

Idle micro-motion breathing scale. Returns a scale factor.

### `beatGrid`

```ts
M.beatGrid(frame: number, o: { bpm: number; at?: number; fps?: number; perBar?: number }): { beat: number
```

Where a frame sits in a BPM grid: beat index, phase, decay pulse, bar position.

### `beatFrames`

```ts
M.beatFrames(o: { bpm: number; at?: number; fps?: number; perBar?: number; count: number }): number[]
```

The BPM grid as frame numbers — SFX score events and cut points.

## Entrances & motion

### `fadeUp`

```ts
M.fadeUp(frame: number, o?: AtOpts & { dy?: number }): string
```

Fade + rise entrance. Returns a CSS style string.

### `fly`

```ts
M.fly(frame: number, o: AtOpts & { from: XY; to: XY; arc?: number }): FlyResult
```

Eased arc flight between two points.

### `travel`

```ts
M.travel(frame: number, o: AtOpts & { from: XY; to: XY }): TravelResult
```

Fast-start, slow-stop glide to a resting point.

### `drop`

```ts
M.drop(frame: number, o?: AtOpts & { from?: number }): number
```

Gravity fall with a squash landing. Returns a translateY in px.

### `beat`

```ts
M.beat(frame: number, o?: AtOpts & { dist?: number; dir?: number }): BeatResult
```

Directed entrance: anticipation slide with settle.

### `punch`

```ts
M.punch(frame: number, o?: AtOpts & { scale?: number }): number
```

Camera punch-in scale around a focus point.

### `shake`

```ts
M.shake(frame: number, o?: AtOpts & { amp?: number }): XY
```

Screen shake offsets.

### `flash`

```ts
M.flash(frame: number, o?: AtOpts): number
```

White flash overlay opacity (0..1).

### `wiggle`

```ts
M.wiggle(frame: number, o?: AtOpts & { amp?: number; freq?: number }): string
```

Decaying rotational shake. Returns a CSS transform value.

### `flipIn`

```ts
M.flipIn(frame: number, o?: AtOpts & { axis?: 'X' | 'Y'; from?: number; perspective?: number }): string
```

3D flip entrance with overshoot settle. Returns a CSS style string.

### `whip`

```ts
M.whip(frame: number, o?: AtOpts & { dir?: 1 | -1; width?: number; maxBlur?: number }): WhipResult
```

Whip-pan transition: strip offset + mid-pan blur peak for two side-by-side scenes.

### `squash`

```ts
M.squash(frameOffset: number, o?: Record<string, unknown>): SquashResult
```

Squash-and-settle after a landing. Pass the frames since landing.

### `trail`

```ts
M.trail(frame: number, o: AtOpts & { from: XY; to: XY; arc?: number; n?: number }): XY[]
```

Ghost positions trailing a flight.

### `smear`

```ts
M.smear(frame: number, o: AtOpts & { from: XY; to: XY; arc?: number; samples?: number; span?: number; opacity?: number; fullAt?: number }): SmearGhost[]
```

### `pathFly`

```ts
M.pathFly(frame: number, o: AtOpts & { pts: Array<[number, number]> }): PathFlyResult
```

Constant-speed flight along a polyline, with heading angle.

### `orbit`

```ts
M.orbit(frame: number, o: { cx?: number; cy?: number; r?: number; speed?: number; phase?: number; squash?: number; depth?: boolean }): { x: number
```

Pose on a circular orbit: elliptical squash and optional depth scaling. Returns {x, y, angle, scale}.

### `swing`

```ts
M.swing(frame: number, o: { at?: number; maxDeg?: number; period?: number; phase?: number; decay?: number }): string
```

Pendulum swing as a rotate() transform string; optional exponential decay settles it to rest.

### `marquee`

```ts
M.marquee(frame: number, o: { content: string; unit: number; width: number; x?: number; y?: number; speed?: number; dir?: string }): string
```

Seamless infinite scroll strip: one content unit of `unit` px repeated and translated modulo unit. Returns a clipped strip div.

### `cursor`

```ts
M.cursor(frame: number, o: { path: { f: number; x: number; y: number }[]; clicks?: number[]; size?: number; color?: string; ring?: string; showFrom?: number; showTo?: number }): string
```

Animated mouse cursor: keyframed travel, click dip, expanding click rings. Returns an HTML string.

## Text & numbers

### `countUp`

```ts
M.countUp(frame: number, o?: AtOpts & { to?: number; from?: number }): number
```

Integer count-up. Returns the current integer.

### `counterRoll`

```ts
M.counterRoll(frame: number, o?: AtOpts & { from?: number; to?: number; size?: number; stagger?: number; spin?: number; color?: string }): string
```

Odometer digit roll from one integer to another. Returns an HTML string.

### `typewriter`

```ts
M.typewriter(frame: number, o: AtOpts & { text: string; cps?: number; caret?: boolean }): string
```

Self-typing text with optional blinking caret.

### `drawText`

```ts
M.drawText(frame: number, o: AtOpts & { fn?: string; text: string; x?: number; y?: number; size?: number; color?: string; stroke?: string; strokeWidth?: number; fillFrom?: number; fontFamily?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; letterSpacing?: number }): string
```

Handwriting-style stroke text: glyph outlines draw themselves, then the fill settles in. Returns an SVG string.

### `scramble`

```ts
M.scramble(frame: number, o: AtOpts & { text: string; pool?: string }): string
```

Text that decodes out of a glyph pool.

### `splitText`

```ts
M.splitText(frame: number, o: AtOpts & { fn?: string; text: string; x?: number; y?: number; size?: number; stagger?: number; mode?: 'rise' | 'pop' | 'fade'; color?: string; fontFamily?: string; weight?: number }): string
```

Split-text entrance: every character animates in on its own stagger (rise / pop / fade). Returns an HTML string.

## Shapes & drawing

### `dot`

```ts
M.dot(o: { x: number; y: number; r: number; color: string; candy?: boolean; scale?: number; opacity?: number }): string
```

A circle, optional glossy candy look. Returns an HTML string.

### `ripple`

```ts
M.ripple(frame: number, o: AtOpts & XY & { color?: string; maxR?: number }): string
```

Expanding ring after an event. Returns an HTML string.

### `burst`

```ts
M.burst(frame: number, o: AtOpts & XY & { n?: number; colors?: string[] }): string
```

Confetti / particle burst. Returns an HTML string.

### `badge`

```ts
M.badge(frame: number, o: AtOpts & XY & { text: string; bg?: string; color?: string }): string
```

Pill badge that pops in. Returns an HTML string.

### `targetSlot`

```ts
M.targetSlot(frame: number, o: XY & { r: number; color?: string }): string
```

Breathing dashed target ring. Returns an HTML string.

### `poly`

```ts
M.poly(points: Array<[number, number]>): PolyResult
```

Points + total length for hand-built polylines.

### `drawOn`

```ts
M.drawOn(frame: number, o: AtOpts & { d?: string; points?: string; len?: number; color?: string; width?: number }): string
```

Self-drawing stroke (SVG path with dash animation). Returns an HTML string.

### `bars`

```ts
M.bars(frame: number, o: AtOpts & { data: number[]; labels?: string[]; color?: string; max?: number }): string
```

Animated bar chart. Returns an HTML string.

### `morphShape`

```ts
M.morphShape(frame: number, o?: AtOpts & { fn?: string; from?: 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'heart'; to?: 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'heart'; x?: number; y?: number; size?: number; color?: string; stroke?: string; strokeWidth?: number; rot?: number }): string
```

Shape-to-shape morph (circle / square / triangle / diamond / hexagon / star / heart). Returns an SVG string.

### `morphPoly`

```ts
M.morphPoly(frame: number, o: AtOpts & { fn?: string; from: [number, number][]; to: [number, number][]; x?: number; y?: number; color?: string; stroke?: string; strokeWidth?: number; rot?: number }): string
```

Morph between two raw polygon point sets (uneven counts are subdivided to match). Returns an SVG string.

### `paperEl`

```ts
M.paperEl(o: { x: number; y: number; w?: number; h?: number; color: string; shape?: 'rect' | 'circle' | 'blob'; thick?: number; rot?: number; radius?: number; scale?: number; opacity?: number; shadow?: string }): string
```

A cut-paper shape: flat fill, hard offset thickness shadow, resting tilt.

### `pivot`

```ts
M.pivot(frame: number, o?: AtOpts & { from?: number; to?: number; steps?: number }): string
```

Paper-puppet joint rotation. Returns a CSS transform value.

### `stepped`

```ts
M.stepped(frame: number, o?: AtOpts & { steps?: number }): number
```

Eased progress snapped to N discrete levels (stop-motion timing).

### `onTwos`

```ts
M.onTwos(frame: number, o?: { every?: number }): number
```

Snap a frame down to a multiple of `every` (shot-on-twos timing).

### `confetti`

```ts
M.confetti(frame: number, o: { at?: number; n?: number; x?: number; y?: number; power?: number; spread?: number; gravity?: number; life?: number; seed?: number; size?: number; colors?: string[] }): string
```

Confetti cannon: seeded paper bits burst upward, tumble, and fall under gravity. Returns an HTML string.

### `marchingAnts`

```ts
M.marchingAnts(frame: number, o: { x?: number; y?: number; w: number; h: number; color?: string; width?: number; dash?: number; speed?: number; r?: number }): string
```

Animated dashed selection outline (marching ants) around a rect. Returns an SVG string.

### `highlightBox`

```ts
M.highlightBox(frame: number, o: { x?: number; y?: number; w: number; h: number; at?: number; dur?: number; color?: string; width?: number; pad?: number; wobble?: number; seed?: number }): string
```

Hand-drawn-feeling highlight box that sketches itself around a region over dur frames. Returns an SVG string.

## Scene, camera & ambience

### `scene`

```ts
M.scene(frame: number, ranges: Array<[number, number]>): SceneResult
```

Scene bookkeeping: which scene a frame belongs to, and its local frame.

### `transition`

```ts
M.transition(lf: number, len: number, frames?: number): TransitionResult
```

Edge fade/scale for scene transitions.

### `camera`

```ts
M.camera(frame: number, keys: CameraKey[], stage?: { w: number; h: number }): string
```

Virtual camera: keyframed focus + zoom transform for a stage. Returns a CSS transform.

### `parallax`

```ts
M.parallax(frame: number, keys: CameraKey[], depth: number, stage?: { w: number; h: number }): string
```

The camera move felt at a depth: 1 = camera() exactly, 0 = never moves, between = parallax layer. Returns a CSS transform.

### `meshBg`

```ts
M.meshBg(frame: number, o?: { c1?: string; c2?: string; c3?: string; base?: string }): string
```

Animated gradient-mesh background. Returns a CSS background value.

### `kenBurns`

```ts
M.kenBurns(frame: number, o?: { dur?: number; from?: number; to?: number }): string
```

Slow zoom for still images. Returns a CSS transform.

### `particleField`

```ts
M.particleField(frame: number, o?: { n?: number; w?: number; h?: number; mode?: 'float' | 'snow' | 'rise'; speed?: number; sway?: number; color?: string; opacity?: number; rMin?: number; rMax?: number; twinkle?: number; seed?: number }): string
```

Ambient particle layer (stars / dust / snow). Returns an HTML string.

### `glitch`

```ts
M.glitch(frame: number, o: { at?: number; dur?: number; html: string; amount?: number; slices?: number; seed?: number; blend?: 'multiply' | 'screen' }): string
```

RGB-split glitch transition over wrapped HTML. Returns an HTML string.

### `fx`

```ts
M.fx(frame: number, o?: { grain?: number; vignette?: number }): string
```

Film grain + vignette finishing overlay. Returns an HTML string.

### `wipeReveal`

```ts
M.wipeReveal(frame: number, o: AtOpts & { fn?: string; html: string; dir?: 'right' | 'left' | 'up' | 'down' }): string
```

Directional wipe reveal of arbitrary HTML via an animated clip-path inset. Returns an HTML string.

## Isometric kit

### `isoBox`

```ts
M.isoBox(o: { x?: number; y?: number; z?: number; ox?: number; oy?: number; unit?: number; w?: number; d?: number; h?: number; color?: string; top?: string; left?: string; right?: string; stroke?: string }): string
```

Isometric solid box on the fixed iso camera; faces shaded by orientation. Returns an SVG string.

### `isoCylinder`

```ts
M.isoCylinder(o: { x?: number; y?: number; z?: number; ox?: number; oy?: number; unit?: number; r?: number; h?: number; color?: string; top?: string; stroke?: string }): string
```

Isometric solid cylinder (projected-circle top ellipse). Returns an SVG string.

### `isoWedge`

```ts
M.isoWedge(o: { x?: number; y?: number; z?: number; ox?: number; oy?: number; unit?: number; len?: number; d?: number; h?: number; color?: string; top?: string; side?: string; stroke?: string }): string
```

Isometric wedge (triangular prism): high edge at x, slope descending along +x. Returns an SVG string.

### `isoPipe`

```ts
M.isoPipe(o: { ox?: number; oy?: number; unit?: number; path: number[][]; r?: number; color?: string }): string
```

Isometric pipe run through world points [[x, y, z], ...] — a stylized tube with joint dots and a lit edge. Returns an SVG string.

### `isoSort`

```ts
M.isoSort(parts: { x: number; y: number; z?: number; html: string }[]): string
```

Painter's-order join for iso parts: sorts by (x + y), then z, and concatenates their html.

