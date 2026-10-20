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
// Namespace: window.Motion (short alias M inside compositions).

window.Motion = (function () {
  const { interpolate, spring, Easing } = window.Remotion;
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

  return {
    pop, ease, fadeUp, pulse, countUp, stagger, fly, trail, squash,
    dot, ripple, burst, badge, targetSlot, scene, transition, wiggle, typewriter,
    clamp01, Easing,
  };
})();

// Short alias for compositions.
window.M = window.Motion;
