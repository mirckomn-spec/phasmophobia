import Image from "next/image";
import type { PlayerStats, Stats } from "@/lib/types";

const NALTIC_AVATAR =
  "https://cdn.discordapp.com/avatars/1508559016140472505/05c1765238b215f1644dec4bce786f1d.png?size=4096";
const NEAT_AVATAR =
  "https://cdn.discordapp.com/avatars/1197773679233339434/78cc1ae889f553639e6c36dabadd8ea8.png?size=4096";

export function IntroSection() {
  return (
    <section className="flex min-h-[75vh] flex-col items-center justify-center px-6 py-20">
      <div className="fade-in max-w-lg text-center">
        <h1 className="title-hero">NALTIC</h1>
        <p className="font-display my-1 text-2xl text-[#8A8A8A]">&</p>
        <h1 className="title-hero">NEAT</h1>

        <p className="label mx-auto mt-12 text-[#7c6aef]">
          Os maiores investigadores paranormais da atualidade
        </p>

        <p className="mx-auto mt-6 font-body text-sm leading-relaxed text-[#8A8A8A]">
          Centenas de entidades identificadas. Nenhum mistério permanece oculto.
        </p>
      </div>
    </section>
  );
}

export function InvestigatorsHero({ players }: { players: PlayerStats[] }) {
  const naltic = players.find((p) => p.name === "Naltic")!;
  const neat = players.find((p) => p.name === "Neat")!;

  return (
    <section className="border-t border-[#171717] px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <p className="label mb-12">Investigadores de Elite</p>

        <div className="grid gap-16 md:grid-cols-2 md:gap-20">
          <InvestigatorColumn
            name="Naltic"
            avatar={NALTIC_AVATAR}
            title={naltic.rank_title}
            description="Especialista em rastreamento e identificação de padrões paranormais."
          />
          <InvestigatorColumn
            name="Neat"
            avatar={NEAT_AVATAR}
            title={neat.rank_title}
            description="Especialista em análise comportamental e confirmação de entidades."
          />
        </div>
      </div>
    </section>
  );
}

function InvestigatorColumn({
  name,
  avatar,
  title,
  description,
}: {
  name: string;
  avatar: string;
  title: string;
  description: string;
}) {
  return (
    <div className="fade-in flex flex-col items-center text-center md:items-start md:text-left">
      <div className="relative mb-6 aspect-[3/4] w-full max-w-[200px] overflow-hidden border border-white">
        <Image
          src={avatar}
          alt={name}
          fill
          className="object-cover grayscale"
          sizes="200px"
          priority
        />
      </div>
      <h2 className="font-display text-2xl tracking-tight text-white">{name.toUpperCase()}</h2>
      <p className="label mt-2">{title}</p>
      <p className="mt-3 max-w-xs font-body text-xs leading-relaxed text-[#8A8A8A]">
        {description}
      </p>
    </div>
  );
}

export function StatusSection({ stats }: { stats: Stats }) {
  const items = [
    { label: "Win Streak", value: stats.current_streak },
    { label: "Melhor Streak", value: stats.best_streak },
    { label: "Casos Resolvidos", value: stats.total_victories },
    { label: "Entidades Identificadas", value: stats.total_ghosts_identified },
    { label: "Taxa de Acerto", value: `${stats.success_rate}%` },
  ];

  return (
    <section className="border-t border-[#171717] bg-[#0A0A0A] px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <p className="label mb-10">Relatório Operacional</p>

        <div className="space-y-0">
          {items.map((item, i) => (
            <div key={item.label}>
              <div className="flex items-baseline justify-between py-5">
                <span className="font-heading text-sm text-[#D9D9D9]">{item.label}</span>
                <span className="font-display text-xl text-white">{item.value}</span>
              </div>
              {i < items.length - 1 && <hr className="divider" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RecognitionSection() {
  return (
    <section className="border-t border-[#171717] px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="title-section">
          RECONHECIMENTO
          <br />
          INTERNACIONAL
        </h2>
        <p className="mt-8 font-body text-sm leading-[1.8] text-[#8A8A8A]">
          A dupla Naltic & Neat é reconhecida entre os investigadores mais eficientes já
          registrados. Seu histórico operacional demonstra uma taxa excepcional de
          identificação e resolução de eventos paranormais.
        </p>
      </div>
    </section>
  );
}
