/**
 * Logistics Licenses Export/Import Module
 * Modular export/import functionality for license data
 * Supports JSON file download/upload with comprehensive debugging
 */
(function() {
    'use strict';

    /**
     * Export licenses data to JSON file
     * Downloads a JSON file containing all license data
     */
    window.exportLicenses = async function() {
        const debug = window.debug || console;
        
        try {
            debug.log('[LICENSES-EXPORT] === EXPORT LICENSES STARTED ===');
            
            // Check if LogisticsStorage is available
            if (typeof LogisticsStorage === 'undefined') {
                const error = 'LogisticsStorage API not available';
                debug.error(`[LICENSES-EXPORT] ${error}`);
                alert(`Error: ${error}`);
                return;
            }
            
            // Get all licenses from localStorage
            debug.log('[LICENSES-EXPORT] Loading licenses from localStorage...');
            const data = LogisticsStorage.read();
            const licenses = data.licenses || [];
            
            if (licenses.length === 0) {
                debug.warn('[LICENSES-EXPORT] No license data to export');
                alert('No license data to export!');
                return;
            }
            
            debug.log(`[LICENSES-EXPORT] Found ${licenses.length} license/licenses to export`);
            
            // Create export data structure
            const exportData = {
                licenses: licenses,
                export_date: new Date().toISOString(),
                version: '1.0.0',
                total_licenses: licenses.length
            };
            
            debug.log('[LICENSES-EXPORT] Export data structure:', {
                licenses_count: licenses.length,
                export_date: exportData.export_date,
                version: exportData.version
            });
            
            // Convert to JSON string
            const exportJson = JSON.stringify(exportData, null, 2);
            debug.log(`[LICENSES-EXPORT] Generated JSON (${exportJson.length} characters)`);
            
            // Create blob and download
            const blob = new Blob([exportJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `licenses-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            debug.log(`[LICENSES-EXPORT] Successfully exported ${licenses.length} license/licenses`);
            debug.log('[LICENSES-EXPORT] === EXPORT LICENSES COMPLETED ===');
            
            alert(`Successfully exported ${licenses.length} license/licenses!`);
        } catch (error) {
            const errorMsg = `Error exporting licenses: ${error.message}`;
            debug.error('[LICENSES-EXPORT]', error);
            alert(errorMsg);
        }
    };

    /**
     * Import licenses data from JSON file
     * Supports file upload or JSON string input
     * @param {File|string} source - File object or JSON string
     * @param {string} importMode - 'replace' or 'merge' (default: 'merge')
     */
    window.importLicenses = async function(source, importMode) {
        const debug = window.debug || console;
        
        try {
            debug.log('[LICENSES-IMPORT] === IMPORT LICENSES STARTED ===');
            debug.log('[LICENSES-IMPORT] Import mode:', importMode || 'merge (default)');
            
            // Check if LogisticsStorage is available
            if (typeof LogisticsStorage === 'undefined') {
                throw new Error('LogisticsStorage API not available');
            }
            
            let jsonText = '';
            let importData = null;
            
            // Handle file or string input
            if (source instanceof File) {
                debug.log('[LICENSES-IMPORT] Processing file upload:', {
                    name: source.name,
                    size: source.size,
                    type: source.type
                });
                jsonText = await source.text();
            } else if (typeof source === 'string') {
                debug.log('[LICENSES-IMPORT] Processing JSON string input');
                jsonText = source;
            } else {
                throw new Error('Invalid source: expected File or JSON string');
            }
            
            debug.log(`[LICENSES-IMPORT] Parsing JSON (${jsonText.length} characters)...`);
            
            // Parse JSON
            try {
                importData = JSON.parse(jsonText);
            } catch (parseError) {
                debug.error('[LICENSES-IMPORT] JSON parse error:', parseError);
                throw new Error(`Invalid JSON format: ${parseError.message}`);
            }
            
            debug.log('[LICENSES-IMPORT] Parsed JSON structure:', {
                has_licenses: Array.isArray(importData.licenses),
                is_array: Array.isArray(importData),
                has_logistics: !!importData.logistics,
                keys: Object.keys(importData)
            });
            
            // Extract licenses array from various formats
            let licensesToImport = [];
            
            if (Array.isArray(importData)) {
                // Direct array format: [...]
                debug.log('[LICENSES-IMPORT] Detected direct array format');
                licensesToImport = importData;
            } else if (importData.licenses && Array.isArray(importData.licenses)) {
                // Full format: {licenses: [...], ...}
                debug.log('[LICENSES-IMPORT] Detected full format with licenses array');
                licensesToImport = importData.licenses;
            } else if (importData.logistics && importData.logistics.licenses && Array.isArray(importData.logistics.licenses)) {
                // Wrapped format: {logistics: {licenses: [...]}}
                debug.log('[LICENSES-IMPORT] Detected wrapped format (logistics.licenses)');
                licensesToImport = importData.logistics.licenses;
            } else {
                throw new Error('Invalid JSON format. Expected array of licenses or object with licenses array.');
            }
            
            if (licensesToImport.length === 0) {
                debug.warn('[LICENSES-IMPORT] No licenses found in import data');
                alert('No licenses found in import file!');
                return;
            }
            
            debug.log(`[LICENSES-IMPORT] Found ${licensesToImport.length} license/licenses to import`);
            
            // Get import mode (replace or merge)
            const mode = importMode || document.querySelector('input[name="licensesImportMode"]:checked')?.value || 'merge';
            debug.log('[LICENSES-IMPORT] Using import mode:', mode);
            
            let savedCount = 0;
            let updatedCount = 0;
            let skippedCount = 0;
            const errors = [];
            
            // Get current licenses
            const data = LogisticsStorage.read();
            let currentLicenses = data.licenses || [];
            
            // Handle replace mode
            if (mode === 'replace') {
                debug.log('[LICENSES-IMPORT] Replace mode: clearing all existing licenses');
                currentLicenses = [];
            }
            
            // Import licenses
            debug.log('[LICENSES-IMPORT] Starting license import process...');
            for (let i = 0; i < licensesToImport.length; i++) {
                const license = licensesToImport[i];
                
                try {
                    if (!license.id && !license.name) {
                        debug.warn(`[LICENSES-IMPORT] Skipping license at index ${i}: missing id and name`, license);
                        skippedCount++;
                        continue;
                    }
                    
                    const licenseName = license.name || `License ${i + 1}`;
                    debug.log(`[LICENSES-IMPORT] Processing license ${i + 1}/${licensesToImport.length}: ${licenseName}`);
                    
                    // Generate ID if missing
                    if (!license.id) {
                        license.id = 'license-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                        debug.log(`[LICENSES-IMPORT] Generated new ID for license: ${license.id}`);
                    }
                    
                    // Find existing license by ID
                    const existingIndex = currentLicenses.findIndex(l => l.id === license.id);
                    
                    if (existingIndex >= 0 && mode === 'merge') {
                        // Update existing license
                        debug.log(`[LICENSES-IMPORT] Updating existing license: ${licenseName} (${license.id})`);
                        currentLicenses[existingIndex] = {
                            id: license.id,
                            name: license.name || currentLicenses[existingIndex].name,
                            level: license.level !== undefined ? license.level : currentLicenses[existingIndex].level,
                            price: license.price !== undefined ? license.price : currentLicenses[existingIndex].price,
                            purchased: license.purchased !== undefined ? license.purchased : currentLicenses[existingIndex].purchased,
                            display_order: license.display_order !== undefined ? license.display_order : currentLicenses[existingIndex].display_order
                        };
                        updatedCount++;
                    } else {
                        // Add new license
                        debug.log(`[LICENSES-IMPORT] Adding new license: ${licenseName} (${license.id})`);
                        currentLicenses.push({
                            id: license.id,
                            name: license.name || '',
                            level: license.level || 0,
                            price: license.price || 0,
                            purchased: license.purchased || false,
                            display_order: license.display_order !== undefined ? license.display_order : currentLicenses.length
                        });
                        savedCount++;
                    }
                } catch (error) {
                    debug.error(`[LICENSES-IMPORT] Error importing license ${license.name || license.id || 'unknown'}:`, error);
                    errors.push({
                        license: license.name || license.id || 'unknown',
                        error: error.message
                    });
                }
            }
            
            // Save to localStorage
            debug.log('[LICENSES-IMPORT] Saving licenses to localStorage...');
            LogisticsStorage.update(data => {
                data.licenses = currentLicenses;
                return data;
            });
            
            // Re-render licenses
            debug.log('[LICENSES-IMPORT] Re-rendering licenses...');
            if (typeof window.loadLicenses === 'function') {
                await window.loadLicenses();
            }
            if (typeof window.renderLicenses === 'function') {
                await window.renderLicenses();
            }
            
            const totalImported = savedCount + updatedCount;
            debug.log('[LICENSES-IMPORT] Import summary:', {
                total: totalImported,
                saved: savedCount,
                updated: updatedCount,
                skipped: skippedCount,
                errors: errors.length
            });
            
            if (errors.length > 0) {
                debug.warn('[LICENSES-IMPORT] Import completed with errors:', errors);
            }
            
            debug.log('[LICENSES-IMPORT] === IMPORT LICENSES COMPLETED ===');
            
            // Show success message
            let message = `Successfully imported ${totalImported} license/licenses!`;
            if (savedCount > 0) message += ` (${savedCount} new)`;
            if (updatedCount > 0) message += ` (${updatedCount} updated)`;
            if (skippedCount > 0) message += ` (${skippedCount} skipped)`;
            if (errors.length > 0) message += ` (${errors.length} errors)`;
            
            alert(message);
            
            if (errors.length > 0 && window.debug) {
                console.warn('[LICENSES-IMPORT] Import errors:', errors);
            }
        } catch (error) {
            const errorMsg = `Error importing licenses: ${error.message}`;
            debug.error('[LICENSES-IMPORT]', error);
            alert(errorMsg);
        }
    };

    /**
     * Handle file input change event for licenses import
     * @param {Event} event - File input change event
     */
    window.handleLicensesFileImport = function(event) {
        const debug = window.debug || console;
        
        debug.log('[LICENSES-IMPORT] File input changed');
        
        const file = event.target.files[0];
        if (file) {
            debug.log('[LICENSES-IMPORT] File selected:', {
                name: file.name,
                size: file.size,
                type: file.type
            });
            
            // Get import mode
            const importMode = document.querySelector('input[name="licensesImportMode"]:checked')?.value || 'merge';
            
            window.importLicenses(file, importMode);
            
            // Reset file input
            event.target.value = '';
        } else {
            debug.warn('[LICENSES-IMPORT] No file selected');
        }
    };

    /**
     * Import licenses from JSON string (for paste/textarea)
     * @param {string} jsonString - JSON string to import
     * @param {string} importMode - 'replace' or 'merge' (default: 'merge')
     */
    window.importLicensesFromString = async function(jsonString, importMode) {
        if (!jsonString || !jsonString.trim()) {
            if (window.debug) window.debug.warn('[LICENSES-IMPORT] Empty JSON string provided');
            alert('Please provide JSON data to import');
            return;
        }
        
        await window.importLicenses(jsonString.trim(), importMode);
    };

    // Log module initialization
    if (window.debug) {
        window.debug.log('[LICENSES-EXPORT-IMPORT] Module initialized');
    }
})();
