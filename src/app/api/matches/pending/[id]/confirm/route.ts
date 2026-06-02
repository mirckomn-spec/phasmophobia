import { getMatches, getPlayerStats, getStats } from "@/lib/db";
import { confirmPendingAction } from "@/lib/pending-actions";
import { apiError, apiJson, handleApiFailure, requireApiSession } from "@/lib/api-security";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    if (!id || id.length > 64) {
      return apiError("Identificador inválido", 400);
    }

    const result = await confirmPendingAction(id, auth.session.username);

    const [stats, players, matches] = await Promise.all([
      getStats(),
      getPlayerStats(),
      getMatches(),
    ]);

    return apiJson({
      executed: result.executed,
      pending: result.action,
      stats,
      players,
      matches,
    });
  } catch (error) {
    if (error instanceof Error) {
      return apiError(error.message, 400);
    }
    return handleApiFailure(error, "Não foi possível confirmar a ação.");
  }
}
