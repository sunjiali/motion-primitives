// rings-demo — the rings showcase: one focal ball, three scenes, one
// idea per scene (the house chapter formula). The same concentric
// geometry in three tempers: an expanding pulse train on cream, a
// slow breathing set on blue, counter-rotating dashed arcs on ink.
// Thin lines, one muted colour per scene, alpha doing the depth
// work — the shell stays plain (motionin.design's quiet framing,
// via the 2026-10-23 teardown). Silent, 16:9, hard cuts.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 180 },
  render(frame, stage) {
    const M = window.Motion;
    const CREAM = '#FBF6EC', BLUE = '#2F6DB3', INK = '#26221F', YELLOW = '#FFD93D';
    const CX = 640, CY = 384, BR = 54; // ball centre + radius; rings start outside it

    const ball = (fill, ink) => {
      const blink = (frame % 90) >= 86; // eyes shut for 4 frames in every 90
      const eyeH = blink ? 2 : 10;
      const eye = (dx) => '<div style="position:absolute;left:' + (CX + dx - 5) + 'px;top:' +
        (CY - 12 - eyeH / 2) + 'px;width:10px;height:' + eyeH + 'px;border-radius:5px;background:' + ink + ';"></div>';
      return '<div style="position:absolute;left:' + (CX - BR) + 'px;top:' + (CY - BR) +
        'px;width:' + (BR * 2) + 'px;height:' + (BR * 2) + 'px;border-radius:50%;background:' + fill + ';"></div>' +
        eye(-20) + eye(20) +
        '<div style="position:absolute;left:' + (CX - 14) + 'px;top:' + (CY + 2) +
        'px;width:28px;height:16px;border-bottom:4px solid ' + ink + ';border-radius:0 0 20px 20px;"></div>';
    };
    const title = (en, zh, color, sub) =>
      '<div style="position:absolute;left:0;right:0;top:52px;text-align:center;">' +
      '<div style="font:800 64px system-ui;color:' + color + ';letter-spacing:-1px;">' + en + '</div>' +
      '<div style="font:600 24px system-ui;color:' + sub + ';margin-top:6px;">' + zh + '</div></div>';
    const pill = (code) =>
      '<div style="position:absolute;left:0;right:0;bottom:44px;text-align:center;">' +
      '<span style="display:inline-block;background:#16171A;color:#F5F1E8;font:500 22px ui-monospace,Menlo,monospace;' +
      'padding:12px 26px;border-radius:999px;">' + code + '</span></div>';

    let scene;
    if (frame < 60) {
      scene = '<div style="position:absolute;inset:0;background:' + CREAM + ';"></div>' +
        M.rings(frame, { x: CX, y: CY, count: 4, r0: 76, gap: 38, color: BLUE, opacity: 0.55, dur: 84 }) +
        ball(BLUE, CREAM) +
        title('Pulse.', '脉冲 · 一圈圈往外推', INK, '#8A8272') +
        pill('M.rings(frame, { mode: \'pulse\', dur: 84 })');
    } else if (frame < 120) {
      scene = '<div style="position:absolute;inset:0;background:' + BLUE + ';"></div>' +
        M.rings(frame, { x: CX, y: CY, count: 4, r0: 76, gap: 38, color: CREAM, opacity: 0.6, mode: 'breathe' }) +
        ball(CREAM, INK) +
        title('Breathe.', '呼吸 · 原地慢慢胀缩', CREAM, '#B9CFE8') +
        pill('M.rings(frame, { mode: \'breathe\' })');
    } else {
      scene = '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
        M.rings(frame, { x: CX, y: CY, count: 4, r0: 76, gap: 38, color: YELLOW, opacity: 0.75, mode: 'spin' }) +
        ball(YELLOW, INK) +
        title('Spin.', '旋转 · 断弧反向转', CREAM, '#8A8272') +
        pill('M.rings(frame, { mode: \'spin\', dash: 0.7 })');
    }
    stage.innerHTML = scene;
  },
};
