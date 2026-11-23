#!/usr/bin/env node
// Prepare phone testing over Wi-Fi (Expo Go):
//   1. find this PC's private LAN IPv4 address
//   2. write apps/mobile/.env.local  -> EXPO_PUBLIC_API_URL=http://<ip>:<port>
//   3. set API_BIND_ADDRESS=<ip> in the root .env so Compose publishes the API on the LAN
//
// Usage: npm run mobile:lan [-- --ip 192.168.1.10]   (use --ip if several networks exist)
//        npm run mobile:lan -- --off                  (back to 127.0.0.1 only)
//
// Binds to the specific LAN IP, not 0.0.0.0. The database stays on 127.0.0.1.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rootEnv = join(root, '.env');
const mobileEnv = join(root, 'apps', 'mobile', '.env.local');
const args = process.argv.slice(2);

function privateIPv4Addresses() {
  const found = [];
  for (const [name, entries] of Object.entries(networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (entry.family !== 'IPv4' || entry.internal) continue;
      const [a, b] = entry.address.split('.').map(Number);
      const isPrivate = a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
      // Skip Docker / WSL / Hyper-V virtual adapters, which phones cannot reach.
      if (isPrivate && !/vEthernet|WSL|Docker|VirtualBox|VMware/i.test(name)) {
        found.push({ name, address: entry.address });
      }
    }
  }
  return found;
}

function setEnvValue(text, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  return pattern.test(text) ? text.replace(pattern, line) : `${text.trimEnd()}\n${line}\n`;
}

function readEnv() {
  if (!existsSync(rootEnv)) {
    console.error('No .env found. Run `python scripts/create-dev-env.py` first.');
    process.exit(1);
  }
  return readFileSync(rootEnv, 'utf8');
}

if (args.includes('--off')) {
  writeFileSync(rootEnv, setEnvValue(readEnv(), 'API_BIND_ADDRESS', '127.0.0.1'));
  console.warn('API_BIND_ADDRESS=127.0.0.1. Restart: docker compose up -d --wait');
  process.exit(0);
}

const ipFlag = args.indexOf('--ip');
let ip = ipFlag >= 0 ? args[ipFlag + 1] : undefined;
if (!ip) {
  const candidates = privateIPv4Addresses();
  if (candidates.length === 0) {
    console.error('No private Wi-Fi/LAN IPv4 address found. Connect to Wi-Fi, or pass --ip.');
    process.exit(1);
  }
  if (candidates.length > 1) {
    console.error('Several networks found; choose one with --ip:');
    for (const c of candidates) console.error(`  ${c.address}  (${c.name})`);
    process.exit(1);
  }
  ip = candidates[0].address;
}
if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
  console.error(`Not an IPv4 address: ${ip}`);
  process.exit(1);
}

const env = readEnv();
const port = /^API_HOST_PORT=(\d+)$/m.exec(env)?.[1] ?? '8000';
writeFileSync(rootEnv, setEnvValue(env, 'API_BIND_ADDRESS', ip));
writeFileSync(
  mobileEnv,
  `# Written by scripts/setup-mobile-lan.mjs (gitignored)\nEXPO_PUBLIC_API_URL=http://${ip}:${port}\n`,
);

console.warn(`Phone testing configured for ${ip}:
  .env                     API_BIND_ADDRESS=${ip}
  apps/mobile/.env.local   EXPO_PUBLIC_API_URL=http://${ip}:${port}

Next:
  1. docker compose up -d --wait          (restart so the API listens on ${ip})
  2. npm run start -w apps/mobile         (scan the QR code with Expo Go)
  3. On the phone, http://${ip}:${port}/api/v1/health should show {"status":"ok"...}

The dev API is now reachable by other devices on this network. Undo with:
  npm run mobile:lan -- --off && docker compose up -d --wait`);
