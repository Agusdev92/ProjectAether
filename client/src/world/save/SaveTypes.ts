import type { WorldClockSnapshot } from "@world/clock/WorldClockTypes";
import type { EquipmentSlot } from "@world/equipment/EquipmentTypes";
import type { ExhaustionSnapshot } from "@world/interaction/InteractionTypes";
import type { InventorySlot } from "@world/inventory/InventoryTypes";

/**
 * The full player-progress save. Deliberately a plain aggregate of the shapes
 * each subsystem already exposes (WorldClockSnapshot, raw inventory slots,
 * raw equipment loadout) — WorldSession is the only place that assembles or
 * applies it, exactly like it is the only place that builds a
 * RequirementContext from equipment facts. No version field lives here: like
 * WorldClockSnapshot before it, versioning is the storage key's job
 * (see services/persistence/SaveStore.ts), not the domain's.
 */
export type WorldSaveSnapshot = Readonly<{
  /**
   * Recorded for forward-compatibility only. Restoring it is a no-op today:
   * WorldSession always constructs FirstCoastZone regardless of this value,
   * because no zone-switching flow exists yet.
   */
  zoneId: string;
  player: Readonly<{ x: number; y: number }>;
  inventory: readonly InventorySlot[];
  equipment: Readonly<Record<EquipmentSlot, string | null>>;
  worldClock: WorldClockSnapshot;
  interactableExhaustion: ExhaustionSnapshot;
}>;
