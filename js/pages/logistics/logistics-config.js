// logistics/js/logistics-config.js
// Configuration for calculations

const LogisticsConfig = {
    // Reputation bonus for "Highest Rep per Company" calculation
    repBonusPerCompany: 3,
    
    // Level filter mode: 'exact' = only that level, 'below' = that level and below
    levelFilterMode: 'below', // 'exact' or 'below'
    
    // Enabled calculation types
    enabledCalculations: {
        highestMoney: true,
        bestConvoy: true,
        bestHazard: true,
        highestRep: true,
        highestRepPerCompany: true,
        highestRepPerMilePerCompany: true
    },
    
    // Save config to localStorage
    save() {
        try {
            localStorage.setItem('logistics_config', JSON.stringify({
                repBonusPerCompany: this.repBonusPerCompany,
                levelFilterMode: this.levelFilterMode,
                enabledCalculations: this.enabledCalculations
            }));
            if (window.debug) window.debug.log('Logistics config saved');
        } catch (error) {
            if (window.debug) window.debug.error('Error saving logistics config:', error);
        }
    },
    
    // Load config from localStorage
    load() {
        try {
            const stored = localStorage.getItem('logistics_config');
            if (stored) {
                const config = JSON.parse(stored);
                this.repBonusPerCompany = config.repBonusPerCompany ?? 3;
                this.levelFilterMode = config.levelFilterMode ?? 'below';
                this.enabledCalculations = { ...this.enabledCalculations, ...(config.enabledCalculations ?? {}) };
                if (window.debug) window.debug.log('Logistics config loaded');
            }
        } catch (error) {
            if (window.debug) window.debug.error('Error loading logistics config:', error);
        }
    }
};

// Load config on initialization
LogisticsConfig.load();

// Make available globally
if (typeof window !== 'undefined') {
    window.LogisticsConfig = LogisticsConfig;
}
