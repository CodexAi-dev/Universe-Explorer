import { useMemo } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { useUniverseStore } from '@/store/useUniverseStore'

/**
 * The real Milky Way, as an all-sky panorama.
 *
 * This is the actual sky our Solar System sits inside — the galactic plane
 * running across it is the disc seen edge-on from our position about 26,000
 * light-years out in the Orion Arm. Rendered on the inside of a large sphere
 * so it sits behind everything and never moves with the camera.
 */
export function Skybox() {
  const showStars = useUniverseStore((s) => s.showStars)
  const texture = useTexture('./textures/2k_stars_milky_way.jpg')

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
  }, [texture])

  return (
    <mesh
      visible={showStars}
      scale={[-1, 1, 1]}
      // The galactic plane is tilted ~60° to the ecliptic, which is why the
      // Milky Way cuts across the sky at an angle rather than lying flat.
      rotation={[0, 0, THREE.MathUtils.degToRad(60.2)]}
      renderOrder={-1}
    >
      <sphereGeometry args={[9000, 48, 32]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        toneMapped={false}
        depthWrite={false}
        color={0x8a8a9a}
      />
    </mesh>
  )
}
