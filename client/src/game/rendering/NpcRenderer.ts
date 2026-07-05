import Phaser from "phaser";
import type { IsometricTilemapRenderer } from "@game/rendering/IsometricTilemapRenderer";
import { createSoftShadow } from "@game/rendering/RenderPrimitives";
import { GameConstants } from "@shared/config/GameConstants";
import type { NpcPositionView } from "@world/npc/NpcTypes";

/**
 * NpcRenderer presents NPCs with the same placeholder-primitive approach as
 * PoiRenderer. NPC positions are teleports between schedule waypoints (no
 * pathfinding this sprint, see GameConstants.npc's TODO for Sprint 12+
 * pathfinding/animation) — this renderer only softens the pop with a short
 * fade-out/reposition/fade-in so a player looking straight at the NPC when
 * the time of day changes doesn't see an instant jump.
 */
export class NpcRenderer {
  private readonly containers = new Map<string, Phaser.GameObjects.Container>();
  private readonly lastPositionKeys = new Map<string, string>();
  private readonly transitions = new Map<string, Phaser.Tweens.Tween>();

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly tilemapRenderer: IsometricTilemapRenderer
  ) {}

  /** Reconciles every NPC's rendered position with its current domain position. */
  public sync(npcPositions: readonly NpcPositionView[]): void {
    for (const npc of npcPositions) {
      this.syncOne(npc);
    }
  }

  private syncOne(npc: NpcPositionView): void {
    const positionKey = `${npc.position.x}:${npc.position.y}`;
    const existing = this.containers.get(npc.id);

    if (!existing) {
      const container = this.createNpcObject();

      this.positionContainer(container, npc);
      this.containers.set(npc.id, container);
      this.lastPositionKeys.set(npc.id, positionKey);

      return;
    }

    if (this.lastPositionKeys.get(npc.id) === positionKey) {
      return;
    }

    this.lastPositionKeys.set(npc.id, positionKey);
    this.transitionTo(npc.id, existing, npc);
  }

  private transitionTo(
    npcId: string,
    container: Phaser.GameObjects.Container,
    npc: NpcPositionView
  ): void {
    this.transitions.get(npcId)?.stop();

    const halfDuration = GameConstants.npc.waypointFadeDurationMs / 2;

    const fadeOut = this.scene.tweens.add({
      targets: container,
      alpha: 0,
      duration: halfDuration,
      ease: "Sine.easeIn",
      onComplete: () => {
        this.positionContainer(container, npc);

        this.transitions.set(
          npcId,
          this.scene.tweens.add({
            targets: container,
            alpha: 1,
            duration: halfDuration,
            ease: "Sine.easeOut"
          })
        );
      }
    });

    this.transitions.set(npcId, fadeOut);
  }

  private positionContainer(container: Phaser.GameObjects.Container, npc: NpcPositionView): void {
    const screen = this.tilemapRenderer.projectWorldToScreen(npc.position.x, npc.position.y);

    container.setPosition(screen.x, screen.y);
    container.setDepth(GameConstants.depth.entities + screen.y);
  }

  private createNpcObject(): Phaser.GameObjects.Container {
    const shadow = createSoftShadow(this.scene, 40, 14, 10);
    const body = this.scene.add.ellipse(0, -14, 26, 40, this.color(GameConstants.colors.npc), 1);
    const head = this.scene.add.ellipse(0, -34, 18, 18, this.color(GameConstants.colors.npc), 1);

    body.setStrokeStyle(2, this.color(GameConstants.colors.npcShadow), 0.6);
    head.setStrokeStyle(2, this.color(GameConstants.colors.npcShadow), 0.6);

    return this.scene.add.container(0, 0, [shadow, body, head]);
  }

  private color(hex: string): number {
    return Phaser.Display.Color.HexStringToColor(hex).color;
  }
}
