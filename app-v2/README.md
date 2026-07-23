# Universe Explorer — v2

A rebuild of the original Universe Explorer on a modern stack, driven by real
astronomical data. The v1 app is still in the repository root and still runs.

## What is real

This is meant for teaching, so the underlying numbers are measurements, not
approximations chosen to look right:

| | Source |
| --- | --- |
| Planet positions | JPL Keplerian elements, accurate 1800–2050 |
| Rotation | Measured sidereal periods and solar days |
| Axial tilt / seasons | IAU pole orientations (2015 report) |
| Radii, mass, density, albedo, gravity | NASA Planetary Fact Sheets |
| Ring radii | Cassini and Voyager 2 measurements |
| Surface maps | NASA imagery via Solar System Scope (CC BY 4.0) |

Pick any date between 1800 and 2050 and the planets stand where they really
stood. The alignments are the real ones — see the tests below.

Full attribution in [CREDITS.md](CREDITS.md). What is *not* real (compressed
scale, deep-space placement, alien ships) is listed there and stated in the
app's Help panel.

## Verifying that claim

`npm test` checks the ephemeris against facts it does not compute — published
observations and almanac dates:

```
Great Conjunction, 21 Dec 2020   Jupiter and Saturn 0.05° apart   (observed ~0.1°)
Mars opposition, 13 Oct 2020     Earth–Mars 0.4192 AU             (actual 0.4189 AU)
Earth perihelion                 0.9833 AU in early January       (actual 0.9833 AU)
June solstice                    sub-solar latitude +23.44°       (defines the Tropic of Cancer)
Orbital speeds                   Earth 29.78, Mercury 47.88 km/s  (published means)
```

15 tests, no test dependencies — Node's built-in runner with type stripping.

## Stack

| Concern    | Choice                                             |
| ---------- | -------------------------------------------------- |
| Build      | Vite 8 (Rolldown) + TypeScript 6 (strict)          |
| UI         | React 19                                            |
| 3D         | three.js 0.185 via React Three Fiber 9 + drei      |
| Post FX    | @react-three/postprocessing (bloom)                |
| State      | Zustand 5                                           |
| Styling    | Tailwind CSS 4 (CSS-first `@theme`)                |
| Icons      | lucide-react (bundled, no CDN)                     |

## Running

```bash
npm install
npm run dev        # dev server with HMR
npm run build      # typecheck + production build to dist/
npm run preview    # serve the production build
npm test           # validate the ephemeris against known astronomy
```

### Serving from XAMPP

`vite.config.ts` sets `base: './'`, so the build is path-independent. Copy
`dist/` anywhere under `htdocs` and open it — no Apache config needed.

## Why this shape

The v1 app was one 4,600-line `SolarSystem` class plus a 1,150-line
`UIController`, loading three.js **r128** through the legacy global `<script>`
path. That loading path was removed from three.js after r147, so v1 was pinned
to a dead branch and could not take any upstream fix.

The port keeps v1's visual identity — every procedural texture, particle
construction and orbital formula is carried over — while splitting the
monolith into layers:

```
src/
  data/
    ephemeris.ts   JPL elements + Kepler solver → real positions
    physical.ts    Measured radii, rotation, obliquity, albedo
    poles.ts       IAU axis orientations → sub-solar latitude
    planets.ts     Descriptive data (ported verbatim from v1)
    *.test.ts      Validation against known astronomy
  three/
    scale.ts       Real measurements → scene units, both scale modes
    simulation.ts  Computes every body's state for a given instant
    textures/      Canvas painters for procedural surfaces
    builders/      Imperative construction (galaxies, nebulae, craft)
  scene/           React Three Fiber components
    materials/     Custom GLSL (Earth day/night, atmospheric limb)
  store/           Zustand store — single source of UI + scene state
  ui/              Panels, modals, controls
  hooks/           Keyboard shortcuts, preference persistence
  lib/             Formatters, fact list
```

### Declarative vs imperative

Not everything belongs in JSX. Planets, orbits, moons and labels are React
components, because they map to UI state and benefit from reconciliation.
Galaxies and nebulae are 2,000–5,000-particle point clouds built once by a
plain function and mounted with `<primitive>` — expressing individual
particles as JSX would cost far more than it buys.

### Positions are computed, not accumulated

Each frame asks "where was this planet at time *t*?" rather than nudging it
forward from the last frame. Scrubbing, reversing and jumping to a date all
give identical answers, and nothing drifts over a long session — which matters
when the app claims a specific date shows a specific alignment.

### The scale problem, stated rather than hidden

The Solar System cannot be drawn honestly on one screen. At true scale with
Earth's orbit at 62 units, Earth itself is 0.0026 units across. Both distance
and size have a **true-to-scale** toggle; the default compresses them but
preserves real orbital *shape*, so eccentricity and inclination stay visible
and the planets keep their real relative angular positions.

Sunlight falloff has the same tension. True inverse-square is available and
leaves Neptune almost black — correct, since it receives about 1/900th of
Earth's light. The default softens it, and each planet's true share of
sunlight is reported as a number either way.

### Animation never re-renders React

`SimulationDriver` runs one `useFrame` for the entire orbital simulation and
mutates `Object3D`s directly through a shared registry. React state is touched
only on a 1 Hz tick (FPS and the simulation date), so a 60 fps scene does not
imply 60 renders per second.

## Changes from v1

Behavioural parity was the goal; these are the deliberate differences:

- **Frame-rate independence.** v1 advanced rotations by a fixed amount per
  frame, so the simulation ran faster on high-refresh displays. All motion is
  now scaled by frame delta, and delta is clamped so a backgrounded tab does
  not teleport every body on return.
- **Textures are memoised.** v1 regenerated each procedural texture on every
  construction; the sun's alone paints 5,000 gradients onto a 2048×1024 canvas.
- **Preferences save immediately** instead of only on `beforeunload`, which
  lost changes on a crash or mobile tab eviction.
- **Quality actually does something.** v1's `setQuality` only logged. It now
  drives star count, sphere tessellation, shadows, antialiasing and bloom.
- **No CDN dependency.** Font Awesome was loaded from a CDN; icons are bundled.
- **Dead code dropped.** `TOUR_STEPS` and `tour.js` belonged to the Tour
  feature removed in v1 commit `385bcf1`.

## Known limitations

- **Pluto has no photographic texture.** Redistributable global New Horizons
  mosaics were not available, and inventing one would undercut the point. It
  keeps a procedural surface and says so in its info panel.
- **Deep-space distances are not real.** Galaxies and nebulae are placed for
  legibility. Their listed distances and sizes are real; their positions are not.
- **Moon orbits are circular and coplanar.** Real periods and real relative
  sizes, but no inclination or eccentricity — so this will not predict eclipses.
- **Alien ships are fictional**, kept from v1 for engagement and labelled as such.
- Hover tooltips cover planets and moons only, matching v1.
- Positions use the JPL approximate-elements model: good to well under a degree
  across 1800–2050, but not an ephemeris-grade integration.
