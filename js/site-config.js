/**
 * Site Configuration Management System
 * Main entry point - loads modules and initializes
 * 
 * Load order:
 * 1. js/config/config-data.js
 * 2. js/config/site-config.js
 * 3. js/config/version-manager.js
 * 4. js/site-config.js (this file)
 */

// Auto-initialize if document is available
if (typeof document !== 'undefined') {
    const initAll = () => {
        // Check if required modules are loaded
        if (typeof SiteConfig === 'undefined') {
            console.error('SiteConfig module not loaded. Make sure js/config/site-config.js is loaded before this file.');
            return;
        }
        if (typeof VersionManager === 'undefined') {
            console.error('VersionManager module not loaded. Make sure js/config/version-manager.js is loaded before this file.');
            return;
        }
        
        // Initialize SiteConfig - auto-detect page title from mapping
        const pageTitle = SiteConfig.getCurrentPageTitle();
        SiteConfig.init(pageTitle);
        
        // Initialize VersionManager
        VersionManager.initFooterVersion();
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        // Document already loaded
        initAll();
    }
}
