import { useMemo } from 'react'
import { labelTexture } from '@/three/textures'

interface LabelProps {
  text: string
  variant?: 'planet' | 'moon' | 'deepSpace'
  y: number
  scale: [number, number]
  visible?: boolean
}

/**
 * Canvas-sprite text label. Sprites always face the camera and cost one draw
 * call, which is why v1 used them instead of DOM overlays for 30+ bodies.
 */
export function Label({ text, variant = 'planet', y, scale, visible = true }: LabelProps) {
  const map = useMemo(() => labelTexture(text, variant), [text, variant])

  return (
    <sprite position={[0, y, 0]} scale={[scale[0], scale[1], 1]} visible={visible}>
      <spriteMaterial map={map} transparent depthWrite={false} depthTest={variant !== 'moon'} />
    </sprite>
  )
}
