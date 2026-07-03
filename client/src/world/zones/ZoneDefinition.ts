import type { ZoneAtmosphereDefinition } from "@world/atmosphere/AtmosphereTypes";
import type { ZoneInteractableDefinition } from "@world/interaction/InteractionTypes";
import type { PoiDefinition } from "@world/poi/PoiTypes";
import type { TerrainResolver } from "@world/tilemap/TerrainResolver";
import type { WorldTilemapDefinition } from "@world/tilemap/WorldTilemap";

/**
 * ZoneDefinition is the unit of world content: one map, its terrain rules,
 * its points of interest, and its atmosphere. It is intentionally
 * serializable-friendly (except the resolver) because zones are what a future
 * server will stream to clients.
 */
export type ZoneDefinition = Readonly<{
  tilemap: WorldTilemapDefinition;
  terrain: TerrainResolver;
  pois: readonly PoiDefinition[];
  atmosphere: ZoneAtmosphereDefinition;
  interactables: readonly ZoneInteractableDefinition[];
}>;
