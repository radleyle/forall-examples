import {
  clampFinitePercentage,
  isBucketIncluded,
  percentageToThreshold,
} from "./verifiedCore.js";

export function clampPercentage(percentage: number): number {
  if (!Number.isFinite(percentage)) return 0;
  return clampFinitePercentage(percentage);
}

export { isBucketIncluded, percentageToThreshold };
