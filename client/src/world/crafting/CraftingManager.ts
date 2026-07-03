import { CraftingValidator } from "@world/crafting/CraftingValidator";
import type {
  CraftingContext,
  CraftingResult,
  RecipeOffer
} from "@world/crafting/CraftingTypes";
import type { RecipeRegistry } from "@world/crafting/RecipeRegistry";
import type { InventoryManager } from "@world/inventory/InventoryManager";
import type { ItemRegistry } from "@world/inventory/ItemRegistry";
import type { ItemGrant } from "@world/inventory/InventoryTypes";

/**
 * CraftingManager runs one generic pipeline for every recipe in the game:
 * validate -> consume ingredients -> grant outputs. It knows no recipe and no
 * station: both are data. Thousands of recipes and new station kinds never
 * modify this class; new mechanics become new validator checks or new
 * pipeline stages. The craft() signature is deliberately RPC-shaped for the
 * future server.
 */
export class CraftingManager {
  private readonly recipes: RecipeRegistry;
  private readonly items: ItemRegistry;
  private readonly validator: CraftingValidator;

  public constructor(
    recipes: RecipeRegistry,
    items: ItemRegistry,
    validator: CraftingValidator = new CraftingValidator()
  ) {
    this.recipes = recipes;
    this.items = items;
    this.validator = validator;
  }

  /** Everything a station offers, resolved against the player inventory. */
  public getOffer(stationKind: string, inventory: InventoryManager): readonly RecipeOffer[] {
    return this.recipes.byStation(stationKind).map((recipe) => {
      const ingredients = recipe.ingredients.map((ingredient) => ({
        itemId: ingredient.itemId,
        itemName: this.items.get(ingredient.itemId).name,
        required: ingredient.quantity,
        available: inventory.countOf(ingredient.itemId)
      }));

      return {
        recipeId: recipe.id,
        recipeName: recipe.name,
        description: recipe.description,
        canCraft: ingredients.every((ingredient) => ingredient.available >= ingredient.required),
        ingredients,
        outputs: recipe.outputs.map((output) => ({
          itemId: output.itemId,
          itemName: this.items.get(output.itemId).name,
          quantity: output.quantity
        }))
      };
    });
  }

  /** Executes one craft. The pipeline is identical for every recipe. */
  public craft(
    recipeId: string,
    context: CraftingContext,
    inventory: InventoryManager
  ): CraftingResult {
    const recipe = this.recipes.get(recipeId);
    const validation = this.validator.validate(recipe, context, inventory);

    if (!validation.valid) {
      return {
        recipeId: recipe.id,
        recipeName: recipe.name,
        success: false,
        message: validation.message,
        grants: []
      };
    }

    for (const ingredient of recipe.ingredients) {
      inventory.consume(ingredient.itemId, ingredient.quantity);
    }

    const grants: ItemGrant[] = recipe.outputs.map((output) =>
      inventory.grant(output.itemId, output.quantity)
    );

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      success: true,
      message: `Fabricaste: ${recipe.name}`,
      grants
    };
  }
}
