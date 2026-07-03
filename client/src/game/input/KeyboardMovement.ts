import Phaser from "phaser";
import type { MovementVector } from "@entities/EntityTypes";

type MovementKeys = Readonly<{
  up: Phaser.Input.Keyboard.Key;
  cursorUp: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  cursorDown: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  cursorLeft: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  cursorRight: Phaser.Input.Keyboard.Key;
}>;

/**
 * KeyboardMovement converts device input into a domain movement vector. It is
 * the Phaser-facing edge; the Player entity only receives normalized intent.
 */
export class KeyboardMovement {
  private readonly keys: MovementKeys;

  public constructor(scene: Phaser.Scene) {
    const keyboard = getKeyboardPlugin(scene);

    this.keys = {
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      cursorUp: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      cursorDown: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      cursorLeft: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      cursorRight: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
    };

    keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    ]);
  }

  public readMovement(): MovementVector {
    const x = toAxis(
      this.keys.right.isDown || this.keys.cursorRight.isDown,
      this.keys.left.isDown || this.keys.cursorLeft.isDown
    );
    const y = toAxis(
      this.keys.down.isDown || this.keys.cursorDown.isDown,
      this.keys.up.isDown || this.keys.cursorUp.isDown
    );

    return { x, y };
  }
}

function toAxis(positive: boolean, negative: boolean): -1 | 0 | 1 {
  if (positive === negative) {
    return 0;
  }

  return positive ? 1 : -1;
}

function getKeyboardPlugin(scene: Phaser.Scene): Phaser.Input.Keyboard.KeyboardPlugin {
  if (!scene.input.keyboard) {
    throw new Error("Keyboard input is required for player movement.");
  }

  return scene.input.keyboard;
}
