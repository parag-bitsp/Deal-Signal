import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {backupDatabase} from '../deploy/backup.mjs';

test('backup includes committed WAL data, restores, and retains seven copies', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dealsignal-backup-'));
  const databasePath = join(dir, 'pipeline.db');
  const backups = join(dir, 'backups');
  const db = new DatabaseSync(databasePath);
  try {
    db.exec("PRAGMA journal_mode=WAL; CREATE TABLE decisions(draft TEXT); INSERT INTO decisions VALUES ('Approved demo follow-up');");
    const file = await backupDatabase(databasePath, backups);
    const restored = new DatabaseSync(file, {readOnly: true});
    try {
      assert.equal(restored.prepare('SELECT draft FROM decisions').get()!.draft, 'Approved demo follow-up');
      assert.equal(restored.prepare('PRAGMA integrity_check').get()!.integrity_check, 'ok');
    } finally { restored.close(); }
    writeFileSync(join(backups, 'keep-me.txt'), 'unrelated file');
    for (let i = 0; i < 8; i++) await backupDatabase(databasePath, backups);
    assert.equal(readdirSync(backups).filter(name => name.endsWith('.db')).length, 7);
    assert.equal(readFileSync(join(backups, 'keep-me.txt'), 'utf8'), 'unrelated file');
  } finally {
    db.close();
    rmSync(dir, {recursive: true, force: true});
  }
});

test('missing source fails without creating a fresh empty database', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dealsignal-backup-'));
  try {
    await assert.rejects(backupDatabase(join(dir, 'missing.db'), join(dir, 'backups')));
    assert.ok(!readdirSync(dir).includes('missing.db'));
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
