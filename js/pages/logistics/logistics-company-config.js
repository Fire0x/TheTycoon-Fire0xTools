// logistics/js/logistics-company-config.js
// Company-specific configuration (company name mappings removed)

const LogisticsCompanyConfig = {
    // Company-specific settings (can be extended)
    companySettings: {},
    
    // Save config to localStorage
    save() {
        try {
            localStorage.setItem('logistics_company_config', JSON.stringify({
                companySettings: this.companySettings
            }));
            if (window.debug) window.debug.log('Logistics company config saved');
        } catch (error) {
            if (window.debug) window.debug.error('Error saving logistics company config:', error);
        }
    },
    
    // Load config from localStorage
    load() {
        try {
            const stored = localStorage.getItem('logistics_company_config');
            if (stored) {
                const config = JSON.parse(stored);
                this.companySettings = config.companySettings ?? {};
                if (window.debug) window.debug.log('Logistics company config loaded');
            }
        } catch (error) {
            if (window.debug) window.debug.error('Error loading logistics company config:', error);
        }
    },
    
    // Get company setting
    getCompanySetting(companyName, settingKey, defaultValue = null) {
        const companyKey = companyName.toLowerCase();
        if (this.companySettings[companyKey] && this.companySettings[companyKey][settingKey] !== undefined) {
            return this.companySettings[companyKey][settingKey];
        }
        return defaultValue;
    },
    
    // Set company setting
    setCompanySetting(companyName, settingKey, value) {
        const companyKey = companyName.toLowerCase();
        if (!this.companySettings[companyKey]) {
            this.companySettings[companyKey] = {};
        }
        this.companySettings[companyKey][settingKey] = value;
        this.save();
    }
};

// Load config on initialization
LogisticsCompanyConfig.load();

// Make available globally
if (typeof window !== 'undefined') {
    window.LogisticsCompanyConfig = LogisticsCompanyConfig;
}
