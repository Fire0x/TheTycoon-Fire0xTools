/**
 * Changelog UI Module
 * UI rendering functions for file selector, entries, and Load More button
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.changelogCore === 'undefined') {
        console.error('changelogCore is required but not loaded. Please load changelog-core.js first.');
        return;
    }

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
     * Escape HTML to prevent XSS
     * @param {string} text Text to escape
     * @returns {string} Escaped HTML
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Render file selector UI
     * @param {Array<string>} availableFiles Array of available file names
     * @param {Array<string>} selectedFiles Array of currently selected file names
     * @param {Function} onSelectionChange Callback when selection changes
     */
    function renderFileSelector(availableFiles, selectedFiles, onSelectionChange) {
        debugLog('=== renderFileSelector START ===');
        
        const container = document.getElementById('changelogFileSelector');
        if (!container) {
            debugError('File selector container not found');
            return;
        }

        if (!availableFiles || availableFiles.length === 0) {
            container.innerHTML = '<p class="text-muted">No archive files available.</p>';
            debugLog('No files available to display');
            return;
        }

        // Create checkbox list for file selection
        const html = `
            <div class="card mb-4" style="background-color: var(--card-bg); border: 1px solid var(--card-border);">
                <div class="card-header" style="background-color: var(--card-bg); border-bottom: 1px solid var(--card-border);">
                    <button class="btn btn-link text-decoration-none w-100 text-start p-0" type="button" data-bs-toggle="collapse" data-bs-target="#fileSelectorCollapse" aria-expanded="true" aria-controls="fileSelectorCollapse" style="color: var(--text-color); font-weight: 600;">
                        <span>📁 Load Archive Files</span>
                        <span class="float-end" id="fileSelectorToggle">▼</span>
                    </button>
                </div>
                <div class="collapse show" id="fileSelectorCollapse">
                    <div class="card-body">
                        <p class="text-muted small mb-3">Select one or more archive files to load older changelog entries:</p>
                        <div class="file-selector-list">
                            ${availableFiles.map((fileName, index) => {
                                const fileId = `changelog-file-${index}`;
                                const isChecked = selectedFiles.includes(fileName);
                                const fullPath = window.ChangelogConfig.archivePath + fileName;
                                return `
                                    <div class="form-check mb-2">
                                        <input class="form-check-input" type="checkbox" 
                                               id="${fileId}" 
                                               value="${escapeHtml(fileName)}" 
                                               data-path="${escapeHtml(fullPath)}"
                                               ${isChecked ? 'checked' : ''}
                                               onchange="if(window.changelogUI && window.changelogUI.handleFileSelectionChange) window.changelogUI.handleFileSelectionChange()">
                                        <label class="form-check-label" for="${fileId}">
                                            ${escapeHtml(fileName)}
                                        </label>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <button type="button" class="btn btn-primary btn-sm mt-3" onclick="if(window.changelogUI && window.changelogUI.handleLoadSelectedFiles) window.changelogUI.handleLoadSelectedFiles()">
                            📥 Load Selected Files
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        
        // Set up toggle for collapse
        const toggle = document.getElementById('fileSelectorToggle');
        const collapse = document.getElementById('fileSelectorCollapse');
        if (toggle && collapse) {
            collapse.addEventListener('show.bs.collapse', () => {
                toggle.textContent = '▼';
            });
            collapse.addEventListener('hide.bs.collapse', () => {
                toggle.textContent = '▶';
            });
        }

        debugLog(`Rendered file selector with ${availableFiles.length} file(s)`);
        debugLog('=== renderFileSelector END ===');
    }

    /**
     * Render changelog entries to DOM
     * @param {Array<Object>} entries Array of entry objects
     * @param {HTMLElement} container Container element to render into
     * @param {boolean} append Whether to append to existing content or replace
     */
    function renderEntries(entries, container, append = false) {
        debugLog(`=== renderEntries START: ${entries.length} entry/entries, append=${append} ===`);
        
        if (!container) {
            debugError('Container element not found');
            return;
        }

        if (!entries || entries.length === 0) {
            if (!append) {
                container.innerHTML = '<p class="text-muted">No changelog entries found.</p>';
            }
            debugLog('No entries to render');
            return;
        }

        // Create entries HTML
        const entriesHtml = entries.map(entry => entry.html).join('');
        
        if (append) {
            container.insertAdjacentHTML('beforeend', entriesHtml);
        } else {
            container.innerHTML = entriesHtml;
        }

        debugLog(`Rendered ${entries.length} entry/entries`);
        debugLog('=== renderEntries END ===');
    }

    /**
     * Render Load More button
     * @param {boolean} hasMore Whether there are more entries to load
     * @param {Function} onClick Click handler function
     */
    function renderLoadMoreButton(hasMore, onClick) {
        debugLog(`=== renderLoadMoreButton START: hasMore=${hasMore} ===`);
        
        const container = document.getElementById('changelogLoadMoreContainer');
        if (!container) {
            debugError('Load More container not found');
            return;
        }

        if (!hasMore) {
            container.innerHTML = '';
            debugLog('No more entries, hiding button');
            return;
        }

        const html = `
            <div class="text-center mt-4">
                <button type="button" class="btn btn-primary" id="changelogLoadMoreBtn" onclick="if(window.changelogUI && window.changelogUI.handleLoadMore) window.changelogUI.handleLoadMore()">
                    📄 Load More Entries
                </button>
            </div>
        `;

        container.innerHTML = html;
        debugLog('Load More button rendered');
        debugLog('=== renderLoadMoreButton END ===');
    }

    /**
     * Update Load More button state
     * @param {boolean} hasMore Whether there are more entries to load
     */
    function updateLoadMoreButton(hasMore) {
        const button = document.getElementById('changelogLoadMoreBtn');
        const container = document.getElementById('changelogLoadMoreContainer');
        
        if (!hasMore && container) {
            container.innerHTML = '';
            debugLog('Load More button hidden (no more entries)');
        } else if (hasMore && !button && container) {
            // Button doesn't exist but should, render it
            renderLoadMoreButton(true, null);
        }
    }

    /**
     * Show loading state
     */
    function showLoadingState() {
        debugLog('Showing loading state');
        const container = document.getElementById('changelogArchiveContainer');
        if (container) {
            const loadingHtml = `
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="text-muted mt-2">Loading changelog entries...</p>
                </div>
            `;
            container.innerHTML = loadingHtml;
        }
    }

    /**
     * Hide loading state
     */
    function hideLoadingState() {
        debugLog('Hiding loading state');
        // Loading state will be replaced by entries, so no explicit hide needed
    }

    /**
     * Get selected files from UI
     * @returns {Array<string>} Array of selected file paths
     */
    function getSelectedFiles() {
        const checkboxes = document.querySelectorAll('#changelogFileSelector input[type="checkbox"]:checked');
        const selectedFiles = Array.from(checkboxes).map(cb => cb.getAttribute('data-path'));
        debugLog(`getSelectedFiles: ${selectedFiles.length} file(s) selected`);
        return selectedFiles;
    }

    // Export functions to global scope
    window.changelogUI = {
        setDebugManager: setDebugManager,
        renderFileSelector: renderFileSelector,
        renderEntries: renderEntries,
        renderLoadMoreButton: renderLoadMoreButton,
        updateLoadMoreButton: updateLoadMoreButton,
        showLoadingState: showLoadingState,
        hideLoadingState: hideLoadingState,
        getSelectedFiles: getSelectedFiles,
        // Placeholder handlers (will be set by init module)
        handleFileSelectionChange: null,
        handleLoadSelectedFiles: null,
        handleLoadMore: null
    };

    debugLog('[Changelog UI] Module initialized');
})();
