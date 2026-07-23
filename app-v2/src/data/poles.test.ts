import { test } from 'node:test'
import assert from 'node:assert/strict'
import { orbitalStateAt } from './ephemeris.ts'
import { subSolarLatitude } from './poles.ts'
import { PHYSICAL } from './physical.ts'

/**
 * Seasons are the app's central teaching claim, so the sub-solar latitude is
 * checked against the real solstices and equinoxes — dates and declinations
 * that come from the almanac, not from this code.
 */

function close(actual: number, expected: number, tolerance: number, what: string) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${what}: got ${actual.toFixed(3)}, expected ${expected} ± ${tolerance}`,
  )
}

const earthSubSolar = (unixMs: number) =>
  subSolarLatitude('earth', orbitalStateAt('earth', unixMs)!)

test('Earth: solar declination matches the solstices and equinoxes', () => {
  // The Sun stands over the Tropic of Cancer at the June solstice and the
  // Tropic of Capricorn in December — the tropics are *defined* by this.
  close(earthSubSolar(Date.UTC(2024, 5, 20, 20, 51)), 23.44, 0.15, 'June solstice')
  close(earthSubSolar(Date.UTC(2024, 11, 21, 9, 20)), -23.44, 0.15, 'December solstice')

  // At the equinoxes the Sun is overhead at the equator.
  close(earthSubSolar(Date.UTC(2024, 2, 20, 3, 6)), 0, 0.3, 'March equinox')
  close(earthSubSolar(Date.UTC(2024, 8, 22, 12, 44)), 0, 0.3, 'September equinox')
})

test('Earth: declination is positive through northern summer', () => {
  // Late July is northern summer; the earlier trueAnomaly-based formula got
  // this backwards because it measured from perihelion rather than the equinox.
  const july = earthSubSolar(Date.UTC(2026, 6, 24))
  assert.ok(july > 15 && july < 22, `24 July declination should be ~+20°, got ${july.toFixed(2)}`)

  const january = earthSubSolar(Date.UTC(2026, 0, 15))
  assert.ok(january < -18, `mid-January declination should be strongly negative, got ${january.toFixed(2)}`)
})

test('Earth: perihelion falls in northern winter, not summer', () => {
  // The classic misconception. Earth is *closest* to the Sun in January.
  const perihelion = orbitalStateAt('earth', Date.UTC(2024, 0, 3))!
  const aphelion = orbitalStateAt('earth', Date.UTC(2024, 6, 5))!

  assert.ok(perihelion.r < aphelion.r, 'January should be closer to the Sun than July')
  assert.ok(earthSubSolar(Date.UTC(2024, 0, 3)) < 0, 'January should be northern winter')
})

test('declination never exceeds a planet obliquity', () => {
  for (const id of ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']) {
    const tilt = PHYSICAL[id].obliquityDeg
    const limit = tilt > 90 ? 180 - tilt : tilt

    let peak = 0
    for (let year = 2000; year < 2180; year += 1) {
      for (let month = 0; month < 12; month += 3) {
        const state = orbitalStateAt(id, Date.UTC(year, month, 1))
        if (state) peak = Math.max(peak, Math.abs(subSolarLatitude(id, state)))
      }
    }

    assert.ok(
      peak <= limit + 1.0,
      `${id}: peak sub-solar latitude ${peak.toFixed(2)}° exceeds obliquity ${limit.toFixed(2)}°`,
    )
    // Sampling across a full orbit should approach the obliquity.
    assert.ok(
      peak > limit - 3.0,
      `${id}: peak sub-solar latitude ${peak.toFixed(2)}° never approaches obliquity ${limit.toFixed(2)}°`,
    )
  }
})

test('Uranus has the most extreme seasons in the Solar System', () => {
  // Its 97.8° tilt lays the axis almost in the orbital plane, so each pole
  // gets 42 years of continuous daylight then 42 years of darkness.
  let peak = 0
  for (let year = 2000; year < 2090; year++) {
    const state = orbitalStateAt('uranus', Date.UTC(year, 0, 1))!
    peak = Math.max(peak, Math.abs(subSolarLatitude('uranus', state)))
  }
  assert.ok(peak > 78, `Uranus sub-solar latitude should reach past 78°, got ${peak.toFixed(1)}°`)
})

test('Mercury and Jupiter have almost no seasonal swing', () => {
  for (const id of ['mercury', 'jupiter']) {
    let peak = 0
    for (let year = 2000; year < 2020; year++) {
      const state = orbitalStateAt(id, Date.UTC(year, 0, 1))!
      peak = Math.max(peak, Math.abs(subSolarLatitude(id, state)))
    }
    assert.ok(peak < 4, `${id} should barely tilt, got ${peak.toFixed(2)}°`)
  }
})
