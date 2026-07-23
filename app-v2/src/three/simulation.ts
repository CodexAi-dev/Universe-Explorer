import * as THREE from 'three'

/**
 * Shared mutable registry of live scene objects.
 *
 * Orbital motion runs in a single `useFrame` (see `SimulationDriver`) rather
 * than one per body: components register their Object3D here on mount and the
 * driver mutates them directly, so animation never triggers a React render.
 */

export interface OrbitalBody {
  object: THREE.Object3D
  /** Current orbit angle in radians; advanced by the driver. */
  angle: number
  orbitRadius: number
  orbitSpeed: number
  rotationSpeed: number
}

export const planets = new Map<string, OrbitalBody>()
export const moons = new Map<string, OrbitalBody>()

/** World positions of planets, refreshed each frame for satellites to track. */
export const planetPositions = new Map<string, THREE.Vector3>()

export function registerPlanet(name: string, body: OrbitalBody) {
  planets.set(name, body)
  planetPositions.set(name, new THREE.Vector3())
  return () => {
    planets.delete(name)
    planetPositions.delete(name)
  }
}

export function registerMoon(name: string, body: OrbitalBody) {
  moons.set(name, body)
  return () => void moons.delete(name)
}

/** Randomised starting angle, as in v1. */
export const randomAngle = () => Math.random() * Math.PI * 2
