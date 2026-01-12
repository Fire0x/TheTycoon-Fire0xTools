/**
 * Site Configuration Manager
 * Handles site branding, page titles, navbar, and footer initialization
 */

(function() {
    'use strict';
    
    // Ensure ConfigData is available
    if (typeof ConfigData === 'undefined') {
        console.error('ConfigData is required for SiteConfig');
        return;
    }
    
    const SiteConfig = {
        /**
         * Get page title for a specific page
         * @param {string} pageName - The page filename (e.g., 'merchants.html')
         * @returns {string} Page title or empty string if not found
         */
        getPageTitle(pageName) {
            return ConfigData.pageTitles[pageName] || '';
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
            return ConfigData.siteName;
        },
        
        /**
         * Get the site logo path
         * @returns {string} Logo path
         */
        getSiteLogoPath() {
            return ConfigData.siteLogo.path;
        },
        
        /**
         * Get the site logo alt text
         * @returns {string} Logo alt text
         */
        getSiteLogoAlt() {
            return ConfigData.siteLogo.alt;
        },
        
        /**
         * Get the site logo height
         * @returns {string} Logo height
         */
        getSiteLogoHeight() {
            return ConfigData.siteLogo.height;
        },
        
        /**
         * Get copyright text
         * @returns {string} Copyright text
         */
        getCopyrightText() {
            const c = ConfigData.copyright;
            return `&copy; ${c.yearRange} ${c.company}. ${c.gameName} is owned and created by ${c.gameOwner}. All rights reserved.`;
        },
        
        /**
         * Get disclaimer text
         * @returns {string} Disclaimer text
         */
        getDisclaimerText() {
            return ConfigData.disclaimer;
        },
        
        /**
         * Get hero section data for a specific page
         * @param {string} pageName - The page filename (e.g., 'merchants.html')
         * @returns {Object|null} Hero section data with title and description, or null if not found
         */
        getHeroSection(pageName) {
            return ConfigData.heroSections[pageName] || null;
        },
        
        /**
         * Get current page hero section data based on window.location
         * @returns {Object|null} Current page hero section data
         */
        getCurrentHeroSection() {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            return this.getHeroSection(currentPage);
        },
        
        /**
         * Initialize hero section
         * Updates hero section title and description if hero section exists on page
         */
        initHeroSection() {
            const heroSection = document.querySelector('section.hero');
            if (!heroSection) {
                return; // No hero section on this page
            }
            
            const heroData = this.getCurrentHeroSection();
            if (!heroData) {
                return; // No hero data configured for this page
            }
            
            // Update title
            const titleElement = heroSection.querySelector('h1.glow-text, h1');
            if (titleElement) {
                titleElement.textContent = heroData.title;
            }
            
            // Update description
            const descElement = heroSection.querySelector('p.lead, p');
            if (descElement) {
                descElement.textContent = heroData.description;
            }
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
                const allParagraphs = Array.from(footer.querySelectorAll('p'));
                const copyrightParagraphs = allParagraphs.filter(p => {
                    if (p.id === 'site-disclaimer') return false;
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
                
                // Insert at the very top of footer content
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
            this.initHeroSection();
            this.initFooterCopyright();
        }
    };
    
    // Make available globally
    if (typeof window !== 'undefined') {
        window.SiteConfig = SiteConfig;
    }
})();


