import { ChevronLeft, Eye, Orbit, Rocket, Ruler, Sliders, Sparkles, Video } from 'lucide-react'
import { useUniverseStore } from '@/store/useUniverseStore'
import type { BooleanKey, Quality } from '@/store/useUniverseStore'
import { Button, Section, Select, Toggle } from './primitives'

const VIEW_OPTIONS: Array<{ key: BooleanKey; label: string }> = [
  { key: 'showOrbits', label: 'Orbit Paths' },
  { key: 'showLabels', label: 'Planet Labels' },
  { key: 'showMoons', label: 'Moons' },
  { key: 'showStars', label: 'Milky Way' },
  { key: 'showClouds', label: 'Cloud Layers' },
  { key: 'showAtmospheres', label: 'Atmospheres' },
  { key: 'showAsteroidBelt', label: 'Asteroid Belt' },
  { key: 'showPluto', label: 'Pluto' },
]

const UNIVERSE_OPTIONS: Array<{ key: BooleanKey; label: string }> = [
  { key: 'showNebulae', label: 'Nebulae' },
  { key: 'showGalaxies', label: 'Galaxies' },
  { key: 'showMilkyWay', label: 'Milky Way' },
  { key: 'showBlackHoles', label: 'Black Holes' },
]

const SPACE_OPTIONS: Array<{ key: BooleanKey; label: string }> = [
  { key: 'showSatellites', label: 'Satellites' },
  { key: 'showAlienShips', label: 'Alien Ships' },
  { key: 'showComets', label: 'Comets' },
]

const QUALITY_OPTIONS: Array<{ value: Quality; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'ultra', label: 'Ultra' },
]

interface ControlPanelProps {
  collapsed: boolean
  onToggleCollapsed: () => void
}

/** Left panel: layer visibility, camera and rendering quality. */
export function ControlPanel({ collapsed, onToggleCollapsed }: ControlPanelProps) {
  const state = useUniverseStore()

  return (
    <aside
      className={`panel pointer-events-auto absolute top-[calc(var(--spacing-header)+1rem)] bottom-28 left-2 z-20 flex w-[min(20rem,calc(100vw-1rem))] flex-col transition-transform md:left-3 ${
        collapsed ? '-translate-x-[calc(100%+1rem)]' : 'translate-x-0'
      }`}
      aria-label="Controls"
    >
      <header className="flex items-center justify-between border-b border-[var(--panel-border)] px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Sliders className="h-4 w-4" /> Controls
        </h3>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label="Collapse controls panel"
          className="grid h-7 w-7 place-items-center rounded-full text-[var(--panel-text-dim)] hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <Section title="View Options" icon={<Eye className="h-3.5 w-3.5" />}>
          {VIEW_OPTIONS.map((o) => (
            <Toggle
              key={o.key}
              label={o.label}
              checked={state[o.key]}
              onChange={() => state.toggle(o.key)}
            />
          ))}
        </Section>

        <Section title="Universe Objects" icon={<Sparkles className="h-3.5 w-3.5" />}>
          {UNIVERSE_OPTIONS.map((o) => (
            <Toggle
              key={o.key}
              label={o.label}
              checked={state[o.key]}
              onChange={() => state.toggle(o.key)}
            />
          ))}
        </Section>

        <Section title="Space Objects" icon={<Rocket className="h-3.5 w-3.5" />}>
          {SPACE_OPTIONS.map((o) => (
            <Toggle
              key={o.key}
              label={o.label}
              checked={state[o.key]}
              onChange={() => state.toggle(o.key)}
            />
          ))}
        </Section>

        <Section title="Scale" icon={<Ruler className="h-3.5 w-3.5" />}>
          <Select
            label="Distances"
            value={state.distanceMode}
            onChange={(v) => state.set('distanceMode', v)}
            options={[
              { value: 'compressed', label: 'Compressed' },
              { value: 'true', label: 'True to scale' },
            ]}
          />
          <Select
            label="Body sizes"
            value={state.sizeMode}
            onChange={(v) => state.set('sizeMode', v)}
            options={[
              { value: 'enhanced', label: 'Enhanced' },
              { value: 'true', label: 'True to scale' },
            ]}
          />
          <p className="pt-1 text-xs text-[var(--panel-text-dim)]">
            {state.distanceMode === 'true' && state.sizeMode === 'true'
              ? 'This is the real Solar System: almost entirely empty space. Earth is now about 1/12,000 the width of its own orbit.'
              : state.distanceMode === 'true'
                ? 'Real orbital spacing. Neptune sits 30× further out than Earth.'
                : state.sizeMode === 'true'
                  ? 'Real relative sizes. The Sun is 109 Earths across.'
                  : 'Sizes follow √radius and distances are compressed, so everything stays visible at once. Positions and orbit shapes are still real.'}
          </p>
        </Section>

        <Section title="Camera" icon={<Video className="h-3.5 w-3.5" />}>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Button onClick={() => state.setCameraViewMode('3d')}>3D</Button>
            <Button onClick={() => state.setCameraViewMode('top')}>Top</Button>
            <Button onClick={() => state.setCameraViewMode('side')}>Side</Button>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button onClick={state.resetCamera}>Reset</Button>
            <Button active={state.autoOrbit} onClick={() => state.toggle('autoOrbit')}>
              <Orbit className="h-4 w-4" /> Auto
            </Button>
          </div>
        </Section>

        <Section title="Lighting">
          <Toggle
            label="True 1/r² sunlight"
            checked={state.realisticLight}
            onChange={() => state.toggle('realisticLight')}
          />
          <p className="pt-1 text-xs text-[var(--panel-text-dim)]">
            {state.realisticLight
              ? 'Physically correct falloff. The outer planets go very dark — Neptune really does receive about 1/900th of Earth’s sunlight.'
              : 'Softened falloff so the outer planets stay visible. Each planet’s true share of sunlight is still listed in its info panel.'}
          </p>
        </Section>

        <Section title="Quality">
          <Select
            label="Rendering"
            value={state.quality}
            onChange={(q) => state.set('quality', q)}
            options={QUALITY_OPTIONS}
          />
          <p className="pt-1 text-xs text-[var(--panel-text-dim)]">
            Lower quality reduces star count, sphere detail and disables bloom.
          </p>
        </Section>
      </div>
    </aside>
  )
}
