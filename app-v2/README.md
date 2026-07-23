# Universe Explorer — v2

A rebuild of the original Universe Explorer on a modern stack, with feature
parity against v1. The v1 app is still in the repository root and still runs.

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
  data/        Typed celestial data (ported verbatim, types added)
  three/
    textures/  Canvas painters: planet surfaces, sun, glows, labels
    builders/  Imperative scene construction (galaxies, nebulae, craft)
    simulation.ts  Shared registry of orbiting bodies
  scene/       React Three Fiber components
  store/       Zustand store — the single source of UI + scene state
  ui/          Panels, modals, controls
  hooks/       Keyboard shortcuts, preference persistence
  lib/         Formatters, fact list
```

### Declarative vs imperative

Not everything belongs in JSX. Planets, orbits, moons and labels are React
components, because they map to UI state and benefit from reconciliation.
Galaxies and nebulae are 2,000–5,000-particle point clouds built once by a
plain function and mounted with `<primitive>` — expressing individual
particles as JSX would cost far more than it buys.

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

- Deep-space objects are clickable, but hover tooltips cover planets and moons
  only, matching v1.
- Planet textures remain procedural. Swapping in real NASA imagery would be a
  clear next step but changes the look, so it was left out of a parity port.
