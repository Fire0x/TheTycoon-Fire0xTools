/**
 * checklist-remote-config.js
 * General constants and runtime business data cache.
 * allOpenBusinesses is populated by checklist-remote-core.js after API load.
 */

// Map of businessCode -> enriched business object (populated by core.js)
window.allOpenBusinesses = {};

// Tier color mapping (shared with checklist)
const REMOTE_TIER_COLOR_MAP = [
    { tier: 1, colorClass: 'tier-header-1' },
    { tier: 2, colorClass: 'tier-header-2' },
    { tier: 3, colorClass: 'tier-header-3' },
    { tier: 4, colorClass: 'tier-header-4' },
    { tier: 5, colorClass: 'tier-header-5' },
    { tier: 6, colorClass: 'tier-header-6' },
    { tier: 7, colorClass: 'tier-header-7' },
    { tier: 8, colorClass: 'tier-header-8' },
    { tier: 9, colorClass: 'tier-header-9' },
    { tier: 10, colorClass: 'tier-header-10' },
    { tier: 11, colorClass: 'tier-header-11' },
    { tier: 12, colorClass: 'tier-header-12' },
];

window.getRemoteTierColorClass = function (tierNumber) {
    const found = REMOTE_TIER_COLOR_MAP.find(t => t.tier === tierNumber);
    return found ? found.colorClass : 'tier-header-default';
};
