"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { GHOSTS } from "@/data/ghosts";
import { POINTS } from "@/lib/scoring";
import { getRankProgress } from "@/lib/ranks";
import {
  describePendingAction,
  displayNameFor,
  partnerUsername,
} from "@/lib/pending-labels";
import type { AuthUser } from "@/lib/auth";
import type { Match, PendingAction, PlayerStats, Stats } from "@/lib/types";
import { RankProgressBar } from "@/components/ranks/RankProgressBar";

interface MatchManagerProps {
  initialStats: Stats;
  initialMatches: Match[];
  initialPlayers: PlayerStats[];
  initialPending: PendingAction | null;
  session: AuthUser;
}

function Toggle({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border px-4 py-2.5 font-body text-xs uppercase tracking-widest transition-opacity disabled:opacity-30 ${
        active
          ? "border-white text-white"
          : "border-[#171717] text-[#8A8A8A] hover:text-[#D9D9D9]"
      }`}
    >
      {children}
    </button>
  );
}

export function MatchManager({
  initialStats,
  initialMatches,
  initialPlayers,
  initialPending,
  session,
}: MatchManagerProps) {
  const [stats, setStats] = useState(initialStats);
  const [matches, setMatches] = useState(initialMatches);
  const [players, setPlayers] = useState(initialPlayers);
  const [pending, setPending] = useState<PendingAction | null>(initialPending);
  const [ghostType, setGhostType] = useState("");
  const [difficulty, setDifficulty] = useState("Professional");
  const [won, setWon] = useState(true);
  const [nalticSurvived, setNalticSurvived] = useState(true);
  const [neatSurvived, setNeatSurvived] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/matches", { credentials: "same-origin" });
    if (!res.ok) return;
    const data = await res.json();
    if (!data.stats) return;
    setStats(data.stats);
    setMatches(data.matches);
    setPlayers(data.players);
    setPending(data.pending ?? null);
  }, []);

  const readApiError = (data: { error?: string }, status: number) => {
    if (status === 401) return "Sessão expirada. Faça login novamente.";
    if (status >= 500) return "Erro no servidor. Tente novamente.";
    if (typeof data.error === "string" && data.error.length < 120) return data.error;
    return "Não foi possível concluir a ação.";
  };

  useEffect(() => {
    const interval = setInterval(refresh, 4000);
    return () => clearInterval(interval);
  }, [refresh]);

  const proposeAction = async (
    type: PendingAction["type"],
    payload?: Record<string, unknown>
  ) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/matches/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ type, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(readApiError(data, res.status));
        return;
      }
      setPending(data.pending);
      setMessage("Você confirmou. Aguardando confirmação do parceiro.");
    } catch {
      setMessage("Não foi possível propor a ação.");
    } finally {
      setLoading(false);
    }
  };

  const confirmPending = async () => {
    if (!pending) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/matches/pending/${pending.id}/confirm`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(readApiError(data, res.status));
        return;
      }

      if (data.executed) {
        setStats(data.stats);
        setMatches(data.matches);
        setPlayers(data.players);
        setPending(null);
        setMessage("Ação confirmada pelos dois — executada com sucesso.");
      } else {
        setPending(data.pending);
        setMessage("Você confirmou. Aguardando confirmação do parceiro.");
      }
    } catch {
      setMessage("Não foi possível confirmar a ação.");
    } finally {
      setLoading(false);
    }
  };

  const cancelPending = async () => {
    if (!pending) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/matches/pending?id=${pending.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(readApiError(data, res.status));
        return;
      }
      setPending(null);
      setMessage("Proposta cancelada.");
    } catch {
      setMessage("Não foi possível cancelar a ação.");
    } finally {
      setLoading(false);
    }
  };

  const hasConfirmed = pending?.confirmations.includes(session.username) ?? false;
  const needsMyConfirm = pending && !hasConfirmed;
  const partner = partnerUsername(session.username);
  const partnerConfirmed = pending?.confirmations.includes(partner) ?? false;
  const actionsLocked = Boolean(pending) || loading;

  const teamStats = [
    { label: "Win Streak", value: stats.current_streak },
    { label: "Melhor Streak", value: stats.best_streak },
    { label: "Vitórias", value: stats.total_victories },
    { label: "Derrotas", value: stats.total_losses },
    { label: "Taxa de Acerto", value: `${stats.success_rate}%` },
  ];

  return (
    <div className="space-y-12">
      <div className="card-panel border-[#7c6aef]/30 bg-[#7c6aef]/5">
        <p className="label text-[#c4b5fd]">Confirmação dupla</p>
        <p className="mt-2 font-body text-sm leading-relaxed text-[#D9D9D9]">
          Toda ação (registrar, remover última ou resetar) exige confirmação de{" "}
          <strong className="text-white">Naltic</strong> e{" "}
          <strong className="text-white">Neat</strong>. Quem propõe já conta como
          confirmado — o parceiro precisa confirmar no dispositivo dele.
        </p>
        <p className="mt-2 font-body text-xs text-[#8A8A8A]">
          Operador atual: <span className="text-white">{session.displayName}</span>
        </p>
      </div>

      {pending && (
        <section className="card-panel border-[#fbbf24]/40 bg-[#fbbf24]/5">
          <p className="label text-[#fbbf24]">Aguardando confirmação</p>
          <h2 className="mt-2 font-heading text-lg text-white">
            {describePendingAction(pending)}
          </h2>
          {pending.payload && (
            <p className="mt-2 font-body text-xs text-[#8A8A8A]">
              Naltic: {pending.payload.naltic_survived ? "vivo" : "morto"} · Neat:{" "}
              {pending.payload.neat_survived ? "vivo" : "morto"}
              {pending.payload.difficulty ? ` · ${pending.payload.difficulty}` : ""}
            </p>
          )}
          <p className="mt-3 font-body text-sm text-[#D9D9D9]">
            Proposto por {displayNameFor(pending.requested_by)}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {(["naltic", "neat"] as const).map((user) => {
              const confirmed = pending.confirmations.includes(user);
              return (
                <span
                  key={user}
                  className={`rounded border px-3 py-1.5 font-body text-xs uppercase tracking-wider ${
                    confirmed
                      ? "border-[#4ade80]/50 bg-[#4ade80]/10 text-[#4ade80]"
                      : "border-[#171717] text-[#8A8A8A]"
                  }`}
                >
                  {displayNameFor(user)} {confirmed ? "✓ confirmou" : "· pendente"}
                </span>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {needsMyConfirm && (
              <button
                type="button"
                onClick={confirmPending}
                disabled={loading}
                className="border border-[#4ade80] bg-[#4ade80]/10 px-6 py-3 font-body text-xs uppercase tracking-widest text-[#4ade80] transition-opacity hover:bg-[#4ade80]/20 disabled:opacity-30"
              >
                Confirmar ação
              </button>
            )}
            {hasConfirmed && !partnerConfirmed && (
              <span className="self-center font-body text-xs text-[#8A8A8A]">
                Você confirmou · aguardando {displayNameFor(partner)}
              </span>
            )}
            {pending.requested_by === session.username && (
              <button
                type="button"
                onClick={cancelPending}
                disabled={loading}
                className="border border-[#171717] px-6 py-3 font-body text-xs uppercase tracking-widest text-[#8A8A8A] hover:text-white disabled:opacity-30"
              >
                Cancelar proposta
              </button>
            )}
          </div>
        </section>
      )}

      {message && (
        <p className="font-body text-sm text-[#c4b5fd]" role="status">
          {message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {teamStats.map((item) => (
          <div key={item.label} className="card-panel !p-4">
            <p className="label">{item.label}</p>
            <p className="mt-2 font-display text-2xl text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-heading text-lg text-white">Patentes atuais</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {players.map((p) => (
            <PlayerRankCard key={p.name} player={p} />
          ))}
        </div>
      </section>

      <section className="card-panel">
        <h2 className="font-heading text-lg text-white">Registrar Partida</h2>
        <p className="mt-2 font-body text-xs leading-relaxed text-[#8A8A8A]">
          Vitória (vivo): +{POINTS.WIN + POINTS.SURVIVAL_ON_WIN} pts base · Vitória (morto): ~60% menos · Derrota: {POINTS.LOSS_SURVIVED} a {POINTS.LOSS_DEATH} pts
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <p className="label mb-3">Resultado</p>
            <div className="flex gap-3">
              <Toggle active={won} onClick={() => setWon(true)} disabled={actionsLocked}>
                Vitória
              </Toggle>
              <Toggle active={!won} onClick={() => setWon(false)} disabled={actionsLocked}>
                Derrota
              </Toggle>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="label mb-3">Naltic</p>
              <div className="flex gap-3">
                <Toggle
                  active={nalticSurvived}
                  onClick={() => setNalticSurvived(true)}
                  disabled={actionsLocked}
                >
                  Vivo
                </Toggle>
                <Toggle
                  active={!nalticSurvived}
                  onClick={() => setNalticSurvived(false)}
                  disabled={actionsLocked}
                >
                  Morto
                </Toggle>
              </div>
            </div>
            <div>
              <p className="label mb-3">Neat</p>
              <div className="flex gap-3">
                <Toggle
                  active={neatSurvived}
                  onClick={() => setNeatSurvived(true)}
                  disabled={actionsLocked}
                >
                  Vivo
                </Toggle>
                <Toggle
                  active={!neatSurvived}
                  onClick={() => setNeatSurvived(false)}
                  disabled={actionsLocked}
                >
                  Morto
                </Toggle>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <select
              value={ghostType}
              onChange={(e) => setGhostType(e.target.value)}
              disabled={actionsLocked}
              className="min-w-[200px] flex-1 border border-[#171717] bg-black px-4 py-3 font-body text-sm text-white outline-none focus:border-[#7c6aef] disabled:opacity-30"
            >
              <option value="">Entidade</option>
              {GHOSTS.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={actionsLocked}
              className="border border-[#171717] bg-black px-4 py-3 font-body text-sm text-white outline-none focus:border-[#7c6aef] disabled:opacity-30"
            >
              {["Amateur", "Intermediate", "Professional", "Nightmare", "Insanity"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              proposeAction("add_match", {
                ghost_type: ghostType || null,
                difficulty,
                won,
                naltic_survived: nalticSurvived,
                neat_survived: neatSurvived,
              })
            }
            disabled={actionsLocked}
            className="border border-[#7c6aef] bg-[#7c6aef]/10 px-6 py-3 font-body text-xs uppercase tracking-widest text-[#c4b5fd] transition-opacity hover:bg-[#7c6aef]/20 disabled:opacity-30"
          >
            Propor registro
          </button>
          <button
            type="button"
            onClick={() => proposeAction("remove_last")}
            disabled={actionsLocked || matches.length === 0}
            className="border border-[#171717] px-6 py-3 font-body text-xs uppercase tracking-widest text-[#8A8A8A] hover:text-white disabled:opacity-30"
          >
            Propor remover última
          </button>
          <button
            type="button"
            onClick={() => proposeAction("reset_all")}
            disabled={actionsLocked}
            className="border border-[#171717] px-6 py-3 font-body text-xs uppercase tracking-widest text-[#8A8A8A] hover:text-[#e85d75] disabled:opacity-30"
          >
            Propor reset
          </button>
        </div>
      </section>

      <section className="card-panel">
        <h2 className="font-heading text-lg text-white">Histórico</h2>
        {matches.length === 0 ? (
          <p className="mt-6 font-body text-sm text-[#8A8A8A]">Nenhuma partida registrada.</p>
        ) : (
          <div className="mt-6 grid gap-0 lg:grid-cols-2 lg:gap-x-8">
            {matches.map((m) => (
              <div
                key={m.id}
                className="flex items-start justify-between gap-4 border-b border-[#171717] py-4"
              >
                <div>
                  <p className="font-heading text-sm text-[#D9D9D9]">
                    {m.won ? "Vitória" : "Derrota"}
                    {m.ghost_type ? ` · ${m.ghost_type}` : ""}
                  </p>
                  <p className="mt-1 font-body text-xs text-[#8A8A8A]">
                    Naltic: {m.naltic_survived ? "vivo" : "morto"} · Neat:{" "}
                    {m.neat_survived ? "vivo" : "morto"}
                  </p>
                  <p className="mt-1 font-body text-xs text-[#8A8A8A]">
                    {new Date(m.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <span className="label shrink-0">{m.difficulty ?? "—"}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PlayerRankCard({ player }: { player: PlayerStats }) {
  const progress = getRankProgress(player.current_streak, player.best_streak);
  const { currentRank } = progress;

  return (
    <div className="card-panel !p-5">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <Image
            src={currentRank.image}
            alt={currentRank.name}
            fill
            className="object-contain"
            sizes="64px"
            unoptimized={/\.(png|jpe?g)$/i.test(currentRank.image)}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="label">{player.name}</p>
          <p className="font-heading text-base" style={{ color: currentRank.color }}>
            {currentRank.name}
          </p>
          <p className="mt-1 font-body text-xs text-[#8A8A8A]">
            Streak {player.current_streak} · Peak {player.best_streak}
          </p>
        </div>
        <span className="font-display text-xl tabular-nums" style={{ color: currentRank.color }}>
          {Math.round(progress.progress)}%
        </span>
      </div>
      <div className="mt-4">
        <RankProgressBar progress={progress} size="sm" showDetails={false} />
      </div>
    </div>
  );
}
