/**
 * Merchants Initialization Module
 * Contains initialization logic and collapse state management
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.merchantsDebugManager === 'undefined') {
        console.error('merchants-core.js must be loaded before merchants-init.js');
        return;
    }

    const debugManager = window.merchantsDebugManager;

    // How to Use Section Collapse State
    const HOW_TO_USE_STORAGE_KEY = 'merchants_how_to_use_expanded';
    
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
    function initializePage() {
        initHowToUseCollapse();
        
        if (typeof window.loadFromStorage === 'function') {
            window.loadFromStorage();
        }
        if (typeof window.renderMerchants === 'function') {
            window.renderMerchants();
        }
        if (typeof window.updateAESTTime === 'function') {
            window.updateAESTTime();
            setInterval(window.updateAESTTime, 1000);
        }
        if (typeof window.updateTimers === 'function') {
            window.updateTimers();
            setInterval(window.updateTimers, 1000);
        }
        debugManager.log('Page initialized');
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initializePage);
    } else {
        initializePage();
    }

    // Export functions to global scope
    window.initHowToUseCollapse = initHowToUseCollapse;

})();
