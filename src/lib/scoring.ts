import type { Match } from "./types";

/** Morto na partida recebe 40% do que o sobrevivente ganharia (60% a menos). */
export const DEATH_POINT_MULTIPLIER = 0.4;

export const POINTS = {
  WIN: 14,
  SURVIVAL_ON_WIN: 5,
  LOSS_DEATH: -20,
  LOSS_SURVIVED: -12,
  STREAK_BONUS: 2,
} as const;

function computeWinPoints(streakAtMatch: number, survived: boolean): number {
  let full = POINTS.WIN + POINTS.SURVIVAL_ON_WIN;
  if (streakAtMatch > 1) {
    full += (streakAtMatch - 1) * POINTS.STREAK_BONUS;
  }

  if (survived) return full;

  return Math.max(1, Math.round(full * DEATH_POINT_MULTIPLIER));
}

export function calculateMatchPoints(
  won: boolean,
  survived: boolean,
  streakAtMatch: number
): number {
  if (won) {
    return computeWinPoints(streakAtMatch, survived);
  }

  if (!survived) return POINTS.LOSS_DEATH;
  return POINTS.LOSS_SURVIVED;
}

/** Pontos que o jogador vivo teria na mesma partida (para comparação). */
export function calculateSurvivorEquivalentPoints(
  won: boolean,
  streakAtMatch: number
): number {
  if (won) return computeWinPoints(streakAtMatch, true);
  return POINTS.LOSS_SURVIVED;
}

export function buildStreakMap(matches: Match[]): Map<string, number> {
  const chronological = [...matches].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const streakAtMatch = new Map<string, number>();
  let streak = 0;

  for (const match of chronological) {
    if (match.won) {
      streak++;
      streakAtMatch.set(match.id, streak);
    } else {
      streakAtMatch.set(match.id, 0);
      streak = 0;
    }
  }

  return streakAtMatch;
}

export function getMatchPointsForPlayer(
  match: Match,
  player: "Naltic" | "Neat",
  streakAtMatch: number
): number {
  const survived = player === "Naltic" ? match.naltic_survived : match.neat_survived;
  return calculateMatchPoints(match.won, survived, streakAtMatch);
}

export function describePointChange(
  won: boolean,
  survived: boolean,
  streakAtMatch = 1
): string {
  const pts = calculateMatchPoints(won, survived, streakAtMatch);
  return pts >= 0 ? `+${pts} pts` : `${pts} pts`;
}
