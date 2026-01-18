/**
 * Import/Export Init Module
 * Page initialization and event listeners
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.importExportCore === 'undefined') {
        console.error('importExportCore is required but not loaded. Please load import-export-core.js first.');
        return;
    }

    if (typeof window.importExportUI === 'undefined') {
        console.error('importExportUI is required but not loaded. Please load import-export-ui.js first.');
        return;
    }

    const core = window.importExportCore;
    const ui = window.importExportUI;
    const debugManager = window.importExportDebugLog ? {
        log: window.importExportDebugLog,
        error: window.importExportDebugError || console.error
    } : { log: () => {}, error: console.error };

    /**
     * Initialize page
     */
    function initializePage() {
        debugManager.log('=== initializePage START ===');

        // Render initial data status
        ui.renderDataStatus();

        // Set up event listeners
        setupEventListeners();

        // Calculate and store initial hashes if not present
        const storedHashes = core.getStoredHashes();
        if (Object.keys(storedHashes).length === 0) {
            debugManager.log('No stored hashes found, calculating initial hashes');
            const hashes = core.calculateAllHashes();
            core.storeHashes(hashes);
        }

        debugManager.log('=== initializePage END ===');
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        debugManager.log('=== setupEventListeners START ===');

        // Debug toggle button
        const debugToggleBtn = document.getElementById('debugToggleBtn');
        if (debugToggleBtn && typeof window.toggleImportExportDebug === 'function') {
            debugToggleBtn.addEventListener('click', function() {
                window.toggleImportExportDebug();
            });
            debugManager.log('Debug toggle button event listener attached');
        } else {
            debugManager.error('Debug toggle button or function not found');
        }

        // Export All button
        const exportAllBtn = document.getElementById('exportAllBtn');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', ui.handleExportAll);
        }

        // Export All Separate button
        const exportAllSeparateBtn = document.getElementById('exportAllSeparateBtn');
        if (exportAllSeparateBtn) {
            exportAllSeparateBtn.addEventListener('click', ui.handleExportAllSeparate);
        }

        // Export page buttons
        const exportPageBtns = document.querySelectorAll('.export-page-btn');
        exportPageBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const pageName = this.getAttribute('data-page');
                if (pageName) {
                    ui.handleExportPage(pageName);
                }
            });
        });

        // Import All button
        const importAllBtn = document.getElementById('importAllBtn');
        if (importAllBtn) {
            importAllBtn.addEventListener('click', ui.handleImportAll);
        }

        // Import page buttons
        const importPageBtns = document.querySelectorAll('.import-page-btn');
        importPageBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const pageName = this.getAttribute('data-page');
                if (pageName) {
                    ui.handleImportPage(pageName);
                }
            });
        });

        // File upload input
        const importFileInput = document.getElementById('importFileInput');
        if (importFileInput) {
            importFileInput.addEventListener('change', function() {
                if (this.files && this.files.length > 0) {
                    ui.handleFileUpload(this.files[0], function(jsonData) {
                        const format = core.detectImportFormat(jsonData);
                        ui.showFormatDetection(format);
                    });
                }
            });
        }

        // Textarea input for format detection
        const importTextarea = document.getElementById('importTextarea');
        if (importTextarea) {
            importTextarea.addEventListener('input', ui.handleTextareaInput);
            importTextarea.addEventListener('paste', function() {
                // Delay to allow paste to complete
                setTimeout(ui.handleTextareaInput, 100);
            });
        }

        debugManager.log('=== setupEventListeners END ===');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePage);
    } else {
        initializePage();
    }

    debugManager.log('Import/Export Init module loaded');
})();
