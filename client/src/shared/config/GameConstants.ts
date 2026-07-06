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
    deadzoneHeight: 80,
    // Slightly zoomed out from 1:1 so more of the world sits inside the same
    // viewport without touching the tilemap's real size — a perception trick,
    // not a bigger map. LookoutCamera returns here (not to a hardcoded 1)
    // when the player leaves the lookout.
    defaultZoom: 0.92
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
  clock: {
    // Game-seconds advanced per real second. With dayLengthInGameSeconds
    // below, one full day takes 86400 / 80 = 1080 real seconds (18 minutes) —
    // short enough to see the NPC's full routine repeat within one test
    // session, per Sprint 11's explicit requirement.
    timeScale: 80,
    dayLengthInGameSeconds: 86400
  },
  save: {
    saveIntervalMs: 10_000
  },
  npc: {
    // TODO(Sprint 12+): replace the fade-teleport with real pathfinding and
    // walking animation between waypoints. The fade only softens the pop;
    // it is not a substitute for movement.
    waypointFadeDurationMs: 500
  },
  danger: {
    // How long the player can dwell inside an active danger zone before its
    // consequence triggers. At playerSpeedPixelsPerSecond (190) and
    // tile.collisionSize (48), crossing the zone's ~4.5 tile radius takes
    // roughly 1.1s from its center, ~2.3s from the far edge — gathering
    // itself is instant. 7s leaves enough budget to notice the zone, walk to
    // one more ungathered pile and grab it, and still retreat with seconds to
    // spare; a second extra pile starts eating into that margin on purpose.
    tideGraceSeconds: 7
  },
  combat: {
    // Both sides share the same "3 hits" scale so a fight reads legibly from
    // either side. Creature damage (1) leaves the player 2 hits of margin
    // before the third would defeat them — enough for a real "keep fighting
    // or retreat" decision mid-fight, never a coin flip on the first swing.
    playerMaxHealth: 3,
    creatureHealth: 3,
    creatureDamage: 1,
    // Sword is exactly double bare hands: unarmed still works (Regla 13 —
    // no weapon is ever a hard wall) but is visibly, felt-immediately worse.
    unarmedDamage: 1,
    // +2 max health while worn (3 -> 5), never a flat damage reduction: with
    // creature damage already at its smallest unit (1), subtracting armor
    // would hit zero and remove the risk outright (Pilar 11 forbids
    // amputating risk, only easing it). More health means more hits
    // survived, never a hit that stops hurting.
    leatherVestHealthBonus: 2,
    // Reuses InteractableRegistry.exhaust()/isExhausted() for pacing — the
    // same mechanism that already gates gather-node respawns. ~10x the
    // flash+shake duration below, so those always resolve with room to
    // spare before the next exchange is even possible, and the player gets
    // a real beat to decide whether to keep swinging.
    attackCooldownSeconds: 1.5,
    // Longer than the attack cooldown on purpose: "fled to recover" is a
    // bigger narrative event than "recovering from one swing". With only
    // two boars in the whole zone and the vest recipe needing three hides,
    // this keeps a single spot from becoming an instant farm loop without
    // making the wait tedious.
    creatureFleeSeconds: 90,
    damageFlashDurationMs: 200,
    damageShakeDurationMs: 150,
    damageShakeIntensity: 0.005
  },
  atmosphere: {
    lookoutVantageRadiusInTiles: 2.5,
    lookoutZoom: 0.8,
    lookoutZoomInDurationMs: 1600,
    lookoutZoomOutDurationMs: 900,
    leafParticleCount: 14,
    moteParticleCount: 18
  },
  lighting: {
    // A single consistent light-source direction applied to every soft
    // shadow in the world (props, NPCs, creatures, the player) — cheap,
    // cosmetic-only, and makes the placeholder art read as one coherent
    // scene instead of flat cutouts each lit from directly above.
    shadowOffsetX: 8
  },
  horizon: {
    // Built once at scene creation, never touched by the per-tile terrain
    // redraw loop — costs nothing at runtime beyond the initial draw.
    // Kept close to 1 on purpose: at this map's scale the camera can scroll
    // far enough from world origin (~1870px near the lookout) that a
    // classic deep-parallax factor (0.15-0.3) drifts the layers off-screen
    // entirely. Values this close together still read as two depths once
    // the lookout zooms out, without vanishing.
    farLayerScrollFactor: 0.75,
    nearLayerScrollFactor: 0.88,
    peakCount: 7
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
    npc: "#8a7256",
    npcShadow: "#0a0d11",
    creature: "#5c4433",
    creatureShadow: "#0a0d11",
    horizonFar: "#8a9bab",
    debugBackground: "#0d1117"
  },
  fonts: {
    ui: "Inter, Arial, sans-serif"
  }
} as const;

export type GameLayer = (typeof GameConstants.layers)[keyof typeof GameConstants.layers];
