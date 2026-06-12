import fs from "node:fs";
import path from "node:path";
import initSqlJs from "sql.js";
import { nanoid } from "nanoid";

const DDL = `
CREATE TABLE IF NOT EXISTS rsvps (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_or_telegram TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('yes','no')),
  guests_count INTEGER NOT NULL CHECK (guests_count IN (1,2)),
  plus_one_name TEXT,
  alcohol_choices_json TEXT NOT NULL,
  food_notes TEXT,
  comment TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at);
CREATE INDEX IF NOT EXISTS idx_rsvps_full_name ON rsvps(full_name);
`;

let db = null;
let dbPath = null;
let SQL = null;

export async function initDb(path_) {
  if (!path_) throw new Error("DB_PATH is required");
  
  dbPath = path_;
  const dir = path.dirname(dbPath);
  if (dir && dir !== "." && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  SQL = await initSqlJs();

  // Load existing DB or create new
  let fileBuffer = null;
  if (fs.existsSync(dbPath)) {
    fileBuffer = fs.readFileSync(dbPath);
  }

  db = new SQL.Database(fileBuffer);
  
  // Create tables
  db.run(DDL);
  
  // Save initial DB
  saveDb();
}

function saveDb() {
  if (!db || !dbPath) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

export function createRsvp(input) {
  if (!db) throw new Error("DB is not initialized");
  const id = nanoid();
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO rsvps (
      id, full_name, phone_or_telegram, status, guests_count, plus_one_name,
      alcohol_choices_json, food_notes, comment, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  stmt.bind([
    id,
    input.fullName,
    input.phoneOrTelegram,
    input.status,
    input.guestsCount,
    input.plusOneName || null,
    JSON.stringify(input.alcoholChoices || []),
    input.foodNotes || null,
    input.comment || null,
    createdAt,
  ]);

  stmt.step();
  stmt.free();
  
  saveDb();

  return {
    id,
    createdAt,
  };
}

export function listRsvps() {
  if (!db) throw new Error("DB is not initialized");
  
  const stmt = db.prepare(`
    SELECT
      id,
      full_name,
      phone_or_telegram,
      status,
      guests_count,
      plus_one_name,
      alcohol_choices_json,
      food_notes,
      comment,
      created_at
    FROM rsvps
    ORDER BY created_at DESC
  `);

  const rows = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    rows.push({
      id: row.id,
      fullName: row.full_name,
      phoneOrTelegram: row.phone_or_telegram,
      status: row.status,
      guestsCount: row.guests_count,
      plusOneName: row.plus_one_name || "",
      alcoholChoices: safeJsonArray(row.alcohol_choices_json),
      foodNotes: row.food_notes || "",
      comment: row.comment || "",
      createdAt: row.created_at,
    });
  }
  stmt.free();

  return rows;
}

export function deleteRsvp(id) {
  if (!db) throw new Error("DB is not initialized");
  
  const stmt = db.prepare(`DELETE FROM rsvps WHERE id = ?`);
  stmt.bind([id]);
  const result = stmt.step();
  stmt.free();

  saveDb();
  
  return result;
}

function safeJsonArray(value) {
  try {
    const v = JSON.parse(value || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

