import { EquipmentRegistry } from "@world/equipment/EquipmentRegistry";
import { EquipmentKinds, EquipmentSlots } from "@world/equipment/EquipmentTypes";
import type { EquipmentDefinition } from "@world/equipment/EquipmentTypes";
import { ToolTypes } from "@world/requirements/RequirementTypes";

/**
 * The current equipment catalog. Pure content: making an item equipable means
 * adding a row here. The item catalog and the inventory never learn about it.
 * toolType/tier come from the requirement system's own vocabulary (ToolTypes)
 * so a tree's "requires Axe" and an axe's "is an Axe" can never drift apart
 * into mismatched string literals.
 */
const Equipables: readonly EquipmentDefinition[] = [
  {
    itemId: "rudimentary-axe",
    kind: EquipmentKinds.Tool,
    allowedSlots: [EquipmentSlots.Tool],
    toolType: ToolTypes.Axe,
    tier: 0
  },
  {
    itemId: "simple-axe",
    kind: EquipmentKinds.Tool,
    allowedSlots: [EquipmentSlots.Tool],
    toolType: ToolTypes.Axe,
    tier: 1
  },
  {
    itemId: "simple-pick",
    kind: EquipmentKinds.Tool,
    allowedSlots: [EquipmentSlots.Tool],
    toolType: ToolTypes.Pickaxe,
    tier: 1
  },
  {
    itemId: "simple-sword",
    kind: EquipmentKinds.Weapon,
    allowedSlots: [EquipmentSlots.MainHand],
    damage: 2
  },
  {
    itemId: "leather-vest",
    kind: EquipmentKinds.Armor,
    allowedSlots: [EquipmentSlots.Chest],
    healthBonus: 2
  }
];

/** Builds the registry with every equipable the game currently knows. */
export function createDefaultEquipmentRegistry(): EquipmentRegistry {
  const registry = new EquipmentRegistry();

  for (const equipable of Equipables) {
    registry.register(equipable);
  }

  return registry;
}
