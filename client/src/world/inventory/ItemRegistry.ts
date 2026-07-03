import type { ItemDefinition } from "@world/inventory/InventoryTypes";

/**
 * ItemRegistry is the catalog of every item the game knows. It is the single
 * source of truth item ids resolve against; inventories store ids and ask the
 * registry when they need names, weights, or stack limits. Content growth is
 * pure data: register more definitions (later loaded from files or server).
 */
export class ItemRegistry {
  private readonly definitions = new Map<string, ItemDefinition>();

  public register(definition: ItemDefinition): void {
    if (this.definitions.has(definition.id)) {
      throw new Error(`Duplicate item definition id: ${definition.id}`);
    }

    if (definition.maxStack < 1) {
      throw new Error(`Item ${definition.id} must allow at least a stack of 1.`);
    }

    this.definitions.set(definition.id, definition);
  }

  public get(itemId: string): ItemDefinition {
    const definition = this.definitions.get(itemId);

    if (!definition) {
      throw new Error(`Unknown item id: ${itemId}`);
    }

    return definition;
  }

  public has(itemId: string): boolean {
    return this.definitions.has(itemId);
  }

  public get all(): readonly ItemDefinition[] {
    return [...this.definitions.values()];
  }
}
