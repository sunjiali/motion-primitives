// shine — the light-band sweep: a big word takes a horizontal shine
// sweep, then a diagonal one, while a second line wears its own
// top-to-bottom sweep. Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    const word = '<div style="position:absolute;left:640px;top:330px;transform:translate(-50%,-50%);font:800 120px system-ui;color:' + CORAL + ';white-space:nowrap;">SHINE</div>';
    const sub = '<div style="position:absolute;left:640px;top:500px;transform:translate(-50%,-50%);font:500 36px system-ui;color:' + CREAM + ';white-space:nowrap;">one band of light, two directions</div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">SHINE</div>' +
      M.shine(frame, { html: M.shine(frame, { html: word, at: 20, dur: 30, amount: 0.9 }), at: 90, dur: 30, amount: 0.9, angle: 45 }) +
      M.shine(frame, { html: sub, at: 60, dur: 30, amount: 0.7, angle: 90 }) +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.shine(frame, { angle: 0, width: 0.3 })</div>' +
      '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CREAM + ';"></div>';
  },
};
