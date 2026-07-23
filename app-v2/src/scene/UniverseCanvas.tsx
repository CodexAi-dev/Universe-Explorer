import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { PLANET_DATA } from '@/data/planets'
import { AU_UNITS } from '@/three/scale'
import { useUniverseStore } from '@/store/useUniverseStore'
import { CameraRig } from './CameraRig'
import { DebugBridge } from './DebugBridge'
import { SimulationDriver } from './SimulationDriver'
import { Skybox } from './Skybox'
import { StarField } from './StarField'
import { Sun } from './Sun'
import { Planet } from './Planet'
import { Orbits } from './Orbits'
import { AsteroidBelt } from './AsteroidBelt'
import { BlackHoles, Galaxies, Nebulae } from './deepspace/DeepSpace'
import { CosmicDust, MilkyWay } from './deepspace/MilkyWay'
import {
  AlienShips,
  Comets,
  Meteors,
  SpaceDebris,
  Satellites,
} from './objects/SpaceObjects'

/** Planets in orbital order; Pluto is present but hidden unless enabled. */
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
 * Lighting is deliberately spare: in space there is one source and no fill.
 * The faint ambient term stands in for starlight and zodiacal light, so night
 * sides read as dark rather than pure black.
 *
 * Falloff is a real trade-off. True inverse-square is correct — Neptune
 * receives about 1/900th of Earth's sunlight — but it leaves the outer
 * planets too dark to study. The gentler default keeps them legible while
 * still dimming outward; the exact figure is reported in the info panel
 * either way, so the physics is taught even when the render is compromised.
 */
function Lights() {
  const quality = useUniverseStore((s) => s.quality)
  const realisticLight = useUniverseStore((s) => s.realisticLight)
  const castShadow = quality === 'high' || quality === 'ultra'

  // Normalised so Earth's orbit receives roughly unit illumination either way.
  const decay = realisticLight ? 2 : 0.4
  const intensity = realisticLight ? 3.2 * AU_UNITS ** 2 : 3.4 * AU_UNITS ** 0.4

  return (
    <>
      <ambientLight color={0x2a2a3a} intensity={realisticLight ? 0.04 : 0.1} />
      <pointLight
        color={0xfff5e8}
        intensity={intensity}
        decay={decay}
        distance={0}
        position={[0, 0, 0]}
        castShadow={castShadow}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={4000}
      />
    </>
  )
}

function Scene() {
  const select = useUniverseStore((s) => s.select)

  return (
    <>
      <Lights />
      <CameraRig />
      <SimulationDriver />
      <DebugBridge />

      <Skybox />
      <StarField />
      <Sun />
      {PLANET_IDS.map((id) => (
        <Planet key={id} id={id} data={PLANET_DATA[id]} />
      ))}
      <Orbits />
      <AsteroidBelt />

      <MilkyWay />
      <Galaxies />
      <Nebulae />
      <BlackHoles />
      <CosmicDust />

      <Satellites />
      <AlienShips />
      <Comets />
      <Meteors />
      <SpaceDebris />

      {/* Clicking empty space clears the selection. */}
      <mesh onClick={() => select(null)} visible={false}>
        <sphereGeometry args={[100000, 4, 4]} />
        <meshBasicMaterial side={THREE.BackSide} />
      </mesh>
    </>
  )
}

function Effects() {
  const quality = useUniverseStore((s) => s.quality)
  if (quality === 'low') return null

  return (
    <EffectComposer>
      <Bloom intensity={0.8} radius={0.4} luminanceThreshold={0.85} mipmapBlur />
    </EffectComposer>
  )
}

export function UniverseCanvas() {
  const quality = useUniverseStore((s) => s.quality)

  const gl = useMemo(
    () => ({
      antialias: quality !== 'low',
      alpha: true,
      powerPreference: 'default' as const,
      failIfMajorPerformanceCaveat: false,
    }),
    [quality],
  )

  return (
    <Canvas
      className="absolute inset-0"
      // Cap DPR at 2 — beyond that the pixel cost outweighs the visible gain.
      dpr={[1, 2]}
      gl={gl}
      camera={{ fov: 60, near: 0.1, far: 10000, position: [100, 80, 200] }}
      shadows={quality === 'high' || quality === 'ultra'}
      onCreated={({ scene, gl: renderer }) => {
        scene.background = new THREE.Color(0x000005)
        scene.fog = new THREE.FogExp2(0x000010, 0.00008)
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.0
      }}
    >
      <Suspense fallback={null}>
        <Scene />
        <Effects />
      </Suspense>
    </Canvas>
  )
}
