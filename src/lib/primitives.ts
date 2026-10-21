// motion-primitives — tiny, frame-pure motion building blocks for AI-generated video.
//
// Why: an LLM is bad at hand-writing animation math (easing curves, spring
// constants, arc interpolation) but good at *composing* named primitives.
// So every common teaching/explainer motion is wrapped here as one call:
//
//   const s = M.pop(frame, { at: 20 });                    // springy scale-in
//   const p = M.fly(frame, { at: 60, dur: 90, from, to }); // arc flight
//   stage.innerHTML = M.dot({ x: p.x, y: p.y, r: 40, color: '#3FB6FF' })
//                   + M.trail(frame, { at: 60, dur: 90, from, to, color: '#3FB6FF' });
//
// Every primitive is a pure function of `frame` — same frame, same picture —
// which is what makes parallel screenshot rendering correct.
//
// Namespace: Motion on window (browser) or globalThis (Node); alias M.

// Each lib script keeps its own handle on the global object: in the
// browser the scripts are concatenated (one shared var), in Node each
// file is its own module scope — either way this line is the seam.
var __root: RootHolder = (typeof window !== 'undefined' ? window : globalThis) as unknown as RootHolder;

// Option bags for every primitive. All fields are optional at runtime —
// each primitive substitutes its documented defaults — so these mirror
// the public declarations in index.d.ts.
interface EaseOpts { at?: number; dur?: number; fn?: EasingName }
interface PopOpts { at?: number; from?: number; to?: number; stiffness?: number; damping?: number }
interface FadeUpOpts extends EaseOpts { dist?: number }
interface PulseOpts { base?: number; amp?: number; speed?: number; phase?: number }
interface CountUpOpts extends EaseOpts { from?: number; to?: number }
interface StaggerOpts { base?: number; each?: number }
interface Pt { x: number; y: number }
interface FlyOpts { at?: number; dur?: number; fn?: EasingName; arc?: number; from: Pt; to: Pt }
interface FlyResult { x: number; y: number; p: number; raw: number; done: boolean }
interface TrailOpts extends FlyOpts { ghosts?: number; gap?: number }
interface Ghost { x: number; y: number; scale: number; opacity: number }
interface SmearOpts extends FlyOpts { samples?: number; span?: number; opacity?: number; fullAt?: number }
interface DotOpts {
  x: number; y: number; r: number; color: string; scale?: number;
  candy?: boolean; glow?: boolean; glowSize?: number; glowAlpha?: string;
  opacity?: number; extra?: string;
}
interface RippleOpts { at?: number; dur?: number; r0?: number; speed?: number; width?: number; x: number; y: number; color: string }
interface BurstOpts { at?: number; dur?: number; x: number; y: number; colors?: string[]; n?: number; dist?: number }
interface BadgeOpts { at?: number; color: string; text: string; fg?: string; size?: number; top: number; left?: number; right?: number }
interface TargetSlotOpts { x: number; y: number; r: number; color: string; speed?: number }
interface WiggleOpts { at?: number; dur?: number; freq?: number; amp?: number }
interface TypewriterOpts { at?: number; cpf?: number; text: string; caret?: boolean }
interface BeatOpts { at?: number; dist?: number }
interface DropOpts { at?: number; from?: number; dur?: number }
interface TravelOpts { at?: number; dur?: number; from: Pt; to: Pt }
interface TravelResult { x: number; y: number; p: number; done: boolean }
interface SwingOpts {
  at?: number; maxDeg?: number; period?: number; phase?: number; decay?: number;
}
interface MarqueeOpts {
  content: string; unit: number; width: number;
  x?: number; y?: number; speed?: number; dir?: string;
}
interface MarchingAntsOpts {
  x?: number; y?: number; w: number; h: number;
  color?: string; width?: number; dash?: number; speed?: number; r?: number;
}
interface HighlightBoxOpts {
  x?: number; y?: number; w: number; h: number;
  at?: number; dur?: number; color?: string; width?: number;
  pad?: number; wobble?: number; seed?: number;
}
interface WaveLineOpts {
  x?: number; y?: number; w?: number; amp?: number; wl?: number;
  speed?: number; color?: string; width?: number; taper?: number;
}
interface SpotlightKey { f: number; x: number; y: number }
interface SpotlightOpts {
  x?: number; y?: number; keys?: SpotlightKey[];
  r?: number; feather?: number; alpha?: number;
}
interface OrbitOpts {
  cx?: number; cy?: number; r?: number; speed?: number; phase?: number;
  squash?: number; depth?: boolean;
}
interface OrbitResult { x: number; y: number; angle: number; scale: number }
interface ShakeOpts { at?: number; dur?: number; amp?: number; seed?: number }
interface PunchOpts { at?: number; amp?: number }
interface FlashOpts { at?: number; dur?: number; opacity?: number; color?: string }
interface CamKey { f: number; x: number; y: number; z: number }
interface StageSize { w: number; h: number }
interface MeshBlob { c: string; x: number; y: number; r: number; dx: number; dy: number; sp: number }
interface MeshBgOpts { blobs?: MeshBlob[]; base?: string; base2?: string }
interface DrawOnOpts { at?: number; dur?: number; len: number }
interface BarDatum { v: number; k: string; c?: string }
interface BarsOpts {
  data: BarDatum[]; at?: number; stagger?: number; dur?: number;
  h: number; x: number; y: number; bw: number; gap: number; color?: string; label?: string;
}
interface ScrambleOpts { at?: number; cpf?: number; text: string; chars?: string }
interface KenBurnsOpts { at?: number; dur?: number; from?: number; to?: number; panX?: number; panY?: number }
interface BreatheOpts { amp?: number; speed?: number; phase?: number }
interface FxOpts { grain?: number; vignette?: number }
interface PaperElOpts {
  x: number; y: number; w?: number; h?: number; thick?: number;
  shape?: 'rect' | 'circle' | 'blob'; radius?: number; color: string;
  shadow?: string; rot?: number; scale?: number; opacity?: number; extra?: string;
}
interface PivotOpts { at?: number; dur?: number; fn?: EasingName; steps?: number; from?: number; to?: number }
interface SteppedOpts { at?: number; dur?: number; fn?: EasingName; steps?: number }
interface OnTwosOpts { every?: number }
interface WhipOpts { at?: number; dur?: number; dir?: number; width?: number; maxBlur?: number }
interface WhipResult { x: number; blur: number; raw: number; active: boolean }
type Point2 = [number, number];
interface PathFlyOpts { at?: number; dur?: number; fn?: EasingName; pts: Point2[] }
interface PathFlyResult { x: number; y: number; angle: number; p: number; done: boolean }
interface FlipInOpts { at?: number; dur?: number; from?: number; perspective?: number; axis?: string }
interface CounterRollOpts {
  at?: number; dur?: number; fn?: EasingName; from?: number; to?: number;
  size?: number; stagger?: number; spin?: number; fontFamily?: string; color?: string;
}
interface DrawTextOpts extends EaseOpts {
  text: string; x?: number; y?: number; size?: number;
  color?: string; stroke?: string; strokeWidth?: number; fillFrom?: number;
  fontFamily?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; letterSpacing?: number;
}
interface ParticleFieldOpts {
  n?: number; w?: number; h?: number; mode?: 'float' | 'snow' | 'rise';
  speed?: number; sway?: number; color?: string; opacity?: number;
  rMin?: number; rMax?: number; twinkle?: number; seed?: number;
}
type ShapeName = 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'heart';
interface MorphShapeOpts extends EaseOpts {
  from?: ShapeName; to?: ShapeName; x?: number; y?: number; size?: number;
  color?: string; stroke?: string; strokeWidth?: number; rot?: number;
}
interface GlitchOpts {
  at?: number; dur?: number; html: string; amount?: number; slices?: number;
  seed?: number; blend?: 'multiply' | 'screen';
}
interface BeatGridOpts { bpm: number; at?: number; fps?: number; perBar?: number }
interface BeatInfo { beat: number; index: number; phase: number; pulse: number; bar: number; inBar: number }
interface MorphPolyOpts extends EaseOpts {
  from: [number, number][]; to: [number, number][]; x?: number; y?: number;
  color?: string; stroke?: string; strokeWidth?: number; rot?: number;
}
interface SplitTextOpts extends EaseOpts {
  text: string; x?: number; y?: number; size?: number; stagger?: number;
  mode?: 'rise' | 'pop' | 'fade'; color?: string; fontFamily?: string; weight?: number;
}
interface WipeOpts extends EaseOpts {
  html: string; dir?: 'right' | 'left' | 'up' | 'down';
}
interface ConfettiOpts {
  at?: number; n?: number; x?: number; y?: number; power?: number;
  spread?: number; gravity?: number; life?: number; seed?: number;
  size?: number; colors?: string[];
}
interface IsoBase {
  x?: number; y?: number; z?: number; ox?: number; oy?: number; unit?: number;
}
interface IsoBoxOpts extends IsoBase {
  w?: number; d?: number; h?: number; color?: string;
  top?: string; left?: string; right?: string; stroke?: string;
}
interface IsoCylinderOpts extends IsoBase {
  r?: number; h?: number; color?: string; top?: string; stroke?: string;
}
interface IsoWedgeOpts extends IsoBase {
  len?: number; d?: number; h?: number; color?: string;
  top?: string; side?: string; stroke?: string;
}
interface IsoPipeOpts extends IsoBase {
  path: number[][]; r?: number; color?: string;
}
interface IsoGearOpts extends IsoBase {
  r?: number; h?: number; teeth?: number; rot?: number; color?: string; top?: string; stroke?: string;
}
interface IsoPart { x: number; y: number; z?: number; html: string }
interface CursorKey { f: number; x: number; y: number }
interface CursorOpts {
  path: CursorKey[]; clicks?: number[]; size?: number;
  color?: string; ring?: string; showFrom?: number; showTo?: number;
}

__root.Motion = (function () {
  const { interpolate, spring, Easing } = __root.Remotion as RemotionStatic;
  void interpolate; // destructured as in the original; primitives build on spring/Easing
  const FPS = 30;
  const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

  // ---------- value primitives (return numbers / style strings) ----------

  // Springy scale/entrance. Returns a value from→to with physical overshoot.
  function pop(frame: number, o?: PopOpts): number {
    o = o || {};
    const at = o.at || 0;
    if (frame <= at) return o.from == null ? 0 : o.from;
    return spring({
      frame: frame - at, fps: FPS,
      from: o.from == null ? 0 : o.from, to: o.to == null ? 1 : o.to,
      stiffness: o.stiffness || 120, damping: o.damping || 11,
    });
  }

  // Eased 0→1 progress. fn: 'linear'|'cubicIn'|'cubicOut'|'cubicInOut'|'quadOut'|'backOut'
  function ease(frame: number, o?: EaseOpts): number {
    o = o || {};
    const fn = Easing[o.fn || 'cubicOut'] || Easing.cubicOut;
    return fn(clamp01((frame - (o.at || 0)) / (o.dur || 20)));
  }

  // Fade + rise entrance as a style string: M.fadeUp(frame, {at, dur, dist})
  function fadeUp(frame: number, o?: FadeUpOpts): string {
    o = o || {};
    const p = ease(frame, { at: o.at, dur: o.dur || 16, fn: o.fn });
    return 'opacity:' + p.toFixed(3) + ';transform:translateY(' + ((1 - p) * (o.dist || 44)).toFixed(1) + 'px);';
  }

  // Breathing scale (for "look here" targets, empty slots, badges).
  function pulse(frame: number, o?: PulseOpts): number {
    o = o || {};
    return (o.base || 1) + (o.amp || 0.07) * Math.sin(frame * (o.speed || 0.09) + (o.phase || 0));
  }

  // Integer count-up (scores, totals, step counters).
  function countUp(frame: number, o?: CountUpOpts): number {
    o = o || {};
    const p = ease(frame, { at: o.at, dur: o.dur || 30, fn: o.fn });
    return Math.round((o.from || 0) + ((o.to || 0) - (o.from || 0)) * p);
  }

  // Delay helper for staggered groups: M.stagger(i, {each:6, base:20}) → start frame
  function stagger(i: number, o?: StaggerOpts): number {
    o = o || {};
    return (o.base || 0) + i * (o.each == null ? 6 : o.each);
  }

  // Arc flight between two points. Returns {x, y, p, done}.
  // The moving thing travels from→to on an eased path with a parabolic arc.
  function fly(frame: number, o: FlyOpts): FlyResult {
    const raw = clamp01((frame - (o.at || 0)) / (o.dur || 90));
    const p = (Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut)(raw);
    const arc = o.arc == null ? 170 : o.arc;
    return {
      x: o.from.x + (o.to.x - o.from.x) * p,
      y: o.from.y + (o.to.y - o.from.y) * p - Math.sin(p * Math.PI) * arc,
      p, raw, done: raw >= 1,
    };
  }

  // Ghost positions trailing a fly() path (for M.dot rendering by the caller).
  function trail(frame: number, o: TrailOpts): Ghost[] {
    const out: Ghost[] = [];
    const ghosts = o.ghosts || 5, gap = o.gap || 0.045;
    const raw = clamp01((frame - (o.at || 0)) / (o.dur || 90));
    for (let k = ghosts; k >= 1; k--) {
      const tp = (Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut)(clamp01(raw - k * gap));
      if (tp <= 0) continue;
      const arc = o.arc == null ? 170 : o.arc;
      out.push({
        x: o.from.x + (o.to.x - o.from.x) * tp,
        y: o.from.y + (o.to.y - o.from.y) * tp - Math.sin(tp * Math.PI) * arc,
        scale: 0.72 - k * 0.07, opacity: 0.36 - k * 0.05,
      });
    }
    return out;
  }

  // Motion blur: exposure ghosts sampled at earlier FRAMES along a fly()
  // path (unlike trail(), which spaces ghosts by progress for a comet look).
  // Blur length follows velocity — at rest the ghosts collapse onto the head
  // and fade out; at speed they stretch behind it. The caller renders the
  // ghosts with dot() under the head, exactly like trail(). Returns [] when
  // the move has not started or has landed. Knob 03 of the six-knobs set.
  function smear(frame: number, o: SmearOpts): Ghost[] {
    const out: Ghost[] = [];
    const samples = o.samples || 6;              // ghost count
    const span = o.span == null ? 5 : o.span;    // exposure window, in frames
    const maxOp = o.opacity == null ? 0.3 : o.opacity;
    const arc = o.arc == null ? 170 : o.arc;
    const easeFn = Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut;
    const posAt = (f: number) => {
      const raw = clamp01((f - (o.at || 0)) / (o.dur || 90));
      const p = easeFn(raw);
      return {
        x: o.from.x + (o.to.x - o.from.x) * p,
        y: o.from.y + (o.to.y - o.from.y) * p - Math.sin(p * Math.PI) * arc,
        raw,
      };
    };
    const head = posAt(frame);
    if (head.raw <= 0 || head.raw >= 1) return out;
    const tailPos = posAt(frame - span);
    const dist = Math.hypot(head.x - tailPos.x, head.y - tailPos.y);
    // Exposure ∝ distance covered inside the window: slow move, no blur.
    const strength = Math.min(1, dist / (o.fullAt || 60));
    if (strength <= 0.01) return out;
    for (let k = samples; k >= 1; k--) {
      const g = posAt(frame - (span * k) / samples);
      out.push({
        x: g.x, y: g.y,
        scale: 0.94 - (k / samples) * 0.1,
        opacity: maxOp * strength * (1 - k / (samples + 1)),
      });
    }
    return out;
  }

  // Squash-and-settle after a landing: pass frames since landing.
  function squash(frame: number, o?: unknown): { sx: number; sy: number } {
    o = o || {};
    void o;
    if (frame < 0) return { sx: 1, sy: 1 };
    const s = spring({ frame, fps: FPS, from: 1.45, to: 1, stiffness: 160, damping: 9 });
    return { sx: 2 - s, sy: s };
  }

  // ---------- HTML primitives (return markup strings) ----------

  // A circle. candy:true adds a glossy highlight (kid-friendly); glow adds a halo.
  function dot(o: DotOpts): string {
    const r = o.r * (o.scale == null ? 1 : o.scale);
    let bg = o.color;
    if (o.candy) bg = 'radial-gradient(circle at 32% 28%,#ffffffcc 0%,#ffffff22 32%,transparent 55%),' + o.color;
    let shadow = o.candy ? 'box-shadow:0 6px 18px ' + o.color + '66,inset 0 -6px 12px rgba(0,0,0,.12);' : '';
    if (o.glow) shadow = 'box-shadow:0 0 ' + (o.glowSize || 30) + 'px ' + o.color + (o.glowAlpha || '88') + ';';
    return '<div style="position:absolute;left:' + (o.x - r).toFixed(1) + 'px;top:' + (o.y - r).toFixed(1) +
      'px;width:' + (r * 2).toFixed(1) + 'px;height:' + (r * 2).toFixed(1) + 'px;border-radius:50%;background:' + bg + ';' +
      shadow + (o.opacity != null ? 'opacity:' + o.opacity + ';' : '') + (o.extra || '') + '"></div>';
  }

  // Expanding ring after an event (landing, correct answer). '' when finished.
  function ripple(frame: number, o: RippleOpts): string {
    const lf = frame - (o.at || 0), dur = o.dur || 30;
    if (lf < 0 || lf >= dur) return '';
    const rr = (o.r0 || 46) + lf * (o.speed || 5.4);
    const op = Math.max(0, 0.9 - lf * (0.9 / dur));
    return '<div style="position:absolute;left:' + (o.x - rr) + 'px;top:' + (o.y - rr) + 'px;width:' + (rr * 2) +
      'px;height:' + (rr * 2) + 'px;border-radius:50%;border:' + (o.width || 6) + 'px solid ' + o.color +
      ';opacity:' + op.toFixed(3) + ';"></div>';
  }

  // Confetti/particle burst from a point. Caller picks colors; shapes alternate.
  function burst(frame: number, o: BurstOpts): string {
    const p = clamp01((frame - (o.at || 0)) / (o.dur || 34));
    if (p <= 0 || p >= 1) return '';
    const colors = o.colors || ['#FF8A4C', '#3FB6FF', '#4ED06A', '#FFD93D'];
    const n = o.n || 12, dist = o.dist || 150;
    let s = '';
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + 0.25;
      const d = Easing.cubicOut(p) * (dist + (i % 4) * (dist * 0.28));
      const sz = 10 + (i % 3) * 6;
      s += '<div style="position:absolute;left:' + (o.x + Math.cos(ang) * d - sz / 2).toFixed(1) +
        'px;top:' + (o.y + Math.sin(ang) * d * 0.8 - sz / 2).toFixed(1) + 'px;width:' + sz + 'px;height:' + sz +
        'px;border-radius:' + (i % 2 ? '50%' : '4px') + ';background:' + colors[i % colors.length] +
        ';opacity:' + (1 - p).toFixed(3) + ';transform:rotate(' + Math.round(p * 260 + i * 40) + 'deg);"></div>';
    }
    return s;
  }

  // Pill badge that pops in with a slight rotation settle ("Correct!", "Make 10!").
  function badge(frame: number, o: BadgeOpts): string {
    const s = pop(frame, { at: o.at || 0, from: 0, to: 1, stiffness: 120, damping: 9 });
    if (s <= 0) return '';
    const pos = o.right != null
      ? 'right:' + o.right + 'px;top:' + o.top + 'px;'
      : 'left:' + o.left + 'px;top:' + o.top + 'px;';
    return '<div style="position:absolute;' + pos + 'transform:scale(' + s.toFixed(3) + ') rotate(' +
      ((1 - s) * -12).toFixed(1) + 'deg);background:' + o.color + ';color:' + (o.fg || '#fff') +
      ';font:800 ' + (o.size || 36) + 'px sans-serif;padding:18px 30px;border-radius:999px;' +
      'box-shadow:0 10px 28px ' + o.color + '66;">' + o.text + '</div>';
  }

  // Dashed "target slot" ring that breathes until filled.
  function targetSlot(frame: number, o: TargetSlotOpts): string {
    const b = pulse(frame, { amp: 0.08, speed: o.speed || 0.1 });
    const r = o.r * b;
    return '<div style="position:absolute;left:' + (o.x - r).toFixed(1) + 'px;top:' + (o.y - r).toFixed(1) +
      'px;width:' + (r * 2).toFixed(1) + 'px;height:' + (r * 2).toFixed(1) + 'px;border-radius:50%;border:5px dashed ' +
      o.color + ';opacity:.95;"></div>';
  }

  // ---------- scene helpers ----------

  // Which scene are we in? ranges: [[from,to],...] → {index, lf, len}
  function scene(frame: number, ranges: Point2[]): { index: number; lf: number; len: number } {
    for (let i = 0; i < ranges.length; i++) {
      if (frame >= ranges[i][0] && frame < ranges[i][1]) {
        return { index: i, lf: frame - ranges[i][0], len: ranges[i][1] - ranges[i][0] };
      }
    }
    const last = ranges[ranges.length - 1];
    return { index: ranges.length - 1, lf: frame - last[0], len: last[1] - last[0] };
  }

  // Scene-edge transition: fade + micro-zoom at both ends of a scene.
  function transition(lf: number, len: number, frames?: number): { opacity: number; scale: number } {
    const edge = Math.min(lf / (frames || 10), (len - lf) / (frames || 10), 1);
    return { opacity: Math.max(edge, 0), scale: 0.97 + 0.03 * edge };
  }

  // Attention wiggle: a decaying rotational shake ("look at this one!",
  // also the classic wrong-answer shake when amp is fast and short).
  // Returns a CSS transform value: 'rotate(..deg) translateX(..px)'.
  function wiggle(frame: number, o?: WiggleOpts): string {
    o = o || {};
    const lf = frame - (o.at || 0), dur = o.dur || 26;
    if (lf < 0 || lf >= dur) return 'rotate(0deg) translateX(0px)';
    const env = 1 - lf / dur;
    const a = Math.sin(lf * (o.freq || 0.85)) * (o.amp || 9) * env;
    return 'rotate(' + a.toFixed(2) + 'deg) translateX(' + (a * 0.9).toFixed(1) + 'px)';
  }

  // Typewriter: the visible substring of `text` at this frame.
  // cpf = frames per character (default 2). caret:true appends a blinking ▍.
  function typewriter(frame: number, o: TypewriterOpts): string {
    o = o || {};
    const lf = Math.max(frame - (o.at || 0), 0);
    const n = Math.min(Math.floor(lf / (o.cpf || 2)), o.text.length);
    let s = o.text.slice(0, n);
    if (o.caret && Math.floor(frame / 15) % 2 === 0) s += '▍';
    return s;
  }

  /* ------------------------------------------------------------------
     Advanced effects (v0.3). Motion vocabulary adapted from the
     code-video-director skill (beat/drop/punch/shake/flash, pacing
     tiers) and the layer stack from remotion-motion-graphics
     (mesh background -> content -> grade -> grain + vignette).
     All frame-pure and deterministic: hash() is the only "random".
     ------------------------------------------------------------------ */
  function hash(n: number): number { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  // beat(): entrance with anticipation — pull back a touch, rush in,
  // overshoot ~8%, settle with two small oscillations. Returns {x, s}:
  // x = pixel offset along the travel direction, s = scale.
  function beat(frame: number, o?: BeatOpts): { x: number; s: number } {
    o = o || {};
    const lf = frame - (o.at || 0), dist = o.dist || 90;
    if (lf < 0) return { x: -dist, s: 0.9 };
    if (lf > 40) return { x: 0, s: 1 };
    const x = -dist * Math.exp(-lf / 7) * Math.cos(lf * 0.5);
    return { x, s: 1 - (x / dist) * 0.1 };
  }

  // drop(): gravity fall — slow start, fastest at the end, hard stop.
  // Returns the y offset (<= 0). Pair with squash() at the landing frame.
  function drop(frame: number, o?: DropOpts): number {
    o = o || {};
    const lf = frame - (o.at || 0), from = o.from || 320, dur = o.dur || 11;
    if (lf < 0) return -from;
    if (lf >= dur) return 0;
    const p = lf / dur;
    return -from * (1 - p * p);
  }

  // travel(): A->B gliding with a fast start and a soft stop.
  function travel(frame: number, o: TravelOpts): TravelResult {
    o = o || {};
    const lf = frame - (o.at || 0), dur = o.dur || 18;
    const t = clamp01(lf / dur), p = 1 - Math.pow(1 - t, 3);
    return {
      x: o.from.x + (o.to.x - o.from.x) * p,
      y: o.from.y + (o.to.y - o.from.y) * p,
      p, done: lf >= dur,
    };
  }

  // orbit(): pose on a circular orbit around (cx, cy). squash < 1
  // flattens the circle into an ellipse (the classic tilted orbit);
  // depth scales the traveller from 0.72 at the back of the ellipse
  // to 1 at the front. Returns {x, y, angle, scale} like travel /
  // pathFly return poses — place the element yourself.
  function orbit(frame: number, o: OrbitOpts): OrbitResult {
    o = o || {};
    const a = (o.phase || 0) + frame * (o.speed == null ? 0.04 : o.speed);
    const r = o.r == null ? 100 : o.r;
    const sq = o.squash == null ? 1 : o.squash;
    const s = Math.sin(a);
    return {
      x: (o.cx || 0) + Math.cos(a) * r,
      y: (o.cy || 0) + s * r * sq,
      angle: a,
      scale: o.depth ? 0.72 + 0.28 * ((s + 1) / 2) : 1,
    };
  }

  // swing(): pendulum rotation as a rotate() transform string —
  // hang the element from a transform-origin above it (a sign on
  // a rod, a mobile, a hanging tag). angle = maxDeg * sin(2π *
  // lf / period + phase), with an optional exponential decay so a
  // disturbed sign settles to rest.
  function swing(frame: number, o: SwingOpts): string {
    o = o || {};
    const lf = Math.max(0, frame - (o.at || 0));
    const period = o.period || 46;
    const maxDeg = o.maxDeg == null ? 16 : o.maxDeg;
    const env = o.decay ? Math.exp(-o.decay * lf) : 1;
    const deg = maxDeg * Math.sin((lf / period) * Math.PI * 2 + (o.phase || 0)) * env;
    return 'rotate(' + deg.toFixed(2) + 'deg)';
  }

  // marquee(): a seamless infinite scroll strip. `content` is ONE
  // unit of the strip and `unit` its exact width in px — the strip
  // repeats it ceil(width / unit) + 1 times and translates by
  // (frame * speed) mod unit, so the loop point is invisible.
  // dir 'left' (default) or 'right'. Returns a clipped strip div
  // positioned at (x, y).
  function marquee(frame: number, o: MarqueeOpts): string {
    o = o || { content: '', unit: 100, width: 300 };
    const unit = o.unit || 100, width = o.width || 300;
    const speed = o.speed == null ? 2 : o.speed;
    const off = ((frame * speed) % unit + unit) % unit;
    const shift = o.dir === 'right' ? off - unit : -off;
    const copies = Math.ceil(width / unit) + 1;
    let inner = '';
    for (let i = 0; i < copies; i++) {
      inner += '<div style="flex:none;width:' + unit + 'px;overflow:hidden;">' + (o.content || '') + '</div>';
    }
    return '<div style="position:absolute;left:' + (o.x || 0) + 'px;top:' + (o.y || 0) +
      'px;width:' + width + 'px;overflow:hidden;"><div style="display:flex;transform:translateX(' +
      shift.toFixed(1) + 'px);">' + inner + '</div></div>';
  }

  // marchingAnts(): the editor selection outline — a dashed rect
  // whose dashes crawl around the border (dashoffset advances by
  // speed each frame, wrapping over the dash period). The
  // tutorial "look at this region" language.
  function marchingAnts(frame: number, o: MarchingAntsOpts): string {
    o = o || { w: 100, h: 60 };
    const w = o.w || 100, h = o.h || 60;
    const lw = o.width || 2, dash = o.dash || 7;
    const speed = o.speed == null ? 1.2 : o.speed;
    const off = -(((frame * speed) % (dash * 2)) + dash * 2) % (dash * 2);
    const inset = lw / 2;
    return '<svg style="position:absolute;left:' + (o.x || 0) + 'px;top:' + (o.y || 0) +
      'px;" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '"><rect x="' + inset +
      '" y="' + inset + '" width="' + (w - lw) + '" height="' + (h - lw) + '" rx="' + (o.r || 0) +
      '" fill="none" stroke="' + (o.color || '#E8E4DA') + '" stroke-width="' + lw +
      '" stroke-dasharray="' + dash + ' ' + dash + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg>';
  }

  // highlightBox(): a hand-drawn-feeling box that sketches itself
  // around a region over dur frames and stays — the tutorial
  // "look here" move. Corners and side midpoints carry a small
  // hash wobble (deterministic per seed) so it reads as drawn,
  // not stamped; `pad` inflates the box around the region.
  function highlightBox(frame: number, o: HighlightBoxOpts): string {
    o = o || { w: 100, h: 40 };
    const pad = o.pad == null ? 6 : o.pad;
    const x = (o.x || 0) - pad, y = (o.y || 0) - pad;
    const w = (o.w || 100) + pad * 2, h = (o.h || 40) + pad * 2;
    const at = o.at || 0, dur = o.dur || 16, seed = o.seed || 0;
    const wob = o.wobble == null ? 2 : o.wobble;
    const j = (i: number): number => (hash(seed * 31 + i * 7 + 3) - 0.5) * 2 * wob;
    const c = [
      [x + j(1), y + j(2)], [x + w + j(3), y + j(4)],
      [x + w + j(5), y + h + j(6)], [x + j(7), y + h + j(8)],
    ];
    const mid = (a: number[], b: number[], i: number): number[] =>
      [(a[0] + b[0]) / 2 + j(i), (a[1] + b[1]) / 2 + j(i + 1)];
    const m0 = mid(c[0], c[1], 9), m1 = mid(c[1], c[2], 11), m2 = mid(c[2], c[3], 13), m3 = mid(c[3], c[0], 15);
    const ox = x - wob - 4, oy = y - wob - 4; // svg origin: stage point (ox, oy) becomes local (0, 0)
    const L = (pt: number[]): string => (pt[0] - ox).toFixed(1) + ' ' + (pt[1] - oy).toFixed(1);
    const d = 'M ' + L(c[0]) +
      ' Q ' + L(m0) + ' ' + L(c[1]) +
      ' Q ' + L(m1) + ' ' + L(c[2]) +
      ' Q ' + L(m2) + ' ' + L(c[3]) +
      ' Q ' + L(m3) + ' ' + L(c[0]) + ' Z';
    const per = 2 * (w + h) * 1.02; // slight over-estimate covers the curves
    const p = clamp01((frame - at) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const off = per * (1 - eased);
    const sw = w + wob * 2 + 8, sh = h + wob * 2 + 8;
    return '<svg style="position:absolute;left:' + ox.toFixed(1) + 'px;top:' + oy.toFixed(1) +
      'px;" width="' + sw.toFixed(1) + '" height="' + sh.toFixed(1) +
      '" viewBox="0 0 ' + sw.toFixed(1) + ' ' + sh.toFixed(1) +
      '"><path d="' + d + '" fill="none" stroke="' + (o.color || '#FF8A4C') +
      '" stroke-width="' + (o.width || 3) + '" stroke-linecap="round" stroke-dasharray="' + per.toFixed(1) +
      '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg>';
  }

  // waveLine(): an animated sine wave line — the phase scrolls
  // with the frame. `wl` is the wavelength in px, `taper` (0..1)
  // mixes in a sin window so the wave swells in the middle and
  // settles at the ends. Voice/audio visuals, dividers, signals.
  function waveLine(frame: number, o: WaveLineOpts): string {
    o = o || {};
    const w = o.w || 300, amp = o.amp == null ? 10 : o.amp;
    const wl = o.wl || 90, speed = o.speed == null ? 0.18 : o.speed;
    const taper = o.taper || 0;
    const cx = o.x || 0, cy = o.y || 0;
    const step = 4;
    let d = '';
    for (let px = 0; px <= w; px += step) {
      const t = px / w;
      const win = (1 - taper) + taper * Math.sin(Math.PI * t);
      const yy = cy + Math.sin((px / wl) * Math.PI * 2 + frame * speed) * amp * win;
      d += (px === 0 ? 'M ' : ' L ') + (cx + px).toFixed(1) + ' ' + yy.toFixed(1);
    }
    return '<svg style="position:absolute;left:0;top:0;" width="100%" height="100%"><path d="' + d +
      '" fill="none" stroke="' + (o.color || '#5B7BA5') + '" stroke-width="' + (o.width || 3) +
      '" stroke-linecap="round"/></svg>';
  }

  // spotlight(): a dimmed stage with one lit hole — a radial
  // gradient overlay whose centre is static (x, y) or travels
  // between keyframes (keys, cubicInOut, the cursor convention).
  // Place it AFTER the content it should dim. Focus-the-eye for
  // walkthroughs; pairs with cursor.
  function spotlight(frame: number, o: SpotlightOpts): string {
    o = o || {};
    const r = o.r || 110, feather = o.feather == null ? 70 : o.feather;
    const alpha = o.alpha == null ? 0.78 : o.alpha;
    let cx = o.x || 0, cy = o.y || 0;
    const keys = o.keys || [];
    if (keys.length) {
      if (frame <= keys[0].f) { cx = keys[0].x; cy = keys[0].y; }
      else if (frame >= keys[keys.length - 1].f) { cx = keys[keys.length - 1].x; cy = keys[keys.length - 1].y; }
      else {
        for (let i = 0; i < keys.length - 1; i++) {
          const a = keys[i], b = keys[i + 1];
          if (frame >= a.f && frame <= b.f) {
            const p = (frame - a.f) / (b.f - a.f);
            const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
            cx = a.x + (b.x - a.x) * e; cy = a.y + (b.y - a.y) * e;
            break;
          }
        }
      }
    }
    return '<div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at ' +
      cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px, rgba(4,5,9,0) 0px, rgba(4,5,9,0) ' + r.toFixed(1) +
      'px, rgba(4,5,9,' + alpha + ') ' + (r + feather).toFixed(1) + 'px);"></div>';
  }

  // shake(): decaying screen shake {x, y} inside [at, at+dur].
  function shake(frame: number, o?: ShakeOpts): { x: number; y: number } {
    o = o || {};
    const lf = frame - (o.at || 0), dur = o.dur || 14, amp = o.amp || 10, seed = o.seed || 0;
    if (lf < 0 || lf >= dur) return { x: 0, y: 0 };
    const env = 1 - lf / dur;
    return {
      x: (hash(lf * 2 + seed) - 0.5) * 2 * amp * env,
      y: (hash(lf * 2 + 1 + seed) - 0.5) * 2 * amp * env,
    };
  }

  // punch(): a quick camera punch-in that settles back. Returns a scale
  // multiplier (1 = neutral). Compose with camera().
  function punch(frame: number, o?: PunchOpts): number {
    o = o || {};
    const lf = frame - (o.at || 0), amp = o.amp || 0.07;
    if (lf < 0) return 1;
    return 1 + amp * Math.min(lf / 2, 1) * Math.exp(-lf / 4.5);
  }

  // flash(): full-stage flash overlay (impact frames). Returns HTML.
  function flash(frame: number, o?: FlashOpts): string {
    o = o || {};
    const lf = frame - (o.at || 0), dur = o.dur || 3;
    if (lf < 0 || lf >= dur) return '';
    const op = (1 - lf / dur) * (o.opacity || 0.9);
    return '<div style="position:absolute;inset:0;background:' + (o.color || '#FFFFFF') +
      ';opacity:' + op.toFixed(3) + ';pointer-events:none;"></div>';
  }

  // Shared camera pose: the eased focus + zoom at a frame,
  // interpolated between keyframes (zoom in log space). camera() and
  // parallax() both consume it, so depth layers can never drift from
  // the camera move they belong to.
  function camPose(frame: number, keys: CamKey[]): { x: number; y: number; z: number } {
    let a = keys[0], b = keys[keys.length - 1];
    for (let i = 0; i < keys.length - 1; i++) {
      if (frame >= keys[i].f && frame <= keys[i + 1].f) { a = keys[i]; b = keys[i + 1]; break; }
    }
    if (frame <= keys[0].f) { a = b = keys[0]; }
    if (frame >= keys[keys.length - 1].f) { a = b = keys[keys.length - 1]; }
    const span = Math.max(b.f - a.f, 1);
    const t = Easing.cubicInOut(clamp01((frame - a.f) / span));
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * t),
    };
  }

  // camera(): a virtual camera over a world wrapper. keys = [{f, x, y, z}]
  // (focus point in stage coords + zoom), eased between keyframes.
  // Returns a CSS transform for a stage-sized wrapper div.
  function camera(frame: number, keys: CamKey[], stage: StageSize): string {
    const W = stage.w, H = stage.h;
    const p = camPose(frame, keys);
    return 'translate(' + (W / 2) + 'px,' + (H / 2) + 'px) scale(' + p.z.toFixed(4) +
      ') translate(' + (-p.x).toFixed(1) + 'px,' + (-p.y).toFixed(1) + 'px)';
  }

  // parallax(): the same camera move as camera(), felt at `depth`.
  // The layer's focus is pulled toward the stage center by depth and
  // its zoom is z^depth: depth 1 reproduces camera() exactly (the
  // world plane), depth 0 never moves (the sky), and layered scenes
  // live in between — near layers travel faster than far ones.
  function parallax(frame: number, keys: CamKey[], depth: number, stage: StageSize): string {
    const W = stage.w, H = stage.h;
    const p = camPose(frame, keys);
    const x = W / 2 + (p.x - W / 2) * depth;
    const y = H / 2 + (p.y - H / 2) * depth;
    const z = Math.exp(Math.log(p.z) * depth);
    return 'translate(' + (W / 2) + 'px,' + (H / 2) + 'px) scale(' + z.toFixed(4) +
      ') translate(' + (-x).toFixed(1) + 'px,' + (-y).toFixed(1) + 'px)';
  }

  // meshBg(): an animated gradient-mesh background value (drifting blobs).
  // blobs = [{c, x, y, r, dx, dy, sp}] in % — returns a CSS background value.
  function meshBg(frame: number, o?: MeshBgOpts): string {
    o = o || {};
    const blobs = o.blobs || [
      { c: '#3B2FBF', x: 18, y: 22, r: 55, dx: 6, dy: 4, sp: 0.011 },
      { c: '#B83A8C', x: 82, y: 16, r: 48, dx: -5, dy: 6, sp: 0.009 },
      { c: '#1F7A8C', x: 62, y: 84, r: 52, dx: 4, dy: -5, sp: 0.013 },
      { c: '#0E0B26', x: 30, y: 78, r: 60, dx: -4, dy: -3, sp: 0.007 },
    ];
    const parts = blobs.map((b, i) => {
      const cx = b.x + Math.sin(frame * b.sp + i * 1.7) * b.dx;
      const cy = b.y + Math.cos(frame * b.sp * 0.9 + i * 2.3) * b.dy;
      return 'radial-gradient(circle at ' + cx.toFixed(1) + '% ' + cy.toFixed(1) + '%, ' +
        b.c + ' 0%, transparent ' + b.r + '%)';
    });
    parts.push('linear-gradient(160deg, ' + (o.base || '#14101F') + ', ' + (o.base2 || '#0B0916') + ')');
    return parts.join(', ');
  }

  // drawOn(): stroke-dasharray value that draws a path of length `len`.
  function drawOn(frame: number, o: DrawOnOpts): string {
    o = o || {};
    const lf = frame - (o.at || 0), dur = o.dur || 40;
    const p = Easing.cubicInOut(clamp01(lf / dur));
    return (o.len * p).toFixed(1) + ' ' + o.len;
  }
  // Polyline helpers for drawOn: points [[x,y],...] -> {attr, len}.
  function poly(points: Point2[]): { attr: string; len: number } {
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      len += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    }
    return { attr: points.map((p) => p[0] + ',' + p[1]).join(' '), len: Math.round(len) };
  }

  // bars(): an animated bar chart (HTML). Values grow with a stagger.
  function bars(frame: number, o: BarsOpts): string {
    const max = Math.max.apply(null, o.data.map((d) => d.v));
    let s = '';
    o.data.forEach((d, i) => {
      const at = (o.at || 0) + i * (o.stagger || 5);
      const t = clamp01((frame - at) / (o.dur || 22));
      const p = 1 - Math.pow(1 - t, 3);
      const h = Math.max((d.v / max) * o.h * p, 0);
      const x = o.x + i * (o.bw + o.gap), y = o.y - h;
      s += '<div style="position:absolute;left:' + x + 'px;top:' + y.toFixed(1) + 'px;width:' + o.bw +
        'px;height:' + h.toFixed(1) + 'px;background:' + (d.c || o.color || '#FF8A4C') +
        ';border-radius:10px 10px 0 0;"></div>';
      if (t > 0.5) {
        s += '<div style="position:absolute;left:' + (x - 10) + 'px;top:' + (y - 40) + 'px;width:' + (o.bw + 20) +
          'px;text-align:center;font:800 26px sans-serif;color:' + (o.label || '#33302B') + ';">' +
          Math.round(d.v * p) + '</div>';
        s += '<div style="position:absolute;left:' + (x - 16) + 'px;top:' + (o.y + 12) + 'px;width:' + (o.bw + 32) +
          'px;text-align:center;font:600 20px sans-serif;color:' + (o.label || '#33302B') + ';opacity:.75;">' + d.k + '</div>';
      }
    });
    return s;
  }

  // scramble(): text that resolves out of a glyph pool, left to right.
  // Deterministic per frame; glyphs reshuffle every 2 frames until resolved.
  function scramble(frame: number, o: ScrambleOpts): string {
    o = o || {};
    const pool = o.chars || 'ABCDEFGHJKMNPQRSTUVWXYZ23456789#%&';
    const lf = frame - (o.at || 0);
    if (lf < 0) return '';
    const cpf = o.cpf || 3;
    let out = '';
    for (let i = 0; i < o.text.length; i++) {
      const ch = o.text[i];
      if (ch === ' ') { out += ' '; continue; }
      if (lf >= (i + 1) * cpf) out += ch;
      else out += pool[Math.floor(hash(i * 131 + Math.floor(frame / 2) * 17) * pool.length)];
    }
    return out;
  }

  // kenBurns(): the slow zoom + pan every still asset deserves.
  function kenBurns(frame: number, o?: KenBurnsOpts): string {
    o = o || {};
    const t = clamp01((frame - (o.at || 0)) / (o.dur || 300));
    const z = (o.from || 1) + ((o.to || 1.08) - (o.from || 1)) * t;
    const x = (o.panX || 0) * t, y = (o.panY || 0) * t;
    return 'scale(' + z.toFixed(4) + ') translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
  }

  // breathe(): idle micro-motion for anything on screen a while.
  // Returns a scale multiplier around 1.
  function breathe(frame: number, o?: BreatheOpts): number {
    o = o || {};
    return 1 + (o.amp || 0.02) * Math.sin(frame * (o.speed || 0.08) + (o.phase || 0));
  }

  // fx(): the texture stack that ends the "flat AI look" — animated film
  // grain (re-seeded every 3 frames) + vignette, as overlay HTML.
  function fx(frame: number, o?: FxOpts): string {
    o = o || {};
    const jx = Math.floor(hash(Math.floor(frame / 3) * 3) * 140);
    const jy = Math.floor(hash(Math.floor(frame / 3) * 7 + 1) * 140);
    const svg = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";
    let s = '<div style="position:absolute;inset:0;background-image:' + svg +
      ';background-position:' + jx + 'px ' + jy + 'px;opacity:' + (o.grain || 0.07) +
      ';mix-blend-mode:overlay;pointer-events:none;"></div>';
    s += '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,' +
      (o.vignette || 0.28) + ') 100%);pointer-events:none;"></div>';
    return s;
  }

  // ---- Paper-cut pack (v0.6) -------------------------------------------
  // The paper world: flat fills, a hard offset shadow for paper thickness,
  // small resting rotations, puppet joints, stop-motion timing.

  // A cut-paper shape centered on (x, y). shape: 'rect' | 'circle' | 'blob'
  // (blob = irregular hand-cut edge). `thick` is the offset-shadow depth —
  // keep it consistent across a scene so the paper stock reads as one.
  function paperEl(o: PaperElOpts): string {
    const w = o.w || 120, h = o.h || 80;
    const thick = o.thick == null ? 5 : o.thick;
    const shape = o.shape || 'rect';
    let radius = shape === 'circle' ? '50%' : (o.radius == null ? 6 : o.radius) + 'px';
    if (shape === 'blob') radius = '58% 42% 55% 45% / 48% 55% 45% 52%';
    return '<div style="position:absolute;left:' + (o.x - w / 2).toFixed(1) + 'px;top:' + (o.y - h / 2).toFixed(1) +
      'px;width:' + w + 'px;height:' + h + 'px;background:' + o.color + ';border-radius:' + radius +
      ';box-shadow:' + thick + 'px ' + thick + 'px 0 ' + (o.shadow || 'rgba(59,42,28,.32)') +
      ';transform:rotate(' + (o.rot || 0) + 'deg)' + (o.scale ? ' scale(' + o.scale + ')' : '') +
      (o.opacity != null ? ';opacity:' + o.opacity : '') + (o.extra || '') + '"></div>';
  }

  // Paper-puppet joint: eased rotation between two angles, returned as a
  // CSS transform value (like wiggle). The caller positions the element so
  // its transform-origin sits on the joint. `steps` quantizes the swing for
  // stop-motion stiffness.
  function pivot(frame: number, o: PivotOpts): string {
    const dur = o.dur || 30;
    let p = (Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut)(clamp01((frame - (o.at || 0)) / dur));
    if (o.steps) p = Math.floor(p * o.steps) / o.steps;
    const deg = (o.from || 0) + ((o.to || 0) - (o.from || 0)) * p;
    return 'rotate(' + deg.toFixed(2) + 'deg)';
  }

  // Stop-motion progress: eased progress snapped to N discrete levels, so
  // any motion driven by it advances in visible steps instead of gliding.
  function stepped(frame: number, o: SteppedOpts): number {
    const dur = o.dur || 30, steps = o.steps || 6;
    const raw = clamp01((frame - (o.at || 0)) / dur);
    if (raw >= 1) return 1;
    const p = (Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut)(raw);
    return Math.floor(p * steps) / steps;
  }

  // Shot-on-twos frame snap: feed the result into any primitive (or a
  // whole composition) and time itself moves in steps — the cheapest
  // stop-motion feel there is. `every: 3` shoots on threes.
  function onTwos(frame: number, o?: OnTwosOpts): number {
    const every = (o && o.every) || 2;
    return frame - (frame % every);
  }

  // Whip-pan transition: lay the outgoing and incoming scenes side by side
  // on a strip of width 2W and translate the strip by `x`. The offset curve
  // is slowest at both ends and fastest mid-pan (where the cut hides), and
  // `blur` peaks there too — feed it to a CSS blur on the strip, or smear
  // the moving elements. dir: 1 pans left (incoming from the right).
  function whip(frame: number, o?: WhipOpts): WhipResult {
    o = o || {};
    const dur = o.dur || 14, dir = o.dir || 1, W = o.width || 1280;
    const raw = clamp01((frame - (o.at || 0)) / dur);
    const p = (Easing.cubicInOut)(raw);
    return {
      x: -dir * W * p + 0, // +0 normalizes -0 at the start point
      blur: Math.sin(raw * Math.PI) * (o.maxBlur == null ? 14 : o.maxBlur),
      raw, active: raw > 0 && raw < 1,
    };
  }

  // Flight along an arbitrary polyline at constant speed (arc-length
  // parameterized), with heading. pts: [[x, y], ...] — feed it a sampled
  // curve for smooth paths. Easing shapes the distance profile, so the
  // traveler neither surges on long legs nor crawls on short ones.
  // Returns {x, y, angle (deg), p, done}.
  function pathFly(frame: number, o: PathFlyOpts): PathFlyResult {
    const pts = o.pts || [];
    if (pts.length < 2) { const q = pts[0] || [0, 0]; return { x: q[0], y: q[1], angle: 0, p: 0, done: false }; }
    const raw = clamp01((frame - (o.at || 0)) / (o.dur || 90));
    const p = (Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut)(raw);
    const segs: number[] = [];
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      segs.push(len); total += len;
    }
    let d = p * total;
    for (let i = 0; i < segs.length; i++) {
      const a = pts[i], b = pts[i + 1];
      const angle = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
      if (d <= segs[i] || i === segs.length - 1) {
        const t = segs[i] === 0 ? 0 : Math.min(d / segs[i], 1);
        return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, angle, p, done: raw >= 1 };
      }
      d -= segs[i];
    }
    // Unreachable when pts.length >= 2 (the loop always returns); kept so
    // the function has a defined end — the original fell through to
    // undefined in the same unreachable case.
    return { x: 0, y: 0, angle: 0, p, done: raw >= 1 };
  }

  // 3D flip entrance: the element rotates in from edge-on (±`from` degrees)
  // around the X or Y axis and settles with a slight overshoot (backOut).
  // Returns a style string like fadeUp — perspective is baked into the
  // transform, so it works on any element without a prepared parent.
  function flipIn(frame: number, o?: FlipInOpts): string {
    o = o || {};
    const dur = o.dur || 22;
    const raw = clamp01((frame - (o.at || 0)) / dur);
    const from = o.from == null ? 88 : o.from;
    const p = (Easing.backOut || Easing.cubicOut)(raw);
    const deg = from * (1 - p);
    return 'transform:perspective(' + (o.perspective || 800) + 'px) rotate' + (o.axis || 'Y') +
      '(' + deg.toFixed(2) + 'deg);opacity:' + Math.min(1, raw * 3).toFixed(3) + ';';
  }

  // Odometer digit roll: every decimal column is a digit strip sliding
  // inside a clipped window, rolling forward from the `from` digit to the
  // `to` digit (plus `spin` extra full turns for flair). Columns start
  // staggered from the ones place up, so the roll settles in a leftward
  // cascade and lands perfectly aligned. Returns an HTML string.
  function counterRoll(frame: number, o?: CounterRollOpts): string {
    o = o || {};
    const from = Math.max(0, Math.round(o.from || 0));
    const to = Math.max(0, Math.round(o.to == null ? 100 : o.to));
    const size = o.size || 64;
    const digits = Math.max(String(from).length, String(to).length);
    const dur = o.dur || 45, staggerF = o.stagger == null ? 4 : o.stagger;
    const spin = o.spin == null ? 1 : o.spin;
    let cols = '';
    for (let i = 0; i < digits; i++) {
      const k = digits - 1 - i; // place from the right (0 = ones)
      const place = Math.pow(10, k);
      const sd = Math.floor(from / place) % 10;
      const ed = Math.floor(to / place) % 10;
      const delta = (ed - sd + 10) % 10 + 10 * spin;
      const rawK = clamp01((frame - (o.at || 0) - k * staggerF) / dur);
      const p = (Easing[o.fn || 'cubicOut'] || Easing.cubicOut)(rawK);
      let strip = '';
      for (let j = 0; j <= delta; j++) {
        strip += '<div style="height:' + size + 'px;line-height:' + size + 'px;">' + ((sd + j) % 10) + '</div>';
      }
      cols += '<div style="display:inline-block;width:' + (size * 0.62).toFixed(1) + 'px;height:' + size +
        'px;overflow:hidden;vertical-align:top;"><div style="transform:translateY(' +
        (-delta * p * size).toFixed(2) + 'px);">' + strip + '</div></div>';
    }
    return '<div style="display:inline-block;font:800 ' + size + 'px ' +
      (o.fontFamily || 'ui-monospace, Menlo, monospace') + ';color:' + (o.color || '#33302B') +
      ';text-align:center;">' + cols + '</div>';
  }

  // Handwriting-style stroke text: the glyph outlines draw themselves
  // at pen speed, then the fill settles in over the final stretch. The
  // glyph shapes come from the rendered font itself (SVG <text> with a
  // normalized pathLength), so any script the font covers — Latin, CJK,
  // digits — draws the same way; there is no built-in glyph set to run
  // out of. Returns an absolutely-positioned SVG string; '' before `at`.
  function drawText(frame: number, o: DrawTextOpts): string {
    o = o || {};
    const p = (Easing[o.fn || 'linear'] || Easing.linear)(clamp01((frame - (o.at || 0)) / (o.dur || 45)));
    if (p <= 0) return '';
    const size = o.size || 64;
    const fill = o.color || '#33302B';
    const fillFrom = o.fillFrom == null ? 0.65 : o.fillFrom;
    const fo = clamp01((p - fillFrom) / (1 - fillFrom));
    const esc = String(o.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return '<svg style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;">' +
      '<text x="' + (o.x || 0) + '" y="' + (o.y || 0) + '" text-anchor="' + (o.anchor || 'middle') + '"' +
      ' font-family="' + (o.fontFamily || 'sans-serif') + '" font-size="' + size + '" font-weight="' + (o.weight || 700) + '"' +
      (o.letterSpacing ? ' letter-spacing="' + o.letterSpacing + '"' : '') +
      ' fill="' + fill + '" fill-opacity="' + fo.toFixed(3) + '"' +
      ' stroke="' + (o.stroke || fill) + '" stroke-width="' + (o.strokeWidth == null ? Math.max(1, size / 30) : o.strokeWidth) + '"' +
      ' stroke-linejoin="round" stroke-linecap="round"' +
      ' pathLength="100" stroke-dasharray="100" stroke-dashoffset="' + (100 * (1 - p)).toFixed(2) + '">' +
      esc + '</text></svg>';
  }

  // Ambient particle layer: stars / dust / snow drifting behind (or
  // over) a scene. Every particle's home, size, speed and phase come
  // from hash(seed, i), so the field is a pure function of the frame
  // and never needs state. Modes: 'float' (gentle wander — dust motes,
  // stars), 'snow' (falls, sways, wraps), 'rise' (bubbles / embers
  // climbing, wraps). `twinkle` modulates opacity per particle.
  function particleField(frame: number, o?: ParticleFieldOpts): string {
    o = o || {};
    const n = o.n || 40, w = o.w || 1280, h = o.h || 720;
    const mode = o.mode || 'float';
    const seed = o.seed || 0;
    const rMin = o.rMin == null ? 1.5 : o.rMin, rMax = o.rMax == null ? 3.5 : o.rMax;
    const baseOp = o.opacity == null ? 0.7 : o.opacity;
    const tw = o.twinkle == null ? 0.35 : o.twinkle;
    const swayBase = o.sway == null ? 14 : o.sway;
    const span = h + 20;
    let s = '';
    for (let i = 0; i < n; i++) {
      const hx = hash(i * 12.9 + seed * 7.1 + 11);
      const hy = hash(i * 78.2 + seed * 3.7 + 5);
      const hs = hash(i * 37.7 + seed * 1.9 + 23);
      const hp = hash(i * 53.3 + seed * 0.7 + 41);
      const r = rMin + hs * (rMax - rMin);
      const swayAmp = swayBase * (0.4 + hx);
      const ph = hp * Math.PI * 2;
      const swaySp = 0.008 + hs * 0.012;
      let x: number, y: number;
      if (mode === 'snow') {
        const fall = (o.speed == null ? 0.7 : o.speed) * (0.6 + hp * 0.9);
        y = ((hy * span + frame * fall) % span) - 10;
        x = hx * w + Math.sin(frame * swaySp + ph) * swayAmp;
      } else if (mode === 'rise') {
        const rise = (o.speed == null ? 0.55 : o.speed) * (0.6 + hp * 0.9);
        y = (h + 10) - ((hy * span + frame * rise) % span);
        x = hx * w + Math.sin(frame * swaySp + ph) * swayAmp;
      } else {
        x = hx * w + Math.sin(frame * swaySp + ph) * swayAmp;
        y = hy * h + Math.cos(frame * swaySp * 0.8 + ph) * swayAmp * 0.6;
      }
      const op = baseOp * (1 - tw + tw * (0.5 + 0.5 * Math.sin(frame * (0.03 + hs * 0.05) + ph)));
      s += '<div style="position:absolute;left:' + (x - r).toFixed(1) + 'px;top:' + (y - r).toFixed(1) +
        'px;width:' + (r * 2).toFixed(1) + 'px;height:' + (r * 2).toFixed(1) + 'px;border-radius:50%;background:' +
        (o.color || '#FFFFFF') + ';opacity:' + op.toFixed(3) + ';"></div>';
    }
    return s;
  }

  // ---- shape morphing ------------------------------------------------
  // Every shape is a closed polygon. Both shapes are sampled at the
  // same K angles around the center (ray-cast onto the polygon, so the
  // sampled points lie exactly on the boundary), then corresponding
  // points are lerped. Angle correspondence keeps features at their
  // compass positions — a star's tip grows out of the circle's top
  // instead of swooping in from the side, which is what arc-length
  // correspondence does. All seven shapes are star-convex around their
  // center, so every ray lands exactly once. `size` = bounding radius.
  function shapeVertices(name: ShapeName, R: number): [number, number][] {
    const P = (deg: number, r: number): [number, number] => {
      const a = (deg * Math.PI) / 180;
      return [r * Math.cos(a), r * Math.sin(a)];
    };
    switch (name) {
      case 'square': return [-135, -45, 45, 135].map((d) => P(d, R));
      case 'diamond': return [-90, 0, 90, 180].map((d) => P(d, R));
      case 'triangle': return [-90, 30, 150].map((d) => P(d, R));
      case 'hexagon': return [-90, -30, 30, 90, 150, 210].map((d) => P(d, R));
      case 'star': {
        const v: [number, number][] = [];
        for (let k = 0; k < 5; k++) { v.push(P(-90 + k * 72, R)); v.push(P(-90 + 36 + k * 72, R * 0.45)); }
        return v;
      }
      case 'heart': {
        // Classic parametric heart, recentered by its bounding box and
        // scaled so the larger half-extent equals R.
        const raw: [number, number][] = [];
        for (let k = 0; k < 64; k++) {
          const t = (k / 64) * Math.PI * 2;
          const s = Math.sin(t);
          raw.push([16 * s * s * s, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]);
        }
        let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        for (const p of raw) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
        const sc = R / Math.max((x1 - x0) / 2, (y1 - y0) / 2);
        return raw.map((p): [number, number] => [(p[0] - (x0 + x1) / 2) * sc, (p[1] - (y0 + y1) / 2) * sc]);
      }
      default: { // circle
        const v: [number, number][] = [];
        for (let k = 0; k < 64; k++) v.push(P((k / 64) * 360, R));
        return v;
      }
    }
  }
  function sampleShape(verts: [number, number][], K: number, fallbackR: number): [number, number][] {
    const cross = (ax: number, ay: number, bx: number, by: number): number => ax * by - ay * bx;
    const out: [number, number][] = [];
    for (let k = 0; k < K; k++) {
      const a = -Math.PI / 2 + (k / K) * Math.PI * 2;
      const dx = Math.cos(a), dy = Math.sin(a);
      let best = -1;
      for (let i = 0; i < verts.length; i++) {
        const A = verts[i], B = verts[(i + 1) % verts.length];
        const ex = B[0] - A[0], ey = B[1] - A[1];
        const den = cross(dx, dy, ex, ey);
        if (Math.abs(den) < 1e-12) continue;
        const t = cross(A[0], A[1], ex, ey) / den;
        const u = cross(A[0], A[1], dx, dy) / den;
        if (t > 0 && u >= -1e-9 && u <= 1 + 1e-9 && t > best) best = t;
      }
      const r = best > 0 ? best : fallbackR;
      out.push([dx * r, dy * r]);
    }
    return out;
  }
  // Shape A -> B morph (circle, square, triangle, diamond, hexagon,
  // star, heart). Always renders the current interpolated shape —
  // progress clamps, so it holds `from` before `at` and `to` after.
  function morphShape(frame: number, o?: MorphShapeOpts): string {
    o = o || {};
    const names: ShapeName[] = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star', 'heart'];
    const pick = (n?: ShapeName): ShapeName => (n && names.indexOf(n) >= 0 ? n : 'circle');
    const R = o.size || 60;
    const A = sampleShape(shapeVertices(pick(o.from), R), 72, R);
    const B = sampleShape(shapeVertices(pick(o.to), R), 72, R);
    const p = (Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut)(clamp01((frame - (o.at || 0)) / (o.dur || 40)));
    const rot = ((o.rot || 0) * Math.PI) / 180;
    const cr = Math.cos(rot), sr = Math.sin(rot);
    const cx = o.x || 0, cy = o.y || 0;
    const pts: string[] = [];
    for (let k = 0; k < A.length; k++) {
      const x = A[k][0] + (B[k][0] - A[k][0]) * p;
      const y = A[k][1] + (B[k][1] - A[k][1]) * p;
      pts.push((cx + x * cr - y * sr).toFixed(1) + ',' + (cy + x * sr + y * cr).toFixed(1));
    }
    return '<svg style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;">' +
      '<polygon points="' + pts.join(' ') + '" fill="' + (o.color || '#E4572E') + '"' +
      (o.stroke ? ' stroke="' + o.stroke + '" stroke-width="' + (o.strokeWidth == null ? 3 : o.strokeWidth) + '" stroke-linejoin="round"' : '') +
      '/></svg>';
  }

  // RGB-split glitch transition — short and tasteful by design. Inside
  // the window the content is rebuilt from horizontal slices that jump
  // sideways (jitter re-rolls every 2 frames, an on-twos stutter), with
  // two channel-isolated ghosts (SVG feColorMatrix) offset behind it.
  // A sine envelope ramps the whole thing in and out, so the first and
  // last frames are clean. Outside the window the html passes through
  // untouched. `blend` picks the ghost composite: 'screen' for dark
  // scenes, 'multiply' for light ones.
  function glitch(frame: number, o: GlitchOpts): string {
    o = o || {};
    const html = o.html || '';
    const at = o.at || 0, dur = o.dur || 18;
    if (frame < at || frame >= at + dur) return html;
    const p = (frame - at) / dur;
    const amount = (o.amount == null ? 14 : o.amount) * Math.sin(Math.PI * p);
    const slices = o.slices || 6;
    const seed = o.seed || 0;
    const q = Math.floor((frame - at) / 2);
    const id = 'gl' + at + 'x' + seed;
    let s = '<svg width="0" height="0" style="position:absolute;"><defs>' +
      '<filter id="' + id + 'r"><feColorMatrix type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"/></filter>' +
      '<filter id="' + id + 'c"><feColorMatrix type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/></filter>' +
      '</defs></svg>';
    const layer = (inner: string): string => '<div style="position:absolute;inset:0;">' + inner + '</div>';
    const ghost = (fid: string, dx: number): string =>
      '<div style="position:absolute;inset:0;opacity:0.55;mix-blend-mode:' + (o.blend || 'multiply') +
      ';filter:url(#' + fid + ');transform:translateX(' + dx.toFixed(1) + 'px);">' + html + '</div>';
    s += ghost(id + 'r', -amount * 0.7) + ghost(id + 'c', amount * 0.7);
    for (let i = 0; i < slices; i++) {
      const top = (i * 100) / slices, bottom = 100 - ((i + 1) * 100) / slices;
      const roll = hash(seed * 7.3 + i * 13.7 + q * 29.1);
      const jump = hash(seed * 3.1 + i * 7.9 + q * 17.3) < 0.4 ? 0 : (roll - 0.5) * 2 * amount;
      s += '<div style="position:absolute;inset:0;clip-path:inset(' + top.toFixed(2) + '% 0 ' + bottom.toFixed(2) +
        '% 0);transform:translateX(' + jump.toFixed(1) + 'px);">' + html + '</div>';
    }
    return layer(s);
  }

  // Beat tools — the BPM half of music-synced work. (Named beatGrid,
  // not beat: `beat` is the older anticipation-entrance primitive.)
  // `beatGrid` reports where a frame sits inside the grid: which beat
  // (index), how far through it (phase 0..1), a decaying pulse for
  // scale/opacity accents, and bar position. `beatFrames` generates
  // the grid itself as frame numbers — drop them straight into an SFX
  // score (frames.map(f => ({ f, s: 'kick' }))) or use as cut points.
  // fps defaults to 30 (the renderer default); pass 60 for the site
  // player or any 60 fps timeline.
  function beatGrid(frame: number, o: BeatGridOpts): BeatInfo {
    const fpb = (60 / (o.bpm || 120)) * (o.fps || 30);
    const t = (frame - (o.at || 0)) / fpb;
    const index = Math.floor(t);
    const phase = t - index;
    const perBar = o.perBar || 4;
    return {
      beat: t, index, phase,
      pulse: (1 - phase) * (1 - phase),
      bar: Math.floor(index / perBar),
      inBar: ((index % perBar) + perBar) % perBar,
    };
  }
  function beatFrames(o: BeatGridOpts & { count: number }): number[] {
    const fpb = (60 / (o.bpm || 120)) * (o.fps || 30);
    const out: number[] = [];
    for (let i = 0; i < (o.count || 0); i++) out.push(Math.round((o.at || 0) + i * fpb));
    return out;
  }

  // morphPoly — morphShape's raw engine for arbitrary polygons:
  // interpolate between two point sets ([[x, y], ...], local coords,
  // placed at o.x/o.y). Point sets pair index-by-index; when counts
  // differ, the shorter polygon's longest edges are split at their
  // midpoints until counts match, so every caller vertex survives.
  // Progress clamps like morphShape (holds `from` / `to` outside the
  // window). Pairing quality depends on the caller listing both sets
  // in the same rotational order from a similar start point.
  function morphPoly(frame: number, o: MorphPolyOpts): string {
    o = o || ({} as MorphPolyOpts);
    const even = (pts: [number, number][], n: number): [number, number][] => {
      const out = pts.slice();
      while (out.length < n) {
        let bi = 0, bl = -1;
        for (let i = 0; i < out.length; i++) {
          const a = out[i], b = out[(i + 1) % out.length];
          const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
          if (L > bl) { bl = L; bi = i; }
        }
        const a = out[bi], b = out[(bi + 1) % out.length];
        out.splice(bi + 1, 0, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as [number, number]);
      }
      return out;
    };
    const n = Math.max(o.from.length, o.to.length);
    const A = even(o.from, n), B = even(o.to, n);
    const p = (Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut)(clamp01((frame - (o.at || 0)) / (o.dur || 40)));
    const rot = ((o.rot || 0) * Math.PI) / 180;
    const cr = Math.cos(rot), sr = Math.sin(rot);
    const cx = o.x || 0, cy = o.y || 0;
    const pts: string[] = [];
    for (let k = 0; k < n; k++) {
      const x = A[k][0] + (B[k][0] - A[k][0]) * p;
      const y = A[k][1] + (B[k][1] - A[k][1]) * p;
      pts.push((cx + x * cr - y * sr).toFixed(1) + ',' + (cy + x * sr + y * cr).toFixed(1));
    }
    return '<svg style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;">' +
      '<polygon points="' + pts.join(' ') + '" fill="' + (o.color || '#3E7CB1') + '"' +
      (o.stroke ? ' stroke="' + o.stroke + '" stroke-width="' + (o.strokeWidth == null ? 3 : o.strokeWidth) + '" stroke-linejoin="round"' : '') +
      '/></svg>';
  }

  // Split-text entrance: every character animates in on its own
  // stagger — the title workhorse. Modes: 'rise' (floats up while
  // fading in), 'pop' (scales in with an easeOutBack overshoot),
  // 'fade' (opacity only). Characters are inline-block spans, so the
  // line layout never shifts; the wrapper centers on (x, y).
  function splitText(frame: number, o: SplitTextOpts): string {
    o = o || ({} as SplitTextOpts);
    const size = o.size || 64;
    const stag = o.stagger == null ? 3 : o.stagger;
    const dur = o.dur || 16;
    const mode = o.mode || 'rise';
    const fn = Easing[o.fn || 'cubicOut'] || Easing.cubicOut;
    const esc = (ch: string): string => (ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch);
    const spans = String(o.text || '').split('').map((ch, i) => {
      const raw = clamp01((frame - (o.at || 0) - i * stag) / dur);
      const p = fn(raw);
      let transform = '';
      if (mode === 'rise') transform = 'transform:translateY(' + ((1 - p) * size * 0.55).toFixed(1) + 'px);';
      else if (mode === 'pop') {
        const c1 = 1.70158, c3 = c1 + 1; // easeOutBack, applied to the raw progress
        const back = 1 + c3 * Math.pow(raw - 1, 3) + c1 * Math.pow(raw - 1, 2);
        transform = 'transform:scale(' + (raw <= 0 ? 0 : 0.3 + 0.7 * back).toFixed(3) + ');';
      }
      return '<span style="display:inline-block;white-space:pre;opacity:' + p.toFixed(3) + ';' + transform + '">' + esc(ch) + '</span>';
    }).join('');
    return '<div style="position:absolute;left:' + (o.x || 0) + 'px;top:' + (o.y || 0) + 'px;transform:translate(-50%,-50%);font-family:' +
      (o.fontFamily || 'sans-serif') + ';font-size:' + size + 'px;font-weight:' + (o.weight || 800) + ';color:' + (o.color || '#26221F') +
      ';white-space:nowrap;">' + spans + '</div>';
  }

  // Directional wipe reveal: wraps any HTML in a full-stage layer
  // whose clip-path inset sweeps open in `dir` (the direction the
  // reveal travels). The content itself never moves — unlike whip,
  // which pans whole scenes — so text and diagrams land exactly
  // where they will stay.
  function wipeReveal(frame: number, o: WipeOpts): string {
    o = o || ({} as WipeOpts);
    const dur = o.dur || 24;
    const fn = Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut;
    const p = fn(clamp01((frame - (o.at || 0)) / dur));
    const hidden = ((1 - p) * 100).toFixed(1);
    let inset: string;
    switch (o.dir || 'right') {
      case 'left': inset = 'inset(0 0 0 ' + hidden + '%)'; break;
      case 'up': inset = 'inset(' + hidden + '% 0 0 0)'; break;
      case 'down': inset = 'inset(0 0 ' + hidden + '% 0)'; break;
      default: inset = 'inset(0 ' + hidden + '% 0 0)';
    }
    return '<div style="position:absolute;inset:0;clip-path:' + inset + ';">' + (o.html || '') + '</div>';
  }

  // Confetti cannon: n paper bits burst from (x, y) in an upward
  // cone (spread degrees around vertical), tumble as they fly
  // (rotation + a scaleX paper-flip), and fall under gravity.
  // Every bit's launch, size, color, and tumble derive from
  // hash() mixes of the bit index and `seed` — same seed, same
  // celebration. Bits fade over the last 18 frames of `life`,
  // then the layer is gone.
  function confetti(frame: number, o: ConfettiOpts): string {
    o = o || {};
    const t = frame - (o.at || 0);
    const life = o.life || 75;
    if (t < 0 || t > life) return '';
    const n = o.n || 60;
    const power = o.power || 13;
    const spread = o.spread || 80;
    const g = o.gravity == null ? 0.32 : o.gravity;
    const seed = o.seed || 1;
    const base = o.size || 9;
    const colors = o.colors || ['#F4604E', '#FFC53D', '#3FB6FF', '#39D98A', '#FF7AB6'];
    const fade = clamp01((life - t) / 18);
    let bits = '';
    for (let i = 0; i < n; i++) {
      const H = (a: number, b: number): number => hash(i * a + seed * b);
      const ang = (-90 + (H(12.9, 7.1) - 0.5) * spread) * Math.PI / 180;
      const v = power * (0.45 + 0.6 * H(78.2, 3.7));
      const px = (o.x || 0) + Math.cos(ang) * v * t;
      const py = (o.y || 0) + Math.sin(ang) * v * t + 0.5 * g * t * t;
      const rot = H(37.7, 1.9) * 360 + t * (2 + 5 * H(53.3, 0.7));
      const flip = Math.cos(t * (0.12 + 0.15 * H(91.7, 2.3)) + H(17.3, 5.9) * 6.2832);
      const w = base * (0.6 + 0.7 * H(67.1, 11.3));
      const color = colors[Math.floor(H(29.9, 17.7) * colors.length) % colors.length];
      bits += '<div style="position:absolute;left:' + px.toFixed(1) + 'px;top:' + py.toFixed(1) +
        'px;width:' + w.toFixed(1) + 'px;height:' + (w * 0.62).toFixed(1) + 'px;border-radius:2px;background:' + color +
        ';opacity:' + fade.toFixed(2) + ';transform:rotate(' + rot.toFixed(0) + 'deg) scaleX(' + flip.toFixed(2) + ');"></div>';
    }
    return '<div style="position:absolute;inset:0;">' + bits + '</div>';
  }

  // Animated mouse cursor for software demos and UI walkthroughs.
  // Travels the keyframed `path` (cubicInOut per segment, holds at
  // both ends), dips on each `clicks` frame, and emits an expanding
  // ring from the click point. Visible from the first key's frame
  // (or `showFrom`) until `showTo`. The arrow is an inline SVG with
  // its hotspot at the wrapper's origin.
  function cursor(frame: number, o: CursorOpts): string {
    o = o || ({} as CursorOpts);
    const keys = (o.path || []).slice().sort((a, b) => a.f - b.f);
    if (!keys.length) return '';
    const from = o.showFrom == null ? keys[0].f : o.showFrom;
    const to = o.showTo == null ? Infinity : o.showTo;
    if (frame < from || frame > to) return '';
    const posAt = (f: number): CursorKey => {
      if (f <= keys[0].f) return keys[0];
      for (let i = 0; i < keys.length - 1; i++) {
        const a = keys[i], b = keys[i + 1];
        if (f <= b.f) {
          const p = Easing.cubicInOut(clamp01((f - a.f) / Math.max(b.f - a.f, 1)));
          return { f, x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p };
        }
      }
      return keys[keys.length - 1];
    };
    const pos = posAt(frame);
    let scale = 1;
    let rings = '';
    const ringColor = o.ring || '#2F6DB3';
    for (const c of o.clicks || []) {
      const d = frame - c;
      if (d >= 0 && d <= 5) {
        const k = d <= 2 ? d / 2 : (5 - d) / 3;
        scale = Math.min(scale, 1 - 0.2 * k);
      }
      if (d >= 0 && d < 14) {
        const cp = posAt(c);
        const r = 6 + d * 2.2;
        rings += '<div style="position:absolute;left:' + cp.x.toFixed(1) + 'px;top:' + cp.y.toFixed(1) +
          'px;width:' + (r * 2).toFixed(1) + 'px;height:' + (r * 2).toFixed(1) +
          'px;transform:translate(-50%,-50%);border-radius:50%;border:3px solid ' + ringColor +
          ';opacity:' + ((1 - d / 14) * 0.75).toFixed(2) + ';"></div>';
      }
    }
    const size = o.size || 30;
    const svg = '<svg width="' + size + '" height="' + Math.round(size * 27 / 20) + '" viewBox="0 0 20 27">' +
      '<path d="M1 1 L1 20.5 L6.2 16.4 L9.8 25.4 L12.9 24.1 L9.2 15.6 L16.8 15.6 Z" fill="' + (o.color || '#FFFFFF') +
      '" stroke="#26221F" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    return rings + '<div style="position:absolute;left:' + pos.x.toFixed(1) + 'px;top:' + pos.y.toFixed(1) +
      'px;transform:scale(' + scale.toFixed(3) + ');transform-origin:0 0;pointer-events:none;">' + svg + '</div>';
  }

  /* ----------------------------------------------------------------
     Isometric kit: solid parts on one fixed iso camera (30 degrees,
     no perspective), in the anatomy tradition — every part is a
     filled solid, faces shaded by orientation (top lightest), and
     parts paint back to front (isoSort orders them by x + y, then
     z). Geometry is a pure function of the options, so compositions
     animate by varying x / y / z per frame — parts can drop in,
     slide, and assemble. World units project at `unit` px each;
     (ox, oy) is where world (0, 0, 0) lands on stage. */
  const ISO_C = 0.8660254, ISO_S = 0.5;
  function isoPt(o: IsoBase, x: number, y: number, z: number): [number, number] {
    const unit = o.unit || 36;
    return [(o.ox || 0) + (x - y) * unit * ISO_C, (o.oy || 0) + (x + y) * unit * ISO_S - z * unit];
  }
  function shade(hex: string, pct: number): string {
    const n = hex.replace('#', '');
    const full = n.length === 3 ? n.split('').map((c) => c + c).join('') : n;
    const num = parseInt(full, 16);
    const t = pct < 0 ? 0 : 255;
    const p = Math.abs(pct) / 100;
    const r = Math.round(((num >> 16) & 255) + (t - ((num >> 16) & 255)) * p);
    const g = Math.round(((num >> 8) & 255) + (t - ((num >> 8) & 255)) * p);
    const b = Math.round((num & 255) + (t - (num & 255)) * p);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function isoSvg(minX: number, minY: number, w: number, h: number, inner: string): string {
    return '<svg style="position:absolute;left:' + minX.toFixed(1) + 'px;top:' + minY.toFixed(1) +
      'px;" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" viewBox="0 0 ' + w.toFixed(1) + ' ' + h.toFixed(1) + '">' + inner + '</svg>';
  }

  // A solid box: width w (x axis), depth d (y axis), height h (z).
  // Three visible faces, shaded from `color` unless overridden.
  function isoBox(o: IsoBoxOpts): string {
    o = o || {};
    const x = o.x || 0, y = o.y || 0, z = o.z || 0;
    const w = o.w || 1, d = o.d || 1, h = o.h == null ? 1 : o.h;
    const color = o.color || '#8A93A6';
    const P = (dx: number, dy: number, dz: number): [number, number] => isoPt(o, x + dx, y + dy, z + dz);
    const t0 = P(0, 0, h), t1 = P(w, 0, h), t2 = P(w, d, h), t3 = P(0, d, h);
    const b1 = P(w, 0, 0), b2 = P(w, d, 0), b3 = P(0, d, 0);
    const all = [t0, t1, t2, t3, b1, b2, b3];
    const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
    const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
    const pts = (list: [number, number][]): string => list.map((p) => (p[0] - minX).toFixed(1) + ',' + (p[1] - minY).toFixed(1)).join(' ');
    const edge = o.stroke === 'none' ? '' : ' stroke="' + (o.stroke || shade(color, -48)) + '" stroke-width="1" stroke-linejoin="round"';
    const poly = (list: [number, number][], fill: string): string => '<polygon points="' + pts(list) + '" fill="' + fill + '"' + edge + '/>';
    return isoSvg(minX, minY, maxX - minX, maxY - minY,
      poly([t3, t2, b2, b3], o.left || shade(color, -2)) +   // +y face (left-down)
      poly([t1, t2, b2, b1], o.right || shade(color, -24)) + // +x face (right-down)
      poly([t0, t1, t2, t3], o.top || shade(color, 30)));     // top
  }

  // A solid cylinder standing on the xy plane: radius r, height h.
  // The top is the projected circle — an axis-aligned ellipse with
  // rx = r * unit * sqrt(3/2), ry = r * unit * sqrt(1/2).
  function isoCylinder(o: IsoCylinderOpts): string {
    o = o || {};
    const x = o.x || 0, y = o.y || 0, z = o.z || 0;
    const r = o.r || 0.5, h = o.h == null ? 1 : o.h, unit = o.unit || 36;
    const color = o.color || '#8A93A6';
    const c0 = isoPt(o, x, y, z), c1 = isoPt(o, x, y, z + h);
    const rx = r * unit * 1.2247, ry = r * unit * 0.7071;
    const minX = c1[0] - rx, maxX = c1[0] + rx;
    const minY = c1[1] - ry, maxY = c0[1] + ry;
    const L = (v: number): string => (v - minX).toFixed(1);
    const T = (v: number): string => (v - minY).toFixed(1);
    const edge = o.stroke === 'none' ? '' : ' stroke="' + (o.stroke || shade(color, -48)) + '" stroke-width="1"';
    const body = 'M ' + L(c1[0] - rx) + ' ' + T(c1[1]) +
      ' L ' + L(c0[0] - rx) + ' ' + T(c0[1]) +
      ' A ' + rx.toFixed(1) + ' ' + ry.toFixed(1) + ' 0 0 0 ' + L(c0[0] + rx) + ' ' + T(c0[1]) +
      ' L ' + L(c1[0] + rx) + ' ' + T(c1[1]) + ' Z';
    return isoSvg(minX, minY, maxX - minX, maxY - minY,
      '<path d="' + body + '" fill="' + shade(color, -8) + '"' + edge + '/>' +
      '<ellipse cx="' + L(c1[0]) + '" cy="' + T(c1[1]) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) +
      '" fill="' + (o.top || shade(color, 30)) + '"' + edge + '/>');
  }

  // A wedge (triangular prism): high edge at x, sloping down
  // along +x for `len`, depth d, height h. Two visible faces: the
  // slope and the +y triangle.
  function isoWedge(o: IsoWedgeOpts): string {
    o = o || {};
    const x = o.x || 0, y = o.y || 0, z = o.z || 0;
    const len = o.len || 1, d = o.d || 1, h = o.h == null ? 1 : o.h;
    const color = o.color || '#8A93A6';
    const P = (dx: number, dy: number, dz: number): [number, number] => isoPt(o, x + dx, y + dy, z + dz);
    const B = P(len, 0, 0), C = P(len, d, 0), D = P(0, d, 0), E = P(0, 0, h), F = P(0, d, h);
    const all = [B, C, D, E, F];
    const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
    const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
    const pts = (list: [number, number][]): string => list.map((p) => (p[0] - minX).toFixed(1) + ',' + (p[1] - minY).toFixed(1)).join(' ');
    const edge = o.stroke === 'none' ? '' : ' stroke="' + (o.stroke || shade(color, -48)) + '" stroke-width="1" stroke-linejoin="round"';
    const poly = (list: [number, number][], fill: string): string => '<polygon points="' + pts(list) + '" fill="' + fill + '"' + edge + '/>';
    return isoSvg(minX, minY, maxX - minX, maxY - minY,
      poly([D, C, F], o.side || shade(color, -6)) +      // +y triangle
      poly([E, F, C, B], o.top || shade(color, 16)));    // the slope
  }

  // A pipe run through world points [[x, y, z], ...]: a stylized
  // tube of constant screen width (2.2 * r * unit), round joints
  // with joint dots at the bends and a shifted highlight stroke
  // for the lit edge. Diagram-style piping that mixes cleanly
  // with the solid parts; route it through connectors, tanks,
  // and housings.
  function isoPipe(o: IsoPipeOpts): string {
    o = o || { path: [] };
    const pts3 = o.path || [];
    if (pts3.length < 2) return '';
    const unit = o.unit || 36;
    const r = o.r || 0.16;
    const w = r * unit * 2.2;
    const color = o.color || '#9AA7BD';
    const sp = pts3.map((p) => isoPt(o, p[0] || 0, p[1] || 0, p[2] || 0));
    const minX = Math.min(...sp.map((p) => p[0])) - w, maxX = Math.max(...sp.map((p) => p[0])) + w;
    const minY = Math.min(...sp.map((p) => p[1])) - w, maxY = Math.max(...sp.map((p) => p[1])) + w;
    const d = sp.map((p, i) => (i ? 'L ' : 'M ') + (p[0] - minX).toFixed(1) + ' ' + (p[1] - minY).toFixed(1)).join(' ');
    const joints = sp.slice(1, -1).map((p) =>
      '<circle cx="' + (p[0] - minX).toFixed(1) + '" cy="' + (p[1] - minY).toFixed(1) + '" r="' + (w / 2).toFixed(1) + '" fill="' + shade(color, -8) + '"/>').join('');
    return isoSvg(minX, minY, maxX - minX, maxY - minY,
      '<path d="' + d + '" fill="none" stroke="' + shade(color, -8) + '" stroke-width="' + w.toFixed(1) + '" stroke-linejoin="round" stroke-linecap="round"/>' +
      joints +
      '<path d="' + d + '" fill="none" stroke="' + shade(color, 34) + '" stroke-width="' + (w * 0.36).toFixed(1) +
      '" stroke-linecap="round" opacity="0.8" transform="translate(' + (-w * 0.16).toFixed(1) + ' ' + (-w * 0.2).toFixed(1) + ')"/>');
  }

  // A gear lying on the iso camera: an isoCylinder body, teeth
  // arranged on the projected rim ellipse (each tangent-rotated),
  // a dark hub hole, and three face bolts so rotation reads.
  // `rot` (radians) turns the whole gear — animate it per frame.
  // Teeth are drawn first and the body over their roots, so tips
  // ring the rim all the way around.
  function isoGear(o: IsoGearOpts): string {
    o = o || {};
    const x = o.x || 0, y = o.y || 0, z = o.z || 0;
    const r = o.r || 1, h = o.h == null ? 0.35 : o.h, unit = o.unit || 36;
    const teeth = o.teeth || 9, rot = o.rot || 0;
    const color = o.color || '#8A93A6';
    const c1 = isoPt(o, x, y, z + h);
    const cM = isoPt(o, x, y, z + h / 2); // teeth ride the mid-plane so their tips clear both rim arcs
    const rx = r * unit * 1.2247, ry = r * unit * 0.7071;
    const toothLen = r * unit * 0.52 + h * unit * 0.9, toothWid = (2 * Math.PI * r * unit * 0.94) / teeth * 0.52;
    const pad = toothLen / 2 + 4;
    const minX = cM[0] - rx - pad, minY = cM[1] - ry - pad;
    const W = (rx + pad) * 2, H = (ry + pad) * 2;
    const edge = o.stroke === 'none' ? '' : ' stroke="' + (o.stroke || shade(color, -48)) + '" stroke-width="1"';
    let teethSvg = '';
    for (let i = 0; i < teeth; i++) {
      const a = rot + (i / teeth) * Math.PI * 2;
      const px = cM[0] + Math.cos(a) * rx, py = cM[1] + Math.sin(a) * ry;
      const tang = Math.atan2(ry * Math.cos(a), -rx * Math.sin(a)) * 180 / Math.PI;
      teethSvg += '<g transform="translate(' + (px - minX).toFixed(1) + ' ' + (py - minY).toFixed(1) +
        ') rotate(' + tang.toFixed(1) + ')"><rect x="' + (-toothWid / 2).toFixed(1) + '" y="' + (-toothLen / 2).toFixed(1) +
        '" width="' + toothWid.toFixed(1) + '" height="' + toothLen.toFixed(1) + '" fill="' + shade(color, -8) + '"' + edge + '/></g>';
    }
    let bolts = '';
    for (let i = 0; i < 3; i++) {
      const a = rot + (i / 3) * Math.PI * 2 + 0.5;
      const bx = (Math.cos(a) * rx * 0.55).toFixed(1), by = (Math.sin(a) * ry * 0.55).toFixed(1);
      bolts += '<circle cx="' + bx + '" cy="' + by + '" r="' + (r * unit * 0.09).toFixed(1) + '" fill="' + shade(color, -38) + '"/>';
    }
    const face = '<svg style="position:absolute;left:' + (c1[0] - rx).toFixed(1) + 'px;top:' + (c1[1] - ry).toFixed(1) +
      'px;" width="' + (rx * 2).toFixed(1) + '" height="' + (ry * 2).toFixed(1) + '" viewBox="' + (-rx).toFixed(1) + ' ' +
      (-ry).toFixed(1) + ' ' + (rx * 2).toFixed(1) + ' ' + (ry * 2).toFixed(1) + '">' + bolts +
      '<ellipse cx="0" cy="0" rx="' + (rx * 0.34).toFixed(1) + '" ry="' + (ry * 0.34).toFixed(1) + '" fill="' + shade(color, -46) + '"' + edge + '/>' +
      '<ellipse cx="0" cy="0" rx="' + (rx * 0.2).toFixed(1) + '" ry="' + (ry * 0.2).toFixed(1) + '" fill="' + shade(color, -64) + '"/></svg>';
    return isoSvg(minX, minY, W, H, teethSvg) + isoCylinder({ ...o, r, h }) + face;
  }

  // Painter's order for iso parts: ascending (x + y), ties by z.
  // Parts carry their resting coords; the html may be built at an
  // animated offset without changing the paint order.
  function isoSort(parts: IsoPart[]): string {
    return parts.slice()
      .sort((a, b) => (a.x + a.y) - (b.x + b.y) || (a.z || 0) - (b.z || 0))
      .map((p) => p.html).join('');
  }

  return {
    pop, ease, fadeUp, pulse, countUp, stagger, fly, trail, smear, squash,
    paperEl, pivot, stepped, onTwos, whip, pathFly, orbit, swing, marquee, marchingAnts, highlightBox, waveLine, spotlight, flipIn, counterRoll, drawText, particleField, morphShape, glitch,
    beatGrid, beatFrames, morphPoly, splitText, wipeReveal, confetti, cursor, isoBox, isoCylinder, isoWedge, isoPipe, isoGear, isoSort,
    dot, ripple, burst, badge, targetSlot, scene, transition, wiggle, typewriter,
    beat, drop, travel, shake, punch, flash, camera, parallax, meshBg, drawOn, poly, bars,
    scramble, kenBurns, breathe, fx, hash,
    clamp01, Easing,
  };
})();

// Short alias for compositions.
__root.M = __root.Motion;
