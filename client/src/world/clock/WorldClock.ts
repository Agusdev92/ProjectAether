import { GameConstants } from "@shared/config/GameConstants";
import { TimeOfDayTypes } from "@world/clock/WorldClockTypes";
import type { TimeOfDayType, WorldClockSnapshot } from "@world/clock/WorldClockTypes";

/**
 * WorldClock is the world's own calendar — a distinct concept from
 * WorldSession.elapsedSeconds (real session time used for resource cooldowns
 * and crafting station timing). Conflating the two would be a mistake: this
 * clock's value persists across sessions and runs at a configurable
 * multiplier, so a loaded save must never make cooldowns jump forward by
 * hours just because a lot of in-game time passed while the game was closed.
 *
 * Position is never simulated here — NPC schedules read this clock's
 * timeOfDay on demand and resolve their own position as a pure function
 * (see world/npc/NpcTypes.resolveScheduledTile). WorldClock only has to get
 * the *time* right; it owns no notion of where anyone is.
 */
export class WorldClock {
  private elapsedGameSeconds: number;

  public constructor(initial: WorldClockSnapshot = { elapsedGameSeconds: 0 }) {
    this.elapsedGameSeconds = initial.elapsedGameSeconds;
  }

  public update(deltaRealSeconds: number): void {
    this.elapsedGameSeconds += deltaRealSeconds * GameConstants.clock.timeScale;
  }

  /** Overwrites the clock's state — used right after loading a persisted snapshot. */
  public restore(snapshot: WorldClockSnapshot): void {
    this.elapsedGameSeconds = snapshot.elapsedGameSeconds;
  }

  public get snapshot(): WorldClockSnapshot {
    return { elapsedGameSeconds: this.elapsedGameSeconds };
  }

  public get timeOfDay(): TimeOfDayType {
    const dayLength = GameConstants.clock.dayLengthInGameSeconds;
    const dayProgress = (this.elapsedGameSeconds % dayLength) / dayLength;

    if (dayProgress < 1 / 3) {
      return TimeOfDayTypes.Morning;
    }

    if (dayProgress < 2 / 3) {
      return TimeOfDayTypes.Afternoon;
    }

    return TimeOfDayTypes.Night;
  }
}
