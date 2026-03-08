/**
 * checklist-remote-main.js
 * Page init, DebugManager, event delegation.
 */

const DEBUG_PREFIX = '[CHECKLISTREMOTE]';

// Loading guard to prevent accidental wipes during init
window.isInitialLoading = true;

// Initialize debug manager (page-specific key: checklistRemoteDebugMode)
const remoteDebug = new DebugManager({
    prefix: DEBUG_PREFIX,
    storageKey: 'checklistRemoteDebugMode',
    buttonId: 'debugToggleBtn'
});
// Skip explicit .init() call as constructor handles it
window.debug = remoteDebug;

// ─── How-to-use collapse ─────────────────────────────────────────────────
const REMOTE_HOW_TO_STORAGE_KEY = 'checklistRemote_how_to_use_expanded';

window.initRemoteHowToUseCollapse = function () {
    const stored = localStorage.getItem(REMOTE_HOW_TO_STORAGE_KEY);
    const expand = stored === null ? true : stored === 'true';
    const el = document.getElementById('howToUseCollapse');
    const icon = document.getElementById('howToUseToggle');
    const btn = document.querySelector('[data-bs-target="#howToUseCollapse"]');
    if (!el) return;

    const bsCollapse = new bootstrap.Collapse(el, { toggle: false });
    expand ? bsCollapse.show() : bsCollapse.hide();
    if (icon) icon.textContent = expand ? '▼' : '▶';
    if (btn) btn.setAttribute('aria-expanded', String(expand));

    el.addEventListener('shown.bs.collapse', () => { localStorage.setItem(REMOTE_HOW_TO_STORAGE_KEY, 'true'); if (icon) icon.textContent = '▼'; });
    el.addEventListener('hidden.bs.collapse', () => { localStorage.setItem(REMOTE_HOW_TO_STORAGE_KEY, 'false'); if (icon) icon.textContent = '▶'; });
};

// ─── Delegated event listeners ───────────────────────────────────────────
// Auto-save on checkbox change
document.addEventListener('change', function (e) {
    if (e.target.type === 'checkbox' && e.target.closest('#checklistRemoteContainer')) {
        saveRemoteProgress();
    }
});

// Auto-save on input (debounced 500ms)
let _inputTimeout;
document.addEventListener('input', function (e) {
    if (e.target.classList.contains('notes-input') ||
        e.target.classList.contains('money-input') ||
        e.target.classList.contains('collection-input') ||
        e.target.classList.contains('stock-target-input')) {
        clearTimeout(_inputTimeout);
        _inputTimeout = setTimeout(() => saveRemoteProgress(), 500);
    }
});

// Hide-eye and Remove buttons (delegated)
document.addEventListener('click', function (e) {
    // 4. Remove business
    if (e.target.classList.contains('remove-biz-remote')) {
        const code = e.target.dataset.businessCode;
        if (code && confirm(`Remove ${code} from your run list?`)) {
            window.removeFromRunList(code);
            window.buildRemoteChecklist();
        }
    }

    // 5. Hide business
    if (e.target.classList.contains('hide-biz-remote')) {
        const item = e.target.closest('.business-item');
        if (item) {
            item.style.display = 'none';
            // Also update summary
            window.calculateAllBusinessSummary();
            saveRemoteProgress();
        }
    }
});

// Update on storage change (sync between tabs)
window.addEventListener('storage', function (e) {
    if (e.key === 'businessChecklist') {
        if (window.debug) window.debug.log('🔄 Storage change detected: Updating run list data');
        loadRemoteProgress();
        if (typeof calculateAllBusinessSummary === 'function') {
            calculateAllBusinessSummary();
        }
    }
});

// ─── Page init ───────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async function () {
    // Initialize shared config and tracking first
    if (typeof window.initializeConfig === 'function') {
        await window.initializeConfig();
    }

    initRemoteHowToUseCollapse();
    window.initBusinessPicker();
    updateTimes();
    setInterval(updateTimes, 1000);
    await loadRemoteBusinessData();
    window.isInitialLoading = false;
    if (window.debug) window.debug.log('🚀 Remote Checklist initialization complete. Saving enabled.');
});
