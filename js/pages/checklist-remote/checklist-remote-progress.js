/**
 * checklist-remote-progress.js
 * Save / load / clear progress for ChecklistRemote.
 * localStorage key: 'businessChecklistRemote'
 * Progress keys: businessCode only (no tier prefix — flat list).
 */

const REMOTE_PROGRESS_KEY = 'businessChecklist';

// ─── Check All / Uncheck All ────────────────────────────────────────────
window.checkAllRemote = function () {
    document.querySelectorAll('#checklistRemoteContainer input[type="checkbox"]')
        .forEach(cb => { cb.checked = true; });
    saveRemoteProgress();
};

window.uncheckAllRemote = function () {
    document.querySelectorAll('#checklistRemoteContainer input[type="checkbox"]')
        .forEach(cb => { cb.checked = false; });
    saveRemoteProgress();
};

// ─── Save ────────────────────────────────────────────────────────────────
window.saveRemoteProgress = function () {
    if (window.isInitialLoading) return; // Don't save while loading
    // We load existing progress first so we don't overwrite businesses NOT in the remote run list
    const saved = localStorage.getItem(REMOTE_PROGRESS_KEY);
    const progress = saved ? JSON.parse(saved) : {};

    // Checkboxes
    document.querySelectorAll('#checklistRemoteContainer input[type="checkbox"]').forEach(cb => {
        const code = cb.dataset.businessCode || cb.value;
        const tier = cb.dataset.tier || '';
        const key = `${tier}::${code}`;
        progress[key] = {
            checked: cb.checked,
            notes: '', money: '', stockTarget: '', collection: ''
        };
    });

    // Save notes
    document.querySelectorAll('.notes-input').forEach(i => {
        const code = i.dataset.businessCode;
        const tier = i.dataset.tier || '';
        const key = `${tier}::${code}`;
        if (progress[key]) {
            progress[key].notes = i.value;
        } else {
            progress[key] = { checked: false, notes: i.value, money: '', stockTarget: '', collection: '' };
        }
    });

    // Save money
    document.querySelectorAll('.money-input').forEach(i => {
        const code = i.dataset.businessCode;
        const tier = i.dataset.tier || '';
        const key = `${tier}::${code}`;
        if (progress[key]) {
            progress[key].money = i.value;
        } else {
            progress[key] = { checked: false, notes: '', money: i.value, stockTarget: '', collection: '' };
        }
    });

    // Save stock target (Checklist uses .stockTarget)
    document.querySelectorAll('.stock-target-input').forEach(i => {
        const code = i.dataset.businessCode;
        const tier = i.dataset.tier || '';
        const key = `${tier}::${code}`;
        if (progress[key]) {
            progress[key].stockTarget = i.value;
        } else {
            progress[key] = { checked: false, notes: '', money: '', stockTarget: i.value, collection: '' };
        }
    });

    // Save collection
    document.querySelectorAll('.collection-input').forEach(i => {
        const code = i.dataset.businessCode;
        const tier = i.dataset.tier || '';
        const key = `${tier}::${code}`;
        if (progress[key]) {
            progress[key].collection = i.value;
        } else {
            progress[key] = { checked: false, notes: '', money: '', stockTarget: '', collection: i.value };
        }
    });

    // Hidden businesses (Remote-specific hidden state)
    const hidden = [];
    document.querySelectorAll('#checklistRemoteContainer .business-item[style*="display: none"]')
        .forEach(item => hidden.push(item.dataset.businessCode));
    progress._remoteHidden = hidden; // Use a distinct key for remote-specific hidden state

    localStorage.setItem(REMOTE_PROGRESS_KEY, JSON.stringify(progress));

    // Trigger summary recalculation if it exists
    if (typeof window.calculateAllBusinessSummary === 'function') {
        window.calculateAllBusinessSummary();
    }

    if (window.debug) window.debug.log('💾 Remote progress saved (synced with businessChecklist)');
};

// ─── Load ────────────────────────────────────────────────────────────────
window.loadRemoteProgress = function () {
    const saved = localStorage.getItem(REMOTE_PROGRESS_KEY);

    // If no progress saved, reset UI to empty (handles remote clear)
    if (!saved) {
        document.querySelectorAll('#checklistRemoteContainer input[type="checkbox"]').forEach(cb => { cb.checked = false; });
        document.querySelectorAll('.money-input').forEach(i => { i.value = ''; });
        document.querySelectorAll('.stock-target-input').forEach(i => {
            i.value = '';
            const display = document.getElementById(`stock-needed-${i.dataset.businessCode}`);
            if (display) display.innerHTML = '<small class="text-muted">Enter current stock to calculate</small>';
        });
        document.querySelectorAll('.collection-input').forEach(i => { i.value = ''; });
        document.querySelectorAll('.notes-input').forEach(i => { i.value = ''; });

        // Show all businesses
        document.querySelectorAll('#checklistRemoteContainer .business-item').forEach(item => {
            item.style.display = '';
            const btn = item.querySelector('.hide-business-btn');
            if (btn) { btn.textContent = '👁️'; btn.title = 'Hide business'; }
        });
        return;
    }

    let progress;
    try { progress = JSON.parse(saved); } catch { return; }

    // Load data for each business card in the checklist
    document.querySelectorAll('#checklistRemoteContainer .business-item').forEach(item => {
        const code = item.dataset.businessCode;
        const tier = item.dataset.tier || '';
        const key = `${tier}::${code}`;
        const d = progress[key];

        if (window.debug) window.debug.log(`Loading data for ${key}:`, d);

        // Checkbox
        const cb = item.querySelector('.business-checkbox');
        if (cb && d && d.checked !== undefined) cb.checked = !!d.checked;

        // Money
        const money = item.querySelector('.money-input');
        if (money && d && d.money !== undefined) money.value = d.money;

        // Stock
        const stock = item.querySelector('.stock-target-input');
        if (stock && d && d.stockTarget !== undefined) {
            stock.value = d.stockTarget;
            const maxStock = parseFloat(stock.dataset.maxStock) || 0;
            if (typeof calculateRemoteStockNeeded === 'function') {
                calculateRemoteStockNeeded(code, maxStock);
            }
        }

        // Collection
        const collect = item.querySelector('.collection-input');
        if (collect && d && d.collection !== undefined) collect.value = d.collection;

        // Notes
        const notes = item.querySelector('.notes-input');
        if (notes && d && d.notes !== undefined) notes.value = d.notes;
    });

    // Hidden businesses (Remote-specific)
    if (progress._remoteHidden && Array.isArray(progress._remoteHidden)) {
        progress._remoteHidden.forEach(code => {
            const item = document.querySelector(`.business-item[data-business-code="${code}"]`);
            if (!item) return;
            item.style.display = 'none';
            const btn = item.querySelector('.hide-business-btn');
            if (btn) { btn.textContent = '👁️‍🗨️'; btn.title = 'Show business'; }
        });
    }

    if (window.debug) window.debug.log('📂 Remote progress loaded (synced with businessChecklist)');
};

// ─── Clear ───────────────────────────────────────────────────────────────
window.clearRemoteProgress = function () {
    if (!confirm('Clear all progress? This will reset checkboxes, money, stock, notes, and collection globally (including on the main checklist). Run list order is kept. This cannot be undone.')) return;

    // We don't remove everything from localStorage because other tiers/businesses exist
    // only in checklist.html. We should clear only what's in our current run list.
    const saved = localStorage.getItem(REMOTE_PROGRESS_KEY);
    if (saved) {
        const progress = JSON.parse(saved);
        const runList = window.getRemoteRunList();

        runList.forEach(code => {
            const biz = window.allOpenBusinesses[code];
            const tier = biz ? biz.tier_name : '';
            const key = tier ? `${tier}::${code}` : code;
            if (progress[key]) {
                delete progress[key];
            }
        });

        delete progress._remoteHidden;
        localStorage.setItem(REMOTE_PROGRESS_KEY, JSON.stringify(progress));
    }

    // Reset UI
    document.querySelectorAll('#checklistRemoteContainer input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    document.querySelectorAll('.money-input').forEach(i => { i.value = ''; });
    document.querySelectorAll('.stock-target-input').forEach(i => {
        i.value = '';
        const display = document.getElementById(`stock-needed-${i.dataset.businessCode}`);
        if (display) display.innerHTML = '<small class="text-muted">Enter current stock to calculate</small>';
    });
    document.querySelectorAll('.collection-input').forEach(i => { i.value = ''; });
    document.querySelectorAll('.notes-input').forEach(i => { i.value = ''; });

    // Show all hidden businesses
    document.querySelectorAll('#checklistRemoteContainer .business-item').forEach(item => {
        item.style.display = '';
        const btn = item.querySelector('.hide-business-btn');
        if (btn) { btn.textContent = '👁️'; btn.title = 'Hide business'; }
    });

    // Trigger summary recalculation
    if (typeof window.calculateAllBusinessSummary === 'function') {
        window.calculateAllBusinessSummary();
    }

    if (window.debug) window.debug.log('🗑️ Remote progress cleared (partial clear of shared key)');
};
