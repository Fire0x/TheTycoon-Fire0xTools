/**
 * Version Management System
 * Centralized version tracking for the website and individual pages
 */

const VersionManager = {
    // Website overall version
    website: '0.1.1',
    
    // Individual page versions
    pages: {
        'index.html': '0.0.2',
        'merchants.html': '0.0.4',
        'checklist.html': '0.0.8',
        'VehicleDeliveries.html': '0.0.7',
        'education_timer.html': '0.0.5'
    },
    
    /**
     * Get the website version
     * @returns {string} Website version
     */
    getWebsiteVersion() {
        return this.website;
    },
    
    /**
     * Get version for a specific page
     * @param {string} pageName - The page filename (e.g., 'merchants.html')
     * @returns {string} Page version or 'N/A' if not found
     */
    getPageVersion(pageName) {
        return this.pages[pageName] || 'N/A';
    },
    
    /**
     * Get current page version based on window.location
     * @returns {string} Current page version
     */
    getCurrentPageVersion() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        return this.getPageVersion(currentPage);
    },
    
    /**
     * Initialize version display in footer
     * Call this function on page load to automatically update footer
     */
    initFooterVersion() {
        const footer = document.querySelector('footer');
        if (!footer) return;
        
        // Check if version display already exists
        let versionDisplay = footer.querySelector('#version-display');
        if (!versionDisplay) {
            versionDisplay = document.createElement('div');
            versionDisplay.id = 'version-display';
            versionDisplay.className = 'mt-2';
            versionDisplay.style.fontSize = '0.875rem';
            versionDisplay.style.color = '#6c757d';
            footer.appendChild(versionDisplay);
        }
        
        const websiteVersion = this.getWebsiteVersion();
        const pageVersion = this.getCurrentPageVersion();
        versionDisplay.innerHTML = `Website Version: <strong>${websiteVersion}</strong> | Page Version: <strong>${pageVersion}</strong>`;
    },
    
    /**
     * Initialize page version display
     * Call this function to display the current page version
     * @param {string} containerSelector - CSS selector for the container (default: 'body')
     * @param {string} position - 'top' or 'bottom' (default: 'top')
     */
    initPageVersion(containerSelector = 'body', position = 'top') {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        
        // Remove existing badge if any
        const existingBadge = document.querySelector('.page-version-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        const versionBadge = document.createElement('div');
        versionBadge.className = 'page-version-badge';
        versionBadge.style.cssText = `
            position: fixed;
            ${position === 'top' ? 'top' : 'bottom'}: 10px;
            right: 10px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            z-index: 9999;
            font-family: monospace;
        `;
        versionBadge.textContent = `v${this.getCurrentPageVersion()}`;
        
        document.body.appendChild(versionBadge);
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.VersionManager = VersionManager;
}

// Auto-initialize footer version if footer exists
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            VersionManager.initFooterVersion();
        });
    } else {
        VersionManager.initFooterVersion();
    }
}

