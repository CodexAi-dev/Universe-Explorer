import { useState } from 'react'
import { COMPARISON_PROPERTIES, PLANET_DATA } from '@/data/planets'
import type { PlanetData } from '@/data/types'
import { formatNumber } from '@/lib/format'
import { useUniverseStore } from '@/store/useUniverseStore'
import type { TextSize, Theme } from '@/store/useUniverseStore'
import { Modal, Select, Toggle } from './primitives'

const PLANET_IDS = [
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

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const state = useUniverseStore()

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="space-y-1">
        <Select<Theme>
          label="Theme"
          value={state.theme}
          onChange={(v) => state.set('theme', v)}
          options={[
            { value: 'space', label: 'Space' },
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Educational' },
          ]}
        />
        <Select<TextSize>
          label="Text size"
          value={state.textSize}
          onChange={(v) => state.set('textSize', v)}
          options={[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ]}
        />
        <Toggle
          label="High contrast"
          checked={state.highContrast}
          onChange={(v) => state.set('highContrast', v)}
        />
        <Toggle
          label="Metric units (km, m/s²)"
          checked={state.metricUnits}
          onChange={(v) => state.set('metricUnits', v)}
        />
        <Toggle
          label="Advanced mode"
          checked={state.advancedMode}
          onChange={(v) => state.set('advancedMode', v)}
        />
      </div>
      <p className="mt-4 text-xs text-[var(--panel-text-dim)]">
        Preferences are saved to this browser automatically.
      </p>
    </Modal>
  )
}

const SHORTCUTS: Array<[string, string]> = [
  ['Space', 'Play / pause the simulation'],
  ['R', 'Reset the camera'],
  ['O', 'Toggle orbit paths'],
  ['L', 'Toggle labels'],
  ['+ / −', 'Speed up / slow down time'],
  ['F', 'Toggle fullscreen'],
  ['H', 'Open or close this help'],
  ['Esc', 'Close dialogs'],
  ['1 – 9', 'Jump to the Sun and each planet'],
]

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Help">
      <section className="space-y-4 text-sm">
        <div>
          <h3 className="mb-1.5 font-semibold">Navigating</h3>
          <ul className="space-y-1 text-[var(--panel-text-dim)]">
            <li>Drag to orbit the camera; scroll or pinch to zoom.</li>
            <li>Click a body to see its details, double-click to fly to it.</li>
            <li>Use the scale selector at the top to move from planets out to the cosmos.</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-1.5 font-semibold">Keyboard shortcuts</h3>
          <dl className="space-y-1">
            {SHORTCUTS.map(([key, description]) => (
              <div key={key} className="flex justify-between gap-4">
                <dt>
                  <kbd className="rounded border border-[var(--panel-border)] bg-black/40 px-1.5 py-0.5 text-xs">
                    {key}
                  </kbd>
                </dt>
                <dd className="text-right text-[var(--panel-text-dim)]">{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </Modal>
  )
}

/** Ratio is only meaningful when both values are numeric. */
function ratioOf(a: unknown, b: unknown): string {
  if (typeof a === 'number' && typeof b === 'number' && b !== 0) return `${(a / b).toFixed(2)}×`
  return '—'
}

function displayValue(value: unknown, unit: string): string {
  if (typeof value === 'number') return formatNumber(value) + (unit ? ` ${unit}` : '')
  return (value as string) || '—'
}

export function CompareModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [left, setLeft] = useState('earth')
  const [right, setRight] = useState('mars')

  const a = PLANET_DATA[left]
  const b = PLANET_DATA[right]
  const maxDiameter = Math.max(a.diameter, b.diameter)

  const options = PLANET_IDS.map((id) => ({ value: id, label: PLANET_DATA[id].name }))

  return (
    <Modal open={open} onClose={onClose} title="Compare Planets" wide>
      <div className="grid grid-cols-2 gap-4">
        <Select label="" value={left} onChange={setLeft} options={options} />
        <Select label="" value={right} onChange={setRight} options={options} />
      </div>

      {/* Discs are scaled by true diameter ratio, floored so tiny bodies stay visible. */}
      <div className="my-6 grid grid-cols-2 place-items-center gap-4">
        {[
          { id: left, data: a },
          { id: right, data: b },
        ].map(({ id, data }) => {
          const size = Math.max((data.diameter / maxDiameter) * 120, 20)
          return (
            <div key={id} className="flex flex-col items-center gap-2">
              <div
                className="rounded-full"
                style={{
                  width: size,
                  height: size,
                  background: `#${data.color.toString(16).padStart(6, '0')}`,
                }}
              />
              <span className="text-sm font-medium">{data.name}</span>
            </div>
          )
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--panel-border)] text-left text-[var(--panel-text-dim)]">
              <th className="py-2 pr-3 font-medium">Property</th>
              <th className="py-2 pr-3 font-medium">{a.name}</th>
              <th className="py-2 pr-3 font-medium">{b.name}</th>
              <th className="py-2 font-medium">Ratio</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_PROPERTIES.map((prop) => {
              const av = a[prop.key as keyof PlanetData]
              const bv = b[prop.key as keyof PlanetData]
              return (
                <tr key={prop.key} className="border-b border-[var(--panel-border)] last:border-b-0">
                  <td className="py-2 pr-3 font-medium">{prop.label}</td>
                  <td className="py-2 pr-3 text-[var(--panel-text-dim)]">
                    {displayValue(av, prop.unit)}
                  </td>
                  <td className="py-2 pr-3 text-[var(--panel-text-dim)]">
                    {displayValue(bv, prop.unit)}
                  </td>
                  <td className="py-2 tabular-nums">{ratioOf(av, bv)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  )
}
