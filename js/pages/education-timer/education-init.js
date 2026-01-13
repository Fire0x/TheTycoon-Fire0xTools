/**
 * Education Timer Initialization Module
 * Contains initialization logic and collapse state management
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.educationDebugManager === 'undefined') {
        console.error('education-core.js must be loaded before education-init.js');
        return;
    }

    const debugManager = window.educationDebugManager;

    // How to Use Section Collapse State
    const HOW_TO_USE_STORAGE_KEY = 'education_timer_how_to_use_expanded';
    
    function initHowToUseCollapse() {
        if (typeof bootstrap === 'undefined') {
            console.warn('Bootstrap not available yet, retrying...');
            setTimeout(initHowToUseCollapse, 100);
            return;
        }
        
        const stored = localStorage.getItem(HOW_TO_USE_STORAGE_KEY);
        const shouldExpand = stored === null ? true : stored === 'true';
        
        const collapseElement = document.getElementById('howToUseCollapse');
        const toggleIcon = document.getElementById('howToUseToggle');
        const toggleButton = document.querySelector('[data-bs-target="#howToUseCollapse"]');
        
        if (!collapseElement) {
            console.warn('Collapse element not found');
            return;
        }
        
        let bsCollapse = bootstrap.Collapse.getInstance(collapseElement);
        if (!bsCollapse) {
            bsCollapse = new bootstrap.Collapse(collapseElement, {
                toggle: false
            });
        }
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(HOW_TO_USE_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(HOW_TO_USE_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }

    // Initialize
    function initializePage() {
        if (typeof bootstrap === 'undefined') {
            setTimeout(initializePage, 50);
            return;
        }
        initHowToUseCollapse();
        debugManager.log('Page initialized');
        
        if (typeof window.loadFromLocalStorage === 'function') {
            window.loadFromLocalStorage();
        }
        if (typeof window.updateAESTTime === 'function') {
            window.updateAESTTime();
            setInterval(window.updateAESTTime, 1000);
        }
        if (typeof window.updateTimers === 'function') {
            window.updateTimers();
            setInterval(window.updateTimers, 1000);
        }
        
        // Auto-save timers periodically (every 30 seconds)
        setInterval(() => {
            const trainings = window.trainings || {};
            if (Object.keys(trainings).length > 0) {
                if (typeof window.saveToLocalStorage === 'function') {
                    window.saveToLocalStorage();
                }
            }
        }, 30000);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initializePage();
        });
    } else {
        initializePage();
    }

    // Export functions to global scope
    window.initHowToUseCollapse = initHowToUseCollapse;

})();
