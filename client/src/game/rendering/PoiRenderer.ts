import Phaser from "phaser";
import type { IsometricTilemapRenderer } from "@game/rendering/IsometricTilemapRenderer";
import { createSoftShadow } from "@game/rendering/RenderPrimitives";
import { GameConstants } from "@shared/config/GameConstants";
import { PoiRegistry } from "@world/poi/PoiRegistry";
import { PoiTypes } from "@world/poi/PoiTypes";
import type { PoiDefinition } from "@world/poi/PoiTypes";

/**
 * PoiRenderer presents domain POIs with temporary Phaser primitives. It only
 * reads PoiDefinition data: the domain never knows these placeholders exist,
 * and each visual can be replaced by real art per-type without touching any
 * other system. Zone-sized POI counts are small, so everything is created once
 * and depth-sorted by projected position like the rest of the world.
 */
export class PoiRenderer {
  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly tilemapRenderer: IsometricTilemapRenderer
  ) {}

  public renderAll(pois: readonly PoiDefinition[]): void {
    for (const poi of pois) {
      this.renderPoi(poi);
    }
  }

  private renderPoi(poi: PoiDefinition): void {
    const center = PoiRegistry.footprintCenterWorld(poi);
    const position = this.tilemapRenderer.projectWorldToScreen(center.x, center.y);
    const container = this.createPoiObject(poi);

    container.setPosition(position.x, position.y);
    container.setDepth(GameConstants.depth.entities + position.y + GameConstants.tile.height);
  }

  private createPoiObject(poi: PoiDefinition): Phaser.GameObjects.Container {
    switch (poi.type) {
      case PoiTypes.BoatWreck:
        return this.createBoatWreck();
      case PoiTypes.AbandonedCamp:
        return this.createAbandonedCamp();
      case PoiTypes.ToolCache:
        return this.createToolCache();
      case PoiTypes.Workshop:
        return this.createBuilding(GameConstants.colors.poiWall, GameConstants.colors.poiRoofAlt);
      case PoiTypes.Forge:
        return this.createForge();
      case PoiTypes.Storage:
        return this.createBuilding(GameConstants.colors.poiWall, GameConstants.colors.poiRoof);
      case PoiTypes.Market:
        return this.createMarketStall();
      case PoiTypes.Lookout:
        return this.createLookout();
      case PoiTypes.RoadSign:
        return this.createRoadSign();
    }
  }

  private createBoatWreck(): Phaser.GameObjects.Container {
    const shadow = createSoftShadow(this.scene, 112, 30, 8);
    const hull = this.scene.add.polygon(
      0,
      -8,
      [-52, 0, -38, -18, 34, -22, 50, -4, 36, 10, -34, 12],
      this.color(GameConstants.colors.poiWoodDark),
      1
    );
    const brokenMast = this.scene.add
      .rectangle(6, -40, 6, 44, this.color(GameConstants.colors.poiWood), 1)
      .setRotation(0.35);
    const sailScrap = this.scene.add
      .triangle(16, -44, 0, 0, 26, 8, 4, 30, this.color(GameConstants.colors.poiSail), 0.85)
      .setRotation(0.2);

    hull.setStrokeStyle(2, this.color(GameConstants.colors.playerShadow), 0.6);

    return this.scene.add.container(0, 0, [shadow, hull, brokenMast, sailScrap]);
  }

  private createAbandonedCamp(): Phaser.GameObjects.Container {
    const tent = this.scene.add.triangle(
      -16,
      -12,
      0,
      30,
      22,
      0,
      44,
      30,
      this.color(GameConstants.colors.poiCanvas),
      1
    );
    const fireStones = this.scene.add.ellipse(
      20,
      2,
      26,
      14,
      this.color(GameConstants.colors.rockShadow),
      0.9
    );
    const coldAshes = this.scene.add.ellipse(
      20,
      1,
      14,
      7,
      this.color(GameConstants.colors.playerShadow),
      0.8
    );

    tent.setStrokeStyle(2, this.color(GameConstants.colors.poiWoodDark), 0.8);

    const shadow = createSoftShadow(this.scene, 74, 22, 14);

    return this.scene.add.container(0, 0, [shadow, tent, fireStones, coldAshes]);
  }

  private createToolCache(): Phaser.GameObjects.Container {
    const stump = this.scene.add.rectangle(
      0,
      -6,
      18,
      14,
      this.color(GameConstants.colors.treeTrunk),
      1
    );
    const handle = this.scene.add
      .rectangle(2, -20, 4, 26, this.color(GameConstants.colors.poiWood), 1)
      .setRotation(-0.6);
    const blade = this.scene.add.triangle(
      12,
      -28,
      0,
      0,
      14,
      4,
      4,
      14,
      this.color(GameConstants.colors.poiMetal),
      1
    );

    return this.scene.add.container(0, 0, [stump, handle, blade]);
  }

  private createForge(): Phaser.GameObjects.Container {
    const building = this.createBuilding(
      GameConstants.colors.poiWall,
      GameConstants.colors.poiRoof
    );
    const chimney = this.scene.add.rectangle(
      22,
      -74,
      12,
      22,
      this.color(GameConstants.colors.rockShadow),
      1
    );
    const emberGlow = this.scene.add.ellipse(
      -18,
      -10,
      18,
      12,
      this.color(GameConstants.colors.poiEmber),
      0.9
    );

    building.add([chimney, emberGlow]);

    return building;
  }

  private createMarketStall(): Phaser.GameObjects.Container {
    const counter = this.scene.add.rectangle(
      0,
      -12,
      64,
      20,
      this.color(GameConstants.colors.poiWood),
      1
    );
    const leftPole = this.scene.add.rectangle(
      -28,
      -36,
      5,
      42,
      this.color(GameConstants.colors.poiWoodDark),
      1
    );
    const rightPole = this.scene.add.rectangle(
      28,
      -36,
      5,
      42,
      this.color(GameConstants.colors.poiWoodDark),
      1
    );
    const awning = this.scene.add.polygon(
      0,
      -56,
      [-38, 8, -30, -8, 30, -8, 38, 8],
      this.color(GameConstants.colors.poiAwning),
      1
    );
    const awningStripe = this.scene.add.polygon(
      0,
      -52,
      [-20, 6, -16, -4, 16, -4, 20, 6],
      this.color(GameConstants.colors.poiAwningAlt),
      0.9
    );

    return this.scene.add.container(0, 0, [leftPole, rightPole, counter, awning, awningStripe]);
  }

  private createLookout(): Phaser.GameObjects.Container {
    const leftLeg = this.scene.add.rectangle(
      -16,
      -20,
      6,
      44,
      this.color(GameConstants.colors.poiWoodDark),
      1
    );
    const rightLeg = this.scene.add.rectangle(
      16,
      -20,
      6,
      44,
      this.color(GameConstants.colors.poiWoodDark),
      1
    );
    const platform = this.scene.add.rectangle(
      0,
      -46,
      52,
      10,
      this.color(GameConstants.colors.poiWood),
      1
    );
    const railing = this.scene.add.rectangle(
      0,
      -58,
      52,
      4,
      this.color(GameConstants.colors.poiWoodDark),
      1
    );

    return this.scene.add.container(0, 0, [leftLeg, rightLeg, platform, railing]);
  }

  private createRoadSign(): Phaser.GameObjects.Container {
    const post = this.scene.add.rectangle(
      0,
      -18,
      5,
      36,
      this.color(GameConstants.colors.poiWoodDark),
      1
    );
    const board = this.scene.add.polygon(
      4,
      -32,
      [-16, -7, 14, -7, 22, 0, 14, 7, -16, 7],
      this.color(GameConstants.colors.poiWood),
      1
    );

    board.setStrokeStyle(2, this.color(GameConstants.colors.poiWoodDark), 1);

    return this.scene.add.container(0, 0, [post, board]);
  }

  /** Shared placeholder building: front wall, side wall, and roof slab. */
  private createBuilding(wallColor: string, roofColor: string): Phaser.GameObjects.Container {
    const shadow = createSoftShadow(this.scene, 108, 34, 26);
    const frontWall = this.scene.add.polygon(
      0,
      -18,
      [-44, -14, 0, 8, 0, 40, -44, 18],
      this.color(wallColor),
      1
    );
    const sideWall = this.scene.add.polygon(
      0,
      -18,
      [0, 8, 44, -14, 44, 18, 0, 40],
      this.color(wallColor),
      0.82
    );
    const roof = this.scene.add.polygon(
      0,
      -44,
      [-48, 12, 0, -12, 48, 12, 0, 36],
      this.color(roofColor),
      1
    );
    const door = this.scene.add.polygon(
      -20,
      6,
      [-7, -12, 7, -5, 7, 16, -7, 9],
      this.color(GameConstants.colors.poiWoodDark),
      1
    );

    roof.setStrokeStyle(2, this.color(GameConstants.colors.playerShadow), 0.4);

    return this.scene.add.container(0, 0, [shadow, frontWall, sideWall, roof, door]);
  }

  private color(hex: string): number {
    return Phaser.Display.Color.HexStringToColor(hex).color;
  }
}
