/**
 * Logistics Debug Module
 * Provides a DebugManager instance compatible with this repo
 */
(function() {
    'use strict';

    if (typeof DebugManager === 'undefined') {
        console.error('DebugManager is required but not loaded. Please load js/debug-manager.js first.');
        return;
    }

    const debugManager = new DebugManager({
        prefix: '[LOGISTICS DEBUG]',
        storageKey: 'logisticsDebugMode',
        buttonId: 'debugToggleBtn',
        textId: 'debugToggleText'
    });

    window.toggleLogisticsDebug = function() { debugManager.toggle(); };
    window.logisticsDebugManager = debugManager;

    // Update UI when DOM is ready
    function updateDebugUI() {
        const btn = document.getElementById('debugToggleBtn');
        const text = document.getElementById('debugToggleText');
        if (btn && text) {
            debugManager.updateUI();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(updateDebugUI, 100);
        });
    } else {
        setTimeout(updateDebugUI, 100);
    }
})();

