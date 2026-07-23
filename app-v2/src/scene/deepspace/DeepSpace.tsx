import { useMemo } from 'react'
import * as THREE from 'three'
import { EXOTIC_OBJECTS, GALAXIES, NEBULAE } from '@/data/universe'
import type { ExoticObjectData, GalaxyData, NebulaData, Selection } from '@/data/types'
import {
  createEllipticalGalaxyMesh,
  createRingGalaxyMesh,
  createSpiralGalaxyMesh,
} from '@/three/builders/galaxies'
import {
  createDarkNebula,
  createEmissionNebula,
  createPlanetaryNebula,
  createReflectionNebula,
  getNebulaType,
} from '@/three/builders/nebulae'
import { createRelativisticJets } from '@/three/builders/blackHoles'
import { createGlowTexture } from '@/three/builders/glows'
import { labelTexture } from '@/three/textures'
import { useUniverseStore } from '@/store/useUniverseStore'

/**
 * Deep-space objects are 2,000–5,000-particle procedural constructs. They are
 * built imperatively once and mounted via `<primitive>`; expressing each
 * particle in JSX would cost far more than it buys.
 */

function addLabel(group: THREE.Group, text: string, yOffset: number) {
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: labelTexture(text, 'deepSpace'),
      transparent: true,
      depthWrite: false,
    }),
  )
  sprite.scale.set(40, 10, 1)
  sprite.position.y = yOffset
  group.add(sprite)
}

function buildGalaxy(key: string, data: GalaxyData) {
  const group = new THREE.Group()
  group.position.set(data.position.x, data.position.y, data.position.z)
  group.userData = { kind: 'galaxy', id: key }

  if (data.type.includes('Spiral')) createSpiralGalaxyMesh(group, data)
  else if (data.type.includes('Ring')) createRingGalaxyMesh(group, data)
  else createEllipticalGalaxyMesh(group, data)

  addLabel(group, data.name, data.scale * 2)
  return group
}

function buildNebula(key: string, data: NebulaData) {
  const group = new THREE.Group()
  group.position.set(data.position.x, data.position.y, data.position.z)
  group.userData = { kind: 'nebula', id: key }

  switch (getNebulaType(key)) {
    case 'planetary':
      createPlanetaryNebula(group, data)
      break
    case 'reflection':
      createReflectionNebula(group, data)
      break
    case 'dark':
      createDarkNebula(group, data)
      break
    default:
      createEmissionNebula(group, data)
  }

  addLabel(group, data.name, data.scale * 1.5)
  return group
}

function buildBlackHole(key: string, data: ExoticObjectData) {
  const group = new THREE.Group()
  group.position.set(data.position.x, data.position.y, data.position.z)
  group.userData = { kind: 'exotic', id: key }

  const horizon = new THREE.Mesh(
    new THREE.SphereGeometry(data.scale * 0.3, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
  )
  group.add(horizon)

  const disk = new THREE.Mesh(
    new THREE.TorusGeometry(data.scale * 0.8, data.scale * 0.2, 16, 100),
    new THREE.MeshBasicMaterial({
      color: data.glowColor,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    }),
  )
  disk.rotation.x = Math.PI / 2
  group.add(disk)

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createGlowTexture(),
      color: data.glowColor,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.8,
    }),
  )
  glow.scale.set(data.scale * 2, data.scale * 2, 1)
  group.add(glow)

  // Only the most massive black holes get visible jets, as in v1.
  if (data.mass?.includes('billion')) createRelativisticJets(group, data)

  addLabel(group, data.name, data.scale * 1.5)
  return group
}

/** Wraps a prebuilt group so clicking it selects the object. */
function DeepSpaceObject({ object, selection }: { object: THREE.Object3D; selection: Selection }) {
  const focusDeepSpace = useUniverseStore((s) => s.focusDeepSpace)
  const select = useUniverseStore((s) => s.select)

  return (
    <primitive
      object={object}
      onClick={(e: { stopPropagation: () => void }) => {
        e.stopPropagation()
        select(selection)
      }}
      onDoubleClick={(e: { stopPropagation: () => void }) => {
        e.stopPropagation()
        focusDeepSpace(selection)
      }}
    />
  )
}

export function Galaxies() {
  const show = useUniverseStore((s) => s.showGalaxies)
  const objects = useMemo(
    () => Object.entries(GALAXIES).map(([key, data]) => ({ key, object: buildGalaxy(key, data) })),
    [],
  )

  return (
    <group visible={show}>
      {objects.map(({ key, object }) => (
        <DeepSpaceObject key={key} object={object} selection={{ kind: 'galaxy', id: key }} />
      ))}
    </group>
  )
}

export function Nebulae() {
  const show = useUniverseStore((s) => s.showNebulae)
  const objects = useMemo(
    () => Object.entries(NEBULAE).map(([key, data]) => ({ key, object: buildNebula(key, data) })),
    [],
  )

  return (
    <group visible={show}>
      {objects.map(({ key, object }) => (
        <DeepSpaceObject key={key} object={object} selection={{ kind: 'nebula', id: key }} />
      ))}
    </group>
  )
}

export function BlackHoles() {
  const show = useUniverseStore((s) => s.showBlackHoles)
  const objects = useMemo(
    () =>
      Object.entries(EXOTIC_OBJECTS).map(([key, data]) => ({
        key,
        object: buildBlackHole(key, data),
      })),
    [],
  )

  return (
    <group visible={show}>
      {objects.map(({ key, object }) => (
        <DeepSpaceObject key={key} object={object} selection={{ kind: 'exotic', id: key }} />
      ))}
    </group>
  )
}
