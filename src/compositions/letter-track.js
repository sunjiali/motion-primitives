// letter-track — the letterTrack showcase: one word arrives with its
// letters spread wide and settles into its resting spacing, then a
// second line squeezes out from tight spacing to prove the reverse
// direction. Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';

    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + CREAM + ';"></div>' +
      '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
      M.letterTrack(frame, { text: 'TRACKING', at: 20, dur: 60, from: 32, to: 0, size: 110, color: INK }) +
      '<div style="margin-top:26px;">' +
      M.letterTrack(frame, { text: 'letter-spacing, animated', at: 90, dur: 40, from: -4, to: 2, size: 28, weight: 500, color: INK, fontFamily: 'ui-monospace,Menlo,monospace' }) +
      '</div></div>' +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + INK + ';opacity:.55;">M.letterTrack(frame, { at: 20, dur: 60, from: 32, to: 0 })</div>' +
      '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CORAL + ';"></div>';
  },
};
