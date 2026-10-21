#!/usr/bin/env node
/* Sync the installable skill bundle with the built library.
 * Copies compiled runtime files into skill/runtime/, the style guide
 * into skill/references/, and the examples into the runtime's
 * compositions folder. Run after `npm run build`:
 *   node scripts/sync-skill.mjs
 * test/skill.test.js fails CI when any synced file drifts. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAIRS = [
  ['index.js', 'skill/runtime/index.js'],
  ['index.d.ts', 'skill/runtime/index.d.ts'],
  ['src/render.js', 'skill/runtime/src/render.js'],
  ['src/sfx.js', 'skill/runtime/src/sfx.js'],
  ['src/player.html', 'skill/runtime/src/player.html'],
  ['src/lib/animation.js', 'skill/runtime/src/lib/animation.js'],
  ['src/lib/captions.js', 'skill/runtime/src/lib/captions.js'],
  ['src/lib/primitives.js', 'skill/runtime/src/lib/primitives.js'],
  ['STYLE.md', 'skill/references/STYLE.md'],
  ['skill/examples/hello-motion.js', 'skill/runtime/src/compositions/hello-motion.js'],
  ['skill/examples/hello-motion.sfx.json', 'skill/runtime/src/compositions/hello-motion.sfx.json'],
];
for (const [from, to] of PAIRS) {
  const dest = path.join(root, to);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(root, from), dest);
  console.log(`synced ${from} -> ${to}`);
}
