import { GameConstants } from "@shared/config/GameConstants";
import type { CollisionProvider } from "@world/collision/CollisionProvider";
import { worldToTile } from "@world/coordinates/WorldCoordinates";
import type { TileCoordinate, WorldCoordinate } from "@world/coordinates/WorldCoordinates";
import type { TerrainResolver } from "@world/tilemap/TerrainResolver";
import {
  TileDefinitions,
  TileFeatureDefinitions,
  TileFeatureTypes,
  TileTypes
} from "@world/tilemap/TileTypes";
import type { TileFeatureType, TileType } from "@world/tilemap/TileTypes";

export type WorldTilemapDefinition = Readonly<{
  id: string;
  name: string;
  widthInTiles: number;
  heightInTiles: number;
  chunkSize: number;
  spawnTile: TileCoordinate;
}>;

export type TileRecord = Readonly<{
  coordinate: TileCoordinate;
  type: TileType;
  feature: TileFeatureType;
  blocksMovement: boolean;
}>;

/**
 * WorldTilemap stores map topology in domain space. Terrain content is
 * delegated to an injected TerrainResolver so the engine stays map-agnostic:
 * new zones bring their own rules, and future streamed chunks can replace the
 * resolver without changing movement, collision, or UI contracts. The map
 * border is always blocked, regardless of resolver output.
 */
export class WorldTilemap implements CollisionProvider {
  public readonly definition: WorldTilemapDefinition;

  private readonly terrain: TerrainResolver;

  public constructor(definition: WorldTilemapDefinition, terrain: TerrainResolver) {
    this.definition = definition;
    this.terrain = terrain;
  }

  public get spawnWorldPosition(): WorldCoordinate {
    return {
      x:
        this.definition.spawnTile.x * GameConstants.tile.collisionSize +
        GameConstants.tile.collisionSize / 2,
      y:
        this.definition.spawnTile.y * GameConstants.tile.collisionSize +
        GameConstants.tile.collisionSize / 2
    };
  }

  public getTileAt(coordinate: TileCoordinate): TileRecord {
    if (this.isBorder(coordinate)) {
      return {
        coordinate,
        type: TileTypes.Blocked,
        feature: TileFeatureTypes.None,
        blocksMovement: true
      };
    }

    const sample = this.terrain.sampleTile(coordinate);

    return {
      coordinate,
      type: sample.type,
      feature: sample.feature,
      blocksMovement:
        TileDefinitions[sample.type].blocksMovement ||
        TileFeatureDefinitions[sample.feature].blocksMovement
    };
  }

  public isBlockedAtWorld(worldX: number, worldY: number): boolean {
    const tile = worldToTile({ x: worldX, y: worldY });

    if (!this.isInsideMap(tile)) {
      return true;
    }

    return this.getTileAt(tile).blocksMovement;
  }

  public getVisibleTiles(
    viewport: Readonly<{ left: number; right: number; top: number; bottom: number }>
  ): TileRecord[] {
    const padding = 4;
    const minX = Math.max(
      0,
      Math.floor(viewport.left / GameConstants.tile.collisionSize) - padding
    );
    const maxX = Math.min(
      this.definition.widthInTiles - 1,
      Math.ceil(viewport.right / GameConstants.tile.collisionSize) + padding
    );
    const minY = Math.max(0, Math.floor(viewport.top / GameConstants.tile.collisionSize) - padding);
    const maxY = Math.min(
      this.definition.heightInTiles - 1,
      Math.ceil(viewport.bottom / GameConstants.tile.collisionSize) + padding
    );
    const tiles: TileRecord[] = [];

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        tiles.push(this.getTileAt({ x, y }));
      }
    }

    return tiles;
  }

  private isBorder(coordinate: TileCoordinate): boolean {
    return (
      coordinate.x === 0 ||
      coordinate.y === 0 ||
      coordinate.x === this.definition.widthInTiles - 1 ||
      coordinate.y === this.definition.heightInTiles - 1
    );
  }

  private isInsideMap(coordinate: TileCoordinate): boolean {
    return (
      coordinate.x >= 0 &&
      coordinate.y >= 0 &&
      coordinate.x < this.definition.widthInTiles &&
      coordinate.y < this.definition.heightInTiles
    );
  }
}
