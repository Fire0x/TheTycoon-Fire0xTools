/**
 * Changelog Configuration Module
 * Configuration settings for changelog functionality
 */
(function() {
    'use strict';

    /**
     * Changelog configuration
     * @type {Object}
     */
    window.ChangelogConfig = {
        // Initial number of entries to display
        initialEntryCount: 5,
        
        // Number of entries to load per "Load More" click
        entriesPerLoad: 5,
        
        // Default files to load (empty array means user must select manually)
        // Files should be relative to root, e.g., 'pages/changelog/changelog-archive-1.html'
        defaultFiles: [],
        
        // Path to archive files directory (relative to root)
        archivePath: 'pages/changelog/',
        
        // Available archive files (will be populated dynamically or manually)
        // Format: ['changelog-archive-1.html', 'changelog-archive-2.html', ...]
        availableFiles: [
            'changelog-archive-1.html'
        ],
        
        // Debug mode default (can be overridden by DebugManager)
        debugEnabled: false
    };

    // Expose config for external access
    if (window.debug) {
        window.debug.log('[Changelog Config] Configuration initialized:', window.ChangelogConfig);
    }
})();
