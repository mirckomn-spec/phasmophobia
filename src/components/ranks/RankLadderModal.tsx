"use client";

import Image from "next/image";
import { useEffect } from "react";
import { RANKS, getRankIndexByStreak } from "@/lib/ranks";
import { INVESTIGATOR_AVATARS } from "@/lib/investigators";
import type { AuthUser } from "@/lib/auth";
import type { PlayerStats } from "@/lib/types";

interface RankLadderModalProps {
  open: boolean;
  onClose: () => void;
  players: PlayerStats[];
  session: AuthUser | null;
}

export function RankLadderModal({ open, onClose, players, session }: RankLadderModalProps) {
  const naltic = players.find((p) => p.name === "Naltic")!;
  const neat = players.find((p) => p.name === "Neat")!;
  const nalticCurrent = getRankIndexByStreak(naltic.current_streak);
  const neatCurrent = getRankIndexByStreak(neat.current_streak);
  const nalticPeak = getRankIndexByStreak(naltic.best_streak);
  const neatPeak = getRankIndexByStreak(neat.best_streak);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fechar"
      />

      <aside className="relative flex h-full w-full max-w-2xl flex-col border-l border-[#171717] bg-[#0A0A0A] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#171717] px-8 py-6">
          <div>
            <p className="label text-[#7c6aef]">Progressão completa</p>
            <h2 className="font-heading text-xl text-white">Escada de Títulos</h2>
            <p className="mt-1 font-body text-xs text-[#8A8A8A]">
              Só sobe com vitórias seguidas · Perdeu = volta ao zero
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="label border border-[#171717] px-4 py-2 text-[#8A8A8A] transition-colors hover:border-[#8A8A8A] hover:text-white"
          >
            Fechar
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="space-y-0">
            {[...RANKS].reverse().map((rank, revI) => {
              const i = RANKS.length - 1 - revI;
              const nalticCurrentHere = nalticCurrent === i;
              const neatCurrentHere = neatCurrent === i;
              const nalticPeakHere = nalticPeak === i && nalticPeak !== nalticCurrent;
              const neatPeakHere = neatPeak === i && neatPeak !== neatCurrent;
              const isYouHere =
                (session?.playerKey === "Naltic" && nalticCurrentHere) ||
                (session?.playerKey === "Neat" && neatCurrentHere);

              return (
                <div
                  key={rank.name}
                  className="relative border-l-2 pl-8 pb-10 last:pb-0"
                  style={{ borderColor: isYouHere ? rank.color : "#171717" }}
                >
                  <div
                    className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 bg-black"
                    style={{
                      borderColor:
                        nalticCurrentHere || neatCurrentHere ? rank.color : "#171717",
                      backgroundColor:
                        nalticCurrentHere || neatCurrentHere ? `${rank.color}33` : "#0A0A0A",
                    }}
                  />

                  <div
                    className="rounded border p-5 transition-colors"
                    style={{
                      borderColor: isYouHere ? `${rank.color}66` : "#171717",
                      backgroundColor: isYouHere ? `${rank.color}0A` : "transparent",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative h-16 w-16 shrink-0">
                        <Image
                          src={rank.image}
                          alt={rank.name}
                          fill
                          className="object-contain"
                          sizes="64px"
                          unoptimized={/\.(png|jpe?g)$/i.test(rank.image)}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="label">{String(i + 1).padStart(2, "0")}</p>
                        <h3 className="font-heading text-base" style={{ color: rank.color }}>
                          {rank.name}
                        </h3>
                        <p className="mt-1 font-body text-xs text-[#8A8A8A]">
                          {rank.minStreak} vitórias seguidas
                        </p>
                      </div>
                    </div>

                    {(nalticCurrentHere ||
                      neatCurrentHere ||
                      nalticPeakHere ||
                      neatPeakHere) && (
                      <div className="mt-4 flex flex-wrap gap-3 border-t border-[#171717] pt-4">
                        {nalticCurrentHere && (
                          <InvestigatorPin
                            name="Naltic"
                            avatar={INVESTIGATOR_AVATARS.Naltic}
                            color={rank.color}
                            isYou={session?.playerKey === "Naltic"}
                            label="atual"
                          />
                        )}
                        {neatCurrentHere && (
                          <InvestigatorPin
                            name="Neat"
                            avatar={INVESTIGATOR_AVATARS.Neat}
                            color={rank.color}
                            isYou={session?.playerKey === "Neat"}
                            label="atual"
                          />
                        )}
                        {nalticPeakHere && (
                          <InvestigatorPin
                            name="Naltic"
                            avatar={INVESTIGATOR_AVATARS.Naltic}
                            color={rank.color}
                            isYou={session?.playerKey === "Naltic"}
                            label="peak"
                          />
                        )}
                        {neatPeakHere && (
                          <InvestigatorPin
                            name="Neat"
                            avatar={INVESTIGATOR_AVATARS.Neat}
                            color={rank.color}
                            isYou={session?.playerKey === "Neat"}
                            label="peak"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}

function InvestigatorPin({
  name,
  avatar,
  color,
  isYou,
  label,
}: {
  name: string;
  avatar: string;
  color: string;
  isYou?: boolean;
  label: "atual" | "peak";
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-3"
      style={{
        borderColor: isYou ? color : "#171717",
        backgroundColor: isYou ? `${color}15` : "#111",
        borderStyle: label === "peak" ? "dashed" : "solid",
      }}
    >
      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[#171717]">
        <Image src={avatar} alt={name} fill className="object-cover grayscale" sizes="32px" />
      </div>
      <span className="font-body text-xs text-[#D9D9D9]">
        {name}
        {isYou && <span style={{ color }}> · você</span>}
        <span className="text-[#8A8A8A]"> · {label}</span>
      </span>
    </div>
  );
}
