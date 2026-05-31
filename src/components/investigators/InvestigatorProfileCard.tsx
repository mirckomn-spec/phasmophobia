import Image from "next/image";
import { getRankProgress } from "@/lib/ranks";
import type { PlayerStats } from "@/lib/types";
import { RankProgressBar } from "@/components/ranks/RankProgressBar";

interface InvestigatorProfileCardProps {
  player: PlayerStats;
  avatar: string;
  specialty: string;
  highlight?: boolean;
}

export function InvestigatorProfileCard({
  player,
  avatar,
  specialty,
  highlight,
}: InvestigatorProfileCardProps) {
  const progress = getRankProgress(player.current_streak, player.best_streak);
  const { currentRank, peakRank } = progress;
  const hasPeakAboveCurrent = peakRank.minStreak > currentRank.minStreak;

  return (
    <article
      className="card-panel relative overflow-hidden"
      style={{
        borderColor: highlight ? `${currentRank.color}44` : undefined,
        boxShadow: highlight ? `0 0 60px ${currentRank.color}15` : undefined,
      }}
    >
      {highlight && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            background: `linear-gradient(135deg, ${currentRank.color}, transparent 60%)`,
          }}
        />
      )}

      <div className="relative grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
        <div className="flex flex-col items-center lg:items-start">
          <div className="relative aspect-square w-full max-w-[240px] overflow-hidden border border-[#171717]">
            <Image
              src={avatar}
              alt={player.name}
              fill
              className="object-cover grayscale"
              sizes="240px"
            />
            <div
              className="absolute -bottom-3 -right-3 flex h-24 w-24 items-center justify-center rounded-full border-2 bg-black p-2"
              style={{ borderColor: currentRank.color }}
            >
              <div className="relative h-full w-full">
                <Image
                  src={currentRank.image}
                  alt={currentRank.name}
                  fill
                  className="object-contain"
                  sizes="96px"
                  unoptimized={/\.(png|jpe?g)$/i.test(currentRank.image)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-center">
          <p className="label">Investigador de Elite</p>
          <h2 className="mt-2 font-display text-4xl tracking-tight text-white lg:text-5xl">
            {player.name.toUpperCase()}
          </h2>

          <div className="mt-4 inline-flex flex-wrap items-center gap-3">
            <span
              className="font-heading text-lg lg:text-xl"
              style={{ color: currentRank.color }}
            >
              {currentRank.name}
            </span>
            <span className="label rounded border border-[#171717] px-2 py-1">
              {Math.round(progress.progress)}% para promoção
            </span>
          </div>

          <div
            className="mt-4 inline-flex items-center gap-3 rounded border border-[#171717] bg-black/40 px-4 py-3"
            style={
              hasPeakAboveCurrent
                ? { borderColor: `${peakRank.color}44`, backgroundColor: `${peakRank.color}08` }
                : undefined
            }
          >
            <div className="relative h-12 w-12 shrink-0">
              <Image
                src={peakRank.image}
                alt={peakRank.name}
                fill
                className="object-contain"
                sizes="48px"
                unoptimized={/\.(png|jpe?g)$/i.test(peakRank.image)}
              />
            </div>
            <div>
              <p className="label">Peak rating</p>
              <p className="font-heading text-sm" style={{ color: peakRank.color }}>
                {peakRank.name}
              </p>
              <p className="font-body text-xs text-[#8A8A8A]">
                Recorde: {player.best_streak} vitórias seguidas
              </p>
            </div>
          </div>

          <p className="mt-4 font-body text-sm leading-relaxed text-[#8A8A8A]">
            {specialty}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Streak atual", value: player.current_streak },
              { label: "Peak streak", value: player.best_streak },
              { label: "Vitórias", value: player.total_wins },
              { label: "Sobrevivências", value: `${player.survival_rate}%` },
            ].map((stat) => (
              <div key={stat.label} className="rounded border border-[#171717] bg-black/40 px-4 py-3">
                <p className="label">{stat.label}</p>
                <p className="mt-1 font-heading text-base text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <RankProgressBar progress={progress} size="lg" />
          </div>
        </div>
      </div>
    </article>
  );
}
