/**
 * World requirement contracts. Any object in the world can demand conditions
 * to be usable — starting with tools, but designed to carry Item, Quest,
 * Skill, Reputation, Weather, Time, Region, and Faction requirements later
 * without ever touching InteractableRegistry's or InteractionManager's logic.
 * A requirement is DATA (a type key + params); only the per-type evaluator is
 * code, exactly like InteractionHandler is one function per verb.
 */

export const RequirementTypes = {
  ToolType: "tool-type",
  ToolTier: "tool-tier"
  // Future: Item, Quest, Skill, Reputation, Weather, Time, Region, Faction —
  // each a new string here plus one evaluator registered in
  // RequirementEvaluators.ts. RequirementRegistry never changes.
} as const;

export type RequirementType = (typeof RequirementTypes)[keyof typeof RequirementTypes];

/** The vocabulary the ToolType requirement checks against. Open data. */
export const ToolTypes = {
  Axe: "axe",
  Pickaxe: "pickaxe"
} as const;

export type ToolType = (typeof ToolTypes)[keyof typeof ToolTypes];

/** A parameter value a requirement can carry. Never `any`, never `unknown`. */
export type RequirementParamValue = string | number | boolean;

/** One requirement instance: a type key plus whatever params that type needs. */
export type WorldRequirement = Readonly<{
  type: string;
  params: Readonly<Record<string, RequirementParamValue>>;
}>;

/**
 * Everything a requirement might need to evaluate against. Grows over time
 * (weather, time of day, region, faction, quest flags, skill levels...) the
 * same way InteractionContext and CraftingContext grow: new fields, never a
 * pipeline change. This subsystem never imports inventory or equipment —
 * WorldSession resolves these plain facts and hands them over, so "the world"
 * only ever knows this shape, never EquipmentManager or InventoryManager.
 */
export type RequirementContext = Readonly<{
  nowSeconds: number;
  equippedTool?: Readonly<{ toolType: string; tier: number }>;
}>;

/** Outcome of one requirement check. No message: failures are silent by design
 * (FIRST_HOUR_EXPERIENCE — the world never explains itself with interface). */
export type RequirementResult = Readonly<{
  satisfied: boolean;
}>;

/** One evaluator per requirement type — the only part that grows with CODE. */
export type RequirementEvaluator = (
  requirement: WorldRequirement,
  context: RequirementContext
) => RequirementResult;

/**
 * Read-only view of the requirement system. InteractableRegistry depends on
 * this interface, never on the concrete RequirementRegistry class — it can
 * evaluate but never register new evaluator types.
 */
export type RequirementQuery = Readonly<{
  evaluate(
    requirements: readonly WorldRequirement[],
    context: RequirementContext
  ): RequirementResult;
}>;

/** One requirement resolved for presentation/diagnostics (never shown to the player). */
export type RequirementCheckView = Readonly<{
  type: string;
  satisfied: boolean;
}>;

/**
 * Full diagnostic snapshot of every requirement on one interactable, for
 * developer tooling only. The player never sees this — the world stays
 * silent; this exists so the team can see *why* an interaction is or isn't
 * available while building content.
 */
export type RequirementSnapshot = Readonly<{
  requirements: readonly RequirementCheckView[];
  satisfied: boolean;
}>;
