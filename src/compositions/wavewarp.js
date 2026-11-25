// wavewarp — smooth sinusoidal displacement: the hero word ripples
// into a travelling sine wave, the sub-line shows the horizontal
// mirror, and the title unwraps back to flat at the end — one
// primitive, three modes. Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    const word = '<div style="position:absolute;left:640px;top:330px;transform:translate(-50%,-50%);font:800 120px system-ui;color:' + CORAL + ';white-space:nowrap;">WAVE</div>';
    const sub = '<div style="position:absolute;left:640px;top:500px;transform:translate(-50%,-50%);font:500 36px system-ui;color:' + CREAM + ';white-space:nowrap;">sine in the picture, not slices</div>';
    const title = '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">WAVEWARP</div>';
    const code = '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.waveWarp(frame, { angle: 0, wl: 160, amp: 24 })</div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      M.waveWarp(frame, { html: title, at: 110, dur: 40, mode: 'out', angle: 0, wl: 160, amp: 24 }) +
      M.waveWarp(frame, { html: word, at: 10, dur: 45, angle: 0, wl: 160, amp: 24, speed: 0.12 }) +
      M.waveWarp(frame, { html: sub, at: 60, dur: 40, angle: 90, wl: 160, amp: 24, speed: 0.12 }) +
      code;
  },
};
