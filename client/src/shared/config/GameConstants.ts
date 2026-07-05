/**
 * GameConstants centralizes values that affect rendering, layout, and world
 * math. Domain systems should import these constants instead of duplicating
 * Phaser-specific scene values.
 */
export const GameConstants = {
  resolution: {
    width: 1280,
    height: 720
  },
  tile: {
    width: 96,
    height: 48,
    collisionSize: 48
  },
  world: {
    mapId: "asterfall",
    chunkSize: 16,
    widthInTiles: 96,
    heightInTiles: 96,
    playerSpeedPixelsPerSecond: 190
  },
  camera: {
    followLerp: 0.08,
    deadzoneWidth: 120,
    deadzoneHeight: 80
  },
  inventory: {
    capacitySlots: 24,
    panelWidth: 320,
    panelRowHeight: 30
  },
  crafting: {
    panelWidth: 360,
    panelHeight: 300,
    panelRowHeight: 72
  },
  equipment: {
    panelWidth: 300,
    panelHeight: 330,
    panelRowHeight: 30
  },
  interaction: {
    focusRadiusInTiles: 1.6,
    sourceScanRadiusInTiles: 3,
    notificationDurationMs: 2400,
    maxVisibleNotifications: 3
  },
  atmosphere: {
    lookoutVantageRadiusInTiles: 2.5,
    lookoutZoom: 0.8,
    lookoutZoomInDurationMs: 1600,
    lookoutZoomOutDurationMs: 900,
    leafParticleCount: 14,
    moteParticleCount: 18
  },
  depth: {
    background: 0,
    terrain: 100,
    entities: 500,
    worldOverlay: 800,
    ui: 1000,
    modal: 2000,
    debug: 9000
  },
  layers: {
    terrain: "terrain",
    entities: "entities",
    effects: "effects",
    ui: "ui",
    debug: "debug"
  },
  colors: {
    pageBackground: "#101318",
    surface: "#151b23",
    surfaceBorder: "#344155",
    textPrimary: "#f4f7fb",
    textMuted: "#aab4c4",
    accent: "#d7b56d",
    accentHover: "#e6c980",
    accentText: "#111318",
    danger: "#d17a6f",
    gridLine: "#263241",
    tileGrass: "#2f6f42",
    tileGrassAlt: "#3a7d4b",
    tilePath: "#9a7a4a",
    tilePathEdge: "#6f5739",
    tileWater: "#2d7890",
    tileWaterDeep: "#1f526d",
    tileBlocked: "#4b3942",
    tileSand: "#d3b982",
    tileSandEdge: "#a98f5d",
    tileCliff: "#5a5f66",
    tileCliffEdge: "#3d4147",
    poiWood: "#8a6a44",
    poiWoodDark: "#5d4632",
    poiWall: "#b9a888",
    poiRoof: "#8a4f3d",
    poiRoofAlt: "#5b6b7a",
    poiCanvas: "#8a7f65",
    poiSail: "#cfc8b8",
    poiEmber: "#e07b39",
    poiAwning: "#a34d4d",
    poiAwningAlt: "#e0d6c2",
    poiMetal: "#6f7a84",
    smoke: "#b9bec4",
    smokeAsh: "#8e959c",
    seaFoam: "#e8f4f6",
    leaf: "#5f9c58",
    mote: "#e6ddb8",
    softShadow: "#0a0d11",
    treeCanopy: "#245c36",
    treeCanopyLight: "#3f8a4f",
    treeTrunk: "#6b4630",
    rock: "#8e9494",
    rockShadow: "#4d5457",
    bush: "#3b8a4d",
    player: "#d7b56d",
    playerShadow: "#0a0d11",
    debugBackground: "#0d1117"
  },
  fonts: {
    ui: "Inter, Arial, sans-serif"
  }
} as const;

export type GameLayer = (typeof GameConstants.layers)[keyof typeof GameConstants.layers];
