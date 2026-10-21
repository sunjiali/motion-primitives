'use strict';
// Syntax-check every JavaScript file the project ships or tests with,
// using the same command locally and in CI (`npm run syntax`).
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const files = [path.join(root, 'index.js')];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (entry.name !== 'node_modules') walk(p); }
    else if (entry.name.endsWith('.js')) files.push(p);
  }
}
for (const dir of ['src', 'site', 'test', 'scripts']) walk(path.join(root, dir));

let failed = 0;
for (const file of files) {
  const r = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (r.status !== 0) { failed++; console.error('syntax failed:', path.relative(root, file)); }
}
console.log(`syntax: ${files.length - failed}/${files.length} files ok`);
process.exit(failed ? 1 : 0);
