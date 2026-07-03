import { GameConstants } from "@shared/config/GameConstants";
import { tileToWorld, worldToTile } from "@world/coordinates/WorldCoordinates";
import type { WorldCoordinate } from "@world/coordinates/WorldCoordinates";
import { InteractableKinds, InteractionVerbs } from "@world/interaction/InteractionTypes";
import type { Interactable, InteractableSource } from "@world/interaction/InteractionTypes";
import { TileFeatureTypes } from "@world/tilemap/TileTypes";
import type { TileFeatureType } from "@world/tilemap/TileTypes";
import type { WorldTilemap } from "@world/tilemap/WorldTilemap";

/** Which tile features are interactable and what they present as. */
const FeatureKinds: Partial<
  Readonly<Record<TileFeatureType, Readonly<{ kind: string; name: string }>>>
> = {
  [TileFeatureTypes.Tree]: { kind: InteractableKinds.Tree, name: "Árbol" },
  [TileFeatureTypes.Rock]: { kind: InteractableKinds.Rock, name: "Roca" }
};

/**
 * TileFeatureInteractableSource derives interactables from terrain features on
 * demand, instead of registering thousands of trees and rocks up front. Ids
 * are stable per tile, so exhaustion state (resource respawn) survives even
 * though the Interactable objects themselves are created lazily. Works
 * unchanged when terrain becomes chunked or streamed.
 */
export class TileFeatureInteractableSource implements InteractableSource {
  public constructor(private readonly tilemap: WorldTilemap) {}

  public findWithin(position: WorldCoordinate, radiusInTiles: number): readonly Interactable[] {
    const center = worldToTile(position);
    const radius = Math.ceil(radiusInTiles);
    const found: Interactable[] = [];

    for (let y = center.y - radius; y <= center.y + radius; y += 1) {
      for (let x = center.x - radius; x <= center.x + radius; x += 1) {
        if (!this.isInsideMap(x, y)) {
          continue;
        }

        const tile = this.tilemap.getTileAt({ x, y });
        const featureKind = FeatureKinds[tile.feature];

        if (!featureKind) {
          continue;
        }

        found.push({
          id: `tile-feature:${x}:${y}`,
          kind: featureKind.kind,
          name: featureKind.name,
          verb: InteractionVerbs.Gather,
          position: tileToWorld({ x, y }),
          radiusInTiles: GameConstants.interaction.focusRadiusInTiles
        });
      }
    }

    return found;
  }

  private isInsideMap(x: number, y: number): boolean {
    return (
      x >= 0 &&
      y >= 0 &&
      x < this.tilemap.definition.widthInTiles &&
      y < this.tilemap.definition.heightInTiles
    );
  }
}
