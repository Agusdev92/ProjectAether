import { Player } from "@entities/Player";
import type { MovementVector } from "@entities/EntityTypes";
import { GameConstants } from "@shared/config/GameConstants";
import { AtmosphereManager } from "@world/atmosphere/AtmosphereManager";
import type { CollisionProvider } from "@world/collision/CollisionProvider";
import { CraftingManager } from "@world/crafting/CraftingManager";
import { createDefaultRecipeRegistry } from "@world/crafting/RecipeCatalog";
import type { CraftingResult, RecipeOffer } from "@world/crafting/CraftingTypes";
import { InteractableRegistry } from "@world/interaction/InteractableRegistry";
import { InteractionManager } from "@world/interaction/InteractionManager";
import { createDefaultInteractionHandlers } from "@world/interaction/InteractionHandlers";
import { TileFeatureInteractableSource } from "@world/interaction/TileFeatureInteractableSource";
import type { Interactable, InteractionOutcome } from "@world/interaction/InteractionTypes";
import { InventoryManager } from "@world/inventory/InventoryManager";
import { createDefaultItemRegistry } from "@world/inventory/ItemCatalog";
import type { ItemGrant } from "@world/inventory/InventoryTypes";
import { PoiRegistry } from "@world/poi/PoiRegistry";
import { PoiTypes } from "@world/poi/PoiTypes";
import type { PoiDefinition } from "@world/poi/PoiTypes";
import { WorldTilemap } from "@world/tilemap/WorldTilemap";
import { FirstCoastZone } from "@world/zones/FirstCoastZone";
import type { ZoneDefinition } from "@world/zones/ZoneDefinition";

/** Everything one interaction produced: the outcome plus inventory grants. */
export type InteractionReport = Readonly<{
  outcome: InteractionOutcome;
  grants: readonly ItemGrant[];
}>;

/**
 * WorldSession coordinates the current local world state without depending on
 * Phaser. It composes tilemap and POI collisions behind one CollisionProvider
 * so entities never know how many collision sources exist. Future networking
 * can replace or reconcile this state from server snapshots.
 */
export class WorldSession {
  public readonly zone: ZoneDefinition;
  public readonly tilemap: WorldTilemap;
  public readonly pois: PoiRegistry;
  public readonly atmosphere: AtmosphereManager;
  public readonly player: Player;
  public readonly interactions: InteractionManager;
  public readonly inventory: InventoryManager;
  public readonly crafting: CraftingManager;

  private readonly collision: CollisionProvider;
  private elapsedSeconds = 0;

  public constructor(zone: ZoneDefinition = FirstCoastZone) {
    this.zone = zone;
    this.tilemap = new WorldTilemap(zone.tilemap, zone.terrain);
    this.pois = new PoiRegistry(zone.pois);
    this.atmosphere = new AtmosphereManager(zone.atmosphere);
    this.player = new Player("local-player", this.tilemap.spawnWorldPosition);
    this.interactions = this.createInteractions(zone);

    // One item registry shared by inventory and crafting: a single source of
    // truth for every item id in the game.
    const itemRegistry = createDefaultItemRegistry();

    this.inventory = new InventoryManager(itemRegistry, GameConstants.inventory.capacitySlots);
    this.crafting = new CraftingManager(createDefaultRecipeRegistry(), itemRegistry);
    this.collision = {
      isBlockedAtWorld: (worldX, worldY) =>
        this.tilemap.isBlockedAtWorld(worldX, worldY) || this.pois.isBlockedAtWorld(worldX, worldY)
    };
  }

  /** Advances every simulated world system: the player and the atmosphere. */
  public update(movement: MovementVector, deltaSeconds: number): void {
    this.elapsedSeconds += deltaSeconds;
    this.player.move(movement, deltaSeconds, this.collision);
    this.atmosphere.update(deltaSeconds);
  }

  /** The interactable the player could act on right now, if any. */
  public getFocusedInteractable(): Interactable | undefined {
    return this.interactions.findFocused(this.player.position, this.elapsedSeconds);
  }

  /**
   * Performs the focused interaction and deposits its yields in the player
   * inventory. Interaction and inventory never know each other: the session
   * is the only bridge. Undefined when nothing is in range.
   */
  public interact(): InteractionReport | undefined {
    const outcome = this.interactions.interact(this.player.position, this.elapsedSeconds);

    if (!outcome) {
      return undefined;
    }

    const grants: ItemGrant[] = [];

    if (outcome.result.success) {
      for (const itemYield of outcome.result.yields) {
        grants.push(this.inventory.grant(itemYield.itemId, itemYield.quantity));
      }
    }

    return { outcome, grants };
  }

  /**
   * Returns the lookout POI the player currently stands at, if any. The
   * presentation layer uses this to soften the camera; the domain only states
   * the fact.
   */
  public getActiveLookout(): PoiDefinition | undefined {
    return this.pois.findNearestOfType(
      PoiTypes.Lookout,
      this.player.position,
      GameConstants.atmosphere.lookoutVantageRadiusInTiles
    );
  }

  /**
   * What the given station offers right now, resolved against the player
   * inventory. Empty when the player is not standing at that station.
   */
  public getCraftingOffer(stationKind: string): readonly RecipeOffer[] {
    if (!this.getActiveStation(stationKind)) {
      return [];
    }

    return this.crafting.getOffer(stationKind, this.inventory);
  }

  /**
   * Crafts a recipe at the station the player is standing at. Walking away
   * closes the offer honestly: the craft fails instead of teleporting logic.
   */
  public craft(recipeId: string, stationKind: string): CraftingResult {
    const station = this.getActiveStation(stationKind);

    if (!station) {
      return {
        recipeId,
        recipeName: "",
        success: false,
        message: "Te alejaste de la estación.",
        grants: []
      };
    }

    return this.crafting.craft(
      recipeId,
      { station: { kind: station.kind, name: station.name }, nowSeconds: this.elapsedSeconds },
      this.inventory
    );
  }

  /** The station interactable of the given kind the player stands at, if any. */
  public getActiveStation(stationKind: string): Interactable | undefined {
    const focused = this.getFocusedInteractable();

    return focused && focused.kind === stationKind ? focused : undefined;
  }

  /**
   * Returns POIs newly discovered around the player since the last call.
   * The session stays event-bus agnostic: presentation decides how to announce.
   */
  public consumePoiDiscoveries(): readonly PoiDefinition[] {
    return this.pois.discoverNear(this.player.position);
  }

  /**
   * Builds the interaction stack of the zone: tile features arrive through a
   * lazy source; zone-declared interactables anchor to their POI centers.
   */
  private createInteractions(zone: ZoneDefinition): InteractionManager {
    const registry = new InteractableRegistry();

    registry.addSource(new TileFeatureInteractableSource(this.tilemap));

    for (const definition of zone.interactables) {
      const poi = this.pois.all.find((candidate) => candidate.id === definition.poiId);

      if (!poi) {
        throw new Error(
          `Zone interactable ${definition.id} references unknown POI ${definition.poiId}`
        );
      }

      registry.register({
        id: definition.id,
        kind: definition.kind,
        name: definition.name,
        verb: definition.verb,
        position: PoiRegistry.footprintCenterWorld(poi),
        radiusInTiles: definition.radiusInTiles
      });
    }

    return new InteractionManager(registry, createDefaultInteractionHandlers());
  }
}
