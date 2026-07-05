import { GameConstants } from "@shared/config/GameConstants";
import { tileToWorld, worldToTile } from "@world/coordinates/WorldCoordinates";
import type { WorldCoordinate } from "@world/coordinates/WorldCoordinates";
import { InteractableKinds, InteractionVerbs } from "@world/interaction/InteractionTypes";
import type { Interactable, InteractableSource } from "@world/interaction/InteractionTypes";
import { RequirementTypes, ToolTypes } from "@world/requirements/RequirementTypes";
import type { WorldRequirement } from "@world/requirements/RequirementTypes";
import { TileFeatureTypes } from "@world/tilemap/TileTypes";
import type { TileFeatureType } from "@world/tilemap/TileTypes";
import type { WorldTilemap } from "@world/tilemap/WorldTilemap";

/** Requires any tool of the given type, tier 0 or higher — data, not code. */
function toolRequirement(toolType: string): readonly WorldRequirement[] {
  return [
    { type: RequirementTypes.ToolType, params: { toolType } },
    { type: RequirementTypes.ToolTier, params: { minTier: 0 } }
  ];
}

/** Which tile features are interactable, what they present as, and what they require. */
const FeatureKinds: Partial<
  Readonly<
    Record<
      TileFeatureType,
      Readonly<{ kind: string; name: string; requirements: readonly WorldRequirement[] }>
    >
  >
> = {
  [TileFeatureTypes.Tree]: {
    kind: InteractableKinds.Tree,
    name: "Árbol",
    requirements: toolRequirement(ToolTypes.Axe)
  },
  [TileFeatureTypes.Rock]: {
    kind: InteractableKinds.Rock,
    name: "Roca",
    requirements: toolRequirement(ToolTypes.Pickaxe)
  }
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
          radiusInTiles: GameConstants.interaction.focusRadiusInTiles,
          requirements: featureKind.requirements
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
