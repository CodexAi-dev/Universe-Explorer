import { useMemo } from 'react'
import * as THREE from 'three'
import { createGlowTexture } from '@/three/builders/glows'
import { useUniverseStore } from '@/store/useUniverseStore'

/** Stylised four-arm galactic disk seen from outside the Solar System. */
function buildMilkyWay() {
  const group = new THREE.Group()

  const bulge = new THREE.Mesh(
    new THREE.SphereGeometry(80, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffeecc,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    }),
  )
  group.add(bulge)

  const armCount = 4
  const particlesPerArm = 5000
  const total = armCount * particlesPerArm
  const positions = new Float32Array(total * 3)
  const colors = new Float32Array(total * 3)

  let index = 0
  for (let arm = 0; arm < armCount; arm++) {
    const armAngleOffset = (arm / armCount) * Math.PI * 2

    for (let i = 0; i < particlesPerArm; i++) {
      const distance = 50 + Math.random() * 400
      const angle = armAngleOffset + (distance / 50) * 0.5 + (Math.random() - 0.5) * 0.3
      const height = (Math.random() - 0.5) * (20 - distance * 0.02)

      positions[index * 3] = Math.cos(angle) * distance
      positions[index * 3 + 1] = height
      positions[index * 3 + 2] = Math.sin(angle) * distance

      // Warm at the core, cooler toward the rim.
      const t = distance / 450
      colors[index * 3] = 1.0 - t * 0.3
      colors[index * 3 + 1] = 0.9 - t * 0.2
      colors[index * 3 + 2] = 0.8 + t * 0.2

      index++
    }
  }

  const armGeometry = new THREE.BufferGeometry()
  armGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  armGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  group.add(
    new THREE.Points(
      armGeometry,
      new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    ),
  )

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createGlowTexture(),
      color: 0xffddaa,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.5,
    }),
  )
  glow.scale.set(200, 200, 1)
  group.add(glow)

  return group
}

export function MilkyWay() {
  const show = useUniverseStore((s) => s.showMilkyWay)
  const object = useMemo(buildMilkyWay, [])

  return <primitive object={object} visible={show} />
}

/** Faint reddish-brown haze filling intergalactic space. */
function buildCosmicDust() {
  const count = 3000
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4000
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1000
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4000

    colors[i * 3] = 0.4 + Math.random() * 0.2
    colors[i * 3 + 1] = 0.2 + Math.random() * 0.1
    colors[i * 3 + 2] = 0.1 + Math.random() * 0.1
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geometry
}

export function CosmicDust() {
  const currentView = useUniverseStore((s) => s.currentView)
  const geometry = useMemo(buildCosmicDust, [])

  return (
    <points geometry={geometry} visible={currentView !== 'solarSystem'}>
      <pointsMaterial
        size={1}
        vertexColors
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
