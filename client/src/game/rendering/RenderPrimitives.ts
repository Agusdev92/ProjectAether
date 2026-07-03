import Phaser from "phaser";
import { GameConstants } from "@shared/config/GameConstants";

/**
 * Shared primitive builders for the placeholder art pipeline. Render-layer
 * helpers only: they keep visual conventions (shadows, colors) consistent
 * across renderers without any of them owning the other.
 */

/** Soft ground shadow used under props and POIs; grounds objects visually. */
export function createSoftShadow(
  scene: Phaser.Scene,
  width: number,
  height: number,
  offsetY: number
): Phaser.GameObjects.Ellipse {
  return scene.add.ellipse(
    0,
    offsetY,
    width,
    height,
    Phaser.Display.Color.HexStringToColor(GameConstants.colors.softShadow).color,
    0.32
  );
}
