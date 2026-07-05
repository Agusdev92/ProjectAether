import { Player } from "@entities/Player";
import type { MovementVector } from "@entities/EntityTypes";
import { GameConstants } from "@shared/config/GameConstants";
import { AtmosphereManager } from "@world/atmosphere/AtmosphereManager";
import { WorldClock } from "@world/clock/WorldClock";
import type { CollisionProvider } from "@world/collision/CollisionProvider";
import { CraftingManager } from "@world/crafting/CraftingManager";
import { createDefaultRecipeRegistry } from "@world/crafting/RecipeCatalog";
import { UbiquitousCraftingStations } from "@world/crafting/CraftingTypes";
import type { CraftingResult, CraftingStation, RecipeOffer } from "@world/crafting/CraftingTypes";
import { DangerManager } from "@world/danger/DangerManager";
import { DangerZoneRegistry } from "@world/danger/DangerZoneRegistry";
import type { DangerReport, DangerZoneDefinition } from "@world/danger/DangerTypes";
import { EquipmentManager } from "@world/equipment/EquipmentManager";
import { createDefaultEquipmentRegistry } from "@world/equipment/EquipmentCatalog";
import { EquipmentSlotOrder } from "@world/equipment/EquipmentTypes";
import type { EquipmentChangeResult } from "@world/equipment/EquipmentTypes";
import { tileToWorld } from "@world/coordinates/WorldCoordinates";
import type { WorldCoordinate } from "@world/coordinates/WorldCoordinates";
import { InteractableRegistry } from "@world/interaction/InteractableRegistry";
import { InteractionManager } from "@world/interaction/InteractionManager";
import { createDefaultInteractionHandlers } from "@world/interaction/InteractionHandlers";
import { TileFeatureInteractableSource } from "@world/interaction/TileFeatureInteractableSource";
import type {
  Interactable,
  InteractionOutcome,
  ZoneInteractableDefinition
} from "@world/interaction/InteractionTypes";
import { InventoryManager } from "@world/inventory/InventoryManager";
import { createDefaultItemRegistry } from "@world/inventory/ItemCatalog";
import { ItemCategories } from "@world/inventory/InventoryTypes";
import type { ConsumedStack, ItemGrant } from "@world/inventory/InventoryTypes";
import { NpcRegistry } from "@world/npc/NpcRegistry";
import { resolveScheduledTile } from "@world/npc/NpcTypes";
import type { NpcPositionView } from "@world/npc/NpcTypes";
import { PoiRegistry } from "@world/poi/PoiRegistry";
import { PoiTypes } from "@world/poi/PoiTypes";
import type { PoiDefinition } from "@world/poi/PoiTypes";
import { createDefaultRequirementRegistry } from "@world/requirements/RequirementEvaluators";
import type { RequirementRegistry } from "@world/requirements/RequirementRegistry";
import type { RequirementContext, RequirementSnapshot } from "@world/requirements/RequirementTypes";
import type { WorldSaveSnapshot } from "@world/save/SaveTypes";
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
  public readonly equipment: EquipmentManager;
  public readonly clock: WorldClock;
  public readonly npcs: NpcRegistry;
  public readonly danger: DangerManager;

  private readonly collision: CollisionProvider;
  private readonly requirements: RequirementRegistry;
  private elapsedSeconds = 0;
  private pendingDangerReports: DangerReport[] = [];

  public constructor(zone: ZoneDefinition = FirstCoastZone) {
    this.zone = zone;
    this.tilemap = new WorldTilemap(zone.tilemap, zone.terrain);
    this.pois = new PoiRegistry(zone.pois);
    this.atmosphere = new AtmosphereManager(zone.atmosphere);
    this.clock = new WorldClock();
    this.npcs = new NpcRegistry(zone.npcs);
    this.danger = new DangerManager(new DangerZoneRegistry(zone.dangerZones));
    this.player = new Player("local-player", this.tilemap.spawnWorldPosition);
    this.requirements = createDefaultRequirementRegistry();
    this.interactions = this.createInteractions(zone);

    // One item registry shared by inventory and crafting: a single source of
    // truth for every item id in the game.
    const itemRegistry = createDefaultItemRegistry();

    this.inventory = new InventoryManager(itemRegistry, GameConstants.inventory.capacitySlots);
    this.crafting = new CraftingManager(createDefaultRecipeRegistry(), itemRegistry);
    this.equipment = new EquipmentManager(createDefaultEquipmentRegistry(), itemRegistry);
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
    this.clock.update(deltaSeconds);

    const triggeredZone = this.danger.update(
      this.player.position,
      this.clock.timeOfDay,
      deltaSeconds
    );

    if (triggeredZone) {
      this.pendingDangerReports.push(this.applyDangerConsequence(triggeredZone));
    }
  }

  /** The interactable the player could act on right now, if any. */
  public getFocusedInteractable(): Interactable | undefined {
    return this.interactions.findFocused(
      this.player.position,
      this.elapsedSeconds,
      this.buildRequirementContext()
    );
  }

  /**
   * Diagnostic only: what the world would require of the nearest object,
   * ignoring whether the player actually meets it, and whether it does.
   * Never surfaced to the player — for developer tooling exclusively.
   */
  public getFocusedRequirementSnapshot(): RequirementSnapshot | undefined {
    const nearest = this.interactions.findNearestIgnoringRequirements(
      this.player.position,
      this.elapsedSeconds
    );

    if (!nearest?.requirements || nearest.requirements.length === 0) {
      return undefined;
    }

    return this.requirements.snapshot(nearest.requirements, this.buildRequirementContext());
  }

  /**
   * Performs the focused interaction and deposits its yields in the player
   * inventory. Interaction and inventory never know each other: the session
   * is the only bridge. Undefined when nothing is in range.
   */
  public interact(): InteractionReport | undefined {
    const outcome = this.interactions.interact(
      this.player.position,
      this.elapsedSeconds,
      this.equipment,
      this.buildRequirementContext()
    );

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
   * Current world-space position of every NPC in the zone, resolved from the
   * clock's time of day. A pure query, never gated on player proximity: the
   * world keeps going whether or not anyone is watching (Pilar 1).
   */
  public getNpcPositions(): readonly NpcPositionView[] {
    const timeOfDay = this.clock.timeOfDay;

    return this.npcs.all.map((npc) => ({
      id: npc.id,
      name: npc.name,
      position: tileToWorld(resolveScheduledTile(npc, timeOfDay))
    }));
  }

  /**
   * Danger zones currently active for the clock's time of day, regardless of
   * player position — presentation uses this to warn before anyone steps in,
   * never gated on proximity (the risk must be legible before it is felt).
   */
  public getActiveDangerZones(): readonly DangerZoneDefinition[] {
    return this.danger.getActiveZones(this.clock.timeOfDay);
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

  /**
   * Equips an item from the bag. Equipment and inventory never know each
   * other beyond the swap the manager performs here under session control.
   */
  public equip(itemId: string): EquipmentChangeResult {
    return this.equipment.equip(itemId, undefined, this.inventory, {
      nowSeconds: this.elapsedSeconds
    });
  }

  /** Unequips a slot back into the bag; cancelled when the bag is full. */
  public unequip(slotId: string): EquipmentChangeResult {
    const slot = EquipmentSlotOrder.find((candidate) => candidate === slotId);

    if (!slot) {
      return { success: false, message: "Slot desconocido." };
    }

    return this.equipment.unequip(slot, this.inventory);
  }

  /**
   * The station of the given kind currently usable, if any. Ubiquitous
   * stations (Tier 0 survival crafting) are always active, anywhere, with no
   * proximity check at all — CraftingManager never learns this distinction
   * exists; it only ever receives a { kind, name } station.
   */
  public getActiveStation(stationKind: string): CraftingStation | undefined {
    const ubiquitousName = UbiquitousCraftingStations.get(stationKind);

    if (ubiquitousName) {
      return { kind: stationKind, name: ubiquitousName };
    }

    const focused = this.getFocusedInteractable();

    if (!focused || focused.kind !== stationKind) {
      return undefined;
    }

    return { kind: focused.kind, name: focused.name };
  }

  /**
   * Returns POIs newly discovered around the player since the last call.
   * The session stays event-bus agnostic: presentation decides how to announce.
   */
  public consumePoiDiscoveries(): readonly PoiDefinition[] {
    return this.pois.discoverNear(this.player.position);
  }

  /**
   * Returns danger events triggered since the last call. The session stays
   * event-bus agnostic here too: presentation decides how to announce them.
   */
  public consumeDangerEvents(): readonly DangerReport[] {
    const reports = this.pendingDangerReports;

    this.pendingDangerReports = [];

    return reports;
  }

  /**
   * Assembles the full player-progress save from every subsystem's own
   * shape. WorldSession is the only place that knows all of them at once —
   * the same role it already plays for buildRequirementContext().
   */
  public get snapshot(): WorldSaveSnapshot {
    return {
      zoneId: this.zone.tilemap.id,
      player: { x: this.player.position.x, y: this.player.position.y },
      inventory: this.inventory.rawSlots,
      equipment: this.equipment.rawLoadout,
      worldClock: this.clock.snapshot,
      interactableExhaustion: this.interactions.exhaustionSnapshot(this.elapsedSeconds)
    };
  }

  /**
   * Restores every subsystem from a save. zoneId is intentionally not
   * applied: WorldSession always constructs the zone it was given at
   * creation, and no zone-switching flow exists yet to act on a different
   * saved zone — a documented no-op, not an oversight.
   */
  public restore(snapshot: WorldSaveSnapshot): void {
    this.player.teleport(snapshot.player);
    this.inventory.restore(snapshot.inventory);
    this.equipment.restore(snapshot.equipment);
    this.clock.restore(snapshot.worldClock);
    this.interactions.restoreExhaustion(snapshot.interactableExhaustion);
  }

  /**
   * Builds the interaction stack of the zone: tile features arrive through a
   * lazy source; zone-declared interactables anchor either to a POI's center
   * (places with narrative weight — camp, forge) or directly to a tile
   * (loose ground clutter that isn't a point of interest on its own).
   */
  private createInteractions(zone: ZoneDefinition): InteractionManager {
    const registry = new InteractableRegistry(this.requirements);

    registry.addSource(new TileFeatureInteractableSource(this.tilemap));

    for (const definition of zone.interactables) {
      registry.register({
        id: definition.id,
        kind: definition.kind,
        name: definition.name,
        verb: definition.verb,
        position: this.resolveInteractablePosition(definition),
        radiusInTiles: definition.radiusInTiles,
        requirements: definition.requirements
      });
    }

    return new InteractionManager(registry, createDefaultInteractionHandlers());
  }

  /**
   * Translates equipment-domain facts into the neutral shape the requirement
   * system understands. This is the only place that knows both vocabularies —
   * world/requirements never imports EquipmentManager or EquipmentQuery.
   */
  private buildRequirementContext(): RequirementContext {
    return {
      nowSeconds: this.elapsedSeconds,
      equippedTool: this.equipment.getEquippedToolInfo()
    };
  }

  /**
   * Applies a danger zone's catch: sweeps every raw resource (never tools,
   * never equipped items, never narrative curios) and repositions the player
   * to the zone's retreat tile. Reversible by design — lost resources remain
   * obtainable elsewhere in the zone; this never ends the game.
   */
  private applyDangerConsequence(zone: DangerZoneDefinition): DangerReport {
    const lostItems = this.inventory.consumeAllOfCategory(ItemCategories.Resource);

    this.player.teleport(tileToWorld(zone.retreatTile));

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      message: this.formatDangerMessage(lostItems),
      lostItems
    };
  }

  /**
   * Narrates the consequence instead of reporting it in the cold "lost items"
   * sense (Pilar 8: consequences, not explanations). Never claims a loss that
   * did not happen.
   */
  private formatDangerMessage(lostItems: readonly ConsumedStack[]): string {
    if (lostItems.length === 0) {
      return "La marea te arrastró de vuelta.";
    }

    const parts = lostItems.map((item) => `${item.quantity} ${item.itemName}`);
    const itemList =
      parts.length === 1
        ? parts[0]
        : `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}`;

    return `La marea te arrastró de vuelta y se llevó ${itemList}.`;
  }

  private resolveInteractablePosition(definition: ZoneInteractableDefinition): WorldCoordinate {
    if (definition.anchorTile) {
      return tileToWorld(definition.anchorTile);
    }

    if (definition.poiId) {
      const poi = this.pois.all.find((candidate) => candidate.id === definition.poiId);

      if (!poi) {
        throw new Error(
          `Zone interactable ${definition.id} references unknown POI ${definition.poiId}`
        );
      }

      return PoiRegistry.footprintCenterWorld(poi);
    }

    throw new Error(`Zone interactable ${definition.id} needs either poiId or anchorTile.`);
  }
}
