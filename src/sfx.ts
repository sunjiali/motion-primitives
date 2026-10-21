#!/usr/bin/env node
/**
 * sfx — deterministic Web-Audio-style SFX synthesizer (no assets).
 *
 * Pure math in, 16-bit PCM WAV out. Every sound is a function of its
 * parameters only; noise comes from a seeded PRNG, so the same score
 * always renders the identical file.
 *
 * Convention (from the "Opus 5.5 Motion Lab" write-up, see EFFECTS.md):
 * lay a frame grid first; each event sound lands ONE FRAME AFTER the
 * visual it belongs to. Scores are written against the video's frames:
 *
 *   { "fps": 30, "durationFrames": 540,
 *     "events": [ { "f": 196, "s": "thump", "g": 0.8, "pan": -0.2 } ] }
 *
 *   node src/sfx.js --score src/compositions/fx-showcase.sfx.json \
 *                   --out out/fx-showcase-sfx.wav
 *
 * Sounds: pop bloop ting whoosh thump inhale glide shimmer swell chord
 */
import fs = require('node:fs');
import path = require('node:path');

const SR = 44100;

interface SfxEvent {
  /** Frame the visual lands on; the sound plays one frame later. */
  f: number;
  /** Sound name (key of SOUNDS). */
  s: string;
  /** Gain multiplier. */
  g?: number;
  /** Stereo pan, -1 (left) to 1 (right). */
  pan?: number;
  /** Duration override in seconds (whoosh / glide / swell). */
  dur?: number;
  /** PRNG seed override for noise-based sounds. */
  seed?: number;
}

interface Score {
  fps?: number;
  durationFrames?: number;
  tailSec?: number;
  events?: SfxEvent[];
}

type SoundFn = (track: Track, t0: number, e: SfxEvent) => void;

/** Deterministic PRNG (mulberry32) — noise must not use Math.random. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

class Track {
  n: number;
  L: Float32Array;
  R: Float32Array;
  constructor(seconds: number) {
    this.n = Math.ceil(seconds * SR);
    this.L = new Float32Array(this.n);
    this.R = new Float32Array(this.n);
  }
  add(t0: number, dur: number, fn: (t: number, p: number) => number, gain = 1, pan = 0): void {
    const start = Math.max(0, Math.round(t0 * SR));
    const len = Math.min(Math.round(dur * SR), this.n - start);
    const gl = gain * Math.min(1, 1 - pan), gr = gain * Math.min(1, 1 + pan);
    for (let i = 0; i < len; i++) {
      const v = fn(i / SR, i / len);
      this.L[start + i] += v * gl;
      this.R[start + i] += v * gr;
    }
  }
}

interface ToneOptions {
  f0?: number;
  f1?: number | null;
  dur?: number;
  gain?: number;
  pan?: number;
  harm?: number;
}

/** Sine tone with exponential pitch sweep and decay envelope. */
function tone(track: Track, t0: number, { f0 = 440, f1 = null, dur = 0.15, gain = 0.5, pan = 0, harm = 0 }: ToneOptions): void {
  const sweep = (t: number) => (f1 == null ? f0 : f0 * Math.pow(f1 / f0, t / dur));
  let phase = 0;
  track.add(t0, dur, (t) => {
    phase += (2 * Math.PI * sweep(t)) / SR;
    const env = Math.exp(-3.2 * (t / dur)) * Math.min(1, t / 0.004);
    return env * (Math.sin(phase) + harm * Math.sin(2 * phase) * 0.5);
  }, gain, pan);
}

interface NoiseOptions {
  dur?: number;
  gain?: number;
  pan?: number;
  c0?: number;
  c1?: number;
  seed?: number;
}

/** Filtered noise burst: white noise through a one-pole lowpass whose
 *  cutoff sweeps c0 -> c1 (Hz). Deterministic via seeded rng. */
function noise(track: Track, t0: number, { dur = 0.3, gain = 0.4, pan = 0, c0 = 500, c1 = 4000, seed = 1 }: NoiseOptions): void {
  const rand = rng(seed);
  let lp = 0;
  track.add(t0, dur, (t, p) => {
    const cutoff = c0 * Math.pow(c1 / c0, p);
    const a = Math.min(1, (2 * Math.PI * cutoff) / SR);
    lp += a * ((rand() * 2 - 1) - lp);
    const env = Math.sin(Math.PI * Math.min(1, p * 1.15));
    return env * lp * 2.4;
  }, gain, pan);
}

const SOUNDS: Record<string, SoundFn> = {
  /** Short pitch-drop blip: UI pops, bar starts, badge landings. */
  pop(tr, t0, e) { tone(tr, t0, { f0: 520, f1: 160, dur: 0.09, gain: 0.55 * (e.g ?? 1), pan: e.pan ?? 0, harm: 0.3 }); },
  /** Droplet: high-to-mid sine drop with a soft harmonic. */
  bloop(tr, t0, e) { tone(tr, t0, { f0: 880, f1: 290, dur: 0.13, gain: 0.45 * (e.g ?? 1), pan: e.pan ?? 0, harm: 0.5 }); },
  /** Metal ting: inharmonic partials, long shimmer decay. The base is
   *  a fixed 1568 Hz (G6) — every pitched sound in this kit uses
   *  absolute frequencies. (Before v0.19.1 this read `e.f ?? 1568`:
   *  the event's frame number posing as a frequency, so a ting cued
   *  at frame 198 sounded at 198 Hz.) */
  ting(tr, t0, e) {
    const g = 0.30 * (e.g ?? 1), base = 1568;
    [[1, 1], [2.76, 0.55], [5.40, 0.28]].forEach(([m, a]) =>
      tone(tr, t0, { f0: base * m, dur: 0.5, gain: g * a, pan: e.pan ?? 0 }));
  },
  /** Air sweep for fast travel / camera moves. */
  whoosh(tr, t0, e) { noise(tr, t0, { dur: e.dur ?? 0.32, gain: 0.5 * (e.g ?? 1), pan: e.pan ?? 0, c0: 350, c1: 4200, seed: e.seed ?? 7 }); },
  /** Landing thud: deep sine drop + a breath of low noise. */
  thump(tr, t0, e) {
    tone(tr, t0, { f0: 130, f1: 38, dur: 0.20, gain: 0.95 * (e.g ?? 1), pan: e.pan ?? 0 });
    noise(tr, t0, { dur: 0.06, gain: 0.25 * (e.g ?? 1), pan: e.pan ?? 0, c0: 900, c1: 300, seed: e.seed ?? 3 });
  },
  /** Squash inhale: quick downward suck just before a landing. */
  inhale(tr, t0, e) { tone(tr, t0, { f0: 320, f1: 85, dur: 0.09, gain: 0.35 * (e.g ?? 1), pan: e.pan ?? 0 }); },
  /** Stretch glide: pitch rises like a rubber band. */
  glide(tr, t0, e) { tone(tr, t0, { f0: 190, f1: 760, dur: e.dur ?? 0.16, gain: 0.30 * (e.g ?? 1), pan: e.pan ?? 0, harm: 0.6 }); },
  /** Three-note pentatonic sparkle (D major), stereo-spread. */
  shimmer(tr, t0, e) {
    const notes = [587.33, 739.99, 880.0];
    notes.forEach((f, i) => tone(tr, t0 + i * 0.055, { f0: f, dur: 0.42, gain: 0.30 * (e.g ?? 1), pan: (i - 1) * 0.45 }));
  },
  /** Rising filtered noise: builds, reveals, scene lifts. */
  swell(tr, t0, e) { noise(tr, t0, { dur: e.dur ?? 0.8, gain: 0.35 * (e.g ?? 1), pan: e.pan ?? 0, c0: 240, c1: 5200, seed: e.seed ?? 11 }); },
  /** Warm closing chord (D major triad + root bloom). */
  chord(tr, t0, e) {
    [146.83, 220.0, 293.66, 369.99].forEach((f, i) =>
      tone(tr, t0 + i * 0.02, { f0: f, dur: 1.4, gain: 0.20 * (e.g ?? 1), pan: (i - 1.5) * 0.22, harm: 0.25 }));
  },
};

function renderScore(score: Score): Buffer {
  const fps = score.fps || 30;
  const totalSec = (score.durationFrames || 0) / fps + (score.tailSec ?? 1.2);
  const track = new Track(totalSec);
  (score.events || []).forEach((e, i) => {
    const fn = SOUNDS[e.s];
    if (!fn) throw new Error('unknown sound: ' + e.s);
    // The house rule: sound lands one frame after its visual.
    const t0 = (e.f + 1) / fps;
    fn(track, t0, { ...e, seed: (e.seed ?? hashStr(e.s + ':' + i)) });
  });
  // Soft clip + normalize to -1.2 dBFS.
  let peak = 0;
  for (let i = 0; i < track.n; i++) {
    track.L[i] = Math.tanh(track.L[i]);
    track.R[i] = Math.tanh(track.R[i]);
    peak = Math.max(peak, Math.abs(track.L[i]), Math.abs(track.R[i]));
  }
  const norm = peak > 0 ? 0.87 / peak : 1;
  const buf = Buffer.alloc(44 + track.n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + track.n * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(track.n * 4, 40);
  for (let i = 0; i < track.n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, track.L[i] * norm)) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, track.R[i] * norm)) * 32767), 44 + i * 4 + 2);
  }
  return buf;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const get = (k: string) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  const scorePath = get('--score'), outPath = get('--out');
  if (!scorePath || !outPath) {
    console.error('usage: node src/sfx.js --score <score.json> --out <track.wav>');
    process.exit(2);
  }
  const score = JSON.parse(fs.readFileSync(scorePath, 'utf8')) as Score;
  const wav = renderScore(score);
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  fs.writeFileSync(outPath, wav);
  const secs = (wav.length - 44) / 4 / SR;
  console.log(`[sfx] ${(score.events || []).length} events -> ${outPath} (${secs.toFixed(2)}s, ${(wav.length / 1024).toFixed(0)}KB)`);
}

export { renderScore, SOUNDS, SR };
