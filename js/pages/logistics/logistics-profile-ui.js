// logistics/js/logistics-profile-ui.js
// UI rendering for company reputation cards

// Format timestamp to relative time
function formatRelativeTime(timestamp) {
    if (!timestamp) return '';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    // For older dates, use absolute format
    return time.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: time.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: 'numeric',
        minute: '2-digit'
    });
}

// Use NumberFormatter utility for number formatting

// Render company cards
window.renderCompanyCards = async function() {
    if (window.debug) window.debug.log('=== RENDER COMPANY CARDS STARTED ===');
    
    const container = document.getElementById('companyCardsContainer');
    const emptyState = document.getElementById('companyEmptyState');
    
    if (!container || !emptyState) {
        if (window.debug) window.debug.error('Container or emptyState not found!');
        return;
    }
    
    try {
        const companies = await window.getAllCompanyReps();
        
        if (window.debug) window.debug.log(`Rendering ${companies.length} company/companies`);
        
        if (companies.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            if (window.debug) window.debug.log('No companies to render, showing empty state');
            return;
        }
        
        emptyState.style.display = 'none';
        
        const html = companies.map(company => window.renderCompanyCard(company)).join('');
        container.innerHTML = `<div class="company-cards-grid">${html}</div>`;
        
        // Initialize number formatting for total earnings inputs
        if (typeof window.NumberFormatter !== 'undefined' && typeof window.NumberFormatter.initNumberFormatting === 'function') {
            window.NumberFormatter.initNumberFormatting({
                selector: 'input[data-field="total_earnings"]',
                allowDecimals: true
            });
            if (window.debug) window.debug.log('Number formatting initialized for total earnings inputs');
        }
        
        if (window.debug) window.debug.log(`Rendered ${companies.length} company/companies`);
        if (window.debug) window.debug.log('=== RENDER COMPANY CARDS COMPLETED ===');
        
        // Sync color picker and text input for accent color
        setupAccentColorSync();
        
        // Also update the display view
        if (typeof window.renderCompanyReputationDisplay === 'function') {
            window.renderCompanyReputationDisplay();
        }
    } catch (error) {
        if (window.debug) window.debug.error('Error rendering company cards:', error);
        container.innerHTML = '<p class="text-danger">Error loading companies. Please check the console.</p>';
    }
};

// Render single company card
window.renderCompanyCard = function(company) {
    // Don't escape custom_name - preserve emojis and special characters
    const customName = company.custom_name || '';
    const displayName = customName || company.company_name || 'Unknown';
    const escapedMotto = window.escapeHtml(company.motto || '');
    // Don't escape custom_motto - preserve emojis and special characters
    const customMotto = company.custom_motto || '';
    const accentColor = company.accent_color || '';
    const reputation = company.reputation || 0;
    const earnings = company.total_earnings || 0;
    const lastUpdated = company.reputation_last_updated ? formatRelativeTime(company.reputation_last_updated) : null;
    const companyId = company.id || company.company_name;
    const originalName = company.company_name; // Store original name for lookup
    const originalMotto = company.motto || ''; // Store original motto for lookup
    
    // Escape custom name and motto for HTML attribute values, but preserve emojis in display
    const escapedCustomName = customName.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const escapedCustomMotto = customMotto.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const escapedOriginalName = originalName.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const escapedOriginalMotto = originalMotto.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    
    return `
        <div class="card company-card" id="company-${companyId}" data-company-id="${companyId}" data-original-name="${escapedOriginalName}" data-original-motto="${escapedOriginalMotto}">
            <div class="card-body">
                <h5 class="card-title mb-3" id="card-title-${companyId}">${window.escapeHtml(originalName)}</h5>
                <div class="mb-3">
                    <label class="form-label small text-muted mb-1"><strong>Custom Name</strong> <span class="text-muted small">(optional)</span></label>
                    <input type="text" class="form-control form-control-sm editable-field ${!customName ? 'fst-italic' : ''}" 
                           value="${escapedCustomName || escapedOriginalName}" 
                           placeholder="Enter custom display name..."
                           data-field="custom_name"
                           data-company-id="${companyId}">
                </div>
                <div class="mb-3">
                    <div><strong>Motto:</strong> ${escapedMotto || '<span class="text-muted">No motto</span>'}</div>
                </div>
                <div class="mb-3">
                    <label class="form-label small text-muted mb-1"><strong>Custom Motto</strong> <span class="text-muted small">(optional)</span></label>
                    <textarea class="form-control form-control-sm editable-field ${!customMotto ? 'fst-italic' : ''}" 
                              rows="2"
                              placeholder="Enter custom motto..."
                              data-field="custom_motto"
                              data-company-id="${companyId}">${escapedCustomMotto || escapedOriginalMotto}</textarea>
                </div>
                <div class="mb-3">
                    <div><strong>Reputation:</strong> 
                        <input type="number" class="form-control form-control-sm editable-field d-inline-block" 
                               value="${reputation}" 
                               style="width: 100px; margin-left: 0.5rem;"
                               data-field="reputation"
                               data-company-id="${company.id || company.company_name}">
                        ${lastUpdated ? `<span class="reputation-last-updated ms-2">Last updated: ${lastUpdated}</span>` : ''}
                    </div>
                </div>
                <div class="mb-3">
                    <div><strong>Total Earnings:</strong> 
                        <input type="text" class="form-control form-control-sm editable-field d-inline-block" 
                               value="${window.NumberFormatter ? window.NumberFormatter.formatNumber(earnings, true) : earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}" 
                               style="width: 150px; margin-left: 0.5rem; text-align: right;"
                               data-field="total_earnings"
                               data-company-id="${company.id || company.company_name}">
                        <span class="text-muted small ms-2">($${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(earnings) : earnings.toLocaleString('en-US')})</span>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label small text-muted mb-1"><strong>Accent Color</strong> <span class="text-muted small">(optional)</span></label>
                    <div class="d-flex align-items-center gap-2">
                        <input type="color" class="form-control form-control-color editable-field" 
                               value="${accentColor || '#007bff'}" 
                               data-field="accent_color"
                               data-company-id="${companyId}"
                               style="width: 60px; height: 38px; cursor: pointer;"
                               title="Choose accent color">
                        <input type="text" class="form-control form-control-sm editable-field" 
                               value="${accentColor || ''}" 
                               placeholder="#007bff"
                               data-field="accent_color"
                               data-company-id="${companyId}"
                               pattern="^#[0-9A-Fa-f]{6}$"
                               maxlength="7"
                               style="width: 120px;"
                               title="Hex color code (e.g., #007bff)">
                    </div>
                    <small class="text-muted">Left border accent color for display card</small>
                </div>
                <hr>
                <button class="btn btn-primary btn-sm w-100" onclick="saveCompanyFromCard('${company.id || company.company_name}')">💾 Save</button>
            </div>
        </div>
    `;
};

// Render company reputation display (read-only cards)
window.renderCompanyReputationDisplay = async function() {
    if (window.debug) window.debug.log('=== RENDER COMPANY REPUTATION DISPLAY STARTED ===');
    
    const container = document.getElementById('companyReputationDisplayContainer');
    if (!container) {
        if (window.debug) window.debug.warn('companyReputationDisplayContainer not found');
        return;
    }
    
    try {
        const companies = await window.getAllCompanyReps();
        
        if (window.debug) {
            window.debug.log(`Rendering reputation display for ${companies.length} company/companies`);
            companies.forEach(c => {
                if (c.accent_color) {
                    window.debug.log(`[ACCENT-COLOUR] Company ${c.company_name} has accent colour: ${c.accent_color}`);
                }
            });
        }
        
        if (companies.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No companies found.</p>';
            return;
        }
        
        // Sort by reputation (highest first)
        const sorted = [...companies].sort((a, b) => (b.reputation || 0) - (a.reputation || 0));
        
        const html = sorted.map(company => window.renderCompanyDisplayCard(company)).join('');
        container.innerHTML = `<div class="company-cards-grid">${html}</div>`;
        
        if (window.debug) window.debug.log('=== RENDER COMPANY REPUTATION DISPLAY COMPLETED ===');
    } catch (error) {
        if (window.debug) window.debug.error('Error rendering reputation display:', error);
        container.innerHTML = '<p class="text-danger">Error loading companies. Please check the console.</p>';
    }
};

// Render single company display card (read-only)
window.renderCompanyDisplayCard = function(company) {
    const customName = company.custom_name || '';
    const companyName = company.company_name || 'Unknown';
    const customMotto = company.custom_motto || '';
    const motto = customMotto || company.motto || '';
    const accentColor = company.accent_color || null;
    const reputation = company.reputation || 0;
    // Ensure earnings is a number for proper formatting
    const earnings = typeof company.total_earnings === 'string' 
        ? parseFloat(company.total_earnings.replace(/,/g, '')) || 0
        : company.total_earnings || 0;
    const lastUpdated = company.reputation_last_updated ? formatRelativeTime(company.reputation_last_updated) : null;
    const companyId = company.id || company.company_name;
    
    if (window.debug && accentColor) {
        window.debug.log(`[ACCENT-COLOUR] Rendering display card for ${companyName} with accent colour: ${accentColor}`);
    }
    
    // Title: Show custom name if exists, otherwise company name
    const title = customName || companyName;    
    // Format earnings with 2 decimal places - toLocaleString handles commas and decimals
    const formattedEarnings = earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // Build the style attribute for accent color
    const accentStyle = accentColor ? `style="--accent-color: ${window.escapeHtml(accentColor)};"` : '';
    
    return `
        <div class="card company-display-card" id="company-display-${companyId}">
            <div class="card-body" ${accentStyle}>
                <h5 class="company-display-title">${window.escapeHtml(title)}</h5>
                <div class="company-display-line"><em>${window.escapeHtml(companyName)}</em></div>
                <div class="company-display-line"><strong>Motto:</strong> ${window.escapeHtml(motto || 'No motto')}</div>
                <div class="company-display-line"><strong>Reputation:</strong> ${reputation}</div>
                <div class="company-display-line"><strong>Total Earnings:</strong> $${formattedEarnings}</div>
                ${lastUpdated ? `<div class="company-display-line text-muted small">Last updated: ${lastUpdated}</div>` : ''}
            </div>
        </div>
    `;
};

// Setup accent color sync between color picker and text input
function setupAccentColorSync() {
    // Remove existing listeners to avoid duplicates by using event delegation
    // Add event listeners for accent color inputs using event delegation
    document.addEventListener('input', function(e) {
        if (e.target.dataset.field === 'accent_color') {
            const companyId = e.target.dataset.companyId;
            const inputs = document.querySelectorAll(`input[data-field="accent_color"][data-company-id="${companyId}"]`);
            inputs.forEach(input => {
                if (input !== e.target) {
                    if (input.type === 'color') {
                        // Update color picker from text input
                        const hexValue = e.target.value.trim();
                        if (hexValue.match(/^#[0-9A-Fa-f]{6}$/)) {
                            input.value = hexValue;
                        } else if (hexValue === '') {
                            input.value = '#007bff';
                        }
                    } else {
                        // Update text input from color picker
                        input.value = e.target.value || '';
                    }
                }
            });
        }
    });
}

// Update company card title as user types custom name
window.updateCompanyCardTitle = function(companyId, customName) {
    // Try data attribute first, then ID selector
    let card = document.querySelector(`[data-company-id="${companyId}"]`);
    if (!card) {
        const escapedId = String(companyId).replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~ ])/g, '\\$1');
        card = document.querySelector(`#company-${escapedId}`);
    }
    if (!card) return;
    
    const cardTitle = card.querySelector(`#card-title-${companyId}`) || card.querySelector('.card-title');
    if (!cardTitle) return;
    
    const originalName = card.dataset.originalName || 'Unknown';
    const displayName = customName.trim() || originalName;
    cardTitle.textContent = displayName;
};

// Save company from card
window.saveCompanyFromCard = async function(companyId) {
    if (window.debug) window.debug.log(`Saving company: ${companyId}`);
    
    // Try to find card by data attribute first (more reliable with special characters)
    let card = document.querySelector(`[data-company-id="${companyId}"]`);
    // Fallback to ID selector
    if (!card) {
        // Escape special characters in companyId for CSS selector
        const escapedId = String(companyId).replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~ ])/g, '\\$1');
        card = document.querySelector(`#company-${escapedId}`);
    }
    
    if (!card) {
        if (window.debug) window.debug.error(`Company card not found: ${companyId}`);
        return;
    }
    
    // Get original name for lookup (company_name is the unique key)
    const originalName = card.dataset.originalName || companyId;
    
    const inputs = card.querySelectorAll('.editable-field[data-field]');
    const companyData = {};
    
    // Special handling for accent_color - prefer text input over color picker
    // Get text input value first (user's typed value)
    const accentColorTextInput = card.querySelector('input[data-field="accent_color"][type="text"]');
    let accentColorValue = null;
    if (accentColorTextInput) {
        const textValue = accentColorTextInput.value.trim();
        if (textValue && textValue.match(/^#[0-9A-Fa-f]{6}$/i)) {
            accentColorValue = textValue;
            if (window.debug) window.debug.log(`[ACCENT-COLOUR] Using text input value for company ${companyId}: ${textValue}`);
        } else if (textValue === '') {
            accentColorValue = null;
            if (window.debug) window.debug.log(`[ACCENT-COLOUR] Text input is empty for company ${companyId}, setting to null`);
        } else if (textValue) {
            if (window.debug) window.debug.warn(`[ACCENT-COLOUR] Invalid hex colour format in text input for company ${companyId}: ${textValue}`);
            accentColorValue = null;
        }
    }
    // If text input is empty/invalid, check color picker
    // Note: The sync function should keep them in sync, so this is mainly a fallback
    if (accentColorValue === null) {
        const accentColorPicker = card.querySelector('input[data-field="accent_color"][type="color"]');
        if (accentColorPicker && accentColorPicker.value) {
            accentColorValue = accentColorPicker.value;
            if (window.debug) window.debug.log(`[ACCENT-COLOUR] Using color picker value (fallback) for company ${companyId}: ${accentColorValue}`);
        }
    }
    // Set accent_color in companyData
    if (accentColorValue !== null) {
        companyData.accent_color = accentColorValue;
    } else {
        companyData.accent_color = null;
    }
    
    inputs.forEach(input => {
        const field = input.dataset.field;
        
        // Skip accent_color as we've already handled it above
        if (field === 'accent_color') {
            return;
        }
        
        let value = input.value; // Don't trim to preserve emojis and spaces
        
        // Only trim for non-text fields
        if (field === 'reputation') {
            value = parseInt(value.trim()) || 0;
        } else if (field === 'total_earnings') {
            // Parse formatted number (remove commas)
            if (window.NumberFormatter && typeof window.NumberFormatter.parseFormattedNumber === 'function') {
                value = window.NumberFormatter.parseFormattedNumber(value);
            } else {
                value = parseFloat(value.replace(/,/g, '')) || 0;
            }
        } else if (field === 'custom_name') {
            // For custom_name, trim and check if it matches the original company name
            value = value.trim();
            // If custom name is the same as original name, or empty, treat it as null
            if (value === '' || value === originalName) {
                value = null;
            }
        } else if (field === 'custom_motto') {
            // For custom_motto, trim and check if it matches the original motto
            value = value.trim();
            // If custom motto is the same as original motto, or empty, treat it as null
            const originalMotto = card.dataset.originalMotto || '';
            if (value === '' || value === originalMotto) {
                value = null;
            }
        } else {
            // For other fields, trim but preserve content
            value = value.trim();
        }
        
        // For custom_name, custom_motto, preserve the value (even if it's an empty string, we want null)
        // For other fields, use null for empty strings
        if (field === 'custom_name' || field === 'custom_motto') {
            companyData[field] = value === null || value === '' ? null : value;
        } else {
            companyData[field] = value || null; // Use null for empty strings
        }
    });
    
    try {
        // First, try to get the company by ID to get current name
        // If companyId is a number, it's a database ID
        const isNumericId = !isNaN(companyId) && !isNaN(parseInt(companyId));
        
        let currentCompanyName = originalName;
        
        if (isNumericId) {
            // Try to get company by fetching all and finding by ID
            const allCompanies = await window.getAllCompanyReps();
            const existingCompany = allCompanies.find(c => c.id == companyId);
            if (existingCompany) {
                currentCompanyName = existingCompany.company_name;
                if (window.debug) window.debug.log(`Found company by ID ${companyId}, current name: ${currentCompanyName}`);
            }
        }
        
        // If company name changed, we need to update by current name (not original)
        if (companyData.company_name && companyData.company_name !== currentCompanyName) {
            // Company name changed - update using current name from database
            if (window.debug) window.debug.log(`Company name changed from "${currentCompanyName}" to "${companyData.company_name}"`);
            await window.updateCompanyRep(currentCompanyName, companyData);
        } else {
            // Use saveCompanyRep which handles create/update logic
            companyData.company_name = companyData.company_name || currentCompanyName;
            
            if (window.debug) {
                window.debug.log(`[ACCENT-COLOUR] Saving company data:`, companyData);
                if (companyData.accent_color !== undefined) {
                    window.debug.log(`[ACCENT-COLOUR] Accent colour in save data: ${companyData.accent_color || 'null'}`);
                }
            }
            
            await window.saveCompanyRep(companyData);
        }
        
        alert('Company saved successfully!');
        
        // Re-render to update last updated timestamp and reflect any name changes
        await window.renderCompanyCards();
        
        // Also update the display view
        if (typeof window.renderCompanyReputationDisplay === 'function') {
            await window.renderCompanyReputationDisplay();
        }
        
        if (window.debug) window.debug.log(`Saved company: ${companyData.company_name || currentCompanyName}`);
    } catch (error) {
        if (window.debug) window.debug.error('Error saving company:', error);
        alert(`Error saving company: ${error.message}`);
    }
};

// Parse and save companies
window.parseAndSaveCompanies = async function() {
    if (window.debug) window.debug.log('=== PARSE AND SAVE COMPANIES STARTED ===');
    
    const input = document.getElementById('profilePasteInput');
    if (!input || !input.value.trim()) {
        alert('Please paste company reputation data first!');
        return;
    }
    
    const text = input.value;
    if (window.debug) window.debug.log('Parsing company reputation data...');
    
    const parsed = window.parseCompanyRepData(text);
    
    if (parsed.length === 0) {
        alert('No valid company data found. Please check the format.');
        return;
    }
    
    // Save companies to database
    let savedCount = 0;
    for (const company of parsed) {
        try {
            // Fallback mode: only create if missing, don't overwrite existing values
            if (company && company.__skipUpdateIfExists) {
                const existing = await window.getCompanyRep(company.company_name);
                if (!existing) {
                    await window.createCompanyRep({
                        company_name: company.company_name,
                        motto: company.motto || '',
                        reputation: company.reputation ?? 0,
                        total_earnings: company.total_earnings ?? 0
                    });
                    savedCount++;
                } else {
                    if (window.debug) window.debug.log(`Skipping existing company (fallback mode): ${company.company_name}`);
                }
            } else {
                await window.saveCompanyRep(company);
                savedCount++;
            }
        } catch (error) {
            if (window.debug) window.debug.error(`Error saving company ${company.company_name}:`, error);
        }
    }
    
    // Clear input
    input.value = '';
    
    // Re-render companies
    await window.renderCompanyCards();
    
    alert(`Successfully added/updated ${savedCount} company/companies!`);
    
    if (window.debug) window.debug.log(`Saved ${savedCount} company/companies`);
    if (window.debug) window.debug.log('=== PARSE AND SAVE COMPANIES COMPLETED ===');
};

// Escape HTML
window.escapeHtml = function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};
