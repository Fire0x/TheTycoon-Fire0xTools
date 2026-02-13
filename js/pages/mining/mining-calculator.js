/**
 * Mining Calculator - Recursive manufacturing requirements
 */
(function () {
    function init() {
        const btn = document.getElementById('calcBtn');
        if (btn) btn.addEventListener('click', calculate);

        // Populate select when data is loaded (or wait for it)
        if (window.getMaterials && window.getMaterials().length > 0) {
            populateSelect();
        } else {
            // Poll for data or hook into an event if available
            // For now, simple polling is safe enough given the page structure
            const interval = setInterval(() => {
                const mats = window.getMaterials ? window.getMaterials() : [];
                if (mats.length > 0) {
                    populateSelect();
                    clearInterval(interval);
                }
            }, 500);
        }
    }

    function populateSelect() {
        const select = document.getElementById('calcTargetItem');
        if (!select) return;

        const mats = window.getMaterials ? window.getMaterials() : [];
        const recipes = window.getRecipes ? window.getRecipes() : [];

        // Only show items that can be produced (are outputs of some recipe) OR are Ingots/Sheets
        // or just show all non-ore items?
        // Let's show everything except things that are purely base materials (no recipe outputs to them)
        // Actually, user might want to calculate even for base items (trivial), but mainly for Sheets/Ingots.

        // Let's filter for Type = Ingot or Sheet
        const targetMats = mats.filter(m => {
            const t = (m.type || '').toLowerCase();
            return t === 'ingot' || t === 'sheet';
        });

        // Sort by Name
        targetMats.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        select.innerHTML = '';
        targetMats.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `[${(m.type || '').toUpperCase()}] ${m.name} (Tier ${m.tier})`;
            select.appendChild(opt);
        });
    }

    function calculate() {
        const select = document.getElementById('calcTargetItem');
        const qtyInput = document.getElementById('calcTargetQty');
        const resultsDiv = document.getElementById('calcResults');
        const listDiv = document.getElementById('calcShoppingList');
        const summaryP = document.getElementById('calcSummary');

        if (!select || !select.value) return;

        const targetId = parseInt(select.value, 10);
        const targetQty = parseFloat(qtyInput.value) || 1;
        const materials = window.getMaterials();
        const recipes = window.getRecipes();

        const shoppingList = {}; // materialId -> quantity
        let totalCost = 0;

        // Recursive function to break down requirements
        function addRequirement(matId, qty) {
            // Find recipe that produces this material
            const recipe = recipes.find(r => r.outputs.some(o => o.materialId === matId));

            if (recipe) {
                // It's a crafted item
                // Find how many this recipe produces
                const outputDef = recipe.outputs.find(o => o.materialId === matId);
                const producedQty = outputDef ? outputDef.quantity : 1;

                // How many recipe runs do we need?
                // ratio = qty / producedQty
                const runs = qty / producedQty;

                // Add inputs for these runs
                recipe.inputs.forEach(input => {
                    addRequirement(input.materialId, input.quantity * runs);
                });
            } else {
                // It's a base item (no recipe found to create it)
                // Add to shopping list
                if (!shoppingList[matId]) shoppingList[matId] = 0;
                shoppingList[matId] += qty;
            }
        }

        addRequirement(targetId, targetQty);

        // Render results
        listDiv.innerHTML = '';
        const listUl = document.createElement('ul');
        listUl.className = 'list-group list-group-flush bg-transparent';

        let hasItems = false;
        Object.keys(shoppingList).forEach(id => {
            hasItems = true;
            const mat = materials.find(m => m.id == id);
            const qty = shoppingList[id];
            const name = mat ? mat.name : `Unknown (${id})`;
            const type = mat ? (mat.type || 'Ore') : '';
            const value = mat ? (mat.valuePerUnit || 0) : 0;
            const cost = value * qty;
            totalCost += cost;

            const li = document.createElement('li');
            li.className = 'list-group-item bg-transparent d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span>
                    <strong>${formatNumber(qty)}x</strong> ${name} <span class="badge bg-secondary text-uppercase" style="font-size:0.7em">${type}</span>
                </span>
                <span>$${formatNumber(cost)}</span>
            `;
            listUl.appendChild(li);
        });

        if (!hasItems) {
            listDiv.innerHTML = '<p>No base materials required (Item itself is a base material?).</p>';
        } else {
            listDiv.appendChild(listUl);
        }

        // Calculate potential revenue of the target item
        const targetMat = materials.find(m => m.id == targetId);
        const revenue = (targetMat ? (targetMat.valuePerUnit || 0) : 0) * targetQty;
        const profit = revenue - totalCost;

        summaryP.innerHTML = `
            <strong>Total Cost:</strong> $${formatNumber(totalCost)}<br>
            <strong>Revenue:</strong> $${formatNumber(revenue)}<br>
            <strong>Est. Profit:</strong> <span class="${profit >= 0 ? 'text-success' : 'text-danger'}">$${formatNumber(profit)}</span>
        `;

        resultsDiv.style.display = 'block';
    }

    function formatNumber(n) {
        if (window.NumberFormatter && window.NumberFormatter.formatNumberDisplay) {
            return window.NumberFormatter.formatNumberDisplay(n);
        }
        return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }
})();
