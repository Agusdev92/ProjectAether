/**
 * Equipment contracts. Equipables are DATA in a catalog owned by this system:
 * the item catalog never learns about slots, and the inventory never learns
 * about equipment. An item is equipable if and only if it has an
 * EquipmentDefinition. Hundreds of future equipables are rows here; the
 * manager never changes.
 */

export const EquipmentSlots = {
  MainHand: "main-hand",
  OffHand: "off-hand",
  Tool: "tool",
  Head: "head",
  Chest: "chest",
  Legs: "legs",
  Feet: "feet",
  Accessory1: "accessory-1",
  Accessory2: "accessory-2"
} as const;

export type EquipmentSlot = (typeof EquipmentSlots)[keyof typeof EquipmentSlots];

/** Canonical slot order for loadouts, snapshots, and UIs. */
export const EquipmentSlotOrder: readonly EquipmentSlot[] = [
  EquipmentSlots.MainHand,
  EquipmentSlots.OffHand,
  EquipmentSlots.Tool,
  EquipmentSlots.Head,
  EquipmentSlots.Chest,
  EquipmentSlots.Legs,
  EquipmentSlots.Feet,
  EquipmentSlots.Accessory1,
  EquipmentSlots.Accessory2
] as const;

export const EquipmentKinds = {
  Weapon: "weapon",
  Tool: "tool",
  Armor: "armor",
  Accessory: "accessory"
} as const;

export type EquipmentKind = (typeof EquipmentKinds)[keyof typeof EquipmentKinds];

/**
 * What the equipment system knows about one item. Stats will be added here as
 * data when combat exists; requirements (skills, levels) become validator
 * checks reading this same definition. toolType/tier only apply to Tool-kind
 * equipables; everything else leaves them undefined.
 */
export type EquipmentDefinition = Readonly<{
  itemId: string;
  kind: EquipmentKind;
  allowedSlots: readonly EquipmentSlot[];
  toolType?: string;
  tier?: number;
}>;

/**
 * Tool classification of whatever is equipped, resolved by EquipmentManager.
 * WorldSession translates this equipment-domain shape into the
 * requirements-domain RequirementContext — the two subsystems never import
 * each other directly.
 */
export type ToolInfo = Readonly<{
  toolType: string;
  tier: number;
}>;

/** Context an equipment change executes in; grows over time (combat state). */
export type EquipmentContext = Readonly<{
  nowSeconds: number;
}>;

/** Outcome of one equip/unequip attempt. Item safety is absolute: on any
 * failure the operation is fully cancelled and nothing is lost. */
export type EquipmentChangeResult = Readonly<{
  success: boolean;
  message: string;
  slot?: EquipmentSlot;
}>;

/** One slot resolved for presentation. */
export type EquipmentSlotView = Readonly<{
  slot: EquipmentSlot;
  itemId: string | null;
  itemName: string | null;
  icon: string | null;
  iconColor: string | null;
}>;

/** Full presentation snapshot of the loadout, in canonical slot order. */
export type EquipmentSnapshot = Readonly<{
  slots: readonly EquipmentSlotView[];
}>;

/**
 * Read-only view of what is equipped. Prepared for the next sprint: the
 * interaction context will carry this so the world can require tools
 * (tree -> axe, rock -> pick) without interaction ever knowing the manager.
 */
export type EquipmentQuery = Readonly<{
  getEquippedItemId(slot: EquipmentSlot): string | null;
}>;
