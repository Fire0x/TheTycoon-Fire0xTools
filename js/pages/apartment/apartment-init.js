/**
 * Apartment Init Module
 * Contains initialization logic and event listeners
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.apartmentDebugManager === 'undefined') {
        console.error('apartment-core.js must be loaded before apartment-init.js');
        return;
    }

    const debugManager = window.apartmentDebugManager;
    const initializeApartmentsData = window.initializeApartmentsData;
    const updateTimes = window.updateTimes;
    const checkActionsNeeded = window.checkActionsNeeded;
    const updateTimezoneDisplays = window.updateTimezoneDisplays;
    const hiddenApartments = window.hiddenApartments;
    const lockedApartments = window.lockedApartments;

    // Initialize "How to Use" collapse toggle
    function initHowToUseCollapse() {
        const HOW_TO_USE_STORAGE_KEY = 'apartmentHowToUseExpanded';
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

    // Fix modal accessibility issues
    function initModalAccessibility() {
        const modals = ['exportModal', 'importModal', 'importTimersModal', 'importReviewsModal', 'importAllModal', 'apartmentModal', 'reviewsModal'];
        modals.forEach(modalId => {
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                modalElement.addEventListener('hidden.bs.modal', function() {
                    const closeButton = this.querySelector('.btn-close');
                    if (closeButton && document.activeElement === closeButton) {
                        closeButton.blur();
                    }
                });
            }
        });
    }

    // Initialize table visibility state
    function initTableVisibility() {
        const tableVisible = localStorage.getItem('apartmentsTableVisible') !== 'false';
        const tableContainer = document.getElementById('apartmentsTableContainer');
        const toggleBtn = document.getElementById('toggleTableBtn');
        if (tableContainer && toggleBtn) {
            setTimeout(() => {
                const currentDisplay = tableContainer.style.display;
                if (currentDisplay === 'none' || !tableVisible) {
                    tableContainer.style.display = 'none';
                    toggleBtn.textContent = '👁️ Show Table';
                    toggleBtn.title = 'Show table';
                } else {
                    toggleBtn.textContent = '🙈 Hide Table';
                    toggleBtn.title = 'Hide table';
                }
            }, 100);
        }
    }

    // Initialize apartment modal handlers
    function initApartmentModal() {
        const apartmentModal = document.getElementById('apartmentModal');
        if (apartmentModal) {
            apartmentModal.addEventListener('hide.bs.modal', function() {
                const focusedElement = apartmentModal.querySelector(':focus');
                if (focusedElement && typeof focusedElement.blur === 'function') {
                    focusedElement.blur();
                }
            });
            
            apartmentModal.addEventListener('hidden.bs.modal', function() {
                const selector = document.getElementById('apartmentSelector');
                if (selector && selector.value !== '') {
                    selector.value = '';
                    debugManager.log('Apartment selector reset after modal close');
                }
                const saveBtn = document.getElementById('saveApartmentBtn');
                if (saveBtn) {
                    saveBtn.style.display = 'none';
                }
                
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.remove();
                }
                
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            });
        }
    }

    // Initialize reviews modal handlers
    function initReviewsModal() {
        const reviewsModal = document.getElementById('reviewsModal');
        if (reviewsModal) {
            reviewsModal.addEventListener('hide.bs.modal', function() {
                const focusedElement = reviewsModal.querySelector(':focus');
                if (focusedElement && typeof focusedElement.blur === 'function') {
                    focusedElement.blur();
                }
            });
            
            reviewsModal.addEventListener('hidden.bs.modal', function() {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.remove();
                }
                
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            });
        }
    }

    // Initialize tab switching
    function initTabSwitching() {
        const reviewsTab = document.getElementById('reviews-tab');
        const overviewTab = document.getElementById('overview-tab');
        
        if (reviewsTab) {
            reviewsTab.addEventListener('shown.bs.tab', function() {
                if (typeof window.loadAllReviews === 'function') {
                    window.loadAllReviews();
                }
            });
        }
        
        if (overviewTab) {
            overviewTab.addEventListener('shown.bs.tab', function() {
                if (typeof window.loadOverview === 'function') {
                    window.loadOverview();
                }
            });
        }
    }

    // Initialize timezone display listeners
    function initTimezoneDisplays() {
        const dueDateEl = document.getElementById('dueDate');
        const cleanTimeEl = document.getElementById('cleanTime');
        
        if (dueDateEl) {
            dueDateEl.addEventListener('change', updateTimezoneDisplays);
            dueDateEl.addEventListener('input', updateTimezoneDisplays);
        }
        
        if (cleanTimeEl) {
            cleanTimeEl.addEventListener('change', updateTimezoneDisplays);
            cleanTimeEl.addEventListener('input', updateTimezoneDisplays);
        }
    }

    // Handle Enter key in rent price input
    function initRentPriceEnterKey() {
        document.addEventListener('keydown', function(e) {
            if (e.target.classList.contains('rent-price-input') && e.key === 'Enter') {
                const apartmentId = parseInt(e.target.id.replace('rent-price-input-', ''));
                if (apartmentId && typeof window.saveRentPrice === 'function') {
                    window.saveRentPrice(apartmentId);
                }
            }
        });
    }

    // Main initialization function
    function initializePage() {
        debugManager.log('Page loaded, initializing...');
        
        // Initialize apartments from localStorage
        initializeApartmentsData();
        
        // Load hidden and locked apartments from localStorage
        window.hiddenApartments = JSON.parse(localStorage.getItem('hiddenApartments') || '[]');
        window.lockedApartments = JSON.parse(localStorage.getItem('lockedApartments') || '[]');
        
        // Initialize UI components
        initHowToUseCollapse();
        initModalAccessibility();
        initTableVisibility();
        initApartmentModal();
        initReviewsModal();
        initTabSwitching();
        initTimezoneDisplays();
        initRentPriceEnterKey();
        
        // Update times
        updateTimes();
        setInterval(updateTimes, 1000);
        
        // Load data
        if (typeof window.loadApartments === 'function') {
            window.loadApartments();
        }
        if (typeof window.loadAllApartments === 'function') {
            window.loadAllApartments();
        }
        if (typeof window.loadAllApartmentsForSelector === 'function') {
            window.loadAllApartmentsForSelector();
        }
        if (typeof window.initStarRatings === 'function') {
            window.initStarRatings();
        }
        if (typeof window.loadOverallRating === 'function') {
            window.loadOverallRating();
        }
        
        // Check for actions needed periodically (every 5 minutes)
        setInterval(checkActionsNeeded, 5 * 60 * 1000);
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initializePage);
    } else {
        initializePage();
    }
    
    // Initialize number formatting
    if (typeof window.NumberFormatter !== 'undefined' && typeof window.NumberFormatter.initNumberFormatting === 'function') {
        window.NumberFormatter.initNumberFormatting({ allowDecimals: true, selector: '.money-input, .rent-price-input' });
    }

})();
