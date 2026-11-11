#!/usr/bin/env node
// Uses only existing refresh-admin credentials. Never reads webhook configuration.
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
const [bot, state, task, step] = process.argv.slice(2);
const states = ['working', 'waiting-approval', 'blocked', 'idle', 'done'];
const clean = (s, n, empty = false) => typeof s === 'string' && (empty || !!s.trim()) && s.length <= n && !/[\u0000-\u001f\u007f]/.test(s);
if (process.argv.slice(2).length < 3 || process.argv.slice(2).length > 4 || !clean(bot, 80) || !states.includes(state) || !clean(task, 120, true) || (step !== undefined && !clean(step, 240, true))) {
  console.error('Usage: post-status.sh <bot> <state> "<task>" ["<step>"]'); process.exit(2);
}
try {
  const envFile = await readFile(process.env.CC_ENV_FILE || join(homedir(), '.secrets/control-center.env'), 'utf8');
  function field(name) {
    const line = envFile.split(/\r?\n/).find((s) => s.startsWith(`${name}=`));
    if (!line) return '';
    const raw = line.slice(name.length + 1).trim();
    return (raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'")) ? raw.slice(1, -1) : raw;
  }
  const base = field('CC_URL'), admin = field('ADMIN_KEY');
  const url = new URL('/api/admin/status', base);
  if (url.protocol !== 'https:' || !admin) throw new Error('Missing refresh-admin configuration');
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${admin}` }, body: JSON.stringify({ bot, state, task, ...(step !== undefined ? { step } : {}) }), redirect: 'error', signal: AbortSignal.timeout(30000) });
  console.log(`post-status: HTTP ${r.status} ${r.ok ? 'saved' : 'failed'}`);
  if (!r.ok) process.exitCode = 1;
} catch { console.error('post-status: request failed; check existing refresh-admin configuration and connectivity (no credentials shown)'); process.exitCode = 1; }
