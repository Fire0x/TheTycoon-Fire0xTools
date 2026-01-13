/**
 * Education Timer UI Module
 * Contains rendering functions and timer updates
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.educationDebugManager === 'undefined') {
        console.error('education-core.js must be loaded before education-ui.js');
        return;
    }

    const debugManager = window.educationDebugManager;

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
            return 'Complete';
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

    // Render timer cards
    function renderTimers() {
        const container = document.getElementById('timersContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;
        
        const trainings = window.trainings || {};
        const keys = Object.keys(trainings);
        
        if (keys.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        container.innerHTML = keys.map(key => {
            const training = trainings[key];
            const name = training.name;
            const level = training.level;
            const seconds = training.secondsRemaining;
            const timeDisplay = formatTime(seconds);
            const expiration = seconds > 0 ? getExpirationTime(seconds) : 'N/A';
            const statusClass = seconds <= 0 ? 'timer-complete' : '';
            
            return `
                <div class="card timer-card" id="timer-${key}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h4 class="card-title mb-1">${escapeHtml(name)}</h4>
                                <p class="education-level mb-0">Level ${level}</p>
                            </div>
                            <div class="text-end">
                                <div class="timer-display ${statusClass}" id="timer-display-${key}">${timeDisplay}</div>
                                <small class="text-muted">Time Remaining</small>
                                <div class="mt-2">
                                    <small class="text-muted">Expires: <span id="expires-${key}" class="text-info">${expiration}</span></small>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <button class="btn btn-outline-danger btn-sm" onclick="cancelTraining('${escapeHtml(name)}')">Cancel Training</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Update timers
    function updateTimers() {
        const now = new Date();
        const trainings = window.trainings || {};
        
        Object.keys(trainings).forEach(key => {
            const training = trainings[key];
            const originalRemaining = training.originalRemaining || training.secondsRemaining;
            
            if (originalRemaining > 0) {
                const startTime = new Date(training.startTime);
                const elapsed = Math.floor((now - startTime) / 1000);
                const newRemaining = Math.max(0, originalRemaining - elapsed);
                
                training.secondsRemaining = newRemaining;
                
                const timerElement = document.getElementById(`timer-display-${key}`);
                const expiresElement = document.getElementById(`expires-${key}`);
                
                if (timerElement) {
                    const timeDisplay = formatTime(training.secondsRemaining);
                    timerElement.textContent = timeDisplay;
                    
                    if (training.secondsRemaining <= 0) {
                        timerElement.classList.add('timer-complete');
                    } else {
                        timerElement.classList.remove('timer-complete');
                    }
                }
                
                if (expiresElement && training.secondsRemaining > 0) {
                    expiresElement.textContent = getExpirationTime(training.secondsRemaining);
                } else if (expiresElement) {
                    expiresElement.textContent = 'Complete';
                }
            }
        });
    }

    // Export functions to global scope
    window.formatAESTDateTime = formatAESTDateTime;
    window.updateAESTTime = updateAESTTime;
    window.formatTime = formatTime;
    window.getExpirationTime = getExpirationTime;
    window.escapeHtml = escapeHtml;
    window.renderTimers = renderTimers;
    window.updateTimers = updateTimers;

})();
