/**
 * checklist-remote-ui.js
 * Rendering, business picker autocomplete, drag-to-reorder, FAB toggle.
 * Cards are identical to checklist-ui.js.
 */

// ─── Reorder mode state ────────────────────────────────────────────────────
let _reorderMode = false;
let _summaryReorderMode = false;

// ─── Build / Rebuild the checklist ────────────────────────────────────────
window.buildRemoteChecklist = function () {
    const container = document.getElementById('checklistRemoteContainer');
    if (!container) return;

    const loadingAlert = document.getElementById('loadingAlert');
    if (loadingAlert) loadingAlert.style.display = 'none';

    const originalRunList = window.getRemoteRunList();
    const runList = originalRunList.filter(code => {
        if (!window.allOpenBusinesses[code]) {
            if (window.debug) window.debug.warn(`⚠️ Business ${code} not found in allOpenBusinesses (orphaned)`);
            return false;
        }
        return true;
    });

    if (runList.length !== originalRunList.length) {
        if (window.debug) window.debug.log(`🧹 Cleaning up ${originalRunList.length - runList.length} orphaned businesses from run list`);
        window.saveRemoteRunList(runList);
        // Continue rendering with the filtered runList
    }

    if (runList.length === 0) {
        container.innerHTML = `
            <div class="empty-run-list">
                <div class="empty-icon">📋</div>
                <p>Your run list is empty.<br>Use the picker above to add businesses.</p>
            </div>`;
        _updateRemoteSummary(0);
        return;
    }

    container.innerHTML = '';
    let rendered = 0;

    runList.forEach((code, index) => {
        const biz = window.allOpenBusinesses[code];
        // biz is guaranteed to exist here due to filter above

        const displayName = biz.business_name || biz.business_code;
        const hasCollection = biz.can_collect_items === true || biz.can_collect_items === 1 || biz.can_collect_items === '1';
        const tierId = biz.tier_id || 0;

        const card = document.createElement('div');
        card.className = 'business-item';
        card.dataset.businessCode = code;
        card.dataset.tierId = tierId;
        card.dataset.tier = biz.tier_name || '';
        card.draggable = false; // enabled in reorder mode

        card.innerHTML = `
            <div class="d-flex align-items-start gap-2">
                <span class="drag-handle" title="Drag to reorder">⠿</span>
                <span class="run-order-badge mt-1">${index + 1}</span>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <label class="form-check-label d-flex align-items-center gap-2">
                            <input class="form-check-input me-1" type="checkbox"
                                   value="${code}"
                                   data-business-code="${code}"
                                   data-tier="${biz.tier_name || ''}"
                                   id="remote-check-${code}">
                            <span>
                                <span class="business-code fw-bold" style="color: #667eea;">${escapeRemoteHtml(code)}</span>${biz.tier_name ? `
                                <span class="business-tier-badge ms-2">Tier ${biz.tier_number}: ${escapeRemoteHtml(biz.tier_name)}</span>` : ''}
                                <span class="business-name fw-bold"> - ${escapeRemoteHtml(displayName)}</span>
                            </span>
                        </label>
                        <div class="d-flex gap-2">
                            <button type="button"
                                    class="btn-action-remote hide-biz-remote"
                                    data-business-code="${code}"
                                    title="Hide business">👁️</button>
                            <button type="button"
                                    class="btn-action-remote remove-biz-remote"
                                    data-business-code="${code}"
                                    title="Remove from run list">❌</button>
                        </div>
                    </div>
                    <div class="small mb-3" style="opacity:0.9;">
                        ${biz.notes ? `
                        <div class="notes-display-remote">
                            <span class="text-secondary note-icon-remote">📝</span> <strong>Notes:</strong> ${escapeRemoteHtml(biz.notes)}
                        </div>
                        ` : ''}
                    </div>
                    <!-- Fields row -->
                    <div class="mt-2 row g-2">
                        <div class="${hasCollection ? 'col-md-2' : 'col-md-3'}">
                            <small class="text-muted d-block mb-1" style="font-weight:600;">
                                <strong>💰 Money:</strong>
                            </small>
                            <input type="text"
                                   class="form-control form-control-sm money-input"
                                   placeholder="Money"
                                   data-business-code="${code}"
                                   data-tier="${biz.tier_name || ''}"
                                   oninput="saveRemoteProgress();">
                        </div>
                        <div class="${hasCollection ? 'col-md-2' : 'col-md-3'}">
                            <small class="text-muted d-block mb-1" style="font-weight:600;">
                                <strong>📊 Stock (Max):</strong> ${(biz.storage_capacity || 0).toLocaleString('en-US')}
                            </small>
                            <div class="stock-calc-container">
                                <div class="input-group input-group-sm mb-1">
                                    <span class="input-group-text" style="font-weight:600;">Current:</span>
                                    <input type="text"
                                           class="form-control form-control-sm stock-target-input"
                                           placeholder="0"
                                           data-business-code="${code}"
                                           data-tier="${biz.tier_name || ''}"
                                           data-max-stock="${biz.storage_capacity || 0}"
                                           max="${biz.storage_capacity || 0}"
                                           oninput="calculateRemoteStockNeeded('${code}', ${biz.storage_capacity || 0});">
                                </div>
                                <div class="stock-needed-display-checklist"
                                     id="stock-needed-${code}">
                                    <small class="text-muted">Enter current stock to calculate</small>
                                </div>
                            </div>
                        </div>
                        <div class="${hasCollection ? 'col-md-2' : 'col-md-3'}">
                            <small class="text-muted d-block mb-1" style="font-weight:600;">
                                <strong>📦 Product:</strong>
                            </small>
                            <select class="form-select form-select-sm product-selector"
                                    data-business-code="${code}"
                                    data-tier="${biz.tier_name || ''}"
                                    data-tier-id="${tierId}"
                                    onchange="handleRemoteProductSelection('${code}')">
                                <option value="">-- Select Product --</option>
                            </select>
                        </div>
                        ${hasCollection ? `
                        <div class="col-md-2">
                            <small class="text-muted d-block mb-1" style="font-weight:600;">
                                <strong>📦 Collection:</strong> ${(biz.collection_storage || 0).toLocaleString('en-US')}
                            </small>
                            <input type="text"
                                   class="form-control form-control-sm collection-input"
                                   placeholder="Collection"
                                   data-business-code="${code}"
                                   data-tier="${biz.tier_name || ''}"
                                   oninput="saveRemoteProgress();">
                        </div>` : ''}
                        <div class="${hasCollection ? 'col-md-4' : 'col-md-3'}">
                            <small class="text-muted d-block mb-1" style="font-weight:600;">
                                <strong>📝 Notes:</strong>
                            </small>
                            <textarea class="form-control form-control-sm notes-input"
                                      rows="1"
                                      placeholder="Add notes..."
                                      data-business-code="${code}"
                                      data-tier="${biz.tier_name || ''}"
                                      oninput="saveRemoteProgress();"></textarea>
                        </div>
                    </div>
                </div>
            </div>`;

        container.appendChild(card);
        rendered++;
    });

    _updateRemoteSummary(rendered);

    // Auto-save to localStorage only if value is valid
    if (typeof saveRemoteProgress === 'function') {
        saveRemoteProgress();
    }

    // Re-init number formatting
    if (typeof initNumberFormatting === 'function') {
        initNumberFormatting({ allowDecimals: true, selector: '.money-input, .collection-input' });
        initNumberFormatting({ allowDecimals: false, selector: '.stock-target-input' });
    }

    // Load saved progress
    loadRemoteProgress();

    // Populate product selectors
    _populateAllProductSelectors();

    // Recalculate summary after stock calculation
    setTimeout(() => calculateAllBusinessSummary(), 100);

    // Re-apply reorder mode visuals if active
    if (_reorderMode) {
        document.getElementById('checklistRemoteContainer').classList.add('reorder-mode');
        _enableDragHandles(true);
    }
};

// ─── Summary update ──────────────────────────────────────────────────────
function _updateRemoteSummary(count) {
    const el = document.getElementById('remoteSummaryContent');
    if (el) el.textContent = `${count} business${count !== 1 ? 'es' : ''} in your run list`;
    const alert = document.getElementById('remoteSummaryAlert');
    if (alert) alert.style.display = count > 0 ? 'block' : 'none';
}

// ─── Product selectors ───────────────────────────────────────────────────
async function _loadProductsForTierId(tierId) {
    const configData = window.checklistConfigData();
    if (!configData || !configData.products) return [];

    // tierId might be a string or number depending on source
    const tid = parseInt(tierId);
    return configData.products.filter(p => parseInt(p.tierId) === tid);
}

// Cache products by tier id to avoid repeated fetches
const _productCache = {};

async function _populateAllProductSelectors() {
    const configData = window.checklistConfigData();
    if (!configData || !configData.products) return;

    const selectors = document.querySelectorAll('.product-selector');

    // Group selectors by tier name for efficient population
    const tierNames = [...new Set([...selectors].map(s => s.dataset.tier).filter(Boolean))];

    tierNames.forEach(tierName => {
        // Try using the shared helper from the main checklist if available
        if (typeof window.populateProductSelectorsForTier === 'function') {
            window.populateProductSelectorsForTier(tierName);
            return;
        }

        // Fallback: populate ourselves
        const tier = (configData.tiers || []).find(t => t.name === tierName);
        if (!tier) return;

        const products = (configData.products || []).filter(p => parseInt(p.tierId) === parseInt(tier.id));
        const tierSelectors = document.querySelectorAll(`.product-selector[data-tier="${tierName}"]`);

        tierSelectors.forEach(sel => {
            sel.innerHTML = '<option value="">-- Select Product --</option>';
            products.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.productName || p.product_name;
                sel.appendChild(opt);
            });
        });
    });

    // Restore saved product selections
    _restoreProductSelectionsFromLocalStorage();
}

async function _restoreProductSelectionsFromDb() {
    // Redundant with localStorage sync, making it a no-op
    _restoreProductSelectionsFromLocalStorage();
}

function _restoreProductSelectionsFromLocalStorage() {
    const configData = window.checklistConfigData();
    if (!configData) return;

    document.querySelectorAll('.product-selector').forEach(sel => {
        const code = sel.dataset.businessCode;
        const tier = sel.dataset.tier;
        if (!code || !tier) return;

        // Use shared helper to get persistent selection
        const productId = window.getProductSelection(tier, code);

        if (productId !== null) {
            const productIdStr = String(productId);
            if ([...sel.options].some(o => o.value === productIdStr)) {
                sel.value = productIdStr;
            }
        } else {
            sel.value = '';
        }

        // Update display column label if it exists
        _updateRemoteProductInfoDisplay(code, tier);
    });
}

// Update on storage change for products (sync between tabs)
window.addEventListener('storage', function (e) {
    if (e.key === 'checklistProductTracking') {
        if (window.debug) window.debug.log('🔄 Product tracking storage change detected: Updating dropdowns and summary (Remote)');
        _restoreProductSelectionsFromLocalStorage();
        if (typeof window.calculateAllBusinessSummary === 'function') {
            window.calculateAllBusinessSummary();
        }
    }
});

function applySortByTier() {
    if (!window.getProductsSortedByTier || !window.setProductOrder) return;
    
    const sortedIds = window.getProductsSortedByTier();
    if (sortedIds && sortedIds.length > 0) {
        if (window.debug) window.debug.log('⚖️ Applying "Sort by Tier" order (Remote):', sortedIds);
        window.setProductOrder(sortedIds);
        window.calculateAllBusinessSummary();
    }
}
window.applySortByTier = applySortByTier;

function toggleSummaryReorderMode() {
    _summaryReorderMode = !_summaryReorderMode;
    if (window.debug) window.debug.log(`🔀 Summary Reorder Mode (Remote): ${_summaryReorderMode ? 'ON' : 'OFF'}`);
    window.calculateAllBusinessSummary();
}
window.toggleSummaryReorderMode = toggleSummaryReorderMode;

function copySummaryToClipboard() {
    const table = document.querySelector('#allBusinessSummaryCard table');
    if (!table) return;

    let rows = Array.from(table.querySelectorAll('tr'));
    let text = rows.map(row => {
        let cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map(cell => cell.innerText.trim()).join('\t');
    }).join('\n');

    navigator.clipboard.writeText(text).then(() => {
        if (window.debug) window.debug.log('📋 Summary copied to clipboard (Remote)');
        const copyBtn = document.getElementById('summaryCopyBtn');
        if (copyBtn) {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✅ Copied!';
            setTimeout(() => { copyBtn.innerHTML = originalText; }, 2000);
        }
    }).catch(err => {
        if (window.debug) window.debug.error('Failed to copy summary (Remote):', err);
    });
}
window.copySummaryToClipboard = copySummaryToClipboard;

function applyAlphabeticalSort() {
    if (!window.setProductOrder) return;
    if (window.debug) window.debug.log('🔤 Applying "Alphabetical" order (Remote Reset)');
    window.setProductOrder([]); // Resetting to empty triggers alphabetical fallback
    window.calculateAllBusinessSummary();
}

window.applyAlphabeticalSort = applyAlphabeticalSort;

window.handleRemoteProductSelection = function (code) {
    const sel = document.querySelector(`.product-selector[data-business-code="${code}"]`);
    if (!sel) return;

    const productId = sel.value;
    const tier = sel.dataset.tier;

    if (window.debug) window.debug.log(`🎯 Product selection for ${code} (${tier}): ${productId}`);

    // Use shared helper for unified persistence
    if (typeof window.setProductSelection === 'function') {
        window.setProductSelection(tier, code, productId);
        // Save using the shared key
        if (typeof window.saveTrackingToLocalStorage === 'function') {
            window.saveTrackingToLocalStorage();
        }
    }

    // Update the column display label
    _updateRemoteProductInfoDisplay(code, tier);

    // Trigger summary recalculation
    if (typeof window.calculateAllBusinessSummary === 'function') {
        window.calculateAllBusinessSummary();
    }
};

async function _saveProductToDb(code, productId) {
    // Stop API calls, storage is now handled by localStorage 'checklistProductTracking'
    if (window.debug) window.debug.log(`SKIPPING DB SAVE for ${code} -> product ${productId} (MySQL disabled)`);
}

window.clearRemoteProducts = async function () {
    if (!confirm('Clear all product selections? This cannot be undone.')) return;
    document.querySelectorAll('.product-selector').forEach(s => { s.selectedIndex = 0; });

    // Clear tiered tracking for current run list businesses
    const saved = JSON.parse(localStorage.getItem('checklistProductTracking') || '{}');
    const runList = window.getRemoteRunList();

    runList.forEach(code => {
        const biz = window.allOpenBusinesses[code];
        const tier = biz ? biz.tier_name : '';
        if (tier) {
            window.setProductSelection(tier, code, null);
        }
    });
    const selectors = document.querySelectorAll('.product-selector');
    for (const s of selectors) await _saveProductToDb(s.dataset.businessCode, null);
    if (window.debug) window.debug.log('✅ Cleared all product selections');
    window.calculateAllBusinessSummary(); // Recalculate summary after clearing products
};

// ─── Stock calculation (mirrored from checklist-calculations.js) ─────────
window.calculateRemoteStockNeeded = function (code, maxStock) {
    const display = document.getElementById(`stock-needed-${code}`);
    const input = document.querySelector(`.stock-target-input[data-business-code="${code}"]`);
    if (!display || !input) return;

    const current = parseFloat(input.value.replace(/,/g, '')) || 0;

    if (current === 0) {
        display.innerHTML = '<small class="text-muted">Enter current stock to calculate</small>';
        window.calculateAllBusinessSummary(); // Recalculate summary
        return;
    }
    if (current > maxStock) {
        display.innerHTML = `<small class="text-danger"><strong>Error: Current (${current.toLocaleString()}) exceeds Max (${maxStock.toLocaleString()})</strong></small>`;
        window.calculateAllBusinessSummary(); // Recalculate summary
        return;
    }
    if (current < 0) {
        display.innerHTML = `<small class="text-danger"><strong>Error: Current cannot be negative</strong></small>`;
        window.calculateAllBusinessSummary(); // Recalculate summary
        return;
    }

    const needed = maxStock - current;
    if (needed === 0) {
        display.innerHTML = '<small style="font-weight:700;color:#28a745;">✅ Stock is full</small>';
    } else {
        display.innerHTML = `<small style="font-weight:700;color:#11998e;"><strong>📊 Needed: ${needed.toLocaleString()}</strong></small>`;
    }
    window.calculateAllBusinessSummary(); // Recalculate summary
};

// ─── Business Picker ─────────────────────────────────────────────────────
window.initBusinessPicker = function () {
    const input = document.getElementById('bizPickerInput');
    const dropdown = document.getElementById('bizPickerDropdown');
    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        dropdown.innerHTML = '';

        if (q.length < 1) { dropdown.classList.remove('open'); return; }

        const matches = Object.values(window.allOpenBusinesses)
            .filter(b => {
                const tierNumStr = String(b.tier_number || '');
                const tierNameStr = (b.tier_name || '').toLowerCase();
                return b.business_code.toLowerCase().includes(q)
                    || b.business_name.toLowerCase().includes(q)
                    || tierNumStr.includes(q)
                    || tierNameStr.includes(q);
            })
            .slice(0, 20);

        if (matches.length === 0) {
            dropdown.innerHTML = '<div class="biz-picker-empty">No matching businesses found</div>';
            dropdown.classList.add('open');
            return;
        }

        matches.forEach(biz => {
            const item = document.createElement('div');
            item.className = 'biz-picker-item';
            const tierLabel = biz.tier_name
                ? `<span class="picker-tier"> &nbsp;·&nbsp; Tier ${biz.tier_number}: ${escapeRemoteHtml(biz.tier_name)}</span>`
                : '';
            item.innerHTML = `<span class="picker-code">${escapeRemoteHtml(biz.business_code)}</span>
                              <span class="picker-name"> – ${escapeRemoteHtml(biz.business_name)}</span>
                              ${tierLabel}`;
            item.addEventListener('click', () => {
                const added = window.addToRunList(biz.business_code);
                if (!added) {
                    // Flash the existing card briefly instead of adding duplicate
                    const existing = document.querySelector(`.business-item[data-business-code="${biz.business_code}"]`);
                    if (existing) {
                        existing.classList.add('reorder-pop');
                        setTimeout(() => existing.classList.remove('reorder-pop'), 300);
                    }
                } else {
                    window.buildRemoteChecklist();
                    // Scroll to new card
                    setTimeout(() => {
                        const newCard = document.querySelector(`.business-item[data-business-code="${biz.business_code}"]`);
                        if (newCard) newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                }
                input.value = '';
                dropdown.classList.remove('open');
                dropdown.innerHTML = '';
            });
            dropdown.appendChild(item);
        });

        dropdown.classList.add('open');
    });

    // Close on outside click
    document.addEventListener('click', e => {
        if (!e.target.closest('.biz-picker-wrapper')) dropdown.classList.remove('open');
    });
};

// ─── Reorder mode ────────────────────────────────────────────────────────
window.toggleReorderMode = function () {
    _reorderMode = !_reorderMode;
    const container = document.getElementById('checklistRemoteContainer');
    const btn = document.getElementById('reorderToggleBtn');

    if (_reorderMode) {
        container && container.classList.add('reorder-mode');
        btn && btn.classList.add('active');
        btn && (btn.title = 'Click to stop reordering');
        _enableDragHandles(true);
    } else {
        container && container.classList.remove('reorder-mode');
        btn && btn.classList.remove('active');
        btn && (btn.title = 'Drag to reorder businesses');
        _enableDragHandles(false);
    }
    if (window.debug) window.debug.log(`🔀 Reorder mode: ${_reorderMode ? 'ON' : 'OFF'}`);
};

function _enableDragHandles(enable) {
    const cards = document.querySelectorAll('#checklistRemoteContainer .business-item');
    cards.forEach(card => {
        card.draggable = enable;
        if (enable) {
            card.addEventListener('dragstart', _onDragStart);
            card.addEventListener('dragover', _onDragOver);
            card.addEventListener('dragleave', _onDragLeave);
            card.addEventListener('drop', _onDrop);
            card.addEventListener('dragend', _onDragEnd);
        } else {
            card.removeEventListener('dragstart', _onDragStart);
            card.removeEventListener('dragover', _onDragOver);
            card.removeEventListener('dragleave', _onDragLeave);
            card.removeEventListener('drop', _onDrop);
            card.removeEventListener('dragend', _onDragEnd);
            card.classList.remove('dragging', 'drag-over');
        }
    });
}

let _dragSrc = null;

function _onDragStart(e) {
    _dragSrc = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.businessCode);
}

function _onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
}

function _onDragLeave() {
    this.classList.remove('drag-over');
}

function _onDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    if (_dragSrc === this) return;

    const container = document.getElementById('checklistRemoteContainer');
    const cards = [...container.querySelectorAll('.business-item')];
    const fromIndex = cards.indexOf(_dragSrc);
    const toIndex = cards.indexOf(this);

    if (fromIndex < 0 || toIndex < 0) return;

    // Re-order in DOM
    if (fromIndex < toIndex) {
        container.insertBefore(_dragSrc, this.nextSibling);
    } else {
        container.insertBefore(_dragSrc, this);
    }

    // Persist new order via order-config.js
    const newOrder = [...container.querySelectorAll('.business-item')].map(c => c.dataset.businessCode);
    window.reorderRunList(newOrder);

    // Update position badges
    container.querySelectorAll('.business-item').forEach((card, i) => {
        const badge = card.querySelector('.run-order-badge');
        if (badge) badge.textContent = i + 1;
    });

    // Pop animation on dropped card
    _dragSrc.classList.add('reorder-pop');
    setTimeout(() => _dragSrc && _dragSrc.classList.remove('reorder-pop'), 300);

    if (window.debug) window.debug.log(`🔀 Moved ${_dragSrc.dataset.businessCode} from pos ${fromIndex + 1} → ${toIndex + 1}`);
}

function _onDragEnd() {
    this.classList.remove('dragging');
    _dragSrc = null;
}

// ─── Visibility toggles ─────────────────────────────────────────────────
window.toggleRemoteBusinessVisibility = function (button) {
    const code = button.dataset.businessCode;
    const item = document.querySelector(`.business-item[data-business-code="${code}"]`);
    if (!item) return;
    if (item.style.display === 'none') {
        item.style.display = '';
        button.textContent = '👁️';
        button.title = 'Hide business';
    } else {
        item.style.display = 'none';
        button.textContent = '👁️‍🗨️';
        button.title = 'Show business';
    }
    saveRemoteProgress();
    window.calculateAllBusinessSummary(); // Recalculate summary on visibility change
};

// ─── FAB ─────────────────────────────────────────────────────────────────
window.toggleFabMenu = function () {
    const menu = document.getElementById('fab-menu');
    const btn = document.querySelector('.fab-main-btn');
    const icon = document.getElementById('fab-icon');
    if (!menu || !btn || !icon) return;
    menu.classList.toggle('open');
    btn.classList.toggle('open');
    icon.textContent = menu.classList.contains('open') ? '✖' : '⚡';
};

document.addEventListener('click', function (e) {
    const fab = document.querySelector('.fab-container');
    const menu = document.getElementById('fab-menu');
    const btn = document.querySelector('.fab-main-btn');
    const icon = document.getElementById('fab-icon');
    if (fab && !fab.contains(e.target) && menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
        btn && btn.classList.remove('open');
        if (icon) icon.textContent = '⚡';
    }
});

// ─── Utility ─────────────────────────────────────────────────────────────
window.escapeRemoteHtml = function (text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// --- Summary Table Drag and Drop ---
let _summaryDragSrc = null;

function _onSummaryDragStart(e) {
    this.classList.add('dragging');
    _summaryDragSrc = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.productName);
}

function _onSummaryDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
    return false;
}

function _onSummaryDragLeave() {
    this.classList.remove('drag-over');
}

function _onSummaryDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    
    if (_summaryDragSrc !== this) {
        const allRows = Array.from(this.parentNode.children);
        const srcIdx = allRows.indexOf(_summaryDragSrc);
        const targetIdx = allRows.indexOf(this);
        
        if (srcIdx < targetIdx) {
            this.parentNode.insertBefore(_summaryDragSrc, this.nextSibling);
        } else {
            this.parentNode.insertBefore(_summaryDragSrc, this);
        }
        
        _saveNewProductOrderFromSummary();
    }
    return false;
}

function _onSummaryDragEnd() {
    document.querySelectorAll('#allBusinessSummaryBody tr').forEach(row => {
        row.classList.remove('dragging', 'drag-over');
    });
    _summaryDragSrc = null;
}

function _saveNewProductOrderFromSummary() {
    const rows = document.querySelectorAll('#allBusinessSummaryBody tr');
    const newOrder = [];
    rows.forEach(row => {
        const productId = row.dataset.productId;
        if (productId) {
            newOrder.push(parseInt(productId));
        }
    });
    
    if (newOrder.length > 0) {
        if (window.debug) window.debug.log('💾 Saving new product order (Remote):', newOrder);
        if (window.setProductOrder) {
            window.setProductOrder(newOrder);
            // Refresh to ensure order is locked in
            window.calculateAllBusinessSummary();
        }
    }
}

function _addSummaryDragHandlers(container) {
    const rows = container.querySelectorAll('tr[draggable="true"]');
    rows.forEach(row => {
        row.addEventListener('dragstart', _onSummaryDragStart, false);
        row.addEventListener('dragover', _onSummaryDragOver, false);
        row.addEventListener('dragleave', _onSummaryDragLeave, false);
        row.addEventListener('drop', _onSummaryDrop, false);
        row.addEventListener('dragend', _onSummaryDragEnd, false);
    });
}

// Inject styles
const summaryDragStyle = document.createElement('style');
summaryDragStyle.textContent = `
    #allBusinessSummaryBody tr[draggable="true"] { cursor: move; }
    #allBusinessSummaryBody tr.dragging { opacity: 0.5; background-color: rgba(102, 126, 234, 0.1); }
    #allBusinessSummaryBody tr.drag-over { border-top: 2px solid #667eea; }
`;
document.head.appendChild(summaryDragStyle);

// ─── All Business Summary Calculation ───────────────────────────────────
window.calculateAllBusinessSummary = function () {
    if (window.debug) window.debug.log('=== calculateAllBusinessSummary (Remote) START ===');
    const summaryCard = document.getElementById('allBusinessSummaryCard');
    const summaryBody = document.getElementById('allBusinessSummaryBody');
    const headerRow = document.getElementById('allBusinessSummaryHeaderRow');
    const summaryFooter = document.getElementById('allBusinessSummaryFooter');

    if (!summaryCard || !summaryBody || !headerRow || !summaryFooter) return;

    const runList = window.getRemoteRunList();
    if (runList.length === 0) {
        summaryCard.style.display = 'none';
        return;
    }

    const allProductsMap = {}; // productName -> { tiers: { tierName: totalNeeded }, grandTotal: number }
    const tierNamesSet = new Set();

    runList.forEach(code => {
        const item = document.querySelector(`.business-item[data-business-code="${code}"]`);
        if (!item || item.style.display === 'none') return;

        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) return;

        const biz = window.allOpenBusinesses[code];
        if (!biz) return;

        const tierName = biz.tier_name || 'Uncategorized';
        tierNamesSet.add(tierName);

        const productSelector = item.querySelector('.product-selector');
        const stockNeededDisplay = document.getElementById(`stock-needed-${code}`);

        if (!productSelector) return;
        const selectedOption = productSelector.options[productSelector.selectedIndex];
        if (!selectedOption || !selectedOption.value) return;

        const productName = selectedOption.textContent;
        const productId = selectedOption.value;

        // Get stock needed
        let stockNeeded = 0;
        if (stockNeededDisplay) {
            const neededText = stockNeededDisplay.textContent || '';
            const neededMatch = neededText.match(/Needed:\s*([\d,]+)/);
            if (neededMatch) {
                stockNeeded = parseInt(neededMatch[1].replace(/,/g, '')) || 0;
            }
        }

        if (!allProductsMap[productName]) {
            allProductsMap[productName] = { 
                productId: productId,
                tiers: {}, 
                grandTotal: 0 
            };
        }
        if (!allProductsMap[productName].tiers[tierName]) {
            allProductsMap[productName].tiers[tierName] = 0;
        }

        if (stockNeeded > 0) {
            allProductsMap[productName].tiers[tierName] += stockNeeded;
            allProductsMap[productName].grandTotal += stockNeeded;
        }
    });

    const tierNames = Array.from(tierNamesSet).sort();

    if (Object.keys(allProductsMap).length === 0) {
        summaryCard.style.display = 'none';
        return;
    }

    summaryCard.style.display = 'block';

    // Headers
    const tierHeaderCells = tierNames.map(tn => `<th class="text-end">${escapeRemoteHtml(tn)}</th>`).join('');
    headerRow.innerHTML = `<th>Product Name</th>${tierHeaderCells}<th class="text-end"><strong>Grand Total</strong></th>`;

    // Body
    const productNames = Object.keys(allProductsMap);
    const sortedProducts = window.getProductsInOrder ? window.getProductsInOrder(productNames) : productNames.sort();
    
    summaryBody.innerHTML = sortedProducts.map(productName => {
        const productData = allProductsMap[productName];
        if (!productData) return ''; // Should not happen

        const tierCells = tierNames.map(tn => {
            const val = productData.tiers[tn] || 0;
            return `<td class="text-end">${val > 0 ? val.toLocaleString('en-US') : '-'}</td>`;
        }).join('');
        return `
            <tr ${_summaryReorderMode ? 'draggable="true"' : ''} data-product-name="${escapeRemoteHtml(productName)}" data-product-id="${productData.productId}">
                <td><strong>${escapeRemoteHtml(productName)}</strong></td>
                ${tierCells}
                <td class="text-end"><strong>${productData.grandTotal.toLocaleString('en-US')}</strong></td>
            </tr>`;
    }).join('');

    // Update reorder button state if it exists
    const reorderBtn = document.getElementById('summaryReorderBtn');
    if (reorderBtn) {
        reorderBtn.classList.toggle('active', _summaryReorderMode);
        reorderBtn.classList.toggle('btn-primary', _summaryReorderMode);
        reorderBtn.classList.toggle('btn-outline-secondary', !_summaryReorderMode);
        reorderBtn.innerHTML = _summaryReorderMode ? '✅ Done Reordering' : '⚙️ Manage Order';
    }

    // Add drag handlers ONLY in reorder mode
    if (_summaryReorderMode) {
        _addSummaryDragHandlers(summaryBody);
    }

    // Footer
    const tierGrandTotals = {};
    let overallGrandTotal = 0;
    tierNames.forEach(tn => tierGrandTotals[tn] = 0);

    sortedProducts.forEach(pn => {
        const pd = allProductsMap[pn];
        tierNames.forEach(tn => tierGrandTotals[tn] += (pd.tiers[tn] || 0));
        overallGrandTotal += pd.grandTotal;
    });

    const tierGrandTotalCells = tierNames.map(tn => {
        const val = tierGrandTotals[tn];
        return `<td class="text-end"><strong>${val > 0 ? val.toLocaleString('en-US') : '-'}</strong></td>`;
    }).join('');

    summaryFooter.innerHTML = `
        <tr style="background-color: rgba(102, 126, 234, 0.1);">
            <td><strong>Grand Total</strong></td>
            ${tierGrandTotalCells}
            <td class="text-end"><strong style="font-size: 1.1em;">${overallGrandTotal.toLocaleString('en-US')}</strong></td>
        </tr>`;

    if (window.debug) window.debug.log('=== calculateAllBusinessSummary (Remote) END ===');
};

// ─── FAB Helpers ─────────────────────────────────────────────────────────

window.showAllRemoteBusinesses = function () {
    const items = document.querySelectorAll('#checklistRemoteContainer .business-item');
    items.forEach(item => {
        item.style.display = '';
        const btn = item.querySelector('.hide-biz-remote');
        if (btn) {
            btn.textContent = '👁️';
            btn.title = 'Hide business';
        }
    });
    saveRemoteProgress();
    window.calculateAllBusinessSummary();
    if (window.debug) window.debug.log('👁️ Show All: All remote businesses unhidden');
};

window.scrollToTop = function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.scrollToBottom = function () {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
};

/**
 * Display the currently selected product name in the column label (Remote)
 */
function _updateRemoteProductInfoDisplay(code, tier) {
    const sel = document.querySelector(`.product-selector[data-business-code="${code}"]`);
    if (!sel) return;

    const productId = sel.value;
    const productName = productId ? window.getProductName(productId) : null;

    // In checklist-remote, we don't currently have the "inline-product-name" spans 
    // in the column headers like in checklist.html, but we support them if added.
    const label = document.getElementById(`product-label-${code}`);
    if (label) {
        if (productName) {
            label.textContent = `Product: ${productName}`;
            label.classList.add('has-product');
        } else {
            label.textContent = 'Product:';
            label.classList.remove('has-product');
        }
    }
}
