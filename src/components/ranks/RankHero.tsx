import Image from "next/image";
import { getRankProgress } from "@/lib/ranks";
import type { PlayerStats } from "@/lib/types";
import { RankProgressBar } from "@/components/ranks/RankProgressBar";

interface RankHeroProps {
  player: PlayerStats;
  isYou?: boolean;
}

export function RankHero({ player, isYou }: RankHeroProps) {
  const progress = getRankProgress(player.current_streak, player.best_streak);
  const { currentRank, peakRank } = progress;
  const hasPeakAboveCurrent = peakRank.minStreak > currentRank.minStreak;

  return (
    <section
      className="card-panel relative overflow-hidden"
      style={{
        borderColor: isYou ? `${currentRank.color}55` : "#171717",
        boxShadow: isYou ? `0 0 80px ${currentRank.color}18` : undefined,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background: `radial-gradient(circle at 30% 50%, ${currentRank.color}, transparent 55%)`,
        }}
      />

      {isYou && (
        <span
          className="label absolute right-6 top-6 z-10 rounded border px-3 py-1"
          style={{
            color: currentRank.color,
            borderColor: `${currentRank.color}44`,
            backgroundColor: `${currentRank.color}11`,
          }}
        >
          Seu cargo atual
        </span>
      )}

      <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_280px] lg:gap-16">
        <div className="order-2 lg:order-1">
          <h2 className="font-display text-4xl tracking-tight text-white sm:text-5xl">
            {player.name.toUpperCase()}
          </h2>
          <p
            className="mt-3 font-heading text-2xl sm:text-3xl"
            style={{ color: currentRank.color }}
          >
            {currentRank.name}
          </p>
          <p className="mt-4 font-body text-sm text-[#8A8A8A]">
            Streak atual {player.current_streak} vitórias · Perdeu? Volta ao recruta
          </p>

          {hasPeakAboveCurrent && (
            <div
              className="mt-4 inline-flex items-center gap-3 rounded border px-4 py-2"
              style={{
                borderColor: `${peakRank.color}44`,
                backgroundColor: `${peakRank.color}0A`,
              }}
            >
              <div className="relative h-10 w-10 shrink-0">
                <Image
                  src={peakRank.image}
                  alt={peakRank.name}
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <div>
                <p className="label text-[#8A8A8A]">Peak rating</p>
                <p className="font-heading text-sm" style={{ color: peakRank.color }}>
                  {peakRank.name} · recorde {player.best_streak} vitórias
                </p>
              </div>
            </div>
          )}

          {!hasPeakAboveCurrent && player.best_streak > 0 && (
            <p className="mt-3 font-body text-xs text-[#8A8A8A]">
              Peak rating: {peakRank.name} ({player.best_streak} vitórias)
            </p>
          )}

          <div className="mt-10 max-w-xl">
            <div className="mb-3 flex items-end justify-between">
              <span className="label">Promoção</span>
              <span
                className="font-display text-4xl tabular-nums"
                style={{ color: currentRank.color }}
              >
                {Math.round(progress.progress)}%
              </span>
            </div>
            <RankProgressBar progress={progress} size="lg" showDetails />
          </div>
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <div
            className="relative aspect-square w-full max-w-[280px]"
            style={{ filter: `drop-shadow(0 0 40px ${currentRank.color}55)` }}
          >
            <Image
              src={currentRank.image}
              alt={currentRank.name}
              fill
              className="object-contain"
              sizes="280px"
              priority
              unoptimized={/\.(png|jpe?g)$/i.test(currentRank.image)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
