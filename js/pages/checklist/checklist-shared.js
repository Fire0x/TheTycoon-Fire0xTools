/**
 * Checklist Shared Module
 * Contains all shared functionality used by both checklist.html and checklist-1.html
 */
(function() {
    'use strict';

    // Check if DebugManager is available
    if (typeof DebugManager === 'undefined') {
        console.error('DebugManager is required but not loaded. Please load js/debug-manager.js first.');
        return;
    }

    // Initialize DebugManager for checklist
    const debugManager = new DebugManager({
        prefix: '[Checklist Debug]',
        storageKey: 'checklist_debug_enabled',
        buttonId: 'debugToggleBtn',
        textId: 'debugToggleText'
    });

    // Expose debug functions globally for backward compatibility
    window.debugLog = function(...args) { debugManager.log(...args); };
    window.debugError = function(...args) { debugManager.error(...args); };
    window.debugWarn = function(...args) { debugManager.warn(...args); };
    window.toggleDebug = function() { debugManager.toggle(); };
    window.initDebugMode = function() { debugManager.init(); };

    // localStorage Configuration Data Structure
    const CONFIG_STORAGE_KEY = 'checklistConfigData';
    const CONFIG_VERSION = '1.0.1';

    // Global state
    let checklistConfigData = null;

    // Track tier summary visibility
    let tierSummaryVisible = JSON.parse(localStorage.getItem('checklistTierSummaryVisible') || '{}');

    // Initialize configuration from localStorage
    async function initializeConfig() {
        const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (saved) {
            try {
                checklistConfigData = JSON.parse(saved);
                if (!checklistConfigData.version) {
                    checklistConfigData.version = CONFIG_VERSION;
                    saveConfigToLocalStorage();
                }
                debugManager.log('✅ Loaded configuration from localStorage');
                if (!debugManager.isEnabled()) console.log('✅ Loaded configuration from localStorage');
                return true;
            } catch (e) {
                debugManager.error('Error parsing saved config:', e);
            }
        }
        
        // No saved config - use default empty config
        checklistConfigData = getDefaultConfig();
        saveConfigToLocalStorage();
        debugManager.log('✅ Created default empty configuration');
        return true;
    }

    // Load configuration from localStorage
    function loadConfigFromLocalStorage() {
        const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (saved) {
            try {
                checklistConfigData = JSON.parse(saved);
                return checklistConfigData;
            } catch (e) {
                debugManager.error('Error loading config:', e);
            }
        }
        return null;
    }

    // Save configuration to localStorage
    function saveConfigToLocalStorage() {
        if (checklistConfigData) {
            checklistConfigData.version = CONFIG_VERSION;
            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(checklistConfigData));
            debugManager.log('✅ Saved configuration to localStorage');
        }
    }

    // Get default empty configuration structure
    function getDefaultConfig() {
        return {
            tiers: [],
            businesses: [],
            products: [],
            productOrder: [], // Array of product IDs in display order
            version: CONFIG_VERSION
        };
    }

    // Get business tiers (all tiers are visible)
    function getBusinessTiers() {
        if (!checklistConfigData || !checklistConfigData.tiers) return [];
        return checklistConfigData.tiers;
    }

    // Utility function: Escape HTML to prevent XSS
    function escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Utility function: Format time for a specific timezone
    function formatTimeForTimezone(date, timezone, options = {}) {
        const defaultOptions = {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        return date.toLocaleString('en-US', { ...defaultOptions, ...options });
    }

    // Utility function: Get Eastern Time zone abbreviation (EDT/EST)
    function getEasternTimeZone() {
        const now = new Date();
        // Create a date in Eastern timezone
        const easternDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        
        // Calculate offset
        const offset = (easternDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
        
        // EDT is UTC-4, EST is UTC-5
        return offset === -4 ? 'EDT' : 'EST';
    }

    // Export functions to global scope
    window.CONFIG_STORAGE_KEY = CONFIG_STORAGE_KEY;
    window.CONFIG_VERSION = CONFIG_VERSION;
    window.checklistConfigData = function() { return checklistConfigData; };
    window.setChecklistConfigData = function(data) { checklistConfigData = data; };
    window.initializeConfig = initializeConfig;
    window.loadConfigFromLocalStorage = loadConfigFromLocalStorage;
    window.saveConfigToLocalStorage = saveConfigToLocalStorage;
    window.getDefaultConfig = getDefaultConfig;
    window.getBusinessTiers = getBusinessTiers;
    window.tierSummaryVisible = tierSummaryVisible;
    window.setTierSummaryVisible = function(visible) { tierSummaryVisible = visible; };
    window.escapeHtml = escapeHtml;
    window.formatTimeForTimezone = formatTimeForTimezone;
    window.getEasternTimeZone = getEasternTimeZone;

    // Export debugManager for use in other modules
    window.checklistDebugManager = debugManager;

})();
