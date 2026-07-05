import type { TileCoordinate, WorldCoordinate } from "@world/coordinates/WorldCoordinates";

/**
 * A CreatureDefinition is pure domain data, exactly like a POI or an NPC: no
 * behavior, no per-instance logic. Zone content, not a global catalog —
 * territory anchors to that zone's specific geography (the groves a boar
 * defends), the same relationship POIs, NPCs, and danger zones already have
 * with FirstCoastZone. No movement/patrol this sprint, same documented
 * limitation as NPCs: one fixed tile, no pathfinding.
 */
export type CreatureDefinition = Readonly<{
  id: string;
  name: string;
  kind: string;
  anchorTile: TileCoordinate;
  radiusInTiles: number;
  health: number;
  damage: number;
}>;

/**
 * A creature's current presence, resolved for the renderer. visible is false
 * while it is exhausted (fled, or on the short recovery cooldown between
 * swings) — the same InteractableRegistry state that already gates whether
 * it can be focused at all.
 */
export type CreaturePresenceView = Readonly<{
  id: string;
  name: string;
  position: WorldCoordinate;
  visible: boolean;
}>;
