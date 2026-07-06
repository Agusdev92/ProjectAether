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
    const container = this.createObject(item);

    if (!container) {
      return;
    }

    container.setPosition(position.x, position.y);
    container.setDepth(GameConstants.depth.entities + position.y);
  }

  private createObject(item: GroundClutterItem): Phaser.GameObjects.Container | undefined {
    const variant = pickVariant(item.position);

    switch (item.kind) {
      case InteractableKinds.DriftwoodPile:
        return this.createDriftwoodPile(variant);
      case InteractableKinds.LooseStones:
        return this.createLooseStones(variant);
      default:
        return undefined;
    }
  }

  /** Two arrangements so the handful of piles scattered near spawn don't repeat. */
  private createDriftwoodPile(variant: number): Phaser.GameObjects.Container {
    const shadow = createSoftShadow(this.scene, 26, 10, 4);
    const rotationA = variant === 0 ? 0.25 : 0.45;
    const rotationB = variant === 0 ? -0.35 : -0.15;
    const stickA = this.scene.add
      .rectangle(-4, 0, 26, 5, this.color(GameConstants.colors.poiWood), 1)
      .setRotation(rotationA);
    const stickB = this.scene.add
      .rectangle(4, -2, variant === 0 ? 22 : 27, 5, this.color(GameConstants.colors.poiWoodDark), 1)
      .setRotation(rotationB);

    return this.scene.add.container(0, 0, [shadow, stickA, stickB]);
  }

  private createLooseStones(variant: number): Phaser.GameObjects.Container {
    const shadow = createSoftShadow(this.scene, 24, 9, 3);
    const sizeScale = variant === 0 ? 1 : 0.8;
    const left = this.scene.add.ellipse(
      -7,
      -1,
      12 * sizeScale,
      9 * sizeScale,
      this.color(GameConstants.colors.rock),
      1
    );
    const right = this.scene.add.ellipse(
      6,
      1,
      10 / sizeScale,
      8 / sizeScale,
      this.color(GameConstants.colors.rockShadow),
      1
    );

    return this.scene.add.container(0, 0, [shadow, left, right]);
  }

  private color(hex: string): number {
    return Phaser.Display.Color.HexStringToColor(hex).color;
  }
}

/** Deterministic per-item variant (0 or 1) from its fixed world position. */
function pickVariant(position: WorldCoordinate): number {
  const hash = Math.abs(position.x * 92_821 + position.y * 68_917);

  return hash % 2;
}
