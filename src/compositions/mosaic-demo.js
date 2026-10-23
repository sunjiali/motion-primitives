// mosaic-demo — the mosaic transition showcase: two flat scenes joined by
// a pixel-grid flip. Every tile shows scene A, then at its hash-staggered
// moment swaps to the same window of scene B, swelling briefly around the
// flip so the cut reads as a tile "turn" — the orderly counterpart to
// glitch. Silent, 16:9, hard cuts.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', BLUE = '#2F6DB3', TEAL = '#57C7D4';
    const TUNE = { flipAt: 50, flipDur: 55, cols: 16, rows: 9, gap: 3, seed: 7 };

    const sceneA = '' +
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
      '<div style="' + M.fadeUp(frame, { at: 10, dur: 18, dist: 26 }) +
      'font:800 96px system-ui;color:' + CREAM + ';letter-spacing:-2px;">MOSAIC</div>' +
      '<div style="' + M.fadeUp(frame, { at: 22, dur: 18, dist: 20 }) +
      'font:500 26px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.7;margin-top:18px;">M.mosaic(frame, { htmlA, htmlB, at, dur, cols, rows })</div>' +
      '</div>';

    const sceneB = '' +
      '<div style="position:absolute;inset:0;background:linear-gradient(120deg,' + BLUE + ',' + TEAL + ');"></div>' +
      '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
      '<div style="font:800 96px system-ui;color:' + CREAM + ';letter-spacing:-2px;">SCENE TWO</div>' +
      '<div style="font:500 26px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.8;margin-top:18px;">every tile turned, the whole scene crossed over</div>' +
      '</div>';

    stage.innerHTML = sceneB +
      M.mosaic(frame, {
        htmlA: sceneA, htmlB: sceneB,
        at: TUNE.flipAt, dur: TUNE.flipDur,
        cols: TUNE.cols, rows: TUNE.rows, gap: TUNE.gap, seed: TUNE.seed,
        w: 1280, h: 720,
      });
  },
};
