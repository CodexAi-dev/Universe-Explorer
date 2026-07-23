import { useMemo } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { PHYSICAL } from '@/data/physical'

/**
 * Ring geometry with radial UVs.
 *
 * RingGeometry's default UVs are square-projected, which smears a band
 * texture across the disc. Remapping u to normalised radius makes the bands
 * run concentrically, the way real ring structure does.
 */
function useRadialRing(inner: number, outer: number, segments = 128) {
  return useMemo(() => {
    const geometry = new THREE.RingGeometry(inner, outer, segments, 8)
    const pos = geometry.attributes.position
    const uv = geometry.attributes.uv

    for (let i = 0; i < pos.count; i++) {
      const distance = Math.hypot(pos.getX(i), pos.getY(i))
      uv.setXY(i, (distance - inner) / (outer - inner), 0.5)
    }

    return geometry
  }, [inner, outer, segments])
}

/**
 * Saturn's rings, at their measured radii.
 *
 * Real distances from Saturn's centre (km):
 *   D ring    66,900 – 74,510
 *   C ring    74,658 – 92,000
 *   B ring    92,000 – 117,580
 *   Cassini  117,580 – 122,170   (the visible gap)
 *   A ring   122,170 – 136,775
 *   F ring      ~140,180
 *
 * Against a 60,268 km equatorial radius that puts the inner edge at 1.11
 * planet radii and the outer edge of the A ring at 2.27 — which is why the
 * rings look so tight to the planet compared with most illustrations.
 */
const SATURN_RADIUS_KM = PHYSICAL.saturn.radiusKm
const SATURN_RING_INNER = 74_658 / SATURN_RADIUS_KM // C ring inner edge
const SATURN_RING_OUTER = 136_775 / SATURN_RADIUS_KM // A ring outer edge

interface SaturnRingsProps {
  radius: number
  segments: number
}

export function SaturnRings({ radius, segments }: SaturnRingsProps) {
  const inner = radius * SATURN_RING_INNER
  const outer = radius * SATURN_RING_OUTER
  const geometry = useRadialRing(inner, outer, Math.max(128, segments * 2))

  const texture = useTexture('./textures/2k_saturn_ring_alpha.png')

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
  }, [texture])

  return (
    <mesh geometry={geometry} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial
        map={texture}
        alphaMap={texture}
        side={THREE.DoubleSide}
        transparent
        opacity={1}
        roughness={0.85}
        // Rings are only ~10 m thick but 282,000 km across; they scatter
        // light rather than reflecting it directionally.
        emissive={new THREE.Color(0x2a2418)}
        emissiveIntensity={0.35}
        depthWrite={false}
      />
    </mesh>
  )
}

/**
 * Uranus's rings: narrow, dark (albedo ~0.03 — as dark as charcoal) and
 * nearly perpendicular to the orbital plane because the whole planet is
 * tipped over. The ε ring at 51,149 km is the brightest.
 */
const URANUS_RADIUS_KM = PHYSICAL.uranus.radiusKm

export function UranusRings({ radius }: { radius: number }) {
  const inner = radius * (41_837 / URANUS_RADIUS_KM) // 6 ring
  const outer = radius * (51_149 / URANUS_RADIUS_KM) // ε ring
  const geometry = useRadialRing(inner, outer, 128)

  // Built procedurally: the narrow ringlets are mostly empty space.
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 4
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillRect(0, 0, 512, 4)

    // Fractional radii of the nine main ringlets, brightest last (ε).
    const ringlets: Array<[number, number, number]> = [
      [0.0, 0.012, 0.30],
      [0.09, 0.010, 0.28],
      [0.16, 0.010, 0.30],
      [0.33, 0.012, 0.34],
      [0.43, 0.010, 0.30],
      [0.52, 0.014, 0.36],
      [0.60, 0.012, 0.34],
      [0.72, 0.016, 0.40],
      [1.0, 0.030, 0.85],
    ]

    for (const [position, width, alpha] of ringlets) {
      const x = position * 511
      const w = Math.max(1, width * 511)
      ctx.fillStyle = `rgba(150, 150, 165, ${alpha})`
      ctx.fillRect(x - w / 2, 0, w, 4)
    }

    const result = new THREE.CanvasTexture(canvas)
    result.colorSpace = THREE.SRGBColorSpace
    return result
  }, [])

  return (
    <mesh geometry={geometry} rotation={[Math.PI / 2, 0, 0]}>
      <meshBasicMaterial
        map={texture}
        alphaMap={texture}
        side={THREE.DoubleSide}
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </mesh>
  )
}
