// gooey — liquid blobs that melt into one mass: the hero cluster
// merges from a spread ring into one breathing mass, a lower-left
// cluster orbits forever (merging and splitting as the blobs pass),
// and a small cluster top-right splits apart at the end — one
// primitive, three modes. Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81', TEAL = '#3FB6FF';
    const title = '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">GOOEY</div>';
    const code = '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.gooey(frame, { mode: \'merge\', blobs: 5 })</div>';
    stage.innerHTML =
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      title +
      M.gooey(frame, { mode: 'merge', at: 10, dur: 45, blobs: 5, r: 48, spread: 130, cx: 640, cy: 390, color: CORAL }) +
      M.gooey(frame, { mode: 'orbit', blobs: 4, r: 20, spread: 55, cx: 300, cy: 570, colors: [TEAL, CREAM, TEAL, CREAM], speed: 0.03 }) +
      M.gooey(frame, { mode: 'split', at: 110, dur: 40, blobs: 3, r: 30, spread: 90, cx: 1050, cy: 170, color: CORAL, seed: 7 }) +
      code;
  },
};
