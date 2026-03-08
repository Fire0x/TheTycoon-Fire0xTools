/**
 * Checklist Shared Module
 * Contains all shared functionality used by both checklist.html and checklist-1.html
 */
(function () {
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
    window.debugLog = function (...args) { debugManager.log(...args); };
    window.debugError = function (...args) { debugManager.error(...args); };
    window.debugWarn = function (...args) { debugManager.warn(...args); };
    window.toggleDebug = function () { debugManager.toggle(); };
    window.initDebugMode = function () { debugManager.init(); };

    // localStorage Configuration Data Structure
    const CONFIG_STORAGE_KEY = 'checklistConfigData';
    const TRACKING_STORAGE_KEY = 'checklistProductTracking';
    const CONFIG_VERSION = '1.0.1';

    // Global state
    let checklistConfigData = null;
    let productTrackingData = null;

    // Track tier summary visibility
    let tierSummaryVisible = JSON.parse(localStorage.getItem('checklistTierSummaryVisible') || '{}');

    // Initialize configuration and tracking from localStorage
    async function initializeConfig() {
        const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
        const savedTracking = localStorage.getItem(TRACKING_STORAGE_KEY);

        // Load config
        if (savedConfig) {
            try {
                checklistConfigData = JSON.parse(savedConfig);
                if (!checklistConfigData.version) {
                    checklistConfigData.version = CONFIG_VERSION;
                    saveConfigToLocalStorage();
                }
                debugManager.log('✅ Loaded configuration from localStorage');
            } catch (e) {
                debugManager.error('Error parsing saved config:', e);
            }
        }

        if (!checklistConfigData) {
            checklistConfigData = getDefaultConfig();
            saveConfigToLocalStorage();
            debugManager.log('✅ Created default empty configuration');
        }

        // Load tracking
        if (savedTracking) {
            try {
                productTrackingData = JSON.parse(savedTracking);
                debugManager.log('✅ Loaded product tracking from localStorage');
            } catch (e) {
                debugManager.error('Error parsing saved tracking:', e);
            }
        }

        if (!productTrackingData) {
            productTrackingData = {};
            // Migration: Check if businesses have productIds and move them
            migrateProductTracking();
        }

        return true;
    }

    // Migrate product selections from business objects to unified tracking
    function migrateProductTracking() {
        if (!checklistConfigData || !checklistConfigData.businesses) return;

        let migrated = 0;
        const tiers = getBusinessTiers();

        checklistConfigData.businesses.forEach(biz => {
            if (biz.productId) {
                const tier = tiers.find(t => t.id === biz.tierId);
                const tierName = tier ? tier.name : 'Unknown';

                if (!productTrackingData[tierName]) productTrackingData[tierName] = {};
                if (!productTrackingData[tierName][biz.businessCode]) {
                    productTrackingData[tierName][biz.businessCode] = biz.productId;
                    migrated++;
                }
            }
        });

        if (migrated > 0) {
            debugManager.log(`📦 Migrated ${migrated} product selections to unified tracking`);
            saveTrackingToLocalStorage();
        }
    }

    // Save tracking to localStorage
    function saveTrackingToLocalStorage() {
        if (productTrackingData) {
            localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(productTrackingData));
            debugManager.log('✅ Saved product tracking to localStorage');
        }
    }

    // Get product selection for a business
    function getProductSelection(tierName, businessCode) {
        if (!productTrackingData) return null;
        return productTrackingData[tierName]?.[businessCode] || null;
    }

    // Set product selection for a business
    function setProductSelection(tierName, businessCode, productId) {
        if (!productTrackingData) productTrackingData = {};
        if (!productTrackingData[tierName]) productTrackingData[tierName] = {};

        const parsedId = (productId === null || productId === undefined || productId === '') ? null : parseInt(productId);

        if (parsedId === null) {
            delete productTrackingData[tierName][businessCode];
            if (Object.keys(productTrackingData[tierName]).length === 0) {
                delete productTrackingData[tierName];
            }
        } else {
            productTrackingData[tierName][businessCode] = parsedId;
        }

        saveTrackingToLocalStorage();

        // Sync back to main config for persistence/export
        const tier = getBusinessTiers().find(t => t.name === tierName);
        if (tier && checklistConfigData && checklistConfigData.businesses) {
            const biz = checklistConfigData.businesses.find(b => b.businessCode === businessCode && b.tierId === tier.id);
            if (biz) {
                biz.productId = parsedId;
                saveConfigToLocalStorage();
            }
        }
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

    // Get product name only (without emoji)
    function getProductNameOnly(productId) {
        const full = getProductName(productId);
        if (!full) return null;
        // Simple regex to remove common emojis or just split if there's an emoji at the end
        return full.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
    }

    // Get product emoji only
    function getProductEmoji(productId) {
        const full = getProductName(productId);
        if (!full) return '';
        const match = full.match(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]/gu);
        return match ? match.join(' ') : '';
    }

    // Get product name by ID
    function getProductName(productId) {
        if (!checklistConfigData || !checklistConfigData.products || !productId) return null;
        const product = checklistConfigData.products.find(p => String(p.id) === String(productId));
        return product ? product.product_name || product.productName : null;
    }

    // Get all products for a given tier ID
    function getProductsForTier(tierId) {
        if (!checklistConfigData || !checklistConfigData.products) return [];
        return checklistConfigData.products.filter(p => p.tierId === tierId);
    }

    // Populate all product <select> elements that share a tier name
    function populateProductSelectorsForTierShared(tierName) {
        if (!checklistConfigData) return;
        const tier = (checklistConfigData.tiers || []).find(t => t.name === tierName);
        if (!tier) return;

        const products = getProductsForTier(tier.id);
        const selectors = document.querySelectorAll(`.product-selector[data-tier="${tierName}"]`);

        selectors.forEach(selector => {
            selector.innerHTML = '<option value="">-- Select Product --</option>';
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.productName || product.product_name;
                option.dataset.productName = option.textContent;
                selector.appendChild(option);
            });
        });
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
    window.TRACKING_STORAGE_KEY = TRACKING_STORAGE_KEY;
    window.CONFIG_VERSION = CONFIG_VERSION;
    window.checklistConfigData = function () { return checklistConfigData; };
    window.setChecklistConfigData = function (data) { checklistConfigData = data; };
    window.productTrackingData = function () { return productTrackingData; };
    window.initializeConfig = initializeConfig;
    window.loadConfigFromLocalStorage = loadConfigFromLocalStorage;
    window.saveConfigToLocalStorage = saveConfigToLocalStorage;
    window.saveTrackingToLocalStorage = saveTrackingToLocalStorage;
    window.getProductSelection = getProductSelection;
    window.setProductSelection = setProductSelection;
    window.getDefaultConfig = getDefaultConfig;
    window.getBusinessTiers = getBusinessTiers;
    window.getProductName = getProductName;
    window.getProductNameOnly = getProductNameOnly;
    window.getProductEmoji = getProductEmoji;
    window.getProductsForTier = getProductsForTier;
    window.populateProductSelectorsForTierShared = populateProductSelectorsForTierShared;
    // Also allow checklist-modals.js to override this with its own version (which has better logging)
    if (!window.populateProductSelectorsForTier) {
        window.populateProductSelectorsForTier = populateProductSelectorsForTierShared;
    }
    window.tierSummaryVisible = tierSummaryVisible;
    window.setTierSummaryVisible = function (visible) { tierSummaryVisible = visible; };
    window.escapeHtml = escapeHtml;
    window.formatTimeForTimezone = formatTimeForTimezone;
    window.getEasternTimeZone = getEasternTimeZone;

    // Export debugManager for use in other modules
    window.checklistDebugManager = debugManager;

})();
