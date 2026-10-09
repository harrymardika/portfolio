/**
 * The moderation queue for "Kind words" messages (T12.1, ADR 0017), in its own SQLite file next to the
 * stats database. Not in the stats backups, so deleting really deletes. No address or visitor id is
 * stored. A message lives here only until the owner decides: rejected ones are deleted at once, approved
 * ones once their pull request is open (or after APPROVED_RETENTION_DAYS if that never happens), and
 * unreviewed ones after RETENTION_DAYS.
 */
import { randomBytes } from 'node:crypto';

import { Database } from 'bun:sqlite';

import type { Submission } from '../../src/lib/messages';

export const RETENTION_DAYS = 90;
/** An approved message whose pull request never opened (a broken workflow) does not stay forever. */
export const APPROVED_RETENTION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface StoredMessage extends Submission {
  readonly id: string;
  /** ISO time it was sent. */
  readonly createdAt: string;
  /** ISO time the owner approved it, or null while pending. */
  readonly approvedAt: string | null;
}

interface Row {
  id: string;
  created_at: number;
  approved_at: number | null;
  lang: string;
  name: string;
  role: string | null;
  relationship: string;
  message: string;
  link: string | null;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    approved_at INTEGER,
    lang TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    relationship TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT
  );
`;

/** Message ids are random, so they reveal nothing and cannot be guessed. */
export const MESSAGE_ID = /^[a-f0-9]{16}$/;

const toMessage = (row: Row): StoredMessage => ({
  id: row.id,
  createdAt: new Date(row.created_at).toISOString(),
  approvedAt: row.approved_at === null ? null : new Date(row.approved_at).toISOString(),
  lang: row.lang === 'id' ? 'id' : 'en',
  name: row.name,
  role: row.role,
  relationship: row.relationship,
  message: row.message,
  link: row.link,
});

export class MessagesStore {
  private readonly db: Database;

  constructor(path = ':memory:') {
    this.db = new Database(path, { create: true, strict: true });
    // A rollback journal, not WAL: with WAL a deleted message stays readable in the -wal file until the
    // next checkpoint. The queue is tiny, so WAL's concurrency is not needed. Deleted rows are overwritten,
    // not left readable in free pages.
    this.db.run('PRAGMA journal_mode = DELETE;');
    this.db.run('PRAGMA secure_delete = ON;');
    this.db.run(SCHEMA);
  }

  add(submission: Submission, now: Date): string {
    const id = randomBytes(8).toString('hex');
    this.db
      .query(
        `INSERT INTO messages (id, created_at, lang, name, role, relationship, message, link)
         VALUES ($id, $createdAt, $lang, $name, $role, $relationship, $message, $link)`,
      )
      .run({ id, createdAt: now.getTime(), ...submission });
    return id;
  }

  /** Waiting for the owner, oldest first. */
  pending(): StoredMessage[] {
    return this.db
      .query<Row, []>('SELECT * FROM messages WHERE approved_at IS NULL ORDER BY created_at')
      .all()
      .map(toMessage);
  }

  /** Approved, waiting for their pull request, oldest approval first. */
  approved(): StoredMessage[] {
    return this.db
      .query<Row, []>('SELECT * FROM messages WHERE approved_at IS NOT NULL ORDER BY approved_at')
      .all()
      .map(toMessage);
  }

  pendingCount(): number {
    return (
      this.db.query<{ n: number }, []>('SELECT COUNT(*) AS n FROM messages WHERE approved_at IS NULL').get()
        ?.n ?? 0
    );
  }

  /** True when a pending message was approved. */
  approve(id: string, now: Date): boolean {
    return (
      this.db
        .query('UPDATE messages SET approved_at = $at WHERE id = $id AND approved_at IS NULL')
        .run({ id, at: now.getTime() }).changes > 0
    );
  }

  /** Rejecting deletes a pending message. True when one was deleted. */
  reject(id: string): boolean {
    return (
      this.db.query('DELETE FROM messages WHERE id = $id AND approved_at IS NULL').run({ id }).changes > 0
    );
  }

  /** Its pull request is open, so the copy here goes. True when one was deleted. */
  published(id: string): boolean {
    return (
      this.db.query('DELETE FROM messages WHERE id = $id AND approved_at IS NOT NULL').run({ id }).changes > 0
    );
  }

  /**
   * Delete pending messages older than RETENTION_DAYS and approved ones older than
   * APPROVED_RETENTION_DAYS. Returns how many went.
   */
  purge(now: Date): number {
    return this.db
      .query(
        `DELETE FROM messages
         WHERE (approved_at IS NULL AND created_at < $pendingBefore)
            OR (approved_at IS NOT NULL AND approved_at < $approvedBefore)`,
      )
      .run({
        pendingBefore: now.getTime() - RETENTION_DAYS * DAY_MS,
        approvedBefore: now.getTime() - APPROVED_RETENTION_DAYS * DAY_MS,
      }).changes;
  }

  close(): void {
    this.db.close();
  }
}
