import type { RecipeDefinition } from "@world/crafting/CraftingTypes";

/**
 * RecipeRegistry is the catalog of every recipe the game knows, indexed by id
 * and by station kind. Content growth is pure data: register more definitions
 * (later loaded from files or delivered by the server).
 */
export class RecipeRegistry {
  private readonly recipes = new Map<string, RecipeDefinition>();
  private readonly recipesByStation = new Map<string, RecipeDefinition[]>();

  public register(recipe: RecipeDefinition): void {
    if (this.recipes.has(recipe.id)) {
      throw new Error(`Duplicate recipe id: ${recipe.id}`);
    }

    if (recipe.ingredients.length === 0 || recipe.outputs.length === 0) {
      throw new Error(`Recipe ${recipe.id} needs at least one ingredient and one output.`);
    }

    this.recipes.set(recipe.id, recipe);

    const stationRecipes = this.recipesByStation.get(recipe.stationKind) ?? [];

    stationRecipes.push(recipe);
    this.recipesByStation.set(recipe.stationKind, stationRecipes);
  }

  public get(recipeId: string): RecipeDefinition {
    const recipe = this.recipes.get(recipeId);

    if (!recipe) {
      throw new Error(`Unknown recipe id: ${recipeId}`);
    }

    return recipe;
  }

  public byStation(stationKind: string): readonly RecipeDefinition[] {
    return this.recipesByStation.get(stationKind) ?? [];
  }

  public get all(): readonly RecipeDefinition[] {
    return [...this.recipes.values()];
  }
}
