import Phaser from "phaser";
import type { IsometricTilemapRenderer } from "@game/rendering/IsometricTilemapRenderer";
import { GameConstants } from "@shared/config/GameConstants";
import type { Interactable } from "@world/interaction/InteractionTypes";

/**
 * InteractionIndicator is the small floating "E" badge shown over the focused
 * interactable. Deliberately quiet — a hint, not a marker: it only appears
 * when the player is already close, so it never guides from afar
 * (FIRST_HOUR: the world signals, the interface stays silent).
 */
export class InteractionIndicator {
  private readonly container: Phaser.GameObjects.Container;
  private bobElapsed = 0;

  public constructor(
    scene: Phaser.Scene,
    private readonly tilemapRenderer: IsometricTilemapRenderer
  ) {
    const badge = scene.add.circle(
      0,
      0,
      13,
      Phaser.Display.Color.HexStringToColor(GameConstants.colors.surface).color,
      0.92
    );

    badge.setStrokeStyle(
      2,
      Phaser.Display.Color.HexStringToColor(GameConstants.colors.accent).color,
      1
    );

    const label = scene.add
      .text(0, 0, "E", {
        color: GameConstants.colors.accent,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "14px",
        fontStyle: "bold"
      })
      .setOrigin(0.5, 0.5);

    this.container = scene.add.container(0, 0, [badge, label]);
    this.container.setVisible(false);
  }

  /** Repositions over the focused interactable, or hides when there is none. */
  public sync(focused: Interactable | undefined, deltaSeconds: number): void {
    if (!focused) {
      this.container.setVisible(false);

      return;
    }

    this.bobElapsed += deltaSeconds;

    const position = this.tilemapRenderer.projectWorldToScreen(
      focused.position.x,
      focused.position.y
    );
    const bob = Math.sin(this.bobElapsed * 3.2) * 3;

    this.container.setPosition(position.x, position.y - 74 + bob);
    this.container.setDepth(GameConstants.depth.worldOverlay + position.y + 500);
    this.container.setVisible(true);
  }
}
