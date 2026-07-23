import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { MoonData } from '@/data/types'
import { registerMoon, randomAngle } from '@/three/simulation'
import { useUniverseStore } from '@/store/useUniverseStore'
import { Label } from './Label'

interface MoonProps {
  id: string
  data: MoonData
}

export function Moon({ id, data }: MoonProps) {
  const ref = useRef<THREE.Group>(null!)
  const showMoons = useUniverseStore((s) => s.showMoons)
  const showLabels = useUniverseStore((s) => s.showLabels)

  useEffect(
    () =>
      registerMoon(id, {
        object: ref.current,
        angle: randomAngle(),
        orbitRadius: data.orbitRadius,
        orbitSpeed: data.orbitSpeed,
        rotationSpeed: 0,
      }),
    [id, data.orbitRadius, data.orbitSpeed],
  )

  const labelScale = Math.max(data.size * 3, 1.5)

  return (
    <group ref={ref} position={[data.orbitRadius, 0, 0]} visible={showMoons} name={id}>
      <mesh userData={{ kind: 'moon', id }}>
        <sphereGeometry args={[data.size, 16, 16]} />
        <meshStandardMaterial color={data.color} roughness={0.9} />
      </mesh>
      <Label
        text={data.name}
        variant="moon"
        y={data.size + labelScale * 0.3}
        scale={[labelScale * 2, labelScale * 0.5]}
        visible={showMoons && showLabels}
      />
    </group>
  )
}
