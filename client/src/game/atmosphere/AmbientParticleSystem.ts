import Phaser from "phaser";
import { projectWindToScreen } from "@game/atmosphere/EnvironmentEffects";
import { GameConstants } from "@shared/config/GameConstants";
import type { WindState } from "@world/atmosphere/AtmosphereTypes";

type ParticleKind = "leaf" | "mote" | "raindrop";

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
  mote: 22,
  // Rain falls, it does not drift — far faster than anything wind-blown, and
  // its motion (see moveRaindrop) is dominated by a straight downward fall
  // rather than the wind direction the other two kinds follow.
  raindrop: 340
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
    this.createRaindrops(GameConstants.atmosphere.rainParticleCount);
  }

  public update(
    deltaSeconds: number,
    wind: WindState,
    leavesEnabled: boolean,
    motesEnabled: boolean,
    rainEnabled: boolean
  ): void {
    this.elapsedSeconds += deltaSeconds;

    const view = this.scene.cameras.main.worldView;
    const windScreen = projectWindToScreen(wind);

    for (const particle of this.particles) {
      const enabled = this.isEnabled(particle.kind, leavesEnabled, motesEnabled, rainEnabled);

      particle.gameObject.setVisible(enabled);

      if (!enabled) {
        continue;
      }

      if (particle.kind === "raindrop") {
        this.moveRaindrop(particle, deltaSeconds, wind, windScreen, view);
      } else {
        this.moveParticle(particle, deltaSeconds, wind, windScreen, view);
      }
    }
  }

  private isEnabled(
    kind: ParticleKind,
    leavesEnabled: boolean,
    motesEnabled: boolean,
    rainEnabled: boolean
  ): boolean {
    if (kind === "leaf") {
      return leavesEnabled;
    }

    return kind === "mote" ? motesEnabled : rainEnabled;
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

  /**
   * Rain falls straight down at speed, with only a slight sideways skew from
   * wind (a storm's gusts blow rain sideways, but never enough to read as
   * wind-drifted debris like leaves/motes) — a distinct movement model from
   * moveParticle rather than a shared one forced to cover both cases.
   */
  private moveRaindrop(
    particle: Particle,
    deltaSeconds: number,
    wind: WindState,
    windScreen: Readonly<{ x: number; y: number }>,
    view: Phaser.Geom.Rectangle
  ): void {
    const fallSpeed = particle.driftSpeed * Math.max(0.5, wind.intensity);

    particle.gameObject.x += windScreen.x * fallSpeed * 0.3 * deltaSeconds;
    particle.gameObject.y += fallSpeed * deltaSeconds;
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

  /** Reuses the existing sea-foam color: a raindrop is a pale streak, not a new palette entry. */
  private createRaindrops(count: number): void {
    for (let index = 0; index < count; index += 1) {
      const raindrop = this.scene.add.rectangle(
        Phaser.Math.Between(0, GameConstants.resolution.width),
        Phaser.Math.Between(0, GameConstants.resolution.height),
        2,
        16,
        Phaser.Display.Color.HexStringToColor(GameConstants.colors.seaFoam).color,
        0.5
      );

      this.particles.push({
        gameObject: raindrop,
        kind: "raindrop",
        driftSpeed: DriftSpeeds.raindrop + Phaser.Math.Between(-30, 30),
        bobPhase: 0,
        spinPerSecond: 0
      });
    }
  }
}
