/**
 * Merchants Core Module
 * Contains merchant data management, parsing, and storage functions
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof DebugManager === 'undefined') {
        console.error('DebugManager is required but not loaded. Please load js/debug-manager.js first.');
        return;
    }

    // Initialize DebugManager for merchants
    const debugManager = new DebugManager({
        prefix: '[Merchants Debug]',
        storageKey: 'merchants_debug_enabled',
        buttonId: 'debugToggleBtn',
        textId: 'debugToggleText'
    });

    // Expose debug functions globally for backward compatibility
    window.debugLog = function(...args) { debugManager.log(...args); };
    window.debugError = function(...args) { debugManager.error(...args); };
    window.toggleDebug = function() { debugManager.toggle(); };

    // Storage keys
    const STORAGE_KEY = 'traveling_merchants';
    
    // Store merchants data
    let merchants = {};

    // Parse time string to seconds
    function parseTimeToSeconds(timeStr) {
        let totalSeconds = 0;
        
        const daysMatch = timeStr.match(/(\d+)d/);
        if (daysMatch) {
            totalSeconds += parseInt(daysMatch[1]) * 86400;
        }
        
        const hoursMatch = timeStr.match(/(\d+)h/);
        if (hoursMatch) {
            totalSeconds += parseInt(hoursMatch[1]) * 3600;
        }
        
        const minutesMatch = timeStr.match(/(\d+)m/);
        if (minutesMatch) {
            totalSeconds += parseInt(minutesMatch[1]) * 60;
        }
        
        const secondsMatch = timeStr.match(/(\d+)s/);
        if (secondsMatch) {
            totalSeconds += parseInt(secondsMatch[1]);
        }
        
        return totalSeconds;
    }

    // Parse pasted text
    function parseMerchantData(text) {
        debugManager.log('Parsing merchant data, input length:', text.length);
        const merchants = [];
        
        let normalizedText = text
            .replace(/×/g, '\n')
            .replace(/📍 Set Waypoint/gi, '\n---SEPARATOR---\n')
            .replace(/Set Waypoint/gi, '')
            .replace(/📍\s*$/gm, '');
        
        let blocks = normalizedText.split(/\n\s*---SEPARATOR---\s*\n/).filter(block => block.trim());
        debugManager.log('Initial blocks found:', blocks.length);
        
        if (blocks.length <= 1) {
            const lines = normalizedText.split('\n');
            const newBlocks = [];
            let currentBlock = [];
            let lastMerchantNum = null;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                const merchantMatch = line.match(/Merchant #(\d+)/);
                
                if (merchantMatch) {
                    const merchantNum = parseInt(merchantMatch[1]);
                    if (currentBlock.length > 0 && lastMerchantNum !== null && merchantNum !== lastMerchantNum) {
                        newBlocks.push(currentBlock.join('\n'));
                        currentBlock = [];
                    }
                    lastMerchantNum = merchantNum;
                }
                
                if (line || currentBlock.length > 0) {
                    currentBlock.push(line);
                }
            }
            
            if (currentBlock.length > 0) {
                newBlocks.push(currentBlock.join('\n'));
            }
            
            if (newBlocks.length > 1) {
                blocks = newBlocks;
                debugManager.log('Split by merchant numbers, found:', blocks.length, 'blocks');
            } else if (blocks.length === 1) {
                blocks = normalizedText.split(/\n\s*\n\s*\n/).filter(block => block.trim());
                debugManager.log('Split by triple newlines, found:', blocks.length, 'blocks');
            }
        }
        
        debugManager.log('Processing', blocks.length, 'merchant blocks');
        blocks.forEach((block, index) => {
            debugManager.log(`Processing block ${index + 1}/${blocks.length}`);
            const lines = block.split('\n')
                .map(l => l.trim())
                .filter(l => l && !l.match(/^📍 Set Waypoint$/i) && !l.match(/Set Waypoint/i) && l !== '×' && l !== '📍');
            
            if (lines.length < 2) return;
            
            let emoji = '';
            let itemName = '';
            let firstLineIndex = -1;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const emojiMatch = line.match(/^([^\s]+)\s+(.+)$/);
                if (emojiMatch) {
                    emoji = emojiMatch[1];
                    itemName = emojiMatch[2].trim();
                    firstLineIndex = i;
                    break;
                }
                if (i < lines.length - 1) {
                    const emojiOnly = line.match(/^([^\s]+)$/);
                    const nextLine = lines[i + 1];
                    if (emojiOnly && nextLine && !nextLine.match(/^(Merchant|📍|📏|💰|🛒|⏰)/)) {
                        emoji = emojiOnly[1];
                        itemName = nextLine.trim();
                        firstLineIndex = i;
                        break;
                    }
                }
            }
            
            if (!emoji || !itemName) return;
            
            const merchantMatch = lines.find(line => line.includes('Merchant #'));
            if (!merchantMatch) return;
            const merchantNum = merchantMatch.match(/Merchant #(\d+)/)?.[1];
            if (!merchantNum) return;
            
            let location = '';
            const locationIndex = lines.findIndex(line => line.includes('📍 Location'));
            if (locationIndex !== -1) {
                const locationLine = lines[locationIndex];
                if (locationLine.includes(':')) {
                    location = locationLine.replace(/📍 Location:?\s*/, '').trim();
                } else {
                    if (locationIndex + 1 < lines.length) {
                        location = lines[locationIndex + 1].trim();
                    }
                }
            }
            
            let distance = '';
            const distanceIndex = lines.findIndex(line => line.includes('📏 Distance'));
            if (distanceIndex !== -1) {
                const distanceLine = lines[distanceIndex];
                if (distanceLine.includes(':')) {
                    distance = distanceLine.replace(/📏 Distance:?\s*/, '').trim();
                } else {
                    if (distanceIndex + 1 < lines.length) {
                        distance = lines[distanceIndex + 1].trim();
                    }
                }
            }
            
            let price = '';
            const priceIndex = lines.findIndex(line => line.includes('💰 Price'));
            if (priceIndex !== -1) {
                const priceLine = lines[priceIndex];
                if (priceLine.includes(':')) {
                    price = priceLine.replace(/💰 Price:?\s*/, '').trim();
                } else {
                    if (priceIndex + 1 < lines.length) {
                        price = lines[priceIndex + 1].trim();
                    }
                }
            }
            
            let buying = itemName;
            const buyingIndex = lines.findIndex(line => line.includes('🛒 Buying'));
            if (buyingIndex !== -1) {
                const buyingLine = lines[buyingIndex];
                if (buyingLine.includes(':')) {
                    buying = buyingLine.replace(/🛒 Buying:?\s*/, '').trim();
                } else {
                    if (buyingIndex + 1 < lines.length) {
                        buying = lines[buyingIndex + 1].trim();
                    }
                }
            }
            
            let rotationTimeStr = '';
            const rotationIndex = lines.findIndex(line => line.includes('⏰ Next Rotation'));
            if (rotationIndex !== -1) {
                const rotationLine = lines[rotationIndex];
                if (rotationLine.includes(':')) {
                    rotationTimeStr = rotationLine.replace(/⏰ Next Rotation:?\s*/, '').trim();
                } else {
                    if (rotationIndex + 1 < lines.length) {
                        rotationTimeStr = lines[rotationIndex + 1].trim();
                    }
                }
            }
            
            const rotationSeconds = rotationTimeStr ? parseTimeToSeconds(rotationTimeStr) : 0;
            
            if (itemName && merchantNum && rotationSeconds > 0) {
                const merchant = {
                    emoji: emoji,
                    itemName: itemName,
                    merchantNumber: parseInt(merchantNum),
                    location: location,
                    distance: distance,
                    price: price,
                    buying: buying || itemName,
                    secondsRemaining: rotationSeconds,
                    originalRemaining: rotationSeconds,
                    startTime: new Date().toISOString()
                };
                merchants.push(merchant);
                debugManager.log('Parsed merchant:', merchant.merchantNumber, '-', merchant.itemName, '- Rotation:', rotationTimeStr);
            } else {
                debugManager.log('Skipped invalid merchant block - itemName:', itemName, 'merchantNum:', merchantNum, 'rotationSeconds:', rotationSeconds);
            }
        });
        
        debugManager.log('Total merchants parsed:', merchants.length);
        return merchants;
    }

    // Save to localStorage
    function saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merchants));
        debugManager.log('Saved merchants to localStorage');
    }

    // Load from localStorage
    function loadFromStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                merchants = JSON.parse(stored);
                const now = new Date();
                Object.keys(merchants).forEach(key => {
                    const merchant = merchants[key];
                    if (!merchant.originalRemaining) {
                        merchant.originalRemaining = merchant.secondsRemaining;
                    }
                    const startTime = new Date(merchant.startTime);
                    const elapsed = Math.floor((now - startTime) / 1000);
                    const originalRemaining = merchant.originalRemaining || merchant.secondsRemaining;
                    merchant.secondsRemaining = Math.max(0, originalRemaining - elapsed);
                    merchant.originalRemaining = originalRemaining;
                    merchant.startTime = startTime.toISOString();
                });
                saveToStorage();
                debugManager.log('Loaded merchants from storage:', Object.keys(merchants).length, 'merchants');
            } catch (e) {
                debugManager.error('Error loading from storage:', e);
                merchants = {};
            }
        }
    }

    // Parse and save
    function parseAndSave() {
        const input = document.getElementById('pasteInput');
        if (!input) {
            debugManager.error('pasteInput element not found');
            return;
        }
        
        const inputValue = input.value;
        debugManager.log('parseAndSave called, input length:', inputValue.length);
        if (!inputValue.trim()) {
            alert('Please paste merchant data first!');
            return;
        }
        
        const parsed = parseMerchantData(inputValue);
        debugManager.log('Parsed merchants:', parsed.length);
        if (parsed.length === 0) {
            alert('No valid merchant data found. Please check the format.');
            return;
        }
        
        parsed.forEach(merchant => {
            const key = `merchant-${merchant.merchantNumber}`;
            const isUpdate = merchants[key] !== undefined;
            if (!merchant.originalRemaining) {
                merchant.originalRemaining = merchant.secondsRemaining;
            }
            merchant.startTime = new Date().toISOString();
            merchants[key] = merchant;
            debugManager.log(isUpdate ? 'Updated' : 'Added', 'merchant:', key);
        });
        
        saveToStorage();
        debugManager.log('Saved to storage, total merchants:', Object.keys(merchants).length);
        input.value = '';
        
        if (typeof window.renderMerchants === 'function') {
            window.renderMerchants();
        }
        if (typeof window.renderMerchantsRotation === 'function') {
            window.renderMerchantsRotation();
        }
        
        alert(`Successfully added ${parsed.length} merchant(s)!`);
    }

    // Remove merchant
    function removeMerchant(key) {
        const merchant = merchants[key];
        if (!merchant) {
            debugManager.log('Attempted to remove non-existent merchant:', key);
            return;
        }
        
        if (confirm(`Are you sure you want to remove Merchant #${merchant.merchantNumber} (${merchant.itemName})?`)) {
            debugManager.log('Removing merchant:', key, merchant.itemName);
            delete merchants[key];
            saveToStorage();
            if (typeof window.renderMerchants === 'function') {
                window.renderMerchants();
            }
            if (typeof window.renderMerchantsRotation === 'function') {
                window.renderMerchantsRotation();
            }
            if (typeof window.renderBestPrices === 'function') {
                window.renderBestPrices();
            }
        }
    }

    // Clear all merchants
    function clearAllMerchants() {
        const count = Object.keys(merchants).length;
        debugManager.log('clearAllMerchants called, current count:', count);
        if (count === 0) {
            alert('No merchants to clear.');
            return;
        }
        
        if (confirm('Are you sure you want to clear ALL merchants?')) {
            debugManager.log('Clearing all merchants');
            merchants = {};
            saveToStorage();
            if (typeof window.renderMerchants === 'function') {
                window.renderMerchants();
            }
            if (typeof window.renderMerchantsRotation === 'function') {
                window.renderMerchantsRotation();
            }
            if (typeof window.renderBestPrices === 'function') {
                window.renderBestPrices();
            }
            alert('All merchants cleared!');
        }
    }

    // Export functions to global scope
    window.merchants = merchants;
    window.parseTimeToSeconds = parseTimeToSeconds;
    window.parseMerchantData = parseMerchantData;
    window.saveToStorage = saveToStorage;
    window.loadFromStorage = loadFromStorage;
    window.parseAndSave = parseAndSave;
    window.removeMerchant = removeMerchant;
    window.clearAllMerchants = clearAllMerchants;
    window.merchantsDebugManager = debugManager;

})();
