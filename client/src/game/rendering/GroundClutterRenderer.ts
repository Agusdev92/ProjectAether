import Phaser from "phaser";
import type { IsometricTilemapRenderer } from "@game/rendering/IsometricTilemapRenderer";
import { createSoftShadow } from "@game/rendering/RenderPrimitives";
import { GameConstants } from "@shared/config/GameConstants";
import type { WorldCoordinate } from "@world/coordinates/WorldCoordinates";
import { InteractableKinds } from "@world/interaction/InteractionTypes";

/**
 * One piece of ground clutter to render: a zone-declared interactable that
 * isn't anchored to a POI (loose driftwood, loose stones). Small, low-key
 * placeholders — deliberately less prominent than POI buildings or terrain
 * props, since these are meant to be found while walking, not noticed from
 * afar (FIRST_HOUR_EXPERIENCE Momento 2: "sin ningún destaque visual especial").
 */
export type GroundClutterItem = Readonly<{
  kind: string;
  position: WorldCoordinate;
}>;

/**
 * GroundClutterRenderer presents zone-declared, non-POI interactables with
 * temporary Phaser primitives. Reads only kind + position: the domain never
 * knows these placeholders exist, and each kind can be replaced by real art
 * independently, following the same pattern as PoiRenderer.
 */
export class GroundClutterRenderer {
  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly tilemapRenderer: IsometricTilemapRenderer
  ) {}

  public renderAll(items: readonly GroundClutterItem[]): void {
    for (const item of items) {
      this.renderItem(item);
    }
  }

  private renderItem(item: GroundClutterItem): void {
    const position = this.tilemapRenderer.projectWorldToScreen(item.position.x, item.position.y);
    const container = this.createObject(item.kind);

    if (!container) {
      return;
    }

    container.setPosition(position.x, position.y);
    container.setDepth(GameConstants.depth.entities + position.y);
  }

  private createObject(kind: string): Phaser.GameObjects.Container | undefined {
    switch (kind) {
      case InteractableKinds.DriftwoodPile:
        return this.createDriftwoodPile();
      case InteractableKinds.LooseStones:
        return this.createLooseStones();
      default:
        return undefined;
    }
  }

  private createDriftwoodPile(): Phaser.GameObjects.Container {
    const shadow = createSoftShadow(this.scene, 26, 10, 4);
    const stickA = this.scene.add
      .rectangle(-4, 0, 26, 5, this.color(GameConstants.colors.poiWood), 1)
      .setRotation(0.25);
    const stickB = this.scene.add
      .rectangle(4, -2, 22, 5, this.color(GameConstants.colors.poiWoodDark), 1)
      .setRotation(-0.35);

    return this.scene.add.container(0, 0, [shadow, stickA, stickB]);
  }

  private createLooseStones(): Phaser.GameObjects.Container {
    const shadow = createSoftShadow(this.scene, 24, 9, 3);
    const left = this.scene.add.ellipse(-7, -1, 12, 9, this.color(GameConstants.colors.rock), 1);
    const right = this.scene.add.ellipse(
      6,
      1,
      10,
      8,
      this.color(GameConstants.colors.rockShadow),
      1
    );

    return this.scene.add.container(0, 0, [shadow, left, right]);
  }

  private color(hex: string): number {
    return Phaser.Display.Color.HexStringToColor(hex).color;
  }
}
