/** Number/unit formatting, ported from v1's `UIController` helpers. */

const KM_TO_MILES = 0.621371
const MS2_TO_FTS2 = 3.28084

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

/** Compacts large distances to K/M, as v1 did in the info panel. */
export function formatDistance(km: number, unit: string): string {
  if (km >= 1_000_000) return `${(km / 1_000_000).toFixed(1)}M ${unit}`
  if (km >= 1_000) return `${(km / 1_000).toFixed(1)}K ${unit}`
  return `${formatNumber(km)} ${unit}`
}

export function formatOrbitalPeriod(days: number): string {
  if (days === 0) return 'N/A'
  if (days < 365) return `${days} days`
  return `${(days / 365.25).toFixed(1)} years (${formatNumber(days)} days)`
}

/** Unit-aware diameter, distance and gravity for the planet info panel. */
export function formatMeasurements(
  data: { diameter: number; distanceFromSun: number; gravity: number },
  metric: boolean,
) {
  if (metric) {
    return {
      diameter: `${formatNumber(data.diameter)} km`,
      distance: formatDistance(data.distanceFromSun, 'km'),
      gravity: `${data.gravity} m/s²`,
    }
  }
  return {
    diameter: `${formatNumber(data.diameter * KM_TO_MILES)} mi`,
    distance: formatDistance(data.distanceFromSun * KM_TO_MILES, 'mi'),
    gravity: `${(data.gravity * MS2_TO_FTS2).toFixed(2)} ft/s²`,
  }
}

/** Simulation clock date, e.g. "March 14, 2026". */
export function formatSimulationDate(ms: number, utc = false): string {
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(utc ? { timeZone: 'UTC' } : {}),
  })
}

/**
 * Date and time of day, split so they can be styled separately.
 *
 * Defaults to the viewer's own timezone: a clock that disagrees with the one
 * on your wall reads as broken, whatever label sits next to it. UTC stays
 * available because it is what astronomy is actually quoted in.
 */
export function formatSimulationClock(
  ms: number,
  utc = false,
): { date: string; time: string; zone: string } {
  const d = new Date(ms)

  if (utc) {
    return {
      date: formatSimulationDate(ms, true),
      time: d.toISOString().slice(11, 16),
      zone: 'UTC',
    }
  }

  return {
    date: formatSimulationDate(ms, false),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    zone: localZoneLabel(),
  }
}

/** Short label for the viewer's timezone, e.g. "GMT+5:30". */
function localZoneLabel(): string {
  const offsetMinutes = -new Date().getTimezoneOffset()
  const sign = offsetMinutes < 0 ? '-' : '+'
  const hours = Math.floor(Math.abs(offsetMinutes) / 60)
  const minutes = Math.abs(offsetMinutes) % 60
  return `GMT${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`
}

/** Offset below which the clock counts as live rather than drifted. */
const LIVE_TOLERANCE_SECONDS = 5

/**
 * How far the simulated clock sits from the real one, as a short label.
 * Returns null while the two agree closely enough to call it live.
 */
export function formatDrift(simulationMs: number, realMs: number): string | null {
  const deltaSeconds = (simulationMs - realMs) / 1000
  const magnitude = Math.abs(deltaSeconds)

  /*
    The clock is published once a second, and a slow renderer stretches that
    to a few, so a small offset is sampling jitter rather than real drift.
    Anything the user actually caused — pausing, scrubbing, speeding up —
    lands far outside this window.
  */
  if (magnitude < LIVE_TOLERANCE_SECONDS) return null

  const sign = deltaSeconds < 0 ? '−' : '+'
  if (magnitude < 90) return `${sign}${Math.round(magnitude)}s`
  if (magnitude < 5400) return `${sign}${Math.round(magnitude / 60)}m`
  if (magnitude < 172_800) return `${sign}${Math.round(magnitude / 3600)}h`
  if (magnitude < 63_072_000) return `${sign}${Math.round(magnitude / 86_400)}d`
  return `${sign}${(magnitude / 31_557_600).toFixed(1)}y`
}

/**
 * Label for the time rate, which is measured in simulated days per real
 * second. Rendering it as "1 hour/s" rather than "0.04x" means the number
 * says something about the physics.
 */
export function formatRate(daysPerSecond: number): string {
  if (daysPerSecond === 0) return 'Paused'

  const sign = daysPerSecond < 0 ? '−' : ''
  const days = Math.abs(daysPerSecond)
  const seconds = days * 86_400

  /*
    Boundaries sit exactly on the unit, not slightly past it. Rounding them up
    (90s, 5400s) meant a rate of one hour per second printed as "60 min/s" —
    correct, but not what anyone would write.
  */
  /** "1 hour/s" but "10 hours/s". */
  const unit = (value: number, name: string) =>
    `${sign}${round1(value)} ${name}${round1(value) === '1' ? '' : 's'}/s`

  if (seconds < 1.5) return `${sign}Real time`
  if (seconds < 60) return `${sign}${Math.round(seconds)} sec/s`
  if (seconds < 3600) return unit(seconds / 60, 'min')
  if (days < 1) return unit(seconds / 3600, 'hour')
  if (days < 7) return unit(days, 'day')
  if (days < 30.44) return unit(days / 7, 'week')
  if (days < 365.25) return unit(days / 30.44, 'month')
  return unit(days / 365.25, 'year')
}

const round1 = (value: number) =>
  value >= 10 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, '')

/** Distance in AU with a km equivalent — AU alone is hard to picture. */
export function formatAu(au: number): string {
  const km = au * 149_597_870.7
  return `${au.toFixed(3)} AU (${(km / 1e6).toFixed(1)}M km)`
}

/** Rotation period as hours or days, whichever reads better. */
export function formatRotation(hours: number): string {
  const magnitude = Math.abs(hours)
  const retrograde = hours < 0 ? ' (retrograde)' : ''
  if (magnitude < 48) return `${magnitude.toFixed(magnitude < 10 ? 3 : 2)} hours${retrograde}`
  return `${(magnitude / 24).toFixed(1)} days${retrograde}`
}

/** Light travel time from the Sun — a distance you can feel. */
export function formatLightTime(au: number): string {
  const minutes = (au * 499.005) / 60
  if (minutes < 1) return `${(minutes * 60).toFixed(0)} seconds`
  if (minutes < 90) return `${minutes.toFixed(1)} minutes`
  return `${(minutes / 60).toFixed(1)} hours`
}
