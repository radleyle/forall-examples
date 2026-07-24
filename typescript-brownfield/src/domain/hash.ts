import { asUnsignedStableHash, hashToBucket } from "./verifiedCore.js";
export { hashToBucket } from "./verifiedCore.js";

/** Stable unsigned FNV-1a hash used for deterministic rollout assignment. */
export function stableHash(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return asUnsignedStableHash(hash);
}

export function rolloutBucket(flagKey: string, subjectKey: string): number {
  return hashToBucket(stableHash(`${flagKey}:${subjectKey}`));
}
