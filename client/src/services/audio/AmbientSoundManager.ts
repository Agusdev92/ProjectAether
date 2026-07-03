import type { SoundPlayer } from "@services/audio/SoundPlayer";
import type { AmbientSoundDefinition } from "@world/atmosphere/AtmosphereTypes";

type ChannelRuntime = {
  readonly definition: AmbientSoundDefinition;
  playing: boolean;
  volume: number;
};

/**
 * AmbientSoundManager owns the ambience soundscape of the active zone: wind,
 * sea, birds, insects, rain, and ambient music channels. It is architecture
 * ahead of content — no audio assets exist yet — so every channel plays only
 * when its asset is actually available through the injected SoundPlayer.
 * The manager never imports Phaser; swapping NullSoundPlayer for a real
 * adapter is the only change needed to make the world audible.
 */
export class AmbientSoundManager {
  private readonly player: SoundPlayer;
  private readonly channels = new Map<string, ChannelRuntime>();

  public constructor(player: SoundPlayer) {
    this.player = player;
  }

  /** Replaces the current channel set with the ambience of a new zone. */
  public loadZoneChannels(definitions: readonly AmbientSoundDefinition[]): void {
    this.stopAll();
    this.channels.clear();

    for (const definition of definitions) {
      if (this.channels.has(definition.id)) {
        throw new Error(`Duplicate ambient sound channel id: ${definition.id}`);
      }

      this.channels.set(definition.id, {
        definition,
        playing: false,
        volume: definition.baseVolume
      });
    }
  }

  /** Starts every channel whose asset exists. Missing assets are skipped silently. */
  public startAmbience(): void {
    for (const channel of this.channels.values()) {
      this.startChannel(channel);
    }
  }

  public stopAll(): void {
    for (const channel of this.channels.values()) {
      if (channel.playing && channel.definition.assetKey) {
        this.player.stop(channel.definition.assetKey);
        channel.playing = false;
      }
    }
  }

  public setChannelVolume(channelId: string, volume: number): void {
    const channel = this.channels.get(channelId);

    if (!channel) {
      return;
    }

    channel.volume = volume;

    if (channel.playing && channel.definition.assetKey) {
      this.player.setVolume(channel.definition.assetKey, volume);
    }
  }

  public get channelIds(): readonly string[] {
    return [...this.channels.keys()];
  }

  private startChannel(channel: ChannelRuntime): void {
    const { assetKey } = channel.definition;

    if (!assetKey || !this.player.hasAsset(assetKey) || channel.playing) {
      return;
    }

    this.player.playLoop(assetKey, channel.volume);
    channel.playing = true;
  }
}
