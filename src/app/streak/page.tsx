import { MatchManager } from "@/components/matches/MatchManager";
import { PageShell } from "@/components/layout/PageShell";
import { getSession } from "@/lib/auth";
import { getMatches, getPlayerStats, getStats } from "@/lib/db";
import { getActivePendingAction } from "@/lib/pending-actions";
import { redirect } from "next/navigation";

export default async function StreakPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [stats, matches, players, pending] = await Promise.all([
    getStats(),
    getMatches(),
    getPlayerStats(),
    getActivePendingAction(),
  ]);

  return (
    <PageShell
      label="Registro Operacional"
      title="Win Streak"
      description="Registre partidas com confirmação dupla — Naltic e Neat precisam aprovar cada ação."
      wide
    >
      <MatchManager
        initialStats={stats}
        initialMatches={matches}
        initialPlayers={players}
        initialPending={pending}
        session={session}
      />
    </PageShell>
  );
}
