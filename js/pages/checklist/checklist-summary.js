/**
 * Checklist Summary Module
 * Contains tier summary and all-business summary calculation functions
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.checklistDebugManager === 'undefined') {
        console.error('checklist-shared.js must be loaded before checklist-summary.js');
        return;
    }

    const debugManager = window.checklistDebugManager;
    let _summaryReorderMode = false;

    // Toggle tier summary visibility
    function toggleTierSummary(tierName) {
        const tierSummaryVisible = window.tierSummaryVisible || {};
        const oldState = tierSummaryVisible[tierName];
        tierSummaryVisible[tierName] = !oldState;
        
        const newState = tierSummaryVisible[tierName];
        debugManager.log(`Toggling tier summary:`, { tierName, oldState, newState });
        localStorage.setItem('checklistTierSummaryVisible', JSON.stringify(tierSummaryVisible));
        
        const summarySection = document.getElementById(`tier-summary-${tierName}`);
        const toggleBtn = document.querySelector(`.toggle-tier-summary-btn[data-tier="${tierName}"]`);
        
        if (summarySection) {
            summarySection.style.display = newState ? 'block' : 'none';
        }
        
        if (toggleBtn) {
            toggleBtn.textContent = newState ? '📊 Hide Summary' : '📊 Show Summary';
        }
    }

    // Calculate tier summary
    function calculateTierSummary(tierName) {
        debugManager.log(`=== calculateTierSummary START for tier: ${tierName} ===`);
        
        const businesses = document.querySelectorAll(`.business-item[data-tier="${tierName}"]`);
        const summaryBody = document.getElementById(`tier-summary-body-${tierName}`);
        if (!summaryBody) return;

        const productMap = {}; 
        let tierMoneyTotal = 0;
        
        businesses.forEach(businessItem => {
            const businessCode = businessItem.dataset.businessCode;
            const businessCheckbox = businessItem.querySelector(`input[type="checkbox"][data-tier="${tierName}"][value="${businessCode}"]`);
            
            if (businessCheckbox && businessCheckbox.checked) return;

            const moneyInput = businessItem.querySelector(`.money-input[data-tier="${tierName}"][data-business-code="${businessCode}"]`);
            let moneyAmount = 0;
            if (moneyInput) {
                moneyAmount = parseFloat(moneyInput.value.replace(/,/g, '')) || 0;
            }
            tierMoneyTotal += moneyAmount;

            const productSelector = businessItem.querySelector(`.product-selector[data-tier="${tierName}"][data-business-code="${businessCode}"]`);
            const stockNeededDisplay = document.getElementById(`stock-needed-${tierName}-${businessCode}`);
            
            if (!productSelector) return;
            
            const selectedOption = productSelector.options[productSelector.selectedIndex];
            if (!selectedOption || !selectedOption.value) return;
            
            const productName = selectedOption.textContent;
            const productId = selectedOption.value;
            let stockNeeded = 0;
            
            if (stockNeededDisplay) {
                const neededText = stockNeededDisplay.textContent || '';
                const neededMatch = neededText.match(/Needed:\s*([\d,]+)/);
                if (neededMatch) {
                    stockNeeded = parseInt(neededMatch[1].replace(/,/g, '')) || 0;
                }
            }
            
            if (!productMap[productName]) {
                productMap[productName] = { productId, totalNeeded: 0, totalMoney: 0 };
            }
            productMap[productName].totalNeeded += stockNeeded;
            productMap[productName].totalMoney += moneyAmount;
        });
        
        const summaryFooter = document.getElementById(`tier-summary-footer-${tierName}`);
        if (Object.keys(productMap).length === 0) {
            summaryBody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No products selected yet</td></tr>';
            if (summaryFooter && tierMoneyTotal > 0) {
                summaryFooter.innerHTML = `
                    <tr style="background-color: rgba(102, 126, 234, 0.1);">
                        <td><strong>Grand Total (Stock)</strong></td>
                        <td class="text-end"><strong>0</strong></td>
                    </tr>
                    <tr style="background-color: rgba(102, 126, 234, 0.05);">
                        <td><strong>Funds to Collect</strong></td>
                        <td class="text-end"><strong style="color: #11998e;">$${tierMoneyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                    </tr>`;
            } else if (summaryFooter) {
                summaryFooter.innerHTML = '';
            }
            calculateAllBusinessSummary();
            return;
        }
        
        let grandTotalStock = 0;
        const productNames = Object.keys(productMap);
        const sortedProducts = window.getProductsInOrder ? window.getProductsInOrder(productNames) : productNames.sort();
        
        summaryBody.innerHTML = sortedProducts.map(productName => {
            const productData = productMap[productName];
            grandTotalStock += productData.totalNeeded;
            return `
                <tr>
                    <td>${window.escapeHtml(productName)}</td>
                    <td class="text-end"><strong>${productData.totalNeeded.toLocaleString('en-US')}</strong></td>
                </tr>`;
        }).join('');
        
        if (summaryFooter) {
            summaryFooter.innerHTML = `
                <tr style="background-color: rgba(102, 126, 234, 0.1);">
                    <td><strong>Grand Total (Stock)</strong></td>
                    <td class="text-end"><strong>${grandTotalStock.toLocaleString('en-US')}</strong></td>
                </tr>
                <tr style="background-color: rgba(102, 126, 234, 0.05);">
                    <td><strong>Funds to Collect</strong></td>
                    <td class="text-end"><strong style="color: #11998e;">$${tierMoneyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                </tr>`;
        }
        
        calculateAllBusinessSummary();
    }

    // Calculate all business summary
    function calculateAllBusinessSummary() {
        debugManager.log(`=== calculateAllBusinessSummary START ===`);
        const summaryCard = document.getElementById('allBusinessSummaryCard');
        const summaryBody = document.getElementById('allBusinessSummaryBody');
        const headerRow = document.getElementById('allBusinessSummaryHeaderRow');
        const summaryFooter = document.getElementById('allBusinessSummaryFooter');
        
        if (!summaryCard || !summaryBody || !headerRow || !summaryFooter) return;
        
        const tiers = window.getBusinessTiers ? window.getBusinessTiers() : [];
        if (tiers.length === 0) {
            summaryCard.style.display = 'none';
            return;
        }

        const allProductsMap = {}; 
        const tierNames = [];
        const tierMoneyTotalsDirect = {};
        
        tiers.forEach(tier => {
            const tierName = tier.name;
            tierNames.push(tierName);
            tierMoneyTotalsDirect[tierName] = 0;
            
            const businesses = document.querySelectorAll(`.business-item[data-tier="${tierName}"]`);
            businesses.forEach(businessItem => {
                const businessCode = businessItem.dataset.businessCode;
                const businessCheckbox = businessItem.querySelector(`input[type="checkbox"][value="${businessCode}"]`);
                if (businessCheckbox && businessCheckbox.checked) return;
                
                const moneyInput = businessItem.querySelector(`.money-input[data-business-code="${businessCode}"]`);
                let moneyAmount = 0;
                if (moneyInput) {
                    moneyAmount = parseFloat(moneyInput.value.replace(/,/g, '')) || 0;
                }
                tierMoneyTotalsDirect[tierName] += moneyAmount;

                const productSelector = businessItem.querySelector(`.product-selector[data-business-code="${businessCode}"]`);
                const stockNeededDisplay = document.getElementById(`stock-needed-${tierName}-${businessCode}`);
                
                if (!productSelector) return;
                const selectedOption = productSelector.options[productSelector.selectedIndex];
                if (!selectedOption || !selectedOption.value) return;
                
                const productName = selectedOption.textContent;
                const productId = selectedOption.value;
                let stockNeeded = 0;
                if (stockNeededDisplay) {
                    const neededText = stockNeededDisplay.textContent || '';
                    const neededMatch = neededText.match(/Needed:\s*([\d,]+)/);
                    if (neededMatch) stockNeeded = parseInt(neededMatch[1].replace(/,/g, '')) || 0;
                }
                
                if (!allProductsMap[productName]) {
                    allProductsMap[productName] = { productId, tiers: {}, grandTotal: 0 };
                }
                if (!allProductsMap[productName].tiers[tierName]) allProductsMap[productName].tiers[tierName] = 0;
                if (stockNeeded > 0) {
                    allProductsMap[productName].tiers[tierName] += stockNeeded;
                    allProductsMap[productName].grandTotal += stockNeeded;
                }
            });
        });
        
        const overallMoneyTotal = Object.values(tierMoneyTotalsDirect).reduce((a, b) => a + b, 0);

        if (Object.keys(allProductsMap).length === 0) {
            if (overallMoneyTotal > 0) {
                summaryCard.style.display = 'block';
                const tierHeaderCells = tierNames.map(tn => `<th class="text-end">${window.escapeHtml(tn)}</th>`).join('');
                headerRow.innerHTML = `<th>Product Name</th>${tierHeaderCells}<th class="text-end"><strong>Grand Total</strong></th>`;
                summaryBody.innerHTML = `<tr><td colspan="${tierNames.length + 2}" class="text-center text-muted">No products selected yet</td></tr>`;
                
                const tierMoneyTotalCells = tierNames.map(tn => {
                    const total = tierMoneyTotalsDirect[tn];
                    return `<td class="text-end"><strong style="color: #11998e;">${total > 0 ? '$' + total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</strong></td>`;
                }).join('');

                summaryFooter.innerHTML = `
                    <tr style="background-color: rgba(102, 126, 234, 0.1);">
                        <td><strong>Grand Total (Stock)</strong></td>
                        ${tierNames.map(() => '<td class="text-end"><strong>-</strong></td>').join('')}
                        <td class="text-end"><strong>0</strong></td>
                    </tr>
                    <tr style="background-color: rgba(102, 126, 234, 0.05);">
                        <td><strong>Funds to Collect</strong></td>
                        ${tierMoneyTotalCells}
                        <td class="text-end"><strong style="color: #11998e; font-size: 1.1em;">$${overallMoneyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                    </tr>`;
            } else {
                summaryCard.style.display = 'none';
            }
            return;
        }
        
        summaryCard.style.display = 'block';
        const tierHeaderCells = tierNames.map(tn => `<th class="text-end">${window.escapeHtml(tn)}</th>`).join('');
        headerRow.innerHTML = `<th>Product Name</th>${tierHeaderCells}<th class="text-end"><strong>Grand Total</strong></th>`;
        
        const productNames = Object.keys(allProductsMap);
        const sortedProducts = window.getProductsInOrder ? window.getProductsInOrder(productNames) : productNames.sort();
        
        summaryBody.innerHTML = sortedProducts.map(productName => {
            const productData = allProductsMap[productName];
            const tierCells = tierNames.map(tn => {
                const val = productData.tiers[tn] || 0;
                return `<td class="text-end">${val > 0 ? val.toLocaleString('en-US') : '-'}</td>`;
            }).join('');
            
            return `
                <tr ${_summaryReorderMode ? 'draggable="true"' : ''} data-product-name="${window.escapeHtml(productName)}" data-product-id="${productData.productId}">
                    <td><strong>${window.escapeHtml(productName)}</strong></td>
                    ${tierCells}
                    <td class="text-end"><strong>${productData.grandTotal.toLocaleString('en-US')}</strong></td>
                </tr>`;
        }).join('');

        const reorderBtn = document.getElementById('summaryReorderBtn');
        if (reorderBtn) {
            reorderBtn.classList.toggle('active', _summaryReorderMode);
            reorderBtn.classList.toggle('btn-primary', _summaryReorderMode);
            reorderBtn.classList.toggle('btn-outline-secondary', !_summaryReorderMode);
            reorderBtn.innerHTML = _summaryReorderMode ? '✅ Done Reordering' : '⚙️ Manage Order';
        }

        if (_summaryReorderMode) addDragAndDropHandlers(summaryBody);
        
        let overallGrandTotal = 0;
        const tierGrandTotals = {};
        tierNames.forEach(tn => tierGrandTotals[tn] = 0);
        
        sortedProducts.forEach(productName => {
            const productData = allProductsMap[productName];
            tierNames.forEach(tn => tierGrandTotals[tn] += (productData.tiers[tn] || 0));
            overallGrandTotal += productData.grandTotal;
        });
        
        const tierGrandCells = tierNames.map(tn => `<td class="text-end"><strong>${tierGrandTotals[tn] > 0 ? tierGrandTotals[tn].toLocaleString('en-US') : '-'}</strong></td>`).join('');
        const tierMoneyCells = tierNames.map(tn => {
            const total = tierMoneyTotalsDirect[tn];
            return `<td class="text-end"><strong style="color: #11998e;">${total > 0 ? '$' + total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</strong></td>`;
        }).join('');
        
        summaryFooter.innerHTML = `
            <tr style="background-color: rgba(102, 126, 234, 0.1);">
                <td><strong>Grand Total (Stock)</strong></td>
                ${tierGrandCells}
                <td class="text-end"><strong>${overallGrandTotal.toLocaleString('en-US')}</strong></td>
            </tr>
            <tr style="background-color: rgba(102, 126, 234, 0.05);">
                <td><strong>Funds to Collect</strong></td>
                ${tierMoneyCells}
                <td class="text-end"><strong style="color: #11998e; font-size: 1.1em;">$${overallMoneyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
            </tr>`;
    }

    // --- Drag and Drop ---
    let dragSrcEl = null;
    function handleDragStart(e) { this.classList.add('dragging'); dragSrcEl = this; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', this.dataset.productName); }
    function handleDragOver(e) { if (e.preventDefault) e.preventDefault(); e.dataTransfer.dropEffect = 'move'; this.classList.add('drag-over'); return false; }
    function handleDragLeave() { this.classList.remove('drag-over'); }
    function handleDrop(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (dragSrcEl !== this) {
            const allRows = Array.from(this.parentNode.children);
            const srcIdx = allRows.indexOf(dragSrcEl);
            const targetIdx = allRows.indexOf(this);
            if (srcIdx < targetIdx) this.parentNode.insertBefore(dragSrcEl, this.nextSibling);
            else this.parentNode.insertBefore(dragSrcEl, this);
            saveNewProductOrder();
        }
        return false;
    }
    function handleDragEnd() { document.querySelectorAll('#allBusinessSummaryBody tr').forEach(row => { row.classList.remove('dragging', 'drag-over'); }); }

    function saveNewProductOrder() {
        const rows = document.querySelectorAll('#allBusinessSummaryBody tr');
        const newOrder = [];
        rows.forEach(row => { if (row.dataset.productId) newOrder.push(parseInt(row.dataset.productId)); });
        if (newOrder.length > 0 && window.setProductOrder) {
            window.setProductOrder(newOrder);
            calculateAllBusinessSummary();
        }
    }

    function addDragAndDropHandlers(container) {
        const rows = container.querySelectorAll('tr[draggable="true"]');
        rows.forEach(row => {
            row.addEventListener('dragstart', handleDragStart, false);
            row.addEventListener('dragover', handleDragOver, false);
            row.addEventListener('dragleave', handleDragLeave, false);
            row.addEventListener('drop', handleDrop, false);
            row.addEventListener('dragend', handleDragEnd, false);
        });
    }

    // --- Action Functions ---
    function applySortByTier() {
        if (!window.getProductsSortedByTier || !window.setProductOrder) return;
        const sortedIds = window.getProductsSortedByTier();
        if (sortedIds && sortedIds.length > 0) {
            debugManager.log('⚖️ Applying "Sort by Tier" order:', sortedIds);
            window.setProductOrder(sortedIds);
            calculateAllBusinessSummary();
        }
    }

    function applyAlphabeticalSort() {
        if (!window.setProductOrder) return;
        debugManager.log('🔤 Applying "Alphabetical" order (Resetting custom order)');
        window.setProductOrder([]); 
        calculateAllBusinessSummary();
    }

    function toggleSummaryReorderMode() {
        _summaryReorderMode = !_summaryReorderMode;
        debugManager.log(`🔀 Summary Reorder Mode: ${_summaryReorderMode ? 'ON' : 'OFF'}`);
        calculateAllBusinessSummary();
    }

    function copySummaryToClipboard() {
        const table = document.querySelector('#allBusinessSummaryCard table');
        if (!table) return;
        let rows = Array.from(table.querySelectorAll('tr'));
        let text = rows.map(row => Array.from(row.querySelectorAll('th, td')).map(cell => cell.innerText.trim()).join('\t')).join('\n');
        navigator.clipboard.writeText(text).then(() => {
            debugManager.log('📋 Summary copied to clipboard');
            const copyBtn = document.getElementById('summaryCopyBtn');
            if (copyBtn) {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '✅ Copied!';
                setTimeout(() => { copyBtn.innerHTML = originalText; }, 2000);
            }
        });
    }

    // Inject styles
    (function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #allBusinessSummaryBody tr[draggable="true"] { cursor: move; }
            #allBusinessSummaryBody tr.dragging { opacity: 0.5; background-color: rgba(102, 126, 234, 0.1); }
            #allBusinessSummaryBody tr.drag-over { border-top: 2px solid #667eea; }
        `;
        document.head.appendChild(style);
    })();

    // Storage sync
    window.addEventListener('storage', (e) => {
        if (e.key === 'checklistProductTracking') calculateAllBusinessSummary();
    });

    // Exports
    window.toggleTierSummary = toggleTierSummary;
    window.calculateTierSummary = calculateTierSummary;
    window.calculateAllBusinessSummary = calculateAllBusinessSummary;
    window.applyAlphabeticalSort = applyAlphabeticalSort;
    window.applySortByTier = applySortByTier;
    window.toggleSummaryReorderMode = toggleSummaryReorderMode;
    window.copySummaryToClipboard = copySummaryToClipboard;

})();
