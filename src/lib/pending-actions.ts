import { ObjectId } from "mongodb";
import { addMatch, removeLastMatch, resetMatches } from "./db";
import { getDb } from "./mongodb";
import type { MatchPayload, PendingAction, PendingActionType } from "./types";

interface PendingActionDoc {
  _id?: ObjectId;
  type: PendingActionType;
  payload: MatchPayload | null;
  requested_by: "naltic" | "neat";
  confirmations: ("naltic" | "neat")[];
  status: "pending" | "executed" | "cancelled";
  created_at: string;
}

function docToPending(doc: PendingActionDoc & { _id: ObjectId }): PendingAction {
  return {
    id: doc._id.toString(),
    type: doc.type,
    payload: doc.payload,
    requested_by: doc.requested_by,
    confirmations: doc.confirmations,
    status: doc.status,
    created_at: doc.created_at,
  };
}

async function executeAction(action: PendingActionDoc): Promise<void> {
  switch (action.type) {
    case "add_match":
      if (!action.payload) throw new Error("Payload da partida ausente");
      await addMatch({
        ghost_type: action.payload.ghost_type ?? undefined,
        difficulty: action.payload.difficulty ?? undefined,
        won: action.payload.won,
        naltic_survived: action.payload.naltic_survived,
        neat_survived: action.payload.neat_survived,
      });
      break;
    case "remove_last":
      await removeLastMatch();
      break;
    case "reset_all":
      await resetMatches();
      break;
    default:
      throw new Error("Tipo de ação inválido");
  }
}

export async function getActivePendingAction(): Promise<PendingAction | null> {
  const db = await getDb();
  const doc = await db
    .collection<PendingActionDoc>("pending_actions")
    .findOne({ status: "pending" }, { sort: { created_at: -1 } });

  if (!doc?._id) return null;
  return docToPending(doc as PendingActionDoc & { _id: ObjectId });
}

export async function createPendingAction(
  type: PendingActionType,
  requestedBy: "naltic" | "neat",
  payload: MatchPayload | null = null
): Promise<PendingAction> {
  const existing = await getActivePendingAction();
  if (existing) {
    throw new Error("Já existe uma ação aguardando confirmação dos dois operadores");
  }

  const db = await getDb();
  const doc: PendingActionDoc = {
    type,
    payload,
    requested_by: requestedBy,
    confirmations: [requestedBy],
    status: "pending",
    created_at: new Date().toISOString(),
  };

  const result = await db.collection<PendingActionDoc>("pending_actions").insertOne(doc);
  return docToPending({ ...doc, _id: result.insertedId });
}

export async function confirmPendingAction(
  actionId: string,
  username: "naltic" | "neat"
): Promise<{ executed: boolean; action: PendingAction | null }> {
  const db = await getDb();
  const collection = db.collection<PendingActionDoc>("pending_actions");
  const doc = await collection.findOne({
    _id: new ObjectId(actionId),
    status: "pending",
  });

  if (!doc?._id) {
    throw new Error("Ação pendente não encontrada ou já processada");
  }

  if (doc.confirmations.includes(username)) {
    throw new Error("Você já confirmou esta ação");
  }

  const confirmations = [...doc.confirmations, username];
  const bothConfirmed =
    confirmations.includes("naltic") && confirmations.includes("neat");

  if (!bothConfirmed) {
    await collection.updateOne(
      { _id: doc._id },
      { $set: { confirmations } }
    );
    return {
      executed: false,
      action: docToPending({ ...doc, confirmations, _id: doc._id }),
    };
  }

  await executeAction(doc);
  await collection.updateOne(
    { _id: doc._id },
    { $set: { confirmations, status: "executed" } }
  );

  return { executed: true, action: null };
}

export async function cancelPendingAction(
  actionId: string,
  username: "naltic" | "neat"
): Promise<void> {
  const db = await getDb();
  const doc = await db.collection<PendingActionDoc>("pending_actions").findOne({
    _id: new ObjectId(actionId),
    status: "pending",
  });

  if (!doc?._id) {
    throw new Error("Ação pendente não encontrada");
  }

  if (doc.requested_by !== username) {
    throw new Error("Somente quem propôs a ação pode cancelar");
  }

  await db.collection("pending_actions").updateOne(
    { _id: doc._id },
    { $set: { status: "cancelled" } }
  );
}
