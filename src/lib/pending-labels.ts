import type { PendingAction } from "./types";

export function describePendingAction(action: PendingAction): string {
  switch (action.type) {
    case "add_match": {
      const p = action.payload;
      if (!p) return "Registrar partida";
      const result = p.won ? "Vitória" : "Derrota";
      const ghost = p.ghost_type ? ` · ${p.ghost_type}` : "";
      return `Registrar ${result}${ghost}`;
    }
    case "remove_last":
      return "Remover última partida";
    case "reset_all":
      return "Resetar todo o histórico";
    default:
      return "Ação pendente";
  }
}

export function partnerUsername(username: "naltic" | "neat"): "naltic" | "neat" {
  return username === "naltic" ? "neat" : "naltic";
}

export function displayNameFor(username: "naltic" | "neat"): string {
  return username === "naltic" ? "Naltic" : "Neat";
}
