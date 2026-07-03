import { GameConstants } from "@shared/config/GameConstants";

export type TileCoordinate = Readonly<{
  x: number;
  y: number;
}>;

export type WorldCoordinate = Readonly<{
  x: number;
  y: number;
}>;

export type ScreenCoordinate = Readonly<{
  x: number;
  y: number;
}>;

/**
 * Converts tile coordinates to the logical world center of that tile. This is
 * used for collision and simulation, independent from the isometric renderer.
 */
export function tileToWorld(tile: TileCoordinate): WorldCoordinate {
  return {
    x: tile.x * GameConstants.tile.collisionSize + GameConstants.tile.collisionSize / 2,
    y: tile.y * GameConstants.tile.collisionSize + GameConstants.tile.collisionSize / 2
  };
}

export function worldToTile(world: WorldCoordinate): TileCoordinate {
  return {
    x: Math.floor(world.x / GameConstants.tile.collisionSize),
    y: Math.floor(world.y / GameConstants.tile.collisionSize)
  };
}

/**
 * Projects the simulation grid to an isometric render plane. Simulation remains
 * square-grid based so pathfinding and networking can stay straightforward.
 */
export function worldToIso(world: WorldCoordinate): ScreenCoordinate {
  const tileX = world.x / GameConstants.tile.collisionSize;
  const tileY = world.y / GameConstants.tile.collisionSize;

  return {
    x: (tileX - tileY) * (GameConstants.tile.width / 2),
    y: (tileX + tileY) * (GameConstants.tile.height / 2)
  };
}
