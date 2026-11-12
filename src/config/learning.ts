/** Ajusta aquí la política de aprendizaje sin modificar las pantallas. */
export const LEARNING = {
  consolidation: { minSuccessfulReviews: 2, minDistinctDays: 2 },
  mastery: { minSuccessfulReviews: 4, minElapsedDays: 7, lastImmediateCount: 2 },
  intervals: { immediateDays: [2, 4, 7, 14, 30], associationDays: 2, hintDays: 1, missDays: 1 },
  failure: { consecutiveMissesToLearning: 2, interleaveCardsBeforeRetry: 3 },
} as const;
