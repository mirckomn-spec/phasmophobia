import { NextResponse } from "next/server";
import { getPlayerStats, getStats, resetMatches } from "@/lib/db";

export async function POST() {
  try {
    await resetMatches();
    const [stats, players] = await Promise.all([getStats(), getPlayerStats()]);
    return NextResponse.json({ stats, players });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao resetar" },
      { status: 500 }
    );
  }
}
