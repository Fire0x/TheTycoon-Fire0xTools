/**
 * Site Configuration Management System
 * Centralized configuration for site name, logo, branding, and version tracking
 */

// ============================================================================
// Site Configuration
// ============================================================================

const SiteConfig = {
    // Site branding information
    siteName: 'Fire0x Incorporated - The Tycoons Staff Only - TESTING SITE',
    siteLogo: {
        path: 'images/SiteLogo.png',
        alt: 'Site Logo',
        height: '40px'
    },
    
    // Copyright information
    copyright: {
        company: 'Fire0x Incorporated',
        gameOwner: 'OneLonelyDad (Troublesum)',
        gameName: 'The Tycoon',
        yearRange: '2025-2026'
    },
    
    // Disclaimer information
    disclaimer: 'This site is not affiliated with or endorsed by Rockstar North, Take-Two Interactive or The Tycoons or other rightsholders. Any trademarks used belong to their respective owners.',
    
    // Page titles mapping
    pageTitles: {
        'index.html': 'Home',
        'merchants.html': 'Traveling Merchants',
        'checklist.html': 'Business Checklist',
        'checklist-1.html': 'Business Checklist',
        'VehicleDeliveries.html': 'Vehicle Deliveries',
        'education_timer.html': 'Education Timer',
        'apartment.html': 'Apartment Management'
    },
    
    /**
     * Get page title for a specific page
     * @param {string} pageName - The page filename (e.g., 'merchants.html')
     * @returns {string} Page title or empty string if not found
     */
    getPageTitle(pageName) {
        return this.pageTitles[pageName] || '';
    },
    
    /**
     * Get current page title based on window.location
     * @returns {string} Current page title
     */
    getCurrentPageTitle() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        return this.getPageTitle(currentPage);
    },
    
    /**
     * Get the site name
     * @returns {string} Site name
     */
    getSiteName() {
        return this.siteName;
    },
    
    /**
     * Get the site logo path
     * @returns {string} Logo path
     */
    getSiteLogoPath() {
        return this.siteLogo.path;
    },
    
    /**
     * Get the site logo alt text
     * @returns {string} Logo alt text
     */
    getSiteLogoAlt() {
        return this.siteLogo.alt;
    },
    
    /**
     * Get the site logo height
     * @returns {string} Logo height
     */
    getSiteLogoHeight() {
        return this.siteLogo.height;
    },
    
    /**
     * Get copyright text
     * @returns {string} Copyright text
     */
    getCopyrightText() {
        return `&copy; ${this.copyright.yearRange} ${this.copyright.company}. ${this.copyright.gameName} is owned and created by ${this.copyright.gameOwner}. All rights reserved.`;
    },
    
    /**
     * Get disclaimer text
     * @returns {string} Disclaimer text
     */
    getDisclaimerText() {
        return this.disclaimer;
    },
    
    /**
     * Initialize navbar brand (logo + name)
     * Updates all navbar-brand elements on the page
     */
    initNavbarBrand() {
        const navbarBrands = document.querySelectorAll('.navbar-brand');
        navbarBrands.forEach(brand => {
            const siteName = this.getSiteName();
            const logoPath = this.getSiteLogoPath();
            const logoAlt = this.getSiteLogoAlt();
            const logoHeight = this.getSiteLogoHeight();
            
            brand.innerHTML = `<img src="${logoPath}" alt="${logoAlt}" style="height: ${logoHeight}; margin-right: 10px;">${siteName}`;
        });
    },
    
    /**
     * Initialize page title
     * Updates the <title> tag and favicon
     * @param {string} pageTitle - The page-specific title (e.g., "Home", "Traveling Merchants"). If not provided, will auto-detect from pageTitles mapping.
     */
    initPageTitle(pageTitle = '') {
        // If no title provided, try to get it from the mapping
        if (!pageTitle) {
            pageTitle = this.getCurrentPageTitle();
        }
        
        const title = pageTitle 
            ? `${pageTitle} - ${this.getSiteName()}`
            : this.getSiteName();
        
        document.title = title;
        
        // Update favicon if it exists
        let favicon = document.querySelector('link[rel="icon"]');
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            favicon.type = 'image/png';
            document.head.appendChild(favicon);
        }
        favicon.href = this.getSiteLogoPath();
    },
    
    /**
     * Initialize footer copyright and disclaimer
     * Updates all footer copyright text and adds disclaimer
     * Ensures copyright is at the top of the footer
     */
    initFooterCopyright() {
        const footers = document.querySelectorAll('footer');
        footers.forEach(footer => {
            // Find copyright paragraph (exclude disclaimer paragraph)
            // Only look for paragraphs that are NOT the disclaimer
            const allParagraphs = Array.from(footer.querySelectorAll('p'));
            const copyrightParagraphs = allParagraphs.filter(p => {
                // Skip if it's the disclaimer paragraph
                if (p.id === 'site-disclaimer') return false;
                // Check if it contains copyright indicators
                const text = p.textContent;
                return text.includes('©') || text.includes('&copy;') || 
                       (text.includes('Copyright') && text.includes('Fire0x')) ||
                       (text.includes('Fire0x Incorporated') && text.includes('The Tycoon'));
            });
            
            // Remove all existing copyright paragraphs first
            copyrightParagraphs.forEach(p => p.remove());
            
            // Create copyright paragraph at the top of footer
            const copyrightP = document.createElement('p');
            copyrightP.innerHTML = this.getCopyrightText();
            copyrightP.style.textAlign = 'center';
            
            // Insert at the very top of footer content (inside container if it exists)
            const container = footer.querySelector('.container') || footer;
            const firstChild = container.firstElementChild || container.firstChild;
            if (firstChild) {
                container.insertBefore(copyrightP, firstChild);
            } else {
                container.appendChild(copyrightP);
            }
            
            // Add or update disclaimer (only one)
            let disclaimerP = footer.querySelector('#site-disclaimer');
            if (!disclaimerP) {
                disclaimerP = document.createElement('p');
                disclaimerP.id = 'site-disclaimer';
                disclaimerP.style.fontSize = '0.75rem';
                disclaimerP.style.color = '#6c757d';
                disclaimerP.style.marginTop = '0.5rem';
                disclaimerP.style.textAlign = 'center';
                // Insert after version-display if it exists, otherwise at the end
                const versionDisplay = footer.querySelector('#version-display');
                if (versionDisplay) {
                    versionDisplay.parentNode.insertBefore(disclaimerP, versionDisplay.nextSibling);
                } else {
                    const container = footer.querySelector('.container') || footer;
                    container.appendChild(disclaimerP);
                }
            } else {
                disclaimerP.style.textAlign = 'center';
            }
            disclaimerP.textContent = this.getDisclaimerText();
        });
    },
    
    /**
     * Initialize all site branding elements
     * Call this function on page load to automatically update all branding
     * @param {string} pageTitle - Optional page-specific title
     */
    init(pageTitle = '') {
        this.initPageTitle(pageTitle);
        this.initNavbarBrand();
        this.initFooterCopyright();
    }
};

// ============================================================================
// Version Management
// ============================================================================

const VersionManager = {
    // Website overall version
    website: '0.1.4',
    
    // Individual page versions
    pages: {
        'index.html': '0.0.4',
        'merchants.html': '0.0.7',
        'checklist.html': '0.1.6',
        'VehicleDeliveries.html': '0.1.4',
        'education_timer.html': '0.1.0',
        'apartment.html': '0.0.1'
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

// ============================================================================
// Global Exposure & Auto-Initialization
// ============================================================================

// Make available globally
if (typeof window !== 'undefined') {
    window.SiteConfig = SiteConfig;
    window.VersionManager = VersionManager;
}

// Auto-initialize if document is available
if (typeof document !== 'undefined') {
    const initAll = () => {
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
