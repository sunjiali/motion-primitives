#!/usr/bin/env node
/* Generate skill/references/API.md from index.d.ts — signatures are
 * copied verbatim so the skill's catalog can never drift from the
 * shipped types. Run after changing index.d.ts:
 *   node scripts/gen-api-doc.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dts = fs.readFileSync(path.join(root, 'index.d.ts'), 'utf8').split('\n');

const GROUPS = [
  ['Timing & math', ['pop', 'ease', 'hash', 'stagger', 'pulse', 'breathe', 'beatGrid', 'beatFrames']],
  ['Entrances & motion', ['fadeUp', 'fly', 'travel', 'drop', 'beat', 'punch', 'shake', 'flash', 'wiggle', 'flipIn', 'whip', 'squash', 'trail', 'smear', 'pathFly', 'cursor']],
  ['Text & numbers', ['countUp', 'counterRoll', 'typewriter', 'drawText', 'scramble', 'splitText']],
  ['Shapes & drawing', ['dot', 'ripple', 'burst', 'badge', 'targetSlot', 'poly', 'drawOn', 'bars', 'morphShape', 'morphPoly', 'paperEl', 'pivot', 'stepped', 'onTwos', 'confetti']],
  ['Scene, camera & ambience', ['scene', 'transition', 'camera', 'parallax', 'meshBg', 'kenBurns', 'particleField', 'glitch', 'fx', 'wipeReveal']],
  ['Isometric kit', ['isoBox', 'isoCylinder', 'isoWedge', 'isoPipe', 'isoSort']],
];

const fns = new Map(); // name -> { doc, sig }
for (let i = 0; i < dts.length; i++) {
  const m = dts[i].match(/^export function (\w+)\((.*)\): ([^;]+);/);
  if (!m) continue;
  let doc = '';
  if (i > 0 && dts[i - 1].trim().startsWith('/**')) doc = dts[i - 1].replace(/\/\*\*|\*\//g, '').trim();
  fns.set(m[1], { doc, sig: `M.${m[1]}(${m[2]}): ${m[3]}` });
}

const grouped = new Set(GROUPS.flatMap(([, names]) => names));
const ungrouped = [...fns.keys()].filter((n) => !grouped.has(n));
if (ungrouped.length) { console.error('ungrouped exports:', ungrouped.join(', ')); process.exit(1); }
if (fns.size !== grouped.size) { console.error(`export count ${fns.size} != grouped ${grouped.size}`); process.exit(1); }

let out = `# motion-primitives API — the full catalog (${fns.size} functions)

Generated from \`index.d.ts\` by \`scripts/gen-api-doc.mjs\` — do not
edit by hand. All functions hang off \`window.Motion\` (alias \`M\`)
in compositions, and off the package export in Node. Unless noted,
\`frame\` is the current frame and \`o\` is the options bag; \`at\` /
\`dur\` / \`fn\` (easing name) recur everywhere via \`AtOpts\`.

`;
for (const [title, names] of GROUPS) {
  out += `## ${title}\n\n`;
  for (const n of names) {
    const f = fns.get(n);
    out += `### \`${n}\`\n\n\`\`\`ts\n${f.sig}\n\`\`\`\n\n`;
    if (f.doc) out += f.doc + '\n\n';
  }
}
const dest = path.join(root, 'skill', 'references', 'API.md');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log(`wrote ${dest} (${fns.size} functions)`);
