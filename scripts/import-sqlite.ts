/**
 * Copies submissions from the old Express/SQLite backend into Convex.
 *
 *   npm run import:sqlite -- path/to/poultryfarm.db          # dev deployment
 *   npm run import:sqlite -- path/to/poultryfarm.db --prod   # production
 *
 * Safe to re-run: rows already imported (matched by their old id) are skipped.
 * Requires Node 22.18+ (built-in TypeScript and node:sqlite).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const TYPES = new Set(['consultation', 'application', 'enrolment', 'job']);

const args = process.argv.slice(2);
const prod = args.includes('--prod');
const dbPath = args.find((a) => !a.startsWith('--'));

if (!dbPath || !existsSync(dbPath)) {
  console.error('Usage: npm run import:sqlite -- path/to/poultryfarm.db [--prod]');
  process.exit(1);
}

const convex = (...cmd: string[]) =>
  execFileSync('npx', ['convex', ...cmd, ...(prod ? ['--prod'] : [])], { encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit'] });

interface Row { id: number; type: string; status: string; data: string; created_at: string }

const db = new DatabaseSync(dbPath, { readOnly: true });
const rows = db.prepare('SELECT id, type, status, data, created_at FROM submissions ORDER BY id').all() as unknown as Row[];
db.close();
console.log(`Found ${rows.length} submission(s) in ${dbPath}.`);

const already = new Set<number>(JSON.parse(convex('run', 'migrations:importedLegacyIds')));
const skipped: string[] = [];
const docs = rows.flatMap((r) => {
  if (already.has(r.id)) return [];
  if (!TYPES.has(r.type)) {
    skipped.push(`#${r.id} (unknown type "${r.type}")`);
    return [];
  }
  return [{
    type: r.type,
    status: r.status,
    data: JSON.parse(r.data),
    submittedAt: Date.parse(r.created_at),
    legacyId: r.id,
  }];
});

if (already.size) console.log(`Skipping ${rows.length - docs.length - skipped.length} already imported.`);
if (skipped.length) console.warn(`Skipping ${skipped.join(', ')}.`);
if (!docs.length) {
  console.log('Nothing new to import.');
  process.exit(0);
}

const dir = mkdtempSync(join(tmpdir(), 'poultrypath-import-'));
const file = join(dir, 'submissions.jsonl');
writeFileSync(file, docs.map((d) => JSON.stringify(d)).join('\n') + '\n');
try {
  console.log(`Importing ${docs.length} submission(s) into Convex${prod ? ' (production)' : ''}…`);
  execFileSync('npx', ['convex', 'import', '--table', 'submissions', '--append', ...(prod ? ['--prod'] : []), file], { stdio: 'inherit' });
  console.log('Done. Note: no notification emails are sent for imported submissions.');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
