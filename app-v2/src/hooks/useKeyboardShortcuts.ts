import { useEffect } from 'react'
import { useUniverseStore } from '@/store/useUniverseStore'

/** Number keys 1–9 map to the Sun and the first eight planets, as in v1. */
const NUMBER_TARGETS = [
  'sun',
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
]

interface Handlers {
  onToggleHelp: () => void
  onCloseModals: () => void
}

export function useKeyboardShortcuts({ onToggleHelp, onCloseModals }: Handlers) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Never hijack keys while the user is typing in a control.
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return

      const store = useUniverseStore.getState()
      const key = event.key.toLowerCase()

      switch (key) {
        case ' ':
          event.preventDefault()
          store.togglePlay()
          break
        case 'r':
          store.resetCamera()
          break
        case 'o':
          store.toggle('showOrbits')
          break
        case 'l':
          store.toggle('showLabels')
          break
        case '+':
        case '=':
          store.nudgeSpeed(2)
          break
        case '-':
          store.nudgeSpeed(0.5)
          break
        case 'f':
          if (document.fullscreenElement) void document.exitFullscreen()
          else void document.documentElement.requestFullscreen()
          break
        case 'h':
          onToggleHelp()
          break
        case 'escape':
          onCloseModals()
          break
        default: {
          const index = Number(key) - 1
          const id = NUMBER_TARGETS[index]
          if (id) {
            store.select({ kind: 'planet', id })
            store.focusPlanet(id)
          }
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onToggleHelp, onCloseModals])
}
