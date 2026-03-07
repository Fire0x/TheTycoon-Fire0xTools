/**
 * Vehicle Deliveries Initialization Module
 * Contains initialization logic and collapse state management
 */
(function () {
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

            collapseElement.addEventListener('shown.bs.collapse', function () {
                localStorage.setItem(HOW_TO_USE_STORAGE_KEY, 'true');
                if (toggleIcon) toggleIcon.textContent = '▼';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
            });

            collapseElement.addEventListener('hidden.bs.collapse', function () {
                localStorage.setItem(HOW_TO_USE_STORAGE_KEY, 'false');
                if (toggleIcon) toggleIcon.textContent = '▶';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
            });
        }
    }

    // Import Progress Section Collapse State
    const IMPORT_PROGRESS_STORAGE_KEY = 'vehicle_deliveries_import_expanded';

    function initImportProgressCollapse() {
        const stored = localStorage.getItem(IMPORT_PROGRESS_STORAGE_KEY);
        const shouldExpand = stored === null ? true : stored === 'true';

        const collapseElement = document.getElementById('importProgressCollapse');
        const toggleIcon = document.getElementById('importProgressToggle');
        const toggleButton = document.querySelector('[data-bs-target="#importProgressCollapse"]');

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

            collapseElement.addEventListener('shown.bs.collapse', function () {
                localStorage.setItem(IMPORT_PROGRESS_STORAGE_KEY, 'true');
                if (toggleIcon) toggleIcon.textContent = '▼';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
            });

            collapseElement.addEventListener('hidden.bs.collapse', function () {
                localStorage.setItem(IMPORT_PROGRESS_STORAGE_KEY, 'false');
                if (toggleIcon) toggleIcon.textContent = '▶';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
            });
        }
    }

    // Summary Statistics Section Collapse State
    const SUMMARY_STATS_STORAGE_KEY = 'vehicle_deliveries_summary_expanded';

    function initSummaryStatisticsCollapse() {
        const stored = localStorage.getItem(SUMMARY_STATS_STORAGE_KEY);
        const shouldExpand = stored === null ? true : stored === 'true';

        const collapseElement = document.getElementById('summaryStatisticsCollapse');
        const toggleIcon = document.getElementById('summaryStatisticsToggle');
        const toggleButton = document.querySelector('[data-bs-target="#summaryStatisticsCollapse"]');

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

            collapseElement.addEventListener('shown.bs.collapse', function () {
                localStorage.setItem(SUMMARY_STATS_STORAGE_KEY, 'true');
                if (toggleIcon) toggleIcon.textContent = '▼';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
            });

            collapseElement.addEventListener('hidden.bs.collapse', function () {
                localStorage.setItem(SUMMARY_STATS_STORAGE_KEY, 'false');
                if (toggleIcon) toggleIcon.textContent = '▶';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
            });
        }
    }

    // Initialize
    window.addEventListener('DOMContentLoaded', function () {
        initHowToUseCollapse();
        initImportProgressCollapse();
        initSummaryStatisticsCollapse();

        if (typeof window.initSummaryToggle === 'function') {
            window.initSummaryToggle();
        }
        if (typeof window.initSummaryCardsVisibility === 'function') {
            window.initSummaryCardsVisibility();
        }
        initHowToUseCollapse();

        // Load data
        if (typeof window.loadVehicleProgress === 'function') {
            window.loadVehicleProgress();
        }
        if (typeof window.loadEventVehicles === 'function') {
            window.loadEventVehicles();
        }
        if (typeof window.loadNormalVehicles === 'function') {
            window.loadNormalVehicles();
        }

        // Render data
        if (typeof window.renderVehicleProgress === 'function') {
            window.renderVehicleProgress();
        }
        if (typeof window.renderEventVehicles === 'function') {
            window.renderEventVehicles();
        }
        if (typeof window.renderNormalVehicles === 'function') {
            window.renderNormalVehicles();
        }

        // Event Listeners
        const addEventBtn = document.getElementById('addEventVehicleBtn');
        if (addEventBtn && typeof window.addEventVehicle === 'function') {
            addEventBtn.addEventListener('click', window.addEventVehicle);
        }

        const addNormalBtn = document.getElementById('addNormalVehicleBtn');
        if (addNormalBtn && typeof window.showAddNormalVehicleModal === 'function') {
            addNormalBtn.addEventListener('click', window.showAddNormalVehicleModal);
        }

        const saveNormalBtn = document.getElementById('saveNormalVehicleBtn');
        if (saveNormalBtn && typeof window.addNormalVehicleFromModal === 'function') {
            saveNormalBtn.addEventListener('click', window.addNormalVehicleFromModal);
        }

        const toggleEventViewBtn = document.getElementById('toggleEventViewBtn');
        if (toggleEventViewBtn && typeof window.toggleViewMode === 'function') {
            toggleEventViewBtn.addEventListener('click', () => window.toggleViewMode('eventVehicles'));
        }

        const toggleNormalViewBtn = document.getElementById('toggleNormalViewBtn');
        if (toggleNormalViewBtn && typeof window.toggleViewMode === 'function') {
            toggleNormalViewBtn.addEventListener('click', () => window.toggleViewMode('normalVehicles'));
        }

        const hideUnlockedToggle = document.getElementById('hideUnlockedToggle');
        if (hideUnlockedToggle && typeof window.renderVehicleProgress === 'function') {
            hideUnlockedToggle.addEventListener('change', window.renderVehicleProgress);
        }

        // Start live local time clock
        function updateLocalTime() {
            const el = document.getElementById('aestTime');
            if (el) {
                const now = new Date();
                el.textContent = now.toLocaleTimeString();
            }
        }
        updateLocalTime();
        setInterval(updateLocalTime, 1000);

        debugManager.log('Page initialized');
    });

    // Export functions to global scope
    window.initHowToUseCollapse = initHowToUseCollapse;

})();
