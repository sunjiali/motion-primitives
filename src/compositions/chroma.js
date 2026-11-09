// chroma — the chromatic-aberration grade: a big word takes a
// horizontal RGB-fringe spike, then a vertical one, while a second
// line wears the sustain grade for the whole film. Silent, 16:9,
// no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    const word = '<div style="position:absolute;left:640px;top:330px;transform:translate(-50%,-50%);font:800 120px system-ui;color:' + INK + ';white-space:nowrap;">PRISM</div>';
    const sub = '<div style="position:absolute;left:640px;top:500px;transform:translate(-50%,-50%);font:500 36px system-ui;color:' + INK + ';white-space:nowrap;">sustain grade, always on</div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + CREAM + ';"></div>' +
      '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + INK + ';">CHROMA</div>' +
      M.chroma(frame, { html: M.chroma(frame, { html: word, at: 20, dur: 30, amount: 12 }), at: 90, dur: 30, amount: 12, angle: 90 }) +
      M.chroma(frame, { html: sub, at: 0, dur: 150, amount: 4, mode: 'sustain' }) +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + INK + ';opacity:.55;">M.chroma(frame, { amount: 12, mode: \'pulse\' })</div>' +
      '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CORAL + ';"></div>';
  },
};
