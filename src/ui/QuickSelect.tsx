import { PLANET_DATA } from '@/data/planets'
import { useUniverseStore } from '@/store/useUniverseStore'

const IDS = [
  'sun',
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
]

/** Swatch colour for each body, taken straight from its data. */
const swatch = (id: string) => `#${PLANET_DATA[id].color.toString(16).padStart(6, '0')}`

/** Horizontal planet picker; selects and flies the camera in one click. */
export function QuickSelect() {
  const selected = useUniverseStore((s) => s.selected)
  const showPluto = useUniverseStore((s) => s.showPluto)
  const select = useUniverseStore((s) => s.select)
  const focusPlanet = useUniverseStore((s) => s.focusPlanet)

  const visible = IDS.filter((id) => id !== 'pluto' || showPluto)

  return (
    <nav
      aria-label="Quick select body"
      className="panel pointer-events-auto absolute bottom-24 left-1/2 z-20 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 gap-1 overflow-x-auto px-2 py-2 md:bottom-24"
    >
      {visible.map((id) => {
        const active = selected?.kind === 'planet' && selected.id === id
        return (
          <button
            key={id}
            type="button"
            title={PLANET_DATA[id].name}
            aria-pressed={active}
            onClick={() => {
              select({ kind: 'planet', id })
              focusPlanet(id)
            }}
            className={`flex shrink-0 items-center gap-2 rounded-[var(--radius-control)] px-2.5 py-1.5 text-xs transition-colors ${
              active
                ? 'bg-[var(--panel-accent)]/25 text-[var(--panel-text)]'
                : 'text-[var(--panel-text-dim)] hover:bg-white/10 hover:text-[var(--panel-text)]'
            }`}
          >
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: swatch(id) }}
              aria-hidden
            />
            <span className="hidden sm:inline">{PLANET_DATA[id].name}</span>
          </button>
        )
      })}
    </nav>
  )
}
