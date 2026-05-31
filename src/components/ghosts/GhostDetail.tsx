import Link from "next/link";
import { notFound } from "next/navigation";
import { getGhostById } from "@/data/ghosts";

interface GhostDetailProps {
  id: string;
}

export function GhostDetail({ id }: GhostDetailProps) {
  const ghost = getGhostById(id);
  if (!ghost) notFound();

  const sections = [
    { title: "Forças", items: ghost.strengths },
    { title: "Fraquezas", items: ghost.weaknesses },
    { title: "Comportamentos", items: ghost.specialBehaviors },
    { title: "Identificação", items: ghost.identificationStrategies },
    { title: "Notas Avançadas", items: ghost.advancedTips },
  ];

  return (
    <article className="space-y-12">
      <Link href="/ghosts" className="label transition-opacity hover:opacity-70">
        ← Entidades
      </Link>

      <header>
        <p className="label mb-3">Dossiê de Entidade</p>
        <h1 className="title-page">{ghost.name.toUpperCase()}</h1>
        <p className="mt-6 font-body text-sm leading-relaxed text-[#8A8A8A]">
          {ghost.description}
        </p>
      </header>

      <div className="grid gap-8 border-t border-[#171717] pt-10 sm:grid-cols-2">
        <MetaItem label="Velocidade" value={ghost.speed} />
        <MetaItem label="Sanidade de Caça" value={ghost.huntSanity} />
        <MetaItem label="Teste em Hunt" value={ghost.huntTest} />
        <MetaItem label="Habilidades" value={ghost.abilityChance} />
      </div>

      <section>
        <h2 className="font-heading text-sm text-[#D9D9D9]">Evidências</h2>
        <p className="mt-3 font-body text-xs text-[#8A8A8A]">
          {ghost.evidence.join(" · ")}
          {ghost.forcedEvidence && ` · Forçada: ${ghost.forcedEvidence}`}
        </p>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="border-t border-[#171717] pt-10">
          <h2 className="font-heading text-sm text-[#D9D9D9]">{section.title}</h2>
          <ul className="mt-4 space-y-2">
            {section.items.map((item, i) => (
              <li key={i} className="font-body text-xs leading-relaxed text-[#8A8A8A]">
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="mt-2 font-body text-xs leading-relaxed text-[#D9D9D9]">{value}</p>
    </div>
  );
}
