/**
 * Logistics Profile Export/Import Module
 * Modular export/import functionality for company reputation data
 * Supports JSON file download/upload with comprehensive debugging
 */
(function() {
    'use strict';

    /**
     * Export company reputation data to JSON file
     * Downloads a JSON file containing all company data
     */
    window.exportCompanyReputation = async function() {
        const debug = window.debug || console;
        
        try {
            debug.log('[COMPANY-EXPORT] === EXPORT COMPANY REPUTATION STARTED ===');
            
            // Check if LogisticsStorage is available
            if (typeof LogisticsStorage === 'undefined') {
                const error = 'LogisticsStorage API not available';
                debug.error(`[COMPANY-EXPORT] ${error}`);
                alert(`Error: ${error}`);
                return;
            }
            
            // Get all companies from localStorage
            debug.log('[COMPANY-EXPORT] Loading companies from localStorage...');
            const data = LogisticsStorage.read();
            const companies = data.companies || [];
            
            if (companies.length === 0) {
                debug.warn('[COMPANY-EXPORT] No company reputation data to export');
                alert('No company reputation data to export!');
                return;
            }
            
            debug.log(`[COMPANY-EXPORT] Found ${companies.length} company/companies to export`);
            
            // Create export data structure
            const exportData = {
                companies: companies,
                export_date: new Date().toISOString(),
                version: '1.0.0',
                total_companies: companies.length
            };
            
            debug.log('[COMPANY-EXPORT] Export data structure:', {
                companies_count: companies.length,
                export_date: exportData.export_date,
                version: exportData.version
            });
            
            // Convert to JSON string
            const exportJson = JSON.stringify(exportData, null, 2);
            debug.log(`[COMPANY-EXPORT] Generated JSON (${exportJson.length} characters)`);
            
            // Create blob and download
            const blob = new Blob([exportJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `company-reputation-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            debug.log(`[COMPANY-EXPORT] Successfully exported ${companies.length} company/companies`);
            debug.log('[COMPANY-EXPORT] === EXPORT COMPANY REPUTATION COMPLETED ===');
            
            alert(`Successfully exported ${companies.length} company/companies!`);
        } catch (error) {
            const errorMsg = `Error exporting company reputation: ${error.message}`;
            debug.error('[COMPANY-EXPORT]', error);
            alert(errorMsg);
        }
    };

    /**
     * Import company reputation data from JSON file
     * Supports file upload or JSON string input
     * @param {File|string} source - File object or JSON string
     * @param {string} importMode - 'replace' or 'merge' (default: 'merge')
     */
    window.importCompanyReputation = async function(source, importMode) {
        const debug = window.debug || console;
        
        try {
            debug.log('[COMPANY-IMPORT] === IMPORT COMPANY REPUTATION STARTED ===');
            debug.log('[COMPANY-IMPORT] Import mode:', importMode || 'merge (default)');
            
            // Check if LogisticsStorage is available
            if (typeof LogisticsStorage === 'undefined') {
                throw new Error('LogisticsStorage API not available');
            }
            
            let jsonText = '';
            let importData = null;
            
            // Handle file or string input
            if (source instanceof File) {
                debug.log('[COMPANY-IMPORT] Processing file upload:', {
                    name: source.name,
                    size: source.size,
                    type: source.type
                });
                jsonText = await source.text();
            } else if (typeof source === 'string') {
                debug.log('[COMPANY-IMPORT] Processing JSON string input');
                jsonText = source;
            } else {
                throw new Error('Invalid source: expected File or JSON string');
            }
            
            debug.log(`[COMPANY-IMPORT] Parsing JSON (${jsonText.length} characters)...`);
            
            // Parse JSON
            try {
                importData = JSON.parse(jsonText);
            } catch (parseError) {
                debug.error('[COMPANY-IMPORT] JSON parse error:', parseError);
                throw new Error(`Invalid JSON format: ${parseError.message}`);
            }
            
            debug.log('[COMPANY-IMPORT] Parsed JSON structure:', {
                has_companies: Array.isArray(importData.companies),
                is_array: Array.isArray(importData),
                has_logistics: !!importData.logistics,
                keys: Object.keys(importData)
            });
            
            // Extract companies array from various formats
            let companiesToImport = [];
            
            if (Array.isArray(importData)) {
                // Direct array format: [...]
                debug.log('[COMPANY-IMPORT] Detected direct array format');
                companiesToImport = importData;
            } else if (importData.companies && Array.isArray(importData.companies)) {
                // Full format: {companies: [...], ...}
                debug.log('[COMPANY-IMPORT] Detected full format with companies array');
                companiesToImport = importData.companies;
            } else if (importData.logistics && importData.logistics.companies && Array.isArray(importData.logistics.companies)) {
                // Wrapped format: {logistics: {companies: [...]}}
                debug.log('[COMPANY-IMPORT] Detected wrapped format (logistics.companies)');
                companiesToImport = importData.logistics.companies;
            } else {
                throw new Error('Invalid JSON format. Expected array of companies or object with companies array.');
            }
            
            if (companiesToImport.length === 0) {
                debug.warn('[COMPANY-IMPORT] No companies found in import data');
                alert('No companies found in import file!');
                return;
            }
            
            debug.log(`[COMPANY-IMPORT] Found ${companiesToImport.length} company/companies to import`);
            
            // Get import mode (replace or merge)
            const mode = importMode || document.querySelector('input[name="companyRepImportMode"]:checked')?.value || 'merge';
            debug.log('[COMPANY-IMPORT] Using import mode:', mode);
            
            let savedCount = 0;
            let updatedCount = 0;
            let skippedCount = 0;
            const errors = [];
            
            // Handle replace mode
            if (mode === 'replace') {
                debug.log('[COMPANY-IMPORT] Replace mode: clearing all existing companies');
                LogisticsStorage.update(data => {
                    data.companies = [];
                    return data;
                });
            }
            
            // Import companies
            debug.log('[COMPANY-IMPORT] Starting company import process...');
            for (let i = 0; i < companiesToImport.length; i++) {
                const company = companiesToImport[i];
                
                try {
                    if (!company.company_name) {
                        debug.warn(`[COMPANY-IMPORT] Skipping company at index ${i}: missing company_name`, company);
                        skippedCount++;
                        continue;
                    }
                    
                    debug.log(`[COMPANY-IMPORT] Processing company ${i + 1}/${companiesToImport.length}: ${company.company_name}`);
                    
                    const existing = await window.getCompanyRep(company.company_name);
                    
                    if (existing && mode === 'merge') {
                        // Update existing company
                        debug.log(`[COMPANY-IMPORT] Updating existing company: ${company.company_name}`);
                        await window.updateCompanyRep(company.company_name, {
                            motto: company.motto,
                            reputation: company.reputation,
                            total_earnings: company.total_earnings,
                            custom_name: company.custom_name,
                            custom_motto: company.custom_motto,
                            accent_color: company.accent_color
                        });
                        updatedCount++;
                    } else {
                        // Create new company
                        debug.log(`[COMPANY-IMPORT] Creating new company: ${company.company_name}`);
                        await window.createCompanyRep({
                            company_name: company.company_name,
                            motto: company.motto || '',
                            reputation: company.reputation ?? 0,
                            total_earnings: company.total_earnings ?? 0,
                            custom_name: company.custom_name,
                            custom_motto: company.custom_motto,
                            accent_color: company.accent_color
                        });
                        savedCount++;
                    }
                } catch (error) {
                    debug.error(`[COMPANY-IMPORT] Error importing company ${company.company_name || 'unknown'}:`, error);
                    errors.push({
                        company: company.company_name || 'unknown',
                        error: error.message
                    });
                }
            }
            
            // Re-render companies
            debug.log('[COMPANY-IMPORT] Re-rendering company cards...');
            await window.renderCompanyCards();
            if (typeof window.renderCompanyReputationDisplay === 'function') {
                await window.renderCompanyReputationDisplay();
            }
            
            const totalImported = savedCount + updatedCount;
            debug.log('[COMPANY-IMPORT] Import summary:', {
                total: totalImported,
                saved: savedCount,
                updated: updatedCount,
                skipped: skippedCount,
                errors: errors.length
            });
            
            if (errors.length > 0) {
                debug.warn('[COMPANY-IMPORT] Import completed with errors:', errors);
            }
            
            debug.log('[COMPANY-IMPORT] === IMPORT COMPANY REPUTATION COMPLETED ===');
            
            // Show success message
            let message = `Successfully imported ${totalImported} company/companies!`;
            if (savedCount > 0) message += ` (${savedCount} new)`;
            if (updatedCount > 0) message += ` (${updatedCount} updated)`;
            if (skippedCount > 0) message += ` (${skippedCount} skipped)`;
            if (errors.length > 0) message += ` (${errors.length} errors)`;
            
            alert(message);
            
            if (errors.length > 0 && window.debug) {
                console.warn('[COMPANY-IMPORT] Import errors:', errors);
            }
        } catch (error) {
            const errorMsg = `Error importing company reputation: ${error.message}`;
            debug.error('[COMPANY-IMPORT]', error);
            alert(errorMsg);
        }
    };

    /**
     * Handle file input change event for company reputation import
     * @param {Event} event - File input change event
     */
    window.handleCompanyReputationFileImport = function(event) {
        const debug = window.debug || console;
        
        debug.log('[COMPANY-IMPORT] File input changed');
        
        const file = event.target.files[0];
        if (file) {
            debug.log('[COMPANY-IMPORT] File selected:', {
                name: file.name,
                size: file.size,
                type: file.type
            });
            
            // Get import mode
            const importMode = document.querySelector('input[name="companyRepImportMode"]:checked')?.value || 'merge';
            
            window.importCompanyReputation(file, importMode);
            
            // Reset file input
            event.target.value = '';
        } else {
            debug.warn('[COMPANY-IMPORT] No file selected');
        }
    };

    /**
     * Import company reputation from JSON string (for paste/textarea)
     * @param {string} jsonString - JSON string to import
     * @param {string} importMode - 'replace' or 'merge' (default: 'merge')
     */
    window.importCompanyReputationFromString = async function(jsonString, importMode) {
        if (!jsonString || !jsonString.trim()) {
            if (window.debug) window.debug.warn('[COMPANY-IMPORT] Empty JSON string provided');
            alert('Please provide JSON data to import');
            return;
        }
        
        await window.importCompanyReputation(jsonString.trim(), importMode);
    };

    // Log module initialization
    if (window.debug) {
        window.debug.log('[COMPANY-EXPORT-IMPORT] Module initialized');
    }
})();
