// slice-wave — the sliceWave showcase: a whole scene (bands + wordmark)
// is cut into horizontal strips, and one travelling wave packet passes
// through it — strips near the front slide sideways on a sine field,
// strips far from the front sit still, and once the wave has passed the
// scene is exactly as it was. Silent, 16:9, one wave, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', YELLOW = '#FFD93D', TEAL = '#57C7D4', CORAL = '#FF6B81';
    const TUNE = { at: 30, dur: 80, slices: 16, amp: 42, waves: 2, width: 0.28 };

    const scene = '' +
      '<div style="position:absolute;inset:0;background:' + CREAM + ';"></div>' +
      '<div style="position:absolute;left:0;right:0;top:150px;height:54px;background:' + YELLOW + ';"></div>' +
      '<div style="position:absolute;left:0;right:0;top:246px;height:54px;background:' + TEAL + ';"></div>' +
      '<div style="position:absolute;left:0;right:0;top:420px;height:54px;background:' + CORAL + ';"></div>' +
      '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
      '<div style="font:800 110px system-ui;color:' + INK + ';letter-spacing:-2px;">SLICE WAVE</div>' +
      '<div style="font:500 26px ui-monospace,Menlo,monospace;color:' + INK + ';opacity:.65;margin-top:20px;">one wave passes through — the scene comes back whole</div>' +
      '</div>';

    stage.innerHTML =
      M.sliceWave(frame, {
        html: scene,
        at: TUNE.at, dur: TUNE.dur, slices: TUNE.slices,
        amp: TUNE.amp, waves: TUNE.waves, width: TUNE.width,
      }) +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + INK + ';opacity:.55;">M.sliceWave(frame, { at: 30, dur: 80, slices: 16 })</div>';
  },
};
