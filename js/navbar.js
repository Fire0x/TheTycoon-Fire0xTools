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
            type: 'dropdown',
            text: '💵 Busineses',
            id: 'businessDropdown',
            items: [
                {text: '🏠 Apartment Management', href: 'apartment.html'},
                {text: '🏠 Business Checklist', href: 'checklist.html'},
            ]
        },
        {
            href: 'merchants.html',
            text: '🛒 Traveling Merchants',
            id: 'nav-merchants'
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
            href: 'changelog.html',
            text: '📝 Changelog',
            id: 'nav-changelog'
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
        
        // Filter out excluded pages (only for items with href)
        const visibleMenuItems = this.menuItems.filter(item => {
            if (item.type === 'dropdown') {
                // For dropdowns, filter their items
                if (item.items) {
                    item.items = item.items.filter(subItem => !this.isExcluded(subItem.href));
                }
                return true; // Always show dropdown (even if empty)
            }
            return !this.isExcluded(item.href);
        });
        
        const menuItemsHTML = visibleMenuItems.map(item => {
            // Handle dropdown items
            if (item.type === 'dropdown') {
                // Check if any dropdown item is active
                const hasActiveItem = item.items && item.items.some(subItem => this.isActivePage(subItem.href));
                const dropdownActiveClass = hasActiveItem ? 'active' : '';
                
                const dropdownItemsHTML = item.items ? item.items.map(subItem => {
                    const isSubActive = this.isActivePage(subItem.href);
                    const subActiveClass = isSubActive ? 'active' : '';
                    const subAriaCurrent = isSubActive ? ' aria-current="page"' : '';
                    
                    return `<li><a class="dropdown-item ${subActiveClass}"${subAriaCurrent} href="${subItem.href}" id="${subItem.id || ''}">${subItem.text}</a></li>`;
                }).join('\n') : '';
                
                return `
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle ${dropdownActiveClass}" href="#" id="${item.id}" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            ${item.text}
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="${item.id}">
${dropdownItemsHTML}
                        </ul>
                    </li>`;
            }
            
            // Handle regular menu items
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

// ============================================================================
// SubNavbar Management System
// ============================================================================
// 
// Usage Example:
// 
// SubNavbarManager.registerPageSubnavbar('apartment.html', {
//     type: 'tabs',  // 'tabs', 'pills', 'links', or 'breadcrumbs'
//     items: [
//         { href: '#apartments', text: 'Apartments', tabTarget: '#apartments', id: 'apartments-tab' },
//         { href: '#reviews', text: 'Reviews', tabTarget: '#reviews', id: 'reviews-tab' },
//         { href: '#overview', text: 'Overview', tabTarget: '#overview', id: 'overview-tab' }
//     ],
//     sticky: true  // Optional: make subnavbar stick to top when scrolling
// });
//
// For breadcrumbs:
// SubNavbarManager.registerPageSubnavbar('apartment.html', {
//     type: 'breadcrumbs',
//     items: [
//         { href: 'index.html', text: 'Home' },
//         { href: 'apartment.html', text: 'Apartment Management', active: true }
//     ]
// });
//
// ============================================================================

const SubNavbarManager = {
    // Page-specific subnavbar configurations
    // Format: { 'page.html': { items: [...], type: 'tabs|pills|links', id: '...' } }
    pageSubnavbars: {},
    
    /**
     * Register a subnavbar for a specific page
     * @param {string} pageName - The page filename (e.g., 'apartment.html')
     * @param {Object} config - Configuration object with items, type, and optional id
     * @param {Array} config.items - Array of subnavbar items {href, text, id, active?}
     * @param {string} config.type - Type of subnavbar: 'tabs', 'pills', 'links', or 'breadcrumbs'
     * @param {string} config.id - Optional ID for the subnavbar container
     */
    registerPageSubnavbar(pageName, config) {
        if (!config.items || !Array.isArray(config.items)) {
            console.error('SubNavbarManager: config.items must be an array');
            return;
        }
        
        if (!config.type || !['tabs', 'pills', 'links', 'breadcrumbs'].includes(config.type)) {
            console.error('SubNavbarManager: config.type must be one of: tabs, pills, links, breadcrumbs');
            return;
        }
        
        this.pageSubnavbars[pageName] = {
            items: config.items,
            type: config.type,
            id: config.id || `subnavbar-${pageName.replace('.html', '')}`,
            containerClass: config.containerClass || 'container',
            sticky: config.sticky !== undefined ? config.sticky : false
        };
    },
    
    /**
     * Get subnavbar configuration for current page
     * @returns {Object|null} Subnavbar configuration or null if not found
     */
    getCurrentPageSubnavbar() {
        const currentPage = NavbarManager.getCurrentPage();
        return this.pageSubnavbars[currentPage] || null;
    },
    
    /**
     * Generate subnavbar HTML
     * @param {Object} config - Subnavbar configuration
     * @returns {string} Subnavbar HTML
     */
    generateSubnavbarHTML(config) {
        if (!config) return '';
        
        const { items, type, id, containerClass, sticky } = config;
        const currentPage = NavbarManager.getCurrentPage();
        
        let itemsHTML = '';
        
        if (type === 'breadcrumbs') {
            // Generate breadcrumb navigation
            itemsHTML = items.map((item, index) => {
                const isLast = index === items.length - 1;
                const isActive = item.active || NavbarManager.isActivePage(item.href);
                
                if (isLast || isActive) {
                    return `<li class="breadcrumb-item active" aria-current="page">${item.text}</li>`;
                } else {
                    return `<li class="breadcrumb-item"><a href="${item.href}">${item.text}</a></li>`;
                }
            }).join('');
            
            return `
    <!-- SubNavbar: Breadcrumbs -->
    <nav aria-label="breadcrumb" id="${id}" class="subnavbar ${sticky ? 'sticky-top' : ''}" style="background-color: #f8f9fa; padding: 0.75rem 0; border-bottom: 1px solid #dee2e6;">
        <div class="${containerClass}">
            <ol class="breadcrumb mb-0">
${itemsHTML}
            </ol>
        </div>
    </nav>`;
        } else if (type === 'tabs' || type === 'pills') {
            // Generate tabs or pills navigation
            itemsHTML = items.map(item => {
                const isActive = item.active || NavbarManager.isActivePage(item.href);
                const activeClass = isActive ? 'active' : '';
                const ariaCurrent = isActive ? ' aria-current="page"' : '';
                const targetId = item.target || item.href.replace('.html', '').replace(/[^a-z0-9]/gi, '-');
                
                // Check if it's a tab button (data-bs-toggle) or regular link
                if (item.tabTarget) {
                    return `
                <li class="nav-item" role="presentation">
                    <button class="nav-link ${activeClass}"${ariaCurrent} id="${item.id || ''}" data-bs-toggle="tab" data-bs-target="${item.tabTarget}" type="button" role="tab">${item.text}</button>
                </li>`;
                } else {
                    return `
                <li class="nav-item" role="presentation">
                    <a class="nav-link ${activeClass}"${ariaCurrent} href="${item.href}" id="${item.id || ''}">${item.text}</a>
                </li>`;
                }
            }).join('');
            
            const navClass = type === 'tabs' ? 'nav-tabs' : 'nav-pills';
            
            return `
    <!-- SubNavbar: ${type === 'tabs' ? 'Tabs' : 'Pills'} -->
    <nav id="${id}" class="subnavbar ${sticky ? 'sticky-top' : ''}" style="background-color: #f8f9fa; padding: 0.75rem 0; border-bottom: 1px solid #dee2e6;">
        <div class="${containerClass}">
            <ul class="nav ${navClass}" role="tablist">
${itemsHTML}
            </ul>
        </div>
    </nav>`;
        } else {
            // Generate simple links navigation
            itemsHTML = items.map(item => {
                const isActive = item.active || NavbarManager.isActivePage(item.href);
                const activeClass = isActive ? 'active' : '';
                const ariaCurrent = isActive ? ' aria-current="page"' : '';
                
                return `
                <li class="nav-item">
                    <a class="nav-link ${activeClass}"${ariaCurrent} href="${item.href}" id="${item.id || ''}">${item.text}</a>
                </li>`;
            }).join('');
            
            return `
    <!-- SubNavbar: Links -->
    <nav id="${id}" class="subnavbar ${sticky ? 'sticky-top' : ''}" style="background-color: #f8f9fa; padding: 0.75rem 0; border-bottom: 1px solid #dee2e6;">
        <div class="${containerClass}">
            <ul class="nav">
${itemsHTML}
            </ul>
        </div>
    </nav>`;
        }
    },
    
    /**
     * Initialize subnavbar for current page
     * Inserts subnavbar after the main navbar if configuration exists
     */
    init() {
        const config = this.getCurrentPageSubnavbar();
        if (!config) return;
        
        // Check if subnavbar already exists
        const existingSubnavbar = document.getElementById(config.id);
        if (existingSubnavbar) {
            // Replace existing subnavbar
            const subnavbarHTML = this.generateSubnavbarHTML(config);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = subnavbarHTML.trim();
            const newSubnavbar = tempDiv.firstElementChild;
            existingSubnavbar.parentNode.replaceChild(newSubnavbar, existingSubnavbar);
        } else {
            // Find main navbar and insert subnavbar after it
            const mainNavbar = document.querySelector('nav.navbar');
            if (mainNavbar && mainNavbar.nextSibling) {
                const subnavbarHTML = this.generateSubnavbarHTML(config);
                mainNavbar.insertAdjacentHTML('afterend', subnavbarHTML);
            } else if (mainNavbar) {
                const subnavbarHTML = this.generateSubnavbarHTML(config);
                mainNavbar.insertAdjacentHTML('afterend', subnavbarHTML);
            }
        }
    },
    
    /**
     * Remove subnavbar from current page
     */
    remove() {
        const config = this.getCurrentPageSubnavbar();
        if (!config) return;
        
        const subnavbar = document.getElementById(config.id);
        if (subnavbar) {
            subnavbar.remove();
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.SubNavbarManager = SubNavbarManager;
}

// Auto-initialize if document is available
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Wait for NavbarManager to initialize first
            setTimeout(() => {
                SubNavbarManager.init();
            }, 100);
        });
    } else {
        // Document already loaded
        setTimeout(() => {
            SubNavbarManager.init();
        }, 100);
    }
}

