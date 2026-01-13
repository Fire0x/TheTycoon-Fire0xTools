/**
 * Checklist Core Module
 * Contains business loading, progress management, and UI building functions
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.checklistDebugManager === 'undefined') {
        console.error('checklist-shared.js must be loaded before checklist-core.js');
        return;
    }

    const debugManager = window.checklistDebugManager;

    // Load all businesses from localStorage
    function loadAllBusinesses() {
        const configData = window.checklistConfigData();
        if (!configData) {
            debugManager.error('Configuration not initialized');
            buildChecklist({});
            return;
        }
        
        debugManager.log('Loading all businesses, total tiers:', window.getBusinessTiers().length);
        
        // Group businesses by tier
        const businessesByTier = {};
        const tiers = window.getBusinessTiers();
        
        tiers.forEach(tier => {
            const tierBusinesses = (configData.businesses || [])
                .filter(biz => biz.tierId === tier.id && biz.status === 'Open')
                .map(biz => ({
                    businessCode: biz.businessCode,
                    businessName: biz.businessName,
                    status: biz.status,
                    tier: tier.name,
                    maxStock: biz.maxStock,
                    collectionStorage: biz.collectionStorage,
                    canCollectItems: biz.canCollectItems,
                    conversionRate: biz.conversionRate || tier.conversionRate,
                    notes: biz.notes || '',
                    productId: biz.productId || null
                }));
            
            businessesByTier[tier.name] = tierBusinesses;
        });
        
        buildChecklist(businessesByTier);
    }

    // Build checklist HTML
    function buildChecklist(businessesByTier) {
        const container = document.getElementById('checklistContainer');
        if (!container) {
            debugManager.error('checklistContainer not found');
            return;
        }
        
        let totalOpen = 0;
        const tierCounts = {};
        const tiers = window.getBusinessTiers();
        const tierSummaryVisible = window.tierSummaryVisible;
        
        // Use DocumentFragment for batch DOM updates to reduce reflows
        const fragment = document.createDocumentFragment();
        
        tiers.forEach(tier => {
            const businesses = businessesByTier[tier.name] || [];
            const openBusinesses = businesses.filter(b => {
                if (b.status !== 'Open') return false;
                // Hide businesses with "Placeholder Business Name"
                const businessName = b.businessName || b.businessCode;
                return businessName !== 'Placeholder Business Name';
            });
            
            if (openBusinesses.length > 0) {
                tierCounts[tier.name] = openBusinesses.length;
                totalOpen += openBusinesses.length;
                
                const isSummaryVisible = tierSummaryVisible[tier.name] !== false;
                
                const card = document.createElement('div');
                card.className = 'card mt-4 mb-4';
                card.innerHTML = `
                    <div class="card-header ${tier.color}">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center gap-2">
                                <input type="checkbox" 
                                       class="form-check-input tier-check-all" 
                                       id="tier-check-all-${tier.name}"
                                       data-tier="${tier.name}"
                                       title="Check/Uncheck all businesses in this tier"
                                       onchange="toggleTierCheckAll('${tier.name}')"
                                       style="width: 1.25rem; height: 1.25rem; cursor: pointer;">
                                <h2 class="mb-0">${tier.icon} ${tier.name}</h2>
                            </div>
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-sm btn-outline-light toggle-tier-summary-btn" 
                                        data-tier="${tier.name}"
                                        title="Show/Hide Tier Summary"
                                        onclick="toggleTierSummary('${tier.name}')">
                                    ${isSummaryVisible ? '📊 Hide Summary' : '📊 Show Summary'}
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-light toggle-tier-btn" 
                                        data-tier="${tier.name}"
                                        title="Show all businesses in this tier">
                                    👁️ Show All
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <!-- Tier Summary Section -->
                        <div class="tier-summary-section mb-4" id="tier-summary-${tier.name}" style="display: ${isSummaryVisible ? 'block' : 'none'};">
                            <h5 class="mb-3">📊 Tier Summary</h5>
                            <div class="table-responsive">
                                <table class="table table-sm table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th>Total Products Needed</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tier-summary-body-${tier.name}">
                                        <tr>
                                            <td colspan="2" class="text-center text-muted">Loading summary...</td>
                                        </tr>
                                    </tbody>
                                    <tfoot id="tier-summary-footer-${tier.name}">
                                        <!-- Grand Total row will be dynamically generated here -->
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        <div class="list-group" data-tier="${tier.name}">
                            ${openBusinesses.map((biz, index) => {
                                const businessName = biz.businessName || biz.businessCode;
                                const hasCollection = biz.canCollectItems === true;
                                // Adjust column classes: Money, Stock, Product, Collection (if applicable), Notes
                                const colClass = hasCollection ? 'col-md-2' : 'col-md-3';
                                const maxStock = biz.maxStock || 0;
                                const collectionStorage = biz.collectionStorage || 0;
                                const maxStockDisplay = maxStock.toLocaleString('en-US');
                                const collectionDisplay = collectionStorage.toLocaleString('en-US');
                                const businessNotes = biz.notes || '';
                                
                                return `
                                <div class="business-item" data-business-code="${biz.businessCode}" data-tier="${tier.name}">
                                    <div class="d-flex align-items-start">
                                        <input class="form-check-input me-2 mt-1" type="checkbox" value="${biz.businessCode}" data-tier="${tier.name}" id="check-${tier.name}-${index}">
                                        <div class="flex-grow-1">
                                            <div class="d-flex justify-content-between align-items-start mb-2">
                                                <div class="flex-grow-1">
                                                <label class="form-check-label" for="check-${tier.name}-${index}">
                                                        <span class="business-code fw-bold" style="color: var(--primary-color, #667eea);">${biz.businessCode}</span>
                                                        ${businessName && businessName !== biz.businessCode ? `<span class="business-name"> - ${businessName}</span>` : ''}
                                                </label>
                                                    ${businessNotes ? `
                                                    <div class="mt-1">
                                                        <small class="text-muted" style="font-style: italic; display: block;">
                                                            <span class="text-info">ℹ️</span> ${window.escapeHtml(businessNotes)}
                                                        </small>
                                                    </div>
                                                    ` : ''}
                                                </div>
                                                <button type="button" class="btn btn-sm btn-outline-secondary hide-business-btn" 
                                                        data-business-code="${biz.businessCode}" 
                                                        data-tier="${tier.name}"
                                                        title="Hide business"
                                                        style="border-radius: 0.5rem; padding: 0.25rem 0.5rem;">
                                                    👁️
                                                </button>
                                            </div>
                                            <div class="mt-2 row g-2">
                                                <div class="${colClass}">
                                                    <small class="text-muted d-block mb-1" style="font-weight: 600;">
                                                        <strong>💰 Money:</strong>
                                                    </small>
                                                    <input type="text" 
                                                           class="form-control form-control-sm money-input" 
                                                           placeholder="Money" 
                                                           data-tier="${tier.name}" 
                                                           data-business-code="${biz.businessCode}"
                                                           oninput="saveProgress();">
                                                </div>
                                                <div class="${colClass}">
                                                    <small class="text-muted d-block mb-1" style="font-weight: 600;">
                                                        <strong>📊 Stock (Max):</strong> ${maxStockDisplay}
                                                    </small>
                                                    <div class="stock-calc-container">
                                                        <div class="input-group input-group-sm mb-1">
                                                            <span class="input-group-text" style="font-weight: 600;">Current:</span>
                                                    <input type="text" 
                                                                   class="form-control form-control-sm stock-target-input" 
                                                                   placeholder="0" 
                                                           data-tier="${tier.name}" 
                                                                   data-business-code="${biz.businessCode}"
                                                                   data-max-stock="${maxStock}"
                                                                   max="${maxStock}"
                                                                   oninput="calculateStockNeededChecklist('${tier.name}', '${biz.businessCode}', ${maxStock});">
                                                        </div>
                                                        <div class="stock-needed-display-checklist" 
                                                             id="stock-needed-${tier.name}-${biz.businessCode}">
                                                            <small class="text-muted">Enter current stock to calculate</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="${colClass}">
                                                    <small class="text-muted d-block mb-1" style="font-weight: 600;">
                                                        <strong>📦 Product:</strong>
                                                    </small>
                                                    <select class="form-select form-select-sm product-selector" 
                                                            data-tier="${tier.name}" 
                                                            data-business-code="${biz.businessCode}"
                                                            onchange="handleProductSelection('${tier.name}', '${biz.businessCode}')">
                                                        <option value="">-- Select Product --</option>
                                                    </select>
                                                </div>
                                                ${hasCollection ? `
                                                <div class="${colClass}">
                                                    <small class="text-muted d-block mb-1" style="font-weight: 600;">
                                                        <strong>📦 Collection:</strong> ${collectionDisplay}
                                                    </small>
                                                    <input type="text" 
                                                           class="form-control form-control-sm collection-input" 
                                                           placeholder="Collection" 
                                                           data-tier="${tier.name}" 
                                                           data-business-code="${biz.businessCode}"
                                                           oninput="saveProgress();">
                                                </div>
                                                ` : ''}
                                                <div class="${hasCollection ? 'col-md-4' : 'col-md-3'}">
                                                    <small class="text-muted d-block mb-1" style="font-weight: 600;">
                                                        <strong>📝 Notes:</strong>
                                                    </small>
                                                    <textarea class="form-control form-control-sm notes-input" 
                                                              rows="1" 
                                                              placeholder="Add notes..." 
                                                              data-tier="${tier.name}" 
                                                              data-business-code="${biz.businessCode}"
                                                              oninput="saveProgress();"></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                            }).join('')}
                        </div>
                    </div>
                `;
                fragment.appendChild(card);
            }
        });
        
        // Batch DOM update - clear and append fragment in one operation
        container.innerHTML = '';
        container.appendChild(fragment);
        
        // Update summary
        updateSummary(totalOpen, tierCounts);
        
        // Hide loading, show content
        const loadingAlert = document.getElementById('loadingAlert');
        const summaryAlert = document.getElementById('summaryAlert');
        if (loadingAlert) loadingAlert.style.display = 'none';
        if (summaryAlert) summaryAlert.style.display = 'block';
        
        // Re-initialize number formatting for dynamically created inputs
        if (typeof initNumberFormatting === 'function') {
            initNumberFormatting({ allowDecimals: true, selector: '.money-input, .stock-input, .collection-input' });
            initNumberFormatting({ allowDecimals: false, selector: '.stock-target-input' });
        }
        
        // Load saved progress
        loadProgress();
        
        // Populate product selectors for each tier
        debugManager.log('Starting product selector population and summary calculation');
        tiers.forEach(tier => {
            debugManager.log(`Populating selectors for tier: ${tier.name}`);
            if (typeof populateProductSelectorsForTier === 'function') {
                populateProductSelectorsForTier(tier.name);
            }
        });
        
        // Load product selections (already done in loadProgress, but ensure it happens after selectors are populated)
        setTimeout(() => {
            const productSelectors = document.querySelectorAll('.product-selector');
            debugManager.log(`Found ${productSelectors.length} product selectors to restore`);
            let restoredCount = 0;
            const configData = window.checklistConfigData();
            
            productSelectors.forEach(selector => {
                const businessCode = selector.dataset.businessCode;
                const business = (configData.businesses || []).find(b => b.businessCode === businessCode);
                if (business && business.productId) {
                    selector.value = business.productId;
                    restoredCount++;
                    debugManager.log(`Restored product selection:`, { businessCode, productId: business.productId });
                }
            });
            debugManager.log(`✅ Restored ${restoredCount} product selections from config`);
            
            // Calculate tier summaries after products are loaded
            debugManager.log(`Calculating summaries for ${tiers.length} tiers`);
            tiers.forEach(tier => {
                // Only calculate summary if tier has businesses (summary body exists)
                const businesses = document.querySelectorAll(`.business-item[data-tier="${tier.name}"]`);
                if (businesses.length > 0) {
                    debugManager.log(`Calculating summary for tier: ${tier.name}`);
                    if (typeof calculateTierSummary === 'function') {
                        calculateTierSummary(tier.name);
                    }
                } else {
                    debugManager.log(`Skipping summary calculation for tier: ${tier.name} (no businesses)`);
                }
            });
            
            // Calculate all business summary after all tier summaries are done
            setTimeout(() => {
                debugManager.log('Calculating all business summary');
                if (typeof calculateAllBusinessSummary === 'function') {
                    calculateAllBusinessSummary();
                }
            }, 200);
        }, 100);
        
        // Update tier toggle buttons after loading
        tiers.forEach(tier => {
            if (typeof updateTierToggleButton === 'function') {
                updateTierToggleButton(tier.name);
            }
            // Update tier checkbox states after loading progress
            setTimeout(() => {
                if (typeof updateTierCheckboxState === 'function') {
                    updateTierCheckboxState(tier.name);
                }
            }, 150);
        });
    }

    // Update summary
    function updateSummary(total, tierCounts) {
        const summaryContent = document.getElementById('summaryContent');
        if (!summaryContent) return;
        
        let summaryHTML = `<strong>Total Open Businesses:</strong> ${total}<br>`;
        
        const tiers = window.getBusinessTiers();
        tiers.forEach(tier => {
            if (tierCounts[tier.name]) {
                summaryHTML += `<strong>${tier.name}:</strong> ${tierCounts[tier.name]} business${tierCounts[tier.name] !== 1 ? 'es' : ''}<br>`;
            }
        });
        
        summaryContent.innerHTML = summaryHTML;
    }

    // Check all checkboxes
    function checkAll() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = true);
        saveProgress();
        
        // Update all tier checkbox states
        const tiers = window.getBusinessTiers();
        tiers.forEach(tier => {
            if (typeof updateTierCheckboxState === 'function') {
                updateTierCheckboxState(tier.name);
            }
        });
        
        // Recalculate all tier summaries (only for tiers with businesses)
        tiers.forEach(tier => {
            const businesses = document.querySelectorAll(`.business-item[data-tier="${tier.name}"]`);
            if (businesses.length > 0 && typeof calculateTierSummary === 'function') {
                calculateTierSummary(tier.name);
            }
        });
    }

    // Uncheck all checkboxes
    function uncheckAll() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
        saveProgress();
        
        // Update all tier checkbox states
        const tiers = window.getBusinessTiers();
        tiers.forEach(tier => {
            if (typeof updateTierCheckboxState === 'function') {
                updateTierCheckboxState(tier.name);
            }
        });
        
        // Recalculate all tier summaries (only for tiers with businesses)
        tiers.forEach(tier => {
            const businesses = document.querySelectorAll(`.business-item[data-tier="${tier.name}"]`);
            if (businesses.length > 0 && typeof calculateTierSummary === 'function') {
                calculateTierSummary(tier.name);
            }
        });
    }

    // Save progress to localStorage
    function saveProgress() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const notesInputs = document.querySelectorAll('.notes-input');
        const moneyInputs = document.querySelectorAll('.money-input');
        const stockInputs = document.querySelectorAll('.stock-input');
        const collectionInputs = document.querySelectorAll('.collection-input');
        const progress = {};
        
        // Save checkbox states
        checkboxes.forEach(checkbox => {
            const key = `${checkbox.dataset.tier}::${checkbox.value}`;
            progress[key] = {
                checked: checkbox.checked,
                notes: '',
                money: '',
                stock: '',
                collection: ''
            };
        });
        
        // Save notes
        notesInputs.forEach(input => {
            const key = `${input.dataset.tier}::${input.dataset.businessCode}`;
            if (progress[key]) {
                progress[key].notes = input.value;
            } else {
                progress[key] = {
                    checked: false,
                    notes: input.value,
                    money: '',
                    stock: '',
                    collection: ''
                };
            }
        });
        
        // Save money
        moneyInputs.forEach(input => {
            const key = `${input.dataset.tier}::${input.dataset.businessCode}`;
            if (progress[key]) {
                progress[key].money = input.value;
            } else {
                progress[key] = {
                    checked: false,
                    notes: '',
                    money: input.value,
                    stock: '',
                    collection: ''
                };
            }
        });
        
        // Save stock target
        const stockTargetInputs = document.querySelectorAll('.stock-target-input');
        stockTargetInputs.forEach(input => {
            const key = `${input.dataset.tier}::${input.dataset.businessCode}`;
            if (progress[key]) {
                progress[key].stockTarget = input.value;
            } else {
                progress[key] = {
                    checked: false,
                    notes: '',
                    money: '',
                    stockTarget: input.value,
                    collection: ''
                };
            }
        });
        
        // Save collection
        collectionInputs.forEach(input => {
            const key = `${input.dataset.tier}::${input.dataset.businessCode}`;
            if (progress[key]) {
                progress[key].collection = input.value;
            } else {
                progress[key] = {
                    checked: false,
                    notes: '',
                    money: '',
                    stock: '',
                    collection: input.value
                };
            }
        });
        
        // Save hidden businesses
        const hiddenBusinesses = [];
        document.querySelectorAll('.business-item[style*="display: none"]').forEach(item => {
            hiddenBusinesses.push(`${item.dataset.tier}::${item.dataset.businessCode}`);
        });
        progress._hidden = hiddenBusinesses;
        
        localStorage.setItem('businessChecklist', JSON.stringify(progress));
    }

    // Get note for a business
    function getNote(businessId, tierName) {
        const saved = localStorage.getItem('businessChecklistNotes');
        if (saved) {
            const notes = JSON.parse(saved);
            const key = `${tierName}::${businessId}`;
            return notes[key] || '';
        }
        return '';
    }

    // Save note for a business
    function saveNote(businessId, tierName, note) {
        const saved = localStorage.getItem('businessChecklistNotes');
        const notes = saved ? JSON.parse(saved) : {};
        const key = `${tierName}::${businessId}`;
        if (note && note.trim()) {
            notes[key] = note.trim();
        } else {
            delete notes[key];
        }
        localStorage.setItem('businessChecklistNotes', JSON.stringify(notes));
    }

    // Save note from input field
    function saveNoteFromInput(input) {
        const businessId = input.dataset.businessId;
        const tierName = input.dataset.tier;
        const noteText = input.value;
        saveNote(businessId, tierName, noteText);
    }

    // Load progress from localStorage
    function loadProgress() {
        const saved = localStorage.getItem('businessChecklist');
        if (saved) {
            const progress = JSON.parse(saved);
            
            // Load checkbox states
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                const key = `${checkbox.dataset.tier}::${checkbox.value}`;
                if (progress[key] !== undefined) {
                    if (typeof progress[key] === 'boolean') {
                        // Legacy format (just boolean)
                        checkbox.checked = progress[key];
                    } else {
                        // New format (object with checked, notes, money, stock)
                        checkbox.checked = progress[key].checked || false;
                    }
                }
            });
            
            // Load notes
            const notesInputs = document.querySelectorAll('.notes-input');
            notesInputs.forEach(input => {
                const key = `${input.dataset.tier}::${input.dataset.businessCode}`;
                if (progress[key] && typeof progress[key] === 'object') {
                    if (progress[key].notes !== undefined) {
                        input.value = progress[key].notes;
                    }
                }
            });
            
            // Load money
            const moneyInputs = document.querySelectorAll('.money-input');
            moneyInputs.forEach(input => {
                const key = `${input.dataset.tier}::${input.dataset.businessCode}`;
                if (progress[key] && typeof progress[key] === 'object') {
                    if (progress[key].money !== undefined) {
                        input.value = progress[key].money;
                    }
                }
            });
            
            // Load stock target and calculate
            const stockTargetInputs = document.querySelectorAll('.stock-target-input');
            stockTargetInputs.forEach(input => {
                const key = `${input.dataset.tier}::${input.dataset.businessCode}`;
                if (progress[key] && typeof progress[key] === 'object') {
                    if (progress[key].stockTarget !== undefined) {
                        input.value = progress[key].stockTarget;
                        // Trigger calculation
                        const maxStock = parseFloat(input.dataset.maxStock) || 0;
                        if (typeof calculateStockNeededChecklist === 'function') {
                            calculateStockNeededChecklist(input.dataset.tier, input.dataset.businessCode, maxStock);
                        }
                    }
                }
            });
            
            // Load collection
            const collectionInputs = document.querySelectorAll('.collection-input');
            collectionInputs.forEach(input => {
                const key = `${input.dataset.tier}::${input.dataset.businessCode}`;
                if (progress[key] && typeof progress[key] === 'object') {
                    if (progress[key].collection !== undefined) {
                        input.value = progress[key].collection;
                    }
                }
            });
            
            // Load hidden businesses
            if (progress._hidden && Array.isArray(progress._hidden)) {
                progress._hidden.forEach(key => {
                    const [tier, businessCode] = key.split('::');
                    const item = document.querySelector(`.business-item[data-tier="${tier}"][data-business-code="${businessCode}"]`);
                    if (item) {
                        item.style.display = 'none';
                        const btn = item.querySelector('.hide-business-btn');
                        if (btn) {
                            btn.textContent = '👁️‍🗨️';
                            btn.title = 'Show business';
                        }
                    }
                });
            }
        }
        
        // Load product selections from business objects
        const productSelectors = document.querySelectorAll('.product-selector');
        let productSelectionRestored = 0;
        const configData = window.checklistConfigData();
        
        productSelectors.forEach(selector => {
            const businessCode = selector.dataset.businessCode;
            const business = (configData.businesses || []).find(b => b.businessCode === businessCode);
            if (business && business.productId) {
                selector.value = business.productId;
                productSelectionRestored++;
                debugManager.log(`Restored product selection in loadProgress:`, { businessCode, productId: business.productId });
            }
        });
        if (productSelectionRestored > 0) {
            debugManager.log(`✅ Restored ${productSelectionRestored} product selections in loadProgress`);
        }
    }

    // Clear progress
    function clearProgress() {
        if (confirm('Are you sure you want to clear all progress? This will clear checkboxes and notes. This cannot be undone.')) {
            localStorage.removeItem('businessChecklist');
            
            // Uncheck all checkboxes
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = false);
            
            // Clear all notes textareas
            const notesInputs = document.querySelectorAll('.notes-input');
            notesInputs.forEach(input => input.value = '');
            
            // Clear all money inputs
            const moneyInputs = document.querySelectorAll('.money-input');
            moneyInputs.forEach(input => input.value = '');
            
            // Clear all stock target inputs
            const stockTargetInputs = document.querySelectorAll('.stock-target-input');
            stockTargetInputs.forEach(input => {
                input.value = '';
                const displayId = `stock-needed-${input.dataset.tier}-${input.dataset.businessCode}`;
                const display = document.getElementById(displayId);
                if (display) {
                    display.innerHTML = '<small class="text-muted">Enter target to calculate</small>';
                }
            });
            
            // Clear all collection inputs
            const collectionInputs = document.querySelectorAll('.collection-input');
            collectionInputs.forEach(input => input.value = '');
            
            // Show all hidden businesses
            document.querySelectorAll('.business-item').forEach(item => {
                item.style.display = '';
                const btn = item.querySelector('.hide-business-btn');
                if (btn) {
                    btn.textContent = '👁️';
                    btn.title = 'Hide business';
                }
            });
            
            // Update tier checkbox states and recalculate summaries
            const tiers = window.getBusinessTiers();
            tiers.forEach(tier => {
                if (typeof updateTierCheckboxState === 'function') {
                    updateTierCheckboxState(tier.name);
                }
                // Only calculate summary if tier has businesses
                const businesses = document.querySelectorAll(`.business-item[data-tier="${tier.name}"]`);
                if (businesses.length > 0 && typeof calculateTierSummary === 'function') {
                    calculateTierSummary(tier.name);
                }
            });
            
            // Recalculate all business summary
            if (typeof calculateAllBusinessSummary === 'function') {
                calculateAllBusinessSummary();
            }
        }
    }

    // Export functions to global scope
    window.loadAllBusinesses = loadAllBusinesses;
    window.buildChecklist = buildChecklist;
    window.saveProgress = saveProgress;
    window.loadProgress = loadProgress;
    window.clearProgress = clearProgress;
    window.checkAll = checkAll;
    window.uncheckAll = uncheckAll;
    window.updateSummary = updateSummary;
    window.getNote = getNote;
    window.saveNote = saveNote;
    window.saveNoteFromInput = saveNoteFromInput;

})();
