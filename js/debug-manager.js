/**
 * Debug Manager - Reusable debug functionality for all pages
 * Supports per-page instances with page-specific prefixes and storage keys
 */
(function() {
    'use strict';

    /**
     * DebugManager class for managing debug mode per page
     * @param {Object} options Configuration options
     * @param {string} options.prefix Debug prefix (e.g., "[Checklist Debug]")
     * @param {string} options.storageKey localStorage key for debug state
     * @param {string} options.buttonId ID of debug toggle button (optional)
     * @param {string} options.textId ID of debug toggle text element (optional)
     */
    class DebugManager {
        constructor(options) {
            if (!options || !options.prefix || !options.storageKey) {
                throw new Error('DebugManager requires prefix and storageKey options');
            }

            this.prefix = options.prefix;
            this.storageKey = options.storageKey;
            this.buttonId = options.buttonId || 'debugToggleBtn';
            this.textId = options.textId || 'debugToggleText';
            this.enabled = false;

            // Initialize from localStorage
            this.init();
        }

        /**
         * Initialize debug mode from localStorage
         */
        init() {
            const stored = localStorage.getItem(this.storageKey);
            this.enabled = stored === 'true';
            this.updateUI();
        }

        /**
         * Toggle debug mode
         */
        toggle() {
            this.enabled = !this.enabled;
            localStorage.setItem(this.storageKey, this.enabled.toString());
            this.updateUI();
            this.log('Debug mode ' + (this.enabled ? 'ENABLED' : 'DISABLED'));
        }

        /**
         * Update debug toggle button UI
         */
        updateUI() {
            const btn = document.getElementById(this.buttonId);
            const text = document.getElementById(this.textId);
            
            if (btn && text) {
                if (this.enabled) {
                    btn.classList.remove('btn-outline-secondary');
                    btn.classList.add('btn-warning');
                    text.textContent = '🔍 Debug: ON';
                } else {
                    btn.classList.remove('btn-warning');
                    btn.classList.add('btn-outline-secondary');
                    text.textContent = '🔍 Debug: OFF';
                }
            }
        }

        /**
         * Debug log (only if enabled)
         * @param {...any} args Arguments to log
         */
        log(...args) {
            if (this.enabled) {
                console.log(this.prefix, ...args);
            }
        }

        /**
         * Debug error (always logs, but with prefix if enabled)
         * @param {...any} args Arguments to log
         */
        error(...args) {
            if (this.enabled) {
                console.error(this.prefix, ...args);
            } else {
                console.error(...args);
            }
        }

        /**
         * Debug warning (only if enabled)
         * @param {...any} args Arguments to log
         */
        warn(...args) {
            if (this.enabled) {
                console.warn(this.prefix, ...args);
            }
        }

        /**
         * Check if debug mode is enabled
         * @returns {boolean}
         */
        isEnabled() {
            return this.enabled;
        }
    }

    // Export DebugManager to global scope
    window.DebugManager = DebugManager;
})();
