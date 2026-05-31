import { NextResponse } from "next/server";
import { addMatch, getEncounters, getMatches, getPlayerStats, getStats, removeLastMatch } from "@/lib/db";

export async function GET() {
  try {
    const [matches, stats, players, encounters] = await Promise.all([
      getMatches(),
      getStats(),
      getPlayerStats(),
      getEncounters(),
    ]);
    return NextResponse.json({ matches, stats, players, encounters, victories: matches });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const match = await addMatch({
      ghost_type: body.ghost_type,
      difficulty: body.difficulty,
      won: body.won !== undefined ? Boolean(body.won) : true,
      naltic_survived: body.naltic_survived !== undefined ? Boolean(body.naltic_survived) : true,
      neat_survived: body.neat_survived !== undefined ? Boolean(body.neat_survived) : true,
    });
    const [stats, players] = await Promise.all([getStats(), getPlayerStats()]);
    return NextResponse.json({ match, victory: match, stats, players });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao registrar" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const removed = await removeLastMatch();
    const [stats, players] = await Promise.all([getStats(), getPlayerStats()]);
    return NextResponse.json({ removed, stats, players });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao remover" },
      { status: 500 }
    );
  }
}
