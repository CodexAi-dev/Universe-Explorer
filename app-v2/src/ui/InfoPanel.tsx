import { useEffect, useState } from 'react'
import { ChevronRight, Crosshair, GitCompare, Lightbulb, Telescope, ZoomIn, ZoomOut } from 'lucide-react'
import { PLANET_DATA, MOON_DATA } from '@/data/planets'
import { EXOTIC_OBJECTS, GALAXIES, NEBULAE, STAR_CLUSTERS } from '@/data/universe'
import type { Selection } from '@/data/types'
import { ALL_FACTS, nextFactIndex } from '@/lib/facts'
import { formatMeasurements, formatOrbitalPeriod } from '@/lib/format'
import { useUniverseStore } from '@/store/useUniverseStore'
import { Button, Stat } from './primitives'

type Tab = 'body' | 'deepSpace' | 'facts'

/** Common view over the four deep-space record types. */
interface DeepSpaceDisplay {
  name: string
  type: string
  description: string
  facts?: string[]
  distance?: string
  diameter?: string
  size?: string
  stars?: string
  mass?: string
  age?: string
  constellation?: string
  location?: string
  magnitude?: number
}

const DEEP_SPACE_GROUPS = [
  { kind: 'galaxy' as const, label: 'Galaxies', source: GALAXIES },
  { kind: 'nebula' as const, label: 'Nebulae', source: NEBULAE },
  { kind: 'cluster' as const, label: 'Star Clusters', source: STAR_CLUSTERS },
  { kind: 'exotic' as const, label: 'Black Holes', source: EXOTIC_OBJECTS },
]

/** Resolves any selection to a common display shape. */
function useSelectedRecord(selection: Selection | null) {
  if (!selection) return null

  switch (selection.kind) {
    case 'planet':
      return { type: 'planet' as const, id: selection.id, data: PLANET_DATA[selection.id] }
    case 'moon':
      return { type: 'moon' as const, id: selection.id, data: MOON_DATA[selection.id] }
    case 'galaxy':
      return { type: 'deep' as const, id: selection.id, data: GALAXIES[selection.id] }
    case 'nebula':
      return { type: 'deep' as const, id: selection.id, data: NEBULAE[selection.id] }
    case 'cluster':
      return { type: 'deep' as const, id: selection.id, data: STAR_CLUSTERS[selection.id] }
    case 'exotic':
      return { type: 'deep' as const, id: selection.id, data: EXOTIC_OBJECTS[selection.id] }
    default:
      return null
  }
}

function PlanetDetails({ id }: { id: string }) {
  const data = PLANET_DATA[id]
  const metric = useUniverseStore((s) => s.metricUnits)
  const surfaceViewPlanet = useUniverseStore((s) => s.surfaceViewPlanet)
  const toggleSurfaceView = useUniverseStore((s) => s.toggleSurfaceView)
  const focusPlanet = useUniverseStore((s) => s.focusPlanet)

  const m = formatMeasurements(data, metric)
  const inSurfaceView = surfaceViewPlanet === id

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">{data.name}</h3>
        <p className="text-sm text-[var(--panel-text-dim)]">{data.type}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="primary" onClick={() => focusPlanet(id)}>
          <Crosshair className="h-4 w-4" /> Focus
        </Button>
        <Button active={inSurfaceView} onClick={() => toggleSurfaceView(id)}>
          {inSurfaceView ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
          {inSurfaceView ? 'Exit Surface' : 'Surface View'}
        </Button>
      </div>

      <div>
        <Stat label="Diameter" value={m.diameter} />
        <Stat label="Mass" value={`${data.mass} kg`} />
        <Stat label="Gravity" value={m.gravity} />
        <Stat label="Distance from Sun" value={m.distance} />
        <Stat label="Orbital Period" value={formatOrbitalPeriod(data.orbitalPeriod)} />
        <Stat label="Moons" value={data.moons} />
        <Stat label="Temperature" value={data.temperature} />
        <Stat label="Day Length" value={data.dayLength} />
      </div>

      <p className="text-sm leading-relaxed text-[var(--panel-text-dim)]">{data.description}</p>

      {data.facts.length > 0 && (
        <div>
          <h4 className="mb-1.5 text-xs font-semibold tracking-wide uppercase">Did you know?</h4>
          <ul className="space-y-1 text-sm text-[var(--panel-text-dim)]">
            {data.facts.map((fact) => (
              <li key={fact} className="flex gap-2">
                <span className="text-[var(--panel-accent)]">•</span>
                {fact}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function MoonDetails({ id }: { id: string }) {
  const data = MOON_DATA[id]
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">{data.name}</h3>
        <p className="text-sm text-[var(--panel-text-dim)]">
          Moon of {PLANET_DATA[data.parent]?.name ?? data.parent}
        </p>
      </div>
      <div>
        <Stat label="Diameter" value={`${data.diameter.toLocaleString()} km`} />
        <Stat label="Distance from planet" value={`${data.distanceFromPlanet.toLocaleString()} km`} />
        <Stat label="Orbital Period" value={`${data.orbitalPeriod} days`} />
      </div>
      <p className="text-sm leading-relaxed text-[var(--panel-text-dim)]">{data.description}</p>
    </div>
  )
}

/** Deep-space objects share enough shape to render from one component. */
function DeepSpaceDetails({ selection }: { selection: Selection }) {
  const focusDeepSpace = useUniverseStore((s) => s.focusDeepSpace)
  const record = useSelectedRecord(selection)
  if (!record || record.type !== 'deep' || !record.data) return null

  // The four deep-space types share a core shape and differ only in which
  // optional descriptors they carry, so one widened view renders them all.
  const data: DeepSpaceDisplay = record.data

  const rows: Array<[string, unknown]> = [
    ['Distance', data.distance],
    ['Diameter', data.diameter],
    ['Size', data.size],
    ['Stars', data.stars],
    ['Mass', data.mass],
    ['Age', data.age],
    ['Constellation', data.constellation],
    ['Location', data.location],
    ['Magnitude', data.magnitude],
  ]

  const focusable = selection.kind !== 'cluster'

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">{data.name}</h3>
        <p className="text-sm text-[var(--panel-text-dim)]">{data.type}</p>
      </div>

      {focusable && (
        <Button variant="primary" className="w-full" onClick={() => focusDeepSpace(selection)}>
          <Crosshair className="h-4 w-4" /> Travel Here
        </Button>
      )}

      <div>
        {rows
          .filter(([, value]) => value !== undefined)
          .map(([label, value]) => (
            <Stat key={label} label={label} value={String(value)} />
          ))}
      </div>

      <p className="text-sm leading-relaxed text-[var(--panel-text-dim)]">{data.description}</p>

      {data.facts && (
        <ul className="space-y-1 text-sm text-[var(--panel-text-dim)]">
          {data.facts.map((fact) => (
            <li key={fact} className="flex gap-2">
              <span className="text-[var(--panel-accent)]">•</span>
              {fact}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function DeepSpaceBrowser() {
  const select = useUniverseStore((s) => s.select)
  const selected = useUniverseStore((s) => s.selected)

  return (
    <div className="space-y-4">
      {DEEP_SPACE_GROUPS.map((group) => (
        <div key={group.kind}>
          <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-[var(--panel-text-dim)] uppercase">
            {group.label}
          </h4>
          <div className="space-y-1">
            {Object.entries(group.source).map(([id, data]) => {
              const active = selected?.kind === group.kind && selected.id === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => select({ kind: group.kind, id })}
                  className={`w-full rounded-[var(--radius-control)] px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? 'bg-[var(--panel-accent)]/25 text-[var(--panel-text)]'
                      : 'text-[var(--panel-text-dim)] hover:bg-white/8 hover:text-[var(--panel-text)]'
                  }`}
                >
                  {data.name}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function FactsTab() {
  const [index, setIndex] = useState(() => nextFactIndex(-1))

  // v1 rotated the fact every 30 seconds.
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => nextFactIndex(i)), 30_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-panel)] bg-black/30 p-4">
        <p className="text-sm leading-relaxed">{ALL_FACTS[index]}</p>
      </div>
      <Button className="w-full" onClick={() => setIndex((i) => nextFactIndex(i))}>
        <Lightbulb className="h-4 w-4" /> Next Fact
      </Button>
    </div>
  )
}

interface InfoPanelProps {
  collapsed: boolean
  onToggleCollapsed: () => void
  onCompare: () => void
}

/** Right panel: details for the current selection, a deep-space browser and facts. */
export function InfoPanel({ collapsed, onToggleCollapsed, onCompare }: InfoPanelProps) {
  const selected = useUniverseStore((s) => s.selected)
  const [tab, setTab] = useState<Tab>('body')

  // Selecting anything in the scene brings its details forward.
  useEffect(() => {
    if (selected) setTab('body')
  }, [selected])

  const tabs: Array<{ id: Tab; label: string; icon: typeof Telescope }> = [
    { id: 'body', label: 'Info', icon: Crosshair },
    { id: 'deepSpace', label: 'Deep Space', icon: Telescope },
    { id: 'facts', label: 'Facts', icon: Lightbulb },
  ]

  return (
    <aside
      className={`panel pointer-events-auto absolute top-[calc(var(--spacing-header)+1rem)] right-2 bottom-28 z-20 flex w-[min(22rem,calc(100vw-1rem))] flex-col transition-transform md:right-3 ${
        collapsed ? 'translate-x-[calc(100%+1rem)]' : 'translate-x-0'
      }`}
      aria-label="Information"
    >
      <header className="flex items-center gap-1 border-b border-[var(--panel-border)] px-2 py-2">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label="Collapse information panel"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--panel-text-dim)] hover:bg-white/10"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-control)] px-2 py-1.5 text-xs whitespace-nowrap transition-colors ${
              tab === id
                ? 'bg-[var(--panel-accent)]/25 text-[var(--panel-accent)]'
                : 'text-[var(--panel-text-dim)] hover:bg-white/10'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {tab === 'body' &&
          (!selected ? (
            <p className="py-8 text-center text-sm text-[var(--panel-text-dim)]">
              Click any planet, moon or deep-space object to see its details.
            </p>
          ) : selected.kind === 'planet' ? (
            <PlanetDetails id={selected.id} />
          ) : selected.kind === 'moon' ? (
            <MoonDetails id={selected.id} />
          ) : (
            <DeepSpaceDetails selection={selected} />
          ))}

        {tab === 'deepSpace' && <DeepSpaceBrowser />}
        {tab === 'facts' && <FactsTab />}
      </div>

      <footer className="border-t border-[var(--panel-border)] p-3">
        <Button className="w-full" onClick={onCompare}>
          <GitCompare className="h-4 w-4" /> Compare Planets
        </Button>
      </footer>
    </aside>
  )
}
