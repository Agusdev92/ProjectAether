import Phaser from "phaser";
import { createSoftShadow } from "@game/rendering/RenderPrimitives";
import { GameConstants } from "@shared/config/GameConstants";
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

    this.graphics.fillStyle(
      Phaser.Display.Color.HexStringToColor(tileStyle.fill).color,
      tileStyle.alpha
    );
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

  private createFeatureObject(tile: TileRecord): Phaser.GameObjects.Container {
    if (tile.feature === TileFeatureTypes.Tree) {
      return this.createTreeObject();
    }

    if (tile.feature === TileFeatureTypes.Rock) {
      return this.createRockObject();
    }

    return this.createBushObject();
  }

  private createTreeObject(): Phaser.GameObjects.Container {
    const shadow = createSoftShadow(this.scene, 46, 16, 2);
    const trunk = this.scene.add.rectangle(
      0,
      -18,
      12,
      34,
      Phaser.Display.Color.HexStringToColor(GameConstants.colors.treeTrunk).color,
      1
    );
    const canopy = this.scene.add.ellipse(
      0,
      -48,
      54,
      46,
      Phaser.Display.Color.HexStringToColor(GameConstants.colors.treeCanopy).color,
      1
    );
    const highlight = this.scene.add.ellipse(
      -10,
      -56,
      22,
      16,
      Phaser.Display.Color.HexStringToColor(GameConstants.colors.treeCanopyLight).color,
      0.75
    );

    return this.scene.add.container(0, 0, [shadow, trunk, canopy, highlight]);
  }

  private createRockObject(): Phaser.GameObjects.Container {
    const shadow = this.scene.add.ellipse(
      0,
      2,
      42,
      18,
      Phaser.Display.Color.HexStringToColor(GameConstants.colors.rockShadow).color,
      0.42
    );
    const rock = this.scene.add.polygon(
      0,
      -12,
      [-22, 4, -10, -20, 10, -24, 24, -4, 14, 14, -12, 16],
      Phaser.Display.Color.HexStringToColor(GameConstants.colors.rock).color,
      1
    );

    rock.setStrokeStyle(
      2,
      Phaser.Display.Color.HexStringToColor(GameConstants.colors.rockShadow).color
    );

    return this.scene.add.container(0, 0, [shadow, rock]);
  }

  private createBushObject(): Phaser.GameObjects.Container {
    const shadow = createSoftShadow(this.scene, 38, 13, 0);
    const left = this.scene.add.ellipse(
      -12,
      -8,
      28,
      22,
      Phaser.Display.Color.HexStringToColor(GameConstants.colors.bush).color,
      1
    );
    const right = this.scene.add.ellipse(
      10,
      -10,
      30,
      24,
      Phaser.Display.Color.HexStringToColor(GameConstants.colors.treeCanopyLight).color,
      0.85
    );
    const center = this.scene.add.ellipse(
      0,
      -18,
      26,
      24,
      Phaser.Display.Color.HexStringToColor(GameConstants.colors.bush).color,
      1
    );

    return this.scene.add.container(0, 0, [shadow, left, right, center]);
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
