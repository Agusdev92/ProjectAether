import { ItemRegistry } from "@world/inventory/ItemRegistry";
import { ItemCategories, ItemRarities } from "@world/inventory/InventoryTypes";
import type { ItemDefinition } from "@world/inventory/InventoryTypes";

/**
 * The current item catalog. This file is pure content: adding items to the
 * game means adding rows here (and eventually moving them to data files or
 * server-delivered catalogs) — never touching inventory code.
 */
const Items: readonly ItemDefinition[] = [
  {
    id: "wood",
    name: "Madera",
    description: "Un tronco recién cortado. Todavía huele a bosque.",
    category: ItemCategories.Resource,
    rarity: ItemRarities.Common,
    maxStack: 50,
    weight: 2,
    icon: "≡",
    iconColor: "#8a6a44"
  },
  {
    id: "stone",
    name: "Piedra",
    description: "Piedra gris de la costa. Pesada y confiable.",
    category: ItemCategories.Resource,
    rarity: ItemRarities.Common,
    maxStack: 50,
    weight: 3,
    icon: "◆",
    iconColor: "#8e9494"
  },
  {
    id: "worn-axe",
    name: "Hacha Gastada",
    description: "El filo está mellado por años de uso. Perteneció a alguien que llegó antes.",
    category: ItemCategories.Tool,
    rarity: ItemRarities.Common,
    maxStack: 1,
    weight: 4,
    icon: "⚒",
    iconColor: "#6f7a84"
  },
  {
    id: "simple-axe",
    name: "Hacha Simple",
    description: "Tosca, recién forjada, tuya.",
    category: ItemCategories.Tool,
    rarity: ItemRarities.Common,
    maxStack: 1,
    weight: 5,
    icon: "⚒",
    iconColor: "#8a6a44"
  },
  {
    id: "simple-pick",
    name: "Pico Simple",
    description: "Su punta ya quiere probar la roca.",
    category: ItemCategories.Tool,
    rarity: ItemRarities.Common,
    maxStack: 1,
    weight: 6,
    icon: "⛏",
    iconColor: "#8e9494"
  },
  {
    id: "simple-sword",
    name: "Espada Simple",
    description: "El primer filo que sale de tus manos.",
    category: ItemCategories.Equipment,
    rarity: ItemRarities.Common,
    maxStack: 1,
    weight: 5,
    icon: "†",
    iconColor: "#aab4c4"
  }
];

/** Builds the registry with every item the game currently knows. */
export function createDefaultItemRegistry(): ItemRegistry {
  const registry = new ItemRegistry();

  for (const item of Items) {
    registry.register(item);
  }

  return registry;
}
