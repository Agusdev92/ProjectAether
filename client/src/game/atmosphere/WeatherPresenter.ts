import Phaser from "phaser";
import { GameConstants } from "@shared/config/GameConstants";

/**
 * WeatherPresenter is the diegetic signal that the sky itself changed — a
 * screen-level tint, not a HUD widget, never a number anywhere (Pilar 8:
 * consequences, not interface). Lives on the world camera exactly like
 * PlayerVitalityPresenter's vignette. Fades over several seconds rather than
 * snapping: the underlying weather only ever changes once per calendar day,
 * so the transition itself should read as the sky settling, not a flag flip.
 */
export class WeatherPresenter {
  private readonly tint: Phaser.GameObjects.Rectangle;
  private lastIsStorm = false;

  public constructor(private readonly scene: Phaser.Scene) {
    const { width, height } = GameConstants.resolution;

    this.tint = scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      Phaser.Display.Color.HexStringToColor(GameConstants.colors.tileCliffEdge).color,
      0
    );
    this.tint.setScrollFactor(0);
    this.tint.setDepth(GameConstants.depth.modal);
  }

  /** Call every frame with whether today's weather is a storm. */
  public sync(isStorm: boolean): void {
    if (isStorm === this.lastIsStorm) {
      return;
    }

    this.lastIsStorm = isStorm;
    this.scene.tweens.add({
      targets: this.tint,
      alpha: isStorm ? GameConstants.weather.stormTintAlpha : 0,
      duration: 4000,
      ease: "Sine.easeInOut"
    });
  }
}
