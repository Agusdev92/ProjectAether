import { GameConstants } from "@shared/config/GameConstants";
import type { WorldCoordinate } from "@world/coordinates/WorldCoordinates";
import type { Interactable, InteractableSource } from "@world/interaction/InteractionTypes";

/**
 * InteractableRegistry answers one question: what can the player act on from
 * a given position? It merges two origins — explicit registrations (zone
 * content anchored to POIs) and sources (entities derived on demand, like
 * tile features) — and owns the exhaustion state so gathered resources stay
 * unavailable until they respawn. Pure domain: no Phaser, no event bus.
 */
export class InteractableRegistry {
  private readonly explicit = new Map<string, Interactable>();
  private readonly sources: InteractableSource[] = [];
  private readonly exhaustedUntilSeconds = new Map<string, number>();

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
   * position, or undefined. Exhausted entries are invisible until they respawn:
   * a gathered tree is simply not there to interact with.
   */
  public findFocused(position: WorldCoordinate, nowSeconds: number): Interactable | undefined {
    const scanRadius = GameConstants.interaction.sourceScanRadiusInTiles;
    const candidates: Interactable[] = [...this.explicit.values()];

    for (const source of this.sources) {
      candidates.push(...source.findWithin(position, scanRadius));
    }

    let focused: Interactable | undefined;
    let focusedDistance = Number.POSITIVE_INFINITY;

    for (const candidate of candidates) {
      if (this.isExhausted(candidate.id, nowSeconds)) {
        continue;
      }

      const distance = distanceInTiles(position, candidate.position);

      if (distance <= candidate.radiusInTiles && distance < focusedDistance) {
        focused = candidate;
        focusedDistance = distance;
      }
    }

    return focused;
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
}

function distanceInTiles(from: WorldCoordinate, to: WorldCoordinate): number {
  return Math.hypot(from.x - to.x, from.y - to.y) / GameConstants.tile.collisionSize;
}
