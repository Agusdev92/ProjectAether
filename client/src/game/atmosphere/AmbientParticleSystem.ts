import Phaser from "phaser";
import { projectWindToScreen } from "@game/atmosphere/EnvironmentEffects";
import { GameConstants } from "@shared/config/GameConstants";
import type { WindState } from "@world/atmosphere/AtmosphereTypes";

type ParticleKind = "leaf" | "mote";

type Particle = {
  readonly gameObject: Phaser.GameObjects.Shape;
  readonly kind: ParticleKind;
  readonly driftSpeed: number;
  readonly bobPhase: number;
  readonly spinPerSecond: number;
};

/** Pixels per second each kind travels at full wind intensity. */
const DriftSpeeds: Readonly<Record<ParticleKind, number>> = {
  leaf: 74,
  mote: 22
};

/**
 * AmbientParticleSystem drifts lightweight primitives (leaves, dust motes)
 * across the camera view, pushed by the domain wind. Particles are pooled and
 * repositioned manually each frame — no tween churn, no allocation per frame —
 * and wrap around the visible area so the pool size stays constant no matter
 * how large zones become.
 */
export class AmbientParticleSystem {
  private readonly particles: Particle[] = [];
  private elapsedSeconds = 0;

  public constructor(private readonly scene: Phaser.Scene) {
    this.createLeaves(GameConstants.atmosphere.leafParticleCount);
    this.createMotes(GameConstants.atmosphere.moteParticleCount);
  }

  public update(
    deltaSeconds: number,
    wind: WindState,
    leavesEnabled: boolean,
    motesEnabled: boolean
  ): void {
    this.elapsedSeconds += deltaSeconds;

    const view = this.scene.cameras.main.worldView;
    const windScreen = projectWindToScreen(wind);

    for (const particle of this.particles) {
      const enabled = particle.kind === "leaf" ? leavesEnabled : motesEnabled;

      particle.gameObject.setVisible(enabled);

      if (!enabled) {
        continue;
      }

      this.moveParticle(particle, deltaSeconds, wind, windScreen, view);
    }
  }

  private moveParticle(
    particle: Particle,
    deltaSeconds: number,
    wind: WindState,
    windScreen: Readonly<{ x: number; y: number }>,
    view: Phaser.Geom.Rectangle
  ): void {
    const speed = particle.driftSpeed * Math.max(0.15, wind.intensity);
    const bob = Math.sin(this.elapsedSeconds * 1.7 + particle.bobPhase) * 14 * deltaSeconds;

    particle.gameObject.x += windScreen.x * speed * deltaSeconds;
    particle.gameObject.y += windScreen.y * speed * deltaSeconds + bob;
    particle.gameObject.rotation += particle.spinPerSecond * deltaSeconds;
    particle.gameObject.setDepth(GameConstants.depth.entities + particle.gameObject.y + 120);

    this.wrapIntoView(particle.gameObject, view);
  }

  /** Keeps particles inside the padded camera view by wrapping edges. */
  private wrapIntoView(gameObject: Phaser.GameObjects.Shape, view: Phaser.Geom.Rectangle): void {
    const padding = 80;
    const left = view.left - padding;
    const right = view.right + padding;
    const top = view.top - padding;
    const bottom = view.bottom + padding;

    if (gameObject.x > right) {
      gameObject.x = left;
      gameObject.y = Phaser.Math.Between(top, bottom);
    } else if (gameObject.x < left) {
      gameObject.x = right;
      gameObject.y = Phaser.Math.Between(top, bottom);
    }

    if (gameObject.y > bottom) {
      gameObject.y = top;
      gameObject.x = Phaser.Math.Between(left, right);
    } else if (gameObject.y < top) {
      gameObject.y = bottom;
      gameObject.x = Phaser.Math.Between(left, right);
    }
  }

  private createLeaves(count: number): void {
    for (let index = 0; index < count; index += 1) {
      const leaf = this.scene.add.rectangle(
        Phaser.Math.Between(0, GameConstants.resolution.width),
        Phaser.Math.Between(0, GameConstants.resolution.height),
        7,
        4,
        Phaser.Display.Color.HexStringToColor(GameConstants.colors.leaf).color,
        0.8
      );

      this.particles.push({
        gameObject: leaf,
        kind: "leaf",
        driftSpeed: DriftSpeeds.leaf + Phaser.Math.Between(-12, 12),
        bobPhase: Math.random() * Math.PI * 2,
        spinPerSecond: Phaser.Math.FloatBetween(-2.4, 2.4)
      });
    }
  }

  private createMotes(count: number): void {
    for (let index = 0; index < count; index += 1) {
      const mote = this.scene.add.ellipse(
        Phaser.Math.Between(0, GameConstants.resolution.width),
        Phaser.Math.Between(0, GameConstants.resolution.height),
        3,
        3,
        Phaser.Display.Color.HexStringToColor(GameConstants.colors.mote).color,
        0.3
      );

      this.particles.push({
        gameObject: mote,
        kind: "mote",
        driftSpeed: DriftSpeeds.mote + Phaser.Math.Between(-6, 6),
        bobPhase: Math.random() * Math.PI * 2,
        spinPerSecond: 0
      });
    }
  }
}
