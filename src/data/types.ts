/**
 * Shared types for all celestial-body data.
 * Numeric `color` fields are hex ints, matching THREE.Color's constructor.
 */

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface RingSpec {
  innerRadius: number // multiplier of planet size
  outerRadius: number
  opacity: number
  divisions: string[]
  icePercentage: number
}

export interface GreatRedSpot {
  color: number
  latitude: number
  size: number
}

export interface SurfaceFeatures {
  craterDensity?: 'low' | 'medium' | 'high'
  plains?: boolean
  scarps?: boolean
}

export interface Composition {
  [element: string]: string
}

export interface PlanetData {
  name: string
  type: string
  spectralClass?: string
  diameter: number // km
  mass: string // kg, pre-formatted
  gravity: number // m/s²
  orbitalPeriod: number // days
  distanceFromSun: number // km
  moons: number
  temperature: string
  coreTemperature?: string
  dayLength: string
  description: string
  orbitalInclination: number
  axialTilt: number
  color: number
  emissive?: number
  coronaColor?: number
  size: number // visual size in scene units
  textureFile: string | null
  luminosity?: string
  composition?: Composition
  facts: string[]

  // Orbit — absent on the Sun
  orbitRadius?: number
  orbitSpeed?: number
  rotationSpeed?: number

  // Optional visual traits
  atmosphere?: boolean
  atmosphereColor?: number
  atmosphereOpacity?: number
  atmosphereDensity?: number
  cloudLayers?: number
  hasMoon?: boolean
  hasRings?: boolean
  ringColor?: number
  rings?: RingSpec
  bandColors?: string[]
  greatRedSpot?: GreatRedSpot
  storms?: boolean
  magneticField?: number
  surfaceFeatures?: SurfaceFeatures
  oceanColor?: number
  landColor?: number
  cloudColor?: number
  cloudOpacity?: number
  nightLights?: boolean
  hasSeasons?: boolean
  hasIceCaps?: boolean
  iceCapsColor?: number
  dustStorms?: boolean
  olympusMons?: boolean
  vallesMarineris?: boolean
}

export interface MoonData {
  name: string
  parent: string
  diameter: number
  distanceFromPlanet: number
  orbitalPeriod: number
  color: number
  size: number
  orbitRadius: number
  orbitSpeed: number
  description: string
}

export interface ComparisonProperty {
  key: keyof PlanetData
  label: string
  unit: string
  format: 'number' | 'scientific' | 'string'
}

export interface MilkyWayData {
  name: string
  type: string
  diameter: number
  stars: string
  age: string
  solarSystemPosition: { arm: string; distanceFromCenter: string }
  description: string
  color: number
  spiralArms: number
  facts: string[]
}

export interface UniverseData {
  localGroup: { name: string; description: string }
  milkyWay: MilkyWayData
}

export interface GalaxyData {
  name: string
  type: string
  distance: string
  diameter: string
  stars: string
  constellation: string
  magnitude: number
  description: string
  color: number
  position: Vec3
  scale: number
  facts: string[]
}

export interface NebulaData {
  name: string
  type: string
  distance: string
  diameter: string
  constellation: string
  description: string
  color: number
  glowColor: number
  position: Vec3
  scale: number
  facts: string[]
}

export interface StarClusterData {
  name: string
  type: string
  distance: string
  stars: string
  age: string
  constellation: string
  description: string
  color: number
  position: Vec3
  scale: number
  facts: string[]
}

export interface ExoticObjectData {
  name: string
  type: string
  distance: string
  mass: string
  location: string
  description: string
  color: number
  glowColor: number
  position: Vec3
  scale: number
  facts: string[]
}

export interface CosmicStructureData {
  name: string
  type: string
  distance: string
  size: string
  description: string
  position: Vec3
}

export type ViewScaleId =
  | 'solarSystem'
  | 'interstellar'
  | 'galactic'
  | 'intergalactic'
  | 'cosmic'

export interface ViewScale {
  name: string
  maxDistance: number
  description: string
}

export interface SatelliteData {
  name: string
  type: 'station' | 'telescope' | 'probe' | 'constellation'
  shape?: string
  orbit: 'earth' | 'solar' | 'heliocentric'
  altitude: number // km
  distance?: number
  orbitRadius: number
  orbitSpeed: number
  size: number
  color: number
  description: string
  launchYear?: number
  crew?: string
  count?: number
}

export interface CometData {
  name: string
  type: string
  orbitalPeriod?: number // years
  perihelion: number // scaled for visualization
  aphelion: number
  size: number
  speed: number
  tailLength: number
  color: number
  tailColor: number
  description: string
  lastPerihelion?: number
  nextPerihelion?: number
}

export interface AsteroidData {
  name: string
  type: string
  diameter: number
  orbitRadius: number
  orbitSpeed: number
  size: number
  color: number
  description: string
}

export interface AlienShipData {
  id: string
  name: string
  type: 'scout' | 'mothership' | 'cruiser' | 'probe'
  size: number
  speed: number
  orbitRadius: number
  color: number
  glowColor: number
  description: string
  behavior: 'patrol' | 'orbit' | 'wander' | 'scan'
  lightPattern: 'pulse' | 'rotate' | 'blink' | 'sweep'
}

/** A body the user can select — unifies planets, moons and deep-space objects. */
export type SelectableKind =
  | 'planet'
  | 'moon'
  | 'galaxy'
  | 'nebula'
  | 'cluster'
  | 'exotic'
  | 'satellite'
  | 'comet'
  | 'asteroid'

export interface Selection {
  kind: SelectableKind
  id: string
}
