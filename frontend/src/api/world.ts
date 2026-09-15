import type { SpatialWorld } from "../types/world";

const BASELINE_WORLD_PATH = "/api/layout/baseline";

export async function getBaselineWorld(signal?: AbortSignal): Promise<SpatialWorld> {
  const response = await fetch(BASELINE_WORLD_PATH, { signal });
  if (!response.ok) {
    throw new Error(`Could not load the baseline world (${response.status}).`);
  }
  return (await response.json()) as SpatialWorld;
}
