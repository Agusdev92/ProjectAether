/**
 * Deterministic value-noise: smooth, continuous, reproducible — the same
 * (x, y) always resolves to the same value, no Math.random() anywhere, same
 * anti-randomness criterion as wind/weather/terrain hashes elsewhere in the
 * project. Two octaves of bilinearly-interpolated lattice noise with a
 * Perlin-style fade curve — not true Perlin/Simplex (no gradient vectors),
 * an equivalent technique chosen for how little code it needs to read as
 * organic clumps and clearings instead of uniform scatter. `seed` lets
 * independent callers (different prop types, different regions of the same
 * zone) sample decorrelated patterns from the same function instead of the
 * identical shape translated.
 */
export function resolveNoiseAt(x: number, y: number, frequency: number, seed = 0): number {
  return (
    sampleOctave(x, y, frequency, seed) * 0.7 + sampleOctave(x, y, frequency * 2.3, seed + 41) * 0.3
  );
}

function sampleOctave(x: number, y: number, frequency: number, seedOffset: number): number {
  const sampleX = x * frequency + seedOffset;
  const sampleY = y * frequency + seedOffset;
  const cellX = Math.floor(sampleX);
  const cellY = Math.floor(sampleY);
  const fractionX = fade(sampleX - cellX);
  const fractionY = fade(sampleY - cellY);

  const topLeft = latticeValue(cellX, cellY);
  const topRight = latticeValue(cellX + 1, cellY);
  const bottomLeft = latticeValue(cellX, cellY + 1);
  const bottomRight = latticeValue(cellX + 1, cellY + 1);

  const top = lerp(topLeft, topRight, fractionX);
  const bottom = lerp(bottomLeft, bottomRight, fractionX);

  return lerp(top, bottom, fractionY);
}

/** Perlin's improved fade curve — smoother than linear interpolation, avoids visible cell-grid seams. */
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Deterministic pseudo-random value in [0, 1) for one integer lattice point.
 * A bit-mixing hash (multiply + xorshift), not a simple modulo: a plain
 * `(ix * prime + iy * prime) % modulus` stays tiny — and barely varies at
 * all — for small coordinates near the origin, which is exactly wrong for a
 * ~48x48 map where every coordinate is small. Multiplying by a large odd
 * constant first scrambles bits into the high positions immediately, so the
 * xorshift mixing that follows spreads them across the full output range
 * regardless of how small (ix, iy) are.
 */
function latticeValue(ix: number, iy: number): number {
  let hash = Math.imul(ix, 374_761_393) + Math.imul(iy, 668_265_263);

  hash = Math.imul(hash ^ (hash >>> 13), 1_274_126_177);
  hash ^= hash >>> 16;

  return (hash >>> 0) / 4_294_967_296;
}
