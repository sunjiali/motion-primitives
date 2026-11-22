// flicker — neon-sign flicker-on: the hero word stutters on with a
// decaying off-probability and settles burning pink, the sub-line is
// a broken neon that never settles, and the corner dot blinks on a
// square wave — one primitive, three modes. Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    const word = '<div style="position:absolute;left:640px;top:330px;transform:translate(-50%,-50%);font:800 120px system-ui;color:' + CORAL + ';white-space:nowrap;">NEON</div>';
    const sub = '<div style="position:absolute;left:640px;top:500px;transform:translate(-50%,-50%);font:500 36px system-ui;color:' + CREAM + ';white-space:nowrap;">broken, then burning</div>';
    const title = '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">FLICKER</div>';
    const code = '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.flicker(frame, { mode: \'on\' })</div>';
    const dot = '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CREAM + ';"></div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      title + code +
      M.flicker(frame, { html: word, at: 10, dur: 45, glow: '#FF2E88' }) +
      M.flicker(frame, { html: sub, at: 60, mode: 'sustain', glow: '#FFD166' }) +
      M.flicker(frame, { html: dot, mode: 'blink', rate: 12, glow: '#FBF6EC' });
  },
};
