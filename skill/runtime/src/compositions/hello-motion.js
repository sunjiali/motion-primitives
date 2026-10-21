// hello-motion — the motion skill's example composition.
// Exercises: particleField (ambient stars), drawText (handwriting
// title), morphShape (circle -> heart), beatGrid (pulse on a beat),
// typewriter (caption text — it returns a plain string, so the
// composition wraps it in a positioned div).
// 90 frames @ 30 fps = 3 seconds. Sound score: hello-motion.sfx.json.
window.Composition = {
  meta: { width: 1280, height: 720, fps: 30, durationInFrames: 90 },
  render(frame, stage) {
    const M = window.Motion;
    const beat = M.beatGrid(frame, { bpm: 120 }); // one beat every 15 frames
    let s = '<div style="position:absolute;inset:0;background:linear-gradient(170deg,#171233,#0B0916);">';
    s += M.particleField(frame, { n: 60, mode: 'float', color: '#FFE9A8', opacity: 0.8, seed: 3 });
    s += M.drawText(frame, { text: 'Made with motion', at: 6, dur: 42, size: 104, x: 640, y: 300, color: '#F2EFE9' });
    // A circle becomes a heart, then keeps pulsing on the beat.
    s += M.morphShape(frame, { from: 'circle', to: 'heart', at: 34, dur: 30, size: 64 + 10 * beat.pulse, x: 640, y: 500, color: '#E86A92' });
    const typed = M.typewriter(frame, { text: 'install the skill - write a composition - render', at: 44, cpf: 0.8 });
    s += '<div style="position:absolute;left:0;right:0;top:624px;text-align:center;font:600 29px ui-monospace,Menlo,monospace;color:#9FB4D8;">' + typed + '</div>';
    s += '</div>';
    stage.innerHTML = s;
  },
};
