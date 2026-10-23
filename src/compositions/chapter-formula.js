// chapter-formula — the house explainer skeleton, codified as a
// composition (backlog: 2026-10-22 Swiss-style sweep, "Chapter
// formula — worth codifying"). The film IS the formula, labelled as
// it runs:
//   hook     0–2s    one claim, one hero, nothing else
//   chapters 1.5s each — exactly one hero + one action + one label
//   recap    all chapters side by side, one glance
//   outro    card with a source line
// House style throughout: cream shell, one round-faced ball as the
// recurring hero, hard cuts, silent. 285 frames = 9.5s at 30fps.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 285 },
  render(frame, stage) {
    const M = window.Motion;
    const CREAM = '#FBF6EC', INK = '#26221F', BLUE = '#2F6DB3', YELLOW = '#FFD93D', SUB = '#8A8272';

    const ball = (cx, cy, r, fill, ink, scale) => {
      const blink = (frame % 90) >= 86; // eyes shut 4 frames in every 90
      const eyeH = blink ? 2 : 10 * scale;
      const eye = (dx) => '<div style="position:absolute;left:' + (cx + dx * scale - 5 * scale) + 'px;top:' +
        (cy - 12 * scale - eyeH / 2) + 'px;width:' + (10 * scale) + 'px;height:' + eyeH +
        'px;border-radius:' + (5 * scale) + 'px;background:' + ink + ';"></div>';
      return '<div style="position:absolute;left:' + (cx - r) + 'px;top:' + (cy - r) +
        'px;width:' + (r * 2) + 'px;height:' + (r * 2) + 'px;border-radius:50%;background:' + fill +
        ';transform:scale(' + scale + ');transform-origin:center;"></div>' +
        eye(-20) + eye(20) +
        '<div style="position:absolute;left:' + (cx - 14 * scale) + 'px;top:' + (cy + 2 * scale) +
        'px;width:' + (28 * scale) + 'px;height:' + (16 * scale) + 'px;border-bottom:' + (4 * scale) +
        'px solid ' + ink + ';border-radius:0 0 20px 20px;"></div>';
    };
    const head = (en, zh, color, sub) =>
      '<div style="position:absolute;left:0;right:0;top:52px;text-align:center;">' +
      '<div style="font:800 64px system-ui;color:' + color + ';letter-spacing:-1px;">' + en + '</div>' +
      '<div style="font:600 24px system-ui;color:' + sub + ';margin-top:6px;">' + zh + '</div></div>';
    const chapterTag = (en, zh) =>
      '<div style="position:absolute;left:64px;top:52px;">' +
      '<div style="font:800 44px system-ui;color:' + INK + ';letter-spacing:-0.5px;">' + en + '</div>' +
      '<div style="font:600 22px system-ui;color:' + SUB + ';margin-top:4px;">' + zh + '</div></div>';
    const pill = (code) =>
      '<div style="position:absolute;left:0;right:0;bottom:44px;text-align:center;">' +
      '<span style="display:inline-block;background:#16171A;color:#F5F1E8;font:500 22px ui-monospace,Menlo,monospace;' +
      'padding:12px 26px;border-radius:999px;">' + code + '</span></div>';
    const cream = '<div style="position:absolute;inset:0;background:' + CREAM + ';"></div>';

    let scene;
    if (frame < 60) {
      // HOOK (0–2s): one claim, one hero.
      const s = M.pop(frame, { at: 8, dur: 16 });
      scene = cream +
        ball(640, 400, 54, BLUE, CREAM, s) +
        M.ripple(frame, { at: 14, x: 640, y: 400, color: BLUE, maxR: 150 }) +
        head('One idea per chapter.', '钩子 · 前 2 秒只说一件事', INK, SUB) +
        pill('hook 0–2s → chapters 1.5s → recap → outro');
    } else if (frame < 105) {
      // CHAPTER 1 (1.5s): one hero — the ball; one action — an arc flight.
      const lf = frame - 60;
      const pos = M.fly(lf, { at: 4, dur: 36, from: { x: 330, y: 430 }, to: { x: 950, y: 430 }, arc: 170 });
      const ghosts = M.trail(lf, { at: 4, dur: 36, from: { x: 330, y: 430 }, to: { x: 950, y: 430 }, arc: 170, n: 3 })
        .map((g) => M.dot({ x: g.x, y: g.y, r: 40, color: YELLOW, opacity: 0.45 })).join('');
      scene = cream + ghosts +
        ball(pos.x, pos.y, 54, YELLOW, INK, 1) +
        chapterTag('01 · One hero', '第一章 · 只有一个主角') +
        pill('hero: the ball · action: one arc flight');
    } else if (frame < 150) {
      // CHAPTER 2 (1.5s): one action — bars rise once, then hold.
      const lf = frame - 105;
      scene = cream +
        M.bars(lf, {
          x: 390, y: 520, h: 250, bw: 92, gap: 42, at: 4, dur: 24, stagger: 5,
          color: BLUE, label: INK,
          data: [{ v: 35, k: 'Mon' }, { v: 62, k: 'Tue' }, { v: 48, k: 'Wed' }, { v: 90, k: 'Thu' }],
        }) +
        chapterTag('02 · One action', '第二章 · 只做一个动作') +
        pill('action: bars rise once, then hold');
    } else if (frame < 195) {
      // CHAPTER 3 (1.5s): one label — the number says the one thing.
      const lf = frame - 150;
      const n = M.countUp(lf, { at: 4, dur: 30, to: 90 });
      scene = cream +
        '<div style="position:absolute;left:0;right:0;top:238px;text-align:center;font:800 190px system-ui;color:' + BLUE + ';letter-spacing:-4px;">' + n + '</div>' +
        '<div style="position:absolute;left:0;right:0;top:452px;text-align:center;font:600 26px system-ui;color:' + SUB + ';">days in a row · 连续天数</div>' +
        chapterTag('03 · One label', '第三章 · 只贴一个标签') +
        pill('label: the number is the message');
    } else if (frame < 240) {
      // RECAP (1.5s): the three chapters at a glance.
      const mini = (x, inner, cap) =>
        '<div style="position:absolute;left:' + x + 'px;top:196px;width:352px;height:300px;background:#FFFFFF;border:2px solid #E7DFCE;border-radius:18px;overflow:hidden;">' +
        inner +
        '<div style="position:absolute;left:0;right:0;bottom:14px;text-align:center;font:700 20px system-ui;color:' + INK + ';">' + cap + '</div></div>';
      const barsMini = [35, 62, 48, 90].map((v, i) =>
        '<div style="position:absolute;left:' + (56 + i * 62) + 'px;bottom:64px;width:40px;height:' + (v * 1.7) +
        'px;background:' + BLUE + ';border-radius:6px 6px 0 0;"></div>').join('');
      scene = cream +
        head('Recap.', '回顾 · 三章一眼看完', INK, SUB) +
        mini(72, ball(248 - 72, 330 - 196, 44, YELLOW, INK, 0.82), '01 · hero') +
        mini(464, barsMini, '02 · action') +
        mini(856, '<div style="position:absolute;left:0;right:0;top:56px;text-align:center;font:800 110px system-ui;color:' + BLUE + ';">90</div>', '03 · label');
    } else {
      // OUTRO (1.5s): card + source line.
      scene = '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
        '<div style="position:absolute;left:0;right:0;top:238px;text-align:center;">' +
        '<div style="font:800 72px system-ui;color:' + CREAM + ';letter-spacing:-1px;">Chapter Formula.</div>' +
        '<div style="font:600 24px system-ui;color:#B9B0A0;margin-top:14px;">hook 0–2s · chapters 1–1.5s · recap · outro</div>' +
        '<div style="font:500 20px ui-monospace,Menlo,monospace;color:#8A8272;margin-top:44px;">codified from @guanmo_ai’s Swiss-style chapter study · sweep 2026-10-22</div></div>';
    }
    stage.innerHTML = scene;
  },
};
