import { NextResponse } from "next/server";
import {
  getEncounters,
  getMatches,
  getPlayerStats,
  getStats,
} from "@/lib/db";
import { getActivePendingAction } from "@/lib/pending-actions";

export async function GET() {
  try {
    const [matches, stats, players, encounters, pending] = await Promise.all([
      getMatches(),
      getStats(),
      getPlayerStats(),
      getEncounters(),
      getActivePendingAction(),
    ]);
    return NextResponse.json({ matches, stats, players, encounters, pending });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Registro direto desativado. Proponha a partida e aguarde confirmação de Naltic e Neat.",
    },
    { status: 403 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      error:
        "Remoção direta desativada. Proponha a remoção e aguarde confirmação de Naltic e Neat.",
    },
    { status: 403 }
  );
}
