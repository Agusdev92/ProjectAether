import type {
  EquipmentContext,
  EquipmentDefinition,
  EquipmentSlot
} from "@world/equipment/EquipmentTypes";
import type { InventoryManager } from "@world/inventory/InventoryManager";

/** Outcome of one validation pass. */
export type EquipmentValidation = Readonly<{
  valid: boolean;
  message: string;
}>;

/**
 * EquipmentValidator concentrates every rule that decides whether an equip
 * may proceed. Future requirements (skill levels, combat lockout, broken
 * durability) are added HERE as new checks — the EquipmentManager swap logic
 * never changes. Pure domain.
 */
export class EquipmentValidator {
  public validateEquip(
    definition: EquipmentDefinition,
    slot: EquipmentSlot,
    inventory: InventoryManager,
    _context: EquipmentContext
  ): EquipmentValidation {
    if (!definition.allowedSlots.includes(slot)) {
      return invalid("Ese objeto no va en ese slot.");
    }

    if (inventory.countOf(definition.itemId) < 1) {
      return invalid("El objeto no está en el inventario.");
    }

    return { valid: true, message: "" };
  }
}

function invalid(message: string): EquipmentValidation {
  return { valid: false, message };
}
