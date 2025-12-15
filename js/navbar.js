/**
 * Navbar Management System
 * Centralized navbar generation and management
 */

const NavbarManager = {
    // Navigation menu items
    menuItems: [
        {
            href: 'index.html',
            text: '🏠 Home',
            id: 'nav-home'
        },
        {
            href: 'merchants.html',
            text: '🛒 Traveling Merchants',
            id: 'nav-merchants'
        },
        {
            href: 'checklist.html',
            text: '✅️ Checklist',
            id: 'nav-checklist'
        },
        {
            href: 'VehicleDeliveries.html',
            text: '🚚 Vehicle Deliveries',
            id: 'nav-vehicles'
        },
        {
            href: 'education_timer.html',
            text: '🎓 Education Timer',
            id: 'nav-education'
        },
        {
            href: 'apartment.html',
            text: '🏠 Apartment Management',
            id: 'nav-apartment'
        }
    ],
    
    // Excluded HTML files (will not appear in navbar)
    excludedPages: ['checklist-1.html', 'Version Control/checklist.html'],
    
    /**
     * Get current page filename
     * @returns {string} Current page filename (e.g., 'index.html')
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename;
    },
    
    /**
     * Check if a menu item is active (current page)
     * @param {string} href - The href of the menu item
     * @returns {boolean} True if this is the current page
     */
    isActivePage(href) {
        const currentPage = this.getCurrentPage();
        return href === currentPage || (currentPage === '' && href === 'index.html');
    },
    
    /**
     * Check if a page is excluded from the navbar
     * @param {string} href - The href of the menu item
     * @returns {boolean} True if the page is excluded
     */
    isExcluded(href) {
        return this.excludedPages.includes(href);
    },
    
    /**
     * Add a page to the exclusion list
     * @param {string} href - The href of the page to exclude (e.g., 'page.html')
     */
    excludePage(href) {
        if (!this.excludedPages.includes(href)) {
            this.excludedPages.push(href);
        }
    },
    
    /**
     * Remove a page from the exclusion list
     * @param {string} href - The href of the page to include again
     */
    includePage(href) {
        this.excludedPages = this.excludedPages.filter(page => page !== href);
    },
    
    /**
     * Generate navbar HTML
     * @returns {string} Navbar HTML
     */
    generateNavbarHTML() {
        const siteName = window.SiteConfig ? window.SiteConfig.getSiteName() : 'Fire0x Incorporated';
        const logoPath = window.SiteConfig ? window.SiteConfig.getSiteLogoPath() : 'images/SiteLogo.png';
        const logoAlt = window.SiteConfig ? window.SiteConfig.getSiteLogoAlt() : 'Site Logo';
        const logoHeight = window.SiteConfig ? window.SiteConfig.getSiteLogoHeight() : '40px';
        
        // Filter out excluded pages
        const visibleMenuItems = this.menuItems.filter(item => !this.isExcluded(item.href));
        
        const menuItemsHTML = visibleMenuItems.map(item => {
            const isActive = this.isActivePage(item.href);
            const activeClass = isActive ? 'active' : '';
            const ariaCurrent = isActive ? ' aria-current="page"' : '';
            
            return `
                    <li class="nav-item">
                        <a class="nav-link ${activeClass}"${ariaCurrent} href="${item.href}" id="${item.id}">${item.text}</a>
                    </li>`;
        }).join('\n');
        
        return `
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container">
            <a class="navbar-brand" href="index.html"><img src="${logoPath}" alt="${logoAlt}" style="height: ${logoHeight}; margin-right: 10px;">${siteName}</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
${menuItemsHTML}
                </ul>
            </div>
        </div>
    </nav>`;
    },
    
    /**
     * Initialize navbar
     * Replaces existing navbar or inserts new one
     */
    init() {
        // Find existing navbar
        const existingNavbar = document.querySelector('nav.navbar');
        
        if (existingNavbar) {
            // Replace existing navbar
            const navbarHTML = this.generateNavbarHTML();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = navbarHTML.trim();
            const newNavbar = tempDiv.firstElementChild;
            
            // Replace the old navbar with the new one
            existingNavbar.parentNode.replaceChild(newNavbar, existingNavbar);
        } else {
            // Insert navbar at the beginning of body if it doesn't exist
            const body = document.body;
            if (body) {
                const navbarHTML = this.generateNavbarHTML();
                body.insertAdjacentHTML('afterbegin', navbarHTML);
            }
        }
    },
    
    /**
     * Add a new menu item
     * @param {Object} item - Menu item object with href, text, and optional id
     */
    addMenuItem(item) {
        if (!item.href || !item.text) {
            console.error('NavbarManager: Menu item must have href and text properties');
            return;
        }
        
        const menuItem = {
            href: item.href,
            text: item.text,
            id: item.id || `nav-${item.href.replace('.html', '').replace(/[^a-z0-9]/gi, '-').toLowerCase()}`
        };
        
        this.menuItems.push(menuItem);
    },
    
    /**
     * Remove a menu item by href
     * @param {string} href - The href of the menu item to remove
     */
    removeMenuItem(href) {
        this.menuItems = this.menuItems.filter(item => item.href !== href);
    },
    
    /**
     * Update menu items order
     * @param {Array<string>} hrefs - Array of hrefs in the desired order
     */
    reorderMenuItems(hrefs) {
        const orderedItems = [];
        const existingItems = [...this.menuItems];
        
        // Add items in the specified order
        hrefs.forEach(href => {
            const item = existingItems.find(i => i.href === href);
            if (item) {
                orderedItems.push(item);
            }
        });
        
        // Add any remaining items that weren't in the order array
        existingItems.forEach(item => {
            if (!orderedItems.find(i => i.href === item.href)) {
                orderedItems.push(item);
            }
        });
        
        this.menuItems = orderedItems;
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.NavbarManager = NavbarManager;
}

// Auto-initialize if document is available
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Wait for SiteConfig to initialize first
            setTimeout(() => {
                NavbarManager.init();
            }, 0);
        });
    } else {
        // Document already loaded
        setTimeout(() => {
            NavbarManager.init();
        }, 0);
    }
}

