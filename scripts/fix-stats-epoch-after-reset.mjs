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

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);

  const lastReset = await db
    .collection("pending_actions")
    .find({ type: "reset_all", status: "executed" })
    .sort({ created_at: -1 })
    .limit(1)
    .next();

  if (!lastReset) {
    console.log("Nenhum reset executado encontrado — nada a corrigir.");
    process.exit(0);
  }

  const resetAt = lastReset.created_at;
  console.log("Último reset:", resetAt);

  const settings = await db.collection("settings").findOne({ _id: "global" });
  const currentEpoch = settings?.stats_epoch ?? 0;

  const postResetCount = await db.collection("matches").countDocuments({
    created_at: { $gt: resetAt },
  });

  if (postResetCount === 0 && currentEpoch === 0) {
    console.log("Sem partidas pós-reset — época já consistente.");
    process.exit(0);
  }

  const newEpoch = Math.max(currentEpoch, 1);

  await db.collection("settings").updateOne(
    { _id: "global" },
    {
      $set: { stats_epoch: newEpoch },
      $setOnInsert: { total_investigation_minutes: 0 },
    },
    { upsert: true }
  );

  const taggedAfter = await db.collection("matches").updateMany(
    { created_at: { $gt: resetAt } },
    { $set: { stats_epoch: newEpoch } }
  );

  const taggedBefore = await db.collection("matches").updateMany(
    {
      created_at: { $lte: resetAt },
      $or: [{ stats_epoch: { $exists: false } }, { stats_epoch: newEpoch }],
    },
    { $set: { stats_epoch: newEpoch - 1 } }
  );

  const active = await db.collection("matches").countDocuments({ stats_epoch: newEpoch });

  console.log(`Época atual: ${newEpoch}`);
  console.log(`Partidas ativas (pós-reset): ${active}`);
  console.log(`Marcadas pós-reset: ${taggedAfter.modifiedCount}`);
  console.log(`Arquivadas pré-reset: ${taggedBefore.modifiedCount}`);
} finally {
  await client.close();
}
