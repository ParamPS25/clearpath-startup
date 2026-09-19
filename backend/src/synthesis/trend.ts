import { TrendPoint } from '../serp/serp.types';

export type TrendDirection =
  'rising' | 'declining' | 'flat' | 'insufficient_data';

export interface SearchTrend {
  direction: TrendDirection;
  points: TrendPoint[];
}

const SAMPLE_SIZE = 3;
const CHANGE_THRESHOLD = 0.15; // 15% relative change to call it rising/declining

/**
 * Deterministic — compares the average of the earliest and most recent few
 * weeks. No LLM involved, so the badge can never say something the numbers
 * don't back up.
 */
export function classifyTrend(points: TrendPoint[] | null): SearchTrend {
  if (!points || points.length < SAMPLE_SIZE * 2) {
    return { direction: 'insufficient_data', points: points ?? [] };
  }

  const earliest = average(points.slice(0, SAMPLE_SIZE).map((p) => p.value));
  const recent = average(points.slice(-SAMPLE_SIZE).map((p) => p.value));

  if (earliest === 0 && recent === 0) {
    return { direction: 'insufficient_data', points };
  }

  const change = earliest === 0 ? Infinity : (recent - earliest) / earliest;

  let direction: TrendDirection;
  if (change > CHANGE_THRESHOLD) direction = 'rising';
  else if (change < -CHANGE_THRESHOLD) direction = 'declining';
  else direction = 'flat';

  return { direction, points };
}

function average(nums: number[]): number {
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}
