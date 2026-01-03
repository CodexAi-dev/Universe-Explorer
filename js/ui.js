/**
 * Solar System UI Controller
 * Handles all user interface interactions
 * Enhanced with Universe Exploration features
 */

class UIController {
    constructor(solarSystem) {
        this.solarSystem = solarSystem;
        this.timeSpeedLevels = [0.1, 0.5, 1, 10, 100, 1000, 5000, 10000];
        this.currentSpeedIndex = 2; // Start at 1x
        this.isReversed = false;
        this.useImperialUnits = false;
        this.currentView = 'solarSystem';
        this.currentInfoTab = 'planets';

        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupSolarSystemCallbacks();
        this.populateComparisonSelects();
        this.populateDeepSpaceSelectors();
        this.initSpaceFacts();
        this.updateTimeDisplay();

        // Start time display update interval
        setInterval(() => this.updateTimeDisplay(), 1000);
        setInterval(() => this.updateFPS(), 500);
    }

    cacheElements() {
        // Panels
        this.leftPanel = document.getElementById('left-panel');
        this.rightPanel = document.getElementById('right-panel');

        // Header buttons
        this.btnScreenshot = document.getElementById('btn-screenshot');
        this.btnFullscreen = document.getElementById('btn-fullscreen');
        this.btnSettings = document.getElementById('btn-settings');
        this.btnHelp = document.getElementById('btn-help');

        // Universe Scale Buttons
        this.scaleBtns = document.querySelectorAll('.scale-btn');

        // Info Tabs
        this.infoTabs = document.querySelectorAll('.info-tab');
        this.tabContents = document.querySelectorAll('.tab-content');

        // View toggles
        this.toggleOrbits = document.getElementById('toggle-orbits');
        this.toggleLabels = document.getElementById('toggle-labels');
        this.toggleMoons = document.getElementById('toggle-moons');
        this.toggleStarsEl = document.getElementById('toggle-stars');
        this.toggleAsteroidBelt = document.getElementById('toggle-asteroid-belt');
        this.togglePluto = document.getElementById('toggle-pluto');

        // Universe toggles
        this.toggleNebulae = document.getElementById('toggle-nebulae');
        this.toggleGalaxies = document.getElementById('toggle-galaxies');
        this.toggleMilkyway = document.getElementById('toggle-milkyway');
        this.toggleBlackholes = document.getElementById('toggle-blackholes');

        // Space Objects toggles
        this.toggleSatellites = document.getElementById('toggle-satellites');
        this.toggleAlienShips = document.getElementById('toggle-alien-ships');
        this.toggleComets = document.getElementById('toggle-comets');

        // Scale controls
        this.distanceScale = document.getElementById('distance-scale');
        this.planetSize = document.getElementById('planet-size');

        // Camera controls
        this.btnResetCamera = document.getElementById('btn-reset-camera');
        this.btnAutoOrbit = document.getElementById('btn-auto-orbit');
        this.viewMode = document.getElementById('view-mode');

        // Quality
        this.qualitySetting = document.getElementById('quality-setting');
        this.fpsCounter = document.getElementById('fps-counter');

        // Time controls
        this.simulationDate = document.getElementById('simulation-date');
        this.timeSpeedDisplay = document.getElementById('time-speed-display');
        this.btnReverse = document.getElementById('btn-reverse');
        this.btnSlower = document.getElementById('btn-slower');
        this.btnPlayPause = document.getElementById('btn-play-pause');
        this.btnFaster = document.getElementById('btn-faster');
        this.btnRealtime = document.getElementById('btn-realtime');
        this.btnResetTime = document.getElementById('btn-reset-time');
        this.timeSpeedSlider = document.getElementById('time-speed-slider');

        // Planet info elements
        this.planetInfoPlaceholder = document.querySelector('.planet-info-placeholder');
        this.planetDetails = document.querySelector('.planet-details');
        this.selectedPlanetIcon = document.getElementById('selected-planet-icon');
        this.planetName = document.getElementById('planet-name');
        this.planetType = document.getElementById('planet-type');
        this.planetDiameter = document.getElementById('planet-diameter');
        this.planetMass = document.getElementById('planet-mass');
        this.planetGravity = document.getElementById('planet-gravity');
        this.planetOrbital = document.getElementById('planet-orbital');
        this.planetDistance = document.getElementById('planet-distance');
        this.planetMoons = document.getElementById('planet-moons');
        this.planetTemp = document.getElementById('planet-temp');
        this.planetDay = document.getElementById('planet-day');
        this.planetDescriptionText = document.getElementById('planet-description-text');
        this.btnFocusPlanet = document.getElementById('btn-focus-planet');
        this.btnComparePlanet = document.getElementById('btn-compare-planet');
        this.btnSurfaceView = document.getElementById('btn-surface-view');

        // Planet selector
        this.planetBtns = document.querySelectorAll('.planet-btn');

        // Tooltip
        this.hoverTooltip = document.getElementById('hover-tooltip');

        // Modals
        this.settingsModal = document.getElementById('settings-modal');
        this.helpModal = document.getElementById('help-modal');
        this.comparisonModal = document.getElementById('comparison-modal');
        this.tourModal = document.getElementById('tour-modal');

        // Settings
        this.themeBtns = document.querySelectorAll('.theme-btn');
        this.toggleUnits = document.getElementById('toggle-units');
        this.toggleHighContrast = document.getElementById('toggle-high-contrast');
        this.textSize = document.getElementById('text-size');
        this.toggleAdvancedMode = document.getElementById('toggle-advanced-mode');

        // Comparison
        this.comparePlanet1 = document.getElementById('compare-planet-1');
        this.comparePlanet2 = document.getElementById('compare-planet-2');
        this.comparisonTbody = document.getElementById('comparison-tbody');
        this.compareVisual1 = document.getElementById('compare-visual-1');
        this.compareVisual2 = document.getElementById('compare-visual-2');
        this.compareName1 = document.getElementById('compare-name-1');
        this.compareName2 = document.getElementById('compare-name-2');
    }

    bindEvents() {
        // Panel toggles
        document.querySelectorAll('.panel-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => this.togglePanel(e));
        });

        // Header buttons
        this.btnScreenshot.addEventListener('click', () => this.takeScreenshot());
        this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
        this.btnSettings.addEventListener('click', () => this.showModal('settings'));
        this.btnHelp.addEventListener('click', () => this.showModal('help'));

        // View toggles
        this.toggleOrbits.addEventListener('change', () => this.solarSystem.toggleOrbits());
        this.toggleLabels.addEventListener('change', () => this.solarSystem.toggleLabels());
        this.toggleMoons.addEventListener('change', () => this.solarSystem.toggleMoons());
        this.toggleStarsEl.addEventListener('change', () => this.solarSystem.toggleStars());
        this.toggleAsteroidBelt.addEventListener('change', () => this.solarSystem.toggleAsteroidBelt());
        this.togglePluto.addEventListener('change', () => this.solarSystem.togglePluto());

        // Universe toggles
        if (this.toggleNebulae) {
            this.toggleNebulae.addEventListener('change', (e) => this.solarSystem.toggleNebulae(e.target.checked));
        }
        if (this.toggleGalaxies) {
            this.toggleGalaxies.addEventListener('change', (e) => this.solarSystem.toggleGalaxies(e.target.checked));
        }
        if (this.toggleMilkyway) {
            this.toggleMilkyway.addEventListener('change', (e) => this.solarSystem.toggleMilkyWay(e.target.checked));
        }
        if (this.toggleBlackholes) {
            this.toggleBlackholes.addEventListener('change', (e) => {
                // Toggle black holes - they follow nebulae visibility
                Object.values(this.solarSystem.blackHoles || {}).forEach(bh => {
                    bh.visible = e.target.checked;
                });
            });
        }

        // Space Objects toggles
        if (this.toggleSatellites) {
            this.toggleSatellites.addEventListener('change', (e) => this.solarSystem.toggleSatellites(e.target.checked));
        }
        if (this.toggleAlienShips) {
            this.toggleAlienShips.addEventListener('change', (e) => this.solarSystem.toggleAlienShips(e.target.checked));
        }
        if (this.toggleComets) {
            this.toggleComets.addEventListener('change', (e) => this.solarSystem.toggleComets(e.target.checked));
        }

        // Universe Scale buttons
        this.scaleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.scaleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const view = btn.dataset.view;
                this.setUniverseView(view);
            });
        });

        // Info Tab buttons
        this.infoTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchInfoTab(tab.dataset.tab);
            });
        });

        // Scale controls
        this.distanceScale.addEventListener('change', (e) => {
            this.solarSystem.distanceScale = e.target.value;
        });

        this.planetSize.addEventListener('input', (e) => {
            const value = e.target.value;
            e.target.nextElementSibling.textContent = `${value}x`;
            this.solarSystem.setPlanetSizeMultiplier(parseFloat(value));
        });

        // Camera controls
        this.btnResetCamera.addEventListener('click', () => this.solarSystem.resetCamera());
        this.btnAutoOrbit.addEventListener('click', () => {
            const isAuto = this.solarSystem.toggleAutoOrbit();
            this.btnAutoOrbit.classList.toggle('active', isAuto);
        });
        this.viewMode.addEventListener('change', (e) => this.solarSystem.setViewMode(e.target.value));

        // Quality
        this.qualitySetting.addEventListener('change', (e) => {
            this.solarSystem.setQuality(e.target.value);
        });

        // Time controls
        this.btnReverse.addEventListener('click', () => this.reverseTime());
        this.btnSlower.addEventListener('click', () => this.decreaseSpeed());
        this.btnPlayPause.addEventListener('click', () => this.togglePlayPause());
        this.btnFaster.addEventListener('click', () => this.increaseSpeed());
        this.btnRealtime.addEventListener('click', () => this.setRealtime());
        this.btnResetTime.addEventListener('click', () => this.resetTime());
        this.timeSpeedSlider.addEventListener('input', (e) => this.setSpeedFromSlider(e.target.value));

        // Planet selector
        this.planetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const planet = btn.dataset.planet;
                this.solarSystem.selectPlanet(planet);
                this.solarSystem.focusOnPlanet(planet);
                this.setActivePlanetButton(planet);
            });
        });

        // Planet info actions
        this.btnFocusPlanet.addEventListener('click', () => {
            if (this.solarSystem.selectedPlanet) {
                this.solarSystem.focusOnPlanet(this.solarSystem.selectedPlanet.name);
            }
        });

        this.btnSurfaceView.addEventListener('click', () => {
            if (this.solarSystem.selectedPlanet) {
                const isActive = this.solarSystem.toggleSurfaceView(this.solarSystem.selectedPlanet.name);
                this.updateSurfaceViewButton(isActive);
            }
        });

        this.btnComparePlanet.addEventListener('click', () => {
            if (this.solarSystem.selectedPlanet) {
                this.comparePlanet1.value = this.solarSystem.selectedPlanet.name;
                this.showModal('comparison');
                this.updateComparison();
            }
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // Theme selection
        this.themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.themeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.documentElement.setAttribute('data-theme', btn.dataset.theme);
            });
        });

        // Settings
        this.toggleUnits.addEventListener('change', (e) => {
            this.useImperialUnits = e.target.checked;
            if (this.solarSystem.selectedPlanet) {
                this.updatePlanetInfo(this.solarSystem.selectedPlanet.userData);
            }
        });

        this.toggleHighContrast.addEventListener('change', (e) => {
            document.documentElement.setAttribute('data-high-contrast', e.target.checked);
        });

        this.textSize.addEventListener('change', (e) => {
            document.documentElement.setAttribute('data-text-size', e.target.value);
        });

        // Comparison selects
        this.comparePlanet1.addEventListener('change', () => this.updateComparison());
        this.comparePlanet2.addEventListener('change', () => this.updateComparison());

        // Tour button
        document.getElementById('btn-start-tour').addEventListener('click', () => {
            this.showModal('tour');
            if (window.tourController) {
                window.tourController.reset();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    setupSolarSystemCallbacks() {
        this.solarSystem.onPlanetSelect = (planetData) => {
            this.updatePlanetInfo(planetData);
            this.setActivePlanetButton(planetData.name.toLowerCase());
            this.switchInfoTab('planets');
        };

        this.solarSystem.onPlanetHover = (planet, x, y) => {
            if (planet) {
                this.showTooltip(planet.userData, x, y);
            } else {
                this.hideTooltip();
            }
        };

        // Deep space object selection callback
        this.solarSystem.onDeepSpaceSelect = (objectData) => {
            this.updateDeepSpaceInfo(objectData);
            this.switchInfoTab('deepspace');
        };

        // Surface view exit callback (for auto-exit on zoom out)
        this.solarSystem.onSurfaceViewExit = () => {
            this.updateSurfaceViewButton(false);
        };
    }

    // Universe View methods
    setUniverseView(view) {
        this.currentView = view;
        this.solarSystem.setUniverseView(view);

        // Update toggle states based on view
        if (view !== 'solarSystem') {
            if (this.toggleNebulae) this.toggleNebulae.checked = (view !== 'solarSystem');
            if (this.toggleGalaxies) this.toggleGalaxies.checked = (view === 'intergalactic' || view === 'cosmic');
            if (this.toggleMilkyway) this.toggleMilkyway.checked = (view === 'galactic' || view === 'intergalactic' || view === 'cosmic');
        }
    }

    // Info Tab switching
    switchInfoTab(tabName) {
        this.currentInfoTab = tabName;

        this.infoTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-info`);
        });
    }

    // Deep Space Info methods
    updateDeepSpaceInfo(data) {
        const placeholder = document.querySelector('.deepspace-placeholder');
        const details = document.querySelector('.deepspace-details');

        if (placeholder) placeholder.style.display = 'none';
        if (details) details.style.display = 'block';

        // Update elements
        const nameEl = document.getElementById('deepspace-name');
        const typeEl = document.getElementById('deepspace-type');
        const distanceEl = document.getElementById('deepspace-distance');
        const diameterEl = document.getElementById('deepspace-diameter');
        const starsEl = document.getElementById('deepspace-stars');
        const constellationEl = document.getElementById('deepspace-constellation');
        const descriptionEl = document.getElementById('deepspace-description-text');
        const factsEl = document.getElementById('deepspace-facts-list');

        if (nameEl) nameEl.textContent = data.name || 'Unknown';
        if (typeEl) typeEl.textContent = data.type || 'Unknown';
        if (distanceEl) distanceEl.textContent = data.distance || 'Unknown';
        if (diameterEl) diameterEl.textContent = data.diameter || 'Unknown';
        if (starsEl) starsEl.textContent = data.stars || 'Unknown';
        if (constellationEl) constellationEl.textContent = data.constellation || 'N/A';
        if (descriptionEl) descriptionEl.textContent = data.description || '';

        // Update facts
        if (factsEl && data.facts) {
            factsEl.innerHTML = '';
            data.facts.forEach(fact => {
                const li = document.createElement('li');
                li.textContent = fact;
                factsEl.appendChild(li);
            });
        }

        // Update icon based on type
        const iconEl = document.querySelector('.deepspace-icon i');
        if (iconEl) {
            iconEl.className = 'fas';
            if (data.isGalaxy) {
                iconEl.classList.add('fa-circle-notch');
            } else if (data.isNebula) {
                iconEl.classList.add('fa-cloud');
            } else if (data.isBlackHole) {
                iconEl.classList.add('fa-circle');
            } else {
                iconEl.classList.add('fa-star-of-life');
            }
        }

        // Setup focus button
        const focusBtn = document.getElementById('btn-focus-deepspace');
        if (focusBtn) {
            focusBtn.onclick = () => {
                if (data.key) {
                    let type = 'nebula';
                    if (data.isGalaxy) type = 'galaxy';
                    else if (data.isBlackHole) type = 'blackhole';
                    this.solarSystem.focusOnDeepSpaceObject(type, data.key);
                }
            };
        }
    }

    // Populate deep space object selectors
    populateDeepSpaceSelectors() {
        const galaxyContainer = document.getElementById('galaxy-buttons');
        const nebulaContainer = document.getElementById('nebula-buttons');
        const blackholeContainer = document.getElementById('blackhole-buttons');

        // Populate galaxies
        if (galaxyContainer && typeof GALAXIES !== 'undefined') {
            Object.entries(GALAXIES).forEach(([key, data]) => {
                const btn = document.createElement('button');
                btn.className = 'deepspace-btn';
                btn.textContent = data.name.split('(')[0].trim(); // Short name
                btn.addEventListener('click', () => {
                    this.solarSystem.focusOnDeepSpaceObject('galaxy', key);
                    this.solarSystem.toggleGalaxies(true);
                });
                galaxyContainer.appendChild(btn);
            });
        }

        // Populate nebulae
        if (nebulaContainer && typeof NEBULAE !== 'undefined') {
            Object.entries(NEBULAE).forEach(([key, data]) => {
                const btn = document.createElement('button');
                btn.className = 'deepspace-btn';
                btn.textContent = data.name.split('(')[0].trim();
                btn.addEventListener('click', () => {
                    this.solarSystem.focusOnDeepSpaceObject('nebula', key);
                    this.solarSystem.toggleNebulae(true);
                });
                nebulaContainer.appendChild(btn);
            });
        }

        // Populate black holes
        if (blackholeContainer && typeof EXOTIC_OBJECTS !== 'undefined') {
            Object.entries(EXOTIC_OBJECTS).forEach(([key, data]) => {
                const btn = document.createElement('button');
                btn.className = 'deepspace-btn';
                btn.textContent = data.name.split('(')[0].trim();
                btn.addEventListener('click', () => {
                    this.solarSystem.focusOnDeepSpaceObject('blackhole', key);
                    this.solarSystem.toggleNebulae(true);
                });
                blackholeContainer.appendChild(btn);
            });
        }
    }

    togglePanel(event) {
        const panelId = event.currentTarget.dataset.panel;
        const panel = document.getElementById(`${panelId}-panel`);
        panel.classList.toggle('collapsed');

        const icon = event.currentTarget.querySelector('i');
        if (panelId === 'left') {
            icon.classList.toggle('fa-chevron-left');
            icon.classList.toggle('fa-chevron-right');
        } else {
            icon.classList.toggle('fa-chevron-right');
            icon.classList.toggle('fa-chevron-left');
        }
    }

    takeScreenshot() {
        const dataUrl = this.solarSystem.takeScreenshot();
        const link = document.createElement('a');
        link.download = `solar-system-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            this.btnFullscreen.querySelector('i').classList.replace('fa-expand', 'fa-compress');
        } else {
            document.exitFullscreen();
            this.btnFullscreen.querySelector('i').classList.replace('fa-compress', 'fa-expand');
        }
    }

    showModal(type) {
        this.closeAllModals();
        const modal = document.getElementById(`${type}-modal`);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Time control methods
    togglePlayPause() {
        const isPlaying = this.solarSystem.togglePlay();
        const icon = this.btnPlayPause.querySelector('i');
        icon.classList.toggle('fa-pause', isPlaying);
        icon.classList.toggle('fa-play', !isPlaying);
    }

    reverseTime() {
        this.isReversed = !this.isReversed;
        this.updateTimeSpeed();
        this.btnReverse.classList.toggle('active', this.isReversed);
    }

    increaseSpeed() {
        if (this.currentSpeedIndex < this.timeSpeedLevels.length - 1) {
            this.currentSpeedIndex++;
            this.updateTimeSpeed();
        }
    }

    decreaseSpeed() {
        if (this.currentSpeedIndex > 0) {
            this.currentSpeedIndex--;
            this.updateTimeSpeed();
        }
    }

    setRealtime() {
        this.currentSpeedIndex = 2; // 1x speed
        this.isReversed = false;
        this.updateTimeSpeed();
        this.btnReverse.classList.remove('active');
    }

    resetTime() {
        this.solarSystem.resetSimulationTime();
        this.setRealtime();
    }

    setSpeedFromSlider(value) {
        const index = parseInt(value) + 3; // Slider range is -3 to 4
        this.currentSpeedIndex = Math.max(0, Math.min(index, this.timeSpeedLevels.length - 1));
        this.updateTimeSpeed();
    }

    updateTimeSpeed() {
        const speed = this.timeSpeedLevels[this.currentSpeedIndex];
        const finalSpeed = this.isReversed ? -speed : speed;
        this.solarSystem.setTimeSpeed(finalSpeed);

        // Update display
        const prefix = this.isReversed ? '-' : '';
        this.timeSpeedDisplay.textContent = `${prefix}${speed}× Speed`;

        // Update slider
        this.timeSpeedSlider.value = this.currentSpeedIndex - 3;
    }

    updateTimeDisplay() {
        const date = this.solarSystem.getSimulationDate();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        this.simulationDate.textContent = date.toLocaleDateString('en-US', options);
    }

    updateFPS() {
        this.fpsCounter.textContent = this.solarSystem.getFPS();
    }

    // Planet info methods
    updatePlanetInfo(data) {
        this.planetInfoPlaceholder.style.display = 'none';
        this.planetDetails.style.display = 'block';

        // Update icon color
        const planetName = data.name.toLowerCase();
        this.selectedPlanetIcon.className = `planet-icon ${planetName}`;

        // Update text content
        this.planetName.textContent = data.name;
        this.planetType.textContent = data.type;

        // Format values based on unit system
        if (this.useImperialUnits) {
            this.planetDiameter.textContent = this.formatNumber(data.diameter * 0.621371) + ' mi';
            this.planetDistance.textContent = this.formatDistance(data.distanceFromSun * 0.621371, 'mi');
            this.planetGravity.textContent = (data.gravity * 3.28084).toFixed(2) + ' ft/s²';
        } else {
            this.planetDiameter.textContent = this.formatNumber(data.diameter) + ' km';
            this.planetDistance.textContent = this.formatDistance(data.distanceFromSun, 'km');
            this.planetGravity.textContent = data.gravity + ' m/s²';
        }

        this.planetMass.textContent = data.mass + ' kg';
        this.planetOrbital.textContent = this.formatOrbitalPeriod(data.orbitalPeriod);
        this.planetMoons.textContent = data.moons;
        this.planetTemp.textContent = data.temperature;
        this.planetDay.textContent = data.dayLength;
        this.planetDescriptionText.textContent = data.description;

        // Reset surface view button state when switching planets
        this.updateSurfaceViewButton(false);
    }

    updateSurfaceViewButton(isActive) {
        if (isActive) {
            this.btnSurfaceView.classList.add('active');
            this.btnSurfaceView.innerHTML = '<i class="fas fa-search-minus"></i> Exit Surface View';
        } else {
            this.btnSurfaceView.classList.remove('active');
            this.btnSurfaceView.innerHTML = '<i class="fas fa-search-plus"></i> Surface View';
        }
    }

    formatNumber(num) {
        return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }

    formatDistance(km, unit) {
        if (km >= 1000000) {
            return (km / 1000000).toFixed(1) + 'M ' + unit;
        } else if (km >= 1000) {
            return (km / 1000).toFixed(1) + 'K ' + unit;
        }
        return this.formatNumber(km) + ' ' + unit;
    }

    formatOrbitalPeriod(days) {
        if (days === 0) return 'N/A';
        if (days < 365) {
            return days + ' days';
        }
        const years = (days / 365.25).toFixed(1);
        return `${years} years (${this.formatNumber(days)} days)`;
    }

    setActivePlanetButton(planetName) {
        this.planetBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.planet === planetName);
        });
    }

    // Tooltip methods
    showTooltip(data, x, y) {
        const tooltip = this.hoverTooltip;
        tooltip.style.display = 'block';

        tooltip.querySelector('.tooltip-name').textContent = data.name;

        const infoElements = tooltip.querySelectorAll('.tooltip-info');
        if (data.distanceFromSun > 0) {
            infoElements[0].textContent = this.formatDistance(data.distanceFromSun, 'km') + ' from Sun';
        } else {
            infoElements[0].textContent = 'Center of Solar System';
        }
        infoElements[1].textContent = `Type: ${data.type}`;

        // Position tooltip
        const padding = 15;
        let left = x + padding;
        let top = y + padding;

        // Keep tooltip on screen
        const rect = tooltip.getBoundingClientRect();
        if (left + rect.width > window.innerWidth) {
            left = x - rect.width - padding;
        }
        if (top + rect.height > window.innerHeight) {
            top = y - rect.height - padding;
        }

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    hideTooltip() {
        this.hoverTooltip.style.display = 'none';
    }

    // Comparison methods
    populateComparisonSelects() {
        const planets = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

        [this.comparePlanet1, this.comparePlanet2].forEach(select => {
            select.innerHTML = '';
            planets.forEach(planet => {
                const option = document.createElement('option');
                option.value = planet;
                option.textContent = PLANET_DATA[planet].name;
                select.appendChild(option);
            });
        });

        this.comparePlanet1.value = 'earth';
        this.comparePlanet2.value = 'mars';
    }

    updateComparison() {
        const planet1 = PLANET_DATA[this.comparePlanet1.value];
        const planet2 = PLANET_DATA[this.comparePlanet2.value];

        if (!planet1 || !planet2) return;

        // Update headers
        this.compareName1.textContent = planet1.name;
        this.compareName2.textContent = planet2.name;

        // Update visual comparison (size ratio)
        const maxSize = Math.max(planet1.diameter, planet2.diameter);
        const size1 = (planet1.diameter / maxSize) * 100;
        const size2 = (planet2.diameter / maxSize) * 100;

        this.compareVisual1.style.width = Math.max(size1, 20) + 'px';
        this.compareVisual1.style.height = Math.max(size1, 20) + 'px';
        this.compareVisual1.className = `comparison-planet planet-icon ${this.comparePlanet1.value}`;

        this.compareVisual2.style.width = Math.max(size2, 20) + 'px';
        this.compareVisual2.style.height = Math.max(size2, 20) + 'px';
        this.compareVisual2.className = `comparison-planet planet-icon ${this.comparePlanet2.value}`;

        // Update table
        this.comparisonTbody.innerHTML = '';

        COMPARISON_PROPERTIES.forEach(prop => {
            const row = document.createElement('tr');

            const val1 = planet1[prop.key];
            const val2 = planet2[prop.key];

            let ratio = '-';
            if (typeof val1 === 'number' && typeof val2 === 'number' && val2 !== 0) {
                ratio = (val1 / val2).toFixed(2) + '×';
            }

            const formatValue = (val) => {
                if (typeof val === 'number') {
                    return this.formatNumber(val) + (prop.unit ? ' ' + prop.unit : '');
                }
                return val || '-';
            };

            row.innerHTML = `
                <td><strong>${prop.label}</strong></td>
                <td>${formatValue(val1)}</td>
                <td>${formatValue(val2)}</td>
                <td>${ratio}</td>
            `;

            this.comparisonTbody.appendChild(row);
        });
    }

    // Keyboard shortcuts
    handleKeyboard(event) {
        // Ignore if typing in input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
            return;
        }

        switch (event.key.toLowerCase()) {
            case ' ':
                event.preventDefault();
                this.togglePlayPause();
                break;
            case 'r':
                this.solarSystem.resetCamera();
                break;
            case 'o':
                this.toggleOrbits.checked = !this.toggleOrbits.checked;
                this.solarSystem.toggleOrbits();
                break;
            case 'l':
                this.toggleLabels.checked = !this.toggleLabels.checked;
                this.solarSystem.toggleLabels();
                break;
            case '+':
            case '=':
                this.increaseSpeed();
                break;
            case '-':
                this.decreaseSpeed();
                break;
            case 'f':
                this.toggleFullscreen();
                break;
            case 'h':
                if (this.helpModal.style.display === 'flex') {
                    this.closeAllModals();
                } else {
                    this.showModal('help');
                }
                break;
            case 'escape':
                this.closeAllModals();
                break;
            case '1':
                this.solarSystem.selectPlanet('sun');
                this.solarSystem.focusOnPlanet('sun');
                break;
            case '2':
                this.solarSystem.selectPlanet('mercury');
                this.solarSystem.focusOnPlanet('mercury');
                break;
            case '3':
                this.solarSystem.selectPlanet('venus');
                this.solarSystem.focusOnPlanet('venus');
                break;
            case '4':
                this.solarSystem.selectPlanet('earth');
                this.solarSystem.focusOnPlanet('earth');
                break;
            case '5':
                this.solarSystem.selectPlanet('mars');
                this.solarSystem.focusOnPlanet('mars');
                break;
            case '6':
                this.solarSystem.selectPlanet('jupiter');
                this.solarSystem.focusOnPlanet('jupiter');
                break;
            case '7':
                this.solarSystem.selectPlanet('saturn');
                this.solarSystem.focusOnPlanet('saturn');
                break;
            case '8':
                this.solarSystem.selectPlanet('uranus');
                this.solarSystem.focusOnPlanet('uranus');
                break;
            case '9':
                this.solarSystem.selectPlanet('neptune');
                this.solarSystem.focusOnPlanet('neptune');
                break;
        }
    }

    // Space Facts functionality
    initSpaceFacts() {
        // Combine all space facts from categories or use fallback
        if (typeof SPACE_FACTS !== 'undefined' && typeof SPACE_FACTS === 'object') {
            this.spaceFacts = [];
            Object.values(SPACE_FACTS).forEach(category => {
                if (Array.isArray(category)) {
                    this.spaceFacts.push(...category);
                }
            });
        }

        // Add more general space facts if we don't have enough
        const generalFacts = [
            "The Sun is so large that about 1.3 million Earths could fit inside it!",
            "A day on Venus is longer than a year on Venus - it takes 243 Earth days to rotate once!",
            "Jupiter's Great Red Spot is a storm that has been raging for at least 400 years.",
            "Saturn's rings are only about 10 meters thick, despite spanning 282,000 km!",
            "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
            "The footprints on the Moon will last for millions of years due to no wind or water.",
            "Neutron stars are so dense that a teaspoon would weigh about 6 billion tons!",
            "There are more stars in the universe than grains of sand on all of Earth's beaches.",
            "The largest known star, UY Scuti, is about 1,700 times the Sun's radius.",
            "Black holes can spin at nearly the speed of light!",
            "Mars has the tallest volcano in the solar system - Olympus Mons is 21 km high!",
            "The International Space Station orbits Earth at about 28,000 km/h!",
            "Voyager 1, launched in 1977, is the farthest human-made object from Earth.",
            "The Andromeda Galaxy is approaching us at 110 km per second!",
            "There may be 40 billion Earth-sized planets in the habitable zones of stars in our galaxy.",
            "A year on Mercury is only 88 Earth days, but a day is 176 Earth days!",
            "Uranus rotates on its side, likely due to a massive collision billions of years ago.",
            "Neptune's moon Triton orbits backwards - the only large moon to do so!",
            "The Hubble Space Telescope has traveled more than 5 billion kilometers in orbit!",
            "Pluto's largest moon, Charon, is so big that both orbit a point in space between them.",
            "One million Earths could fit inside the Sun with room to spare!",
            "Sound cannot travel through space - it's a complete vacuum!",
            "A sunset on Mars appears blue due to the thin atmosphere!",
            "The Milky Way galaxy is about 100,000 light-years across!",
            "There's a giant cloud of alcohol in space - enough for 400 trillion trillion pints!"
        ];

        if (!this.spaceFacts || this.spaceFacts.length === 0) {
            this.spaceFacts = generalFacts;
        } else {
            this.spaceFacts.push(...generalFacts);
        }
        this.spaceFactText = document.getElementById('space-fact-text');
        this.btnNextFact = document.getElementById('btn-next-fact');

        if (this.spaceFactText && this.btnNextFact) {
            // Show initial fact
            this.showRandomFact();

            // Bind button click
            this.btnNextFact.addEventListener('click', () => this.showRandomFact());

            // Auto-rotate facts every 30 seconds
            setInterval(() => this.showRandomFact(), 30000);
        }
    }

    showRandomFact() {
        if (!this.spaceFactText || this.spaceFacts.length === 0) return;

        // Get a random fact (avoid repeating the same one)
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.spaceFacts.length);
        } while (newIndex === this.currentFactIndex && this.spaceFacts.length > 1);

        this.currentFactIndex = newIndex;

        // Animate the text change
        this.spaceFactText.style.opacity = '0';
        setTimeout(() => {
            this.spaceFactText.textContent = this.spaceFacts[this.currentFactIndex];
            this.spaceFactText.style.opacity = '1';
        }, 200);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
