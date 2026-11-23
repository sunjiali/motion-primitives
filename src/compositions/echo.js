// echo — AE Echo-style ghost stack: the hero word stretches its echo
// train out to the right, the sub-line trails ghosts downward, and the
// title's own echoes collapse back into it at the end — one primitive,
// three modes. Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    const word = '<div style="position:absolute;left:640px;top:330px;transform:translate(-50%,-50%);font:800 120px system-ui;color:' + CORAL + ';white-space:nowrap;">ECHO</div>';
    const sub = '<div style="position:absolute;left:640px;top:500px;transform:translate(-50%,-50%);font:500 36px system-ui;color:' + CREAM + ';white-space:nowrap;">one voice, many ghosts</div>';
    const title = '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">ECHO</div>';
    const code = '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.echo(frame, { echoes: 10 })</div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      M.echo(frame, { html: title, at: 110, dur: 40, mode: 'out', echoes: 6, step: 10, angle: 0, decay: 0.8 }) +
      M.echo(frame, { html: word, at: 10, dur: 45, echoes: 10, step: 16, angle: 0, decay: 0.82 }) +
      M.echo(frame, { html: sub, at: 60, dur: 40, echoes: 8, step: 10, angle: 90, decay: 0.78 }) +
      code;
  },
};
