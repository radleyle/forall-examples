import type { FeatureFlag } from "../domain/types.js";

export interface FlagRepository {
  getByKey(key: string): Promise<FeatureFlag | undefined>;
  replaceAll(flags: readonly FeatureFlag[]): Promise<void>;
}
