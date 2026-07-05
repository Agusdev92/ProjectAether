import { Inventory } from "@world/inventory/Inventory";
import type { ItemRegistry } from "@world/inventory/ItemRegistry";
import type {
  InventoryItemView,
  InventorySlot,
  InventorySnapshot,
  ItemGrant
} from "@world/inventory/InventoryTypes";

/**
 * InventoryManager orchestrates the player's containers against the item
 * catalog. Today it owns a single bag; bank tabs, equipment, and trade escrow
 * will be additional Inventory instances behind this same facade. Pure
 * domain: presentation layers consume snapshots and announce grants.
 */
export class InventoryManager {
  private readonly registry: ItemRegistry;
  private readonly bag: Inventory;

  public constructor(registry: ItemRegistry, capacitySlots: number) {
    this.registry = registry;
    this.bag = new Inventory(capacitySlots);
  }

  /**
   * Grants items to the player bag and reports exactly what happened —
   * including overflow — so callers can announce it truthfully.
   */
  public grant(itemId: string, quantity: number): ItemGrant {
    const definition = this.registry.get(itemId);
    const result = this.bag.add(definition, quantity);

    return {
      itemId,
      itemName: definition.name,
      quantityAdded: result.addedQuantity,
      quantityRejected: result.rejectedQuantity,
      totalQuantity: this.bag.countOf(itemId)
    };
  }

  /** Removes items from the bag; returns how many were actually removed. */
  public consume(itemId: string, quantity: number): number {
    return this.bag.remove(itemId, quantity);
  }

  public countOf(itemId: string): number {
    return this.bag.countOf(itemId);
  }

  /** Raw slot contents for persistence — compact, catalog-agnostic. */
  public get rawSlots(): readonly InventorySlot[] {
    return this.bag.allSlots;
  }

  /**
   * Restores slots from a save. Any itemId no longer present in the catalog
   * (a future content change) is dropped instead of crashing — a defensive
   * read, not a silent data-integrity promise.
   */
  public restore(slots: readonly InventorySlot[]): void {
    const validated = slots.map((slot) => (slot && this.registry.has(slot.itemId) ? slot : null));

    this.bag.restore(validated);
  }

  /** Presentation snapshot of the bag, resolved against the catalog. */
  public get snapshot(): InventorySnapshot {
    const items: InventoryItemView[] = [];
    let totalWeight = 0;

    this.bag.allSlots.forEach((slot, slotIndex) => {
      if (!slot) {
        return;
      }

      const definition = this.registry.get(slot.itemId);

      totalWeight += definition.weight * slot.quantity;
      items.push({
        slotIndex,
        itemId: slot.itemId,
        itemName: definition.name,
        quantity: slot.quantity,
        icon: definition.icon,
        iconColor: definition.iconColor,
        category: definition.category,
        rarity: definition.rarity
      });
    });

    return {
      usedSlots: this.bag.usedSlots,
      capacitySlots: this.bag.capacitySlots,
      totalWeight,
      items
    };
  }
}
