import { useMemo } from 'react'
import * as THREE from 'three'
import { PLANET_DATA } from '@/data/planets'
import { useUniverseStore } from '@/store/useUniverseStore'

const SEGMENTS = 128

/** One closed ring line per orbiting body, tilted by orbital inclination. */
export function Orbits() {
  const showOrbits = useUniverseStore((s) => s.showOrbits)
  const showPluto = useUniverseStore((s) => s.showPluto)

  const orbits = useMemo(
    () =>
      Object.entries(PLANET_DATA)
        .filter(([, d]) => d.orbitRadius)
        .map(([id, d]) => {
          const points: THREE.Vector3[] = []
          for (let i = 0; i <= SEGMENTS; i++) {
            const angle = (i / SEGMENTS) * Math.PI * 2
            points.push(
              new THREE.Vector3(
                Math.cos(angle) * d.orbitRadius!,
                0,
                Math.sin(angle) * d.orbitRadius!,
              ),
            )
          }
          return {
            id,
            geometry: new THREE.BufferGeometry().setFromPoints(points),
            inclination: THREE.MathUtils.degToRad(d.orbitalInclination),
          }
        }),
    [],
  )

  return (
    <group visible={showOrbits}>
      {orbits.map((o) => (
        <line
          key={o.id}
          // @ts-expect-error — R3F maps `line` to THREE.Line; the JSX intrinsic
          // collides with the SVG `line` element's prop types.
          geometry={o.geometry}
          rotation={[o.inclination, 0, 0]}
          visible={o.id !== 'pluto' || showPluto}
        >
          <lineBasicMaterial color={0x444466} transparent opacity={0.4} />
        </line>
      ))}
    </group>
  )
}
