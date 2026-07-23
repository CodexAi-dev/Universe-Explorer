# Credits and data sources

## Textures

Planetary and solar surface maps in `public/textures/` are from
**[Solar System Scope](https://www.solarsystemscope.com/textures/)**, released
under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). They are
based on imagery from NASA missions (Messenger, Magellan, Terra/MODIS, Mars
Global Surveyor, Cassini, Voyager 2, Lunar Reconnaissance Orbiter) and
elevation data from the USGS.

> Textures by [Solar System Scope](https://www.solarsystemscope.com/), licensed
> under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

If you redistribute this app, keep that attribution — it is a licence
condition, not a courtesy.

Pluto has no texture map here. The available global mosaics from New Horizons
are not clearly redistributable, and an invented map would defeat the purpose
of the app, so Pluto keeps a procedural surface that marks Tombaugh Regio in
roughly the right place. It is labelled as procedural in the info panel.

## Orbital elements

Keplerian elements and their per-century rates are from **JPL**, "Keplerian
Elements for Approximate Positions of the Major Planets" (E. M. Standish,
Solar System Dynamics Group, JPL/Caltech). Valid 1800–2050 AD.

<https://ssd.jpl.nasa.gov/planets/approx_pos.html>

## Rotation axes

North pole right ascensions and declinations are from the **IAU Working Group
on Cardinal Coordinates and Rotational Elements** (2015 report), used to
compute sub-solar latitude and therefore seasons.

## Physical data

Radii, masses, densities, rotation periods, obliquities, albedos, escape
velocities, temperatures and satellite counts are from the **NASA Planetary
Fact Sheets**, NSSDC, Goddard Space Flight Center.

<https://nssdc.gsfc.nasa.gov/planetary/factsheet/>

## Ring geometry

Saturn and Uranus ring radii are measured values from Cassini and Voyager 2
observations, expressed in the code as fractions of each planet's equatorial
radius.

## Software

- [three.js](https://threejs.org/) — MIT
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) and
  [drei](https://github.com/pmndrs/drei) — MIT
- [Zustand](https://github.com/pmndrs/zustand) — MIT
- [Tailwind CSS](https://tailwindcss.com/) — MIT
- [Lucide](https://lucide.dev/) — ISC

## Deliberately not real

Two features are inventions kept from v1 for engagement, and are labelled as
such in the app so they are not mistaken for data:

- **Alien ships** — entirely fictional.
- **Deep-space object positions** — galaxies and nebulae are placed for
  legibility, not at their true distances. Andromeda is 2.5 million light-years
  away; at this scene's scale it would sit roughly 160 billion units from the
  Sun. Their listed distances, sizes and descriptions are real.
