import type { DangerZoneDefinition } from "@world/danger/DangerTypes";

/**
 * DangerZoneRegistry holds every danger zone declared by the active zone —
 * the same relationship PoiRegistry and NpcRegistry have with their content.
 * Danger zones are zone content, not a global catalog, because their
 * geography anchors to that zone's specific coastline. Pure lookup: dwell
 * tracking and triggering live in DangerManager, not on this class.
 */
export class DangerZoneRegistry {
  private readonly zones: readonly DangerZoneDefinition[];

  public constructor(zones: readonly DangerZoneDefinition[]) {
    assertValidZones(zones);
    this.zones = zones;
  }

  public get all(): readonly DangerZoneDefinition[] {
    return this.zones;
  }
}

function assertValidZones(zones: readonly DangerZoneDefinition[]): void {
  const seenIds = new Set<string>();

  for (const zone of zones) {
    if (seenIds.has(zone.id)) {
      throw new Error(`Duplicate danger zone id detected: ${zone.id}`);
    }

    if (zone.activeTimeOfDay.length === 0) {
      throw new Error(`Danger zone ${zone.id} needs at least one active time of day.`);
    }

    seenIds.add(zone.id);
  }
}
