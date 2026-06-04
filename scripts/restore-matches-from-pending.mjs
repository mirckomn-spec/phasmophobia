import { readFileSync } from "fs";
import { MongoClient } from "mongodb";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const content = readFileSync(join(root, ".env.local"), "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI não definida");
  process.exit(1);
}
const dbName = process.env.MONGODB_DB ?? "nn_investigation";

/** Reset acidental — restaurar estado imediatamente anterior */
const ACCIDENTAL_RESET_AT = "2026-06-03T22:43:22.098Z";

/** Spirit 31/05 04:34 BRT → Kormos */
const KORMOS_AT = "2026-05-31T07:34:23.979Z";

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);

  const actions = await db
    .collection("pending_actions")
    .find({ status: "executed" })
    .sort({ created_at: 1 })
    .toArray();

  let matches = [];

  for (const action of actions) {
    if (
      action.type === "reset_all" &&
      action.created_at === ACCIDENTAL_RESET_AT
    ) {
      break;
    }

    switch (action.type) {
      case "reset_all":
        matches = [];
        break;
      case "remove_last":
        matches.pop();
        break;
      case "add_match": {
        const p = action.payload;
        let ghostType = p.ghost_type;
        if (action.created_at === KORMOS_AT && ghostType === "Spirit") {
          ghostType = "Kormos";
        }
        matches.push({
          ghost_type: ghostType,
          difficulty: p.difficulty,
          won: p.won,
          naltic_survived: p.naltic_survived,
          neat_survived: p.neat_survived,
          created_at: action.created_at,
        });
        break;
      }
    }
  }

  await db.collection("matches").deleteMany({});
  if (matches.length > 0) {
    await db.collection("matches").insertMany(matches);
  }

  await db.collection("pending_actions").deleteMany({ status: "pending" });

  console.log(`Restauradas ${matches.length} partidas (estado antes do reset acidental).`);
  matches.forEach((m, i) => {
    console.log(
      `  ${i + 1}. ${m.created_at} · ${m.ghost_type} · N${m.naltic_survived ? "v" : "m"} Ne${m.neat_survived ? "v" : "m"}`
    );
  });
} finally {
  await client.close();
}
