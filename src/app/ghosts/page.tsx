import { GhostDatabase } from "@/components/ghosts/GhostDatabase";
import { PageShell } from "@/components/layout/PageShell";

export default function GhostsPage() {
  return (
    <PageShell
      label="Arquivo Confidencial"
      title="Entidades"
      description="Banco global de entidades sobrenaturais catalogadas pela dupla."
      wide
    >
      <GhostDatabase />
    </PageShell>
  );
}
