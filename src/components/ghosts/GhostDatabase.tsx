"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GHOSTS, EVIDENCE_OPTIONS, searchGhosts } from "@/data/ghosts";

export function GhostDatabase() {
  const [query, setQuery] = useState("");
  const [evidenceFilter, setEvidenceFilter] = useState<string[]>([]);

  const filtered = useMemo(
    () => searchGhosts(query, evidenceFilter),
    [query, evidenceFilter]
  );

  const toggleEvidence = (ev: string) => {
    setEvidenceFilter((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
    );
  };

  return (
    <div className="space-y-16">
      <div>
        <input
          type="text"
          placeholder="Buscar entidade..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border-b border-[#171717] bg-transparent py-4 font-body text-lg text-white placeholder:text-[#8A8A8A] outline-none focus:border-[#8A8A8A]"
        />
        <div className="mt-6 flex flex-wrap gap-4">
          {EVIDENCE_OPTIONS.map((ev) => (
            <button
              key={ev}
              onClick={() => toggleEvidence(ev)}
              className={`label transition-opacity ${
                evidenceFilter.includes(ev) ? "text-white" : "text-[#8A8A8A] hover:text-[#D9D9D9]"
              }`}
            >
              {ev}
            </button>
          ))}
        </div>
        <p className="label mt-6">
          {filtered.length} de {GHOSTS.length} entidades
        </p>
      </div>

      <div className="grid gap-0 xl:grid-cols-2 xl:gap-x-12">
        {filtered.map((ghost) => (
          <div key={ghost.id} className="border-b border-[#171717]">
            <Link
              href={`/ghosts/${ghost.id}`}
              className="group flex items-baseline justify-between py-6 transition-opacity hover:opacity-70"
            >
              <div>
                <h3 className="font-heading text-xl text-white group-hover:text-[#D9D9D9]">
                  {ghost.name}
                </h3>
                <p className="mt-1 font-body text-sm text-[#8A8A8A]">
                  {ghost.evidence.join(" · ")}
                </p>
              </div>
              <span className="label hidden lg:block">{ghost.speed}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
