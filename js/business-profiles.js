// Business Profiles Loader
// Dynamically populates business information on tier pages based on business code

document.addEventListener('DOMContentLoaded', function() {
    // Find all business sections
    const businessCards = document.querySelectorAll('.card.mt-4');
    
    businessCards.forEach(card => {
        // Find the business code in this card
        let businessCode = null;
        const paragraphs = card.querySelectorAll('p');
        
        paragraphs.forEach(p => {
            const text = p.textContent || '';
            if (text.includes('Business Code:')) {
                businessCode = text.replace('Business Code:', '').trim();
            }
        });
        
        if (!businessCode) return;
        
        // Get business data from config
        const business = getBusinessByCode(businessCode);
        if (!business) return;
        
        // Update business information in the card
        paragraphs.forEach(p => {
            const text = p.textContent || '';
            const innerHTML = p.innerHTML || '';
            
            // Update Business Name
            if (text.includes('Business Name:')) {
                if (business.name) {
                    p.innerHTML = `<strong>Business Name:</strong> ${business.name}`;
                }
            }
            
            // Update Status
            if (text.includes('Status:')) {
                let statusColor = 'green';
                if (business.status === 'Open') {
                    statusColor = 'green';
                } else if (business.status === 'Closed' || business.status === 'Not Purchased') {
                    statusColor = 'red';
                }
                p.innerHTML = `<strong>Status:</strong> <strong style="color: ${statusColor};">${business.status}</strong>`;
            }
            
            // Remove Slogan field if it exists (for tier_2, no longer needed)
            if (text.includes('Slogan:')) {
                p.remove();
            }
            
            // Update Can Collect Items
            if (text.includes('Can Collect Items:')) {
                const canCollect = business.canCollectItems ? '✅' : '❌';
                p.innerHTML = `<strong>Can Collect Items:</strong> ${canCollect}`;
            }
            
            // Update Storage Capacity
            if (text.includes('Storage Capacity:')) {
                const capacity = business.storageCapacity !== undefined ? business.storageCapacity : 0;
                // Format number with commas
                const formattedCapacity = capacity.toLocaleString('en-US');
                p.innerHTML = `<strong>Storage Capacity:</strong> <span class="storage-capacity">${formattedCapacity}</span>`;
            }
            
            // Update Business level at 50
            if (text.includes('Business level at 50:')) {
                const value = business.businessLevelAt50 || 'Unknown';
                let color = '';
                if (value === 'Yes') {
                    color = 'green';
                } else if (value === 'No') {
                    color = 'salmon';
                }
                // Unknown stays default (no color)
                const colorStyle = color ? ` style="color: ${color};"` : '';
                p.innerHTML = `<strong>Business level at 50:</strong> <span class="business-level-at-50"${colorStyle}>${value}</span>`;
            }
            
            // Update All employees max level
            if (text.includes('All employees max level:')) {
                const value = business.allEmployeesMaxLevel || 'Unknown';
                let color = '';
                if (value === 'Yes') {
                    color = 'green';
                } else if (value === 'No') {
                    color = 'salmon';
                }
                // Unknown stays default (no color)
                const colorStyle = color ? ` style="color: ${color};"` : '';
                p.innerHTML = `<strong>All employees max level:</strong> <span class="all-employees-max-level" data-bs-toggle="tooltip" data-bs-placement="top" title="Training and level is 10 both level 10"${colorStyle}>${value}</span>`;
            }
        });
    });
    
    // Function to initialize Bootstrap tooltips
    function initializeTooltips() {
        // Dispose of existing tooltips first to avoid duplicates
        const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        existingTooltips.forEach(function(el) {
            const existingTooltip = bootstrap.Tooltip.getInstance(el);
            if (existingTooltip) {
                existingTooltip.dispose();
            }
        });
        
        // Initialize new tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Initialize Bootstrap tooltips after business profiles are loaded
    // Use setTimeout to ensure DOM is updated
    setTimeout(initializeTooltips, 100);
    
    // Also initialize tooltips when API data loads (in case profiles are updated)
    window.addEventListener('apiDataLoaded', function() {
        setTimeout(initializeTooltips, 100);
    });
});

