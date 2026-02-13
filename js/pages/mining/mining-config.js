/**
 * Mining page configuration (localStorage)
 * materialsSortBy: 'tierName' (Tier then Name) | 'nameTier' | 'nameOnly' | 'tierOnly'
 * materialsTypeOrder: order of sections, e.g. ['ore','ingot','sheet']
 */
const MiningConfig = {
    enabledCalculations: {
        profit: true,
        margin: true,
        priceDiff: true
    },
    materialsSortBy: 'tierName',
    materialsTypeOrder: ['ore', 'ingot', 'sheet'],
    save() {
        try {
            localStorage.setItem('mining_config', JSON.stringify({
                enabledCalculations: this.enabledCalculations,
                materialsSortBy: this.materialsSortBy,
                materialsTypeOrder: this.materialsTypeOrder
            }));
            if (window.debug) window.debug.log('Mining config saved');
        } catch (e) {
            if (window.debug) window.debug.error('Error saving mining config:', e);
        }
    },
    load() {
        try {
            const stored = localStorage.getItem('mining_config');
            if (stored) {
                const c = JSON.parse(stored);
                this.enabledCalculations = { ...this.enabledCalculations, ...(c.enabledCalculations || {}) };
                if (c.materialsSortBy) this.materialsSortBy = c.materialsSortBy;
                if (Array.isArray(c.materialsTypeOrder) && c.materialsTypeOrder.length) this.materialsTypeOrder = c.materialsTypeOrder;
            }
        } catch (e) {
            if (window.debug) window.debug.error('Error loading mining config:', e);
        }
    }
};
MiningConfig.load();
if (typeof window !== 'undefined') window.MiningConfig = MiningConfig;
