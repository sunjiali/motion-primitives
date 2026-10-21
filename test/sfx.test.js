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

test('unknown sounds are rejected loudly', () => {
  assert.throws(
    () => renderScore({ fps: 30, durationFrames: 30, events: [{ f: 0, s: 'nope' }] }),
    /unknown sound: nope/);
});
