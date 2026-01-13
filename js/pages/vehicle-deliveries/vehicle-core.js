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
    
    debugManager.log('Vehicle Deliveries Core Module initialized');
    debugManager.log('Initial vehicleProgress state:', vehicleProgress);
    debugManager.log('Initial window.vehicleProgress state:', window.vehicleProgress);

    // Utility function: Escape HTML
    function escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Parse vehicle progress data from pasted text
    function parseVehicleProgress(text) {
        debugManager.log('=== parseVehicleProgress START ===');
        debugManager.log('Input text length:', text.length);
        debugManager.log('Input text preview (first 200 chars):', text.substring(0, 200));
        
        const vehicles = [];
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        debugManager.log('Total non-empty lines after filtering:', lines.length);
        debugManager.log('Lines array:', lines);
        
        let i = 0;
        let skippedCount = 0;
        while (i < lines.length) {
            const line = lines[i];
            debugManager.log(`Processing line ${i}: "${line}"`);
            
            if (!line || line.includes('Need') || line.includes('✅') || line.match(/^\d+\/\d+$/)) {
                debugManager.log(`  -> Skipping line ${i} (matches skip pattern)`);
                skippedCount++;
                i++;
                continue;
            }
            
            const vehicleName = line;
            debugManager.log(`  -> Found potential vehicle name: "${vehicleName}"`);
            i++;
            
            if (i >= lines.length) {
                debugManager.log(`  -> No more lines after vehicle name, breaking`);
                break;
            }
            const progressLine = lines[i];
            debugManager.log(`  -> Checking progress line ${i}: "${progressLine}"`);
            const progressMatch = progressLine.match(/^(\d+)\/(\d+)$/);
            
            if (!progressMatch) {
                debugManager.log(`  -> Progress line doesn't match pattern, skipping`);
                i++;
                continue;
            }
            
            const current = parseInt(progressMatch[1]);
            const total = parseInt(progressMatch[2]);
            const remaining = total - current;
            const unlocked = current >= total;
            debugManager.log(`  -> Parsed progress: ${current}/${total}, Remaining: ${remaining}, Unlocked: ${unlocked}`);
            i++;
            
            let reputation = null;
            if (i < lines.length) {
                const needLine = lines[i];
                debugManager.log(`  -> Checking need line ${i}: "${needLine}"`);
                
                if (needLine.includes('✅ Unlocked')) {
                    debugManager.log(`  -> Vehicle is unlocked`);
                    i++;
                } else {
                    const needMatch = needLine.match(/Need (\d+) more deliveries(?: & (\d+) more reputation)?/);
                    if (needMatch) {
                        debugManager.log(`  -> Matched need pattern, groups:`, needMatch);
                        if (needMatch[2]) {
                            reputation = parseInt(needMatch[2]);
                            debugManager.log(`  -> Extracted reputation: ${reputation}`);
                        } else {
                            debugManager.log(`  -> No reputation requirement found`);
                        }
                        i++;
                    } else {
                        debugManager.log(`  -> Need line doesn't match pattern`);
                    }
                }
            }
            
            const vehicleData = {
                name: vehicleName,
                current: current,
                total: total,
                remaining: remaining,
                reputation: reputation,
                unlocked: unlocked
            };
            vehicles.push(vehicleData);
            debugManager.log(`  -> Added vehicle:`, vehicleData);
        }
        
        debugManager.log(`=== parseVehicleProgress END ===`);
        debugManager.log(`Total vehicles parsed: ${vehicles.length}`);
        debugManager.log(`Total lines skipped: ${skippedCount}`);
        vehicles.forEach((v, idx) => {
            debugManager.log(`  [${idx}] ${v.name}: ${v.current}/${v.total}, Reputation: ${v.reputation || 'N/A'}, Unlocked: ${v.unlocked}`);
        });
        return vehicles;
    }

    // Save vehicle progress to localStorage
    function saveVehicleProgress() {
        debugManager.log('=== saveVehicleProgress START ===');
        const vehicleCount = Object.keys(vehicleProgress).length;
        debugManager.log('Saving vehicle progress, total vehicles:', vehicleCount);
        debugManager.log('vehicleProgress object keys:', Object.keys(vehicleProgress));
        debugManager.log('vehicleProgress object:', vehicleProgress);
        
        const jsonString = JSON.stringify(vehicleProgress);
        debugManager.log('JSON string length:', jsonString.length);
        debugManager.log('JSON string preview (first 500 chars):', jsonString.substring(0, 500));
        
        localStorage.setItem(PROGRESS_STORAGE_KEY, jsonString);
        debugManager.log('Successfully saved to localStorage with key:', PROGRESS_STORAGE_KEY);
        debugManager.log('=== saveVehicleProgress END ===');
    }

    // Load vehicle progress from localStorage
    function loadVehicleProgress() {
        debugManager.log('=== loadVehicleProgress START ===');
        debugManager.log('Current vehicleProgress before load:', vehicleProgress);
        debugManager.log('Current window.vehicleProgress before load:', window.vehicleProgress);
        debugManager.log('Checking localStorage for key:', PROGRESS_STORAGE_KEY);
        
        const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
        if (stored) {
            debugManager.log('Found stored data, length:', stored.length);
            debugManager.log('Stored data preview (first 500 chars):', stored.substring(0, 500));
            try {
                const parsed = JSON.parse(stored);
                debugManager.log('Successfully parsed JSON, vehicle count:', Object.keys(parsed).length);
                debugManager.log('Parsed data keys:', Object.keys(parsed));
                
                vehicleProgress = parsed;
                debugManager.log('Updated local vehicleProgress variable');
                debugManager.log('vehicleProgress after assignment:', vehicleProgress);
                
                // Update the global reference to point to the loaded data
                window.vehicleProgress = vehicleProgress;
                debugManager.log('Updated window.vehicleProgress reference');
                debugManager.log('window.vehicleProgress after update:', window.vehicleProgress);
                debugManager.log('Reference check - are they the same?', window.vehicleProgress === vehicleProgress);
                debugManager.log('Loaded vehicle progress from storage:', Object.keys(vehicleProgress).length, 'vehicles');
            } catch (e) {
                debugManager.error('Error parsing vehicle progress from localStorage:', e);
                debugManager.error('Error stack:', e.stack);
                vehicleProgress = {};
                window.vehicleProgress = vehicleProgress;
                debugManager.log('Reset vehicleProgress to empty object due to error');
            }
        } else {
            debugManager.log('No vehicle progress found in storage (key not found or empty)');
            debugManager.log('Keeping vehicleProgress as:', vehicleProgress);
        }
        debugManager.log('=== loadVehicleProgress END ===');
    }

    // Parse and save vehicle progress
    function parseAndSaveVehicleProgress() {
        debugManager.log('=== parseAndSaveVehicleProgress START ===');
        debugManager.log('Current vehicleProgress before parse:', vehicleProgress);
        debugManager.log('Current window.vehicleProgress before parse:', window.vehicleProgress);
        debugManager.log('Current vehicle count:', Object.keys(vehicleProgress).length);
        
        const input = document.getElementById('vehicleProgressInput');
        if (!input) {
            debugManager.error('vehicleProgressInput element not found');
            return;
        }
        debugManager.log('Found vehicleProgressInput element');
        
        const inputValue = input.value;
        debugManager.log('Input value length:', inputValue.length);
        debugManager.log('Input value (first 500 chars):', inputValue.substring(0, 500));
        
        if (!inputValue.trim()) {
            debugManager.log('Input is empty, showing alert');
            alert('Please paste vehicle progress data first!');
            return;
        }
        
        const parsed = parseVehicleProgress(inputValue);
        debugManager.log('Parsed vehicles count:', parsed.length);
        if (parsed.length === 0) {
            debugManager.log('No vehicles parsed, showing alert');
            alert('No valid vehicle progress data found. Please check the format.');
            return;
        }
        
        debugManager.log('Processing parsed vehicles...');
        const beforeCount = Object.keys(vehicleProgress).length;
        parsed.forEach((vehicle, idx) => {
            const key = vehicle.name.toLowerCase().replace(/\s+/g, '-');
            const isUpdate = vehicleProgress[key] !== undefined;
            const oldVehicle = vehicleProgress[key];
            
            debugManager.log(`[${idx}] Processing vehicle: "${vehicle.name}"`);
            debugManager.log(`  -> Generated key: "${key}"`);
            debugManager.log(`  -> Is update? ${isUpdate}`);
            if (isUpdate && oldVehicle) {
                debugManager.log(`  -> Old vehicle data:`, oldVehicle);
            }
            
            vehicleProgress[key] = vehicle;
            debugManager.log(`  -> ${isUpdate ? 'Updated' : 'Added'} vehicle: ${key} (${vehicle.name})`);
            debugManager.log(`  -> Vehicle data:`, vehicle);
        });
        
        const afterCount = Object.keys(vehicleProgress).length;
        debugManager.log(`Vehicle count: ${beforeCount} -> ${afterCount}`);
        debugManager.log('vehicleProgress after adding vehicles:', vehicleProgress);
        
        // Ensure global reference is updated
        debugManager.log('Updating window.vehicleProgress reference...');
        window.vehicleProgress = vehicleProgress;
        debugManager.log('window.vehicleProgress after update:', window.vehicleProgress);
        debugManager.log('Reference check - are they the same?', window.vehicleProgress === vehicleProgress);
        debugManager.log('Reference check - same keys?', 
            JSON.stringify(Object.keys(window.vehicleProgress).sort()) === JSON.stringify(Object.keys(vehicleProgress).sort()));
        
        saveVehicleProgress();
        debugManager.log('Saved to localStorage, total vehicles:', Object.keys(vehicleProgress).length);
        
        input.value = '';
        debugManager.log('Cleared input field');
        
        if (typeof window.renderVehicleProgress === 'function') {
            debugManager.log('Calling window.renderVehicleProgress()...');
            window.renderVehicleProgress();
            debugManager.log('renderVehicleProgress() completed');
        } else {
            debugManager.error('window.renderVehicleProgress is not a function!');
        }
        
        debugManager.log('Showing success alert');
        alert(`Successfully added ${parsed.length} vehicle(s)!`);
        debugManager.log('=== parseAndSaveVehicleProgress END ===');
    }

    // Clear all vehicle progress
    function clearAllVehicleProgress() {
        debugManager.log('=== clearAllVehicleProgress START ===');
        const count = Object.keys(vehicleProgress).length;
        debugManager.log('clearAllVehicleProgress called, current count:', count);
        debugManager.log('Current vehicleProgress:', vehicleProgress);
        debugManager.log('Current window.vehicleProgress:', window.vehicleProgress);
        
        if (count === 0) {
            debugManager.log('No vehicles to clear, showing alert');
            alert('No vehicle progress to clear.');
            return;
        }
        
        debugManager.log('Showing confirmation dialog...');
        if (confirm('Are you sure you want to clear ALL vehicle progress?')) {
            debugManager.log('User confirmed, clearing all vehicle progress');
            debugManager.log('Vehicle keys before clear:', Object.keys(vehicleProgress));
            
            vehicleProgress = {};
            debugManager.log('Reset local vehicleProgress to empty object');
            
            window.vehicleProgress = vehicleProgress;
            debugManager.log('Updated window.vehicleProgress reference');
            debugManager.log('Reference check - are they the same?', window.vehicleProgress === vehicleProgress);
            debugManager.log('vehicleProgress after clear:', vehicleProgress);
            debugManager.log('window.vehicleProgress after clear:', window.vehicleProgress);
            
            saveVehicleProgress();
            debugManager.log('Saved empty vehicleProgress to localStorage');
            
            if (typeof window.renderVehicleProgress === 'function') {
                debugManager.log('Calling window.renderVehicleProgress()...');
                window.renderVehicleProgress();
                debugManager.log('renderVehicleProgress() completed');
            } else {
                debugManager.error('window.renderVehicleProgress is not a function!');
            }
            
            debugManager.log('Showing success alert');
            alert('All vehicle progress cleared!');
        } else {
            debugManager.log('User cancelled clear operation');
        }
        debugManager.log('=== clearAllVehicleProgress END ===');
    }

    // Export functions and variables to global scope
    debugManager.log('Exporting functions to global scope...');
    window.vehicleProgress = vehicleProgress;
    debugManager.log('Exported window.vehicleProgress:', window.vehicleProgress);
    debugManager.log('Reference check - are they the same?', window.vehicleProgress === vehicleProgress);
    
    window.escapeHtml = escapeHtml;
    window.parseVehicleProgress = parseVehicleProgress;
    window.saveVehicleProgress = saveVehicleProgress;
    window.loadVehicleProgress = loadVehicleProgress;
    window.parseAndSaveVehicleProgress = parseAndSaveVehicleProgress;
    window.clearAllVehicleProgress = clearAllVehicleProgress;
    window.vehicleDebugManager = debugManager;
    
    debugManager.log('All functions exported to global scope');
    debugManager.log('Module initialization complete');

})();
