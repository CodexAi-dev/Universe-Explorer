import * as THREE from 'three'
import type { PlanetData } from '@/data/types'
import {
  addCloudBands,
  addCraters,
  addEarthContinents,
  addJupiterBands,
  addSaturnBands,
  addSubtleBands,
} from './planetPaint'
import {
  drawEarthSurface,
  drawJupiterSurface,
  drawMarsSurface,
  drawMercurySurface,
  drawNeptuneSurface,
  drawSaturnSurface,
  drawSunSurface,
  drawUranusSurface,
  drawVenusSurface,
} from './surfaces'

/**
 * Procedural textures are expensive (the sun alone paints 5,000 gradients) and
 * deterministic per key, so every factory here is memoised for the session.
 * v1 rebuilt them on each construction.
 */
const cache = new Map<string, THREE.CanvasTexture>()

function memo(key: string, build: () => THREE.CanvasTexture): THREE.CanvasTexture {
  let texture = cache.get(key)
  if (!texture) {
    texture = build()
    cache.set(key, texture)
  }
  return texture
}

function canvas2d(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return { canvas, ctx: canvas.getContext('2d')! }
}

/** Low-detail (512x256) planet surface, used at normal zoom. */
export function planetTexture(name: string, data: PlanetData): THREE.CanvasTexture {
  return memo(`planet:${name}`, () => {
    const { canvas, ctx } = canvas2d(512, 256)
    const gradient = ctx.createLinearGradient(0, 0, 0, 256)

    switch (name) {
      case 'mercury':
        gradient.addColorStop(0, '#8a8a8a')
        gradient.addColorStop(0.5, '#b5b5b5')
        gradient.addColorStop(1, '#707070')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 512, 256)
        addCraters(ctx, 50)
        break

      case 'venus':
        gradient.addColorStop(0, '#d4a574')
        gradient.addColorStop(0.5, '#e6c87a')
        gradient.addColorStop(1, '#c4a35a')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 512, 256)
        addCloudBands(ctx, '#ddb87a', 0.3)
        break

      case 'earth':
        ctx.fillStyle = '#1a5f8a'
        ctx.fillRect(0, 0, 512, 256)
        addEarthContinents(ctx)
        addCloudBands(ctx, '#ffffff', 0.15)
        break

      case 'mars':
        gradient.addColorStop(0, '#8b3103')
        gradient.addColorStop(0.5, '#c1440e')
        gradient.addColorStop(1, '#a33a0c')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 512, 256)
        ctx.fillStyle = '#e8e8e8'
        ctx.fillRect(0, 0, 512, 20)
        ctx.fillRect(0, 236, 512, 20)
        addCraters(ctx, 20)
        break

      case 'jupiter':
        addJupiterBands(ctx)
        break

      case 'saturn':
        addSaturnBands(ctx)
        break

      case 'uranus':
        gradient.addColorStop(0, '#66b2ff')
        gradient.addColorStop(0.5, '#99ccff')
        gradient.addColorStop(1, '#66b2ff')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 512, 256)
        addSubtleBands(ctx, '#aaddff', 0.1)
        break

      case 'neptune':
        gradient.addColorStop(0, '#3344cc')
        gradient.addColorStop(0.5, '#5566ff')
        gradient.addColorStop(1, '#3344cc')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 512, 256)
        // Great Dark Spot
        ctx.fillStyle = 'rgba(30, 30, 100, 0.5)'
        ctx.beginPath()
        ctx.ellipse(300, 128, 40, 25, 0, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'pluto':
        gradient.addColorStop(0, '#a08060')
        gradient.addColorStop(0.5, '#ddc8a3')
        gradient.addColorStop(1, '#a08060')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 512, 256)
        // Tombaugh Regio (the "heart")
        ctx.fillStyle = '#f0e8d8'
        ctx.beginPath()
        ctx.moveTo(200, 150)
        ctx.bezierCurveTo(200, 100, 256, 80, 256, 120)
        ctx.bezierCurveTo(256, 80, 312, 100, 312, 150)
        ctx.bezierCurveTo(312, 200, 256, 220, 256, 220)
        ctx.bezierCurveTo(256, 220, 200, 200, 200, 150)
        ctx.fill()
        break

      default:
        ctx.fillStyle = `#${data.color.toString(16).padStart(6, '0')}`
        ctx.fillRect(0, 0, 512, 256)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  })
}

/** High-detail (2048²) surface used by Surface View. */
export function surfaceTexture(name: string): THREE.CanvasTexture | null {
  const painters: Record<string, (ctx: CanvasRenderingContext2D, size: number) => void> = {
    mercury: drawMercurySurface,
    venus: drawVenusSurface,
    earth: drawEarthSurface,
    mars: drawMarsSurface,
    jupiter: drawJupiterSurface,
    saturn: drawSaturnSurface,
    uranus: drawUranusSurface,
    neptune: drawNeptuneSurface,
    sun: drawSunSurface,
  }

  const paint = painters[name]
  if (!paint) return null

  return memo(`surface:${name}`, () => {
    const size = 2048
    const { canvas, ctx } = canvas2d(size, size)
    paint(ctx, size)

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  })
}

/** Ring band texture for Saturn (bright) and Uranus (faint). */
export function ringTexture(name: string): THREE.CanvasTexture {
  return memo(`rings:${name}`, () => {
    const { canvas, ctx } = canvas2d(512, 64)
    const gradient = ctx.createLinearGradient(0, 0, 512, 0)

    if (name === 'saturn') {
      gradient.addColorStop(0, 'rgba(200, 166, 90, 0)')
      gradient.addColorStop(0.1, 'rgba(200, 166, 90, 0.8)')
      gradient.addColorStop(0.2, 'rgba(180, 150, 80, 0.3)')
      gradient.addColorStop(0.3, 'rgba(200, 166, 90, 0.9)')
      gradient.addColorStop(0.5, 'rgba(220, 190, 120, 0.7)')
      gradient.addColorStop(0.7, 'rgba(200, 166, 90, 0.5)')
      gradient.addColorStop(0.9, 'rgba(180, 150, 80, 0.3)')
      gradient.addColorStop(1, 'rgba(160, 130, 70, 0)')
    } else {
      gradient.addColorStop(0, 'rgba(100, 100, 150, 0)')
      gradient.addColorStop(0.2, 'rgba(100, 100, 150, 0.3)')
      gradient.addColorStop(0.8, 'rgba(100, 100, 150, 0.2)')
      gradient.addColorStop(1, 'rgba(100, 100, 150, 0)')
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 64)

    // Fine radial striations
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`
      ctx.fillRect(Math.random() * 512, 0, 1, 64)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.rotation = Math.PI / 2
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  })
}

/** Text sprite label. `variant` matches v1's three label styles. */
export function labelTexture(
  text: string,
  variant: 'planet' | 'moon' | 'deepSpace',
): THREE.CanvasTexture {
  return memo(`label:${variant}:${text}`, () => {
    if (variant === 'moon') {
      const { canvas, ctx } = canvas2d(256, 64)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.roundRect(0, 0, canvas.width, canvas.height, 8)
      ctx.fill()

      ctx.fillStyle = '#aabbcc'
      ctx.beginPath()
      ctx.arc(28, 32, 12, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 24px Arial, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 50, 32)
      return new THREE.CanvasTexture(canvas)
    }

    if (variant === 'deepSpace') {
      const { canvas, ctx } = canvas2d(512, 64)
      ctx.font = 'bold 28px Arial'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.textAlign = 'center'
      ctx.fillText(text, 256, 40)
      return new THREE.CanvasTexture(canvas)
    }

    const { canvas, ctx } = canvas2d(256, 64)
    ctx.font = 'bold 32px Arial'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.fillText(text, 128, 40)
    return new THREE.CanvasTexture(canvas)
  })
}

export { createGlowTexture, createSunGlowTexture, createNebulaGlowTexture } from '../builders/glows'
export { createRealisticSunTexture } from '../builders/sun'
