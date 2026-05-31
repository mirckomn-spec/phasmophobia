import type { Match, PlayerStats, Stats } from "./types";
import { getPlayerTitle } from "./ranks";
import { buildStreakMap, getMatchPointsForPlayer } from "./scoring";

function computeStreaks(matches: Match[]) {
  const sorted = [...matches].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  let currentStreak = 0;
  for (const m of sorted) {
    if (m.won) currentStreak++;
    else break;
  }

  let bestStreak = 0;
  let temp = 0;
  const chronological = [...matches].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  for (const m of chronological) {
    if (m.won) {
      temp++;
      if (temp > bestStreak) bestStreak = temp;
    } else {
      temp = 0;
    }
  }

  return { currentStreak, bestStreak };
}

export function computeStats(matches: Match[], investigationMinutes: number): Stats {
  const wins = matches.filter((m) => m.won);
  const { currentStreak, bestStreak } = computeStreaks(matches);
  const ghostTypes = wins.map((m) => m.ghost_type).filter((g): g is string => Boolean(g));
  const total = matches.length;

  return {
    total_matches: total,
    total_victories: wins.length,
    total_losses: total - wins.length,
    current_streak: currentStreak,
    best_streak: bestStreak,
    total_ghosts_identified: new Set(ghostTypes).size,
    success_rate: total > 0 ? Math.round((wins.length / total) * 100) : 0,
    total_investigation_minutes: investigationMinutes,
    nightmare_wins: wins.filter((m) => m.difficulty === "Nightmare").length,
    insanity_wins: wins.filter((m) => m.difficulty === "Insanity").length,
  };
}

export function computePlayerStats(matches: Match[], player: "Naltic" | "Neat"): PlayerStats {
  const streakMap = buildStreakMap(matches);
  const chronological = [...matches].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  let totalPoints = 0;
  let totalWins = 0;
  let totalLosses = 0;
  let survivalCount = 0;
  let deathCount = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  for (const match of chronological) {
    const survived = player === "Naltic" ? match.naltic_survived : match.neat_survived;
    const streakAt = streakMap.get(match.id) ?? 0;
    totalPoints += getMatchPointsForPlayer(match, player, streakAt);

    if (match.won) {
      totalWins++;
      tempStreak++;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    } else {
      totalLosses++;
      tempStreak = 0;
    }

    if (survived) survivalCount++;
    else deathCount++;
  }

  const sorted = [...matches].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  let currentStreak = 0;
  for (const m of sorted) {
    if (m.won) currentStreak++;
    else break;
  }

  const played = survivalCount + deathCount;

  return {
    name: player,
    total_points: totalPoints,
    total_wins: totalWins,
    total_losses: totalLosses,
    survival_count: survivalCount,
    death_count: deathCount,
    survival_rate: played > 0 ? Math.round((survivalCount / played) * 100) : 0,
    current_streak: currentStreak,
    best_streak: bestStreak,
    rank_title: getPlayerTitle(currentStreak),
    peak_rank_title: getPlayerTitle(bestStreak),
  };
}

export function computeAllPlayerStats(matches: Match[]): PlayerStats[] {
  return [computePlayerStats(matches, "Naltic"), computePlayerStats(matches, "Neat")];
}
