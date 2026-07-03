import Phaser from "phaser";
import { AssetManifest } from "@assets/AssetManifest";
import { SceneKeys } from "@game/scene-keys";
import { gameEvents } from "@services/events/GameEvents";
import { GameConstants } from "@shared/config/GameConstants";

const ASSET_MANIFEST_VERSION = "0.1.0";

/**
 * PreloadScene will become the central loading pipeline for art, audio, maps,
 * metadata, and remote manifests. For now it displays a deterministic loading
 * state without introducing placeholder assets that would later be deleted.
 */
export class PreloadScene extends Phaser.Scene {
  public constructor() {
    super(SceneKeys.Preload);
  }

  public preload(): void {
    gameEvents.emit("assets:preload-started", {
      manifestVersion: ASSET_MANIFEST_VERSION
    });

    this.renderLoadingView();
  }

  public create(): void {
    gameEvents.emit("assets:preload-completed", {
      loadedAssetCount: countManifestEntries()
    });

    this.scene.start(SceneKeys.MainMenu);
  }

  private renderLoadingView(): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2 - 24, "Project Aether", {
        color: GameConstants.colors.textPrimary,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "34px",
        fontStyle: "600"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 24, "Cargando mundo...", {
        color: GameConstants.colors.textMuted,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "18px"
      })
      .setOrigin(0.5);
  }
}

function countManifestEntries(): number {
  const assetGroups = Object.values(AssetManifest) as ReadonlyArray<
    Readonly<Record<string, unknown>>
  >;

  return assetGroups.reduce((total, assetGroup) => total + Object.keys(assetGroup).length, 0);
}
