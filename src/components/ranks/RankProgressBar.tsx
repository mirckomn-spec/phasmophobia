import { getRankProgress } from "@/lib/ranks";

interface RankProgressBarProps {
  progress: ReturnType<typeof getRankProgress>;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
}

export function RankProgressBar({
  progress,
  size = "md",
  showDetails = true,
}: RankProgressBarProps) {
  const { currentRank, nextRank, progress: pct, isMaxRank } = progress;
  const barHeight = size === "sm" ? "h-1" : size === "lg" ? "h-2.5" : "h-1.5";
  const barColor = currentRank.color;

  if (isMaxRank) {
    return (
      <p className="font-body text-sm" style={{ color: barColor }}>
        Patente máxima alcançada neste streak
      </p>
    );
  }

  const pctDisplay = Math.round(pct * 10) / 10;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="label">Progresso → {nextRank?.name}</span>
        <span className="font-display text-sm tabular-nums text-white">
          {pctDisplay}%
        </span>
      </div>
      <div className={`${barHeight} w-full overflow-hidden rounded-full bg-[#171717]`}>
        <div
          className={`${barHeight} min-w-[2px] rounded-full transition-all duration-700`}
          style={{
            width: `${Math.max(pct, pct > 0 ? 1 : 0)}%`,
            backgroundColor: barColor,
            boxShadow: pct > 0 ? `0 0 16px ${barColor}88` : undefined,
          }}
        />
      </div>
      {showDetails && nextRank && (
        <p className="mt-3 font-body text-xs leading-relaxed text-[#8A8A8A]">
          <span style={{ color: barColor }}>
            {progress.streakInTier} / {progress.streakNeededInTier} vitórias
          </span>
          {" "}neste tier · faltam{" "}
          <span style={{ color: barColor }}>{progress.streakToNext} vitórias</span>
          {" "}para {nextRank.name}
        </p>
      )}
    </div>
  );
}
