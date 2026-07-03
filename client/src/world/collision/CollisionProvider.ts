export type CollisionProvider = Readonly<{
  isBlockedAtWorld(worldX: number, worldY: number): boolean;
}>;
