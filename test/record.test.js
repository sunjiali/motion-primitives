'use strict';
/* The page recorder CLI contract: help works, a missing --url fails
 * loudly, bad option formats are rejected before any browser opens. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const cli = path.join(__dirname, '..', 'src', 'record.js');
function runCli(args) {
  try {
    const out = execFileSync('node', [cli, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: String(e.stdout || '') + String(e.stderr || '') };
  }
}

test('record CLI: --help prints usage and exits 0', () => {
  const r = runCli(['--help']);
  assert.equal(r.code, 0);
  assert.ok(r.out.includes('--url'));
});

test('record CLI: missing --url fails loudly', () => {
  const r = runCli([]);
  assert.notEqual(r.code, 0);
  assert.ok(r.out.includes('--url'));
});

test('record CLI: malformed --mouse is rejected before launch', () => {
  const r = runCli(['--url', 'file:///tmp/x.html', '--mouse', 'somewhere']);
  assert.notEqual(r.code, 0);
  assert.ok(r.out.includes('--mouse'));
});
