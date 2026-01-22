/**
 * Import/Export Core Module
 * Contains data management, hash generation, format detection, and import/export functions
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof DebugManager === 'undefined') {
        console.error('DebugManager is required but not loaded. Please load js/debug-manager.js first.');
        return;
    }

    // Initialize DebugManager for import/export
    const debugManager = new DebugManager({
        prefix: '[Import/Export Debug]',
        storageKey: 'importExportDebugMode',
        buttonId: 'debugToggleBtn',
        textId: 'debugToggleText'
    });

    // Update UI after DOM is ready (button might not exist yet during module load)
    function updateDebugUI() {
        const btn = document.getElementById('debugToggleBtn');
        const text = document.getElementById('debugToggleText');
        if (btn && text) {
            debugManager.updateUI();
            // Log only if debug is enabled to avoid console spam
            if (debugManager.isEnabled()) {
                console.log('[Import/Export Debug] Debug UI updated');
            }
        } else {
            console.warn('[Import/Export Debug] Debug UI elements not found');
        }
    }
    
    // Update UI when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(updateDebugUI, 100);
        });
    } else {
        // DOM already ready, but wait a bit to ensure button exists
        setTimeout(updateDebugUI, 100);
    }

    // Expose debug functions globally
    window.importExportDebugLog = function(...args) { debugManager.log(...args); };
    window.importExportDebugError = function(...args) { debugManager.error(...args); };
    window.importExportDebugWarn = function(...args) { debugManager.warn(...args); };
    window.toggleImportExportDebug = function() { 
        debugManager.toggle();
        // Update UI after toggle (with small delay to ensure DOM is updated)
        setTimeout(updateDebugUI, 50);
    };
    window.isImportExportDebugEnabled = function() { return debugManager.isEnabled(); };

    // Storage keys for each page
    const STORAGE_KEYS = {
        checklist: 'checklistConfigData',
        apartments: 'apartmentsData',
        merchants: 'traveling_merchants',
        vehicles: 'vehicle_delivery_progress',
        education: 'educationTimers',  // Note: stored as array, not object
        fishing: 'fishingData',
        logistics: 'logisticsData'
    };

    // Excluded pages from import/export (can be toggled)
    // Set to [] to include all pages, or add page names to exclude them
    const EXCLUDED_PAGES = ['merchants', 'vehicles'];
    
    /**
     * Check if a page is excluded
     * @param {string} pageName - Page name
     * @returns {boolean} True if excluded
     */
    function isPageExcluded(pageName) {
        return EXCLUDED_PAGES.includes(pageName);
    }
    
    /**
     * Get all non-excluded page names
     * @returns {Array<string>} Array of page names
     */
    function getAvailablePages() {
        return Object.keys(STORAGE_KEYS).filter(page => !isPageExcluded(page));
    }

    // Hash storage key
    const HASH_STORAGE_KEY = 'importExportHashes';

    /**
     * Generate hash for data using djb2 algorithm
     * @param {string} data - String data to hash
     * @returns {string} Hash string
     */
    function generateHash(data) {
        if (!data) return '';
        const str = typeof data === 'string' ? data : JSON.stringify(data);
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Get data for a specific page
     * @param {string} pageName - Page name (checklist, apartments, merchants, vehicles, education)
     * @returns {object|null} Page data or null if not found
     */
    function getPageData(pageName) {
        const storageKey = STORAGE_KEYS[pageName];
        if (!storageKey) {
            debugManager.error(`Unknown page name: ${pageName}`);
            return null;
        }

        try {
            // Use LogisticsStorage API for logistics page
            if (pageName === 'logistics' && typeof LogisticsStorage !== 'undefined') {
                return LogisticsStorage.read();
            }
            
            const stored = localStorage.getItem(storageKey);
            if (!stored) {
                debugManager.log(`No data found for ${pageName}`);
                return null;
            }
            return JSON.parse(stored);
        } catch (e) {
            debugManager.error(`Error reading ${pageName} data:`, e);
            return null;
        }
    }

    /**
     * Get all page data (excluding excluded pages)
     * @returns {object} Object containing all page data
     */
    function getAllPageData() {
        const data = {};
        for (const [pageName, storageKey] of Object.entries(STORAGE_KEYS)) {
            if (!isPageExcluded(pageName)) {
                data[pageName] = getPageData(pageName);
            }
        }
        return data;
    }

    /**
     * Calculate hash for a page's data
     * @param {string} pageName - Page name
     * @returns {string} Hash string
     */
    function calculatePageHash(pageName) {
        const data = getPageData(pageName);
        return generateHash(data ? JSON.stringify(data) : '');
    }

    /**
     * Calculate hashes for all pages (excluding excluded pages)
     * @returns {object} Object with page names as keys and hashes as values
     */
    function calculateAllHashes() {
        const hashes = {};
        for (const pageName of Object.keys(STORAGE_KEYS)) {
            if (!isPageExcluded(pageName)) {
                hashes[pageName] = calculatePageHash(pageName);
            }
        }
        return hashes;
    }

    /**
     * Get stored hashes from localStorage
     * @returns {object} Stored hashes
     */
    function getStoredHashes() {
        try {
            const stored = localStorage.getItem(HASH_STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            debugManager.error('Error reading stored hashes:', e);
            return {};
        }
    }

    /**
     * Store hashes in localStorage
     * @param {object} hashes - Hashes to store
     */
    function storeHashes(hashes) {
        try {
            localStorage.setItem(HASH_STORAGE_KEY, JSON.stringify(hashes));
            debugManager.log('Stored hashes:', hashes);
        } catch (e) {
            debugManager.error('Error storing hashes:', e);
        }
    }

    /**
     * Compare current hashes with stored hashes (excluding excluded pages)
     * @returns {object} Object with page names as keys and boolean indicating if data is new
     */
    function compareHashes() {
        const currentHashes = calculateAllHashes();
        const storedHashes = getStoredHashes();
        const isNew = {};

        for (const pageName of Object.keys(STORAGE_KEYS)) {
            if (!isPageExcluded(pageName)) {
                const currentHash = currentHashes[pageName];
                const storedHash = storedHashes[pageName];
                isNew[pageName] = currentHash && storedHash && currentHash !== storedHash;
                debugManager.log(`${pageName} hash comparison:`, {
                    current: currentHash,
                    stored: storedHash,
                    isNew: isNew[pageName]
                });
            }
        }

        return isNew;
    }

    /**
     * Detect JSON format
     * @param {object} jsonData - Parsed JSON data
     * @returns {object} Format information { type, page, description }
     */
    function detectImportFormat(jsonData) {
        if (!jsonData || typeof jsonData !== 'object') {
            return { type: 'unknown', page: null, description: 'Invalid or empty data' };
        }

        debugManager.log('Detecting format for data:', Object.keys(jsonData));

        // Check for unified format (has multiple page data types)
        if (jsonData.checklist || jsonData.apartments || jsonData.merchants || jsonData.vehicles || jsonData.education || jsonData.fishing || jsonData.logistics) {
            const pages = [];
            if (jsonData.checklist) pages.push('checklist');
            if (jsonData.apartments) pages.push('apartments');
            if (jsonData.merchants) pages.push('merchants');
            if (jsonData.vehicles) pages.push('vehicles');
            if (jsonData.education) pages.push('education');
            if (jsonData.fishing) pages.push('fishing');
            if (jsonData.logistics) pages.push('logistics');
            
            return {
                type: 'unified',
                page: null,
                pages: pages,
                description: `Unified format containing: ${pages.join(', ')}`
            };
        }

        // Check for checklist format
        if (jsonData.tiers && Array.isArray(jsonData.tiers) && jsonData.businesses && Array.isArray(jsonData.businesses)) {
            return {
                type: 'checklist',
                page: 'checklist',
                description: 'Checklist configuration format'
            };
        }

        // Check for apartment formats
        if (jsonData.apartments && Array.isArray(jsonData.apartments)) {
            if (jsonData.timers && Array.isArray(jsonData.timers) && jsonData.reviews && Array.isArray(jsonData.reviews)) {
                return {
                    type: 'apartment-all',
                    page: 'apartments',
                    description: 'Apartment format (apartments + timers + reviews)'
                };
            }
            return {
                type: 'apartment-only',
                page: 'apartments',
                description: 'Apartment-only format'
            };
        }

        // Check for timer-only format
        if (jsonData.timers && Array.isArray(jsonData.timers) && !jsonData.apartments) {
            return {
                type: 'timer-only',
                page: 'apartments',
                description: 'Apartment timers-only format'
            };
        }

        // Check for review-only format
        if (jsonData.reviews && Array.isArray(jsonData.reviews) && !jsonData.apartments) {
            return {
                type: 'review-only',
                page: 'apartments',
                description: 'Apartment reviews-only format'
            };
        }

        // Check for merchants format (verify structure)
        if (jsonData.merchants && typeof jsonData.merchants === 'object') {
            return {
                type: 'merchants',
                page: 'merchants',
                description: 'Merchants format'
            };
        }

        // Check for vehicles format (verify structure)
        if (jsonData.vehicles && typeof jsonData.vehicles === 'object') {
            return {
                type: 'vehicles',
                page: 'vehicles',
                description: 'Vehicles format'
            };
        }

        // Check for education format (can be array or object with trainings)
        if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].name && jsonData[0].secondsRemaining !== undefined) {
            return {
                type: 'education',
                page: 'education',
                description: 'Education timers format (array)'
            };
        }
        if (jsonData.trainings || (jsonData.length !== undefined && !Array.isArray(jsonData))) {
            return {
                type: 'education',
                page: 'education',
                description: 'Education timers format'
            };
        }

        // Check for fishing format
        if (jsonData.locations && Array.isArray(jsonData.locations) && 
            jsonData.fish && Array.isArray(jsonData.fish) && 
            jsonData.rewards && Array.isArray(jsonData.rewards)) {
            return {
                type: 'fishing',
                page: 'fishing',
                description: 'Fishing format (locations + fish + rewards)'
            };
        }

        // Check for logistics format
        if (jsonData.companies && Array.isArray(jsonData.companies) &&
            jsonData.licenses && Array.isArray(jsonData.licenses) &&
            jsonData.jobs && Array.isArray(jsonData.jobs) &&
            jsonData.config && typeof jsonData.config === 'object') {
            return {
                type: 'logistics',
                page: 'logistics',
                description: 'Logistics format (companies + licenses + jobs + config)'
            };
        }

        return {
            type: 'unknown',
            page: null,
            description: 'Unknown format - cannot detect data type'
        };
    }

    /**
     * Export all data in single file (excluding excluded pages)
     * @returns {object} Export data object
     */
    function exportAllData() {
        debugManager.log('=== exportAllData START ===');
        
        const allData = getAllPageData();
        const hashes = calculateAllHashes();
        
        const exportData = {
            export_date: new Date().toISOString(),
            version: '1.0.0',
            hashes: hashes
        };

        // Only add non-excluded pages
        if (allData.checklist) exportData.checklist = allData.checklist;
        if (allData.apartments) exportData.apartments = allData.apartments;
        if (allData.education) exportData.education = allData.education;
        if (allData.fishing) exportData.fishing = allData.fishing;
        if (allData.logistics) exportData.logistics = allData.logistics;

        debugManager.log('Exported data summary:', {
            checklist: allData.checklist ? 'present' : 'empty',
            apartments: allData.apartments ? 'present' : 'empty',
            merchants: isPageExcluded('merchants') ? 'excluded' : (allData.merchants ? 'present' : 'empty'),
            vehicles: isPageExcluded('vehicles') ? 'excluded' : (allData.vehicles ? 'present' : 'empty'),
            education: allData.education ? 'present' : 'empty',
            fishing: allData.fishing ? 'present' : 'empty',
            logistics: allData.logistics ? 'present' : 'empty'
        });

        debugManager.log('=== exportAllData END ===');
        return exportData;
    }

    /**
     * Export data for a specific page
     * @param {string} pageName - Page name
     * @returns {object|null} Export data or null
     */
    function exportPageData(pageName) {
        debugManager.log(`=== exportPageData START for ${pageName} ===`);
        
        if (isPageExcluded(pageName)) {
            debugManager.warn(`Page ${pageName} is excluded from export`);
            return null;
        }
        
        const data = getPageData(pageName);
        if (!data) {
            debugManager.warn(`No data to export for ${pageName}`);
            return null;
        }

        const hash = calculatePageHash(pageName);
        const exportData = {
            export_date: new Date().toISOString(),
            version: '1.0.0',
            [pageName]: data,
            hash: hash
        };

        debugManager.log(`=== exportPageData END for ${pageName} ===`);
        return exportData;
    }

    /**
     * Import checklist data
     * @param {object} data - Checklist data
     * @param {string} mode - 'replace' or 'merge'
     * @returns {object} Import result
     */
    function importChecklistData(data, mode) {
        debugManager.log('=== importChecklistData START ===', { mode });
        
        const result = { success: 0, errors: 0, messages: [] };

        try {
            if (!data.tiers || !Array.isArray(data.tiers)) {
                throw new Error('Invalid checklist format: tiers array is required');
            }
            if (!data.businesses || !Array.isArray(data.businesses)) {
                throw new Error('Invalid checklist format: businesses array is required');
            }

            if (mode === 'replace') {
                localStorage.setItem(STORAGE_KEYS.checklist, JSON.stringify(data));
                result.success = 1;
                result.messages.push('Checklist data replaced successfully');
            } else {
                // Merge logic could be added here if needed
                localStorage.setItem(STORAGE_KEYS.checklist, JSON.stringify(data));
                result.success = 1;
                result.messages.push('Checklist data merged successfully');
            }

            debugManager.log('Checklist import successful');
        } catch (error) {
            result.errors = 1;
            result.messages.push(`Error: ${error.message}`);
            debugManager.error('Checklist import error:', error);
        }

        debugManager.log('=== importChecklistData END ===');
        return result;
    }

    /**
     * Import apartments data
     * @param {object} data - Apartment data
     * @param {string} mode - 'replace' or 'merge'
     * @returns {object} Import result
     */
    function importApartmentsData(data, mode) {
        debugManager.log('=== importApartmentsData START ===', { mode });
        
        const result = { success: 0, updated: 0, errors: 0, messages: [] };

        try {
            const existingData = getPageData('apartments');
            let apartments = existingData?.apartments || [];

            // Handle apartments array (can be direct or nested)
            let apartmentsToImport = null;
            let versionToUse = existingData?.version || '1.0.1';
            
            if (Array.isArray(data.apartments)) {
                // Direct array
                apartmentsToImport = data.apartments;
            } else if (data.apartments && typeof data.apartments === 'object') {
                // Nested object (from unified export or apartmentsData structure)
                if (Array.isArray(data.apartments.apartments)) {
                    apartmentsToImport = data.apartments.apartments;
                    versionToUse = data.apartments.version || versionToUse;
                } else if (Array.isArray(data.apartments)) {
                    apartmentsToImport = data.apartments;
                }
            } else if (Array.isArray(data) && data.length > 0 && data[0].apartment_name) {
                // Direct array of apartments (legacy format)
                apartmentsToImport = data;
            }

            if (apartmentsToImport) {
                if (mode === 'replace') {
                    apartments = apartmentsToImport;
                    result.success = apartments.length;
                    result.messages.push(`Replaced ${apartments.length} apartments`);
                } else {
                    // Merge: update existing by ID, add new
                    let added = 0;
                    let updated = 0;
                    
                    apartmentsToImport.forEach(apt => {
                        const index = apartments.findIndex(a => a.id === apt.id);
                        if (index !== -1) {
                            apartments[index] = { ...apartments[index], ...apt };
                            updated++;
                        } else {
                            apartments.push(apt);
                            added++;
                        }
                    });
                    
                    result.success = added;
                    result.updated = updated;
                    result.messages.push(`Added ${added} new apartments, updated ${updated} existing`);
                }

                const saveData = {
                    apartments: apartments,
                    version: versionToUse
                };
                localStorage.setItem(STORAGE_KEYS.apartments, JSON.stringify(saveData));
            }

            // Handle timers
            if (data.timers && Array.isArray(data.timers)) {
                // Update timers for existing apartments
                data.timers.forEach(timer => {
                    const apt = apartments.find(a => a.id === timer.apartment_id);
                    if (apt) {
                        if (timer.due_date) apt.due_date = timer.due_date;
                        if (timer.clean_time) apt.clean_time = timer.clean_time;
                    }
                });
                result.messages.push(`Updated timers for ${data.timers.length} apartments`);
            }

            // Handle reviews
            if (data.reviews && Array.isArray(data.reviews)) {
                data.reviews.forEach(review => {
                    const apt = apartments.find(a => a.id === review.apartment_id);
                    if (apt) {
                        if (!apt.reviews) apt.reviews = [];
                        const existingIndex = apt.reviews.findIndex(r => r.id === review.id);
                        if (existingIndex !== -1) {
                            apt.reviews[existingIndex] = review;
                        } else {
                            apt.reviews.push(review);
                        }
                    }
                });
                result.messages.push(`Updated reviews for ${data.reviews.length} apartments`);
            }

            debugManager.log('Apartments import successful');
        } catch (error) {
            result.errors = 1;
            result.messages.push(`Error: ${error.message}`);
            debugManager.error('Apartments import error:', error);
        }

        debugManager.log('=== importApartmentsData END ===');
        return result;
    }

    /**
     * Import merchants data
     * @param {object} data - Merchants data
     * @param {string} mode - 'replace' or 'merge'
     * @returns {object} Import result
     */
    function importMerchantsData(data, mode) {
        debugManager.log('=== importMerchantsData START ===', { mode });
        
        const result = { success: 0, errors: 0, messages: [] };

        try {
            const merchants = data.merchants || data;
            localStorage.setItem(STORAGE_KEYS.merchants, JSON.stringify(merchants));
            result.success = 1;
            result.messages.push('Merchants data imported successfully');
            debugManager.log('Merchants import successful');
        } catch (error) {
            result.errors = 1;
            result.messages.push(`Error: ${error.message}`);
            debugManager.error('Merchants import error:', error);
        }

        debugManager.log('=== importMerchantsData END ===');
        return result;
    }

    /**
     * Import vehicles data
     * @param {object} data - Vehicles data
     * @param {string} mode - 'replace' or 'merge'
     * @returns {object} Import result
     */
    function importVehiclesData(data, mode) {
        debugManager.log('=== importVehiclesData START ===', { mode });
        
        const result = { success: 0, updated: 0, errors: 0, messages: [] };

        try {
            const existingData = getPageData('vehicles') || {};
            const vehicles = data.vehicles || data;

            if (mode === 'replace') {
                localStorage.setItem(STORAGE_KEYS.vehicles, JSON.stringify(vehicles));
                result.success = Object.keys(vehicles).length;
                result.messages.push(`Replaced ${result.success} vehicles`);
            } else {
                // Merge
                const merged = { ...existingData, ...vehicles };
                localStorage.setItem(STORAGE_KEYS.vehicles, JSON.stringify(merged));
                result.success = Object.keys(vehicles).length;
                result.messages.push(`Merged ${result.success} vehicles`);
            }

            debugManager.log('Vehicles import successful');
        } catch (error) {
            result.errors = 1;
            result.messages.push(`Error: ${error.message}`);
            debugManager.error('Vehicles import error:', error);
        }

        debugManager.log('=== importVehiclesData END ===');
        return result;
    }

    /**
     * Import education data
     * @param {object|array} data - Education data (can be array or object)
     * @param {string} mode - 'replace' or 'merge'
     * @returns {object} Import result
     */
    function importEducationData(data, mode) {
        debugManager.log('=== importEducationData START ===', { mode });
        
        const result = { success: 0, errors: 0, messages: [] };

        try {
            let trainings = null;
            
            // Handle different formats
            if (Array.isArray(data)) {
                // Direct array
                trainings = data;
            } else if (data.trainings && Array.isArray(data.trainings)) {
                // Object with trainings array
                trainings = data.trainings;
            } else if (typeof data === 'object') {
                // Try to convert object to array
                trainings = Object.values(data);
            } else {
                throw new Error('Invalid education data format');
            }

            if (mode === 'replace') {
                localStorage.setItem(STORAGE_KEYS.education, JSON.stringify(trainings));
                result.success = trainings.length;
                result.messages.push(`Replaced ${trainings.length} training(s)`);
            } else {
                // Merge: combine with existing
                const existing = getPageData('education') || [];
                const existingMap = new Map(existing.map(t => [t.name?.toLowerCase(), t]));
                
                trainings.forEach(training => {
                    const key = training.name?.toLowerCase();
                    if (key) {
                        existingMap.set(key, training);
                    }
                });
                
                const merged = Array.from(existingMap.values());
                localStorage.setItem(STORAGE_KEYS.education, JSON.stringify(merged));
                result.success = trainings.length;
                result.messages.push(`Merged ${trainings.length} training(s)`);
            }

            debugManager.log('Education import successful');
        } catch (error) {
            result.errors = 1;
            result.messages.push(`Error: ${error.message}`);
            debugManager.error('Education import error:', error);
        }

        debugManager.log('=== importEducationData END ===');
        return result;
    }

    /**
     * Import fishing data
     * @param {object} data - Fishing data
     * @param {string} mode - 'replace' or 'merge'
     * @returns {object} Import result
     */
    function importFishingData(data, mode) {
        debugManager.log('=== importFishingData START ===', { mode });
        
        const result = { success: 0, updated: 0, errors: 0, messages: [] };

        try {
            // Handle fishing data structure
            let fishingDataToImport = null;
            let versionToUse = '1.0.0';
            
            if (data.locations && Array.isArray(data.locations) && 
                data.fish && Array.isArray(data.fish) && 
                data.rewards && Array.isArray(data.rewards)) {
                // Full fishing data structure
                fishingDataToImport = {
                    locations: data.locations,
                    fish: data.fish,
                    rewards: data.rewards,
                    version: data.version || versionToUse
                };
            } else if (data.fishing && typeof data.fishing === 'object') {
                // Nested fishing object
                fishingDataToImport = {
                    locations: data.fishing.locations || [],
                    fish: data.fishing.fish || [],
                    rewards: data.fishing.rewards || [],
                    version: data.fishing.version || versionToUse
                };
            } else {
                throw new Error('Invalid fishing data format');
            }

            const existingData = getPageData('fishing');
            let locations = existingData?.locations || [];
            let fish = existingData?.fish || [];
            let rewards = existingData?.rewards || [];

            if (mode === 'replace') {
                locations = fishingDataToImport.locations;
                fish = fishingDataToImport.fish;
                rewards = fishingDataToImport.rewards;
                result.success = locations.length + fish.length + rewards.length;
                result.messages.push(`Replaced ${locations.length} locations, ${fish.length} fish, ${rewards.length} rewards`);
            } else {
                // Merge: update existing by ID, add new
                let locationsAdded = 0, locationsUpdated = 0;
                let fishAdded = 0, fishUpdated = 0;
                let rewardsAdded = 0, rewardsUpdated = 0;
                
                // Merge locations
                fishingDataToImport.locations.forEach(loc => {
                    const index = locations.findIndex(l => l.id === loc.id);
                    if (index !== -1) {
                        locations[index] = { ...locations[index], ...loc };
                        locationsUpdated++;
                    } else {
                        locations.push(loc);
                        locationsAdded++;
                    }
                });
                
                // Merge fish
                fishingDataToImport.fish.forEach(f => {
                    const index = fish.findIndex(fish => fish.id === f.id);
                    if (index !== -1) {
                        fish[index] = { ...fish[index], ...f };
                        fishUpdated++;
                    } else {
                        fish.push(f);
                        fishAdded++;
                    }
                });
                
                // Merge rewards
                fishingDataToImport.rewards.forEach(rew => {
                    const index = rewards.findIndex(r => r.id === rew.id);
                    if (index !== -1) {
                        rewards[index] = { ...rewards[index], ...rew };
                        rewardsUpdated++;
                    } else {
                        rewards.push(rew);
                        rewardsAdded++;
                    }
                });
                
                result.success = locationsAdded + fishAdded + rewardsAdded;
                result.updated = locationsUpdated + fishUpdated + rewardsUpdated;
                result.messages.push(
                    `Added ${locationsAdded} locations, ${fishAdded} fish, ${rewardsAdded} rewards. ` +
                    `Updated ${locationsUpdated} locations, ${fishUpdated} fish, ${rewardsUpdated} rewards`
                );
            }

            const saveData = {
                locations: locations,
                fish: fish,
                rewards: rewards,
                version: fishingDataToImport.version
            };
            localStorage.setItem(STORAGE_KEYS.fishing, JSON.stringify(saveData));

            debugManager.log('Fishing import successful');
        } catch (error) {
            result.errors = 1;
            result.messages.push(`Error: ${error.message}`);
            debugManager.error('Fishing import error:', error);
        }

        debugManager.log('=== importFishingData END ===');
        return result;
    }

    /**
     * Import logistics data
     * @param {object} data - Logistics data
     * @param {string} mode - 'replace' or 'merge'
     * @returns {object} Import result
     */
    function importLogisticsData(data, mode) {
        debugManager.log('=== importLogisticsData START ===', { mode });

        const result = { success: 0, updated: 0, errors: 0, messages: [] };

        try {
            let logisticsToImport = null;

            if (data.companies && Array.isArray(data.companies) &&
                data.licenses && Array.isArray(data.licenses) &&
                data.jobs && Array.isArray(data.jobs) &&
                data.config && typeof data.config === 'object') {
                logisticsToImport = data;
            } else if (data.logistics && typeof data.logistics === 'object') {
                logisticsToImport = data.logistics;
            } else {
                throw new Error('Invalid logistics data format');
            }

            // Use LogisticsStorage API if available, otherwise fall back to direct localStorage
            if (typeof LogisticsStorage === 'undefined') {
                throw new Error('LogisticsStorage API not available');
            }

            const existing = LogisticsStorage.read();

            if (mode === 'replace') {
                LogisticsStorage.write({
                    companies: logisticsToImport.companies || [],
                    licenses: logisticsToImport.licenses || [],
                    jobs: logisticsToImport.jobs || [],
                    config: logisticsToImport.config || {}
                });

                result.success = (logisticsToImport.companies?.length || 0) +
                    (logisticsToImport.licenses?.length || 0) +
                    (logisticsToImport.jobs?.length || 0);
                result.messages.push('Logistics data replaced successfully');
            } else {
                // Merge by company_name for companies, by id for licenses/jobs
                const merged = {
                    companies: [...(existing.companies || [])],
                    licenses: [...(existing.licenses || [])],
                    jobs: [...(existing.jobs || [])],
                    config: { ...(existing.config || {}) }
                };

                let added = 0;
                let updated = 0;

                // Companies
                (logisticsToImport.companies || []).forEach(c => {
                    const idx = merged.companies.findIndex(x =>
                        (x.company_name || '').toLowerCase() === (c.company_name || '').toLowerCase()
                    );
                    if (idx !== -1) {
                        merged.companies[idx] = { ...merged.companies[idx], ...c };
                        updated++;
                    } else {
                        merged.companies.push(c);
                        added++;
                    }
                });

                // Licenses
                (logisticsToImport.licenses || []).forEach(l => {
                    const idx = merged.licenses.findIndex(x => String(x.id) === String(l.id));
                    if (idx !== -1) {
                        merged.licenses[idx] = { ...merged.licenses[idx], ...l };
                        updated++;
                    } else {
                        merged.licenses.push(l);
                        added++;
                    }
                });

                // Jobs
                (logisticsToImport.jobs || []).forEach(j => {
                    const idx = merged.jobs.findIndex(x => String(x.id) === String(j.id));
                    if (idx !== -1) {
                        merged.jobs[idx] = { ...merged.jobs[idx], ...j };
                        updated++;
                    } else {
                        merged.jobs.push(j);
                        added++;
                    }
                });

                // Config (shallow merge)
                merged.config = { ...merged.config, ...(logisticsToImport.config || {}) };

                LogisticsStorage.write(merged);

                result.success = added;
                result.updated = updated;
                result.messages.push(`Merged logistics: added ${added}, updated ${updated}`);
            }

            debugManager.log('Logistics import successful');
        } catch (error) {
            result.errors = 1;
            result.messages.push(`Error: ${error.message}`);
            debugManager.error('Logistics import error:', error);
        }

        debugManager.log('=== importLogisticsData END ===');
        return result;
    }

    /**
     * Import data for a specific page
     * @param {string} pageName - Page name
     * @param {object} jsonData - JSON data to import
     * @param {string} mode - 'replace' or 'merge'
     * @returns {object} Import result
     */
    function importPageData(pageName, jsonData, mode = 'replace') {
        debugManager.log(`=== importPageData START for ${pageName} ===`, { mode });

        const result = { success: 0, updated: 0, errors: 0, messages: [] };

        if (isPageExcluded(pageName)) {
            result.errors = 1;
            result.messages.push(`${pageName} is excluded from import/export`);
            debugManager.warn(`Page ${pageName} is excluded from import`);
            return result;
        }

        try {
            switch (pageName) {
                case 'checklist':
                    return importChecklistData(jsonData, mode);
                case 'apartments':
                    return importApartmentsData(jsonData, mode);
                case 'merchants':
                    return importMerchantsData(jsonData, mode);
                case 'vehicles':
                    return importVehiclesData(jsonData, mode);
                case 'education':
                    return importEducationData(jsonData, mode);
                case 'fishing':
                    return importFishingData(jsonData, mode);
                case 'logistics':
                    return importLogisticsData(jsonData, mode);
                default:
                    throw new Error(`Unknown page name: ${pageName}`);
            }
        } catch (error) {
            result.errors = 1;
            result.messages.push(`Error: ${error.message}`);
            debugManager.error(`Import error for ${pageName}:`, error);
            return result;
        }
    }

    /**
     * Import all data with format detection
     * @param {object} jsonData - JSON data to import
     * @param {string} mode - 'replace' or 'merge'
     * @returns {object} Import result
     */
    function importWithFormatDetection(jsonData, mode = 'replace') {
        debugManager.log('=== importWithFormatDetection START ===', { mode });

        const format = detectImportFormat(jsonData);
        debugManager.log('Detected format:', format);

        const result = {
            format: format,
            success: 0,
            updated: 0,
            errors: 0,
            messages: [],
            pageResults: {}
        };

        try {
            if (format.type === 'unified') {
                // Import all pages from unified format (excluding excluded pages)
                for (const pageName of format.pages) {
                    if (isPageExcluded(pageName)) {
                        debugManager.log(`Skipping excluded page: ${pageName}`);
                        result.messages.push(`Skipped ${pageName} (excluded from import/export)`);
                        continue;
                    }
                    const pageData = jsonData[pageName];
                    if (pageData) {
                        const pageResult = importPageData(pageName, pageData, mode);
                        result.pageResults[pageName] = pageResult;
                        result.success += pageResult.success || 0;
                        result.updated += pageResult.updated || 0;
                        result.errors += pageResult.errors || 0;
                        result.messages.push(...pageResult.messages);
                    }
                }
            } else if (format.page) {
                // Check if the page is excluded
                if (isPageExcluded(format.page)) {
                    throw new Error(`${format.page} is excluded from import/export`);
                }
                // Import single page
                const pageResult = importPageData(format.page, jsonData, mode);
                result.pageResults[format.page] = pageResult;
                result.success = pageResult.success || 0;
                result.updated = pageResult.updated || 0;
                result.errors = pageResult.errors || 0;
                result.messages = pageResult.messages || [];
            } else {
                throw new Error(`Cannot import: ${format.description}`);
            }

            // Update hashes after successful import
            if (result.errors === 0) {
                const newHashes = calculateAllHashes();
                storeHashes(newHashes);
                debugManager.log('Updated hashes after import');
            }

        } catch (error) {
            result.errors = 1;
            result.messages.push(`Error: ${error.message}`);
            debugManager.error('Import with format detection error:', error);
        }

        debugManager.log('=== importWithFormatDetection END ===');
        return result;
    }

    // Export functions to global scope
    window.importExportCore = {
        getPageData,
        getAllPageData,
        calculatePageHash,
        calculateAllHashes,
        getStoredHashes,
        storeHashes,
        compareHashes,
        detectImportFormat,
        exportAllData,
        exportPageData,
        importPageData,
        importWithFormatDetection,
        generateHash,
        isPageExcluded,
        getAvailablePages
    };

    debugManager.log('Import/Export Core module loaded');
})();
