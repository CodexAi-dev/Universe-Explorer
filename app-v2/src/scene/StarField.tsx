import { useMemo } from 'react'
import * as THREE from 'three'
import { useUniverseStore } from '@/store/useUniverseStore'

/** Stellar classes sampled for star colour, as in v1's `createStarLayer`. */
const STAR_COLORS = [
  { r: 1.0, g: 0.9, b: 0.8 }, // white/yellow, Sun-like
  { r: 0.8, g: 0.9, b: 1.0 }, // blue-white, hot
  { r: 1.0, g: 0.7, b: 0.5 }, // orange, cooler
  { r: 1.0, g: 0.5, b: 0.4 }, // red, cool
  { r: 0.9, g: 0.95, b: 1.0 }, // pale blue
]

function buildStarLayer(count: number, minRadius: number, maxRadius: number, size: number) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = minRadius + Math.random() * (maxRadius - minRadius)

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    const c = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
    const variation = 0.9 + Math.random() * 0.2
    colors[i * 3] = c.r * variation
    colors[i * 3 + 1] = c.g * variation
    colors[i * 3 + 2] = c.b * variation

    sizes[i] = Math.random() < 0.02 ? size * 3 : size * (0.5 + Math.random())
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  return geometry
}

function buildDistantGalaxies() {
  const count = 500
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = 2500 + Math.random() * 2000

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    colors[i * 3] = 0.7 + Math.random() * 0.3
    colors[i * 3 + 1] = 0.6 + Math.random() * 0.3
    colors[i * 3 + 2] = 0.8 + Math.random() * 0.2
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geometry
}

/** Star counts per quality tier — v1 always built 35,000. */
const LAYER_COUNTS = {
  low: [1500, 3000, 6000],
  medium: [5000, 10000, 20000],
  high: [5000, 10000, 20000],
  ultra: [8000, 16000, 32000],
} as const

const LAYERS = [
  { min: 600, max: 900, size: 2.0, opacity: 1.0 },
  { min: 900, max: 1500, size: 1.5, opacity: 0.8 },
  { min: 1500, max: 3000, size: 1.0, opacity: 0.6 },
]

/** Three parallax shells of stars plus a far shell of galaxy specks. */
export function StarField() {
  const showStars = useUniverseStore((s) => s.showStars)
  const quality = useUniverseStore((s) => s.quality)

  const layers = useMemo(
    () =>
      LAYERS.map((l, i) => ({
        ...l,
        geometry: buildStarLayer(LAYER_COUNTS[quality][i], l.min, l.max, l.size),
      })),
    [quality],
  )

  const distantGalaxies = useMemo(buildDistantGalaxies, [])

  return (
    <group visible={showStars}>
      {layers.map((l, i) => (
        <points key={i} geometry={l.geometry}>
          <pointsMaterial
            size={l.size}
            vertexColors
            transparent
            opacity={l.opacity}
            sizeAttenuation={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}

      <points geometry={distantGalaxies}>
        <pointsMaterial
          size={3}
          vertexColors
          transparent
          opacity={0.5}
          sizeAttenuation={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
