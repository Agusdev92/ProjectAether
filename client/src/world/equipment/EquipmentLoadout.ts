import { EquipmentSlotOrder } from "@world/equipment/EquipmentTypes";
import type { EquipmentSlot } from "@world/equipment/EquipmentTypes";

/**
 * EquipmentLoadout is the pure slot container: which item id occupies which
 * slot. Like Inventory, it is semantics-free — it does not know what items
 * are, only where they sit. Future loadout presets or NPC equipment reuse
 * this same class.
 */
export class EquipmentLoadout {
  private readonly slots = new Map<EquipmentSlot, string | null>();

  public constructor() {
    for (const slot of EquipmentSlotOrder) {
      this.slots.set(slot, null);
    }
  }

  public get(slot: EquipmentSlot): string | null {
    return this.slots.get(slot) ?? null;
  }

  public set(slot: EquipmentSlot, itemId: string | null): void {
    if (!this.slots.has(slot)) {
      throw new Error(`Unknown equipment slot: ${slot}`);
    }

    this.slots.set(slot, itemId);
  }

  public isFree(slot: EquipmentSlot): boolean {
    return this.get(slot) === null;
  }

  /** Overwrites every slot from a persisted snapshot; unknown slots are ignored. */
  public restore(entries: Readonly<Record<EquipmentSlot, string | null>>): void {
    for (const slot of EquipmentSlotOrder) {
      this.slots.set(slot, entries[slot] ?? null);
    }
  }
}
