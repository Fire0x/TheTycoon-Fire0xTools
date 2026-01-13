/**
 * Merchants UI Module
 * Contains rendering functions and timer updates
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.merchantsDebugManager === 'undefined') {
        console.error('merchants-core.js must be loaded before merchants-ui.js');
        return;
    }

    const debugManager = window.merchantsDebugManager;

    // Format local date/time
    function formatAESTDateTime(date) {
        const dateOptions = {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        };
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        const dateStr = date.toLocaleDateString('en-US', dateOptions);
        const timeStr = date.toLocaleTimeString('en-US', timeOptions);
        return `${dateStr} ${timeStr}`;
    }

    // Update local time
    function updateAESTTime() {
        const now = new Date();
        const aestTime = formatAESTDateTime(now);
        const aestTimeElement = document.getElementById('aestTime');
        if (aestTimeElement) {
            aestTimeElement.textContent = aestTime;
        }
    }

    // Format time remaining
    function formatTime(seconds) {
        if (seconds <= 0) {
            return 'Rotated';
        }
        
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        let result = '';
        if (days > 0) {
            result += days + 'd ';
        }
        if (hours > 0 || days > 0) {
            result += hours + 'h ';
        }
        if (minutes > 0 || hours > 0 || days > 0) {
            result += minutes + 'm';
        }
        if (days === 0 && hours === 0 && minutes === 0) {
            result = secs + 's';
        }

        return result.trim();
    }

    // Get expiration time
    function getExpirationTime(secondsRemaining) {
        const now = new Date();
        const expiration = new Date(now.getTime() + secondsRemaining * 1000);
        return formatAESTDateTime(expiration);
    }

    // Escape HTML
    function escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Extract numeric price from price string
    function extractPrice(priceStr) {
        if (!priceStr) return 0;
        const match = priceStr.match(/(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : 0;
    }

    // Calculate best prices grouped by item
    function calculateBestPrices() {
        const bestPrices = {};
        const merchants = window.merchants || {};
        
        Object.keys(merchants).forEach(key => {
            const merchant = merchants[key];
            if (merchant.secondsRemaining <= 0) return;
            
            const buyingItem = merchant.buying || merchant.itemName;
            const price = extractPrice(merchant.price);
            
            if (!bestPrices[buyingItem]) {
                bestPrices[buyingItem] = {
                    item: buyingItem,
                    emoji: merchant.emoji,
                    price: price,
                    priceStr: merchant.price,
                    merchantNumber: merchant.merchantNumber,
                    location: merchant.location,
                    distance: merchant.distance
                };
            } else {
                if (price > bestPrices[buyingItem].price) {
                    bestPrices[buyingItem] = {
                        item: buyingItem,
                        emoji: merchant.emoji,
                        price: price,
                        priceStr: merchant.price,
                        merchantNumber: merchant.merchantNumber,
                        location: merchant.location,
                        distance: merchant.distance
                    };
                }
            }
        });
        
        return bestPrices;
    }

    // Render merchants rotation section
    function renderMerchantsRotation() {
        const section = document.getElementById('merchantsRotationSection');
        const container = document.getElementById('merchantsRotationContainer');
        
        if (!section || !container) return;
        
        const merchants = window.merchants || {};
        const activeKeys = Object.keys(merchants).filter(key => {
            return merchants[key].secondsRemaining > 0;
        });
        
        if (activeKeys.length === 0) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        
        const groupedByRotation = {};
        
        activeKeys.forEach(key => {
            const merchant = merchants[key];
            const roundedTime = Math.round(merchant.secondsRemaining / 10) * 10;
            if (!groupedByRotation[roundedTime]) {
                groupedByRotation[roundedTime] = [];
            }
            groupedByRotation[roundedTime].push(merchant);
        });
        
        const sortedGroups = Object.keys(groupedByRotation)
            .map(time => parseInt(time))
            .sort((a, b) => a - b);
        
        container.innerHTML = sortedGroups.map(roundedTime => {
            const merchantsInGroup = groupedByRotation[roundedTime];
            const merchantNumbers = merchantsInGroup
                .map(m => m.merchantNumber)
                .sort((a, b) => a - b);
            
            const actualTime = merchantsInGroup[0].secondsRemaining;
            const timeDisplay = formatTime(actualTime);
            const statusClass = actualTime <= 0 ? 'timer-complete' : '';
            const groupKey = `rotation-${roundedTime}`;
            
            return `
                <div class="d-flex justify-content-between align-items-center mb-2 p-2" style="background-color: var(--card-bg); border-radius: 0.25rem; border: 1px solid var(--card-border);">
                    <div class="d-flex align-items-center">
                        <div>
                            <strong>Merchant Rotation:</strong> ${merchantNumbers.map(n => `<span style="color: var(--link-color); font-weight: bold;">#${n}</span>`).join(' ')}
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="timer-display ${statusClass}" id="rotation-timer-${groupKey}" style="font-size: 1.2rem;">
                            ${timeDisplay}
                        </div>
                        <div class="small text-muted">Next Rotation</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render best prices section
    function renderBestPrices() {
        const section = document.getElementById('bestPricesSection');
        const container = document.getElementById('bestPricesContainer');
        
        if (!section || !container) return;
        
        const bestPrices = calculateBestPrices();
        const items = Object.keys(bestPrices);
        
        if (items.length === 0) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        
        items.sort((a, b) => bestPrices[b].price - bestPrices[a].price);
        
        container.innerHTML = items.map(item => {
            const best = bestPrices[item];
            return `
                <div class="d-flex justify-content-between align-items-center mb-2 p-2" style="background-color: var(--card-bg); border-radius: 0.25rem; border: 1px solid var(--card-border);">
                    <div class="d-flex align-items-center">
                        <span class="merchant-icon">${best.emoji}</span>
                        <div>
                            <strong>${escapeHtml(best.item)}</strong>
                            <div class="small text-muted">
                                Merchant #${best.merchantNumber} • ${escapeHtml(best.location || 'N/A')}
                                ${best.distance ? ` • ${escapeHtml(best.distance)}` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="text-success" style="font-size: 1.2rem; font-weight: bold;">
                            ${escapeHtml(best.priceStr || `$${best.price.toFixed(2)}`)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render merchant cards
    function renderMerchants() {
        const container = document.getElementById('merchantsContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;
        
        const merchants = window.merchants || {};
        const keys = Object.keys(merchants).sort((a, b) => {
            return merchants[a].merchantNumber - merchants[b].merchantNumber;
        });
        
        if (keys.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        container.innerHTML = keys.map(key => {
            const merchant = merchants[key];
            const timeDisplay = formatTime(merchant.secondsRemaining);
            const expiration = merchant.secondsRemaining > 0 ? getExpirationTime(merchant.secondsRemaining) : 'Rotated';
            const statusClass = merchant.secondsRemaining <= 0 ? 'timer-complete' : '';
            
            return `
                <div class="card merchant-card" id="merchant-${key}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="d-flex align-items-center">
                                <span class="merchant-icon">${merchant.emoji}</span>
                                <div>
                                    <h4 class="card-title mb-1">${escapeHtml(merchant.itemName)}</h4>
                                    <p class="text-muted mb-0">Merchant #${merchant.merchantNumber}</p>
                                </div>
                            </div>
                            <div class="text-end">
                                <div class="timer-display ${statusClass}" id="timer-display-${key}">${timeDisplay}</div>
                                <small class="text-muted">Next Rotation</small>
                                <div class="mt-2">
                                    <small class="text-muted">Rotates: <span id="expires-${key}" class="text-info">${expiration}</span></small>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <div class="merchant-info">
                            <strong>📍 Location:</strong>
                            <span>${escapeHtml(merchant.location || 'N/A')}</span>
                        </div>
                        <div class="merchant-info">
                            <strong>📏 Distance:</strong>
                            <span>${escapeHtml(merchant.distance || 'N/A')}</span>
                        </div>
                        <div class="merchant-info">
                            <strong>💰 Price:</strong>
                            <span>${escapeHtml(merchant.price || 'N/A')}</span>
                        </div>
                        <div class="merchant-info">
                            <strong>🛒 Buying:</strong>
                            <span>${escapeHtml(merchant.buying || merchant.itemName)}</span>
                        </div>
                        <hr>
                        <button class="btn btn-danger ms-2" onclick="removeMerchant('${key}')">🗑️ Remove Merchant</button>
                    </div>
                </div>
            `;
        }).join('');
        
        renderMerchantsRotation();
        renderBestPrices();
    }

    // Store original remaining time when merchant starts
    function getOriginalRemainingTime(merchant) {
        if (!merchant.originalRemaining) {
            merchant.originalRemaining = merchant.secondsRemaining;
        }
        return merchant.originalRemaining;
    }

    // Update timers
    let lastSaveTime = 0;
    let lastRenderTime = 0;
    const SAVE_INTERVAL = 30000; // Save every 30 seconds
    const RENDER_INTERVAL = 10000; // Re-render every 10 seconds
    
    function updateTimers() {
        const now = new Date();
        const nowTime = now.getTime();
        let hasChanges = false;
        let needsSave = false;
        let needsRender = false;
        const merchants = window.merchants || {};
        
        Object.keys(merchants).forEach(key => {
            const merchant = merchants[key];
            const originalRemaining = getOriginalRemainingTime(merchant);
            
            if (originalRemaining > 0) {
                const startTime = new Date(merchant.startTime);
                const elapsed = Math.floor((now - startTime) / 1000);
                const newRemaining = Math.max(0, originalRemaining - elapsed);
                
                if (newRemaining !== merchant.secondsRemaining) {
                    merchant.secondsRemaining = newRemaining;
                    hasChanges = true;
                    // Only save if timer reached 0 or it's been 30+ seconds since last save
                    if (newRemaining === 0 || (nowTime - lastSaveTime) >= SAVE_INTERVAL) {
                        needsSave = true;
                    }
                    // Only re-render if timer reached 0 or it's been 10+ seconds since last render
                    if (newRemaining === 0 || (nowTime - lastRenderTime) >= RENDER_INTERVAL) {
                        needsRender = true;
                    }
                }
                
                const timerElement = document.getElementById(`timer-display-${key}`);
                const expiresElement = document.getElementById(`expires-${key}`);
                
                if (timerElement) {
                    const timeDisplay = formatTime(merchant.secondsRemaining);
                    timerElement.textContent = timeDisplay;
                    
                    if (merchant.secondsRemaining <= 0) {
                        timerElement.classList.add('timer-complete');
                    } else {
                        timerElement.classList.remove('timer-complete');
                    }
                }
                
                if (expiresElement && merchant.secondsRemaining > 0) {
                    expiresElement.textContent = getExpirationTime(merchant.secondsRemaining);
                } else if (expiresElement) {
                    expiresElement.textContent = 'Rotated';
                }
            }
        });
        
        if (hasChanges) {
            // Only save periodically or when timer reaches 0
            if (needsSave) {
                if (typeof window.saveToStorage === 'function') {
                    window.saveToStorage();
                }
                lastSaveTime = nowTime;
            }
            // Only re-render periodically or when timer reaches 0
            if (needsRender) {
                renderMerchantsRotation();
                renderBestPrices();
                lastRenderTime = nowTime;
            }
        }
        
        const activeKeys = Object.keys(merchants).filter(key => {
            return merchants[key].secondsRemaining > 0;
        });
        
        const groupedByRotation = {};
        activeKeys.forEach(key => {
            const merchant = merchants[key];
            const roundedTime = Math.round(merchant.secondsRemaining / 10) * 10;
            if (!groupedByRotation[roundedTime]) {
                groupedByRotation[roundedTime] = [];
            }
            groupedByRotation[roundedTime].push({ key, merchant });
        });
        
        Object.keys(groupedByRotation).forEach(roundedTime => {
            const group = groupedByRotation[roundedTime];
            const actualTime = group[0].merchant.secondsRemaining;
            const groupKey = `rotation-${roundedTime}`;
            const timerElement = document.getElementById(`rotation-timer-${groupKey}`);
            
            if (timerElement) {
                const timeDisplay = formatTime(actualTime);
                timerElement.textContent = timeDisplay;
                
                if (actualTime <= 0) {
                    timerElement.classList.add('timer-complete');
                } else {
                    timerElement.classList.remove('timer-complete');
                }
            }
        });
    }

    // Set waypoint (placeholder function)
    function setWaypoint(key) {
        const merchants = window.merchants || {};
        const merchant = merchants[key];
        if (!merchant) return;
        
        alert(`Waypoint set for ${merchant.itemName} at ${merchant.location}`);
    }

    // Export functions to global scope
    window.formatAESTDateTime = formatAESTDateTime;
    window.updateAESTTime = updateAESTTime;
    window.formatTime = formatTime;
    window.getExpirationTime = getExpirationTime;
    window.escapeHtml = escapeHtml;
    window.extractPrice = extractPrice;
    window.calculateBestPrices = calculateBestPrices;
    window.renderMerchantsRotation = renderMerchantsRotation;
    window.renderBestPrices = renderBestPrices;
    window.renderMerchants = renderMerchants;
    window.updateTimers = updateTimers;
    window.setWaypoint = setWaypoint;

})();
