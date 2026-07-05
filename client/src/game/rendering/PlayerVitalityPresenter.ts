import Phaser from "phaser";
import { GameConstants } from "@shared/config/GameConstants";

/**
 * PlayerVitalityPresenter is the diegetic replacement for a health bar
 * (Pilar 8: consequences, not interface). Taking a hit gets a brief camera
 * flash + shake; how hurt the player is shows as a continuous screen-edge
 * vignette. Both live on the world camera itself, not a HUD panel — a
 * perception effect, never a widget, and never a number anywhere.
 */
export class PlayerVitalityPresenter {
  private readonly vignette: Phaser.GameObjects.Rectangle;
  private readonly flashColor: Phaser.Display.Color;
  private lastRatio = 1;

  public constructor(private readonly scene: Phaser.Scene) {
    const { width, height } = GameConstants.resolution;

    this.flashColor = Phaser.Display.Color.HexStringToColor(GameConstants.colors.danger);
    this.vignette = scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      this.flashColor.color,
      0
    );
    this.vignette.setScrollFactor(0);
    this.vignette.setDepth(GameConstants.depth.modal);
  }

  /** Call every frame with the player's current health ratio (0..1). */
  public sync(healthRatio: number): void {
    if (healthRatio < this.lastRatio) {
      this.scene.cameras.main.flash(
        GameConstants.combat.damageFlashDurationMs,
        this.flashColor.red,
        this.flashColor.green,
        this.flashColor.blue
      );
      this.scene.cameras.main.shake(
        GameConstants.combat.damageShakeDurationMs,
        GameConstants.combat.damageShakeIntensity
      );
    }

    this.lastRatio = healthRatio;
    this.vignette.setAlpha((1 - healthRatio) * 0.5);
  }
}
