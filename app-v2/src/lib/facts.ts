import { SPACE_FACTS } from '@/data/spaceObjects'

/** General facts shown alongside the category facts, as in v1. */
const GENERAL_FACTS = [
  'The Sun is so large that about 1.3 million Earths could fit inside it!',
  'A day on Venus is longer than a year on Venus - it takes 243 Earth days to rotate once!',
  "Jupiter's Great Red Spot is a storm that has been raging for at least 400 years.",
  "Saturn's rings are only about 10 meters thick, despite spanning 282,000 km!",
  'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.',
  'The footprints on the Moon will last for millions of years due to no wind or water.',
  'Neutron stars are so dense that a teaspoon would weigh about 6 billion tons!',
  "There are more stars in the universe than grains of sand on all of Earth's beaches.",
  'The largest known star, UY Scuti, is about 1,700 times the Sun’s radius.',
  'Black holes can spin at nearly the speed of light!',
  'Mars has the tallest volcano in the solar system - Olympus Mons is 21 km high!',
  'The International Space Station orbits Earth at about 28,000 km/h!',
  'Voyager 1, launched in 1977, is the farthest human-made object from Earth.',
  'The Andromeda Galaxy is approaching us at 110 km per second!',
  'There may be 40 billion Earth-sized planets in the habitable zones of stars in our galaxy.',
  'A year on Mercury is only 88 Earth days, but a day is 176 Earth days!',
  'Uranus rotates on its side, likely due to a massive collision billions of years ago.',
  "Neptune's moon Triton orbits backwards - the only large moon to do so!",
  'The Hubble Space Telescope has traveled more than 5 billion kilometers in orbit!',
  "Pluto's largest moon, Charon, is so big that both orbit a point in space between them.",
  'One million Earths could fit inside the Sun with room to spare!',
  "Sound cannot travel through space - it's a complete vacuum!",
  'A sunset on Mars appears blue due to the thin atmosphere!',
  'The Milky Way galaxy is about 100,000 light-years across!',
  "There's a giant cloud of alcohol in space - enough for 400 trillion trillion pints!",
]

export const ALL_FACTS: string[] = [...Object.values(SPACE_FACTS).flat(), ...GENERAL_FACTS]

/** Picks a fact that isn't the one currently shown. */
export function nextFactIndex(current: number): number {
  if (ALL_FACTS.length <= 1) return 0
  let index = current
  while (index === current) index = Math.floor(Math.random() * ALL_FACTS.length)
  return index
}
