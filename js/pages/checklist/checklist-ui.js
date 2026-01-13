/**
 * Checklist UI Module
 * Contains visibility toggles, tier checkbox management, and stock calculations
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.checklistDebugManager === 'undefined') {
        console.error('checklist-shared.js must be loaded before checklist-ui.js');
        return;
    }

    const debugManager = window.checklistDebugManager;

    // Toggle business visibility
    function toggleBusinessVisibility(button) {
        const businessCode = button.dataset.businessCode;
        const tier = button.dataset.tier;
        const item = document.querySelector(`.business-item[data-tier="${tier}"][data-business-code="${businessCode}"]`);
        
        if (item) {
            if (item.style.display === 'none') {
                // Show business
                item.style.display = '';
                button.textContent = '👁️';
                button.title = 'Hide business';
            } else {
                // Hide business
                item.style.display = 'none';
                button.textContent = '👁️‍🗨️';
                button.title = 'Show business';
            }
            if (typeof window.saveProgress === 'function') {
                window.saveProgress();
            }
            if (typeof updateTierToggleButton === 'function') {
                updateTierToggleButton(tier);
            }
        }
    }

    // Toggle all businesses in a tier
    function toggleTierVisibility(tier) {
        const items = document.querySelectorAll(`.business-item[data-tier="${tier}"]`);
        if (items.length === 0) return;
        
        // Check if all are hidden
        const allHidden = Array.from(items).every(item => item.style.display === 'none');
        
        items.forEach(item => {
            const businessCode = item.dataset.businessCode;
            const hideBtn = item.querySelector(`.hide-business-btn[data-business-code="${businessCode}"]`);
            
            if (allHidden) {
                // Show all
                item.style.display = '';
                if (hideBtn) {
                    hideBtn.textContent = '👁️';
                    hideBtn.title = 'Hide business';
                }
            } else {
                // Hide all
                item.style.display = 'none';
                if (hideBtn) {
                    hideBtn.textContent = '👁️‍🗨️';
                    hideBtn.title = 'Show business';
                }
            }
        });
        
        if (typeof window.saveProgress === 'function') {
            window.saveProgress();
        }
        if (typeof updateTierToggleButton === 'function') {
            updateTierToggleButton(tier);
        }
    }

    // Toggle all businesses checkboxes in a tier
    function toggleTierCheckAll(tierName) {
        const tierCheckbox = document.getElementById(`tier-check-all-${tierName}`);
        if (!tierCheckbox) {
            debugManager.warn(`Tier checkbox not found for tier: ${tierName}`);
            return;
        }
        
        const isChecked = tierCheckbox.checked;
        debugManager.log(`Toggling all businesses in tier ${tierName} to ${isChecked ? 'checked' : 'unchecked'}`);
        
        // Get all business checkboxes in this tier
        const businessCheckboxes = document.querySelectorAll(`input[type="checkbox"][data-tier="${tierName}"]:not(.tier-check-all)`);
        debugManager.log(`Found ${businessCheckboxes.length} business checkboxes in tier ${tierName}`);
        
        businessCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        
        // Save progress
        if (typeof window.saveProgress === 'function') {
            window.saveProgress();
        }
        
        // Recalculate tier summary
        debugManager.log(`Recalculating tier summary for ${tierName} after check-all`);
        if (typeof calculateTierSummary === 'function') {
            calculateTierSummary(tierName);
        }
    }

    // Update tier checkbox state based on individual business checkboxes
    function updateTierCheckboxState(tierName) {
        const tierCheckbox = document.getElementById(`tier-check-all-${tierName}`);
        if (!tierCheckbox) return;
        
        const businessCheckboxes = document.querySelectorAll(`input[type="checkbox"][data-tier="${tierName}"]:not(.tier-check-all)`);
        if (businessCheckboxes.length === 0) return;
        
        const checkedCount = Array.from(businessCheckboxes).filter(cb => cb.checked).length;
        const allChecked = checkedCount === businessCheckboxes.length;
        const someChecked = checkedCount > 0 && checkedCount < businessCheckboxes.length;
        
        // Update checkbox state (indeterminate if some checked, checked if all checked, unchecked if none checked)
        tierCheckbox.checked = allChecked;
        tierCheckbox.indeterminate = someChecked;
        
        debugManager.log(`Updated tier checkbox state for ${tierName}:`, { 
            checked: allChecked, 
            indeterminate: someChecked,
            checkedCount,
            totalCount: businessCheckboxes.length 
        });
    }

    // Update tier toggle button text/state
    function updateTierToggleButton(tier) {
        const items = document.querySelectorAll(`.business-item[data-tier="${tier}"]`);
        if (items.length === 0) return;
        
        const allHidden = Array.from(items).every(item => item.style.display === 'none');
        const tierBtn = document.querySelector(`.toggle-tier-btn[data-tier="${tier}"]`);
        
        if (tierBtn) {
            if (allHidden) {
                tierBtn.textContent = '👁️ Show All';
                tierBtn.title = 'Show all businesses in this tier';
            } else {
                tierBtn.textContent = '👁️‍🗨️ Hide All';
                tierBtn.title = 'Hide all businesses in this tier';
            }
        }
    }

    // Calculate stock needed for checklist
    function calculateStockNeededChecklist(tierName, businessCode, maxStock) {
        const displayId = `stock-needed-${tierName}-${businessCode}`;
        const display = document.getElementById(displayId);
        const input = document.querySelector(`.stock-target-input[data-tier="${tierName}"][data-business-code="${businessCode}"]`);
        
        if (!display || !input) return;
        
        const currentValue = input.value.replace(/,/g, '');
        const current = parseFloat(currentValue) || 0;
        
        if (current === 0) {
            display.innerHTML = '<small class="text-muted">Enter current stock to calculate</small>';
            if (typeof window.saveProgress === 'function') {
                window.saveProgress();
            }
            return;
        }
        
        // Validate: current cannot exceed max
        if (current > maxStock) {
            display.innerHTML = `<small class="text-danger"><strong>Error: Current (${current.toLocaleString('en-US')}) exceeds Max (${maxStock.toLocaleString('en-US')})</strong></small>`;
            return;
        }
        
        // Validate: current cannot be negative
        if (current < 0) {
            display.innerHTML = `<small class="text-danger"><strong>Error: Current cannot be negative</strong></small>`;
            return;
        }
        
        // Calculation: Max Stock - Current Stock = Needed
        const needed = maxStock - current;
        
        let displayText = '';
        if (needed === 0) {
            displayText = '<small style="font-weight: 700; color: #28a745;">✅ Stock is full</small>';
        } else {
            displayText = `<small style="font-weight: 700; color: #11998e;"><strong>📊 Needed: ${needed.toLocaleString('en-US')}</strong></small>`;
        }
        
        display.innerHTML = displayText;
        
        // Auto-save to localStorage only if value is valid
        if (typeof window.saveProgress === 'function') {
            window.saveProgress();
        }
        
        // Recalculate tier summary after stock calculation
        setTimeout(() => {
            debugManager.log(`Stock calculation triggered summary recalculation for tier: ${tierName}`);
            if (typeof calculateTierSummary === 'function') {
                calculateTierSummary(tierName);
            }
        }, 100);
    }

    // Auto-save on checkbox or notes change
    document.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox' || 
            e.target.classList.contains('notes-input') ||
            e.target.classList.contains('money-input') ||
            e.target.classList.contains('stock-input') ||
            e.target.classList.contains('collection-input')) {
            if (typeof window.saveProgress === 'function') {
                window.saveProgress();
            }
            
            // If a business checkbox changed, update tier checkbox state and recalculate tier summary
            if (e.target.type === 'checkbox' && e.target.dataset.tier && !e.target.classList.contains('tier-check-all')) {
                const tierName = e.target.dataset.tier;
                debugManager.log(`Business checkbox changed for tier ${tierName} - updating tier checkbox state and recalculating tier summary`);
                updateTierCheckboxState(tierName);
                if (typeof calculateTierSummary === 'function') {
                    calculateTierSummary(tierName);
                }
            }
        }
    });
    
    // Auto-save on notes/money/stock/collection input (with debounce for textarea and inputs)
    let inputTimeout;
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('notes-input') ||
            e.target.classList.contains('money-input') ||
            e.target.classList.contains('stock-input') ||
            e.target.classList.contains('collection-input')) {
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => {
                if (typeof window.saveProgress === 'function') {
                    window.saveProgress();
                }
            }, 500); // Save 500ms after user stops typing
        }
    });
    
    // Handle hide/show button clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('hide-business-btn')) {
            e.preventDefault();
            toggleBusinessVisibility(e.target);
        } else if (e.target.classList.contains('toggle-tier-btn')) {
            e.preventDefault();
            toggleTierVisibility(e.target.dataset.tier);
        }
    });

    // Export functions to global scope
    window.toggleBusinessVisibility = toggleBusinessVisibility;
    window.toggleTierVisibility = toggleTierVisibility;
    window.toggleTierCheckAll = toggleTierCheckAll;
    window.updateTierCheckboxState = updateTierCheckboxState;
    window.updateTierToggleButton = updateTierToggleButton;
    window.calculateStockNeededChecklist = calculateStockNeededChecklist;

})();
