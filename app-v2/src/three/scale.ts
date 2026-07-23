import { EARTH_RADIUS_KM, PHYSICAL } from '@/data/physical'

/**
 * Mapping between real astronomical measurements and scene units.
 *
 * The Solar System cannot be drawn honestly on one screen: at true scale with
 * Earth's orbit at 62 units, Earth itself is 0.0026 units across — invisible.
 * So the app offers both, and says which is which.
 */

/** Scene units per astronomical unit. Earth's orbit sits at 62, as in v1. */
export const AU_UNITS = 62

export const KM_PER_AU = 149_597_870.7

/** Scene units per kilometre at true scale. */
export const UNITS_PER_KM = AU_UNITS / KM_PER_AU

/**
 * Enhanced sizes follow radius^0.5, which is what v1's hand-tuned values
 * turn out to encode. Big planets stay visibly bigger, small ones stay
 * findable, and the ordering is never wrong.
 */
const ENHANCED_SIZE_K = 0.01629

export type DistanceMode = 'compressed' | 'true'
export type SizeMode = 'enhanced' | 'true'

/**
 * Hand-tuned orbit radii from v1, kept as the default because the true
 * spacing puts Neptune 30x further out than Earth and leaves the inner
 * planets in a knot around the Sun.
 */
export const COMPRESSED_ORBIT: Record<string, number> = {
  mercury: 30,
  venus: 45,
  earth: 62,
  mars: 80,
  jupiter: 110,
  saturn: 145,
  uranus: 180,
  neptune: 215,
  pluto: 250,
}

/** Scene radius of a body under the given size mode. */
export function bodyRadius(id: string, mode: SizeMode): number {
  const physical = PHYSICAL[id]
  if (!physical) return 1

  if (mode === 'true') return physical.radiusKm * UNITS_PER_KM

  // The Sun gets an extra lift; at pure radius^0.5 it reads as just another
  // large sphere rather than the object holding 99.86% of the system's mass.
  const boost = id === 'sun' ? 1.47 : 1
  return ENHANCED_SIZE_K * Math.sqrt(physical.radiusKm) * boost
}

/**
 * Scene distance for a body currently `rAu` from the Sun on an orbit of
 * semi-major axis `aAu`.
 *
 * Compressed mode keeps the real *shape* of the orbit — the ratio r/a carries
 * eccentricity through — while remapping the overall size, so perihelion and
 * aphelion still read correctly.
 */
export function orbitDistance(
  id: string,
  rAu: number,
  aAu: number,
  mode: DistanceMode,
): number {
  if (mode === 'true') return rAu * AU_UNITS

  const compressed = COMPRESSED_ORBIT[id]
  if (!compressed) return rAu * AU_UNITS
  return compressed * (rAu / aAu)
}

/** Radius of a moon's orbit around its planet, in scene units. */
export function moonOrbitRadius(
  distanceKm: number,
  planetId: string,
  sizeMode: SizeMode,
  distanceMode: DistanceMode,
): number {
  if (distanceMode === 'true' && sizeMode === 'true') return distanceKm * UNITS_PER_KM

  // Otherwise place the moon in proportion to its planet's drawn radius, so it
  // clears the surface without flying off across the orbit.
  const planetRadius = bodyRadius(planetId, sizeMode)
  const realRatio = distanceKm / PHYSICAL[planetId].radiusKm
  // Compress the ratio so Callisto (26 planet-radii) stays on screen.
  return planetRadius * (1.6 + Math.pow(realRatio, 0.55) * 0.55)
}

/** Body size expressed in Earth radii — the unit people can actually picture. */
export function inEarthRadii(id: string): number {
  return (PHYSICAL[id]?.radiusKm ?? 0) / EARTH_RADIUS_KM
}
