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

  private createCreatureObject(creature: CreaturePresenceView): Phaser.GameObjects.Container {
    const screen = this.tilemapRenderer.projectWorldToScreen(
      creature.position.x,
      creature.position.y
    );
    const shadow = createSoftShadow(this.scene, 48, 16, 10);
    const body = this.scene.add.ellipse(
      0,
      -10,
      40,
      24,
      this.color(GameConstants.colors.creature),
      1
    );
    const head = this.scene.add.ellipse(
      18,
      -14,
      18,
      16,
      this.color(GameConstants.colors.creature),
      1
    );

    body.setStrokeStyle(2, this.color(GameConstants.colors.creatureShadow), 0.6);
    head.setStrokeStyle(2, this.color(GameConstants.colors.creatureShadow), 0.6);

    const container = this.scene.add.container(screen.x, screen.y, [shadow, body, head]);

    container.setDepth(GameConstants.depth.entities + screen.y);

    return container;
  }

  private color(hex: string): number {
    return Phaser.Display.Color.HexStringToColor(hex).color;
  }
}
