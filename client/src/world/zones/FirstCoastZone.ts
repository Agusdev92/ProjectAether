import {
  AmbientEffectTypes,
  AmbientSoundChannels,
  WeatherTypes
} from "@world/atmosphere/AtmosphereTypes";
import type { TileCoordinate } from "@world/coordinates/WorldCoordinates";
import { InteractableKinds, InteractionVerbs } from "@world/interaction/InteractionTypes";
import { PoiTypes } from "@world/poi/PoiTypes";
import type { PoiDefinition } from "@world/poi/PoiTypes";
import type { TerrainResolver, TerrainSample } from "@world/tilemap/TerrainResolver";
import { TileFeatureTypes, TileTypes } from "@world/tilemap/TileTypes";
import type { TileFeatureType, TileType } from "@world/tilemap/TileTypes";
import type { ZoneDefinition } from "@world/zones/ZoneDefinition";

/**
 * FirstCoastZone is the Sprint 3 prototype of the starting coast described in
 * FIRST_HOUR_EXPERIENCE.md. It is intentionally small: its purpose is to
 * validate exploration flow, sight lines, and distances — not final content.
 *
 * Spatial script (south to north):
 *   sea -> beach (spawn, boat wreck) -> abandoned camp + first tool ->
 *   natural path -> settlement plaza (workshop, forge, storage, market) ->
 *   lookout spur (north-west) and road to the first town (east).
 */

const MAP_SIZE_IN_TILES = 48;

/**
 * Points of Interest of the coast. Every POI is an independent entity: it can
 * gain gameplay later (interaction, interiors, vendors) without modifying the
 * others or the terrain.
 */
const FirstCoastPois: readonly PoiDefinition[] = [
  {
    id: "coast-boat-wreck",
    type: PoiTypes.BoatWreck,
    name: "Restos del naufragio",
    anchorTile: { x: 7, y: 38 },
    footprint: { widthInTiles: 3, heightInTiles: 2 },
    blocksMovement: true,
    discoveryRadiusInTiles: 4
  },
  {
    id: "coast-abandoned-camp",
    type: PoiTypes.AbandonedCamp,
    name: "Campamento abandonado",
    anchorTile: { x: 16, y: 33 },
    footprint: { widthInTiles: 2, heightInTiles: 2 },
    blocksMovement: false,
    discoveryRadiusInTiles: 3
  },
  {
    id: "coast-first-axe",
    type: PoiTypes.ToolCache,
    name: "Hacha abandonada",
    anchorTile: { x: 18, y: 34 },
    footprint: { widthInTiles: 1, heightInTiles: 1 },
    blocksMovement: false,
    discoveryRadiusInTiles: 2
  },
  {
    id: "coast-workshop",
    type: PoiTypes.Workshop,
    name: "Taller",
    anchorTile: { x: 18, y: 12 },
    footprint: { widthInTiles: 2, heightInTiles: 2 },
    blocksMovement: true,
    discoveryRadiusInTiles: 3
  },
  {
    id: "coast-forge",
    type: PoiTypes.Forge,
    name: "Forja",
    anchorTile: { x: 18, y: 15 },
    footprint: { widthInTiles: 2, heightInTiles: 2 },
    blocksMovement: true,
    discoveryRadiusInTiles: 3
  },
  {
    id: "coast-storage",
    type: PoiTypes.Storage,
    name: "Banco",
    anchorTile: { x: 22, y: 9 },
    footprint: { widthInTiles: 2, heightInTiles: 2 },
    blocksMovement: true,
    discoveryRadiusInTiles: 3
  },
  {
    id: "coast-market",
    type: PoiTypes.Market,
    name: "Mercado",
    anchorTile: { x: 26, y: 9 },
    footprint: { widthInTiles: 2, heightInTiles: 2 },
    blocksMovement: true,
    discoveryRadiusInTiles: 3
  },
  {
    id: "coast-lookout",
    type: PoiTypes.Lookout,
    name: "Mirador",
    anchorTile: { x: 11, y: 6 },
    footprint: { widthInTiles: 1, heightInTiles: 1 },
    blocksMovement: false,
    discoveryRadiusInTiles: 2
  },
  {
    id: "coast-road-sign",
    type: PoiTypes.RoadSign,
    name: "Camino al pueblo",
    anchorTile: { x: 44, y: 13 },
    footprint: { widthInTiles: 1, heightInTiles: 1 },
    blocksMovement: false,
    discoveryRadiusInTiles: 3
  }
];

export const FirstCoastZone: ZoneDefinition = {
  tilemap: {
    id: "first-coast",
    name: "La Primera Costa",
    widthInTiles: MAP_SIZE_IN_TILES,
    heightInTiles: MAP_SIZE_IN_TILES,
    chunkSize: 16,
    spawnTile: {
      x: 12,
      y: 38
    }
  },
  terrain: createFirstCoastTerrain(),
  pois: FirstCoastPois,
  atmosphere: {
    initialWeather: WeatherTypes.Wind,
    // Wind blows from the southern sea toward the inland north-east.
    wind: {
      directionX: 0.25,
      directionY: -1,
      baseIntensity: 0.55
    },
    effects: [
      {
        id: "coast-forge-smoke",
        type: AmbientEffectTypes.ForgeSmoke,
        anchorTile: { x: 19, y: 15 },
        enabledByDefault: true
      },
      {
        // FIRST_HOUR_EXPERIENCE defines this campfire as long dead. This is a
        // faint ash wisp, not living smoke; kept as its own toggle so design
        // can silence it without touching anything else.
        id: "coast-camp-ash",
        type: AmbientEffectTypes.CampSmoke,
        anchorTile: { x: 17, y: 34 },
        enabledByDefault: true
      },
      {
        id: "coast-waves",
        type: AmbientEffectTypes.CoastWaves,
        anchorTile: { x: 0, y: 0 },
        enabledByDefault: true
      },
      {
        id: "coast-water-shimmer",
        type: AmbientEffectTypes.WaterShimmer,
        anchorTile: { x: 0, y: 0 },
        enabledByDefault: true
      },
      {
        id: "coast-wind-leaves",
        type: AmbientEffectTypes.WindLeaves,
        anchorTile: { x: 0, y: 0 },
        enabledByDefault: true
      },
      {
        id: "coast-ambient-motes",
        type: AmbientEffectTypes.AmbientMotes,
        anchorTile: { x: 0, y: 0 },
        enabledByDefault: true
      }
    ],
    sounds: [
      { id: "coast-sea", channel: AmbientSoundChannels.Sea, baseVolume: 0.8 },
      { id: "coast-wind", channel: AmbientSoundChannels.Wind, baseVolume: 0.6 },
      { id: "coast-birds", channel: AmbientSoundChannels.Birds, baseVolume: 0.4 },
      { id: "coast-insects", channel: AmbientSoundChannels.Insects, baseVolume: 0.3 },
      { id: "coast-music", channel: AmbientSoundChannels.Music, baseVolume: 0.5 }
    ]
  },
  // Zone interactables anchor to POIs; trees and rocks come from the tile
  // feature source, not from this list.
  interactables: [
    {
      id: "interact-coast-camp",
      kind: InteractableKinds.Camp,
      name: "Campamento abandonado",
      verb: InteractionVerbs.Search,
      poiId: "coast-abandoned-camp",
      radiusInTiles: 2
    },
    {
      id: "interact-coast-forge",
      kind: InteractableKinds.Forge,
      name: "Forja",
      verb: InteractionVerbs.UseStation,
      poiId: "coast-forge",
      radiusInTiles: 2.2
    }
  ]
};

function createFirstCoastTerrain(): TerrainResolver {
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
  if (isCliff(coordinate)) {
    return TileTypes.Cliff;
  }

  if (isSea(coordinate)) {
    return TileTypes.Water;
  }

  if (isBeach(coordinate)) {
    return TileTypes.Sand;
  }

  if (isPath(coordinate)) {
    return TileTypes.Path;
  }

  return (coordinate.x + coordinate.y) % 2 === 0 ? TileTypes.Grass : TileTypes.GrassAlt;
}

function resolveFeatureType(coordinate: TileCoordinate, type: TileType): TileFeatureType {
  if (type !== TileTypes.Grass && type !== TileTypes.GrassAlt) {
    return TileFeatureTypes.None;
  }

  if (isInsideAnyPoiFootprint(coordinate)) {
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

/**
 * The western cliff wall closes one side of the coast so the geography — not
 * an invisible wall — funnels the player inland (FIRST_HOUR principle: limits
 * are always physical and readable).
 */
function isCliff(coordinate: TileCoordinate): boolean {
  return coordinate.x <= 4;
}

/** Open sea along the southern edge, with a gently curved shoreline. */
function isSea(coordinate: TileCoordinate): boolean {
  return coordinate.y >= 41 + Math.sin(coordinate.x / 5) * 1.5;
}

/** The sand band between the shoreline and the vegetation line. */
function isBeach(coordinate: TileCoordinate): boolean {
  return coordinate.y >= 35 + Math.sin(coordinate.x / 7);
}

/**
 * The natural path network: camp to plaza, the plaza itself, the eastern road
 * to the first town, and the short spur climbing to the lookout.
 */
function isPath(coordinate: TileCoordinate): boolean {
  const campToPlaza =
    distanceToSegment(coordinate, { x: 17, y: 34 }, { x: 23, y: 26 }) <= 0.9 ||
    distanceToSegment(coordinate, { x: 23, y: 26 }, { x: 24, y: 17 }) <= 0.9;
  const plaza =
    coordinate.x >= 20 && coordinate.x <= 28 && coordinate.y >= 12 && coordinate.y <= 16;
  const roadToTown =
    coordinate.x >= 28 &&
    coordinate.x <= 46 &&
    Math.abs(coordinate.y - (14 + Math.sin(coordinate.x / 6))) <= 0.9;
  const lookoutSpur = distanceToSegment(coordinate, { x: 20, y: 12 }, { x: 11, y: 7 }) <= 0.9;

  return campToPlaza || plaza || roadToTown || lookoutSpur;
}

/** Two groves flanking the path so sight lines open and close while walking. */
function isTree(coordinate: TileCoordinate): boolean {
  const westernGrove =
    coordinate.x >= 8 && coordinate.x <= 18 && coordinate.y >= 20 && coordinate.y <= 33;
  const easternGrove =
    coordinate.x >= 30 && coordinate.x <= 44 && coordinate.y >= 17 && coordinate.y <= 33;

  return (westernGrove || easternGrove) && hashedChance(coordinate, 3);
}

/** Rock outcrops at the cliff base and around the lookout hill. */
function isRock(coordinate: TileCoordinate): boolean {
  const cliffBase = coordinate.x >= 5 && coordinate.x <= 7;
  const lookoutHill =
    coordinate.x >= 7 && coordinate.x <= 15 && coordinate.y >= 3 && coordinate.y <= 8;

  // Hill density stays below 1/3: playtest showed 1/2 could trap the player
  // between blocking rocks when wandering off the spur path.
  return (cliffBase && hashedChance(coordinate, 3)) || (lookoutHill && hashedChance(coordinate, 3));
}

/** Scattered bushes on the vegetation fringe just above the beach. */
function isBush(coordinate: TileCoordinate): boolean {
  return coordinate.y >= 30 && coordinate.y <= 36 && hashedChance(coordinate, 6);
}

function isInsideAnyPoiFootprint(coordinate: TileCoordinate): boolean {
  return FirstCoastPois.some(
    (poi) =>
      coordinate.x >= poi.anchorTile.x - 1 &&
      coordinate.x < poi.anchorTile.x + poi.footprint.widthInTiles + 1 &&
      coordinate.y >= poi.anchorTile.y - 1 &&
      coordinate.y < poi.anchorTile.y + poi.footprint.heightInTiles + 1
  );
}

function distanceToSegment(
  point: TileCoordinate,
  start: TileCoordinate,
  end: TileCoordinate
): number {
  const segmentX = end.x - start.x;
  const segmentY = end.y - start.y;
  const squaredLength = segmentX * segmentX + segmentY * segmentY;

  if (squaredLength === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const rawProjection =
    ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) / squaredLength;
  const projection = Math.max(0, Math.min(1, rawProjection));
  const closestX = start.x + projection * segmentX;
  const closestY = start.y + projection * segmentY;

  return Math.hypot(point.x - closestX, point.y - closestY);
}

function hashedChance(coordinate: TileCoordinate, divisor: number): boolean {
  const hash = coordinate.x * 73_856_093 + coordinate.y * 19_349_663;

  return Math.abs(hash) % divisor === 0;
}
