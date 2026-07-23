import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Selection, ViewScaleId } from '@/data/types'

export type Quality = 'low' | 'medium' | 'high' | 'ultra'
export type Theme = 'space' | 'light' | 'dark'
export type TextSize = 'small' | 'medium' | 'large'
export type CameraViewMode = '3d' | 'top' | 'side'

/**
 * Imperative camera requests. The scene owns the camera, so UI code raises a
 * command and `CameraRig` consumes it; `nonce` makes repeats of the same
 * command (e.g. "reset" twice) distinct.
 */
export type CameraCommand =
  | { kind: 'reset'; nonce: number }
  | { kind: 'viewMode'; mode: CameraViewMode; nonce: number }
  | { kind: 'focusPlanet'; name: string; nonce: number }
  | { kind: 'focusDeepSpace'; selection: Selection; nonce: number }
  | { kind: 'scale'; view: ViewScaleId; nonce: number }

/** Per-view visibility defaults, matching v1's `setUniverseView`. */
export const VIEW_PRESETS: Record<
  ViewScaleId,
  { showGalaxies: boolean; showNebulae: boolean; showMilkyWay: boolean; cameraDistance: number }
> = {
  solarSystem: { showGalaxies: false, showNebulae: false, showMilkyWay: false, cameraDistance: 200 },
  interstellar: { showGalaxies: false, showNebulae: true, showMilkyWay: false, cameraDistance: 500 },
  galactic: { showGalaxies: false, showNebulae: true, showMilkyWay: true, cameraDistance: 1500 },
  intergalactic: { showGalaxies: true, showNebulae: true, showMilkyWay: true, cameraDistance: 5000 },
  cosmic: { showGalaxies: true, showNebulae: true, showMilkyWay: true, cameraDistance: 15000 },
}

export interface UniverseState {
  // ---- view scale
  currentView: ViewScaleId

  // ---- time
  isPlaying: boolean
  timeSpeed: number
  simulationTime: number

  // ---- solar system layers
  showOrbits: boolean
  showLabels: boolean
  showMoons: boolean
  showStars: boolean
  showAsteroidBelt: boolean
  showPluto: boolean

  // ---- deep space layers
  showNebulae: boolean
  showGalaxies: boolean
  showMilkyWay: boolean
  showBlackHoles: boolean

  // ---- space objects
  showSatellites: boolean
  showAlienShips: boolean
  showComets: boolean

  // ---- camera
  autoOrbit: boolean
  camera: CameraCommand

  // ---- selection
  selected: Selection | null
  hovered: { name: string; x: number; y: number } | null
  surfaceViewPlanet: string | null

  // ---- rendering / prefs
  quality: Quality
  planetSizeMultiplier: number
  theme: Theme
  textSize: TextSize
  highContrast: boolean
  metricUnits: boolean
  advancedMode: boolean
  fps: number

  // ---- actions
  setView: (view: ViewScaleId) => void
  toggle: (key: BooleanKey) => void
  set: <K extends keyof UniverseState>(key: K, value: UniverseState[K]) => void

  setPlaying: (playing: boolean) => void
  togglePlay: () => void
  setTimeSpeed: (speed: number) => void
  nudgeSpeed: (factor: number) => void
  reverseTime: () => void
  resetTime: () => void
  advanceTime: (deltaMs: number) => void

  select: (selection: Selection | null) => void
  setHovered: (hovered: UniverseState['hovered']) => void
  toggleSurfaceView: (planet: string) => void
  exitSurfaceView: () => void

  resetCamera: () => void
  setCameraViewMode: (mode: CameraViewMode) => void
  focusPlanet: (name: string) => void
  focusDeepSpace: (selection: Selection) => void
}

/** Keys that `toggle()` accepts. */
export type BooleanKey = {
  [K in keyof UniverseState]: UniverseState[K] extends boolean ? K : never
}[keyof UniverseState]

let nonce = 0
const next = () => ++nonce

export const useUniverseStore = create<UniverseState>()(
  subscribeWithSelector((setState) => ({
    currentView: 'solarSystem',

    isPlaying: true,
    timeSpeed: 1,
    simulationTime: Date.now(),

    showOrbits: true,
    showLabels: true,
    showMoons: false,
    showStars: true,
    showAsteroidBelt: false,
    showPluto: false,

    showNebulae: false,
    showGalaxies: false,
    showMilkyWay: false,
    showBlackHoles: false,

    showSatellites: true,
    showAlienShips: true,
    showComets: true,

    autoOrbit: false,
    camera: { kind: 'reset', nonce: 0 },

    selected: null,
    hovered: null,
    surfaceViewPlanet: null,

    quality: 'medium',
    planetSizeMultiplier: 5,
    theme: 'space',
    textSize: 'medium',
    highContrast: false,
    metricUnits: true,
    advancedMode: false,
    fps: 60,

    setView: (view) => {
      const preset = VIEW_PRESETS[view]
      setState({
        currentView: view,
        showGalaxies: preset.showGalaxies,
        showNebulae: preset.showNebulae,
        showMilkyWay: preset.showMilkyWay,
        // v1 tied black-hole visibility to the nebulae toggle.
        showBlackHoles: preset.showNebulae,
        camera: { kind: 'scale', view, nonce: next() },
      })
    },

    toggle: (key) => setState((s) => ({ [key]: !s[key] }) as Partial<UniverseState>),
    set: (key, value) => setState({ [key]: value } as Partial<UniverseState>),

    setPlaying: (isPlaying) => setState({ isPlaying }),
    togglePlay: () => setState((s) => ({ isPlaying: !s.isPlaying })),
    setTimeSpeed: (timeSpeed) => setState({ timeSpeed }),

    /** Step the speed multiplier, clamped to v1's usable range. */
    nudgeSpeed: (factor) =>
      setState((s) => {
        const magnitude = Math.min(1000, Math.max(0.1, Math.abs(s.timeSpeed) * factor))
        return { timeSpeed: s.timeSpeed < 0 ? -magnitude : magnitude }
      }),

    reverseTime: () => setState((s) => ({ timeSpeed: -s.timeSpeed })),
    resetTime: () => setState({ simulationTime: Date.now(), timeSpeed: 1 }),
    advanceTime: (deltaMs) => setState((s) => ({ simulationTime: s.simulationTime + deltaMs })),

    select: (selected) => setState({ selected }),
    setHovered: (hovered) => setState({ hovered }),

    toggleSurfaceView: (planet) =>
      setState((s) => ({
        surfaceViewPlanet: s.surfaceViewPlanet === planet ? null : planet,
      })),

    exitSurfaceView: () => setState({ surfaceViewPlanet: null }),

    resetCamera: () => setState({ camera: { kind: 'reset', nonce: next() } }),

    setCameraViewMode: (mode) =>
      setState({ camera: { kind: 'viewMode', mode, nonce: next() } }),

    focusPlanet: (name) =>
      setState({ camera: { kind: 'focusPlanet', name, nonce: next() } }),

    focusDeepSpace: (selection) =>
      setState({
        selected: selection,
        camera: { kind: 'focusDeepSpace', selection, nonce: next() },
      }),
  })),
)

/** Read state outside React (inside `useFrame`, event handlers, …). */
export const universeState = () => useUniverseStore.getState()
