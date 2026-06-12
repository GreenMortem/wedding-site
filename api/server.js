import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createRsvp, deleteRsvp, initDb, listRsvps } from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const PORT = Number(process.env.PORT || 3000);
const ADMIN_CODE = String(process.env.ADMIN_CODE || "");
const DB_PATH = String(process.env.DB_PATH || path.join(rootDir, "data", "rsvps.sqlite"));

if (!ADMIN_CODE) {
  throw new Error("ADMIN_CODE is required. Create .env based on .env.example");
}

const app = express();

// Initialize DB and start server
await initDb(DB_PATH);
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "32kb" }));

app.use(
  "/api/rsvp",
  rateLimit({
    windowMs: 60_000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.post("/api/rsvp", (req, res) => {
  const input = normalizeRsvpInput(req.body);
  const error = validateRsvpInput(input);
  if (error) return res.status(400).json({ error });

  const created = createRsvp(input);
  return res.status(201).json({ id: created.id, createdAt: created.createdAt });
});

app.get("/api/health", (_req, res) => res.status(200).json({ ok: true }));

app.use("/api/admin", requireAdmin);

app.get("/api/admin/rsvps", (_req, res) => {
  const items = listRsvps();
  return res.status(200).json({ items });
});

app.get("/api/admin/rsvps.csv", (_req, res) => {
  const items = listRsvps();
  const csv = toCsv(items);
  res.setHeader("content-type", "text/csv; charset=utf-8");
  res.setHeader("content-disposition", "attachment; filename=rsvps.csv");
  return res.status(200).send("\uFEFF" + csv);
});

app.delete("/api/admin/rsvps/:id", (req, res) => {
  const id = String(req.params.id || "");
  if (!id) return res.status(400).json({ error: "Некорректный id." });
  const ok = deleteRsvp(id);
  if (!ok) return res.status(404).json({ error: "Запись не найдена." });
  return res.status(204).send();
});

app.get("/admin", (_req, res) => {
  return res.sendFile(path.join(rootDir, "admin.html"));
});

app.use(express.static(rootDir, { extensions: ["html"] }));

app.get("*", (_req, res) => {
  return res.sendFile(path.join(rootDir, "index.html"));
});

app.listen(PORT, () => {
  process.stdout.write(`Server started on http://localhost:${PORT}\n`);
});

function requireAdmin(req, res, next) {
  const code = String(req.headers["x-admin-code"] || "");
  if (!code || code !== ADMIN_CODE) return res.status(401).json({ error: "Неверный код доступа." });
  return next();
}

function normalizeRsvpInput(body) {
  const fullName = String(body?.fullName || "").trim();
  const phoneOrTelegram = String(body?.phoneOrTelegram || "").trim();
  const status = String(body?.status || "").trim();
  const guestsCount = Number(body?.guestsCount) === 2 ? 2 : 1;
  const plusOneName = String(body?.plusOneName || "").trim();
  const alcoholChoices = Array.isArray(body?.alcoholChoices) ? body.alcoholChoices.map((v) => String(v)) : [];
  const foodNotes = String(body?.foodNotes || "").trim();
  const comment = String(body?.comment || "").trim();

  return {
    fullName,
    phoneOrTelegram,
    status,
    guestsCount,
    plusOneName: plusOneName || undefined,
    alcoholChoices,
    foodNotes: foodNotes || undefined,
    comment: comment || undefined,
  };
}

function validateRsvpInput(input) {
  if (!input.fullName) return "Укажите имя и фамилию.";
  if (input.fullName.length > 120) return "Слишком длинное имя.";

  if (!input.phoneOrTelegram) return "Укажите телефон или Telegram.";
  if (input.phoneOrTelegram.length > 80) return "Слишком длинный контакт.";

  if (input.status !== "yes" && input.status !== "no") return "Некорректный статус.";
  if (input.guestsCount !== 1 && input.guestsCount !== 2) return "Некорректное количество гостей.";

  if (input.status === "yes" && input.guestsCount === 2 && !input.plusOneName) return "Укажите имя +1.";

  const allowedAlcohol = new Set([
    "wine_red",
    "wine_white",
    "champagne",
    "vodka",
    "whiskey",
    "cognac",
    "beer",
    "non_alcohol",
  ]);

  for (const c of input.alcoholChoices) {
    if (!allowedAlcohol.has(c)) return "Некорректные предпочтения по алкоголю.";
  }

  if (input.foodNotes && input.foodNotes.length > 600) return "Слишком длинное поле про еду/аллергии.";
  if (input.comment && input.comment.length > 600) return "Слишком длинный комментарий.";

  return "";
}

function toCsv(items) {
  const headers = [
    "createdAt",
    "fullName",
    "phoneOrTelegram",
    "status",
    "guestsCount",
    "plusOneName",
    "alcoholChoices",
    "foodNotes",
    "comment",
  ];

  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(",")];

  for (const r of items) {
    const row = [
      r.createdAt,
      r.fullName,
      r.phoneOrTelegram,
      r.status,
      r.guestsCount,
      r.plusOneName,
      (r.alcoholChoices || []).join("; "),
      r.foodNotes,
      r.comment,
    ];
    lines.push(row.map(escape).join(","));
  }

  return lines.join("\n");
}
