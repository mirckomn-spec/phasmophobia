export const dynamic = "force-dynamic";

import {
  IntroSection,
  InvestigatorsHero,
  RecognitionSection,
  StatusSection,
} from "@/components/home/HomeSections";
import { getPlayerStats, getStats } from "@/lib/db";

export default async function HomePage() {
  const [stats, players] = await Promise.all([getStats(), getPlayerStats()]);

  return (
    <>
      <IntroSection />
      <InvestigatorsHero players={players} />
      <StatusSection stats={stats} />
      <RecognitionSection />
    </>
  );
}
