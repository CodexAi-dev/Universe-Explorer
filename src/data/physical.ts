/**
 * Measured physical properties of the Sun and planets.
 *
 * Sources: NASA Planetary Fact Sheets (nssdc.gsfc.nasa.gov) and the IAU
 * Working Group on Cardinal Coordinates and Rotational Elements (2015).
 * Everything here is observational — nothing is tuned for looks.
 */

export interface PhysicalData {
  /** Equatorial radius, km. */
  radiusKm: number
  /**
   * Sidereal rotation period in hours — one turn relative to the stars.
   * Negative means retrograde (Venus, Uranus and Pluto spin backwards).
   */
  siderealRotationHours: number
  /** Mean solar day in hours: sunrise to sunrise, what a resident would live by. */
  solarDayHours: number
  /** Obliquity — axial tilt relative to the orbital plane, degrees. */
  obliquityDeg: number
  /** Mass, kg. */
  massKg: number
  /** Surface (or 1-bar) gravity, m/s². */
  gravity: number
  /** Escape velocity, km/s. */
  escapeVelocityKms: number
  /** Mean density, kg/m³. */
  densityKgM3: number
  /** Bond albedo — fraction of sunlight reflected. */
  albedo: number
  /** Mean surface (or cloud-top) temperature, °C. */
  meanTempC: number
  /** Confirmed natural satellites. */
  moonCount: number
  /** Whether the body has a substantial atmosphere. */
  hasAtmosphere: boolean
  /** Main atmospheric constituents, for the info panel. */
  atmosphere?: string
}

export const PHYSICAL: Record<string, PhysicalData> = {
  sun: {
    radiusKm: 695_700,
    siderealRotationHours: 609.12, // 25.38 d at the equator; the Sun rotates differentially
    solarDayHours: 609.12,
    obliquityDeg: 7.25,
    massKg: 1.989e30,
    gravity: 274,
    escapeVelocityKms: 617.7,
    densityKgM3: 1408,
    albedo: 0,
    meanTempC: 5505,
    moonCount: 0,
    hasAtmosphere: true,
    atmosphere: 'Hydrogen 73%, Helium 25%',
  },
  mercury: {
    radiusKm: 2439.7,
    siderealRotationHours: 1407.6,
    solarDayHours: 4222.6, // 176 Earth days — two Mercury years per solar day
    obliquityDeg: 0.034,
    massKg: 3.301e23,
    gravity: 3.7,
    escapeVelocityKms: 4.3,
    densityKgM3: 5429,
    albedo: 0.088,
    meanTempC: 167,
    moonCount: 0,
    hasAtmosphere: false,
  },
  venus: {
    radiusKm: 6051.8,
    siderealRotationHours: -5832.5, // retrograde
    solarDayHours: 2802.0, // 116.75 Earth days
    obliquityDeg: 177.36,
    massKg: 4.867e24,
    gravity: 8.87,
    escapeVelocityKms: 10.36,
    densityKgM3: 5243,
    albedo: 0.76,
    meanTempC: 464,
    moonCount: 0,
    hasAtmosphere: true,
    atmosphere: 'CO₂ 96.5%, N₂ 3.5%',
  },
  earth: {
    radiusKm: 6371.0,
    siderealRotationHours: 23.9345,
    solarDayHours: 24.0,
    obliquityDeg: 23.44,
    massKg: 5.972e24,
    gravity: 9.807,
    escapeVelocityKms: 11.186,
    densityKgM3: 5514,
    albedo: 0.306,
    meanTempC: 15,
    moonCount: 1,
    hasAtmosphere: true,
    atmosphere: 'N₂ 78%, O₂ 21%',
  },
  mars: {
    radiusKm: 3389.5,
    siderealRotationHours: 24.6229,
    solarDayHours: 24.6597, // one "sol"
    obliquityDeg: 25.19,
    massKg: 6.417e23,
    gravity: 3.71,
    escapeVelocityKms: 5.03,
    densityKgM3: 3934,
    albedo: 0.25,
    meanTempC: -65,
    moonCount: 2,
    hasAtmosphere: true,
    atmosphere: 'CO₂ 95%, N₂ 2.8%',
  },
  jupiter: {
    radiusKm: 71_492,
    siderealRotationHours: 9.925,
    solarDayHours: 9.9259,
    obliquityDeg: 3.13,
    massKg: 1.898e27,
    gravity: 24.79,
    escapeVelocityKms: 59.5,
    densityKgM3: 1326,
    albedo: 0.503,
    meanTempC: -110,
    moonCount: 95,
    hasAtmosphere: true,
    atmosphere: 'H₂ 89.8%, He 10.2%',
  },
  saturn: {
    radiusKm: 60_268,
    siderealRotationHours: 10.656,
    solarDayHours: 10.656,
    obliquityDeg: 26.73,
    massKg: 5.683e26,
    gravity: 10.44,
    escapeVelocityKms: 35.5,
    densityKgM3: 687, // less dense than water
    albedo: 0.342,
    meanTempC: -140,
    moonCount: 146,
    hasAtmosphere: true,
    atmosphere: 'H₂ 96.3%, He 3.25%',
  },
  uranus: {
    radiusKm: 25_559,
    siderealRotationHours: -17.24, // retrograde
    solarDayHours: 17.24,
    obliquityDeg: 97.77, // rolls on its side
    massKg: 8.681e25,
    gravity: 8.87,
    escapeVelocityKms: 21.3,
    densityKgM3: 1270,
    albedo: 0.3,
    meanTempC: -195,
    moonCount: 28,
    hasAtmosphere: true,
    atmosphere: 'H₂ 82.5%, He 15.2%, CH₄ 2.3%',
  },
  neptune: {
    radiusKm: 24_764,
    siderealRotationHours: 16.11,
    solarDayHours: 16.11,
    obliquityDeg: 28.32,
    massKg: 1.024e26,
    gravity: 11.15,
    escapeVelocityKms: 23.5,
    densityKgM3: 1638,
    albedo: 0.29,
    meanTempC: -200,
    moonCount: 16,
    hasAtmosphere: true,
    atmosphere: 'H₂ 80%, He 19%, CH₄ 1.5%',
  },
  pluto: {
    radiusKm: 1188.3,
    siderealRotationHours: -153.2928, // retrograde
    solarDayHours: 153.2928,
    obliquityDeg: 122.53,
    massKg: 1.303e22,
    gravity: 0.62,
    escapeVelocityKms: 1.21,
    densityKgM3: 1854,
    albedo: 0.52,
    meanTempC: -225,
    moonCount: 5,
    hasAtmosphere: true,
    atmosphere: 'N₂, CH₄, CO (tenuous)',
  },
}

/** Earth radii, the natural unit for comparing planet sizes. */
export const EARTH_RADIUS_KM = 6371.0

/**
 * Real sidereal orbital periods of the major moons, in days.
 * Negative means a retrograde orbit (Triton orbits backwards — evidence it
 * was captured rather than formed in place).
 */
export const MOON_PERIODS: Record<string, number> = {
  moon: 27.321661,
  phobos: 0.31891,
  deimos: 1.263,
  io: 1.769138,
  europa: 3.551181,
  ganymede: 7.154553,
  callisto: 16.689018,
  titan: 15.945,
  enceladus: 1.370218,
  triton: -5.876854,
  charon: 6.3872,
}

/** Tidally locked moons always show the same face to their planet. */
export const TIDALLY_LOCKED = new Set([
  'moon',
  'phobos',
  'deimos',
  'io',
  'europa',
  'ganymede',
  'callisto',
  'titan',
  'enceladus',
  'charon',
])
