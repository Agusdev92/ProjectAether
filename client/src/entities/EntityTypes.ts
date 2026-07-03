/**
 * Shared entity contracts live outside Phaser so simulation, networking, and
 * persistence can agree on stable data shapes before presentation is involved.
 */
export type EntityId = string;

export type EntityTransform = Readonly<{
  x: number;
  y: number;
}>;

export type MovementVector = Readonly<{
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
}>;
