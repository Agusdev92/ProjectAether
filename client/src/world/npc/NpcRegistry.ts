import type { NpcDefinition } from "@world/npc/NpcTypes";

/**
 * NpcRegistry holds every NPC declared by the active zone — the same
 * relationship PoiRegistry has with POIs. NPCs are zone content, not a
 * global catalog like items or recipes, because their schedule anchors to
 * that zone's specific geography. Pure lookup: schedule resolution lives in
 * the standalone resolveScheduledTile function, not on this class.
 */
export class NpcRegistry {
  private readonly npcs: readonly NpcDefinition[];

  public constructor(npcs: readonly NpcDefinition[]) {
    assertValidNpcs(npcs);
    this.npcs = npcs;
  }

  public get all(): readonly NpcDefinition[] {
    return this.npcs;
  }
}

function assertValidNpcs(npcs: readonly NpcDefinition[]): void {
  const seenIds = new Set<string>();

  for (const npc of npcs) {
    if (seenIds.has(npc.id)) {
      throw new Error(`Duplicate NPC id detected: ${npc.id}`);
    }

    if (npc.schedule.length === 0) {
      throw new Error(`NPC ${npc.id} needs at least one schedule entry.`);
    }

    seenIds.add(npc.id);
  }
}
