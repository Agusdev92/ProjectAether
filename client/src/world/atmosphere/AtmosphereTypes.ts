import type { TileCoordinate } from "@world/coordinates/WorldCoordinates";

/**
 * WeatherTypes enumerates every weather the atmosphere system can express.
 * Only Clear and Wind have behavior today; the rest exist so zones, events,
 * and networking can reference them without future contract changes.
 */
export const WeatherTypes = {
  Clear: "clear",
  Wind: "wind",
  Rain: "rain",
  Fog: "fog",
  Storm: "storm",
  Snow: "snow"
} as const;

export type WeatherType = (typeof WeatherTypes)[keyof typeof WeatherTypes];

/**
 * AmbientEffectTypes enumerates the visual ambient effects a zone can place.
 * Each type is presented independently: adding or replacing one visual never
 * touches the others.
 */
export const AmbientEffectTypes = {
  ForgeSmoke: "forge-smoke",
  CampSmoke: "camp-smoke",
  CoastWaves: "coast-waves",
  WaterShimmer: "water-shimmer",
  WindLeaves: "wind-leaves",
  AmbientMotes: "ambient-motes"
} as const;

export type AmbientEffectType = (typeof AmbientEffectTypes)[keyof typeof AmbientEffectTypes];

/**
 * AmbientSoundChannels enumerates the audio channels the ambience of a zone
 * can use. Real playback arrives when audio assets exist; the contract is
 * final so zones can already declare their soundscape.
 */
export const AmbientSoundChannels = {
  Wind: "wind",
  Sea: "sea",
  Birds: "birds",
  Insects: "insects",
  Rain: "rain",
  Leaves: "leaves",
  Music: "music"
} as const;

export type AmbientSoundChannel = (typeof AmbientSoundChannels)[keyof typeof AmbientSoundChannels];

/** A single ambient visual effect placed by a zone. Individually toggleable. */
export type AmbientEffectDefinition = Readonly<{
  id: string;
  type: AmbientEffectType;
  anchorTile: TileCoordinate;
  enabledByDefault: boolean;
}>;

/**
 * A single ambience audio channel declared by a zone. assetKey stays optional
 * on purpose: zones can declare their soundscape before audio files exist.
 * spatial is optional too: without it, a channel plays as a constant
 * baseVolume bed everywhere (Wind, Birds); with it, the channel fades
 * linearly to zero at falloffRadiusInTiles (Sea, Leaves) — same
 * anchorTile+radius idiom already used for POIs/DangerZones/Interactables,
 * continuous instead of binary.
 */
export type AmbientSoundDefinition = Readonly<{
  id: string;
  channel: AmbientSoundChannel;
  assetKey?: string;
  baseVolume: number;
  spatial?: Readonly<{
    anchorTile: TileCoordinate;
    falloffRadiusInTiles: number;
  }>;
}>;

/** Resolved playback volume for one ambient sound channel, ready for presentation. */
export type AmbientChannelVolumeView = Readonly<{
  id: string;
  volume: number;
}>;

/** Wind as domain data: a direction in world space plus current strength 0..1. */
export type WindState = Readonly<{
  directionX: number;
  directionY: number;
  intensity: number;
}>;

/** Snapshot of one effect with its live enabled state. */
export type AmbientEffectState = Readonly<{
  definition: AmbientEffectDefinition;
  enabled: boolean;
}>;

/** Everything a zone declares about its atmosphere. */
export type ZoneAtmosphereDefinition = Readonly<{
  initialWeather: WeatherType;
  wind: Readonly<{
    directionX: number;
    directionY: number;
    baseIntensity: number;
  }>;
  effects: readonly AmbientEffectDefinition[];
  sounds: readonly AmbientSoundDefinition[];
}>;
