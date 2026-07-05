import { EquipmentLoadout } from "@world/equipment/EquipmentLoadout";
import { EquipmentValidator } from "@world/equipment/EquipmentValidator";
import { EquipmentSlotOrder, EquipmentSlots } from "@world/equipment/EquipmentTypes";
import type {
  ArmorInfo,
  EquipmentChangeResult,
  EquipmentContext,
  EquipmentDefinition,
  EquipmentQuery,
  EquipmentSlot,
  EquipmentSnapshot,
  EquipmentSlotView,
  ToolInfo,
  WeaponInfo
} from "@world/equipment/EquipmentTypes";
import type { EquipmentRegistry } from "@world/equipment/EquipmentRegistry";
import type { InventoryManager } from "@world/inventory/InventoryManager";
import type { ItemRegistry } from "@world/inventory/ItemRegistry";

/**
 * EquipmentManager is a generic slot machine: it validates against the
 * equipment catalog and swaps items with the inventory atomically. It knows
 * no concrete equipable — hundreds of future weapons, tools, armors, and
 * accessories are catalog rows. Item safety is absolute: every failure path
 * cancels the whole operation; nothing is ever lost.
 *
 * It implements EquipmentQuery so future systems (tool requirements in
 * interactions) can read the loadout without knowing this class.
 */
export class EquipmentManager implements EquipmentQuery {
  private readonly registry: EquipmentRegistry;
  private readonly items: ItemRegistry;
  private readonly validator: EquipmentValidator;
  private readonly loadout: EquipmentLoadout;

  public constructor(
    registry: EquipmentRegistry,
    items: ItemRegistry,
    validator: EquipmentValidator = new EquipmentValidator(),
    loadout: EquipmentLoadout = new EquipmentLoadout()
  ) {
    this.registry = registry;
    this.items = items;
    this.validator = validator;
    this.loadout = loadout;
  }

  public isEquipable(itemId: string): boolean {
    return this.registry.has(itemId);
  }

  public getEquippedItemId(slot: EquipmentSlot): string | null {
    return this.loadout.get(slot);
  }

  /** Raw loadout for persistence — itemId per slot, no presentation fields. */
  public get rawLoadout(): Readonly<Record<EquipmentSlot, string | null>> {
    const entries = EquipmentSlotOrder.map((slot) => [slot, this.loadout.get(slot)] as const);

    return Object.fromEntries(entries) as Readonly<Record<EquipmentSlot, string | null>>;
  }

  /**
   * Restores the loadout from a save. Any itemId no longer present in the
   * equipment catalog (a future content change) is dropped instead of
   * crashing — a defensive read, not a silent data-integrity promise.
   */
  public restore(raw: Readonly<Record<EquipmentSlot, string | null>>): void {
    const validated = EquipmentSlotOrder.reduce<Record<EquipmentSlot, string | null>>(
      (accumulator, slot) => {
        const itemId = raw[slot];

        accumulator[slot] = itemId && this.registry.has(itemId) ? itemId : null;

        return accumulator;
      },
      {} as Record<EquipmentSlot, string | null>
    );

    this.loadout.restore(validated);
  }

  /**
   * Tool classification of whatever occupies the Tool slot, if any. Consumed
   * only by WorldSession to build a RequirementContext — the requirement
   * system itself never sees this class or the equipment catalog directly.
   */
  public getEquippedToolInfo(): ToolInfo | undefined {
    const itemId = this.loadout.get(EquipmentSlots.Tool);

    if (!itemId) {
      return undefined;
    }

    const definition = this.registry.find(itemId);

    if (!definition || definition.toolType === undefined || definition.tier === undefined) {
      return undefined;
    }

    return { toolType: definition.toolType, tier: definition.tier };
  }

  /**
   * Weapon classification of whatever occupies MainHand, if any. Read by the
   * Attack interaction handler through EquipmentQuery — combat never sees
   * this class or the equipment catalog directly.
   */
  public getEquippedWeaponInfo(): WeaponInfo | undefined {
    const itemId = this.loadout.get(EquipmentSlots.MainHand);

    if (!itemId) {
      return undefined;
    }

    const definition = this.registry.find(itemId);

    if (!definition || definition.damage === undefined) {
      return undefined;
    }

    return { damage: definition.damage };
  }

  /**
   * Armor classification of whatever occupies Chest, if any. Read the same
   * way as weapon info — combat only ever sees a plain health bonus number.
   */
  public getEquippedArmorInfo(): ArmorInfo | undefined {
    const itemId = this.loadout.get(EquipmentSlots.Chest);

    if (!itemId) {
      return undefined;
    }

    const definition = this.registry.find(itemId);

    if (!definition || definition.healthBonus === undefined) {
      return undefined;
    }

    return { healthBonus: definition.healthBonus };
  }

  /**
   * Equips an item from the inventory. Without an explicit slot it prefers
   * the first free allowed slot, falling back to a swap on the first allowed
   * one. The swap is atomic: on any failure everything is rolled back.
   */
  public equip(
    itemId: string,
    requestedSlot: EquipmentSlot | undefined,
    inventory: InventoryManager,
    context: EquipmentContext
  ): EquipmentChangeResult {
    const definition = this.registry.find(itemId);

    if (!definition) {
      return failure("Ese objeto no se puede equipar.");
    }

    const slot = requestedSlot ?? this.resolveSlot(definition);
    const validation = this.validator.validateEquip(definition, slot, inventory, context);

    if (!validation.valid) {
      return failure(validation.message);
    }

    if (inventory.consume(itemId, 1) < 1) {
      return failure("El objeto no está en el inventario.");
    }

    const previousItemId = this.loadout.get(slot);

    this.loadout.set(slot, itemId);

    if (previousItemId) {
      const returned = inventory.grant(previousItemId, 1);

      if (returned.quantityAdded < 1) {
        // Rollback: undo everything. The player must never lose an item.
        this.loadout.set(slot, previousItemId);
        inventory.grant(itemId, 1);

        return failure("Inventario lleno.");
      }
    }

    return {
      success: true,
      message: `Equipado: ${this.items.get(itemId).name}`,
      slot
    };
  }

  /** Returns the item to the inventory; cancels when there is no room. */
  public unequip(slot: EquipmentSlot, inventory: InventoryManager): EquipmentChangeResult {
    const itemId = this.loadout.get(slot);

    if (!itemId) {
      return failure("Ese slot está vacío.");
    }

    const returned = inventory.grant(itemId, 1);

    if (returned.quantityAdded < 1) {
      return failure("Inventario lleno.");
    }

    this.loadout.set(slot, null);

    return {
      success: true,
      message: `Desequipado: ${this.items.get(itemId).name}`,
      slot
    };
  }

  /** Presentation snapshot of the loadout, in canonical slot order. */
  public get snapshot(): EquipmentSnapshot {
    const slots: EquipmentSlotView[] = EquipmentSlotOrder.map((slot) => {
      const itemId = this.loadout.get(slot);

      if (!itemId) {
        return { slot, itemId: null, itemName: null, icon: null, iconColor: null };
      }

      const item = this.items.get(itemId);

      return {
        slot,
        itemId,
        itemName: item.name,
        icon: item.icon,
        iconColor: item.iconColor
      };
    });

    return { slots };
  }

  private resolveSlot(definition: EquipmentDefinition): EquipmentSlot {
    const freeSlot = definition.allowedSlots.find((slot) => this.loadout.isFree(slot));

    return freeSlot ?? definition.allowedSlots[0];
  }
}

function failure(message: string): EquipmentChangeResult {
  return { success: false, message };
}
