'use strict';
/* The SFX engine is code all the way down: same score -> same WAV bytes. */
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { renderScore, SR } = require('../index.js').sfx;

/* Event schema mirrors src/compositions/fx-showcase.sfx.json:
 * { f: visual frame, s: sound name, g: gain, pan } — the engine lands
 * each sound one frame after its visual. */
const SCORE = {
  fps: 30,
  durationFrames: 90,
  tailSec: 0,
  events: [
    { f: 0, s: 'pop', g: 0.5 },
    { f: 30, s: 'ting', g: 0.4 },
    { f: 60, s: 'chord', g: 0.4 },
  ],
};

test('renders a valid WAV of the requested length', () => {
  const buf = renderScore(SCORE);
  assert.equal(buf.toString('ascii', 0, 4), 'RIFF');
  assert.equal(buf.toString('ascii', 8, 12), 'WAVE');
  const seconds = (buf.length - 44) / 4 / SR; // 16-bit stereo
  assert.equal(seconds, 3); // 90 frames @ 30fps, no tail
});

test('rendering is deterministic', () => {
  const ha = crypto.createHash('sha256').update(renderScore(SCORE)).digest('hex');
  const hb = crypto.createHash('sha256').update(renderScore(SCORE)).digest('hex');
  assert.equal(ha, hb);
});

/* Power of a WAV buffer's mono mix at one frequency (Goertzel). */
function powerAt(buf, startSec, durSec, freq) {
  const w = (2 * Math.PI * freq) / SR, coeff = 2 * Math.cos(w);
  let s1 = 0, s2 = 0;
  const start = Math.round(startSec * SR), n = Math.round(durSec * SR);
  for (let i = 0; i < n; i++) {
    const off = 44 + (start + i) * 4;
    const x = (buf.readInt16LE(off) + buf.readInt16LE(off + 2)) / 65536;
    const s0 = x + coeff * s1 - s2;
    s2 = s1; s1 = s0;
  }
  return s1 * s1 + s2 * s2 - coeff * s1 * s2;
}

test('ting: pitch is the fixed 1568 Hz ping regardless of the event frame', () => {
  const render = (f) => renderScore({ fps: 30, durationFrames: 90, tailSec: 0, events: [{ f, s: 'ting', g: 0.5 }] });
  const seg = (buf, f) => {
    const start = 44 + Math.round(((f + 1) / 30) * SR) * 4; // +1 frame house rule
    return buf.subarray(start, start + Math.floor(SR * 0.4) * 4);
  };
  // Regression for the v0.4 bug (`e.f ?? 1568`): a ting cued at frame
  // 198 sounded at 198 Hz. The placed sound must be byte-identical
  // wherever it lands, and its fundamental must sit at 1568 Hz.
  assert.deepEqual(seg(render(50), 50), seg(render(5), 5));
  const buf = render(5);
  assert.ok(powerAt(buf, 6 / 30, 0.25, 1568) > powerAt(buf, 6 / 30, 0.25, 198) * 20,
    'fundamental sits at 1568 Hz, not at the frame number');
});

test('unknown sounds are rejected loudly', () => {
  assert.throws(
    () => renderScore({ fps: 30, durationFrames: 30, events: [{ f: 0, s: 'nope' }] }),
    /unknown sound: nope/);
});
