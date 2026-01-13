/**
 * Checklist Initialization Module
 * Contains initialization logic, collapse state management, and time updates
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.checklistDebugManager === 'undefined') {
        console.error('checklist-shared.js must be loaded before checklist-init.js');
        return;
    }

    const debugManager = window.checklistDebugManager;

    // ============================================================================
    // COLLAPSE STATE MANAGEMENT
    // ============================================================================

    // How to Use Section Collapse State
    const HOW_TO_USE_STORAGE_KEY = 'checklist_how_to_use_expanded';
    
    function initHowToUseCollapse() {
        const stored = localStorage.getItem(HOW_TO_USE_STORAGE_KEY);
        const shouldExpand = stored === null ? true : stored === 'true';
        
        const collapseElement = document.getElementById('howToUseCollapse');
        const toggleIcon = document.getElementById('howToUseToggle');
        const toggleButton = document.querySelector('[data-bs-target="#howToUseCollapse"]');
        
        if (collapseElement) {
            const bsCollapse = new bootstrap.Collapse(collapseElement, {
                toggle: false
            });
            
            if (!shouldExpand) {
                bsCollapse.hide();
                if (toggleIcon) toggleIcon.textContent = '▶';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
            } else {
                bsCollapse.show();
                if (toggleIcon) toggleIcon.textContent = '▼';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
            }
            
            collapseElement.addEventListener('shown.bs.collapse', function() {
                localStorage.setItem(HOW_TO_USE_STORAGE_KEY, 'true');
                if (toggleIcon) toggleIcon.textContent = '▼';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
            });
            
            collapseElement.addEventListener('hidden.bs.collapse', function() {
                localStorage.setItem(HOW_TO_USE_STORAGE_KEY, 'false');
                if (toggleIcon) toggleIcon.textContent = '▶';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
            });
        }
    }

    // All Business Summary Collapse State
    const ALL_BUSINESS_SUMMARY_STORAGE_KEY = 'checklist_all_business_summary_expanded';
    
    function initAllBusinessSummaryCollapse() {
        const stored = localStorage.getItem(ALL_BUSINESS_SUMMARY_STORAGE_KEY);
        const shouldExpand = stored === null ? true : stored === 'true';
        
        const collapseElement = document.getElementById('allBusinessSummaryCollapse');
        const toggleIcon = document.getElementById('allBusinessSummaryToggle');
        const toggleButton = document.querySelector('[data-bs-target="#allBusinessSummaryCollapse"]');
        
        if (collapseElement) {
            const bsCollapse = new bootstrap.Collapse(collapseElement, {
                toggle: false
            });
            
            if (!shouldExpand) {
                bsCollapse.hide();
                if (toggleIcon) toggleIcon.textContent = '▶';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
            } else {
                bsCollapse.show();
                if (toggleIcon) toggleIcon.textContent = '▼';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
            }
            
            collapseElement.addEventListener('shown.bs.collapse', function() {
                localStorage.setItem(ALL_BUSINESS_SUMMARY_STORAGE_KEY, 'true');
                if (toggleIcon) toggleIcon.textContent = '▼';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
            });
            
            collapseElement.addEventListener('hidden.bs.collapse', function() {
                localStorage.setItem(ALL_BUSINESS_SUMMARY_STORAGE_KEY, 'false');
                if (toggleIcon) toggleIcon.textContent = '▶';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
            });
        }
    }

    // Summary Collapse State
    const SUMMARY_STORAGE_KEY = 'checklist_summary_expanded';
    
    function initSummaryCollapse() {
        const stored = localStorage.getItem(SUMMARY_STORAGE_KEY);
        const shouldExpand = stored === null ? true : stored === 'true';
        
        const collapseElement = document.getElementById('summaryCollapse');
        const toggleIcon = document.getElementById('summaryToggle');
        const toggleButton = document.querySelector('[data-bs-target="#summaryCollapse"]');
        
        if (collapseElement) {
            const bsCollapse = new bootstrap.Collapse(collapseElement, {
                toggle: false
            });
            
            if (!shouldExpand) {
                bsCollapse.hide();
                if (toggleIcon) toggleIcon.textContent = '▶';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
            } else {
                bsCollapse.show();
                if (toggleIcon) toggleIcon.textContent = '▼';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
            }
            
            collapseElement.addEventListener('shown.bs.collapse', function() {
                localStorage.setItem(SUMMARY_STORAGE_KEY, 'true');
                if (toggleIcon) toggleIcon.textContent = '▼';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
            });
            
            collapseElement.addEventListener('hidden.bs.collapse', function() {
                localStorage.setItem(SUMMARY_STORAGE_KEY, 'false');
                if (toggleIcon) toggleIcon.textContent = '▶';
                if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
            });
        }
    }

    // ============================================================================
    // TIME MANAGEMENT FUNCTIONS
    // ============================================================================

    // Get Eastern Time zone abbreviation (EDT/EST)
    function getEasternTimeZone() {
        const now = new Date();
        const easternDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        const offset = (easternDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
        return offset === -4 ? 'EDT' : 'EST';
    }

    // Format time for a specific timezone
    function formatTimeForTimezone(date, timezone, options = {}) {
        const defaultOptions = {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        return date.toLocaleString('en-US', { ...defaultOptions, ...options });
    }

    // Get next 3 AM Eastern Time
    function getNextRebootTime() {
        const now = new Date();
        
        const easternNowStr = now.toLocaleString('en-US', { 
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        const [datePart, timePart] = easternNowStr.split(', ');
        const [month, day, year] = datePart.split('/');
        const [hour] = timePart.split(':');
        
        const currentHour = parseInt(hour);
        
        let targetYear = parseInt(year);
        let targetMonth = parseInt(month);
        let targetDay = parseInt(day);
        
        if (currentHour >= 3) {
            const date = new Date(targetYear, targetMonth - 1, targetDay);
            date.setDate(date.getDate() + 1);
            targetYear = date.getFullYear();
            targetMonth = date.getMonth() + 1;
            targetDay = date.getDate();
        }
        
        let bestMatch = null;
        
        for (let utcOffset = -6; utcOffset <= 6; utcOffset++) {
            const testUTC = new Date(Date.UTC(targetYear, targetMonth - 1, targetDay, 3 + utcOffset, 0, 0));
            const testEastern = testUTC.toLocaleString('en-US', { 
                timeZone: 'America/New_York',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            
            const [testDatePart, testTimePart] = testEastern.split(', ');
            const [testMonth, testDay, testYear] = testDatePart.split('/');
            const [testHour] = testTimePart.split(':');
            
            if (parseInt(testHour) === 3 && 
                parseInt(testMonth) === targetMonth && 
                parseInt(testDay) === targetDay && 
                parseInt(testYear) === targetYear) {
                bestMatch = testUTC;
                break;
            }
        }
        
        return bestMatch || new Date();
    }

    // Format countdown time
    function formatCountdown(seconds) {
        if (seconds <= 0) {
            return '00:00:00';
        }
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Update reboot countdown
    function updateRebootCountdown() {
        const now = new Date();
        const nextReboot = getNextRebootTime();
        const diff = Math.floor((nextReboot - now) / 1000);
        
        const countdownElement = document.getElementById('reboot-countdown');
        const rebootTimeETElement = document.getElementById('reboot-time-et');
        const rebootTimeLocalElement = document.getElementById('reboot-time-local');
        
        if (countdownElement) {
            if (diff <= 0) {
                countdownElement.textContent = '00:00:00';
                countdownElement.classList.add('text-danger');
            } else {
                countdownElement.textContent = formatCountdown(diff);
                countdownElement.classList.remove('text-danger');
                countdownElement.classList.add('text-warning');
            }
        }
        
        if (rebootTimeETElement) {
            const tz = getEasternTimeZone();
            rebootTimeETElement.textContent = `3:00 AM ${tz}`;
        }
        
        if (rebootTimeLocalElement && nextReboot) {
            const localTimeOptions = {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            };
            const localTime = nextReboot.toLocaleTimeString('en-US', localTimeOptions);
            const timeZoneName = Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(nextReboot).find(part => part.type === 'timeZoneName')?.value || '';
            rebootTimeLocalElement.textContent = `${localTime} ${timeZoneName}`;
        }
    }

    // Update navbar times
    function updateTimes() {
        const now = new Date();
        
        // Local time
        const localTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        const localTimeElement = document.getElementById('local-time');
        if (localTimeElement) {
            localTimeElement.textContent = localTime;
        }
        
        // Eastern Time
        const easternTime = formatTimeForTimezone(now, 'America/New_York', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        const easternElement = document.getElementById('eastern-time');
        const easternTZElement = document.getElementById('eastern-tz');
        if (easternElement) {
            easternElement.textContent = easternTime.split(', ')[1] || easternTime;
        }
        if (easternTZElement) {
            easternTZElement.textContent = getEasternTimeZone();
        }
        
        // Update reboot countdown
        updateRebootCountdown();
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    // Track if initialization has already run
    let initialized = false;
    let timeUpdateInterval = null;

    // Main initialization function
    async function initializePage() {
        // Prevent duplicate initialization
        if (initialized) {
            debugManager.log('Initialization already completed, skipping...');
            return;
        }
        initialized = true;

        debugManager.init();
        initHowToUseCollapse();
        initAllBusinessSummaryCollapse();
        initSummaryCollapse();
        
        // Initialize emoji picker
        if (typeof window.initializeEmojiPicker === 'function') {
            window.initializeEmojiPicker('emojiPicker');
        }
        
        debugManager.log('Page initialized');
        
        // Initialize time updates (only once)
        updateTimes();
        if (timeUpdateInterval) {
            clearInterval(timeUpdateInterval);
        }
        timeUpdateInterval = setInterval(updateTimes, 1000);
        
        // Initialize configuration (wait for it to complete)
        await window.initializeConfig();
        
        // Load businesses (only after config is initialized)
        const configData = window.checklistConfigData();
        if (configData) {
            if (typeof window.loadAllBusinesses === 'function') {
                window.loadAllBusinesses();
            }
        } else {
            debugManager.error('Failed to initialize configuration');
            const loadingAlert = document.getElementById('loadingAlert');
            if (loadingAlert) {
                loadingAlert.innerHTML = '<span class="text-danger">⚠️ Failed to initialize configuration. Please refresh the page or add tiers/businesses manually.</span>';
            }
        }
    }

    // Initialize on page load (handles both loading and already-loaded states)
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initializePage);
    } else {
        // Document already loaded, initialize immediately
        initializePage();
    }

    // Auto-save notes on input blur (when user clicks away)
    // Use event delegation - only listen for blur on business note inputs
    document.addEventListener('blur', function(e) {
        // Only handle blur events on business note inputs
        const target = e.target;
        if (target && 
            target.classList.contains('form-control') && 
            target.dataset.businessId) {
            if (typeof window.saveNoteFromInput === 'function') {
                window.saveNoteFromInput(target);
            }
        }
    }, true);

    // Export functions to global scope
    window.initHowToUseCollapse = initHowToUseCollapse;
    window.initAllBusinessSummaryCollapse = initAllBusinessSummaryCollapse;
    window.initSummaryCollapse = initSummaryCollapse;
    window.updateTimes = updateTimes;
    window.updateRebootCountdown = updateRebootCountdown;
    window.getNextRebootTime = getNextRebootTime;
    window.formatCountdown = formatCountdown;
    window.getEasternTimeZone = getEasternTimeZone;
    window.formatTimeForTimezone = formatTimeForTimezone;

})();
