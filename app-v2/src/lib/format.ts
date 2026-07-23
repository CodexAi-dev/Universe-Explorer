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
  })
}

/** Human label for the time-speed multiplier. */
export function formatSpeed(speed: number): string {
  if (speed === 0) return 'Paused'
  const magnitude = Math.abs(speed)
  const label = magnitude >= 1 ? `${magnitude.toFixed(magnitude < 10 ? 1 : 0)}x` : `${magnitude.toFixed(2)}x`
  return speed < 0 ? `-${label}` : label
}
