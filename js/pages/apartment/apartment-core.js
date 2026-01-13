/**
 * Apartment Core Module
 * Contains data management, storage, utilities, and CRUD operations
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof DebugManager === 'undefined') {
        console.error('DebugManager is required but not loaded. Please load js/debug-manager.js first.');
        return;
    }

    // Initialize DebugManager for apartments
    const debugManager = new DebugManager({
        prefix: '[APARTMENT DEBUG]',
        storageKey: 'apartmentDebugMode',
        buttonId: 'debugToggleBtn',
        textId: null // No separate text element
    });

    // Expose debug functions globally for backward compatibility
    window.debugLog = function(...args) { debugManager.log(...args); };
    window.toggleDebugMode = function() { debugManager.toggle(); };

    // localStorage Configuration Data Structure
    const APARTMENTS_STORAGE_KEY = 'apartmentsData';
    const APARTMENTS_VERSION = '1.0.1';
    
    let apartments = [];
    
    // Track hidden and locked apartments
    let hiddenApartments = JSON.parse(localStorage.getItem('hiddenApartments') || '[]');
    let lockedApartments = JSON.parse(localStorage.getItem('lockedApartments') || '[]');

    // Initialize apartments data from localStorage
    function initializeApartmentsData() {
        const saved = localStorage.getItem(APARTMENTS_STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                apartments = data.apartments || [];
                if (!data.version) {
                    saveApartmentsToLocalStorage();
                }
                // Update window.apartments to ensure UI modules have the latest data
                window.apartments = apartments;
                debugManager.log('✅ Loaded apartments from localStorage:', apartments.length);
                return true;
            } catch (e) {
                debugManager.log('Error parsing saved apartments:', e);
            }
        }
        
        apartments = [];
        // Update window.apartments to ensure UI modules have the latest data
        window.apartments = apartments;
        saveApartmentsToLocalStorage();
        debugManager.log('✅ Created empty apartments data');
        return true;
    }
    
    // Save apartments to localStorage
    function saveApartmentsToLocalStorage() {
        const data = {
            apartments: apartments,
            version: APARTMENTS_VERSION
        };
        localStorage.setItem(APARTMENTS_STORAGE_KEY, JSON.stringify(data));
        debugManager.log('✅ Saved apartments to localStorage:', apartments.length);
    }
    
    // Get apartment by ID
    function getApartmentById(id) {
        return apartments.find(apt => apt.id === id);
    }
    
    // Get reviews for an apartment
    function getApartmentReviews(apartmentId) {
        const apartment = getApartmentById(apartmentId);
        return apartment ? (apartment.reviews || []) : [];
    }
    
    // Calculate average rating for an apartment
    function calculateApartmentRating(apartmentId) {
        const reviews = getApartmentReviews(apartmentId);
        if (reviews.length === 0) {
            return { average_rating: null, review_count: 0 };
        }
        const sum = reviews.reduce((acc, review) => acc + parseFloat(review.rating || 0), 0);
        const average = sum / reviews.length;
        return {
            average_rating: average.toFixed(2),
            review_count: reviews.length
        };
    }
    
    // Get rating breakdown for an apartment
    function getApartmentRatingBreakdown(apartmentId) {
        const reviews = getApartmentReviews(apartmentId);
        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
            const rating = Math.round(parseFloat(review.rating || 0));
            if (rating >= 1 && rating <= 5) {
                breakdown[rating]++;
            }
        });
        return breakdown;
    }
    
    // Calculate overall rating across all apartments
    function calculateOverallRating() {
        let totalRating = 0;
        let totalReviews = 0;
        
        apartments.forEach(apt => {
            const reviews = apt.reviews || [];
            if (reviews.length > 0) {
                reviews.forEach(review => {
                    totalRating += parseFloat(review.rating || 0);
                    totalReviews++;
                });
            }
        });
        
        if (totalReviews === 0) {
            return { average_rating: null, review_count: 0 };
        }
        
        return {
            average_rating: (totalRating / totalReviews).toFixed(2),
            review_count: totalReviews
        };
    }

    // Format date as DD MMM YYYY (e.g., "15 Jan 2025")
    function formatDateDDMMMYYYY(date) {
        if (!date || isNaN(date.getTime())) return '--';
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }

    // Format date with time as DD MMM YYYY HH:MM
    function formatDateDDMMMYYYYWithTime(date, timezone = null) {
        if (!date || isNaN(date.getTime())) return '--';
        const d = timezone ? new Date(date.toLocaleString('en-US', { timeZone: timezone })) : date;
        const day = String(d.getDate()).padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[d.getMonth()];
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day} ${month} ${year} ${hours}:${minutes}`;
    }

    // Format local date/time as DD MMM YYYY HH:MM
    function formatLocalDateDDMMMYYYYWithTime(date) {
        if (!date || isNaN(date.getTime())) return '--';
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day} ${month} ${year} ${hours}:${minutes}`;
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

    // Get Eastern Time zone abbreviation (EDT/EST)
    function getEasternTimeZone() {
        const now = new Date();
        const easternDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        const offset = (easternDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
        return offset === -4 ? 'EDT' : 'EST';
    }

    // Convert Brisbane time to local timezone datetime-local format
    function brisbaneToLocalDatetime(brisbaneDate) {
        if (!brisbaneDate) return '';
        const date = new Date(brisbaneDate);
        
        const brisbaneStr = formatTimeForTimezone(date, 'Australia/Brisbane', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        
        const [datePart, timePart] = brisbaneStr.split(', ');
        const [month, day, year] = datePart.split('/');
        const [hour, minute] = timePart.split(':');
        
        const isoStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
        const utcDate = new Date(Date.UTC(year, month - 1, day, parseInt(hour), parseInt(minute)));
        utcDate.setUTCHours(utcDate.getUTCHours() - 10);
        
        const localDate = new Date(utcDate);
        
        const yearLocal = localDate.getFullYear();
        const monthLocal = String(localDate.getMonth() + 1).padStart(2, '0');
        const dayLocal = String(localDate.getDate()).padStart(2, '0');
        const hourLocal = String(localDate.getHours()).padStart(2, '0');
        const minuteLocal = String(localDate.getMinutes()).padStart(2, '0');
        
        return `${yearLocal}-${monthLocal}-${dayLocal}T${hourLocal}:${minuteLocal}`;
    }

    // Convert local datetime-local to Brisbane time for display
    function localDatetimeToBrisbane(localDatetime) {
        if (!localDatetime) return '--';
        const [datePart, timePart] = localDatetime.split('T');
        const [year, month, day] = datePart.split('-');
        const [hour, minute] = timePart.split(':');
        
        const localDate = new Date(year, month - 1, day, hour, minute);
        
        return formatTimeForTimezone(localDate, 'Australia/Brisbane', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }) || '--';
    }
    
    // Convert local datetime-local to local time for display
    function localDatetimeToLocal(localDatetime) {
        if (!localDatetime) return '--';
        const [datePart, timePart] = localDatetime.split('T');
        const [year, month, day] = datePart.split('-');
        const [hour, minute] = timePart.split(':');
        
        const localDate = new Date(year, month - 1, day, hour, minute);
        
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return localDate.toLocaleString('en-US', options) || '--';
    }
    
    // Convert datetime-local to Eastern time for display
    function localDatetimeToEastern(localDatetime) {
        if (!localDatetime) return '--';
        const [datePart, timePart] = localDatetime.split('T');
        const [year, month, day] = datePart.split('-');
        const [hour, minute] = timePart.split(':');
        
        const dateStr = `${year}-${month}-${day}T${hour}:${minute}:00`;
        const date = new Date(dateStr);
        
        return formatTimeForTimezone(date, 'America/New_York', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }) || '--';
    }

    // Update timezone displays for form fields
    function updateTimezoneDisplays() {
        const dueDate = document.getElementById('dueDate');
        const cleanTime = document.getElementById('cleanTime');
        
        if (dueDate && dueDate.value) {
            const localEl = document.getElementById('dueDateLocal');
            const easternEl = document.getElementById('dueDateEastern');
            if (localEl) localEl.textContent = localDatetimeToLocal(dueDate.value);
            if (easternEl) easternEl.textContent = localDatetimeToEastern(dueDate.value);
        } else {
            const localEl = document.getElementById('dueDateLocal');
            const easternEl = document.getElementById('dueDateEastern');
            if (localEl) localEl.textContent = '--';
            if (easternEl) easternEl.textContent = '--';
        }
        
        if (cleanTime && cleanTime.value) {
            const localEl = document.getElementById('cleanTimeLocal');
            const easternEl = document.getElementById('cleanTimeEastern');
            if (localEl) localEl.textContent = localDatetimeToLocal(cleanTime.value);
            if (easternEl) easternEl.textContent = localDatetimeToEastern(cleanTime.value);
        } else {
            const localEl = document.getElementById('cleanTimeLocal');
            const easternEl = document.getElementById('cleanTimeEastern');
            if (localEl) localEl.textContent = '--';
            if (easternEl) easternEl.textContent = '--';
        }
    }

    // Set rent out to current Brisbane time + 7 days
    function setRentOutNow() {
        const now = new Date();
        const brisbaneNow = new Date(now.toLocaleString('en-US', { timeZone: 'Australia/Brisbane' }));
        brisbaneNow.setDate(brisbaneNow.getDate() + 7);
        const dueDateEl = document.getElementById('dueDate');
        if (dueDateEl) {
            dueDateEl.value = brisbaneToLocalDatetime(brisbaneNow);
            updateTimezoneDisplays();
        }
    }

    // Add 7 days to manually entered due date
    function addSevenDays() {
        const dueDateInput = document.getElementById('dueDate');
        if (!dueDateInput || !dueDateInput.value) {
            alert('Please enter a due date first');
            return;
        }
        const [datePart, timePart] = dueDateInput.value.split('T');
        const [year, month, day] = datePart.split('-');
        const [hour, minute] = timePart.split(':');
        
        const date = new Date(year, month - 1, day, hour, minute);
        date.setDate(date.getDate() + 7);
        
        const newDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const newTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        dueDateInput.value = `${newDate}T${newTime}`;
        updateTimezoneDisplays();
    }

    // Set clean time to current local time + 4 hours
    function setCleanNow() {
        const now = new Date();
        const futureDate = new Date(now);
        futureDate.setHours(futureDate.getHours() + 4);
        
        const year = futureDate.getFullYear();
        const month = String(futureDate.getMonth() + 1).padStart(2, '0');
        const day = String(futureDate.getDate()).padStart(2, '0');
        const hours = String(futureDate.getHours()).padStart(2, '0');
        const minutes = String(futureDate.getMinutes()).padStart(2, '0');
        const cleanTimeEl = document.getElementById('cleanTime');
        if (cleanTimeEl) {
            cleanTimeEl.value = `${year}-${month}-${day}T${hours}:${minutes}`;
            updateTimezoneDisplays();
        }
    }

    // Update navbar times
    function updateTimes() {
        const now = new Date();
        
        const localTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        const localElement = document.getElementById('local-time');
        if (localElement) {
            localElement.textContent = localTime;
        }
        
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
        
        const currentDate = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const currentDateElement = document.getElementById('current-date');
        if (currentDateElement) {
            currentDateElement.textContent = currentDate;
        }
    }

    // Parse formatted number (remove commas)
    function parseFormattedNumber(value) {
        if (!value) return null;
        const cleaned = value.toString().replace(/,/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
    }

    // Format number with commas (for display)
    function formatNumber(value) {
        if (!value && value !== 0) return '0';
        const num = parseFloat(value);
        if (isNaN(num)) return '0';
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Convert datetime-local input to MySQL DATETIME format
    function formatDateTimeForMySQL(datetimeLocalValue) {
        if (!datetimeLocalValue) return null;
        
        const [datePart, timePart] = datetimeLocalValue.split('T');
        if (!datePart || !timePart) return null;
        
        const timeWithSeconds = timePart.includes(':') && timePart.split(':').length === 2 
            ? timePart + ':00' 
            : timePart;
        
        return `${datePart} ${timeWithSeconds}`;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Check for actions needed on apartments
    function checkActionsNeeded() {
        const now = new Date();
        const actions = [];
        
        apartments.forEach(apt => {
            if (apt.due_date) {
                const dueDate = new Date(apt.due_date);
                const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
                
                if (hoursUntilDue < 0) {
                    const daysPastDue = Math.floor(Math.abs(hoursUntilDue) / 24);
                    actions.push({
                        type: 'rent-due',
                        severity: 'danger',
                        message: `🏠 <strong>${escapeHtml(apt.apartment_name || apt.location || 'Apartment')}</strong> rent is <strong>${daysPastDue} day${daysPastDue !== 1 ? 's' : ''} overdue</strong>`,
                        apartmentId: apt.id
                    });
                } else if (hoursUntilDue <= 24) {
                    const hours = Math.floor(hoursUntilDue);
                    actions.push({
                        type: 'rent-due',
                        severity: 'warning',
                        message: `🏠 <strong>${escapeHtml(apt.apartment_name || apt.location || 'Apartment')}</strong> rent is due in <strong>${hours} hour${hours !== 1 ? 's' : ''}</strong>`,
                        apartmentId: apt.id
                    });
                } else if (hoursUntilDue <= 48) {
                    const days = Math.floor(hoursUntilDue / 24);
                    actions.push({
                        type: 'rent-due',
                        severity: 'info',
                        message: `🏠 <strong>${escapeHtml(apt.apartment_name || apt.location || 'Apartment')}</strong> rent is due in <strong>${days} day${days !== 1 ? 's' : ''}</strong>`,
                        apartmentId: apt.id
                    });
                }
            }
            
            if (apt.clean_time) {
                const cleanTime = new Date(apt.clean_time);
                const hoursUntilClean = (cleanTime - now) / (1000 * 60 * 60);
                
                if (hoursUntilClean < 0) {
                    const hoursPastDue = Math.floor(Math.abs(hoursUntilClean));
                    actions.push({
                        type: 'clean-due',
                        severity: 'danger',
                        message: `🧹 <strong>${escapeHtml(apt.apartment_name || apt.location || 'Apartment')}</strong> cleaning is <strong>${hoursPastDue} hour${hoursPastDue !== 1 ? 's' : ''} overdue</strong>`,
                        apartmentId: apt.id
                    });
                } else if (hoursUntilClean <= 4) {
                    const hours = Math.floor(hoursUntilClean);
                    actions.push({
                        type: 'clean-due',
                        severity: 'warning',
                        message: `🧹 <strong>${escapeHtml(apt.apartment_name || apt.location || 'Apartment')}</strong> cleaning is due in <strong>${hours} hour${hours !== 1 ? 's' : ''}</strong>`,
                        apartmentId: apt.id
                    });
                }
            }
        });
        
        const alertContainer = document.getElementById('actionsNeededAlert');
        const alertContent = document.getElementById('actionsNeededContent');
        
        if (!alertContainer || !alertContent) return;
        
        if (actions.length > 0) {
            const dangerActions = actions.filter(a => a.severity === 'danger');
            const warningActions = actions.filter(a => a.severity === 'warning');
            const infoActions = actions.filter(a => a.severity === 'info');
            
            let html = '';
            
            if (dangerActions.length > 0) {
                html += '<div class="mb-2"><strong class="text-danger">🔴 Urgent:</strong><ul class="mb-0 mt-1">';
                dangerActions.forEach(action => {
                    html += `<li>${action.message}</li>`;
                });
                html += '</ul></div>';
            }
            
            if (warningActions.length > 0) {
                html += '<div class="mb-2"><strong class="text-warning">🟡 Important:</strong><ul class="mb-0 mt-1">';
                warningActions.forEach(action => {
                    html += `<li>${action.message}</li>`;
                });
                html += '</ul></div>';
            }
            
            if (infoActions.length > 0) {
                html += '<div class="mb-2"><strong class="text-info">ℹ️ Upcoming:</strong><ul class="mb-0 mt-1">';
                infoActions.forEach(action => {
                    html += `<li>${action.message}</li>`;
                });
                html += '</ul></div>';
            }
            
            alertContent.innerHTML = html;
            alertContainer.style.display = 'block';
            
            alertContainer.className = 'alert alert-dismissible fade show';
            if (dangerActions.length > 0) {
                alertContainer.classList.add('alert-danger');
            } else if (warningActions.length > 0) {
                alertContainer.classList.add('alert-warning');
            } else {
                alertContainer.classList.add('alert-info');
            }
        } else {
            alertContainer.style.display = 'none';
        }
    }

    // Export functions and variables to global scope
    window.apartments = apartments;
    window.hiddenApartments = hiddenApartments;
    window.lockedApartments = lockedApartments;
    window.APARTMENTS_STORAGE_KEY = APARTMENTS_STORAGE_KEY;
    window.APARTMENTS_VERSION = APARTMENTS_VERSION;
    window.initializeApartmentsData = initializeApartmentsData;
    window.saveApartmentsToLocalStorage = saveApartmentsToLocalStorage;
    window.getApartmentById = getApartmentById;
    window.getApartmentReviews = getApartmentReviews;
    window.calculateApartmentRating = calculateApartmentRating;
    window.getApartmentRatingBreakdown = getApartmentRatingBreakdown;
    window.calculateOverallRating = calculateOverallRating;
    window.formatDateDDMMMYYYY = formatDateDDMMMYYYY;
    window.formatDateDDMMMYYYYWithTime = formatDateDDMMMYYYYWithTime;
    window.formatLocalDateDDMMMYYYYWithTime = formatLocalDateDDMMMYYYYWithTime;
    window.formatTimeForTimezone = formatTimeForTimezone;
    window.getEasternTimeZone = getEasternTimeZone;
    window.brisbaneToLocalDatetime = brisbaneToLocalDatetime;
    window.localDatetimeToBrisbane = localDatetimeToBrisbane;
    window.localDatetimeToLocal = localDatetimeToLocal;
    window.localDatetimeToEastern = localDatetimeToEastern;
    window.updateTimezoneDisplays = updateTimezoneDisplays;
    window.setRentOutNow = setRentOutNow;
    window.addSevenDays = addSevenDays;
    window.setCleanNow = setCleanNow;
    window.updateTimes = updateTimes;
    window.parseFormattedNumber = parseFormattedNumber;
    window.formatNumber = formatNumber;
    window.formatDateTimeForMySQL = formatDateTimeForMySQL;
    window.escapeHtml = escapeHtml;
    window.checkActionsNeeded = checkActionsNeeded;
    window.apartmentDebugManager = debugManager;

})();
