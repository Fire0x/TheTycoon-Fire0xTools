/**
 * Checklist Time Module
 * Handles clock updates and server reboot countdown.
 */
(function () {
    'use strict';

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
        if (seconds <= 0) return '00:00:00';
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
        const rebootTimeBrisbaneElement = document.getElementById('reboot-time-brisbane');

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
            const localTime = nextReboot.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            const timeZoneName = Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(nextReboot).find(part => part.type === 'timeZoneName')?.value || '';
            rebootTimeLocalElement.textContent = `${localTime} ${timeZoneName}`;
        }

        if (rebootTimeBrisbaneElement && nextReboot) {
            const brisbaneTime = nextReboot.toLocaleTimeString('en-US', { timeZone: 'Australia/Brisbane', hour: 'numeric', minute: '2-digit', hour12: true });
            rebootTimeBrisbaneElement.textContent = `${brisbaneTime} AEST`;
        }
    }

    // Update navbar times
    function updateTimes() {
        const now = new Date();

        // Brisbane time
        const brisbaneElement = document.getElementById('brisbane-time');
        if (brisbaneElement) {
            brisbaneElement.textContent = now.toLocaleTimeString('en-US', { timeZone: 'Australia/Brisbane', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        }

        // Local time
        const localTimeElement = document.getElementById('local-time');
        if (localTimeElement) {
            localTimeElement.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        }

        // Eastern Time
        const easternElement = document.getElementById('eastern-time');
        const easternTZElement = document.getElementById('eastern-tz');
        if (easternElement) {
            const easternTime = formatTimeForTimezone(now, 'America/New_York', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            easternElement.textContent = easternTime.split(', ')[1] || easternTime;
        }
        if (easternTZElement) {
            easternTZElement.textContent = getEasternTimeZone();
        }

        updateRebootCountdown();
    }

    // Expose functions to global scope
    window.updateTimes = updateTimes;
    window.getEasternTimeZone = getEasternTimeZone;
    window.formatTimeForTimezone = formatTimeForTimezone;
    window.getNextRebootTime = getNextRebootTime;
    window.formatCountdown = formatCountdown;

    // Start interval
    setInterval(updateTimes, 1000);
    updateTimes();

})();
