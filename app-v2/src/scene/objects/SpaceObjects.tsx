import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { ALIEN_SHIPS, COMETS, SATELLITES } from '@/data/spaceObjects'
import { createSatelliteModel } from '@/three/builders/satellites'
import { createAlienShipModel } from '@/three/builders/alienShips'
import { createCometModel, createMeteor } from '@/three/builders/comets'
import { planetPositions } from '@/three/simulation'
import { useUniverseStore } from '@/store/useUniverseStore'

const EARTH = 'earth'

/** Satellites orbit their parent planet's live position each frame. */
export function Satellites() {
  const show = useUniverseStore((s) => s.showSatellites)
  const group = useRef<THREE.Group>(null!)

  const models = useMemo(
    () =>
      Object.entries(SATELLITES).map(([id, data]) => {
        const object = createSatelliteModel(data)
        object.name = id
        object.userData = {
          ...data,
          kind: 'satellite',
          id,
          orbitAngle: Math.random() * Math.PI * 2,
          parentPlanet: data.orbit === 'earth' ? EARTH : undefined,
        }
        return object
      }),
    [],
  )

  useFrame((_, rawDelta) => {
    if (!show) return
    const delta = Math.min(rawDelta, 0.1)
    const earthPos = planetPositions.get(EARTH)

    for (const sat of models) {
      const d = sat.userData
      if (d.parentPlanet === EARTH && earthPos) {
        d.orbitAngle += delta * (d.orbitSpeed ?? 2)
        const r = d.orbitRadius ?? 3
        sat.position.set(
          earthPos.x + Math.cos(d.orbitAngle) * r,
          earthPos.y + Math.sin(d.orbitAngle * 0.5) * r * 0.3,
          earthPos.z + Math.sin(d.orbitAngle) * r,
        )
        sat.lookAt(earthPos)
      }
      sat.rotation.y += delta * 0.1
    }
  })

  return (
    <group ref={group} visible={show}>
      {models.map((object) => (
        <primitive key={object.name} object={object} />
      ))}
    </group>
  )
}

/** UFOs drift on a slow orbit with a vertical bob and chasing hull lights. */
export function AlienShips() {
  const show = useUniverseStore((s) => s.showAlienShips)

  const models = useMemo(
    () =>
      ALIEN_SHIPS.map((data, index) => {
        const object = createAlienShipModel(data)
        object.name = `alienShip_${index}`
        object.userData = {
          ...data,
          kind: 'alienShip',
          floatOffset: Math.random() * Math.PI * 2,
          floatSpeed: 0.5 + Math.random() * 0.5,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitSpeed: (0.1 + Math.random() * 0.2) * (Math.random() > 0.5 ? 1 : -1),
          baseHeight: (Math.random() - 0.5) * 30,
        }
        return object
      }),
    [],
  )

  useFrame((state, rawDelta) => {
    if (!show) return
    const delta = Math.min(rawDelta, 0.1)
    const time = state.clock.elapsedTime

    for (const ship of models) {
      const d = ship.userData
      const floatY = Math.sin(time * d.floatSpeed + d.floatOffset) * 2

      d.orbitAngle += delta * d.orbitSpeed * 0.1
      const radius = d.orbitRadius ?? 150
      ship.position.set(
        Math.cos(d.orbitAngle) * radius,
        floatY + (d.baseHeight ?? 0),
        Math.sin(d.orbitAngle) * radius,
      )
      ship.rotation.y += delta * 0.3

      if (d.orbitRing) {
        d.orbitRing.rotation.x += delta * 2
        d.orbitRing.rotation.y += delta * 1.5
      }
      if (d.energyCore) {
        d.energyCore.material.opacity = 0.7 + Math.sin(time * 3) * 0.3
      }

      for (const child of ship.children) {
        const lightIndex = child.userData.lightIndex
        if (lightIndex !== undefined) {
          const phase = (time * 3 + lightIndex * 0.5) % (Math.PI * 2)
          ;(child as THREE.Mesh<THREE.BufferGeometry, THREE.Material>).material.opacity =
            0.5 + Math.sin(phase) * 0.5
        }
      }
    }
  })

  return (
    <group visible={show}>
      {models.map((object) => (
        <primitive key={object.name} object={object} />
      ))}
    </group>
  )
}

/** Comets follow a real ellipse, with tails scaled by distance from the Sun. */
export function Comets() {
  const show = useUniverseStore((s) => s.showComets)
  const toSun = useMemo(() => new THREE.Vector3(), [])

  const models = useMemo(
    () =>
      COMETS.map((data, index) => {
        const object = createCometModel(data)
        object.name = `comet_${index}`
        object.userData = {
          ...object.userData,
          ...data,
          kind: 'comet',
          id: String(index),
          angle: Math.random() * Math.PI * 2,
          speed: data.speed ?? 0.001,
        }
        object.position.set(data.perihelion ?? 50, 0, 0)
        return object
      }),
    [],
  )

  useFrame((_, rawDelta) => {
    if (!show) return
    const delta = Math.min(rawDelta, 0.1)

    for (const comet of models) {
      const d = comet.userData
      d.angle += delta * d.speed

      // Polar form of an ellipse with the Sun at one focus.
      const perihelion = d.perihelion ?? 50
      const aphelion = d.aphelion ?? 300
      const a = (perihelion + aphelion) / 2
      const e = (aphelion - perihelion) / (aphelion + perihelion)
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(d.angle))

      comet.position.x = Math.cos(d.angle) * r
      comet.position.z = Math.sin(d.angle) * r

      // Tails always stream directly away from the Sun.
      toSun.set(-comet.position.x, -comet.position.y, -comet.position.z).normalize()
      comet.lookAt(
        comet.position.x - toSun.x,
        comet.position.y - toSun.y,
        comet.position.z - toSun.z,
      )

      const tailScale = Math.max(0.3, Math.min(2, 100 / comet.position.length()))
      d.dustTail?.scale.set(tailScale, 1, tailScale)
      d.ionTail?.scale.set(tailScale, 1, tailScale)
    }
  })

  return (
    <group visible={show}>
      {models.map((object) => (
        <primitive key={object.name} object={object} />
      ))}
    </group>
  )
}

const METEOR_POOL_SIZE = 20

/** Pooled meteors: 20 preallocated groups recycled instead of re-created. */
export function Meteors() {
  const nextSpawn = useRef(0)

  const pool = useMemo(
    () =>
      Array.from({ length: METEOR_POOL_SIZE }, (_, i) => {
        const meteor = createMeteor()
        meteor.name = `meteor_${i}`
        meteor.visible = false
        return meteor
      }),
    [],
  )

  const spawn = (elapsed: number) => {
    const meteor = pool.find((m) => !m.visible)
    if (!meteor) return

    const spawnRadius = 200 + Math.random() * 100
    const spawnAngle = Math.random() * Math.PI * 2
    const targetAngle = spawnAngle + Math.PI + (Math.random() - 0.5) * 0.5

    meteor.position.set(
      Math.cos(spawnAngle) * spawnRadius,
      (Math.random() - 0.5) * 50,
      Math.sin(spawnAngle) * spawnRadius,
    )

    const speed = 2 + Math.random() * 3
    meteor.userData.velocity.set(
      Math.cos(targetAngle) * speed,
      (Math.random() - 0.5) * 0.5,
      Math.sin(targetAngle) * speed,
    )
    meteor.userData.lifetime = 0
    meteor.userData.maxLifetime = 2 + Math.random() * 2
    meteor.visible = true
    meteor.lookAt(meteor.position.clone().add(meteor.userData.velocity))

    nextSpawn.current = elapsed + 1 + Math.random() * 4
  }

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const elapsed = state.clock.elapsedTime

    if (elapsed >= nextSpawn.current) spawn(elapsed)

    for (const meteor of pool) {
      if (!meteor.visible) continue

      meteor.userData.lifetime += delta
      if (meteor.userData.lifetime >= meteor.userData.maxLifetime) {
        meteor.visible = false
        continue
      }

      meteor.position.addScaledVector(meteor.userData.velocity, delta * 60)

      const fade = 1 - meteor.userData.lifetime / meteor.userData.maxLifetime
      for (const child of meteor.children) {
        const mesh = child as THREE.Mesh<THREE.BufferGeometry, THREE.Material>
        if (mesh.material) mesh.material.opacity = 0.5 * fade
      }
    }
  })

  return (
    <group>
      {pool.map((object) => (
        <primitive key={object.name} object={object} />
      ))}
    </group>
  )
}

/** Ambient dust and small debris throughout the ecliptic plane. */
export function SpaceDebris() {
  const ref = useRef<THREE.Points>(null!)

  const geometry = useMemo(() => {
    const count = 2000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const radius = 20 + Math.random() * 300
      const theta = Math.random() * Math.PI * 2
      // Concentrated near the ecliptic rather than spherically distributed.
      const phi = (Math.random() - 0.5) * 0.3

      positions[i * 3] = Math.cos(theta) * radius * Math.cos(phi)
      positions[i * 3 + 1] = Math.sin(phi) * radius * 0.1
      positions[i * 3 + 2] = Math.sin(theta) * radius * Math.cos(phi)

      const brightness = 0.3 + Math.random() * 0.7
      colors[i * 3] = brightness
      colors[i * 3 + 1] = brightness * 0.9
      colors[i * 3 + 2] = brightness * 0.8
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  useFrame((_, delta) => {
    ref.current.rotation.y += Math.min(delta, 0.1) * 0.01
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.2} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}
