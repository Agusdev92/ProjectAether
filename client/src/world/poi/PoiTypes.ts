import type { TileCoordinate } from "@world/coordinates/WorldCoordinates";

/**
 * PoiTypes enumerates every Point of Interest kind known by the domain. Each
 * type is an independent concept: adding gameplay to one of them later (for
 * example, opening the forge) must never require touching the others.
 */
export const PoiTypes = {
  BoatWreck: "boat-wreck",
  AbandonedCamp: "abandoned-camp",
  ToolCache: "tool-cache",
  Workshop: "workshop",
  Forge: "forge",
  Storage: "storage",
  Market: "market",
  Lookout: "lookout",
  RoadSign: "road-sign"
} as const;

export type PoiType = (typeof PoiTypes)[keyof typeof PoiTypes];

export type PoiFootprint = Readonly<{
  widthInTiles: number;
  heightInTiles: number;
}>;

/**
 * PoiDefinition is pure domain data. It describes where a point of interest
 * lives, how much space it occupies, whether it blocks movement, and how close
 * the player must be for it to count as discovered. Rendering, interaction,
 * and future networking all consume this same contract.
 */
export type PoiDefinition = Readonly<{
  id: string;
  type: PoiType;
  name: string;
  anchorTile: TileCoordinate;
  footprint: PoiFootprint;
  blocksMovement: boolean;
  discoveryRadiusInTiles: number;
}>;
