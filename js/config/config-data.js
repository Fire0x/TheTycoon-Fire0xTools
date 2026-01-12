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
    
    // Hero section data for each page
    heroSections: {
        'index.html': {
            title: 'Welcome to The Tycoon',
            description: 'Your comprehensive resource for managing businesses, tracking progress, and optimizing your gameplay experience.'
        },
        'Info.html': {
            title: 'Information',
            description: 'Your comprehensive information and documentation hub.'
        },
        'Info-Ref.html': {
            title: 'Information Reference',
            description: 'Reference information for The Tycoon tools.'
        },
        'merchants.html': {
            title: 'Traveling Merchants',
            description: 'Track traveling merchants, their rotations, locations, prices, and timers.'
        },
        'checklist.html': {
            title: 'Business Checklist',
            description: 'Comprehensive business management tool with tier and business creation, editing, and tracking.'
        },
        'checklist-1.html': {
            title: 'Business Checklist - Testing',
            description: 'Testing version of the business checklist tool.'
        },
        'VehicleDeliveries.html': {
            title: 'Vehicle Deliveries',
            description: 'Track vehicle delivery progress and unlock requirements.'
        },
        'education_timer.html': {
            title: 'Education Timer',
            description: 'Monitor education and training timers with real-time countdowns.'
        },
        'apartment.html': {
            title: '🏠 Apartment Management',
            description: 'Manage your apartments, rental due dates, and cleaning schedules'
        },
        'changelog.html': {
            title: 'Changelog',
            description: 'Summary of updates and improvements across all TheTycoon tools.'
        }
    },
    
    // Website overall version
    websiteVersion: '0.1.9',
    
    // Individual page versions
    pageVersions: {
        'index.html': '0.0.6',
        'Info.html': '0.1.2',
        'merchants.html': '0.0.9',
        'checklist.html': '0.2.1',
        'VehicleDeliveries.html': '0.1.6',
        'education_timer.html': '0.1.2',
        'apartment.html': '0.1.4',
        'Info-Ref.html': '0.1.2',
        'checklist-1.html': '0.0.8',
        'changelog.html': '0.0.3'
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.ConfigData = ConfigData;
}


