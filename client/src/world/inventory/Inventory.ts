import type {
  InventoryAddResult,
  InventorySlot,
  ItemDefinition
} from "@world/inventory/InventoryTypes";

/**
 * Inventory is a pure domain container: a fixed set of slots holding stacks.
 * It never resolves item ids by itself — callers pass the ItemDefinition —
 * so it stays catalog-agnostic and works identically for the player bag,
 * future bank tabs, chests, or trade windows. No Phaser, no events.
 */
export class Inventory {
  private readonly slots: InventorySlot[];

  public constructor(capacitySlots: number) {
    if (capacitySlots < 1) {
      throw new Error("An inventory needs at least one slot.");
    }

    this.slots = new Array<InventorySlot>(capacitySlots).fill(null);
  }

  public get capacitySlots(): number {
    return this.slots.length;
  }

  public get usedSlots(): number {
    return this.slots.reduce((count, slot) => (slot ? count + 1 : count), 0);
  }

  /** Read-only view of every slot, empty ones included. */
  public get allSlots(): readonly InventorySlot[] {
    return this.slots;
  }

  public countOf(itemId: string): number {
    return this.slots.reduce(
      (total, slot) => (slot && slot.itemId === itemId ? total + slot.quantity : total),
      0
    );
  }

  /**
   * Adds a quantity of an item: first tops up existing stacks, then opens new
   * slots. Whatever does not fit is reported back as rejected — the caller
   * decides how to announce or handle overflow.
   */
  public add(definition: ItemDefinition, quantity: number): InventoryAddResult {
    if (quantity < 1) {
      return { addedQuantity: 0, rejectedQuantity: 0 };
    }

    let remaining = quantity;

    for (let index = 0; index < this.slots.length && remaining > 0; index += 1) {
      const slot = this.slots[index];

      if (!slot || slot.itemId !== definition.id || slot.quantity >= definition.maxStack) {
        continue;
      }

      const accepted = Math.min(definition.maxStack - slot.quantity, remaining);

      this.slots[index] = { itemId: definition.id, quantity: slot.quantity + accepted };
      remaining -= accepted;
    }

    for (let index = 0; index < this.slots.length && remaining > 0; index += 1) {
      if (this.slots[index]) {
        continue;
      }

      const accepted = Math.min(definition.maxStack, remaining);

      this.slots[index] = { itemId: definition.id, quantity: accepted };
      remaining -= accepted;
    }

    return { addedQuantity: quantity - remaining, rejectedQuantity: remaining };
  }

  /**
   * Overwrites every slot from a persisted snapshot. Slots beyond the given
   * array (or beyond current capacity) are cleared — a capacity change
   * between saves never leaves stale stacks behind.
   */
  public restore(slots: readonly InventorySlot[]): void {
    for (let index = 0; index < this.slots.length; index += 1) {
      this.slots[index] = slots[index] ?? null;
    }
  }

  /**
   * Removes up to the requested quantity of an item and returns how much was
   * actually removed. Future crafting and trading consume through this.
   */
  public remove(itemId: string, quantity: number): number {
    let remaining = quantity;

    for (let index = this.slots.length - 1; index >= 0 && remaining > 0; index -= 1) {
      const slot = this.slots[index];

      if (!slot || slot.itemId !== itemId) {
        continue;
      }

      const removed = Math.min(slot.quantity, remaining);
      const nextQuantity = slot.quantity - removed;

      this.slots[index] = nextQuantity > 0 ? { itemId, quantity: nextQuantity } : null;
      remaining -= removed;
    }

    return quantity - remaining;
  }
}
