/**
 * Solar System 3D Visualization
 * Main Three.js implementation
 */

class SolarSystem {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null;

        // Scene objects
        this.sun = null;
        this.planets = {};
        this.moons = {};
        this.orbits = {};
        this.labels = {};
        this.asteroidBelt = null;
        this.starField = null;

        // Universe objects (NEW)
        this.galaxies = {};
        this.nebulae = {};
        this.starClusters = {};
        this.blackHoles = {};
        this.milkyWayDisk = null;
        this.cosmicDust = null;
        this.distantStars = null;

        // Space objects (NEW)
        this.satellites = {};
        this.spaceStations = {};
        this.alienShips = [];
        this.comets = [];
        this.meteors = [];
        this.spaceDebris = null;
        this.showSatellites = true;
        this.showAlienShips = true;
        this.showComets = true;

        // State
        this.selectedPlanet = null;
        this.focusedPlanet = null;
        this.isPlaying = true;
        this.timeSpeed = 1;
        this.simulationTime = Date.now();
        this.showOrbits = true;
        this.showLabels = true;
        this.showMoons = false;
        this.showStars = true;
        this.showAsteroidBelt = false;
        this.showPluto = false;
        this.autoOrbit = false;
        this.qualitySetting = 'medium';
        this.distanceScale = 'logarithmic';
        this.planetSizeMultiplier = 5;

        // Universe exploration state (NEW)
        this.currentView = 'solarSystem'; // solarSystem, interstellar, galactic, intergalactic, cosmic
        this.showGalaxies = false;
        this.showNebulae = false;
        this.showMilkyWay = false;
        this.universeScale = 1;
        this.selectedDeepSpaceObject = null;

        // Surface view mode
        this.surfaceViewActive = false;
        this.surfaceViewPlanet = null;
        this.highDetailTextures = {};

        // Animation
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredPlanet = null;

        // Callbacks
        this.onPlanetSelect = null;
        this.onPlanetHover = null;

        // FPS tracking
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.currentFps = 60;

        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();
        this.createLights();
        this.createEnhancedStarField();
        this.createSun();
        this.createPlanets();
        this.createOrbits();
        this.createUniverseObjects();
        this.createSpaceObjects();
        this.setupPostProcessing();
        this.setupEventListeners();
        this.startMeteorShower();
        this.animate();
    }

    createScene() {
        this.scene = new THREE.Scene();
        // Enhanced background with subtle gradient
        this.scene.background = new THREE.Color(0x000005);
        // Add fog for depth
        this.scene.fog = new THREE.FogExp2(0x000010, 0.00008);
    }

    createCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 10000);
        this.camera.position.set(100, 80, 200);
        this.camera.lookAt(0, 0, 0);
    }

    createRenderer() {
        // Check WebGL support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
            throw new Error('WebGL is not supported. Please use a modern browser or enable hardware acceleration.');
        }

        this.renderer = new THREE.WebGLRenderer({
            antialias: this.qualitySetting !== 'low',
            alpha: true,
            powerPreference: 'default', // Changed from high-performance for better compatibility
            failIfMajorPerformanceCaveat: false // Allow software rendering
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = this.qualitySetting === 'high' || this.qualitySetting === 'ultra';
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);
    }

    createControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = true;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 50000; // Extended for universe exploration
        this.controls.maxPolarAngle = Math.PI;
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 0.5;

        // Track zoom for auto-exit surface view
        this.lastCameraDistance = 0;
        this.surfaceViewEntryTime = 0; // Track when surface view was entered
        this.controls.addEventListener('change', () => {
            this.checkSurfaceViewExit();
        });
    }

    checkSurfaceViewExit() {
        if (!this.surfaceViewActive || !this.surfaceViewPlanet) return;

        // Don't check for auto-exit within 2 seconds of entering surface view
        // This prevents exit during camera animation
        if (Date.now() - this.surfaceViewEntryTime < 2000) return;

        const distance = this.camera.position.distanceTo(this.surfaceViewPlanet.position);
        const planetSize = this.surfaceViewPlanet.userData.size;
        const exitThreshold = planetSize * 8; // Exit when zoomed out beyond 8x planet size

        if (distance > exitThreshold) {
            this.exitSurfaceView();
            if (this.onSurfaceViewExit) {
                this.onSurfaceViewExit();
            }
        }
    }

    createLights() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0x404050, 0.4);
        this.scene.add(ambientLight);

        // Point light from sun
        this.sunLight = new THREE.PointLight(0xffffff, 2.5, 2000);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);

        // Hemisphere light for natural lighting
        const hemiLight = new THREE.HemisphereLight(0xffffcc, 0x080820, 0.6);
        this.scene.add(hemiLight);

        // Add subtle directional light for depth
        const dirLight = new THREE.DirectionalLight(0x4466ff, 0.15);
        dirLight.position.set(100, 100, 100);
        this.scene.add(dirLight);
    }

    createEnhancedStarField() {
        // Create multiple layers of stars for parallax effect
        this.createStarLayer(5000, 600, 900, 2.0, 1.0); // Close stars
        this.createStarLayer(10000, 900, 1500, 1.5, 0.8); // Medium stars
        this.createStarLayer(20000, 1500, 3000, 1.0, 0.6); // Far stars
        this.createDistantGalaxies(); // Tiny distant galaxies in background
    }

    createStarLayer(count, minRadius, maxRadius, size, opacity) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        // Star color types
        const starColors = [
            { r: 1.0, g: 0.9, b: 0.8 },   // White/Yellow (Sun-like)
            { r: 0.8, g: 0.9, b: 1.0 },   // Blue-white (hot stars)
            { r: 1.0, g: 0.7, b: 0.5 },   // Orange (cooler stars)
            { r: 1.0, g: 0.5, b: 0.4 },   // Red (cool stars)
            { r: 0.9, g: 0.95, b: 1.0 },  // Pale blue
        ];

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = minRadius + Math.random() * (maxRadius - minRadius);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Random star color with temperature variation
            const colorType = starColors[Math.floor(Math.random() * starColors.length)];
            const variation = 0.9 + Math.random() * 0.2;
            colors[i * 3] = colorType.r * variation;
            colors[i * 3 + 1] = colorType.g * variation;
            colors[i * 3 + 2] = colorType.b * variation;

            // Varied star sizes with some bright stars
            sizes[i] = Math.random() < 0.02 ? size * 3 : size * (0.5 + Math.random());
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: size,
            vertexColors: true,
            transparent: true,
            opacity: opacity,
            sizeAttenuation: false,
            blending: THREE.AdditiveBlending
        });

        const stars = new THREE.Points(geometry, material);
        stars.userData.isStarField = true;
        this.scene.add(stars);

        if (!this.starField) {
            this.starField = stars;
        }
    }

    createDistantGalaxies() {
        // Create tiny specks representing distant galaxies
        const galaxyCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(galaxyCount * 3);
        const colors = new Float32Array(galaxyCount * 3);

        for (let i = 0; i < galaxyCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 2500 + Math.random() * 2000;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Subtle galaxy colors
            colors[i * 3] = 0.7 + Math.random() * 0.3;
            colors[i * 3 + 1] = 0.6 + Math.random() * 0.3;
            colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 3,
            vertexColors: true,
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: false,
            blending: THREE.AdditiveBlending
        });

        const distantGalaxies = new THREE.Points(geometry, material);
        this.scene.add(distantGalaxies);
    }

    createSun() {
        const sunData = PLANET_DATA.sun;

        // Sun geometry with higher detail
        const geometry = new THREE.SphereGeometry(sunData.size, 128, 128);

        // Create realistic sun texture
        const sunTexture = this.createRealisticSunTexture();

        // Sun material with animated shader-like effect
        const material = new THREE.MeshBasicMaterial({
            map: sunTexture,
            transparent: false
        });

        this.sun = new THREE.Mesh(geometry, material);
        this.sun.name = 'sun';
        this.sun.userData = { ...sunData, isPlanet: true };
        this.scene.add(this.sun);

        // Multi-layer sun glow effect
        this.createEnhancedSunGlow();

        // Corona effect with solar prominences
        this.createEnhancedSunCorona();

        // Solar wind particles
        this.createSolarWind();
    }

    createRealisticSunTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Base gradient - photosphere
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#fff8dc');
        gradient.addColorStop(0.2, '#ffdd44');
        gradient.addColorStop(0.5, '#ffaa00');
        gradient.addColorStop(0.8, '#ff8800');
        gradient.addColorStop(1, '#ff6600');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Solar granulation (convection cells) - thousands of them
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 12 + 3;

            // Brighter cell center
            const cellGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
            cellGrad.addColorStop(0, `rgba(255, ${240 + Math.random() * 15}, ${200 + Math.random() * 55}, ${0.3 + Math.random() * 0.3})`);
            cellGrad.addColorStop(0.7, `rgba(255, ${200 + Math.random() * 40}, ${100 + Math.random() * 50}, ${0.15 + Math.random() * 0.15})`);
            cellGrad.addColorStop(1, 'rgba(255, 180, 80, 0)');

            ctx.fillStyle = cellGrad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sunspots with penumbra and umbra
        const sunspotCount = 5 + Math.floor(Math.random() * 8);
        for (let i = 0; i < sunspotCount; i++) {
            const x = Math.random() * canvas.width * 0.7 + canvas.width * 0.15;
            const y = Math.random() * canvas.height * 0.6 + canvas.height * 0.2;
            const radius = Math.random() * 50 + 20;

            // Penumbra (outer region)
            const penumbra = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius);
            penumbra.addColorStop(0, '#553311');
            penumbra.addColorStop(0.5, '#774422');
            penumbra.addColorStop(1, 'rgba(150, 100, 50, 0)');
            ctx.fillStyle = penumbra;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();

            // Umbra (dark core)
            ctx.fillStyle = '#221100';
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Bright faculae (bright patches near sunspots)
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            ctx.fillStyle = `rgba(255, 255, 230, ${Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(x, y, Math.random() * 40 + 10, Math.random() * 20 + 5, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        // Supergranulation pattern
        ctx.strokeStyle = 'rgba(255, 200, 100, 0.08)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 100; i++) {
            ctx.beginPath();
            const startX = Math.random() * canvas.width;
            const startY = Math.random() * canvas.height;
            ctx.moveTo(startX, startY);
            ctx.bezierCurveTo(
                startX + (Math.random() - 0.5) * 200,
                startY + (Math.random() - 0.5) * 100,
                startX + (Math.random() - 0.5) * 200,
                startY + (Math.random() - 0.5) * 100,
                startX + (Math.random() - 0.5) * 300,
                startY + (Math.random() - 0.5) * 150
            );
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
    }

    createEnhancedSunGlow() {
        // Inner bright glow
        const innerGlow = new THREE.SpriteMaterial({
            map: this.createSunGlowTexture(0.8, '#ffffee', '#ffaa00'),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const innerSprite = new THREE.Sprite(innerGlow);
        innerSprite.scale.set(50, 50, 1);
        this.sun.add(innerSprite);

        // Mid glow
        const midGlow = new THREE.SpriteMaterial({
            map: this.createSunGlowTexture(0.5, '#ffcc44', '#ff6600'),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const midSprite = new THREE.Sprite(midGlow);
        midSprite.scale.set(80, 80, 1);
        this.sun.add(midSprite);

        // Outer corona glow
        const outerGlow = new THREE.SpriteMaterial({
            map: this.createSunGlowTexture(0.25, '#ff8844', '#ff2200'),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const outerSprite = new THREE.Sprite(outerGlow);
        outerSprite.scale.set(120, 120, 1);
        this.sun.add(outerSprite);
    }

    createSunGlowTexture(intensity, innerColor, outerColor) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(0.1, innerColor);
        gradient.addColorStop(0.4, outerColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.globalAlpha = intensity;
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        return new THREE.CanvasTexture(canvas);
    }

    createEnhancedSunCorona() {
        // Corona streamers
        const coronaGroup = new THREE.Group();
        coronaGroup.name = 'corona';

        // Create multiple corona streamer layers
        for (let layer = 0; layer < 3; layer++) {
            const streamerCount = 24 - layer * 6;
            for (let i = 0; i < streamerCount; i++) {
                const angle = (i / streamerCount) * Math.PI * 2 + layer * 0.2;
                const length = (Math.random() * 8 + 4) * (1 - layer * 0.2);
                const width = Math.random() * 0.5 + 0.2;

                const points = [];
                for (let j = 0; j <= 20; j++) {
                    const t = j / 20;
                    const r = PLANET_DATA.sun.size + t * length;
                    const wobble = Math.sin(t * Math.PI * 3) * (1 - t) * 0.5;
                    points.push(new THREE.Vector3(
                        Math.cos(angle + wobble * 0.1) * r,
                        Math.sin(angle + wobble * 0.1) * r,
                        wobble
                    ));
                }

                const curve = new THREE.CatmullRomCurve3(points);
                const tubeGeometry = new THREE.TubeGeometry(curve, 20, width * (1 - layer * 0.3), 8, false);
                const tubeMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setHSL(0.1, 0.8, 0.7 - layer * 0.15),
                    transparent: true,
                    opacity: 0.3 - layer * 0.08,
                    blending: THREE.AdditiveBlending
                });

                const streamer = new THREE.Mesh(tubeGeometry, tubeMaterial);
                coronaGroup.add(streamer);
            }
        }

        // Add solar prominences (arcing loops)
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const prominence = this.createSolarProminence(angle);
            coronaGroup.add(prominence);
        }

        this.sun.add(coronaGroup);
        this.coronaGroup = coronaGroup;
    }

    createSolarProminence(baseAngle) {
        const points = [];
        const height = Math.random() * 6 + 3;
        const spread = Math.random() * 0.4 + 0.2;

        for (let i = 0; i <= 30; i++) {
            const t = i / 30;
            const angle = baseAngle + (t - 0.5) * spread;
            const r = PLANET_DATA.sun.size + Math.sin(t * Math.PI) * height;
            points.push(new THREE.Vector3(
                Math.cos(angle) * r,
                Math.sin(angle) * r,
                Math.sin(t * Math.PI) * 2
            ));
        }

        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, 30, 0.3, 8, false);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });

        return new THREE.Mesh(geometry, material);
    }

    createSolarWind() {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = PLANET_DATA.sun.size + Math.random() * 100;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Outward velocity
            velocities[i * 3] = positions[i * 3] * 0.01;
            velocities[i * 3 + 1] = positions[i * 3 + 1] * 0.01;
            velocities[i * 3 + 2] = positions[i * 3 + 2] * 0.01;

            // Yellow/orange color
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
            colors[i * 3 + 2] = 0.2 + Math.random() * 0.3;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.solarWindVelocities = velocities;

        const material = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.solarWind = new THREE.Points(geometry, material);
        this.scene.add(this.solarWind);
    }

    createSunGlow() {
        // Legacy method - kept for compatibility, now using enhanced version
        const spriteMaterial = new THREE.SpriteMaterial({
            map: this.createGlowTexture(),
            color: 0xffaa00,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(60, 60, 1);
        this.sun.add(sprite);
    }

    createSunCorona() {
        // Outer glow rings
        for (let i = 0; i < 3; i++) {
            const geometry = new THREE.RingGeometry(
                PLANET_DATA.sun.size + 2 + i * 3,
                PLANET_DATA.sun.size + 4 + i * 3,
                64
            );
            const material = new THREE.MeshBasicMaterial({
                color: 0xffcc00,
                transparent: true,
                opacity: 0.15 - i * 0.04,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
            const ring = new THREE.Mesh(geometry, material);
            ring.rotation.x = Math.PI / 2;
            this.sun.add(ring);
        }
    }

    createGlowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(255, 200, 100, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 150, 50, 0.8)');
        gradient.addColorStop(0.4, 'rgba(255, 100, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createPlanets() {
        const planetNames = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

        planetNames.forEach(name => {
            this.createPlanet(name);
        });

        // Create Pluto (hidden by default)
        this.createPlanet('pluto');
        if (this.planets.pluto) {
            this.planets.pluto.visible = this.showPluto;
        }
    }

    createPlanet(name) {
        const data = PLANET_DATA[name];
        if (!data) return;

        const segments = this.qualitySetting === 'ultra' ? 64 :
            this.qualitySetting === 'high' ? 48 :
                this.qualitySetting === 'medium' ? 32 : 24;

        // Planet geometry
        const geometry = new THREE.SphereGeometry(data.size, segments, segments);

        // Create procedural texture or use color
        const material = this.createPlanetMaterial(name, data);

        const planet = new THREE.Mesh(geometry, material);
        planet.name = name;
        planet.userData = { ...data, isPlanet: true };

        // Set initial position
        const angle = Math.random() * Math.PI * 2;
        planet.position.x = Math.cos(angle) * data.orbitRadius;
        planet.position.z = Math.sin(angle) * data.orbitRadius;
        planet.userData.orbitAngle = angle;

        // Apply axial tilt
        planet.rotation.z = THREE.MathUtils.degToRad(data.axialTilt);

        this.planets[name] = planet;
        this.scene.add(planet);

        // Create atmosphere if applicable
        if (data.atmosphere) {
            this.createAtmosphere(planet, data);
        }

        // Create rings for Saturn and Uranus
        if (data.hasRings) {
            this.createRings(planet, name, data);
        }

        // Create moons
        this.createMoonsForPlanet(name, planet);

        // Create label
        this.createLabel(planet, data.name);
    }

    createPlanetMaterial(name, data) {
        // Create procedural textures for each planet
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Base gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);

        switch (name) {
            case 'mercury':
                gradient.addColorStop(0, '#8a8a8a');
                gradient.addColorStop(0.5, '#b5b5b5');
                gradient.addColorStop(1, '#707070');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 512, 256);
                this.addCraters(ctx, 50);
                break;

            case 'venus':
                gradient.addColorStop(0, '#d4a574');
                gradient.addColorStop(0.5, '#e6c87a');
                gradient.addColorStop(1, '#c4a35a');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 512, 256);
                this.addCloudBands(ctx, '#ddb87a', 0.3);
                break;

            case 'earth':
                // Ocean base
                ctx.fillStyle = '#1a5f8a';
                ctx.fillRect(0, 0, 512, 256);
                // Continents
                this.addEarthContinents(ctx);
                // Clouds
                this.addCloudBands(ctx, '#ffffff', 0.15);
                break;

            case 'mars':
                gradient.addColorStop(0, '#8b3103');
                gradient.addColorStop(0.5, '#c1440e');
                gradient.addColorStop(1, '#a33a0c');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 512, 256);
                // Ice caps
                ctx.fillStyle = '#e8e8e8';
                ctx.fillRect(0, 0, 512, 20);
                ctx.fillRect(0, 236, 512, 20);
                this.addCraters(ctx, 20);
                break;

            case 'jupiter':
                this.addJupiterBands(ctx);
                break;

            case 'saturn':
                this.addSaturnBands(ctx);
                break;

            case 'uranus':
                gradient.addColorStop(0, '#66b2ff');
                gradient.addColorStop(0.5, '#99ccff');
                gradient.addColorStop(1, '#66b2ff');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 512, 256);
                this.addSubtleBands(ctx, '#aaddff', 0.1);
                break;

            case 'neptune':
                gradient.addColorStop(0, '#3344cc');
                gradient.addColorStop(0.5, '#5566ff');
                gradient.addColorStop(1, '#3344cc');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 512, 256);
                // Great Dark Spot
                ctx.fillStyle = 'rgba(30, 30, 100, 0.5)';
                ctx.beginPath();
                ctx.ellipse(300, 128, 40, 25, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'pluto':
                gradient.addColorStop(0, '#a08060');
                gradient.addColorStop(0.5, '#ddc8a3');
                gradient.addColorStop(1, '#a08060');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 512, 256);
                // Heart-shaped region (Tombaugh Regio)
                ctx.fillStyle = '#f0e8d8';
                ctx.beginPath();
                ctx.moveTo(200, 150);
                ctx.bezierCurveTo(200, 100, 256, 80, 256, 120);
                ctx.bezierCurveTo(256, 80, 312, 100, 312, 150);
                ctx.bezierCurveTo(312, 200, 256, 220, 256, 220);
                ctx.bezierCurveTo(256, 220, 200, 200, 200, 150);
                ctx.fill();
                break;

            default:
                ctx.fillStyle = `#${data.color.toString(16).padStart(6, '0')}`;
                ctx.fillRect(0, 0, 512, 256);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        return new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.8,
            metalness: 0.1
        });
    }

    addCraters(ctx, count) {
        for (let i = 0; i < count; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            const radius = Math.random() * 15 + 5;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(80, 80, 80, ${Math.random() * 0.3 + 0.1})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x + 2, y + 2, radius - 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(120, 120, 120, ${Math.random() * 0.2})`;
            ctx.fill();
        }
    }

    addCloudBands(ctx, color, opacity) {
        for (let i = 0; i < 10; i++) {
            const y = Math.random() * 256;
            ctx.fillStyle = color;
            ctx.globalAlpha = opacity * Math.random();
            ctx.fillRect(0, y, 512, Math.random() * 30 + 10);
        }
        ctx.globalAlpha = 1;
    }

    addSubtleBands(ctx, color, opacity) {
        for (let i = 0; i < 5; i++) {
            const y = (256 / 6) * (i + 1);
            ctx.fillStyle = color;
            ctx.globalAlpha = opacity;
            ctx.fillRect(0, y - 5, 512, 10);
        }
        ctx.globalAlpha = 1;
    }

    addEarthContinents(ctx) {
        // Simplified continent shapes
        ctx.fillStyle = '#228B22';

        // North America
        ctx.beginPath();
        ctx.moveTo(50, 60);
        ctx.lineTo(120, 50);
        ctx.lineTo(130, 100);
        ctx.lineTo(80, 120);
        ctx.lineTo(40, 90);
        ctx.closePath();
        ctx.fill();

        // South America
        ctx.beginPath();
        ctx.moveTo(100, 130);
        ctx.lineTo(130, 140);
        ctx.lineTo(120, 200);
        ctx.lineTo(90, 210);
        ctx.lineTo(80, 170);
        ctx.closePath();
        ctx.fill();

        // Europe/Africa
        ctx.beginPath();
        ctx.moveTo(240, 60);
        ctx.lineTo(280, 50);
        ctx.lineTo(300, 90);
        ctx.lineTo(290, 180);
        ctx.lineTo(250, 200);
        ctx.lineTo(230, 140);
        ctx.closePath();
        ctx.fill();

        // Asia
        ctx.beginPath();
        ctx.moveTo(300, 40);
        ctx.lineTo(420, 50);
        ctx.lineTo(450, 100);
        ctx.lineTo(400, 130);
        ctx.lineTo(320, 110);
        ctx.closePath();
        ctx.fill();

        // Australia
        ctx.beginPath();
        ctx.moveTo(400, 160);
        ctx.lineTo(450, 155);
        ctx.lineTo(460, 190);
        ctx.lineTo(420, 200);
        ctx.lineTo(390, 180);
        ctx.closePath();
        ctx.fill();
    }

    addJupiterBands(ctx) {
        const colors = ['#d8ca9d', '#c4a67a', '#b89d6a', '#d4b88a', '#e0c8a0', '#c0986a'];
        const bandHeight = 256 / colors.length;

        colors.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.fillRect(0, i * bandHeight, 512, bandHeight);
        });

        // Great Red Spot
        ctx.fillStyle = '#c75050';
        ctx.beginPath();
        ctx.ellipse(350, 160, 45, 30, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Add some turbulence
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = `rgba(180, 140, 100, ${Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(
                Math.random() * 512,
                Math.random() * 256,
                Math.random() * 20 + 5,
                Math.random() * 8 + 2,
                Math.random() * Math.PI,
                0, Math.PI * 2
            );
            ctx.fill();
        }
    }

    addSaturnBands(ctx) {
        const colors = ['#f4d59e', '#e0c080', '#d4b070', '#ecd090', '#f0d898', '#dcc080'];
        const bandHeight = 256 / colors.length;

        colors.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.fillRect(0, i * bandHeight, 512, bandHeight);
        });

        // Add subtle band variations
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = `rgba(200, 160, 100, ${Math.random() * 0.2})`;
            ctx.fillRect(0, Math.random() * 256, 512, Math.random() * 15 + 5);
        }
    }

    createAtmosphere(planet, data) {
        const atmosphereSize = data.size * 1.05;
        const geometry = new THREE.SphereGeometry(atmosphereSize, 32, 32);

        const material = new THREE.MeshBasicMaterial({
            color: data.atmosphereColor,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });

        const atmosphere = new THREE.Mesh(geometry, material);
        planet.add(atmosphere);
    }

    createRings(planet, name, data) {
        const ringInner = data.size * 1.4;
        const ringOuter = data.size * 2.4;

        // Create ring texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 512, 0);

        if (name === 'saturn') {
            gradient.addColorStop(0, 'rgba(200, 166, 90, 0)');
            gradient.addColorStop(0.1, 'rgba(200, 166, 90, 0.8)');
            gradient.addColorStop(0.2, 'rgba(180, 150, 80, 0.3)');
            gradient.addColorStop(0.3, 'rgba(200, 166, 90, 0.9)');
            gradient.addColorStop(0.5, 'rgba(220, 190, 120, 0.7)');
            gradient.addColorStop(0.7, 'rgba(200, 166, 90, 0.5)');
            gradient.addColorStop(0.9, 'rgba(180, 150, 80, 0.3)');
            gradient.addColorStop(1, 'rgba(160, 130, 70, 0)');
        } else {
            // Uranus has fainter rings
            gradient.addColorStop(0, 'rgba(100, 100, 150, 0)');
            gradient.addColorStop(0.2, 'rgba(100, 100, 150, 0.3)');
            gradient.addColorStop(0.8, 'rgba(100, 100, 150, 0.2)');
            gradient.addColorStop(1, 'rgba(100, 100, 150, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 64);

        // Add ring detail lines
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 512;
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
            ctx.fillRect(x, 0, 1, 64);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.rotation = Math.PI / 2;

        const geometry = new THREE.RingGeometry(ringInner, ringOuter, 64);

        // Fix UV mapping for ring
        const pos = geometry.attributes.position;
        const uv = geometry.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const dist = Math.sqrt(x * x + y * y);
            uv.setXY(i, (dist - ringInner) / (ringOuter - ringInner), 0.5);
        }

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: name === 'saturn' ? 0.9 : 0.4
        });

        const rings = new THREE.Mesh(geometry, material);
        rings.rotation.x = Math.PI / 2;

        // Add tilt for Uranus rings
        if (name === 'uranus') {
            rings.rotation.y = Math.PI / 2;
        }

        planet.add(rings);
        planet.userData.rings = rings;
    }

    createMoonsForPlanet(planetName, planet) {
        const planetMoons = Object.entries(MOON_DATA).filter(([_, moon]) => moon.parent === planetName);

        planetMoons.forEach(([moonName, moonData]) => {
            const geometry = new THREE.SphereGeometry(moonData.size, 16, 16);
            const material = new THREE.MeshStandardMaterial({
                color: moonData.color,
                roughness: 0.9
            });

            const moon = new THREE.Mesh(geometry, material);
            moon.name = moonName;
            moon.userData = { ...moonData, isMoon: true };
            moon.userData.orbitAngle = Math.random() * Math.PI * 2;

            // Set initial position
            moon.position.x = moonData.orbitRadius;

            planet.add(moon);
            this.moons[moonName] = moon;
            moon.visible = this.showMoons;

            // Create moon label
            this.createMoonLabel(moon, moonData.name, moonData.size);
        });
    }

    createMoonLabel(moon, name, size) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.roundRect(0, 0, canvas.width, canvas.height, 8);
        ctx.fill();

        // Moon icon (small circle)
        ctx.fillStyle = '#aabbcc';
        ctx.beginPath();
        ctx.arc(28, 32, 12, 0, Math.PI * 2);
        ctx.fill();

        // Moon name text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, 50, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        const labelScale = Math.max(size * 3, 1.5);
        sprite.scale.set(labelScale * 2, labelScale * 0.5, 1);
        sprite.position.set(0, size + labelScale * 0.3, 0);
        sprite.userData = { isMoonLabel: true };

        moon.add(sprite);

        // Store reference
        if (!this.moonLabels) this.moonLabels = {};
        this.moonLabels[moon.name] = sprite;
        sprite.visible = this.showMoons && this.showLabels;
    }

    createOrbits() {
        Object.keys(this.planets).forEach(name => {
            const data = PLANET_DATA[name];
            if (!data || !data.orbitRadius) return;

            const points = [];
            const segments = 128;

            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                points.push(new THREE.Vector3(
                    Math.cos(angle) * data.orbitRadius,
                    0,
                    Math.sin(angle) * data.orbitRadius
                ));
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x444466,
                transparent: true,
                opacity: 0.4
            });

            const orbit = new THREE.Line(geometry, material);
            orbit.rotation.x = THREE.MathUtils.degToRad(data.orbitalInclination);

            this.orbits[name] = orbit;
            this.scene.add(orbit);

            if (name === 'pluto') {
                orbit.visible = this.showPluto;
            }
        });
    }

    createAsteroidBelt() {
        if (this.asteroidBelt) {
            this.scene.remove(this.asteroidBelt);
        }

        const asteroidCount = this.qualitySetting === 'ultra' ? 5000 :
            this.qualitySetting === 'high' ? 3000 :
                this.qualitySetting === 'medium' ? 2000 : 1000;

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(asteroidCount * 3);

        for (let i = 0; i < asteroidCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 90 + Math.random() * 20; // Between Mars and Jupiter
            const height = (Math.random() - 0.5) * 5;

            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0x888888,
            size: 0.3,
            sizeAttenuation: true
        });

        this.asteroidBelt = new THREE.Points(geometry, material);
        this.asteroidBelt.visible = this.showAsteroidBelt;
        this.scene.add(this.asteroidBelt);
    }

    // ==========================================
    // UNIVERSE EXPLORATION FEATURES
    // ==========================================

    createUniverseObjects() {
        this.createMilkyWayVisualization();
        this.createGalaxies();
        this.createNebulae();
        this.createBlackHoles();
        this.createCosmicDust();
    }

    createMilkyWayVisualization() {
        // Create a stylized Milky Way disk when viewed from outside
        const diskGroup = new THREE.Group();

        // Central bulge
        const bulgeGeometry = new THREE.SphereGeometry(80, 32, 32);
        const bulgeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffeecc,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        const bulge = new THREE.Mesh(bulgeGeometry, bulgeMaterial);
        diskGroup.add(bulge);

        // Spiral arms particles
        const armCount = 4;
        const particlesPerArm = 5000;
        const armGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(armCount * particlesPerArm * 3);
        const colors = new Float32Array(armCount * particlesPerArm * 3);

        let index = 0;
        for (let arm = 0; arm < armCount; arm++) {
            const armAngleOffset = (arm / armCount) * Math.PI * 2;

            for (let i = 0; i < particlesPerArm; i++) {
                const distance = 50 + Math.random() * 400;
                const angle = armAngleOffset + (distance / 50) * 0.5 + (Math.random() - 0.5) * 0.3;
                const height = (Math.random() - 0.5) * (20 - distance * 0.02);

                positions[index * 3] = Math.cos(angle) * distance;
                positions[index * 3 + 1] = height;
                positions[index * 3 + 2] = Math.sin(angle) * distance;

                // Color gradient from center (yellow) to edge (blue)
                const t = distance / 450;
                colors[index * 3] = 1.0 - t * 0.3;
                colors[index * 3 + 1] = 0.9 - t * 0.2;
                colors[index * 3 + 2] = 0.8 + t * 0.2;

                index++;
            }
        }

        armGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        armGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const armMaterial = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const arms = new THREE.Points(armGeometry, armMaterial);
        diskGroup.add(arms);

        // Add glow sprite for galactic center
        const glowTexture = this.createGlowTexture();
        const glowMaterial = new THREE.SpriteMaterial({
            map: glowTexture,
            color: 0xffddaa,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.5
        });
        const glow = new THREE.Sprite(glowMaterial);
        glow.scale.set(200, 200, 1);
        diskGroup.add(glow);

        diskGroup.visible = false; // Hidden by default
        diskGroup.userData.isMilkyWay = true;
        this.milkyWayDisk = diskGroup;
        this.scene.add(diskGroup);
    }

    createGalaxies() {
        if (typeof GALAXIES === 'undefined') return;

        Object.entries(GALAXIES).forEach(([key, data]) => {
            const galaxy = this.createGalaxyObject(key, data);
            galaxy.visible = false; // Hidden by default
            this.galaxies[key] = galaxy;
            this.scene.add(galaxy);
        });
    }

    createGalaxyObject(key, data) {
        const group = new THREE.Group();
        group.position.set(data.position.x, data.position.y, data.position.z);
        group.userData = { ...data, isGalaxy: true, key: key };

        // Create galaxy based on type
        if (data.type.includes('Spiral')) {
            this.createSpiralGalaxyMesh(group, data);
        } else if (data.type.includes('Ring')) {
            this.createRingGalaxyMesh(group, data);
        } else {
            this.createEllipticalGalaxyMesh(group, data);
        }

        // Add label
        this.createDeepSpaceLabel(group, data.name, data.scale * 2);

        return group;
    }

    createSpiralGalaxyMesh(group, data) {
        const particleCount = 3000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const baseColor = new THREE.Color(data.color);

        for (let i = 0; i < particleCount; i++) {
            const arm = Math.floor(Math.random() * 2);
            const armOffset = arm * Math.PI;
            const distance = Math.random() * data.scale;
            const angle = armOffset + (distance / data.scale) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const height = (Math.random() - 0.5) * (data.scale * 0.1);

            positions[i * 3] = Math.cos(angle) * distance;
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = Math.sin(angle) * distance;

            const brightness = 0.5 + Math.random() * 0.5;
            colors[i * 3] = baseColor.r * brightness;
            colors[i * 3 + 1] = baseColor.g * brightness;
            colors[i * 3 + 2] = baseColor.b * brightness;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        group.add(new THREE.Points(geometry, material));

        // Add central glow
        const glowMaterial = new THREE.SpriteMaterial({
            map: this.createGlowTexture(),
            color: data.color,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.6
        });
        const glow = new THREE.Sprite(glowMaterial);
        glow.scale.set(data.scale * 0.8, data.scale * 0.8, 1);
        group.add(glow);
    }

    createRingGalaxyMesh(group, data) {
        // Ring geometry
        const ringGeometry = new THREE.TorusGeometry(data.scale * 0.7, data.scale * 0.15, 16, 100);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        // Central core
        const coreGeometry = new THREE.SphereGeometry(data.scale * 0.2, 16, 16);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffcc,
            transparent: true,
            opacity: 0.7
        });
        group.add(new THREE.Mesh(coreGeometry, coreMaterial));
    }

    createEllipticalGalaxyMesh(group, data) {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const baseColor = new THREE.Color(data.color);

        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = Math.pow(Math.random(), 0.5) * data.scale;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
            positions[i * 3 + 2] = r * Math.cos(phi);

            const brightness = 0.4 + Math.random() * 0.6;
            colors[i * 3] = baseColor.r * brightness;
            colors[i * 3 + 1] = baseColor.g * brightness;
            colors[i * 3 + 2] = baseColor.b * brightness;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });

        group.add(new THREE.Points(geometry, material));
    }

    createNebulae() {
        if (typeof NEBULAE === 'undefined') return;

        Object.entries(NEBULAE).forEach(([key, data]) => {
            const nebula = this.createNebulaObject(key, data);
            nebula.visible = false;
            this.nebulae[key] = nebula;
            this.scene.add(nebula);
        });
    }

    createNebulaObject(key, data) {
        const group = new THREE.Group();
        group.position.set(data.position.x, data.position.y, data.position.z);
        group.userData = { ...data, isNebula: true, key: key };

        // Determine nebula type and create accordingly
        const nebulaType = data.type || this.getNebulaType(key);

        switch (nebulaType) {
            case 'emission':
                this.createEmissionNebula(group, data);
                break;
            case 'planetary':
                this.createPlanetaryNebula(group, data);
                break;
            case 'reflection':
                this.createReflectionNebula(group, data);
                break;
            case 'dark':
                this.createDarkNebula(group, data);
                break;
            default:
                this.createEmissionNebula(group, data);
        }

        // Add label
        this.createDeepSpaceLabel(group, data.name, data.scale * 1.5);

        return group;
    }

    getNebulaType(key) {
        // Assign types to known nebulae
        const types = {
            'orion': 'emission',
            'crab': 'planetary',
            'eagle': 'emission',
            'helix': 'planetary',
            'horsehead': 'dark',
            'carina': 'emission',
            'lagoon': 'emission',
            'ring': 'planetary',
            'pillars': 'emission'
        };
        return types[key] || 'emission';
    }

    createEmissionNebula(group, data) {
        // Multi-layered emission nebula with gas clouds and stars
        const baseColor = new THREE.Color(data.color);
        const glowColor = new THREE.Color(data.glowColor);

        // Layer 1: Outer diffuse gas cloud
        this.createNebulaGasLayer(group, data.scale * 1.2, 5000, baseColor, 0.15, 0.3);

        // Layer 2: Main nebula body with filaments
        this.createNebulaFilaments(group, data.scale, baseColor, glowColor);

        // Layer 3: Dense core regions
        this.createNebulaDenseRegions(group, data.scale * 0.6, glowColor, 8);

        // Layer 4: Bright emission knots
        this.createEmissionKnots(group, data.scale, glowColor);

        // Embedded young stars
        this.createNebulaStars(group, data.scale, 50);

        // Central illumination source
        this.createNebulaCore(group, data.scale * 0.8, glowColor);
    }

    createPlanetaryNebula(group, data) {
        const baseColor = new THREE.Color(data.color);
        const glowColor = new THREE.Color(data.glowColor);

        // Outer shell
        this.createNebulaShell(group, data.scale, baseColor, 0.4);

        // Inner shell (different color)
        const innerColor = new THREE.Color(data.glowColor).offsetHSL(0.1, 0, 0);
        this.createNebulaShell(group, data.scale * 0.6, innerColor, 0.6);

        // Central white dwarf star
        const starGeometry = new THREE.SphereGeometry(data.scale * 0.05, 16, 16);
        const starMaterial = new THREE.MeshBasicMaterial({
            color: 0xaaccff,
            transparent: false
        });
        const star = new THREE.Mesh(starGeometry, starMaterial);
        group.add(star);

        // Star glow
        const starGlow = new THREE.SpriteMaterial({
            map: this.createNebulaGlowTexture('#aaccff', '#ffffff'),
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.8
        });
        const glowSprite = new THREE.Sprite(starGlow);
        glowSprite.scale.set(data.scale * 0.3, data.scale * 0.3, 1);
        group.add(glowSprite);

        // Bipolar jets (for some planetary nebulae)
        this.createBipolarJets(group, data.scale, glowColor);
    }

    createReflectionNebula(group, data) {
        const baseColor = new THREE.Color(data.color);

        // Blue-ish scattered light cloud
        this.createNebulaGasLayer(group, data.scale, 3000, baseColor, 0.25, 0.5);

        // Illuminating stars
        this.createNebulaStars(group, data.scale, 20);

        // Dust lanes
        this.createDustLanes(group, data.scale);
    }

    createDarkNebula(group, data) {
        // Dark nebula absorbs background light
        const particleCount = 4000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = Math.pow(Math.random(), 0.4) * data.scale;

            // Irregular shape
            const irregularity = 0.5 + Math.random() * 0.5;
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * irregularity;
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * irregularity * 0.7;
            positions[i * 3 + 2] = r * Math.cos(phi) * irregularity;

            // Very dark reddish-brown
            colors[i * 3] = 0.1 + Math.random() * 0.05;
            colors[i * 3 + 1] = 0.05 + Math.random() * 0.03;
            colors[i * 3 + 2] = 0.02 + Math.random() * 0.02;

            sizes[i] = 2 + Math.random() * 4;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 5,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true
        });

        group.add(new THREE.Points(geometry, material));

        // Faint rim illumination
        const rimGlow = new THREE.SpriteMaterial({
            map: this.createNebulaGlowTexture('#331100', '#000000'),
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.2
        });
        const rim = new THREE.Sprite(rimGlow);
        rim.scale.set(data.scale * 2.5, data.scale * 1.5, 1);
        group.add(rim);
    }

    createNebulaGasLayer(group, scale, count, color, minOpacity, maxOpacity) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Create more natural gas distribution
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            // Use multiple octaves of noise for realistic distribution
            const noiseScale = 3;
            const r = Math.pow(Math.random(), 0.25) * scale;
            const turbulence = (Math.sin(theta * noiseScale) * Math.cos(phi * noiseScale * 0.7)) * 0.3;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * (1 + turbulence);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * (0.6 + turbulence * 0.5);
            positions[i * 3 + 2] = r * Math.cos(phi) * (1 + turbulence);

            // Color variation
            const brightness = minOpacity + Math.random() * (maxOpacity - minOpacity);
            colors[i * 3] = color.r * brightness * (0.8 + Math.random() * 0.4);
            colors[i * 3 + 1] = color.g * brightness * (0.8 + Math.random() * 0.4);
            colors[i * 3 + 2] = color.b * brightness * (0.8 + Math.random() * 0.4);

            sizes[i] = 1 + Math.random() * 5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 4,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        group.add(new THREE.Points(geometry, material));
    }

    createNebulaFilaments(group, scale, baseColor, glowColor) {
        // Create tendril-like gas filaments
        const filamentCount = 15;

        for (let f = 0; f < filamentCount; f++) {
            const points = [];
            const startAngle = Math.random() * Math.PI * 2;
            const length = scale * (0.5 + Math.random() * 0.8);

            for (let i = 0; i <= 30; i++) {
                const t = i / 30;
                const angle = startAngle + t * (Math.random() - 0.5) * 2;
                const r = t * length;
                const wobble = Math.sin(t * Math.PI * 4) * scale * 0.1;

                points.push(new THREE.Vector3(
                    Math.cos(angle) * r + wobble,
                    (Math.random() - 0.5) * scale * 0.3 * t,
                    Math.sin(angle) * r + wobble
                ));
            }

            const curve = new THREE.CatmullRomCurve3(points);
            const tubeGeometry = new THREE.TubeGeometry(curve, 30, scale * 0.03 * (1 + Math.random()), 8, false);

            const color = Math.random() > 0.5 ? baseColor : glowColor;
            const tubeMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.3 + Math.random() * 0.2,
                blending: THREE.AdditiveBlending
            });

            group.add(new THREE.Mesh(tubeGeometry, tubeMaterial));
        }
    }

    createNebulaDenseRegions(group, scale, color, count) {
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI - Math.PI / 2;
            const r = Math.random() * scale * 0.8;

            const x = r * Math.cos(phi) * Math.cos(theta);
            const y = r * Math.sin(phi);
            const z = r * Math.cos(phi) * Math.sin(theta);

            const knotSize = scale * (0.1 + Math.random() * 0.15);

            // Dense gas knot
            const knotGlow = new THREE.SpriteMaterial({
                map: this.createNebulaGlowTexture(color.getStyle(), '#ffffff'),
                transparent: true,
                blending: THREE.AdditiveBlending,
                opacity: 0.5 + Math.random() * 0.3
            });
            const knot = new THREE.Sprite(knotGlow);
            knot.position.set(x, y, z);
            knot.scale.set(knotSize, knotSize, 1);
            group.add(knot);
        }
    }

    createEmissionKnots(group, scale, color) {
        // Bright HII region knots
        const knotCount = 12;

        for (let i = 0; i < knotCount; i++) {
            const pos = new THREE.Vector3(
                (Math.random() - 0.5) * scale,
                (Math.random() - 0.5) * scale * 0.5,
                (Math.random() - 0.5) * scale
            );

            // Bright emission point
            const geometry = new THREE.SphereGeometry(scale * 0.02, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8
            });
            const knot = new THREE.Mesh(geometry, material);
            knot.position.copy(pos);
            group.add(knot);

            // Knot glow
            const glowMat = new THREE.SpriteMaterial({
                map: this.createNebulaGlowTexture(color.getStyle(), '#ffffff'),
                transparent: true,
                blending: THREE.AdditiveBlending,
                opacity: 0.6
            });
            const glow = new THREE.Sprite(glowMat);
            glow.position.copy(pos);
            glow.scale.set(scale * 0.1, scale * 0.1, 1);
            group.add(glow);
        }
    }

    createNebulaStars(group, scale, count) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * scale * 1.5;
            positions[i * 3 + 1] = (Math.random() - 0.5) * scale * 0.8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * scale * 1.5;

            // Young hot stars (blue-white)
            const temp = Math.random();
            colors[i * 3] = 0.8 + temp * 0.2;
            colors[i * 3 + 1] = 0.9 + temp * 0.1;
            colors[i * 3 + 2] = 1.0;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });

        group.add(new THREE.Points(geometry, material));
    }

    createNebulaCore(group, scale, color) {
        // Central illumination
        const glowMat = new THREE.SpriteMaterial({
            map: this.createNebulaGlowTexture(color.getStyle(), '#ffffff'),
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.6
        });
        const glow = new THREE.Sprite(glowMat);
        glow.scale.set(scale, scale, 1);
        group.add(glow);
    }

    createNebulaShell(group, scale, color, opacity) {
        // Spherical shell for planetary nebulae
        const geometry = new THREE.SphereGeometry(scale, 64, 64);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity * 0.3,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            wireframe: false
        });

        const shell = new THREE.Mesh(geometry, material);
        group.add(shell);

        // Add gas particles on shell surface
        const particleCount = 2000;
        const particleGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = scale * (0.9 + Math.random() * 0.2);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            colors[i * 3] = color.r * (0.7 + Math.random() * 0.5);
            colors[i * 3 + 1] = color.g * (0.7 + Math.random() * 0.5);
            colors[i * 3 + 2] = color.b * (0.7 + Math.random() * 0.5);
        }

        particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMat = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: opacity,
            blending: THREE.AdditiveBlending
        });

        group.add(new THREE.Points(particleGeom, particleMat));
    }

    createBipolarJets(group, scale, color) {
        // Jets shooting from central star
        for (let dir = -1; dir <= 1; dir += 2) {
            const points = [];
            for (let i = 0; i <= 20; i++) {
                const t = i / 20;
                const spread = t * scale * 0.3;
                points.push(new THREE.Vector3(
                    (Math.random() - 0.5) * spread * 0.3,
                    dir * t * scale * 0.8,
                    (Math.random() - 0.5) * spread * 0.3
                ));
            }

            const curve = new THREE.CatmullRomCurve3(points);
            const geometry = new THREE.TubeGeometry(curve, 20, scale * 0.05, 8, false);
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            });
            group.add(new THREE.Mesh(geometry, material));
        }
    }

    createDustLanes(group, scale) {
        // Dark dust lanes crossing the nebula
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.PlaneGeometry(scale * (0.5 + Math.random()), scale * 0.1);
            const material = new THREE.MeshBasicMaterial({
                color: 0x110500,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });

            const lane = new THREE.Mesh(geometry, material);
            lane.position.set(
                (Math.random() - 0.5) * scale * 0.5,
                (Math.random() - 0.5) * scale * 0.3,
                (Math.random() - 0.5) * scale * 0.5
            );
            lane.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            group.add(lane);
        }
    }

    createNebulaGlowTexture(innerColor, outerColor) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Helper function to convert color to rgba with alpha
        const colorWithAlpha = (color, alpha) => {
            // If already rgba, extract and modify
            if (color.startsWith('rgba')) {
                return color.replace(/[\d.]+\)$/, alpha + ')');
            }
            // If rgb, convert to rgba
            if (color.startsWith('rgb(')) {
                return color.replace('rgb(', 'rgba(').replace(')', ', ' + alpha + ')');
            }
            // If hex, convert to rgba
            if (color.startsWith('#')) {
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
            // Fallback
            return `rgba(128, 128, 128, ${alpha})`;
        };

        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, outerColor);
        gradient.addColorStop(0.2, innerColor);
        gradient.addColorStop(0.5, colorWithAlpha(innerColor, 0.53));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);

        return new THREE.CanvasTexture(canvas);
    }

    createBlackHoles() {
        if (typeof EXOTIC_OBJECTS === 'undefined') return;

        Object.entries(EXOTIC_OBJECTS).forEach(([key, data]) => {
            const blackHole = this.createBlackHoleObject(key, data);
            blackHole.visible = false;
            this.blackHoles[key] = blackHole;
            this.scene.add(blackHole);
        });
    }

    createBlackHoleObject(key, data) {
        const group = new THREE.Group();
        group.position.set(data.position.x, data.position.y, data.position.z);
        group.userData = { ...data, isBlackHole: true, key: key };

        // Event horizon (black sphere)
        const horizonGeometry = new THREE.SphereGeometry(data.scale * 0.3, 32, 32);
        const horizonMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        group.add(new THREE.Mesh(horizonGeometry, horizonMaterial));

        // Accretion disk
        const diskGeometry = new THREE.TorusGeometry(data.scale * 0.8, data.scale * 0.2, 16, 100);
        const diskMaterial = new THREE.MeshBasicMaterial({
            color: data.glowColor,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        const disk = new THREE.Mesh(diskGeometry, diskMaterial);
        disk.rotation.x = Math.PI / 2;
        group.add(disk);

        // Gravitational lensing glow
        const glowMaterial = new THREE.SpriteMaterial({
            map: this.createGlowTexture(),
            color: data.glowColor,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.8
        });
        const glow = new THREE.Sprite(glowMaterial);
        glow.scale.set(data.scale * 2, data.scale * 2, 1);
        group.add(glow);

        // Relativistic jets (for some black holes)
        if (data.mass && data.mass.includes('billion')) {
            this.createRelativisticJets(group, data);
        }

        // Label
        this.createDeepSpaceLabel(group, data.name, data.scale * 1.5);

        return group;
    }

    createRelativisticJets(group, data) {
        const jetGeometry = new THREE.ConeGeometry(data.scale * 0.1, data.scale * 3, 16);
        const jetMaterial = new THREE.MeshBasicMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });

        const jet1 = new THREE.Mesh(jetGeometry, jetMaterial);
        jet1.position.y = data.scale * 1.5;
        group.add(jet1);

        const jet2 = new THREE.Mesh(jetGeometry, jetMaterial);
        jet2.position.y = -data.scale * 1.5;
        jet2.rotation.x = Math.PI;
        group.add(jet2);
    }

    createCosmicDust() {
        // Create ambient cosmic dust particles
        const dustCount = 3000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(dustCount * 3);
        const colors = new Float32Array(dustCount * 3);

        for (let i = 0; i < dustCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 4000;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 4000;

            // Reddish-brown cosmic dust
            colors[i * 3] = 0.4 + Math.random() * 0.2;
            colors[i * 3 + 1] = 0.2 + Math.random() * 0.1;
            colors[i * 3 + 2] = 0.1 + Math.random() * 0.1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });

        this.cosmicDust = new THREE.Points(geometry, material);
        this.cosmicDust.visible = false;
        this.scene.add(this.cosmicDust);
    }

    createDeepSpaceLabel(object, text, yOffset) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.fillText(text, 256, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthWrite: false
        });

        const sprite = new THREE.Sprite(material);
        sprite.scale.set(40, 10, 1);
        sprite.position.y = yOffset;

        object.add(sprite);
    }

    // Universe view controls
    setUniverseView(view) {
        this.currentView = view;

        const views = {
            solarSystem: { showGalaxies: false, showNebulae: false, showMilkyWay: false, cameraDistance: 200 },
            interstellar: { showGalaxies: false, showNebulae: true, showMilkyWay: false, cameraDistance: 500 },
            galactic: { showGalaxies: false, showNebulae: true, showMilkyWay: true, cameraDistance: 1500 },
            intergalactic: { showGalaxies: true, showNebulae: true, showMilkyWay: true, cameraDistance: 5000 },
            cosmic: { showGalaxies: true, showNebulae: true, showMilkyWay: true, cameraDistance: 15000 }
        };

        const settings = views[view] || views.solarSystem;

        this.toggleGalaxies(settings.showGalaxies);
        this.toggleNebulae(settings.showNebulae);
        this.toggleMilkyWay(settings.showMilkyWay);

        if (this.cosmicDust) {
            this.cosmicDust.visible = view !== 'solarSystem';
        }

        // Animate camera to new position
        this.animateCameraTo(
            new THREE.Vector3(settings.cameraDistance * 0.5, settings.cameraDistance * 0.3, settings.cameraDistance),
            new THREE.Vector3(0, 0, 0)
        );

        return view;
    }

    toggleGalaxies(show) {
        this.showGalaxies = show !== undefined ? show : !this.showGalaxies;
        Object.values(this.galaxies).forEach(galaxy => {
            galaxy.visible = this.showGalaxies;
        });
        return this.showGalaxies;
    }

    toggleNebulae(show) {
        this.showNebulae = show !== undefined ? show : !this.showNebulae;
        Object.values(this.nebulae).forEach(nebula => {
            nebula.visible = this.showNebulae;
        });
        Object.values(this.blackHoles).forEach(bh => {
            bh.visible = this.showNebulae;
        });
        return this.showNebulae;
    }

    toggleMilkyWay(show) {
        this.showMilkyWay = show !== undefined ? show : !this.showMilkyWay;
        if (this.milkyWayDisk) {
            this.milkyWayDisk.visible = this.showMilkyWay;
        }
        return this.showMilkyWay;
    }

    focusOnDeepSpaceObject(objectType, key) {
        let target;

        if (objectType === 'galaxy' && this.galaxies[key]) {
            target = this.galaxies[key];
        } else if (objectType === 'nebula' && this.nebulae[key]) {
            target = this.nebulae[key];
        } else if (objectType === 'blackhole' && this.blackHoles[key]) {
            target = this.blackHoles[key];
        }

        if (target) {
            this.selectedDeepSpaceObject = target;
            const pos = target.position;
            const scale = target.userData.scale || 50;

            this.animateCameraTo(
                new THREE.Vector3(pos.x + scale * 2, pos.y + scale, pos.z + scale * 2),
                pos
            );

            if (this.onDeepSpaceSelect) {
                this.onDeepSpaceSelect(target.userData);
            }
        }
    }

    // Callback for deep space object selection
    onDeepSpaceSelect = null;

    createLabel(object, text) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(text, 128, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthWrite: false
        });

        const sprite = new THREE.Sprite(material);
        sprite.scale.set(10, 2.5, 1);
        sprite.position.y = object.userData.size + 3;
        sprite.visible = this.showLabels;

        object.add(sprite);
        this.labels[object.name] = sprite;
    }

    setupPostProcessing() {
        if (this.qualitySetting === 'low') return;

        // Check if UnrealBloomPass is available
        if (typeof THREE.EffectComposer === 'undefined' ||
            typeof THREE.RenderPass === 'undefined' ||
            typeof THREE.UnrealBloomPass === 'undefined') {
            console.log('Post-processing libraries not loaded, skipping bloom effect');
            return;
        }

        try {
            this.composer = new THREE.EffectComposer(this.renderer);

            const renderPass = new THREE.RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);

            const bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.8,  // strength
                0.4,  // radius
                0.85  // threshold
            );
            this.composer.addPass(bloomPass);
        } catch (e) {
            console.log('Failed to setup post-processing:', e);
            this.composer = null;
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onResize());
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.renderer.domElement.addEventListener('click', (e) => this.onClick(e));
        this.renderer.domElement.addEventListener('dblclick', (e) => this.onDoubleClick(e));

        // Mobile touch events
        this.renderer.domElement.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.renderer.domElement.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });

        // Track touch timing for tap vs double-tap
        this.lastTapTime = 0;
        this.touchStartTime = 0;
    }

    onTouchStart(event) {
        this.touchStartTime = Date.now();

        // Get touch position
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const objects = [this.sun, ...Object.values(this.planets)].filter(o => o);
            const intersects = this.raycaster.intersectObjects(objects);

            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (object.userData.isPlanet) {
                    this.hoveredPlanet = object;
                }
            } else {
                this.hoveredPlanet = null;
            }
        }
    }

    onTouchEnd(event) {
        const touchDuration = Date.now() - this.touchStartTime;
        const currentTime = Date.now();
        const timeSinceLastTap = currentTime - this.lastTapTime;

        // Only process as tap if touch was short (not a drag)
        if (touchDuration < 300) {
            if (timeSinceLastTap < 300 && this.hoveredPlanet) {
                // Double tap - focus on planet
                this.focusOnPlanet(this.hoveredPlanet.name);
                this.lastTapTime = 0;
            } else if (this.hoveredPlanet) {
                // Single tap - select planet
                this.selectPlanet(this.hoveredPlanet.name);
                this.lastTapTime = currentTime;
            }
        }
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);

        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const objects = [this.sun, ...Object.values(this.planets)].filter(o => o);
        const intersects = this.raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData.isPlanet) {
                this.hoveredPlanet = object;
                document.body.style.cursor = 'pointer';

                if (this.onPlanetHover) {
                    this.onPlanetHover(object, event.clientX, event.clientY);
                }
            }
        } else {
            this.hoveredPlanet = null;
            document.body.style.cursor = 'default';

            if (this.onPlanetHover) {
                this.onPlanetHover(null);
            }
        }
    }

    onClick(event) {
        if (this.hoveredPlanet) {
            this.selectPlanet(this.hoveredPlanet.name);
        }
    }

    onDoubleClick(event) {
        if (this.hoveredPlanet) {
            this.focusOnPlanet(this.hoveredPlanet.name);
        }
    }

    selectPlanet(name) {
        // Remove highlight from previous selection
        if (this.selectedPlanet) {
            // Could add visual deselection effect
        }

        const planet = name === 'sun' ? this.sun : this.planets[name];
        if (!planet) return;

        this.selectedPlanet = planet;

        if (this.onPlanetSelect) {
            this.onPlanetSelect(planet.userData);
        }
    }

    focusOnPlanet(name, instant = false) {
        const planet = name === 'sun' ? this.sun : this.planets[name];
        if (!planet) return;

        this.focusedPlanet = planet;
        this.surfaceViewActive = false;

        const targetPosition = planet.position.clone();
        const distance = planet.userData.size * 5 + 10;

        // Calculate camera position
        const cameraOffset = new THREE.Vector3(distance, distance * 0.5, distance);
        const newCameraPos = targetPosition.clone().add(cameraOffset);

        if (instant) {
            this.camera.position.copy(newCameraPos);
            this.controls.target.copy(targetPosition);
        } else {
            // Animate camera movement
            this.animateCameraTo(newCameraPos, targetPosition);
        }
    }

    // Surface View - Zoom in close to planet surface
    enterSurfaceView(name) {
        const planet = name === 'sun' ? this.sun : this.planets[name];
        if (!planet) return;

        this.surfaceViewActive = true;
        this.surfaceViewPlanet = planet;
        this.focusedPlanet = planet;
        this.surfaceViewEntryTime = Date.now(); // Track entry time for auto-exit delay

        // Apply high-detail texture
        this.applyHighDetailTexture(name, planet);

        const targetPosition = planet.position.clone();
        const planetSize = planet.userData.size;

        // Get very close - just above the surface
        const distance = planetSize * 1.2;

        // Position camera at an angle to show surface curvature
        const angle = Math.random() * Math.PI * 2;
        const cameraOffset = new THREE.Vector3(
            Math.cos(angle) * distance,
            distance * 0.3,
            Math.sin(angle) * distance
        );
        const newCameraPos = targetPosition.clone().add(cameraOffset);

        // Reduce controls min distance for close viewing
        this.controls.minDistance = planetSize * 1.05;
        this.controls.maxDistance = planetSize * 10;

        this.animateCameraTo(newCameraPos, targetPosition);

        // Trigger callback
        if (this.onSurfaceView) {
            this.onSurfaceView(planet.userData, true);
        }

        return planet.userData;
    }

    exitSurfaceView() {
        if (!this.surfaceViewActive) return;

        this.surfaceViewActive = false;

        // Reset controls
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50000;

        // Zoom back out
        if (this.surfaceViewPlanet) {
            this.focusOnPlanet(this.surfaceViewPlanet.name);
        }

        if (this.onSurfaceView) {
            this.onSurfaceView(null, false);
        }

        this.surfaceViewPlanet = null;
    }

    toggleSurfaceView(name) {
        if (this.surfaceViewActive && this.surfaceViewPlanet?.name === name) {
            this.exitSurfaceView();
            return false;
        } else {
            this.enterSurfaceView(name);
            return true;
        }
    }

    // Simple noise function for realistic textures
    generateNoise(ctx, size, scale, opacity) {
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * scale;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Perlin-like noise for smoother terrain
    smoothNoise(x, y, seed) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
        return n - Math.floor(n);
    }

    fractalNoise(x, y, octaves, persistence) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.smoothNoise(x * frequency, y * frequency, i * 1000) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }

        return total / maxValue;
    }

    applyHighDetailTexture(name, planet) {
        // Create high-resolution surface texture
        const textureSize = 2048;
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const ctx = canvas.getContext('2d');

        const data = planet.userData;

        switch (name) {
            case 'mercury':
                this.drawMercurySurface(ctx, textureSize);
                break;
            case 'venus':
                this.drawVenusSurface(ctx, textureSize);
                break;
            case 'earth':
                this.drawEarthSurface(ctx, textureSize);
                break;
            case 'mars':
                this.drawMarsSurface(ctx, textureSize);
                break;
            case 'jupiter':
                this.drawJupiterSurface(ctx, textureSize);
                break;
            case 'saturn':
                this.drawSaturnSurface(ctx, textureSize);
                break;
            case 'uranus':
                this.drawUranusSurface(ctx, textureSize);
                break;
            case 'neptune':
                this.drawNeptuneSurface(ctx, textureSize);
                break;
            case 'sun':
                this.drawSunSurface(ctx, textureSize);
                break;
            default:
                return;
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        // Store original material to restore later
        if (!planet.userData.originalMaterial) {
            planet.userData.originalMaterial = planet.material;
        }

        planet.material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: data.name === 'Sun' ? 0 : 0.8,
            metalness: 0.1,
            bumpMap: texture,
            bumpScale: 0.02
        });
    }

    // High-detail surface rendering methods
    drawMercurySurface(ctx, size) {
        // Gray, heavily cratered surface
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size);
        gradient.addColorStop(0, '#8a8a8a');
        gradient.addColorStop(1, '#5a5a5a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Add many craters
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 40 + 5;

            // Crater rim (lighter)
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100, 100, 100, ${Math.random() * 0.5 + 0.3})`;
            ctx.fill();

            // Crater floor (darker)
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(60, 60, 60, ${Math.random() * 0.5 + 0.3})`;
            ctx.fill();

            // Shadow
            ctx.beginPath();
            ctx.arc(x + radius * 0.2, y + radius * 0.2, radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(40, 40, 40, 0.3)`;
            ctx.fill();
        }

        // Add surface cracks/ridges
        ctx.strokeStyle = 'rgba(70, 70, 70, 0.4)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * size, Math.random() * size);
            ctx.lineTo(Math.random() * size, Math.random() * size);
            ctx.stroke();
        }
    }

    drawVenusSurface(ctx, size) {
        // Thick cloudy atmosphere - swirling yellows and oranges
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#e6c87a');
        gradient.addColorStop(0.5, '#d4a843');
        gradient.addColorStop(1, '#c49a3a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Add swirling cloud patterns
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.random() * Math.PI * 2);

            ctx.beginPath();
            ctx.ellipse(0, 0, Math.random() * 150 + 50, Math.random() * 30 + 10, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${200 + Math.random() * 55}, ${180 + Math.random() * 40}, ${100 + Math.random() * 50}, ${Math.random() * 0.3 + 0.1})`;
            ctx.fill();

            ctx.restore();
        }

        // Add atmospheric haze bands
        for (let y = 0; y < size; y += 80) {
            ctx.fillStyle = `rgba(255, 220, 150, ${Math.random() * 0.15})`;
            ctx.fillRect(0, y, size, 40 + Math.random() * 40);
        }
    }

    drawEarthSurface(ctx, size) {
        // Deep ocean base with gradient
        const oceanGradient = ctx.createLinearGradient(0, 0, size, size);
        oceanGradient.addColorStop(0, '#0a3d62');
        oceanGradient.addColorStop(0.3, '#1e5f8a');
        oceanGradient.addColorStop(0.6, '#1a4d7c');
        oceanGradient.addColorStop(1, '#0c3d5f');
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, 0, size, size);

        // Add realistic ocean depth variations and currents
        for (let i = 0; i < 300; i++) {
            const depth = Math.random();
            ctx.fillStyle = `rgba(${10 + depth * 30}, ${40 + depth * 50}, ${80 + depth * 60}, ${0.2 + depth * 0.2})`;
            ctx.beginPath();
            ctx.ellipse(Math.random() * size, Math.random() * size, Math.random() * 120 + 30, Math.random() * 60 + 15, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        // Continental shelf (lighter water near coasts - drawn first)
        ctx.fillStyle = 'rgba(40, 120, 160, 0.3)';

        // Detailed continents with realistic geography
        // North America with mountain ranges and varied terrain
        this.drawRealisticContinent(ctx, [
            [80, 100], [160, 60], [250, 50], [320, 80], [350, 150], [340, 250],
            [300, 320], [220, 360], [150, 340], [100, 280], [60, 200]
        ], size, 'temperate');

        // Central America
        this.drawRealisticContinent(ctx, [
            [200, 360], [240, 350], [260, 400], [240, 450], [200, 420]
        ], size, 'tropical');

        // South America with Amazon and Andes
        this.drawRealisticContinent(ctx, [
            [200, 450], [280, 420], [320, 480], [340, 580], [300, 700], [240, 750],
            [180, 720], [160, 620], [180, 520]
        ], size, 'tropical');

        // Africa with Sahara and rainforest
        this.drawRealisticContinent(ctx, [
            [460, 180], [560, 160], [620, 200], [640, 300], [620, 450], [560, 550],
            [480, 580], [440, 500], [420, 350], [430, 250]
        ], size, 'african');

        // Europe with varied terrain
        this.drawRealisticContinent(ctx, [
            [440, 80], [520, 60], [600, 80], [620, 140], [580, 190], [500, 200], [450, 160]
        ], size, 'temperate');

        // Asia - massive continent with diverse terrain
        this.drawRealisticContinent(ctx, [
            [600, 60], [750, 40], [900, 60], [980, 120], [1000, 220], [960, 320],
            [880, 380], [780, 400], [680, 360], [620, 280], [600, 180]
        ], size, 'asian');

        // India
        this.drawRealisticContinent(ctx, [
            [700, 280], [760, 260], [780, 340], [740, 420], [680, 400], [680, 320]
        ], size, 'tropical');

        // Australia
        this.drawRealisticContinent(ctx, [
            [800, 480], [900, 460], [960, 500], [980, 580], [920, 640], [840, 620], [780, 560]
        ], size, 'australian');

        // Antarctica
        ctx.fillStyle = '#e8f0f8';
        ctx.beginPath();
        ctx.ellipse(size / 2, size - 40, size * 0.45, 80, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ice texture on Antarctica
        for (let i = 0; i < 100; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
            ctx.beginPath();
            ctx.ellipse(Math.random() * size, size - 40 + (Math.random() - 0.5) * 60, Math.random() * 30 + 5, Math.random() * 10 + 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Arctic ice cap
        ctx.fillStyle = '#e8f4f8';
        ctx.beginPath();
        ctx.ellipse(size / 2, 30, size * 0.35, 60, 0, 0, Math.PI * 2);
        ctx.fill();

        // Realistic cloud cover with weather patterns
        this.drawEarthClouds(ctx, size);

        // Add subtle noise for texture
        this.generateNoise(ctx, size, 15, 0.1);
    }

    drawRealisticContinent(ctx, points, size, biomeType) {
        // Draw continental shelf first
        ctx.fillStyle = 'rgba(40, 100, 140, 0.25)';
        ctx.beginPath();
        const shelfPoints = points.map(p => [p[0] * size / 1024, p[1] * size / 1024]);
        ctx.moveTo(shelfPoints[0][0], shelfPoints[0][1]);
        for (let i = 1; i < shelfPoints.length; i++) {
            ctx.lineTo(shelfPoints[i][0], shelfPoints[i][1]);
        }
        ctx.closePath();
        ctx.lineWidth = 30;
        ctx.strokeStyle = 'rgba(40, 100, 140, 0.2)';
        ctx.stroke();
        ctx.fill();

        // Base continent color by biome
        let baseColor, mountainColor, lowlandColor, desertColor;
        switch (biomeType) {
            case 'tropical':
                baseColor = '#228b22';
                mountainColor = '#1a6b1a';
                lowlandColor = '#2d8b2d';
                desertColor = '#c4a35a';
                break;
            case 'african':
                baseColor = '#8b7355';
                mountainColor = '#6b5344';
                lowlandColor = '#228b22';
                desertColor = '#daa520';
                break;
            case 'australian':
                baseColor = '#cd853f';
                mountainColor = '#8b4513';
                lowlandColor = '#9acd32';
                desertColor = '#daa520';
                break;
            case 'asian':
                baseColor = '#4a7c4a';
                mountainColor = '#8b8b8b';
                lowlandColor = '#228b22';
                desertColor = '#c2b280';
                break;
            default: // temperate
                baseColor = '#3d7a3d';
                mountainColor = '#5a5a5a';
                lowlandColor = '#4a8a4a';
                desertColor = '#9b8b5a';
        }

        // Fill continent with base color
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(points[0][0] * size / 1024, points[0][1] * size / 1024);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0] * size / 1024, points[i][1] * size / 1024);
        }
        ctx.closePath();
        ctx.fill();

        // Add terrain variations within continent
        const centerX = points.reduce((sum, p) => sum + p[0], 0) / points.length * size / 1024;
        const centerY = points.reduce((sum, p) => sum + p[1], 0) / points.length * size / 1024;

        // Mountain ranges
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 60;
            ctx.fillStyle = `rgba(${parseInt(mountainColor.slice(1, 3), 16)}, ${parseInt(mountainColor.slice(3, 5), 16)}, ${parseInt(mountainColor.slice(5, 7), 16)}, ${0.4 + Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(centerX + Math.cos(angle) * dist, centerY + Math.sin(angle) * dist, Math.random() * 25 + 10, Math.random() * 15 + 5, angle, 0, Math.PI * 2);
            ctx.fill();
        }

        // Lowlands and forests
        for (let i = 0; i < 25; i++) {
            const px = points[Math.floor(Math.random() * points.length)];
            ctx.fillStyle = `rgba(${parseInt(lowlandColor.slice(1, 3), 16)}, ${parseInt(lowlandColor.slice(3, 5), 16)}, ${parseInt(lowlandColor.slice(5, 7), 16)}, ${0.3 + Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(px[0] * size / 1024 + (Math.random() - 0.5) * 80, px[1] * size / 1024 + (Math.random() - 0.5) * 80, Math.random() * 20 + 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Deserts (only for certain biomes)
        if (biomeType === 'african' || biomeType === 'australian' || biomeType === 'asian') {
            for (let i = 0; i < 10; i++) {
                ctx.fillStyle = `rgba(${parseInt(desertColor.slice(1, 3), 16)}, ${parseInt(desertColor.slice(3, 5), 16)}, ${parseInt(desertColor.slice(5, 7), 16)}, ${0.4 + Math.random() * 0.3})`;
                ctx.beginPath();
                ctx.ellipse(centerX + (Math.random() - 0.5) * 100, centerY + (Math.random() - 0.5) * 60, Math.random() * 40 + 20, Math.random() * 25 + 10, Math.random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawEarthClouds(ctx, size) {
        // Weather systems - cyclones and fronts
        for (let i = 0; i < 8; i++) {
            const cx = Math.random() * size;
            const cy = Math.random() * size;
            const radius = Math.random() * 150 + 80;

            // Spiral cloud pattern for weather systems
            ctx.save();
            ctx.translate(cx, cy);
            for (let j = 0; j < 20; j++) {
                const angle = (j / 20) * Math.PI * 3;
                const r = (j / 20) * radius;
                ctx.fillStyle = `rgba(255, 255, 255, ${0.3 - j * 0.01})`;
                ctx.beginPath();
                ctx.ellipse(Math.cos(angle) * r, Math.sin(angle) * r, 30 + Math.random() * 20, 10 + Math.random() * 10, angle, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // Scattered clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        for (let i = 0; i < 120; i++) {
            ctx.beginPath();
            ctx.ellipse(Math.random() * size, Math.random() * size, Math.random() * 60 + 15, Math.random() * 25 + 8, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cloud bands along trade winds
        for (let y = size * 0.2; y < size * 0.8; y += size * 0.15) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + Math.random() * 0.1})`;
            ctx.fillRect(0, y + (Math.random() - 0.5) * 50, size, 30 + Math.random() * 40);
        }
    }

    drawContinent(ctx, points, color, size) {
        for (let i = 0; i < 80; i++) {
            ctx.beginPath();
            ctx.ellipse(Math.random() * size, Math.random() * size, Math.random() * 80 + 20, Math.random() * 30 + 10, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawContinent(ctx, points, color, size) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(points[0][0] * size / 1024, points[0][1] * size / 1024);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0] * size / 1024, points[i][1] * size / 1024);
        }
        ctx.closePath();
        ctx.fill();

        // Add terrain variation
        for (let i = 0; i < 30; i++) {
            const px = points[Math.floor(Math.random() * points.length)];
            ctx.fillStyle = `rgba(${60 + Math.random() * 40}, ${100 + Math.random() * 60}, ${60 + Math.random() * 40}, 0.4)`;
            ctx.beginPath();
            ctx.arc(px[0] * size / 1024 + (Math.random() - 0.5) * 100, px[1] * size / 1024 + (Math.random() - 0.5) * 100, Math.random() * 30 + 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawMarsSurface(ctx, size) {
        // Red desert base
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size);
        gradient.addColorStop(0, '#c1440e');
        gradient.addColorStop(0.5, '#a33a0c');
        gradient.addColorStop(1, '#8b2500');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Add terrain variations with different colored regions
        for (let i = 0; i < 400; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const terrainType = Math.random();
            let color;

            if (terrainType < 0.3) {
                // Dark volcanic plains
                color = `rgba(100, 45, 20, ${0.2 + Math.random() * 0.3})`;
            } else if (terrainType < 0.6) {
                // Rusty orange highlands
                color = `rgba(180, 90, 40, ${0.2 + Math.random() * 0.3})`;
            } else {
                // Tan/ochre regions
                color = `rgba(200, 150, 80, ${0.15 + Math.random() * 0.2})`;
            }

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(x, y, Math.random() * 80 + 20, Math.random() * 50 + 15, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add many craters of varying sizes
        for (let i = 0; i < 350; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 35 + 3;
            const depth = Math.random();

            // Crater rim (lighter, raised)
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(160, 80, 40, ${0.3 + depth * 0.3})`;
            ctx.fill();

            // Crater floor (darker)
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.75, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(80, 35, 15, ${0.3 + depth * 0.3})`;
            ctx.fill();

            // Shadow on one side
            ctx.beginPath();
            ctx.arc(x + radius * 0.15, y + radius * 0.15, radius * 0.65, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(50, 20, 10, 0.25)`;
            ctx.fill();
        }

        // Olympus Mons (largest volcano in solar system)
        const olympusX = size * 0.25;
        const olympusY = size * 0.35;
        // Outer caldera
        ctx.beginPath();
        ctx.arc(olympusX, olympusY, 150, 0, Math.PI * 2);
        const olympusGrad = ctx.createRadialGradient(olympusX, olympusY, 0, olympusX, olympusY, 150);
        olympusGrad.addColorStop(0, '#5a1800');
        olympusGrad.addColorStop(0.4, '#7a2000');
        olympusGrad.addColorStop(0.7, '#8a3010');
        olympusGrad.addColorStop(1, '#a04020');
        ctx.fillStyle = olympusGrad;
        ctx.fill();
        // Central caldera
        ctx.beginPath();
        ctx.arc(olympusX, olympusY, 50, 0, Math.PI * 2);
        ctx.fillStyle = '#3a1000';
        ctx.fill();
        // Cliff edge highlight
        ctx.strokeStyle = 'rgba(180, 100, 60, 0.4)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(olympusX - 10, olympusY - 10, 145, Math.PI * 0.8, Math.PI * 1.8);
        ctx.stroke();

        // Tharsis volcanoes (3 smaller volcanoes)
        [[size * 0.35, size * 0.5], [size * 0.32, size * 0.6], [size * 0.38, size * 0.55]].forEach(([vx, vy]) => {
            ctx.beginPath();
            ctx.arc(vx, vy, 60, 0, Math.PI * 2);
            ctx.fillStyle = '#6a2500';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(vx, vy, 25, 0, Math.PI * 2);
            ctx.fillStyle = '#4a1800';
            ctx.fill();
        });

        // Valles Marineris (massive canyon system)
        ctx.save();
        // Main canyon
        ctx.strokeStyle = '#3a1200';
        ctx.lineWidth = 25;
        ctx.beginPath();
        ctx.moveTo(size * 0.15, size * 0.52);
        ctx.bezierCurveTo(size * 0.35, size * 0.48, size * 0.55, size * 0.54, size * 0.85, size * 0.50);
        ctx.stroke();
        // Canyon depth shadow
        ctx.strokeStyle = '#2a0a00';
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.moveTo(size * 0.15, size * 0.525);
        ctx.bezierCurveTo(size * 0.35, size * 0.485, size * 0.55, size * 0.545, size * 0.85, size * 0.505);
        ctx.stroke();
        // Branch canyons
        ctx.strokeStyle = '#4a1500';
        ctx.lineWidth = 10;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const startX = size * (0.25 + i * 0.12);
            ctx.moveTo(startX, size * 0.50);
            ctx.lineTo(startX + (Math.random() - 0.5) * 80, size * 0.50 + (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 40));
            ctx.stroke();
        }
        ctx.restore();

        // North polar ice cap with layers
        const polarGrad = ctx.createRadialGradient(size / 2, 60, 0, size / 2, 60, 350);
        polarGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        polarGrad.addColorStop(0.3, 'rgba(240, 248, 255, 0.85)');
        polarGrad.addColorStop(0.6, 'rgba(200, 220, 240, 0.5)');
        polarGrad.addColorStop(1, 'rgba(180, 160, 140, 0)');
        ctx.fillStyle = polarGrad;
        ctx.beginPath();
        ctx.ellipse(size / 2, 60, 350, 100, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ice cap layers
        ctx.strokeStyle = 'rgba(200, 210, 220, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.ellipse(size / 2, 60, 300 - i * 50, 80 - i * 12, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // South polar cap (smaller)
        const southPolarGrad = ctx.createRadialGradient(size / 2, size - 40, 0, size / 2, size - 40, 200);
        southPolarGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        southPolarGrad.addColorStop(0.5, 'rgba(230, 240, 250, 0.6)');
        southPolarGrad.addColorStop(1, 'rgba(180, 160, 140, 0)');
        ctx.fillStyle = southPolarGrad;
        ctx.beginPath();
        ctx.ellipse(size / 2, size - 40, 200, 60, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dust storm patterns
        ctx.fillStyle = 'rgba(220, 180, 140, 0.15)';
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.ellipse(Math.random() * size, Math.random() * size, Math.random() * 120 + 40, Math.random() * 40 + 15, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add surface texture noise
        this.generateNoise(ctx, size, 20, 0.15);
    }

    drawJupiterSurface(ctx, size) {
        // Banded gas giant
        const bands = [
            '#e8d4b8', '#d4a574', '#c49a6c', '#e0c090', '#d4b080',
            '#c8a070', '#dcc898', '#c49464', '#e4d0a0', '#d0a878'
        ];

        const bandHeight = size / bands.length;
        bands.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.fillRect(0, i * bandHeight, size, bandHeight + 2);
        });

        // Add turbulent flow patterns
        for (let i = 0; i < 300; i++) {
            const y = Math.random() * size;
            const bandIndex = Math.floor(y / bandHeight);

            ctx.save();
            ctx.translate(Math.random() * size, y);

            ctx.beginPath();
            ctx.ellipse(0, 0, Math.random() * 60 + 20, Math.random() * 15 + 5, Math.random() * 0.5 - 0.25, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${180 + Math.random() * 40}, ${140 + Math.random() * 40}, ${80 + Math.random() * 40}, ${Math.random() * 0.4 + 0.1})`;
            ctx.fill();

            ctx.restore();
        }

        // Great Red Spot
        ctx.save();
        ctx.translate(size * 0.65, size * 0.55);
        ctx.rotate(-0.1);

        // Outer ring
        ctx.beginPath();
        ctx.ellipse(0, 0, 140, 90, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#c06050';
        ctx.fill();

        // Inner swirl
        ctx.beginPath();
        ctx.ellipse(0, 0, 100, 60, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#d07060';
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.ellipse(0, 0, 50, 30, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#b05040';
        ctx.fill();

        ctx.restore();

        // Add swirl lines
        ctx.strokeStyle = 'rgba(255, 240, 220, 0.1)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 100; i++) {
            ctx.beginPath();
            const y = Math.random() * size;
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(size * 0.3, y + (Math.random() - 0.5) * 20, size * 0.7, y + (Math.random() - 0.5) * 20, size, y);
            ctx.stroke();
        }
    }

    drawSaturnSurface(ctx, size) {
        // Subtle banded gas giant
        const bands = [
            '#f4e4c4', '#e8d4a8', '#f0dab0', '#e4d0a0', '#f4e0b8',
            '#e8d4a8', '#f0d8b0', '#e4cca0', '#f4dcb8', '#e8d0a4'
        ];

        const bandHeight = size / bands.length;
        bands.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.fillRect(0, i * bandHeight, size, bandHeight + 2);
        });

        // Subtle atmospheric patterns
        for (let i = 0; i < 200; i++) {
            ctx.fillStyle = `rgba(${230 + Math.random() * 25}, ${210 + Math.random() * 25}, ${170 + Math.random() * 30}, ${Math.random() * 0.2})`;
            ctx.beginPath();
            ctx.ellipse(Math.random() * size, Math.random() * size, Math.random() * 80 + 30, Math.random() * 15 + 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Hexagonal polar storm (Saturn's north pole)
        ctx.strokeStyle = 'rgba(200, 180, 140, 0.5)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const x = size / 2 + Math.cos(angle) * 100;
            const y = 100 + Math.sin(angle) * 100;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    drawUranusSurface(ctx, size) {
        // Pale blue-green ice giant
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size);
        gradient.addColorStop(0, '#c4e4e8');
        gradient.addColorStop(0.5, '#a8d4d8');
        gradient.addColorStop(1, '#88c4c8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Subtle cloud bands
        for (let i = 0; i < 20; i++) {
            const y = i * (size / 20);
            ctx.fillStyle = `rgba(${180 + Math.random() * 40}, ${220 + Math.random() * 20}, ${220 + Math.random() * 20}, ${Math.random() * 0.2})`;
            ctx.fillRect(0, y, size, size / 20);
        }

        // Sparse cloud features
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(220, 240, 250, ${Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(Math.random() * size, Math.random() * size, Math.random() * 40 + 10, Math.random() * 15 + 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawNeptuneSurface(ctx, size) {
        // Deep blue ice giant
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size);
        gradient.addColorStop(0, '#5080d0');
        gradient.addColorStop(0.5, '#4070c0');
        gradient.addColorStop(1, '#3060b0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Dynamic storm bands
        for (let i = 0; i < 15; i++) {
            const y = i * (size / 15);
            ctx.fillStyle = `rgba(${60 + Math.random() * 40}, ${100 + Math.random() * 40}, ${180 + Math.random() * 40}, ${Math.random() * 0.3})`;
            ctx.fillRect(0, y, size, size / 15);
        }

        // Great Dark Spot
        ctx.save();
        ctx.translate(size * 0.4, size * 0.45);
        ctx.beginPath();
        ctx.ellipse(0, 0, 80, 50, 0.1, 0, Math.PI * 2);
        ctx.fillStyle = '#203860';
        ctx.fill();
        ctx.restore();

        // Bright cloud features
        ctx.fillStyle = 'rgba(200, 220, 255, 0.5)';
        for (let i = 0; i < 30; i++) {
            ctx.beginPath();
            ctx.ellipse(Math.random() * size, Math.random() * size, Math.random() * 30 + 10, Math.random() * 10 + 5, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        // High altitude cirrus clouds
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            const y = Math.random() * size;
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(size * 0.3, y + (Math.random() - 0.5) * 30, size * 0.7, y + (Math.random() - 0.5) * 30, size, y);
            ctx.stroke();
        }
    }

    drawSunSurface(ctx, size) {
        // Solar surface with granulation
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size);
        gradient.addColorStop(0, '#fff8e0');
        gradient.addColorStop(0.3, '#ffdd44');
        gradient.addColorStop(0.7, '#ff9900');
        gradient.addColorStop(1, '#cc4400');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Solar granulation (convection cells)
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 15 + 5;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, ${200 + Math.random() * 55}, ${50 + Math.random() * 100}, ${Math.random() * 0.3 + 0.1})`;
            ctx.fill();
        }

        // Sunspots
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * size * 0.6 + size * 0.2;
            const y = Math.random() * size * 0.6 + size * 0.2;
            const radius = Math.random() * 40 + 20;

            // Penumbra
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#884400';
            ctx.fill();

            // Umbra
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = '#332200';
            ctx.fill();
        }

        // Solar flares
        ctx.strokeStyle = 'rgba(255, 200, 100, 0.4)';
        ctx.lineWidth = 4;
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const startR = size * 0.45;
            ctx.beginPath();
            ctx.moveTo(size / 2 + Math.cos(angle) * startR, size / 2 + Math.sin(angle) * startR);
            ctx.quadraticCurveTo(
                size / 2 + Math.cos(angle + 0.1) * (startR + 50),
                size / 2 + Math.sin(angle + 0.1) * (startR + 50),
                size / 2 + Math.cos(angle + 0.2) * startR,
                size / 2 + Math.sin(angle + 0.2) * startR
            );
            ctx.stroke();
        }
    }

    animateCameraTo(targetPos, lookAtPos) {
        const startPos = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(progress);

            this.camera.position.lerpVectors(startPos, targetPos, eased);
            this.controls.target.lerpVectors(startTarget, lookAtPos, eased);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        // Update FPS counter
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsUpdate >= 1000) {
            this.currentFps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }

        if (this.isPlaying) {
            this.updateSimulation(delta);
        }

        // Animate space objects (satellites, aliens, comets, meteors)
        this.animateSpaceObjects(delta);

        // Auto orbit camera
        if (this.autoOrbit) {
            this.controls.autoRotate = true;
        } else {
            this.controls.autoRotate = false;
        }

        this.controls.update();

        // Render
        if (this.composer && this.qualitySetting !== 'low') {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    updateSimulation(delta) {
        const timeMultiplier = delta * this.timeSpeed * 0.5;
        this.simulationTime += this.timeSpeed * 86400000 * delta; // Days in ms

        // Update sun rotation and corona
        if (this.sun) {
            this.sun.rotation.y += 0.001 * this.timeSpeed;

            // Rotate corona slowly
            if (this.coronaGroup) {
                this.coronaGroup.rotation.z += 0.0002 * this.timeSpeed;
            }
        }

        // Update solar wind particles
        if (this.solarWind && this.solarWindVelocities) {
            const positions = this.solarWind.geometry.attributes.position.array;
            const sunSize = PLANET_DATA.sun.size;

            for (let i = 0; i < positions.length / 3; i++) {
                // Move particles outward
                positions[i * 3] += this.solarWindVelocities[i * 3] * delta * 50;
                positions[i * 3 + 1] += this.solarWindVelocities[i * 3 + 1] * delta * 50;
                positions[i * 3 + 2] += this.solarWindVelocities[i * 3 + 2] * delta * 50;

                // Reset particles that go too far
                const dist = Math.sqrt(
                    positions[i * 3] ** 2 +
                    positions[i * 3 + 1] ** 2 +
                    positions[i * 3 + 2] ** 2
                );

                if (dist > 150) {
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    const r = sunSize + Math.random() * 5;

                    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                    positions[i * 3 + 2] = r * Math.cos(phi);
                }
            }

            this.solarWind.geometry.attributes.position.needsUpdate = true;
        }

        // Update planets
        Object.entries(this.planets).forEach(([name, planet]) => {
            const data = PLANET_DATA[name];
            if (!data) return;

            // Orbital motion
            planet.userData.orbitAngle += (data.orbitSpeed / 100) * timeMultiplier;
            planet.position.x = Math.cos(planet.userData.orbitAngle) * data.orbitRadius;
            planet.position.z = Math.sin(planet.userData.orbitAngle) * data.orbitRadius;

            // Axial rotation
            planet.rotation.y += (data.rotationSpeed / 100) * timeMultiplier;
        });

        // Update moons
        Object.entries(this.moons).forEach(([name, moon]) => {
            const data = MOON_DATA[name];
            if (!data) return;

            moon.userData.orbitAngle += (data.orbitSpeed / 100) * timeMultiplier;
            moon.position.x = Math.cos(moon.userData.orbitAngle) * data.orbitRadius;
            moon.position.z = Math.sin(moon.userData.orbitAngle) * data.orbitRadius;
        });

        // Slowly rotate asteroid belt
        if (this.asteroidBelt) {
            this.asteroidBelt.rotation.y += 0.0001 * this.timeSpeed;
        }

        // Update focused planet tracking
        if (this.focusedPlanet && this.focusedPlanet.name !== 'sun') {
            this.controls.target.copy(this.focusedPlanet.position);
        }
    }

    // Public methods for UI control
    setTimeSpeed(speed) {
        this.timeSpeed = speed;
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        return this.isPlaying;
    }

    setPlaying(playing) {
        this.isPlaying = playing;
    }

    toggleOrbits() {
        this.showOrbits = !this.showOrbits;
        Object.values(this.orbits).forEach(orbit => {
            if (orbit.name !== 'pluto' || this.showPluto) {
                orbit.visible = this.showOrbits;
            }
        });
        return this.showOrbits;
    }

    toggleLabels() {
        this.showLabels = !this.showLabels;
        Object.values(this.labels).forEach(label => {
            label.visible = this.showLabels;
        });
        // Also toggle moon labels
        if (this.moonLabels) {
            Object.values(this.moonLabels).forEach(label => {
                label.visible = this.showLabels && this.showMoons;
            });
        }
        return this.showLabels;
    }

    toggleMoons() {
        this.showMoons = !this.showMoons;
        Object.values(this.moons).forEach(moon => {
            moon.visible = this.showMoons;
        });
        // Also toggle moon labels visibility
        if (this.moonLabels) {
            Object.values(this.moonLabels).forEach(label => {
                label.visible = this.showMoons && this.showLabels;
            });
        }
        return this.showMoons;
    }

    toggleStars() {
        this.showStars = !this.showStars;
        if (this.starField) {
            this.starField.visible = this.showStars;
        }
        return this.showStars;
    }

    toggleAsteroidBelt() {
        this.showAsteroidBelt = !this.showAsteroidBelt;
        if (!this.asteroidBelt && this.showAsteroidBelt) {
            this.createAsteroidBelt();
        }
        if (this.asteroidBelt) {
            this.asteroidBelt.visible = this.showAsteroidBelt;
        }
        return this.showAsteroidBelt;
    }

    togglePluto() {
        this.showPluto = !this.showPluto;
        if (this.planets.pluto) {
            this.planets.pluto.visible = this.showPluto;
        }
        if (this.orbits.pluto) {
            this.orbits.pluto.visible = this.showPluto && this.showOrbits;
        }
        return this.showPluto;
    }

    toggleAutoOrbit() {
        this.autoOrbit = !this.autoOrbit;
        return this.autoOrbit;
    }

    resetCamera() {
        this.focusedPlanet = null;
        this.animateCameraTo(
            new THREE.Vector3(100, 80, 200),
            new THREE.Vector3(0, 0, 0)
        );
    }

    setViewMode(mode) {
        switch (mode) {
            case 'top':
                this.animateCameraTo(
                    new THREE.Vector3(0, 300, 0),
                    new THREE.Vector3(0, 0, 0)
                );
                break;
            case 'side':
                this.animateCameraTo(
                    new THREE.Vector3(300, 0, 0),
                    new THREE.Vector3(0, 0, 0)
                );
                break;
            default: // 3d
                this.resetCamera();
        }
    }

    setQuality(quality) {
        this.qualitySetting = quality;
        // Would need to recreate certain elements for full quality change
        console.log('Quality set to:', quality);
    }

    setPlanetSizeMultiplier(multiplier) {
        this.planetSizeMultiplier = multiplier;
        // Scale planets (would need implementation)
    }

    getSimulationDate() {
        return new Date(this.simulationTime);
    }

    resetSimulationTime() {
        this.simulationTime = Date.now();
    }

    getFPS() {
        return this.currentFps;
    }

    takeScreenshot() {
        this.renderer.render(this.scene, this.camera);
        return this.renderer.domElement.toDataURL('image/png');
    }

    // ==========================================
    // SPACE OBJECTS - SATELLITES, ALIENS, COMETS
    // ==========================================

    createSpaceObjects() {
        this.createSatellites();
        this.createAlienShips();
        this.createCometsAndAsteroids();
        this.createSpaceDebrisField();
    }

    createSatellites() {
        if (typeof SATELLITES === 'undefined') return;

        Object.entries(SATELLITES).forEach(([id, satData]) => {
            const satellite = this.createSatelliteModel(satData);
            satellite.name = id;
            satellite.userData = { ...satData, isSatellite: true };

            // Position based on orbit type
            if (satData.orbit === 'earth') {
                satellite.userData.parentPlanet = 'earth';
                satellite.userData.orbitAngle = Math.random() * Math.PI * 2;
            } else if (satData.orbit === 'solar') {
                satellite.userData.orbitAngle = Math.random() * Math.PI * 2;
            } else if (satData.orbit === 'heliocentric') {
                satellite.userData.distanceFromSun = satData.distance;
            }

            this.satellites[id] = satellite;
            this.scene.add(satellite);
        });
    }

    createSatelliteModel(data) {
        const group = new THREE.Group();

        switch (data.type) {
            case 'station':
                // ISS-like structure
                this.createISSModel(group, data);
                break;
            case 'telescope':
                // Hubble/JWST style
                this.createTelescopeModel(group, data);
                break;
            case 'probe':
                // Voyager style
                this.createProbeModel(group, data);
                break;
            case 'constellation':
                // Small satellite
                this.createSmallSatModel(group, data);
                break;
            default:
                this.createGenericSatModel(group, data);
        }

        return group;
    }

    createISSModel(group, data) {
        const scale = data.size || 0.5;

        // Main truss
        const trussGeometry = new THREE.BoxGeometry(3 * scale, 0.2 * scale, 0.2 * scale);
        const trussMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.8,
            roughness: 0.3
        });
        const truss = new THREE.Mesh(trussGeometry, trussMaterial);
        group.add(truss);

        // Solar panels (8 total)
        const panelMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a237e,
            metalness: 0.5,
            roughness: 0.4,
            emissive: 0x0d47a1,
            emissiveIntensity: 0.1
        });

        for (let i = 0; i < 4; i++) {
            const panelGeom = new THREE.BoxGeometry(0.8 * scale, 0.02 * scale, 0.4 * scale);
            const panel = new THREE.Mesh(panelGeom, panelMaterial);
            panel.position.set((i - 1.5) * 0.7 * scale, 0.3 * scale, 0);
            group.add(panel);

            const panel2 = panel.clone();
            panel2.position.y = -0.3 * scale;
            group.add(panel2);
        }

        // Modules
        const moduleMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.3,
            roughness: 0.5
        });

        const moduleGeom = new THREE.CylinderGeometry(0.15 * scale, 0.15 * scale, 0.6 * scale, 8);
        for (let i = 0; i < 3; i++) {
            const module = new THREE.Mesh(moduleGeom, moduleMaterial);
            module.rotation.z = Math.PI / 2;
            module.position.set((i - 1) * 0.5 * scale, 0, 0.15 * scale);
            group.add(module);
        }

        // Add glow
        const glowGeom = new THREE.SphereGeometry(1.5 * scale, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x4fc3f7,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeom, glowMat);
        group.add(glow);
    }

    createTelescopeModel(group, data) {
        const scale = data.size || 0.4;

        if (data.shape === 'hexagonal') {
            // JWST style
            // Sunshield
            const shieldGeom = new THREE.BoxGeometry(2 * scale, 0.05 * scale, 1.5 * scale);
            const shieldMat = new THREE.MeshStandardMaterial({
                color: 0xffd700,
                metalness: 0.9,
                roughness: 0.1,
                emissive: 0xffaa00,
                emissiveIntensity: 0.2
            });
            const shield = new THREE.Mesh(shieldGeom, shieldMat);
            group.add(shield);

            // Hexagonal mirror segments
            const mirrorMat = new THREE.MeshStandardMaterial({
                color: 0xffd700,
                metalness: 1,
                roughness: 0,
                emissive: 0xffd700,
                emissiveIntensity: 0.3
            });

            for (let i = 0; i < 6; i++) {
                const hexGeom = new THREE.CylinderGeometry(0.2 * scale, 0.2 * scale, 0.02 * scale, 6);
                const hex = new THREE.Mesh(hexGeom, mirrorMat);
                hex.rotation.x = Math.PI / 2;
                const angle = (i / 6) * Math.PI * 2;
                hex.position.set(
                    Math.cos(angle) * 0.35 * scale,
                    0.3 * scale,
                    Math.sin(angle) * 0.35 * scale
                );
                group.add(hex);
            }
            // Center hex
            const centerHex = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2 * scale, 0.2 * scale, 0.02 * scale, 6),
                mirrorMat
            );
            centerHex.rotation.x = Math.PI / 2;
            centerHex.position.y = 0.3 * scale;
            group.add(centerHex);
        } else {
            // Hubble style
            const bodyGeom = new THREE.CylinderGeometry(0.3 * scale, 0.3 * scale, 1.5 * scale, 16);
            const bodyMat = new THREE.MeshStandardMaterial({
                color: 0xc0c0c0,
                metalness: 0.7,
                roughness: 0.3
            });
            const body = new THREE.Mesh(bodyGeom, bodyMat);
            body.rotation.z = Math.PI / 2;
            group.add(body);

            // Solar panels
            const panelMat = new THREE.MeshStandardMaterial({
                color: 0x1565c0,
                metalness: 0.5,
                roughness: 0.4
            });
            const panelGeom = new THREE.BoxGeometry(1 * scale, 0.02 * scale, 0.4 * scale);

            const panel1 = new THREE.Mesh(panelGeom, panelMat);
            panel1.position.y = 0.5 * scale;
            group.add(panel1);

            const panel2 = new THREE.Mesh(panelGeom, panelMat);
            panel2.position.y = -0.5 * scale;
            group.add(panel2);
        }
    }

    createProbeModel(group, data) {
        const scale = data.size || 0.3;

        // Main body
        const bodyGeom = new THREE.BoxGeometry(0.3 * scale, 0.3 * scale, 0.5 * scale);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.6,
            roughness: 0.4
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        group.add(body);

        // Large dish antenna
        const dishGeom = new THREE.SphereGeometry(0.5 * scale, 16, 8, 0, Math.PI);
        const dishMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.3,
            roughness: 0.5,
            side: THREE.DoubleSide
        });
        const dish = new THREE.Mesh(dishGeom, dishMat);
        dish.rotation.x = -Math.PI / 2;
        dish.position.z = -0.4 * scale;
        group.add(dish);

        // Boom arm
        const boomGeom = new THREE.CylinderGeometry(0.02 * scale, 0.02 * scale, 1 * scale);
        const boomMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
        const boom = new THREE.Mesh(boomGeom, boomMat);
        boom.rotation.z = Math.PI / 2;
        boom.position.x = 0.5 * scale;
        group.add(boom);

        // RTG (power source)
        const rtgGeom = new THREE.CylinderGeometry(0.08 * scale, 0.08 * scale, 0.4 * scale);
        const rtgMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            emissive: 0xff4400,
            emissiveIntensity: 0.3
        });
        const rtg = new THREE.Mesh(rtgGeom, rtgMat);
        rtg.rotation.z = Math.PI / 2;
        rtg.position.x = 1 * scale;
        group.add(rtg);

        // Add subtle glow for RTG
        const glowGeom = new THREE.SphereGeometry(0.15 * scale, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeom, glowMat);
        glow.position.x = 1 * scale;
        group.add(glow);
    }

    createSmallSatModel(group, data) {
        const scale = data.size || 0.1;

        // CubeSat body
        const bodyGeom = new THREE.BoxGeometry(0.3 * scale, 0.3 * scale, 0.3 * scale);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.5,
            roughness: 0.5
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        group.add(body);

        // Solar panel wings
        const panelMat = new THREE.MeshStandardMaterial({
            color: 0x1a237e,
            metalness: 0.4,
            roughness: 0.4,
            emissive: 0x0d47a1,
            emissiveIntensity: 0.1
        });
        const panelGeom = new THREE.BoxGeometry(0.5 * scale, 0.01 * scale, 0.2 * scale);

        const panel1 = new THREE.Mesh(panelGeom, panelMat);
        panel1.position.x = 0.4 * scale;
        group.add(panel1);

        const panel2 = new THREE.Mesh(panelGeom, panelMat);
        panel2.position.x = -0.4 * scale;
        group.add(panel2);

        // Antenna
        const antennaGeom = new THREE.CylinderGeometry(0.01 * scale, 0.01 * scale, 0.3 * scale);
        const antennaMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const antenna = new THREE.Mesh(antennaGeom, antennaMat);
        antenna.position.y = 0.3 * scale;
        group.add(antenna);
    }

    createGenericSatModel(group, data) {
        const scale = data.size || 0.2;
        const bodyGeom = new THREE.SphereGeometry(0.2 * scale, 8, 8);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.5,
            roughness: 0.5
        });
        group.add(new THREE.Mesh(bodyGeom, bodyMat));
    }

    createAlienShips() {
        if (typeof ALIEN_SHIPS === 'undefined') return;

        ALIEN_SHIPS.forEach((shipData, index) => {
            const ship = this.createAlienShipModel(shipData);
            ship.name = `alienShip_${index}`;
            ship.userData = {
                ...shipData,
                isAlienShip: true,
                floatOffset: Math.random() * Math.PI * 2,
                floatSpeed: 0.5 + Math.random() * 0.5,
                orbitAngle: Math.random() * Math.PI * 2,
                orbitSpeed: (0.1 + Math.random() * 0.2) * (Math.random() > 0.5 ? 1 : -1)
            };

            // Random position in solar system
            const radius = shipData.orbitRadius || (100 + Math.random() * 200);
            const angle = Math.random() * Math.PI * 2;
            ship.position.set(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 30,
                Math.sin(angle) * radius
            );

            this.alienShips.push(ship);
            this.scene.add(ship);
        });
    }

    createAlienShipModel(data) {
        const group = new THREE.Group();
        const scale = data.size || 1;

        switch (data.type) {
            case 'scout':
                this.createScoutShip(group, data, scale);
                break;
            case 'mothership':
                this.createMothership(group, data, scale);
                break;
            case 'cruiser':
                this.createCruiserShip(group, data, scale);
                break;
            case 'probe':
                this.createAlienProbe(group, data, scale);
                break;
            default:
                this.createScoutShip(group, data, scale);
        }

        return group;
    }

    createScoutShip(group, data, scale) {
        // Classic UFO saucer shape
        const bodyGeom = new THREE.SphereGeometry(1 * scale, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: data.color || 0x4a4a4a,
            metalness: 0.9,
            roughness: 0.1
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.scale.y = 0.3;
        group.add(body);

        // Bottom dome
        const bottomGeom = new THREE.SphereGeometry(1 * scale, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        const bottom = new THREE.Mesh(bottomGeom, bodyMat);
        bottom.scale.y = 0.2;
        group.add(bottom);

        // Cockpit dome
        const cockpitGeom = new THREE.SphereGeometry(0.4 * scale, 16, 16);
        const cockpitMat = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.6,
            emissive: 0x00ff88,
            emissiveIntensity: 0.5
        });
        const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
        cockpit.position.y = 0.2 * scale;
        cockpit.scale.y = 0.5;
        group.add(cockpit);

        // Glowing ring around edge
        const ringGeom = new THREE.TorusGeometry(0.9 * scale, 0.05 * scale, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: data.glowColor || 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        // Bottom lights
        this.addUFOLights(group, scale, data.glowColor || 0x00ffff);

        // Engine glow
        const engineGlow = new THREE.PointLight(data.glowColor || 0x00ffff, 1, 5 * scale);
        engineGlow.position.y = -0.3 * scale;
        group.add(engineGlow);
        group.userData.engineLight = engineGlow;
    }

    createMothership(group, data, scale) {
        // Large triangular/disc mothership
        const hullGeom = new THREE.CylinderGeometry(2 * scale, 3 * scale, 0.5 * scale, 6);
        const hullMat = new THREE.MeshStandardMaterial({
            color: data.color || 0x2a2a3a,
            metalness: 0.95,
            roughness: 0.1
        });
        const hull = new THREE.Mesh(hullGeom, hullMat);
        group.add(hull);

        // Upper structure
        const upperGeom = new THREE.CylinderGeometry(1 * scale, 2 * scale, 0.8 * scale, 6);
        const upper = new THREE.Mesh(upperGeom, hullMat);
        upper.position.y = 0.5 * scale;
        group.add(upper);

        // Command tower
        const towerGeom = new THREE.CylinderGeometry(0.3 * scale, 0.5 * scale, 0.6 * scale, 8);
        const tower = new THREE.Mesh(towerGeom, hullMat);
        tower.position.y = 1.1 * scale;
        group.add(tower);

        // Bridge windows
        const bridgeMat = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.8
        });
        for (let i = 0; i < 8; i++) {
            const windowGeom = new THREE.BoxGeometry(0.15 * scale, 0.1 * scale, 0.02 * scale);
            const win = new THREE.Mesh(windowGeom, bridgeMat);
            const angle = (i / 8) * Math.PI * 2;
            win.position.set(
                Math.cos(angle) * 0.35 * scale,
                1.1 * scale,
                Math.sin(angle) * 0.35 * scale
            );
            win.lookAt(0, 1.1 * scale, 0);
            group.add(win);
        }

        // Engine pods
        const engineMat = new THREE.MeshBasicMaterial({
            color: data.glowColor || 0xff4400,
            transparent: true,
            opacity: 0.9
        });
        for (let i = 0; i < 6; i++) {
            const engineGeom = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 0.3 * scale, 8);
            const engine = new THREE.Mesh(engineGeom, engineMat);
            const angle = (i / 6) * Math.PI * 2;
            engine.position.set(
                Math.cos(angle) * 2.5 * scale,
                -0.3 * scale,
                Math.sin(angle) * 2.5 * scale
            );
            group.add(engine);

            // Engine lights
            const light = new THREE.PointLight(data.glowColor || 0xff4400, 0.5, 3 * scale);
            light.position.copy(engine.position);
            light.position.y -= 0.2 * scale;
            group.add(light);
        }

        // Central beam capability
        const beamGeom = new THREE.ConeGeometry(0.5 * scale, 3 * scale, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const beam = new THREE.Mesh(beamGeom, beamMat);
        beam.position.y = -1.5 * scale;
        beam.visible = false; // Can be activated
        group.add(beam);
        group.userData.tractorBeam = beam;
    }

    createCruiserShip(group, data, scale) {
        // Elongated warship style
        const hullGeom = new THREE.CylinderGeometry(0.5 * scale, 0.8 * scale, 4 * scale, 8);
        const hullMat = new THREE.MeshStandardMaterial({
            color: data.color || 0x3a3a4a,
            metalness: 0.85,
            roughness: 0.2
        });
        const hull = new THREE.Mesh(hullGeom, hullMat);
        hull.rotation.x = Math.PI / 2;
        group.add(hull);

        // Forward section
        const bowGeom = new THREE.ConeGeometry(0.5 * scale, 1.5 * scale, 8);
        const bow = new THREE.Mesh(bowGeom, hullMat);
        bow.rotation.x = -Math.PI / 2;
        bow.position.z = -2.5 * scale;
        group.add(bow);

        // Engine section
        const engineGeom = new THREE.CylinderGeometry(0.8 * scale, 0.6 * scale, 1 * scale, 8);
        const engine = new THREE.Mesh(engineGeom, hullMat);
        engine.rotation.x = Math.PI / 2;
        engine.position.z = 2.5 * scale;
        group.add(engine);

        // Engine glow
        const glowGeom = new THREE.CircleGeometry(0.7 * scale, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: data.glowColor || 0x4444ff,
            transparent: true,
            opacity: 0.9
        });
        const glow = new THREE.Mesh(glowGeom, glowMat);
        glow.position.z = 3 * scale;
        group.add(glow);

        // Wing-like structures
        const wingGeom = new THREE.BoxGeometry(3 * scale, 0.1 * scale, 1 * scale);
        const wing = new THREE.Mesh(wingGeom, hullMat);
        wing.position.z = 1 * scale;
        group.add(wing);

        // Weapon arrays (glowing)
        const weaponMat = new THREE.MeshBasicMaterial({
            color: 0xff0044,
            emissive: 0xff0044
        });
        for (let i = 0; i < 4; i++) {
            const weaponGeom = new THREE.SphereGeometry(0.1 * scale, 8, 8);
            const weapon = new THREE.Mesh(weaponGeom, weaponMat);
            weapon.position.set(
                (i < 2 ? -1 : 1) * 1.2 * scale,
                0,
                (i % 2 === 0 ? -1 : 0.5) * scale
            );
            group.add(weapon);
        }

        // Running lights
        const lightColor = data.glowColor || 0x4444ff;
        const light1 = new THREE.PointLight(lightColor, 0.5, 3 * scale);
        light1.position.z = 3 * scale;
        group.add(light1);
    }

    createAlienProbe(group, data, scale) {
        // Small spherical probe
        const coreGeom = new THREE.IcosahedronGeometry(0.5 * scale, 1);
        const coreMat = new THREE.MeshStandardMaterial({
            color: data.color || 0x222233,
            metalness: 0.9,
            roughness: 0.1
        });
        const core = new THREE.Mesh(coreGeom, coreMat);
        group.add(core);

        // Glowing energy core
        const energyGeom = new THREE.SphereGeometry(0.3 * scale, 16, 16);
        const energyMat = new THREE.MeshBasicMaterial({
            color: data.glowColor || 0x00ffaa,
            transparent: true,
            opacity: 0.7
        });
        const energy = new THREE.Mesh(energyGeom, energyMat);
        group.add(energy);
        group.userData.energyCore = energy;

        // Sensor arrays
        const sensorMat = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.8
        });
        for (let i = 0; i < 6; i++) {
            const sensorGeom = new THREE.ConeGeometry(0.08 * scale, 0.3 * scale, 6);
            const sensor = new THREE.Mesh(sensorGeom, sensorMat);

            // Position on icosahedron vertices
            const phi = Math.acos(-1 + (2 * i + 1) / 6);
            const theta = Math.sqrt(6 * Math.PI) * phi;
            sensor.position.setFromSpherical(new THREE.Spherical(0.6 * scale, phi, theta));
            sensor.lookAt(0, 0, 0);
            group.add(sensor);
        }

        // Orbiting particle ring
        const ringGeom = new THREE.TorusGeometry(0.8 * scale, 0.02 * scale, 4, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: data.glowColor || 0x00ffaa,
            transparent: true,
            opacity: 0.5
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        group.add(ring);
        group.userData.orbitRing = ring;
    }

    addUFOLights(group, scale, color) {
        const lightCount = 8;
        for (let i = 0; i < lightCount; i++) {
            const lightGeom = new THREE.SphereGeometry(0.05 * scale, 8, 8);
            const lightMat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.9
            });
            const light = new THREE.Mesh(lightGeom, lightMat);

            const angle = (i / lightCount) * Math.PI * 2;
            light.position.set(
                Math.cos(angle) * 0.7 * scale,
                -0.15 * scale,
                Math.sin(angle) * 0.7 * scale
            );
            light.userData.lightIndex = i;
            group.add(light);
        }
    }

    createCometsAndAsteroids() {
        if (typeof COMETS === 'undefined') return;

        COMETS.forEach((cometData, index) => {
            const comet = this.createCometModel(cometData);
            comet.name = `comet_${index}`;
            comet.userData = {
                ...cometData,
                isComet: true,
                angle: Math.random() * Math.PI * 2,
                speed: cometData.speed || 0.001
            };

            // Position along orbit
            const radius = cometData.perihelion || 50;
            comet.position.set(radius, 0, 0);

            this.comets.push(comet);
            this.scene.add(comet);
        });
    }

    createCometModel(data) {
        const group = new THREE.Group();
        const scale = data.size || 1;

        // Nucleus (rocky/icy core)
        const nucleusGeom = new THREE.SphereGeometry(0.5 * scale, 16, 16);
        const nucleusMat = new THREE.MeshStandardMaterial({
            color: 0x665544,
            roughness: 0.9,
            metalness: 0.1
        });
        const nucleus = new THREE.Mesh(nucleusGeom, nucleusMat);

        // Make nucleus irregular
        const posAttr = nucleusGeom.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            const noise = 0.8 + Math.random() * 0.4;
            posAttr.setXYZ(
                i,
                posAttr.getX(i) * noise,
                posAttr.getY(i) * noise,
                posAttr.getZ(i) * noise
            );
        }
        nucleusGeom.computeVertexNormals();
        group.add(nucleus);

        // Coma (glowing gas cloud around nucleus)
        const comaGeom = new THREE.SphereGeometry(1.5 * scale, 16, 16);
        const comaMat = new THREE.MeshBasicMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        const coma = new THREE.Mesh(comaGeom, comaMat);
        group.add(coma);

        // Dust tail (curved, yellowish)
        const dustTailGeom = new THREE.ConeGeometry(0.8 * scale, 8 * scale, 8, 1, true);
        const dustTailMat = new THREE.MeshBasicMaterial({
            color: 0xffdd88,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const dustTail = new THREE.Mesh(dustTailGeom, dustTailMat);
        dustTail.rotation.x = Math.PI / 2;
        dustTail.position.z = 4 * scale;
        group.add(dustTail);
        group.userData.dustTail = dustTail;

        // Ion tail (straight, blue)
        const ionTailGeom = new THREE.ConeGeometry(0.3 * scale, 12 * scale, 8, 1, true);
        const ionTailMat = new THREE.MeshBasicMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const ionTail = new THREE.Mesh(ionTailGeom, ionTailMat);
        ionTail.rotation.x = Math.PI / 2;
        ionTail.position.z = 6 * scale;
        group.add(ionTail);
        group.userData.ionTail = ionTail;

        // Particle trail
        const particleCount = 200;
        const particleGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 2 * scale;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2 * scale;
            positions[i * 3 + 2] = Math.random() * 15 * scale;
            sizes[i] = Math.random() * 0.1 * scale;
        }

        particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMat = new THREE.PointsMaterial({
            color: 0xaaddff,
            size: 0.1 * scale,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(particleGeom, particleMat);
        group.add(particles);

        return group;
    }

    createSpaceDebrisField() {
        // Create a field of small debris/particles
        const debrisCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(debrisCount * 3);
        const colors = new Float32Array(debrisCount * 3);

        for (let i = 0; i < debrisCount; i++) {
            // Distribute throughout solar system
            const radius = 20 + Math.random() * 300;
            const theta = Math.random() * Math.PI * 2;
            const phi = (Math.random() - 0.5) * 0.3; // Mostly in ecliptic plane

            positions[i * 3] = Math.cos(theta) * radius * Math.cos(phi);
            positions[i * 3 + 1] = Math.sin(phi) * radius * 0.1;
            positions[i * 3 + 2] = Math.sin(theta) * radius * Math.cos(phi);

            // Varying colors
            const brightness = 0.3 + Math.random() * 0.7;
            colors[i * 3] = brightness;
            colors[i * 3 + 1] = brightness * 0.9;
            colors[i * 3 + 2] = brightness * 0.8;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });

        this.spaceDebris = new THREE.Points(geometry, material);
        this.scene.add(this.spaceDebris);
    }

    startMeteorShower() {
        // Create meteor shower effect
        this.meteorPool = [];
        const poolSize = 20;

        for (let i = 0; i < poolSize; i++) {
            const meteor = this.createMeteor();
            meteor.visible = false;
            this.meteorPool.push(meteor);
            this.scene.add(meteor);
        }

        // Spawn meteors periodically
        this.lastMeteorTime = 0;
        this.meteorInterval = 2000; // ms between meteors
    }

    createMeteor() {
        const group = new THREE.Group();

        // Meteor head
        const headGeom = new THREE.SphereGeometry(0.2, 8, 8);
        const headMat = new THREE.MeshBasicMaterial({
            color: 0xffaa44,
            transparent: true,
            opacity: 0.9
        });
        const head = new THREE.Mesh(headGeom, headMat);
        group.add(head);

        // Glowing trail
        const trailGeom = new THREE.ConeGeometry(0.15, 3, 8, 1, true);
        const trailMat = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const trail = new THREE.Mesh(trailGeom, trailMat);
        trail.rotation.x = -Math.PI / 2;
        trail.position.z = 1.5;
        group.add(trail);

        // Point light
        const light = new THREE.PointLight(0xff6600, 0.5, 5);
        group.add(light);

        group.userData = {
            velocity: new THREE.Vector3(),
            lifetime: 0,
            maxLifetime: 3
        };

        return group;
    }

    spawnMeteor() {
        const meteor = this.meteorPool.find(m => !m.visible);
        if (!meteor) return;

        // Random spawn position (coming from outer solar system)
        const spawnRadius = 200 + Math.random() * 100;
        const spawnAngle = Math.random() * Math.PI * 2;
        const targetAngle = spawnAngle + Math.PI + (Math.random() - 0.5) * 0.5;

        meteor.position.set(
            Math.cos(spawnAngle) * spawnRadius,
            (Math.random() - 0.5) * 50,
            Math.sin(spawnAngle) * spawnRadius
        );

        // Velocity toward inner solar system
        const speed = 2 + Math.random() * 3;
        meteor.userData.velocity.set(
            Math.cos(targetAngle) * speed,
            (Math.random() - 0.5) * 0.5,
            Math.sin(targetAngle) * speed
        );

        meteor.userData.lifetime = 0;
        meteor.userData.maxLifetime = 2 + Math.random() * 2;
        meteor.visible = true;

        // Point meteor in direction of travel
        meteor.lookAt(
            meteor.position.x + meteor.userData.velocity.x,
            meteor.position.y + meteor.userData.velocity.y,
            meteor.position.z + meteor.userData.velocity.z
        );
    }

    animateSpaceObjects(deltaTime) {
        const time = Date.now() * 0.001;

        // Animate satellites
        Object.values(this.satellites).forEach(sat => {
            if (!sat.visible) return;

            if (sat.userData.parentPlanet === 'earth' && this.planets.earth) {
                // Orbit around Earth
                sat.userData.orbitAngle += deltaTime * (sat.userData.orbitSpeed || 2);
                const earthPos = this.planets.earth.position;
                const orbitRadius = sat.userData.orbitRadius || 3;

                sat.position.set(
                    earthPos.x + Math.cos(sat.userData.orbitAngle) * orbitRadius,
                    earthPos.y + Math.sin(sat.userData.orbitAngle * 0.5) * orbitRadius * 0.3,
                    earthPos.z + Math.sin(sat.userData.orbitAngle) * orbitRadius
                );

                // Rotate to face Earth
                sat.lookAt(earthPos);
            }

            // Gentle rotation
            sat.rotation.y += deltaTime * 0.1;
        });

        // Animate alien ships
        this.alienShips.forEach(ship => {
            if (!ship.visible) return;

            // Floating motion
            const floatY = Math.sin(time * ship.userData.floatSpeed + ship.userData.floatOffset) * 2;

            // Orbit motion
            ship.userData.orbitAngle += deltaTime * ship.userData.orbitSpeed * 0.1;
            const radius = ship.userData.orbitRadius || 150;

            ship.position.x = Math.cos(ship.userData.orbitAngle) * radius;
            ship.position.y = floatY + (ship.userData.baseHeight || 0);
            ship.position.z = Math.sin(ship.userData.orbitAngle) * radius;

            // Rotation
            ship.rotation.y += deltaTime * 0.3;

            // Animate energy cores/rings for probes
            if (ship.userData.orbitRing) {
                ship.userData.orbitRing.rotation.x += deltaTime * 2;
                ship.userData.orbitRing.rotation.y += deltaTime * 1.5;
            }

            // Pulse energy cores
            if (ship.userData.energyCore) {
                const pulse = 0.7 + Math.sin(time * 3) * 0.3;
                ship.userData.energyCore.material.opacity = pulse;
            }

            // Animate UFO lights (chase pattern)
            ship.children.forEach((child, idx) => {
                if (child.userData.lightIndex !== undefined) {
                    const phase = (time * 3 + child.userData.lightIndex * 0.5) % (Math.PI * 2);
                    child.material.opacity = 0.5 + Math.sin(phase) * 0.5;
                }
            });
        });

        // Animate comets
        this.comets.forEach(comet => {
            if (!comet.visible) return;

            // Orbital motion (simplified elliptical)
            comet.userData.angle += deltaTime * comet.userData.speed;
            const perihelion = comet.userData.perihelion || 50;
            const aphelion = comet.userData.aphelion || 300;
            const a = (perihelion + aphelion) / 2;
            const e = (aphelion - perihelion) / (aphelion + perihelion);
            const r = a * (1 - e * e) / (1 + e * Math.cos(comet.userData.angle));

            comet.position.x = Math.cos(comet.userData.angle) * r;
            comet.position.z = Math.sin(comet.userData.angle) * r;

            // Point tail away from sun
            const toSun = new THREE.Vector3(-comet.position.x, -comet.position.y, -comet.position.z).normalize();
            comet.lookAt(comet.position.x - toSun.x, comet.position.y - toSun.y, comet.position.z - toSun.z);

            // Scale tail based on distance from sun
            const distFromSun = comet.position.length();
            const tailScale = Math.max(0.3, Math.min(2, 100 / distFromSun));
            if (comet.userData.dustTail) {
                comet.userData.dustTail.scale.set(tailScale, 1, tailScale);
            }
            if (comet.userData.ionTail) {
                comet.userData.ionTail.scale.set(tailScale, 1, tailScale);
            }
        });

        // Animate meteors
        const currentTime = Date.now();
        if (currentTime - this.lastMeteorTime > this.meteorInterval) {
            this.spawnMeteor();
            this.lastMeteorTime = currentTime;
            this.meteorInterval = 1000 + Math.random() * 4000; // Random interval
        }

        this.meteorPool.forEach(meteor => {
            if (!meteor.visible) return;

            meteor.userData.lifetime += deltaTime;

            if (meteor.userData.lifetime >= meteor.userData.maxLifetime) {
                meteor.visible = false;
                return;
            }

            // Move meteor
            meteor.position.add(meteor.userData.velocity);

            // Fade out
            const fade = 1 - (meteor.userData.lifetime / meteor.userData.maxLifetime);
            meteor.children.forEach(child => {
                if (child.material) {
                    child.material.opacity = child.material.userData?.baseOpacity || 0.5 * fade;
                }
            });
        });

        // Rotate space debris slowly
        if (this.spaceDebris) {
            this.spaceDebris.rotation.y += deltaTime * 0.01;
        }
    }

    // Toggle methods for space objects
    toggleSatellites(show) {
        this.showSatellites = show !== undefined ? show : !this.showSatellites;
        Object.values(this.satellites).forEach(sat => {
            sat.visible = this.showSatellites;
        });
        return this.showSatellites;
    }

    toggleAlienShips(show) {
        this.showAlienShips = show !== undefined ? show : !this.showAlienShips;
        this.alienShips.forEach(ship => {
            ship.visible = this.showAlienShips;
        });
        return this.showAlienShips;
    }

    toggleComets(show) {
        this.showComets = show !== undefined ? show : !this.showComets;
        this.comets.forEach(comet => {
            comet.visible = this.showComets;
        });
        return this.showComets;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarSystem;
}
