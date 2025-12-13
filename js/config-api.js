// API Configuration for TheTycoon
// This file provides the same interface as config.js but fetches data from the API
// Falls back to config.js if API is unavailable

const API_BASE_URL = 'http://localhost:3000/api';

// Cache for API data
let apiDataCache = {
    employees: null,
    businesses: null,
    tiers: null
};

// Fetch from API with error handling
async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn(`API fetch failed for ${endpoint}, using fallback:`, error.message);
        return null;
    }
}

// Initialize API data (call this on page load)
async function loadAPIData() {
    try {
        const [employees, businesses, tiers] = await Promise.all([
            fetchFromAPI('/employees'),
            fetchFromAPI('/businesses'),
            fetchFromAPI('/tiers')
        ]);

        if (employees) apiDataCache.employees = employees;
        if (businesses) apiDataCache.businesses = businesses;
        if (tiers) apiDataCache.tiers = tiers;

        return { employees, businesses, tiers };
    } catch (error) {
        console.error('Failed to load API data:', error);
        return { employees: null, businesses: null, tiers: null };
    }
}

// Convert API employees to employeeConfig format
function getEmployeeConfigFromAPI() {
    if (!apiDataCache.employees) return null;

    const employeeConfig = {};
    apiDataCache.employees.forEach(emp => {
        if (!employeeConfig[emp.tier_file]) {
            employeeConfig[emp.tier_file] = [];
        }
        employeeConfig[emp.tier_file].push({
            name: emp.name,
            tier: emp.tier,
            slogan: emp.slogan,
            businessName: emp.business_name,
            image: emp.image,
            level: emp.level,
            wage: emp.wage,
            trainingStatus: emp.training_status,
            employedBy: emp.employed_by,
            lore: emp.lore
        });
    });
    return employeeConfig;
}

// Convert API businesses to businessConfig format
function getBusinessConfigFromAPI() {
    if (!apiDataCache.businesses) return null;

    const businessConfig = {};
    apiDataCache.businesses.forEach(biz => {
        if (!businessConfig[biz.tier_file]) {
            businessConfig[biz.tier_file] = [];
        }
        businessConfig[biz.tier_file].push({
            code: biz.code,
            name: biz.name,
            slogan: biz.slogan,
            status: biz.status,
            canCollectItems: biz.can_collect_items,
            storageCapacity: biz.storage_capacity || 0,
            businessLevelAt50: biz.business_level_at_50 || 'Unknown',
            allEmployeesMaxLevel: biz.all_employees_max_level || 'Unknown'
        });
    });
    return businessConfig;
}

// Convert API tiers to checklistConfig format
function getChecklistConfigFromAPI() {
    if (!apiDataCache.tiers) return null;

    return {
        tiers: apiDataCache.tiers.map(tier => ({
            name: tier.name,
            icon: tier.icon,
            file: tier.file,
            color: tier.color,
            visible: tier.visible
        }))
    };
}

// Initialize API data on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadAPIData();
    
    // Trigger a custom event when data is loaded
    window.dispatchEvent(new CustomEvent('apiDataLoaded'));
});

// Export functions (same interface as config.js)
function getAllEmployees() {
    if (apiDataCache.employees) {
        return apiDataCache.employees.map(emp => ({
            name: emp.name,
            tier: emp.tier,
            slogan: emp.slogan,
            businessName: emp.business_name,
            image: emp.image || 'images/default danny.png',
            level: emp.level || 1,
            wage: emp.wage,
            trainingStatus: emp.training_status,
            employedBy: emp.employed_by,
            lore: emp.lore
        }));
    }
    // Fallback to config.js functions if available
    if (typeof getAllEmployeesFromConfig === 'function') {
        return getAllEmployeesFromConfig();
    }
    return [];
}

function getEmployeesForPage(pageName) {
    if (apiDataCache.employees) {
        return apiDataCache.employees
            .filter(emp => emp.tier_file === pageName)
            .map(emp => ({
                name: emp.name,
                tier: emp.tier,
                slogan: emp.slogan,
                businessName: emp.business_name,
                image: emp.image || 'images/default danny.png',
                level: emp.level || 1,
                wage: emp.wage,
                trainingStatus: emp.training_status,
                employedBy: emp.employed_by,
                lore: emp.lore
            }));
    }
    // Fallback
    if (typeof getEmployeesForPageFromConfig === 'function') {
        return getEmployeesForPageFromConfig(pageName);
    }
    return [];
}

function getEmployeesForBusiness(businessName) {
    if (apiDataCache.employees) {
        // Match by business_name first (primary), then fallback to slogan for backwards compatibility
        return apiDataCache.employees
            .filter(emp => 
                (emp.business_name && emp.business_name === businessName) || 
                (emp.business_name && emp.business_name.trim() === businessName.trim()) ||
                (emp.slogan && emp.slogan === businessName) ||
                (emp.slogan && emp.slogan.trim() === businessName.trim())
            )
            .map(emp => ({
                name: emp.name,
                tier: emp.tier,
                slogan: emp.slogan,
                businessName: emp.business_name,
                image: emp.image || 'images/default danny.png',
                level: emp.level || 1,
                wage: emp.wage,
                trainingStatus: emp.training_status,
                employedBy: emp.employed_by,
                lore: emp.lore
            }));
    }
    // Fallback
    if (typeof getEmployeesForBusinessFromConfig === 'function') {
        return getEmployeesForBusinessFromConfig(businessName);
    }
    return [];
}

function getAllBusinesses() {
    if (apiDataCache.businesses) {
        return apiDataCache.businesses.map(biz => ({
            code: biz.code,
            name: biz.name,
            slogan: biz.slogan,
            status: biz.status,
            canCollectItems: biz.can_collect_items,
            storageCapacity: biz.storage_capacity || 0,
            businessLevelAt50: biz.business_level_at_50 || 'Unknown',
            allEmployeesMaxLevel: biz.all_employees_max_level || 'Unknown',
            page: biz.tier_file
        }));
    }
    // Fallback
    if (typeof getAllBusinessesFromConfig === 'function') {
        return getAllBusinessesFromConfig();
    }
    return [];
}

function getBusinessesForPage(pageName) {
    if (apiDataCache.businesses) {
        return apiDataCache.businesses
            .filter(biz => biz.tier_file === pageName)
            .map(biz => ({
                code: biz.code,
                name: biz.name,
                slogan: biz.slogan,
                status: biz.status,
                canCollectItems: biz.can_collect_items,
                storageCapacity: biz.storage_capacity || 0,
                businessLevelAt50: biz.business_level_at_50 || 'Unknown',
                allEmployeesMaxLevel: biz.all_employees_max_level || 'Unknown'
            }));
    }
    // Fallback
    if (typeof getBusinessesForPageFromConfig === 'function') {
        return getBusinessesForPageFromConfig(pageName);
    }
    return [];
}

function getBusinessByCode(businessCode) {
    if (apiDataCache.businesses) {
        const biz = apiDataCache.businesses.find(b => b.code === businessCode);
        if (biz) {
            return {
                code: biz.code,
                name: biz.name,
                slogan: biz.slogan,
                status: biz.status,
                canCollectItems: biz.can_collect_items,
                storageCapacity: biz.storage_capacity || 0,
                businessLevelAt50: biz.business_level_at_50 || 'Unknown',
                allEmployeesMaxLevel: biz.all_employees_max_level || 'Unknown'
            };
        }
    }
    // Fallback
    if (typeof getBusinessByCodeFromConfig === 'function') {
        return getBusinessByCodeFromConfig(businessCode);
    }
    return null;
}

