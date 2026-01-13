/**
 * Checklist Diff Tracker Utility
 * Helps identify and document differences between checklist.html and checklist-1.html
 */
(function() {
    'use strict';

    /**
     * Detect which checklist page is currently loaded
     * @returns {string} 'checklist' or 'checklist-1'
     */
    function detectChecklistPage() {
        const path = window.location.pathname;
        if (path.includes('checklist-1.html')) {
            return 'checklist-1';
        }
        return 'checklist';
    }

    /**
     * Get page-specific configuration
     * @returns {Object} Configuration object with page-specific settings
     */
    function getPageConfig() {
        const page = detectChecklistPage();
        return {
            page: page,
            isChecklist1: page === 'checklist-1',
            storagePrefix: `checklist_${page}_`,
            // Add page-specific feature flags here
            features: {
                // Example: checklist-1 might have different features
                // customFeature: page === 'checklist-1'
            }
        };
    }

    /**
     * Log differences when detected
     * @param {string} feature - Feature name
     * @param {string} description - Description of the difference
     */
    function logDifference(feature, description) {
        if (typeof console !== 'undefined' && console.log) {
            console.log(`[Checklist Diff] ${feature}: ${description}`);
        }
    }

    /**
     * Check for known differences and log them
     */
    function checkKnownDifferences() {
        const config = getPageConfig();
        
        // Example: Check for HTML structure differences
        const allBusinessSummaryCard = document.getElementById('allBusinessSummaryCard');
        if (allBusinessSummaryCard) {
            const position = allBusinessSummaryCard.compareDocumentPosition(document.getElementById('config-panel') || document.querySelector('.config-panel'));
            // This is a simple check - you can expand this
        }
        
        // Log page detection
        logDifference('Page Detection', `Current page: ${config.page}`);
    }

    /**
     * Export difference information
     * @returns {Object} Difference report
     */
    function generateDiffReport() {
        const config = getPageConfig();
        const report = {
            page: config.page,
            timestamp: new Date().toISOString(),
            differences: [],
            features: config.features
        };
        
        // Add checks for known differences
        // Example: Check if All Business Summary is above Configuration Panel
        const allBusinessSummary = document.getElementById('allBusinessSummaryCard');
        const configPanel = document.getElementById('config-panel') || document.querySelector('.config-panel');
        
        if (allBusinessSummary && configPanel) {
            const summaryRect = allBusinessSummary.getBoundingClientRect();
            const configRect = configPanel.getBoundingClientRect();
            
            if (summaryRect.top < configRect.top) {
                report.differences.push({
                    type: 'layout',
                    feature: 'All Business Summary Position',
                    description: 'All Business Summary is positioned above Configuration Panel',
                    page: config.page
                });
            }
        }
        
        return report;
    }

    // Export functions
    window.checklistDiffTracker = {
        detectPage: detectChecklistPage,
        getPageConfig: getPageConfig,
        checkDifferences: checkKnownDifferences,
        generateReport: generateDiffReport,
        logDifference: logDifference
    };

    // Auto-check on load if debug mode is enabled
    if (typeof window.checklistDebugManager !== 'undefined' && window.checklistDebugManager.isEnabled()) {
        checkKnownDifferences();
    }

})();
