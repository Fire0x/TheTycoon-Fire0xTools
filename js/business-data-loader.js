/**
 * Business Data Loader - Client-side module
 * Loads business and employee data from database via API or local storage
 */

class BusinessDataLoader {
    constructor() {
        this.apiUrl = '/api'; // Adjust to your API endpoint
        this.useLocalStorage = true; // Fallback to localStorage if API unavailable
        this.cache = new Map(); // In-memory cache for API responses
        this.pendingRequests = new Map(); // Deduplicate concurrent requests
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache expiry
    }

    /**
     * Fetch business data from API (with caching and request deduplication)
     */
    async fetchBusinessFromAPI(businessCode) {
        // Check cache first
        const cached = this.cache.get(businessCode);
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            console.log(`📦 Loaded ${businessCode} from cache`);
            return cached.data;
        }
        
        // Check if request is already pending (deduplication)
        if (this.pendingRequests.has(businessCode)) {
            console.log(`⏳ Waiting for pending request for ${businessCode}`);
            return await this.pendingRequests.get(businessCode);
        }
        
        // Create new request
        const requestPromise = (async () => {
            try {
                const response = await fetch(`${this.apiUrl}/businesses/${businessCode}`, {
                    headers: {
                        'Cache-Control': 'max-age=300' // Respect server cache
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    // Store in cache
                    this.cache.set(businessCode, {
                        data: data,
                        timestamp: Date.now()
                    });
                    return data;
                }
            } catch (error) {
                console.warn('API fetch failed:', error);
            } finally {
                // Remove from pending requests
                this.pendingRequests.delete(businessCode);
            }
            return null;
        })();
        
        // Store pending request
        this.pendingRequests.set(businessCode, requestPromise);
        return await requestPromise;
    }

    /**
     * Get business from localStorage or static JSON file
     */
    async getBusinessFromStorage(businessCode) {
        // Try loading from static JSON file first (always get fresh data)
        try {
            const response = await fetch('js/businesses-data.json?t=' + Date.now()); // Cache bust
            if (response.ok) {
                const businesses = await response.json();
                // Store in localStorage for future use
                localStorage.setItem('businesses', JSON.stringify(businesses));
                console.log(`📦 Loaded businesses data from JSON file`);
                return businesses[businessCode] || null;
            } else {
                console.warn(`⚠️ Could not fetch businesses-data.json: ${response.status}`);
            }
        } catch (error) {
            console.warn('⚠️ Could not load businesses-data.json:', error);
        }
        
        // Fallback to localStorage
        const stored = localStorage.getItem('businesses');
        if (stored) {
            try {
                const businesses = JSON.parse(stored);
                if (businesses[businessCode]) {
                    console.log(`📦 Loaded ${businessCode} from localStorage`);
                    return businesses[businessCode];
                }
            } catch (e) {
                console.warn('⚠️ Error parsing localStorage data:', e);
            }
        }
        
        return null;
    }

    /**
     * Get business data (tries cache first, then API, then static JSON file/localStorage)
     */
    async getBusiness(businessCode) {
        // Try API first (which checks cache internally)
        const apiBusiness = await this.fetchBusinessFromAPI(businessCode);
        if (apiBusiness) {
            // If API doesn't have collection_storage, get it from JSON
            if (apiBusiness.collection_storage === undefined || apiBusiness.collection_storage === null) {
                const stored = await this.getBusinessFromStorage(businessCode);
                if (stored && stored.collection_storage !== undefined) {
                    apiBusiness.collection_storage = stored.collection_storage;
                }
            }
            console.log(`✅ Loaded ${businessCode} from API/cache`);
            return apiBusiness;
        }

        // Fallback to static JSON file or localStorage
        if (this.useLocalStorage) {
            const stored = await this.getBusinessFromStorage(businessCode);
            if (stored) {
                console.log(`✅ Loaded ${businessCode} from storage/JSON`);
                // Cache the stored data too
                this.cache.set(businessCode, {
                    data: stored,
                    timestamp: Date.now()
                });
                return stored;
            }
        }

        console.warn(`⚠️ Could not load ${businessCode}`);
        return null;
    }
    
    /**
     * Clear cache (useful for forcing refresh)
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache cleared');
    }

    /**
     * Update business display with data from database
     */
    async updateBusinessDisplay(businessCode) {
        const business = await this.getBusiness(businessCode);
        if (!business) {
            console.warn(`Business ${businessCode} not found`);
            return;
        }

        // Find the business card by business code
        // Look for all paragraphs and find the one with Business Code
        const allParagraphs = document.querySelectorAll('p');
        let container = null;

        for (const element of allParagraphs) {
            if (element.textContent.includes('Business Code:') && element.textContent.includes(businessCode)) {
                container = element.closest('.card-body');
                break;
            }
        }

        if (!container) {
            console.warn(`Container for business ${businessCode} not found`);
            return;
        }

        console.log(`📝 Updating display for ${businessCode}...`, business);
        
        // Update business info fields (async to handle JSON fallback for collection_storage)
        await this.updateBusinessInfo(container, business);
        
        // Update employees table
        this.updateEmployeesTable(container, business.employees || []);
        
        console.log(`✅ Updated ${businessCode} display`);
    }

    /**
     * Update business information fields
     */
    async updateBusinessInfo(container, business) {
        // Get business code for logging and JSON fallback
        const businessCode = business.business_code || business.code || 'Unknown';
        
        // Update Is Business 50 (based on Business_level_at == 50)
        const businessLevel = (business.Business_level_at !== undefined && business.Business_level_at !== null) ? business.Business_level_at : 0;
        const isBusiness50 = businessLevel === 50;
        
        let isBusiness50Element = container.querySelector('[data-field="is-business-50"]');
        if (isBusiness50Element) {
            isBusiness50Element.textContent = isBusiness50 ? '✅ Yes' : '❌ No';
            console.log(`  ✅ Updated Is Business 50: ${isBusiness50 ? 'Yes' : 'No'}`);
        } else {
            console.warn(`  ⚠️ Is Business 50 element not found for ${businessCode}`);
        }

        // Update Is All Employees Max (from all_employees_max_level column - supports both naming conventions)
        const allEmployeesMaxLevel = business.all_employees_max_level || business.All_employees_max_level || 'Unknown';
        
        let isAllEmployeesMaxElement = container.querySelector('[data-field="is-all-employees-max"]');
        if (isAllEmployeesMaxElement) {
            const displayValue = allEmployeesMaxLevel === 'Yes' ? '✅ Yes' : allEmployeesMaxLevel === 'No' ? '❌ No' : '❓ Unknown';
            isAllEmployeesMaxElement.textContent = displayValue;
            console.log(`  ✅ Updated Is All Employees Max: ${displayValue}`);
        } else {
            console.warn(`  ⚠️ Is All Employees Max element not found for ${businessCode}`);
        }

        // Update Storage Capacity (with comma formatting)
        let storageCapacityElement = container.querySelector('[data-field="storage-capacity"]');
        if (storageCapacityElement) {
            const capacity = business.storage_capacity || 0;
            const formattedCapacity = capacity.toLocaleString('en-US');
            storageCapacityElement.textContent = formattedCapacity;
            console.log(`  ✅ Updated Storage Capacity: ${formattedCapacity}`);
        } else {
            console.warn(`  ⚠️ Storage Capacity element not found for ${businessCode}`);
        }

        // Update Collection Storage (with comma formatting, show 0 if null or 0)
        let collectionStorageElement = container.querySelector('[data-field="collection-storage"]');
        if (collectionStorageElement) {
            let collectionCapacity = business.collection_storage;
            
            // If collection_storage is missing, try to load from JSON
            if (collectionCapacity === undefined) {
                try {
                    const response = await fetch('js/businesses-data.json?t=' + Date.now());
                    if (response.ok) {
                        const businesses = await response.json();
                        if (businesses[businessCode] && businesses[businessCode].collection_storage !== undefined) {
                            collectionCapacity = businesses[businessCode].collection_storage;
                            console.log(`  ✅ Loaded collection_storage from JSON for ${businessCode}: ${collectionCapacity}`);
                        }
                    }
                } catch (e) {
                    // Ignore errors
                }
            }
            
            let displayValue;
            // Show 0 if null, undefined, or 0; otherwise show formatted amount
            if (collectionCapacity === null || collectionCapacity === undefined || collectionCapacity === 0) {
                displayValue = '0';
            } else {
                // Use formatNumberDisplay if available, otherwise use toLocaleString
                if (typeof window.formatNumberDisplay === 'function') {
                    displayValue = window.formatNumberDisplay(collectionCapacity, false);
                } else {
                    displayValue = collectionCapacity.toLocaleString('en-US');
                }
            }
            collectionStorageElement.textContent = displayValue;
            console.log(`  ✅ Updated Collection Storage: ${displayValue} (value: ${collectionCapacity})`);
        } else {
            console.warn(`  ⚠️ Collection Storage element not found`);
        }

        // Update other business fields if they exist
        const allParagraphs = container.querySelectorAll('p');
        
        allParagraphs.forEach(p => {
            // Update Business Name (always update from database)
            if (p.textContent.includes('Business Name:') && business.business_name) {
                p.innerHTML = `<strong>Business Name:</strong> ${business.business_name}`;
                console.log(`  ✅ Updated Business Name: ${business.business_name}`);
            }
            
            // Update Status
            if (p.textContent.includes('Status:') && business.status) {
                let color = 'red';
                if (business.status === 'Open') {
                    color = 'green';
                } else if (business.status === 'Not Purchased') {
                    color = 'gray';
                }
                p.innerHTML = `<strong>Status:</strong> <strong style="color: ${color};">${business.status}</strong>`;
            }
        });
    }

    /**
     * Update employees table
     */
    updateEmployeesTable(container, employees) {
        const table = container.querySelector('table');
        if (!table) {
            console.warn('Employee table not found');
            return;
        }

        const tbody = table.querySelector('tbody');
        if (!tbody) {
            console.warn('Table tbody not found');
            return;
        }

        // Clear existing loading message
        tbody.innerHTML = '';

        if (employees.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="7" class="text-center text-muted">No employees assigned</td>';
            tbody.appendChild(row);
            return;
        }

        // Add employee rows
        employees.forEach(employee => {
            const row = document.createElement('tr');
            
            // Check if table has Image column
            const hasImageColumn = Array.from(table.querySelectorAll('th')).some(th => th.textContent.includes('Image'));
            
            let rowHTML = '';
            if (hasImageColumn) {
                rowHTML += `<td><img src="${employee.image_url || 'images/default danny.png'}" alt="${employee.name}" class="img-fluid" style="width: 50px;"></td>`;
            }
            
            rowHTML += `
                <td>${employee.name || ''}</td>
                <td>${employee.level || 1}</td>
                <td>${employee.wage || 0}</td>
                <td>${employee.training_status || 'Not Started'}</td>
                <td>${employee.employed_by || ''}</td>
                <td>${employee.lore || ''}</td>
            `;
            
            row.innerHTML = rowHTML;
            tbody.appendChild(row);
        });
    }

    /**
     * Update all businesses on the page
     */
    async updateAllBusinesses() {
        // Find all business code elements by searching all paragraphs
        const allParagraphs = document.querySelectorAll('p');
        const businessCodes = [];

        allParagraphs.forEach(element => {
            if (element.textContent.includes('Business Code:')) {
                const match = element.textContent.match(/Business Code:\s*(.+)/i);
                if (match) {
                    businessCodes.push(match[1].trim());
                }
            }
        });

        console.log(`📊 Found ${businessCodes.length} businesses to update`);

        // Update each business
        for (const businessCode of businessCodes) {
            console.log(`🔄 Updating ${businessCode}...`);
            await this.updateBusinessDisplay(businessCode);
        }
        
        console.log('✅ All businesses updated!');
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
                const businessesMap = {};
                businesses.forEach(biz => {
                    businessesMap[biz.business_code] = biz;
                });
                localStorage.setItem('businesses', JSON.stringify(businessesMap));
            } catch (error) {
                console.error('Failed to parse business data:', error);
            }
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = new BusinessDataLoader();
    loader.initFromDataAttribute();
    // Auto-update all businesses on page load
    loader.updateAllBusinesses();
});

// Export for manual use
window.BusinessDataLoader = BusinessDataLoader;

