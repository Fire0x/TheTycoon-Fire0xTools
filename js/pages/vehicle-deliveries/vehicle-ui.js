/**
 * Vehicle Deliveries UI Module
 * Contains rendering functions and UI state management
 */
(function () {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.vehicleDebugManager === 'undefined') {
        console.error('vehicle-core.js must be loaded before vehicle-ui.js');
        return;
    }

    const debugManager = window.vehicleDebugManager;
    const escapeHtml = window.escapeHtml;

    // Render vehicle progress cards
    function renderVehicleProgress() {
        debugManager.log('=== renderVehicleProgress START ===');
        const container = document.getElementById('vehicleProgressContainer');
        const emptyState = document.getElementById('vehicleProgressEmptyState');
        const summary = document.getElementById('progressSummary');

        if (!container) {
            debugManager.error('vehicleProgressContainer element not found!');
            return;
        }

        const vehicleProgress = window.vehicleProgress || {};
        const keys = Object.keys(vehicleProgress);
        const summaryHeader = document.getElementById('summaryHeader');

        if (keys.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            if (summary) summary.style.display = 'none';
            if (summaryHeader) summaryHeader.style.display = 'none';

            const fields = ['highestRep', 'totalVehiclesNeeded', 'deliveriesLeft', 'unlockedCount'];
            fields.forEach(f => {
                const el = document.getElementById(f);
                if (el) el.textContent = '0';
            });
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        if (summaryHeader) summaryHeader.style.display = 'flex';
        if (typeof window.updateSummaryVisibility === 'function') window.updateSummaryVisibility();

        let highestRep = 0;
        let totalVehiclesNeeded = 0;
        let unlockedCount = 0;
        let totalDeliveriesLeft = 0;

        keys.forEach(key => {
            const vehicle = vehicleProgress[key];
            if (!vehicle) return;

            const current = vehicle.current || 0;
            const total = vehicle.total || 0;
            const remaining = total - current;
            const unlocked = current >= total;

            if (!unlocked) {
                totalVehiclesNeeded++;
                totalDeliveriesLeft += remaining;
                if (vehicle.reputation && vehicle.reputation > highestRep) {
                    highestRep = vehicle.reputation;
                }
            } else {
                unlockedCount++;
            }
        });

        const highestRepEl = document.getElementById('highestRep');
        const totalVehiclesNeededEl = document.getElementById('totalVehiclesNeeded');
        const deliveriesLeftEl = document.getElementById('deliveriesLeft');
        const unlockedCountEl = document.getElementById('unlockedCount');

        if (highestRepEl) highestRepEl.textContent = highestRep.toLocaleString('en-US');
        if (totalVehiclesNeededEl) totalVehiclesNeededEl.textContent = totalVehiclesNeeded;
        if (deliveriesLeftEl) deliveriesLeftEl.textContent = totalDeliveriesLeft.toLocaleString('en-US');
        if (unlockedCountEl) unlockedCountEl.textContent = unlockedCount;

        const hideUnlockedToggle = document.getElementById('hideUnlockedToggle');
        const hideUnlocked = hideUnlockedToggle ? hideUnlockedToggle.checked : true;

        const cardsHtml = keys
            .filter(key => {
                const vehicle = vehicleProgress[key];
                const current = vehicle.current || 0;
                const total = vehicle.total || 0;
                const unlocked = vehicle.unlocked || (current >= total);
                return !(hideUnlocked && unlocked);
            })
            .map(key => {
                const vehicle = vehicleProgress[key];
                const name = vehicle.name;
                const current = vehicle.current || 0;
                const total = vehicle.total || 0;
                const reputation = vehicle.reputation || null;
                const unlocked = vehicle.unlocked || (current >= total);
                const remaining = total - current;

                let statusText = '';
                if (unlocked) {
                    statusText = '✨ Unlocked for purchase!';
                } else {
                    statusText = `Need <strong>${remaining}</strong> more deliveries`;
                    if (reputation) {
                        statusText += ` & <strong>${reputation.toLocaleString('en-US')}</strong> more reputation`;
                    }
                }

                const progressPercent = total > 0 ? Math.round((current / total) * 100) : 0;
                const cardClass = unlocked ? 'bg-success' : '';

                return `
                <div class="col-md-6 col-lg-4">
                    <div class="card shadow-sm h-100 progress-card ${cardClass}">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title mb-0" style="font-weight: 800; letter-spacing: -0.5px;">${escapeHtml(name)}</h5>
                                ${unlocked ? '<span style="font-size: 1.5rem;">🏆</span>' : ''}
                            </div>
                            
                            <div class="mb-3">
                                <div class="d-flex justify-content-between align-items-end mb-2">
                                    <span class="text-muted small text-uppercase fw-bold" style="letter-spacing: 1px; font-size: 0.7rem;">Mission Completion</span>
                                    <span class="fw-bold" style="font-size: 1.25rem;">${current}<span class="text-muted" style="font-size: 0.9rem; font-weight: 400;"> / ${total}</span></span>
                                </div>
                                <div class="progress-bar-custom">
                                    <div class="progress-fill" style="width: ${progressPercent}%; background: ${unlocked ? '#fff' : 'var(--premium-gradient)'};"></div>
                                </div>
                                <div class="text-end">
                                    <small class="text-muted fw-bold" style="font-size: 0.75rem;">${progressPercent}%</small>
                                </div>
                            </div>
                            
                            <div class="mt-4 pt-3 border-top border-secondary border-opacity-10">
                                <p class="mb-0 small text-muted" style="line-height: 1.6;">
                                    ${statusText}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            });

        container.innerHTML = cardsHtml.join('');
        debugManager.log('=== renderVehicleProgress END ===');
    }

    // Summary Statistics Toggle State
    const SUMMARY_STORAGE_KEY = 'vehicle_deliveries_summary_expanded';
    let summaryExpanded = true;

    function toggleSummary() {
        summaryExpanded = !summaryExpanded;
        localStorage.setItem(SUMMARY_STORAGE_KEY, summaryExpanded.toString());
        updateSummaryVisibility();
    }

    function updateSummaryVisibility() {
        const summaryEl = document.getElementById('progressSummary');
        const toggleIcon = document.getElementById('summaryToggleIcon');
        const toggleText = document.getElementById('summaryToggleText');

        if (summaryEl) {
            if (summaryExpanded) {
                summaryEl.style.display = 'flex';
                if (toggleIcon) toggleIcon.textContent = '▼';
                if (toggleText) toggleText.textContent = 'Hide Summary';
            } else {
                summaryEl.style.display = 'none';
                if (toggleIcon) toggleIcon.textContent = '▶';
                if (toggleText) toggleText.textContent = 'Show Summary';
            }
        }
    }

    function initSummaryToggle() {
        const stored = localStorage.getItem(SUMMARY_STORAGE_KEY);
        summaryExpanded = stored === null ? true : stored === 'true';
        updateSummaryVisibility();
    }

    // Individual Summary Card Visibility State
    const SUMMARY_CARDS_STORAGE_KEY = 'vehicle_deliveries_summary_cards_visibility';

    function toggleSummaryCard(cardId) {
        const cardElement = document.getElementById(`summaryCard-${cardId}`);
        const toggleIcon = document.getElementById(`toggleIcon-${cardId}`);

        if (!cardElement) return;

        const stored = localStorage.getItem(SUMMARY_CARDS_STORAGE_KEY);
        const visibility = stored ? JSON.parse(stored) : {};
        const isVisible = visibility[cardId] !== false;

        if (isVisible) {
            cardElement.style.display = 'none';
            if (toggleIcon) toggleIcon.textContent = '👁️‍🗨️';
            visibility[cardId] = false;
        } else {
            cardElement.style.display = 'block';
            if (toggleIcon) toggleIcon.textContent = '👁️';
            visibility[cardId] = true;
        }

        localStorage.setItem(SUMMARY_CARDS_STORAGE_KEY, JSON.stringify(visibility));
    }

    function initSummaryCardsVisibility() {
        const stored = localStorage.getItem(SUMMARY_CARDS_STORAGE_KEY);
        const visibility = stored ? JSON.parse(stored) : {};
        const cardIds = ['highestRep', 'totalVehiclesNeeded', 'deliveriesLeft', 'unlockedCount'];

        cardIds.forEach(cardId => {
            const cardElement = document.getElementById(`summaryCard-${cardId}`);
            const toggleIcon = document.getElementById(`toggleIcon-${cardId}`);
            if (cardElement) {
                const isVisible = visibility[cardId] !== false;
                if (!isVisible) {
                    cardElement.style.display = 'none';
                    if (toggleIcon) toggleIcon.textContent = '👁️‍🗨️';
                } else {
                    cardElement.style.display = 'block';
                    if (toggleIcon) toggleIcon.textContent = '👁️';
                }
            }
        });
    }

    function showAllSummaryCards() {
        const cardIds = ['highestRep', 'totalVehiclesNeeded', 'deliveriesLeft', 'unlockedCount'];
        const visibility = {};
        cardIds.forEach(cardId => {
            const cardElement = document.getElementById(`summaryCard-${cardId}`);
            const toggleIcon = document.getElementById(`toggleIcon-${cardId}`);
            if (cardElement) {
                cardElement.style.display = 'block';
                if (toggleIcon) toggleIcon.textContent = '👁️';
                visibility[cardId] = true;
            }
        });
        localStorage.setItem(SUMMARY_CARDS_STORAGE_KEY, JSON.stringify(visibility));
    }

    // === Vehicle List UI ===

    let eventViewMode = 'view';
    let normalViewMode = 'view';

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'Completed': return 'bg-success';
            case 'In Progress': return 'bg-primary';
            default: return 'bg-secondary';
        }
    }

    function renderEventVehicles() {
        debugManager.log('Rendering event vehicles...');
        const container = document.getElementById('eventVehiclesBody');
        const viewIcon = document.getElementById('eventVehiclesViewIcon');
        const viewBadge = document.getElementById('eventVehiclesViewMode');

        if (!container) return;

        if (viewIcon) viewIcon.textContent = eventViewMode === 'view' ? '👁️' : '✏️';
        if (viewBadge) {
            viewBadge.textContent = eventViewMode === 'view' ? 'View Only' : 'Edit Mode';
            viewBadge.style.display = 'inline-block';
            viewBadge.className = eventViewMode === 'view' ? 'badge bg-light text-dark ms-2' : 'badge bg-warning text-dark ms-2';
        }

        const vehicles = window.eventVehicles || [];
        if (vehicles.length === 0) {
            container.innerHTML = '<div class="text-center py-4 opacity-75">No event vehicles found. Add one to get started!</div>';
            return;
        }

        container.innerHTML = vehicles.map(v => `
            <div class="vehicle-list-item">
                <div class="vehicle-info">
                    <div class="vehicle-name">
                        ${eventViewMode === 'edit'
                ? `<input type="text" class="form-control form-control-sm bg-dark text-white border-secondary" value="${escapeHtml(v.name)}" onchange="updateEventVehicleUI('${v.id}', 'name', this.value)">`
                : escapeHtml(v.name)}
                    </div>
                    <div class="vehicle-meta">
                        Last Updated: ${escapeHtml(v.lastUpdated || '-')}
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <div class="vehicle-completed-date text-muted small">
                        ${eventViewMode === 'edit'
                ? `<input type="date" class="form-control form-control-sm bg-dark text-white border-secondary" value="${v.completedDate || ''}" onchange="updateEventVehicleUI('${v.id}', 'completedDate', this.value)">`
                : (v.completedDate ? `Done: ${escapeHtml(v.completedDate)}` : '')}
                    </div>
                    <div class="vehicle-status">
                        ${eventViewMode === 'edit'
                ? `<select class="form-select form-select-sm bg-dark text-white border-secondary" onchange="updateEventVehicleUI('${v.id}', 'status', this.value)">
                                <option value="Not Started" ${v.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                                <option value="In Progress" ${v.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                <option value="Completed" ${v.status === 'Completed' ? 'selected' : ''}>Completed</option>
                           </select>`
                : `<span class="vehicle-status-badge ${getStatusBadgeClass(v.status)}">${escapeHtml(v.status || 'Not Started')}</span>`}
                    </div>
                    ${eventViewMode === 'edit'
                ? `<button class="btn btn-outline-danger btn-sm" onclick="deleteEventVehicle('${v.id}')" title="Delete">🗑️</button>`
                : ''}
                </div>
            </div>
        `).join('');
    }

    function renderNormalVehicles() {
        debugManager.log('Rendering normal vehicles...');
        const container = document.getElementById('normalVehiclesBody');
        const viewIcon = document.getElementById('normalVehiclesViewIcon');
        const viewBadge = document.getElementById('normalVehiclesViewMode');

        if (!container) return;

        if (viewIcon) viewIcon.textContent = normalViewMode === 'view' ? '👁️' : '✏️';
        if (viewBadge) {
            viewBadge.textContent = normalViewMode === 'view' ? 'View Only' : 'Edit Mode';
            viewBadge.style.display = 'inline-block';
            viewBadge.className = normalViewMode === 'view' ? 'badge bg-light text-dark ms-2' : 'badge bg-warning text-dark ms-2';
        }

        const vehicles = window.normalVehicles || [];
        if (vehicles.length === 0) {
            container.innerHTML = '<div class="text-center py-4 opacity-75">No regular vehicles found. Add one to get started!</div>';
            return;
        }

        container.innerHTML = vehicles.map(v => `
            <div class="vehicle-list-item">
                <div class="vehicle-info">
                    <div class="vehicle-name">
                        <span class="badge bg-secondary me-2" style="font-size: 0.7rem;">${escapeHtml(v.dealer)}</span>
                        ${normalViewMode === 'edit'
                ? `<input type="text" class="form-control form-control-sm d-inline-block w-auto bg-dark text-white border-secondary" value="${escapeHtml(v.type)}" onchange="updateNormalVehicleUI('${v.id}', 'type', this.value)">`
                : escapeHtml(v.type)}
                    </div>
                    <div class="vehicle-meta">
                        ${normalViewMode === 'edit'
                ? `Dealer: <input type="text" class="form-control form-control-sm d-inline-block w-auto py-0 px-1 bg-dark text-white border-secondary" value="${escapeHtml(v.dealer)}" onchange="updateNormalVehicleUI('${v.id}', 'dealer', this.value)">`
                : ''}
                        Last Updated: ${escapeHtml(v.lastUpdated || '-')}
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <div class="vehicle-completed-date text-muted small">
                        ${normalViewMode === 'edit'
                ? `<input type="date" class="form-control form-control-sm bg-dark text-white border-secondary" value="${v.completedDate || ''}" onchange="updateNormalVehicleUI('${v.id}', 'completedDate', this.value)">`
                : (v.completedDate ? `Done: ${escapeHtml(v.completedDate)}` : '')}
                    </div>
                    <div class="vehicle-status">
                        ${normalViewMode === 'edit'
                ? `<select class="form-select form-select-sm bg-dark text-white border-secondary" onchange="updateNormalVehicleUI('${v.id}', 'status', this.value)">
                                <option value="Not Started" ${v.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                                <option value="In Progress" ${v.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                <option value="Completed" ${v.status === 'Completed' ? 'selected' : ''}>Completed</option>
                           </select>`
                : `<span class="vehicle-status-badge ${getStatusBadgeClass(v.status)}">${escapeHtml(v.status || 'Not Started')}</span>`}
                    </div>
                    ${normalViewMode === 'edit'
                ? `<button class="btn btn-outline-danger btn-sm" onclick="deleteNormalVehicle('${v.id}')" title="Delete">🗑️</button>`
                : ''}
                </div>
            </div>
        `).join('');
    }

    function addEventVehicle() {
        const name = prompt("Enter Event Vehicle Name:");
        if (name) {
            window.addEventVehicleCore({ name: name, status: 'Not Started' });
            renderEventVehicles();
        }
    }

    function deleteEventVehicle(id) {
        if (confirm('Delete this event vehicle?')) {
            window.deleteEventVehicleCore(id);
            renderEventVehicles();
        }
    }

    function updateEventVehicleUI(id, field, value) {
        window.updateEventVehicleCore(id, { [field]: value });
    }

    function saveEventVehicles() {
        const statusEl = document.getElementById('eventVehiclesStatus');
        if (statusEl) {
            statusEl.textContent = 'Saved!';
            statusEl.className = 'ms-3 text-success fade-in';
            setTimeout(() => { statusEl.textContent = ''; }, 2000);
        }
    }

    function updateNormalVehicleUI(id, field, value) {
        window.updateNormalVehicleCore(id, { [field]: value });
    }

    function showAddNormalVehicleModal() {
        const modal = new bootstrap.Modal(document.getElementById('addNormalVehicleModal'));
        modal.show();
    }

    function addNormalVehicleFromModal() {
        const dealer = document.getElementById('newVehicleDealer').value;
        const type = document.getElementById('newVehicleType').value;
        const completedDate = document.getElementById('newVehicleCompletedDate').value;
        if (dealer && type) {
            window.addNormalVehicleCore({
                dealer: dealer,
                type: type,
                status: 'Not Started',
                completedDate: completedDate
            });
            const modalEl = document.getElementById('addNormalVehicleModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            document.getElementById('newVehicleDealer').value = '';
            document.getElementById('newVehicleType').value = '';
            document.getElementById('newVehicleCompletedDate').value = '';
            renderNormalVehicles();
        } else {
            alert('Please fill in all fields.');
        }
    }

    function deleteNormalVehicle(id) {
        if (confirm('Delete this vehicle?')) {
            window.deleteNormalVehicleCore(id);
            renderNormalVehicles();
        }
    }

    function saveNormalVehicles() {
        const statusEl = document.getElementById('normalVehiclesStatus');
        if (statusEl) {
            statusEl.textContent = 'Saved!';
            statusEl.className = 'ms-3 text-success fade-in';
            setTimeout(() => { statusEl.textContent = ''; }, 2000);
        }
    }

    function toggleViewMode(section) {
        if (section === 'eventVehicles') {
            eventViewMode = eventViewMode === 'view' ? 'edit' : 'view';
            renderEventVehicles();
        } else if (section === 'normalVehicles') {
            normalViewMode = normalViewMode === 'view' ? 'edit' : 'view';
            renderNormalVehicles();
        }
    }

    function saveVehicleFilter() {
        // Logic to save filter preference if needed
    }

    // Export functions to global scope
    window.renderVehicleProgress = renderVehicleProgress;
    window.toggleSummary = toggleSummary;
    window.updateSummaryVisibility = updateSummaryVisibility;
    window.initSummaryToggle = initSummaryToggle;
    window.toggleSummaryCard = toggleSummaryCard;
    window.initSummaryCardsVisibility = initSummaryCardsVisibility;
    window.showAllSummaryCards = showAllSummaryCards;

    window.renderEventVehicles = renderEventVehicles;
    window.renderNormalVehicles = renderNormalVehicles;
    window.addEventVehicle = addEventVehicle;
    window.deleteEventVehicle = deleteEventVehicle;
    window.updateEventVehicleUI = updateEventVehicleUI;
    window.saveEventVehicles = saveEventVehicles;

    window.showAddNormalVehicleModal = showAddNormalVehicleModal;
    window.addNormalVehicleFromModal = addNormalVehicleFromModal;
    window.deleteNormalVehicle = deleteNormalVehicle;
    window.updateNormalVehicleUI = updateNormalVehicleUI;
    window.saveNormalVehicles = saveNormalVehicles;

    window.toggleViewMode = toggleViewMode;
    window.saveVehicleFilter = saveVehicleFilter;

})();
