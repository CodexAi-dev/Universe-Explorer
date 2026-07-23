import { FastForward, Pause, Play, RefreshCw, Rewind, Clock } from 'lucide-react'
import { formatSimulationDate, formatSpeed } from '@/lib/format'
import { useUniverseStore } from '@/store/useUniverseStore'
import { IconButton } from './primitives'

/** Bottom bar: playback, simulation date, speed and FPS. */
export function TimeControls() {
  const isPlaying = useUniverseStore((s) => s.isPlaying)
  const timeSpeed = useUniverseStore((s) => s.timeSpeed)
  const simulationTime = useUniverseStore((s) => s.simulationTime)
  const fps = useUniverseStore((s) => s.fps)

  const togglePlay = useUniverseStore((s) => s.togglePlay)
  const nudgeSpeed = useUniverseStore((s) => s.nudgeSpeed)
  const reverseTime = useUniverseStore((s) => s.reverseTime)
  const setTimeSpeed = useUniverseStore((s) => s.setTimeSpeed)
  const resetTime = useUniverseStore((s) => s.resetTime)

  return (
    <footer className="panel pointer-events-auto absolute inset-x-2 bottom-2 z-30 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-2.5 md:inset-x-auto md:bottom-3 md:left-1/2 md:-translate-x-1/2">
      <div className="flex items-center gap-1">
        <IconButton label="Reverse time" onClick={reverseTime} active={timeSpeed < 0}>
          <Rewind className="h-4.5 w-4.5" />
        </IconButton>
        <IconButton label="Slower" onClick={() => nudgeSpeed(0.5)}>
          <span className="text-lg leading-none">−</span>
        </IconButton>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="grid h-11 w-11 place-items-center rounded-full bg-[var(--panel-accent)] text-black transition-transform hover:scale-105"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
        </button>

        <IconButton label="Faster" onClick={() => nudgeSpeed(2)}>
          <span className="text-lg leading-none">+</span>
        </IconButton>
        <IconButton label="Real-time speed" onClick={() => setTimeSpeed(1)}>
          <Clock className="h-4.5 w-4.5" />
        </IconButton>
        <IconButton label="Reset to today" onClick={resetTime}>
          <RefreshCw className="h-4.5 w-4.5" />
        </IconButton>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <FastForward className="h-3.5 w-3.5 text-[var(--panel-text-dim)]" />
          <span className="tabular-nums">{formatSpeed(isPlaying ? timeSpeed : 0)}</span>
        </div>
        <span className="hidden text-[var(--panel-text-dim)] tabular-nums sm:inline">
          {formatSimulationDate(simulationTime)}
        </span>
        <span className="text-xs text-[var(--panel-text-dim)] tabular-nums">{fps} FPS</span>
      </div>
    </footer>
  )
}
