import {backup, DatabaseSync} from 'node:sqlite';
import {mkdir, readdir, rename, unlink} from 'node:fs/promises';
import {join, dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';

export async function backupDatabase(databasePath, backupDir, keep = 7) {
  if (!Number.isInteger(keep) || keep < 1) throw new Error('Keep must be a positive integer');
  const source = new DatabaseSync(databasePath, {readOnly: true});
  const name = `dealsignal-${new Date().toISOString().replaceAll(':', '-')}-${randomUUID()}.db`;
  const target = join(backupDir, name);
  const temporary = `${target}.partial`;
  try {
    await mkdir(backupDir, {recursive: true});
    await backup(source, temporary);
    const restored = new DatabaseSync(temporary, {readOnly: true});
    try {
      if (restored.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') {
        throw new Error('Backup integrity check failed');
      }
    } finally { restored.close(); }
    await rename(temporary, target);
  } catch (error) {
    await unlink(temporary).catch(() => {});
    throw error;
  } finally { source.close(); }
  const copies = (await readdir(backupDir))
    .filter(file => /^dealsignal-\d{4}-\d{2}-\d{2}T[\d.-]+Z-[\da-f-]+\.db$/.test(file)).sort();
  for (const file of copies.slice(0, Math.max(0, copies.length - keep))) {
    await unlink(join(backupDir, file));
  }
  return target;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const databasePath = process.env.PIPELINE_DB ?? '/app/data/pipeline.db';
  console.log(await backupDatabase(databasePath, join(dirname(databasePath), 'backups')));
}
