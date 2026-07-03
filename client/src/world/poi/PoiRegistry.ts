import { GameConstants } from "@shared/config/GameConstants";
import type { CollisionProvider } from "@world/collision/CollisionProvider";
import { worldToTile } from "@world/coordinates/WorldCoordinates";
import type { TileCoordinate, WorldCoordinate } from "@world/coordinates/WorldCoordinates";
import type { PoiDefinition, PoiType } from "@world/poi/PoiTypes";

/**
 * PoiRegistry owns every Point of Interest of the active zone in domain space.
 * It resolves POI collisions through the same CollisionProvider contract the
 * tilemap uses, and tracks first-time discoveries so presentation layers can
 * react without the registry knowing anything about rendering or events.
 */
export class PoiRegistry implements CollisionProvider {
  private readonly pois: readonly PoiDefinition[];
  private readonly discoveredIds = new Set<string>();

  public constructor(pois: readonly PoiDefinition[]) {
    assertUniquePoiIds(pois);
    this.pois = [...pois];
  }

  public get all(): readonly PoiDefinition[] {
    return this.pois;
  }

  public isDiscovered(poiId: string): boolean {
    return this.discoveredIds.has(poiId);
  }

  public isBlockedAtWorld(worldX: number, worldY: number): boolean {
    const tile = worldToTile({ x: worldX, y: worldY });

    return this.pois.some((poi) => poi.blocksMovement && containsTile(poi, tile));
  }

  /**
   * Marks every POI within its discovery radius of the given position as
   * discovered and returns only the newly discovered ones. Callers decide how
   * to announce them; the registry stays silent by design.
   */
  public discoverNear(position: WorldCoordinate): readonly PoiDefinition[] {
    const playerTile = worldToTile(position);
    const newlyDiscovered: PoiDefinition[] = [];

    for (const poi of this.pois) {
      if (this.discoveredIds.has(poi.id)) {
        continue;
      }

      if (tileDistanceToFootprintCenter(playerTile, poi) <= poi.discoveryRadiusInTiles) {
        this.discoveredIds.add(poi.id);
        newlyDiscovered.push(poi);
      }
    }

    return newlyDiscovered;
  }

  /**
   * Returns the closest POI of the given type within the radius, or undefined.
   * Distances are measured in tiles to the footprint center. Used today for
   * lookout proximity; interaction ranges will reuse the same query.
   */
  public findNearestOfType(
    type: PoiType,
    position: WorldCoordinate,
    radiusInTiles: number
  ): PoiDefinition | undefined {
    const tile = worldToTile(position);
    let nearest: PoiDefinition | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const poi of this.pois) {
      if (poi.type !== type) {
        continue;
      }

      const distance = tileDistanceToFootprintCenter(tile, poi);

      if (distance <= radiusInTiles && distance < nearestDistance) {
        nearest = poi;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  /**
   * Returns the world-space center of a POI footprint. Useful for rendering
   * anchors and future interaction ranges without duplicating footprint math.
   */
  public static footprintCenterWorld(poi: PoiDefinition): WorldCoordinate {
    const centerTileX = poi.anchorTile.x + poi.footprint.widthInTiles / 2;
    const centerTileY = poi.anchorTile.y + poi.footprint.heightInTiles / 2;

    return {
      x: centerTileX * GameConstants.tile.collisionSize,
      y: centerTileY * GameConstants.tile.collisionSize
    };
  }
}

function assertUniquePoiIds(pois: readonly PoiDefinition[]): void {
  const seenIds = new Set<string>();

  for (const poi of pois) {
    if (seenIds.has(poi.id)) {
      throw new Error(`Duplicate POI id detected: ${poi.id}`);
    }

    seenIds.add(poi.id);
  }
}

function containsTile(poi: PoiDefinition, tile: TileCoordinate): boolean {
  return (
    tile.x >= poi.anchorTile.x &&
    tile.x < poi.anchorTile.x + poi.footprint.widthInTiles &&
    tile.y >= poi.anchorTile.y &&
    tile.y < poi.anchorTile.y + poi.footprint.heightInTiles
  );
}

function tileDistanceToFootprintCenter(tile: TileCoordinate, poi: PoiDefinition): number {
  const centerX = poi.anchorTile.x + (poi.footprint.widthInTiles - 1) / 2;
  const centerY = poi.anchorTile.y + (poi.footprint.heightInTiles - 1) / 2;

  return Math.hypot(tile.x - centerX, tile.y - centerY);
}
