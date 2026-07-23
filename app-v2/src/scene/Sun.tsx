import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { PLANET_DATA } from '@/data/planets'
import { createSolarProminence, createRealisticSunTexture } from '@/three/builders/sun'
import { createSunGlowTexture } from '@/three/builders/glows'
import { surfaceTexture } from '@/three/textures'
import { useUniverseStore, universeState } from '@/store/useUniverseStore'

const SUN = PLANET_DATA.sun

/** Layered additive sprites, matching v1's `createEnhancedSunGlow`. */
const GLOW_LAYERS: Array<{ intensity: number; inner: string; outer: string; scale: number }> = [
  { intensity: 0.8, inner: '#ffffee', outer: '#ffaa00', scale: 50 },
  { intensity: 0.5, inner: '#ffcc44', outer: '#ff6600', scale: 80 },
  { intensity: 0.25, inner: '#ff8844', outer: '#ff2200', scale: 120 },
]

/** Corona streamers + prominences, built once as a plain Object3D. */
function useCorona() {
  return useMemo(() => {
    const group = new THREE.Group()
    group.name = 'corona'

    for (let layer = 0; layer < 3; layer++) {
      const streamerCount = 24 - layer * 6
      for (let i = 0; i < streamerCount; i++) {
        const angle = (i / streamerCount) * Math.PI * 2 + layer * 0.2
        const length = (Math.random() * 8 + 4) * (1 - layer * 0.2)
        const width = Math.random() * 0.5 + 0.2

        const points: THREE.Vector3[] = []
        for (let j = 0; j <= 20; j++) {
          const t = j / 20
          const r = SUN.size + t * length
          const wobble = Math.sin(t * Math.PI * 3) * (1 - t) * 0.5
          points.push(
            new THREE.Vector3(
              Math.cos(angle + wobble * 0.1) * r,
              Math.sin(angle + wobble * 0.1) * r,
              wobble,
            ),
          )
        }

        const curve = new THREE.CatmullRomCurve3(points)
        const geometry = new THREE.TubeGeometry(curve, 20, width * (1 - layer * 0.3), 8, false)
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.1, 0.8, 0.7 - layer * 0.15),
          transparent: true,
          opacity: 0.3 - layer * 0.08,
          blending: THREE.AdditiveBlending,
        })
        group.add(new THREE.Mesh(geometry, material))
      }
    }

    for (let i = 0; i < 5; i++) {
      group.add(createSolarProminence(Math.random() * Math.PI * 2))
    }

    return group
  }, [])
}

/** Radially streaming particles reset once they pass 150 units out. */
function SolarWind() {
  const ref = useRef<THREE.Points>(null!)

  const { geometry, velocities } = useMemo(() => {
    const count = 2000
    const positions = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = SUN.size + Math.random() * 100

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      vel[i * 3] = positions[i * 3] * 0.01
      vel[i * 3 + 1] = positions[i * 3 + 1] * 0.01
      vel[i * 3 + 2] = positions[i * 3 + 2] * 0.01

      colors[i * 3] = 1.0
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.3
      colors[i * 3 + 2] = 0.2 + Math.random() * 0.3
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return { geometry: geo, velocities: vel }
  }, [])

  useFrame((_, delta) => {
    if (!universeState().isPlaying) return
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const p = attr.array as Float32Array

    for (let i = 0; i < p.length / 3; i++) {
      p[i * 3] += velocities[i * 3] * delta * 50
      p[i * 3 + 1] += velocities[i * 3 + 1] * delta * 50
      p[i * 3 + 2] += velocities[i * 3 + 2] * delta * 50

      const dist = Math.hypot(p[i * 3], p[i * 3 + 1], p[i * 3 + 2])
      if (dist > 150) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const r = SUN.size + Math.random() * 5
        p[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        p[i * 3 + 2] = r * Math.cos(phi)
      }
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.5}
        vertexColors
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

export function Sun() {
  const sunRef = useRef<THREE.Mesh>(null!)
  const corona = useCorona()

  const select = useUniverseStore((s) => s.select)
  const focusPlanet = useUniverseStore((s) => s.focusPlanet)
  const setHovered = useUniverseStore((s) => s.setHovered)
  const inSurfaceView = useUniverseStore((s) => s.surfaceViewPlanet === 'sun')

  const map = useMemo(
    () => (inSurfaceView ? (surfaceTexture('sun') ?? createRealisticSunTexture()) : createRealisticSunTexture()),
    [inSurfaceView],
  )

  const glows = useMemo(
    () =>
      GLOW_LAYERS.map((l) => ({
        ...l,
        map: createSunGlowTexture(l.intensity, l.inner, l.outer),
      })),
    [],
  )

  useFrame((_, delta) => {
    const { isPlaying, timeSpeed } = universeState()
    if (!isPlaying) return
    // v1 advanced these per-frame; scaling by delta*60 keeps the same visual
    // rate while making it independent of the display refresh rate.
    const step = delta * 60
    sunRef.current.rotation.y += 0.001 * timeSpeed * step
    corona.rotation.z += 0.0002 * timeSpeed * step
  })

  return (
    <>
      <mesh
        ref={sunRef}
        name="sun"
        userData={{ kind: 'planet', id: 'sun' }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
          setHovered({ name: 'sun', x: e.clientX, y: e.clientY })
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default'
          setHovered(null)
        }}
        onClick={(e) => {
          e.stopPropagation()
          select({ kind: 'planet', id: 'sun' })
        }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          focusPlanet('sun')
        }}
      >
        <sphereGeometry args={[SUN.size, 128, 128]} />
        <meshBasicMaterial map={map} />

        {glows.map((g, i) => (
          <sprite key={i} scale={[g.scale, g.scale, 1]}>
            <spriteMaterial
              map={g.map}
              transparent
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>
        ))}

        <primitive object={corona} />
      </mesh>

      <SolarWind />
    </>
  )
}
