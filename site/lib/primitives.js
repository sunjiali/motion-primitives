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

var __root = typeof window !== "undefined" ? window : globalThis;
__root.Motion = (function () {
  const { interpolate, spring, Easing } = __root.Remotion;
  const FPS = 30;
  const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

  // ---------- value primitives (return numbers / style strings) ----------

  // Springy scale/entrance. Returns a value from→to with physical overshoot.
  function pop(frame, o) {
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
  function ease(frame, o) {
    o = o || {};
    const fn = Easing[o.fn || 'cubicOut'] || Easing.cubicOut;
    return fn(clamp01((frame - (o.at || 0)) / (o.dur || 20)));
  }

  // Fade + rise entrance as a style string: M.fadeUp(frame, {at, dur, dist})
  function fadeUp(frame, o) {
    o = o || {};
    const p = ease(frame, { at: o.at, dur: o.dur || 16, fn: o.fn });
    return 'opacity:' + p.toFixed(3) + ';transform:translateY(' + ((1 - p) * (o.dist || 44)).toFixed(1) + 'px);';
  }

  // Breathing scale (for "look here" targets, empty slots, badges).
  function pulse(frame, o) {
    o = o || {};
    return (o.base || 1) + (o.amp || 0.07) * Math.sin(frame * (o.speed || 0.09) + (o.phase || 0));
  }

  // Integer count-up (scores, totals, step counters).
  function countUp(frame, o) {
    o = o || {};
    const p = ease(frame, { at: o.at, dur: o.dur || 30, fn: o.fn });
    return Math.round((o.from || 0) + ((o.to || 0) - (o.from || 0)) * p);
  }

  // Delay helper for staggered groups: M.stagger(i, {each:6, base:20}) → start frame
  function stagger(i, o) {
    o = o || {};
    return (o.base || 0) + i * (o.each == null ? 6 : o.each);
  }

  // Arc flight between two points. Returns {x, y, p, done}.
  // The moving thing travels from→to on an eased path with a parabolic arc.
  function fly(frame, o) {
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
  function trail(frame, o) {
    const out = [];
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
  function smear(frame, o) {
    const out = [];
    const samples = o.samples || 6;              // ghost count
    const span = o.span == null ? 5 : o.span;    // exposure window, in frames
    const maxOp = o.opacity == null ? 0.3 : o.opacity;
    const arc = o.arc == null ? 170 : o.arc;
    const easeFn = Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut;
    const posAt = (f) => {
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
  function squash(frame, o) {
    o = o || {};
    if (frame < 0) return { sx: 1, sy: 1 };
    const s = spring({ frame, fps: FPS, from: 1.45, to: 1, stiffness: 160, damping: 9 });
    return { sx: 2 - s, sy: s };
  }

  // ---------- HTML primitives (return markup strings) ----------

  // A circle. candy:true adds a glossy highlight (kid-friendly); glow adds a halo.
  function dot(o) {
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
  function ripple(frame, o) {
    const lf = frame - (o.at || 0), dur = o.dur || 30;
    if (lf < 0 || lf >= dur) return '';
    const rr = (o.r0 || 46) + lf * (o.speed || 5.4);
    const op = Math.max(0, 0.9 - lf * (0.9 / dur));
    return '<div style="position:absolute;left:' + (o.x - rr) + 'px;top:' + (o.y - rr) + 'px;width:' + (rr * 2) +
      'px;height:' + (rr * 2) + 'px;border-radius:50%;border:' + (o.width || 6) + 'px solid ' + o.color +
      ';opacity:' + op.toFixed(3) + ';"></div>';
  }

  // Confetti/particle burst from a point. Caller picks colors; shapes alternate.
  function burst(frame, o) {
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
  function badge(frame, o) {
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
  function targetSlot(frame, o) {
    const b = pulse(frame, { amp: 0.08, speed: o.speed || 0.1 });
    const r = o.r * b;
    return '<div style="position:absolute;left:' + (o.x - r).toFixed(1) + 'px;top:' + (o.y - r).toFixed(1) +
      'px;width:' + (r * 2).toFixed(1) + 'px;height:' + (r * 2).toFixed(1) + 'px;border-radius:50%;border:5px dashed ' +
      o.color + ';opacity:.95;"></div>';
  }

  // ---------- scene helpers ----------

  // Which scene are we in? ranges: [[from,to],...] → {index, lf, len}
  function scene(frame, ranges) {
    for (let i = 0; i < ranges.length; i++) {
      if (frame >= ranges[i][0] && frame < ranges[i][1]) {
        return { index: i, lf: frame - ranges[i][0], len: ranges[i][1] - ranges[i][0] };
      }
    }
    const last = ranges[ranges.length - 1];
    return { index: ranges.length - 1, lf: frame - last[0], len: last[1] - last[0] };
  }

  // Scene-edge transition: fade + micro-zoom at both ends of a scene.
  function transition(lf, len, frames) {
    const edge = Math.min(lf / (frames || 10), (len - lf) / (frames || 10), 1);
    return { opacity: Math.max(edge, 0), scale: 0.97 + 0.03 * edge };
  }

  // Attention wiggle: a decaying rotational shake ("look at this one!",
  // also the classic wrong-answer shake when amp is fast and short).
  // Returns a CSS transform value: 'rotate(..deg) translateX(..px)'.
  function wiggle(frame, o) {
    o = o || {};
    const lf = frame - (o.at || 0), dur = o.dur || 26;
    if (lf < 0 || lf >= dur) return 'rotate(0deg) translateX(0px)';
    const env = 1 - lf / dur;
    const a = Math.sin(lf * (o.freq || 0.85)) * (o.amp || 9) * env;
    return 'rotate(' + a.toFixed(2) + 'deg) translateX(' + (a * 0.9).toFixed(1) + 'px)';
  }

  // Typewriter: the visible substring of `text` at this frame.
  // cpf = frames per character (default 2). caret:true appends a blinking ▍.
  function typewriter(frame, o) {
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
  function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  // beat(): entrance with anticipation — pull back a touch, rush in,
  // overshoot ~8%, settle with two small oscillations. Returns {x, s}:
  // x = pixel offset along the travel direction, s = scale.
  function beat(frame, o) {
    o = o || {};
    const lf = frame - (o.at || 0), dist = o.dist || 90;
    if (lf < 0) return { x: -dist, s: 0.9 };
    if (lf > 40) return { x: 0, s: 1 };
    const x = -dist * Math.exp(-lf / 7) * Math.cos(lf * 0.5);
    return { x, s: 1 - (x / dist) * 0.1 };
  }

  // drop(): gravity fall — slow start, fastest at the end, hard stop.
  // Returns the y offset (<= 0). Pair with squash() at the landing frame.
  function drop(frame, o) {
    o = o || {};
    const lf = frame - (o.at || 0), from = o.from || 320, dur = o.dur || 11;
    if (lf < 0) return -from;
    if (lf >= dur) return 0;
    const p = lf / dur;
    return -from * (1 - p * p);
  }

  // travel(): A->B gliding with a fast start and a soft stop.
  function travel(frame, o) {
    o = o || {};
    const lf = frame - (o.at || 0), dur = o.dur || 18;
    const t = clamp01(lf / dur), p = 1 - Math.pow(1 - t, 3);
    return {
      x: o.from.x + (o.to.x - o.from.x) * p,
      y: o.from.y + (o.to.y - o.from.y) * p,
      p, done: lf >= dur,
    };
  }

  // shake(): decaying screen shake {x, y} inside [at, at+dur].
  function shake(frame, o) {
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
  function punch(frame, o) {
    o = o || {};
    const lf = frame - (o.at || 0), amp = o.amp || 0.07;
    if (lf < 0) return 1;
    return 1 + amp * Math.min(lf / 2, 1) * Math.exp(-lf / 4.5);
  }

  // flash(): full-stage flash overlay (impact frames). Returns HTML.
  function flash(frame, o) {
    o = o || {};
    const lf = frame - (o.at || 0), dur = o.dur || 3;
    if (lf < 0 || lf >= dur) return '';
    const op = (1 - lf / dur) * (o.opacity || 0.9);
    return '<div style="position:absolute;inset:0;background:' + (o.color || '#FFFFFF') +
      ';opacity:' + op.toFixed(3) + ';pointer-events:none;"></div>';
  }

  // camera(): a virtual camera over a world wrapper. keys = [{f, x, y, z}]
  // (focus point in stage coords + zoom), eased between keyframes.
  // Returns a CSS transform for a stage-sized wrapper div.
  function camera(frame, keys, stage) {
    const W = stage.w, H = stage.h;
    let a = keys[0], b = keys[keys.length - 1];
    for (let i = 0; i < keys.length - 1; i++) {
      if (frame >= keys[i].f && frame <= keys[i + 1].f) { a = keys[i]; b = keys[i + 1]; break; }
    }
    if (frame <= keys[0].f) { a = b = keys[0]; }
    if (frame >= keys[keys.length - 1].f) { a = b = keys[keys.length - 1]; }
    const span = Math.max(b.f - a.f, 1);
    const t = Easing.cubicInOut(clamp01((frame - a.f) / span));
    const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
    const z = Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * t);
    return 'translate(' + (W / 2) + 'px,' + (H / 2) + 'px) scale(' + z.toFixed(4) +
      ') translate(' + (-x).toFixed(1) + 'px,' + (-y).toFixed(1) + 'px)';
  }

  // meshBg(): an animated gradient-mesh background value (drifting blobs).
  // blobs = [{c, x, y, r, dx, dy, sp}] in % — returns a CSS background value.
  function meshBg(frame, o) {
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
  function drawOn(frame, o) {
    o = o || {};
    const lf = frame - (o.at || 0), dur = o.dur || 40;
    const p = Easing.cubicInOut(clamp01(lf / dur));
    return (o.len * p).toFixed(1) + ' ' + o.len;
  }
  // Polyline helpers for drawOn: points [[x,y],...] -> {attr, len}.
  function poly(points) {
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      len += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    }
    return { attr: points.map((p) => p[0] + ',' + p[1]).join(' '), len: Math.round(len) };
  }

  // bars(): an animated bar chart (HTML). Values grow with a stagger.
  function bars(frame, o) {
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
  function scramble(frame, o) {
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
  function kenBurns(frame, o) {
    o = o || {};
    const t = clamp01((frame - (o.at || 0)) / (o.dur || 300));
    const z = (o.from || 1) + ((o.to || 1.08) - (o.from || 1)) * t;
    const x = (o.panX || 0) * t, y = (o.panY || 0) * t;
    return 'scale(' + z.toFixed(4) + ') translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
  }

  // breathe(): idle micro-motion for anything on screen a while.
  // Returns a scale multiplier around 1.
  function breathe(frame, o) {
    o = o || {};
    return 1 + (o.amp || 0.02) * Math.sin(frame * (o.speed || 0.08) + (o.phase || 0));
  }

  // fx(): the texture stack that ends the "flat AI look" — animated film
  // grain (re-seeded every 3 frames) + vignette, as overlay HTML.
  function fx(frame, o) {
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
  function paperEl(o) {
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
  function pivot(frame, o) {
    const dur = o.dur || 30;
    let p = (Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut)(clamp01((frame - (o.at || 0)) / dur));
    if (o.steps) p = Math.floor(p * o.steps) / o.steps;
    const deg = (o.from || 0) + ((o.to || 0) - (o.from || 0)) * p;
    return 'rotate(' + deg.toFixed(2) + 'deg)';
  }

  // Stop-motion progress: eased progress snapped to N discrete levels, so
  // any motion driven by it advances in visible steps instead of gliding.
  function stepped(frame, o) {
    const dur = o.dur || 30, steps = o.steps || 6;
    const raw = clamp01((frame - (o.at || 0)) / dur);
    if (raw >= 1) return 1;
    const p = (Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut)(raw);
    return Math.floor(p * steps) / steps;
  }

  // Shot-on-twos frame snap: feed the result into any primitive (or a
  // whole composition) and time itself moves in steps — the cheapest
  // stop-motion feel there is. `every: 3` shoots on threes.
  function onTwos(frame, o) {
    const every = (o && o.every) || 2;
    return frame - (frame % every);
  }

  // Whip-pan transition: lay the outgoing and incoming scenes side by side
  // on a strip of width 2W and translate the strip by `x`. The offset curve
  // is slowest at both ends and fastest mid-pan (where the cut hides), and
  // `blur` peaks there too — feed it to a CSS blur on the strip, or smear
  // the moving elements. dir: 1 pans left (incoming from the right).
  function whip(frame, o) {
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
  function pathFly(frame, o) {
    const pts = o.pts || [];
    if (pts.length < 2) { const q = pts[0] || [0, 0]; return { x: q[0], y: q[1], angle: 0, p: 0, done: false }; }
    const raw = clamp01((frame - (o.at || 0)) / (o.dur || 90));
    const p = (Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut)(raw);
    const segs = [];
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
  }

  // 3D flip entrance: the element rotates in from edge-on (±`from` degrees)
  // around the X or Y axis and settles with a slight overshoot (backOut).
  // Returns a style string like fadeUp — perspective is baked into the
  // transform, so it works on any element without a prepared parent.
  function flipIn(frame, o) {
    o = o || {};
    const dur = o.dur || 22;
    const raw = clamp01((frame - (o.at || 0)) / dur);
    const from = o.from == null ? 88 : o.from;
    const p = (Easing.backOut || Easing.cubicOut)(raw);
    const deg = from * (1 - p);
    return 'transform:perspective(' + (o.perspective || 800) + 'px) rotate' + (o.axis || 'Y') +
      '(' + deg.toFixed(2) + 'deg);opacity:' + Math.min(1, raw * 3).toFixed(3) + ';';
  }

  return {
    pop, ease, fadeUp, pulse, countUp, stagger, fly, trail, smear, squash,
    paperEl, pivot, stepped, onTwos, whip, pathFly, flipIn,
    dot, ripple, burst, badge, targetSlot, scene, transition, wiggle, typewriter,
    beat, drop, travel, shake, punch, flash, camera, meshBg, drawOn, poly, bars,
    scramble, kenBurns, breathe, fx, hash,
    clamp01, Easing,
  };
})();

// Short alias for compositions.
__root.M = __root.Motion;
