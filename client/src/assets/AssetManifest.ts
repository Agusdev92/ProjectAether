/**
 * AssetManifest is the single source of truth for client-side asset keys and
 * URLs. Scenes should request assets through this manifest so future pipelines
 * can add hashing, CDN origins, zone packs, or manifest validation centrally.
 */
export const AssetManifest = {
  images: {},
  spritesheets: {},
  audio: {},
  tilemaps: {},
  data: {}
} as const satisfies AssetManifestDefinition;

export type AssetCategory = "images" | "spritesheets" | "audio" | "tilemaps" | "data";

export type AssetEntry = Readonly<{
  key: string;
  path: string;
}>;

export type SpritesheetAssetEntry = AssetEntry &
  Readonly<{
    frame: {
      width: number;
      height: number;
      margin?: number;
      spacing?: number;
    };
  }>;

export type AssetManifestDefinition = Readonly<{
  images: Readonly<Record<string, AssetEntry>>;
  spritesheets: Readonly<Record<string, SpritesheetAssetEntry>>;
  audio: Readonly<Record<string, AssetEntry>>;
  tilemaps: Readonly<Record<string, AssetEntry>>;
  data: Readonly<Record<string, AssetEntry>>;
}>;
