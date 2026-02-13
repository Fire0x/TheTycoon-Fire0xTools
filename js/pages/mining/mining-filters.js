/**
 * Mining Filters - Advanced filtering for materials table
 */
(function () {
    const filters = {
        name: '',
        tier: [],
        type: []
    };

    function init() {
        renderFilterUI();
    }

    // Expose for mining-materials-ui.js
    window.getMaterialFilters = function () {
        return filters;
    };

    function renderFilterUI() {
        const container = document.getElementById('materialsFilterContainer');
        if (!container) return;

        // Check if we already rendered to avoid overwriting
        if (container.innerHTML.trim().length > 0) {
            // Re-attach listeners if needed, or just return if it's static
            // For now, simple re-render approach or just render once.
            // Let's render once.
            return;
        }

        const html = `
            <div class="row g-2 align-items-center p-2 rounded border" style="background-color: var(--bg-color); border-color: var(--card-border) !important; color: var(--text-color);">
                <div class="col-md-3">
                    <input type="text" class="form-control form-control-sm" id="matFilterName" placeholder="Search name...">
                </div>
                <div class="col-md-3">
                    <div class="d-flex gap-2">
                        <div class="form-check form-check-inline mb-0">
                            <input class="form-check-input" type="checkbox" id="checkTypeOre" value="ore" checked>
                            <label class="form-check-label small" for="checkTypeOre">Ore</label>
                        </div>
                        <div class="form-check form-check-inline mb-0">
                            <input class="form-check-input" type="checkbox" id="checkTypeIngot" value="ingot" checked>
                            <label class="form-check-label small" for="checkTypeIngot">Ingot</label>
                        </div>
                        <div class="form-check form-check-inline mb-0">
                            <input class="form-check-input" type="checkbox" id="checkTypeSheet" value="sheet" checked>
                            <label class="form-check-label small" for="checkTypeSheet">Sheet</label>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                     <div class="d-flex gap-2 flex-wrap align-items-center">
                        <span class="small me-1">Tier:</span>
                        <!-- Generate Tiers 1-5 dynamically or hardcode common ones -->
                        <div class="btn-group btn-group-sm" role="group">
                             <input type="checkbox" class="btn-check tier-check" id="tier1" autocomplete="off" value="1">
                             <label class="btn btn-outline-secondary py-0" for="tier1">1</label>

                             <input type="checkbox" class="btn-check tier-check" id="tier2" autocomplete="off" value="2">
                             <label class="btn btn-outline-secondary py-0" for="tier2">2</label>

                             <input type="checkbox" class="btn-check tier-check" id="tier3" autocomplete="off" value="3">
                             <label class="btn btn-outline-secondary py-0" for="tier3">3</label>
                             
                             <input type="checkbox" class="btn-check tier-check" id="tier4" autocomplete="off" value="4">
                             <label class="btn btn-outline-secondary py-0" for="tier4">4</label>

                             <input type="checkbox" class="btn-check tier-check" id="tier5" autocomplete="off" value="5">
                             <label class="btn btn-outline-secondary py-0" for="tier5">5+</label>
                        </div>
                     </div>
                </div>
                <div class="col-md-2 text-end">
                    <button class="btn btn-sm btn-outline-secondary" id="clearMatFilters">Clear</button>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Wire events
        const nameInput = document.getElementById('matFilterName');
        const typeChecks = container.querySelectorAll('input[type="checkbox"][id^="checkType"]');
        const tierChecks = container.querySelectorAll('.tier-check');
        const clearBtn = document.getElementById('clearMatFilters');

        function updateFilters() {
            filters.name = nameInput ? nameInput.value.trim() : '';

            filters.type = [];
            typeChecks.forEach(cb => {
                if (cb.checked) filters.type.push(cb.value);
            });

            filters.tier = [];
            tierChecks.forEach(cb => {
                if (cb.checked) {
                    const val = parseInt(cb.value, 10);
                    if (val === 5) {
                        // Special case for 5+
                        filters.minTier = 5;
                    } else {
                        filters.tier.push(val);
                    }
                }
            });
            // If 5+ is checked, we handle logic in filtering, but for now simple list is okay.
            // Actually let's just treat "5" as "5 and above" if we want, or just "5".
            // Implementation detail: let's stick to exact match for 1-4, and 5 is >= 5? 
            // Or just check specific tiers. Let's assume standard behavior for now.

            // Trigger render
            if (window.renderMaterials) window.renderMaterials();
        }

        if (nameInput) nameInput.addEventListener('input', updateFilters);
        typeChecks.forEach(cb => cb.addEventListener('change', updateFilters));
        tierChecks.forEach(cb => cb.addEventListener('change', updateFilters));

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (nameInput) nameInput.value = '';
                typeChecks.forEach(cb => cb.checked = true);
                tierChecks.forEach(cb => cb.checked = false);
                filters.minTier = undefined; // reset special
                updateFilters();
            });
        }

        // Initial set
        updateFilters(); // This primes the filters object
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }
})();
