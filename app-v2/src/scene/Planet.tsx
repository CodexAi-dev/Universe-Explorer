import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { MOON_DATA, PLANET_DATA } from '@/data/planets'
import { PHYSICAL } from '@/data/physical'
import type { PlanetData } from '@/data/types'
import { planetTexture, surfaceTexture } from '@/three/textures'
import { registerPlanet, sunDirectionFor } from '@/three/simulation'
import { bodyRadius } from '@/three/scale'
import { useUniverseStore } from '@/store/useUniverseStore'
import { Label } from './Label'
import { Moon } from './Moon'
import { Atmosphere, EarthSurfaceMaterial } from './materials/EarthMaterial'
import { SaturnRings, UranusRings } from './Rings'

/** Sphere tessellation per quality tier. */
const SEGMENTS = { low: 24, medium: 40, high: 64, ultra: 96 } as const

/**
 * Real observational maps. Pluto keeps its procedural texture — the only
 * global New Horizons mosaics available are non-redistributable, and a
 * fabricated map would undercut the point of the exercise.
 */
const TEXTURE_URL: Record<string, string> = {
  mercury: './textures/2k_mercury.jpg',
  venus: './textures/2k_venus_surface.jpg',
  mars: './textures/2k_mars.jpg',
  jupiter: './textures/2k_jupiter.jpg',
  saturn: './textures/2k_saturn.jpg',
  uranus: './textures/2k_uranus.jpg',
  neptune: './textures/2k_neptune.jpg',
}

/** Roughness/metalness tuned per body type, not per-planet guesswork. */
function surfaceResponse(id: string) {
  const physical = PHYSICAL[id]
  // Gas and ice giants read as soft cloud decks; rocky bodies are matte dust.
  const gaseous = ['jupiter', 'saturn', 'uranus', 'neptune'].includes(id)
  return {
    roughness: gaseous ? 0.72 : 0.92,
    metalness: 0.0,
    // Bright, highly reflective bodies (Venus, Enceladus-like ices) need less
    // ambient lift than dark ones (Mercury reflects under 9% of what hits it).
    ambient: 0.035 + (1 - (physical?.albedo ?? 0.3)) * 0.03,
  }
}

/** Bodies whose real texture we have; others fall back to procedural. */
function useBodyTexture(id: string, inSurfaceView: boolean) {
  const url = TEXTURE_URL[id]
  const real = useTexture(url ? [url] : [])

  return useMemo(() => {
    if (inSurfaceView) {
      const detailed = surfaceTexture(id)
      if (detailed) return detailed
    }
    if (real.length > 0) {
      const texture = real[0]
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 8
      return texture
    }
    return planetTexture(id, PLANET_DATA[id])
  }, [id, inSurfaceView, real])
}

interface PlanetProps {
  id: string
  data: PlanetData
}

export function Planet({ id, data }: PlanetProps) {
  const orbitGroup = useRef<THREE.Group>(null!)
  const spinGroup = useRef<THREE.Group>(null!)
  const cloudRef = useRef<THREE.Mesh>(null!)

  const quality = useUniverseStore((s) => s.quality)
  const sizeMode = useUniverseStore((s) => s.sizeMode)
  const showLabels = useUniverseStore((s) => s.showLabels)
  const showPluto = useUniverseStore((s) => s.showPluto)
  const showClouds = useUniverseStore((s) => s.showClouds)
  const showAtmospheres = useUniverseStore((s) => s.showAtmospheres)
  const surfaceViewPlanet = useUniverseStore((s) => s.surfaceViewPlanet)
  const select = useUniverseStore((s) => s.select)
  const focusPlanet = useUniverseStore((s) => s.focusPlanet)
  const setHovered = useUniverseStore((s) => s.setHovered)

  const physical = PHYSICAL[id]
  const radius = bodyRadius(id, sizeMode)
  const segments = SEGMENTS[quality]
  const inSurfaceView = surfaceViewPlanet === id

  const map = useBodyTexture(id, inSurfaceView)
  const response = surfaceResponse(id)

  // Live Sun direction, in this planet's local (tilted) frame.
  const sunDirection = useMemo(() => new THREE.Vector3(1, 0, 0), [])
  const worldSun = useMemo(() => new THREE.Vector3(), [])

  const moons = useMemo(
    () => Object.entries(MOON_DATA).filter(([, m]) => m.parent === id),
    [id],
  )

  useEffect(
    () => registerPlanet(id, { object: orbitGroup.current, spin: spinGroup.current }),
    [id],
  )

  useFrame(() => {
    sunDirectionFor(id, worldSun)
    // Undo the tilt+spin so the shader sees the Sun in texture space.
    sunDirection.copy(worldSun)
    spinGroup.current?.worldToLocal(
      sunDirection.add(orbitGroup.current.position),
    )
    sunDirection.normalize()

    // Venus's clouds superrotate: they lap the solid planet every ~4 days
    // while the surface takes 243. Earth's drift far more gently.
    if (cloudRef.current) {
      cloudRef.current.rotation.y += id === 'venus' ? 0.0018 : 0.00022
    }
  })

  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
    setHovered({ name: id, x: e.clientX, y: e.clientY })
  }

  const onPointerOut = () => {
    document.body.style.cursor = 'default'
    setHovered(null)
  }

  const isEarth = id === 'earth'
  const hasClouds = isEarth || id === 'venus'

  return (
    <group ref={orbitGroup} name={id} visible={id !== 'pluto' || showPluto}>
      {/*
        Obliquity is applied outside the spin group so the axis stays fixed in
        space as the planet turns — that fixed tilt is what produces seasons.
        Uranus's 97.8° puts its poles nearly in the orbital plane.
      */}
      <group rotation={[0, 0, THREE.MathUtils.degToRad(physical?.obliquityDeg ?? 0)]}>
        <group ref={spinGroup}>
          <mesh
            userData={{ kind: 'planet', id }}
            castShadow={quality === 'high' || quality === 'ultra'}
            receiveShadow={quality === 'high' || quality === 'ultra'}
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
            <sphereGeometry args={[radius, segments, segments / 2]} />
            {isEarth ? (
              <EarthSurfaceMaterial sunDirection={sunDirection} />
            ) : (
              <meshStandardMaterial
                map={map}
                roughness={response.roughness}
                metalness={response.metalness}
                emissive={new THREE.Color(0x222233)}
                emissiveIntensity={response.ambient}
              />
            )}
          </mesh>

          {hasClouds && showClouds && (
            <mesh ref={cloudRef} scale={radius * 1.012}>
              <sphereGeometry args={[1, segments, segments / 2]} />
              <CloudMaterial id={id} />
            </mesh>
          )}
        </group>

        {id === 'saturn' && <SaturnRings radius={radius} segments={segments} />}
        {id === 'uranus' && <UranusRings radius={radius} />}
      </group>

      {physical?.hasAtmosphere && showAtmospheres && !inSurfaceView && (
        <Atmosphere
          radius={radius * 1.035}
          color={ATMOSPHERE_COLOR[id] ?? 0x88bbff}
          sunDirection={worldSun}
          intensity={ATMOSPHERE_INTENSITY[id] ?? 0.7}
          segments={Math.max(24, segments / 2)}
        />
      )}

      {moons.map(([moonId, moonData]) => (
        <Moon key={moonId} id={moonId} data={moonData} />
      ))}

      <Label
        text={data.name}
        y={radius * 1.45}
        scale={[10, 2.5]}
        visible={showLabels}
      />
    </group>
  )
}

/** Rim colours reflect what each atmosphere actually scatters. */
const ATMOSPHERE_COLOR: Record<string, number> = {
  venus: 0xe8d9a0, // thick CO₂ haze, pale yellow
  earth: 0x6ba8ff, // Rayleigh scattering, blue
  mars: 0xd88a5a, // thin and dusty, butterscotch
  jupiter: 0xe0c9a0,
  saturn: 0xf0dcae,
  uranus: 0x9fe3f0, // methane absorbs red
  neptune: 0x6f8fff,
  pluto: 0x9aa8c0,
}

const ATMOSPHERE_INTENSITY: Record<string, number> = {
  venus: 1.5, // 92 bar — by far the densest of the rocky planets
  earth: 1.0,
  mars: 0.35, // 0.6% of Earth's pressure
  jupiter: 0.55,
  saturn: 0.5,
  uranus: 0.6,
  neptune: 0.6,
  pluto: 0.25,
}

function CloudMaterial({ id }: { id: string }) {
  const url =
    id === 'venus' ? './textures/2k_venus_atmosphere.jpg' : './textures/2k_earth_clouds.jpg'
  const texture = useTexture(url)

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
  }, [texture])

  return (
    <meshStandardMaterial
      map={texture}
      // The cloud maps are greyscale-on-black, so the map doubles as its own
      // opacity mask — bright cloud stays, black sky drops out.
      alphaMap={texture}
      transparent
      opacity={id === 'venus' ? 0.95 : 0.75}
      depthWrite={false}
      roughness={1}
    />
  )
}
