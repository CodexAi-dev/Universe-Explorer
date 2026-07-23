import { useMemo } from 'react'
import * as THREE from 'three'
import { elementsAt } from '@/data/ephemeris'
import { COMPRESSED_ORBIT, AU_UNITS } from '@/three/scale'
import type { DistanceMode } from '@/three/scale'
import { useUniverseStore } from '@/store/useUniverseStore'

const SEGMENTS = 256
const DEG = Math.PI / 180

const PLANET_IDS = [
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
]

/**
 * True orbital ellipses, traced from the same Keplerian elements that place
 * the planets — so the paths show real eccentricity, inclination and
 * orientation rather than idealised circles.
 *
 * Mercury's 0.21 eccentricity and Pluto's 17° inclination are both plainly
 * visible, which is the point: textbook diagrams flatten both away.
 */
function buildOrbit(id: string, unixMs: number, mode: DistanceMode) {
  const el = elementsAt(id, unixMs)
  if (!el) return null

  const { a, e } = el
  const argPeri = (el.peri - el.node) * DEG
  const node = el.node * DEG
  const inc = el.i * DEG

  const cosPeri = Math.cos(argPeri)
  const sinPeri = Math.sin(argPeri)
  const cosNode = Math.cos(node)
  const sinNode = Math.sin(node)
  const cosInc = Math.cos(inc)
  const sinInc = Math.sin(inc)

  const compressed = COMPRESSED_ORBIT[id] ?? a * AU_UNITS
  const points: THREE.Vector3[] = []

  for (let i = 0; i <= SEGMENTS; i++) {
    // Sweep eccentric anomaly for even spacing along the ellipse.
    const E = (i / SEGMENTS) * Math.PI * 2
    const xPerifocal = a * (Math.cos(E) - e)
    const yPerifocal = a * Math.sqrt(1 - e * e) * Math.sin(E)
    const r = Math.hypot(xPerifocal, yPerifocal)

    const xOrbital = cosPeri * xPerifocal - sinPeri * yPerifocal
    const yOrbital = sinPeri * xPerifocal + cosPeri * yPerifocal

    const x = cosNode * xOrbital - sinNode * yOrbital * cosInc
    const y = sinNode * xOrbital + cosNode * yOrbital * cosInc
    const z = yOrbital * sinInc

    // Same remap the planets use, so path and body always agree.
    const scale = (mode === 'true' ? r * AU_UNITS : compressed * (r / a)) / r

    // Ecliptic (z-up) → scene (y-up).
    points.push(new THREE.Vector3(x * scale, z * scale, -y * scale))
  }

  return new THREE.BufferGeometry().setFromPoints(points)
}

/** Warmer for the inner planets, cooler for the outer — a subtle depth cue. */
const ORBIT_COLOR: Record<string, number> = {
  mercury: 0x9a8b7a,
  venus: 0xc9a86a,
  earth: 0x5b8fd6,
  mars: 0xb5603a,
  jupiter: 0xb09a72,
  saturn: 0xc4ab72,
  uranus: 0x6fa8bd,
  neptune: 0x5568c4,
  pluto: 0x8a7f95,
}

export function Orbits() {
  const showOrbits = useUniverseStore((s) => s.showOrbits)
  const showPluto = useUniverseStore((s) => s.showPluto)
  const distanceMode = useUniverseStore((s) => s.distanceMode)
  const simulationTime = useUniverseStore((s) => s.simulationTime)

  // Elements drift slowly; recomputing per decade of simulated time is ample.
  const epoch = Math.round(simulationTime / (10 * 365.25 * 86_400_000))

  const orbits = useMemo(
    () =>
      PLANET_IDS.map((id) => ({
        id,
        geometry: buildOrbit(id, epoch * 10 * 365.25 * 86_400_000, distanceMode),
      })).filter((o): o is { id: string; geometry: THREE.BufferGeometry } => !!o.geometry),
    [epoch, distanceMode],
  )

  return (
    <group visible={showOrbits}>
      {orbits.map((o) => (
        <line
          key={o.id}
          // @ts-expect-error — R3F maps `line` to THREE.Line; the JSX intrinsic
          // collides with the SVG `line` element's prop types.
          geometry={o.geometry}
          visible={o.id !== 'pluto' || showPluto}
        >
          <lineBasicMaterial
            color={ORBIT_COLOR[o.id] ?? 0x444466}
            transparent
            opacity={0.45}
          />
        </line>
      ))}
    </group>
  )
}
