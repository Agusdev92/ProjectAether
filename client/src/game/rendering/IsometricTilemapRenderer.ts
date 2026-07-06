import Phaser from "phaser";
import { createSoftShadow } from "@game/rendering/RenderPrimitives";
import { GameConstants } from "@shared/config/GameConstants";
import type { TileCoordinate } from "@world/coordinates/WorldCoordinates";
import { worldToIso } from "@world/coordinates/WorldCoordinates";
import { TileFeatureTypes, TileTypes } from "@world/tilemap/TileTypes";
import type { TileRecord, WorldTilemap } from "@world/tilemap/WorldTilemap";

/**
 * IsometricTilemapRenderer draws only the area near the camera focus. It is a
 * first step toward chunked streaming without making the domain tilemap depend
 * on Phaser display objects.
 */
export class IsometricTilemapRenderer {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly mapOrigin: Phaser.Math.Vector2;
  private readonly propObjects = new Map<string, Phaser.GameObjects.Container>();
  private lastRenderKey = "";

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly tilemap: WorldTilemap
  ) {
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(GameConstants.depth.terrain);
    this.mapOrigin = new Phaser.Math.Vector2(
      (tilemap.definition.heightInTiles * GameConstants.tile.width) / 2 + 200,
      120
    );
  }

  public get origin(): Phaser.Math.Vector2 {
    return this.mapOrigin.clone();
  }

  public projectWorldToScreen(worldX: number, worldY: number): Phaser.Math.Vector2 {
    const projected = worldToIso({ x: worldX, y: worldY });

    return new Phaser.Math.Vector2(projected.x + this.mapOrigin.x, projected.y + this.mapOrigin.y);
  }

  public renderAround(worldX: number, worldY: number): void {
    const focusTileX = Math.floor(worldX / GameConstants.tile.collisionSize);
    const focusTileY = Math.floor(worldY / GameConstants.tile.collisionSize);
    const renderKey = `${focusTileX}:${focusTileY}`;

    if (renderKey === this.lastRenderKey) {
      return;
    }

    this.lastRenderKey = renderKey;
    this.graphics.clear();

    const viewRadius = 18;
    const viewport = {
      left: (focusTileX - viewRadius) * GameConstants.tile.collisionSize,
      right: (focusTileX + viewRadius) * GameConstants.tile.collisionSize,
      top: (focusTileY - viewRadius) * GameConstants.tile.collisionSize,
      bottom: (focusTileY + viewRadius) * GameConstants.tile.collisionSize
    };

    const visibleTiles = this.tilemap
      .getVisibleTiles(viewport)
      .sort((a, b) => a.coordinate.x + a.coordinate.y - (b.coordinate.x + b.coordinate.y));
    const visiblePropKeys = new Set<string>();

    for (const tile of visibleTiles) {
      this.drawTile(tile);
      this.syncFeature(tile, visiblePropKeys);
    }

    for (const [key, propObject] of this.propObjects) {
      propObject.setVisible(visiblePropKeys.has(key));
    }
  }

  private drawTile(tile: TileRecord): void {
    const worldX = tile.coordinate.x * GameConstants.tile.collisionSize;
    const worldY = tile.coordinate.y * GameConstants.tile.collisionSize;
    const position = this.projectWorldToScreen(worldX, worldY);
    const tileStyle = resolveTileStyle(tile);

    this.graphics.fillStyle(jitterFillColor(tileStyle.fill, tile.coordinate), tileStyle.alpha);
    this.graphics.lineStyle(1, Phaser.Display.Color.HexStringToColor(tileStyle.stroke).color, 0.65);
    this.graphics.beginPath();
    this.graphics.moveTo(position.x, position.y);
    this.graphics.lineTo(
      position.x + GameConstants.tile.width / 2,
      position.y + GameConstants.tile.height / 2
    );
    this.graphics.lineTo(position.x, position.y + GameConstants.tile.height);
    this.graphics.lineTo(
      position.x - GameConstants.tile.width / 2,
      position.y + GameConstants.tile.height / 2
    );
    this.graphics.closePath();
    this.graphics.fillPath();
    this.graphics.strokePath();

    if (tile.type === TileTypes.Water) {
      this.drawWaterHighlight(position);
    }
  }

  private syncFeature(tile: TileRecord, visiblePropKeys: Set<string>): void {
    if (tile.feature === TileFeatureTypes.None) {
      return;
    }

    const key = `${tile.coordinate.x}:${tile.coordinate.y}`;
    const worldX = tile.coordinate.x * GameConstants.tile.collisionSize;
    const worldY = tile.coordinate.y * GameConstants.tile.collisionSize;
    const position = this.projectWorldToScreen(worldX, worldY);
    const propObject = this.propObjects.get(key) ?? this.createFeatureObject(tile);

    propObject.setPosition(position.x, position.y + GameConstants.tile.height * 0.48);
    propObject.setDepth(GameConstants.depth.entities + position.y + GameConstants.tile.height);
    propObject.setVisible(true);
    visiblePropKeys.add(key);
    this.propObjects.set(key, propObject);
  }

  /**
   * Picks a variant deterministically per tile (same tile always renders the
   * same shape, no flicker) so identical feature kinds don't all look
   * pixel-identical across the map — variety within the existing catalog,
   * never new content.
   */
  private createFeatureObject(tile: TileRecord): Phaser.GameObjects.Container {
    if (tile.feature === TileFeatureTypes.Tree) {
      return this.createTreeObject(pickVariant(tile.coordinate, 3));
    }

    if (tile.feature === TileFeatureTypes.Rock) {
      return this.createRockObject(pickVariant(tile.coordinate, 3));
    }

    return this.createBushObject(pickVariant(tile.coordinate, 2));
  }

  private createTreeObject(variant: number): Phaser.GameObjects.Container {
    const shapes = TreeVariants[variant];
    const shadow = createSoftShadow(this.scene, 46, 16, 2);
    const trunk = this.scene.add.rectangle(
      0,
      shapes.trunkY,
      12,
      shapes.trunkHeight,
      this.color(GameConstants.colors.treeTrunk),
      1
    );
    const canopy = this.scene.add.ellipse(
      0,
      shapes.canopyY,
      shapes.canopyWidth,
      shapes.canopyHeight,
      this.color(GameConstants.colors.treeCanopy),
      1
    );
    const highlight = this.scene.add.ellipse(
      shapes.highlightX,
      shapes.canopyY - shapes.canopyHeight * 0.17,
      22,
      16,
      this.color(GameConstants.colors.treeCanopyLight),
      0.75
    );

    return this.scene.add.container(0, 0, [shadow, trunk, canopy, highlight]);
  }

  private createRockObject(variant: number): Phaser.GameObjects.Container {
    const points = RockVariants[variant];
    const shadow = this.scene.add.ellipse(
      GameConstants.lighting.shadowOffsetX,
      2,
      42,
      18,
      this.color(GameConstants.colors.rockShadow),
      0.42
    );
    const rock = this.scene.add.polygon(0, -12, points, this.color(GameConstants.colors.rock), 1);

    rock.setStrokeStyle(2, this.color(GameConstants.colors.rockShadow));

    return this.scene.add.container(0, 0, [shadow, rock]);
  }

  private createBushObject(variant: number): Phaser.GameObjects.Container {
    const shapes = BushVariants[variant];
    const shadow = createSoftShadow(this.scene, 38, 13, 0);
    const left = this.scene.add.ellipse(
      -12,
      -8,
      shapes.sideWidth,
      shapes.sideHeight,
      this.color(GameConstants.colors.bush),
      1
    );
    const right = this.scene.add.ellipse(
      10,
      -10,
      shapes.sideWidth + 2,
      shapes.sideHeight + 2,
      this.color(GameConstants.colors.treeCanopyLight),
      0.85
    );
    const center = this.scene.add.ellipse(
      0,
      -18,
      shapes.centerWidth,
      shapes.centerHeight,
      this.color(GameConstants.colors.bush),
      1
    );

    return this.scene.add.container(0, 0, [shadow, left, right, center]);
  }

  private color(hex: string): number {
    return Phaser.Display.Color.HexStringToColor(hex).color;
  }

  private drawWaterHighlight(position: Phaser.Math.Vector2): void {
    this.graphics.lineStyle(1, Phaser.Display.Color.HexStringToColor("#9fd2dc").color, 0.35);
    this.graphics.beginPath();
    this.graphics.moveTo(position.x - 18, position.y + GameConstants.tile.height / 2);
    this.graphics.lineTo(position.x + 18, position.y + GameConstants.tile.height / 2);
    this.graphics.strokePath();
  }
}

type TileStyle = Readonly<{
  fill: string;
  stroke: string;
  alpha: number;
}>;

function resolveTileStyle(tile: TileRecord): TileStyle {
  if (tile.type === TileTypes.Blocked) {
    return {
      fill: GameConstants.colors.tileBlocked,
      stroke: GameConstants.colors.gridLine,
      alpha: 0.96
    };
  }

  if (tile.type === TileTypes.Path) {
    return {
      fill: GameConstants.colors.tilePath,
      stroke: GameConstants.colors.tilePathEdge,
      alpha: 0.94
    };
  }

  if (tile.type === TileTypes.Water) {
    return {
      fill: GameConstants.colors.tileWater,
      stroke: GameConstants.colors.tileWaterDeep,
      alpha: 0.92
    };
  }

  if (tile.type === TileTypes.Sand) {
    return {
      fill: GameConstants.colors.tileSand,
      stroke: GameConstants.colors.tileSandEdge,
      alpha: 0.92
    };
  }

  if (tile.type === TileTypes.Cliff) {
    return {
      fill: GameConstants.colors.tileCliff,
      stroke: GameConstants.colors.tileCliffEdge,
      alpha: 0.96
    };
  }

  if (tile.type === TileTypes.GrassAlt) {
    return {
      fill: GameConstants.colors.tileGrassAlt,
      stroke: GameConstants.colors.gridLine,
      alpha: 0.88
    };
  }

  return {
    fill: GameConstants.colors.tileGrass,
    stroke: GameConstants.colors.gridLine,
    alpha: 0.88
  };
}

/**
 * Deterministic per-tile pick: the same tile always resolves to the same
 * variant (no flicker across redraws), but neighboring tiles of the same
 * feature diverge — variety within the existing catalog, no new content.
 * Independent multipliers from the zone terrain hashes, so feature variant
 * selection never correlates with whether a tile has a feature at all.
 */
function pickVariant(coordinate: TileCoordinate, variantCount: number): number {
  const hash = Math.abs(coordinate.x * 92_821 + coordinate.y * 68_917);

  return hash % variantCount;
}

/**
 * Subtle deterministic lightness jitter on tile fill color — breaks up the
 * flat, uniform look of a solid-fill terrain without adding a single extra
 * draw call (same fillStyle/strokePath count as before, just a computed
 * color). Most tiles (3 of 5 buckets) stay unchanged so the effect reads as
 * texture, not noise.
 */
function jitterFillColor(hex: string, coordinate: TileCoordinate): number {
  const hash = Math.abs(coordinate.x * 51_431 + coordinate.y * 37_249);
  const bucket = hash % 5;
  const color = Phaser.Display.Color.HexStringToColor(hex);

  if (bucket === 0) {
    return color.darken(6).color;
  }

  if (bucket === 1) {
    return color.brighten(6).color;
  }

  return color.color;
}

type TreeShape = Readonly<{
  trunkY: number;
  trunkHeight: number;
  canopyY: number;
  canopyWidth: number;
  canopyHeight: number;
  highlightX: number;
}>;

/** Three canopy silhouettes so a grove doesn't read as one tree copy-pasted. */
const TreeVariants: readonly TreeShape[] = [
  {
    trunkY: -18,
    trunkHeight: 34,
    canopyY: -48,
    canopyWidth: 54,
    canopyHeight: 46,
    highlightX: -10
  },
  { trunkY: -15, trunkHeight: 28, canopyY: -44, canopyWidth: 46, canopyHeight: 40, highlightX: 8 },
  { trunkY: -21, trunkHeight: 38, canopyY: -52, canopyWidth: 46, canopyHeight: 54, highlightX: -6 }
];

/** Three rock silhouettes; same palette, different profile. */
const RockVariants: readonly (readonly number[])[] = [
  [-22, 4, -10, -20, 10, -24, 24, -4, 14, 14, -12, 16],
  [-18, 6, -14, -18, 4, -26, 20, -14, 22, 8, 6, 18, -10, 14],
  [-24, 2, -6, -14, 8, -16, 26, -2, 16, 10, -2, 12, -16, 10]
];

type BushShape = Readonly<{
  sideWidth: number;
  sideHeight: number;
  centerWidth: number;
  centerHeight: number;
}>;

/** Two bush sizes so ground cover doesn't tile visibly. */
const BushVariants: readonly BushShape[] = [
  { sideWidth: 28, sideHeight: 22, centerWidth: 26, centerHeight: 24 },
  { sideWidth: 22, sideHeight: 18, centerWidth: 20, centerHeight: 19 }
];
