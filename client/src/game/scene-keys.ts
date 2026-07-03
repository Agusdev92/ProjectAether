/**
 * Central scene identifiers avoid fragile string literals across scene
 * transitions and make future lazy loading or scene registries easier to audit.
 */
export const SceneKeys = {
  Boot: "Boot",
  Preload: "Preload",
  MainMenu: "MainMenu",
  World: "World",
  UI: "UI"
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];
