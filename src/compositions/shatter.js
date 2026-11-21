// shatter — the wrapped content breaks into tiles that fling outward
// from a force centre with rotation under gravity and fade: the hero
// word bursts apart on square tiles, the sub-line on brickwork, and
// the rest of the stage on triangles — one primitive, three patterns.
// Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    const word = '<div style="position:absolute;left:640px;top:330px;transform:translate(-50%,-50%);font:800 120px system-ui;color:' + CORAL + ';white-space:nowrap;">SHATTER</div>';
    const sub = '<div style="position:absolute;left:640px;top:500px;transform:translate(-50%,-50%);font:500 36px system-ui;color:' + CREAM + ';white-space:nowrap;">tiles fly, gravity wins</div>';
    const title = '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">SHATTER</div>';
    const code = '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.shatter(frame, { strength: 300 })</div>';
    const dot = '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CREAM + ';"></div>';
    // The whole-stage close shatters only what is still on screen —
    // the hero and sub-line are already gone by 110, so they are not
    // in `rest` (shattering `all` would resurrect them as tiles).
    const rest = title + code + dot;
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      M.shatter(frame, { html: word, at: 10, dur: 40, strength: 300, gravity: 300, fx: 640, fy: 330 }) +
      M.shatter(frame, { html: sub, at: 60, dur: 40, pattern: 'bricks', strength: 260, gravity: 260, fx: 640, fy: 500 }) +
      M.shatter(frame, { html: rest, at: 110, dur: 40, pattern: 'triangle', strength: 380, gravity: 320 });
  },
};
