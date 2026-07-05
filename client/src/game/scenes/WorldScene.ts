import Phaser from "phaser";
import { AmbientParticleSystem } from "@game/atmosphere/AmbientParticleSystem";
import { EnvironmentEffects } from "@game/atmosphere/EnvironmentEffects";
import { LookoutCamera } from "@game/atmosphere/LookoutCamera";
import { ActionKey } from "@game/input/ActionKey";
import { KeyboardMovement } from "@game/input/KeyboardMovement";
import { GroundClutterRenderer } from "@game/rendering/GroundClutterRenderer";
import { InteractionIndicator } from "@game/rendering/InteractionIndicator";
import { IsometricTilemapRenderer } from "@game/rendering/IsometricTilemapRenderer";
import { PoiRenderer } from "@game/rendering/PoiRenderer";
import { SceneKeys } from "@game/scene-keys";
import { AmbientSoundManager } from "@services/audio/AmbientSoundManager";
import { NullSoundPlayer } from "@services/audio/SoundPlayer";
import { gameEvents } from "@services/events/GameEvents";
import { GameConstants } from "@shared/config/GameConstants";
import { AmbientEffectTypes } from "@world/atmosphere/AtmosphereTypes";
import type { AmbientEffectType } from "@world/atmosphere/AtmosphereTypes";
import { tileToWorld, worldToTile } from "@world/coordinates/WorldCoordinates";
import { CraftingStationKinds } from "@world/crafting/CraftingTypes";
import { WorldSession } from "@world/WorldSession";

/**
 * WorldScene is the future home for map rendering, entity presentation, camera
 * behavior, and client-side world orchestration. It intentionally does not own
 * UI concerns; the UI scene runs in parallel above it.
 */
export class WorldScene extends Phaser.Scene {
  private readonly worldSession = new WorldSession();
  private movement?: KeyboardMovement;
  private tilemapRenderer?: IsometricTilemapRenderer;
  private playerMarker?: Phaser.GameObjects.Container;
  private playerBody?: Phaser.GameObjects.Ellipse;
  private environmentEffects?: EnvironmentEffects;
  private ambientParticles?: AmbientParticleSystem;
  private lookoutCamera?: LookoutCamera;
  private ambientSound?: AmbientSoundManager;
  private activeLookoutId?: string;
  private interactionKey?: ActionKey;
  private interactionIndicator?: InteractionIndicator;
  private focusedInteractableId: string | null = null;
  private openStationKind: string | null = null;
  private survivalCraftKey?: ActionKey;
  private readonly unsubscribeHandlers: Array<() => void> = [];

  public constructor() {
    super(SceneKeys.World);
  }

  public create(): void {
    const { definition } = this.worldSession.tilemap;

    gameEvents.emit("world:entered", { zoneId: definition.id });
    gameEvents.emit("world:map-loaded", {
      mapId: definition.id,
      mapName: definition.name,
      widthInTiles: definition.widthInTiles,
      heightInTiles: definition.heightInTiles
    });
    gameEvents.emit("world:pois-loaded", {
      zoneId: definition.id,
      poiCount: this.worldSession.pois.all.length
    });

    this.movement = new KeyboardMovement(this);
    this.tilemapRenderer = new IsometricTilemapRenderer(this, this.worldSession.tilemap);
    new PoiRenderer(this, this.tilemapRenderer).renderAll(this.worldSession.pois.all);
    new GroundClutterRenderer(this, this.tilemapRenderer).renderAll(
      this.worldSession.zone.interactables.flatMap((definition) =>
        definition.anchorTile
          ? [{ kind: definition.kind, position: tileToWorld(definition.anchorTile) }]
          : []
      )
    );
    this.createAtmosphere();
    this.interactionKey = new ActionKey(this, Phaser.Input.Keyboard.KeyCodes.E);
    this.survivalCraftKey = new ActionKey(this, Phaser.Input.Keyboard.KeyCodes.C);
    this.interactionIndicator = new InteractionIndicator(this, this.tilemapRenderer);
    this.playerMarker = this.createPlayerMarker();
    this.configureCamera();
    this.updateWorldPresentation();
    this.scene.launch(SceneKeys.UI);
    // The UI scene subscribes on its create; give it the initial state then.
    this.time.delayedCall(0, () => {
      this.emitInventorySnapshot();
      this.emitEquipmentSnapshot();
    });
    this.registerCraftingHandlers();
  }

  /** UI requests arrive through the bus; the scene adapts, the domain decides. */
  private registerCraftingHandlers(): void {
    this.unsubscribeHandlers.push(
      gameEvents.on("equipment:equip-requested", (payload) => {
        this.applyEquipmentChange(this.worldSession.equip(payload.itemId));
      }),
      gameEvents.on("equipment:unequip-requested", (payload) => {
        this.applyEquipmentChange(this.worldSession.unequip(payload.slot));
      }),
      gameEvents.on("crafting:craft-requested", (payload) => {
        const result = this.worldSession.craft(payload.recipeId, payload.stationKind);

        gameEvents.emit("crafting:performed", {
          recipeId: result.recipeId,
          recipeName: result.recipeName,
          success: result.success,
          message: result.message
        });

        if (result.success) {
          this.emitInventorySnapshot();
          this.emitStationOffer(payload.stationKind);
        }
      })
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const unsubscribe of this.unsubscribeHandlers) {
        unsubscribe();
      }

      this.unsubscribeHandlers.length = 0;
    });
  }

  public update(_time: number, delta: number): void {
    if (!this.movement) {
      return;
    }

    const deltaSeconds = delta / 1000;

    this.worldSession.update(this.movement.readMovement(), deltaSeconds);
    this.updateWorldPresentation();
    this.updateAtmospherePresentation(deltaSeconds);
    this.updateInteractionPresentation(deltaSeconds);
    this.updateSurvivalCraftingPresentation();
    this.emitFrameState();
    this.emitPoiDiscoveries();
  }

  /**
   * Tier 0 survival crafting has no station to interact with — it toggles
   * with a dedicated key, always available, anywhere. Opening it just asks
   * WorldSession for the "survival" offer, exactly like any other station.
   */
  private updateSurvivalCraftingPresentation(): void {
    if (!this.survivalCraftKey?.justPressed()) {
      return;
    }

    if (this.openStationKind === CraftingStationKinds.Survival) {
      this.openStationKind = null;
      gameEvents.emit("crafting:station-closed");

      return;
    }

    this.openStationKind = CraftingStationKinds.Survival;
    this.emitStationOffer(CraftingStationKinds.Survival);
  }

  /** Syncs the focus indicator and runs the interaction on demand. */
  private updateInteractionPresentation(deltaSeconds: number): void {
    const focused = this.worldSession.getFocusedInteractable();

    this.interactionIndicator?.sync(focused, deltaSeconds);

    const focusedId = focused?.id ?? null;

    if (focusedId !== this.focusedInteractableId) {
      this.focusedInteractableId = focusedId;
      gameEvents.emit("interaction:focus-changed", {
        interactableId: focusedId,
        interactableName: focused?.name ?? null
      });
    }

    if (this.interactionKey?.justPressed()) {
      const report = this.worldSession.interact();

      if (report) {
        gameEvents.emit("interaction:performed", {
          interactableId: report.outcome.interactable.id,
          interactableKind: report.outcome.interactable.kind,
          verb: report.outcome.interactable.verb,
          success: report.outcome.result.success,
          message: report.outcome.result.message
        });
        this.emitInventoryGrants(report.grants);

        const stationKind = report.outcome.result.opensStationKind;

        if (stationKind) {
          this.openStationKind = stationKind;
          this.emitStationOffer(stationKind);
        }
      }
    }

    this.closeStationWhenOutOfRange();
  }

  /** Publishes the offer of a station for the crafting UI. */
  private emitStationOffer(stationKind: string): void {
    const station = this.worldSession.getActiveStation(stationKind);

    if (!station) {
      return;
    }

    gameEvents.emit("crafting:station-opened", {
      stationKind,
      stationName: station.name,
      recipes: this.worldSession.getCraftingOffer(stationKind)
    });
  }

  /** Walking away from an open station closes its UI honestly. */
  private closeStationWhenOutOfRange(): void {
    if (!this.openStationKind) {
      return;
    }

    if (!this.worldSession.getActiveStation(this.openStationKind)) {
      this.openStationKind = null;
      gameEvents.emit("crafting:station-closed");
    }
  }

  /** Announces item grants and the resulting inventory state. */
  private emitInventoryGrants(
    grants: readonly Readonly<{
      itemId: string;
      itemName: string;
      quantityAdded: number;
      quantityRejected: number;
      totalQuantity: number;
    }>[]
  ): void {
    if (grants.length === 0) {
      return;
    }

    for (const grant of grants) {
      gameEvents.emit("inventory:item-added", {
        itemId: grant.itemId,
        itemName: grant.itemName,
        quantityAdded: grant.quantityAdded,
        quantityRejected: grant.quantityRejected,
        totalQuantity: grant.totalQuantity
      });
    }

    this.emitInventorySnapshot();
  }

  /** Announces the outcome of an equipment change and refreshes both HUDs. */
  private applyEquipmentChange(result: Readonly<{ success: boolean; message: string }>): void {
    gameEvents.emit("equipment:performed", {
      success: result.success,
      message: result.message
    });

    if (result.success) {
      this.emitEquipmentSnapshot();
      this.emitInventorySnapshot();
    }
  }

  /** Publishes the current loadout for HUD consumers. */
  private emitEquipmentSnapshot(): void {
    gameEvents.emit("equipment:changed", {
      slots: this.worldSession.equipment.snapshot.slots
    });
  }

  /**
   * Publishes the current inventory snapshot for HUD consumers. The
   * `equipable` flag is presentation enrichment resolved here, at the
   * integration point: the inventory domain never learns about equipment.
   */
  private emitInventorySnapshot(): void {
    const snapshot = this.worldSession.inventory.snapshot;

    gameEvents.emit("inventory:changed", {
      usedSlots: snapshot.usedSlots,
      capacitySlots: snapshot.capacitySlots,
      totalWeight: snapshot.totalWeight,
      items: snapshot.items.map((item) => ({
        ...item,
        equipable: this.worldSession.equipment.isEquipable(item.itemId)
      }))
    });
  }

  /** Builds every ambience presenter from the domain atmosphere of the zone. */
  private createAtmosphere(): void {
    if (!this.tilemapRenderer) {
      return;
    }

    const { atmosphere, zone, tilemap } = this.worldSession;

    this.ambientSound = new AmbientSoundManager(new NullSoundPlayer());
    this.ambientSound.loadZoneChannels(zone.atmosphere.sounds);
    this.ambientSound.startAmbience();

    this.environmentEffects = new EnvironmentEffects(
      this,
      this.tilemapRenderer,
      tilemap,
      () => this.worldSession.atmosphere.wind
    );
    this.environmentEffects.build(atmosphere.effects);
    this.ambientParticles = new AmbientParticleSystem(this);
    this.lookoutCamera = new LookoutCamera(this);

    gameEvents.emit("atmosphere:weather-changed", {
      zoneId: zone.tilemap.id,
      weather: atmosphere.currentWeather
    });
  }

  /** Reads domain atmosphere state and reconciles every visual presenter. */
  private updateAtmospherePresentation(deltaSeconds: number): void {
    const { atmosphere } = this.worldSession;
    const effects = atmosphere.effects;
    const wind = atmosphere.wind;

    this.environmentEffects?.sync(effects);
    this.ambientParticles?.update(
      deltaSeconds,
      wind,
      isEffectTypeEnabled(effects, AmbientEffectTypes.WindLeaves),
      isEffectTypeEnabled(effects, AmbientEffectTypes.AmbientMotes)
    );
    this.syncLookout();
  }

  private syncLookout(): void {
    const lookout = this.worldSession.getActiveLookout();
    const transition = this.lookoutCamera?.sync(Boolean(lookout));

    if (transition === "entered" && lookout) {
      this.activeLookoutId = lookout.id;
      gameEvents.emit("world:lookout-entered", { poiId: lookout.id });
    }

    if (transition === "exited" && this.activeLookoutId) {
      gameEvents.emit("world:lookout-exited", { poiId: this.activeLookoutId });
      this.activeLookoutId = undefined;
    }
  }

  private createPlayerMarker(): Phaser.GameObjects.Container {
    const shadow = this.add.ellipse(
      0,
      16,
      GameConstants.tile.width * 0.42,
      GameConstants.tile.height * 0.28,
      Phaser.Display.Color.HexStringToColor(GameConstants.colors.playerShadow).color,
      0.45
    );
    const body = this.add.ellipse(
      0,
      -4,
      28,
      44,
      Phaser.Display.Color.HexStringToColor(GameConstants.colors.player).color,
      1
    );
    const marker = this.add.container(0, 0, [shadow, body]);

    body.setStrokeStyle(2, 0x111318, 0.85);
    marker.setDepth(GameConstants.depth.entities);
    this.playerBody = body;

    return marker;
  }

  private configureCamera(): void {
    const camera = this.cameras.main;
    const mapPixelSize =
      (this.worldSession.tilemap.definition.widthInTiles +
        this.worldSession.tilemap.definition.heightInTiles) *
      GameConstants.tile.width;

    camera.setBounds(0, 0, mapPixelSize, mapPixelSize);
    camera.setDeadzone(GameConstants.camera.deadzoneWidth, GameConstants.camera.deadzoneHeight);

    if (this.playerMarker) {
      camera.startFollow(
        this.playerMarker,
        true,
        GameConstants.camera.followLerp,
        GameConstants.camera.followLerp
      );
    }
  }

  private updateWorldPresentation(): void {
    const { x, y } = this.worldSession.player.position;
    const projectedPosition = this.tilemapRenderer?.projectWorldToScreen(x, y);

    if (!projectedPosition || !this.playerMarker) {
      return;
    }

    this.tilemapRenderer?.renderAround(x, y);
    this.playerMarker.setPosition(projectedPosition.x, projectedPosition.y);
    this.playerMarker.setDepth(GameConstants.depth.entities + projectedPosition.y);
    this.playerBody?.setScale(1, 1);
  }

  private emitPoiDiscoveries(): void {
    for (const poi of this.worldSession.consumePoiDiscoveries()) {
      gameEvents.emit("poi:discovered", {
        poiId: poi.id,
        poiType: poi.type,
        poiName: poi.name,
        tileX: poi.anchorTile.x,
        tileY: poi.anchorTile.y
      });
    }
  }

  private emitFrameState(): void {
    const { x, y } = this.worldSession.player.position;
    const playerTile = worldToTile({ x, y });
    const camera = this.cameras.main;

    gameEvents.emit("player:moved", {
      playerId: this.worldSession.player.id,
      worldX: x,
      worldY: y,
      tileX: playerTile.x,
      tileY: playerTile.y
    });

    gameEvents.emit("world:camera-updated", {
      scrollX: camera.scrollX,
      scrollY: camera.scrollY,
      centerX: camera.midPoint.x,
      centerY: camera.midPoint.y,
      isFollowingPlayer: Boolean(this.playerMarker)
    });
  }
}

function isEffectTypeEnabled(
  effects: readonly Readonly<{
    definition: Readonly<{ type: AmbientEffectType }>;
    enabled: boolean;
  }>[],
  type: AmbientEffectType
): boolean {
  return effects.some((effect) => effect.definition.type === type && effect.enabled);
}
