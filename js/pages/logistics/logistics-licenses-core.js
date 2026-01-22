// logistics/js/logistics-licenses-core.js
// Core data and constants

// Store licenses data (loaded from LogisticsStorage)
let licenses = [];

// Export for use in other modules
window.licenses = licenses;

// Debug logging for core initialization
if (window.debug) {
    window.debug.log('[LICENSES-CORE] Core module initialized');
}
