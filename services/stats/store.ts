/**
 * SQLite storage and aggregation for site statistics (ADR 0009). Uses Bun's built-in SQLite.
 * Stores no IP addresses or full URLs: only a daily visitor hash, path, language, referrer host,
 * country, and the event detail. Salts older than today are deleted.
 */
import { randomBytes } from 'node:crypto';

import { Database } from 'bun:sqlite';

import { dayKey } from '../../src/lib/stats/privacy';

import type { Ranked, RefReport, Summary } from '../../src/lib/stats/summary';

export interface StoredEvent {
  readonly type: 'pageview' | 'download' | 'outbound';
  readonly path: string;
  readonly lang: string;
  readonly detail: string | null;
  readonly referrerHost: string | null;
  readonly country: string | null;
  readonly ref: string | null;
  readonly visitor: string;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY,
    ts INTEGER NOT NULL,
    day TEXT NOT NULL,
    type TEXT NOT NULL,
    path TEXT NOT NULL,
    lang TEXT NOT NULL,
    detail TEXT,
    referrer_host TEXT,
    country TEXT,
    ref TEXT,
    visitor TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS events_day ON events (day);
  CREATE INDEX IF NOT EXISTS events_type_day ON events (type, day);
  CREATE TABLE IF NOT EXISTS salts (day TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

const TOP_N = 5;

export class StatsStore {
  private readonly db: Database;

  constructor(path = ':memory:') {
    this.db = new Database(path, { create: true, strict: true });
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.db.exec(SCHEMA);
  }

  /** Today's secret salt; created on first use and every earlier salt is deleted. */
  saltFor(now: Date): string {
    const day = dayKey(now);
    this.db.query('DELETE FROM salts WHERE day < $day').run({ day });
    const existing = this.db
      .query<{ value: string }, { day: string }>('SELECT value FROM salts WHERE day = $day')
      .get({ day });
    if (existing) return existing.value;
    const value = randomBytes(32).toString('hex');
    this.db.query('INSERT INTO salts (day, value) VALUES ($day, $value)').run({ day, value });
    return value;
  }

  record(event: StoredEvent, now: Date): void {
    this.db
      .query(
        `INSERT INTO events (ts, day, type, path, lang, detail, referrer_host, country, ref, visitor)
         VALUES ($ts, $day, $type, $path, $lang, $detail, $referrerHost, $country, $ref, $visitor)`,
      )
      .run({ ts: now.getTime(), day: dayKey(now), ...event });
  }

  summary(now: Date): Summary {
    const since30 = dayKey(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
    const count = (sql: string, params: Record<string, string> = {}): number =>
      this.db.query<{ n: number }, Record<string, string>>(sql).get(params)?.n ?? 0;
    const ranked = (column: string): Ranked[] =>
      this.db
        .query<Ranked, Record<string, string>>(
          `SELECT ${column} AS key, COUNT(*) AS count FROM events
           WHERE type = 'pageview' AND ${column} IS NOT NULL AND day >= $since
           GROUP BY ${column} ORDER BY count DESC, key ASC LIMIT ${TOP_N}`,
        )
        .all({ since: since30 });
    const visitors = (where: string, params: Record<string, string> = {}): number =>
      count(
        `SELECT COUNT(*) AS n FROM (SELECT DISTINCT day, visitor FROM events WHERE type = 'pageview' ${where})`,
        params,
      );

    return {
      generatedAt: now.toISOString(),
      since:
        this.db.query<{ day: string | null }, []>('SELECT MIN(day) AS day FROM events').get()?.day ?? null,
      visitors: { total: visitors(''), last30Days: visitors('AND day >= $since', { since: since30 }) },
      pageviews: {
        total: count("SELECT COUNT(*) AS n FROM events WHERE type = 'pageview'"),
        last30Days: count("SELECT COUNT(*) AS n FROM events WHERE type = 'pageview' AND day >= $since", {
          since: since30,
        }),
      },
      downloads: {
        cv: count("SELECT COUNT(*) AS n FROM events WHERE type = 'download' AND detail = 'cv'"),
        portfolio: count("SELECT COUNT(*) AS n FROM events WHERE type = 'download' AND detail = 'portfolio'"),
      },
      topPages: ranked('path'),
      topReferrers: ranked('referrer_host'),
      topCountries: ranked('country'),
    };
  }

  /**
   * Tracking-link report for the owner: for each ?ref= value, when it was opened and whether the
   * same visitor downloaded the CV or portfolio that day. Never exposed publicly.
   */
  refReport(): RefReport[] {
    return this.db
      .query<
        {
          ref: string;
          first_ts: number;
          last_ts: number;
          visits: number;
          pageviews: number;
          cv: number;
          portfolio: number;
        },
        []
      >(
        `WITH landings AS (SELECT DISTINCT ref, day, visitor FROM events WHERE ref IS NOT NULL)
         SELECT l.ref AS ref,
                MIN(e.ts) AS first_ts,
                MAX(e.ts) AS last_ts,
                COUNT(DISTINCT l.day || l.visitor) AS visits,
                SUM(e.type = 'pageview') AS pageviews,
                MAX(e.type = 'download' AND e.detail = 'cv') AS cv,
                MAX(e.type = 'download' AND e.detail = 'portfolio') AS portfolio
         FROM landings l JOIN events e ON e.day = l.day AND e.visitor = l.visitor
         GROUP BY l.ref ORDER BY last_ts DESC`,
      )
      .all()
      .map((row) => ({
        ref: row.ref,
        firstSeen: new Date(row.first_ts).toISOString(),
        lastSeen: new Date(row.last_ts).toISOString(),
        visits: row.visits,
        pageviews: row.pageviews,
        downloadedCv: row.cv === 1,
        downloadedPortfolio: row.portfolio === 1,
      }));
  }

  close(): void {
    this.db.close();
  }
}
