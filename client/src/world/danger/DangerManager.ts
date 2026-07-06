import { GameConstants } from "@shared/config/GameConstants";
import type { WeatherType } from "@world/atmosphere/AtmosphereTypes";
import type { TimeOfDayType } from "@world/clock/WorldClockTypes";
import { tileToWorld } from "@world/coordinates/WorldCoordinates";
import type { WorldCoordinate } from "@world/coordinates/WorldCoordinates";
import type { DangerZoneDefinition } from "@world/danger/DangerTypes";
import type { DangerZoneRegistry } from "@world/danger/DangerZoneRegistry";

/**
 * DangerManager tracks how long the player has dwelled inside each active
 * danger zone and reports the moment that dwell time crosses the grace
 * threshold. Pure domain: no Phaser, no inventory or player knowledge beyond
 * a position. It never imports WorldClock or AtmosphereManager either —
 * timeOfDay and weather both arrive as plain facts the caller already knows,
 * the same injection pattern already established for timeOfDay before this
 * sprint added weather alongside it. WorldSession is the only place that
 * knows both the danger outcome and how to apply it (consume resources,
 * reposition the player), the same role it already plays for
 * buildRequirementContext().
 */
export class DangerManager {
  private readonly dwellSecondsByZoneId = new Map<string, number>();

  public constructor(private readonly zones: DangerZoneRegistry) {}

  /** Zones currently active for the given time of day and weather, regardless of player position — used to render the warning before anyone steps inside. */
  public getActiveZones(
    timeOfDay: TimeOfDayType,
    weather: WeatherType
  ): readonly DangerZoneDefinition[] {
    return this.zones.all.filter((zone) => this.isZoneActive(zone, timeOfDay, weather));
  }

  /**
   * Advances every active zone's dwell timer by one frame. Leaving a zone (or
   * it becoming inactive) resets its timer to zero. Returns the zone whose
   * grace period just elapsed, if any — getting caught resets that zone's
   * timer too, so the same zone can catch the player again later.
   */
  public update(
    playerPosition: WorldCoordinate,
    timeOfDay: TimeOfDayType,
    weather: WeatherType,
    deltaSeconds: number
  ): DangerZoneDefinition | undefined {
    for (const zone of this.zones.all) {
      if (!this.isZoneActive(zone, timeOfDay, weather) || !this.isInside(zone, playerPosition)) {
        this.dwellSecondsByZoneId.delete(zone.id);

        continue;
      }

      const dwellSeconds = (this.dwellSecondsByZoneId.get(zone.id) ?? 0) + deltaSeconds;

      if (dwellSeconds >= GameConstants.danger.tideGraceSeconds) {
        this.dwellSecondsByZoneId.delete(zone.id);

        return zone;
      }

      this.dwellSecondsByZoneId.set(zone.id, dwellSeconds);
    }

    return undefined;
  }

  private isZoneActive(
    zone: DangerZoneDefinition,
    timeOfDay: TimeOfDayType,
    weather: WeatherType
  ): boolean {
    return (
      zone.activeTimeOfDay.includes(timeOfDay) || (zone.activeInWeather?.includes(weather) ?? false)
    );
  }

  private isInside(zone: DangerZoneDefinition, position: WorldCoordinate): boolean {
    const center = tileToWorld(zone.anchorTile);
    const distanceInTiles =
      Math.hypot(position.x - center.x, position.y - center.y) / GameConstants.tile.collisionSize;

    return distanceInTiles <= zone.radiusInTiles;
  }
}
