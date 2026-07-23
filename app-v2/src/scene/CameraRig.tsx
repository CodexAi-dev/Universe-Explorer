import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { PLANET_DATA } from '@/data/planets'
import { EXOTIC_OBJECTS, GALAXIES, NEBULAE } from '@/data/universe'
import { planetPositions } from '@/three/simulation'
import { VIEW_PRESETS, universeState, useUniverseStore } from '@/store/useUniverseStore'
import type { CameraCommand } from '@/store/useUniverseStore'

const HOME = new THREE.Vector3(100, 80, 200)
const ORIGIN = new THREE.Vector3(0, 0, 0)
const FLIGHT_MS = 1500

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

interface Flight {
  fromPos: THREE.Vector3
  toPos: THREE.Vector3
  fromTarget: THREE.Vector3
  toTarget: THREE.Vector3
  start: number
}

/**
 * Owns the camera: orbit controls, eased fly-to transitions, focus tracking
 * and Surface View zoom limits. UI code never touches the camera directly —
 * it raises a `CameraCommand` on the store and this consumes it.
 */
export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null!)
  const flight = useRef<Flight | null>(null)
  const focused = useRef<string | null>(null)
  const { camera } = useThree()

  const command = useUniverseStore((s) => s.camera)
  const autoOrbit = useUniverseStore((s) => s.autoOrbit)
  const surfaceViewPlanet = useUniverseStore((s) => s.surfaceViewPlanet)
  const exitSurfaceView = useUniverseStore((s) => s.exitSurfaceView)

  /** Start an eased flight to a new camera position and look-at target. */
  const flyTo = (toPos: THREE.Vector3, toTarget: THREE.Vector3) => {
    flight.current = {
      fromPos: camera.position.clone(),
      toPos: toPos.clone(),
      fromTarget: controls.current.target.clone(),
      toTarget: toTarget.clone(),
      start: performance.now(),
    }
  }

  // ---- react to camera commands
  useEffect(() => {
    if (!controls.current) return
    const c: CameraCommand = command

    switch (c.kind) {
      case 'reset':
        focused.current = null
        flyTo(HOME, ORIGIN)
        break

      case 'viewMode':
        focused.current = null
        if (c.mode === 'top') flyTo(new THREE.Vector3(0, 300, 0), ORIGIN)
        else if (c.mode === 'side') flyTo(new THREE.Vector3(300, 0, 0), ORIGIN)
        else flyTo(HOME, ORIGIN)
        break

      case 'scale': {
        focused.current = null
        const d = VIEW_PRESETS[c.view].cameraDistance
        flyTo(new THREE.Vector3(d * 0.5, d * 0.3, d), ORIGIN)
        break
      }

      case 'focusPlanet': {
        const data = PLANET_DATA[c.name]
        if (!data) break
        focused.current = c.name === 'sun' ? null : c.name

        const target = c.name === 'sun' ? ORIGIN.clone() : (planetPositions.get(c.name)?.clone() ?? ORIGIN.clone())
        const distance = data.size * 5 + 10
        flyTo(target.clone().add(new THREE.Vector3(distance, distance * 0.5, distance)), target)
        break
      }

      case 'focusDeepSpace': {
        focused.current = null
        const source =
          c.selection.kind === 'galaxy'
            ? GALAXIES[c.selection.id]
            : c.selection.kind === 'nebula'
              ? NEBULAE[c.selection.id]
              : EXOTIC_OBJECTS[c.selection.id]
        if (!source) break

        const pos = new THREE.Vector3(source.position.x, source.position.y, source.position.z)
        const scale = source.scale || 50
        flyTo(pos.clone().add(new THREE.Vector3(scale * 2, scale, scale * 2)), pos)
        break
      }
    }
    // `command.nonce` changes on every raise, including repeats.
  }, [command]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Surface View clamps the zoom range to just above the surface
  useEffect(() => {
    if (!controls.current) return

    if (!surfaceViewPlanet) {
      controls.current.minDistance = 10
      controls.current.maxDistance = 50000
      return
    }

    const data = PLANET_DATA[surfaceViewPlanet]
    if (!data) return

    controls.current.minDistance = data.size * 1.05
    controls.current.maxDistance = data.size * 10

    const target =
      surfaceViewPlanet === 'sun'
        ? ORIGIN.clone()
        : (planetPositions.get(surfaceViewPlanet)?.clone() ?? ORIGIN.clone())

    // Approach from a random bearing so repeat visits differ, as in v1.
    const distance = data.size * 1.2
    const angle = Math.random() * Math.PI * 2
    flyTo(
      target
        .clone()
        .add(new THREE.Vector3(Math.cos(angle) * distance, distance * 0.3, Math.sin(angle) * distance)),
      target,
    )
    focused.current = surfaceViewPlanet === 'sun' ? null : surfaceViewPlanet
  }, [surfaceViewPlanet]) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    const ctrl = controls.current
    if (!ctrl) return

    // Eased fly-to overrides user input while it runs.
    if (flight.current) {
      const f = flight.current
      const progress = Math.min((performance.now() - f.start) / FLIGHT_MS, 1)
      const eased = easeInOutCubic(progress)
      camera.position.lerpVectors(f.fromPos, f.toPos, eased)
      ctrl.target.lerpVectors(f.fromTarget, f.toTarget, eased)
      if (progress >= 1) flight.current = null
    } else if (focused.current) {
      // Keep a focused planet centred as it continues along its orbit.
      const pos = planetPositions.get(focused.current)
      if (pos) ctrl.target.copy(pos)
    }

    // Zooming far enough out leaves Surface View.
    const { surfaceViewPlanet: active } = universeState()
    if (active && !flight.current) {
      const data = PLANET_DATA[active]
      const centre =
        active === 'sun' ? ORIGIN : (planetPositions.get(active) ?? ORIGIN)
      if (data && camera.position.distanceTo(centre) > data.size * 8) exitSurfaceView()
    }

    ctrl.update()
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      screenSpacePanning
      minDistance={10}
      maxDistance={50000}
      maxPolarAngle={Math.PI}
      autoRotate={autoOrbit}
      autoRotateSpeed={0.5}
    />
  )
}
