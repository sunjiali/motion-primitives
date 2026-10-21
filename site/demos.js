// Live demos + playground for the motion-primitives site.
// Everything below runs on the real library (window.Motion) — the same code
// that renders the MP4s — driven by a virtual frame counter at 30fps.
(function () {
  const M = window.Motion;
  if (!M) return;
  const INK = '#33302B';
  const C = { orange: '#FF8A4C', blue: '#3FB6FF', green: '#4ED06A', yellow: '#FFD93D', purple: '#C792EA', pink: '#FF6B81' };
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const runners = []; // {stage, cycle, draw(f) -> html}
  const visibility = new Map(); // inner stage -> on screen?
  function apply(r, f) { r.stage.innerHTML = r.draw(((f % r.cycle) + r.cycle) % r.cycle); }
  function addRunner(stage, cycle, draw) {
    const r = { stage, cycle, draw };
    runners.push(r);
    apply(r, reduced ? Math.floor(cycle * 0.45) : 0);
  }
  // Fixed-coordinate stage that scales to its container (mobile-safe) and
  // reports on-screen visibility so off-screen demos stop redrawing.
  function makeStage(outer, baseW, baseH) {
    const inner = document.createElement('div');
    inner.style.cssText = 'position:absolute;left:0;top:0;width:' + baseW + 'px;height:' + baseH +
      'px;transform-origin:0 0;overflow:hidden;';
    outer.insertBefore(inner, outer.firstChild); // stay under overlays like the code bar
    const fit = () => {
      const s = outer.clientWidth / baseW;
      inner.style.transform = 'scale(' + s + ')';
      outer.style.height = (baseH * s) + 'px';
    };
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(outer);
    visibility.set(inner, true);
    if (window.IntersectionObserver) {
      new IntersectionObserver((es) => {
        es.forEach((e) => visibility.set(inner, e.isIntersecting));
      }, { rootMargin: '80px' }).observe(outer);
    }
    return inner;
  }

  // ---------- gallery demos (stage coordinate space: 560 x 260) ----------
  const W = 560, H = 260, CX = W / 2, CY = H / 2;
  const demos = [
    {
      name: 'pop', desc: 'Springy scale-in with physical overshoot.',
      code: 'M.pop(frame, { at: 10, stiffness: 120, damping: 11 })', cycle: 95,
      draw(f) {
        const s = M.pop(f, { at: 10, stiffness: 120, damping: 11 });
        return M.dot({ x: CX, y: CY, r: 62, color: C.orange, scale: Math.max(s, 0.001), candy: true });
      },
    },
    {
      name: 'fadeUp', desc: 'Fade + rise entrance, as a style string for any element.',
      code: "style = M.fadeUp(frame, { at: 8, dur: 22, dist: 52 })", cycle: 100,
      draw(f) {
        const st = M.fadeUp(f, { at: 8, dur: 22, dist: 52 });
        return '<div style="position:absolute;left:' + (CX - 130) + 'px;top:' + (CY - 42) + 'px;width:260px;' +
          'padding:24px 0;text-align:center;background:#fff;border:2px solid #EFE6D4;border-radius:16px;' +
          'font:700 24px sans-serif;color:' + INK + ';' + st + '">Hello, motion</div>';
      },
    },
    {
      name: 'pulse + targetSlot', desc: 'A breathing dashed slot that begs to be filled — then is.',
      code: 'M.targetSlot(frame, { r: 46, color }) · M.pulse(frame)', cycle: 130,
      draw(f) {
        if (f < 78) return M.targetSlot(f, { x: CX, y: CY, r: 46, color: C.blue });
        const s = M.pop(f, { at: 78, stiffness: 140, damping: 10 });
        return M.dot({ x: CX, y: CY, r: 46, color: C.blue, scale: Math.max(s, 0.001), candy: true }) +
          M.ripple(f, { x: CX, y: CY, at: 84, color: C.blue });
      },
    },
    {
      name: 'countUp', desc: 'Integer count-up for scores, totals and step counters.',
      code: 'M.countUp(frame, { at: 6, dur: 70, to: 100 })', cycle: 110,
      draw(f) {
        const n = M.countUp(f, { at: 6, dur: 70, from: 0, to: 100 });
        return '<div style="position:absolute;left:0;right:0;top:64px;text-align:center;">' +
          '<span style="font:800 120px sans-serif;color:' + C.purple + ';">' + n + '</span></div>';
      },
    },
    {
      name: 'stagger', desc: 'One delay helper turns a loop into a choreographed group entrance.',
      code: 'M.pop(frame, { at: M.stagger(i, { each: 9 }) })', cycle: 105,
      draw(f) {
        const cols = [C.orange, C.blue, C.green, C.yellow, C.purple, C.pink];
        let s = '';
        for (let i = 0; i < 6; i++) {
          const v = M.pop(f, { at: M.stagger(i, { base: 6, each: 9 }), stiffness: 130, damping: 10 });
          s += M.dot({ x: 88 + i * 78, y: CY, r: 34, color: cols[i], scale: Math.max(v, 0.001), candy: true });
        }
        return s;
      },
    },
    {
      name: 'fly + trail', desc: 'Eased arc flight between two points, with ghost trail positions.',
      code: 'M.fly(frame, { from, to, arc: 130 }) · M.trail(frame, …)', cycle: 115,
      draw(f) {
        const o = { at: 8, dur: 80, from: { x: 70, y: 205 }, to: { x: 490, y: 205 }, arc: 130 };
        let s = '';
        for (const t of M.trail(f, o)) s += M.dot({ x: t.x, y: t.y, r: 30, color: C.blue, scale: t.scale, opacity: t.opacity });
        const p = M.fly(f, o);
        return s + M.dot({ x: p.x, y: p.y, r: 32, color: C.blue, candy: true, glow: true });
      },
    },
    {
      name: 'smear', desc: 'Motion blur that follows velocity: the top ball flies bare, the bottom one smears — same speed.',
      code: 'M.smear(frame, { from, to, span: TUNE.blur })', cycle: 100,
      draw(f) {
        // TUNE — this card's knobs in one place (the six-knobs convention).
        const TUNE = { spacing: 420, blur: 6, dur: 38, at: 6 };
        const o = { at: TUNE.at, dur: TUNE.dur, from: { x: 70, y: 0 }, to: { x: 70 + TUNE.spacing, y: 0 }, arc: 0 };
        const label = (y, t) => '<div style="position:absolute;left:24px;top:' + y + 'px;font:600 12px ui-monospace,Menlo,monospace;color:#8A7D68;letter-spacing:.08em;">' + t + '</div>';
        let s = label(26, 'NO BLUR') + label(140, 'SMEAR');
        const p1 = M.fly(f, { ...o, from: { ...o.from, y: 78 }, to: { ...o.to, y: 78 } });
        s += M.dot({ x: p1.x, y: p1.y, r: 26, color: C.pink, candy: true });
        const o2 = { ...o, from: { ...o.from, y: 192 }, to: { ...o.to, y: 192 } };
        for (const g of M.smear(f, { ...o2, span: TUNE.blur })) {
          s += M.dot({ x: g.x, y: g.y, r: 26, color: C.pink, scale: g.scale, opacity: g.opacity });
        }
        const p2 = M.fly(f, o2);
        return s + M.dot({ x: p2.x, y: p2.y, r: 26, color: C.pink, candy: true, glow: true });
      },
    },
    {
      name: 'counterRoll', desc: 'Odometer roll: every column spins forward and settles in a leftward cascade.',
      code: 'M.counterRoll(frame, { from: 0, to: 8848 })', cycle: 160,
      draw(f) {
        return '<div style="position:absolute;left:0;right:0;top:74px;text-align:center;">' +
          M.counterRoll(f, { at: 12, dur: 74, stagger: 5, from: 0, to: 8848, size: 74, color: INK }) +
          '<div style="margin-top:14px;font:600 13px ui-monospace,Menlo,monospace;color:#8A7D68;letter-spacing:.22em;">METERS ABOVE SEA LEVEL</div></div>';
      },
    },
    {
      name: 'drawText', desc: 'Handwriting stroke text: the outlines draw themselves, then the fill settles in.',
      code: 'M.drawText(frame, { text: "Draw it." })', cycle: 170,
      draw(f) {
        return '<div style="position:absolute;inset:0;">' +
          M.drawText(f, { text: 'Draw it.', at: 14, dur: 84, size: 92, x: 280, y: 128, color: INK }) +
          '<div style="position:absolute;left:0;right:0;top:168px;text-align:center;font:600 13px ui-monospace,Menlo,monospace;color:#8A7D68;letter-spacing:.22em;">ANY SCRIPT THE FONT COVERS</div></div>';
      },
    },
    {
      name: 'particleField', desc: 'Ambient particle layer — stars, dust, snow — pure atmosphere behind any scene.',
      code: 'M.particleField(frame, { mode: "snow" })', cycle: 220,
      draw(f) {
        return '<div style="position:absolute;inset:0;background:linear-gradient(170deg,#171233,#0B0916);">' +
          M.particleField(f, { n: 52, w: 560, h: 260, mode: 'snow', color: '#EAF2FF', rMin: 1.2, rMax: 3.2 }) +
          '<div style="position:absolute;left:0;right:0;top:196px;text-align:center;font:600 13px ui-monospace,Menlo,monospace;color:#9FB4D8;letter-spacing:.22em;">FIRST SNOW</div></div>';
      },
    },
    {
      name: 'morphShape', desc: 'Shape-to-shape morph — circle, star, heart — resampled and interpolated point by point.',
      code: 'M.morphShape(frame, { from: "circle", to: "heart" })', cycle: 180,
      draw(f) {
        let args;
        if (f < 60) args = { from: 'circle', to: 'star', at: 12, dur: 36 };
        else if (f < 120) args = { from: 'star', to: 'heart', at: 72, dur: 36 };
        else args = { from: 'heart', to: 'circle', at: 132, dur: 36 };
        return M.morphShape(f, { ...args, size: 78, x: 280, y: 116, color: C.orange }) +
          '<div style="position:absolute;left:0;right:0;top:214px;text-align:center;font:600 13px ui-monospace,Menlo,monospace;color:#8A7D68;letter-spacing:.22em;">CIRCLE → STAR → HEART</div>';
      },
    },
    {
      name: 'glitch', desc: 'RGB-split glitch transition — sliced, channel-shifted, gone in half a second.',
      code: 'M.glitch(frame, { html })', cycle: 110,
      draw(f) {
        const html = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 74px sans-serif;color:#F2EFE9;letter-spacing:.04em;">SIGNAL</div>';
        return '<div style="position:absolute;inset:0;background:#14101F;">' +
          M.glitch(f, { at: 30, dur: 18, html, amount: 16, blend: 'screen' }) + '</div>';
      },
    },
    {
      name: 'beatGrid', desc: 'BPM grid: a pulse on every beat and the frame numbers an SFX score needs.',
      code: 'M.beatGrid(frame, { bpm: 132 })', cycle: 218,
      draw(f) {
        const b = M.beatGrid(f, { bpm: 132, fps: 60 });
        const dots = [0, 1, 2, 3].map((i) =>
          '<span style="display:inline-block;width:13px;height:13px;border-radius:50%;margin:0 7px;background:' +
          (i === b.inBar ? C.orange : '#D8CFBB') + ';"></span>').join('');
        return '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;">' +
          '<div style="width:104px;height:104px;border-radius:50%;background:' + C.pink + ';transform:scale(' + (1 + 0.3 * b.pulse).toFixed(3) + ');"></div>' +
          '<div>' + dots + '</div>' +
          '<div style="font:600 13px ui-monospace,Menlo,monospace;color:#8A7D68;letter-spacing:.22em;">132 BPM · BAR ' + (b.bar % 2 + 1) + '</div></div>';
      },
    },
    {
      name: 'morphPoly', desc: 'Morph between two raw polygon point sets — the engine behind morphShape, unboxed.',
      code: 'M.morphPoly(frame, { from: penta, to: house })', cycle: 150,
      draw(f) {
        const penta = [0, 1, 2, 3, 4].map((k) => {
          const a = (-90 + k * 72) * Math.PI / 180;
          return [Math.cos(a) * 82, Math.sin(a) * 82];
        });
        const house = [[0, -72], [58, -18], [58, 62], [-58, 62], [-58, -18]];
        const go = f < 75;
        return M.morphPoly(f, {
          from: go ? penta : house, to: go ? house : penta,
          at: go ? 14 : 89, dur: 44, x: 280, y: 122, color: C.blue,
        }) + '<div style="position:absolute;left:0;right:0;top:216px;text-align:center;font:600 13px ui-monospace,Menlo,monospace;color:#8A7D68;letter-spacing:.22em;">PENTAGON ⇄ HOUSE</div>';
      },
    },
    {
      name: 'parallax', desc: 'One camera move, felt at four depths — near paper layers travel faster than far ones.',
      code: 'M.parallax(frame, keys, depth, stage)', cycle: 220,
      draw(f) {
        const keys = [{ f: 0, x: 280, y: 130, z: 1 }, { f: 110, x: 450, y: 130, z: 1 }, { f: 220, x: 280, y: 130, z: 1 }];
        const st = { w: 560, h: 260 };
        const L = (d, inner) => '<div style="position:absolute;inset:0;transform:' + M.parallax(f, keys, d, st) + '">' + inner + '</div>';
        const svg = (body) => '<svg style="position:absolute;left:-280px;top:0;" width="1120" height="260" viewBox="0 0 1120 260">' + body + '</svg>';
        const sun = '<div style="position:absolute;left:452px;top:24px;width:44px;height:44px;border-radius:50%;background:#F5C93F;"></div>';
        const far = svg('<path d="M0 190 L120 90 L260 190 L400 70 L540 190 L680 100 L820 190 L950 80 L1120 190 L1120 260 L0 260 Z" fill="#B9CFE4"/>');
        const mid = svg('<path d="M0 215 Q 180 160 360 210 T 720 205 T 1120 200 L1120 260 L0 260 Z" fill="#7FA36B"/>');
        const near = svg('<path d="M0 238 Q 280 218 560 236 T 1120 232 L1120 260 L0 260 Z" fill="#2F5233"/><path d="M180 236 l16 -44 l16 44 Z" fill="#26512B"/><path d="M760 240 l14 -38 l14 38 Z" fill="#26512B"/><path d="M980 238 l16 -44 l16 44 Z" fill="#26512B"/>');
        return '<div style="position:absolute;inset:0;background:#FBF3DF;overflow:hidden;">' +
          L(0, sun) + L(0.25, far) + L(0.55, mid) + L(1, near) +
          '<div style="position:absolute;left:0;right:0;top:14px;text-align:center;font:600 13px ui-monospace,Menlo,monospace;color:#8A7D68;letter-spacing:.22em;">ONE CAMERA · FOUR DEPTHS</div></div>';
      },
    },
    {
      name: 'splitText', desc: 'Split-text entrance: every character lands on its own stagger — rise, pop, fade.',
      code: 'M.splitText(frame, { text: "Split Text" })', cycle: 170,
      draw(f) {
        return M.splitText(f, { text: 'Split Text', at: 8, dur: 13, stagger: 3, size: 63, x: 280, y: 92, color: INK }) +
          M.splitText(f, { text: 'one letter at a time', at: 36, dur: 12, stagger: 2, size: 27, mode: 'pop', x: 280, y: 172, color: C.pink, weight: 700 });
      },
    },
    {
      name: 'wipeReveal', desc: 'Directional clip-path wipe: reveals any HTML in place — content lands, never slides.',
      code: 'M.wipeReveal(frame, { html, dir: "right" })', cycle: 170,
      draw(f) {
        const panel = '<div style="position:absolute;left:70px;top:40px;width:420px;height:100px;border-radius:18px;background:#2F6DB3;color:#fff;font:800 41px sans-serif;display:flex;align-items:center;justify-content:center;">WIPE REVEAL</div>';
        const sub = '<div style="position:absolute;left:0;right:0;top:168px;text-align:center;font:700 24px sans-serif;color:' + INK + ';">content lands, no slide</div>';
        return M.wipeReveal(f, { html: panel, at: 10, dur: 26 }) +
          M.wipeReveal(f, { html: sub, at: 46, dur: 22, dir: 'left' });
      },
    },
    {
      name: 'flipIn', desc: '3D flip entrance with an overshoot settle — flashcards, tiles, reveals.',
      code: 'M.flipIn(frame, { at, axis: "Y" })', cycle: 130,
      draw(f) {
        let s = '';
        const tiles = [['A', C.orange], ['B', C.blue], ['C', C.green]];
        tiles.forEach((t, i) => {
          s += '<div style="position:absolute;left:' + (92 + i * 138) + 'px;top:64px;width:114px;height:130px;' +
            M.flipIn(f, { at: 12 + i * 14, dur: 24 }) + '">' +
            '<div style="width:100%;height:100%;border-radius:14px;background:' + t[1] +
            ';color:#fff;display:flex;align-items:center;justify-content:center;font:800 54px Georgia,serif;box-shadow:0 10px 24px rgba(51,48,43,.18);">' + t[0] + '</div></div>';
        });
        return s;
      },
    },
    {
      name: 'pathFly', desc: 'Constant-speed flight along any path — the paper plane holds its pace through every curve.',
      code: 'M.pathFly(frame, { pts: loop, dur: 108 })', cycle: 120,
      draw(f) {
        const pts = [];
        for (let i = 0; i <= 40; i++) {
          const a = (i / 40) * Math.PI * 2;
          pts.push([280 + Math.cos(a) * 190, 130 + Math.sin(a) * 82]);
        }
        let s = '';
        for (let i = 0; i < pts.length - 1; i += 2) s += M.dot({ x: pts[i][0], y: pts[i][1], r: 3, color: INK, opacity: 0.22 });
        const pos = M.pathFly(f, { at: 4, dur: 108, pts, fn: 'linear' });
        s += M.paperEl({ x: pos.x, y: pos.y, w: 36, h: 20, color: C.orange, radius: 9, rot: pos.angle });
        return s + M.dot({ x: pos.x, y: pos.y, r: 5, color: '#FFF6E8' });
      },
    },
    {
      name: 'whip', desc: 'Whip-pan transition: the strip slingshots sideways, blur peaking where the cut hides.',
      code: 'M.whip(frame, { at, dur: 16, width: 560 })', cycle: 120,
      draw(f) {
        const w = M.whip(f, { at: 46, dur: 16, width: 560 });
        const panel = (left, bg, dotC, label) =>
          '<div style="position:absolute;left:' + left + 'px;top:0;width:560px;height:260px;background:' + bg + ';">' +
          M.dot({ x: 280, y: 118, r: 44, color: dotC, candy: true }) +
          '<div style="position:absolute;left:0;right:0;top:188px;text-align:center;font:700 17px ui-monospace,Menlo,monospace;color:#33302B;letter-spacing:.14em;">' + label + '</div></div>';
        return '<div style="position:absolute;left:0;top:0;width:1120px;height:260px;transform:translateX(' +
          w.x.toFixed(1) + 'px);filter:blur(' + w.blur.toFixed(1) + 'px);">' +
          panel(0, '#FBF0DC', C.orange, 'SCENE A') + panel(560, '#BFE3DD', C.pink, 'SCENE B') + '</div>';
      },
    },
    {
      name: 'paper-cut', desc: 'A cut-paper world: thickness shadows, a puppet-joint flag, everything shot on twos.',
      code: 'M.paperEl(...) · M.pivot(frame, { steps }) · M.onTwos(frame)', cycle: 130,
      draw(f) {
        const f2 = M.onTwos(f); // the whole card runs on stop-motion time
        let s = '';
        s += M.paperEl({ x: 118, y: 248, w: 350, h: 96, color: '#2E6E6A', rot: -2, radius: 42 });
        s += M.paperEl({ x: 445, y: 254, w: 370, h: 104, color: '#3E8E7E', rot: 1.5, radius: 46 });
        // Sun: paper disc + a ray cross turning on a pivot, stepped stiffly.
        s += '<div style="position:absolute;left:64px;top:12px;width:96px;height:96px;transform-origin:48px 48px;transform:' +
          M.pivot(f2, { at: 0, dur: 128, from: 0, to: 360, fn: 'linear', steps: 24 }) + ';">' +
          M.paperEl({ x: 48, y: 9, w: 11, h: 28, color: '#FFB84D', radius: 5 }) +
          M.paperEl({ x: 48, y: 87, w: 11, h: 28, color: '#FFB84D', radius: 5 }) +
          M.paperEl({ x: 9, y: 48, w: 28, h: 11, color: '#FFB84D', radius: 5 }) +
          M.paperEl({ x: 87, y: 48, w: 28, h: 11, color: '#FFB84D', radius: 5 }) + '</div>';
        s += M.paperEl({ x: 112, y: 60, w: 62, h: 62, color: '#FFCF5C', shape: 'circle' });
        // Clouds drift on twos.
        const cx1 = 330 + ((f2 * 2) % 300);
        const cx2 = 180 + ((f2 * 1) % 340);
        s += M.paperEl({ x: cx1 - 150, y: 52, w: 110, h: 40, color: '#FFF6E8', shape: 'blob' });
        s += M.paperEl({ x: cx2, y: 108, w: 84, h: 32, color: '#FFF6E8', shape: 'blob', rot: 2 });
        // A paper flag fluttering on its pole joint, out and back in steps.
        const flagRot = f2 < 70
          ? M.pivot(f2, { at: 6, dur: 54, from: 0, to: 14, steps: 5 })
          : M.pivot(f2, { at: 70, dur: 54, from: 14, to: 0, steps: 5 });
        s += M.paperEl({ x: 486, y: 168, w: 9, h: 118, color: '#8A5A33', radius: 4 });
        s += '<div style="position:absolute;left:488px;top:112px;width:56px;height:30px;transform-origin:0 6px;transform:' + flagRot + ';">' +
          M.paperEl({ x: 28, y: 15, w: 56, h: 30, color: '#E4572E', radius: 4 }) + '</div>';
        return s;
      },
    },
    {
      name: 'squash + ripple', desc: 'Drop, land, squash-and-settle, and a ripple to mark the moment.',
      code: 'M.squash(framesSinceLanding) · M.ripple(frame, { at })', cycle: 105,
      draw(f) {
        const fall = M.ease(f, { at: 6, dur: 36, fn: 'cubicIn' });
        const y = 52 + (196 - 52) * fall;
        let s = '<div style="position:absolute;left:180px;right:180px;top:192px;height:7px;border-radius:4px;background:#E5DCC8;"></div>';
        if (fall >= 1) {
          const sq = M.squash(f - 42);
          s += M.ripple(f, { x: CX, y: 200, at: 42, color: C.green });
          s += '<div style="position:absolute;left:' + (CX - 36 * sq.sx) + 'px;top:' + (200 - 72 * sq.sy) +
            'px;width:' + (72 * sq.sx) + 'px;height:' + (72 * sq.sy) + 'px;border-radius:50%;' +
            'background:radial-gradient(circle at 32% 28%,#ffffffcc 0%,#ffffff22 32%,transparent 55%),' + C.green + ';"></div>';
        } else {
          s += M.dot({ x: CX, y, r: 36, color: C.green, candy: true });
        }
        return s;
      },
    },
    {
      name: 'burst + badge', desc: 'Confetti burst plus a pill badge that pops in — the “correct answer” combo.',
      code: 'M.burst(frame, { at: 12, n: 16 }) · M.badge(frame, { … })', cycle: 115,
      draw(f) {
        let s = M.burst(f, { x: CX, y: CY, at: 12, n: 16, dist: 165 });
        const v = M.pop(f, { at: 6, stiffness: 120, damping: 10 });
        s += M.dot({ x: CX, y: CY, r: 40, color: C.yellow, scale: Math.max(v, 0.001), candy: true });
        s += M.badge(f, { right: 118, top: 26, text: 'Nice!', color: C.green, at: 30, size: 24 });
        return s;
      },
    },
    {
      name: 'wiggle', desc: 'A decaying rotational shake — “look at this one”, or the wrong-answer wobble.',
      code: "transform: M.wiggle(frame, { at: 12, amp: 10 })", cycle: 110,
      draw(f) {
        const t = M.wiggle(f, { at: 12, dur: 30, amp: 10 });
        return '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) ' + t + ';">' +
          '<span style="display:inline-block;background:' + C.orange + ';color:#fff;font:800 26px sans-serif;' +
          'padding:18px 34px;border-radius:999px;box-shadow:0 10px 26px #FF8A4C55;">Look here</span></div>';
      },
    },
    {
      name: 'typewriter', desc: 'Text that types itself, character by character, with a blinking caret.',
      code: "M.typewriter(frame, { text, cpf: 3, caret: true })", cycle: 150,
      draw(f) {
        const s = M.typewriter(f, { at: 8, cpf: 3, text: 'Hello, primitives.', caret: true });
        return '<div style="position:absolute;left:56px;top:104px;font:700 34px ui-monospace,Menlo,monospace;color:' +
          INK + ';">' + s + '</div>';
      },
    },
    {
      name: 'scramble', desc: 'Text that decodes out of a glyph pool — the launch-video title move.',
      code: "M.scramble(frame, { text: 'MOTION', cpf: 3 })", cycle: 130,
      dark: true,
      draw(f) {
        const s = M.scramble(f, { at: 10, cpf: 3, text: 'MOTION' });
        return '<div style="position:absolute;inset:0;background:' + M.meshBg(f, {}) + ';">' +
          '<div style="position:absolute;left:0;top:96px;width:' + W + 'px;text-align:center;' +
          'font:800 54px ui-monospace,Menlo,monospace;color:#F5EFE2;letter-spacing:4px;">' + s + '</div></div>';
      },
    },
    {
      name: 'camera', desc: 'A virtual camera: keyframed focus and zoom over a still world.',
      code: 'M.camera(frame, [{f, x, y, z}, …], stage)', cycle: 180,
      draw(f) {
        const keys = [
          { f: 0, x: 280, y: 130, z: 1 }, { f: 60, x: 280, y: 130, z: 1 },
          { f: 105, x: 400, y: 120, z: 1.9 }, { f: 140, x: 400, y: 120, z: 1.9 },
          { f: 175, x: 280, y: 130, z: 1 },
        ];
        let inner = '';
        const pts = [[120, 70], [280, 170], [430, 80]];
        const pl = M.poly(pts);
        inner += '<svg style="position:absolute;left:0;top:0;" width="' + W + '" height="' + H + '">' +
          '<polyline points="' + pl.attr + '" fill="none" stroke="#B83A8C" stroke-width="5" stroke-linejoin="round"/></svg>';
        pts.forEach((p, i) => { inner += M.dot({ x: p[0], y: p[1], r: 15, color: ['#FF8A4C', '#3ED97E', '#4CC9F0'][i], candy: true }); });
        inner += '<div style="position:absolute;left:330px;top:150px;font:800 25px sans-serif;color:' + INK + ';">zoom target</div>';
        return '<div style="position:absolute;left:0;top:0;width:' + W + 'px;height:' + H +
          'px;transform-origin:0 0;transform:' + M.camera(f, keys, { w: W, h: H }) + ';">' + inner + '</div>';
      },
    },
    {
      name: 'drawOn + bars', desc: 'A line that draws itself and bars that grow — data, drawn by code.',
      code: 'M.drawOn(frame, { len }) · M.bars(frame, { data, … })', cycle: 170,
      draw(f) {
        let s = M.bars(f, {
          at: 8, data: [{ k: 'A', v: 35 }, { k: 'B', v: 70 }, { k: 'C', v: 52 }],
          x: 58, y: 218, h: 130, bw: 44, gap: 30, stagger: 5, dur: 18, color: '#4CC9F0', label: INK,
        });
        const pts = [[330, 200], [400, 130], [462, 158], [522, 74]];
        const pl = M.poly(pts);
        s += '<svg style="position:absolute;left:0;top:0;" width="' + W + '" height="' + H + '">' +
          '<polyline points="' + pl.attr + '" fill="none" stroke="#FF8A4C" stroke-width="5" ' +
          'stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="' +
          M.drawOn(f, { at: 16, dur: 55, len: pl.len }) + '"/></svg>';
        return s;
      },
    },
    {
      name: 'beat + drop', desc: 'Anticipation entrance, then a gravity drop that lands with squash and shake.',
      code: 'M.beat(frame, { at }) · M.drop(...) + M.squash(...)', cycle: 170,
      draw(f) {
        let s = '';
        const b = M.beat(f, { at: 10, dist: 130 });
        s += M.dot({ x: 130 + b.x, y: 130, r: 30, color: C.orange, scale: Math.max(b.s, 0.001), candy: true });
        const sh = M.shake(f, { at: 96, amp: 7, dur: 12, seed: 2 });
        const dy = M.drop(f, { at: 84, from: 150, dur: 11 });
        const sq = M.squash(f - 95);
        s += '<div style="position:absolute;inset:0;transform:translate(' + sh.x.toFixed(1) + 'px,' + sh.y.toFixed(1) + 'px);">' +
          M.dot({ x: 400, y: 168 + dy, r: 30, color: C.yellow, sx: sq.sx, sy: sq.sy, candy: true }) + '</div>';
        s += M.ripple(f, { x: 400, y: 178, at: 95, color: C.yellow });
        s += '<div style="position:absolute;left:290px;top:196px;width:220px;height:4px;border-radius:2px;background:#33302B22;"></div>';
        return s;
      },
    },
  ];

  const grid = document.getElementById('demo-grid');
  if (grid) {
    demos.forEach((d, i) => {
      const el = document.createElement('div');
      el.className = 'demo';
      el.innerHTML = '<div class="demo-stage" id="demo-' + i + '"></div>' +
        '<div class="demo-meta"><h3>' + d.name + '</h3><p>' + d.desc + '</p><code>' + d.code + '</code></div>';
      grid.appendChild(el);
      addRunner(makeStage(el.querySelector('.demo-stage'), W, H), d.cycle, d.draw);
    });
  }

  // ---------- playground ----------
  const playStage = document.getElementById('play-stage');
  const playCode = document.getElementById('play-code');
  const playControls = document.getElementById('play-controls');
  const PW = 640, PH = 340, PCX = PW / 2, PCY = PH / 2;

  const playDefs = {
    pop: {
      label: 'pop — spring entrance', cycle: 100,
      params: [
        { k: 'stiffness', label: 'stiffness', min: 40, max: 260, step: 5, val: 120 },
        { k: 'damping', label: 'damping', min: 4, max: 26, step: 1, val: 11 },
        { k: 'size', label: 'radius', min: 30, max: 100, step: 2, val: 64 },
      ],
      draw(f, p) {
        const s = M.pop(f, { at: 10, stiffness: p.stiffness, damping: p.damping });
        return M.dot({ x: PCX, y: PCY, r: p.size, color: C.orange, scale: Math.max(s, 0.001), candy: true });
      },
      code(p) { return 'M.pop(frame, { at: 10, stiffness: ' + p.stiffness + ', damping: ' + p.damping + ' })'; },
    },
    fly: {
      label: 'fly — arc flight with trail', cycle: 120,
      params: [
        { k: 'arc', label: 'arc height', min: 0, max: 220, step: 5, val: 150 },
        { k: 'dur', label: 'duration (frames)', min: 30, max: 110, step: 2, val: 76 },
        { k: 'ghosts', label: 'trail ghosts', min: 0, max: 9, step: 1, val: 5 },
      ],
      draw(f, p) {
        const o = { at: 8, dur: p.dur, from: { x: 80, y: 270 }, to: { x: 560, y: 270 }, arc: p.arc, ghosts: p.ghosts };
        let s = '';
        for (const t of M.trail(f, o)) s += M.dot({ x: t.x, y: t.y, r: 30, color: C.blue, scale: t.scale, opacity: t.opacity });
        const q = M.fly(f, o);
        return s + M.dot({ x: q.x, y: q.y, r: 33, color: C.blue, candy: true, glow: true });
      },
      code(p) { return 'M.fly(frame, { at: 8, dur: ' + p.dur + ', from, to, arc: ' + p.arc + ' })\nM.trail(frame, { …, ghosts: ' + p.ghosts + ' })'; },
    },
    burst: {
      label: 'burst — particle burst', cycle: 110,
      params: [
        { k: 'n', label: 'particles', min: 4, max: 28, step: 1, val: 14 },
        { k: 'dist', label: 'distance', min: 60, max: 260, step: 5, val: 170 },
      ],
      draw(f, p) {
        let s = M.burst(f, { x: PCX, y: PCY, at: 14, n: p.n, dist: p.dist });
        const v = M.pop(f, { at: 6, stiffness: 120, damping: 10 });
        return s + M.dot({ x: PCX, y: PCY, r: 38, color: C.yellow, scale: Math.max(v, 0.001), candy: true });
      },
      code(p) { return 'M.burst(frame, { at: 14, n: ' + p.n + ', dist: ' + p.dist + ' })'; },
    },
    countUp: {
      label: 'countUp — number counter', cycle: 115,
      params: [
        { k: 'to', label: 'count to', min: 10, max: 999, step: 1, val: 100 },
        { k: 'dur', label: 'duration (frames)', min: 20, max: 100, step: 2, val: 70 },
      ],
      draw(f, p) {
        const n = M.countUp(f, { at: 6, dur: p.dur, from: 0, to: p.to });
        return '<div style="position:absolute;left:0;right:0;top:96px;text-align:center;">' +
          '<span style="font:800 130px sans-serif;color:' + C.purple + ';">' + n + '</span></div>';
      },
      code(p) { return 'M.countUp(frame, { at: 6, dur: ' + p.dur + ', from: 0, to: ' + p.to + ' })'; },
    },
  };

  let playKey = 'pop';
  const playState = {};
  Object.keys(playDefs).forEach((k) => {
    playState[k] = {};
    playDefs[k].params.forEach((pr) => { playState[k][pr.k] = pr.val; });
  });
  const playInner = playStage ? makeStage(playStage, PW, PH) : null;
  let playRunner = null;

  function renderControls() {
    const def = playDefs[playKey];
    let h = '<h3>Primitive</h3><div class="ctl"><select id="play-select">' +
      Object.keys(playDefs).map((k) => '<option value="' + k + '"' + (k === playKey ? ' selected' : '') + '>' + playDefs[k].label + '</option>').join('') +
      '</select></div>';
    def.params.forEach((pr) => {
      h += '<div class="ctl"><label>' + pr.label + '<output id="out-' + pr.k + '">' + playState[playKey][pr.k] + '</output></label>' +
        '<input type="range" id="rng-' + pr.k + '" min="' + pr.min + '" max="' + pr.max + '" step="' + pr.step + '" value="' + playState[playKey][pr.k] + '"></div>';
    });
    playControls.innerHTML = h;
    document.getElementById('play-select').addEventListener('change', (e) => {
      playKey = e.target.value;
      renderControls();
      mountPlayground();
    });
    def.params.forEach((pr) => {
      document.getElementById('rng-' + pr.k).addEventListener('input', (e) => {
        playState[playKey][pr.k] = Number(e.target.value);
        document.getElementById('out-' + pr.k).textContent = e.target.value;
        updatePlayCode();
      });
    });
  }
  function updatePlayCode() {
    if (playCode) playCode.textContent = playDefs[playKey].code(playState[playKey]);
  }
  function mountPlayground() {
    if (playRunner) {
      const i = runners.indexOf(playRunner);
      if (i >= 0) runners.splice(i, 1);
    }
    const def = playDefs[playKey];
    playRunner = { stage: playInner, cycle: def.cycle, draw: (f) => def.draw(f, playState[playKey]) };
    runners.push(playRunner);
    apply(playRunner, reduced ? Math.floor(def.cycle * 0.45) : 0);
    updatePlayCode();
  }
  if (playStage && playControls) {
    renderControls();
    mountPlayground();
  }

  // ---------- one rAF loop for everything (30 virtual fps) ----------
  if (!reduced) {
    const t0 = performance.now();
    (function tick(now) {
      const f = Math.floor((now - t0) / (1000 / 30));
      for (const r of runners) {
        if (visibility.get(r.stage) === false) continue; // off-screen: don't redraw
        apply(r, f);
      }
      requestAnimationFrame(tick);
    })(t0);
  }
})();
