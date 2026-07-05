import type { WorldSaveSnapshot } from "@world/save/SaveTypes";

/**
 * SaveStore is the persistence port for the unified player-progress save —
 * inventory, equipment, position, and the world clock it absorbs. Mirrors the
 * ClockStore pattern (Sprint 11): a NullSaveStore keeps the wiring exercised
 * wherever storage isn't available, and this port can be replaced later
 * (server-backed saves, multiple slots) without WorldSession ever knowing —
 * the domain only ever sees WorldSaveSnapshot.
 */
export type SaveStore = Readonly<{
  load(): WorldSaveSnapshot | undefined;
  save(snapshot: WorldSaveSnapshot): void;
}>;

const StorageKey = "aether:save:v1";

function isWorldSaveSnapshot(value: unknown): value is WorldSaveSnapshot {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<WorldSaveSnapshot>;

  return (
    typeof candidate.zoneId === "string" &&
    typeof candidate.player === "object" &&
    candidate.player !== null &&
    Array.isArray(candidate.inventory) &&
    typeof candidate.equipment === "object" &&
    candidate.equipment !== null &&
    typeof candidate.worldClock === "object" &&
    candidate.worldClock !== null &&
    typeof candidate.interactableExhaustion === "object" &&
    candidate.interactableExhaustion !== null
  );
}

/**
 * Persists the unified save to the browser's localStorage. A mismatched or
 * absent version key (see StorageKey) is treated the same as no save at all —
 * the simplest option that never corrupts or misreads old data: it is simply
 * not found under the new key, and the game starts fresh. A future
 * incompatible format bumps this key to `:v2`, exactly like ClockStore did.
 */
export class LocalStorageSaveStore implements SaveStore {
  public load(): WorldSaveSnapshot | undefined {
    try {
      const raw = localStorage.getItem(StorageKey);

      if (!raw) {
        return undefined;
      }

      const parsed: unknown = JSON.parse(raw);

      return isWorldSaveSnapshot(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }

  public save(snapshot: WorldSaveSnapshot): void {
    try {
      localStorage.setItem(StorageKey, JSON.stringify(snapshot));
    } catch {
      // Storage unavailable (private browsing, quota exceeded) — skip silently,
      // never let a persistence failure crash the world.
    }
  }
}

/** No-op store for environments without persistence (tests, SSR, tooling). */
export class NullSaveStore implements SaveStore {
  public load(): WorldSaveSnapshot | undefined {
    return undefined;
  }

  public save(): void {
    // Intentionally silent: no persistence backend.
  }
}
