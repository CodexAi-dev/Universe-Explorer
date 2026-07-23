/**
 * Real planetary positions from Keplerian orbital elements.
 *
 * Elements and their per-century rates are JPL's "Keplerian Elements for
 * Approximate Positions of the Major Planets" (Standish), valid 1800–2050 AD
 * with errors well under a degree — far below what is visible here.
 *
 * Earth uses the Earth–Moon barycentre, as the JPL table does.
 */

export interface OrbitalElements {
  /** Semi-major axis, AU */
  a: number
  /** Eccentricity */
  e: number
  /** Inclination to the ecliptic, degrees */
  i: number
  /** Mean longitude, degrees */
  L: number
  /** Longitude of perihelion (ϖ), degrees */
  peri: number
  /** Longitude of the ascending node (Ω), degrees */
  node: number
}

/** [element, rate per Julian century] */
type ElementPair = [number, number]

interface ElementTable {
  a: ElementPair
  e: ElementPair
  i: ElementPair
  L: ElementPair
  peri: ElementPair
  node: ElementPair
}

export const ORBITAL_ELEMENTS: Record<string, ElementTable> = {
  mercury: {
    a: [0.38709927, 0.00000037],
    e: [0.20563593, 0.00001906],
    i: [7.00497902, -0.00594749],
    L: [252.2503235, 149472.67411175],
    peri: [77.45779628, 0.16047689],
    node: [48.33076593, -0.12534081],
  },
  venus: {
    a: [0.72333566, 0.0000039],
    e: [0.00677672, -0.00004107],
    i: [3.39467605, -0.0007889],
    L: [181.9790995, 58517.81538729],
    peri: [131.60246718, 0.00268329],
    node: [76.67984255, -0.27769418],
  },
  earth: {
    a: [1.00000261, 0.00000562],
    e: [0.01671123, -0.00004392],
    i: [-0.00001531, -0.01294668],
    L: [100.46457166, 35999.37244981],
    peri: [102.93768193, 0.32327364],
    node: [0.0, 0.0],
  },
  mars: {
    a: [1.52371034, 0.00001847],
    e: [0.0933941, 0.00007882],
    i: [1.84969142, -0.00813131],
    L: [-4.55343205, 19140.30268499],
    peri: [-23.94362959, 0.44441088],
    node: [49.55953891, -0.29257343],
  },
  jupiter: {
    a: [5.202887, -0.00011607],
    e: [0.04838624, -0.00013253],
    i: [1.30439695, -0.00183714],
    L: [34.39644051, 3034.74612775],
    peri: [14.72847983, 0.21252668],
    node: [100.47390909, 0.20469106],
  },
  saturn: {
    a: [9.53667594, -0.0012506],
    e: [0.05386179, -0.00050991],
    i: [2.48599187, 0.00193609],
    L: [49.95424423, 1222.49362201],
    peri: [92.59887831, -0.41897216],
    node: [113.66242448, -0.28867794],
  },
  uranus: {
    a: [19.18916464, -0.00196176],
    e: [0.04725744, -0.00004397],
    i: [0.77263783, -0.00242939],
    L: [313.23810451, 428.48202785],
    peri: [170.9542763, 0.40805281],
    node: [74.01692503, 0.04240589],
  },
  neptune: {
    a: [30.06992276, 0.00026291],
    e: [0.00859048, 0.00005105],
    i: [1.77004347, 0.00035372],
    L: [-55.12002969, 218.45945325],
    peri: [44.96476227, -0.32241464],
    node: [131.78422574, -0.00508664],
  },
  pluto: {
    a: [39.48211675, -0.00031596],
    e: [0.2488273, 0.0000517],
    i: [17.14001206, 0.00004818],
    L: [238.92903833, 145.20780515],
    peri: [224.06891629, -0.04062942],
    node: [110.30393684, -0.01183482],
  },
}

const DEG = Math.PI / 180
const J2000_UNIX_MS = 946_728_000_000 // 2000-01-01T12:00:00Z
const MS_PER_CENTURY = 3_155_760_000_000 // 36525 days

/** Julian centuries since the J2000.0 epoch. */
export function centuriesSinceJ2000(unixMs: number): number {
  return (unixMs - J2000_UNIX_MS) / MS_PER_CENTURY
}

/** Days since J2000.0 — the time base for rotation. */
export function daysSinceJ2000(unixMs: number): number {
  return (unixMs - J2000_UNIX_MS) / 86_400_000
}

/** Wrap degrees to (-180, 180]. */
function wrapDegrees(value: number): number {
  let d = value % 360
  if (d > 180) d -= 360
  if (d <= -180) d += 360
  return d
}

/** Elements propagated to the given time. */
export function elementsAt(planet: string, unixMs: number): OrbitalElements | null {
  const table = ORBITAL_ELEMENTS[planet]
  if (!table) return null

  const T = centuriesSinceJ2000(unixMs)
  return {
    a: table.a[0] + table.a[1] * T,
    e: table.e[0] + table.e[1] * T,
    i: table.i[0] + table.i[1] * T,
    L: table.L[0] + table.L[1] * T,
    peri: table.peri[0] + table.peri[1] * T,
    node: table.node[0] + table.node[1] * T,
  }
}

/**
 * Solve Kepler's equation M = E − e·sin(E) for the eccentric anomaly.
 * Newton–Raphson; converges in a handful of iterations for e < 0.25.
 */
function solveKepler(meanAnomalyRad: number, e: number): number {
  let E = meanAnomalyRad + e * Math.sin(meanAnomalyRad)

  for (let iteration = 0; iteration < 12; iteration++) {
    const deltaM = meanAnomalyRad - (E - e * Math.sin(E))
    const deltaE = deltaM / (1 - e * Math.cos(E))
    E += deltaE
    if (Math.abs(deltaE) < 1e-10) break
  }

  return E
}

export interface OrbitalState {
  /** Heliocentric ecliptic coordinates, AU. */
  x: number
  y: number
  z: number
  /** Distance from the Sun, AU. */
  r: number
  /** True anomaly, radians. */
  trueAnomaly: number
  /** Semi-major axis at this epoch, AU. */
  a: number
  e: number
}

/**
 * Heliocentric ecliptic position of a planet at a given instant.
 * Axes are the J2000 ecliptic frame: +x toward the vernal equinox,
 * +z toward the ecliptic north pole.
 */
export function orbitalStateAt(planet: string, unixMs: number): OrbitalState | null {
  const el = elementsAt(planet, unixMs)
  if (!el) return null

  const { a, e } = el
  // Argument of perihelion from the longitude of perihelion.
  const argPeri = (el.peri - el.node) * DEG
  const node = el.node * DEG
  const inc = el.i * DEG

  const M = wrapDegrees(el.L - el.peri) * DEG
  const E = solveKepler(M, e)

  // Position in the orbital plane, perifocal frame.
  const xPerifocal = a * (Math.cos(E) - e)
  const yPerifocal = a * Math.sqrt(1 - e * e) * Math.sin(E)

  const trueAnomaly = Math.atan2(yPerifocal, xPerifocal)
  const r = Math.hypot(xPerifocal, yPerifocal)

  // Rotate perifocal → ecliptic: Rz(node) · Rx(inc) · Rz(argPeri).
  const cosPeri = Math.cos(argPeri)
  const sinPeri = Math.sin(argPeri)
  const cosNode = Math.cos(node)
  const sinNode = Math.sin(node)
  const cosInc = Math.cos(inc)
  const sinInc = Math.sin(inc)

  const xOrbital = cosPeri * xPerifocal - sinPeri * yPerifocal
  const yOrbital = sinPeri * xPerifocal + cosPeri * yPerifocal

  return {
    x: cosNode * xOrbital - sinNode * yOrbital * cosInc,
    y: sinNode * xOrbital + cosNode * yOrbital * cosInc,
    z: yOrbital * sinInc,
    r,
    trueAnomaly,
    a,
    e,
  }
}

/** Sun's gravitational parameter, AU³/day². */
const GM_SUN = 2.959122082855911e-4

/**
 * Orbital speed from the vis-viva equation, km/s.
 * Real planets speed up at perihelion and slow at aphelion.
 */
export function orbitalVelocity(r: number, a: number): number {
  const auPerDay = Math.sqrt(GM_SUN * (2 / r - 1 / a))
  return (auPerDay * 149_597_870.7) / 86_400
}

/** Sidereal orbital period in days, from Kepler's third law. */
export function orbitalPeriodDays(a: number): number {
  return 2 * Math.PI * Math.sqrt((a * a * a) / GM_SUN)
}
