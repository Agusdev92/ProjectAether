import type Phaser from "phaser";
import type { SoundPlayer } from "@services/audio/SoundPlayer";

/**
 * PhaserSoundPlayer is the real adapter Sprint 4 anticipated: swapping
 * NullSoundPlayer for this is the only change needed to make the world
 * audible. Wraps Phaser's own Sound Manager; AmbientSoundManager never knows
 * the difference, it only ever talks to the SoundPlayer port.
 */
export class PhaserSoundPlayer implements SoundPlayer {
  private readonly sounds = new Map<string, Phaser.Sound.BaseSound>();

  public constructor(private readonly scene: Phaser.Scene) {}

  public hasAsset(assetKey: string): boolean {
    return this.scene.cache.audio.has(assetKey);
  }

  public playLoop(assetKey: string, volume: number): void {
    const sound = this.scene.sound.add(assetKey, { loop: true, volume });

    sound.play();
    this.sounds.set(assetKey, sound);
  }

  public setVolume(assetKey: string, volume: number): void {
    const sound = this.sounds.get(assetKey);

    if (sound && isVolumeControllable(sound)) {
      sound.setVolume(volume);
    }
  }

  public stop(assetKey: string): void {
    const sound = this.sounds.get(assetKey);

    sound?.stop();
    sound?.destroy();
    this.sounds.delete(assetKey);
  }

  public setMasterVolume(volume: number): void {
    this.scene.sound.volume = volume;
  }
}

function isVolumeControllable(
  sound: Phaser.Sound.BaseSound
): sound is Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound {
  return "setVolume" in sound;
}
