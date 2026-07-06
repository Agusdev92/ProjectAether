/**
 * SoundPlayer is the port between the ambience service and whatever audio
 * backend the game uses. Keeping it here lets AmbientSoundManager stay free of
 * Phaser: a PhaserSoundPlayer adapter will implement this contract in the game
 * layer once real audio assets exist.
 */
export type SoundPlayer = Readonly<{
  hasAsset(assetKey: string): boolean;
  playLoop(assetKey: string, volume: number): void;
  setVolume(assetKey: string, volume: number): void;
  stop(assetKey: string): void;
  /** Global mute/volume control, independent of any individual channel. */
  setMasterVolume(volume: number): void;
}>;

/**
 * NullSoundPlayer is the active implementation while the project has no audio
 * files. Every operation is a silent no-op, so zones can already declare their
 * soundscape and the wiring stays exercised end to end.
 */
export class NullSoundPlayer implements SoundPlayer {
  public hasAsset(): boolean {
    return false;
  }

  public playLoop(): void {
    // Intentionally silent: no audio assets exist yet.
  }

  public setVolume(): void {
    // Intentionally silent: no audio assets exist yet.
  }

  public stop(): void {
    // Intentionally silent: no audio assets exist yet.
  }

  public setMasterVolume(): void {
    // Intentionally silent: no audio assets exist yet.
  }
}
