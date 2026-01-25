/**
 * Changelog Core Module
 * Contains HTML parsing, file loading, and entry management functions
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.ChangelogConfig === 'undefined') {
        console.error('ChangelogConfig is required but not loaded. Please load changelog-config.js first.');
        return;
    }

    // Debug manager will be initialized in init module
    let debugManager = null;

    /**
     * Set debug manager instance
     * @param {DebugManager} manager DebugManager instance
     */
    function setDebugManager(manager) {
        debugManager = manager;
    }

    /**
     * Debug log helper
     */
    function debugLog(...args) {
        if (debugManager && debugManager.isEnabled()) {
            debugManager.log(...args);
        }
    }

    /**
     * Debug error helper
     */
    function debugError(...args) {
        if (debugManager && debugManager.isEnabled()) {
            debugManager.error(...args);
        } else {
            console.error(...args);
        }
    }

    /**
     * Parse HTML content and extract changelog entries
     * @param {string} htmlContent HTML content string
     * @returns {Array<HTMLElement>} Array of article elements
     */
    function parseHtmlFile(htmlContent) {
        debugLog('=== parseHtmlFile START ===');
        
        if (!htmlContent || typeof htmlContent !== 'string') {
            debugError('Invalid HTML content provided');
            return [];
        }

        // Create a temporary DOM element to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent.trim();

        // Find all article elements with class "changelog-entry"
        const entries = Array.from(tempDiv.querySelectorAll('article.changelog-entry'));
        
        debugLog(`Found ${entries.length} changelog entry/entries in HTML`);
        debugLog('=== parseHtmlFile END ===');
        
        return entries;
    }

    /**
     * Parse a single entry article element into structured data
     * @param {HTMLElement} articleElement Article element
     * @returns {Object|null} Entry object with version, date, content, and html
     */
    function parseEntry(articleElement) {
        if (!articleElement) {
            return null;
        }

        try {
            const cardTitle = articleElement.querySelector('.card-title');
            const dateElement = articleElement.querySelector('.text-muted.mb-3');
            
            const version = cardTitle ? cardTitle.textContent.trim() : 'Unknown Version';
            const dateText = dateElement ? dateElement.textContent.trim() : '';
            
            // Extract date (format: YYYY-MM-DD)
            const dateMatch = dateText.match(/(\d{4}-\d{2}-\d{2})/);
            const date = dateMatch ? dateMatch[1] : dateText;
            
            // Get the full HTML of the entry
            const html = articleElement.outerHTML;
            
            // Create entry object
            const entry = {
                version: version,
                date: date,
                dateText: dateText,
                html: html,
                element: articleElement
            };

            debugLog(`Parsed entry: ${version} (${date})`);
            return entry;
        } catch (error) {
            debugError('Error parsing entry:', error);
            return null;
        }
    }

    /**
     * Load a changelog HTML file and parse entries
     * @param {string} filePath Path to HTML file (relative to root)
     * @returns {Promise<Array<Object>>} Promise resolving to array of entry objects
     */
    async function loadChangelogFile(filePath) {
        debugLog(`=== loadChangelogFile START: ${filePath} ===`);
        
        try {
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const htmlContent = await response.text();
            debugLog(`Fetched ${htmlContent.length} characters from ${filePath}`);
            
            const articleElements = parseHtmlFile(htmlContent);
            const entries = articleElements
                .map(parseEntry)
                .filter(entry => entry !== null);
            
            debugLog(`Loaded ${entries.length} entry/entries from ${filePath}`);
            debugLog('=== loadChangelogFile END ===');
            
            return entries;
        } catch (error) {
            debugError(`Error loading file ${filePath}:`, error);
            return [];
        }
    }

    /**
     * Load entries from multiple files
     * @param {Array<string>} filePaths Array of file paths
     * @returns {Promise<Array<Object>>} Promise resolving to merged array of entries
     */
    async function getEntriesFromFiles(filePaths) {
        debugLog(`=== getEntriesFromFiles START: ${filePaths.length} file(s) ===`);
        
        if (!filePaths || filePaths.length === 0) {
            debugLog('No files to load');
            return [];
        }

        try {
            // Load all files in parallel
            const loadPromises = filePaths.map(filePath => loadChangelogFile(filePath));
            const results = await Promise.all(loadPromises);
            
            // Flatten and merge all entries
            const allEntries = results.flat();
            
            debugLog(`Loaded total of ${allEntries.length} entry/entries from ${filePaths.length} file(s)`);
            debugLog('=== getEntriesFromFiles END ===');
            
            return allEntries;
        } catch (error) {
            debugError('Error loading entries from files:', error);
            return [];
        }
    }

    /**
     * Sort entries by date (newest first)
     * @param {Array<Object>} entries Array of entry objects
     * @returns {Array<Object>} Sorted array of entries
     */
    function sortEntriesByDate(entries) {
        debugLog(`=== sortEntriesByDate START: ${entries.length} entry/entries ===`);
        
        const sorted = [...entries].sort((a, b) => {
            // Compare dates (YYYY-MM-DD format)
            if (a.date < b.date) return 1;
            if (a.date > b.date) return -1;
            return 0;
        });
        
        debugLog('Entries sorted by date (newest first)');
        debugLog('=== sortEntriesByDate END ===');
        
        return sorted;
    }

    /**
     * Get a slice of entries for pagination
     * @param {Array<Object>} entries Array of all entries
     * @param {number} start Starting index
     * @param {number} count Number of entries to return
     * @returns {Array<Object>} Slice of entries
     */
    function getEntriesSlice(entries, start, count) {
        if (!entries || entries.length === 0) {
            return [];
        }
        
        const end = start + count;
        const slice = entries.slice(start, end);
        
        debugLog(`getEntriesSlice: start=${start}, count=${count}, returned=${slice.length}`);
        
        return slice;
    }

    /**
     * Extract entries from the main changelog.html page
     * @returns {Array<Object>} Array of entry objects from current page
     */
    function getEntriesFromCurrentPage() {
        debugLog('=== getEntriesFromCurrentPage START ===');
        
        const container = document.getElementById('changelog');
        if (!container) {
            debugLog('Changelog container not found');
            return [];
        }

        const articleElements = Array.from(container.querySelectorAll('article.changelog-entry'));
        const entries = articleElements
            .map(parseEntry)
            .filter(entry => entry !== null);
        
        debugLog(`Found ${entries.length} entry/entries on current page`);
        debugLog('=== getEntriesFromCurrentPage END ===');
        
        return entries;
    }

    // Export functions to global scope
    window.changelogCore = {
        setDebugManager: setDebugManager,
        parseHtmlFile: parseHtmlFile,
        parseEntry: parseEntry,
        loadChangelogFile: loadChangelogFile,
        getEntriesFromFiles: getEntriesFromFiles,
        sortEntriesByDate: sortEntriesByDate,
        getEntriesSlice: getEntriesSlice,
        getEntriesFromCurrentPage: getEntriesFromCurrentPage
    };

    debugLog('[Changelog Core] Module initialized');
})();
