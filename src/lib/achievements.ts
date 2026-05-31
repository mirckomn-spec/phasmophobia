export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  totalVictories: number;
  currentStreak: number;
  bestStreak: number;
  nightmareWins: number;
  insanityWins: number;
  uniqueGhostsIdentified: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first",
    name: "Primeira Investigação",
    description: "Completou a primeira missão com sucesso.",
    icon: "🔦",
    check: (c) => c.totalVictories >= 1,
  },
  {
    id: "wins10",
    name: "10 Vitórias",
    description: "Dez contratos concluídos sem falhas.",
    icon: "🎯",
    check: (c) => c.totalVictories >= 10,
  },
  {
    id: "wins25",
    name: "25 Vitórias",
    description: "Vinte e cinco entidades neutralizadas.",
    icon: "⚡",
    check: (c) => c.totalVictories >= 25,
  },
  {
    id: "wins50",
    name: "50 Vitórias",
    description: "Meio século de operações bem-sucedidas.",
    icon: "🏆",
    check: (c) => c.totalVictories >= 50,
  },
  {
    id: "wins100",
    name: "100 Vitórias",
    description: "Centenário de excelência paranormal.",
    icon: "👑",
    check: (c) => c.totalVictories >= 100,
  },
  {
    id: "streak10",
    name: "Win Streak 10",
    description: "Dez vitórias consecutivas.",
    icon: "🔥",
    check: (c) => c.bestStreak >= 10,
  },
  {
    id: "streak25",
    name: "Win Streak 25",
    description: "Sequência imparável de 25 vitórias.",
    icon: "💀",
    check: (c) => c.bestStreak >= 25,
  },
  {
    id: "streak50",
    name: "Win Streak 50",
    description: "Cinquenta missões sem derrota.",
    icon: "🌑",
    check: (c) => c.bestStreak >= 50,
  },
  {
    id: "streak100",
    name: "Win Streak 100",
    description: "Lenda viva da investigação paranormal.",
    icon: "⭐",
    check: (c) => c.bestStreak >= 100,
  },
  {
    id: "nightmare",
    name: "Pesadelo Dominado",
    description: "Vitória em dificuldade Nightmare.",
    icon: "🌙",
    check: (c) => c.nightmareWins >= 1,
  },
  {
    id: "insanity",
    name: "Insanidade Dominada",
    description: "Sobreviveu e identificou em Insanity.",
    icon: "🧠",
    check: (c) => c.insanityWins >= 1,
  },
  {
    id: "evidence",
    name: "Mestres da Evidência",
    description: "Identificaram todos os 27 tipos de entidades.",
    icon: "📡",
    check: (c) => c.uniqueGhostsIdentified >= 27,
  },
  {
    id: "supreme",
    name: "Caçadores Supremos",
    description: "Alcançaram o rank Caçadores Supremos ou superior.",
    icon: "🛡️",
    check: (c) => c.bestStreak >= 61,
  },
];

export function getUnlockedAchievements(ctx: AchievementContext): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.check(ctx));
}
