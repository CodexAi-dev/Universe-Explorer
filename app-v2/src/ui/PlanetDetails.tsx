import { useEffect, useState } from 'react'
import { Crosshair, ZoomIn, ZoomOut } from 'lucide-react'
import { PLANET_DATA } from '@/data/planets'
import { PHYSICAL } from '@/data/physical'
import { orbitalPeriodDays, elementsAt } from '@/data/ephemeris'
import { liveState } from '@/three/simulation'
import { inEarthRadii } from '@/three/scale'
import {
  formatAu,
  formatLightTime,
  formatMeasurements,
  formatNumber,
  formatRotation,
} from '@/lib/format'
import { useUniverseStore } from '@/store/useUniverseStore'
import { Button, Stat } from './primitives'

/** Relative sunlight, as a multiple or a fraction — whichever reads clearly. */
function formatSunlight(ratio: number): string {
  if (ratio >= 1) return `${ratio.toFixed(1)} ×`
  return `1/${Math.round(1 / ratio)} ×`
}

/**
 * Describe the season from where the Sun stands overhead.
 *
 * The sign alone fixes the hemisphere; how close the latitude is to the
 * planet's obliquity says how near a solstice it is. Whether the season is
 * advancing toward or away from that solstice needs the trend, so this
 * reports position within the cycle rather than guessing spring vs autumn.
 */
function seasonFrom(subSolarLatitude: number, obliquity: number): string {
  // Venus, Uranus and Pluto are tipped past 90°, so "north" flips meaning.
  const tilt = obliquity > 90 ? 180 - obliquity : obliquity
  if (tilt < 3) return 'Almost no seasons — the axis is barely tilted'

  const fraction = subSolarLatitude / Math.max(tilt, 1)
  const hemisphere = subSolarLatitude >= 0 ? 'Northern' : 'Southern'

  if (Math.abs(fraction) > 0.92) return `${hemisphere} summer solstice`
  if (Math.abs(fraction) < 0.08) return 'Equinox — day and night nearly equal'
  if (Math.abs(fraction) > 0.5) return `${hemisphere} summer`
  return `${hemisphere} hemisphere tilting toward the Sun`
}

/**
 * Values that change as the simulation runs, sampled on a timer rather than
 * per frame — the numbers are unreadable if they update 60 times a second.
 */
function useLiveValues(id: string) {
  const [snapshot, setSnapshot] = useState(() => liveState.get(id))

  useEffect(() => {
    setSnapshot(liveState.get(id))
    const timer = setInterval(() => setSnapshot(liveState.get(id)), 250)
    return () => clearInterval(timer)
  }, [id])

  return snapshot
}

export function PlanetDetails({ id }: { id: string }) {
  const data = PLANET_DATA[id]
  const physical = PHYSICAL[id]

  const metric = useUniverseStore((s) => s.metricUnits)
  const advanced = useUniverseStore((s) => s.advancedMode)
  const simulationTime = useUniverseStore((s) => s.simulationTime)
  const surfaceViewPlanet = useUniverseStore((s) => s.surfaceViewPlanet)
  const toggleSurfaceView = useUniverseStore((s) => s.toggleSurfaceView)
  const focusPlanet = useUniverseStore((s) => s.focusPlanet)

  const live = useLiveValues(id)
  const m = formatMeasurements(data, metric)
  const inSurfaceView = surfaceViewPlanet === id
  const isSun = id === 'sun'

  const elements = isSun ? null : elementsAt(id, simulationTime)

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

      {/* Live values: these tick as the simulated clock advances. */}
      {live && !isSun && (
        <section>
          <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-[var(--panel-accent)] uppercase">
            Right now
          </h4>
          <Stat label="Distance from Sun" value={formatAu(live.distanceAu)} />
          <Stat label="Sunlight delay" value={formatLightTime(live.distanceAu)} />
          <Stat label="Orbital speed" value={`${live.velocityKms.toFixed(2)} km/s`} />
          {/* Illumination falls off as 1/r² — the reason Neptune is frozen. */}
          <Stat
            label="Sunlight vs Earth"
            value={formatSunlight(1 / (live.distanceAu * live.distanceAu))}
          />
          <Stat label="Sub-solar latitude" value={`${live.subSolarLatitude.toFixed(1)}°`} />
          <p className="pt-1.5 text-xs text-[var(--panel-text-dim)]">
            {seasonFrom(live.subSolarLatitude, physical.obliquityDeg)}
          </p>
        </section>
      )}

      <section>
        <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-[var(--panel-text-dim)] uppercase">
          Rotation &amp; day
        </h4>
        <Stat label="Sidereal rotation" value={formatRotation(physical.siderealRotationHours)} />
        <Stat label="Solar day" value={formatRotation(physical.solarDayHours)} />
        <Stat label="Axial tilt" value={`${physical.obliquityDeg}°`} />
        {live && (
          <Stat label="Current spin angle" value={`${((live.rotationDeg + 360) % 360).toFixed(0)}°`} />
        )}
      </section>

      <section>
        <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-[var(--panel-text-dim)] uppercase">
          Body
        </h4>
        <Stat label="Radius" value={`${formatNumber(physical.radiusKm)} km`} />
        <Stat label="Size vs Earth" value={`${inEarthRadii(id).toFixed(2)} ×`} />
        <Stat label="Diameter" value={m.diameter} />
        <Stat label="Mass" value={`${data.mass} kg`} />
        <Stat label="Density" value={`${formatNumber(physical.densityKgM3)} kg/m³`} />
        <Stat label="Surface gravity" value={m.gravity} />
        <Stat label="Escape velocity" value={`${physical.escapeVelocityKms} km/s`} />
        <Stat label="Mean temperature" value={`${physical.meanTempC} °C`} />
        <Stat label="Reflects (albedo)" value={`${(physical.albedo * 100).toFixed(1)}%`} />
        <Stat label="Moons" value={physical.moonCount} />
        {physical.atmosphere && <Stat label="Atmosphere" value={physical.atmosphere} />}
      </section>

      {elements && (
        <section>
          <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-[var(--panel-text-dim)] uppercase">
            Orbit
          </h4>
          <Stat label="Semi-major axis" value={`${elements.a.toFixed(4)} AU`} />
          <Stat label="Eccentricity" value={elements.e.toFixed(4)} />
          <Stat label="Inclination" value={`${elements.i.toFixed(2)}°`} />
          <Stat
            label="Orbital period"
            value={`${(orbitalPeriodDays(elements.a) / 365.25).toFixed(2)} years`}
          />
          {advanced && (
            <>
              <Stat label="Longitude of node (Ω)" value={`${elements.node.toFixed(2)}°`} />
              <Stat label="Longitude of perihelion (ϖ)" value={`${elements.peri.toFixed(2)}°`} />
              <Stat label="Mean longitude (L)" value={`${(elements.L % 360).toFixed(2)}°`} />
            </>
          )}
          <p className="pt-1.5 text-xs text-[var(--panel-text-dim)]">
            {elements.e < 0.02
              ? 'A nearly circular orbit.'
              : `Eccentricity ${elements.e.toFixed(3)} means the distance to the Sun varies by about ${(elements.e * 200).toFixed(0)}% between perihelion and aphelion.`}
          </p>
        </section>
      )}

      <p className="text-sm leading-relaxed text-[var(--panel-text-dim)]">{data.description}</p>

      {/* Be explicit where the imagery isn't observational. */}
      {id === 'pluto' && (
        <p className="text-xs text-[var(--panel-text-dim)] italic">
          Pluto's surface here is procedural, not photographic — Tombaugh Regio is
          drawn approximately. All figures above are measured values.
        </p>
      )}

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
