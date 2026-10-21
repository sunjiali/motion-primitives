'use strict';
/* The installable skill bundle (skill/) must never drift from the
 * library it ships: every synced runtime file byte-equals its
 * source, and the API catalog covers every export. Regenerate with
 * `node scripts/sync-skill.mjs` and `node scripts/gen-api-doc.mjs`. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p));

const PAIRS = [
  ['index.js', 'skill/runtime/index.js'],
  ['index.d.ts', 'skill/runtime/index.d.ts'],
  ['src/render.js', 'skill/runtime/src/render.js'],
  ['src/record.js', 'skill/runtime/src/record.js'],
  ['src/sfx.js', 'skill/runtime/src/sfx.js'],
  ['src/player.html', 'skill/runtime/src/player.html'],
  ['src/lib/animation.js', 'skill/runtime/src/lib/animation.js'],
  ['src/lib/captions.js', 'skill/runtime/src/lib/captions.js'],
  ['src/lib/primitives.js', 'skill/runtime/src/lib/primitives.js'],
  ['STYLE.md', 'skill/references/STYLE.md'],
  ['skill/examples/hello-motion.js', 'skill/runtime/src/compositions/hello-motion.js'],
  ['skill/examples/hello-motion.sfx.json', 'skill/runtime/src/compositions/hello-motion.sfx.json'],
];

test('skill: SKILL.md frontmatter is valid and the bundle is complete', () => {
  const md = read('skill/SKILL.md').toString('utf8');
  assert.ok(md.startsWith('---\n'), 'frontmatter opens the file');
  assert.ok(/^name: motion$/m.test(md), 'skill name is motion');
  assert.ok(/^description: .{40,}$/m.test(md), 'description is substantive');
  for (const f of ['skill/README.md', 'skill/scripts/doctor.mjs', 'skill/scripts/render.mjs',
    'skill/scripts/record.mjs', 'skill/scripts/sfx.mjs', 'skill/scripts/chrome.mjs', 'skill/references/API.md']) {
    assert.ok(fs.existsSync(path.join(root, f)), `missing ${f}`);
  }
  const pkg = JSON.parse(read('skill/package.json').toString('utf8'));
  const lib = JSON.parse(read('package.json').toString('utf8'));
  assert.equal(pkg.version, lib.version, 'skill and library versions move in lockstep');
  assert.ok(pkg.dependencies['puppeteer-core'], 'skill declares its one dependency');
});

test('skill: synced runtime files byte-match their sources', () => {
  for (const [from, to] of PAIRS) {
    assert.ok(read(from).equals(read(to)), `${to} drifted from ${from} — run scripts/sync-skill.mjs`);
  }
});

test('skill: API catalog covers every exported function', () => {
  const dts = read('index.d.ts').toString('utf8');
  const api = read('skill/references/API.md').toString('utf8');
  const names = [...dts.matchAll(/^export function (\w+)/gm)].map((m) => m[1]);
  assert.ok(names.length >= 50, `expected the full surface, got ${names.length}`);
  for (const n of names) assert.ok(api.includes('### `' + n + '`'), `API.md is missing ${n} — run scripts/gen-api-doc.mjs`);
});

test('skill: bundled example score parses and cues known sounds', () => {
  const score = JSON.parse(read('skill/runtime/src/compositions/hello-motion.sfx.json').toString('utf8'));
  const known = ['pop', 'bloop', 'ting', 'whoosh', 'thump', 'inhale', 'glide', 'shimmer', 'swell', 'chord'];
  assert.ok(score.events.length >= 3);
  for (const e of score.events) assert.ok(known.includes(e.s), `unknown sound ${e.s}`);
});
