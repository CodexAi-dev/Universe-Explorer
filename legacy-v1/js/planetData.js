/**
 * Solar System Planet Data
 * Contains comprehensive data for all celestial bodies
 * Enhanced with realistic texture parameters
 */

const PLANET_DATA = {
    sun: {
        name: "Sun",
        type: "Star",
        spectralClass: "G2V",
        diameter: 1392700,           // km
        mass: "1.989 × 10³⁰",        // kg
        gravity: 274,                 // m/s²
        orbitalPeriod: 0,            // days (doesn't orbit)
        distanceFromSun: 0,          // km
        moons: 0,
        temperature: "5,500°C (surface)",
        coreTemperature: "15,000,000°C",
        dayLength: "25-35 days",     // rotation period
        description: "The Sun is the star at the center of our Solar System. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core. The Sun radiates energy mainly as visible light, ultraviolet light, and infrared radiation.",
        orbitalInclination: 0,
        axialTilt: 7.25,
        color: 0xffcc00,
        emissive: 0xffaa00,
        coronaColor: 0xff8844,
        size: 20,                    // visual size in scene
        textureFile: null,           // procedural for sun
        luminosity: "3.828 × 10²⁶ W",
        composition: {
            hydrogen: "73%",
            helium: "25%",
            other: "2%"
        },
        facts: [
            "Contains 99.86% of the Solar System's mass",
            "Light from the Sun takes about 8 minutes to reach Earth",
            "The Sun's core temperature is about 15 million °C",
            "The Sun is about 4.6 billion years old",
            "The Sun will become a red giant in about 5 billion years"
        ]
    },
    mercury: {
        name: "Mercury",
        type: "Terrestrial",
        diameter: 4879,
        mass: "3.30 × 10²³",
        gravity: 3.7,
        orbitalPeriod: 88,
        distanceFromSun: 57900000,
        moons: 0,
        temperature: "-180 to 430°C",
        dayLength: "59 Earth days",
        description: "Mercury is the smallest and innermost planet in the Solar System. It has no atmosphere to retain heat, resulting in extreme temperature variations. Its surface is heavily cratered, resembling Earth's Moon.",
        orbitalInclination: 7.0,
        axialTilt: 0.034,
        color: 0xb5b5b5,
        size: 0.8,
        orbitRadius: 30,
        orbitSpeed: 4.15,            // relative orbital speed
        rotationSpeed: 0.017,
        textureFile: 'mercury',
        // Enhanced texture parameters
        surfaceFeatures: {
            craterDensity: 'high',
            plains: true,
            scarps: true
        },
        facts: [
            "Mercury has no moons or rings",
            "A year on Mercury is just 88 Earth days",
            "Mercury has a very thin atmosphere called an exosphere",
            "Despite being closest to the Sun, Venus is hotter"
        ]
    },
    venus: {
        name: "Venus",
        type: "Terrestrial",
        diameter: 12104,
        mass: "4.87 × 10²⁴",
        gravity: 8.87,
        orbitalPeriod: 225,
        distanceFromSun: 108200000,
        moons: 0,
        temperature: "462°C (average)",
        dayLength: "243 Earth days",
        description: "Venus is the second planet from the Sun and is Earth's closest planetary neighbor. It's one of the four inner, terrestrial planets, and is often called Earth's twin because of similar size and mass. Venus has a thick, toxic atmosphere filled with carbon dioxide.",
        orbitalInclination: 3.4,
        axialTilt: 177.4,           // retrograde rotation
        color: 0xe6c87a,
        size: 1.2,
        orbitRadius: 45,
        orbitSpeed: 1.62,
        rotationSpeed: -0.004,       // negative for retrograde
        textureFile: 'venus',
        atmosphere: true,
        atmosphereColor: 0xe6c87a,
        atmosphereOpacity: 0.4,
        atmosphereDensity: 92,       // bar (Earth = 1)
        cloudLayers: 3,
        facts: [
            "Venus rotates backwards compared to most planets",
            "A day on Venus is longer than a year on Venus",
            "Venus is the hottest planet in our Solar System",
            "Venus has no moons"
        ]
    },
    earth: {
        name: "Earth",
        type: "Terrestrial",
        diameter: 12742,
        mass: "5.97 × 10²⁴",
        gravity: 9.8,
        orbitalPeriod: 365.25,
        distanceFromSun: 149600000,
        moons: 1,
        temperature: "-88 to 58°C",
        dayLength: "24 hours",
        description: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 71% of Earth's surface is water, and the planet's atmosphere is rich in nitrogen and oxygen. Earth has one natural satellite, the Moon.",
        orbitalInclination: 0,
        axialTilt: 23.44,
        color: 0x6b93d6,
        size: 1.3,
        orbitRadius: 62,
        orbitSpeed: 1.0,             // baseline
        rotationSpeed: 1.0,
        textureFile: 'earth',
        atmosphere: true,
        atmosphereColor: 0x87ceeb,
        atmosphereOpacity: 0.25,
        hasMoon: true,
        // Enhanced parameters for realistic rendering
        oceanColor: 0x1a5f8a,
        landColor: 0x228B22,
        cloudColor: 0xffffff,
        cloudOpacity: 0.4,
        nightLights: true,
        hasSeasons: true,
        facts: [
            "Earth is the only planet not named after a god",
            "Earth's atmosphere protects us from meteoroids and radiation",
            "The Earth's core is as hot as the Sun's surface",
            "Earth is the densest planet in the Solar System"
        ]
    },
    mars: {
        name: "Mars",
        type: "Terrestrial",
        diameter: 6779,
        mass: "6.42 × 10²³",
        gravity: 3.71,
        orbitalPeriod: 687,
        distanceFromSun: 227900000,
        moons: 2,
        temperature: "-87 to -5°C",
        dayLength: "24.6 hours",
        description: "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System. Often called the 'Red Planet' due to iron oxide on its surface, Mars has the largest volcano and canyon in the Solar System - Olympus Mons and Valles Marineris.",
        orbitalInclination: 1.85,
        axialTilt: 25.19,
        color: 0xc1440e,
        size: 1.0,
        orbitRadius: 80,
        orbitSpeed: 0.53,
        rotationSpeed: 0.97,
        textureFile: 'mars',
        // Enhanced surface features
        hasIceCaps: true,
        iceCapsColor: 0xe8e8e8,
        dustStorms: true,
        olympusMons: true,
        vallesMarineris: true,
        facts: [
            "Mars has the largest volcano in the Solar System",
            "Mars has two small moons: Phobos and Deimos",
            "A day on Mars is called a 'sol'",
            "Mars has seasons like Earth due to similar axial tilt"
        ]
    },
    jupiter: {
        name: "Jupiter",
        type: "Gas Giant",
        diameter: 139820,
        mass: "1.90 × 10²⁷",
        gravity: 24.79,
        orbitalPeriod: 4333,
        distanceFromSun: 778500000,
        moons: 95,
        temperature: "-110°C (cloud tops)",
        dayLength: "9.9 hours",
        description: "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass more than two and a half times that of all other planets combined. Jupiter is known for its Great Red Spot, a storm larger than Earth that has been raging for hundreds of years.",
        orbitalInclination: 1.3,
        axialTilt: 3.13,
        color: 0xd8ca9d,
        size: 4.5,
        orbitRadius: 110,
        orbitSpeed: 0.084,
        rotationSpeed: 2.42,         // fastest rotation
        textureFile: 'jupiter',
        // Enhanced band parameters
        bandColors: ['#d8ca9d', '#c4a67a', '#b89d6a', '#d4b88a', '#e0c8a0', '#c0986a'],
        greatRedSpot: {
            color: 0xc75050,
            latitude: -22,
            size: 1.3
        },
        storms: true,
        magneticField: 20000,        // times Earth's
        facts: [
            "Jupiter has 95 known moons",
            "The Great Red Spot is a storm larger than Earth",
            "Jupiter has the shortest day of all planets",
            "Jupiter's magnetic field is 20,000 times stronger than Earth's"
        ]
    },
    saturn: {
        name: "Saturn",
        type: "Gas Giant",
        diameter: 116460,
        mass: "5.68 × 10²⁶",
        gravity: 10.44,
        orbitalPeriod: 10759,
        distanceFromSun: 1434000000,
        moons: 146,
        temperature: "-140°C (cloud tops)",
        dayLength: "10.7 hours",
        description: "Saturn is the sixth planet from the Sun and the second-largest in the Solar System. It is famous for its spectacular ring system, composed mainly of ice particles with some rocky debris and dust. Saturn is a gas giant with an average density less than water.",
        orbitalInclination: 2.49,
        axialTilt: 26.73,
        color: 0xf4d59e,
        size: 4.0,
        orbitRadius: 145,
        orbitSpeed: 0.034,
        rotationSpeed: 2.24,
        textureFile: 'saturn',
        hasRings: true,
        ringColor: 0xc9a65a,
        // Enhanced ring parameters
        rings: {
            innerRadius: 1.4,         // multiplier of planet size
            outerRadius: 2.4,
            opacity: 0.9,
            divisions: ['D Ring', 'C Ring', 'B Ring', 'Cassini Division', 'A Ring', 'F Ring'],
            icePercentage: 99
        },
        bandColors: ['#f4d59e', '#e0c080', '#d4b070', '#ecd090', '#f0d898', '#dcc080'],
        facts: [
            "Saturn has the most extensive ring system",
            "Saturn would float if placed in water",
            "Saturn has 146 known moons",
            "Saturn's moon Titan has a thick atmosphere"
        ]
    },
    uranus: {
        name: "Uranus",
        type: "Ice Giant",
        diameter: 50724,
        mass: "8.68 × 10²⁵",
        gravity: 8.69,
        orbitalPeriod: 30687,
        distanceFromSun: 2871000000,
        moons: 28,
        temperature: "-195°C (cloud tops)",
        dayLength: "17.2 hours",
        description: "Uranus is the seventh planet from the Sun and has the third-largest planetary radius in the Solar System. It is an ice giant with a blue-green color due to methane in its atmosphere. Uranus has a unique feature: it rotates on its side, with an axial tilt of 98 degrees.",
        orbitalInclination: 0.77,
        axialTilt: 97.77,            // extreme tilt
        color: 0x99ccff,
        size: 2.5,
        orbitRadius: 180,
        orbitSpeed: 0.012,
        rotationSpeed: -1.39,        // retrograde
        textureFile: 'uranus',
        hasRings: true,
        ringColor: 0x666699,
        facts: [
            "Uranus rotates on its side",
            "Uranus has 28 known moons",
            "It was the first planet discovered with a telescope",
            "Uranus has faint rings"
        ]
    },
    neptune: {
        name: "Neptune",
        type: "Ice Giant",
        diameter: 49244,
        mass: "1.02 × 10²⁶",
        gravity: 11.15,
        orbitalPeriod: 60190,
        distanceFromSun: 4495000000,
        moons: 16,
        temperature: "-200°C (cloud tops)",
        dayLength: "16.1 hours",
        description: "Neptune is the eighth and farthest known planet from the Sun. It is the fourth-largest planet by diameter and third-largest by mass. Neptune is known for its vivid blue color and has the strongest winds in the Solar System, reaching speeds of over 2,000 km/h.",
        orbitalInclination: 1.77,
        axialTilt: 28.32,
        color: 0x5566ff,
        size: 2.4,
        orbitRadius: 215,
        orbitSpeed: 0.006,
        rotationSpeed: 1.49,
        textureFile: 'neptune',
        facts: [
            "Neptune has the strongest winds in the Solar System",
            "Neptune was discovered through mathematical predictions",
            "Neptune has 16 known moons",
            "One Neptune year equals 165 Earth years"
        ]
    },
    pluto: {
        name: "Pluto",
        type: "Dwarf Planet",
        diameter: 2377,
        mass: "1.30 × 10²²",
        gravity: 0.62,
        orbitalPeriod: 90560,
        distanceFromSun: 5906000000,
        moons: 5,
        temperature: "-230°C",
        dayLength: "6.4 Earth days",
        description: "Pluto is a dwarf planet in the Kuiper Belt. Once considered the ninth planet, Pluto was reclassified in 2006. It has a highly elliptical orbit that sometimes brings it closer to the Sun than Neptune. Pluto has five known moons, the largest being Charon.",
        orbitalInclination: 17.16,   // highly inclined
        axialTilt: 122.53,
        color: 0xddc8a3,
        size: 0.5,
        orbitRadius: 250,
        orbitSpeed: 0.004,
        rotationSpeed: -0.156,
        textureFile: 'pluto',
        facts: [
            "Pluto was reclassified as a dwarf planet in 2006",
            "Pluto has 5 known moons",
            "Pluto's largest moon Charon is about half its size",
            "Pluto's orbit is highly elliptical and inclined"
        ]
    }
};

// Moon data for major moons
const MOON_DATA = {
    moon: {
        name: "Moon",
        parent: "earth",
        diameter: 3474,
        distanceFromPlanet: 384400,
        orbitalPeriod: 27.3,
        color: 0xaaaaaa,
        size: 0.27,
        orbitRadius: 3,
        orbitSpeed: 13.37,
        description: "Earth's only natural satellite, the Moon influences tides and stabilizes Earth's axial tilt."
    },
    phobos: {
        name: "Phobos",
        parent: "mars",
        diameter: 22.4,
        distanceFromPlanet: 9376,
        orbitalPeriod: 0.32,
        color: 0x8b7355,
        size: 0.05,
        orbitRadius: 1.5,
        orbitSpeed: 50,
        description: "The larger and closer of Mars' two moons, Phobos is slowly spiraling toward Mars."
    },
    deimos: {
        name: "Deimos",
        parent: "mars",
        diameter: 12.4,
        distanceFromPlanet: 23460,
        orbitalPeriod: 1.26,
        color: 0x8b7355,
        size: 0.03,
        orbitRadius: 2.2,
        orbitSpeed: 30,
        description: "The smaller and outer moon of Mars, named after the Greek god of dread."
    },
    io: {
        name: "Io",
        parent: "jupiter",
        diameter: 3643,
        distanceFromPlanet: 421800,
        orbitalPeriod: 1.77,
        color: 0xffcc00,
        size: 0.28,
        orbitRadius: 6,
        orbitSpeed: 17,
        description: "The most volcanically active body in the Solar System."
    },
    europa: {
        name: "Europa",
        parent: "jupiter",
        diameter: 3122,
        distanceFromPlanet: 671100,
        orbitalPeriod: 3.55,
        color: 0xcfcfc4,
        size: 0.24,
        orbitRadius: 7.5,
        orbitSpeed: 13,
        description: "An icy moon believed to have a subsurface ocean that may harbor life."
    },
    ganymede: {
        name: "Ganymede",
        parent: "jupiter",
        diameter: 5268,
        distanceFromPlanet: 1070400,
        orbitalPeriod: 7.15,
        color: 0x8b8378,
        size: 0.41,
        orbitRadius: 9,
        orbitSpeed: 8,
        description: "The largest moon in the Solar System, larger than Mercury."
    },
    callisto: {
        name: "Callisto",
        parent: "jupiter",
        diameter: 4821,
        distanceFromPlanet: 1882700,
        orbitalPeriod: 16.69,
        color: 0x5c5c5c,
        size: 0.37,
        orbitRadius: 11,
        orbitSpeed: 5,
        description: "The most heavily cratered object in the Solar System."
    },
    titan: {
        name: "Titan",
        parent: "saturn",
        diameter: 5150,
        distanceFromPlanet: 1221870,
        orbitalPeriod: 15.95,
        color: 0xdaa520,
        size: 0.4,
        orbitRadius: 8,
        orbitSpeed: 6,
        description: "Saturn's largest moon, with a thick atmosphere and liquid methane lakes."
    },
    enceladus: {
        name: "Enceladus",
        parent: "saturn",
        diameter: 504,
        distanceFromPlanet: 238020,
        orbitalPeriod: 1.37,
        color: 0xffffff,
        size: 0.08,
        orbitRadius: 6,
        orbitSpeed: 20,
        description: "A small icy moon with geysers that spray water ice into space."
    },
    triton: {
        name: "Triton",
        parent: "neptune",
        diameter: 2707,
        distanceFromPlanet: 354759,
        orbitalPeriod: 5.88,
        color: 0xc8c8c8,
        size: 0.21,
        orbitRadius: 5,
        orbitSpeed: -10,             // retrograde orbit
        description: "Neptune's largest moon, with a retrograde orbit suggesting it was captured."
    },
    charon: {
        name: "Charon",
        parent: "pluto",
        diameter: 1212,
        distanceFromPlanet: 19591,
        orbitalPeriod: 6.39,
        color: 0x8b8378,
        size: 0.1,
        orbitRadius: 2,
        orbitSpeed: 15,
        description: "Pluto's largest moon, so large that Pluto and Charon orbit a common center."
    }
};

// Tour information
const TOUR_STEPS = [
    {
        target: null,
        title: "Welcome to the Solar System",
        text: "Embark on a journey through our cosmic neighborhood. You'll visit the Sun and all eight planets, learning fascinating facts about each celestial body. Use the navigation buttons to explore!",
        position: null
    },
    {
        target: "sun",
        title: "The Sun",
        text: "Our journey begins at the Sun, the star at the center of our Solar System. It contains 99.86% of the system's mass and provides the energy that sustains life on Earth. The Sun's surface temperature is about 5,500°C, while its core reaches 15 million °C!",
        position: { distance: 100, angle: 0 }
    },
    {
        target: "mercury",
        title: "Mercury",
        text: "Mercury is the smallest planet and closest to the Sun. Despite this proximity, it's not the hottest planet - that honor goes to Venus. Mercury has no atmosphere, leading to extreme temperature swings from -180°C at night to 430°C during the day.",
        position: { distance: 20, angle: 45 }
    },
    {
        target: "venus",
        title: "Venus",
        text: "Venus is often called Earth's twin due to similar size, but conditions couldn't be more different. Its thick atmosphere creates a runaway greenhouse effect, making it the hottest planet at 462°C. Venus also rotates backwards compared to most planets!",
        position: { distance: 25, angle: 30 }
    },
    {
        target: "earth",
        title: "Earth",
        text: "Home sweet home! Earth is the only known planet to harbor life. Our planet has the perfect conditions: liquid water, a protective atmosphere, and a magnetic field that shields us from solar radiation. The Moon helps stabilize Earth's tilt, giving us stable seasons.",
        position: { distance: 25, angle: 45 }
    },
    {
        target: "mars",
        title: "Mars",
        text: "The Red Planet has captivated human imagination for centuries. Mars hosts the largest volcano (Olympus Mons) and canyon (Valles Marineris) in the Solar System. Scientists are actively searching for signs of past or present microbial life on Mars.",
        position: { distance: 20, angle: 30 }
    },
    {
        target: "jupiter",
        title: "Jupiter",
        text: "Jupiter is the king of planets - more than twice as massive as all other planets combined! Its Great Red Spot is a storm that has been raging for at least 400 years. Jupiter has 95 known moons, including the fascinating Europa with its subsurface ocean.",
        position: { distance: 60, angle: 20 }
    },
    {
        target: "saturn",
        title: "Saturn",
        text: "Saturn's magnificent rings make it the most recognizable planet. These rings are made mostly of ice particles ranging from tiny grains to house-sized chunks. Fun fact: Saturn is so light that it would float if placed in a giant bathtub of water!",
        position: { distance: 55, angle: 25 }
    },
    {
        target: "uranus",
        title: "Uranus",
        text: "Uranus is unique among planets - it rotates on its side with an axial tilt of 98 degrees! This was likely caused by a collision with an Earth-sized object long ago. Uranus appears blue-green due to methane in its atmosphere absorbing red light.",
        position: { distance: 40, angle: 30 }
    },
    {
        target: "neptune",
        title: "Neptune",
        text: "Neptune, the windiest planet, has storms with winds exceeding 2,000 km/h. It was the first planet discovered through mathematical predictions rather than observation. Neptune's blue color comes from methane, similar to Uranus but more vivid.",
        position: { distance: 40, angle: 25 }
    }
];

// Comparison properties for the comparison tool
const COMPARISON_PROPERTIES = [
    { key: 'diameter', label: 'Diameter', unit: 'km', format: 'number' },
    { key: 'mass', label: 'Mass', unit: 'kg', format: 'scientific' },
    { key: 'gravity', label: 'Surface Gravity', unit: 'm/s²', format: 'number' },
    { key: 'orbitalPeriod', label: 'Orbital Period', unit: 'days', format: 'number' },
    { key: 'distanceFromSun', label: 'Distance from Sun', unit: 'km', format: 'number' },
    { key: 'moons', label: 'Number of Moons', unit: '', format: 'number' },
    { key: 'dayLength', label: 'Day Length', unit: '', format: 'string' },
    { key: 'temperature', label: 'Temperature', unit: '', format: 'string' }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PLANET_DATA, MOON_DATA, TOUR_STEPS, COMPARISON_PROPERTIES };
}
