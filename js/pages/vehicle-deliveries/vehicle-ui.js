/**
 * Vehicle Deliveries UI Module
 * Contains rendering functions and UI state management
 */
(function() {
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
        debugManager.log('Rendering vehicle progress');
        const container = document.getElementById('vehicleProgressContainer');
        const emptyState = document.getElementById('vehicleProgressEmptyState');
        const summary = document.getElementById('progressSummary');
        
        if (!container) return;
        
        const vehicleProgress = window.vehicleProgress || {};
        const keys = Object.keys(vehicleProgress);
        debugManager.log('Total vehicles to render:', keys.length);
        
        const summaryHeader = document.getElementById('summaryHeader');
        
        if (keys.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            if (summary) summary.style.display = 'none';
            if (summaryHeader) summaryHeader.style.display = 'none';
            const highestRepEl = document.getElementById('highestRep');
            const totalVehiclesNeededEl = document.getElementById('totalVehiclesNeeded');
            const deliveriesLeftEl = document.getElementById('deliveriesLeft');
            const unlockedCountEl = document.getElementById('unlockedCount');
            if (highestRepEl) highestRepEl.textContent = '0';
            if (totalVehiclesNeededEl) totalVehiclesNeededEl.textContent = '0';
            if (deliveriesLeftEl) deliveriesLeftEl.textContent = '0';
            if (unlockedCountEl) unlockedCountEl.textContent = '0';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        if (summaryHeader) summaryHeader.style.display = 'flex';
        if (typeof window.updateSummaryVisibility === 'function') {
            window.updateSummaryVisibility();
        }
        
        let highestRep = 0;
        let totalVehiclesNeeded = 0;
        let unlockedCount = 0;
        let totalDeliveriesLeft = 0;
        
        keys.forEach(key => {
            const vehicle = vehicleProgress[key];
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
        
        debugManager.log('Summary - Highest Rep:', highestRep, 'Total Needed:', totalVehiclesNeeded, 'Deliveries Left:', totalDeliveriesLeft, 'Unlocked:', unlockedCount);
        
        container.innerHTML = keys.map(key => {
            const vehicle = vehicleProgress[key];
            const name = vehicle.name;
            const current = vehicle.current || 0;
            const total = vehicle.total || 0;
            const reputation = vehicle.reputation || null;
            const unlocked = vehicle.unlocked || (current >= total);
            const remaining = total - current;
            
            let statusText = '';
            if (unlocked) {
                statusText = '✅ Unlocked for purchase!';
            } else {
                statusText = `Need ${remaining} more deliveries`;
                if (reputation) {
                    statusText += ` & ${reputation.toLocaleString('en-US')} more reputation`;
                }
            }
            
            const statusClass = unlocked ? 'text-success' : 'text-info';
            const progressPercent = total > 0 ? Math.round((current / total) * 100) : 0;
            const cardBg = unlocked ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
            const textColor = unlocked ? '#fff' : '#fff';
            
            return `
                <div class="col-md-6 col-lg-4">
                    <div class="card shadow-sm h-100" style="background: ${cardBg}; border: none; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title mb-0" style="color: ${textColor}; font-weight: bold; font-size: 1.25rem;">${escapeHtml(name)}</h5>
                                ${unlocked ? '<span style="font-size: 1.5rem;">✅</span>' : ''}
                            </div>
                            
                            <div class="mb-3">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span style="color: ${textColor}; opacity: 0.9;">Progress</span>
                                    <span style="color: ${textColor}; font-weight: bold; font-size: 1.1rem;">${current}/${total}</span>
                                </div>
                                <div class="progress" style="height: 8px; background-color: rgba(255,255,255,0.2);">
                                    <div class="progress-bar" role="progressbar" style="width: ${progressPercent}%; background-color: ${unlocked ? '#fff' : '#3498db'};" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <small style="color: ${textColor}; opacity: 0.8;">${progressPercent}% Complete</small>
                            </div>
                            
                            <div class="mt-3 pt-3" style="border-top: 1px solid rgba(255,255,255,0.2);">
                                <p class="mb-0" style="color: ${textColor}; font-weight: 500; font-size: 0.95rem;">
                                    ${statusText}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Summary Statistics Toggle State
    const SUMMARY_STORAGE_KEY = 'vehicle_deliveries_summary_expanded';
    let summaryExpanded = true;
    
    function toggleSummary() {
        summaryExpanded = !summaryExpanded;
        localStorage.setItem(SUMMARY_STORAGE_KEY, summaryExpanded.toString());
        updateSummaryVisibility();
        debugManager.log('Summary toggled:', summaryExpanded ? 'shown' : 'hidden');
    }
    
    function updateSummaryVisibility() {
        const summaryEl = document.getElementById('progressSummary');
        const header = document.getElementById('summaryHeader');
        const toggleIcon = document.getElementById('summaryToggleIcon');
        const toggleText = document.getElementById('summaryToggleText');
        
        if (summaryEl && header) {
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
        debugManager.log('Toggled card:', cardId, 'Visible:', !isVisible);
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
        debugManager.log('Show all summary cards called');
    }

    // Export functions to global scope
    window.renderVehicleProgress = renderVehicleProgress;
    window.toggleSummary = toggleSummary;
    window.updateSummaryVisibility = updateSummaryVisibility;
    window.initSummaryToggle = initSummaryToggle;
    window.toggleSummaryCard = toggleSummaryCard;
    window.initSummaryCardsVisibility = initSummaryCardsVisibility;
    window.showAllSummaryCards = showAllSummaryCards;

})();
