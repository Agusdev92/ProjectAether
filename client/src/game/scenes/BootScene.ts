import Phaser from "phaser";
import { SceneKeys } from "@game/scene-keys";
import { gameEvents } from "@services/events/GameEvents";

/**
 * BootScene is reserved for the earliest startup responsibilities: validating
 * environment assumptions, preparing global plugins, and loading tiny assets
 * needed by the preload screen itself.
 */
export class BootScene extends Phaser.Scene {
  public constructor() {
    super(SceneKeys.Boot);
  }

  public create(): void {
    gameEvents.emit("game:booted", { timestamp: Date.now() });
    this.scene.start(SceneKeys.Preload);
  }
}
