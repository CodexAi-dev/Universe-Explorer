import { PLANET_DATA, MOON_DATA } from '@/data/planets'
import { formatDistance } from '@/lib/format'
import { useUniverseStore } from '@/store/useUniverseStore'

const PADDING = 15
const ESTIMATED_WIDTH = 220
const ESTIMATED_HEIGHT = 90

/** Follows the cursor on hover, flipping near the viewport edges. */
export function Tooltip() {
  const hovered = useUniverseStore((s) => s.hovered)
  if (!hovered) return null

  const planet = PLANET_DATA[hovered.name]
  const moon = MOON_DATA[hovered.name]
  if (!planet && !moon) return null

  const name = planet?.name ?? moon.name
  const type = planet?.type ?? `Moon of ${PLANET_DATA[moon.parent]?.name ?? moon.parent}`
  const subtitle = planet
    ? planet.distanceFromSun > 0
      ? `${formatDistance(planet.distanceFromSun, 'km')} from Sun`
      : 'Center of Solar System'
    : `${formatDistance(moon.distanceFromPlanet, 'km')} from planet`

  const flipX = hovered.x + PADDING + ESTIMATED_WIDTH > window.innerWidth
  const flipY = hovered.y + PADDING + ESTIMATED_HEIGHT > window.innerHeight

  return (
    <div
      role="tooltip"
      className="panel pointer-events-none fixed z-40 max-w-[14rem] px-3 py-2 text-sm"
      style={{
        left: flipX ? hovered.x - ESTIMATED_WIDTH - PADDING : hovered.x + PADDING,
        top: flipY ? hovered.y - ESTIMATED_HEIGHT - PADDING : hovered.y + PADDING,
      }}
    >
      <p className="font-semibold">{name}</p>
      <p className="text-xs text-[var(--panel-text-dim)]">{subtitle}</p>
      <p className="text-xs text-[var(--panel-text-dim)]">Type: {type}</p>
    </div>
  )
}
