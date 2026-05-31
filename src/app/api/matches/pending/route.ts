import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  cancelPendingAction,
  confirmPendingAction,
  createPendingAction,
  getActivePendingAction,
} from "@/lib/pending-actions";
import type { MatchPayload, PendingActionType } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const pending = await getActivePendingAction();
    return NextResponse.json({ pending });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao buscar pendências" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const type = body.type as PendingActionType;

    if (!["add_match", "remove_last", "reset_all"].includes(type)) {
      return NextResponse.json({ error: "Tipo de ação inválido" }, { status: 400 });
    }

    let payload: MatchPayload | null = null;
    if (type === "add_match") {
      payload = {
        ghost_type: body.ghost_type ?? null,
        difficulty: body.difficulty ?? null,
        won: Boolean(body.won),
        naltic_survived: Boolean(body.naltic_survived),
        neat_survived: Boolean(body.neat_survived),
      };
    }

    const pending = await createPendingAction(type, session.username, payload);
    return NextResponse.json({ pending });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao propor ação" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID da ação é obrigatório" }, { status: 400 });
    }

    await cancelPendingAction(id, session.username);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao cancelar ação" },
      { status: 400 }
    );
  }
}
