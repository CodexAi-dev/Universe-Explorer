# Universe Explorer v1 — archived

This is the original no-build version. It still runs: open `index.html`
directly, or serve this folder with XAMPP at
<http://localhost/Universe/legacy-v1/>.

It is kept for reference only. **New work belongs in the project root.**

## Why it was replaced

It loads three.js **r128** through the legacy global `<script>` path, together
with helpers from `examples/js/`. Upstream deleted that entire loading path
after r147, so this version is pinned to a release from 2021 and cannot take
any fix or improvement from three.js without a rewrite.

Beyond the dependency, the logic lived in a 4,600-line `SolarSystem` class and
a 1,150-line `UIController`, with no build step, no modules and no types.

## What carried over

The rewrite is not a fresh start. Every procedural texture painter, particle
construction and piece of descriptive celestial data here was ported across —
the visual identity is deliberately preserved.

What changed is the foundation: positions now come from real JPL orbital
elements rather than hand-tuned constants, and rotation from measured sidereal
periods rather than a fixed nudge per frame.

`tour.js` in this folder is already dead code — the Tour feature was removed in
commit `385bcf1`, and nothing loads it.
