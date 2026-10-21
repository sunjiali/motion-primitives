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
/** 3D flip entrance with overshoot settle. Returns a CSS style string. */
export function flipIn(frame: number, o?: AtOpts & { axis?: 'X' | 'Y'; from?: number; perspective?: number }): string;
/** Odometer digit roll from one integer to another. Returns an HTML string. */
export function counterRoll(frame: number, o?: AtOpts & { from?: number; to?: number; size?: number; stagger?: number; spin?: number; color?: string }): string;

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
  punch: typeof punch; flash: typeof flash; camera: typeof camera;
  meshBg: typeof meshBg; drawOn: typeof drawOn; poly: typeof poly; bars: typeof bars;
  scramble: typeof scramble; kenBurns: typeof kenBurns; fx: typeof fx;
  paperEl: typeof paperEl; pivot: typeof pivot; stepped: typeof stepped; onTwos: typeof onTwos;
  whip: typeof whip; pathFly: typeof pathFly; flipIn: typeof flipIn; counterRoll: typeof counterRoll;
  Motion: typeof Motion;
  Remotion: RemotionModule;
  sfx: SfxModule;
};

export default Motion;
