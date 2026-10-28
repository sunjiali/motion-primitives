/**
 * motion-primitives — frame-pure motion building blocks for AI-generated
 * videos. Every function is a pure function of the frame number.
 */

export interface XY { x: number; y: number }

export interface AtOpts { at?: number; dur?: number }

export interface FlyResult extends XY { p: number; raw: number; done: boolean }
export interface SquashResult { sx: number; sy: number }
export interface SceneResult { index: number; lf: number; len: number }
export interface TransitionResult { opacity: number; scale: number }
export interface BeatResult { x: number; s: number }
export interface TravelResult extends XY { p: number; done: boolean }
export interface PolyResult { attr: string; len: number }
export interface CameraKey { at: number; x: number; y: number; zoom: number }

/** Springy scale-in with physical overshoot. Returns a scale factor. */
export function pop(frame: number, o?: AtOpts & { from?: number }): number;
/** Generic eased progress helper. Returns 0..1 (eased). */
export function ease(frame: number, o?: AtOpts & { ease?: string }): number;
/** Fade + rise entrance. Returns a CSS style string. */
export function fadeUp(frame: number, o?: AtOpts & { dy?: number }): string;
/** Breathing scale for "look here" targets. Returns a scale factor. */
export function pulse(frame: number, o?: { amp?: number; speed?: number }): number;
/** Integer count-up. Returns the current integer. */
export function countUp(frame: number, o?: AtOpts & { to?: number; from?: number }): number;
/** Start-frame helper for staggered groups. */
export function stagger(i: number, o?: { at?: number; gap?: number }): number;
/** Eased arc flight between two points. */
export function fly(frame: number, o: AtOpts & { from: XY; to: XY; arc?: number }): FlyResult;
/** Ghost positions trailing a flight. */
export function trail(frame: number, o: AtOpts & { from: XY; to: XY; arc?: number; n?: number }): XY[];
export interface SmearGhost extends XY { scale: number; opacity: number }
/** Motion blur: exposure ghosts sampled at earlier frames along a fly path.
 *  Blur length follows velocity — no blur at rest, stretch at speed. */
export function smear(frame: number, o: AtOpts & { from: XY; to: XY; arc?: number; samples?: number; span?: number; opacity?: number; fullAt?: number }): SmearGhost[];
/** Squash-and-settle after a landing. Pass the frames since landing. */
export function squash(frameOffset: number, o?: Record<string, unknown>): SquashResult;
/** A circle, optional glossy candy look. Returns an HTML string. */
export function dot(o: { x: number; y: number; r: number; color: string; candy?: boolean; scale?: number; opacity?: number }): string;
/** Expanding ring after an event. Returns an HTML string. */
export function ripple(frame: number, o: AtOpts & XY & { color?: string; maxR?: number }): string;
/** Confetti / particle burst. Returns an HTML string. */
export function burst(frame: number, o: AtOpts & XY & { n?: number; colors?: string[] }): string;
/** Pill badge that pops in. Returns an HTML string. */
export function badge(frame: number, o: AtOpts & XY & { text: string; bg?: string; color?: string }): string;
/** Breathing dashed target ring. Returns an HTML string. */
export function targetSlot(frame: number, o: XY & { r: number; color?: string }): string;
/** Scene bookkeeping: which scene a frame belongs to, and its local frame. */
export function scene(frame: number, ranges: Array<[number, number]>): SceneResult;
/** Edge fade/scale for scene transitions. */
export function transition(lf: number, len: number, frames?: number): TransitionResult;
/** Decaying rotational shake. Returns a CSS transform value. */
export function wiggle(frame: number, o?: AtOpts & { amp?: number; freq?: number }): string;
/** Self-typing text with optional blinking caret. */
export function typewriter(frame: number, o: AtOpts & { text: string; cps?: number; caret?: boolean }): string;
/** Deterministic 0..1 hash of an integer (seeded randomness that never changes). */
export function hash(n: number): number;
/** Directed entrance: anticipation slide with settle. */
export function beat(frame: number, o?: AtOpts & { dist?: number; dir?: number }): BeatResult;
/** Gravity fall with a squash landing. Returns a translateY in px. */
export function drop(frame: number, o?: AtOpts & { from?: number }): number;
/** Fast-start, slow-stop glide to a resting point. */
export function travel(frame: number, o: AtOpts & { from: XY; to: XY }): TravelResult;
/** Screen shake offsets. */
export function shake(frame: number, o?: AtOpts & { amp?: number }): XY;
/** Camera punch-in scale around a focus point. */
export function punch(frame: number, o?: AtOpts & { scale?: number }): number;
/** White flash overlay opacity (0..1). */
export function flash(frame: number, o?: AtOpts): number;
/** Virtual camera: keyframed focus + zoom transform for a stage. Returns a CSS transform. */
export function camera(frame: number, keys: CameraKey[], stage?: { w: number; h: number }): string;
/** The camera move felt at a depth: 1 = camera() exactly, 0 = never moves, between = parallax layer. Returns a CSS transform. */
export function parallax(frame: number, keys: CameraKey[], depth: number, stage?: { w: number; h: number }): string;
/** Animated gradient-mesh background. Returns a CSS background value. */
export function meshBg(frame: number, o?: { c1?: string; c2?: string; c3?: string; base?: string }): string;
/** Self-drawing stroke (SVG path with dash animation). Returns an HTML string. */
export function drawOn(frame: number, o: AtOpts & { d?: string; points?: string; len?: number; color?: string; width?: number }): string;
/** Points + total length for hand-built polylines. */
export function poly(points: Array<[number, number]>): PolyResult;
/** Animated bar chart. Returns an HTML string. */
export function bars(frame: number, o: AtOpts & { data: number[]; labels?: string[]; color?: string; max?: number }): string;
/** Text that decodes out of a glyph pool. */
export function scramble(frame: number, o: AtOpts & { text: string; pool?: string }): string;
/** Airport split-flap board: characters cycle through an ordered charset and clack into place. */
export function splitFlap(frame: number, o: AtOpts & { text: string; charset?: string; flipEvery?: number; stagger?: number }): string;
/** Slow zoom for still images. Returns a CSS transform. */
export function kenBurns(frame: number, o?: { dur?: number; from?: number; to?: number }): string;
/** Idle micro-motion breathing scale. Returns a scale factor. */
export function breathe(frame: number, o?: { amp?: number; speed?: number }): number;
/** Film grain + vignette finishing overlay. Returns an HTML string. */
export function fx(frame: number, o?: { grain?: number; vignette?: number }): string;
/** A cut-paper shape: flat fill, hard offset thickness shadow, resting tilt. */
export function paperEl(o: { x: number; y: number; w?: number; h?: number; color: string; shape?: 'rect' | 'circle' | 'blob'; thick?: number; rot?: number; radius?: number; scale?: number; opacity?: number; shadow?: string }): string;
/** Paper-puppet joint rotation. Returns a CSS transform value. */
export function pivot(frame: number, o?: AtOpts & { from?: number; to?: number; steps?: number }): string;
/** Eased progress snapped to N discrete levels (stop-motion timing). */
export function stepped(frame: number, o?: AtOpts & { steps?: number }): number;
/** Snap a frame down to a multiple of `every` (shot-on-twos timing). */
export function onTwos(frame: number, o?: { every?: number }): number;
export interface WhipResult { x: number; blur: number; raw: number; active: boolean }
/** Whip-pan transition: strip offset + mid-pan blur peak for two side-by-side scenes. */
export function whip(frame: number, o?: AtOpts & { dir?: 1 | -1; width?: number; maxBlur?: number }): WhipResult;
export interface PathFlyResult extends XY { angle: number; p: number; done: boolean }
/** Constant-speed flight along a polyline, with heading angle. */
export function pathFly(frame: number, o: AtOpts & { pts: Array<[number, number]> }): PathFlyResult;
/** Pose on a circular orbit: elliptical squash and optional depth scaling. Returns {x, y, angle, scale}. */
export function orbit(frame: number, o: { cx?: number; cy?: number; r?: number; speed?: number; phase?: number; squash?: number; depth?: boolean }): { x: number; y: number; angle: number; scale: number };
/** Pendulum swing as a rotate() transform string; optional exponential decay settles it to rest. */
export function swing(frame: number, o: { at?: number; maxDeg?: number; period?: number; phase?: number; decay?: number }): string;
/** Seamless infinite scroll strip: one content unit of `unit` px repeated and translated modulo unit. Returns a clipped strip div. */
export function marquee(frame: number, o: { content: string; unit: number; width: number; x?: number; y?: number; speed?: number; dir?: string }): string;
/** Animated dashed selection outline (marching ants) around a rect. Returns an SVG string. */
export function marchingAnts(frame: number, o: { x?: number; y?: number; w: number; h: number; color?: string; width?: number; dash?: number; speed?: number; r?: number }): string;
/** Hand-drawn-feeling highlight box that sketches itself around a region over dur frames. Returns an SVG string. */
export function highlightBox(frame: number, o: { x?: number; y?: number; w: number; h: number; at?: number; dur?: number; color?: string; width?: number; pad?: number; wobble?: number; seed?: number }): string;
/** Animated sine wave line with scrolling phase and an optional centre-swell taper. Returns an SVG string. */
export function waveLine(frame: number, o: { x?: number; y?: number; w?: number; amp?: number; wl?: number; speed?: number; color?: string; width?: number; taper?: number }): string;
/** Dimmed-stage spotlight overlay with one lit hole; the hole is static (x, y) or travels between keyframes. Returns an overlay div. */
export function spotlight(frame: number, o: { x?: number; y?: number; keys?: { f: number; x: number; y: number }[]; r?: number; feather?: number; alpha?: number }): string;
export interface RelayKey { at: number; x: number; y: number; w: number; h: number; r?: number; opacity?: number }
export interface RelayResult { x: number; y: number; w: number; h: number; r: number; opacity: number; seg: number; p: number; done: boolean }
/** Keyframed geometry relay: one hero element's pose (x, y, w, h, corner radius, opacity) interpolated across keyframes with a single easing, so the element persists across scene cuts — sliding, stretching and morphing from pose to pose instead of vanishing. Before the first key and after the last, the pose holds. Returns the interpolated state. */
export function relay(frame: number, o: { keys: RelayKey[]; fn?: string }): RelayResult;
/** Scene-change cover in the outgoing scene's colour with an organic blob hole growing through it. Returns an overlay div ('' once fully revealed). */
export function maskReveal(frame: number, o: { at?: number; dur?: number; x?: number; y?: number; w?: number; h?: number; color?: string; seed?: number }): string;
/** Matched-cut travel driver: outgoing element reaches p = 0.8 at the cut; the incoming continues at matched pose and velocity to p = 1. */
export function matchCut(frame: number, o: { at?: number; out?: number }): { phase: string; p: number; v: number };
/** Mosaic scene transition: a grid of flat cells in the outgoing colour flips away at hash-staggered frames. Returns an overlay div ('' once dissolved). */
export function pixelDissolve(frame: number, o: { at?: number; dur?: number; w?: number; h?: number; cols?: number; rows?: number; color?: string; seed?: number }): string;
/** A living wall of glyphs: every cell flips character at hash-staggered intervals. Returns a positioned div. */
export function charGrid(frame: number, o: { cols?: number; rows?: number; size?: number; x?: number; y?: number; chars?: string; color?: string; accent?: string; seed?: number; interval?: number }): string;
/** Glyphs fly in from a hash scatter to their typeset slots (mode 'out' disperses). Returns a positioned div. */
export function assembleText(frame: number, o: { text: string; at?: number; dur?: number; x?: number; y?: number; size?: number; color?: string; seed?: number; mode?: string; weight?: number }): string;
/** A string typeset along a smoothed polyline by arc length, tangent-rotated, flowing at `speed`. Returns a positioned div. */
export function textOnPath(frame: number, o: { text: string; pts: number[][]; size?: number; color?: string; speed?: number; offset?: number; loop?: boolean; weight?: number; x?: number; y?: number }): string;
/** Seamless animated pattern backdrop: one motif tiled with a travelling per-tile phase (spin / pulse / wave). Returns a positioned div. */
export function patternField(frame: number, o: { w?: number; h?: number; tile?: number; motif?: string; motion?: string; color?: string; bg?: string; speed?: number; x?: number; y?: number }): string;
/** Smooth slit-scan streak warp over wrapped HTML: band-clipped copies shifted by a travelling sine field. Returns an HTML string. */
export function slitScan(frame: number, o: { html: string; h?: number; bands?: number; amp?: number; waves?: number; speed?: number; at?: number; dur?: number }): string;
/** Travelling wave packet over horizontal slices of wrapped HTML: a wavefront crosses the scene over `dur` frames and each strip shifts horizontally by a sine field inside a gaussian packet around the front, so the wave passes through and leaves the content undisturbed. Returns the input HTML untouched before `at` and after the window. Distinct from slitScan's continuous warp. */
export function sliceWave(frame: number, o: { html?: string; at?: number; dur?: number; slices?: number; amp?: number; waves?: number; width?: number; dir?: string }): string;
export function letterTrack(frame: number, o: { text?: string; at?: number; dur?: number; from?: number; to?: number; size?: number; color?: string; fontFamily?: string; weight?: number }): string;
/** Anime-style speed lines: thin streaks radiating from (x, y) during a fast window — a full impact burst at spread 360, or a narrow trailing cone (angle + spread) centred on a moving element each frame. Returns an overlay div ('' outside the window). */
export function speedLines(frame: number, o: { x?: number; y?: number; at?: number; dur?: number; n?: number; color?: string; width?: number; minLen?: number; maxLen?: number; gap?: number; angle?: number; spread?: number; seed?: number }): string;
/** Circular portal transition: a flat disc blooms from (x, y), swallows the outgoing scene, holds, then contracts toward (x2, y2) revealing the incoming scene beneath. Pass the outgoing scene as `html` (draw the incoming scene first). Returns an overlay div ('' after the window). */
export function portalWipe(frame: number, o: { at?: number; dur?: number; html?: string; x?: number; y?: number; x2?: number; y2?: number; w?: number; h?: number; color?: string; echo?: number; hold?: number; fn?: string }): string;
/** Concentric thin rings around a focal point: an expanding pulse train (default), a slow breathing set, or counter-rotating dashed arcs ('spin'). Returns a positioned overlay div ('' before `at`). */
export function rings(frame: number, o: { x?: number; y?: number; count?: number; r0?: number; gap?: number; color?: string; width?: number; at?: number; dur?: number; mode?: string; speed?: number; dash?: number; opacity?: number; seed?: number }): string;
/** Pixel-grid scene transition: every tile shows a cropped window of scene A, then flips to the same window of scene B at its hash-staggered moment, swelling briefly around the flip. Draw the incoming scene (B) first, pass the outgoing scene as `htmlA`. Returns full-bleed `htmlA` before `at`, '' after the window. */
export function mosaic(frame: number, o: { at?: number; dur?: number; w?: number; h?: number; cols?: number; rows?: number; htmlA?: string; htmlB?: string; swell?: number; gap?: number; seed?: number }): string;
/** Spring-damped bottom sheet: a dock bar that springs upward to its open height (stiffness 300 / damping 18 by default, overshooting briefly), icons popping in staggered as it opens, collapsing back to the dock at `closeAt`. The sheet is anchored by its bottom edge (`bottom`); before `at` and after the collapse it is just the dock bar. Returns one positioned div. */
export function springSheet(frame: number, o: { x?: number; bottom?: number; w?: number; h?: number; dockH?: number; at?: number; closeAt?: number; stiffness?: number; damping?: number; icons?: { glyph: string; color?: string }[]; stagger?: number; iconSize?: number; color?: string; dockColor?: string; radius?: number }): string;
/** Raymarched SDF liquid-chrome blob cluster (WebGL). Returns a canvas tag; the players paint it via liquidMetalDraw after each render. */
export function liquidMetal(frame: number, o: { w?: number; h?: number; x?: number; y?: number; size?: number; palette?: string; speed?: number; seed?: number; fps?: number; blobs?: number; spin?: number }): string;
/** Paints every liquidMetal canvas under a root element. Called automatically by the players; no-op without a DOM. */
export function liquidMetalDraw(root: unknown): void;
/** 3D flip entrance with overshoot settle. Returns a CSS style string. */
export function flipIn(frame: number, o?: AtOpts & { axis?: 'X' | 'Y'; from?: number; perspective?: number }): string;
/** Odometer digit roll from one integer to another. Returns an HTML string. */
export function counterRoll(frame: number, o?: AtOpts & { from?: number; to?: number; size?: number; stagger?: number; spin?: number; color?: string }): string;
/** Handwriting-style stroke text: glyph outlines draw themselves, then the fill settles in. Returns an SVG string. */
export function drawText(frame: number, o: AtOpts & { fn?: string; text: string; x?: number; y?: number; size?: number; color?: string; stroke?: string; strokeWidth?: number; fillFrom?: number; fontFamily?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; letterSpacing?: number }): string;
/** Ambient particle layer (stars / dust / snow). Returns an HTML string. */
export function particleField(frame: number, o?: { n?: number; w?: number; h?: number; mode?: 'float' | 'snow' | 'rise'; speed?: number; sway?: number; color?: string; opacity?: number; rMin?: number; rMax?: number; twinkle?: number; seed?: number }): string;
/** Boiling-light glow overlay: seeded value noise drives the core's radius and brightness, six satellite blobs pulse on their own noise channels, and sparkles burst on seeded cycles. Composites via mix-blend-mode ('screen' default, 'color-dodge' for blow-out). Returns an overlay div — draw it after the light source. */
export function noiseGlow(frame: number, o?: { x?: number; y?: number; r?: number; color?: string; intensity?: number; boil?: number; sparkles?: number; blend?: string; seed?: number }): string;
/** Shape-to-shape morph (circle / square / triangle / diamond / hexagon / star / heart). Returns an SVG string. */
export function morphShape(frame: number, o?: AtOpts & { fn?: string; from?: 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'heart'; to?: 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'heart'; x?: number; y?: number; size?: number; color?: string; stroke?: string; strokeWidth?: number; rot?: number }): string;
/** RGB-split glitch transition over wrapped HTML. Returns an HTML string. */
export function glitch(frame: number, o: { at?: number; dur?: number; html: string; amount?: number; slices?: number; seed?: number; blend?: 'multiply' | 'screen' }): string;
/** Where a frame sits in a BPM grid: beat index, phase, decay pulse, bar position. */
export function beatGrid(frame: number, o: { bpm: number; at?: number; fps?: number; perBar?: number }): { beat: number; index: number; phase: number; pulse: number; bar: number; inBar: number };
/** The BPM grid as frame numbers — SFX score events and cut points. */
export function beatFrames(o: { bpm: number; at?: number; fps?: number; perBar?: number; count: number }): number[];
/** Closed-form inertial glide: position/velocity of a thrown object; total travel is exactly v0 / k. */
export function inertia(frame: number, o: { x0?: number; y0?: number; vx?: number; vy?: number; k?: number; at?: number }): { x: number; y: number; vx: number; vy: number; t: number };
/** Wind-up progress: dips below 0 (the crouch / pull-back), then releases through 1 with an overshoot and lands exactly on 1. */
export function anticipate(frame: number, o: { at?: number; wind?: number; dur?: number; depth?: number }): number;
/** A row of progress values for trailing parts: each starts `lag` frames later and overshoots a little more; every value ends exactly at 1. */
export function followThrough(frame: number, o: { at?: number; dur?: number; count?: number; lag?: number; boost?: number }): number[];
/** Velocity-driven shear. `trail`: skew follows the instantaneous velocity of an eased move (the top lags behind the motion);
 * `impact`: a decaying ±skew oscillation for hits. `anchor:'start'` recenters the sheared box. Returns the eased position plus a ready CSS transform. */
export function velocitySkew(frame: number, o?: { at?: number; dur?: number; fn?: string; mode?: 'trail' | 'impact'; axis?: 'x' | 'y'; from?: number; to?: number; maxSkew?: number; gain?: number; freq?: number; h?: number; anchor?: 'center' | 'start' }): { pos: number; skew: number; recenter: number; css: string };
/** Morph between two raw polygon point sets (uneven counts are subdivided to match). Returns an SVG string. */
export function morphPoly(frame: number, o: AtOpts & { fn?: string; from: [number, number][]; to: [number, number][]; x?: number; y?: number; color?: string; stroke?: string; strokeWidth?: number; rot?: number }): string;
/** Split-text entrance: every character animates in on its own stagger (rise / pop / fade). Returns an HTML string. */
export function splitText(frame: number, o: AtOpts & { fn?: string; text: string; x?: number; y?: number; size?: number; stagger?: number; mode?: 'rise' | 'pop' | 'fade'; color?: string; fontFamily?: string; weight?: number }): string;
/** Directional wipe reveal of arbitrary HTML via an animated clip-path inset. Returns an HTML string. */
export function wipeReveal(frame: number, o: AtOpts & { fn?: string; html: string; dir?: 'right' | 'left' | 'up' | 'down' }): string;
/** Confetti cannon: seeded paper bits burst upward, tumble, and fall under gravity. Returns an HTML string. */
export function confetti(frame: number, o: { at?: number; n?: number; x?: number; y?: number; power?: number; spread?: number; gravity?: number; life?: number; seed?: number; size?: number; colors?: string[] }): string;
/** Animated mouse cursor: keyframed travel, click dip, expanding click rings. Returns an HTML string. */
export function cursor(frame: number, o: { path: { f: number; x: number; y: number }[]; clicks?: number[]; size?: number; color?: string; ring?: string; showFrom?: number; showTo?: number }): string;
/** Isometric solid box on the fixed iso camera; faces shaded by orientation. Returns an SVG string. */
export function isoBox(o: { x?: number; y?: number; z?: number; ox?: number; oy?: number; unit?: number; w?: number; d?: number; h?: number; color?: string; top?: string; left?: string; right?: string; stroke?: string }): string;
/** Isometric solid cylinder (projected-circle top ellipse). Returns an SVG string. */
export function isoCylinder(o: { x?: number; y?: number; z?: number; ox?: number; oy?: number; unit?: number; r?: number; h?: number; color?: string; top?: string; stroke?: string }): string;
/** Isometric wedge (triangular prism): high edge at x, slope descending along +x. Returns an SVG string. */
export function isoWedge(o: { x?: number; y?: number; z?: number; ox?: number; oy?: number; unit?: number; len?: number; d?: number; h?: number; color?: string; top?: string; side?: string; stroke?: string }): string;
/** Isometric pipe run through world points [[x, y, z], ...] — a stylized tube with joint dots and a lit edge. Returns an SVG string. */
export function isoPipe(o: { ox?: number; oy?: number; unit?: number; path: number[][]; r?: number; color?: string }): string;
/** Isometric gear: cylinder body, teeth on the projected rim ellipse, hub hole and face bolts; `rot` turns it. Returns SVG strings. */
export function isoGear(o: { x?: number; y?: number; z?: number; ox?: number; oy?: number; unit?: number; r?: number; h?: number; teeth?: number; rot?: number; color?: string; top?: string; stroke?: string }): string;
/** Isometric cone: true tangent silhouettes to the base ellipse, two-tone side shading. Returns an SVG string. */
export function isoCone(o: { x?: number; y?: number; z?: number; ox?: number; oy?: number; unit?: number; r?: number; h?: number; color?: string; stroke?: string }): string;
/** Isometric bolt: hex-head prism on a short cylinder shaft. Returns SVG strings. */
export function isoBolt(o: { x?: number; y?: number; z?: number; ox?: number; oy?: number; unit?: number; r?: number; headH?: number; shaftH?: number; color?: string; top?: string; stroke?: string }): string;
/** Isometric data terrain: a column grid with a gaussian hill around a fixed or orbiting focus. Returns painter-sorted SVG strings. */
export function isoTerrain(frame: number, o: { ox?: number; oy?: number; unit?: number; cols?: number; rows?: number; amp?: number; sigma?: number; fx?: number; fy?: number; auto?: boolean; speed?: number; color?: string }): string;
/** Painter's-order join for iso parts: sorts by (x + y), then z, and concatenates their html. */
export function isoSort(parts: { x: number; y: number; z?: number; html: string }[]): string;

export interface SfxEvent { f: number; s: string; g?: number; pan?: number; seed?: number }
export interface SfxScore { fps?: number; durationFrames: number; tailSec?: number; events: SfxEvent[] }
export interface SfxModule {
  /** Render a score to a 16-bit stereo WAV, returned as a Buffer.
   *  Each sound lands one frame after its visual event. */
  renderScore(score: SfxScore): Buffer;
  SOUNDS: Record<string, unknown>;
  SR: number;
}

export interface RemotionModule {
  interpolate(input: number, inputRange: number[], outputRange: number[], options?: Record<string, unknown>): number;
  spring(o: Record<string, unknown>): number;
  Easing: Record<string, (t: number) => number>;
}

declare const Motion: {
  pop: typeof pop; ease: typeof ease; fadeUp: typeof fadeUp; pulse: typeof pulse;
  breathe: typeof breathe; countUp: typeof countUp; stagger: typeof stagger;
  fly: typeof fly; trail: typeof trail; smear: typeof smear; squash: typeof squash; dot: typeof dot;
  ripple: typeof ripple; burst: typeof burst; badge: typeof badge;
  targetSlot: typeof targetSlot; scene: typeof scene; transition: typeof transition;
  wiggle: typeof wiggle; typewriter: typeof typewriter; hash: typeof hash;
  beat: typeof beat; drop: typeof drop; travel: typeof travel; shake: typeof shake;
  punch: typeof punch; flash: typeof flash; camera: typeof camera; parallax: typeof parallax;
  meshBg: typeof meshBg; drawOn: typeof drawOn; poly: typeof poly; bars: typeof bars;
  scramble: typeof scramble; splitFlap: typeof splitFlap; kenBurns: typeof kenBurns; fx: typeof fx;
  paperEl: typeof paperEl; pivot: typeof pivot; stepped: typeof stepped; onTwos: typeof onTwos;
  whip: typeof whip; pathFly: typeof pathFly; orbit: typeof orbit; swing: typeof swing; marquee: typeof marquee; marchingAnts: typeof marchingAnts; highlightBox: typeof highlightBox; waveLine: typeof waveLine; spotlight: typeof spotlight; relay: typeof relay; maskReveal: typeof maskReveal; matchCut: typeof matchCut; pixelDissolve: typeof pixelDissolve; charGrid: typeof charGrid; flipIn: typeof flipIn; counterRoll: typeof counterRoll;
  drawText: typeof drawText;
  particleField: typeof particleField;
  noiseGlow: typeof noiseGlow;
  morphShape: typeof morphShape;
  glitch: typeof glitch;
  beatGrid: typeof beatGrid; beatFrames: typeof beatFrames; inertia: typeof inertia; anticipate: typeof anticipate; followThrough: typeof followThrough; velocitySkew: typeof velocitySkew;
  morphPoly: typeof morphPoly;
  splitText: typeof splitText;
  assembleText: typeof assembleText;
  textOnPath: typeof textOnPath;
  patternField: typeof patternField;
  slitScan: typeof slitScan;
  sliceWave: typeof sliceWave;
  letterTrack: typeof letterTrack;
  speedLines: typeof speedLines;
  portalWipe: typeof portalWipe;
  rings: typeof rings;
  mosaic: typeof mosaic;
  springSheet: typeof springSheet;
  liquidMetal: typeof liquidMetal;
  liquidMetalDraw: typeof liquidMetalDraw;
  wipeReveal: typeof wipeReveal;
  confetti: typeof confetti;
  cursor: typeof cursor;
  isoBox: typeof isoBox;
  isoCylinder: typeof isoCylinder;
  isoWedge: typeof isoWedge;
  isoPipe: typeof isoPipe;
  isoGear: typeof isoGear;
  isoCone: typeof isoCone;
  isoBolt: typeof isoBolt;
  isoTerrain: typeof isoTerrain;
  isoSort: typeof isoSort;
  Motion: typeof Motion;
  Remotion: RemotionModule;
  sfx: SfxModule;
};

export default Motion;
