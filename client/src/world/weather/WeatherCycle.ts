import { GameConstants } from "@shared/config/GameConstants";
import { WeatherTypes } from "@world/atmosphere/AtmosphereTypes";
import type { WeatherType } from "@world/atmosphere/AtmosphereTypes";

/**
 * Resolves the day's weather purely from elapsed game time — no simulation,
 * no stored state, same shape as resolveScheduledTile for NPCs. A fixed,
 * repeating cycle (never a random roll) so a player who pays attention can
 * learn the rhythm on their own (Pilar 5): the same calendar day always
 * produces the same weather, forever, and a reload changes nothing.
 */
export function resolveWeatherForDay(elapsedGameSeconds: number): WeatherType {
  const dayNumber = Math.floor(elapsedGameSeconds / GameConstants.clock.dayLengthInGameSeconds);
  const dayInCycle = dayNumber % GameConstants.weather.cycleDays;

  return dayInCycle === GameConstants.weather.stormDayIndex
    ? WeatherTypes.Storm
    : WeatherTypes.Clear;
}
