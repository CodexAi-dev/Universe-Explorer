import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { createSunGlowTexture } from '@/three/builders/glows'
import { pointSprite } from '@/three/pointSprite'
import { rotationAngleAt } from '@/three/simulation'
import { bodyRadius } from '@/three/scale'
import { useUniverseStore, universeState } from '@/store/useUniverseStore'

/**
 * Layered additive halo, sized in multiples of the drawn solar radius.
 *
 * Kept tight deliberately: the corona is only a couple of solar radii across
 * in visible light, and a wide halo swallows the inner planets whenever the
 * camera flies inside it.
 */
const GLOW_LAYERS = [
  { intensity: 0.55, inner: '#ffffee', outer: '#ffaa00', scale: 1.45, opacity: 0.85 },
  { intensity: 0.32, inner: '#ffcc44', outer: '#ff7700', scale: 2.1, opacity: 0.5 },
  { intensity: 0.16, inner: '#ff9955', outer: '#ff3300', scale: 3.0, opacity: 0.28 },
]

/**
 * Radially streaming particles — the solar wind, which really does blow past
 * Earth at 400–750 km/s and drives comet ion tails away from the Sun.
 */
function SolarWind({ radius }: { radius: number }) {
  const ref = useRef<THREE.Points>(null!)
  const reach = radius * 7.5

  const { geometry, velocities } = useMemo(() => {
    const count = 2000
    const positions = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius + Math.random() * reach

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
  }, [radius, reach])

  useFrame((_, rawDelta) => {
    if (!universeState().isPlaying) return
    const delta = Math.min(rawDelta, 0.1)
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute
    const p = attr.array as Float32Array
    const limit = radius + reach

    for (let i = 0; i < p.length / 3; i++) {
      p[i * 3] += velocities[i * 3] * delta * 50
      p[i * 3 + 1] += velocities[i * 3 + 1] * delta * 50
      p[i * 3 + 2] += velocities[i * 3 + 2] * delta * 50

      if (Math.hypot(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]) > limit) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const r = radius * 1.02
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
        size={radius * 0.05}
        map={pointSprite()}
        alphaMap={pointSprite()}
        vertexColors
        transparent
        opacity={0.22}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

export function Sun() {
  const spinRef = useRef<THREE.Mesh>(null!)

  const sizeMode = useUniverseStore((s) => s.sizeMode)
  const quality = useUniverseStore((s) => s.quality)
  const select = useUniverseStore((s) => s.select)
  const focusPlanet = useUniverseStore((s) => s.focusPlanet)
  const setHovered = useUniverseStore((s) => s.setHovered)

  const radius = bodyRadius('sun', sizeMode)
  const segments = quality === 'low' ? 32 : quality === 'ultra' ? 128 : 64

  const map = useTexture('./textures/2k_sun.jpg')
  useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 8
  }, [map])

  const glows = useMemo(
    () =>
      GLOW_LAYERS.map((l) => ({
        ...l,
        map: createSunGlowTexture(l.intensity, l.inner, l.outer),
      })),
    [],
  )

  useFrame(() => {
    // The Sun's equator turns once every 25.4 days — it is not a solid body,
    // so the poles take about 34. This uses the equatorial rate.
    spinRef.current.rotation.y = rotationAngleAt('sun', universeState().simulationTime)
  })

  return (
    <group name="sun">
      <mesh
        ref={spinRef}
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
        <sphereGeometry args={[radius, segments, segments / 2]} />
        {/* Unlit: the Sun emits rather than reflects. */}
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>

      {glows.map((g, i) => (
        <sprite key={i} scale={[radius * g.scale, radius * g.scale, 1]}>
          <spriteMaterial
            map={g.map}
            transparent
            opacity={g.opacity}
            blending={THREE.AdditiveBlending}
            // Depth-tested but not depth-writing, so a planet transiting in
            // front of the Sun correctly occludes the halo behind it.
            depthWrite={false}
          />
        </sprite>
      ))}

      <SolarWind radius={radius} />
    </group>
  )
}
