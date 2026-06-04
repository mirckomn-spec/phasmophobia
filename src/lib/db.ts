import { ObjectId } from "mongodb";
import { computeAllPlayerStats, computeStats } from "./player-stats";
import { getDb } from "./mongodb";
import type { GhostEncounter, Match, PlayerStats, Stats } from "./types";

interface MatchDoc extends Omit<Match, "id"> {
  _id?: string;
  stats_epoch?: number;
}

interface SettingsDoc {
  _id: string;
  total_investigation_minutes: number;
  stats_epoch?: number;
}

async function getSettings(): Promise<SettingsDoc | null> {
  const db = await getDb();
  return db
    .collection<SettingsDoc>("settings")
    .findOne({ _id: "global" } as Record<string, string>);
}

async function getStatsEpoch(): Promise<number> {
  const settings = await getSettings();
  return settings?.stats_epoch ?? 0;
}

/** Nova época invalida partidas antigas nos cálculos, mesmo se ainda existirem no banco. */
async function bumpStatsEpoch(): Promise<number> {
  const db = await getDb();
  const result = await db.collection<SettingsDoc>("settings").findOneAndUpdate(
    { _id: "global" } as Record<string, string>,
    {
      $inc: { stats_epoch: 1 },
      $setOnInsert: { total_investigation_minutes: 0 },
    },
    { upsert: true, returnDocument: "after" }
  );
  return result?.stats_epoch ?? 1;
}

function matchEpochFilter(epoch: number) {
  if (epoch === 0) {
    return { $or: [{ stats_epoch: 0 }, { stats_epoch: { $exists: false } }] };
  }
  return { stats_epoch: epoch };
}

function docToMatch(doc: MatchDoc & { _id: { toString(): string } }): Match {
  return {
    id: doc._id.toString(),
    ghost_type: doc.ghost_type,
    difficulty: doc.difficulty,
    won: doc.won,
    naltic_survived: doc.naltic_survived,
    neat_survived: doc.neat_survived,
    created_at: doc.created_at,
  };
}

function computeEncounters(matches: Match[]): GhostEncounter[] {
  const map = new Map<string, number>();
  for (const m of matches) {
    if (!m.ghost_type) continue;
    map.set(m.ghost_type, (map.get(m.ghost_type) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([ghost_type, count]) => ({ ghost_type, count }))
    .sort((a, b) => b.count - a.count);
}

async function getInvestigationMinutes(): Promise<number> {
  const settings = await getSettings();
  return settings?.total_investigation_minutes ?? 0;
}

export async function getMatches(): Promise<Match[]> {
  const db = await getDb();
  const epoch = await getStatsEpoch();
  const docs = await db
    .collection<MatchDoc>("matches")
    .find(matchEpochFilter(epoch))
    .sort({ created_at: -1 })
    .toArray();

  return docs.map((doc) =>
    docToMatch(doc as MatchDoc & { _id: { toString(): string } })
  );
}

export async function getStats(): Promise<Stats> {
  const matches = await getMatches();
  const minutes = await getInvestigationMinutes();
  return computeStats(matches, minutes);
}

export async function getPlayerStats(): Promise<PlayerStats[]> {
  const matches = await getMatches();
  return computeAllPlayerStats(matches);
}

export async function getEncounters(): Promise<GhostEncounter[]> {
  const matches = await getMatches();
  return computeEncounters(matches);
}

export async function addMatch(payload: {
  ghost_type?: string;
  difficulty?: string;
  won: boolean;
  naltic_survived: boolean;
  neat_survived: boolean;
}): Promise<Match> {
  const db = await getDb();
  const epoch = await getStatsEpoch();
  const doc: MatchDoc = {
    ghost_type: payload.ghost_type ?? null,
    difficulty: payload.difficulty ?? null,
    won: payload.won,
    naltic_survived: payload.naltic_survived,
    neat_survived: payload.neat_survived,
    created_at: new Date().toISOString(),
    stats_epoch: epoch,
  };

  const result = await db.collection<MatchDoc>("matches").insertOne(doc);
  return { id: result.insertedId.toString(), ...doc };
}

export async function removeLastMatch(): Promise<Match | null> {
  const db = await getDb();
  const epoch = await getStatsEpoch();
  const last = await db
    .collection<MatchDoc & { _id: unknown }>("matches")
    .find(matchEpochFilter(epoch))
    .sort({ created_at: -1 })
    .limit(1)
    .next();

  if (!last || !last._id) return null;

  const objectId = new ObjectId(String(last._id));
  await db.collection("matches").deleteOne({ _id: objectId });
  return docToMatch(last as MatchDoc & { _id: { toString(): string } });
}

export async function resetMatches(): Promise<void> {
  const db = await getDb();
  await bumpStatsEpoch();
  await db.collection("matches").deleteMany({});
}

export async function updateMatchGhostType(
  matchId: string,
  ghostType: string
): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection("matches").updateOne(
    { _id: new ObjectId(matchId) },
    { $set: { ghost_type: ghostType } }
  );
  return result.modifiedCount > 0;
}

export async function updateMatchGhostByFilter(
  filter: { ghost_type: string; won?: boolean; created_at_contains?: string },
  newGhostType: string
): Promise<number> {
  const db = await getDb();
  const epoch = await getStatsEpoch();
  const docs = await db
    .collection<MatchDoc>("matches")
    .find({
      ...matchEpochFilter(epoch),
      ghost_type: filter.ghost_type,
      ...(filter.won !== undefined ? { won: filter.won } : {}),
    })
    .sort({ created_at: -1 })
    .toArray();

  const matches = docs.filter((doc) => {
    if (!filter.created_at_contains) return true;
    return doc.created_at?.includes(filter.created_at_contains);
  });

  if (matches.length === 0) return 0;

  const target = matches[0];
  if (!target._id) return 0;

  const result = await db.collection("matches").updateOne(
    { _id: new ObjectId(String(target._id)) },
    { $set: { ghost_type: newGhostType } }
  );
  return result.modifiedCount;
}

export async function addInvestigationMinutes(minutes: number): Promise<void> {
  const db = await getDb();
  await db.collection("settings").updateOne(
    { _id: "global" } as Record<string, string>,
    { $inc: { total_investigation_minutes: minutes } },
    { upsert: true }
  );
}
