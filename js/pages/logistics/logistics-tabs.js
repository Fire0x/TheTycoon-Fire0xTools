// logistics/js/logistics-tabs.js
// Tab management and initialization

// Initialize tabs (Bootstrap handles most of this, but we can add custom logic here)
window.initLogisticsTabs = function() {
    if (window.debug) window.debug.log('[TABS] Initializing logistics tabs...');
    
    // Load active tab from localStorage
    const storedTab = localStorage.getItem('logistics_active_tab');
    if (storedTab) {
        const tabButton = document.querySelector(`button[data-bs-target="${storedTab}"]`);
        if (tabButton && typeof bootstrap !== 'undefined') {
            const tab = new bootstrap.Tab(tabButton);
            tab.show();
            if (window.debug) window.debug.log(`[TABS] Restored active tab: ${storedTab}`);
        }
    }
    
    // Save active tab to localStorage when changed
    const tabButtons = document.querySelectorAll('#logisticsTabs button[data-bs-toggle="tab"]');
    tabButtons.forEach(button => {
        button.addEventListener('shown.bs.tab', function(event) {
            const targetId = event.target.getAttribute('data-bs-target');
            localStorage.setItem('logistics_active_tab', targetId);
            if (window.debug) window.debug.log(`[TABS] Active tab changed to: ${targetId}`);
        });
    });
    
    if (window.debug) window.debug.log('[TABS] Tabs initialized');
};

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initLogisticsTabs);
} else {
    setTimeout(window.initLogisticsTabs, 0);
}
