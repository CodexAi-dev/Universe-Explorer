import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { updateBodies } from '@/three/simulation'
import { universeState, useUniverseStore } from '@/store/useUniverseStore'

const MS_PER_DAY = 86_400_000

/**
 * A frame gap longer than this is treated as the page having been stopped
 * rather than as elapsed simulation time. Generous enough that even a very
 * slow software renderer keeps correct pace.
 */
const STALL_SECONDS = 5

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
    /*
      Advance by the full elapsed time so the clock keeps real pace whatever
      the frame rate. Clamping the delta instead of skipping loses the
      remainder on every slow frame: a 0.1s cap made the simulation run ~10x
      slow on a software renderer, and even a 1s cap still lost a third.

      A gap beyond STALL_SECONDS means something stopped the page (a sleeping
      laptop, a blocking dialog). Those intervals are dropped outright rather
      than replayed, so returning to the tab does not teleport the planets.
    */
    const { isPlaying, timeSpeed, distanceMode, sizeMode } = universeState()

    if (isPlaying && rawDelta <= STALL_SECONDS) {
      clock.current += timeSpeed * MS_PER_DAY * rawDelta
    }

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
