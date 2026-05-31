import { readFileSync } from "fs";
import { MongoClient, ObjectId } from "mongodb";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  try {
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
  } catch {
    console.error("Arquivo .env.local não encontrado");
    process.exit(1);
  }
}

loadEnv();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "nn_investigation";

if (!uri) {
  console.error("MONGODB_URI não definida");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("matches");

  const candidates = await collection
    .find({ ghost_type: "Spirit", won: true })
    .sort({ created_at: -1 })
    .toArray();

  const target =
    candidates.find((m) => m.created_at?.includes("2026-05-31T04:34")) ??
    candidates.find((m) => m.created_at?.includes("2026-05-31T07:34")) ??
    candidates[0];

  if (!target) {
    console.log("Nenhuma partida Spirit encontrada para atualizar.");
    process.exit(0);
  }

  const result = await collection.updateOne(
    { _id: target._id },
    { $set: { ghost_type: "Kormos" } }
  );

  console.log(
    result.modifiedCount
      ? `Partida ${target._id} atualizada: Spirit → Kormos (${target.created_at})`
      : "Nenhuma alteração feita."
  );
} finally {
  await client.close();
}
