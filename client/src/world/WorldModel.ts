/**
 * WorldModel captures world-level state that is independent from rendering.
 * Phaser scenes can present this model, while future networking or simulation
 * services can update it without depending on Phaser classes.
 */
export type WorldModel = Readonly<{
  zoneId: string;
  displayName: string;
}>;

export const InitialWorldModel: WorldModel = {
  zoneId: "first-coast",
  displayName: "La Primera Costa"
};
