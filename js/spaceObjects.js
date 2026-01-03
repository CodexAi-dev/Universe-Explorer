/**
 * Space Objects Data & Configuration
 * Includes satellites, space stations, spacecraft, comets, and alien ships
 */

// Real-world Satellites Data
const SATELLITES = {
    iss: {
        name: "International Space Station",
        type: "station",
        orbit: "earth",
        altitude: 408, // km
        orbitRadius: 2.5,
        orbitSpeed: 15,
        size: 0.15,
        color: 0xcccccc,
        description: "The ISS is a modular space station in low Earth orbit. It's a multinational collaborative project involving NASA, Roscosmos, JAXA, ESA, and CSA.",
        launchYear: 1998,
        crew: "6-7 astronauts"
    },
    hubble: {
        name: "Hubble Space Telescope",
        type: "telescope",
        orbit: "earth",
        altitude: 547,
        orbitRadius: 2.8,
        orbitSpeed: 12,
        size: 0.08,
        color: 0xaaaaaa,
        description: "The Hubble Space Telescope is a space telescope that was launched into low Earth orbit in 1990. It remains in operation and has captured some of the most detailed visible-light images.",
        launchYear: 1990
    },
    jwst: {
        name: "James Webb Space Telescope",
        type: "telescope",
        shape: "hexagonal",
        orbit: "solar",
        altitude: 1500000, // L2 point
        orbitRadius: 70, // Positioned at L2
        orbitSpeed: 0.8,
        size: 0.12,
        color: 0xffdd88,
        description: "JWST is a space telescope designed primarily to conduct infrared astronomy. The most powerful telescope ever launched into space, it's stationed at the Sun-Earth L2 Lagrange point.",
        launchYear: 2021
    },
    voyager1: {
        name: "Voyager 1",
        type: "probe",
        orbit: "heliocentric",
        altitude: 23000000000, // 23 billion km
        distance: 280,
        orbitRadius: 280,
        orbitSpeed: 0.01,
        size: 0.05,
        color: 0xdddddd,
        description: "Voyager 1 is a space probe launched by NASA in 1977. It's the most distant human-made object from Earth, currently in interstellar space.",
        launchYear: 1977
    },
    voyager2: {
        name: "Voyager 2",
        type: "probe",
        orbit: "heliocentric",
        altitude: 19000000000,
        distance: 260,
        orbitRadius: 260,
        orbitSpeed: 0.012,
        size: 0.05,
        color: 0xdddddd,
        description: "Voyager 2 is a space probe launched by NASA in 1977. It's the only spacecraft to have visited Uranus and Neptune.",
        launchYear: 1977
    },
    gps: {
        name: "GPS Satellite Constellation",
        type: "constellation",
        orbit: "earth",
        altitude: 20200,
        orbitRadius: 3.5,
        orbitSpeed: 8,
        size: 0.04,
        color: 0x44aaff,
        description: "Global Positioning System satellites provide location and time information anywhere on Earth.",
        count: 6 // Simplified representation
    },
    starlink: {
        name: "Starlink Constellation",
        type: "constellation",
        orbit: "earth",
        altitude: 550,
        orbitRadius: 2.3,
        orbitSpeed: 18,
        size: 0.02,
        color: 0xffffff,
        description: "SpaceX's Starlink is a satellite internet constellation providing internet access worldwide.",
        count: 12 // Simplified representation
    }
};

// Comets and Asteroids
const COMETS = [
    {
        name: "Halley's Comet",
        type: "Periodic Comet",
        orbitalPeriod: 75, // years
        perihelion: 40, // scaled for visualization
        aphelion: 300,
        size: 0.5,
        speed: 0.0005,
        tailLength: 8,
        color: 0x88ccff,
        tailColor: 0xaaddff,
        description: "Halley's Comet is a short-period comet visible from Earth every 75-79 years. It's the only known short-period comet regularly visible to the naked eye.",
        lastPerihelion: 1986,
        nextPerihelion: 2061
    },
    {
        name: "Comet Hale-Bopp",
        type: "Long-period Comet",
        perihelion: 60,
        aphelion: 350,
        size: 0.6,
        speed: 0.0003,
        tailLength: 12,
        color: 0xffffcc,
        tailColor: 0xffffaa,
        description: "One of the most widely observed comets of the 20th century, visible to the naked eye for a record 18 months."
    },
    {
        name: "Comet NEOWISE",
        type: "Long-period Comet",
        perihelion: 45,
        aphelion: 280,
        size: 0.4,
        speed: 0.0004,
        tailLength: 6,
        color: 0xffccaa,
        tailColor: 0xffddbb,
        description: "C/2020 F3 (NEOWISE) was discovered in 2020 and was one of the brightest comets in the northern hemisphere since Hale-Bopp."
    }
];

// Famous Asteroids
const ASTEROIDS = {
    ceres: {
        name: "Ceres",
        type: "Dwarf Planet",
        diameter: 939,
        orbitRadius: 95,
        orbitSpeed: 0.2,
        size: 0.4,
        color: 0x888888,
        description: "Ceres is the largest object in the asteroid belt and the only dwarf planet in the inner Solar System."
    },
    vesta: {
        name: "Vesta",
        type: "Asteroid",
        diameter: 525,
        orbitRadius: 93,
        orbitSpeed: 0.22,
        size: 0.25,
        color: 0xaaaaaa,
        description: "Vesta is the second-largest asteroid in the belt, and the brightest asteroid visible from Earth."
    },
    apophis: {
        name: "99942 Apophis",
        type: "Near-Earth Asteroid",
        diameter: 0.37,
        orbitRadius: 55,
        orbitSpeed: 1.2,
        size: 0.08,
        color: 0x996633,
        description: "A near-Earth asteroid that caused a brief period of concern in December 2004 due to initial observations indicating a probability of impact with Earth."
    }
};

// UFO/Alien Ships - For fun and engagement
const ALIEN_SHIPS = [
    {
        id: "scout",
        name: "Scout Vessel",
        type: "scout",
        size: 0.3,
        speed: 2,
        orbitRadius: 120,
        color: 0x44ffaa,
        glowColor: 0x00ff88,
        description: "A small, agile craft often spotted near planetary bodies.",
        behavior: "patrol",
        lightPattern: "pulse"
    },
    {
        id: "mothership",
        name: "Mothership",
        type: "mothership",
        size: 1.2,
        speed: 0.5,
        orbitRadius: 200,
        color: 0x8888ff,
        glowColor: 0x6666ff,
        description: "Massive vessel occasionally detected at the edge of the solar system.",
        behavior: "orbit",
        lightPattern: "rotate"
    },
    {
        id: "cruiser",
        name: "Light Cruiser",
        type: "cruiser",
        size: 0.5,
        speed: 1.5,
        orbitRadius: 150,
        color: 0xff8844,
        glowColor: 0xff6622,
        description: "Medium-sized craft with advanced propulsion systems.",
        behavior: "wander",
        lightPattern: "blink"
    },
    {
        id: "probe",
        name: "Alien Probe",
        type: "probe",
        size: 0.15,
        speed: 3,
        orbitRadius: 100,
        color: 0xffff44,
        glowColor: 0xffff00,
        description: "Automated research device studying planetary atmospheres.",
        behavior: "scan",
        lightPattern: "sweep"
    }
];

// Space Debris and Objects
const SPACE_DEBRIS = {
    density: 500, // Number of debris particles
    minOrbit: 2,
    maxOrbit: 4,
    color: 0x666666,
    size: 0.01
};

// Shooting Stars / Meteors
const METEOR_CONFIG = {
    frequency: 5000, // ms between meteors
    speed: 50,
    trailLength: 15,
    colors: [0xffffff, 0xffffcc, 0xffccaa, 0xaaccff],
    size: 0.1
};

// Space Station Details (for detailed models)
const STATION_PARTS = {
    solarPanel: {
        width: 0.4,
        height: 0.02,
        depth: 0.15,
        color: 0x2244aa
    },
    module: {
        radius: 0.05,
        length: 0.2,
        color: 0xcccccc
    },
    antenna: {
        size: 0.03,
        color: 0xdddddd
    }
};

// Educational Facts about Space Objects
const SPACE_FACTS = {
    satellites: [
        "There are over 7,000 satellites currently orbiting Earth",
        "The first artificial satellite, Sputnik 1, was launched in 1957",
        "GPS satellites orbit at about 20,200 km altitude",
        "The ISS travels at 28,000 km/h, orbiting Earth every 90 minutes",
        "Satellites can see objects as small as 30cm from space"
    ],
    comets: [
        "Comets are often called 'dirty snowballs' made of ice, dust, and rock",
        "A comet's tail always points away from the Sun",
        "The longest recorded comet tail was over 500 million km",
        "There may be trillions of comets in the Oort Cloud",
        "Comets may have brought water and organic molecules to early Earth"
    ],
    asteroids: [
        "The asteroid belt contains millions of asteroids",
        "Most asteroids are made of rock, but some contain metals",
        "An asteroid impact likely caused the dinosaur extinction",
        "Some asteroids have their own moons",
        "NASA's DART mission successfully changed an asteroid's orbit"
    ],
    spacecraft: [
        "Voyager 1 is over 24 billion km from Earth",
        "The Parker Solar Probe is the fastest human-made object ever",
        "JWST's mirror is 6.5 meters wide, too big to launch in one piece",
        "The Hubble Space Telescope has made over 1.5 million observations",
        "SpaceX has launched over 5,000 Starlink satellites"
    ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SATELLITES,
        COMETS,
        ASTEROIDS,
        ALIEN_SHIPS,
        SPACE_DEBRIS,
        METEOR_CONFIG,
        STATION_PARTS,
        SPACE_FACTS
    };
}
