/**
 * Import/Export UI Module
 * Contains UI rendering and interaction functions
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.importExportCore === 'undefined') {
        console.error('importExportCore is required but not loaded. Please load import-export-core.js first.');
        return;
    }

    const core = window.importExportCore;
    const debugManager = window.importExportDebugLog ? {
        log: window.importExportDebugLog,
        error: window.importExportDebugError || console.error
    } : { log: () => {}, error: console.error };

    /**
     * Get data summary for a page
     * @param {string} pageName - Page name
     * @param {object} data - Page data
     * @returns {string} Summary string
     */
    function getDataSummary(pageName, data) {
        if (!data) return 'No data';

        try {
            switch (pageName) {
                case 'checklist':
                    const tiers = data.tiers?.length || 0;
                    const businesses = data.businesses?.length || 0;
                    return `${tiers} tier${tiers !== 1 ? 's' : ''}, ${businesses} business${businesses !== 1 ? 'es' : ''}`;
                case 'apartments':
                    const apartments = data.apartments?.length || 0;
                    return `${apartments} apartment${apartments !== 1 ? 's' : ''}`;
                case 'merchants':
                    const merchantCount = Object.keys(data).length;
                    return `${merchantCount} merchant${merchantCount !== 1 ? 's' : ''}`;
                case 'vehicles':
                    const vehicleCount = Object.keys(data).length;
                    return `${vehicleCount} vehicle${vehicleCount !== 1 ? 's' : ''}`;
                case 'education':
                    // Education is stored as an array
                    if (Array.isArray(data)) {
                        return `${data.length} training${data.length !== 1 ? 's' : ''}`;
                    }
                    // Fallback if it's an object
                    const trainingCount = Object.keys(data).length;
                    return `${trainingCount} training${trainingCount !== 1 ? 's' : ''}`;
                case 'fishing':
                    const locations = data.locations?.length || 0;
                    const fish = data.fish?.length || 0;
                    const rewards = data.rewards?.length || 0;
                    return `${locations} location${locations !== 1 ? 's' : ''}, ${fish} fish, ${rewards} reward${rewards !== 1 ? 's' : ''}`;
                case 'logistics':
                    const companies = data.companies?.length || 0;
                    const licenses = data.licenses?.length || 0;
                    const jobs = data.jobs?.length || 0;
                    return `${companies} compan${companies !== 1 ? 'ies' : 'y'}, ${licenses} license${licenses !== 1 ? 's' : ''}, ${jobs} job${jobs !== 1 ? 's' : ''}`;
                default:
                    return 'Data present';
            }
        } catch (e) {
            debugManager.error(`Error getting summary for ${pageName}:`, e);
            return 'Error reading data';
        }
    }

    /**
     * Get last modified timestamp
     * @param {object} data - Page data
     * @returns {string} Formatted timestamp
     */
    function getLastModified(data) {
        if (!data) return 'Never';
        
        try {
            if (data.export_date) {
                return new Date(data.export_date).toLocaleString();
            }
            // Try to find a timestamp in the data
            return 'Unknown';
        } catch (e) {
            return 'Unknown';
        }
    }

    /**
     * Render data status cards
     */
    function renderDataStatus() {
        debugManager.log('=== renderDataStatus START ===');

        const container = document.getElementById('dataStatusCards');
        if (!container) {
            debugManager.error('Data status cards container not found');
            return;
        }

        const pageInfo = {
            checklist: { name: 'Checklist', icon: '📋' },
            apartments: { name: 'Apartments', icon: '🏠' },
            merchants: { name: 'Merchants', icon: '🛒' },
            vehicles: { name: 'Vehicles', icon: '🚚' },
            education: { name: 'Education', icon: '⏱️' },
            fishing: { name: 'Fishing', icon: '🎣' },
            logistics: { name: 'Logistics', icon: '🚚' }
        };

        const hashes = core.calculateAllHashes();
        const storedHashes = core.getStoredHashes();
        const isNew = core.compareHashes();

        container.innerHTML = '';

        // Only show non-excluded pages
        const availablePages = core.getAvailablePages ? core.getAvailablePages() : Object.keys(pageInfo);

        for (const pageName of availablePages) {
            if (!pageInfo[pageName]) continue;
            
            const info = pageInfo[pageName];
            const data = core.getPageData(pageName);
            const summary = getDataSummary(pageName, data);
            const lastModified = getLastModified(data);
            const hash = hashes[pageName];
            const hashDisplay = hash ? hash.substring(0, 8) + '...' : 'N/A';
            const hasNewData = isNew[pageName];

            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4 mb-3';
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">
                            ${info.icon} ${info.name}
                            ${hasNewData ? '<span class="badge bg-warning text-dark ms-2">New Data</span>' : ''}
                        </h5>
                        <p class="card-text mb-2">
                            <strong>Data:</strong> ${summary}<br>
                            <strong>Last Modified:</strong> ${lastModified}<br>
                            <strong>Hash:</strong> <code style="font-size: 0.75rem;">${hashDisplay}</code>
                        </p>
                        <div class="btn-group w-100" role="group">
                            <button class="btn btn-sm btn-outline-primary export-page-btn" data-page="${pageName}">
                                Export
                            </button>
                            <button class="btn btn-sm btn-outline-success import-page-btn" data-page="${pageName}">
                                Import
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        }

        debugManager.log('=== renderDataStatus END ===');
    }

    /**
     * Download JSON as file
     * @param {object} data - Data to download
     * @param {string} filename - Filename
     */
    function downloadJSON(data, filename) {
        debugManager.log(`Downloading ${filename}`);
        
        try {
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            debugManager.log(`Successfully downloaded ${filename}`);
        } catch (error) {
            debugManager.error(`Error downloading ${filename}:`, error);
            alert(`Error downloading file: ${error.message}`);
        }
    }

    /**
     * Show status message
     * @param {string} message - Message text
     * @param {string} type - 'success', 'error', 'info', 'warning'
     */
    function showStatusMessage(message, type = 'info') {
        const container = document.getElementById('statusMessages');
        if (!container) return;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        container.appendChild(alert);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    /**
     * Show format detection indicator
     * @param {object} format - Format detection result
     */
    function showFormatDetection(format) {
        const indicator = document.getElementById('formatDetectionIndicator');
        const formatText = document.getElementById('detectedFormat');
        
        if (indicator && formatText) {
            if (format && format.type !== 'unknown') {
                formatText.textContent = format.description;
                indicator.classList.remove('d-none');
                indicator.classList.remove('alert-danger');
                indicator.classList.add('alert-info');
            } else {
                formatText.textContent = 'Unknown format';
                indicator.classList.remove('d-none');
                indicator.classList.remove('alert-info');
                indicator.classList.add('alert-danger');
            }
        }
    }

    /**
     * Hide format detection indicator
     */
    function hideFormatDetection() {
        const indicator = document.getElementById('formatDetectionIndicator');
        if (indicator) {
            indicator.classList.add('d-none');
        }
    }

    /**
     * Handle file upload
     * @param {File} file - File to read
     * @param {function} callback - Callback with parsed JSON
     */
    function handleFileUpload(file, callback) {
        debugManager.log('Handling file upload:', file.name);

        if (!file.name.endsWith('.json')) {
            showStatusMessage('Please upload a JSON file (.json)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                debugManager.log('File parsed successfully');
                callback(jsonData);
            } catch (error) {
                debugManager.error('Error parsing file:', error);
                showStatusMessage(`Error parsing JSON file: ${error.message}`, 'error');
            }
        };
        reader.onerror = function() {
            debugManager.error('Error reading file');
            showStatusMessage('Error reading file', 'error');
        };
        reader.readAsText(file);
    }

    /**
     * Handle export all (single file)
     */
    function handleExportAll() {
        debugManager.log('=== handleExportAll START ===');
        
        try {
            const exportData = core.exportAllData();
            downloadJSON(exportData, `tycoon-export-all-${new Date().toISOString().split('T')[0]}.json`);
            
            // Update stored hashes
            const hashes = core.calculateAllHashes();
            core.storeHashes(hashes);
            
            showStatusMessage('All data exported successfully!', 'success');
            renderDataStatus();
        } catch (error) {
            debugManager.error('Export all error:', error);
            showStatusMessage(`Error exporting data: ${error.message}`, 'error');
        }
    }

    /**
     * Handle export all (separate files)
     */
    function handleExportAllSeparate() {
        debugManager.log('=== handleExportAllSeparate START ===');
        
        try {
            const pageNames = core.getAvailablePages ? core.getAvailablePages() : ['checklist', 'apartments', 'education', 'fishing', 'logistics'];
            let exported = 0;

            for (const pageName of pageNames) {
                const exportData = core.exportPageData(pageName);
                if (exportData) {
                    downloadJSON(exportData, `${pageName}-export-${new Date().toISOString().split('T')[0]}.json`);
                    exported++;
                }
            }

            // Update stored hashes
            const hashes = core.calculateAllHashes();
            core.storeHashes(hashes);

            showStatusMessage(`Exported ${exported} file(s) successfully!`, 'success');
            renderDataStatus();
        } catch (error) {
            debugManager.error('Export all separate error:', error);
            showStatusMessage(`Error exporting files: ${error.message}`, 'error');
        }
    }

    /**
     * Handle export page
     * @param {string} pageName - Page name
     */
    function handleExportPage(pageName) {
        debugManager.log(`=== handleExportPage START for ${pageName} ===`);
        
        try {
            const exportData = core.exportPageData(pageName);
            if (!exportData) {
                showStatusMessage(`No data to export for ${pageName}`, 'warning');
                return;
            }

            downloadJSON(exportData, `${pageName}-export-${new Date().toISOString().split('T')[0]}.json`);
            
            // Update stored hash for this page
            const hashes = core.getStoredHashes();
            hashes[pageName] = core.calculatePageHash(pageName);
            core.storeHashes(hashes);

            showStatusMessage(`${pageName} data exported successfully!`, 'success');
            renderDataStatus();
        } catch (error) {
            debugManager.error(`Export page error for ${pageName}:`, error);
            showStatusMessage(`Error exporting ${pageName}: ${error.message}`, 'error');
        }
    }

    /**
     * Handle import all with format detection
     */
    function handleImportAll() {
        debugManager.log('=== handleImportAll START ===');

        const textarea = document.getElementById('importTextarea');
        const fileInput = document.getElementById('importFileInput');
        const importMode = document.querySelector('input[name="importMode"]:checked')?.value || 'replace';

        let jsonData = null;

        // Check file input first
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            handleFileUpload(fileInput.files[0], (data) => {
                performImport(data, importMode);
            });
            return;
        }

        // Check textarea
        if (textarea && textarea.value.trim()) {
            try {
                jsonData = JSON.parse(textarea.value.trim());
            } catch (error) {
                debugManager.error('Error parsing textarea JSON:', error);
                showStatusMessage(`Error parsing JSON: ${error.message}`, 'error');
                return;
            }
        }

        if (!jsonData) {
            showStatusMessage('Please provide JSON data (file upload or paste in textarea)', 'warning');
            return;
        }

        performImport(jsonData, importMode);
    }

    /**
     * Perform import operation
     * @param {object} jsonData - JSON data to import
     * @param {string} mode - Import mode
     */
    function performImport(jsonData, mode) {
        debugManager.log('=== performImport START ===', { mode });

        // Detect format
        const format = core.detectImportFormat(jsonData);
        showFormatDetection(format);

        if (format.type === 'unknown') {
            showStatusMessage(`Cannot import: ${format.description}`, 'error');
            return;
        }

        // Import with format detection
        const result = core.importWithFormatDetection(jsonData, mode);

        // Show results
        if (result.errors === 0) {
            let message = `Import successful! `;
            if (result.success > 0) message += `Added: ${result.success}. `;
            if (result.updated > 0) message += `Updated: ${result.updated}. `;
            message += `Format: ${format.description}`;
            showStatusMessage(message, 'success');
        } else {
            let message = `Import completed with errors. `;
            message += result.messages.join(' ');
            showStatusMessage(message, 'warning');
        }

        // Clear inputs
        const textarea = document.getElementById('importTextarea');
        const fileInput = document.getElementById('importFileInput');
        if (textarea) textarea.value = '';
        if (fileInput) fileInput.value = '';
        hideFormatDetection();

        // Refresh status
        renderDataStatus();

        debugManager.log('=== performImport END ===');
    }

    /**
     * Handle import page
     * @param {string} pageName - Page name
     */
    function handleImportPage(pageName) {
        debugManager.log(`=== handleImportPage START for ${pageName} ===`);

        const textarea = document.getElementById('importTextarea');
        const fileInput = document.getElementById('importFileInput');
        const importMode = document.querySelector('input[name="importMode"]:checked')?.value || 'replace';

        let jsonData = null;

        // Check file input first
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            handleFileUpload(fileInput.files[0], (data) => {
                performPageImport(pageName, data, importMode);
            });
            return;
        }

        // Check textarea
        if (textarea && textarea.value.trim()) {
            try {
                jsonData = JSON.parse(textarea.value.trim());
            } catch (error) {
                debugManager.error('Error parsing textarea JSON:', error);
                showStatusMessage(`Error parsing JSON: ${error.message}`, 'error');
                return;
            }
        }

        if (!jsonData) {
            showStatusMessage('Please provide JSON data (file upload or paste in textarea)', 'warning');
            return;
        }

        performPageImport(pageName, jsonData, importMode);
    }

    /**
     * Perform page-specific import
     * @param {string} pageName - Page name
     * @param {object} jsonData - JSON data
     * @param {string} mode - Import mode
     */
    function performPageImport(pageName, jsonData, mode) {
        debugManager.log(`=== performPageImport START for ${pageName} ===`, { mode });

        const result = core.importPageData(pageName, jsonData, mode);

        if (result.errors === 0) {
            let message = `${pageName} import successful! `;
            if (result.success > 0) message += `Added: ${result.success}. `;
            if (result.updated > 0) message += `Updated: ${result.updated}. `;
            showStatusMessage(message, 'success');

            // Update stored hash
            const hashes = core.getStoredHashes();
            hashes[pageName] = core.calculatePageHash(pageName);
            core.storeHashes(hashes);
        } else {
            showStatusMessage(`${pageName} import error: ${result.messages.join(' ')}`, 'error');
        }

        // Clear inputs
        const textarea = document.getElementById('importTextarea');
        const fileInput = document.getElementById('importFileInput');
        if (textarea) textarea.value = '';
        if (fileInput) fileInput.value = '';

        // Refresh status
        renderDataStatus();

        debugManager.log(`=== performPageImport END for ${pageName} ===`);
    }

    /**
     * Handle textarea input for format detection
     */
    function handleTextareaInput() {
        const textarea = document.getElementById('importTextarea');
        if (!textarea) return;

        const text = textarea.value.trim();
        if (!text) {
            hideFormatDetection();
            return;
        }

        try {
            const jsonData = JSON.parse(text);
            const format = core.detectImportFormat(jsonData);
            showFormatDetection(format);
        } catch (error) {
            // Invalid JSON, don't show format detection
            hideFormatDetection();
        }
    }

    // Export functions to global scope
    window.importExportUI = {
        renderDataStatus,
        downloadJSON,
        showStatusMessage,
        showFormatDetection,
        hideFormatDetection,
        handleFileUpload,
        handleExportAll,
        handleExportAllSeparate,
        handleExportPage,
        handleImportAll,
        handleImportPage,
        handleTextareaInput
    };

    debugManager.log('Import/Export UI module loaded');
})();
