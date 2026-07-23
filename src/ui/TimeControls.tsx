import { useEffect, useState } from 'react'
import {
  CalendarDays,
  ChevronsLeft,
  ChevronsRight,
  Pause,
  Play,
  RefreshCw,
  Rewind,
} from 'lucide-react'
import { formatDrift, formatRate, formatSimulationClock } from '@/lib/format'
import { useUniverseStore } from '@/store/useUniverseStore'
import { IconButton } from './primitives'

/**
 * Bottom bar: playback, the simulated date and time, and the rate.
 *
 * The clock starts at the real current moment and, at the default real-time
 * rate, stays there. Speeding time up means it is no longer "now", so a drift
 * badge says how far off it has gone and one click brings it back — a clock
 * that silently disagrees with the viewer's own reads as broken.
 *
 * The rate reads in physical units ("1 day/s") rather than an abstract
 * multiplier, and the date is a real calendar date: positions are computed
 * for it from JPL elements, so the alignments shown are the real ones.
 */
export function TimeControls() {
  const isPlaying = useUniverseStore((s) => s.isPlaying)
  const timeSpeed = useUniverseStore((s) => s.timeSpeed)
  const simulationTime = useUniverseStore((s) => s.simulationTime)
  const useUtc = useUniverseStore((s) => s.useUtc)
  const fps = useUniverseStore((s) => s.fps)

  const togglePlay = useUniverseStore((s) => s.togglePlay)
  const stepRate = useUniverseStore((s) => s.stepRate)
  const reverseTime = useUniverseStore((s) => s.reverseTime)
  const resetTime = useUniverseStore((s) => s.resetTime)
  const jumpTo = useUniverseStore((s) => s.jumpTo)
  const setValue = useUniverseStore((s) => s.set)

  const [showPicker, setShowPicker] = useState(false)

  // Re-render once a second so the drift badge stays honest even when paused.
  const [, tick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const clock = formatSimulationClock(simulationTime, useUtc)
  const drift = formatDrift(simulationTime, Date.now())

  return (
    <footer className="panel pointer-events-auto absolute inset-x-2 bottom-2 z-30 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-2.5 md:inset-x-auto md:bottom-3 md:left-1/2 md:-translate-x-1/2">
      <div className="flex items-center gap-1">
        <IconButton label="Reverse time" onClick={reverseTime} active={timeSpeed < 0}>
          <Rewind className="h-[18px] w-[18px]" />
        </IconButton>
        <IconButton label="Slower" onClick={() => stepRate(-1)}>
          <ChevronsLeft className="h-[18px] w-[18px]" />
        </IconButton>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="grid h-11 w-11 place-items-center rounded-full bg-[var(--panel-accent)] text-black transition-transform hover:scale-105"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
        </button>

        <IconButton label="Faster" onClick={() => stepRate(1)}>
          <ChevronsRight className="h-[18px] w-[18px]" />
        </IconButton>
        <IconButton
          label="Jump to a date"
          onClick={() => setShowPicker((v) => !v)}
          active={showPicker}
        >
          <CalendarDays className="h-[18px] w-[18px]" />
        </IconButton>
        <IconButton label="Back to now" onClick={resetTime}>
          <RefreshCw className="h-[18px] w-[18px]" />
        </IconButton>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="min-w-[6.5rem] text-center font-medium tabular-nums">
          {formatRate(isPlaying ? timeSpeed : 0)}
        </span>

        <button
          type="button"
          onClick={() => setValue('useUtc', !useUtc)}
          title={
            useUtc ? 'Showing UTC — click for local time' : 'Showing local time — click for UTC'
          }
          className="text-[var(--panel-text-dim)] tabular-nums transition-colors hover:text-[var(--panel-text)]"
        >
          {clock.date}
          <span className="ml-2 opacity-80">{clock.time}</span>
          <span className="ml-1 text-xs opacity-60">{clock.zone}</span>
        </button>

        {drift ? (
          <button
            type="button"
            onClick={resetTime}
            title="Simulated time has moved away from now — click to return"
            className="rounded-full bg-[var(--color-warning)]/20 px-2 py-0.5 text-xs font-medium text-[var(--color-warning)] tabular-nums"
          >
            {drift}
          </button>
        ) : (
          <span
            className="flex items-center gap-1.5 text-xs text-[var(--color-success)]"
            title="The simulated clock matches the real one"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
            Live
          </span>
        )}

        <span className="text-xs text-[var(--panel-text-dim)] tabular-nums">{fps} FPS</span>
      </div>

      {showPicker && (
        <div className="flex w-full flex-wrap items-center justify-center gap-2 border-t border-[var(--panel-border)] pt-2">
          <label className="text-xs text-[var(--panel-text-dim)]" htmlFor="jump-date">
            Go to date
          </label>
          <input
            id="jump-date"
            type="date"
            min="1800-01-01"
            max="2050-12-31"
            defaultValue={new Date(simulationTime).toISOString().slice(0, 10)}
            onChange={(e) => {
              const value = Date.parse(`${e.target.value}T12:00:00Z`)
              if (!Number.isNaN(value)) jumpTo(value)
            }}
            className="rounded-[var(--radius-control)] border border-[var(--panel-border)] bg-black/40 px-2 py-1 text-sm text-[var(--panel-text)]"
          />
          <span className="text-xs text-[var(--panel-text-dim)]">
            Positions are accurate 1800–2050
          </span>
        </div>
      )}
    </footer>
  )
}
