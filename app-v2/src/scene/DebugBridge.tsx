import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { liveState, planetPositions } from '@/three/simulation'
import { useUniverseStore } from '@/store/useUniverseStore'

declare global {
  interface Window {
    universeExplorer?: {
      camera: () => { position: number[]; target: number[] | null }
      state: () => ReturnType<typeof useUniverseStore.getState>
      positions: () => Record<string, number[]>
      live: () => Record<string, unknown>
    }
  }
}

/**
 * Console handle for inspecting the running scene, replacing v1's
 * `window.solarSystemApp`. Handy for checking where the camera actually is
 * when a fly-to looks wrong.
 */
export function DebugBridge() {
  const { camera, controls } = useThree()

  useEffect(() => {
    window.universeExplorer = {
      camera: () => ({
        position: camera.position.toArray().map((n) => +n.toFixed(2)),
        target:
          controls && 'target' in controls
            ? (controls.target as { toArray: () => number[] })
                .toArray()
                .map((n) => +n.toFixed(2))
            : null,
      }),
      state: () => useUniverseStore.getState(),
      positions: () =>
        Object.fromEntries(
          [...planetPositions].map(([id, v]) => [id, v.toArray().map((n) => +n.toFixed(2))]),
        ),
      live: () => Object.fromEntries(liveState),
    }

    return () => void delete window.universeExplorer
  }, [camera, controls])

  return null
}
