import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStats, getPlayerStats, getMatches } from "@/lib/db";
import { confirmPendingAction } from "@/lib/pending-actions";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const result = await confirmPendingAction(id, session.username);

    const [stats, players, matches] = await Promise.all([
      getStats(),
      getPlayerStats(),
      getMatches(),
    ]);

    return NextResponse.json({
      executed: result.executed,
      pending: result.action,
      stats,
      players,
      matches,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao confirmar ação" },
      { status: 400 }
    );
  }
}
