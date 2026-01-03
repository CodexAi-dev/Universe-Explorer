/**
 * Universe Explorer - Main Application Entry Point
 * Space Shuttle Launch Countdown Loading Screen
 */

// Global instances
let solarSystem = null;
let uiController = null;
let tourController = null;

// Loading screen elements
const loadingScreen = document.getElementById('loading-screen');

// Countdown state
let countdownNumber = 9;
let countdownInterval = null;
let isLaunching = false;

// Mission status messages
const missionStatuses = {
    9: 'SYSTEMS CHECK',
    8: 'FUEL PRESSURE NOMINAL',
    7: 'GUIDANCE ONLINE',
    6: 'ENGINES ARMED',
    5: 'FINAL COUNTDOWN',
    4: 'IGNITION SEQUENCE',
    3: 'MAIN ENGINES START',
    2: 'FULL THRUST',
    1: 'ALL SYSTEMS GO',
    0: 'LIFTOFF!'
};

// Start the countdown sequence
function startCountdown() {
    const countdownDisplay = document.querySelector('.countdown-number');
    const countdownStatus = document.querySelector('.countdown-status');
    const progressFill = document.querySelector('.mission-progress-fill');
    const exhaustFlames = document.querySelector('.exhaust-flames');
    const smokeTrail = document.querySelector('.smoke-trail');
    const shuttleContainer = document.querySelector('.shuttle-container');
    const earthScene = document.querySelector('.earth-scene');
    const universeReveal = document.querySelector('.universe-reveal');

    countdownInterval = setInterval(() => {
        console.log('Countdown tick, number:', countdownNumber, 'isLaunching:', isLaunching);

        // Update countdown display
        if (countdownNumber > 0) {
            countdownDisplay.textContent = countdownNumber;
            countdownStatus.textContent = missionStatuses[countdownNumber];

            // Update progress bar (9 to 0 = 0% to 100%)
            const progress = ((9 - countdownNumber) / 9) * 100;
            progressFill.style.width = `${progress}%`;

            // Status color changes
            if (countdownNumber <= 3) {
                countdownStatus.classList.add('warning');
                countdownStatus.classList.remove('go');
            }

            // Start engine flames at T-3
            if (countdownNumber === 3) {
                exhaustFlames.classList.add('active');
                smokeTrail.classList.add('active');
            }

            countdownNumber--;
        } else if (countdownNumber === 0 && !isLaunching) {
            // LIFTOFF!
            console.log('LIFTOFF triggered!');
            isLaunching = true;
            countdownDisplay.textContent = 'LIFTOFF!';
            countdownDisplay.classList.add('liftoff');
            countdownStatus.textContent = 'WE HAVE LIFTOFF!';
            countdownStatus.classList.remove('warning');
            countdownStatus.classList.add('go');
            progressFill.style.width = '100%';

            // Start shuttle launch animation
            shuttleContainer.classList.add('launching');
            earthScene.classList.add('launch-started');

            // After shuttle flies up, reveal universe
            setTimeout(() => {
                console.log('Shuttle flying away...');
                shuttleContainer.classList.add('flying');
                universeReveal.classList.add('visible');
            }, 3500);

            // Hide loading screen after animation
            setTimeout(() => {
                console.log('Hiding loading screen...');
                hideLoadingScreen();
            }, 6000);

            clearInterval(countdownInterval);
        }
    }, 1000);
}

function hideLoadingScreen() {
    console.log('hideLoadingScreen called');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        console.log('Added hidden class to loading screen');
        // Force remove after animation
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingScreen.style.visibility = 'hidden';
            loadingScreen.style.opacity = '0';
            loadingScreen.style.pointerEvents = 'none';
            console.log('Forced loading screen removal');
        }, 1600);
    } else {
        console.error('Loading screen element not found!');
    }
}

// Initialize application
function init() {
    console.log('init() called');

    try {
        // Get canvas container
        const container = document.getElementById('canvas-container');
        console.log('Canvas container:', container);

        if (!container) {
            throw new Error('Canvas container not found!');
        }

        // Create solar system FIRST
        console.log('Creating SolarSystem...');
        solarSystem = new SolarSystem(container);
        console.log('SolarSystem created:', solarSystem);

        // Create UI controller
        console.log('Creating UIController...');
        uiController = new UIController(solarSystem);

        // Create tour controller
        console.log('Creating TourController...');
        tourController = new TourController(solarSystem, uiController);
        window.tourController = tourController; // Make accessible globally

        // Load saved preferences
        loadPreferences();

        // Setup service worker for offline support (if available)
        setupServiceWorker();

        console.log('Universe Explorer initialized successfully!');

        // NOW start the countdown (after app is ready)
        setTimeout(startCountdown, 500);

    } catch (error) {
        console.error('Failed to initialize Universe Explorer:', error);
        console.error('Stack trace:', error.stack);
        // Show error on the loading screen
        const countdownStatus = document.querySelector('.countdown-status');
        const countdownDisplay = document.querySelector('.countdown-number');
        if (countdownStatus) {
            countdownStatus.textContent = 'MISSION ABORT - ' + error.message;
            countdownStatus.style.color = '#ff4444';
        }
        if (countdownDisplay) {
            countdownDisplay.textContent = 'ERROR';
            countdownDisplay.style.color = '#ff4444';
            countdownDisplay.style.fontSize = '3rem';
        }
    }
}

// Load user preferences from localStorage
function loadPreferences() {
    try {
        const prefs = JSON.parse(localStorage.getItem('solarSystemPrefs') || '{}');

        // Apply theme
        if (prefs.theme) {
            document.documentElement.setAttribute('data-theme', prefs.theme);
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === prefs.theme);
            });
        }

        // Apply text size
        if (prefs.textSize) {
            document.documentElement.setAttribute('data-text-size', prefs.textSize);
            document.getElementById('text-size').value = prefs.textSize;
        }

        // Apply high contrast
        if (prefs.highContrast) {
            document.documentElement.setAttribute('data-high-contrast', 'true');
            document.getElementById('toggle-high-contrast').checked = true;
        }

        // Apply quality setting
        if (prefs.quality) {
            document.getElementById('quality-setting').value = prefs.quality;
            if (solarSystem) {
                solarSystem.setQuality(prefs.quality);
            }
        }

    } catch (e) {
        console.log('No saved preferences found');
    }
}

// Save user preferences
function savePreferences() {
    const prefs = {
        theme: document.documentElement.getAttribute('data-theme') || 'space',
        textSize: document.documentElement.getAttribute('data-text-size') || 'medium',
        highContrast: document.documentElement.getAttribute('data-high-contrast') === 'true',
        quality: document.getElementById('quality-setting')?.value || 'medium'
    };

    localStorage.setItem('solarSystemPrefs', JSON.stringify(prefs));
}

// Setup service worker for offline support
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Service worker registration would go here for production
        // navigator.serviceWorker.register('/sw.js');
    }
}

// Save preferences before leaving
window.addEventListener('beforeunload', savePreferences);

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (solarSystem) {
        if (document.hidden) {
            solarSystem.setPlaying(false);
        } else {
            // Resume if it was playing before
            const playBtn = document.getElementById('btn-play-pause');
            if (playBtn && playBtn.querySelector('i').classList.contains('fa-pause')) {
                solarSystem.setPlaying(true);
            }
        }
    }
});

// Handle window errors
window.onerror = function (message, source, lineno, colno, error) {
    console.error('Application error:', message, source, lineno);
    return false;
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for debugging
window.solarSystemApp = {
    getSolarSystem: () => solarSystem,
    getUIController: () => uiController,
    getTourController: () => tourController
};
