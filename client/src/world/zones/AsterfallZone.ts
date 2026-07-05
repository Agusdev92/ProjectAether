import { GameConstants } from "@shared/config/GameConstants";
import { WeatherTypes } from "@world/atmosphere/AtmosphereTypes";
import type { TileCoordinate } from "@world/coordinates/WorldCoordinates";
import type { TerrainResolver, TerrainSample } from "@world/tilemap/TerrainResolver";
import { TileFeatureTypes, TileTypes } from "@world/tilemap/TileTypes";
import type { TileFeatureType, TileType } from "@world/tilemap/TileTypes";
import type { ZoneDefinition } from "@world/zones/ZoneDefinition";

/**
 * Asterfall is the original prototype zone. Its terrain rules were moved here
 * from WorldTilemap so the tilemap engine stays map-agnostic. Behavior is
 * unchanged: same roads, river, pond, groves, ridge, and bushes as Sprint 2.
 */
export const AsterfallZone: ZoneDefinition = {
  tilemap: {
    id: GameConstants.world.mapId,
    name: "Asterfall",
    widthInTiles: GameConstants.world.widthInTiles,
    heightInTiles: GameConstants.world.heightInTiles,
    chunkSize: GameConstants.world.chunkSize,
    spawnTile: {
      x: 14,
      y: 16
    }
  },
  terrain: createAsterfallTerrain(),
  pois: [],
  atmosphere: {
    initialWeather: WeatherTypes.Clear,
    wind: {
      directionX: 1,
      directionY: 0,
      baseIntensity: 0.3
    },
    effects: [],
    sounds: []
  },
  interactables: [],
  npcs: []
};

function createAsterfallTerrain(): TerrainResolver {
  return {
    sampleTile(coordinate: TileCoordinate): TerrainSample {
      const type = resolveTileType(coordinate);

      return {
        type,
        feature: resolveFeatureType(coordinate, type)
      };
    }
  };
}

function resolveTileType(coordinate: TileCoordinate): TileType {
  if (isWater(coordinate)) {
    return TileTypes.Water;
  }

  if (isPath(coordinate)) {
    return TileTypes.Path;
  }

  return (coordinate.x + coordinate.y) % 2 === 0 ? TileTypes.Grass : TileTypes.GrassAlt;
}

function resolveFeatureType(coordinate: TileCoordinate, type: TileType): TileFeatureType {
  if (type === TileTypes.Water || type === TileTypes.Path) {
    return TileFeatureTypes.None;
  }

  if (isTree(coordinate)) {
    return TileFeatureTypes.Tree;
  }

  if (isRock(coordinate)) {
    return TileFeatureTypes.Rock;
  }

  if (isBush(coordinate)) {
    return TileFeatureTypes.Bush;
  }

  return TileFeatureTypes.None;
}

function isPath(coordinate: TileCoordinate): boolean {
  const mainRoad = Math.abs(coordinate.y - 16 - Math.sin(coordinate.x / 6) * 2) <= 1;
  const southRoad =
    coordinate.x > 12 && coordinate.x < 48 && Math.abs(coordinate.x - coordinate.y) <= 1;

  return mainRoad || southRoad;
}

function isWater(coordinate: TileCoordinate): boolean {
  const riverCenter = 58 + Math.sin(coordinate.y / 5) * 4;
  const river = Math.abs(coordinate.x - riverCenter) <= 2;
  const pond = Math.pow(coordinate.x - 24, 2) / 64 + Math.pow(coordinate.y - 42, 2) / 25 <= 1;

  return river || pond;
}

function isTree(coordinate: TileCoordinate): boolean {
  const northernGrove =
    coordinate.y > 4 && coordinate.y < 28 && coordinate.x > 30 && coordinate.x < 48;
  const westernGrove =
    coordinate.x > 5 && coordinate.x < 18 && coordinate.y > 28 && coordinate.y < 56;

  return (northernGrove || westernGrove) && hashedChance(coordinate, 5);
}

function isRock(coordinate: TileCoordinate): boolean {
  const ridge = coordinate.x > 64 && coordinate.x < 82 && coordinate.y > 18 && coordinate.y < 40;

  return ridge && hashedChance(coordinate, 4);
}

function isBush(coordinate: TileCoordinate): boolean {
  const nearRoad = Math.abs(coordinate.y - 18 - Math.sin(coordinate.x / 6) * 2) <= 4;

  return nearRoad && hashedChance(coordinate, 7);
}

function hashedChance(coordinate: TileCoordinate, divisor: number): boolean {
  const hash = coordinate.x * 73_856_093 + coordinate.y * 19_349_663;

  return Math.abs(hash) % divisor === 0;
}
