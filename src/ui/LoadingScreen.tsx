import { useEffect, useRef, useState } from 'react'
import { Rocket } from 'lucide-react'

/** Mission status per countdown second, as in v1. */
const MISSION_STATUS: Record<number, string> = {
  9: 'SYSTEMS CHECK',
  8: 'FUEL PRESSURE NOMINAL',
  7: 'GUIDANCE ONLINE',
  6: 'ENGINES ARMED',
  5: 'FINAL COUNTDOWN',
  4: 'IGNITION SEQUENCE',
  3: 'MAIN ENGINES START',
  2: 'FULL THRUST',
  1: 'ALL SYSTEMS GO',
  0: 'WE HAVE LIFTOFF!',
}

const START = 9

/**
 * Shuttle-launch countdown shown over the canvas while the scene warms up.
 * The scene mounts underneath immediately; this only gates visibility.
 */
export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(START)
  const [launched, setLaunched] = useState(false)
  const [hidden, setHidden] = useState(false)
  const completed = useRef(false)

  useEffect(() => {
    // Users who prefer reduced motion skip the whole sequence.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHidden(true)
      onComplete()
      return
    }

    const timer = setInterval(() => {
      setCount((c) => {
        if (c > 0) return c - 1
        clearInterval(timer)
        return 0
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onComplete])

  useEffect(() => {
    if (count !== 0 || completed.current) return
    completed.current = true
    setLaunched(true)

    const reveal = setTimeout(() => setHidden(true), 3200)
    const done = setTimeout(onComplete, 3800)
    return () => {
      clearTimeout(reveal)
      clearTimeout(done)
    }
  }, [count, onComplete])

  if (hidden) return null

  const progress = ((START - count) / START) * 100

  return (
    <div
      className={`fixed inset-0 z-50 grid place-items-center bg-[#050510] transition-opacity duration-700 ${
        launched ? 'opacity-0' : 'opacity-100'
      }`}
      role="status"
      aria-live="polite"
    >
      {/* Starfield backdrop */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1a1a4a_0%,transparent_60%)]" />
      </div>

      <div className="relative flex flex-col items-center gap-6 px-6 text-center">
        <div className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] px-4 py-1.5 text-xs tracking-[0.2em] text-[var(--panel-text-dim)]">
          <Rocket className="h-3.5 w-3.5" />
          MISSION: UNIVERSE EXPLORER
        </div>

        <div
          className={`font-mono text-7xl font-bold tabular-nums transition-transform duration-500 ${
            launched ? 'scale-110 text-[var(--color-success)]' : 'text-[var(--panel-accent)]'
          }`}
        >
          {launched ? 'LIFTOFF' : `T−${count}`}
        </div>

        <div
          className={`text-sm tracking-widest ${
            launched
              ? 'text-[var(--color-success)]'
              : count <= 3
                ? 'text-[var(--color-warning)]'
                : 'text-[var(--panel-text-dim)]'
          }`}
        >
          {MISSION_STATUS[count]}
        </div>

        <div className="h-1 w-64 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[var(--panel-accent)] transition-[width] duration-1000 ease-linear"
            style={{ width: `${launched ? 100 : progress}%` }}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setHidden(true)
            onComplete()
          }}
          className="mt-2 text-xs text-[var(--panel-text-dim)] underline underline-offset-4 hover:text-[var(--panel-text)]"
        >
          Skip
        </button>
      </div>
    </div>
  )
}
