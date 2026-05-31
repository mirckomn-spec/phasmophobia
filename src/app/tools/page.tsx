import { InvestigationTools } from "@/components/tools/InvestigationTools";
import { PageShell } from "@/components/layout/PageShell";

export default function ToolsPage() {
  return (
    <PageShell
      label="Equipamento de Campo"
      title="Ferramentas"
      description="Instrumentos de medição e temporização para operações de campo."
      wide
    >
      <InvestigationTools />
    </PageShell>
  );
}
