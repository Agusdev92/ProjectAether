import type { CreatureDefinition } from "@world/creature/CreatureTypes";

/**
 * CreatureRegistry holds every creature declared by the active zone — the
 * same relationship PoiRegistry and NpcRegistry have with their content.
 * Pure lookup: health tracking and combat resolution live in CombatManager,
 * not on this class.
 */
export class CreatureRegistry {
  private readonly creatures: readonly CreatureDefinition[];

  public constructor(creatures: readonly CreatureDefinition[]) {
    assertValidCreatures(creatures);
    this.creatures = creatures;
  }

  public get all(): readonly CreatureDefinition[] {
    return this.creatures;
  }
}

function assertValidCreatures(creatures: readonly CreatureDefinition[]): void {
  const seenIds = new Set<string>();

  for (const creature of creatures) {
    if (seenIds.has(creature.id)) {
      throw new Error(`Duplicate creature id detected: ${creature.id}`);
    }

    if (creature.health <= 0) {
      throw new Error(`Creature ${creature.id} needs positive health.`);
    }

    seenIds.add(creature.id);
  }
}
