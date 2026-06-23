// ============================================================================
// Lógica de progressão de nível — espelha a fórmula usada no trigger SQL
// (supabase/migrations/001_init_schema.sql) para exibir barras de progresso
// no frontend sem precisar de uma query extra.
//
// Fórmula: nível N requer N*(N-1)*50 pontos acumulados.
// Nível 1: 0 | Nível 2: 100 | Nível 3: 300 | Nível 4: 600 | Nível 5: 1000...
// ============================================================================

export function pointsRequiredForLevel(level: number): number {
  return level * (level - 1) * 50;
}

export interface LevelProgress {
  level: number;
  pointsIntoLevel: number;
  pointsForNextLevel: number;
  progressPercent: number;
}

export function getLevelProgress(totalPoints: number): LevelProgress {
  let level = 1;
  // encontra o nível atual checando até onde os pontos acumulados sustentam
  while (totalPoints >= pointsRequiredForLevel(level + 1)) {
    level++;
  }

  const currentLevelFloor = pointsRequiredForLevel(level);
  const nextLevelCeil = pointsRequiredForLevel(level + 1);
  const pointsIntoLevel = totalPoints - currentLevelFloor;
  const pointsForNextLevel = nextLevelCeil - currentLevelFloor;

  return {
    level,
    pointsIntoLevel,
    pointsForNextLevel,
    progressPercent: Math.min(100, (pointsIntoLevel / pointsForNextLevel) * 100),
  };
}

// Títulos temáticos por faixa de nível — reforça a vibe "evoluir até morrer"
export function getLevelTitle(level: number): string {
  if (level >= 20) return "Lendário";
  if (level >= 15) return "Ascendente";
  if (level >= 10) return "Implacável";
  if (level >= 6) return "Em Evolução";
  if (level >= 3) return "Disciplinado";
  return "Iniciante";
}
