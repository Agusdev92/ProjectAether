import type Phaser from "phaser";
import { GameConstants } from "@shared/config/GameConstants";

export type LookoutTransition = "entered" | "exited";

/**
 * LookoutCamera softens the main camera when the player stands at a lookout:
 * a slow zoom-out that widens the view of the landscape. It follows the
 * FIRST_HOUR_EXPERIENCE rules strictly — no cinematics, no control lock, no
 * text. The player keeps full control the entire time; the camera only
 * breathes out, and breathes back in when they walk away.
 */
export class LookoutCamera {
  private active = false;
  private tween?: Phaser.Tweens.Tween;

  public constructor(private readonly scene: Phaser.Scene) {}

  /**
   * Reconciles the camera with the domain fact "the player is at a lookout".
   * Returns the transition that happened this frame, if any, so the scene can
   * announce it through GameEvents.
   */
  public sync(atLookout: boolean): LookoutTransition | undefined {
    if (atLookout === this.active) {
      return undefined;
    }

    this.active = atLookout;
    this.tween?.stop();
    this.tween = this.scene.tweens.add({
      targets: this.scene.cameras.main,
      zoom: atLookout ? GameConstants.atmosphere.lookoutZoom : 1,
      duration: atLookout
        ? GameConstants.atmosphere.lookoutZoomInDurationMs
        : GameConstants.atmosphere.lookoutZoomOutDurationMs,
      ease: "Sine.easeInOut"
    });

    return atLookout ? "entered" : "exited";
  }
}
