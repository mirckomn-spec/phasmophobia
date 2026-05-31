import { GhostDetail } from "@/components/ghosts/GhostDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GhostPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="page-internal-wide">
      <GhostDetail id={id} />
    </div>
  );
}
