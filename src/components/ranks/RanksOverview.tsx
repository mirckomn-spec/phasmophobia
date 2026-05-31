"use client";

import { useState } from "react";
import type { AuthUser } from "@/lib/auth";
import type { PlayerStats } from "@/lib/types";
import { RankHero } from "./RankHero";
import { RankLadderModal } from "./RankLadderModal";

interface RanksOverviewProps {
  players: PlayerStats[];
  session: AuthUser | null;
}

export function RanksOverview({ players, session }: RanksOverviewProps) {
  const [ladderOpen, setLadderOpen] = useState(false);
  const naltic = players.find((p) => p.name === "Naltic")!;
  const neat = players.find((p) => p.name === "Neat")!;
  const you = session
    ? players.find((p) => p.name === session.playerKey)
    : null;
  const partner = session
    ? players.find((p) => p.name !== session.playerKey)
    : null;

  return (
    <>
      <div className="space-y-10">
        {you ? (
          <>
            <RankHero player={you} isYou />
            {partner && (
              <div className="opacity-80">
                <p className="label mb-4">Parceiro de operação</p>
                <RankHero player={partner} />
              </div>
            )}
          </>
        ) : (
          <div className="grid gap-8 xl:grid-cols-2">
            <RankHero player={naltic} />
            <RankHero player={neat} />
          </div>
        )}

        <div className="flex justify-center border-t border-[#171717] pt-10">
          <button
            type="button"
            onClick={() => setLadderOpen(true)}
            className="border border-[#7c6aef] bg-[#7c6aef]/10 px-8 py-3 font-body text-xs uppercase tracking-widest text-[#c4b5fd] transition-all hover:bg-[#7c6aef]/20"
          >
            Ver todos os ranks
          </button>
        </div>
      </div>

      <RankLadderModal
        open={ladderOpen}
        onClose={() => setLadderOpen(false)}
        players={players}
        session={session}
      />
    </>
  );
}
