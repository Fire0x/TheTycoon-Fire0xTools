/**
 * checklist-remote-order-config.js
 * Owns the remote run list and its order.
 * All reads/writes of the saved business run list go through this module.
 * Storage key: 'checklistRemoteRunList'
 */

const REMOTE_RUN_LIST_KEY = 'checklistRemoteRunList';

/**
 * Get the current ordered run list from localStorage.
 * @returns {string[]} Array of business codes in saved order.
 */
window.getRemoteRunList = function () {
    try {
        const saved = localStorage.getItem(REMOTE_RUN_LIST_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        if (window.debug) window.debug.warn('⚠️ Failed to parse run list from localStorage:', e);
        return [];
    }
};

/**
 * Overwrite the full run list (and order) in localStorage.
 * @param {string[]} codesArray - Ordered array of business codes.
 */
window.saveRemoteRunList = function (codesArray) {
    localStorage.setItem(REMOTE_RUN_LIST_KEY, JSON.stringify(codesArray));
    if (window.debug) window.debug.log(`💾 Run list saved (${codesArray.length} businesses):`, codesArray);
};

/**
 * Append a business code to the end of the run list (no duplicates).
 * @param {string} code - Business code to add.
 * @returns {boolean} true if added, false if already in list.
 */
window.addToRunList = function (code) {
    const list = window.getRemoteRunList();
    if (list.includes(code)) {
        if (window.debug) window.debug.warn(`⚠️ Business ${code} is already in the run list`);
        return false;
    }
    list.push(code);
    window.saveRemoteRunList(list);
    if (window.debug) window.debug.log(`✅ Added ${code} to run list`);
    return true;
};

/**
 * Remove a business code from the run list.
 * @param {string} code - Business code to remove.
 */
window.removeFromRunList = function (code) {
    const list = window.getRemoteRunList().filter(c => c !== code);
    window.saveRemoteRunList(list);
    if (window.debug) window.debug.log(`🗑️ Removed ${code} from run list`);
};

/**
 * Replace the entire order. Use after drag-to-reorder.
 * @param {string[]} codesArray - New ordered array of business codes.
 */
window.reorderRunList = function (codesArray) {
    window.saveRemoteRunList(codesArray);
    if (window.debug) window.debug.log(`🔀 Run list reordered:`, codesArray);
};
