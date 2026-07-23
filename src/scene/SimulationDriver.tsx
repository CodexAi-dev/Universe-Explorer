import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { updateBodies } from '@/three/simulation'
import { universeState, useUniverseStore } from '@/store/useUniverseStore'

const MS_PER_DAY = 86_400_000

/**
 * Single frame loop for the whole simulation.
 *
 * Holds the authoritative simulation clock as a ref and advances it by real
 * elapsed time × the speed multiplier, then asks `updateBodies` to place
 * everything for that instant. Because positions are *computed* from the
 * clock rather than integrated, changing speed or reversing never drifts.
 *
 * React state is written on a 1 Hz tick — the fastest the readouts need.
 */
export function SimulationDriver() {
  const clock = useRef(useUniverseStore.getState().simulationTime)
  const frames = useRef(0)
  const lastReport = useRef(performance.now())

  const setValue = useUniverseStore((s) => s.set)

  // Jumping to a date (Reset to today) must move the authoritative clock too.
  useEffect(
    () =>
      useUniverseStore.subscribe(
        (s) => s.timeEpoch,
        () => {
          clock.current = useUniverseStore.getState().simulationTime
        },
      ),
    [],
  )

  useFrame((_, rawDelta) => {
    // Clamp so a backgrounded tab doesn't jump the simulation by minutes.
    const delta = Math.min(rawDelta, 0.1)
    const { isPlaying, timeSpeed, distanceMode, sizeMode } = universeState()

    if (isPlaying) clock.current += timeSpeed * MS_PER_DAY * delta

    updateBodies(clock.current, { distanceMode, sizeMode })

    frames.current++
    const now = performance.now()
    if (now - lastReport.current >= 1000) {
      setValue('fps', frames.current)
      setValue('simulationTime', clock.current)
      frames.current = 0
      lastReport.current = now
    }
  })

  return null
}
