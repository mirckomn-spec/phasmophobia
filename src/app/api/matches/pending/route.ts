import {
  cancelPendingAction,
  createPendingAction,
  getActivePendingAction,
} from "@/lib/pending-actions";
import type { MatchPayload, PendingActionType } from "@/lib/types";
import { apiError, apiJson, handleApiFailure, requireApiSession } from "@/lib/api-security";

export async function GET() {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  try {
    const pending = await getActivePendingAction();
    return apiJson({ pending });
  } catch (error) {
    return handleApiFailure(error, "Não foi possível carregar pendências.");
  }
}

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return apiError("Dados inválidos", 400);
    }

    const type = body.type as PendingActionType;
    if (!["add_match", "remove_last", "reset_all"].includes(type)) {
      return apiError("Tipo de ação inválido", 400);
    }

    let payload: MatchPayload | null = null;
    if (type === "add_match") {
      payload = {
        ghost_type: typeof body.ghost_type === "string" ? body.ghost_type : null,
        difficulty: typeof body.difficulty === "string" ? body.difficulty : null,
        won: Boolean(body.won),
        naltic_survived: Boolean(body.naltic_survived),
        neat_survived: Boolean(body.neat_survived),
      };
    }

    const pending = await createPendingAction(type, auth.session.username, payload);
    return apiJson({ pending });
  } catch (error) {
    if (error instanceof Error && error.message.includes("aguardando confirmação")) {
      return apiError(error.message, 409);
    }
    return handleApiFailure(error, "Não foi possível propor a ação.");
  }
}

export async function DELETE(request: Request) {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return apiError("ID da ação é obrigatório", 400);
    }

    await cancelPendingAction(id, auth.session.username);
    return apiJson({ ok: true });
  } catch (error) {
    if (error instanceof Error) {
      return apiError(error.message, 400);
    }
    return handleApiFailure(error, "Não foi possível cancelar a ação.");
  }
}
