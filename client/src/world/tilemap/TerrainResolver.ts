import type { TileCoordinate } from "@world/coordinates/WorldCoordinates";
import type { TileFeatureType, TileType } from "@world/tilemap/TileTypes";

export type TerrainSample = Readonly<{
  type: TileType;
  feature: TileFeatureType;
}>;

/**
 * TerrainResolver is the strategy that decides what exists on each tile of a
 * map. WorldTilemap stays generic while every zone module owns its own terrain
 * rules, so new zones never require touching the tilemap engine. Future
 * streamed or server-authored maps only need to provide another resolver.
 */
export type TerrainResolver = Readonly<{
  sampleTile(coordinate: TileCoordinate): TerrainSample;
}>;
