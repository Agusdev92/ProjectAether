import type { EntityId, EntityTransform, MovementVector } from "@entities/EntityTypes";
import { GameConstants } from "@shared/config/GameConstants";
import type { CollisionProvider } from "@world/collision/CollisionProvider";

/**
 * Player is a domain entity. It owns movement intent and collision resolution,
 * but it does not know how it will be rendered or which input device is used.
 */
export class Player {
  public readonly id: EntityId;

  private transform: EntityTransform;

  public constructor(id: EntityId, spawn: EntityTransform) {
    this.id = id;
    this.transform = spawn;
  }

  public get position(): EntityTransform {
    return this.transform;
  }

  /**
   * Sets position directly, bypassing collision resolution — for restoring a
   * previously-valid position from a save, not for gameplay movement.
   */
  public teleport(position: EntityTransform): void {
    this.transform = position;
  }

  public move(
    movement: MovementVector,
    deltaSeconds: number,
    collisionProvider: CollisionProvider
  ): EntityTransform {
    const normalizedMovement = normalizeMovement(movement);
    const distance = GameConstants.world.playerSpeedPixelsPerSecond * deltaSeconds;
    const nextX = this.transform.x + normalizedMovement.x * distance;
    const nextY = this.transform.y + normalizedMovement.y * distance;

    this.transform = resolveAxisAlignedMovement(this.transform, nextX, nextY, collisionProvider);

    return this.transform;
  }
}

function normalizeMovement(movement: MovementVector): { readonly x: number; readonly y: number } {
  if (movement.x === 0 && movement.y === 0) {
    return { x: 0, y: 0 };
  }

  if (movement.x !== 0 && movement.y !== 0) {
    const diagonalScale = Math.SQRT1_2;

    return {
      x: movement.x * diagonalScale,
      y: movement.y * diagonalScale
    };
  }

  return movement;
}

function resolveAxisAlignedMovement(
  current: EntityTransform,
  nextX: number,
  nextY: number,
  collisionProvider: CollisionProvider
): EntityTransform {
  const movedX = collisionProvider.isBlockedAtWorld(nextX, current.y) ? current.x : nextX;
  const movedY = collisionProvider.isBlockedAtWorld(movedX, nextY) ? current.y : nextY;

  return {
    x: movedX,
    y: movedY
  };
}
