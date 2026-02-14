/**
 * Merchants Profit Calculator
 * Calculates profit based on Best Prices and user input (Quantity, Total Cost).
 */
(function () {
    'use strict';

    // Store user inputs to persist them across re-renders if possible
    // Map: itemName -> { quantity, totalCost }
    const userInputs = new Map();

    // LocalStorage key for calculator data
    const STORAGE_KEY = 'merchantsProfitCalculatorInputs';

    // Load saved inputs from localStorage
    function loadFromStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                Object.entries(data).forEach(([key, value]) => {
                    userInputs.set(key, value);
                });
            }
        } catch (e) {
            console.error('Failed to load calculator inputs from storage:', e);
        }
    }

    // Save inputs to localStorage
    function saveToStorage() {
        try {
            const data = {};
            userInputs.forEach((value, key) => {
                data[key] = value;
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save calculator inputs to storage:', e);
        }
    }

    // Load saved data on initialization
    loadFromStorage();

    // Initialize calculator (exposed globally)
    function renderProfitCalculator() {
        const container = document.getElementById('profitCalculatorContainer');
        const section = document.getElementById('profitCalculatorSection');

        if (!container || !section) return;

        const bestPrices = window.calculateBestPrices ? window.calculateBestPrices() : {};
        const items = Object.keys(bestPrices);

        if (items.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';

        // Sort items by price (high to low) to match Best Prices display
        items.sort((a, b) => {
            const priceDiff = bestPrices[b].price - bestPrices[a].price;
            if (priceDiff !== 0) return priceDiff;
            // Secondary sort by name to prevent jumping
            return a.localeCompare(b);
        });

        // Save current DOM values to map if they exist (in case user was typing)
        saveCurrentInputs();

        let html = `
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th style="width: 25%">Item</th>
                            <th style="width: 15%">Best Price</th>
                            <th style="width: 15%">Quantity</th>
                            <th style="width: 15%">Total Cost</th>
                            <th style="width: 15%">Total Profit</th>
                            <th style="width: 15%">Profit / Unit</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        items.forEach(itemKey => {
            const itemData = bestPrices[itemKey];
            const safeKey = itemKey.replace(/"/g, '&quot;');

            // Retrieve previous values or defaults
            const inputs = userInputs.get(itemKey) || { quantity: 1, totalCost: 0 };

            const bestPrice = itemData.price || 0;
            const quantity = inputs.quantity;
            const totalCost = inputs.totalCost;

            const totalRevenue = bestPrice * quantity;
            const totalProfit = totalRevenue - totalCost;
            const profitPerUnit = quantity > 0 ? (totalProfit / quantity) : 0;

            const profitClass = totalProfit >= 0 ? 'text-success' : 'text-danger';
            const unitClass = profitPerUnit >= 0 ? 'text-success' : 'text-danger';

            html += `
                <tr data-item="${safeKey}">
                    <td>
                        <div class="d-flex align-items-center">
                            <span class="merchant-icon me-2">${itemData.emoji || '📦'}</span>
                            <strong>${escapeHtml(itemData.item)}</strong>
                        </div>
                    </td>
                    <td>
                        <div class="fw-bold text-primary">$${formatNumber(bestPrice)}</div>
                    </td>
                    <td>
                        <input type="text" class="form-control form-control-sm calc-qty number-input" 
                               data-item="${safeKey}" value="${formatNumber(quantity, false)}" inputmode="numeric">
                    </td>
                    <td>
                        <input type="text" class="form-control form-control-sm calc-cost money-input" 
                               data-item="${safeKey}" value="${formatNumber(totalCost, true)}" inputmode="decimal">
                    </td>
                    <td>
                        <div class="fw-bold ${profitClass} calc-total-profit">$${formatNumber(totalProfit)}</div>
                    </td>
                    <td>
                        <div class="fw-bold ${unitClass} calc-unit-profit">$${formatNumber(profitPerUnit)}</div>
                    </td>
                </tr>
            `;
        });

        html += `   </tbody>
                </table>
            </div>`;

        container.innerHTML = html;

        // Initialize number formatting for the new inputs
        if (window.NumberFormatter && window.NumberFormatter.initNumberFormatting) {
            window.NumberFormatter.initNumberFormatting({
                selector: '#profitCalculatorContainer .number-input, #profitCalculatorContainer .money-input'
            });
        }

        // Re-attach event listeners
        attachCalculatorListeners(container, bestPrices);
    }

    function saveCurrentInputs() {
        const container = document.getElementById('profitCalculatorContainer');
        if (!container) return;

        const rows = container.querySelectorAll('tr[data-item]');
        rows.forEach(row => {
            const itemKey = row.getAttribute('data-item');
            const qtyInput = row.querySelector('.calc-qty');
            const costInput = row.querySelector('.calc-cost');

            if (qtyInput && costInput) {
                userInputs.set(itemKey, {
                    quantity: parseFormattedNumber(qtyInput.value),
                    totalCost: parseFormattedNumber(costInput.value)
                });
            }
        });
    }

    function attachCalculatorListeners(container, bestPrices) {
        // Delegate events for better performance
        container.addEventListener('input', function (e) {
            if (e.target.classList.contains('calc-qty') || e.target.classList.contains('calc-cost')) {
                const row = e.target.closest('tr');
                if (!row) return;

                const itemKey = row.getAttribute('data-item');
                const itemData = bestPrices[itemKey];
                if (!itemData) return;

                const qtyInput = row.querySelector('.calc-qty');
                const costInput = row.querySelector('.calc-cost');

                const quantity = parseFormattedNumber(qtyInput.value);
                const totalCost = parseFormattedNumber(costInput.value);
                const bestPrice = itemData.price || 0;

                // Update stored values
                userInputs.set(itemKey, { quantity, totalCost });

                // Save to localStorage
                saveToStorage();

                // Calculate
                const totalRevenue = bestPrice * quantity;
                const totalProfit = totalRevenue - totalCost;
                const profitPerUnit = quantity > 0 ? (totalProfit / quantity) : 0;

                // Update DOM
                const totalEl = row.querySelector('.calc-total-profit');
                const unitEl = row.querySelector('.calc-unit-profit');

                if (totalEl) {
                    totalEl.textContent = '$' + formatNumber(totalProfit);
                    totalEl.className = `fw-bold calc-total-profit ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`;
                }

                if (unitEl) {
                    unitEl.textContent = '$' + formatNumber(profitPerUnit);
                    unitEl.className = `fw-bold calc-unit-profit ${profitPerUnit >= 0 ? 'text-success' : 'text-danger'}`;
                }
            }
        });
    }

    // Helper functions
    function formatNumber(num, isMoney = true) {
        if (window.NumberFormatter && window.NumberFormatter.formatNumber) {
            return window.NumberFormatter.formatNumber(num, isMoney);
        }
        return num.toLocaleString('en-US', { minimumFractionDigits: isMoney ? 2 : 0, maximumFractionDigits: 2 });
    }

    function parseFormattedNumber(str) {
        if (window.NumberFormatter && window.NumberFormatter.parseFormattedNumber) {
            return window.NumberFormatter.parseFormattedNumber(str);
        }
        return parseFloat(str.replace(/[^0-9.-]/g, '')) || 0;
    }

    function escapeHtml(text) {
        if (window.escapeHtml) {
            return window.escapeHtml(text);
        }
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Export to global scope
    window.renderProfitCalculator = renderProfitCalculator;

})();
