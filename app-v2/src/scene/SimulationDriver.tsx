import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { moons, planetPositions, planets } from '@/three/simulation'
import { universeState, useUniverseStore } from '@/store/useUniverseStore'

/** Simulated ms per real second at 1x speed — one day per two seconds. */
const MS_PER_DAY = 86_400_000

/**
 * Single frame loop for the whole orbital simulation.
 *
 * Every body is advanced here rather than in its own `useFrame`, so animation
 * mutates Object3Ds directly and never causes a React render. Simulation time
 * and FPS are pushed into the store on a 1 Hz tick, which is the only rate the
 * UI actually needs.
 */
export function SimulationDriver() {
  const frames = useRef(0)
  const lastReport = useRef(performance.now())
  const pendingTime = useRef(0)

  const setFps = useUniverseStore((s) => s.set)
  const advanceTime = useUniverseStore((s) => s.advanceTime)

  useFrame((_, rawDelta) => {
    // Clamp so a backgrounded tab doesn't teleport every planet on return.
    const delta = Math.min(rawDelta, 0.1)
    const { isPlaying, timeSpeed } = universeState()

    if (isPlaying) {
      const timeMultiplier = delta * timeSpeed * 0.5
      pendingTime.current += timeSpeed * MS_PER_DAY * delta

      for (const [, body] of planets) {
        body.angle += (body.orbitSpeed / 100) * timeMultiplier
        body.object.position.x = Math.cos(body.angle) * body.orbitRadius
        body.object.position.z = Math.sin(body.angle) * body.orbitRadius
        body.object.rotation.y += (body.rotationSpeed / 100) * timeMultiplier
      }

      for (const [, body] of moons) {
        body.angle += (body.orbitSpeed / 100) * timeMultiplier
        body.object.position.x = Math.cos(body.angle) * body.orbitRadius
        body.object.position.z = Math.sin(body.angle) * body.orbitRadius
      }
    }

    // Publish world positions for satellites/labels regardless of play state.
    for (const [name, body] of planets) {
      planetPositions.get(name)?.copy(body.object.position)
    }

    frames.current++
    const now = performance.now()
    if (now - lastReport.current >= 1000) {
      setFps('fps', frames.current)
      if (pendingTime.current !== 0) {
        advanceTime(pendingTime.current)
        pendingTime.current = 0
      }
      frames.current = 0
      lastReport.current = now
    }
  })

  return null
}
