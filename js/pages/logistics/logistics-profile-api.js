// logistics/js/logistics-profile-api.js
// localStorage-based functions for company reputation (replaces API calls)
// Version: 2.0.0 - localStorage only, no API calls

// Get all companies from localStorage
window.getAllCompanyReps = async function() {
    try {
        if (typeof LogisticsStorage === 'undefined') {
            if (window.debug) window.debug.error('LogisticsStorage API not available');
            return [];
        }
        
        if (window.debug) window.debug.log('Loading all companies from localStorage...');
        const data = LogisticsStorage.read();
        const companies = data.companies || [];
        if (window.debug) window.debug.log(`Loaded ${companies.length} company/companies from localStorage`);
        return companies;
    } catch (error) {
        if (window.debug) window.debug.error('Error loading companies:', error);
        return [];
    }
};

// Get company by name from localStorage
window.getCompanyRep = async function(companyName) {
    try {
        if (typeof LogisticsStorage === 'undefined') {
            if (window.debug) window.debug.error('LogisticsStorage API not available');
            return null;
        }
        
        if (window.debug) window.debug.log(`Loading company: ${companyName}`);
        const data = LogisticsStorage.read();
        const companies = data.companies || [];
        const company = companies.find(c => 
            (c.company_name || '').toLowerCase() === (companyName || '').toLowerCase()
        );
        
        if (company) {
            if (window.debug) window.debug.log(`Found company: ${companyName}`, company);
            return company;
        } else {
            if (window.debug) window.debug.log(`Company not found: ${companyName}`);
            return null;
        }
    } catch (error) {
        if (window.debug) window.debug.error(`Error loading company ${companyName}:`, error);
        return null;
    }
};

// Create company in localStorage
window.createCompanyRep = async function(companyData) {
    try {
        if (typeof LogisticsStorage === 'undefined') {
            throw new Error('LogisticsStorage API not available');
        }
        
        if (window.debug) window.debug.log('Creating company:', companyData);
        
        // Ensure company_name is provided
        if (!companyData.company_name) {
            throw new Error('company_name is required');
        }
        
        // Check if company already exists
        const existing = await window.getCompanyRep(companyData.company_name);
        if (existing) {
            throw new Error(`Company "${companyData.company_name}" already exists`);
        }
        
        // Create new company object
        const company = {
            company_name: companyData.company_name,
            motto: companyData.motto || '',
            reputation: companyData.reputation ?? 0,
            total_earnings: companyData.total_earnings ?? 0,
            custom_name: companyData.custom_name || null,
            custom_motto: companyData.custom_motto || null,
            accent_color: companyData.accent_color || null,
            reputation_last_updated: null
        };
        
        // Add to storage
        LogisticsStorage.update(data => {
            if (!data.companies) data.companies = [];
            data.companies.push(company);
            return data;
        });
        
        if (window.debug) window.debug.log('Created company:', company);
        return company;
    } catch (error) {
        if (window.debug) window.debug.error('Error creating company:', error);
        throw error;
    }
};

// Update company in localStorage
window.updateCompanyRep = async function(companyName, updates) {
    try {
        if (typeof LogisticsStorage === 'undefined') {
            throw new Error('LogisticsStorage API not available');
        }
        
        if (window.debug) window.debug.log(`Updating company ${companyName}:`, updates);
        
        // Get existing company to compare
        const existing = await window.getCompanyRep(companyName);
        if (!existing) {
            throw new Error(`Company "${companyName}" not found`);
        }
        
        // Check if reputation changed
        if (updates.reputation !== undefined && updates.reputation !== existing.reputation) {
            // Reputation changed, set last updated timestamp (ISO format)
            updates.reputation_last_updated = new Date().toISOString();
            if (window.debug) window.debug.log(`Reputation changed from ${existing.reputation} to ${updates.reputation}, updating timestamp`);
        }
        
        // Update company in storage
        let updatedCompany = null;
        LogisticsStorage.update(data => {
            if (!data.companies) data.companies = [];
            const index = data.companies.findIndex(c => 
                (c.company_name || '').toLowerCase() === (companyName || '').toLowerCase()
            );
            
            if (index !== -1) {
                // Merge updates with existing company
                updatedCompany = { ...data.companies[index], ...updates };
                data.companies[index] = updatedCompany;
            } else {
                throw new Error(`Company "${companyName}" not found`);
            }
            
            return data;
        });
        
        if (window.debug) window.debug.log('Updated company:', updatedCompany);
        return updatedCompany;
    } catch (error) {
        if (window.debug) window.debug.error(`Error updating company ${companyName}:`, error);
        throw error;
    }
};

// Save company (create or update) in localStorage
window.saveCompanyRep = async function(companyData) {
    try {
        if (window.debug) window.debug.log('Saving company:', companyData);
        
        // Check if company exists
        const existing = await window.getCompanyRep(companyData.company_name);
        
        if (existing) {
            // Update existing
            const updates = {
                motto: companyData.motto,
                total_earnings: companyData.total_earnings
            };
            
            // Include custom_name and custom_motto if provided
            if (companyData.custom_name !== undefined) {
                updates.custom_name = companyData.custom_name;
            }
            if (companyData.custom_motto !== undefined) {
                updates.custom_motto = companyData.custom_motto;
            }
            if (companyData.accent_color !== undefined) {
                updates.accent_color = companyData.accent_color;
            }
            
            // Check if reputation changed
            if (companyData.reputation !== undefined && companyData.reputation !== existing.reputation) {
                updates.reputation = companyData.reputation;
                // Set timestamp when reputation changes (ISO format)
                updates.reputation_last_updated = new Date().toISOString();
                if (window.debug) window.debug.log(`Reputation changed from ${existing.reputation} to ${companyData.reputation}`);
            } else if (companyData.reputation !== undefined) {
                updates.reputation = companyData.reputation;
            }
            
            return await window.updateCompanyRep(companyData.company_name, updates);
        } else {
            // Create new
            return await window.createCompanyRep(companyData);
        }
    } catch (error) {
        if (window.debug) window.debug.error('Error saving company:', error);
        throw error;
    }
};
