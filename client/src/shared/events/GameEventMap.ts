/**
 * GameEventMap defines every cross-system event payload. Keeping the contract
 * central and explicit prevents UI, world, networking, and service layers from
 * drifting into stringly typed communication.
 */
export type GameEventMap = {
  "game:booted": {
    readonly timestamp: number;
  };
  "assets:preload-started": {
    readonly manifestVersion: string;
  };
  "assets:preload-completed": {
    readonly loadedAssetCount: number;
  };
  "scene:main-menu-entered": undefined;
  "world:entered": {
    readonly zoneId: string;
  };
  "world:map-loaded": {
    readonly mapId: string;
    readonly mapName: string;
    readonly widthInTiles: number;
    readonly heightInTiles: number;
  };
  "world:pois-loaded": {
    readonly zoneId: string;
    readonly poiCount: number;
  };
  "poi:discovered": {
    readonly poiId: string;
    readonly poiType: string;
    readonly poiName: string;
    readonly tileX: number;
    readonly tileY: number;
  };
  "world:camera-updated": {
    readonly scrollX: number;
    readonly scrollY: number;
    readonly centerX: number;
    readonly centerY: number;
    readonly isFollowingPlayer: boolean;
  };
  "player:moved": {
    readonly playerId: string;
    readonly worldX: number;
    readonly worldY: number;
    readonly tileX: number;
    readonly tileY: number;
  };
  "inventory:changed": {
    readonly usedSlots: number;
    readonly capacitySlots: number;
    readonly totalWeight: number;
    readonly items: ReadonlyArray<{
      readonly slotIndex: number;
      readonly itemId: string;
      readonly itemName: string;
      readonly quantity: number;
      readonly icon: string;
      readonly iconColor: string;
      readonly rarity: string;
      readonly equipable: boolean;
    }>;
  };
  "equipment:changed": {
    readonly slots: ReadonlyArray<{
      readonly slot: string;
      readonly itemId: string | null;
      readonly itemName: string | null;
      readonly icon: string | null;
      readonly iconColor: string | null;
    }>;
  };
  "equipment:equip-requested": {
    readonly itemId: string;
  };
  "equipment:unequip-requested": {
    readonly slot: string;
  };
  "equipment:performed": {
    readonly success: boolean;
    readonly message: string;
  };
  "inventory:item-added": {
    readonly itemId: string;
    readonly itemName: string;
    readonly quantityAdded: number;
    readonly quantityRejected: number;
    readonly totalQuantity: number;
  };
  "inventory:toggled": {
    readonly open: boolean;
  };
  "crafting:station-opened": {
    readonly stationKind: string;
    readonly stationName: string;
    readonly recipes: ReadonlyArray<{
      readonly recipeId: string;
      readonly recipeName: string;
      readonly description: string;
      readonly canCraft: boolean;
      readonly ingredients: ReadonlyArray<{
        readonly itemId: string;
        readonly itemName: string;
        readonly required: number;
        readonly available: number;
      }>;
      readonly outputs: ReadonlyArray<{
        readonly itemId: string;
        readonly itemName: string;
        readonly quantity: number;
      }>;
    }>;
  };
  "crafting:station-closed": undefined;
  "crafting:craft-requested": {
    readonly recipeId: string;
    readonly stationKind: string;
  };
  "crafting:performed": {
    readonly recipeId: string;
    readonly recipeName: string;
    readonly success: boolean;
    readonly message: string;
  };
  "interaction:focus-changed": {
    readonly interactableId: string | null;
    readonly interactableName: string | null;
  };
  "interaction:performed": {
    readonly interactableId: string;
    readonly interactableKind: string;
    readonly verb: string;
    readonly success: boolean;
    readonly message: string;
  };
  "atmosphere:weather-changed": {
    readonly zoneId: string;
    readonly weather: string;
  };
  "atmosphere:effect-toggled": {
    readonly effectId: string;
    readonly enabled: boolean;
  };
  "world:lookout-entered": {
    readonly poiId: string;
  };
  "world:lookout-exited": {
    readonly poiId: string;
  };
  "world:time-of-day-changed": {
    readonly timeOfDay: string;
  };
  "danger:triggered": {
    readonly zoneId: string;
    readonly zoneName: string;
    readonly message: string;
  };
  "audio:mute-changed": {
    readonly muted: boolean;
  };
  "ui:hud-ready": undefined;
  "debug:overlay-toggled": {
    readonly enabled: boolean;
  };
};

export type GameEventName = keyof GameEventMap;

export type GameEventHandler<EventName extends GameEventName> = (
  payload: GameEventMap[EventName]
) => void;
