import Phaser from "phaser";
import type { IsometricTilemapRenderer } from "@game/rendering/IsometricTilemapRenderer";
import { GameConstants } from "@shared/config/GameConstants";
import type { TileCoordinate } from "@world/coordinates/WorldCoordinates";

/**
 * HorizonRenderer draws a static, non-interactive mountain silhouette beyond
 * the playable map's northern edge — built once at scene creation, never
 * touched by the per-tile terrain redraw loop (IsometricTilemapRenderer's
 * renderAround), so it costs nothing at runtime beyond the initial draw.
 *
 * Gives the lookout's existing zoom-out (LookoutCamera, Sprint 4) something
 * new to actually reveal, instead of just a wider view of the same content.
 * Never named, never explained: a shape at the edge of the world, not a
 * place (Pilar 6, Visión a 10 años — "una montaña que no cruzó").
 */
export class HorizonRenderer {
  public constructor(scene: Phaser.Scene, tilemapRenderer: IsometricTilemapRenderer) {
    const anchorTile: TileCoordinate = { x: 11, y: -5 };
    const anchor = tilemapRenderer.projectWorldToScreen(
      anchorTile.x * GameConstants.tile.collisionSize,
      anchorTile.y * GameConstants.tile.collisionSize
    );

    // Farthest layer: paler, more desaturated (atmospheric perspective),
    // barely moves relative to the camera — reads as much farther away.
    this.buildRidge(scene, anchor, {
      scrollFactor: GameConstants.horizon.farLayerScrollFactor,
      color: GameConstants.colors.horizonFar,
      alpha: 0.45,
      peakHeight: 90,
      spread: 1500,
      seed: 11
    });

    // Nearer layer: same cliff palette already used for the western wall, so
    // the silhouette reads as the same world, not a different art style.
    this.buildRidge(scene, anchor, {
      scrollFactor: GameConstants.horizon.nearLayerScrollFactor,
      color: GameConstants.colors.tileCliff,
      alpha: 0.75,
      peakHeight: 130,
      spread: 1100,
      seed: 37
    });
  }

  private buildRidge(
    scene: Phaser.Scene,
    anchor: Phaser.Math.Vector2,
    options: Readonly<{
      scrollFactor: number;
      color: string;
      alpha: number;
      peakHeight: number;
      spread: number;
      seed: number;
    }>
  ): void {
    const peakCount = GameConstants.horizon.peakCount;
    const stepX = options.spread / peakCount;
    const points: number[] = [-options.spread / 2, 60];

    for (let index = 0; index <= peakCount; index += 1) {
      const jitter = ((index * options.seed * 92_821) % 100) / 100;
      const height = options.peakHeight * (0.45 + jitter * 0.55);

      points.push(-options.spread / 2 + index * stepX, -height);
    }

    points.push(options.spread / 2, 60);

    const ridge = scene.add.polygon(
      anchor.x,
      anchor.y,
      points,
      Phaser.Display.Color.HexStringToColor(options.color).color,
      options.alpha
    );

    ridge.setScrollFactor(options.scrollFactor);
    ridge.setDepth(GameConstants.depth.background);
  }
}
