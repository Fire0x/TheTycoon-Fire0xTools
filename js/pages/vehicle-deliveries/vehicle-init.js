/**
 * Vehicle Deliveries Initialization Module
 * Contains initialization logic and collapse state management
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.vehicleDebugManager === 'undefined') {
        console.error('vehicle-core.js must be loaded before vehicle-init.js');
        return;
    }

    const debugManager = window.vehicleDebugManager;

    // How to Use Section Collapse State
    const HOW_TO_USE_STORAGE_KEY = 'vehicle_deliveries_how_to_use_expanded';
    
    function initHowToUseCollapse() {
        const stored = localStorage.getItem(HOW_TO_USE_STORAGE_KEY);
        const shouldExpand = stored === null ? true : stored === 'true';
        
        const collapseElement = document.getElementById('howToUseCollapse');
        const toggleIcon = document.getElementById('howToUseToggle');
        const toggleButton = document.querySelector('[data-bs-target="#howToUseCollapse"]');
        
        if (collapseElement) {
            const bsCollapse = new bootstrap.Collapse(collapseElement, {
                toggle: false
            });
            
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
    }

    // Initialize
    window.addEventListener('DOMContentLoaded', function() {
        if (typeof window.initSummaryToggle === 'function') {
            window.initSummaryToggle();
        }
        if (typeof window.initSummaryCardsVisibility === 'function') {
            window.initSummaryCardsVisibility();
        }
        initHowToUseCollapse();
        
        if (typeof window.loadVehicleProgress === 'function') {
            window.loadVehicleProgress();
        }
        if (typeof window.renderVehicleProgress === 'function') {
            window.renderVehicleProgress();
        }
        debugManager.log('Page initialized');
    });

    // Export functions to global scope
    window.initHowToUseCollapse = initHowToUseCollapse;

})();
