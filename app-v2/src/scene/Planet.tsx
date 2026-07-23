import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { MOON_DATA } from '@/data/planets'
import type { PlanetData } from '@/data/types'
import { planetTexture, ringTexture, surfaceTexture } from '@/three/textures'
import { randomAngle, registerPlanet } from '@/three/simulation'
import { useUniverseStore } from '@/store/useUniverseStore'
import { Label } from './Label'
import { Moon } from './Moon'

interface PlanetProps {
  id: string
  data: PlanetData
}

/** Sphere tessellation per quality tier, matching v1's `createPlanet`. */
const SEGMENTS = { low: 24, medium: 32, high: 48, ultra: 64 } as const

export function Planet({ id, data }: PlanetProps) {
  const ref = useRef<THREE.Group>(null!)

  const quality = useUniverseStore((s) => s.quality)
  const showLabels = useUniverseStore((s) => s.showLabels)
  const showPluto = useUniverseStore((s) => s.showPluto)
  const surfaceViewPlanet = useUniverseStore((s) => s.surfaceViewPlanet)
  const select = useUniverseStore((s) => s.select)
  const focusPlanet = useUniverseStore((s) => s.focusPlanet)
  const setHovered = useUniverseStore((s) => s.setHovered)

  const segments = SEGMENTS[quality]
  const inSurfaceView = surfaceViewPlanet === id

  // Surface View swaps in the 2048² texture; normal zoom uses the 512×256 one.
  const map = useMemo(
    () => (inSurfaceView ? (surfaceTexture(id) ?? planetTexture(id, data)) : planetTexture(id, data)),
    [id, data, inSurfaceView],
  )

  const moons = useMemo(
    () => Object.entries(MOON_DATA).filter(([, m]) => m.parent === id),
    [id],
  )

  useEffect(() => {
    const angle = randomAngle()
    ref.current.position.set(
      Math.cos(angle) * data.orbitRadius!,
      0,
      Math.sin(angle) * data.orbitRadius!,
    )
    return registerPlanet(id, {
      object: ref.current,
      angle,
      orbitRadius: data.orbitRadius!,
      orbitSpeed: data.orbitSpeed!,
      rotationSpeed: data.rotationSpeed!,
    })
  }, [id, data.orbitRadius, data.orbitSpeed, data.rotationSpeed])

  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    setHovered({ name: id, x: e.clientX, y: e.clientY })
  }

  const onPointerOut = () => {
    document.body.style.cursor = 'default'
    setHovered(null)
  }

  const ringMap = data.hasRings ? ringTexture(id) : null

  /**
   * RingGeometry's default UVs are square-projected, which smears a band
   * texture. Remap u to normalised radius so bands run concentrically.
   */
  const ringGeometry = useMemo(() => {
    if (!data.hasRings) return null
    const inner = data.size * 1.4
    const outer = data.size * 2.4
    const geometry = new THREE.RingGeometry(inner, outer, 64)
    const pos = geometry.attributes.position
    const uv = geometry.attributes.uv
    for (let i = 0; i < pos.count; i++) {
      const dist = Math.hypot(pos.getX(i), pos.getY(i))
      uv.setXY(i, (dist - inner) / (outer - inner), 0.5)
    }
    return geometry
  }, [data.hasRings, data.size])

  return (
    <group ref={ref} name={id} visible={id !== 'pluto' || showPluto}>
      {/* Axial tilt applies to the body and its rings, not the orbit. */}
      <group rotation={[0, 0, THREE.MathUtils.degToRad(data.axialTilt)]}>
        <mesh
          userData={{ kind: 'planet', id }}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          onClick={(e) => {
            e.stopPropagation()
            select({ kind: 'planet', id })
          }}
          onDoubleClick={(e) => {
            e.stopPropagation()
            focusPlanet(id)
          }}
        >
          <sphereGeometry args={[data.size, segments, segments]} />
          <meshStandardMaterial
            map={map}
            roughness={0.8}
            metalness={0.1}
            {...(inSurfaceView ? { bumpMap: map, bumpScale: 0.02 } : {})}
          />
        </mesh>

        {data.atmosphere && (
          <mesh>
            <sphereGeometry args={[data.size * 1.05, 32, 32]} />
            <meshBasicMaterial
              color={data.atmosphereColor}
              transparent
              opacity={0.2}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {ringMap && ringGeometry && (
          <mesh
            geometry={ringGeometry}
            rotation={[Math.PI / 2, id === 'uranus' ? Math.PI / 2 : 0, 0]}
          >
            <meshBasicMaterial
              map={ringMap}
              side={THREE.DoubleSide}
              transparent
              opacity={id === 'saturn' ? 0.9 : 0.4}
            />
          </mesh>
        )}
      </group>

      {moons.map(([moonId, moonData]) => (
        <Moon key={moonId} id={moonId} data={moonData} />
      ))}

      <Label text={data.name} y={data.size + 3} scale={[10, 2.5]} visible={showLabels} />
    </group>
  )
}
