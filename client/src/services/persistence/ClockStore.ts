import type { WorldClockSnapshot } from "@world/clock/WorldClockTypes";

/**
 * ClockStore is the persistence port for the world clock — the only piece of
 * state this sprint saves across sessions. Mirrors the SoundPlayer pattern
 * (Sprint 4): a NullClockStore keeps the wiring exercised wherever storage
 * isn't available, and a future unified save system (Sprint 12) can replace
 * or absorb LocalStorageClockStore without WorldClock ever knowing this port
 * exists — the domain only ever sees WorldClockSnapshot.
 */
export type ClockStore = Readonly<{
  load(): WorldClockSnapshot | undefined;
  save(snapshot: WorldClockSnapshot): void;
}>;

const StorageKey = "aether:world-clock:v1";

function isWorldClockSnapshot(value: unknown): value is WorldClockSnapshot {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { elapsedGameSeconds?: unknown }).elapsedGameSeconds === "number"
  );
}

/** Persists the world clock to the browser's localStorage. */
export class LocalStorageClockStore implements ClockStore {
  public load(): WorldClockSnapshot | undefined {
    try {
      const raw = localStorage.getItem(StorageKey);

      if (!raw) {
        return undefined;
      }

      const parsed: unknown = JSON.parse(raw);

      return isWorldClockSnapshot(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }

  public save(snapshot: WorldClockSnapshot): void {
    try {
      localStorage.setItem(StorageKey, JSON.stringify(snapshot));
    } catch {
      // Storage unavailable (private browsing, quota exceeded) — skip silently,
      // never let a persistence failure crash the world.
    }
  }
}

/** No-op store for environments without persistence (tests, SSR, tooling). */
export class NullClockStore implements ClockStore {
  public load(): WorldClockSnapshot | undefined {
    return undefined;
  }

  public save(): void {
    // Intentionally silent: no persistence backend.
  }
}
