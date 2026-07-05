import type { EquipmentQuery } from "@world/equipment/EquipmentTypes";
import type { TileCoordinate, WorldCoordinate } from "@world/coordinates/WorldCoordinates";
import type { WorldRequirement } from "@world/requirements/RequirementTypes";

/**
 * InteractionVerbs are the actions the interaction system knows how to run.
 * This is the only part of the system that grows with CODE: object types grow
 * as data. The whole genre needs roughly a dozen verbs (open, read, toggle,
 * talk...), each implemented once as an InteractionHandler.
 */
export const InteractionVerbs = {
  Gather: "gather",
  Search: "search",
  UseStation: "use-station"
} as const;

export type InteractionVerb = (typeof InteractionVerbs)[keyof typeof InteractionVerbs];

/**
 * Well-known interactable kinds. Kinds are open data (plain strings) so
 * hundreds of object types can exist without new code; this const only names
 * the ones the current content uses.
 */
export const InteractableKinds = {
  Tree: "tree",
  Rock: "rock",
  Camp: "camp",
  Forge: "forge",
  /** Loose, hand-gatherable ground clutter — no tool required, one-time find. */
  DriftwoodPile: "driftwood-pile",
  LooseStones: "loose-stones"
} as const;

/**
 * An Interactable is pure domain data: something in the world the player can
 * act on. It carries no behavior — the verb selects the handler that runs.
 * requirements is optional and defaults to "always available" (an empty
 * requirement list is vacuously satisfied); the object simply never appears
 * focusable to a player who doesn't meet them (FIRST_HOUR: fully diegetic,
 * no message, no disabled button — the interaction is not offered at all).
 */
export type Interactable = Readonly<{
  id: string;
  kind: string;
  name: string;
  verb: InteractionVerb;
  position: WorldCoordinate;
  radiusInTiles: number;
  requirements?: readonly WorldRequirement[];
}>;

/**
 * Items granted by an interaction. itemId references the item catalog: the
 * interaction system never knows item semantics, and the inventory never
 * knows where items come from — WorldSession connects them.
 */
export type InteractionYield = Readonly<{
  itemId: string;
  quantity: number;
}>;

/**
 * The outcome of one interaction. exhaustForSeconds puts the interactable on
 * cooldown (resource respawn); Number.POSITIVE_INFINITY means it never comes
 * back (one-time finds). Undefined leaves it ready.
 */
export type InteractionResult = Readonly<{
  success: boolean;
  message: string;
  yields: readonly InteractionYield[];
  exhaustForSeconds?: number;
  /** Set when the interaction opens a crafting station of this kind. */
  opensStationKind?: string;
}>;

/**
 * Context handlers receive; grows over time (player, tools, server auth).
 * `equipment` is wired in ahead of use: the next sprint's tool-gated gathering
 * (tree -> hacha, roca -> pico) will read it from inside a handler, without
 * any change to InteractionManager or the handlers that don't need it yet.
 */
export type InteractionContext = Readonly<{
  nowSeconds: number;
  equipment: EquipmentQuery;
}>;

/** One handler per verb. Object-specific variation lives in data tables. */
export type InteractionHandler = (
  interactable: Interactable,
  context: InteractionContext
) => InteractionResult;

/**
 * A source derives interactables on demand around a position instead of
 * registering them one by one. Tile features (thousands of trees and rocks,
 * procedural or streamed) come from a source; future NPC or server-entity
 * systems plug in as new sources without touching the registry.
 */
export type InteractableSource = Readonly<{
  findWithin(position: WorldCoordinate, radiusInTiles: number): readonly Interactable[];
}>;

/**
 * A zone-declared interactable. Anchors either to an existing POI's footprint
 * (poiId — camp, forge: places with narrative weight) or directly to a tile
 * (anchorTile — loose ground clutter that isn't a point of interest on its
 * own and shouldn't trigger POI discovery). Exactly one of the two is set.
 */
export type ZoneInteractableDefinition = Readonly<{
  id: string;
  kind: string;
  name: string;
  verb: InteractionVerb;
  radiusInTiles: number;
  poiId?: string;
  anchorTile?: TileCoordinate;
  requirements?: readonly WorldRequirement[];
}>;

/** The pair returned by a performed interaction, ready to be announced. */
export type InteractionOutcome = Readonly<{
  interactable: Interactable;
  result: InteractionResult;
}>;

/**
 * JSON-safe encoding of every exhausted interactable's *remaining* seconds,
 * keyed by id — never an absolute "until" timestamp, because the session
 * clock (nowSeconds) restarts at 0 every session and an absolute value from a
 * previous session would be meaningless against it. `"infinite"` stands in
 * for Number.POSITIVE_INFINITY (permanent one-time finds like the abandoned
 * camp or a driftwood pile): JSON.stringify silently turns Infinity into
 * null, which would make a "never respawns" resource look available again
 * after a reload.
 */
export type ExhaustionSnapshot = Readonly<Record<string, number | "infinite">>;
