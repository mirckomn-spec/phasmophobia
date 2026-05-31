import { RanksOverview } from "@/components/ranks/RanksOverview";
import { PageShell } from "@/components/layout/PageShell";
import { getSession } from "@/lib/auth";
import { getPlayerStats } from "@/lib/db";

export default async function RanksPage() {
  const [players, session] = await Promise.all([getPlayerStats(), getSession()]);

  return (
    <PageShell
      label="Classificação"
      title="Ranks"
      description={
        session
          ? `${session.displayName}, seu cargo depende do streak atual. Perdeu uma partida? Volta ao zero — mas o peak rating guarda seu recorde.`
          : "Patentes por vitórias seguidas. Perdeu = reseta. Peak rating = melhor streak já alcançado."
      }
      wide
    >
      <RanksOverview players={players} session={session} />
    </PageShell>
  );
}
