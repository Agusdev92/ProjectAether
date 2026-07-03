import Phaser from "phaser";
import { SceneKeys } from "@game/scene-keys";
import { gameEvents } from "@services/events/GameEvents";
import { GameConstants } from "@shared/config/GameConstants";

/**
 * MainMenuScene owns top-level navigation before the player enters the world.
 * Authentication, character selection, and realm selection can be introduced
 * here later as separate flows without coupling them to world simulation.
 */
export class MainMenuScene extends Phaser.Scene {
  public constructor() {
    super(SceneKeys.MainMenu);
  }

  public create(): void {
    const { width, height } = this.scale;

    gameEvents.emit("scene:main-menu-entered");

    this.add
      .text(width / 2, height / 2 - 96, "Project Aether", {
        color: GameConstants.colors.textPrimary,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "56px",
        fontStyle: "700"
      })
      .setOrigin(0.5);

    const startButton = this.add
      .text(width / 2, height / 2 + 24, "Entrar al mundo", {
        align: "center",
        backgroundColor: GameConstants.colors.accent,
        color: GameConstants.colors.accentText,
        fixedWidth: 260,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "22px",
        padding: { x: 24, y: 16 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startButton.on(Phaser.Input.Events.POINTER_OVER, () => {
      startButton.setStyle({ backgroundColor: GameConstants.colors.accentHover });
    });

    startButton.on(Phaser.Input.Events.POINTER_OUT, () => {
      startButton.setStyle({ backgroundColor: GameConstants.colors.accent });
    });

    startButton.on(Phaser.Input.Events.POINTER_UP, () => {
      this.scene.start(SceneKeys.World);
    });
  }
}
