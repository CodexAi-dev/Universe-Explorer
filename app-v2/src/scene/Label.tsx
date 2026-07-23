import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { labelTexture } from '@/three/textures'

interface LabelProps {
  text: string
  variant?: 'planet' | 'moon' | 'deepSpace'
  y: number
  scale: [number, number]
  visible?: boolean
}

/** Apparent height a label should occupy, as a fraction of viewport height. */
const TARGET_SCREEN_FRACTION = 0.028
const MIN_SCALE = 0.4
const MAX_SCALE = 3.5

/**
 * Canvas-sprite text label. Sprites always face the camera and cost one draw
 * call, which is why v1 used them instead of DOM overlays for 30+ bodies.
 *
 * Scale is corrected for distance each frame so a label stays legible up
 * close and doesn't balloon across the screen when the camera flies in — a
 * fixed world-space size can't do both.
 */
export function Label({ text, variant = 'planet', y, scale, visible = true }: LabelProps) {
  const map = useMemo(() => labelTexture(text, variant), [text, variant])
  const ref = useRef<THREE.Sprite>(null!)
  const worldPosition = useMemo(() => new THREE.Vector3(), [])
  const aspect = scale[0] / scale[1]

  useFrame(({ camera }) => {
    const sprite = ref.current
    if (!sprite || !sprite.visible) return

    sprite.getWorldPosition(worldPosition)
    const distance = camera.position.distanceTo(worldPosition)

    // Height that subtends the target fraction of the view at this distance.
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 60
    const viewHeight = 2 * distance * Math.tan((fov * Math.PI) / 360)
    const height = THREE.MathUtils.clamp(
      viewHeight * TARGET_SCREEN_FRACTION,
      MIN_SCALE,
      MAX_SCALE,
    )

    sprite.scale.set(height * aspect, height, 1)
  })

  return (
    <sprite ref={ref} position={[0, y, 0]} visible={visible}>
      <spriteMaterial map={map} transparent depthWrite={false} depthTest={variant !== 'moon'} />
    </sprite>
  )
}
