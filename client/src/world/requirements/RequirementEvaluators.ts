import { RequirementRegistry } from "@world/requirements/RequirementRegistry";
import { RequirementTypes } from "@world/requirements/RequirementTypes";
import type { RequirementEvaluator } from "@world/requirements/RequirementTypes";

/**
 * The current requirement evaluators. Pure content: a new requirement type
 * (Item, Quest, Skill, Reputation, Weather, Time, Region, Faction) means one
 * more small function here and one more registration — never a change to
 * RequirementRegistry or anything upstream of it.
 */

const toolTypeEvaluator: RequirementEvaluator = (requirement, context) => {
  const requiredToolType = requirement.params.toolType;

  return { satisfied: context.equippedTool?.toolType === requiredToolType };
};

const toolTierEvaluator: RequirementEvaluator = (requirement, context) => {
  const minTier = requirement.params.minTier;

  if (typeof minTier !== "number") {
    return { satisfied: false };
  }

  return { satisfied: (context.equippedTool?.tier ?? -1) >= minTier };
};

/** Builds the registry with every requirement evaluator the game currently knows. */
export function createDefaultRequirementRegistry(): RequirementRegistry {
  const registry = new RequirementRegistry();

  registry.register(RequirementTypes.ToolType, toolTypeEvaluator);
  registry.register(RequirementTypes.ToolTier, toolTierEvaluator);

  return registry;
}
