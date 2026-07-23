import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import type { MoonData } from '@/data/types'
import { PHYSICAL, TIDALLY_LOCKED } from '@/data/physical'
import { registerMoon } from '@/three/simulation'
import { bodyRadius, UNITS_PER_KM } from '@/three/scale'
import { useUniverseStore } from '@/store/useUniverseStore'
import { Label } from './Label'

interface MoonProps {
  id: string
  data: MoonData
}

/** The Moon is the one satellite with a real global map on hand. */
const MOON_TEXTURE: Record<string, string> = {
  moon: './textures/2k_moon.jpg',
}

export function Moon({ id, data }: MoonProps) {
  const orbitRef = useRef<THREE.Group>(null!)
  const spinRef = useRef<THREE.Group>(null!)

  const showMoons = useUniverseStore((s) => s.showMoons)
  const showLabels = useUniverseStore((s) => s.showLabels)
  const sizeMode = useUniverseStore((s) => s.sizeMode)
  const select = useUniverseStore((s) => s.select)
  const setHovered = useUniverseStore((s) => s.setHovered)

  const url = MOON_TEXTURE[id]
  const loaded = useTexture(url ? [url] : [])
  const map = loaded[0]

  useMemo(() => {
    if (map) {
      map.colorSpace = THREE.SRGBColorSpace
      map.anisotropy = 8
    }
  }, [map])

  /**
   * Moons are drawn at their true size relative to their parent planet, so
   * Ganymede reads as larger than Mercury and Charon as half of Pluto.
   */
  const radius = useMemo(() => {
    const trueRadiusKm = data.diameter / 2
    if (sizeMode === 'true') return trueRadiusKm * UNITS_PER_KM
    const parentRadius = bodyRadius(data.parent, sizeMode)
    return parentRadius * (trueRadiusKm / PHYSICAL[data.parent].radiusKm)
  }, [data.diameter, data.parent, sizeMode])

  useEffect(
    () => registerMoon(id, { object: orbitRef.current, spin: spinRef.current }),
    [id],
  )

  const labelScale = Math.max(radius * 3, 1.5)

  return (
    <group ref={orbitRef} visible={showMoons} name={id}>
      <group ref={spinRef}>
        <mesh
          userData={{ kind: 'moon', id }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
            setHovered({ name: id, x: e.clientX, y: e.clientY })
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default'
            setHovered(null)
          }}
          onClick={(e) => {
            e.stopPropagation()
            select({ kind: 'moon', id })
          }}
        >
          <sphereGeometry args={[radius, 32, 16]} />
          <meshStandardMaterial
            map={map}
            color={map ? undefined : data.color}
            roughness={0.95}
            metalness={0}
          />
        </mesh>
      </group>

      <Label
        text={TIDALLY_LOCKED.has(id) ? `${data.name} 🔒` : data.name}
        variant="moon"
        y={radius * 1.8}
        scale={[labelScale * 2, labelScale * 0.5]}
        visible={showMoons && showLabels}
      />
    </group>
  )
}
