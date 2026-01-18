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
        
        // Check for hero section presence
        const heroSection = document.querySelector('section.hero');
        if (heroSection) {
            logDifference('Hero Section', 'checklist.html has hero section with navbar injection');
        } else {
            logDifference('Hero Section', 'checklist-1.html uses centered header div instead of hero section');
        }
        
        // Check for navbar injection comment
        const bodyContent = document.body.innerHTML;
        const hasNavbarComment = bodyContent.includes('<!-- Navbar is injected by js/navbar.js -->');
        if (hasNavbarComment) {
            logDifference('Navbar', 'checklist.html has navbar injection comment');
        } else {
            logDifference('Navbar', 'checklist-1.html does not have navbar injection comment');
        }
        
        // Check for checklist-1.css stylesheet
        const checklist1CSS = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .some(link => link.href.includes('checklist-1.css'));
        if (checklist1CSS) {
            logDifference('CSS', 'checklist-1.html loads checklist-1.css stylesheet');
        }
        
        // Check for tier color options (checklist-1.html has fewer options)
        const tierColorSelect = document.getElementById('tierColor');
        if (tierColorSelect) {
            const options = tierColorSelect.options.length;
            if (options < 18) {
                logDifference('Tier Color Options', `checklist-1.html has ${options} color options (fewer than checklist.html)`);
            }
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
            features: config.features,
            htmlStructure: {},
            cssFiles: [],
            javascriptFiles: []
        };
        
        // Check HTML structure differences
        const heroSection = document.querySelector('section.hero');
        report.htmlStructure.hasHeroSection = !!heroSection;
        report.htmlStructure.hasNavbarComment = document.body.innerHTML.includes('<!-- Navbar is injected by js/navbar.js -->');
        
        // Check CSS files
        const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        report.cssFiles = stylesheets.map(link => {
            const href = link.href;
            const filename = href.substring(href.lastIndexOf('/') + 1);
            return filename;
        });
        
        // Check JavaScript files
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        report.javascriptFiles = scripts.map(script => {
            const src = script.src;
            const filename = src.substring(src.lastIndexOf('/') + 1);
            return filename;
        });
        
        // Check for tier color options
        const tierColorSelect = document.getElementById('tierColor');
        if (tierColorSelect) {
            report.differences.push({
                type: 'feature',
                feature: 'Tier Color Options',
                description: `Has ${tierColorSelect.options.length} color options`,
                page: config.page
            });
        }
        
        // Check layout differences
        const allBusinessSummary = document.getElementById('allBusinessSummaryCard');
        const configPanel = document.getElementById('config-panel') || document.querySelector('.config-panel');
        
        if (allBusinessSummary && configPanel) {
            const summaryRect = allBusinessSummary.getBoundingClientRect();
            const configRect = configPanel.getBoundingClientRect();
            
            report.differences.push({
                type: 'layout',
                feature: 'All Business Summary Position',
                description: summaryRect.top < configRect.top 
                    ? 'All Business Summary is positioned above Configuration Panel' 
                    : 'All Business Summary is positioned below Configuration Panel',
                page: config.page
            });
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
