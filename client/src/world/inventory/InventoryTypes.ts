/**
 * Inventory contracts. Items are DATA, never classes: a thousand new items are
 * a thousand catalog rows (later JSON or server payloads), and no inventory
 * code changes. The inventory itself only understands stacking, weight, and
 * counting — item semantics (equipping, eating, reading) belong to future
 * systems that read these same definitions.
 */

export const ItemCategories = {
  Resource: "resource",
  Tool: "tool",
  Consumable: "consumable",
  Equipment: "equipment",
  /** Narrative-only objects: no equip slot, no crafting use. Evidence, not loot. */
  Curio: "curio"
} as const;

export type ItemCategory = (typeof ItemCategories)[keyof typeof ItemCategories];

/** Rarity is contract-ready for the future; nothing consumes it yet. */
export const ItemRarities = {
  Common: "common",
  Uncommon: "uncommon",
  Rare: "rare",
  Epic: "epic",
  Legendary: "legendary"
} as const;

export type ItemRarity = (typeof ItemRarities)[keyof typeof ItemRarities];

/**
 * The immutable description of an item kind. icon/iconColor are placeholder
 * presentation hints until a real art pipeline exists.
 */
export type ItemDefinition = Readonly<{
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  maxStack: number;
  weight: number;
  icon: string;
  iconColor: string;
}>;

/** A quantity of one item kind occupying a slot. */
export type ItemStack = Readonly<{
  itemId: string;
  quantity: number;
}>;

/** A slot holds one stack or nothing. */
export type InventorySlot = ItemStack | null;

/** Outcome of trying to add items; rejected quantity did not fit. */
export type InventoryAddResult = Readonly<{
  addedQuantity: number;
  rejectedQuantity: number;
}>;

/**
 * The report of one item grant (interaction loot, future trade or craft),
 * ready to be announced by presentation layers.
 */
export type ItemGrant = Readonly<{
  itemId: string;
  itemName: string;
  quantityAdded: number;
  quantityRejected: number;
  totalQuantity: number;
}>;

/** One non-empty slot resolved against the catalog, for presentation. */
export type InventoryItemView = Readonly<{
  slotIndex: number;
  itemId: string;
  itemName: string;
  quantity: number;
  icon: string;
  iconColor: string;
  category: ItemCategory;
  rarity: ItemRarity;
}>;

/** Full presentation snapshot of an inventory. */
export type InventorySnapshot = Readonly<{
  usedSlots: number;
  capacitySlots: number;
  totalWeight: number;
  items: readonly InventoryItemView[];
}>;
