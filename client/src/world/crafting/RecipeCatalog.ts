import { CraftingStationKinds } from "@world/crafting/CraftingTypes";
import type { RecipeDefinition } from "@world/crafting/CraftingTypes";
import { RecipeRegistry } from "@world/crafting/RecipeRegistry";

/**
 * The current recipe catalog. Pure content: adding recipes to the game means
 * adding rows here (and eventually moving them to data files or
 * server-delivered catalogs) — never touching the crafting pipeline.
 */
const Recipes: readonly RecipeDefinition[] = [
  {
    id: "simple-axe",
    name: "Hacha Simple",
    description: "Un hacha tosca pero tuya.",
    stationKind: CraftingStationKinds.Forge,
    ingredients: [
      { itemId: "wood", quantity: 3 },
      { itemId: "stone", quantity: 1 }
    ],
    outputs: [{ itemId: "simple-axe", quantity: 1 }]
  },
  {
    id: "simple-pick",
    name: "Pico Simple",
    description: "Suficiente para empezar a abrir la piedra.",
    stationKind: CraftingStationKinds.Forge,
    ingredients: [
      { itemId: "wood", quantity: 1 },
      { itemId: "stone", quantity: 3 }
    ],
    outputs: [{ itemId: "simple-pick", quantity: 1 }]
  },
  {
    id: "simple-sword",
    name: "Espada Simple",
    description: "El primer filo que sale de tus manos.",
    stationKind: CraftingStationKinds.Forge,
    ingredients: [
      { itemId: "wood", quantity: 2 },
      { itemId: "stone", quantity: 2 }
    ],
    outputs: [{ itemId: "simple-sword", quantity: 1 }]
  }
];

/** Builds the registry with every recipe the game currently knows. */
export function createDefaultRecipeRegistry(): RecipeRegistry {
  const registry = new RecipeRegistry();

  for (const recipe of Recipes) {
    registry.register(recipe);
  }

  return registry;
}
