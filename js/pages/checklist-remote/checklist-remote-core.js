/**
 * checklist-remote-core.js
 * Data loading from /n/businesses and /n/employees APIs.
 * Populates window.allOpenBusinesses and triggers buildRemoteChecklist().
 */

window.loadRemoteBusinessData = async function () {
    if (window.debug) window.debug.log('🔄 Loading remote business data from localStorage...');
    const loadingAlert = document.getElementById('loadingAlert');
    if (loadingAlert) loadingAlert.style.display = '';

    try {
        const configData = window.checklistConfigData();
        if (!configData) {
            throw new Error('Checklist configuration not found in localStorage.');
        }

        const businesses = configData.businesses || [];
        const tiers = configData.tiers || [];
        const products = configData.products || [];

        // Build tier map: tier_id -> tier_name
        const tierMap = {};
        tiers.forEach(t => {
            tierMap[t.id] = t.name || `Tier ${t.id}`;
        });

        // Build tier number map: tier_id -> tier_number (if available, else index)
        const tierNumberMap = {};
        tiers.forEach((t, idx) => {
            tierNumberMap[t.id] = t.tier_number || (idx + 1);
        });

        if (window.debug) window.debug.log(`📦 Loaded ${businesses.length} businesses, ${tiers.length} tiers, ${products.length} products from localStorage`);

        // Build map keyed by business_code — open businesses only
        window.allOpenBusinesses = {};

        businesses.forEach(biz => {
            if (!biz.businessCode) return;
            // Only open, non-placeholder businesses
            if (biz.status !== 'Open') return;
            if ((biz.businessName || biz.businessCode) === 'Placeholder Business Name') return;

            const tierId = biz.tierId || null;
            window.allOpenBusinesses[biz.businessCode] = {
                business_code: biz.businessCode,
                business_name: biz.businessName || biz.businessCode,
                tier_id: tierId,
                tier_number: tierId ? (tierNumberMap[tierId] || tierId) : '',
                tier_name: tierId ? (tierMap[tierId] || `Tier ${tierId}`) : '',
                status: biz.status || 'Open',
                can_collect_items: biz.canCollectItems,
                storage_capacity: biz.maxStock || 0,
                collection_storage: biz.collectionStorage || 0,
                notes: biz.notes || '',
                employees: [] // Employees not in localStorage
            };
        });

        if (window.debug) window.debug.log(`✅ allOpenBusinesses populated with ${Object.keys(window.allOpenBusinesses).length} open businesses`);

        // Build the checklist from the saved run list
        window.buildRemoteChecklist();

    } catch (error) {
        if (window.debug) window.debug.error('❌ Failed to load remote business data:', error);
        if (loadingAlert) {
            loadingAlert.className = 'alert alert-danger';
            loadingAlert.innerHTML = `<strong>Error:</strong> Failed to load businesses. ${error.message}`;
        }
    }
};
