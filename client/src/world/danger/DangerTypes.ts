import type { WeatherType } from "@world/atmosphere/AtmosphereTypes";
import type { TimeOfDayType } from "@world/clock/WorldClockTypes";
import type { TileCoordinate } from "@world/coordinates/WorldCoordinates";
import type { ConsumedStack } from "@world/inventory/InventoryTypes";

/**
 * A DangerZone is pure domain data, exactly like a POI or an NPC: a place, a
 * radius, and the conditions during which it is active. Zone content, not a
 * global catalog — its geography anchors to that zone's specific coastline,
 * same relationship POIs and NPCs already have with FirstCoastZone.
 * retreatTile must sit outside the danger radius: it is where the player
 * lands after being caught. activeInWeather is optional and additive to
 * activeTimeOfDay (a storm surge does not care what time it is) — a zone
 * with no weather sensitivity simply omits it.
 */
export type DangerZoneDefinition = Readonly<{
  id: string;
  name: string;
  anchorTile: TileCoordinate;
  radiusInTiles: number;
  activeTimeOfDay: readonly TimeOfDayType[];
  activeInWeather?: readonly WeatherType[];
  retreatTile: TileCoordinate;
}>;

/** What happened when a danger zone caught the player, ready to be announced. */
export type DangerReport = Readonly<{
  zoneId: string;
  zoneName: string;
  message: string;
  lostItems: readonly ConsumedStack[];
}>;
