// logistics/js/logistics-licenses-ui.js
// UI rendering for licenses table

// Escape HTML
window.escapeHtml = function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Use NumberFormatter utility for number formatting

// Render licenses table
window.renderLicenses = function() {
    if (window.debug) window.debug.log('[LICENSES-UI] Rendering licenses...');
    const tbody = document.getElementById('licensesBody');
    if (!tbody) {
        if (window.debug) window.debug.warn('[LICENSES-UI] licensesBody not found');
        return;
    }
    
    if (window.debug) window.debug.log(`[LICENSES-UI] Licenses count: ${window.licenses.length}`);
    
    if (window.licenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No licenses found. Click "Add New License" to create one.</td></tr>';
        return;
    }

    tbody.innerHTML = window.licenses.map(license => {
        const name = window.escapeHtml(license.name || '');
        const level = license.level || 0;
        const price = license.price || 0;
        const parseString = window.escapeHtml(license.parseString || '');
        const purchased = license.purchased || false;
        
        return `
            <tr data-id="${license.id}" class="license-row">
                <td>
                    <input type="text" class="form-control form-control-sm name-input" 
                           value="${name}" 
                           data-id="${license.id}"
                           placeholder="License Name">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm level-input" 
                           value="${level}" 
                           data-id="${license.id}"
                           placeholder="0"
                           min="0"
                           style="width: 80px;">
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="me-1 text-muted">$</span>
                        <input type="text" class="form-control form-control-sm price-input" 
                               value="${price > 0 ? (window.NumberFormatter ? window.NumberFormatter.formatNumber(price, true) : price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : ''}" 
                               data-id="${license.id}"
                               data-field="price"
                               placeholder="0.00"
                               style="width: 150px;">
                    </div>
                </td>
                <td>
                    <input type="text" class="form-control form-control-sm parseString-input" 
                           value="${parseString}" 
                           data-id="${license.id}"
                           placeholder="e.g., ADR_1, HIGH_VALUE"
                           style="width: 150px;"
                           title="Parse string that matches job types (e.g., ADR_1, ADR_4, HIGH_VALUE, HIGH TIER, HEAVY)">
                </td>
                <td class="text-center">
                    <input type="checkbox" class="form-check-input" 
                           data-id="${license.id}"
                           data-field="purchased"
                           ${purchased ? 'checked' : ''}
                           style="cursor: pointer;">
                </td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm" 
                            onclick="deleteLicense(${typeof license.id === 'string' && license.id.startsWith('new-') ? `'${license.id}'` : license.id})"
                            title="Delete license">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Initialize number formatting for price inputs after rendering
    if (typeof window.NumberFormatter !== 'undefined' && typeof window.NumberFormatter.initNumberFormatting === 'function') {
        window.NumberFormatter.initNumberFormatting({
            selector: '.price-input',
            allowDecimals: true
        });
        if (window.debug) window.debug.log('[LICENSES-UI] Number formatting initialized for price inputs');
    }
    
    if (window.debug) window.debug.log(`[LICENSES-UI] Rendered ${window.licenses.length} license(s)`);
};
