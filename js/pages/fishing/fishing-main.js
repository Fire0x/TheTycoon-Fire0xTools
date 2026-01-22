// fishing/js/fishing-main.js
// Main initialization and time display for fishing management page

// Initialize debug manager
let debug = null;
if (typeof DebugManager !== 'undefined') {
    debug = new DebugManager({
        prefix: '[Fishing Debug]',
        storageKey: 'fishingDebugMode',
        buttonId: 'debugToggleBtn',
        textId: 'debugStatus'
    });
    debug.init();
    window.debug = debug; // Make debug available globally
} else {
    // Fallback if DebugManager not loaded yet
    console.warn('DebugManager not available, initializing without debug support');
}

// Initialize fishing page
function initFishingPage() {
    if (window.debug) window.debug.log('🎣 Initializing fishing management page...');
    
    try {
        // Load data (synchronous localStorage operations)
        window.fishingCore.loadFishingLocations();
        window.fishingCore.loadFishingRewards();
        window.fishingFishCore.loadFishingFish();
        
        // Render UI
        window.fishingUI.renderLocationSelector();
        window.fishingUI.renderAllLocations();
        window.fishingUI.renderAllRewards();
        
        if (window.debug) window.debug.log('✅ Fishing management page initialized');
    } catch (error) {
        console.error('Error initializing fishing page:', error);
        if (window.debug) window.debug.error('❌ Error initializing fishing page:', error);
    }
}

// Time display functions
function updateTimeDisplays() {
    const now = new Date();
    
    // Brisbane time (AEST/AEDT)
    const brisbaneTime = new Date(now.toLocaleString("en-US", {timeZone: "Australia/Brisbane"}));
    const brisbaneTimeStr = brisbaneTime.toLocaleTimeString("en-US", {hour12: false});
    const brisbaneEl = document.getElementById('brisbane-time');
    if (brisbaneEl) brisbaneEl.textContent = brisbaneTimeStr;
    
    // Eastern time (EST/EDT)
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const easternTimeStr = easternTime.toLocaleTimeString("en-US", {hour12: false});
    const easternEl = document.getElementById('eastern-time');
    if (easternEl) easternEl.textContent = easternTimeStr;
    
    // Eastern timezone indicator
    const easternTzEl = document.getElementById('eastern-tz');
    if (easternTzEl) {
        const isDST = easternTime.getTimezoneOffset() < now.getTimezoneOffset();
        easternTzEl.textContent = isDST ? 'EDT' : 'EST';
    }
    
    // Current date
    const dateStr = now.toLocaleDateString("en-US", {month: '2-digit', day: '2-digit', year: 'numeric'});
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.textContent = dateStr;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Wait for core and UI modules to be available
    if (typeof window.fishingCore === 'undefined' || typeof window.fishingUI === 'undefined') {
        setTimeout(initFishingPage, 100);
    } else {
        initFishingPage();
    }
    
    // Initialize time displays
    updateTimeDisplays();
    setInterval(updateTimeDisplays, 1000);
    
    // Listen for tab changes to render all fish when the All Fish tab is shown
    const allFishTab = document.getElementById('allfish-tab');
    if (allFishTab) {
        allFishTab.addEventListener('shown.bs.tab', function() {
            if (window.fishingUI && window.fishingUI.renderAllFish) {
                window.fishingUI.renderAllFish();
            }
        });
    }
});
