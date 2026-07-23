import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatDrift, formatRate } from './format.ts'

/**
 * The time bar is where "the date is wrong" gets noticed, so the rate label
 * and the drift badge are pinned down here.
 */

test('rate labels read in physical units', () => {
  assert.equal(formatRate(0), 'Paused')
  assert.equal(formatRate(1 / 86_400), 'Real time')
  assert.equal(formatRate(1 / 24), '1 hour/s')
  assert.equal(formatRate(2 / 24), '2 hours/s')
  assert.equal(formatRate(1), '1 day/s')
  assert.equal(formatRate(7), '1 week/s')
  assert.equal(formatRate(365.25), '1 year/s')
  assert.equal(formatRate(3652.5), '10 years/s')
})

test('reversed time keeps its label but marks direction', () => {
  assert.equal(formatRate(-1), '−1 day/s')
  assert.equal(formatRate(-365.25), '−1 year/s')
})

test('drift reports nothing while the clock is effectively now', () => {
  const now = Date.now()
  assert.equal(formatDrift(now, now), null)
  // A sub-second publishing lag must not flag the clock as drifted.
  assert.equal(formatDrift(now - 900, now), null)
  assert.equal(formatDrift(now + 1500, now), null)
  assert.equal(formatDrift(now + 4000, now), null)
  assert.equal(formatDrift(now - 4000, now), null)
})

test('drift reports magnitude and direction once it matters', () => {
  const now = Date.now()
  assert.equal(formatDrift(now + 30_000, now), '+30s')
  assert.equal(formatDrift(now - 30_000, now), '−30s')
  assert.equal(formatDrift(now + 600_000, now), '+10m')
  assert.equal(formatDrift(now + 6 * 3_600_000, now), '+6h')
  assert.equal(formatDrift(now + 5 * 86_400_000, now), '+5d')
  assert.equal(formatDrift(now + 3 * 31_557_600_000, now), '+3.0y')
})

test('a paused clock drifts from now, and says so', () => {
  // Pausing stops the simulated clock while the real one keeps going, so the
  // displayed moment genuinely stops being "now".
  const paused = Date.now()
  const tenSecondsLater = paused + 10_000
  assert.equal(formatDrift(paused, tenSecondsLater), '−10s')
})
