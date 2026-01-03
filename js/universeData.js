/**
 * Universe Data - Galaxies, Nebulae, and Deep Space Objects
 * Comprehensive data for realistic universe visualization
 */

const UNIVERSE_DATA = {
    // Our location in the universe
    localGroup: {
        name: "Local Group",
        description: "Our galaxy cluster containing the Milky Way, Andromeda, and about 80 smaller galaxies spanning 10 million light-years."
    },

    // Milky Way Galaxy Data
    milkyWay: {
        name: "Milky Way Galaxy",
        type: "Barred Spiral Galaxy",
        diameter: 100000, // light-years
        stars: "100-400 billion",
        age: "13.6 billion years",
        solarSystemPosition: {
            arm: "Orion-Cygnus Arm",
            distanceFromCenter: "26,000 light-years"
        },
        description: "Our home galaxy is a barred spiral galaxy with a supermassive black hole (Sagittarius A*) at its center. The Solar System is located in the Orion Arm, about 26,000 light-years from the galactic center.",
        color: 0x8899bb,
        spiralArms: 4,
        facts: [
            "The Milky Way is on a collision course with Andromeda",
            "It takes 225-250 million years for our Sun to orbit the galaxy",
            "The supermassive black hole at the center has 4 million solar masses",
            "The galaxy rotates at about 270 km/s at the Sun's distance"
        ]
    }
};

// Galaxy Types and Examples
const GALAXIES = {
    andromeda: {
        name: "Andromeda Galaxy (M31)",
        type: "Spiral Galaxy",
        distance: "2.537 million light-years",
        diameter: "220,000 light-years",
        stars: "1 trillion",
        constellation: "Andromeda",
        magnitude: 3.44,
        description: "The nearest large galaxy to the Milky Way and the most distant object visible to the naked eye. It will collide with our galaxy in about 4.5 billion years.",
        color: 0xc4a6ff,
        position: { x: 800, y: 200, z: -600 },
        scale: 50,
        facts: [
            "Contains approximately 1 trillion stars",
            "Moving towards us at 110 km/s",
            "Has at least 19 satellite galaxies",
            "First identified as 'small cloud' by Persian astronomer Al-Sufi in 964 AD"
        ]
    },
    triangulum: {
        name: "Triangulum Galaxy (M33)",
        type: "Spiral Galaxy",
        distance: "2.73 million light-years",
        diameter: "60,000 light-years",
        stars: "40 billion",
        constellation: "Triangulum",
        magnitude: 5.72,
        description: "The third-largest member of the Local Group. It may be a satellite of the Andromeda Galaxy.",
        color: 0x99bbff,
        position: { x: 600, y: -100, z: -800 },
        scale: 25,
        facts: [
            "Contains the largest known star-forming region, NGC 604",
            "May orbit Andromeda Galaxy",
            "Has no supermassive black hole at center",
            "One of the most distant objects visible without telescope"
        ]
    },
    sombrero: {
        name: "Sombrero Galaxy (M104)",
        type: "Lenticular/Spiral Galaxy",
        distance: "29.3 million light-years",
        diameter: "50,000 light-years",
        stars: "100 billion",
        constellation: "Virgo",
        magnitude: 8.0,
        description: "Famous for its bright nucleus, large central bulge, and dust lane that resembles a sombrero hat.",
        color: 0xffddaa,
        position: { x: -700, y: 300, z: 500 },
        scale: 30,
        facts: [
            "Has a supermassive black hole of 1 billion solar masses",
            "Contains about 2,000 globular clusters",
            "The dust ring contains most of the galaxy's cold hydrogen",
            "Named for its resemblance to a Mexican hat"
        ]
    },
    whirlpool: {
        name: "Whirlpool Galaxy (M51)",
        type: "Spiral Galaxy",
        distance: "23 million light-years",
        diameter: "76,000 light-years",
        stars: "100 billion",
        constellation: "Canes Venatici",
        magnitude: 8.4,
        description: "A grand-design spiral galaxy interacting with NGC 5195. One of the most famous galaxies in the sky.",
        color: 0xaaccff,
        position: { x: 500, y: -300, z: 700 },
        scale: 35,
        facts: [
            "First galaxy to be classified as a spiral",
            "Interacting with smaller companion galaxy NGC 5195",
            "Has very active star formation in its spiral arms",
            "Was discovered by Charles Messier in 1773"
        ]
    },
    cartwheel: {
        name: "Cartwheel Galaxy",
        type: "Ring Galaxy",
        distance: "500 million light-years",
        diameter: "150,000 light-years",
        stars: "Billions",
        constellation: "Sculptor",
        magnitude: 15.2,
        description: "A spectacular ring galaxy formed when a smaller galaxy passed through its center about 200 million years ago.",
        color: 0x88ddff,
        position: { x: -900, y: -200, z: -400 },
        scale: 40,
        facts: [
            "Ring expanding at 300,000 km/h",
            "Collision created massive star formation wave",
            "Has both inner and outer ring structures",
            "One of the most dramatic collision remnants known"
        ]
    },
    cigar: {
        name: "Cigar Galaxy (M82)",
        type: "Starburst Galaxy",
        distance: "12 million light-years",
        diameter: "37,000 light-years",
        stars: "30 billion",
        constellation: "Ursa Major",
        magnitude: 8.41,
        description: "A starburst galaxy with intense star formation at its center, creating massive outflows of gas and dust.",
        color: 0xff8866,
        position: { x: 400, y: 400, z: -500 },
        scale: 20,
        facts: [
            "Star formation rate 10x higher than typical galaxies",
            "Superwind blows gas perpendicular to the disk",
            "Gravitationally interacting with M81",
            "Hosts a super-luminous X-ray source"
        ]
    },
    blackEye: {
        name: "Black Eye Galaxy (M64)",
        type: "Spiral Galaxy",
        distance: "17 million light-years",
        diameter: "51,000 light-years",
        stars: "100 billion",
        constellation: "Coma Berenices",
        magnitude: 8.52,
        description: "Known for the spectacular dark band of absorbing dust in front of its bright nucleus, giving it a 'black eye' appearance.",
        color: 0xddcc99,
        position: { x: -500, y: 100, z: 800 },
        scale: 28,
        facts: [
            "Inner region rotates opposite to outer region",
            "May have absorbed a smaller galaxy",
            "Dark dust band caused by ancient collision",
            "Active star formation in collision zone"
        ]
    },
    pinwheel: {
        name: "Pinwheel Galaxy (M101)",
        type: "Spiral Galaxy",
        distance: "21 million light-years",
        diameter: "170,000 light-years",
        stars: "1 trillion",
        constellation: "Ursa Major",
        magnitude: 7.86,
        description: "A face-on spiral galaxy larger than the Milky Way, known for its well-defined spiral structure.",
        color: 0xbbccff,
        position: { x: 300, y: -400, z: -600 },
        scale: 45,
        facts: [
            "Nearly 70% larger than Milky Way",
            "Contains over 3,000 star-forming regions",
            "Has asymmetric spiral arms",
            "One of the largest known spiral galaxies"
        ]
    }
};

// Nebulae Data
const NEBULAE = {
    orion: {
        name: "Orion Nebula (M42)",
        type: "Emission/Reflection Nebula",
        distance: "1,344 light-years",
        diameter: "24 light-years",
        constellation: "Orion",
        description: "The brightest nebula visible to the naked eye and one of the most studied celestial objects. It's a stellar nursery where new stars are being born.",
        color: 0xff6688,
        glowColor: 0xff9999,
        position: { x: 200, y: 50, z: 300 },
        scale: 15,
        facts: [
            "Contains about 700 stars in various formation stages",
            "The Trapezium cluster at its center is only 300,000 years old",
            "Will eventually form an open star cluster",
            "Visible to naked eye as the middle 'star' in Orion's sword"
        ]
    },
    crab: {
        name: "Crab Nebula (M1)",
        type: "Supernova Remnant",
        distance: "6,500 light-years",
        diameter: "11 light-years",
        constellation: "Taurus",
        description: "The remnant of a supernova explosion observed by Chinese astronomers in 1054 AD. Contains a rapidly rotating neutron star (pulsar) at its center.",
        color: 0x88ffaa,
        glowColor: 0xaaffcc,
        position: { x: -150, y: 100, z: 250 },
        scale: 10,
        facts: [
            "Expanding at 1,500 km/s",
            "Central pulsar rotates 30 times per second",
            "Was bright enough to be visible during day in 1054",
            "First astronomical object identified with supernova"
        ]
    },
    helix: {
        name: "Helix Nebula (NGC 7293)",
        type: "Planetary Nebula",
        distance: "655 light-years",
        diameter: "2.5 light-years",
        constellation: "Aquarius",
        description: "One of the closest planetary nebulae to Earth, often called the 'Eye of God' due to its appearance. Shows the fate of Sun-like stars.",
        color: 0x66ddff,
        glowColor: 0x88eeff,
        position: { x: 180, y: -80, z: -200 },
        scale: 12,
        facts: [
            "Central star has temperature of 120,000°C",
            "Formed about 10,600 years ago",
            "Contains thousands of comet-like knots",
            "Represents the future of our Sun in ~5 billion years"
        ]
    },
    pillarsOfCreation: {
        name: "Pillars of Creation",
        type: "Star-Forming Region (Eagle Nebula)",
        distance: "7,000 light-years",
        diameter: "4-5 light-years (pillars)",
        constellation: "Serpens",
        description: "Iconic elephant trunk-shaped columns of gas and dust in the Eagle Nebula, one of the most famous astronomical images.",
        color: 0xffaa66,
        glowColor: 0xffcc88,
        position: { x: -250, y: 150, z: 350 },
        scale: 18,
        facts: [
            "Tallest pillar is about 4 light-years tall",
            "Actively forming new stars",
            "May have already been destroyed by supernova",
            "First imaged by Hubble in 1995"
        ]
    },
    catEye: {
        name: "Cat's Eye Nebula (NGC 6543)",
        type: "Planetary Nebula",
        distance: "3,000 light-years",
        diameter: "0.2 light-years",
        constellation: "Draco",
        description: "One of the most complex planetary nebulae known, showing intricate structures ejected by a dying star.",
        color: 0x44ffdd,
        glowColor: 0x66ffee,
        position: { x: 100, y: 200, z: -150 },
        scale: 8,
        facts: [
            "Has at least 11 concentric shells",
            "Central star's surface temperature is 80,000°C",
            "May have binary star at center",
            "Structurally most complex nebula known"
        ]
    },
    horsehead: {
        name: "Horsehead Nebula (Barnard 33)",
        type: "Dark Nebula",
        distance: "1,500 light-years",
        diameter: "3.5 light-years",
        constellation: "Orion",
        description: "An iconic dark nebula silhouetted against the emission nebula IC 434. One of the most identifiable nebulae in the sky.",
        color: 0x442222,
        glowColor: 0xff4466,
        position: { x: -180, y: -60, z: 280 },
        scale: 14,
        facts: [
            "Will be destroyed in about 5 million years",
            "Made of thick dust blocking background light",
            "Part of the Orion Molecular Cloud Complex",
            "Was first photographed in 1888"
        ]
    },
    ringNebula: {
        name: "Ring Nebula (M57)",
        type: "Planetary Nebula",
        distance: "2,300 light-years",
        diameter: "1.3 light-years",
        constellation: "Lyra",
        description: "A classic example of a planetary nebula - the outer layers of a dying Sun-like star. Its ring shape is actually barrel-shaped, seen end-on.",
        color: 0x88aaff,
        glowColor: 0xaaccff,
        position: { x: 220, y: -120, z: -100 },
        scale: 9,
        facts: [
            "Expanding at 20-30 km/s",
            "Formed about 4,000 years ago",
            "Actually more barrel-shaped than ring-shaped",
            "Central star was once similar to our Sun"
        ]
    },
    tarantula: {
        name: "Tarantula Nebula (NGC 2070)",
        type: "Emission Nebula",
        distance: "160,000 light-years",
        diameter: "600 light-years",
        constellation: "Dorado",
        description: "The most active star-forming region in the Local Group. Located in the Large Magellanic Cloud, it would cover 60 full moons if brought to Orion Nebula's distance.",
        color: 0xff5577,
        glowColor: 0xff7799,
        position: { x: -300, y: -180, z: 400 },
        scale: 25,
        facts: [
            "Contains over 500,000 solar masses of gas",
            "Hosts the most massive known star (R136a1)",
            "If at Orion's distance, would cast shadows",
            "Most luminous nebula in the Local Group"
        ]
    }
};

// Star Clusters
const STAR_CLUSTERS = {
    pleiades: {
        name: "Pleiades (M45)",
        type: "Open Cluster",
        distance: "444 light-years",
        stars: "Over 1,000",
        age: "100 million years",
        constellation: "Taurus",
        description: "The Seven Sisters - one of the nearest and most obvious star clusters to naked eye observers. Important in many world cultures.",
        color: 0xaaccff,
        position: { x: 150, y: 80, z: 180 },
        scale: 10,
        facts: [
            "Contains hot blue stars only 100 million years old",
            "Visible to naked eye, containing 7-14 stars",
            "Has reflection nebulosity from surrounding dust",
            "Mentioned in ancient texts from Homer to the Bible"
        ]
    },
    omegaCentauri: {
        name: "Omega Centauri (NGC 5139)",
        type: "Globular Cluster",
        distance: "15,800 light-years",
        stars: "10 million",
        age: "12 billion years",
        constellation: "Centaurus",
        description: "The largest and brightest globular cluster in the Milky Way. May be the remnant core of a dwarf galaxy absorbed by our galaxy.",
        color: 0xffeecc,
        position: { x: -200, y: -150, z: 120 },
        scale: 15,
        facts: [
            "Contains multiple stellar populations",
            "May have black hole at center",
            "Possibly remnant of absorbed dwarf galaxy",
            "10 times as massive as typical globular clusters"
        ]
    },
    hercules: {
        name: "Hercules Cluster (M13)",
        type: "Globular Cluster",
        distance: "22,200 light-years",
        stars: "300,000",
        age: "11.65 billion years",
        constellation: "Hercules",
        description: "One of the most prominent globular clusters visible from the Northern Hemisphere. Target of the 1974 Arecibo Message.",
        color: 0xffddaa,
        position: { x: 250, y: 100, z: -80 },
        scale: 12,
        facts: [
            "Target of 1974 Arecibo radio message",
            "Visible to naked eye under dark skies",
            "Stars are packed 500x denser than near Sun",
            "Discovered by Edmond Halley in 1714"
        ]
    }
};

// Black Holes and Exotic Objects
const EXOTIC_OBJECTS = {
    sagittariusAStar: {
        name: "Sagittarius A*",
        type: "Supermassive Black Hole",
        distance: "26,000 light-years",
        mass: "4 million solar masses",
        location: "Milky Way Center",
        description: "The supermassive black hole at the center of our galaxy. First imaged by the Event Horizon Telescope in 2022.",
        color: 0x220022,
        glowColor: 0xff6600,
        position: { x: 0, y: 0, z: 0 },
        scale: 8,
        facts: [
            "First directly imaged in 2022 by EHT",
            "Event horizon about 12 million km across",
            "Stars orbit it at speeds up to 5,000 km/s",
            "Currently relatively quiet compared to other SMBHs"
        ]
    },
    m87BlackHole: {
        name: "M87* Black Hole",
        type: "Supermassive Black Hole",
        distance: "55 million light-years",
        mass: "6.5 billion solar masses",
        location: "M87 Galaxy Center",
        description: "The first black hole ever directly imaged (2019). Produces a powerful relativistic jet extending 5,000 light-years.",
        color: 0x110011,
        glowColor: 0xff4400,
        position: { x: -600, y: 250, z: -350 },
        scale: 20,
        facts: [
            "First black hole ever photographed (2019)",
            "Jet extends 5,000+ light-years",
            "Event horizon larger than our solar system",
            "Over 1,500 times more massive than Sgr A*"
        ]
    },
    cygX1: {
        name: "Cygnus X-1",
        type: "Stellar Black Hole",
        distance: "6,070 light-years",
        mass: "21 solar masses",
        location: "Cygnus constellation",
        description: "One of the strongest X-ray sources in the sky and the first widely accepted black hole candidate. Part of a binary system.",
        color: 0x000044,
        glowColor: 0x4488ff,
        position: { x: 120, y: 180, z: -220 },
        scale: 5,
        facts: [
            "First black hole candidate widely accepted",
            "Subject of famous Hawking-Thorne bet",
            "Companion star being stripped of material",
            "Emits intense X-rays from accretion disk"
        ]
    }
};

// Cosmic Structures
const COSMIC_STRUCTURES = {
    greatWall: {
        name: "Sloan Great Wall",
        type: "Galaxy Filament",
        distance: "1 billion light-years",
        size: "1.37 billion light-years long",
        description: "One of the largest known structures in the observable universe, a wall of galaxies.",
        position: { x: 2000, y: 500, z: -1500 }
    },
    booVoid: {
        name: "Boötes Void",
        type: "Supervoid",
        distance: "700 million light-years",
        size: "330 million light-years diameter",
        description: "One of the largest known voids in the universe, containing very few galaxies.",
        position: { x: -1500, y: -800, z: 2000 }
    }
};

// View distances for scaling
const VIEW_SCALES = {
    solarSystem: {
        name: "Solar System",
        maxDistance: 500,
        description: "Our planetary neighborhood"
    },
    interstellar: {
        name: "Interstellar",
        maxDistance: 2000,
        description: "Nearby stars and nebulae"
    },
    galactic: {
        name: "Galactic",
        maxDistance: 5000,
        description: "Our Milky Way galaxy view"
    },
    intergalactic: {
        name: "Intergalactic",
        maxDistance: 15000,
        description: "Local Group and beyond"
    },
    cosmic: {
        name: "Cosmic",
        maxDistance: 50000,
        description: "Deep universe exploration"
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UNIVERSE_DATA, GALAXIES, NEBULAE, STAR_CLUSTERS, EXOTIC_OBJECTS, COSMIC_STRUCTURES, VIEW_SCALES };
}
