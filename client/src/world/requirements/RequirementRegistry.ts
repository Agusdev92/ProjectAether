import type {
  RequirementCheckView,
  RequirementContext,
  RequirementEvaluator,
  RequirementQuery,
  RequirementResult,
  RequirementSnapshot,
  WorldRequirement
} from "@world/requirements/RequirementTypes";

/**
 * RequirementRegistry is the catalog of evaluator functions, one per
 * requirement type, plus the generic aggregation logic (every requirement
 * must be satisfied — AND semantics). It never knows what a "tool" or a
 * "faction" is; it only dispatches by type string, exactly like
 * InteractionManager dispatches handlers by verb. Adding hundreds of future
 * requirement types is new evaluator registrations — this class never changes.
 */
export class RequirementRegistry implements RequirementQuery {
  private readonly evaluators = new Map<string, RequirementEvaluator>();

  public register(type: string, evaluator: RequirementEvaluator): void {
    if (this.evaluators.has(type)) {
      throw new Error(`Duplicate requirement evaluator for type: ${type}`);
    }

    this.evaluators.set(type, evaluator);
  }

  /** AND semantics: every requirement must be satisfied. Short-circuits. */
  public evaluate(
    requirements: readonly WorldRequirement[],
    context: RequirementContext
  ): RequirementResult {
    for (const requirement of requirements) {
      if (!this.evaluateOne(requirement, context).satisfied) {
        return { satisfied: false };
      }
    }

    return { satisfied: true };
  }

  /**
   * Per-requirement breakdown for developer diagnostics only — never shown to
   * the player. Does not short-circuit, so every requirement's individual
   * result is visible even when the overall check fails.
   */
  public snapshot(
    requirements: readonly WorldRequirement[],
    context: RequirementContext
  ): RequirementSnapshot {
    const views: RequirementCheckView[] = requirements.map((requirement) => ({
      type: requirement.type,
      satisfied: this.evaluateOne(requirement, context).satisfied
    }));

    return {
      requirements: views,
      satisfied: views.every((view) => view.satisfied)
    };
  }

  private evaluateOne(
    requirement: WorldRequirement,
    context: RequirementContext
  ): RequirementResult {
    const evaluator = this.evaluators.get(requirement.type);

    if (!evaluator) {
      throw new Error(`No evaluator registered for requirement type: ${requirement.type}`);
    }

    return evaluator(requirement, context);
  }
}
