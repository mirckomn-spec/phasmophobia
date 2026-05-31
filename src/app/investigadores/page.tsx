import { InvestigatorProfileCard } from "@/components/investigators/InvestigatorProfileCard";
import { PageShell } from "@/components/layout/PageShell";
import { ACHIEVEMENTS, getUnlockedAchievements } from "@/lib/achievements";
import { INVESTIGATOR_AVATARS, INVESTIGATOR_SPECIALTY } from "@/lib/investigators";
import { getSession } from "@/lib/auth";
import { getMatches, getPlayerStats, getStats } from "@/lib/db";
import type { AchievementContext } from "@/lib/achievements";

export default async function InvestigadoresPage() {
  const [stats, matches, players, session] = await Promise.all([
    getStats(),
    getMatches(),
    getPlayerStats(),
    getSession(),
  ]);

  const ghostTypes = new Set(
    matches.filter((m) => m.won).map((m) => m.ghost_type).filter(Boolean)
  );

  const ctx: AchievementContext = {
    totalVictories: stats.total_victories,
    currentStreak: stats.current_streak,
    bestStreak: stats.best_streak,
    nightmareWins: stats.nightmare_wins,
    insanityWins: stats.insanity_wins,
    uniqueGhostsIdentified: ghostTypes.size,
  };

  const unlocked = getUnlockedAchievements(ctx);
  const naltic = players.find((p) => p.name === "Naltic")!;
  const neat = players.find((p) => p.name === "Neat")!;

  return (
    <PageShell
      label="Dossiê Classificado"
      title="Investigadores de Elite"
      description="Perfis operacionais com patente por streak, peak rating e histórico da dupla."
      wide
    >
      <div className="space-y-10">
        <InvestigatorProfileCard
          player={naltic}
          avatar={INVESTIGATOR_AVATARS.Naltic}
          specialty={INVESTIGATOR_SPECIALTY.Naltic}
          highlight={session?.playerKey === "Naltic"}
        />
        <InvestigatorProfileCard
          player={neat}
          avatar={INVESTIGATOR_AVATARS.Neat}
          specialty={INVESTIGATOR_SPECIALTY.Neat}
          highlight={session?.playerKey === "Neat"}
        />
      </div>

      <section className="mt-16 border-t border-[#171717] pt-12">
        <h2 className="font-heading text-lg text-white">Conquistas</h2>
        <p className="mt-2 font-body text-sm text-[#8A8A8A]">
          {unlocked.length} de {ACHIEVEMENTS.length} registradas
        </p>

        <div className="mt-8 grid gap-0 lg:grid-cols-2 lg:gap-x-12">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = unlocked.some((u) => u.id === a.id);
            return (
              <div
                key={a.id}
                className={`flex items-start justify-between border-b border-[#171717] py-4 ${isUnlocked ? "" : "opacity-30"}`}
              >
                <div>
                  <p className="font-heading text-sm text-[#D9D9D9]">{a.name}</p>
                  <p className="mt-1 font-body text-xs text-[#8A8A8A]">{a.description}</p>
                </div>
                <span className="label shrink-0 pl-4">
                  {isUnlocked ? "Registrada" : "Pendente"}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
