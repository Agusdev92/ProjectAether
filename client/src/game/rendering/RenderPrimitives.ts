import Phaser from "phaser";
import { GameConstants } from "@shared/config/GameConstants";

/**
 * Shared primitive builders for the placeholder art pipeline. Render-layer
 * helpers only: they keep visual conventions (shadows, colors) consistent
 * across renderers without any of them owning the other.
 */

/**
 * Soft ground shadow used under props, POIs, NPCs, creatures, and the player;
 * grounds objects visually. Offset consistently on the x-axis
 * (GameConstants.lighting.shadowOffsetX) so every shadow in the world implies
 * the same light-source direction instead of each object being lit straight
 * from above in isolation.
 */
export function createSoftShadow(
  scene: Phaser.Scene,
  width: number,
  height: number,
  offsetY: number
): Phaser.GameObjects.Ellipse {
  return scene.add.ellipse(
    GameConstants.lighting.shadowOffsetX,
    offsetY,
    width,
    height,
    Phaser.Display.Color.HexStringToColor(GameConstants.colors.softShadow).color,
    0.32
  );
}
