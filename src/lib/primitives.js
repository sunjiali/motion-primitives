"use strict";
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
var __root = (typeof window !== 'undefined' ? window : globalThis);
__root.Motion = (function () {
    const { interpolate, spring, Easing } = __root.Remotion;
    void interpolate; // destructured as in the original; primitives build on spring/Easing
    const FPS = 30;
    const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
    // ---------- value primitives (return numbers / style strings) ----------
    // Springy scale/entrance. Returns a value from→to with physical overshoot.
    function pop(frame, o) {
        o = o || {};
        const at = o.at || 0;
        if (frame <= at)
            return o.from == null ? 0 : o.from;
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
            if (tp <= 0)
                continue;
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
        const samples = o.samples || 6; // ghost count
        const span = o.span == null ? 5 : o.span; // exposure window, in frames
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
        if (head.raw <= 0 || head.raw >= 1)
            return out;
        const tailPos = posAt(frame - span);
        const dist = Math.hypot(head.x - tailPos.x, head.y - tailPos.y);
        // Exposure ∝ distance covered inside the window: slow move, no blur.
        const strength = Math.min(1, dist / (o.fullAt || 60));
        if (strength <= 0.01)
            return out;
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
        void o;
        if (frame < 0)
            return { sx: 1, sy: 1 };
        const s = spring({ frame, fps: FPS, from: 1.45, to: 1, stiffness: 160, damping: 9 });
        return { sx: 2 - s, sy: s };
    }
    // ---------- HTML primitives (return markup strings) ----------
    // A circle. candy:true adds a glossy highlight (kid-friendly); glow adds a halo.
    function dot(o) {
        const r = o.r * (o.scale == null ? 1 : o.scale);
        let bg = o.color;
        if (o.candy)
            bg = 'radial-gradient(circle at 32% 28%,#ffffffcc 0%,#ffffff22 32%,transparent 55%),' + o.color;
        let shadow = o.candy ? 'box-shadow:0 6px 18px ' + o.color + '66,inset 0 -6px 12px rgba(0,0,0,.12);' : '';
        if (o.glow)
            shadow = 'box-shadow:0 0 ' + (o.glowSize || 30) + 'px ' + o.color + (o.glowAlpha || '88') + ';';
        return '<div style="position:absolute;left:' + (o.x - r).toFixed(1) + 'px;top:' + (o.y - r).toFixed(1) +
            'px;width:' + (r * 2).toFixed(1) + 'px;height:' + (r * 2).toFixed(1) + 'px;border-radius:50%;background:' + bg + ';' +
            shadow + (o.opacity != null ? 'opacity:' + o.opacity + ';' : '') + (o.extra || '') + '"></div>';
    }
    // Expanding ring after an event (landing, correct answer). '' when finished.
    function ripple(frame, o) {
        const lf = frame - (o.at || 0), dur = o.dur || 30;
        if (lf < 0 || lf >= dur)
            return '';
        const rr = (o.r0 || 46) + lf * (o.speed || 5.4);
        const op = Math.max(0, 0.9 - lf * (0.9 / dur));
        return '<div style="position:absolute;left:' + (o.x - rr) + 'px;top:' + (o.y - rr) + 'px;width:' + (rr * 2) +
            'px;height:' + (rr * 2) + 'px;border-radius:50%;border:' + (o.width || 6) + 'px solid ' + o.color +
            ';opacity:' + op.toFixed(3) + ';"></div>';
    }
    // Confetti/particle burst from a point. Caller picks colors; shapes alternate.
    function burst(frame, o) {
        const p = clamp01((frame - (o.at || 0)) / (o.dur || 34));
        if (p <= 0 || p >= 1)
            return '';
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
        if (s <= 0)
            return '';
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
        if (lf < 0 || lf >= dur)
            return 'rotate(0deg) translateX(0px)';
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
        if (o.caret && Math.floor(frame / 15) % 2 === 0)
            s += '▍';
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
        if (lf < 0)
            return { x: -dist, s: 0.9 };
        if (lf > 40)
            return { x: 0, s: 1 };
        const x = -dist * Math.exp(-lf / 7) * Math.cos(lf * 0.5);
        return { x, s: 1 - (x / dist) * 0.1 };
    }
    // drop(): gravity fall — slow start, fastest at the end, hard stop.
    // Returns the y offset (<= 0). Pair with squash() at the landing frame.
    function drop(frame, o) {
        o = o || {};
        const lf = frame - (o.at || 0), from = o.from || 320, dur = o.dur || 11;
        if (lf < 0)
            return -from;
        if (lf >= dur)
            return 0;
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
    // orbit(): pose on a circular orbit around (cx, cy). squash < 1
    // flattens the circle into an ellipse (the classic tilted orbit);
    // depth scales the traveller from 0.72 at the back of the ellipse
    // to 1 at the front. Returns {x, y, angle, scale} like travel /
    // pathFly return poses — place the element yourself.
    function orbit(frame, o) {
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
    function swing(frame, o) {
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
    function marquee(frame, o) {
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
    function marchingAnts(frame, o) {
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
    function highlightBox(frame, o) {
        o = o || { w: 100, h: 40 };
        const pad = o.pad == null ? 6 : o.pad;
        const x = (o.x || 0) - pad, y = (o.y || 0) - pad;
        const w = (o.w || 100) + pad * 2, h = (o.h || 40) + pad * 2;
        const at = o.at || 0, dur = o.dur || 16, seed = o.seed || 0;
        const wob = o.wobble == null ? 2 : o.wobble;
        const j = (i) => (hash(seed * 31 + i * 7 + 3) - 0.5) * 2 * wob;
        const c = [
            [x + j(1), y + j(2)], [x + w + j(3), y + j(4)],
            [x + w + j(5), y + h + j(6)], [x + j(7), y + h + j(8)],
        ];
        const mid = (a, b, i) => [(a[0] + b[0]) / 2 + j(i), (a[1] + b[1]) / 2 + j(i + 1)];
        const m0 = mid(c[0], c[1], 9), m1 = mid(c[1], c[2], 11), m2 = mid(c[2], c[3], 13), m3 = mid(c[3], c[0], 15);
        const ox = x - wob - 4, oy = y - wob - 4; // svg origin: stage point (ox, oy) becomes local (0, 0)
        const L = (pt) => (pt[0] - ox).toFixed(1) + ' ' + (pt[1] - oy).toFixed(1);
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
    function waveLine(frame, o) {
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
    function spotlight(frame, o) {
        o = o || {};
        const r = o.r || 110, feather = o.feather == null ? 70 : o.feather;
        const alpha = o.alpha == null ? 0.78 : o.alpha;
        let cx = o.x || 0, cy = o.y || 0;
        const keys = o.keys || [];
        if (keys.length) {
            if (frame <= keys[0].f) {
                cx = keys[0].x;
                cy = keys[0].y;
            }
            else if (frame >= keys[keys.length - 1].f) {
                cx = keys[keys.length - 1].x;
                cy = keys[keys.length - 1].y;
            }
            else {
                for (let i = 0; i < keys.length - 1; i++) {
                    const a = keys[i], b = keys[i + 1];
                    if (frame >= a.f && frame <= b.f) {
                        const p = (frame - a.f) / (b.f - a.f);
                        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
                        cx = a.x + (b.x - a.x) * e;
                        cy = a.y + (b.y - a.y) * e;
                        break;
                    }
                }
            }
        }
        return '<div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at ' +
            cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px, rgba(4,5,9,0) 0px, rgba(4,5,9,0) ' + r.toFixed(1) +
            'px, rgba(4,5,9,' + alpha + ') ' + (r + feather).toFixed(1) + 'px);"></div>';
    }
    // relay(): keyframed geometry for ONE hero element that persists
    // across scene cuts — the "red relay" of @guanmo_ai's Swiss Style
    // film (2026-10-22 sweep). Each key is a pose { at, x, y, w, h,
    // r?, opacity? }; between keys every field is interpolated with
    // one easing (default cubicInOut), so the same element slides,
    // stretches and morphs through the cut instead of vanishing and
    // being replaced. Before the first key and after the last, the
    // pose holds. Returns { x, y, w, h, r, opacity, seg, p, done } —
    // feed x/y/w/h into a div's box, r into border-radius. Keys need
    // not be sorted; a copy is sorted by `at`.
    function relay(frame, o) {
        const keys = (o.keys || []).slice().sort((a, b) => a.at - b.at);
        if (!keys.length)
            return { x: 0, y: 0, w: 0, h: 0, r: 0, opacity: 0, seg: -1, p: 0, done: true };
        const pose = (k) => ({
            x: k.x + 0, y: k.y + 0, w: k.w + 0, h: k.h + 0,
            r: (k.r == null ? 0 : k.r) + 0, opacity: (k.opacity == null ? 1 : k.opacity) + 0,
        });
        const first = keys[0], last = keys[keys.length - 1];
        if (frame <= first.at)
            return { ...pose(first), seg: 0, p: 0, done: false };
        if (frame >= last.at)
            return { ...pose(last), seg: keys.length - 1, p: 1, done: true };
        const fn = Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut;
        for (let i = 0; i < keys.length - 1; i++) {
            const a = keys[i], b = keys[i + 1];
            if (frame >= a.at && frame <= b.at) {
                const span = b.at - a.at;
                const p = fn(span > 0 ? clamp01((frame - a.at) / span) : 1);
                const pa = pose(a), pb = pose(b);
                const mix = (u, v) => u + (v - u) * p + 0;
                return {
                    x: mix(pa.x, pb.x), y: mix(pa.y, pb.y), w: mix(pa.w, pb.w), h: mix(pa.h, pb.h),
                    r: mix(pa.r, pb.r), opacity: mix(pa.opacity, pb.opacity),
                    seg: i, p, done: false,
                };
            }
        }
        return { ...pose(last), seg: keys.length - 1, p: 1, done: true };
    }
    // maskReveal(): a scene-change cover — a flat overlay in the
    // OUTGOING scene's colour with an organic blob hole growing
    // through it (SVG mask, hash-wobbled rim), revealing the next
    // scene underneath. Draw the next scene first, then this.
    // Before `at` the cover is whole; after at + dur nothing is
    // left (returns ''). The flat-colour case is the house style:
    // one flat colour per scene.
    function maskReveal(frame, o) {
        o = o || {};
        const at = o.at || 0, dur = o.dur || 24, seed = o.seed || 1;
        const w = o.w || 1280, h = o.h || 720;
        const cx = o.x == null ? w / 2 : o.x, cy = o.y == null ? h / 2 : o.y;
        const color = o.color || '#101014';
        if (frame < at)
            return '<div style="position:absolute;inset:0;background:' + color + ';"></div>';
        if (frame >= at + dur)
            return '';
        const p = clamp01((frame - at) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        const maxR = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) * 1.08;
        const R = maxR * e;
        const N = 12;
        const pts = [];
        for (let i = 0; i < N; i++) {
            const a = (i / N) * Math.PI * 2;
            const rr = R * (0.84 + 0.32 * hash(seed * 31 + i * 7.3));
            pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
        }
        let d = '';
        for (let i = 0; i < N; i++) {
            const p0 = pts[i], p1 = pts[(i + 1) % N];
            const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
            if (i === 0) {
                const s = pts[0], prev = pts[N - 1];
                d = 'M ' + ((prev[0] + s[0]) / 2).toFixed(1) + ' ' + ((prev[1] + s[1]) / 2).toFixed(1);
            }
            d += ' Q ' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1);
        }
        d += ' Z';
        const id = 'mr' + seed;
        return '<div style="position:absolute;inset:0;pointer-events:none;"><svg width="' + w + '" height="' + h +
            '" viewBox="0 0 ' + w + ' ' + h + '"><defs><mask id="' + id + '"><rect width="' + w + '" height="' + h +
            '" fill="#fff"/><path d="' + d + '" fill="#000"/></mask></defs><rect width="' + w + '" height="' + h +
            '" fill="' + color + '" mask="url(#' + id + ')"/></svg></div>';
    }
    // matchCut(): the shared-travel driver for a matched cut.
    // One motion path, two elements: the outgoing element
    // accelerates along p (quadratic) and reaches p = 0.8 at the
    // cut frame; the incoming element starts at that exact pose
    // with that exact velocity and decelerates through the
    // remaining 0.2, landing at rest. Pose AND velocity are
    // continuous across the cut, so two different objects read as
    // one motion. Render element A while phase is 'out' and
    // element B while 'in'/'done', both positioned by the same
    // path function of p. The 80% / 1:2 recipe is @ginyboi's #1
    // transition, from the 2026-10-21 X sweep.
    function matchCut(frame, o) {
        o = o || {};
        const at = o.at || 0, out = o.out || 18;
        const t = frame - at;
        const inDur = out / 4; // distance 0.2 at matched velocity, triangular profile
        if (t <= 0)
            return { phase: 'out', p: 0, v: 0 };
        if (t < out) {
            const u = t / out;
            return { phase: 'out', p: 0.8 * u * u, v: 1.6 * u / out };
        }
        const tau = t - out;
        if (tau >= inDur)
            return { phase: 'done', p: 1, v: 0 };
        const v0 = 1.6 / out;
        return { phase: 'in', p: 0.8 + v0 * tau - (v0 / (2 * inDur)) * tau * tau, v: v0 * (1 - tau / inDur) };
    }
    // inertia(): a thrown object's glide, closed form — position
    // x(t) = x0 + vx * (1 - e^(-k*t)) / k, velocity vx * e^(-k*t).
    // The endpoint is physics, not a keyframe: total travel is
    // exactly v0 / k, so where it stops is predictable to the
    // pixel. Returns { x, y, vx, vy, t }; k is per-frame friction
    // (0.06 ≈ a long glide). From the X sweep (@webflow's GSAP
    // Inertia notes).
    function inertia(frame, o) {
        o = o || {};
        const k = o.k || 0.06, at = o.at || 0;
        const t = Math.max(0, frame - at);
        const decay = Math.exp(-k * t);
        const span = (1 - decay) / k;
        return {
            x: (o.x0 || 0) + (o.vx || 0) * span,
            y: (o.y0 || 0) + (o.vy || 0) * span,
            vx: (o.vx || 0) * decay, vy: (o.vy || 0) * decay, t,
        };
    }
    // anticipate(): the wind-up before the move. Progress first
    // dips below zero (the crouch, the pull-back), then releases
    // through the mark with an easeOutBack overshoot and lands
    // exactly on 1. Feed it into any 0→1 journey —
    //   x = from + (to - from) * M.anticipate(frame, o)
    // and the journey gathers itself before it goes: the single
    // cheapest "alive" upgrade (animation principle 2).
    function anticipate(frame, o) {
        o = o || {};
        const at = o.at || 0, wind = o.wind == null ? 8 : o.wind, dur = o.dur || 18, depth = o.depth == null ? 0.18 : o.depth;
        const f = frame - at;
        if (f <= 0)
            return 0;
        if (f < wind) {
            const p = f / wind;
            return -depth * (1 - Math.cos(p * Math.PI)) / 2 + 0;
        }
        const p = clamp01((f - wind) / dur);
        const c1 = 1.70158, c3 = c1 + 1; // easeOutBack, 0→1
        const back = p <= 0 ? 0 : p >= 1 ? 1 : 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
        return -depth + (1 + depth) * back + 0;
    }
    // followThrough(): a row of progress values for trailing
    // parts — element i starts `lag` frames after element i−1 and
    // overshoots a little more than the one before (boost), the
    // way a tail, a scarf or a line of dominoes settles after its
    // leader (animation principle 5). Each value ends exactly 1.
    function followThrough(frame, o) {
        o = o || {};
        const at = o.at || 0, dur = o.dur || 16, count = o.count || 4, lag = o.lag == null ? 3 : o.lag, boost = o.boost == null ? 0.35 : o.boost;
        const out = [];
        for (let i = 0; i < count; i++) {
            const p = clamp01((frame - at - i * lag) / dur);
            const c1 = 1.70158 * (1 + i * boost), c3 = c1 + 1;
            out.push(p <= 0 ? 0 : p >= 1 ? 1 : 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2));
        }
        return out;
    }
    // pixelDissolve(): a mosaic scene transition — the outgoing
    // scene as a grid of flat cells that flip away one by one at
    // hash-staggered frames across [at, at + dur], each cell
    // swelling slightly just before it flips. Draw the next scene
    // first, then this cover. Full grid before `at`, '' after.
    // From the X sweep (@webflow's pixel transition).
    function pixelDissolve(frame, o) {
        o = o || {};
        const at = o.at || 0, dur = o.dur || 30, seed = o.seed || 1;
        const w = o.w || 1280, h = o.h || 720;
        const cols = o.cols || 16, rows = o.rows || 9;
        const color = o.color || '#101014';
        if (frame >= at + dur)
            return '';
        const cw = w / cols, ch = h / rows;
        let cells = '';
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const i = r * cols + c;
                const flip = at + hash(seed * 57 + i * 3.7) * dur;
                if (frame >= flip)
                    continue;
                const swell = 1 + 0.35 * Math.max(0, 1 - (flip - frame) / 4);
                cells += '<div style="position:absolute;left:' + (c * cw).toFixed(1) + 'px;top:' + (r * ch).toFixed(1) +
                    'px;width:' + cw.toFixed(1) + 'px;height:' + ch.toFixed(1) + 'px;background:' + color +
                    ';transform:scale(' + swell.toFixed(3) + ');"></div>';
            }
        }
        return '<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;">' + cells + '</div>';
    }
    // charGrid(): a living wall of glyphs — every cell flips to a
    // new character at hash-staggered intervals, brightness and the
    // occasional accent cell hash-picked per flip. Data-wall /
    // terminal ambience that stays frame-pure. From the X sweep
    // (@antonin.work's character walls).
    function charGrid(frame, o) {
        o = o || {};
        const cols = o.cols || 28, rows = o.rows || 10, size = o.size || 18;
        const chars = o.chars || '01<>/#@$%&*+=';
        const color = o.color || '#7FB069', accent = o.accent || '#D9ED92';
        const seed = o.seed || 1, interval = o.interval || 6;
        let spans = '';
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const i = r * cols + c;
                const step = Math.floor(frame / interval + hash(seed * 3 + i * 1.37) * 9);
                const pick = hash(seed * 13 + i * 7.3 + step * 3.1);
                const glyph = chars.charAt(Math.floor(pick * chars.length) % chars.length);
                const isAccent = hash(seed * 29 + i * 3.9 + step * 1.7) > 0.93;
                const op = 0.3 + 0.7 * hash(seed * 7 + i * 5.1 + step * 2.3);
                spans += '<span style="display:inline-block;width:' + (size * 0.62).toFixed(1) + 'px;color:' +
                    (isAccent ? accent : color) + ';opacity:' + op.toFixed(2) + ';">' +
                    (glyph === '<' ? '&lt;' : glyph === '&' ? '&amp;' : glyph) + '</span>';
            }
            spans += '<br/>';
        }
        return '<div style="position:absolute;left:' + (o.x || 0) + 'px;top:' + (o.y || 0) + 'px;font-family:ui-monospace,Menlo,monospace;font-size:' +
            size + 'px;line-height:1.25;white-space:nowrap;">' + spans + '</div>';
    }
    // assembleText(): glyphs fly in from a hash scatter to their
    // typeset slots, staggered letter by letter, untwisting as
    // they land — splitText's travelling sibling. mode 'out'
    // plays it in reverse (the sentence disperses). Monospace
    // advance, so it suits type-led layouts. From the X sweep
    // (@antonin.work's flying letters).
    function assembleText(frame, o) {
        o = o || {};
        const text = o.text || '', at = o.at || 0, dur = o.dur || 22;
        const size = o.size || 48, seed = o.seed || 1;
        const out = o.mode === 'out';
        const adv = size * 0.62;
        let spans = '';
        for (let i = 0; i < text.length; i++) {
            const ch = text.charAt(i);
            if (ch === ' ') {
                spans += '<span style="display:inline-block;width:' + adv.toFixed(1) + 'px;"></span>';
                continue;
            }
            let p = clamp01((frame - at - i * 2) / dur);
            if (out)
                p = 1 - p;
            const e = 1 - Math.pow(1 - p, 3);
            const ang = hash(seed * 17 + i * 3.1) * Math.PI * 2;
            const dist = 130 + hash(seed * 23 + i * 7.7) * 280;
            const dx = Math.cos(ang) * dist * (1 - e), dy = Math.sin(ang) * dist * 0.72 * (1 - e);
            const rot = (hash(seed * 31 + i * 5.3) - 0.5) * 160 * (1 - e);
            spans += '<span style="display:inline-block;width:' + adv.toFixed(1) + 'px;text-align:center;transform:translate(' +
                dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) rotate(' + rot.toFixed(1) + 'deg);opacity:' + (0.15 + 0.85 * p).toFixed(2) + ';">' +
                (ch === '<' ? '&lt;' : ch === '&' ? '&amp;' : ch) + '</span>';
        }
        return '<div style="position:absolute;left:' + (o.x || 0) + 'px;top:' + (o.y || 0) + 'px;font-family:ui-monospace,Menlo,monospace;font-size:' +
            size + 'px;font-weight:' + (o.weight || 700) + ';color:' + (o.color || '#E8E4DA') + ';white-space:nowrap;">' + spans + '</div>';
    }
    // textOnPath(): a string typeset along a smoothed polyline by
    // arc length — each glyph sits on the curve, rotated to its
    // tangent. The whole string flows along the path at `speed`
    // px/frame (plus a static `offset`); glyphs past the end hide
    // unless `loop` wraps them around. Kinetic type for ribbons,
    // labels on wires, credits on a road. From the X sweep
    // (@holke79's text-on-path work).
    function textOnPath(frame, o) {
        o = o || {};
        const text = o.text || '', raw = o.pts || [];
        if (raw.length < 2 || !text)
            return '';
        // smooth the polyline (midpoint quadratics), then sample it
        const sm = [[raw[0][0], raw[0][1]]];
        for (let i = 1; i < raw.length - 1; i++) {
            const mx = (raw[i][0] + raw[i + 1][0]) / 2, my = (raw[i][1] + raw[i + 1][1]) / 2;
            const sx = sm[sm.length - 1][0], sy = sm[sm.length - 1][1]; // segment start, fixed for all 8 steps
            for (let s = 1; s <= 8; s++) {
                const t = s / 8, u = 1 - t;
                sm.push([u * u * sx + 2 * u * t * raw[i][0] + t * t * mx,
                    u * u * sy + 2 * u * t * raw[i][1] + t * t * my]);
            }
        }
        sm.push([raw[raw.length - 1][0], raw[raw.length - 1][1]]);
        const cum = [0];
        for (let i = 1; i < sm.length; i++)
            cum.push(cum[i - 1] + Math.hypot(sm[i][0] - sm[i - 1][0], sm[i][1] - sm[i - 1][1]));
        const total = cum[cum.length - 1];
        const at = (d) => {
            let lo = 0, hi = cum.length - 1;
            while (lo < hi - 1) {
                const mid = (lo + hi) >> 1;
                if (cum[mid] <= d)
                    lo = mid;
                else
                    hi = mid;
            }
            const segLen = cum[hi] - cum[lo] || 1, f = (d - cum[lo]) / segLen;
            const x = sm[lo][0] + (sm[hi][0] - sm[lo][0]) * f, y = sm[lo][1] + (sm[hi][1] - sm[lo][1]) * f;
            return [x, y, Math.atan2(sm[hi][1] - sm[lo][1], sm[hi][0] - sm[lo][0]) * 180 / Math.PI];
        };
        const size = o.size || 28, adv = size * 0.62;
        const flow = (o.offset || 0) + frame * (o.speed || 0);
        let spans = '';
        for (let i = 0; i < text.length; i++) {
            const ch = text.charAt(i);
            if (ch === ' ')
                continue;
            let d = flow + i * adv;
            if (o.loop && total > 0)
                d = ((d % total) + total) % total;
            if (d < 0 || d > total)
                continue;
            const [px, py, ang] = at(d);
            spans += '<span style="position:absolute;left:0;top:0;transform:translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) +
                'px) rotate(' + ang.toFixed(1) + 'deg) translate(-50%,-50%);">' +
                (ch === '<' ? '&lt;' : ch === '&' ? '&amp;' : ch) + '</span>';
        }
        return '<div style="position:absolute;left:' + (o.x || 0) + 'px;top:' + (o.y || 0) + 'px;font-family:ui-monospace,Menlo,monospace;font-size:' +
            size + 'px;font-weight:' + (o.weight || 700) + ';color:' + (o.color || '#E8E4DA') + ';">' + spans + '</div>';
    }
    // patternField(): a seamless pattern backdrop — one motif
    // tiled across the stage, every tile animated with a phase
    // that travels across the grid (spin / pulse / wave), so the
    // whole wall breathes as one surface. Motifs: dot, ring,
    // diamond, cross. From the X sweep (@studio.baseline's
    // seamless-pattern tutorial).
    function patternField(frame, o) {
        o = o || {};
        const w = o.w || 1280, h = o.h || 720, tile = o.tile || 64;
        const motif = o.motif || 'diamond', motion = o.motion || 'wave';
        const color = o.color || '#3A4A63', speed = o.speed || 0.06;
        const cols = Math.ceil(w / tile), rows = Math.ceil(h / tile);
        const s = tile * 0.3;
        let tiles = '';
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cx = c * tile + tile / 2, cy = r * tile + tile / 2;
                const ph = frame * speed + (c + r) * 0.55;
                let tr = '';
                if (motion === 'spin')
                    tr = ' rotate(' + (ph * 40).toFixed(1) + ')';
                else if (motion === 'pulse')
                    tr = ' scale(' + (0.75 + 0.35 * (0.5 + 0.5 * Math.sin(ph))).toFixed(3) + ')';
                else
                    tr = ' rotate(' + (Math.sin(ph) * 38).toFixed(1) + ')'; // wave: tiles rock back and forth
                let shape = '';
                if (motif === 'dot')
                    shape = '<circle r="' + (s * 0.5).toFixed(1) + '" fill="' + color + '"/>';
                else if (motif === 'ring')
                    shape = '<circle r="' + (s * 0.55).toFixed(1) + '" fill="none" stroke="' + color + '" stroke-width="' + (tile * 0.07).toFixed(1) + '"/>';
                else if (motif === 'cross')
                    shape = '<path d="M ' + (-s / 2) + ' 0 H ' + (s / 2) + ' M 0 ' + (-s / 2) + ' V ' + (s / 2) + '" stroke="' + color + '" stroke-width="' + (tile * 0.09).toFixed(1) + '" stroke-linecap="round"/>';
                else
                    shape = '<rect x="' + (-s / 2).toFixed(1) + '" y="' + (-s / 2).toFixed(1) + '" width="' + s.toFixed(1) + '" height="' + s.toFixed(1) + '" fill="' + color + '"/>';
                tiles += '<g transform="translate(' + cx + ' ' + cy + ')' + tr + '">' + shape + '</g>';
            }
        }
        return '<div style="position:absolute;left:' + (o.x || 0) + 'px;top:' + (o.y || 0) + 'px;width:' + w + 'px;height:' + h +
            'px;overflow:hidden;' + (o.bg ? 'background:' + o.bg + ';' : '') + '"><svg width="' + w + '" height="' + h + '">' + tiles + '</svg></div>';
    }
    // slitScan(): a smooth streak warp over wrapped HTML — the
    // content is re-rendered in horizontal bands, each band
    // clipped and shifted by a travelling sine field,
    // A·sin(phase + band·k): the Superman-titles smear. Where
    // glitch is jagged and random, this is continuous. With
    // `dur` set it windows over [at, at + dur] under a sine
    // envelope; without, it runs sustained. From the X sweep
    // (@CcampFx's streak thread — the sweep's one true X post).
    function slitScan(frame, o) {
        o = o || {};
        const html = o.html || '';
        const at = o.at || 0;
        if (frame < at)
            return html;
        let env = 1;
        if (o.dur != null) {
            if (frame >= at + o.dur)
                return html;
            env = Math.sin(Math.PI * (frame - at) / o.dur);
        }
        const h = o.h || 720, bands = o.bands || 14;
        const rawAmp = o.amp == null ? 26 : o.amp;
        const amp = rawAmp * env, waves = o.waves || 1.5, speed = o.speed || 0.11;
        const bh = h / bands;
        const over = Math.ceil(Math.abs(rawAmp)) + 1; // overscan: band copies widen past both edges so a shift never opens a gap
        let out = '';
        for (let b = 0; b < bands; b++) {
            const dx = amp * Math.sin(frame * speed + b * (Math.PI * 2 * waves / bands));
            out += '<div style="position:absolute;top:0;bottom:0;left:-' + over + 'px;right:-' + over +
                'px;clip-path:inset(' + (b * bh).toFixed(1) + 'px 0 ' + (h - (b + 1) * bh).toFixed(1) +
                'px 0);transform:translateX(' + dx.toFixed(1) + 'px);">' + html + '</div>';
        }
        return '<div style="position:absolute;inset:0;overflow:hidden;">' + out + '</div>';
    }
    // portalWipe(): a circular portal transition — a flat disc blooms
    // from (x, y) with an easeOutCubic pop, swallows the outgoing
    // scene, holds, then contracts (cubicInOut) toward (x2, y2),
    // revealing the incoming scene already drawn underneath. Draw the
    // incoming scene FIRST, then pass the OUTGOING scene as `html`:
    // before `at` it renders unclipped (hiding the incoming scene);
    // during the bloom it is clipped to outside the disc (SVG mask);
    // once the disc reaches full coverage the outgoing scene is
    // swallowed and only the disc remains, contracting to reveal the
    // scene beneath. After at + dur it returns ''. Omit `html` and it
    // degrades to a disc-only overlay (advanced manual layering).
    // `echo` trails thin rings behind the rim (motionin's signature
    // framing); `hold` is the full-coverage beat in frames. The portal
    // color must contrast with BOTH scenes, or one phase reads as
    // nothing. From the 2026-10-22 eve sweep via @neropursue's
    // resource list (motionin.design's card transitions).
    function portalWipe(frame, o) {
        o = o || {};
        const at = o.at || 0, dur = o.dur || 36;
        const hold = o.hold == null ? 4 : Math.max(0, Math.min(o.hold, dur - 2));
        const w = o.w || 1280, h = o.h || 720;
        const x0 = o.x == null ? w / 2 : o.x, y0 = o.y == null ? h / 2 : o.y;
        const x1 = o.x2 == null ? x0 : o.x2, y1 = o.y2 == null ? y0 : o.y2;
        const color = o.color || '#101014';
        const echoes = Math.max(0, Math.round(o.echo || 0));
        const html = o.html || '';
        const t = frame - at;
        if (t < 0)
            return html; // outgoing scene, full-bleed, hides the scene drawn beneath
        if (frame >= at + dur)
            return '';
        const motion = dur - hold;
        const expDur = Math.max(1, Math.round(motion * 0.55));
        const conDur = Math.max(1, motion - expDur);
        // Full coverage from EITHER center — the portal must swallow the
        // stage whichever side it starts or ends on.
        const maxR = Math.hypot(Math.max(x0, x1, w - x0, w - x1), Math.max(y0, y1, h - y0, h - y1)) * 1.06;
        let r, cx, cy;
        if (t < expDur) {
            const p = clamp01(t / expDur);
            r = maxR * (1 - Math.pow(1 - p, 3)); // easeOutCubic: blooms fast, lands soft
            cx = x0;
            cy = y0;
        }
        else if (t < expDur + hold) {
            r = maxR;
            cx = x0;
            cy = y0;
        }
        else {
            const q = clamp01((t - expDur - hold) / conDur);
            const e = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2; // cubicInOut
            r = maxR * (1 - e);
            cx = x0 + (x1 - x0) * e;
            cy = y0 + (y1 - y0) * e;
        }
        const fx = cx.toFixed(1), fy = cy.toFixed(1);
        let rings = '';
        for (let i = 1; i <= echoes; i++) {
            rings += '<circle cx="' + fx + '" cy="' + fy +
                '" r="' + (r + i * 26).toFixed(1) + '" fill="none" stroke="' + color +
                '" stroke-width="3" opacity="' + (0.45 / i).toFixed(3) + '"/>';
        }
        const disc = r <= 0.5 ? '' :
            '<div style="position:absolute;inset:0;pointer-events:none;"><svg width="' + w +
                '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '"><circle cx="' + fx +
                '" cy="' + fy + '" r="' + r.toFixed(1) + '" fill="' + color + '"/>' +
                rings + '</svg></div>';
        if (!html)
            return disc;
        if (t >= expDur)
            return disc; // swallowed: the outgoing scene is gone
        // Bloom phase: the outgoing scene survives outside the disc
        // (SVG mask: white stage, black disc hole), the disc on top.
        const id = 'pw' + at + 'x' + Math.round(x0) + 'y' + Math.round(y0);
        const clipped = '<div style="position:absolute;inset:0;pointer-events:none;">' +
            '<svg width="0" height="0"><defs><mask id="' + id + '">' +
            '<rect width="' + w + '" height="' + h + '" fill="#fff"/>' +
            '<circle cx="' + fx + '" cy="' + fy + '" r="' + r.toFixed(1) + '" fill="#000"/>' +
            '</mask></defs></svg>' +
            '<div style="position:absolute;inset:0;-webkit-mask:url(#' + id + ');mask:url(#' + id + ');">' +
            html + '</div></div>';
        return clipped + disc;
    }
    // rings(): concentric thin rings around a focal point — the
    // quiet decoration layer across motionin.design's cards. One
    // geometry (count rings spaced `gap` apart from base radius
    // `r0`), three modes:
    //  - 'pulse' (default): an expanding train — ring i rides phase
    //    ((frame - at) / dur + i / count), growing from r0 out to
    //    r0 + count*gap while its opacity fades; the train loops
    //    forever, so a focal point keeps breathing outward.
    //  - 'breathe': a settled set whose radii swell on a slow sine,
    //    phase-lagged per ring so the swell travels outward.
    //  - 'spin': dashed arcs rotating in place, neighbouring rings
    //    counter-rotating at slightly different rates.
    // Thin lines, one muted colour, alpha doing the depth work —
    // the shell stays plain and the rings carry the calm (the
    // teardown's "shell plain, colour = information" rule). A seeded
    // phase jitter keeps stacked calls from marching in lockstep.
    // Frame-pure: phases are trig/hash of `frame` only; '' before `at`.
    function rings(frame, o) {
        o = o || {};
        const at = o.at || 0;
        if (frame < at)
            return '';
        const lf = frame - at;
        const count = Math.max(1, Math.round(o.count || 4));
        const r0 = o.r0 == null ? 26 : o.r0;
        const gap = o.gap == null ? 34 : o.gap;
        const color = o.color || '#8E99AD';
        const width = o.width || 2;
        const mode = o.mode || 'pulse';
        const baseOp = o.opacity == null ? 0.85 : o.opacity;
        const seed = o.seed || 1;
        const cx = o.x == null ? 640 : o.x, cy = o.y == null ? 360 : o.y;
        let maxR = r0 + count * gap;
        if (mode === 'breathe')
            maxR += 6; // swell headroom
        else if (mode === 'spin')
            maxR = r0 + (count - 1) * gap;
        const R = Math.ceil(maxR) + width + 1;
        let circles = '';
        for (let i = 0; i < count; i++) {
            const jitter = (hash(seed * 31 + i * 7 + 3) - 0.5) * 0.12; // ±0.06 of a cycle
            let r, op, extra = '';
            if (mode === 'breathe') {
                const speed = o.speed || 0.045;
                const swell = Math.sin(lf * speed - i * 0.55 + jitter * 4);
                r = r0 + i * gap + swell * 5;
                op = baseOp * (0.62 + 0.28 * (0.5 + 0.5 * swell)) * (1 - i / (count + 2));
            }
            else if (mode === 'spin') {
                const speed = o.speed == null ? 0.7 : o.speed; // degrees per frame
                r = r0 + i * gap;
                const circ = 2 * Math.PI * r;
                const frac = o.dash == null ? 0.7 : o.dash;
                const dirn = i % 2 === 0 ? 1 : -1;
                const ang = dirn * lf * speed * (1 + i * 0.18) + jitter * 360;
                op = baseOp * (1 - i / (count + 2));
                extra = ' stroke-dasharray="' + (circ * frac).toFixed(1) + ' ' +
                    (circ * (1 - frac)).toFixed(1) + '" transform="rotate(' +
                    ang.toFixed(1) + ' ' + R + ' ' + R + ')"';
            }
            else { // pulse
                const dur = o.dur || 90;
                const p = (((lf / dur + i / count + jitter) % 1) + 1) % 1;
                r = r0 + p * count * gap;
                op = baseOp * clamp01(p / 0.12) * (1 - p) * (1 - p * 0.4);
            }
            circles += '<circle cx="' + R + '" cy="' + R + '" r="' + r.toFixed(1) +
                '" fill="none" stroke="' + color + '" stroke-width="' + width +
                '" opacity="' + Math.max(0, op).toFixed(3) + '"' + extra + '/>';
        }
        return '<div style="position:absolute;left:' + (cx - R) + 'px;top:' + (cy - R) +
            'px;width:' + (R * 2) + 'px;height:' + (R * 2) +
            'px;pointer-events:none;"><svg width="' + (R * 2) + '" height="' + (R * 2) +
            '" viewBox="0 0 ' + (R * 2) + ' ' + (R * 2) + '">' + circles + '</svg></div>';
    }
    // liquidMetal(): the library's first WebGL primitive — a
    // raymarched SDF chrome blob cluster (smooth-min union of a
    // core sphere and hash-orbiting satellites that merge and
    // split like liquid metal), the Motion Lab opener look. This
    // function returns a <canvas> tag carrying its parameters;
    // the players call liquidMetalDraw() after every render to
    // paint it (one shared GL canvas, shader compiled once, blob
    // positions computed here in JS from `frame` — frame-pure).
    // If WebGL is unavailable it degrades to soft 2-D chrome
    // blobs rather than a blank hole.
    const LM_VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const LM_FRAG = [
        'precision highp float;',
        'uniform vec2 u_res;uniform vec4 u_blobs[8];uniform int u_count;uniform vec3 u_tint;uniform float u_oil;',
        'float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}',
        'float sdf(vec3 p){float d=1e5;for(int i=0;i<8;i++){if(i>=u_count)break;vec4 b=u_blobs[i];d=smin(d,length(p-b.xyz)-b.w,.55);}return d;}',
        'vec3 nrm(vec3 p){vec2 e=vec2(.002,0.);float d=sdf(p);return normalize(vec3(sdf(p+e.xyy)-d,sdf(p+e.yxy)-d,sdf(p+e.yyx)-d));}',
        'vec3 env(vec3 d){float y=d.y*.5+.5;vec3 c=mix(vec3(.03,.04,.06),vec3(.16,.19,.24),smoothstep(0.,.45,y));',
        'c=mix(c,vec3(.92,.95,1.),smoothstep(.42,.58,y));c=mix(c,vec3(.35,.4,.48),smoothstep(.58,.78,y));',
        'c=mix(c,vec3(.98),smoothstep(.78,.92,y));c=mix(c,vec3(.05,.06,.08),smoothstep(.92,1.,y));',
        'c+=vec3(1.)*pow(max(0.,1.-abs(d.y+.15)*3.2),6.)*.55;return c*u_tint;}',
        'void main(){vec2 uv=(gl_FragCoord.xy*2.-u_res)/u_res.y;vec3 ro=vec3(0.,0.,4.2);vec3 rd=normalize(vec3(uv,-1.6));',
        'float t=0.;float hit=0.;vec3 p=ro;',
        'for(int i=0;i<72;i++){p=ro+rd*t;float d=sdf(p);if(d<.0015){hit=1.;break;}t+=d;if(t>9.)break;}',
        'if(hit<.5){gl_FragColor=vec4(0.,0.,0.,0.);return;}',
        'vec3 n=nrm(p);vec3 v=-rd;vec3 r=reflect(rd,n);vec3 col=env(r);',
        'if(u_oil>.5){vec3 oil=.72+.38*cos(6.2831*(vec3(0.,.33,.67)+r.y*.85+r.x*.25));col*=oil*1.7;}',
        'float fres=pow(1.-max(0.,dot(n,v)),2.2);col+=vec3(.9,.95,1.)*fres*.5;',
        'vec3 L=normalize(vec3(.5,.8,.6));col+=vec3(1.)*pow(max(0.,dot(reflect(-L,n),v)),90.)*1.1;',
        'gl_FragColor=vec4(col,1.);}',
    ].join('\n');
    let __lmGl = null;
    function liquidMetal(frame, o) {
        o = o || {};
        const w = o.w || 720, h = o.h || 405;
        const data = { seed: o.seed || 1, palette: o.palette || 'chrome', speed: o.speed == null ? 1 : o.speed, blobs: o.blobs || 6, fps: o.fps || 30, spin: o.spin == null ? 0.25 : o.spin };
        return '<canvas class="mp-liquid" width="' + w + '" height="' + h + '" data-frame="' + frame + '" data-lm=\'' +
            JSON.stringify(data) + '\' style="position:absolute;left:' + (o.x || 0) + 'px;top:' + (o.y || 0) + 'px;width:' +
            (o.size || w) + 'px;height:' + (o.size ? Math.round((o.size * h) / w) : h) + 'px;"></canvas>';
    }
    function liquidMetalDraw(root) {
        const doc = globalThis.document;
        if (!doc || !root || !root.querySelectorAll)
            return;
        const nodes = root.querySelectorAll('canvas.mp-liquid');
        for (let n = 0; n < nodes.length; n++) {
            const cv = nodes[n];
            let o = {};
            try {
                o = JSON.parse(cv.getAttribute('data-lm') || '{}');
            }
            catch (e) {
                o = {};
            }
            const frame = parseInt(cv.getAttribute('data-frame') || '0', 10);
            const seed = o.seed || 1, fps = o.fps || 30, t = (frame / fps) * (o.speed == null ? 1 : o.speed);
            // blob layout, a pure function of (frame, seed): core + satellites
            const blobs = [];
            blobs.push(0, Math.sin(t * 0.9) * 0.05, 0, 0.98);
            const count = Math.min(7, o.blobs || 6);
            const spinA = t * (o.spin == null ? 0.25 : o.spin);
            const cs = Math.cos(spinA), sn = Math.sin(spinA);
            for (let i = 0; i < count; i++) {
                const ph = hash(seed * 7 + i * 3.3) * Math.PI * 2;
                const sp = 0.35 + hash(seed * 11 + i * 5.1) * 0.5;
                const R = 1.02 + hash(seed * 13 + i * 7.7) * 0.38;
                const a = ph + t * sp;
                const bx = Math.cos(a) * R, by = Math.sin(a) * R * 0.8, bz = Math.sin(a * 0.7 + ph) * 0.35;
                blobs.push(bx * cs - bz * sn, by, bx * sn + bz * cs, // the whole cluster slowly turns in depth
                (0.4 + hash(seed * 17 + i * 9.3) * 0.22) * (1 + 0.16 * Math.sin(t * 1.3 + ph * 2)));
            }
            const tint = o.palette === 'gold' ? [1.15, 0.92, 0.55] : o.palette === 'copper' ? [1.18, 0.72, 0.5] : [1, 1, 1];
            const ctx2d = cv.getContext('2d');
            if (!ctx2d)
                continue;
            try {
                if (!__lmGl) {
                    const gc = doc.createElement('canvas');
                    const gl = gc.getContext('webgl', { alpha: true, antialias: false, preserveDrawingBuffer: true });
                    if (!gl)
                        throw new Error('no webgl');
                    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
                    const prog = gl.createProgram();
                    gl.attachShader(prog, sh(gl.VERTEX_SHADER, LM_VERT));
                    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, LM_FRAG));
                    gl.linkProgram(prog);
                    gl.useProgram(prog);
                    const buf = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
                    const loc = gl.getAttribLocation(prog, 'p');
                    gl.enableVertexAttribArray(loc);
                    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
                    __lmGl = { canvas: gc, gl, prog };
                }
                const { canvas: gc, gl, prog } = __lmGl;
                if (gc.width !== cv.width || gc.height !== cv.height) {
                    gc.width = cv.width;
                    gc.height = cv.height;
                }
                gl.viewport(0, 0, gc.width, gc.height);
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.uniform2f(gl.getUniformLocation(prog, 'u_res'), gc.width, gc.height);
                gl.uniform1i(gl.getUniformLocation(prog, 'u_count'), count + 1);
                gl.uniform3f(gl.getUniformLocation(prog, 'u_tint'), tint[0], tint[1], tint[2]);
                gl.uniform1f(gl.getUniformLocation(prog, 'u_oil'), o.palette === 'oil' ? 1 : 0);
                const flat = new Float32Array(32);
                flat.set(blobs); // up to 8 blobs; the rest stay (0,0,0,0), guarded by u_count
                gl.uniform4fv(gl.getUniformLocation(prog, 'u_blobs'), flat);
                gl.drawArrays(gl.TRIANGLES, 0, 3);
                ctx2d.clearRect(0, 0, cv.width, cv.height);
                ctx2d.drawImage(gc, 0, 0);
            }
            catch (e) {
                // WebGL unavailable: soft 2-D chrome-blob fallback, never a blank hole
                ctx2d.clearRect(0, 0, cv.width, cv.height);
                const cx = cv.width / 2, cy = cv.height / 2, u = cv.height / 3.4;
                for (let i = blobs.length / 4 - 1; i >= 0; i--) {
                    const bx = cx + blobs[i * 4] * u, by = cy - blobs[i * 4 + 1] * u, br = blobs[i * 4 + 3] * u;
                    const g = ctx2d.createRadialGradient(bx - br * 0.35, by - br * 0.4, br * 0.1, bx, by, br);
                    g.addColorStop(0, '#f4f6fa');
                    g.addColorStop(0.45, '#9aa3b2');
                    g.addColorStop(0.8, '#3a4150');
                    g.addColorStop(1, '#14171d');
                    ctx2d.fillStyle = g;
                    ctx2d.beginPath();
                    ctx2d.arc(bx, by, br, 0, Math.PI * 2);
                    ctx2d.fill();
                }
            }
        }
    }
    // shake(): decaying screen shake {x, y} inside [at, at+dur].
    function shake(frame, o) {
        o = o || {};
        const lf = frame - (o.at || 0), dur = o.dur || 14, amp = o.amp || 10, seed = o.seed || 0;
        if (lf < 0 || lf >= dur)
            return { x: 0, y: 0 };
        const env = 1 - lf / dur;
        return {
            x: (hash(lf * 2 + seed) - 0.5) * 2 * amp * env,
            y: (hash(lf * 2 + 1 + seed) - 0.5) * 2 * amp * env,
        };
    }
    // velocitySkew(): shear driven by motion. `trail` mode: skew follows the
    // instantaneous velocity of an eased from->to move — the element leans
    // into the move, top lagging behind, like speed lines frozen into the
    // shape. `impact` mode: a decaying ±skew oscillation for hits and
    // transition punches (the "skew shake" edit style). Returns the eased
    // position plus a ready-to-paste CSS transform. Frame-pure, deterministic.
    function velocitySkew(frame, o) {
        o = o || {};
        const at = o.at || 0, dur = o.dur || 20, mode = o.mode || 'trail';
        const axis = o.axis || 'x', maxSkew = o.maxSkew == null ? 12 : o.maxSkew;
        const anchor = o.anchor || 'center', h = o.h || 0;
        const lf = frame - at;
        let pos = 0, skew = 0;
        if (mode === 'impact') {
            if (lf >= 0 && lf < dur)
                skew = maxSkew * Math.sin(lf * (o.freq || 1.2)) * (1 - lf / dur);
        }
        else {
            const from = o.from || 0, to = o.to == null ? 100 : o.to;
            const ef = Easing[o.fn || 'cubicOut'] || Easing.cubicOut;
            const atPos = (f) => {
                const t = Math.max(0, Math.min(1, (f - at) / dur));
                return from + (to - from) * ef(t);
            };
            pos = atPos(frame);
            if (lf >= 0 && lf < dur) {
                const v = atPos(frame + 0.5) - atPos(frame - 0.5); // px per frame
                skew = Math.max(-maxSkew, Math.min(maxSkew, v * (o.gain == null ? 0.5 : o.gain)));
            }
        }
        // Shearing about the leading edge shifts the visual center by
        // tan(skew)*h/2 — pull it back along the axis so the box stays centered.
        const recenter = anchor === 'start' && h > 0 ? -Math.tan(skew * Math.PI / 180) * h / 2 : 0;
        const css = axis === 'x'
            ? 'translate(' + (pos + recenter).toFixed(1) + 'px, 0px) skewX(' + skew.toFixed(2) + 'deg)'
            : 'translate(0px, ' + (pos + recenter).toFixed(1) + 'px) skewY(' + skew.toFixed(2) + 'deg)';
        return { pos, skew, recenter, css };
    }
    // punch(): a quick camera punch-in that settles back. Returns a scale
    // multiplier (1 = neutral). Compose with camera().
    function punch(frame, o) {
        o = o || {};
        const lf = frame - (o.at || 0), amp = o.amp || 0.07;
        if (lf < 0)
            return 1;
        return 1 + amp * Math.min(lf / 2, 1) * Math.exp(-lf / 4.5);
    }
    // flash(): full-stage flash overlay (impact frames). Returns HTML.
    function flash(frame, o) {
        o = o || {};
        const lf = frame - (o.at || 0), dur = o.dur || 3;
        if (lf < 0 || lf >= dur)
            return '';
        const op = (1 - lf / dur) * (o.opacity || 0.9);
        return '<div style="position:absolute;inset:0;background:' + (o.color || '#FFFFFF') +
            ';opacity:' + op.toFixed(3) + ';pointer-events:none;"></div>';
    }
    // Shared camera pose: the eased focus + zoom at a frame,
    // interpolated between keyframes (zoom in log space). camera() and
    // parallax() both consume it, so depth layers can never drift from
    // the camera move they belong to.
    function camPose(frame, keys) {
        let a = keys[0], b = keys[keys.length - 1];
        for (let i = 0; i < keys.length - 1; i++) {
            if (frame >= keys[i].f && frame <= keys[i + 1].f) {
                a = keys[i];
                b = keys[i + 1];
                break;
            }
        }
        if (frame <= keys[0].f) {
            a = b = keys[0];
        }
        if (frame >= keys[keys.length - 1].f) {
            a = b = keys[keys.length - 1];
        }
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
    function camera(frame, keys, stage) {
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
    function parallax(frame, keys, depth, stage) {
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
        if (lf < 0)
            return '';
        const cpf = o.cpf || 3;
        let out = '';
        for (let i = 0; i < o.text.length; i++) {
            const ch = o.text[i];
            if (ch === ' ') {
                out += ' ';
                continue;
            }
            if (lf >= (i + 1) * cpf)
                out += ch;
            else
                out += pool[Math.floor(hash(i * 131 + Math.floor(frame / 2) * 17) * pool.length)];
        }
        return out;
    }
    // splitFlap(): airport split-flap board. Each character cycles through
    // an ordered charset starting from blank, one step per flipEvery frames,
    // and clacks into place left to right (stagger frames apart). Unlike
    // scramble() (random glyphs), the intermediate glyphs are the ordered
    // steps a mechanical board would pass through. Characters outside the
    // charset (lowercase, CJK, symbols) appear whole at their turn.
    // Before `at`, every position is blank.
    function splitFlap(frame, o) {
        o = o || {};
        const charset = o.charset || ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const flipEvery = Math.max(1, o.flipEvery || 2);
        const stagger = o.stagger == null ? 3 : o.stagger;
        const lf = frame - (o.at || 0);
        if (lf < 0)
            return o.text.replace(/./g, ' ');
        let out = '';
        for (let i = 0; i < o.text.length; i++) {
            const target = o.text[i];
            if (target === ' ') {
                out += ' ';
                continue;
            }
            const ti = charset.indexOf(target);
            if (ti < 0) {
                out += lf >= i * stagger ? target : ' ';
                continue;
            }
            const steps = Math.floor(Math.max(lf - i * stagger, 0) / flipEvery);
            out += steps >= ti ? target : charset[steps];
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
        if (shape === 'blob')
            radius = '58% 42% 55% 45% / 48% 55% 45% 52%';
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
        if (o.steps)
            p = Math.floor(p * o.steps) / o.steps;
        const deg = (o.from || 0) + ((o.to || 0) - (o.from || 0)) * p;
        return 'rotate(' + deg.toFixed(2) + 'deg)';
    }
    // Stop-motion progress: eased progress snapped to N discrete levels, so
    // any motion driven by it advances in visible steps instead of gliding.
    function stepped(frame, o) {
        const dur = o.dur || 30, steps = o.steps || 6;
        const raw = clamp01((frame - (o.at || 0)) / dur);
        if (raw >= 1)
            return 1;
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
        if (pts.length < 2) {
            const q = pts[0] || [0, 0];
            return { x: q[0], y: q[1], angle: 0, p: 0, done: false };
        }
        const raw = clamp01((frame - (o.at || 0)) / (o.dur || 90));
        const p = (Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut)(raw);
        const segs = [];
        let total = 0;
        for (let i = 0; i < pts.length - 1; i++) {
            const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
            segs.push(len);
            total += len;
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
    // Odometer digit roll: every decimal column is a digit strip sliding
    // inside a clipped window, rolling forward from the `from` digit to the
    // `to` digit (plus `spin` extra full turns for flair). Columns start
    // staggered from the ones place up, so the roll settles in a leftward
    // cascade and lands perfectly aligned. Returns an HTML string.
    function counterRoll(frame, o) {
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
    function drawText(frame, o) {
        o = o || {};
        const p = (Easing[o.fn || 'linear'] || Easing.linear)(clamp01((frame - (o.at || 0)) / (o.dur || 45)));
        if (p <= 0)
            return '';
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
    function particleField(frame, o) {
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
            let x, y;
            if (mode === 'snow') {
                const fall = (o.speed == null ? 0.7 : o.speed) * (0.6 + hp * 0.9);
                y = ((hy * span + frame * fall) % span) - 10;
                x = hx * w + Math.sin(frame * swaySp + ph) * swayAmp;
            }
            else if (mode === 'rise') {
                const rise = (o.speed == null ? 0.55 : o.speed) * (0.6 + hp * 0.9);
                y = (h + 10) - ((hy * span + frame * rise) % span);
                x = hx * w + Math.sin(frame * swaySp + ph) * swayAmp;
            }
            else {
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
    // noiseGlow(): boiling light — a glow that never sits still.
    // Seeded value noise drives the core's radius and brightness
    // (the flame breathes), six satellite blobs pulse on their own
    // noise channels around it, and sparkles ignite on seeded cycles
    // where the light is hottest — pop in fast, decay slow. The
    // layer composites with mix-blend-mode ('screen' by default;
    // pass 'color-dodge' for the full blow-out). Frame-pure: same
    // frame, same string. Draw it AFTER the light source.
    function noiseGlow(frame, o) {
        o = o || {};
        const x = o.x == null ? 640 : o.x, y = o.y == null ? 360 : o.y;
        const r = o.r || 260;
        const color = o.color || '#FFC46B';
        const inten = o.intensity == null ? 0.85 : o.intensity;
        const boil = o.boil == null ? 1 : o.boil;
        const seed = o.seed || 0;
        const blend = o.blend || 'screen';
        const nSpark = o.sparkles == null ? 14 : o.sparkles;
        const hn = color.replace('#', '');
        const hf = hn.length === 3 ? hn.split('').map((c) => c + c).join('') : hn;
        const hnum = parseInt(hf, 16);
        const cr = (hnum >> 16) & 255, cg = (hnum >> 8) & 255, cb = hnum & 255;
        const rgba = (a) => 'rgba(' + cr + ',' + cg + ',' + cb + ',' +
            Math.max(0, Math.min(1, a)).toFixed(3) + ')';
        // seeded value noise: hash knots, smoothstep interpolation
        const vn = (t, s) => {
            const i = Math.floor(t), f = t - i;
            const u = f * f * (3 - 2 * f);
            return hash(i * 17.3 + s * 13.7 + 7) * (1 - u) + hash((i + 1) * 17.3 + s * 13.7 + 7) * u;
        };
        const t = frame * boil;
        const nR = vn(t * 0.045, seed + 1); // radius breathing
        const nI = vn(t * 0.06 + 31, seed + 2); // brightness boil
        const coreR = r * (0.9 + 0.22 * nR);
        const coreA = inten * (0.5 + 0.3 * nI);
        let s = '<div style="position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;mix-blend-mode:' + blend + ';">';
        for (let i = 0; i < 6; i++) {
            const ha = hash(i * 29.7 + seed * 3.1 + 3);
            const hd = hash(i * 47.3 + seed * 1.7 + 19);
            const ang = ha * Math.PI * 2;
            const dist = r * (0.18 + 0.42 * hd);
            const bx = x + Math.cos(ang) * dist, by = y + Math.sin(ang) * dist * 0.82;
            const br = r * (0.22 + 0.3 * hash(i * 13.9 + seed * 5.3 + 27));
            const ba = inten * 0.34 * (0.35 + 0.65 * vn(t * 0.05 + i * 13.7, seed + 10 + i));
            s += '<div style="position:absolute;left:' + (bx - br).toFixed(1) + 'px;top:' + (by - br).toFixed(1) +
                'px;width:' + (br * 2).toFixed(1) + 'px;height:' + (br * 2).toFixed(1) + 'px;border-radius:50%;background:radial-gradient(circle,' +
                rgba(ba) + ' 0%,' + rgba(0) + ' 70%);"></div>';
        }
        s += '<div style="position:absolute;left:' + (x - coreR).toFixed(1) + 'px;top:' + (y - coreR).toFixed(1) +
            'px;width:' + (coreR * 2).toFixed(1) + 'px;height:' + (coreR * 2).toFixed(1) + 'px;border-radius:50%;background:radial-gradient(circle,' +
            rgba(coreA) + ' 0%,' + rgba(coreA * 0.45) + ' 42%,' + rgba(0) + ' 72%);"></div>';
        for (let i = 0; i < nSpark; i++) {
            const ha = hash(i * 61.7 + seed * 2.3 + 43);
            const hd = hash(i * 83.1 + seed * 4.9 + 59);
            const ang = ha * Math.PI * 2;
            const dist = r * (0.15 + 0.8 * hd);
            const sx = x + Math.cos(ang) * dist, sy = y + Math.sin(ang) * dist * 0.85;
            const L = 80 + Math.floor(hash(i * 7.9 + seed * 6.1 + 71) * 90);
            const ph = hash(i * 19.3 + seed * 8.7 + 83) * L;
            const lt = ((frame + ph) % L) / L;
            const env = lt < 0.14 ? lt / 0.14 : Math.exp(-(lt - 0.14) * 7);
            if (env < 0.03)
                continue;
            const sz = (5 + hash(i * 3.7 + seed * 9.3 + 97) * 9) * (0.5 + 0.5 * env);
            const op = env * (0.45 + 0.55 * nI);
            s += '<svg style="position:absolute;left:' + (sx - sz).toFixed(1) + 'px;top:' + (sy - sz).toFixed(1) +
                'px;opacity:' + op.toFixed(3) + ';" width="' + (sz * 2).toFixed(1) + '" height="' + (sz * 2).toFixed(1) +
                '" viewBox="0 0 20 20"><path d="M10 0 L12.2 7.8 L20 10 L12.2 12.2 L10 20 L7.8 12.2 L0 10 L7.8 7.8 Z" fill="' + color + '"/></svg>';
        }
        return s + '</div>';
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
    function shapeVertices(name, R) {
        const P = (deg, r) => {
            const a = (deg * Math.PI) / 180;
            return [r * Math.cos(a), r * Math.sin(a)];
        };
        switch (name) {
            case 'square': return [-135, -45, 45, 135].map((d) => P(d, R));
            case 'diamond': return [-90, 0, 90, 180].map((d) => P(d, R));
            case 'triangle': return [-90, 30, 150].map((d) => P(d, R));
            case 'hexagon': return [-90, -30, 30, 90, 150, 210].map((d) => P(d, R));
            case 'star': {
                const v = [];
                for (let k = 0; k < 5; k++) {
                    v.push(P(-90 + k * 72, R));
                    v.push(P(-90 + 36 + k * 72, R * 0.45));
                }
                return v;
            }
            case 'heart': {
                // Classic parametric heart, recentered by its bounding box and
                // scaled so the larger half-extent equals R.
                const raw = [];
                for (let k = 0; k < 64; k++) {
                    const t = (k / 64) * Math.PI * 2;
                    const s = Math.sin(t);
                    raw.push([16 * s * s * s, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]);
                }
                let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
                for (const p of raw) {
                    x0 = Math.min(x0, p[0]);
                    x1 = Math.max(x1, p[0]);
                    y0 = Math.min(y0, p[1]);
                    y1 = Math.max(y1, p[1]);
                }
                const sc = R / Math.max((x1 - x0) / 2, (y1 - y0) / 2);
                return raw.map((p) => [(p[0] - (x0 + x1) / 2) * sc, (p[1] - (y0 + y1) / 2) * sc]);
            }
            default: { // circle
                const v = [];
                for (let k = 0; k < 64; k++)
                    v.push(P((k / 64) * 360, R));
                return v;
            }
        }
    }
    function sampleShape(verts, K, fallbackR) {
        const cross = (ax, ay, bx, by) => ax * by - ay * bx;
        const out = [];
        for (let k = 0; k < K; k++) {
            const a = -Math.PI / 2 + (k / K) * Math.PI * 2;
            const dx = Math.cos(a), dy = Math.sin(a);
            let best = -1;
            for (let i = 0; i < verts.length; i++) {
                const A = verts[i], B = verts[(i + 1) % verts.length];
                const ex = B[0] - A[0], ey = B[1] - A[1];
                const den = cross(dx, dy, ex, ey);
                if (Math.abs(den) < 1e-12)
                    continue;
                const t = cross(A[0], A[1], ex, ey) / den;
                const u = cross(A[0], A[1], dx, dy) / den;
                if (t > 0 && u >= -1e-9 && u <= 1 + 1e-9 && t > best)
                    best = t;
            }
            const r = best > 0 ? best : fallbackR;
            out.push([dx * r, dy * r]);
        }
        return out;
    }
    // Shape A -> B morph (circle, square, triangle, diamond, hexagon,
    // star, heart). Always renders the current interpolated shape —
    // progress clamps, so it holds `from` before `at` and `to` after.
    function morphShape(frame, o) {
        o = o || {};
        const names = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star', 'heart'];
        const pick = (n) => (n && names.indexOf(n) >= 0 ? n : 'circle');
        const R = o.size || 60;
        const A = sampleShape(shapeVertices(pick(o.from), R), 72, R);
        const B = sampleShape(shapeVertices(pick(o.to), R), 72, R);
        const p = (Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut)(clamp01((frame - (o.at || 0)) / (o.dur || 40)));
        const rot = ((o.rot || 0) * Math.PI) / 180;
        const cr = Math.cos(rot), sr = Math.sin(rot);
        const cx = o.x || 0, cy = o.y || 0;
        const pts = [];
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
    function glitch(frame, o) {
        o = o || {};
        const html = o.html || '';
        const at = o.at || 0, dur = o.dur || 18;
        if (frame < at || frame >= at + dur)
            return html;
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
        const layer = (inner) => '<div style="position:absolute;inset:0;">' + inner + '</div>';
        const ghost = (fid, dx) => '<div style="position:absolute;inset:0;opacity:0.55;mix-blend-mode:' + (o.blend || 'multiply') +
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
    function beatGrid(frame, o) {
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
    function beatFrames(o) {
        const fpb = (60 / (o.bpm || 120)) * (o.fps || 30);
        const out = [];
        for (let i = 0; i < (o.count || 0); i++)
            out.push(Math.round((o.at || 0) + i * fpb));
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
    function morphPoly(frame, o) {
        o = o || {};
        const even = (pts, n) => {
            const out = pts.slice();
            while (out.length < n) {
                let bi = 0, bl = -1;
                for (let i = 0; i < out.length; i++) {
                    const a = out[i], b = out[(i + 1) % out.length];
                    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
                    if (L > bl) {
                        bl = L;
                        bi = i;
                    }
                }
                const a = out[bi], b = out[(bi + 1) % out.length];
                out.splice(bi + 1, 0, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
            }
            return out;
        };
        const n = Math.max(o.from.length, o.to.length);
        const A = even(o.from, n), B = even(o.to, n);
        const p = (Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut)(clamp01((frame - (o.at || 0)) / (o.dur || 40)));
        const rot = ((o.rot || 0) * Math.PI) / 180;
        const cr = Math.cos(rot), sr = Math.sin(rot);
        const cx = o.x || 0, cy = o.y || 0;
        const pts = [];
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
    function splitText(frame, o) {
        o = o || {};
        const size = o.size || 64;
        const stag = o.stagger == null ? 3 : o.stagger;
        const dur = o.dur || 16;
        const mode = o.mode || 'rise';
        const fn = Easing[o.fn || 'cubicOut'] || Easing.cubicOut;
        const esc = (ch) => (ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch);
        const spans = String(o.text || '').split('').map((ch, i) => {
            const raw = clamp01((frame - (o.at || 0) - i * stag) / dur);
            const p = fn(raw);
            let transform = '';
            if (mode === 'rise')
                transform = 'transform:translateY(' + ((1 - p) * size * 0.55).toFixed(1) + 'px);';
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
    function wipeReveal(frame, o) {
        o = o || {};
        const dur = o.dur || 24;
        const fn = Easing[o.fn || 'cubicInOut'] || Easing.cubicInOut;
        const p = fn(clamp01((frame - (o.at || 0)) / dur));
        const hidden = ((1 - p) * 100).toFixed(1);
        let inset;
        switch (o.dir || 'right') {
            case 'left':
                inset = 'inset(0 0 0 ' + hidden + '%)';
                break;
            case 'up':
                inset = 'inset(' + hidden + '% 0 0 0)';
                break;
            case 'down':
                inset = 'inset(0 0 ' + hidden + '% 0)';
                break;
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
    function confetti(frame, o) {
        o = o || {};
        const t = frame - (o.at || 0);
        const life = o.life || 75;
        if (t < 0 || t > life)
            return '';
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
            const H = (a, b) => hash(i * a + seed * b);
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
    function cursor(frame, o) {
        o = o || {};
        const keys = (o.path || []).slice().sort((a, b) => a.f - b.f);
        if (!keys.length)
            return '';
        const from = o.showFrom == null ? keys[0].f : o.showFrom;
        const to = o.showTo == null ? Infinity : o.showTo;
        if (frame < from || frame > to)
            return '';
        const posAt = (f) => {
            if (f <= keys[0].f)
                return keys[0];
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
    function isoPt(o, x, y, z) {
        const unit = o.unit || 36;
        return [(o.ox || 0) + (x - y) * unit * ISO_C, (o.oy || 0) + (x + y) * unit * ISO_S - z * unit];
    }
    function shade(hex, pct) {
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
    function isoSvg(minX, minY, w, h, inner) {
        return '<svg style="position:absolute;left:' + minX.toFixed(1) + 'px;top:' + minY.toFixed(1) +
            'px;" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" viewBox="0 0 ' + w.toFixed(1) + ' ' + h.toFixed(1) + '">' + inner + '</svg>';
    }
    // A solid box: width w (x axis), depth d (y axis), height h (z).
    // Three visible faces, shaded from `color` unless overridden.
    function isoBox(o) {
        o = o || {};
        const x = o.x || 0, y = o.y || 0, z = o.z || 0;
        const w = o.w || 1, d = o.d || 1, h = o.h == null ? 1 : o.h;
        const color = o.color || '#8A93A6';
        const P = (dx, dy, dz) => isoPt(o, x + dx, y + dy, z + dz);
        const t0 = P(0, 0, h), t1 = P(w, 0, h), t2 = P(w, d, h), t3 = P(0, d, h);
        const b1 = P(w, 0, 0), b2 = P(w, d, 0), b3 = P(0, d, 0);
        const all = [t0, t1, t2, t3, b1, b2, b3];
        const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
        const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
        const pts = (list) => list.map((p) => (p[0] - minX).toFixed(1) + ',' + (p[1] - minY).toFixed(1)).join(' ');
        const edge = o.stroke === 'none' ? '' : ' stroke="' + (o.stroke || shade(color, -48)) + '" stroke-width="1" stroke-linejoin="round"';
        const poly = (list, fill) => '<polygon points="' + pts(list) + '" fill="' + fill + '"' + edge + '/>';
        return isoSvg(minX, minY, maxX - minX, maxY - minY, poly([t3, t2, b2, b3], o.left || shade(color, -2)) + // +y face (left-down)
            poly([t1, t2, b2, b1], o.right || shade(color, -24)) + // +x face (right-down)
            poly([t0, t1, t2, t3], o.top || shade(color, 30))); // top
    }
    // A solid cylinder standing on the xy plane: radius r, height h.
    // The top is the projected circle — an axis-aligned ellipse with
    // rx = r * unit * sqrt(3/2), ry = r * unit * sqrt(1/2).
    function isoCylinder(o) {
        o = o || {};
        const x = o.x || 0, y = o.y || 0, z = o.z || 0;
        const r = o.r || 0.5, h = o.h == null ? 1 : o.h, unit = o.unit || 36;
        const color = o.color || '#8A93A6';
        const c0 = isoPt(o, x, y, z), c1 = isoPt(o, x, y, z + h);
        const rx = r * unit * 1.2247, ry = r * unit * 0.7071;
        const minX = c1[0] - rx, maxX = c1[0] + rx;
        const minY = c1[1] - ry, maxY = c0[1] + ry;
        const L = (v) => (v - minX).toFixed(1);
        const T = (v) => (v - minY).toFixed(1);
        const edge = o.stroke === 'none' ? '' : ' stroke="' + (o.stroke || shade(color, -48)) + '" stroke-width="1"';
        const body = 'M ' + L(c1[0] - rx) + ' ' + T(c1[1]) +
            ' L ' + L(c0[0] - rx) + ' ' + T(c0[1]) +
            ' A ' + rx.toFixed(1) + ' ' + ry.toFixed(1) + ' 0 0 0 ' + L(c0[0] + rx) + ' ' + T(c0[1]) +
            ' L ' + L(c1[0] + rx) + ' ' + T(c1[1]) + ' Z';
        return isoSvg(minX, minY, maxX - minX, maxY - minY, '<path d="' + body + '" fill="' + shade(color, -8) + '"' + edge + '/>' +
            '<ellipse cx="' + L(c1[0]) + '" cy="' + T(c1[1]) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) +
            '" fill="' + (o.top || shade(color, 30)) + '"' + edge + '/>');
    }
    // A wedge (triangular prism): high edge at x, sloping down
    // along +x for `len`, depth d, height h. Two visible faces: the
    // slope and the +y triangle.
    function isoWedge(o) {
        o = o || {};
        const x = o.x || 0, y = o.y || 0, z = o.z || 0;
        const len = o.len || 1, d = o.d || 1, h = o.h == null ? 1 : o.h;
        const color = o.color || '#8A93A6';
        const P = (dx, dy, dz) => isoPt(o, x + dx, y + dy, z + dz);
        const B = P(len, 0, 0), C = P(len, d, 0), D = P(0, d, 0), E = P(0, 0, h), F = P(0, d, h);
        const all = [B, C, D, E, F];
        const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
        const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
        const pts = (list) => list.map((p) => (p[0] - minX).toFixed(1) + ',' + (p[1] - minY).toFixed(1)).join(' ');
        const edge = o.stroke === 'none' ? '' : ' stroke="' + (o.stroke || shade(color, -48)) + '" stroke-width="1" stroke-linejoin="round"';
        const poly = (list, fill) => '<polygon points="' + pts(list) + '" fill="' + fill + '"' + edge + '/>';
        return isoSvg(minX, minY, maxX - minX, maxY - minY, poly([D, C, F], o.side || shade(color, -6)) + // +y triangle
            poly([E, F, C, B], o.top || shade(color, 16))); // the slope
    }
    // A pipe run through world points [[x, y, z], ...]: a stylized
    // tube of constant screen width (2.2 * r * unit), round joints
    // with joint dots at the bends and a shifted highlight stroke
    // for the lit edge. Diagram-style piping that mixes cleanly
    // with the solid parts; route it through connectors, tanks,
    // and housings.
    function isoPipe(o) {
        o = o || { path: [] };
        const pts3 = o.path || [];
        if (pts3.length < 2)
            return '';
        const unit = o.unit || 36;
        const r = o.r || 0.16;
        const w = r * unit * 2.2;
        const color = o.color || '#9AA7BD';
        const sp = pts3.map((p) => isoPt(o, p[0] || 0, p[1] || 0, p[2] || 0));
        const minX = Math.min(...sp.map((p) => p[0])) - w, maxX = Math.max(...sp.map((p) => p[0])) + w;
        const minY = Math.min(...sp.map((p) => p[1])) - w, maxY = Math.max(...sp.map((p) => p[1])) + w;
        const d = sp.map((p, i) => (i ? 'L ' : 'M ') + (p[0] - minX).toFixed(1) + ' ' + (p[1] - minY).toFixed(1)).join(' ');
        const joints = sp.slice(1, -1).map((p) => '<circle cx="' + (p[0] - minX).toFixed(1) + '" cy="' + (p[1] - minY).toFixed(1) + '" r="' + (w / 2).toFixed(1) + '" fill="' + shade(color, -8) + '"/>').join('');
        return isoSvg(minX, minY, maxX - minX, maxY - minY, '<path d="' + d + '" fill="none" stroke="' + shade(color, -8) + '" stroke-width="' + w.toFixed(1) + '" stroke-linejoin="round" stroke-linecap="round"/>' +
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
    function isoGear(o) {
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
    // A cone on the iso camera: apex above a projected-circle
    // base. The silhouette lines are the true tangents from the
    // apex to the base ellipse (chord-of-contact: the tangent
    // points sit at y = -ry^2 / d for apex distance d), the front
    // arc closes the base, and the surface shades in two halves —
    // lighter left, darker right.
    function isoCone(o) {
        o = o || {};
        const x = o.x || 0, y = o.y || 0, z = o.z || 0;
        const r = o.r || 0.6, h = o.h == null ? 1.2 : o.h, unit = o.unit || 36;
        const color = o.color || '#8A93A6';
        const c0 = isoPt(o, x, y, z), apex = isoPt(o, x, y, z + h);
        const rx = r * unit * 1.2247, ry = r * unit * 0.7071;
        const d = h * unit;
        const yt = d > ry ? -ry * ry / d : 0; // tangent-point y relative to the base centre
        const xt = rx * Math.sqrt(Math.max(0, 1 - (yt * yt) / (ry * ry)));
        const lt = [c0[0] - xt, c0[1] + yt], rt = [c0[0] + xt, c0[1] + yt];
        const bot = [c0[0], c0[1] + ry];
        const minX = c0[0] - rx, maxX = c0[0] + rx, minY = apex[1], maxY = c0[1] + ry;
        const L = (v) => (v - minX).toFixed(1);
        const T = (v) => (v - minY).toFixed(1);
        const arc = (to) => ' A ' + rx.toFixed(1) + ' ' + ry.toFixed(1) + ' 0 0 0 ' + L(to[0]) + ' ' + T(to[1]); // sweep 0: the front arc, same as isoCylinder
        const edge = o.stroke === 'none' ? '' : ' stroke="' + (o.stroke || shade(color, -48)) + '" stroke-width="1" stroke-linejoin="round"';
        const leftHalf = 'M ' + L(apex[0]) + ' ' + T(apex[1]) + ' L ' + L(lt[0]) + ' ' + T(lt[1]) + arc(bot) + ' Z';
        const rightHalf = 'M ' + L(apex[0]) + ' ' + T(apex[1]) + ' L ' + L(bot[0]) + ' ' + T(bot[1]) + arc(rt) + ' Z';
        return isoSvg(minX, minY, maxX - minX, maxY - minY, '<path d="' + leftHalf + '" fill="' + shade(color, 4) + '"' + edge + '/>' +
            '<path d="' + rightHalf + '" fill="' + shade(color, -20) + '"' + edge + '/>');
    }
    // A bolt: a hex-head prism on a short cylinder shaft. The head
    // is a regular hexagon in the ground plane, projected vertex
    // by vertex; all six side quads are drawn first (the top face,
    // drawn last, covers the back ones — the standard prism trick),
    // sides toned by which half of the screen they fall on.
    function isoBolt(o) {
        o = o || {};
        const x = o.x || 0, y = o.y || 0, z = o.z || 0;
        const r = o.r || 0.32, headH = o.headH == null ? 0.22 : o.headH, shaftH = o.shaftH == null ? 0.3 : o.shaftH;
        const color = o.color || '#9AA7BD';
        const hz = z + shaftH;
        const verts = [];
        for (let k = 0; k < 6; k++) {
            const a = (k / 6) * Math.PI * 2;
            verts.push(isoPt(o, x + Math.cos(a) * r, y + Math.sin(a) * r, hz + headH));
        }
        const drop = verts.map((v) => [v[0], v[1] + headH * (o.unit || 36)]);
        const all = verts.concat(drop);
        const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
        const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
        const pts = (list) => list.map((p) => (p[0] - minX).toFixed(1) + ',' + (p[1] - minY).toFixed(1)).join(' ');
        const edge = o.stroke === 'none' ? '' : ' stroke="' + (o.stroke || shade(color, -48)) + '" stroke-width="1" stroke-linejoin="round"';
        const centreX = (minX + maxX) / 2;
        let sides = '';
        for (let k = 0; k < 6; k++) {
            const a = verts[k], b = verts[(k + 1) % 6];
            const midX = (a[0] + b[0]) / 2;
            sides += '<polygon points="' + pts([a, b, drop[(k + 1) % 6], drop[k]]) + '" fill="' + shade(color, midX < centreX ? -4 : -22) + '"' + edge + '/>';
        }
        const head = isoSvg(minX, minY, maxX - minX, maxY - minY, sides + '<polygon points="' + pts(verts) + '" fill="' + (o.top || shade(color, 28)) + '"' + edge + '/>');
        return isoCylinder({ ...o, r: r * 0.55, h: shaftH }) + head;
    }
    // A data terrain: a grid of iso columns whose heights form a
    // gaussian hill around a focus point. The focus is fixed
    // (fx, fy, in grid cells) or orbits the grid centre when
    // `auto` is on; taller columns shade lighter toward the top
    // colour. One call returns the whole field, painter-sorted.
    // From the X sweep (the Hairline-style iso data landscapes).
    function isoTerrain(frame, o) {
        o = o || {};
        const cols = o.cols || 10, rows = o.rows || 10;
        const amp = o.amp == null ? 1.6 : o.amp, sigma = o.sigma || 2.4;
        const color = o.color || '#3E7CB1';
        let fx = o.fx == null ? cols / 2 : o.fx, fy = o.fy == null ? rows / 2 : o.fy;
        if (o.auto) {
            const t = frame * (o.speed || 0.02);
            fx = cols / 2 + Math.cos(t) * cols * 0.28;
            fy = rows / 2 + Math.sin(t) * rows * 0.28;
        }
        const parts = [];
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                const d2 = (i - fx) * (i - fx) + (j - fy) * (j - fy);
                const h = 0.12 + amp * Math.exp(-d2 / (2 * sigma * sigma));
                parts.push({
                    x: i, y: j, z: 0,
                    html: isoBox({ ...o, x: i, y: j, z: 0, w: 0.92, d: 0.92, h, color, top: shade(color, Math.round(6 + h * 16)) }),
                });
            }
        }
        return isoSort(parts);
    }
    // Painter's order for iso parts: ascending (x + y), ties by z.
    // Parts carry their resting coords; the html may be built at an
    // animated offset without changing the paint order.
    function isoSort(parts) {
        return parts.slice()
            .sort((a, b) => (a.x + a.y) - (b.x + b.y) || (a.z || 0) - (b.z || 0))
            .map((p) => p.html).join('');
    }
    return {
        pop, ease, fadeUp, pulse, countUp, stagger, fly, trail, smear, squash,
        paperEl, pivot, stepped, onTwos, whip, pathFly, orbit, swing, marquee, marchingAnts, highlightBox, waveLine, spotlight, relay, maskReveal, matchCut, pixelDissolve, charGrid, assembleText, textOnPath, patternField, slitScan, portalWipe, rings, liquidMetal, liquidMetalDraw, flipIn, counterRoll, drawText, particleField, noiseGlow, morphShape, glitch,
        beatGrid, beatFrames, inertia, anticipate, followThrough, velocitySkew, morphPoly, splitText, wipeReveal, confetti, cursor, isoBox, isoCylinder, isoWedge, isoPipe, isoGear, isoCone, isoBolt, isoTerrain, isoSort,
        dot, ripple, burst, badge, targetSlot, scene, transition, wiggle, typewriter,
        beat, drop, travel, shake, punch, flash, camera, parallax, meshBg, drawOn, poly, bars,
        scramble, splitFlap, kenBurns, breathe, fx, hash,
        clamp01, Easing,
    };
})();
// Short alias for compositions.
__root.M = __root.Motion;
