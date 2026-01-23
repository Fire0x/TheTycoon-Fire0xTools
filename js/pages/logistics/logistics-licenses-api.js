// logistics/js/logistics-licenses-api.js
// localStorage-based functions for licenses (replaces API calls)
// Version: 2.0.0 - localStorage only, no API calls

// Default licenses to load if localStorage is empty
const DEFAULT_LICENSES = [
    { "id": "license-1", "name": "Hazmat Class 1 (Explosives)", "level": 5, "price": 5000000.00, "purchased": false, "display_order": 0, "parseString": "ADR_1" },
    { "id": "license-2", "name": "Hazmat Class 2 (Gases)", "level": 6, "price": 5500000.00, "purchased": false, "display_order": 1, "parseString": "ADR_2" },
    { "id": "license-3", "name": "Hazmat Class 3 (Flammable Liquids)", "level": 8, "price": 6000000.00, "purchased": false, "display_order": 2, "parseString": "ADR_3" },
    { "id": "license-4", "name": "Hazmat Class 4 (Flammable Solids)", "level": 10, "price": 6500000.00, "purchased": false, "display_order": 3, "parseString": "ADR_4" },
    { "id": "license-5", "name": "Hazmat Class 6 (Toxic)", "level": 12, "price": 7000000.00, "purchased": false, "display_order": 4, "parseString": "ADR_6" },
    { "id": "license-6", "name": "Hazmat Class 8 (Corrosive)", "level": 15, "price": 7500000.00, "purchased": false, "display_order": 5, "parseString": "ADR_8" },
    { "id": "license-7", "name": "Heavy Cargo", "level": 18, "price": 9000000.00, "purchased": false, "display_order": 6, "parseString": "HEAVY" },
    { "id": "license-8", "name": "High Value Cargo", "level": 20, "price": 10000000.00, "purchased": false, "display_order": 7, "parseString": "HIGH_VALUE" }
];

// Load licenses from localStorage
window.loadLicenses = async function() {
    if (window.debug) window.debug.log('[LICENSES-API] Loading licenses from localStorage...');
    
    try {
        if (typeof LogisticsStorage === 'undefined') {
            if (window.debug) window.debug.error('[LICENSES-API] LogisticsStorage API not available');
            window.licenses = [];
            if (typeof window.renderLicenses === 'function') {
                window.renderLicenses();
            }
            return;
        }
        
        const data = LogisticsStorage.read();
        window.licenses = data.licenses || [];
        
        // Ensure licenses have IDs (for backward compatibility)
        window.licenses = window.licenses.map((license, index) => {
            if (!license.id) {
                license.id = 'license-' + Date.now() + '-' + index;
            }
            return license;
        });
        
        // If no licenses exist, load defaults and save them
        if (window.licenses.length === 0) {
            if (window.debug) window.debug.log('[LICENSES-API] No licenses found in localStorage, loading default licenses...');
            window.licenses = JSON.parse(JSON.stringify(DEFAULT_LICENSES)); // Deep copy
            
            // Save defaults to localStorage
            LogisticsStorage.update(data => {
                data.licenses = window.licenses;
                return data;
            });
            
            if (window.debug) window.debug.log(`[LICENSES-API] Loaded ${window.licenses.length} default license(s) and saved to localStorage`);
        } else {
            if (window.debug) window.debug.log(`[LICENSES-API] Loaded ${window.licenses.length} license(s) from localStorage`);
        }
        
        if (typeof window.renderLicenses === 'function') {
            window.renderLicenses();
        }
    } catch (error) {
        if (window.debug) window.debug.error('[LICENSES-API] Error loading licenses:', error);
        window.licenses = [];
        const tbody = document.getElementById('licensesBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading licenses</td></tr>';
        }
    }
};

// Save all licenses to localStorage
window.saveLicenses = async function() {
    const statusEl = document.getElementById('licensesStatus');
    if (statusEl) {
        statusEl.textContent = 'Saving...';
        statusEl.className = 'ms-3 text-info';
    }

    if (window.debug) window.debug.log('[LICENSES-API] === SAVE LICENSES STARTED ===');
    if (window.debug) window.debug.log(`[LICENSES-API] Total licenses to process: ${window.licenses.length}`);

    try {
        if (typeof LogisticsStorage === 'undefined') {
            throw new Error('LogisticsStorage API not available');
        }

        const skipped = [];
        const licensesToSave = [];

        // Process all licenses
        for (const license of window.licenses) {
            if (window.debug) window.debug.log(`[LICENSES-API] Processing license ID: ${license.id}, Name: ${license.name}`);
            
            const name = window.getLicenseValue(license.id, 'name-input');
            
            // Skip if name is empty
            if (!name || !name.trim()) {
                skipped.push({ id: license.id, reason: 'Name is required' });
                if (window.debug) window.debug.warn(`[LICENSES-API] Skipping license ${license.id}: Name is required`);
                continue;
            }
            
            // Build license object
            const licenseData = {
                id: license.id.toString().startsWith('new-') 
                    ? 'license-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
                    : license.id,
                name: name.trim(),
                level: parseInt(window.getLicenseValue(license.id, 'level-input')) || 0,
                price: parseFloat(window.getLicenseValue(license.id, 'price-input')) || 0,
                purchased: document.querySelector(`input[data-id="${license.id}"][data-field="purchased"]`)?.checked || false,
                display_order: license.display_order !== undefined ? license.display_order : licensesToSave.length,
                parseString: window.getLicenseValue(license.id, 'parseString-input') || ''
            };
            
            licensesToSave.push(licenseData);
        }
        
        // Show warning if any licenses were skipped
        if (skipped.length > 0) {
            const skippedNames = skipped.map(s => s.id).join(', ');
            if (window.debug) window.debug.warn(`[LICENSES-API] Skipped ${skipped.length} license(s) with empty names: ${skippedNames}`);
            alert(`Warning: ${skipped.length} license(s) were skipped because they have no name. Please enter a name for all licenses.`);
        }

        if (licensesToSave.length === 0) {
            if (statusEl) {
                statusEl.textContent = '⚠️ No licenses to save (all have empty names)';
                statusEl.className = 'ms-3 text-warning';
            }
            if (window.debug) window.debug.warn('[LICENSES-API] No licenses to save');
            return;
        }
        
        // Save to localStorage
        LogisticsStorage.update(data => {
            data.licenses = licensesToSave;
            return data;
        });
        
        // Update window.licenses to match saved data
        window.licenses = licensesToSave;
        
        // Re-render licenses
        if (typeof window.renderLicenses === 'function') {
            window.renderLicenses();
        }

        if (statusEl) {
            const successMsg = skipped.length > 0 
                ? `✅ Saved ${licensesToSave.length} license(s) (${skipped.length} skipped)` 
                : '✅ Saved successfully!';
            statusEl.textContent = successMsg;
            statusEl.className = 'ms-3 text-success';
            setTimeout(() => {
                statusEl.textContent = '';
            }, 3000);
        }

        if (window.debug) window.debug.log(`[LICENSES-API] === SAVE LICENSES COMPLETED === (Saved: ${licensesToSave.length}, Skipped: ${skipped.length})`);
    } catch (error) {
        if (window.debug) window.debug.error('[LICENSES-API] Error saving licenses:', error);
        if (statusEl) {
            statusEl.textContent = '❌ Error saving licenses';
            statusEl.className = 'ms-3 text-danger';
        }
        alert(`Error saving licenses: ${error.message}`);
    }
};

// Delete license from localStorage
window.deleteLicense = async function(id) {
    if (window.debug) window.debug.log(`[LICENSES-API] Deleting license ID: ${id}`);
    
    // Don't delete if it's a new item (just remove from array)
    if (id && id.toString().startsWith('new-')) {
        window.licenses = window.licenses.filter(license => license.id !== id);
        if (typeof window.renderLicenses === 'function') {
            window.renderLicenses();
        }
        if (window.debug) window.debug.log(`[LICENSES-API] Removed new license ${id} from local array`);
        return;
    }
    
    if (!confirm('Are you sure you want to delete this license?')) {
        return;
    }

    try {
        if (typeof LogisticsStorage === 'undefined') {
            throw new Error('LogisticsStorage API not available');
        }
        
        // Remove from localStorage
        LogisticsStorage.update(data => {
            data.licenses = (data.licenses || []).filter(license => license.id !== id);
            return data;
        });
        
        // Remove from local array
        window.licenses = window.licenses.filter(license => license.id !== id);
        
        // Re-render
        if (typeof window.renderLicenses === 'function') {
            window.renderLicenses();
        }
        
        if (window.debug) window.debug.log(`[LICENSES-API] License ${id} deleted successfully`);
    } catch (error) {
        if (window.debug) window.debug.error('[LICENSES-API] Error deleting license:', error);
        alert(`Error deleting license: ${error.message}`);
    }
};

// Helper function to get value from input field
window.getLicenseValue = function(licenseId, className) {
    const input = document.querySelector(`.${className}[data-id="${licenseId}"]`);
    if (!input) return '';
    if (input.type === 'checkbox') {
        return input.checked ? 'true' : 'false';
    }
    const value = input.value || '';
    // If it's a price input, parse the formatted number
    if (className === 'price-input') {
        if (window.NumberFormatter && typeof window.NumberFormatter.parseFormattedNumber === 'function') {
            const num = window.NumberFormatter.parseFormattedNumber(value);
            return num.toString();
        } else {
            // Fallback: remove commas and parse
            const cleaned = String(value).replace(/,/g, '');
            const num = parseFloat(cleaned);
            return isNaN(num) ? '' : num.toString();
        }
    }
    return value;
};

// Add new license
window.addLicense = function() {
    if (window.debug) window.debug.log('[LICENSES-API] Adding new license');
    
    const newId = 'new-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const newLicense = {
        id: newId,
        name: '',
        level: 0,
        price: 0,
        purchased: false,
        display_order: window.licenses.length,
        parseString: ''
    };
    
    window.licenses.push(newLicense);
    
    if (typeof window.renderLicenses === 'function') {
        window.renderLicenses();
    }
    
    if (window.debug) window.debug.log(`[LICENSES-API] Added new license with ID: ${newId}`);
};
