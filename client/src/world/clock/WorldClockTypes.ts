/**
 * Time-of-day buckets. Open data — like WeatherTypes or InteractableKinds —
 * so adding Dawn/Dusk later is new entries plus updating WorldClock's
 * derivation, never a change to how other systems consume TimeOfDayType.
 */
export const TimeOfDayTypes = {
  Morning: "morning",
  Afternoon: "afternoon",
  Night: "night"
} as const;

export type TimeOfDayType = (typeof TimeOfDayTypes)[keyof typeof TimeOfDayTypes];

/**
 * The only piece of state this sprint persists across sessions. Deliberately
 * minimal: time of day is always derived from elapsedGameSeconds, never
 * stored separately, so the two can never drift out of sync. A future save
 * system (Sprint 12) can fold this shape into a larger snapshot without
 * WorldClock ever changing.
 */
export type WorldClockSnapshot = Readonly<{
  elapsedGameSeconds: number;
}>;
