import type { FeatureFlag } from "../domain/types.js";
import type { FlagRepository } from "./repository.js";

export class InMemoryFlagRepository implements FlagRepository {
  readonly #flags = new Map<string, FeatureFlag>();

  public constructor(flags: readonly FeatureFlag[] = []) {
    for (const flag of flags) this.#flags.set(flag.key, flag);
  }

  public async getByKey(key: string): Promise<FeatureFlag | undefined> {
    return this.#flags.get(key);
  }

  public async replaceAll(flags: readonly FeatureFlag[]): Promise<void> {
    this.#flags.clear();
    for (const flag of flags) this.#flags.set(flag.key, flag);
  }
}
