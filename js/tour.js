/**
 * Solar System Tour Controller
 * Guided tour through the solar system
 */

class TourController {
    constructor(solarSystem, uiController) {
        this.solarSystem = solarSystem;
        this.uiController = uiController;
        this.currentStep = -1;
        this.isActive = false;

        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
    }

    cacheElements() {
        this.modal = document.getElementById('tour-modal');
        this.planetImage = document.getElementById('tour-planet-image');
        this.planetName = document.getElementById('tour-planet-name');
        this.planetText = document.getElementById('tour-planet-text');
        this.progressFill = document.getElementById('tour-progress-fill');
        this.progressText = document.getElementById('tour-progress-text');
        this.btnPrev = document.getElementById('btn-tour-prev');
        this.btnStart = document.getElementById('btn-tour-start');
        this.btnNext = document.getElementById('btn-tour-next');
    }

    bindEvents() {
        this.btnPrev.addEventListener('click', () => this.previousStep());
        this.btnStart.addEventListener('click', () => this.startTour());
        this.btnNext.addEventListener('click', () => this.nextStep());
    }

    reset() {
        this.currentStep = -1;
        this.isActive = false;
        this.updateDisplay();
        this.updateButtons();
    }

    startTour() {
        this.isActive = true;
        this.currentStep = 0;

        // Close modal and start the tour
        this.uiController.closeAllModals();

        // Focus on first target
        this.goToCurrentStep();

        // Show tour UI overlay
        this.showTourOverlay();
    }

    showTourOverlay() {
        // Create or show tour overlay
        let overlay = document.getElementById('tour-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'tour-overlay';
            overlay.innerHTML = `
                <div class="tour-info-box">
                    <div class="tour-step-indicator">
                        <span id="tour-step-current">1</span> / <span id="tour-step-total">${TOUR_STEPS.length}</span>
                    </div>
                    <h3 id="tour-overlay-title">Welcome</h3>
                    <p id="tour-overlay-text">Let's explore the solar system!</p>
                    <div class="tour-nav-buttons">
                        <button id="tour-overlay-prev" class="btn-secondary">
                            <i class="fas fa-chevron-left"></i> Previous
                        </button>
                        <button id="tour-overlay-next" class="btn-primary">
                            Next <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <button id="tour-overlay-close" class="tour-close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            overlay.style.cssText = `
                position: fixed;
                bottom: 120px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 500;
            `;
            document.body.appendChild(overlay);

            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .tour-info-box {
                    background: rgba(15, 15, 35, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 25px 30px;
                    max-width: 500px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    animation: slideUp 0.3s ease;
                }
                
                .tour-step-indicator {
                    font-size: 14px;
                    color: #4a9eff;
                    margin-bottom: 10px;
                }
                
                .tour-info-box h3 {
                    font-size: 1.5rem;
                    margin-bottom: 15px;
                    background: linear-gradient(90deg, #fff, #4a9eff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .tour-info-box p {
                    color: #a0a0c0;
                    line-height: 1.7;
                    margin-bottom: 20px;
                    font-size: 0.95rem;
                }
                
                .tour-nav-buttons {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                }
                
                .tour-nav-buttons button {
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .tour-close-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 30px;
                    height: 30px;
                    border: none;
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                
                .tour-close-btn:hover {
                    background: #ef4444;
                }
            `;
            document.head.appendChild(style);

            // Bind overlay events
            document.getElementById('tour-overlay-prev').addEventListener('click', () => this.previousStep());
            document.getElementById('tour-overlay-next').addEventListener('click', () => this.nextStep());
            document.getElementById('tour-overlay-close').addEventListener('click', () => this.endTour());
        }

        overlay.style.display = 'block';
        this.updateOverlay();
    }

    updateOverlay() {
        const overlay = document.getElementById('tour-overlay');
        if (!overlay) return;

        const step = TOUR_STEPS[this.currentStep];
        if (!step) return;

        document.getElementById('tour-step-current').textContent = this.currentStep + 1;
        document.getElementById('tour-step-total').textContent = TOUR_STEPS.length;
        document.getElementById('tour-overlay-title').textContent = step.title;
        document.getElementById('tour-overlay-text').textContent = step.text;

        // Update button states
        const prevBtn = document.getElementById('tour-overlay-prev');
        const nextBtn = document.getElementById('tour-overlay-next');

        prevBtn.disabled = this.currentStep === 0;
        prevBtn.style.opacity = this.currentStep === 0 ? '0.5' : '1';

        if (this.currentStep === TOUR_STEPS.length - 1) {
            nextBtn.innerHTML = '<i class="fas fa-check"></i> Finish';
        } else {
            nextBtn.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
        }
    }

    hideTourOverlay() {
        const overlay = document.getElementById('tour-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    updateDisplay() {
        if (this.currentStep < 0) {
            // Show welcome screen
            this.planetName.textContent = 'Welcome to the Solar System';
            this.planetText.textContent = 'Embark on a journey through our cosmic neighborhood. You\'ll visit the Sun and all eight planets, learning fascinating facts about each celestial body.';
            this.planetImage.className = 'tour-planet-image';
            this.planetImage.style.background = 'linear-gradient(135deg, #4a9eff, #7c3aed)';
        } else {
            const step = TOUR_STEPS[this.currentStep];
            this.planetName.textContent = step.title;
            this.planetText.textContent = step.text;

            // Update planet image
            if (step.target) {
                this.planetImage.className = `tour-planet-image planet-icon ${step.target}`;
            } else {
                this.planetImage.style.background = 'linear-gradient(135deg, #ffcc00, #ff8c00)';
            }
        }

        // Update progress
        const progress = Math.max(0, (this.currentStep + 1) / TOUR_STEPS.length * 100);
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `${Math.max(0, this.currentStep + 1)} / ${TOUR_STEPS.length}`;
    }

    updateButtons() {
        this.btnPrev.disabled = this.currentStep <= 0;
        this.btnNext.disabled = this.currentStep < 0;

        if (this.currentStep < 0) {
            this.btnStart.style.display = 'inline-flex';
            this.btnStart.innerHTML = '<i class="fas fa-play"></i> Start Tour';
        } else {
            this.btnStart.style.display = 'none';
        }

        if (this.currentStep >= 0 && this.currentStep < TOUR_STEPS.length - 1) {
            this.btnNext.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
        } else if (this.currentStep === TOUR_STEPS.length - 1) {
            this.btnNext.innerHTML = '<i class="fas fa-check"></i> Finish';
        }
    }

    goToCurrentStep() {
        const step = TOUR_STEPS[this.currentStep];
        if (!step) return;

        if (step.target) {
            // Focus on the planet
            this.solarSystem.selectPlanet(step.target);
            this.solarSystem.focusOnPlanet(step.target);
        } else {
            // Reset to overview
            this.solarSystem.resetCamera();
        }
    }

    nextStep() {
        if (this.currentStep < TOUR_STEPS.length - 1) {
            this.currentStep++;
            this.goToCurrentStep();
            this.updateOverlay();
        } else {
            this.endTour();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.goToCurrentStep();
            this.updateOverlay();
        }
    }

    endTour() {
        this.isActive = false;
        this.hideTourOverlay();
        this.solarSystem.resetCamera();

        // Show completion message
        this.showCompletionMessage();
    }

    showCompletionMessage() {
        const message = document.createElement('div');
        message.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(15, 15, 35, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 40px;
                text-align: center;
                z-index: 1000;
                animation: slideUp 0.3s ease;
            ">
                <i class="fas fa-rocket" style="font-size: 3rem; color: #4a9eff; margin-bottom: 20px;"></i>
                <h2 style="margin-bottom: 15px; font-size: 1.5rem;">Tour Complete!</h2>
                <p style="color: #a0a0c0; margin-bottom: 25px;">You've explored all the major bodies in our solar system. Continue exploring on your own!</p>
                <button onclick="this.parentElement.parentElement.remove()" class="btn-primary" style="
                    padding: 12px 30px;
                    border: none;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #4a9eff, #7c3aed);
                    color: white;
                    cursor: pointer;
                    font-size: 1rem;
                ">Continue Exploring</button>
            </div>
        `;
        document.body.appendChild(message);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 5000);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TourController;
}
