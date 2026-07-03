import type {
  CraftingContext,
  CraftingValidation,
  RecipeDefinition
} from "@world/crafting/CraftingTypes";
import type { InventoryManager } from "@world/inventory/InventoryManager";

/**
 * CraftingValidator concentrates every rule that decides whether a craft may
 * proceed. New requirements (skill levels, tool quality, station tiers) are
 * added HERE as new checks — the CraftingManager pipeline never changes.
 * Pure domain: no Phaser, no events.
 */
export class CraftingValidator {
  public validate(
    recipe: RecipeDefinition,
    context: CraftingContext,
    inventory: InventoryManager
  ): CraftingValidation {
    if (recipe.stationKind !== context.station.kind) {
      return invalid(`${recipe.name} requiere otra estación.`);
    }

    for (const ingredient of recipe.ingredients) {
      if (inventory.countOf(ingredient.itemId) < ingredient.quantity) {
        return invalid("Materiales insuficientes.");
      }
    }

    return { valid: true, message: "" };
  }
}

function invalid(message: string): CraftingValidation {
  return { valid: false, message };
}
