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

    // Get products sorted by custom order (or alphabetical if no order set)
    function getProductsInOrder(productNames) {
        debugManager.log(`=== getProductsInOrder START ===`);
        debugManager.log(`Input product names:`, productNames);
        
        const configData = window.checklistConfigData();
        if (!configData || !configData.productOrder || configData.productOrder.length === 0) {
            // No custom order, return alphabetically sorted
            const sorted = productNames.sort();
            debugManager.log(`No custom order found, using alphabetical order:`, sorted);
            debugManager.log(`=== getProductsInOrder END (alphabetical) ===`);
            return sorted;
        }
        
        const productOrder = configData.productOrder;
        debugManager.log(`Custom product order found:`, productOrder);
        const orderedProducts = [];
        const unorderedProducts = [];
        
        // First, add products in the custom order
        productOrder.forEach(productId => {
            // Find product name by ID
            const product = (configData.products || []).find(p => p.id === productId);
            if (product && productNames.includes(product.productName)) {
                orderedProducts.push(product.productName);
                debugManager.log(`Added ordered product: ${product.productName} (ID: ${productId})`);
            } else if (product) {
                debugManager.log(`Skipped product ${product.productName} (ID: ${productId}) - not in productNames list`);
            }
        });
        
        // Then add any products not in the order list (alphabetically)
        productNames.forEach(productName => {
            if (!orderedProducts.includes(productName)) {
                unorderedProducts.push(productName);
            }
        });
        unorderedProducts.sort();
        debugManager.log(`Found ${unorderedProducts.length} unordered products:`, unorderedProducts);
        
        const finalOrder = [...orderedProducts, ...unorderedProducts];
        debugManager.log(`Final product order:`, finalOrder);
        debugManager.log(`=== getProductsInOrder END (custom order) ===`);
        return finalOrder;
    }

    // Toggle tier summary visibility
    function toggleTierSummary(tierName) {
        const tierSummaryVisible = window.tierSummaryVisible;
        const oldState = tierSummaryVisible[tierName];
        if (!tierSummaryVisible.hasOwnProperty(tierName)) {
            tierSummaryVisible[tierName] = true;
        } else {
            tierSummaryVisible[tierName] = !tierSummaryVisible[tierName];
        }
        const newState = tierSummaryVisible[tierName];
        debugManager.log(`Toggling tier summary:`, { tierName, oldState, newState });
        localStorage.setItem('checklistTierSummaryVisible', JSON.stringify(tierSummaryVisible));
        window.setTierSummaryVisible(tierSummaryVisible);
        
        const summarySection = document.getElementById(`tier-summary-${tierName}`);
        const toggleBtn = document.querySelector(`.toggle-tier-summary-btn[data-tier="${tierName}"]`);
        
        if (summarySection) {
            summarySection.style.display = tierSummaryVisible[tierName] ? 'block' : 'none';
        }
        
        if (toggleBtn) {
            toggleBtn.textContent = tierSummaryVisible[tierName] ? '📊 Hide Summary' : '📊 Show Summary';
        }
    }

    // Calculate tier summary
    function calculateTierSummary(tierName) {
        debugManager.log(`=== calculateTierSummary START for tier: ${tierName} ===`);
        
        // Get all businesses for this tier first
        const businesses = document.querySelectorAll(`.business-item[data-tier="${tierName}"]`);
        debugManager.log(`Found ${businesses.length} businesses for tier ${tierName}`);
        
        // Check if summary body exists (only created if tier has businesses)
        const summaryBody = document.getElementById(`tier-summary-body-${tierName}`);
        if (!summaryBody) {
            // Silently return if no summary body exists (tier has no businesses)
            debugManager.log(`No summary body found for tier: ${tierName} (tier has no businesses)`);
            return;
        }
        const productMap = {}; // productName -> { totalNeeded: number, businesses: [] }
        
        let checkedCount = 0;
        let skippedCount = 0;
        let processedCount = 0;
        let tierMoneyTotal = 0;
        
        businesses.forEach(businessItem => {
            const businessCode = businessItem.dataset.businessCode;
            
            // Check if business checkbox is checked - if checked, ignore this business
            const businessCheckbox = businessItem.querySelector(`input[type="checkbox"][data-tier="${tierName}"][value="${businessCode}"]`);
            if (businessCheckbox && businessCheckbox.checked) {
                checkedCount++;
                debugManager.log(`Business ${businessCode}: Checkbox is checked - skipping from total calculation`);
                return;
            }

            // Get money value - do this before product check to include all money
            const moneyInput = businessItem.querySelector(`.money-input[data-tier="${tierName}"][data-business-code="${businessCode}"]`);
            let moneyAmount = 0;
            if (moneyInput) {
                const moneyValue = moneyInput.value.replace(/,/g, '');
                moneyAmount = parseFloat(moneyValue) || 0;
            }
            tierMoneyTotal += moneyAmount;

            const productSelector = businessItem.querySelector(`.product-selector[data-tier="${tierName}"][data-business-code="${businessCode}"]`);
            const stockNeededDisplay = document.getElementById(`stock-needed-${tierName}-${businessCode}`);
            
            if (!productSelector) {
                skippedCount++;
                return;
            }
            
            const selectedOption = productSelector.options[productSelector.selectedIndex];
            if (!selectedOption || !selectedOption.value) {
                skippedCount++;
                return;
            }
            
            processedCount++;
            const productName = selectedOption.textContent;
            const productId = selectedOption.value;
            
            // Get stock needed value
            let stockNeeded = 0;
            if (stockNeededDisplay) {
                const neededText = stockNeededDisplay.textContent || '';
                const neededMatch = neededText.match(/Needed:\s*([\d,]+)/);
                if (neededMatch) {
                    stockNeeded = parseInt(neededMatch[1].replace(/,/g, '')) || 0;
                }
            }
            
            debugManager.log(`Business ${businessCode}: Product="${productName}", StockNeeded=${stockNeeded}, Money=${moneyAmount}`);
            
            // Initialize product in map if not exists
            if (!productMap[productName]) {
                productMap[productName] = {
                    productId: productId,
                    totalNeeded: 0,
                    totalMoney: 0,
                    businesses: []
                };
            }
            
            // Add to total if stock needed > 0
            if (stockNeeded > 0) {
                productMap[productName].totalNeeded += stockNeeded;
            }
            // Add money to product total
            productMap[productName].totalMoney += moneyAmount;

            productMap[productName].businesses.push({
                code: businessCode,
                needed: stockNeeded,
                money: moneyAmount
            });
        });
        
        debugManager.log(`Tier summary stats:`, { 
            tierName, 
            totalBusinesses: businesses.length, 
            checked: checkedCount, 
            skipped: skippedCount, 
            processed: processedCount,
            productsFound: Object.keys(productMap).length 
        });
        debugManager.log(`Product map:`, productMap);
        
        // Render summary table
        const summaryFooter = document.getElementById(`tier-summary-footer-${tierName}`);
        if (Object.keys(productMap).length === 0) {
            summaryBody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No products selected yet</td></tr>';
            
            // Still render the footer if we have money!
            if (summaryFooter && tierMoneyTotal > 0) {
                summaryFooter.innerHTML = `
                    <tr style="background-color: rgba(102, 126, 234, 0.1);">
                        <td><strong>Grand Total (Stock)</strong></td>
                        <td class="text-end"><strong style="font-size: 1.1em;">0</strong></td>
                    </tr>
                    <tr style="background-color: rgba(102, 126, 234, 0.05);">
                        <td><strong>Funds to Collect</strong></td>
                        <td class="text-end"><strong style="color: #11998e;">$${tierMoneyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                    </tr>
                `;
            } else if (summaryFooter) {
                summaryFooter.innerHTML = '';
            }
            
            debugManager.log(`No products found for tier ${tierName}, but money total is ${tierMoneyTotal}`);
            if (typeof calculateAllBusinessSummary === 'function') {
                calculateAllBusinessSummary();
            }
            return;
        }
        
        // Calculate grand totals
        let grandTotalStock = 0;
        let grandTotalMoney = 0;
        const productNames = Object.keys(productMap);
        const sortedProducts = getProductsInOrder(productNames);
        
        summaryBody.innerHTML = sortedProducts.map(productName => {
            const productData = productMap[productName];
            const totalNeeded = productData.totalNeeded;
            const totalMoney = productData.totalMoney;
            grandTotalStock += totalNeeded;
            grandTotalMoney += totalMoney;
            
            debugManager.log(`Product "${productName}": totalNeeded=${totalNeeded}, totalMoney=${totalMoney}`);
            
            return `
                <tr>
                    <td>${window.escapeHtml(productName)}</td>
                    <td class="text-end">
                        <strong>${totalNeeded.toLocaleString('en-US')}</strong>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Render grand total footer
        if (summaryFooter) {
            summaryFooter.innerHTML = `
                <tr style="background-color: rgba(102, 126, 234, 0.1);">
                    <td><strong>Grand Total (Stock)</strong></td>
                    <td class="text-end"><strong style="font-size: 1.1em;">${grandTotalStock.toLocaleString('en-US')}</strong></td>
                </tr>
                <tr style="background-color: rgba(102, 126, 234, 0.05);">
                    <td><strong>Funds to Collect</strong></td>
                    <td class="text-end"><strong style="color: #11998e;">$${tierMoneyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                </tr>
            `;
        }
        
        debugManager.log(`Tier summary for ${tierName}: stock=${grandTotalStock}, money=${grandTotalMoney}`);
        debugManager.log(`=== calculateTierSummary END for tier: ${tierName} ===`);
        
        // Recalculate all business summary after tier summary is updated
        if (typeof calculateAllBusinessSummary === 'function') {
            calculateAllBusinessSummary();
        }
    }

    // Calculate all business summary (aggregates all tier summaries)
    function calculateAllBusinessSummary() {
        debugManager.log(`=== calculateAllBusinessSummary START ===`);
        const summaryCard = document.getElementById('allBusinessSummaryCard');
        const summaryBody = document.getElementById('allBusinessSummaryBody');
        const headerRow = document.getElementById('allBusinessSummaryHeaderRow');
        const summaryFooter = document.getElementById('allBusinessSummaryFooter');
        
        if (!summaryCard || !summaryBody || !headerRow || !summaryFooter) {
            debugManager.warn('All Business Summary elements not found');
            return;
        }
        
        // Aggregate product data from all tiers
        const allProductsMap = {}; // productName -> { tiers: { tierName: totalNeeded }, grandTotal: number }
        const tierNames = [];
        const tiers = window.getBusinessTiers();
        
        if (!tiers || tiers.length === 0) {
            debugManager.log('No tiers found, hiding summary card');
            summaryCard.style.display = 'none';
            return;
        }

        let totalChecked = 0;
        let totalProcessed = 0;
        let totalSkipped = 0;
        const tierMoneyTotalsDirect = {}; // To store money total per tier independently of products
        
        tiers.forEach(tier => {
            const tierName = tier.name;
            tierNames.push(tierName);
            tierMoneyTotalsDirect[tierName] = 0;
            
            // Get all businesses for this tier
            const businesses = document.querySelectorAll(`.business-item[data-tier="${tierName}"]`);
            debugManager.log(`Tier ${tierName}: Found ${businesses.length} businesses`);
            
            businesses.forEach(businessItem => {
                const businessCode = businessItem.dataset.businessCode;
                
                // Check if business checkbox is checked - if checked, ignore this business
                const businessCheckbox = businessItem.querySelector(`input[type="checkbox"][data-tier="${tierName}"][value="${businessCode}"]`);
                if (businessCheckbox && businessCheckbox.checked) {
                    totalChecked++;
                    return;
                }
                
                // Get money value - do this before product check
                const moneyInput = businessItem.querySelector(`.money-input[data-tier="${tierName}"][data-business-code="${businessCode}"]`);
                let moneyAmount = 0;
                if (moneyInput) {
                    const moneyValue = moneyInput.value.replace(/,/g, '');
                    moneyAmount = parseFloat(moneyValue) || 0;
                }
                tierMoneyTotalsDirect[tierName] += moneyAmount;

                const productSelector = businessItem.querySelector(`.product-selector[data-tier="${tierName}"][data-business-code="${businessCode}"]`);
                const stockNeededDisplay = document.getElementById(`stock-needed-${tierName}-${businessCode}`);
                
                if (!productSelector) {
                    totalSkipped++;
                    return;
                }
                
                const selectedOption = productSelector.options[productSelector.selectedIndex];
                if (!selectedOption || !selectedOption.value) {
                    totalSkipped++;
                    return;
                }
                
                totalProcessed++;
                const productName = selectedOption.textContent;
                
                // Get stock needed value
                let stockNeeded = 0;
                if (stockNeededDisplay) {
                    const neededText = stockNeededDisplay.textContent || '';
                    const neededMatch = neededText.match(/Needed:\s*([\d,]+)/);
                    if (neededMatch) {
                        stockNeeded = parseInt(neededMatch[1].replace(/,/g, '')) || 0;
                    }
                }
                
                // Initialize product in map if not exists
                if (!allProductsMap[productName]) {
                    allProductsMap[productName] = {
                        tiers: {},
                        grandTotal: 0,
                        moneyTiers: {},
                        grandTotalMoney: 0
                    };
                }
                
                // Initialize tier entry if not exists
                if (!allProductsMap[productName].tiers[tierName]) {
                    allProductsMap[productName].tiers[tierName] = 0;
                }
                if (!allProductsMap[productName].moneyTiers[tierName]) {
                    allProductsMap[productName].moneyTiers[tierName] = 0;
                }
                
                // Add to tier total and grand total
                if (stockNeeded > 0) {
                    allProductsMap[productName].tiers[tierName] += stockNeeded;
                    allProductsMap[productName].grandTotal += stockNeeded;
                }
                
                // Add money
                allProductsMap[productName].moneyTiers[tierName] += moneyAmount;
                allProductsMap[productName].grandTotalMoney += moneyAmount;
            });
        });
        
        debugManager.log(`All business summary stats:`, {
            totalTiers: tierNames.length,
            totalProducts: Object.keys(allProductsMap).length,
            totalChecked,
            totalProcessed,
            totalSkipped,
            overallGrandTotal: 0 // Will be calculated below
        });
        debugManager.log(`All products map:`, allProductsMap);
        
        // Check if there are any money totals
        const overallMoneyTotalDirect = Object.values(tierMoneyTotalsDirect).reduce((a, b) => a + b, 0);

        // Check if there are any products
        if (Object.keys(allProductsMap).length === 0) {
            const colspan = tierNames.length + 2;
            summaryBody.innerHTML = `<tr><td colspan="${colspan}" class="text-center text-muted">No products selected yet</td></tr>`;
            
            // Still render the footer if we have money!
            if (summaryFooter && overallMoneyTotalDirect > 0) {
                summaryCard.style.display = 'block';
                // Rebuild tier header columns
                const tierHeaderCells = tierNames.map(tierName => 
                    `<th class="text-end">${window.escapeHtml(tierName)}</th>`
                ).join('');
                headerRow.innerHTML = `<th>Product Name</th>${tierHeaderCells}<th class="text-end"><strong>Grand Total</strong></th>`;

                const tierMoneyTotalCells = tierNames.map(tierName => {
                    const total = tierMoneyTotalsDirect[tierName];
                    return `<td class="text-end"><strong style="color: #11998e;">${total > 0 ? '$' + total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</strong></td>`;
                }).join('');

                summaryFooter.innerHTML = `
                    <tr style="background-color: rgba(102, 126, 234, 0.1);">
                        <td><strong>Grand Total (Stock)</strong></td>
                        ${tierNames.map(() => '<td class="text-end"><strong>-</strong></td>').join('')}
                        <td class="text-end"><strong style="font-size: 1.1em;">0</strong></td>
                    </tr>
                    <tr style="background-color: rgba(102, 126, 234, 0.05);">
                        <td><strong>Funds to Collect</strong></td>
                        ${tierMoneyTotalCells}
                        <td class="text-end"><strong style="color: #11998e; font-size: 1.1em;">$${overallMoneyTotalDirect.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                    </tr>
                `;
            } else {
                summaryFooter.innerHTML = '';
                summaryCard.style.display = 'none';
            }
            
            debugManager.log(`No products found across all tiers, but overall money total is ${overallMoneyTotalDirect}`);
            return;
        }
        
        // Show the summary card
        summaryCard.style.display = 'block';
        
        // Rebuild tier header columns
        const tierHeaderCells = tierNames.map(tierName => 
            `<th class="text-end">${window.escapeHtml(tierName)}</th>`
        ).join('');
        headerRow.innerHTML = `<th>Product Name</th>${tierHeaderCells}<th class="text-end"><strong>Grand Total</strong></th>`;
        
        // Build table rows
        const productNames = Object.keys(allProductsMap);
        const sortedProducts = getProductsInOrder(productNames);
        summaryBody.innerHTML = sortedProducts.map(productName => {
            const productData = allProductsMap[productName];
            const tierCells = tierNames.map(tierName => {
                const tierTotal = productData.tiers[tierName] || 0;
                return `<td class="text-end">${tierTotal > 0 ? tierTotal.toLocaleString('en-US') : '-'}</td>`;
            }).join('');
            
            return `
                <tr>
                    <td><strong>${window.escapeHtml(productName)}</strong></td>
                    ${tierCells}
                    <td class="text-end"><strong>${productData.grandTotal.toLocaleString('en-US')}</strong></td>
                </tr>
            `;
        }).join('');
        
        // Calculate grand totals for each tier and overall
        const tierGrandTotals = {};
        const tierMoneyTotals = {};
        let overallGrandTotal = 0;
        
        tierNames.forEach(tierName => {
            tierGrandTotals[tierName] = 0;
            tierMoneyTotals[tierName] = 0;
        });
        
        sortedProducts.forEach(productName => {
            const productData = allProductsMap[productName];
            tierNames.forEach(tierName => {
                const tierTotal = productData.tiers[tierName] || 0;
                tierGrandTotals[tierName] += tierTotal;
                
                const tierMoney = productData.moneyTiers[tierName] || 0;
                tierMoneyTotals[tierName] += tierMoney;
            });
            overallGrandTotal += productData.grandTotal;
        });
        
        const overallMoneyTotal = overallMoneyTotalDirect;
        
        // Build grand total rows
        const tierGrandTotalCells = tierNames.map(tierName => {
            const total = tierGrandTotals[tierName];
            return `<td class="text-end"><strong>${total > 0 ? total.toLocaleString('en-US') : '-'}</strong></td>`;
        }).join('');
        
        const tierMoneyTotalCells = tierNames.map(tierName => {
            const total = tierMoneyTotalsDirect[tierName];
            return `<td class="text-end"><strong style="color: #11998e;">${total > 0 ? '$' + total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</strong></td>`;
        }).join('');
        
        summaryFooter.innerHTML = `
            <tr style="background-color: rgba(102, 126, 234, 0.1);">
                <td><strong>Grand Total (Stock)</strong></td>
                ${tierGrandTotalCells}
                <td class="text-end"><strong style="font-size: 1.1em;">${overallGrandTotal.toLocaleString('en-US')}</strong></td>
            </tr>
            <tr style="background-color: rgba(102, 126, 234, 0.05);">
                <td><strong>Funds to Collect</strong></td>
                ${tierMoneyTotalCells}
                <td class="text-end"><strong style="color: #11998e; font-size: 1.1em;">$${overallMoneyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
            </tr>
        `;
        
        debugManager.log(`All business summary complete:`, {
            totalTiers: tierNames.length,
            totalProducts: sortedProducts.length,
            overallGrandTotal,
            overallMoneyTotal
        });
        debugManager.log(`=== calculateAllBusinessSummary END ===`);
    }

    // Export functions to global scope
    window.toggleTierSummary = toggleTierSummary;
    window.calculateTierSummary = calculateTierSummary;
    window.calculateAllBusinessSummary = calculateAllBusinessSummary;
    window.getProductsInOrder = getProductsInOrder;

})();
