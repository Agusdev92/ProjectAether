export const TileTypes = {
  Grass: 1,
  GrassAlt: 2,
  Path: 3,
  Water: 4,
  Blocked: 5,
  Sand: 6,
  Cliff: 7
} as const;

export type TileType = (typeof TileTypes)[keyof typeof TileTypes];

export const TileFeatureTypes = {
  None: "none",
  Tree: "tree",
  Rock: "rock",
  Bush: "bush"
} as const;

export type TileFeatureType = (typeof TileFeatureTypes)[keyof typeof TileFeatureTypes];

export type TileDefinition = Readonly<{
  id: TileType;
  blocksMovement: boolean;
}>;

export type TileFeatureDefinition = Readonly<{
  id: TileFeatureType;
  blocksMovement: boolean;
}>;

export const TileDefinitions: Readonly<Record<TileType, TileDefinition>> = {
  [TileTypes.Grass]: {
    id: TileTypes.Grass,
    blocksMovement: false
  },
  [TileTypes.GrassAlt]: {
    id: TileTypes.GrassAlt,
    blocksMovement: false
  },
  [TileTypes.Path]: {
    id: TileTypes.Path,
    blocksMovement: false
  },
  [TileTypes.Water]: {
    id: TileTypes.Water,
    blocksMovement: true
  },
  [TileTypes.Blocked]: {
    id: TileTypes.Blocked,
    blocksMovement: true
  },
  [TileTypes.Sand]: {
    id: TileTypes.Sand,
    blocksMovement: false
  },
  [TileTypes.Cliff]: {
    id: TileTypes.Cliff,
    blocksMovement: true
  }
};

export const TileFeatureDefinitions: Readonly<Record<TileFeatureType, TileFeatureDefinition>> = {
  [TileFeatureTypes.None]: {
    id: TileFeatureTypes.None,
    blocksMovement: false
  },
  [TileFeatureTypes.Tree]: {
    id: TileFeatureTypes.Tree,
    blocksMovement: true
  },
  // Gatherable props do not block: playtests showed blocking rock/bush fields
  // form closed pockets that trap the player. Trees keep blocking as forest
  // walls; loose props are stepped around, like resource nodes in the genre.
  [TileFeatureTypes.Rock]: {
    id: TileFeatureTypes.Rock,
    blocksMovement: false
  },
  [TileFeatureTypes.Bush]: {
    id: TileFeatureTypes.Bush,
    blocksMovement: false
  }
};
