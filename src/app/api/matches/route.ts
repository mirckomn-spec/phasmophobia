import {
  getEncounters,
  getMatches,
  getPlayerStats,
  getStats,
} from "@/lib/db";
import { getActivePendingAction } from "@/lib/pending-actions";
import { apiError, apiJson, handleApiFailure, requireApiSession } from "@/lib/api-security";

export async function GET() {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  try {
    const [matches, stats, players, encounters, pending] = await Promise.all([
      getMatches(),
      getStats(),
      getPlayerStats(),
      getEncounters(),
      getActivePendingAction(),
    ]);
    return apiJson({ matches, stats, players, encounters, pending });
  } catch (error) {
    return handleApiFailure(error, "Não foi possível carregar os dados.");
  }
}

export async function POST() {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  return apiError(
    "Use o fluxo de proposta com confirmação dupla para registrar partidas.",
    403
  );
}

export async function DELETE() {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  return apiError(
    "Use o fluxo de proposta com confirmação dupla para remover partidas.",
    403
  );
}
