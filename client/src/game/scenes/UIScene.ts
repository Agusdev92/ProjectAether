import Phaser from "phaser";
import { ActionKey } from "@game/input/ActionKey";
import { SceneKeys } from "@game/scene-keys";
import { gameEvents } from "@services/events/GameEvents";
import { GameConstants } from "@shared/config/GameConstants";
import type { GameEventMap } from "@shared/events/GameEventMap";

type InventoryViewState = GameEventMap["inventory:changed"];
type CraftingViewState = GameEventMap["crafting:station-opened"];
type EquipmentViewState = GameEventMap["equipment:changed"];

/** Presentation labels for equipment slots; the domain only knows slot ids. */
const EquipmentSlotLabels: Readonly<Record<string, string>> = {
  "main-hand": "Mano principal",
  "off-hand": "Mano secundaria",
  tool: "Herramienta",
  head: "Cabeza",
  chest: "Torso",
  legs: "Piernas",
  feet: "Pies",
  "accessory-1": "Accesorio 1",
  "accessory-2": "Accesorio 2"
};

type DeveloperOverlayState = {
  enabled: boolean;
  fps: number;
  mapName: string;
  poiTotal: number;
  poiDiscovered: number;
  lastPoiName: string;
  weather: string;
  timeOfDay: string;
  playerWorldX: number;
  playerWorldY: number;
  playerTileX: number;
  playerTileY: number;
  cameraScrollX: number;
  cameraScrollY: number;
  cameraCenterX: number;
  cameraCenterY: number;
  cameraFollowing: boolean;
};

/**
 * UIScene is layered above WorldScene for HUD, chat, menus, and modal flows.
 * Keeping it separate prevents world simulation from depending on presentation
 * state and lets future UI be paused, replaced, or composed independently.
 */
export class UIScene extends Phaser.Scene {
  private readonly overlayState: DeveloperOverlayState = {
    enabled: false,
    fps: 0,
    mapName: "Unknown",
    poiTotal: 0,
    poiDiscovered: 0,
    lastPoiName: "-",
    weather: "-",
    timeOfDay: "-",
    playerWorldX: 0,
    playerWorldY: 0,
    playerTileX: 0,
    playerTileY: 0,
    cameraScrollX: 0,
    cameraScrollY: 0,
    cameraCenterX: 0,
    cameraCenterY: 0,
    cameraFollowing: false
  };

  private overlayPanel?: Phaser.GameObjects.Rectangle;
  private overlayText?: Phaser.GameObjects.Text;
  private overlayToggleKey?: Phaser.Input.Keyboard.Key;
  private readonly unsubscribeHandlers: Array<() => void> = [];
  private readonly activeNotifications: Phaser.GameObjects.Text[] = [];
  private inventoryKey?: ActionKey;
  private inventoryPanel?: Phaser.GameObjects.Container;
  private inventoryContent?: Phaser.GameObjects.Container;
  private inventoryFooter?: Phaser.GameObjects.Text;
  private inventoryOpen = false;
  private inventoryState: InventoryViewState = {
    usedSlots: 0,
    capacitySlots: 0,
    totalWeight: 0,
    items: []
  };
  private craftingPanel?: Phaser.GameObjects.Container;
  private craftingContent?: Phaser.GameObjects.Container;
  private craftingTitle?: Phaser.GameObjects.Text;
  private craftingState?: CraftingViewState;
  private closeKey?: ActionKey;
  private equipmentKey?: ActionKey;
  private equipmentPanel?: Phaser.GameObjects.Container;
  private equipmentContent?: Phaser.GameObjects.Container;
  private equipmentOpen = false;
  private equipmentState: EquipmentViewState = { slots: [] };

  public constructor() {
    super(SceneKeys.UI);
  }

  public create(): void {
    this.renderHudShell();
    this.registerDeveloperOverlay();
    this.createInventoryPanel();
    this.createCraftingPanel();
    this.createEquipmentPanel();
    this.registerWorldEventHandlers();
    this.inventoryKey = new ActionKey(this, Phaser.Input.Keyboard.KeyCodes.I);
    this.equipmentKey = new ActionKey(this, Phaser.Input.Keyboard.KeyCodes.P);
    this.closeKey = new ActionKey(this, Phaser.Input.Keyboard.KeyCodes.ESC);
    gameEvents.emit("ui:hud-ready");
  }

  public update(): void {
    if (this.inventoryKey?.justPressed()) {
      this.setInventoryOpen(!this.inventoryOpen);
    }

    if (this.equipmentKey?.justPressed()) {
      this.setEquipmentOpen(!this.equipmentOpen);
    }

    if (this.closeKey?.justPressed() && this.craftingState) {
      this.closeCraftingPanel();
    }

    if (this.overlayToggleKey && Phaser.Input.Keyboard.JustDown(this.overlayToggleKey)) {
      this.setDeveloperOverlayEnabled(!this.overlayState.enabled);
    }

    if (!this.overlayState.enabled || !this.overlayText) {
      return;
    }

    this.overlayState.fps = this.game.loop.actualFps;
    this.overlayText.setText(this.createOverlayText());
  }

  private renderHudShell(): void {
    const padding = 20;
    const barHeight = 56;
    const width = this.scale.width - padding * 2;
    const y = this.scale.height - barHeight - padding;

    this.add
      .rectangle(
        padding,
        y,
        width,
        barHeight,
        Phaser.Display.Color.HexStringToColor(GameConstants.colors.surface).color,
        0.88
      )
      .setOrigin(0, 0)
      .setDepth(GameConstants.depth.ui)
      .setStrokeStyle(
        1,
        Phaser.Display.Color.HexStringToColor(GameConstants.colors.surfaceBorder).color,
        1
      );

    this.add
      .text(padding + 18, y + 17, "HUD inicial", {
        color: GameConstants.colors.textPrimary,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "18px"
      })
      .setDepth(GameConstants.depth.ui);

    this.add
      .text(this.scale.width - padding - 18, y + 17, "Sin combate / inventario / multijugador", {
        color: GameConstants.colors.textMuted,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "16px"
      })
      .setDepth(GameConstants.depth.ui)
      .setOrigin(1, 0);
  }

  private registerDeveloperOverlay(): void {
    const keyboard = this.getKeyboardPlugin();

    this.overlayToggleKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F1);
    keyboard.addCapture([Phaser.Input.Keyboard.KeyCodes.F1]);

    this.overlayPanel = this.add
      .rectangle(
        16,
        16,
        380,
        206,
        Phaser.Display.Color.HexStringToColor(GameConstants.colors.debugBackground).color,
        0.9
      )
      .setOrigin(0, 0)
      .setDepth(GameConstants.depth.debug)
      .setStrokeStyle(
        1,
        Phaser.Display.Color.HexStringToColor(GameConstants.colors.surfaceBorder).color,
        1
      )
      .setVisible(false);

    this.overlayText = this.add
      .text(32, 30, "", {
        color: GameConstants.colors.textPrimary,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "14px",
        lineSpacing: 4
      })
      .setDepth(GameConstants.depth.debug + 1)
      .setVisible(false);
  }

  private registerWorldEventHandlers(): void {
    this.unsubscribeHandlers.push(
      gameEvents.on("world:map-loaded", (payload) => {
        this.overlayState.mapName = payload.mapName;
      }),
      gameEvents.on("world:pois-loaded", (payload) => {
        this.overlayState.poiTotal = payload.poiCount;
        this.overlayState.poiDiscovered = 0;
        this.overlayState.lastPoiName = "-";
      }),
      gameEvents.on("poi:discovered", (payload) => {
        this.overlayState.poiDiscovered += 1;
        this.overlayState.lastPoiName = payload.poiName;
      }),
      gameEvents.on("atmosphere:weather-changed", (payload) => {
        this.overlayState.weather = payload.weather;
      }),
      gameEvents.on("world:time-of-day-changed", (payload) => {
        this.overlayState.timeOfDay = payload.timeOfDay;
      }),
      gameEvents.on("danger:triggered", (payload) => {
        this.showNotification(payload.message);
      }),
      gameEvents.on("interaction:performed", (payload) => {
        // Station-opening interactions carry no message: the UI is the feedback.
        if (payload.message) {
          this.showNotification(payload.message);
        }
      }),
      gameEvents.on("crafting:station-opened", (payload) => {
        this.craftingState = payload;
        this.craftingPanel?.setVisible(true);
        this.renderCraftingContents();
      }),
      gameEvents.on("crafting:station-closed", () => {
        this.closeCraftingPanel();
      }),
      gameEvents.on("crafting:performed", (payload) => {
        if (payload.message) {
          this.showNotification(payload.message);
        }
      }),
      gameEvents.on("inventory:changed", (payload) => {
        this.inventoryState = payload;

        if (this.inventoryOpen) {
          this.renderInventoryContents();
        }
      }),
      gameEvents.on("inventory:item-added", (payload) => {
        if (payload.quantityRejected > 0) {
          this.showNotification("Inventario lleno");
        }
      }),
      gameEvents.on("equipment:changed", (payload) => {
        this.equipmentState = payload;

        if (this.equipmentOpen) {
          this.renderEquipmentContents();
        }
      }),
      gameEvents.on("equipment:performed", (payload) => {
        if (payload.message) {
          this.showNotification(payload.message);
        }
      }),
      gameEvents.on("player:moved", (payload) => {
        this.overlayState.playerWorldX = payload.worldX;
        this.overlayState.playerWorldY = payload.worldY;
        this.overlayState.playerTileX = payload.tileX;
        this.overlayState.playerTileY = payload.tileY;
      }),
      gameEvents.on("world:camera-updated", (payload) => {
        this.overlayState.cameraScrollX = payload.scrollX;
        this.overlayState.cameraScrollY = payload.scrollY;
        this.overlayState.cameraCenterX = payload.centerX;
        this.overlayState.cameraCenterY = payload.centerY;
        this.overlayState.cameraFollowing = payload.isFollowingPlayer;
      })
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const unsubscribe of this.unsubscribeHandlers) {
        unsubscribe();
      }

      this.unsubscribeHandlers.length = 0;
    });
  }

  /**
   * Minimal inventory panel: open/close with I, list of items with quantity,
   * slots and weight in the footer. Deliberately not a final interface — it
   * validates the data flow, nothing else.
   */
  private createInventoryPanel(): void {
    const width = GameConstants.inventory.panelWidth;
    const height = 430;
    const x = this.scale.width - width - 24;
    const y = 24;
    const background = this.add
      .rectangle(
        0,
        0,
        width,
        height,
        Phaser.Display.Color.HexStringToColor(GameConstants.colors.surface).color,
        0.95
      )
      .setOrigin(0, 0)
      .setStrokeStyle(
        1,
        Phaser.Display.Color.HexStringToColor(GameConstants.colors.surfaceBorder).color,
        1
      );
    const title = this.add.text(16, 12, "Inventario", {
      color: GameConstants.colors.textPrimary,
      fontFamily: GameConstants.fonts.ui,
      fontSize: "18px",
      fontStyle: "bold"
    });
    const hint = this.add
      .text(width - 16, 16, "[I] cerrar", {
        color: GameConstants.colors.textMuted,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "12px"
      })
      .setOrigin(1, 0);

    this.inventoryContent = this.add.container(0, 0);
    this.inventoryFooter = this.add.text(16, height - 30, "", {
      color: GameConstants.colors.textMuted,
      fontFamily: GameConstants.fonts.ui,
      fontSize: "13px"
    });
    this.inventoryPanel = this.add.container(x, y, [
      background,
      title,
      hint,
      this.inventoryContent,
      this.inventoryFooter
    ]);
    this.inventoryPanel.setDepth(GameConstants.depth.modal);
    this.inventoryPanel.setVisible(false);
  }

  private setInventoryOpen(open: boolean): void {
    this.inventoryOpen = open;
    this.inventoryPanel?.setVisible(open);

    if (open) {
      this.renderInventoryContents();
    }

    gameEvents.emit("inventory:toggled", { open });
  }

  private renderInventoryContents(): void {
    if (!this.inventoryContent || !this.inventoryFooter) {
      return;
    }

    this.inventoryContent.removeAll(true);

    const rowHeight = GameConstants.inventory.panelRowHeight;
    const startY = 48;

    if (this.inventoryState.items.length === 0) {
      this.inventoryContent.add(
        this.add.text(16, startY, "Vacío", {
          color: GameConstants.colors.textMuted,
          fontFamily: GameConstants.fonts.ui,
          fontSize: "14px"
        })
      );
    }

    this.inventoryState.items.forEach((item, rowIndex) => {
      const rowY = startY + rowIndex * rowHeight;
      const swatch = this.add
        .rectangle(16, rowY, 20, 20, Phaser.Display.Color.HexStringToColor(item.iconColor).color, 1)
        .setOrigin(0, 0)
        .setStrokeStyle(
          1,
          Phaser.Display.Color.HexStringToColor(GameConstants.colors.surfaceBorder).color,
          1
        );
      const glyph = this.add
        .text(26, rowY + 10, item.icon, {
          color: GameConstants.colors.textPrimary,
          fontFamily: GameConstants.fonts.ui,
          fontSize: "12px"
        })
        .setOrigin(0.5, 0.5);
      const label = this.add.text(46, rowY + 2, `${item.itemName} x${item.quantity}`, {
        color: GameConstants.colors.textPrimary,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "14px"
      });

      this.inventoryContent?.add([swatch, glyph, label]);

      if (item.equipable) {
        const equipButton = this.add
          .text(GameConstants.inventory.panelWidth - 16, rowY + 2, "Equipar", {
            color: GameConstants.colors.accent,
            fontFamily: GameConstants.fonts.ui,
            fontSize: "13px",
            fontStyle: "bold"
          })
          .setOrigin(1, 0)
          .setInteractive({ useHandCursor: true });

        equipButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
          gameEvents.emit("equipment:equip-requested", { itemId: item.itemId });
        });
        this.inventoryContent?.add(equipButton);
      }
    });

    this.inventoryFooter.setText(
      `Slots: ${this.inventoryState.usedSlots}/${this.inventoryState.capacitySlots}   Peso: ${this.inventoryState.totalWeight}`
    );
  }

  /**
   * Minimal equipment panel (P): every slot with its item or a placeholder,
   * and an unequip button on occupied slots. Deliberately not a final
   * interface — it validates the equipment data flow, nothing else.
   */
  private createEquipmentPanel(): void {
    const width = GameConstants.equipment.panelWidth;
    const height = GameConstants.equipment.panelHeight;
    const x = this.scale.width - GameConstants.inventory.panelWidth - 24 - width - 16;
    const background = this.add
      .rectangle(
        0,
        0,
        width,
        height,
        Phaser.Display.Color.HexStringToColor(GameConstants.colors.surface).color,
        0.95
      )
      .setOrigin(0, 0)
      .setStrokeStyle(
        1,
        Phaser.Display.Color.HexStringToColor(GameConstants.colors.surfaceBorder).color,
        1
      );
    const title = this.add.text(16, 12, "Equipamiento", {
      color: GameConstants.colors.textPrimary,
      fontFamily: GameConstants.fonts.ui,
      fontSize: "18px",
      fontStyle: "bold"
    });
    const hint = this.add
      .text(width - 16, 16, "[P] cerrar", {
        color: GameConstants.colors.textMuted,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "12px"
      })
      .setOrigin(1, 0);

    this.equipmentContent = this.add.container(0, 0);
    this.equipmentPanel = this.add.container(x, 24, [
      background,
      title,
      hint,
      this.equipmentContent
    ]);
    this.equipmentPanel.setDepth(GameConstants.depth.modal);
    this.equipmentPanel.setVisible(false);
  }

  private setEquipmentOpen(open: boolean): void {
    this.equipmentOpen = open;
    this.equipmentPanel?.setVisible(open);

    if (open) {
      this.renderEquipmentContents();
    }
  }

  private renderEquipmentContents(): void {
    if (!this.equipmentContent) {
      return;
    }

    this.equipmentContent.removeAll(true);

    const rowHeight = GameConstants.equipment.panelRowHeight;
    const startY = 48;
    const width = GameConstants.equipment.panelWidth;

    this.equipmentState.slots.forEach((slotView, rowIndex) => {
      const rowY = startY + rowIndex * rowHeight;
      const label = this.add.text(16, rowY, EquipmentSlotLabels[slotView.slot] ?? slotView.slot, {
        color: GameConstants.colors.textMuted,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "13px"
      });
      const itemName = this.add.text(140, rowY, slotView.itemName ?? "—", {
        color: slotView.itemName
          ? GameConstants.colors.textPrimary
          : GameConstants.colors.surfaceBorder,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "13px"
      });

      this.equipmentContent?.add([label, itemName]);

      if (slotView.itemId) {
        const unequipButton = this.add
          .text(width - 16, rowY, "Quitar", {
            color: GameConstants.colors.accent,
            fontFamily: GameConstants.fonts.ui,
            fontSize: "13px",
            fontStyle: "bold"
          })
          .setOrigin(1, 0)
          .setInteractive({ useHandCursor: true });

        unequipButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
          gameEvents.emit("equipment:unequip-requested", { slot: slotView.slot });
        });
        this.equipmentContent?.add(unequipButton);
      }
    });
  }

  /**
   * Minimal crafting panel: recipes of the open station, ingredient status,
   * and a craft button per recipe. Deliberately not a final interface — it
   * validates the crafting data flow, nothing else. The UI never touches the
   * domain: it renders `crafting:station-opened` payloads and emits
   * `crafting:craft-requested` back through the bus.
   */
  private createCraftingPanel(): void {
    const width = GameConstants.crafting.panelWidth;
    const height = GameConstants.crafting.panelHeight;
    const background = this.add
      .rectangle(
        0,
        0,
        width,
        height,
        Phaser.Display.Color.HexStringToColor(GameConstants.colors.surface).color,
        0.95
      )
      .setOrigin(0, 0)
      .setStrokeStyle(
        1,
        Phaser.Display.Color.HexStringToColor(GameConstants.colors.surfaceBorder).color,
        1
      );

    this.craftingTitle = this.add.text(16, 12, "", {
      color: GameConstants.colors.textPrimary,
      fontFamily: GameConstants.fonts.ui,
      fontSize: "18px",
      fontStyle: "bold"
    });

    const hint = this.add
      .text(width - 16, 16, "[Esc] cerrar", {
        color: GameConstants.colors.textMuted,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "12px"
      })
      .setOrigin(1, 0);

    this.craftingContent = this.add.container(0, 0);
    this.craftingPanel = this.add.container(24, 24, [
      background,
      this.craftingTitle,
      hint,
      this.craftingContent
    ]);
    this.craftingPanel.setDepth(GameConstants.depth.modal);
    this.craftingPanel.setVisible(false);
  }

  private closeCraftingPanel(): void {
    this.craftingState = undefined;
    this.craftingPanel?.setVisible(false);
  }

  private renderCraftingContents(): void {
    if (!this.craftingContent || !this.craftingTitle || !this.craftingState) {
      return;
    }

    this.craftingTitle.setText(this.craftingState.stationName);
    this.craftingContent.removeAll(true);

    const rowHeight = GameConstants.crafting.panelRowHeight;
    const startY = 52;

    this.craftingState.recipes.forEach((recipe, rowIndex) => {
      const rowY = startY + rowIndex * rowHeight;
      const name = this.add.text(16, rowY, recipe.recipeName, {
        color: GameConstants.colors.textPrimary,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "15px",
        fontStyle: "bold"
      });
      const ingredientSummary = recipe.ingredients
        .map(
          (ingredient) => `${ingredient.itemName} ${ingredient.available}/${ingredient.required}`
        )
        .join("  ·  ");
      const ingredients = this.add.text(16, rowY + 20, ingredientSummary, {
        color: recipe.canCraft ? GameConstants.colors.textMuted : GameConstants.colors.danger,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "13px"
      });
      const button = this.createCraftButton(rowY, recipe.recipeId, recipe.canCraft);

      this.craftingContent?.add([name, ingredients, ...button]);
    });
  }

  /** The craft button of one recipe row; inert (dimmed) when uncraftable. */
  private createCraftButton(
    rowY: number,
    recipeId: string,
    canCraft: boolean
  ): Phaser.GameObjects.GameObject[] {
    const width = GameConstants.crafting.panelWidth;
    const buttonBackground = this.add
      .rectangle(
        width - 16,
        rowY + 14,
        92,
        30,
        Phaser.Display.Color.HexStringToColor(
          canCraft ? GameConstants.colors.accent : GameConstants.colors.surfaceBorder
        ).color,
        1
      )
      .setOrigin(1, 0.5);
    const buttonLabel = this.add
      .text(width - 62, rowY + 14, "Fabricar", {
        color: canCraft ? GameConstants.colors.accentText : GameConstants.colors.textMuted,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "14px",
        fontStyle: "bold"
      })
      .setOrigin(0.5, 0.5);

    if (canCraft) {
      buttonBackground.setInteractive({ useHandCursor: true });
      buttonBackground.on(Phaser.Input.Events.POINTER_DOWN, () => {
        if (this.craftingState) {
          gameEvents.emit("crafting:craft-requested", {
            recipeId,
            stationKind: this.craftingState.stationKind
          });
        }
      });
    }

    return [buttonBackground, buttonLabel];
  }

  /**
   * Brief, quiet, self-dismissing notification. No windows, no menus: a short
   * line that fades out on its own. The stack is capped so interaction spam
   * can never fill the screen.
   */
  private showNotification(message: string): void {
    if (this.activeNotifications.length >= GameConstants.interaction.maxVisibleNotifications) {
      const oldest = this.activeNotifications.shift();

      oldest?.destroy();
      this.layoutNotifications();
    }

    const notification = this.add
      .text(this.scale.width / 2, 0, message, {
        backgroundColor: GameConstants.colors.surface,
        color: GameConstants.colors.textPrimary,
        fontFamily: GameConstants.fonts.ui,
        fontSize: "15px",
        padding: { x: 14, y: 6 }
      })
      .setOrigin(0.5, 0)
      .setDepth(GameConstants.depth.ui + 10)
      .setAlpha(0);

    this.activeNotifications.push(notification);
    this.layoutNotifications();
    this.tweens.add({
      targets: notification,
      alpha: 1,
      duration: 180,
      ease: "Sine.easeOut"
    });
    this.time.delayedCall(GameConstants.interaction.notificationDurationMs, () => {
      this.tweens.add({
        targets: notification,
        alpha: 0,
        duration: 320,
        ease: "Sine.easeIn",
        onComplete: () => {
          const index = this.activeNotifications.indexOf(notification);

          if (index >= 0) {
            this.activeNotifications.splice(index, 1);
          }

          notification.destroy();
          this.layoutNotifications();
        }
      });
    });
  }

  private layoutNotifications(): void {
    const baseY = 24;
    const spacing = 34;

    this.activeNotifications.forEach((notification, index) => {
      notification.setY(baseY + index * spacing);
    });
  }

  private setDeveloperOverlayEnabled(enabled: boolean): void {
    this.overlayState.enabled = enabled;
    this.overlayPanel?.setVisible(enabled);
    this.overlayText?.setVisible(enabled);
    gameEvents.emit("debug:overlay-toggled", { enabled });
  }

  private createOverlayText(): string {
    return [
      "Developer Overlay",
      `FPS: ${this.overlayState.fps.toFixed(0)}`,
      `Mapa: ${this.overlayState.mapName}`,
      `World: ${this.overlayState.playerWorldX.toFixed(1)}, ${this.overlayState.playerWorldY.toFixed(1)}`,
      `Tile: ${this.overlayState.playerTileX}, ${this.overlayState.playerTileY}`,
      `POI: ${this.overlayState.poiDiscovered}/${this.overlayState.poiTotal} (${this.overlayState.lastPoiName})`,
      `Clima: ${this.overlayState.weather}`,
      `Hora del dia: ${this.overlayState.timeOfDay}`,
      `Cam scroll: ${this.overlayState.cameraScrollX.toFixed(1)}, ${this.overlayState.cameraScrollY.toFixed(1)}`,
      `Cam center: ${this.overlayState.cameraCenterX.toFixed(1)}, ${this.overlayState.cameraCenterY.toFixed(1)}`,
      `Following: ${this.overlayState.cameraFollowing ? "yes" : "no"}`
    ].join("\n");
  }

  private getKeyboardPlugin(): Phaser.Input.Keyboard.KeyboardPlugin {
    if (!this.input.keyboard) {
      throw new Error("Keyboard input is required for the developer overlay.");
    }

    return this.input.keyboard;
  }
}
