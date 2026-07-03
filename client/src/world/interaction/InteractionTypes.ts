import type { WorldCoordinate } from "@world/coordinates/WorldCoordinates";

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
  Forge: "forge"
} as const;

/**
 * An Interactable is pure domain data: something in the world the player can
 * act on. It carries no behavior — the verb selects the handler that runs.
 */
export type Interactable = Readonly<{
  id: string;
  kind: string;
  name: string;
  verb: InteractionVerb;
  position: WorldCoordinate;
  radiusInTiles: number;
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

/** Context handlers receive; grows over time (player, tools, server auth). */
export type InteractionContext = Readonly<{
  nowSeconds: number;
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

/** A zone-declared interactable anchored to one of its POIs. */
export type ZoneInteractableDefinition = Readonly<{
  id: string;
  kind: string;
  name: string;
  verb: InteractionVerb;
  poiId: string;
  radiusInTiles: number;
}>;

/** The pair returned by a performed interaction, ready to be announced. */
export type InteractionOutcome = Readonly<{
  interactable: Interactable;
  result: InteractionResult;
}>;
