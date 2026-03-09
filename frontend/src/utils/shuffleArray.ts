/**
 * Fisher-Yates shuffle algorithm
 * Returns a new shuffled array without mutating the original
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Weighted shuffle that maintains randomness but favors higher-scored items
 * Breaks items into tiers and interleaves them with weighted probability
 */
export function weightedShuffle<T>(
  array: T[],
  scoreFn: (item: T) => number
): T[] {
  if (array.length === 0) return [];

  // Calculate scores and sort
  const itemsWithScores = array.map(item => ({
    item,
    score: scoreFn(item)
  })).sort((a, b) => b.score - a.score);

  // Tier breakdown: 60% top, 30% mid, 10% bottom
  const topTierCount = Math.ceil(itemsWithScores.length * 0.6);
  const midTierCount = Math.floor(itemsWithScores.length * 0.3);

  const topTier = shuffleArray(itemsWithScores.slice(0, topTierCount).map(x => x.item));
  const midTier = shuffleArray(itemsWithScores.slice(topTierCount, topTierCount + midTierCount).map(x => x.item));
  const bottomTier = shuffleArray(itemsWithScores.slice(topTierCount + midTierCount).map(x => x.item));

  // Interleave: mostly top tier, some mid tier, few bottom tier
  const result: T[] = [];
  let topIdx = 0, midIdx = 0, bottomIdx = 0;

  while (result.length < array.length) {
    // 70% from top tier
    if (Math.random() < 0.7 && topIdx < topTier.length) {
      result.push(topTier[topIdx++]);
    }
    // 25% from mid tier
    else if (Math.random() < 0.85 && midIdx < midTier.length) {
      result.push(midTier[midIdx++]);
    }
    // 5% from bottom tier
    else if (bottomIdx < bottomTier.length) {
      result.push(bottomTier[bottomIdx++]);
    }
    // Fallback to any remaining
    else if (topIdx < topTier.length) result.push(topTier[topIdx++]);
    else if (midIdx < midTier.length) result.push(midTier[midIdx++]);
    else if (bottomIdx < bottomTier.length) result.push(bottomTier[bottomIdx++]);
  }

  return result;
}
