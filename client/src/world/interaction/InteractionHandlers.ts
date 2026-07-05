import { InteractableKinds, InteractionVerbs } from "@world/interaction/InteractionTypes";
import type {
  InteractionHandler,
  InteractionResult,
  InteractionVerb
} from "@world/interaction/InteractionTypes";

/**
 * Per-kind data for the Gather verb. Adding a gatherable object type (ore,
 * plants, driftwood...) is one row here — no new code anywhere else. This is
 * how the system scales to hundreds of object kinds.
 */
const GatherTable: Readonly<
  Record<
    string,
    Readonly<{
      itemId: string;
      message: string;
      respawnSeconds: number;
    }>
  >
> = {
  [InteractableKinds.Tree]: {
    itemId: "wood",
    message: "Madera obtenida",
    respawnSeconds: 30
  },
  [InteractableKinds.Rock]: {
    itemId: "stone",
    message: "Piedra obtenida",
    respawnSeconds: 45
  },
  // Loose ground clutter: same items as trees/rocks, but a one-time find
  // (Number.POSITIVE_INFINITY never respawns) instead of a renewable node.
  // That is the whole difference between "recolección inicial" and "tala de
  // árboles / minería tradicional" — no tool required either way today.
  [InteractableKinds.DriftwoodPile]: {
    itemId: "wood",
    message: "Madera obtenida",
    respawnSeconds: Number.POSITIVE_INFINITY
  },
  [InteractableKinds.LooseStones]: {
    itemId: "stone",
    message: "Piedra obtenida",
    respawnSeconds: Number.POSITIVE_INFINITY
  }
};

/** Per-kind data for the Search verb: one-time finds. */
const SearchTable: Readonly<
  Record<string, Readonly<{ message: string; itemId: string; quantity: number }>>
> = {
  [InteractableKinds.Camp]: {
    message: "Cabeza de hacha oxidada encontrada",
    itemId: "rusted-axe-head",
    quantity: 1
  }
};

/**
 * Per-kind data for the UseStation verb. Kinds listed here open the crafting
 * UI for their station; the crafting system decides what the station offers.
 */
const StationTable: Readonly<Record<string, Readonly<{ opensStation: boolean }>>> = {
  [InteractableKinds.Forge]: {
    opensStation: true
  }
};

const gatherHandler: InteractionHandler = (interactable): InteractionResult => {
  const entry = GatherTable[interactable.kind];

  if (!entry) {
    return failure(`No hay nada que recolectar en ${interactable.name}.`);
  }

  return {
    success: true,
    message: entry.message,
    yields: [{ itemId: entry.itemId, quantity: 1 }],
    exhaustForSeconds: entry.respawnSeconds
  };
};

const searchHandler: InteractionHandler = (interactable): InteractionResult => {
  const entry = SearchTable[interactable.kind];

  if (!entry) {
    return failure(`No encuentras nada en ${interactable.name}.`);
  }

  return {
    success: true,
    message: entry.message,
    yields: [{ itemId: entry.itemId, quantity: entry.quantity }],
    exhaustForSeconds: Number.POSITIVE_INFINITY
  };
};

const useStationHandler: InteractionHandler = (interactable): InteractionResult => {
  const entry = StationTable[interactable.kind];

  if (!entry?.opensStation) {
    return failure(`${interactable.name} no responde.`);
  }

  return {
    success: true,
    // No notification: opening the station UI is the feedback.
    message: "",
    yields: [],
    opensStationKind: interactable.kind
  };
};

function failure(message: string): InteractionResult {
  return { success: false, message, yields: [] };
}

/**
 * Builds the default verb-to-handler map. New verbs (open, read, toggle,
 * talk...) register here once and serve every future object kind that uses
 * them.
 */
export function createDefaultInteractionHandlers(): ReadonlyMap<
  InteractionVerb,
  InteractionHandler
> {
  return new Map<InteractionVerb, InteractionHandler>([
    [InteractionVerbs.Gather, gatherHandler],
    [InteractionVerbs.Search, searchHandler],
    [InteractionVerbs.UseStation, useStationHandler]
  ]);
}
