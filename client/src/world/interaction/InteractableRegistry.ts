import { GameConstants } from "@shared/config/GameConstants";
import type { WorldCoordinate } from "@world/coordinates/WorldCoordinates";
import type { Interactable, InteractableSource } from "@world/interaction/InteractionTypes";
import type { RequirementContext, RequirementQuery } from "@world/requirements/RequirementTypes";

/**
 * InteractableRegistry answers one question: what can the player act on from
 * a given position? It merges two origins — explicit registrations (zone
 * content anchored to POIs or tiles) and sources (entities derived on demand,
 * like tile features) — and owns the exhaustion state so gathered resources
 * stay unavailable until they respawn. It also filters candidates against
 * their WorldRequirements through an injected RequirementQuery: an object
 * whose requirements aren't met simply never competes to be focused — fully
 * diegetic, no message, no disabled button. Pure domain: no Phaser, no
 * event bus, and no knowledge of what a "requirement" evaluates against
 * (that lives entirely behind RequirementQuery).
 */
export class InteractableRegistry {
  private readonly explicit = new Map<string, Interactable>();
  private readonly sources: InteractableSource[] = [];
  private readonly exhaustedUntilSeconds = new Map<string, number>();

  public constructor(private readonly requirements: RequirementQuery) {}

  public register(interactable: Interactable): void {
    if (this.explicit.has(interactable.id)) {
      throw new Error(`Duplicate interactable id: ${interactable.id}`);
    }

    this.explicit.set(interactable.id, interactable);
  }

  public addSource(source: InteractableSource): void {
    this.sources.push(source);
  }

  /**
   * Returns the closest ready interactable whose own radius reaches the given
   * position and whose requirements are met, or undefined. Exhausted entries
   * and requirement-blocked entries are equally invisible: a gathered tree and
   * an un-equipped-for tree are both simply not there to interact with.
   */
  public findFocused(
    position: WorldCoordinate,
    nowSeconds: number,
    requirementContext: RequirementContext
  ): Interactable | undefined {
    return this.nearestMatching(
      position,
      (candidate) =>
        !this.isExhausted(candidate.id, nowSeconds) &&
        this.requirements.evaluate(candidate.requirements ?? [], requirementContext).satisfied
    );
  }

  /**
   * Nearest candidate ignoring requirements — developer diagnostics only
   * (RequirementSnapshot). Never used for gameplay gating: exhaustion still
   * applies, requirements do not.
   */
  public findNearestIgnoringRequirements(
    position: WorldCoordinate,
    nowSeconds: number
  ): Interactable | undefined {
    return this.nearestMatching(
      position,
      (candidate) => !this.isExhausted(candidate.id, nowSeconds)
    );
  }

  public isExhausted(interactableId: string, nowSeconds: number): boolean {
    const until = this.exhaustedUntilSeconds.get(interactableId);

    return until !== undefined && nowSeconds < until;
  }

  /** Marks an interactable unavailable until now + duration (or forever). */
  public exhaust(interactableId: string, nowSeconds: number, durationSeconds: number): void {
    this.exhaustedUntilSeconds.set(
      interactableId,
      durationSeconds === Number.POSITIVE_INFINITY
        ? Number.POSITIVE_INFINITY
        : nowSeconds + durationSeconds
    );
  }

  private collectCandidates(position: WorldCoordinate): Interactable[] {
    const scanRadius = GameConstants.interaction.sourceScanRadiusInTiles;
    const candidates: Interactable[] = [...this.explicit.values()];

    for (const source of this.sources) {
      candidates.push(...source.findWithin(position, scanRadius));
    }

    return candidates;
  }

  private nearestMatching(
    position: WorldCoordinate,
    predicate: (candidate: Interactable) => boolean
  ): Interactable | undefined {
    let nearest: Interactable | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const candidate of this.collectCandidates(position)) {
      if (!predicate(candidate)) {
        continue;
      }

      const distance = distanceInTiles(position, candidate.position);

      if (distance <= candidate.radiusInTiles && distance < nearestDistance) {
        nearest = candidate;
        nearestDistance = distance;
      }
    }

    return nearest;
  }
}

function distanceInTiles(from: WorldCoordinate, to: WorldCoordinate): number {
  return Math.hypot(from.x - to.x, from.y - to.y) / GameConstants.tile.collisionSize;
}
