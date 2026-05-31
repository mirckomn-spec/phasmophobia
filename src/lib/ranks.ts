export interface Rank {
  name: string;
  minStreak: number;
  color: string;
  image: string;
}

/** Patentes por streak de vitórias consecutivas (reseta ao perder). */
export const RANKS: Rank[] = [
  { name: "Recruta Paranormal", minStreak: 0, color: "#8A8A8A", image: "/ranks/01.png" },
  { name: "Investigador", minStreak: 5, color: "#5b9bd5", image: "/ranks/02.png" },
  { name: "Especialista", minStreak: 10, color: "#4ade80", image: "/ranks/03.png" },
  { name: "Veterano", minStreak: 20, color: "#22d3ee", image: "/ranks/04.png" },
  { name: "Elite", minStreak: 35, color: "#7c6aef", image: "/ranks/05.png" },
  { name: "Lenda", minStreak: 50, color: "#e879f9", image: "/ranks/06.png" },
  { name: "Mestre Paranormal", minStreak: 75, color: "#fbbf24", image: "/ranks/07.png" },
  { name: "Caçadores Supremos", minStreak: 100, color: "#fb923c", image: "/ranks/08.png" },
  { name: "Arquitetos do Sobrenatural", minStreak: 150, color: "#e85d75", image: "/ranks/09.png" },
  { name: "Lendário", minStreak: 200, color: "#FFFFFF", image: "/ranks/10.png" },
];

export function getRankIndexByStreak(streak: number): number {
  const s = Math.max(0, streak);
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (s >= RANKS[i].minStreak) index = i;
  }
  return index;
}

export function getRankByStreak(streak: number): Rank {
  return RANKS[getRankIndexByStreak(streak)];
}

export function getPlayerTitle(streak: number): string {
  return getRankByStreak(streak).name;
}

export function getNextRank(streak: number): Rank | null {
  const current = getRankIndexByStreak(streak);
  return current < RANKS.length - 1 ? RANKS[current + 1] : null;
}

export function getEliteClassification(streak: number): string {
  return getPlayerTitle(streak);
}

export type RankStatus = "current" | "achieved" | "locked";

export function getRankStatus(rankIndex: number, playerIndex: number): RankStatus {
  if (rankIndex === playerIndex) return "current";
  if (rankIndex < playerIndex) return "achieved";
  return "locked";
}

export function isRankUnlocked(rank: Rank, bestStreak: number): boolean {
  return bestStreak >= rank.minStreak;
}

export interface RankProgress {
  progress: number;
  currentRank: Rank;
  peakRank: Rank;
  nextRank: Rank | null;
  streakToNext: number;
  streakInTier: number;
  streakNeededInTier: number;
  isMaxRank: boolean;
}

/** Progresso de promoção baseado no streak ATUAL (reseta ao perder). */
export function getRankProgress(currentStreak: number, bestStreak: number): RankProgress {
  const streak = Math.max(0, currentStreak);
  const currentIndex = getRankIndexByStreak(streak);
  const currentRank = RANKS[currentIndex];
  const peakRank = getRankByStreak(bestStreak);
  const nextRank = RANKS[currentIndex + 1] ?? null;

  if (!nextRank) {
    return {
      progress: 100,
      currentRank,
      peakRank,
      nextRank: null,
      streakToNext: 0,
      streakInTier: streak - currentRank.minStreak,
      streakNeededInTier: 0,
      isMaxRank: true,
    };
  }

  const streakRange = nextRank.minStreak - currentRank.minStreak;
  const streakInTier = streak - currentRank.minStreak;
  const progress =
    streakRange > 0
      ? Math.min(100, Math.max(0, (streakInTier / streakRange) * 100))
      : 0;

  return {
    progress,
    currentRank,
    peakRank,
    nextRank,
    streakToNext: Math.max(0, nextRank.minStreak - streak),
    streakInTier: Math.max(0, streakInTier),
    streakNeededInTier: streakRange,
    isMaxRank: false,
  };
}
