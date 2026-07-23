/**
 * Planetary rotation-axis orientations, from the IAU Working Group on
 * Cardinal Coordinates and Rotational Elements.
 *
 * Given as the north pole's right ascension and declination in the J2000
 * equatorial frame. These are what make seasons computable: the sub-solar
 * latitude is just the angle between a planet's pole and its direction to
 * the Sun, and it is the tilt of the *fixed* axis relative to the orbit —
 * not the changing distance — that drives seasons.
 */

export interface PoleOrientation {
  /** Right ascension of the north pole, degrees (J2000). */
  ra: number
  /** Declination of the north pole, degrees (J2000). */
  dec: number
}

export const POLES: Record<string, PoleOrientation> = {
  sun: { ra: 286.13, dec: 63.87 },
  mercury: { ra: 281.0103, dec: 61.4155 },
  venus: { ra: 272.76, dec: 67.16 },
  earth: { ra: 0.0, dec: 90.0 },
  mars: { ra: 317.68143, dec: 52.8865 },
  jupiter: { ra: 268.056595, dec: 64.495303 },
  saturn: { ra: 40.589, dec: 83.537 },
  uranus: { ra: 257.311, dec: -15.175 },
  neptune: { ra: 299.36, dec: 43.46 },
  pluto: { ra: 132.993, dec: -6.163 },
}

const DEG = Math.PI / 180

/** Mean obliquity of the ecliptic at J2000, degrees. */
const ECLIPTIC_OBLIQUITY = 23.4392911

export interface Vec3 {
  x: number
  y: number
  z: number
}

/**
 * North pole unit vector in J2000 *ecliptic* coordinates — the same frame the
 * ephemeris returns positions in, so the two can be combined directly.
 */
function poleVector(planet: string): Vec3 | null {
  const pole = POLES[planet]
  if (!pole) return null

  const ra = pole.ra * DEG
  const dec = pole.dec * DEG

  // Equatorial unit vector.
  const xEq = Math.cos(dec) * Math.cos(ra)
  const yEq = Math.cos(dec) * Math.sin(ra)
  const zEq = Math.sin(dec)

  // Rotate about the x-axis by the obliquity: equatorial → ecliptic.
  const eps = ECLIPTIC_OBLIQUITY * DEG
  return {
    x: xEq,
    y: yEq * Math.cos(eps) + zEq * Math.sin(eps),
    z: -yEq * Math.sin(eps) + zEq * Math.cos(eps),
  }
}

const poleCache = new Map<string, Vec3 | null>()

function cachedPole(planet: string): Vec3 | null {
  if (!poleCache.has(planet)) poleCache.set(planet, poleVector(planet))
  return poleCache.get(planet)!
}

/**
 * Sub-solar latitude in degrees: the latitude where the Sun is directly
 * overhead. On Earth this is the solar declination — +23.4° at the June
 * solstice, 0° at the equinoxes, −23.4° in December.
 *
 * `position` is the planet's heliocentric ecliptic position.
 */
export function subSolarLatitude(planet: string, position: Vec3): number {
  const pole = cachedPole(planet)
  if (!pole) return 0

  // Unit vector from the planet toward the Sun.
  const length = Math.hypot(position.x, position.y, position.z)
  if (length === 0) return 0

  const sx = -position.x / length
  const sy = -position.y / length
  const sz = -position.z / length

  const sine = pole.x * sx + pole.y * sy + pole.z * sz
  return Math.asin(Math.max(-1, Math.min(1, sine))) / DEG
}
