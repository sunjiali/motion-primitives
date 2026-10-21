'use strict';
// Package smoke test: pack the real tarball, install it into a throwaway
// consumer project, and verify what users actually receive — the files
// the manifest promises, the public API, the SFX engine, and (when
// CHROME_PATH is set) a still rendered through the *installed* CLI.
// This exists because packaging omissions (a missing player.html) once
// shipped silently; the unit tests cannot see them from inside the repo.
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.join(__dirname, '..');
const run = (cmd, args, opts) => execFileSync(cmd, args, { stdio: 'inherit', ...opts });

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-pack-'));
try {
  run('npm', ['pack', '--silent', '--pack-destination', tmp], { cwd: root });
  const tgz = fs.readdirSync(tmp).find((f) => f.endsWith('.tgz'));
  assert.ok(tgz, 'npm pack produced no tarball');

  const consumer = path.join(tmp, 'consumer');
  fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, 'package.json'),
    JSON.stringify({ name: 'consumer', private: true, version: '1.0.0' }));
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund',
    path.join(tmp, tgz)], { cwd: consumer });

  const pkgDir = path.join(consumer, 'node_modules', '@sunjiali', 'motion-primitives');
  for (const f of ['index.js', 'index.d.ts', 'src/player.html', 'src/render.js',
    'src/sfx.js', 'README.md', 'LICENSE', 'CHANGELOG.md']) {
    assert.ok(fs.existsSync(path.join(pkgDir, f)), `tarball is missing ${f}`);
  }
  console.log('package files ok');

  run(process.execPath, ['-e', `
    const M = require('@sunjiali/motion-primitives');
    const need = ['pop','fly','trail','smear','squash','paperEl','pivot','stepped',
      'onTwos','whip','pathFly','flipIn','counterRoll','fx','camera','meshBg'];
    for (const k of need) {
      if (typeof M[k] !== 'function') throw new Error('missing API: ' + k);
    }
    const wav = M.sfx.renderScore({ fps: 30, durationFrames: 30,
      events: [{ f: 1, s: 'pop' }] });
    if (!Buffer.isBuffer(wav) || wav.length < 1000) throw new Error('sfx engine broken');
    console.log('package API + sfx ok (' + need.length + ' primitives)');
  `], { cwd: consumer });

  if (process.env.CHROME_PATH) {
    const out = path.join(tmp, 'installed-still.png');
    run(process.execPath, [path.join(pkgDir, 'src/render.js'),
      '--comp', 'showcase', '--still', '60', '--out', out],
      { cwd: consumer, env: process.env });
    const size = fs.statSync(out).size;
    assert.ok(size > 10000, `installed render suspiciously small: ${size} bytes`);
    console.log(`installed CLI render ok (${size} bytes)`);
  } else {
    console.log('CHROME_PATH not set — skipped the installed-render check');
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log('package smoke passed');
