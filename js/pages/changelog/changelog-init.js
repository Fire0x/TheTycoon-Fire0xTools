/**
 * Changelog Init Module
 * Page initialization and event handlers
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.changelogCore === 'undefined') {
        console.error('changelogCore is required but not loaded. Please load changelog-core.js first.');
        return;
    }

    if (typeof window.changelogUI === 'undefined') {
        console.error('changelogUI is required but not loaded. Please load changelog-ui.js first.');
        return;
    }

    if (typeof window.ChangelogConfig === 'undefined') {
        console.error('ChangelogConfig is required but not loaded. Please load changelog-config.js first.');
        return;
    }

    if (typeof DebugManager === 'undefined') {
        console.error('DebugManager is required but not loaded. Please load js/debug-manager.js first.');
        return;
    }

    // Initialize DebugManager
    const debugManager = new DebugManager({
        prefix: '[Changelog Debug]',
        storageKey: 'changelogDebugMode',
        buttonId: 'changelogDebugToggleBtn',
        textId: 'changelogDebugToggleText'
    });

    // Set debug manager in core and UI modules
    window.changelogCore.setDebugManager(debugManager);
    window.changelogUI.setDebugManager(debugManager);

    // State management
    let allEntries = [];
    let displayedEntries = [];
    let currentDisplayCount = 0;
    let isLoading = false;

    /**
     * Debug log helper
     */
    function debugLog(...args) {
        if (debugManager.isEnabled()) {
            debugManager.log(...args);
        }
    }

    /**
     * Load entries from selected files and merge with current page entries
     */
    async function loadSelectedFiles() {
        if (isLoading) {
            debugLog('Already loading, skipping...');
            return;
        }

        isLoading = true;
        debugLog('=== loadSelectedFiles START ===');

        try {
            // Get selected files
            const selectedFiles = window.changelogUI.getSelectedFiles();
            
            if (selectedFiles.length === 0) {
                debugLog('No files selected');
                window.changelogUI.showLoadingState();
                setTimeout(() => {
                    const container = document.getElementById('changelogArchiveContainer');
                    if (container) {
                        container.innerHTML = '<p class="text-muted text-center py-4">Please select at least one archive file to load.</p>';
                    }
                    isLoading = false;
                }, 500);
                return;
            }

            // Show loading state
            window.changelogUI.showLoadingState();

            // Get entries from current page
            const currentPageEntries = window.changelogCore.getEntriesFromCurrentPage();
            debugLog(`Found ${currentPageEntries.length} entry/entries on current page`);

            // Load entries from selected files
            const archiveEntries = await window.changelogCore.getEntriesFromFiles(selectedFiles);
            debugLog(`Loaded ${archiveEntries.length} entry/entries from archive files`);

            // Merge and sort all entries
            allEntries = window.changelogCore.sortEntriesByDate([
                ...currentPageEntries,
                ...archiveEntries
            ]);

            debugLog(`Total entries after merge: ${allEntries.length}`);

            // Reset display count and show initial entries
            currentDisplayCount = 0;
            displayNextEntries();

        } catch (error) {
            debugManager.error('Error loading selected files:', error);
            const container = document.getElementById('changelogArchiveContainer');
            if (container) {
                container.innerHTML = '<p class="text-danger text-center py-4">Error loading changelog entries. Please check the console for details.</p>';
            }
        } finally {
            isLoading = false;
            debugLog('=== loadSelectedFiles END ===');
        }
    }

    /**
     * Display next batch of entries
     */
    function displayNextEntries() {
        debugLog(`=== displayNextEntries START: currentDisplayCount=${currentDisplayCount} ===`);

        const config = window.ChangelogConfig;
        const count = currentDisplayCount === 0 ? config.initialEntryCount : config.entriesPerLoad;
        
        const nextEntries = window.changelogCore.getEntriesSlice(allEntries, currentDisplayCount, count);
        
        if (nextEntries.length === 0) {
            debugLog('No more entries to display');
            window.changelogUI.updateLoadMoreButton(false);
            return;
        }

        // Get or create archive container
        let container = document.getElementById('changelogArchiveContainer');
        if (!container) {
            // Create container if it doesn't exist
            const changelogSection = document.getElementById('changelog');
            if (changelogSection) {
                container = document.createElement('div');
                container.id = 'changelogArchiveContainer';
                changelogSection.appendChild(container);
            } else {
                debugManager.error('Changelog section not found');
                return;
            }
        }

        // Render entries (append if not first batch)
        const isFirstBatch = currentDisplayCount === 0;
        window.changelogUI.renderEntries(nextEntries, container, !isFirstBatch);
        
        displayedEntries = [...displayedEntries, ...nextEntries];
        currentDisplayCount += nextEntries.length;

        // Update Load More button
        const hasMore = currentDisplayCount < allEntries.length;
        window.changelogUI.updateLoadMoreButton(hasMore);

        debugLog(`Displayed ${nextEntries.length} entry/entries. Total displayed: ${displayedEntries.length}/${allEntries.length}`);
        debugLog('=== displayNextEntries END ===');
    }

    /**
     * Handle Load More button click
     */
    function handleLoadMore() {
        debugLog('Load More button clicked');
        displayNextEntries();
    }

    /**
     * Handle file selection change (just update UI state, don't load yet)
     */
    function handleFileSelectionChange() {
        debugLog('File selection changed');
        // Just log for now, actual loading happens on "Load Selected Files" button click
    }

    /**
     * Initialize file selector with available files
     */
    function initializeFileSelector() {
        debugLog('=== initializeFileSelector START ===');
        
        const config = window.ChangelogConfig;
        const availableFiles = config.availableFiles || [];
        
        // Render file selector (no files selected initially)
        window.changelogUI.renderFileSelector(availableFiles, [], handleFileSelectionChange);
        
        debugLog(`Initialized file selector with ${availableFiles.length} available file(s)`);
        debugLog('=== initializeFileSelector END ===');
    }

    /**
     * Initialize page
     */
    function initializePage() {
        debugLog('=== initializePage START ===');

        // Update debug UI
        debugManager.updateUI();

        // Initialize file selector
        initializeFileSelector();

        // Set up event handlers
        window.changelogUI.handleFileSelectionChange = handleFileSelectionChange;
        window.changelogUI.handleLoadSelectedFiles = loadSelectedFiles;
        window.changelogUI.handleLoadMore = handleLoadMore;

        // Get entries from current page for initial display
        const currentPageEntries = window.changelogCore.getEntriesFromCurrentPage();
        allEntries = currentPageEntries;
        displayedEntries = currentPageEntries;
        currentDisplayCount = currentPageEntries.length;

        debugLog(`Initialized with ${currentPageEntries.length} entry/entries from current page`);
        debugLog('=== initializePage END ===');
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePage);
    } else {
        // DOM already ready, but wait a bit to ensure all modules are loaded
        setTimeout(initializePage, 100);
    }

    // Expose toggle function for debug button
    window.toggleChangelogDebug = function() {
        debugManager.toggle();
    };

    debugLog('[Changelog Init] Module initialized');
})();
