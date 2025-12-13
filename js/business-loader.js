/**
 * Business Loader - Client-side module
 * Loads business data from database via API or local storage
 */

class BusinessLoader {
    constructor() {
        this.apiUrl = '/api/businesses'; // Adjust to your API endpoint
        this.useLocalStorage = true; // Fallback to localStorage if API unavailable
    }

    /**
     * Fetch business data from API
     */
    async fetchBusinessFromAPI(businessCode) {
        try {
            const response = await fetch(`${this.apiUrl}/${businessCode}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('API fetch failed, using localStorage:', error);
        }
        return null;
    }

    /**
     * Get business from localStorage
     */
    getBusinessFromStorage(businessCode) {
        const businesses = JSON.parse(localStorage.getItem('businesses') || '{}');
        return businesses[businessCode] || null;
    }

    /**
     * Get business data (tries API first, then localStorage)
     */
    async getBusiness(businessCode) {
        // Try API first
        const apiBusiness = await this.fetchBusinessFromAPI(businessCode);
        if (apiBusiness) {
            return apiBusiness;
        }

        // Fallback to localStorage
        if (this.useLocalStorage) {
            return this.getBusinessFromStorage(businessCode);
        }

        return null;
    }

    /**
     * Update business display with data from database
     */
    async updateBusinessDisplay(businessCode, containerSelector) {
        const business = await this.getBusiness(businessCode);
        if (!business) {
            console.warn(`Business ${businessCode} not found`);
            return;
        }

        const container = document.querySelector(containerSelector);
        if (!container) {
            console.warn(`Container ${containerSelector} not found`);
            return;
        }

        // Update Is Business 50 field
        const isBusiness50Element = container.querySelector('[data-field="is-business-50"]');
        if (isBusiness50Element) {
            isBusiness50Element.textContent = business.is_business_50 ? '✅ Yes' : '❌ No';
        } else {
            // Create the field if it doesn't exist
            const businessInfo = container.querySelector('.card-body');
            if (businessInfo) {
                const isBusiness50P = document.createElement('p');
                isBusiness50P.innerHTML = `<strong>Is Business 50:</strong> ${business.is_business_50 ? '✅ Yes' : '❌ No'}`;
                businessInfo.insertBefore(isBusiness50P, businessInfo.querySelector('p:last-of-type'));
            }
        }

        // Update Storage Capacity field
        const storageCapacityElement = container.querySelector('[data-field="storage-capacity"]');
        if (storageCapacityElement) {
            storageCapacityElement.textContent = business.storage_capacity || 0;
        } else {
            // Create the field if it doesn't exist
            const businessInfo = container.querySelector('.card-body');
            if (businessInfo) {
                const storageCapacityP = document.createElement('p');
                storageCapacityP.innerHTML = `<strong>Storage Capacity:</strong> <span data-field="storage-capacity">${business.storage_capacity || 0}</span>`;
                businessInfo.insertBefore(storageCapacityP, businessInfo.querySelector('p:last-of-type'));
            }
        }
    }

    /**
     * Update all businesses on the page
     */
    async updateAllBusinesses() {
        // Find all business cards
        const businessCards = document.querySelectorAll('.card.mt-4 .card-body');
        
        for (const card of businessCards) {
            // Extract business code from the card
            const businessCodeElement = card.querySelector('p:has(strong:contains("Business Code"))');
            if (businessCodeElement) {
                const match = businessCodeElement.textContent.match(/Business Code:\s*(.+)/i);
                if (match) {
                    const businessCode = match[1].trim();
                    await this.updateBusinessDisplay(businessCode, `.card.mt-4:has([data-business-code="${businessCode}"])`);
                }
            }
        }
    }

    /**
     * Initialize business data from server-side data attribute
     */
    initFromDataAttribute() {
        // Check if business data is embedded in page
        const businessDataScript = document.querySelector('script[type="application/json"][data-businesses]');
        if (businessDataScript) {
            try {
                const businesses = JSON.parse(businessDataScript.textContent);
                localStorage.setItem('businesses', JSON.stringify(businesses));
            } catch (error) {
                console.error('Failed to parse business data:', error);
            }
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = new BusinessLoader();
    loader.initFromDataAttribute();
    // Uncomment to auto-update all businesses on page load
    // loader.updateAllBusinesses();
});

// Export for manual use
window.BusinessLoader = BusinessLoader;

