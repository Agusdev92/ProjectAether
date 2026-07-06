import { GameConstants } from "@shared/config/GameConstants";
import type { AmbientSoundDefinition } from "@world/atmosphere/AtmosphereTypes";
import { tileToWorld } from "@world/coordinates/WorldCoordinates";
import type { WorldCoordinate } from "@world/coordinates/WorldCoordinates";

/**
 * Resolves the effective volume of one ambient sound channel from the
 * player's position — a pure function, same shape as resolveScheduledTile/
 * resolveWeatherForDay: no state, no Phaser. Channels without `spatial` play
 * at a constant baseVolume everywhere (a global bed); channels with it fade
 * linearly to zero at falloffRadiusInTiles.
 */
export function resolveChannelVolume(
  definition: AmbientSoundDefinition,
  playerPosition: WorldCoordinate
): number {
  if (!definition.spatial) {
    return definition.baseVolume;
  }

  const anchor = tileToWorld(definition.spatial.anchorTile);
  const distanceInTiles =
    Math.hypot(playerPosition.x - anchor.x, playerPosition.y - anchor.y) /
    GameConstants.tile.collisionSize;
  const falloff = Math.max(0, 1 - distanceInTiles / definition.spatial.falloffRadiusInTiles);

  return definition.baseVolume * falloff;
}
