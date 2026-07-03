import type { ItemGrant } from "@world/inventory/InventoryTypes";

/**
 * Crafting contracts. Recipes are DATA, never classes: thousands of future
 * recipes are catalog rows, and the crafting pipeline (validate -> consume ->
 * grant) never changes. Genuinely new mechanics (quality, crit crafts,
 * durability) will enter as new pipeline stages or validators — never as
 * per-recipe code.
 */

/**
 * Station kinds recipes can require. They align with interactable kinds so a
 * forge in the world IS the forge recipes ask for. New stations (carpentry,
 * cooking, leatherwork, alchemy) are new strings in new recipes: the manager
 * never changes.
 */
export const CraftingStationKinds = {
  Forge: "forge",
  Carpentry: "carpentry",
  Cooking: "cooking",
  Leatherwork: "leatherwork",
  Alchemy: "alchemy"
} as const;

export type CraftingStationKind =
  (typeof CraftingStationKinds)[keyof typeof CraftingStationKinds];

/** The station the player is currently using, resolved from the world. */
export type CraftingStation = Readonly<{
  kind: string;
  name: string;
}>;

export type RecipeIngredient = Readonly<{
  itemId: string;
  quantity: number;
}>;

export type RecipeOutput = Readonly<{
  itemId: string;
  quantity: number;
}>;

/** A recipe is pure data: what goes in, what comes out, where. */
export type RecipeDefinition = Readonly<{
  id: string;
  name: string;
  description: string;
  stationKind: string;
  ingredients: readonly RecipeIngredient[];
  outputs: readonly RecipeOutput[];
}>;

/** Context a craft executes in; grows over time (skills, tools, server auth). */
export type CraftingContext = Readonly<{
  station: CraftingStation;
  nowSeconds: number;
}>;

/** Outcome of one validation pass; message explains failures to the player. */
export type CraftingValidation = Readonly<{
  valid: boolean;
  message: string;
}>;

/** Outcome of one craft attempt, including exactly what was granted. */
export type CraftingResult = Readonly<{
  recipeId: string;
  recipeName: string;
  success: boolean;
  message: string;
  grants: readonly ItemGrant[];
}>;

/** Ingredient line resolved against the player inventory, for presentation. */
export type RecipeIngredientStatus = Readonly<{
  itemId: string;
  itemName: string;
  required: number;
  available: number;
}>;

/** One recipe as offered by a station, ready for a crafting UI. */
export type RecipeOffer = Readonly<{
  recipeId: string;
  recipeName: string;
  description: string;
  canCraft: boolean;
  ingredients: readonly RecipeIngredientStatus[];
  outputs: readonly Readonly<{ itemId: string; itemName: string; quantity: number }>[];
}>;
