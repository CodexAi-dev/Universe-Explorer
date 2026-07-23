import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { pointSprite } from '@/three/pointSprite'
import { universeState, useUniverseStore } from '@/store/useUniverseStore'

const COUNTS = { low: 1000, medium: 2000, high: 3000, ultra: 5000 } as const

/** Point cloud ring between Mars and Jupiter, drifting slowly. */
export function AsteroidBelt() {
  const ref = useRef<THREE.Points>(null!)
  const show = useUniverseStore((s) => s.showAsteroidBelt)
  const quality = useUniverseStore((s) => s.quality)

  const geometry = useMemo(() => {
    const count = COUNTS[quality]
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 90 + Math.random() * 20
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [quality])

  useFrame((_, delta) => {
    if (!show) return
    const { isPlaying, timeSpeed } = universeState()
    if (isPlaying) ref.current.rotation.y += 0.0001 * timeSpeed * delta * 60
  })

  return (
    <points ref={ref} geometry={geometry} visible={show}>
      <pointsMaterial
        color={0x9a8f80}
        size={0.45}
        map={pointSprite()}
        alphaMap={pointSprite()}
        transparent
        opacity={0.8}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}
