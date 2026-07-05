import Phaser from "phaser";
import type { IsometricTilemapRenderer } from "@game/rendering/IsometricTilemapRenderer";
import { GameConstants } from "@shared/config/GameConstants";
import { tileToWorld } from "@world/coordinates/WorldCoordinates";
import type { DangerZoneDefinition } from "@world/danger/DangerTypes";

/**
 * DangerZoneRenderer draws a translucent ground stain over every currently
 * active danger zone — visible regardless of player position, so the risk is
 * legible before anyone steps inside (Pilar 11: never opaque risk). Reuses
 * the existing deep-water color: this is a tide, not a new hazard palette.
 * Depth sits just above terrain but below entities, so it reads as a stain on
 * the sand, never floating over the player or props.
 */
export class DangerZoneRenderer {
  private readonly overlays = new Map<string, Phaser.GameObjects.Ellipse>();

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly tilemapRenderer: IsometricTilemapRenderer
  ) {}

  /** Shows the overlay for every zone in activeZones; hides every other one. */
  public sync(activeZones: readonly DangerZoneDefinition[]): void {
    const activeIds = new Set(activeZones.map((zone) => zone.id));

    for (const zone of activeZones) {
      const overlay = this.overlays.get(zone.id) ?? this.createOverlay(zone);

      this.overlays.set(zone.id, overlay);
      overlay.setVisible(true);
    }

    for (const [zoneId, overlay] of this.overlays) {
      if (!activeIds.has(zoneId)) {
        overlay.setVisible(false);
      }
    }
  }

  private createOverlay(zone: DangerZoneDefinition): Phaser.GameObjects.Ellipse {
    const center = tileToWorld(zone.anchorTile);
    const screen = this.tilemapRenderer.projectWorldToScreen(center.x, center.y);
    const overlay = this.scene.add.ellipse(
      screen.x,
      screen.y,
      zone.radiusInTiles * GameConstants.tile.width,
      zone.radiusInTiles * GameConstants.tile.height,
      Phaser.Display.Color.HexStringToColor(GameConstants.colors.tileWaterDeep).color,
      0.35
    );

    overlay.setDepth(GameConstants.depth.terrain + 1);

    return overlay;
  }
}
