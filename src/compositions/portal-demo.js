// portal-demo — the portalWipe showcase: two flat scenes joined by a
// travelling white portal (the motionin.design signature move). The
// disc blooms from the left over the navy scene, holds full-white,
// then contracts toward the right, revealing the red scene — the
// portal must contrast with both scenes, or one phase reads as
// nothing. Silent, 16:9, hard cuts.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 180 },
  render(frame, stage) {
    const M = window.Motion;
    const NAVY = '#101828', RED = '#E30613', WHITE = '#F5F4F0', DIM = '#8E99AD';
    // The portal is white — it must contrast with BOTH scenes, or the
    // contraction phase reads as nothing (red disc on a red scene).
    const PORTAL = WHITE;
    const TUNE = { wipeAt: 60, wipeDur: 40, wipeHold: 6, echo: 2 };

    const sceneA = '' +
      '<div style="position:absolute;inset:0;background:' + NAVY + ';"></div>' +
      '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
      '<div style="' + M.fadeUp(frame, { at: 12, dur: 18, dist: 26 }) +
      'font:800 96px system-ui;color:' + WHITE + ';letter-spacing:-2px;">PORTAL WIPE</div>' +
      '<div style="' + M.fadeUp(frame, { at: 24, dur: 18, dist: 20 }) +
      'font:500 26px ui-monospace,Menlo,monospace;color:' + DIM + ';margin-top:18px;">M.portalWipe(frame, { at, dur, x, y, x2, y2, echo })</div>' +
      '</div>';

    const sceneB = '' +
      '<div style="position:absolute;inset:0;background:' + RED + ';"></div>' +
      '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
      '<div style="font:800 96px system-ui;color:' + WHITE + ';letter-spacing:-2px;">SCENE TWO</div>' +
      '<div style="font:500 26px ui-monospace,Menlo,monospace;color:' + WHITE + ';opacity:.75;margin-top:18px;">the portal is the transition</div>' +
      '</div>';

    stage.innerHTML = sceneB +
      M.portalWipe(frame, {
        html: sceneA, // the outgoing scene rides inside the portal: clipped during the bloom, swallowed at full cover
        at: TUNE.wipeAt, dur: TUNE.wipeDur, hold: TUNE.wipeHold,
        x: 220, y: 360, x2: 1060, y2: 360,
        w: 1280, h: 720, color: PORTAL, echo: TUNE.echo,
      });
  },
};
