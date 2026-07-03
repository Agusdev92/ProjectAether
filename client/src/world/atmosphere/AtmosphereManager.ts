import { WeatherTypes } from "@world/atmosphere/AtmosphereTypes";
import type {
  AmbientEffectState,
  AmbientSoundDefinition,
  WeatherType,
  WindState,
  ZoneAtmosphereDefinition
} from "@world/atmosphere/AtmosphereTypes";

/**
 * Weather multipliers applied over the zone base wind. Documented here so
 * adding a new weather forces an explicit decision about its wind behavior.
 */
const WeatherWindMultipliers: Readonly<Record<WeatherType, number>> = {
  [WeatherTypes.Clear]: 0.55,
  [WeatherTypes.Wind]: 1,
  [WeatherTypes.Rain]: 0.85,
  [WeatherTypes.Fog]: 0.35,
  [WeatherTypes.Storm]: 1.6,
  [WeatherTypes.Snow]: 0.7
};

/**
 * AtmosphereManager owns the ambient state of the active zone in pure domain
 * space: current weather, deterministic wind simulation, and per-effect
 * toggles. It never touches Phaser or the event bus; presentation layers read
 * snapshots and scenes decide what to announce. A future server can replace
 * this local simulation by feeding the same state from network snapshots.
 */
export class AtmosphereManager {
  private readonly definition: ZoneAtmosphereDefinition;
  private readonly effectEnabled = new Map<string, boolean>();
  private weather: WeatherType;
  private elapsedSeconds = 0;

  public constructor(definition: ZoneAtmosphereDefinition) {
    this.definition = definition;
    this.weather = definition.initialWeather;

    for (const effect of definition.effects) {
      this.effectEnabled.set(effect.id, effect.enabledByDefault);
    }
  }

  public update(deltaSeconds: number): void {
    this.elapsedSeconds += deltaSeconds;
  }

  public get currentWeather(): WeatherType {
    return this.weather;
  }

  /** Returns true when the weather actually changed. */
  public setWeather(weather: WeatherType): boolean {
    if (this.weather === weather) {
      return false;
    }

    this.weather = weather;

    return true;
  }

  /**
   * Wind is simulated with two layered oscillations (slow swell plus faster
   * gusts) so it feels alive without randomness: deterministic time-based
   * output keeps future server reconciliation and replays straightforward.
   */
  public get wind(): WindState {
    const { directionX, directionY, baseIntensity } = this.definition.wind;
    const swell = Math.sin(this.elapsedSeconds * 0.11) * 0.25;
    const gust = Math.sin(this.elapsedSeconds * 0.47) * 0.15;
    const weatherMultiplier = WeatherWindMultipliers[this.weather];
    const intensity = clamp01((baseIntensity + swell + gust) * weatherMultiplier);
    const length = Math.hypot(directionX, directionY) || 1;

    return {
      directionX: directionX / length,
      directionY: directionY / length,
      intensity
    };
  }

  public get effects(): readonly AmbientEffectState[] {
    return this.definition.effects.map((definition) => ({
      definition,
      enabled: this.effectEnabled.get(definition.id) ?? false
    }));
  }

  public isEffectEnabled(effectId: string): boolean {
    return this.effectEnabled.get(effectId) ?? false;
  }

  /** Returns true when the effect exists and its state actually changed. */
  public setEffectEnabled(effectId: string, enabled: boolean): boolean {
    if (!this.effectEnabled.has(effectId) || this.effectEnabled.get(effectId) === enabled) {
      return false;
    }

    this.effectEnabled.set(effectId, enabled);

    return true;
  }

  public get sounds(): readonly AmbientSoundDefinition[] {
    return this.definition.sounds;
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
