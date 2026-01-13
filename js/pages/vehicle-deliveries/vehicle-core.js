/**
 * Vehicle Deliveries Core Module
 * Contains vehicle progress parsing, storage, and data management
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof DebugManager === 'undefined') {
        console.error('DebugManager is required but not loaded. Please load js/debug-manager.js first.');
        return;
    }

    // Initialize DebugManager for vehicle deliveries
    const debugManager = new DebugManager({
        prefix: '[Vehicle Deliveries Debug]',
        storageKey: 'vehicle_deliveries_debug_enabled',
        buttonId: 'debugToggleBtn',
        textId: 'debugToggleText'
    });

    // Expose debug functions globally for backward compatibility
    window.debugLog = function(...args) { debugManager.log(...args); };
    window.debugError = function(...args) { debugManager.error(...args); };
    window.toggleDebug = function() { debugManager.toggle(); };

    // Storage keys
    const PROGRESS_STORAGE_KEY = 'vehicle_delivery_progress';
    let vehicleProgress = {};

    // Utility function: Escape HTML
    function escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Parse vehicle progress data from pasted text
    function parseVehicleProgress(text) {
        debugManager.log('Parsing vehicle progress data, input length:', text.length);
        const vehicles = [];
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        
        let i = 0;
        while (i < lines.length) {
            const line = lines[i];
            
            if (!line || line.includes('Need') || line.includes('✅') || line.match(/^\d+\/\d+$/)) {
                i++;
                continue;
            }
            
            const vehicleName = line;
            i++;
            
            if (i >= lines.length) break;
            const progressLine = lines[i];
            const progressMatch = progressLine.match(/^(\d+)\/(\d+)$/);
            
            if (!progressMatch) {
                i++;
                continue;
            }
            
            const current = parseInt(progressMatch[1]);
            const total = parseInt(progressMatch[2]);
            const remaining = total - current;
            const unlocked = current >= total;
            i++;
            
            let reputation = null;
            if (i < lines.length) {
                const needLine = lines[i];
                
                if (needLine.includes('✅ Unlocked')) {
                    i++;
                } else {
                    const needMatch = needLine.match(/Need (\d+) more deliveries(?: & (\d+) more reputation)?/);
                    if (needMatch) {
                        if (needMatch[2]) {
                            reputation = parseInt(needMatch[2]);
                        }
                        i++;
                    }
                }
            }
            
            vehicles.push({
                name: vehicleName,
                current: current,
                total: total,
                remaining: remaining,
                reputation: reputation,
                unlocked: unlocked
            });
        }
        
        debugManager.log('Parsed vehicles:', vehicles.length);
        vehicles.forEach((v, idx) => {
            debugManager.log(`  [${idx}] ${v.name}: ${v.current}/${v.total}, Reputation: ${v.reputation || 'N/A'}, Unlocked: ${v.unlocked}`);
        });
        return vehicles;
    }

    // Save vehicle progress to localStorage
    function saveVehicleProgress() {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(vehicleProgress));
        debugManager.log('Saved vehicle progress to localStorage');
    }

    // Load vehicle progress from localStorage
    function loadVehicleProgress() {
        const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
        if (stored) {
            try {
                vehicleProgress = JSON.parse(stored);
                debugManager.log('Loaded vehicle progress from storage:', Object.keys(vehicleProgress).length, 'vehicles');
            } catch (e) {
                debugManager.error('Error loading vehicle progress:', e);
                vehicleProgress = {};
            }
        } else {
            debugManager.log('No vehicle progress found in storage');
        }
    }

    // Parse and save vehicle progress
    function parseAndSaveVehicleProgress() {
        const input = document.getElementById('vehicleProgressInput');
        if (!input) {
            debugManager.error('vehicleProgressInput element not found');
            return;
        }
        
        const inputValue = input.value;
        debugManager.log('parseAndSaveVehicleProgress called, input length:', inputValue.length);
        if (!inputValue.trim()) {
            alert('Please paste vehicle progress data first!');
            return;
        }
        
        const parsed = parseVehicleProgress(inputValue);
        debugManager.log('Parsed vehicles:', parsed.length);
        if (parsed.length === 0) {
            alert('No valid vehicle progress data found. Please check the format.');
            return;
        }
        
        parsed.forEach(vehicle => {
            const key = vehicle.name.toLowerCase().replace(/\s+/g, '-');
            const isUpdate = vehicleProgress[key] !== undefined;
            vehicleProgress[key] = vehicle;
            debugManager.log(isUpdate ? 'Updated' : 'Added', 'vehicle:', key, vehicle.name);
        });
        
        saveVehicleProgress();
        debugManager.log('Saved to localStorage, total vehicles:', Object.keys(vehicleProgress).length);
        input.value = '';
        
        if (typeof window.renderVehicleProgress === 'function') {
            window.renderVehicleProgress();
        }
        
        alert(`Successfully added ${parsed.length} vehicle(s)!`);
    }

    // Clear all vehicle progress
    function clearAllVehicleProgress() {
        const count = Object.keys(vehicleProgress).length;
        debugManager.log('clearAllVehicleProgress called, current count:', count);
        if (count === 0) {
            alert('No vehicle progress to clear.');
            return;
        }
        
        if (confirm('Are you sure you want to clear ALL vehicle progress?')) {
            debugManager.log('Clearing all vehicle progress');
            vehicleProgress = {};
            saveVehicleProgress();
            if (typeof window.renderVehicleProgress === 'function') {
                window.renderVehicleProgress();
            }
            alert('All vehicle progress cleared!');
        }
    }

    // Export functions and variables to global scope
    window.vehicleProgress = vehicleProgress;
    window.escapeHtml = escapeHtml;
    window.parseVehicleProgress = parseVehicleProgress;
    window.saveVehicleProgress = saveVehicleProgress;
    window.loadVehicleProgress = loadVehicleProgress;
    window.parseAndSaveVehicleProgress = parseAndSaveVehicleProgress;
    window.clearAllVehicleProgress = clearAllVehicleProgress;
    window.vehicleDebugManager = debugManager;

})();
