import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "retrospect.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'founder',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS decisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      decision TEXT NOT NULL,
      category TEXT NOT NULL,
      outcome TEXT NOT NULL,
      result TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS recall_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      query TEXT NOT NULL,
      recalled_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

export function seedDemoData(userId: number) {
  const db = getDb();

  const count = db
    .prepare("SELECT COUNT(*) as cnt FROM decisions WHERE user_id = ?")
    .get(userId) as { cnt: number };

  if (count.cnt > 0) return;

  const now = new Date();
  const demoDecisions = [
    {
      decision: "Ran Instagram ads for product launch",
      category: "Marketing",
      outcome: "Negative",
      result: "Spent ₹5000, got 3 sales, not profitable",
      date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    {
      decision: "Posted LinkedIn article about product",
      category: "Marketing",
      outcome: "Positive",
      result: "Free, got 12 inquiries, 2 converted to clients",
      date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    {
      decision: "Hired freelancer for logo without checking portfolio",
      category: "Hiring",
      outcome: "Negative",
      result: "Delivered late, poor quality, wasted ₹2000",
      date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    {
      decision: "Reduced pricing by 30% for one week",
      category: "Finance",
      outcome: "Positive",
      result: "Sales doubled, cleared old inventory",
      date: new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    {
      decision: "Added new feature without user research",
      category: "Product",
      outcome: "Negative",
      result: "Nobody used it, wasted 2 weeks of build time",
      date: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    {
      decision: "Asked 5 users for feedback before building",
      category: "Product",
      outcome: "Positive",
      result: "Built exactly what they needed, 4 of 5 upgraded",
      date: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    {
      decision: "Took freelance project without a written contract",
      category: "Operations",
      outcome: "Negative",
      result: "Client delayed payment for 3 months",
      date: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    {
      decision: "Posted daily on Twitter for 30 days",
      category: "Marketing",
      outcome: "Positive",
      result: "Gained 400 followers, 3 inbound leads",
      date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  ];

  const stmt = db.prepare(
    "INSERT INTO decisions (user_id, decision, category, outcome, result, date) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const insertMany = db.transaction((items: typeof demoDecisions) => {
    for (const d of items) {
      stmt.run(userId, d.decision, d.category, d.outcome, d.result, d.date);
    }
  });

  insertMany(demoDecisions);
}
