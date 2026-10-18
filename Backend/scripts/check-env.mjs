#!/usr/bin/env node
/**
 * KaamSetu env doctor — run with:  npm run env:check
 *
 * Audits Backend/.env the same way the server loads it (dotenv),
 * reports which variables are set/missing from the server's point of view,
 * and flags the classic gotchas (wrong file location, smart quotes, typos).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, '..');
const envPath = path.join(backendDir, '.env');

const VARS = [
  { key: 'MONGODB_URI',            required: true,  hint: 'Atlas → Databases → Connect → Drivers → Node.js' },
  { key: 'JWT_SECRET',             required: true,  hint: 'node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"' },
  { key: 'JWT_REFRESH_SECRET',     required: true,  hint: 'same command, must differ from JWT_SECRET' },
  { key: 'ADMIN_PASSWORD',         required: true,  hint: 'long random admin-panel password' },
  { key: 'ADMIN_JWT_SECRET',       required: true,  hint: 'same generator as JWT_SECRET' },
  { key: 'PORT',                   required: false, hint: 'default 5000' },
  { key: 'NODE_ENV',               required: false, hint: 'development | production' },
  { key: 'ALLOWED_ORIGINS',        required: false, hint: 'comma-separated frontend origins' },
  { key: 'RESEND_API_KEY',         required: false, hint: 'email OTPs — unset = demo mode' },
  { key: 'EMAIL_FROM',             required: false, hint: 'verified-domain sender — unset = demo mode' },
  { key: 'TWILIO_ACCOUNT_SID',     required: false, hint: 'SMS — unset = demo mode' },
  { key: 'TWILIO_AUTH_TOKEN',      required: false, hint: 'SMS — unset = demo mode' },
  { key: 'TWILIO_PHONE_NUMBER',    required: false, hint: 'SMS — unset = demo mode' },
  { key: 'CLOUDINARY_CLOUD_NAME',  required: false, hint: 'media uploads' },
  { key: 'CLOUDINARY_API_KEY',     required: false, hint: 'media uploads' },
  { key: 'CLOUDINARY_API_SECRET',  required: false, hint: 'media uploads' },
  { key: 'OPENROUTESERVICE_API_KEY', required: false, hint: 'road distances — unset = straight-line fallback' },
  { key: 'OTP_FALLBACK_TO_RESPONSE', required: false, hint: 'true = force demo otp mode' },
  { key: 'COOKIE_SECURE',          required: false, hint: 'false for http://localhost dev' },
  { key: 'COOKIE_SAME_SITE',       required: false, hint: 'lax for localhost, none in production' }
];

const green  = (s) => process.stdout.isTTY ? `\u001b[32m${s}\u001b[0m` : s;
const red    = (s) => process.stdout.isTTY ? `\u001b[31m${s}\u001b[0m` : s;
const yellow = (s) => process.stdout.isTTY ? `\u001b[33m${s}\u001b[0m` : s;
const bold   = (s) => process.stdout.isTTY ? `\u001b[1m${s}\u001b[0m` : s;

const mask = (v) => {
  if (v.length <= 8) return '•'.repeat(v.length) + ` (${v.length} chars)`;
  return `${v.slice(0, 6)}…${v.slice(-3)} (${v.length} chars)`;
};

console.log(bold('KaamSetu env doctor'));
console.log(`Looking for env file at: ${envPath}\n`);

let fileOk = fs.existsSync(envPath);
if (!fileOk) {
  console.log(red('✗ .env NOT FOUND in the Backend folder.'));
  console.log('  Fix: copy the template and fill it in:');
  console.log('    Windows (PowerShell):  copy .env.example .env');
  console.log('    macOS/Linux:           cp .env.example .env');
  console.log('  ⚠  The file must live NEXT TO package.json (Backend/), not in the repo root.');
  process.exit(1);
}

// --- raw file forensics (catches what dotenv silently ignores) -------------
const raw = fs.readFileSync(envPath, 'utf8');
const warnings = [];

if (raw.charCodeAt(0) === 0xFEFF) {
  warnings.push('File starts with a UTF-8 BOM — re-save as plain "UTF-8" (Notepad → Save As → Encoding: UTF-8).');
}

const smartQuoteLines = [];
const declaredKeys = new Set();
raw.split(/\r?\n/).forEach((line, i) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  if (/[“”‘’]/.test(trimmed)) {
    smartQuoteLines.push(i + 1);
  }
  const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
  if (m) declaredKeys.add(m[1]);
});

if (smartQuoteLines.length > 0) {
  warnings.push(`Smart quotes (“ ”) on line(s) ${smartQuoteLines.join(', ')} — replace with straight quotes (") or remove them. Notepad/Word often auto-converts; use VS Code or Notepad++.`);
}

// Vars the file declares but the server never reads — classic typo detector
const knownKeys = new Set(VARS.map(v => v.key));
const unknown = [...declaredKeys].filter(k => !knownKeys.has(k) && !k.startsWith('COOKIE_') && !k.startsWith('EMAIL_FROM') && k !== 'ADMIN_SESSION_TTL' && k !== 'COOKIE_DOMAIN' && k !== 'EMAIL_FROM_NAME');
if (unknown.length > 0) {
  warnings.push(`Unrecognised variable name(s): ${unknown.join(', ')} — check for typos (e.g. MONGO_URI ≠ MONGODB_URI).`);
}

// --- load exactly like the server does -------------------------------------
dotenv.config({ path: envPath });

let missingRequired = 0;
console.log(bold('Variable status (as the server sees it):'));
for (const v of VARS) {
  const value = process.env[v.key];
  const set = typeof value === 'string' && value.length > 0;
  if (set) {
    console.log(`  ${green('✓')} ${v.key.padEnd(26)} ${mask(value)}`);
  } else if (v.required) {
    missingRequired++;
    console.log(`  ${red('✗')} ${v.key.padEnd(26)} ${red('MISSING — required')}  → ${v.hint}`);
  } else {
    console.log(`  ${yellow('–')} ${v.key.padEnd(26)} not set (${v.hint})`);
  }
}

console.log('');
for (const w of warnings) {
  console.log(yellow(`⚠ ${w}`));
}

if (missingRequired > 0) {
  console.log(red(`\n${missingRequired} required variable(s) missing — the server will not start until fixed.`));
  process.exit(1);
}

console.log(green('\nAll required variables present — npm run dev should boot. 🚀'));
