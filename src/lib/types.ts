export interface Match {
  id: string;
  ghost_type: string | null;
  difficulty: string | null;
  won: boolean;
  naltic_survived: boolean;
  neat_survived: boolean;
  created_at: string;
}

export interface Stats {
  total_matches: number;
  total_victories: number;
  total_losses: number;
  current_streak: number;
  best_streak: number;
  total_ghosts_identified: number;
  success_rate: number;
  total_investigation_minutes: number;
  nightmare_wins: number;
  insanity_wins: number;
}

export interface PlayerStats {
  name: "Naltic" | "Neat";
  total_points: number;
  total_wins: number;
  total_losses: number;
  survival_count: number;
  death_count: number;
  survival_rate: number;
  current_streak: number;
  best_streak: number;
  rank_title: string;
  peak_rank_title: string;
}

export interface GhostEncounter {
  ghost_type: string;
  count: number;
}

export interface Ghost {
  id: string;
  name: string;
  description: string;
  evidence: string[];
  forcedEvidence?: string;
  speed: string;
  huntSanity: string;
  strengths: string[];
  weaknesses: string[];
  specialBehaviors: string[];
  huntTest: string;
  abilityChance: string;
  identificationStrategies: string[];
  advancedTips: string[];
}

export type Difficulty =
  | "Amateur"
  | "Intermediate"
  | "Professional"
  | "Nightmare"
  | "Insanity";

export type PlayerName = "Naltic" | "Neat";

export type PendingActionType = "add_match" | "remove_last" | "reset_all";

export interface MatchPayload {
  ghost_type: string | null;
  difficulty: string | null;
  won: boolean;
  naltic_survived: boolean;
  neat_survived: boolean;
}

export interface PendingAction {
  id: string;
  type: PendingActionType;
  payload: MatchPayload | null;
  requested_by: "naltic" | "neat";
  confirmations: ("naltic" | "neat")[];
  status: "pending" | "executed" | "cancelled";
  created_at: string;
}
