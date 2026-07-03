import Phaser from "phaser";

/**
 * ActionKey is the Phaser-facing edge for any single action key (interact,
 * inventory, future map or emotes). Scenes ask "was it just pressed?" once
 * per frame; the domain never sees key codes.
 */
export class ActionKey {
  private readonly key: Phaser.Input.Keyboard.Key;

  public constructor(scene: Phaser.Scene, keyCode: number) {
    if (!scene.input.keyboard) {
      throw new Error("Keyboard input is required for action keys.");
    }

    this.key = scene.input.keyboard.addKey(keyCode);
  }

  public justPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.key);
  }
}
