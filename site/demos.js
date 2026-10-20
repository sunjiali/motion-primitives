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
