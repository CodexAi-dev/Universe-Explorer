import { useEffect } from 'react'
import { useUniverseStore } from '@/store/useUniverseStore'
import type { Quality, TextSize, Theme } from '@/store/useUniverseStore'

const STORAGE_KEY = 'universeExplorerPrefs'

interface StoredPrefs {
  theme: Theme
  textSize: TextSize
  highContrast: boolean
  metricUnits: boolean
  advancedMode: boolean
  quality: Quality
  useUtc: boolean
}

/**
 * Restores saved preferences on mount and persists them on change.
 * v1 only wrote on `beforeunload`, which lost changes on a crash or mobile
 * tab eviction; subscribing means every change is durable immediately.
 */
export function usePreferences() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const prefs = JSON.parse(raw) as Partial<StoredPrefs>
        const store = useUniverseStore.getState()
        if (prefs.theme) store.set('theme', prefs.theme)
        if (prefs.textSize) store.set('textSize', prefs.textSize)
        if (prefs.quality) store.set('quality', prefs.quality)
        if (typeof prefs.highContrast === 'boolean') store.set('highContrast', prefs.highContrast)
        if (typeof prefs.metricUnits === 'boolean') store.set('metricUnits', prefs.metricUnits)
        if (typeof prefs.advancedMode === 'boolean') store.set('advancedMode', prefs.advancedMode)
        if (typeof prefs.useUtc === 'boolean') store.set('useUtc', prefs.useUtc)
      }
    } catch {
      // A corrupt or blocked localStorage just means defaults.
    }

    return useUniverseStore.subscribe(
      (s): StoredPrefs => ({
        theme: s.theme,
        textSize: s.textSize,
        highContrast: s.highContrast,
        metricUnits: s.metricUnits,
        advancedMode: s.advancedMode,
        quality: s.quality,
        useUtc: s.useUtc,
      }),
      (prefs) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
        } catch {
          // Private browsing can reject writes; preferences just won't persist.
        }
      },
      { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
    )
  }, [])

  // Themes and accessibility modes are applied as data attributes on <html>.
  const theme = useUniverseStore((s) => s.theme)
  const textSize = useUniverseStore((s) => s.textSize)
  const highContrast = useUniverseStore((s) => s.highContrast)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.dataset.textSize = textSize
    root.dataset.highContrast = String(highContrast)
  }, [theme, textSize, highContrast])
}

/** Pauses the simulation while the tab is hidden to save battery. */
export function useAutoPauseWhenHidden() {
  useEffect(() => {
    let resumeOnReturn = false

    const handler = () => {
      const store = useUniverseStore.getState()
      if (document.hidden) {
        resumeOnReturn = store.isPlaying
        store.setPlaying(false)
      } else if (resumeOnReturn) {
        store.setPlaying(true)
        resumeOnReturn = false
      }
    }

    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])
}
