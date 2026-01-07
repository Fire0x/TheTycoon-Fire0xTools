/**
 * Configuration Data
 * Centralized data for site branding, page titles, and versions
 */

const ConfigData = {
    // Site branding information
    siteName: 'TheTycoon - Fire0x Tools',
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
    disclaimer: 'This website is not affiliated with, endorsed by, or officially connected to Rockstar North, Take-Two Interactive, The Tycoons FiveM Server, or any other rights holders. All trademarks and intellectual property used herein are the property of their respective owners.',
    
    // Page titles mapping
    pageTitles: {
        'index.html': 'Home',
        'Info.html': 'Information',
        'merchants.html': 'Traveling Merchants',
        'checklist.html': 'Business Checklist',
        'checklist-1.html': 'Business Checklist - Testing',
        'VehicleDeliveries.html': 'Vehicle Deliveries',
        'education_timer.html': 'Education Timer',
        'apartment.html': 'Apartment Management',
        'changelog.html': 'Changelog'
    },
    
    // Website overall version
    websiteVersion: '0.1.7',
    
    // Individual page versions
    pageVersions: {
        'index.html': '0.0.4',
        'Info.html': '0.1.0',
        'merchants.html': '0.0.7',
        'checklist.html': '0.1.9',
        'VehicleDeliveries.html': '0.1.4',
        'education_timer.html': '0.1.0',
        'apartment.html': '0.1.2',
        'Info-Ref.html': '0.1.0',
        'checklist-1.html': '0.0.5',
        'changelog.html': '0.1.0'
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.ConfigData = ConfigData;
}

