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
export function formatSimulationDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/** Date and time of day, split so they can be styled separately. */
export function formatSimulationClock(ms: number): { date: string; time: string } {
  const d = new Date(ms)
  return {
    date: formatSimulationDate(ms),
    time: d.toISOString().slice(11, 16),
  }
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

  if (seconds < 1.5) return `${sign}Real time`
  if (seconds < 90) return `${sign}${Math.round(seconds)} sec/s`
  if (seconds < 5400) return `${sign}${Math.round(seconds / 60)} min/s`
  if (days < 0.9) return `${sign}${Math.round(seconds / 3600)} hour/s`
  if (days < 6.5) return `${sign}${round1(days)} day/s`
  if (days < 28) return `${sign}${round1(days / 7)} week/s`
  if (days < 300) return `${sign}${round1(days / 30.44)} month/s`
  return `${sign}${round1(days / 365.25)} year/s`
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
