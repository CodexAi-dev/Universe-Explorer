import * as THREE from 'three'
import { MOON_DATA } from '@/data/planets'
import { daysSinceJ2000, orbitalStateAt, orbitalVelocity } from '@/data/ephemeris'
import { MOON_PERIODS, PHYSICAL, TIDALLY_LOCKED } from '@/data/physical'
import { subSolarLatitude } from '@/data/poles'
import { moonOrbitRadius, orbitDistance } from './scale'
import type { DistanceMode, SizeMode } from './scale'

/**
 * Shared mutable registry of live scene objects.
 *
 * Positions are *computed from the simulation clock* rather than integrated
 * frame by frame, so scrubbing, reversing and jumping to a date all give the
 * same answer, and no error accumulates over long runs.
 *
 * Components register their Object3D on mount; `SimulationDriver` mutates
 * them directly, so animation never triggers a React render.
 */

export interface BodyEntry {
  object: THREE.Object3D
  /** Mesh carrying the body's own spin, separate from its orbital position. */
  spin?: THREE.Object3D
}

export const planetBodies = new Map<string, BodyEntry>()
export const moonBodies = new Map<string, BodyEntry>()

/** Live scene-space positions, refreshed each frame for cameras and satellites. */
export const planetPositions = new Map<string, THREE.Vector3>()

/** Live derived values per planet, read by the info panel at 1 Hz. */
export interface LiveState {
  /** Distance from the Sun right now, AU. */
  distanceAu: number
  /** Orbital speed right now, km/s. */
  velocityKms: number
  /** Rotation angle about the body's axis, degrees. */
  rotationDeg: number
  /** Sub-solar latitude — the seasonal indicator, degrees. */
  subSolarLatitude: number
}

export const liveState = new Map<string, LiveState>()

export function registerPlanet(id: string, entry: BodyEntry) {
  planetBodies.set(id, entry)
  planetPositions.set(id, new THREE.Vector3())
  return () => {
    planetBodies.delete(id)
    planetPositions.delete(id)
    liveState.delete(id)
  }
}

export function registerMoon(id: string, entry: BodyEntry) {
  moonBodies.set(id, entry)
  return () => void moonBodies.delete(id)
}

const DEG = Math.PI / 180

/**
 * Convert J2000 ecliptic coordinates to the scene's frame.
 * three.js is y-up, the ecliptic frame is z-up, so y and z swap.
 */
function toSceneSpace(target: THREE.Vector3, x: number, y: number, z: number, scale: number) {
  target.set(x * scale, z * scale, -y * scale)
}

/**
 * Rotation angle about a body's own axis at a given time.
 *
 * Uses the sidereal period — one turn relative to the stars — which is the
 * real rotation. A negative period means retrograde: Venus, Uranus and Pluto
 * genuinely spin the other way.
 */
export function rotationAngleAt(id: string, unixMs: number): number {
  const physical = PHYSICAL[id]
  if (!physical) return 0

  const periodDays = physical.siderealRotationHours / 24
  if (periodDays === 0) return 0
  return ((daysSinceJ2000(unixMs) / periodDays) % 1) * Math.PI * 2
}

const scratchPosition = new THREE.Vector3()

export interface SimulationOptions {
  distanceMode: DistanceMode
  sizeMode: SizeMode
}

/**
 * Place every registered body for the given instant.
 * Called once per frame by `SimulationDriver`.
 */
export function updateBodies(unixMs: number, options: SimulationOptions) {
  for (const [id, entry] of planetBodies) {
    const state = orbitalStateAt(id, unixMs)
    if (!state) continue

    // Remap the true distance while preserving the orbit's real shape.
    const sceneRadius = orbitDistance(id, state.r, state.a, options.distanceMode)
    const scale = sceneRadius / state.r

    toSceneSpace(scratchPosition, state.x, state.y, state.z, scale)
    entry.object.position.copy(scratchPosition)
    planetPositions.get(id)?.copy(scratchPosition)

    if (entry.spin) entry.spin.rotation.y = rotationAngleAt(id, unixMs)

    liveState.set(id, {
      distanceAu: state.r,
      velocityKms: orbitalVelocity(state.r, state.a),
      rotationDeg: (rotationAngleAt(id, unixMs) / DEG) % 360,
      // Where the Sun is directly overhead. Computed from the planet's real
      // pole orientation, so it tracks the equinoxes and solstices rather
      // than perihelion — the tilt causes seasons, not the distance.
      subSolarLatitude: subSolarLatitude(id, state),
    })
  }

  for (const [id, entry] of moonBodies) {
    const data = MOON_DATA[id]
    const period = MOON_PERIODS[id]
    if (!data || !period) continue

    const radius = moonOrbitRadius(
      data.distanceFromPlanet,
      data.parent,
      options.sizeMode,
      options.distanceMode,
    )
    const angle = (daysSinceJ2000(unixMs) / period) * Math.PI * 2

    entry.object.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)

    if (entry.spin) {
      // Tidally locked moons keep one face toward their planet, which is why
      // there is a permanent far side of the Moon.
      entry.spin.rotation.y = TIDALLY_LOCKED.has(id) ? -angle : angle * 0.5
    }
  }
}

/** Sun direction at a planet, used by the day/night shader. */
export function sunDirectionFor(id: string, target: THREE.Vector3): THREE.Vector3 {
  const position = planetPositions.get(id)
  if (!position) return target.set(1, 0, 0)
  return target.copy(position).negate().normalize()
}
