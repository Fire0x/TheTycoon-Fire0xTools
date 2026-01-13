/**
 * Education Timer Core Module
 * Contains training data parsing, storage, and data management
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof DebugManager === 'undefined') {
        console.error('DebugManager is required but not loaded. Please load js/debug-manager.js first.');
        return;
    }

    // Initialize DebugManager for education timer
    const debugManager = new DebugManager({
        prefix: '[Education Timer Debug]',
        storageKey: 'education_timer_debug_enabled',
        buttonId: 'debugToggleBtn',
        textId: 'debugToggleText'
    });

    // Expose debug functions globally for backward compatibility
    window.debugLog = function(...args) { debugManager.log(...args); };
    window.debugError = function(...args) { debugManager.error(...args); };
    window.toggleDebug = function() { debugManager.toggle(); };

    // Storage keys
    const STORAGE_KEY = 'educationTimers';
    let trainings = {};

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
    function parseTrainingData(text) {
        debugManager.log('Parsing training data, input length:', text.length);
        const trainings = [];
        
        let normalizedText = text.replace(/Cancel Training/gi, '\n---SEPARATOR---\n');
        const blocks = normalizedText.split(/\n\s*---SEPARATOR---\s*\n|\n\s*\n/).filter(block => block.trim());
        
        if (blocks.length === 1 && !normalizedText.includes('---SEPARATOR---')) {
            const lines = text.split('\n').map(l => l.trim()).filter(l => l);
            let currentTraining = null;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                if (line.includes(' - Level ')) {
                    if (currentTraining && currentTraining.name && currentTraining.secondsRemaining > 0) {
                        trainings.push(currentTraining);
                    }
                    
                    const nameLevelParts = line.split(' - Level ');
                    if (nameLevelParts.length === 2) {
                        currentTraining = {
                            name: nameLevelParts[0].trim(),
                            level: parseInt(nameLevelParts[1].trim()),
                            secondsRemaining: 0,
                            startTime: new Date().toISOString()
                        };
                    }
                } else if (line.includes('Time Remaining:') && currentTraining) {
                    const timeStr = line.replace('Time Remaining:', '').trim();
                    currentTraining.secondsRemaining = parseTimeToSeconds(timeStr);
                }
            }
            
            if (currentTraining && currentTraining.name && currentTraining.secondsRemaining > 0) {
                trainings.push(currentTraining);
            }
        } else {
            blocks.forEach(block => {
                const lines = block.split('\n').map(l => l.trim()).filter(l => l && !l.match(/^Cancel Training$/i));
                
                const nameLevelMatch = lines.find(line => line.includes(' - Level '));
                if (!nameLevelMatch) return;
                
                const nameLevelParts = nameLevelMatch.split(' - Level ');
                if (nameLevelParts.length !== 2) return;
                
                const name = nameLevelParts[0].trim();
                const level = parseInt(nameLevelParts[1].trim());
                
                const timeMatch = lines.find(line => line.includes('Time Remaining:'));
                if (!timeMatch) return;
                
                const timeStr = timeMatch.replace('Time Remaining:', '').trim();
                const seconds = parseTimeToSeconds(timeStr);
                
                if (name && level && seconds > 0) {
                    trainings.push({
                        name: name,
                        level: level,
                        secondsRemaining: seconds,
                        originalRemaining: seconds,
                        startTime: new Date().toISOString()
                    });
                }
            });
        }
        
        debugManager.log('Total trainings parsed:', trainings.length);
        return trainings;
    }

    // Load from localStorage
    function loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) {
                trainings = {};
                window.trainings = trainings;
                if (typeof window.renderTimers === 'function') {
                    window.renderTimers();
                }
                debugManager.log('No saved trainings found');
                return;
            }
            
            const timers = JSON.parse(saved);
            trainings = {};
            
            const now = new Date();
            timers.forEach(timer => {
                const key = timer.name.toLowerCase().replace(/\s+/g, '-');
                const startTime = new Date(timer.startTime);
                const elapsed = Math.floor((now - startTime) / 1000);
                const originalRemaining = timer.originalRemaining || timer.secondsRemaining;
                const newRemaining = Math.max(0, originalRemaining - elapsed);
                
                trainings[key] = {
                    name: timer.name,
                    level: timer.level,
                    secondsRemaining: newRemaining,
                    originalRemaining: originalRemaining,
                    startTime: timer.startTime
                };
            });
            
            // Sync with window.trainings
            window.trainings = trainings;
            
            debugManager.log('Loaded trainings from localStorage:', Object.keys(trainings).length, 'trainings');
            if (typeof window.renderTimers === 'function') {
                window.renderTimers();
            }
        } catch (error) {
            debugManager.error('Error loading from localStorage:', error);
            trainings = {};
            window.trainings = trainings;
            if (typeof window.renderTimers === 'function') {
                window.renderTimers();
            }
        }
    }

    // Save to localStorage
    function saveToLocalStorage() {
        try {
            const timersArray = Object.values(trainings).map(training => ({
                name: training.name,
                level: training.level,
                secondsRemaining: training.secondsRemaining,
                originalRemaining: training.originalRemaining,
                startTime: training.startTime
            }));
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(timersArray));
            debugManager.log('✅ Saved trainings to localStorage');
            if (!debugManager.isEnabled()) console.log('✅ Saved trainings to localStorage');
        } catch (error) {
            debugManager.error('Error saving to localStorage:', error);
            throw error;
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
            alert('Please paste training data first!');
            return;
        }
        
        const parsed = parseTrainingData(inputValue);
        debugManager.log('Parsed trainings:', parsed.length);
        if (parsed.length === 0) {
            alert('No valid training data found. Please check the format.');
            return;
        }
        
        parsed.forEach(training => {
            const key = training.name.toLowerCase().replace(/\s+/g, '-');
            const isUpdate = trainings[key] !== undefined;
            trainings[key] = {
                name: training.name,
                level: training.level,
                secondsRemaining: training.secondsRemaining,
                originalRemaining: training.originalRemaining || training.secondsRemaining,
                startTime: training.startTime || new Date().toISOString()
            };
            debugManager.log(isUpdate ? 'Updated' : 'Added', 'training:', key);
        });
        
        // Sync with window.trainings
        window.trainings = trainings;
        
        try {
            saveToLocalStorage();
            debugManager.log('Saved to storage, total trainings:', Object.keys(trainings).length);
            input.value = '';
            if (typeof window.renderTimers === 'function') {
                window.renderTimers();
            }
            alert(`Successfully added ${parsed.length} training(s)!`);
        } catch (error) {
            debugManager.error('Error in parseAndSave:', error);
            alert(`Failed to save trainings: ${error.message || 'Unknown error'}. Please check the console for details.`);
        }
    }

    // Cancel training
    function cancelTraining(name) {
        if (!confirm(`Are you sure you want to cancel ${name} training?`)) {
            return;
        }
        
        try {
            const key = name.toLowerCase().replace(/\s+/g, '-');
            debugManager.log('Cancelling training:', key);
            delete trainings[key];
            // Sync with window.trainings
            window.trainings = trainings;
            saveToLocalStorage();
            if (typeof window.renderTimers === 'function') {
                window.renderTimers();
            }
            debugManager.log('Training cancelled successfully');
        } catch (error) {
            debugManager.error('Error cancelling training:', error);
            alert('Failed to cancel training. Please try again.');
        }
    }

    // Clear all trainings
    function clearAllTrainings() {
        const count = Object.keys(trainings).length;
        debugManager.log('clearAllTrainings called, current count:', count);
        if (count === 0) {
            alert('No trainings to clear.');
            return;
        }
        
        if (!confirm('Are you sure you want to clear ALL trainings?')) {
            return;
        }
        
        try {
            debugManager.log('Clearing all trainings');
            trainings = {};
            // Sync with window.trainings
            window.trainings = trainings;
            localStorage.removeItem(STORAGE_KEY);
            if (typeof window.renderTimers === 'function') {
                window.renderTimers();
            }
            alert('All trainings cleared!');
        } catch (error) {
            debugManager.error('Error clearing trainings:', error);
            alert('Failed to clear trainings. Please try again.');
        }
    }

    // Export functions and variables to global scope
    window.trainings = trainings;
    window.parseTimeToSeconds = parseTimeToSeconds;
    window.parseTrainingData = parseTrainingData;
    window.loadFromLocalStorage = loadFromLocalStorage;
    window.saveToLocalStorage = saveToLocalStorage;
    window.parseAndSave = parseAndSave;
    window.cancelTraining = cancelTraining;
    window.clearAllTrainings = clearAllTrainings;
    window.educationDebugManager = debugManager;

})();
