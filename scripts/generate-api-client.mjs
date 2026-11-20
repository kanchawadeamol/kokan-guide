#!/usr/bin/env node
// Regenerate packages/api-client from the backend's OpenAPI schema.
//
//   npm run api:generate   # write packages/api-client/openapi.json + src/schema.generated.ts
//   npm run api:check      # fail if the committed files are out of date (use in CI)
//
// Python is located via $PYTHON, else the backend virtualenv (Windows or POSIX layout).
// Generated files are excluded from Prettier/ESLint so the check compares raw output.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backend = join(root, 'apps', 'backend');
const pkg = join(root, 'packages', 'api-client');
const committed = {
  schema: join(pkg, 'openapi.json'),
  types: join(pkg, 'src', 'schema.generated.ts'),
};

function findPython() {
  if (process.env.PYTHON) return process.env.PYTHON;
  const candidates = [
    join(backend, '.venv', 'Scripts', 'python.exe'),
    join(backend, '.venv', 'bin', 'python'),
  ];
  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    console.error('Backend virtualenv not found. Create apps/backend/.venv or set $PYTHON.');
    process.exit(1);
  }
  return found;
}

/** Export the schema and generate types into the given output paths. */
function generate(out) {
  execFileSync(findPython(), ['scripts/export_openapi.py', out.schema], {
    cwd: backend,
    stdio: 'inherit',
  });
  const cli = join(root, 'node_modules', 'openapi-typescript', 'bin', 'cli.js');
  execFileSync(process.execPath, [cli, out.schema, '-o', out.types], {
    stdio: ['ignore', 'ignore', 'inherit'],
  });
}

if (process.argv.includes('--check')) {
  const tmp = mkdtempSync(join(tmpdir(), 'konkan-api-'));
  try {
    const fresh = { schema: join(tmp, 'openapi.json'), types: join(tmp, 'schema.generated.ts') };
    generate(fresh);
    const stale = Object.keys(committed).filter(
      (key) =>
        !existsSync(committed[key]) ||
        readFileSync(committed[key], 'utf8') !== readFileSync(fresh[key], 'utf8'),
    );
    if (stale.length > 0) {
      console.error(`API client is out of date (${stale.join(', ')}). Run: npm run api:generate`);
      process.exit(1);
    }
    console.warn('API client is up to date.');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
} else {
  generate(committed);
  console.warn('Wrote packages/api-client/openapi.json and src/schema.generated.ts');
}
