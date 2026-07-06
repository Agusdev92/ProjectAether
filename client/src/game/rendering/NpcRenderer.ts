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

  /**
   * Human-proportioned silhouette (legs/torso/head instead of one blob) and
   * a wide fisherman's hat in `colors.poiSail` — the same tone already used
   * on the shipwreck's sail, so the color itself ties Amaro to the sea
   * without adding a single new palette entry. The hat is his identity
   * marker: a future second NPC needs only a different silhouette
   * accessory to read as a different person at a glance, no name required.
   * The head sits slightly forward and low rather than centered, a stoop
   * standing in for age with no extra geometry. A slow breathing pulse
   * (scaleY yoyo, same tween shape EnvironmentEffects already uses for
   * water shimmer) lives on an inner "body" container so the shadow stays
   * still — only living things breathe.
   */
  private createNpcObject(): Phaser.GameObjects.Container {
    const shadow = createSoftShadow(this.scene, 42, 15, 12);
    const legs = this.scene.add.rectangle(
      0,
      6,
      16,
      20,
      this.color(GameConstants.colors.poiWoodDark),
      1
    );
    const torso = this.scene.add.ellipse(-2, -16, 22, 30, this.color(GameConstants.colors.npc), 1);
    const head = this.scene.add.ellipse(-4, -38, 15, 15, this.color(GameConstants.colors.npc), 1);
    const hat = this.scene.add.ellipse(-4, -44, 28, 9, this.color(GameConstants.colors.poiSail), 1);

    legs.setStrokeStyle(2, this.color(GameConstants.colors.npcShadow), 0.5);
    torso.setStrokeStyle(2, this.color(GameConstants.colors.npcShadow), 0.6);
    head.setStrokeStyle(2, this.color(GameConstants.colors.npcShadow), 0.6);
    hat.setStrokeStyle(2, this.color(GameConstants.colors.npcShadow), 0.5);

    const body = this.scene.add.container(0, 0, [legs, torso, head, hat]);

    this.scene.tweens.add({
      targets: body,
      scaleY: 1.025,
      duration: 2200,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1
    });

    return this.scene.add.container(0, 0, [shadow, body]);
  }

  private color(hex: string): number {
    return Phaser.Display.Color.HexStringToColor(hex).color;
  }
}
