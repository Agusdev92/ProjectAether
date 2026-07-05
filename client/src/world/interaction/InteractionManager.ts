import type { EquipmentQuery } from "@world/equipment/EquipmentTypes";
import type { InteractableRegistry } from "@world/interaction/InteractableRegistry";
import type {
  Interactable,
  InteractionHandler,
  InteractionOutcome,
  InteractionVerb
} from "@world/interaction/InteractionTypes";
import type { RequirementContext } from "@world/requirements/RequirementTypes";

/**
 * InteractionManager executes interactions: it resolves the focused
 * interactable, dispatches to the handler registered for its verb, and applies
 * the resulting exhaustion. Its API shape — interact(position, now) returning
 * a result — is deliberately the shape of a future server RPC, so moving
 * authority to the server will not change any caller.
 */
export class InteractionManager {
  private readonly registry: InteractableRegistry;
  private readonly handlers: ReadonlyMap<InteractionVerb, InteractionHandler>;

  public constructor(
    registry: InteractableRegistry,
    handlers: ReadonlyMap<InteractionVerb, InteractionHandler>
  ) {
    this.registry = registry;
    this.handlers = handlers;
  }

  /** The interactable the player could act on right now, if any. */
  public findFocused(
    position: Readonly<{ x: number; y: number }>,
    nowSeconds: number,
    requirementContext: RequirementContext
  ): Interactable | undefined {
    return this.registry.findFocused(position, nowSeconds, requirementContext);
  }

  /**
   * Nearest interactable ignoring requirements — developer diagnostics only,
   * passed straight through to the registry.
   */
  public findNearestIgnoringRequirements(
    position: Readonly<{ x: number; y: number }>,
    nowSeconds: number
  ): Interactable | undefined {
    return this.registry.findNearestIgnoringRequirements(position, nowSeconds);
  }

  /** Performs the focused interaction. Undefined when nothing is in range. */
  public interact(
    position: Readonly<{ x: number; y: number }>,
    nowSeconds: number,
    equipment: EquipmentQuery,
    requirementContext: RequirementContext
  ): InteractionOutcome | undefined {
    const interactable = this.registry.findFocused(position, nowSeconds, requirementContext);

    if (!interactable) {
      return undefined;
    }

    const handler = this.handlers.get(interactable.verb);

    if (!handler) {
      throw new Error(`No handler registered for interaction verb: ${interactable.verb}`);
    }

    const result = handler(interactable, { nowSeconds, equipment });

    if (result.success && result.exhaustForSeconds !== undefined) {
      this.registry.exhaust(interactable.id, nowSeconds, result.exhaustForSeconds);
    }

    return { interactable, result };
  }
}
