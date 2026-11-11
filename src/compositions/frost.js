// frost — the frosted-glass reveal: the film opens behind the
// glass and clears, then the hero word sinks back behind it and
// clears a second time — the sink and the re-clear meet at the same
// blur radius, so no frame pops. Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    const word = '<div style="position:absolute;left:640px;top:330px;transform:translate(-50%,-50%);font:800 120px system-ui;color:' + CORAL + ';white-space:nowrap;">FROST</div>';
    const sub = '<div style="position:absolute;left:640px;top:500px;transform:translate(-50%,-50%);font:500 36px system-ui;color:' + CREAM + ';white-space:nowrap;">from frosted glass, into focus</div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">FROST</div>' +
      M.frost(frame, { html: M.frost(frame, { html: M.frost(frame, { html: word, at: 0, dur: 40 }), at: 80, dur: 30, from: 0, to: 16, fn: 'linear' }), at: 110, dur: 30 }) +
      M.frost(frame, { html: sub, at: 0, dur: 30, from: 24, fn: 'linear' }) +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.frost(frame, { from: 16, to: 0 })</div>' +
      '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CREAM + ';"></div>';
  },
};
