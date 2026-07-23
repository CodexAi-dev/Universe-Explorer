import * as THREE from 'three'

let cached: THREE.CanvasTexture | null = null

/**
 * Soft circular alpha map for point clouds.
 *
 * `PointsMaterial` renders each point as a hard square by default, which is
 * glaringly obvious once points get more than a few pixels across — dust and
 * solar wind end up looking like confetti. This gives them a round, soft edge.
 */
export function pointSprite(): THREE.CanvasTexture {
  if (cached) return cached

  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.85)')
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.25)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  cached = new THREE.CanvasTexture(canvas)
  return cached
}
