import Phaser from "phaser";
import { AmbientParticleSystem } from "@game/atmosphere/AmbientParticleSystem";
import { EnvironmentEffects } from "@game/atmosphere/EnvironmentEffects";
import { LookoutCamera } from "@game/atmosphere/LookoutCamera";
import { WeatherPresenter } from "@game/atmosphere/WeatherPresenter";
import { PhaserSoundPlayer } from "@game/audio/PhaserSoundPlayer";
import { ActionKey } from "@game/input/ActionKey";
import { KeyboardMovement } from "@game/input/KeyboardMovement";
import { CreatureRenderer } from "@game/rendering/CreatureRenderer";
import { DangerZoneRenderer } from "@game/rendering/DangerZoneRenderer";
import { GroundClutterRenderer } from "@game/rendering/GroundClutterRenderer";
import { HorizonRenderer } from "@game/rendering/HorizonRenderer";
import { InteractionIndicator } from "@game/rendering/InteractionIndicator";
import { IsometricTilemapRenderer } from "@game/rendering/IsometricTilemapRenderer";
import { NpcRenderer } from "@game/rendering/NpcRenderer";
import { PlayerVitalityPresenter } from "@game/rendering/PlayerVitalityPresenter";
import { PoiRenderer } from "@game/rendering/PoiRenderer";
import { SceneKeys } from "@game/scene-keys";
import { AmbientSoundManager } from "@services/audio/AmbientSoundManager";
import type { SoundPlayer } from "@services/audio/SoundPlayer";
import { gameEvents } from "@services/events/GameEvents";
import { LocalStorageClockStore } from "@services/persistence/ClockStore";
import { LocalStorageSaveStore } from "@services/persistence/SaveStore";
import type { SaveStore } from "@services/persistence/SaveStore";
import { GameConstants } from "@shared/config/GameConstants";
import { AmbientEffectTypes, WeatherTypes } from "@world/atmosphere/AtmosphereTypes";
import type { AmbientEffectType, WeatherType } from "@world/atmosphere/AtmosphereTypes";
import type { TimeOfDayType } from "@world/clock/WorldClockTypes";
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
  private npcRenderer?: NpcRenderer;
  private dangerZoneRenderer?: DangerZoneRenderer;
  private creatureRenderer?: CreatureRenderer;
  private vitalityPresenter?: PlayerVitalityPresenter;
  private weatherPresenter?: WeatherPresenter;
  private soundPlayer?: SoundPlayer;
  private muteKey?: ActionKey;
  private soundMuted = false;
  private readonly saveStore: SaveStore = new LocalStorageSaveStore();
  private lastTimeOfDay?: TimeOfDayType;
  private lastWeather?: WeatherType;
  private readonly unsubscribeHandlers: Array<() => void> = [];

  public constructor() {
    super(SceneKeys.World);
  }

  public create(): void {
    const { definition } = this.worldSession.tilemap;

    this.loadSave();

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
    this.npcRenderer = new NpcRenderer(this, this.tilemapRenderer);
    this.dangerZoneRenderer = new DangerZoneRenderer(this, this.tilemapRenderer);
    this.creatureRenderer = new CreatureRenderer(this, this.tilemapRenderer);
    this.vitalityPresenter = new PlayerVitalityPresenter(this);
    this.weatherPresenter = new WeatherPresenter(this);
    // Built once, never referenced again: purely static background, no sync().
    new HorizonRenderer(this, this.tilemapRenderer);
    this.createAtmosphere();
    this.interactionKey = new ActionKey(this, Phaser.Input.Keyboard.KeyCodes.E);
    this.survivalCraftKey = new ActionKey(this, Phaser.Input.Keyboard.KeyCodes.C);
    this.muteKey = new ActionKey(this, Phaser.Input.Keyboard.KeyCodes.M);
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
    this.registerSavePersistence();
  }

  /**
   * Loads the unified save if one exists and restores every subsystem from
   * it. If none exists yet, falls back to a one-time migration from Sprint
   * 11's standalone clock save (ClockStore's own public API, untouched) so
   * upgrading to the unified save never erases elapsed world time. Inventory,
   * equipment, and position simply start fresh in that case — there was
   * never a unified save to restore them from.
   */
  private loadSave(): void {
    const save = this.saveStore.load();

    if (save) {
      this.worldSession.restore(save);

      return;
    }

    const legacyClockSnapshot = new LocalStorageClockStore().load();

    if (legacyClockSnapshot) {
      this.worldSession.clock.restore(legacyClockSnapshot);
    }
  }

  /**
   * Periodically saves the full unified snapshot so a closed tab doesn't lose
   * progress, plus a final save on shutdown. Same timer + shutdown pattern
   * Sprint 11 used for the clock alone; this replaces that continuous save
   * (the clock is now one field inside the unified snapshot) without ever
   * touching WorldClock or ClockStore's contract.
   */
  private registerSavePersistence(): void {
    this.time.addEvent({
      delay: GameConstants.save.saveIntervalMs,
      loop: true,
      callback: () => this.saveStore.save(this.worldSession.snapshot)
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.saveStore.save(this.worldSession.snapshot);
    });
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
    this.updateTimeOfDayPresentation();
    this.updateWeatherPresentation();
    this.updateAmbientSoundPresentation();
    this.updateSoundMutePresentation();
    this.npcRenderer?.sync(this.worldSession.getNpcPositions());
    this.dangerZoneRenderer?.sync(this.worldSession.getActiveDangerZones());
    this.creatureRenderer?.sync(this.worldSession.getCreaturePresence());
    this.vitalityPresenter?.sync(this.getPlayerHealthRatio());
    this.emitFrameState();
    this.emitPoiDiscoveries();
    this.emitDangerEvents();
  }

  /** Reads the player's current health ratio, accounting for worn armor. */
  private getPlayerHealthRatio(): number {
    const armorHealthBonus = this.worldSession.equipment.getEquippedArmorInfo()?.healthBonus ?? 0;

    return this.worldSession.combat.getPlayerHealthRatio(armorHealthBonus);
  }

  /**
   * Announces time-of-day changes on the bus. Never gated on player
   * proximity or focus — the clock advances (and NPCs update) regardless of
   * where the player is looking, which is this sprint's central point.
   */
  private updateTimeOfDayPresentation(): void {
    const timeOfDay = this.worldSession.clock.timeOfDay;

    if (timeOfDay === this.lastTimeOfDay) {
      return;
    }

    this.lastTimeOfDay = timeOfDay;
    gameEvents.emit("world:time-of-day-changed", { timeOfDay });
  }

  /**
   * Announces weather changes on the bus — the same change-detection idiom
   * already used for time of day, now finally driven by a weather that
   * actually changes (Sprint 4 wired the event, nothing ever re-emitted it
   * after scene creation). The Developer Overlay already listens for this
   * event; it starts reflecting live weather with no changes of its own.
   */
  private updateWeatherPresentation(): void {
    const weather = this.worldSession.atmosphere.currentWeather;

    if (weather === this.lastWeather) {
      return;
    }

    this.lastWeather = weather;
    gameEvents.emit("atmosphere:weather-changed", {
      zoneId: this.worldSession.zone.tilemap.id,
      weather
    });
  }

  /**
   * Applies the domain's resolved per-channel volumes to playback every
   * frame — a pure read (getAmbientChannelVolumes) turned into the one
   * side effect it's allowed to have (AmbientSoundManager already
   * no-ops a channel that never got an assetKey, so Leaves/Insects/Music
   * are harmless to include here even while silent).
   */
  private updateAmbientSoundPresentation(): void {
    for (const channel of this.worldSession.getAmbientChannelVolumes()) {
      this.ambientSound?.setChannelVolume(channel.id, channel.volume);
    }
  }

  /**
   * Global mute toggle: sound with no control is worse than no sound at
   * all. Independent of the developer overlay — `M` always works; the
   * overlay only displays the current state when it happens to be open.
   */
  private updateSoundMutePresentation(): void {
    if (!this.muteKey?.justPressed()) {
      return;
    }

    this.soundMuted = !this.soundMuted;
    this.soundPlayer?.setMasterVolume(this.soundMuted ? 0 : 1);
    gameEvents.emit("audio:mute-changed", { muted: this.soundMuted });
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

        if (report.outcome.result.playerDefeated) {
          this.emitInventorySnapshot();
        }

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

    this.soundPlayer = new PhaserSoundPlayer(this);
    this.ambientSound = new AmbientSoundManager(this.soundPlayer);
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
  }

  /** Reads domain atmosphere state and reconciles every visual presenter. */
  private updateAtmospherePresentation(deltaSeconds: number): void {
    const { atmosphere } = this.worldSession;
    const effects = atmosphere.effects;
    const wind = atmosphere.wind;
    const isStorm = atmosphere.currentWeather === WeatherTypes.Storm;

    this.environmentEffects?.sync(effects);
    this.ambientParticles?.update(
      deltaSeconds,
      wind,
      isEffectTypeEnabled(effects, AmbientEffectTypes.WindLeaves),
      isEffectTypeEnabled(effects, AmbientEffectTypes.AmbientMotes),
      isStorm
    );
    this.weatherPresenter?.sync(isStorm);
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
    camera.setZoom(GameConstants.camera.defaultZoom);

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

  private emitDangerEvents(): void {
    const reports = this.worldSession.consumeDangerEvents();

    for (const report of reports) {
      gameEvents.emit("danger:triggered", {
        zoneId: report.zoneId,
        zoneName: report.zoneName,
        message: report.message
      });
    }

    if (reports.some((report) => report.lostItems.length > 0)) {
      this.emitInventorySnapshot();
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
