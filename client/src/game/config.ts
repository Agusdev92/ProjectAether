import Phaser from "phaser";
import { BootScene } from "@scenes/BootScene";
import { MainMenuScene } from "@scenes/MainMenuScene";
import { PreloadScene } from "@scenes/PreloadScene";
import { UIScene } from "@scenes/UIScene";
import { WorldScene } from "@scenes/WorldScene";
import { GameConstants } from "@shared/config/GameConstants";

/**
 * The DOM parent is the only browser-specific detail kept in Phaser config.
 * Domain systems should stay unaware of the canvas mount point.
 */
const GAME_PARENT_ID = "game-root";

/**
 * Factory function instead of a mutable exported object so tests and tooling can
 * create isolated configs later without sharing runtime state.
 */
export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: GAME_PARENT_ID,
    width: GameConstants.resolution.width,
    height: GameConstants.resolution.height,
    backgroundColor: GameConstants.colors.pageBackground,
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      antialias: false
    },
    scene: [BootScene, PreloadScene, MainMenuScene, WorldScene, UIScene]
  };
}
