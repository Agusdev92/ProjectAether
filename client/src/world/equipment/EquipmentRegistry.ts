import type { EquipmentDefinition } from "@world/equipment/EquipmentTypes";

/**
 * EquipmentRegistry is the catalog of everything equipable. An item id absent
 * from this registry simply cannot be equipped — that is the whole rule.
 * Content growth is pure data (later files or server catalogs).
 */
export class EquipmentRegistry {
  private readonly definitions = new Map<string, EquipmentDefinition>();

  public register(definition: EquipmentDefinition): void {
    if (this.definitions.has(definition.itemId)) {
      throw new Error(`Duplicate equipment definition for item: ${definition.itemId}`);
    }

    if (definition.allowedSlots.length === 0) {
      throw new Error(`Equipment ${definition.itemId} must allow at least one slot.`);
    }

    this.definitions.set(definition.itemId, definition);
  }

  public find(itemId: string): EquipmentDefinition | undefined {
    return this.definitions.get(itemId);
  }

  public has(itemId: string): boolean {
    return this.definitions.has(itemId);
  }
}
