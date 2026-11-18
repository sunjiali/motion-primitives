// var-font — the variable-font kinetic type showcase: no keyframes, no
// transforms — the hero word breathes weight and width on one travelling
// sine, while the sub-line rides a gentler wave on the same field.
// The variable font is vendored at site/fonts/RobotoFlex-var.woff2
// (OFL, wght 100–1000 / wdth 25–151) and @font-face'd here, because the
// render player is a standalone file:// page and does not load
// site/styles.css. Silent, 16:9, no loop tricks.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 150 },
  render(frame, stage) {
    const M = window.Motion;
    const INK = '#26221F', CREAM = '#FBF6EC', CORAL = '#FF6B81';
    stage.innerHTML =
      '<style>@font-face{font-family:\'Roboto Flex\';src:url(\'site/fonts/RobotoFlex-var.woff2\') format(\'woff2-variations\');font-weight:100 1000;font-stretch:25% 151%;font-display:swap;}</style>' +
      '<div style="position:absolute;inset:0;background:' + INK + ';"></div>' +
      '<div style="position:absolute;inset:0;display:flex;justify-content:center;padding-top:120px;font:800 64px system-ui;color:' + CREAM + ';">VAR FONT</div>' +
      M.varFont(frame, { text: 'FLEX', x: 640, y: 330, size: 150, wght: [150, 1000], wdth: [60, 145], wl: 4, speed: 0.12, color: CORAL }) +
      M.varFont(frame, { text: 'weight & width ride one wave', x: 640, y: 500, size: 36, wght: [300, 800], wdth: [80, 125], wl: 6, speed: 0.1, color: CREAM }) +
      '<div style="position:absolute;left:40px;bottom:28px;font:500 22px ui-monospace,Menlo,monospace;color:' + CREAM + ';opacity:.55;">M.varFont(frame, { wght: [100, 900] })</div>' +
      '<div style="position:absolute;right:40px;top:28px;width:18px;height:18px;border-radius:50%;background:' + CREAM + ';"></div>';
  },
};
