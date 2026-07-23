import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  elementsAt,
  orbitalPeriodDays,
  orbitalStateAt,
  orbitalVelocity,
} from './ephemeris.ts'

/**
 * The app claims to show real planetary positions, so the ephemeris is
 * checked against independently-known astronomical facts rather than against
 * its own output. Every expected value below comes from an observation or a
 * published figure, not from this implementation.
 *
 * Run with: npm test
 */

const DEG = 180 / Math.PI
const AU = 149_597_870.7

/** Heliocentric ecliptic longitude, degrees. */
const longitude = (s: { x: number; y: number }) =>
  (Math.atan2(s.y, s.x) * DEG + 360) % 360

/** Longitude as seen from Earth — what an observer actually sees in the sky. */
function geocentricLongitude(planet: string, unixMs: number) {
  const p = orbitalStateAt(planet, unixMs)!
  const e = orbitalStateAt('earth', unixMs)!
  return (Math.atan2(p.y - e.y, p.x - e.x) * DEG + 360) % 360
}

function close(actual: number, expected: number, tolerance: number, what: string) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${what}: got ${actual.toFixed(4)}, expected ${expected} ± ${tolerance}`,
  )
}

test('Earth reaches perihelion in early January and aphelion in early July', () => {
  let min = Infinity
  let max = -Infinity
  let minDay = 0
  let maxDay = 0

  for (let day = 0; day < 366; day++) {
    const t = Date.UTC(2024, 0, 1) + day * 86_400_000
    const { r } = orbitalStateAt('earth', t)!
    if (r < min) [min, minDay] = [r, day]
    if (r > max) [max, maxDay] = [r, day]
  }

  close(min, 0.9833, 0.0015, 'Earth perihelion distance (AU)')
  close(max, 1.0167, 0.0015, 'Earth aphelion distance (AU)')
  // Perihelion falls in early January — not in northern summer, the common
  // misconception the seasons readout is meant to dispel.
  assert.ok(minDay < 10, `perihelion on day ${minDay}, expected the first week of January`)
  assert.ok(maxDay > 180 && maxDay < 195, `aphelion on day ${maxDay}, expected early July`)
})

test("Mercury's eccentric orbit swings between 0.31 and 0.47 AU", () => {
  let min = Infinity
  let max = -Infinity
  for (let day = 0; day < 90; day++) {
    const { r } = orbitalStateAt('mercury', Date.UTC(2024, 0, 1) + day * 86_400_000)!
    min = Math.min(min, r)
    max = Math.max(max, r)
  }
  close(min, 0.3075, 0.002, 'Mercury perihelion (AU)')
  close(max, 0.4667, 0.002, 'Mercury aphelion (AU)')
})

test("orbital periods follow Kepler's third law", () => {
  const now = Date.now()
  const periodYears = (planet: string) =>
    orbitalPeriodDays(elementsAt(planet, now)!.a) / 365.25

  close(orbitalPeriodDays(elementsAt('earth', now)!.a), 365.256, 0.05, 'Earth period (days)')
  close(periodYears('mars'), 1.8808, 0.01, 'Mars period (years)')
  close(periodYears('jupiter'), 11.862, 0.05, 'Jupiter period (years)')
  close(periodYears('saturn'), 29.457, 0.1, 'Saturn period (years)')
  close(periodYears('neptune'), 164.79, 0.5, 'Neptune period (years)')
})

test('vis-viva gives the published mean orbital speeds', () => {
  close(orbitalVelocity(1.0, 1.0), 29.78, 0.1, 'Earth (km/s)')
  close(orbitalVelocity(0.387, 0.387), 47.87, 0.3, 'Mercury (km/s)')
  close(orbitalVelocity(5.203, 5.203), 13.06, 0.1, 'Jupiter (km/s)')
  close(orbitalVelocity(30.07, 30.07), 5.43, 0.1, 'Neptune (km/s)')
})

test('reproduces the Great Conjunction of 21 December 2020', () => {
  // Jupiter and Saturn passed ~0.1° apart in the sky, their closest since
  // 1623, at an ecliptic longitude of about 300.3°.
  const t = Date.UTC(2020, 11, 21, 18)
  const jupiter = geocentricLongitude('jupiter', t)
  const saturn = geocentricLongitude('saturn', t)

  close(Math.abs(jupiter - saturn), 0, 0.35, 'Jupiter-Saturn sky separation (°)')
  close(jupiter, 300.3, 1.5, 'conjunction longitude (°)')
})

test('reproduces the Mars opposition of 13 October 2020', () => {
  const t = Date.UTC(2020, 9, 13, 23)

  // At opposition the Sun, Earth and Mars line up with Earth in the middle,
  // so Earth and Mars share nearly the same heliocentric longitude.
  let separation = Math.abs(
    longitude(orbitalStateAt('mars', t)!) - longitude(orbitalStateAt('earth', t)!),
  )
  if (separation > 180) separation = 360 - separation
  close(separation, 0, 1.0, 'Sun-Earth-Mars alignment (°)')

  const mars = orbitalStateAt('mars', t)!
  const earth = orbitalStateAt('earth', t)!
  const distance = Math.hypot(mars.x - earth.x, mars.y - earth.y, mars.z - earth.z)
  close(distance, 0.4189, 0.005, 'Earth-Mars distance (AU)')
  close(distance * AU, 62_690_000, 800_000, 'Earth-Mars distance (km)')
})

test('Pluto swings far above and below the ecliptic', () => {
  const latitude = (unixMs: number) => {
    const p = orbitalStateAt('pluto', unixMs)!
    return Math.atan2(p.z, Math.hypot(p.x, p.y)) * DEG
  }

  let peak = 0
  for (let year = 1800; year < 2050; year++) {
    peak = Math.max(peak, Math.abs(latitude(Date.UTC(year, 0, 1))))
  }
  // The peak excursion matches Pluto's 17.14° inclination.
  close(peak, 17.14, 0.5, 'Pluto peak ecliptic latitude (°)')

  // It sat almost exactly on the ecliptic when Tombaugh found it in 1930 —
  // which is why an ecliptic-focused photographic survey caught it.
  assert.ok(
    Math.abs(latitude(Date.UTC(1930, 1, 18))) < 1.5,
    'Pluto should be near the ecliptic at its 1930 discovery',
  )
})

test('planets stay ordered by distance from the Sun', () => {
  const order = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']
  const now = Date.now()
  const axes = order.map((id) => elementsAt(id, now)!.a)

  for (let i = 1; i < axes.length; i++) {
    assert.ok(axes[i] > axes[i - 1], `${order[i]} should orbit beyond ${order[i - 1]}`)
  }

  // Pluto's orbit crosses inside Neptune's at perihelion, which is why it was
  // closer to the Sun than Neptune from 1979 to 1999.
  const pluto = elementsAt('pluto', now)!
  const perihelion = pluto.a * (1 - pluto.e)
  assert.ok(perihelion < elementsAt('neptune', now)!.a, 'Pluto perihelion should fall inside Neptune')
})

test('Kepler solver converges for the most eccentric orbit', () => {
  // Pluto's e = 0.249 is the hardest case among the bodies modelled here.
  for (let year = 1800; year < 2050; year += 7) {
    const state = orbitalStateAt('pluto', Date.UTC(year, 0, 1))!
    assert.ok(Number.isFinite(state.x) && Number.isFinite(state.r), `NaN at ${year}`)
    close(state.r, 39.48, 10.5, `Pluto distance in ${year} (AU)`)
  }
})
