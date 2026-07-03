import Phaser from "phaser";
import type { IsometricTilemapRenderer } from "@game/rendering/IsometricTilemapRenderer";
import { GameConstants } from "@shared/config/GameConstants";
import { AmbientEffectTypes } from "@world/atmosphere/AtmosphereTypes";
import type { AmbientEffectState, WindState } from "@world/atmosphere/AtmosphereTypes";
import { worldToIso } from "@world/coordinates/WorldCoordinates";
import type { TileCoordinate } from "@world/coordinates/WorldCoordinates";
import { TileTypes } from "@world/tilemap/TileTypes";
import type { WorldTilemap } from "@world/tilemap/WorldTilemap";

/** Presentation controller for one ambient effect; toggled from domain state. */
type EffectController = Readonly<{
  setEnabled(enabled: boolean): void;
}>;

type SmokeStyle = Readonly<{
  color: string;
  intervalMs: number;
  riseInPixels: number;
  startAlpha: number;
  baseSize: number;
}>;

/** Dense, living smoke: the settlement forge at work. */
const ForgeSmokeStyle: SmokeStyle = {
  color: GameConstants.colors.smoke,
  intervalMs: 380,
  riseInPixels: 110,
  startAlpha: 0.55,
  baseSize: 13
};

/** A faint dying wisp: the abandoned camp fire went cold long ago. */
const CampAshStyle: SmokeStyle = {
  color: GameConstants.colors.smokeAsh,
  intervalMs: 1700,
  riseInPixels: 42,
  startAlpha: 0.22,
  baseSize: 7
};

/**
 * EnvironmentEffects presents zone ambient effects (smoke, waves, shimmer)
 * with temporary Phaser primitives. It is a pure consumer of domain state:
 * every frame it syncs against AtmosphereManager effect toggles, so effects
 * can be enabled or disabled individually at runtime without special cases.
 */
export class EnvironmentEffects {
  private readonly controllers = new Map<string, EffectController>();
  private readonly lastEnabled = new Map<string, boolean>();

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly tilemapRenderer: IsometricTilemapRenderer,
    private readonly tilemap: WorldTilemap,
    private readonly readWind: () => WindState
  ) {}

  /** Builds one controller per supported effect. Unknown types are ignored. */
  public build(effects: readonly AmbientEffectState[]): void {
    for (const effect of effects) {
      const controller = this.createController(effect);

      if (controller) {
        this.controllers.set(effect.definition.id, controller);
      }
    }

    this.sync(effects);
  }

  /** Applies domain toggle state to presentation. Cheap: only reacts to changes. */
  public sync(effects: readonly AmbientEffectState[]): void {
    for (const effect of effects) {
      const controller = this.controllers.get(effect.definition.id);

      if (!controller || this.lastEnabled.get(effect.definition.id) === effect.enabled) {
        continue;
      }

      this.lastEnabled.set(effect.definition.id, effect.enabled);
      controller.setEnabled(effect.enabled);
    }
  }

  private createController(effect: AmbientEffectState): EffectController | undefined {
    switch (effect.definition.type) {
      case AmbientEffectTypes.ForgeSmoke:
        return this.createSmokeController(effect.definition.anchorTile, ForgeSmokeStyle);
      case AmbientEffectTypes.CampSmoke:
        return this.createSmokeController(effect.definition.anchorTile, CampAshStyle);
      case AmbientEffectTypes.CoastWaves:
        return this.createCoastWavesController();
      case AmbientEffectTypes.WaterShimmer:
        return this.createWaterShimmerController();
      default:
        // WindLeaves and AmbientMotes are handled by AmbientParticleSystem.
        return undefined;
    }
  }

  private createSmokeController(anchorTile: TileCoordinate, style: SmokeStyle): EffectController {
    const anchorWorldX = (anchorTile.x + 0.5) * GameConstants.tile.collisionSize;
    const anchorWorldY = (anchorTile.y + 0.5) * GameConstants.tile.collisionSize;
    const timer = this.scene.time.addEvent({
      delay: style.intervalMs,
      loop: true,
      paused: true,
      callback: () => this.spawnSmokePuff(anchorWorldX, anchorWorldY, style)
    });

    return {
      setEnabled: (enabled: boolean): void => {
        timer.paused = !enabled;
      }
    };
  }

  private spawnSmokePuff(anchorWorldX: number, anchorWorldY: number, style: SmokeStyle): void {
    const position = this.tilemapRenderer.projectWorldToScreen(anchorWorldX, anchorWorldY);
    const wind = this.readWind();
    const windScreen = projectWindToScreen(wind);
    const jitterX = Phaser.Math.Between(-4, 4);
    const puff = this.scene.add.ellipse(
      position.x + jitterX,
      position.y - 58,
      style.baseSize,
      style.baseSize * 0.8,
      Phaser.Display.Color.HexStringToColor(style.color).color,
      style.startAlpha
    );

    puff.setDepth(GameConstants.depth.entities + position.y + 220);
    this.scene.tweens.add({
      targets: puff,
      x: puff.x + windScreen.x * 46 * wind.intensity,
      y: puff.y - style.riseInPixels,
      scaleX: 2.1,
      scaleY: 1.9,
      alpha: 0,
      duration: 2600,
      ease: "Sine.easeOut",
      onComplete: () => puff.destroy()
    });
  }

  /** Foam pulses on every water tile that touches sand: the living shoreline. */
  private createCoastWavesController(): EffectController {
    return this.createWaterOverlayController({
      selectTile: (tile) => this.isCoastlineWaterTile(tile),
      width: 30,
      height: 6,
      color: GameConstants.colors.seaFoam,
      peakAlpha: 0.45,
      durationMs: 2400
    });
  }

  /** Sparse light glints on open water, out of phase with the shoreline foam. */
  private createWaterShimmerController(): EffectController {
    return this.createWaterOverlayController({
      selectTile: (tile) => this.isOpenWaterShimmerTile(tile),
      width: 16,
      height: 3,
      color: GameConstants.colors.seaFoam,
      peakAlpha: 0.22,
      durationMs: 3400
    });
  }

  private createWaterOverlayController(
    options: Readonly<{
      selectTile: (tile: TileCoordinate) => boolean;
      width: number;
      height: number;
      color: string;
      peakAlpha: number;
      durationMs: number;
    }>
  ): EffectController {
    const overlays: Phaser.GameObjects.Ellipse[] = [];
    const tweens: Phaser.Tweens.Tween[] = [];

    for (const tile of this.collectTiles(options.selectTile)) {
      const worldX = (tile.x + 0.5) * GameConstants.tile.collisionSize;
      const worldY = (tile.y + 0.5) * GameConstants.tile.collisionSize;
      const position = this.tilemapRenderer.projectWorldToScreen(worldX, worldY);
      const overlay = this.scene.add.ellipse(
        position.x,
        position.y,
        options.width,
        options.height,
        Phaser.Display.Color.HexStringToColor(options.color).color,
        0
      );

      overlay.setDepth(GameConstants.depth.terrain + 2);
      overlays.push(overlay);
      tweens.push(
        this.scene.tweens.add({
          targets: overlay,
          alpha: options.peakAlpha,
          x: position.x + Phaser.Math.Between(-6, 6),
          duration: options.durationMs,
          delay: ((tile.x + tile.y) % 7) * 260,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
          paused: true
        })
      );
    }

    return {
      setEnabled: (enabled: boolean): void => {
        for (const overlay of overlays) {
          overlay.setVisible(enabled);
        }

        for (const tween of tweens) {
          if (enabled) {
            tween.resume();
          } else {
            tween.pause();
          }
        }
      }
    };
  }

  private collectTiles(selectTile: (tile: TileCoordinate) => boolean): TileCoordinate[] {
    const tiles: TileCoordinate[] = [];

    for (let y = 0; y < this.tilemap.definition.heightInTiles; y += 1) {
      for (let x = 0; x < this.tilemap.definition.widthInTiles; x += 1) {
        if (selectTile({ x, y })) {
          tiles.push({ x, y });
        }
      }
    }

    return tiles;
  }

  private isCoastlineWaterTile(tile: TileCoordinate): boolean {
    if (this.tilemap.getTileAt(tile).type !== TileTypes.Water) {
      return false;
    }

    const neighbors: TileCoordinate[] = [
      { x: tile.x + 1, y: tile.y },
      { x: tile.x - 1, y: tile.y },
      { x: tile.x, y: tile.y + 1 },
      { x: tile.x, y: tile.y - 1 }
    ];

    return neighbors.some((neighbor) => this.tilemap.getTileAt(neighbor).type === TileTypes.Sand);
  }

  private isOpenWaterShimmerTile(tile: TileCoordinate): boolean {
    if (this.tilemap.getTileAt(tile).type !== TileTypes.Water) {
      return false;
    }

    if (this.isCoastlineWaterTile(tile)) {
      return false;
    }

    const hash = tile.x * 73_856_093 + tile.y * 19_349_663;

    return Math.abs(hash) % 6 === 0;
  }
}

/** Converts a domain wind direction to a normalized screen-space vector. */
export function projectWindToScreen(wind: WindState): Readonly<{ x: number; y: number }> {
  const projected = worldToIso({
    x: wind.directionX * GameConstants.tile.collisionSize,
    y: wind.directionY * GameConstants.tile.collisionSize
  });
  const length = Math.hypot(projected.x, projected.y) || 1;

  return {
    x: projected.x / length,
    y: projected.y / length
  };
}
