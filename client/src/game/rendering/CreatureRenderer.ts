import Phaser from "phaser";
import type { IsometricTilemapRenderer } from "@game/rendering/IsometricTilemapRenderer";
import { createSoftShadow } from "@game/rendering/RenderPrimitives";
import { GameConstants } from "@shared/config/GameConstants";
import type { CreaturePresenceView } from "@world/creature/CreatureTypes";

/**
 * CreatureRenderer presents creatures with the same placeholder-primitive
 * approach as NpcRenderer. Creatures don't move (no patrol/pathfinding this
 * sprint, same documented limitation as NPCs) — the only state that changes
 * is visibility, hidden while a creature is exhausted (fled, or recovering
 * between swings).
 */
export class CreatureRenderer {
  private readonly containers = new Map<string, Phaser.GameObjects.Container>();

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly tilemapRenderer: IsometricTilemapRenderer
  ) {}

  /** Reconciles every creature's rendered visibility with its current presence. */
  public sync(presence: readonly CreaturePresenceView[]): void {
    for (const creature of presence) {
      const container = this.containers.get(creature.id) ?? this.createCreatureObject(creature);

      this.containers.set(creature.id, container);
      container.setVisible(creature.visible);
    }
  }

  /**
   * Boar-specific silhouette: a low, wide body (lomo bajo) instead of a
   * round blob, a darkened dorsal ridge, a protruding snout, and short legs
   * peeking from beneath — reads as "jabalí", not "generic quadruped". Legs
   * render before the body in the children list so they tuck under its
   * silhouette instead of floating in front of it. The same slow breathing
   * pulse as NpcRenderer lives on an inner "body" container, shadow
   * excluded, so it stays grounded.
   */
  private createCreatureObject(creature: CreaturePresenceView): Phaser.GameObjects.Container {
    const screen = this.tilemapRenderer.projectWorldToScreen(
      creature.position.x,
      creature.position.y
    );
    const shadow = createSoftShadow(this.scene, 50, 17, 10);
    const legBack = this.scene.add.rectangle(
      -14,
      4,
      8,
      11,
      this.color(GameConstants.colors.creatureShadow),
      1
    );
    const legFront = this.scene.add.rectangle(
      12,
      5,
      8,
      11,
      this.color(GameConstants.colors.creatureShadow),
      1
    );
    const body = this.scene.add.ellipse(
      0,
      -10,
      46,
      20,
      this.color(GameConstants.colors.creature),
      1
    );
    const ridge = this.scene.add.ellipse(
      -2,
      -18,
      28,
      8,
      this.darken(GameConstants.colors.creature, 18),
      1
    );
    const head = this.scene.add.ellipse(
      20,
      -13,
      16,
      14,
      this.color(GameConstants.colors.creature),
      1
    );
    const snout = this.scene.add.ellipse(
      29,
      -10,
      11,
      8,
      this.darken(GameConstants.colors.creature, 10),
      1
    );

    body.setStrokeStyle(2, this.color(GameConstants.colors.creatureShadow), 0.6);
    head.setStrokeStyle(2, this.color(GameConstants.colors.creatureShadow), 0.6);

    const body3d = this.scene.add.container(0, 0, [legBack, legFront, body, ridge, head, snout]);

    this.scene.tweens.add({
      targets: body3d,
      scaleY: 1.03,
      duration: 1900,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1
    });

    const container = this.scene.add.container(screen.x, screen.y, [shadow, body3d]);

    container.setDepth(GameConstants.depth.entities + screen.y);

    return container;
  }

  private color(hex: string): number {
    return Phaser.Display.Color.HexStringToColor(hex).color;
  }

  private darken(hex: string, amount: number): number {
    return Phaser.Display.Color.HexStringToColor(hex).darken(amount).color;
  }
}
