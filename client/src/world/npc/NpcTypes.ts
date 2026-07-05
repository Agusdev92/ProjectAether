import type { TimeOfDayType } from "@world/clock/WorldClockTypes";
import type { TileCoordinate, WorldCoordinate } from "@world/coordinates/WorldCoordinates";

/**
 * One waypoint of an NPC's daily routine. `activity` is an open text label
 * (e.g. "reparando redes", "durmiendo") — unused for any gameplay logic this
 * sprint, kept so a future dialogue or animation system has something to
 * read without a new contract. It may formalize into a Types const once
 * something other than a human reads it.
 */
export type NpcScheduleEntry = Readonly<{
  timeOfDay: TimeOfDayType;
  anchorTile: TileCoordinate;
  activity: string;
}>;

/**
 * An NPC is pure domain data, exactly like ItemDefinition or
 * EquipmentDefinition: no behavior, no per-instance logic. Unlike items,
 * NPCs are zone content (their schedule anchors to that zone's specific
 * geography) — the same relationship POIs and zone interactables already
 * have with FirstCoastZone, not a global catalog.
 */
export type NpcDefinition = Readonly<{
  id: string;
  name: string;
  schedule: readonly NpcScheduleEntry[];
}>;

/** An NPC's current position, resolved for presentation. */
export type NpcPositionView = Readonly<{
  id: string;
  name: string;
  position: WorldCoordinate;
}>;

/**
 * Resolves where an NPC currently is, purely from its schedule and the given
 * time of day — no simulation, no per-frame state to advance. This is what
 * lets an NPC exist independently of whether the player is watching
 * (PROJECT_PILLARS Pilar 1): the position is recomputed fresh on every query
 * and can never drift, because nothing was ever ticking in the background
 * that could drift in the first place. Falls back to the first schedule
 * entry if none matches the given time of day (defensive; with full
 * time-of-day coverage this should not trigger).
 */
export function resolveScheduledTile(
  definition: NpcDefinition,
  timeOfDay: TimeOfDayType
): TileCoordinate {
  const match = definition.schedule.find((entry) => entry.timeOfDay === timeOfDay);

  return (match ?? definition.schedule[0]).anchorTile;
}
