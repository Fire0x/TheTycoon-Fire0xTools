/**
 * Apartment Modals Module
 * Contains modal management, CRUD operations, and export/import functions
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.apartmentDebugManager === 'undefined') {
        console.error('apartment-core.js must be loaded before apartment-modals.js');
        return;
    }

    const debugManager = window.apartmentDebugManager;
    // Always reference window.apartments directly to get the latest data
    // Don't capture as const since we need to modify it and get fresh data
    const getApartments = () => window.apartments || [];
    const getApartmentById = window.getApartmentById;
    const getApartmentReviews = window.getApartmentReviews;
    const getApartmentRatingBreakdown = window.getApartmentRatingBreakdown;
    const calculateApartmentRating = window.calculateApartmentRating;
    const saveApartmentsToLocalStorage = window.saveApartmentsToLocalStorage;
    const escapeHtml = window.escapeHtml;
    const formatStars = window.formatStars;
    const formatDateDDMMMYYYYWithTime = window.formatDateDDMMMYYYYWithTime;
    const getEasternTimeZone = window.getEasternTimeZone;
    const brisbaneToLocalDatetime = window.brisbaneToLocalDatetime;
    const updateTimezoneDisplays = window.updateTimezoneDisplays;
    const formatDateTimeForMySQL = window.formatDateTimeForMySQL;
    const parseFormattedNumber = window.parseFormattedNumber;
    const loadApartmentRating = window.loadApartmentRating;

    // Helper function to get or create modal instance
    function getOrCreateModal(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return null;
        return bootstrap.Modal.getOrCreateInstance(element);
    }

    // Open add modal
    function openAddModal() {
        const titleEl = document.getElementById('apartmentModalTitle');
        const formEl = document.getElementById('apartmentForm');
        const apartmentIdEl = document.getElementById('apartmentId');
        const ownedNumberEl = document.getElementById('ownedNumber');
        
        if (titleEl) titleEl.textContent = 'Add Apartment';
        if (formEl) formEl.reset();
        if (apartmentIdEl) apartmentIdEl.value = '';
        if (ownedNumberEl) ownedNumberEl.value = '';
        updateTimezoneDisplays();
    }

    // Edit apartment
    async function editApartment(id) {
        const apartments = getApartments();
        const apartment = apartments.find(apt => apt.id === id);
        if (!apartment) return;
        
        const titleEl = document.getElementById('apartmentModalTitle');
        const apartmentIdEl = document.getElementById('apartmentId');
        const locationEl = document.getElementById('location');
        const apartmentNameEl = document.getElementById('apartmentName');
        const apartmentNoEl = document.getElementById('apartmentNo');
        const ownedNumberEl = document.getElementById('ownedNumber');
        const postalEl = document.getElementById('postal');
        const apartmentClassEl = document.getElementById('apartmentClass');
        
        if (titleEl) titleEl.textContent = 'Edit Apartment';
        if (apartmentIdEl) apartmentIdEl.value = apartment.id;
        if (locationEl) locationEl.value = apartment.location || '';
        if (apartmentNameEl) apartmentNameEl.value = apartment.apartment_name || '';
        if (apartmentNoEl) apartmentNoEl.value = apartment.apartment_no || '';
        if (ownedNumberEl) ownedNumberEl.value = apartment.owned_number || '';
        if (postalEl) postalEl.value = apartment.postal || '';
        if (apartmentClassEl) apartmentClassEl.value = apartment.apartment_class || '';
        
        const apartmentDescriptionEl = document.getElementById('apartmentDescription');
        const purchasedPriceEl = document.getElementById('purchasedPrice');
        const rentingOutPriceEl = document.getElementById('rentingOutPrice');
        
        if (apartmentDescriptionEl) apartmentDescriptionEl.value = apartment.apartment_description || '';
        if (purchasedPriceEl) purchasedPriceEl.value = apartment.purchased_price || '';
        if (rentingOutPriceEl) rentingOutPriceEl.value = apartment.renting_out_price || '';
        
        const dueDateEl = document.getElementById('dueDate');
        const cleanTimeEl = document.getElementById('cleanTime');
        
        if (dueDateEl) {
            if (apartment.due_date) {
                dueDateEl.value = brisbaneToLocalDatetime(apartment.due_date);
            } else {
                dueDateEl.value = '';
            }
        }
        
        if (cleanTimeEl) {
            if (apartment.clean_time) {
                cleanTimeEl.value = brisbaneToLocalDatetime(apartment.clean_time);
            } else {
                cleanTimeEl.value = '';
            }
        }
        
        updateTimezoneDisplays();
        
        const modal = new bootstrap.Modal(document.getElementById('apartmentModal'));
        modal.show();
    }

    // Save apartment
    function saveApartment() {
        try {
            const form = document.getElementById('apartmentForm');
            if (!form) {
                alert('Form not found');
                return;
            }
            
            if (!form.checkValidity()) {
                form.reportValidity();
                debugManager.log('Form validation failed');
                return;
            }
            
            const ownedNumberEl = document.getElementById('ownedNumber');
            const ownedNumberInput = ownedNumberEl ? ownedNumberEl.value.trim() : '';
            const ownedNumber = ownedNumberInput ? parseInt(ownedNumberInput) : null;
            
            const locationEl = document.getElementById('location');
            const apartmentNameEl = document.getElementById('apartmentName');
            const apartmentNoEl = document.getElementById('apartmentNo');
            const postalEl = document.getElementById('postal');
            const apartmentClassEl = document.getElementById('apartmentClass');
            const apartmentDescriptionEl = document.getElementById('apartmentDescription');
            const purchasedPriceEl = document.getElementById('purchasedPrice');
            const rentingOutPriceEl = document.getElementById('rentingOutPrice');
            const dueDateEl = document.getElementById('dueDate');
            const cleanTimeEl = document.getElementById('cleanTime');
            
            let dueDateValue = dueDateEl && dueDateEl.value ? formatDateTimeForMySQL(dueDateEl.value) : null;
            let cleanTimeValue = cleanTimeEl && cleanTimeEl.value ? formatDateTimeForMySQL(cleanTimeEl.value) : null;
            
            const now = new Date();
            
            if (dueDateValue && cleanTimeValue) {
                const dueDate = new Date(dueDateValue);
                const cleanTime = new Date(cleanTimeValue);
                const timeDiff = Math.abs(dueDate.getTime() - cleanTime.getTime());
                if (timeDiff < 60000) {
                    alert('Error: Cleaning time and due date cannot be the same time. Please adjust one of them.');
                    debugManager.log('Validation failed: cleaning time and due date are the same');
                    return;
                }
            }
            
            if (dueDateValue) {
                const dueDate = new Date(dueDateValue);
                if (cleanTimeValue) {
                    const cleanTime = new Date(cleanTimeValue);
                    if (cleanTime < now) {
                        cleanTimeValue = null;
                        if (cleanTimeEl) {
                            cleanTimeEl.value = '';
                            debugManager.log('Cleared expired clean time because new rent date was set');
                            updateTimezoneDisplays();
                        }
                    }
                }
            }
            
            if (cleanTimeValue) {
                const cleanTime = new Date(cleanTimeValue);
                if (dueDateValue) {
                    const dueDate = new Date(dueDateValue);
                    if (dueDate < now) {
                        dueDateValue = null;
                        if (dueDateEl) {
                            dueDateEl.value = '';
                            debugManager.log('Cleared expired rent date because clean time was set');
                            updateTimezoneDisplays();
                        }
                    }
                }
            }
            
            const apartmentData = {
                location: locationEl ? locationEl.value.trim() : '',
                apartment_name: apartmentNameEl ? apartmentNameEl.value.trim() : '',
                apartment_no: apartmentNoEl ? apartmentNoEl.value.trim() : '',
                owned_number: ownedNumber,
                postal: postalEl ? postalEl.value.trim() || null : null,
                apartment_class: apartmentClassEl ? apartmentClassEl.value.trim() || null : null,
                apartment_description: apartmentDescriptionEl ? apartmentDescriptionEl.value.trim() || null : null,
                purchased_price: purchasedPriceEl ? parseFormattedNumber(purchasedPriceEl.value) || null : null,
                renting_out_price: rentingOutPriceEl ? parseFormattedNumber(rentingOutPriceEl.value) || null : null,
                due_date: dueDateValue,
                clean_time: cleanTimeValue
            };
            
            debugManager.log('Saving apartment with data:', apartmentData);
            
            const id = document.getElementById('apartmentId').value;
            let savedApartment;
            
            const apartments = getApartments();
            if (id) {
                debugManager.log('Updating apartment ID:', id);
                const apartmentIndex = apartments.findIndex(apt => apt.id === parseInt(id));
                if (apartmentIndex === -1) {
                    alert('Apartment not found');
                    return;
                }
                
                const existingReviews = apartments[apartmentIndex].reviews || [];
                apartments[apartmentIndex] = { ...apartments[apartmentIndex], ...apartmentData };
                apartments[apartmentIndex].reviews = existingReviews;
                savedApartment = apartments[apartmentIndex];
                // Update window.apartments to reflect changes
                window.apartments = apartments;
            } else {
                debugManager.log('Creating new apartment');
                const newId = apartments.length > 0 ? Math.max(...apartments.map(apt => apt.id || 0)) + 1 : 1;
                
                let finalOwnedNumber = ownedNumber;
                if (finalOwnedNumber === null || finalOwnedNumber === undefined) {
                    const ownedNumbers = apartments
                        .filter(apt => apt.owned_number !== null && apt.owned_number !== undefined)
                        .map(apt => apt.owned_number);
                    const maxOwnedNumber = ownedNumbers.length > 0 ? Math.max(...ownedNumbers) : 0;
                    finalOwnedNumber = maxOwnedNumber + 1;
                    debugManager.log('Auto-assigned owned_number:', finalOwnedNumber);
                }
                
                savedApartment = {
                    id: newId,
                    ...apartmentData,
                    owned_number: finalOwnedNumber,
                    reviews: []
                };
                apartments.push(savedApartment);
                // Update window.apartments to reflect changes
                window.apartments = apartments;
            }
            
            saveApartmentsToLocalStorage();
            debugManager.log('Apartment saved successfully:', savedApartment);
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('apartmentModal'));
            if (modal) {
                modal.hide();
            }
            
            setTimeout(() => {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.remove();
                }
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            }, 100);
            
            requestAnimationFrame(() => {
                if (typeof window.loadApartments === 'function') {
                    window.loadApartments();
                }
                if (typeof window.loadAllApartments === 'function') {
                    window.loadAllApartments();
                }
                if (typeof window.loadAllApartmentsForSelector === 'function') {
                    window.loadAllApartmentsForSelector();
                }
                
                setTimeout(() => {
                    const overviewTab = document.getElementById('overview-tab');
                    if (overviewTab && overviewTab.classList.contains('active')) {
                        if (typeof window.loadOverview === 'function') {
                            window.loadOverview();
                        }
                    }
                }, 50);
            });
            
            const selector = document.getElementById('apartmentSelector');
            if (selector) selector.value = '';
            const saveBtn = document.getElementById('saveApartmentBtn');
            if (saveBtn) saveBtn.style.display = 'none';
        } catch (error) {
            console.error('Error saving apartment:', error);
            alert('An error occurred while saving the apartment. Please try again.\n\nError: ' + error.message);
            debugManager.log('Save apartment error:', error);
        }
    }

    // Delete apartment
    function deleteApartment(id) {
        if (!confirm('Are you sure you want to delete this apartment?')) {
            return;
        }
        
        const apartments = getApartments();
        const apartmentIndex = apartments.findIndex(apt => apt.id === id);
        if (apartmentIndex === -1) {
            alert('Apartment not found');
            return;
        }
        
        apartments.splice(apartmentIndex, 1);
        // Update window.apartments to reflect changes
        window.apartments = apartments;
        saveApartmentsToLocalStorage();
        
        if (typeof window.loadApartments === 'function') {
            window.loadApartments();
        }
        if (typeof window.loadAllApartments === 'function') {
            window.loadAllApartments();
        }
        if (typeof window.loadAllApartmentsForSelector === 'function') {
            window.loadAllApartmentsForSelector();
        }
        const overviewTab = document.getElementById('overview-tab');
        if (overviewTab && overviewTab.classList.contains('active')) {
            if (typeof window.loadOverview === 'function') {
                window.loadOverview();
            }
        }
    }

    // Load apartment data when selected
    function loadApartmentData() {
        const selector = document.getElementById('apartmentSelector');
        if (!selector) return;
        
        const apartmentId = selector.value;
        if (!apartmentId || apartmentId === 'new') {
            if (apartmentId === 'new') {
                openAddModal();
                const modal = new bootstrap.Modal(document.getElementById('apartmentModal'));
                modal.show();
            }
            const saveBtn = document.getElementById('saveApartmentBtn');
            if (saveBtn) saveBtn.style.display = 'none';
            return;
        }

        const apartment = getApartmentById(parseInt(apartmentId));
        if (!apartment) {
            alert('Apartment not found');
            selector.value = '';
            return;
        }
        
        editApartment(apartment.id);
        const saveBtn = document.getElementById('saveApartmentBtn');
        if (saveBtn) saveBtn.style.display = 'block';
    }

    // Save apartment from selector (wrapper for saveApartment)
    function saveApartmentFromSelector() {
        saveApartment();
        if (typeof window.loadAllApartmentsForSelector === 'function') {
            window.loadAllApartmentsForSelector();
        }
    }

    // View reviews for an apartment
    function viewReviews(apartmentId) {
        debugManager.log('Viewing reviews for apartment:', apartmentId);
        const apartment = getApartmentById(apartmentId);
        if (!apartment) {
            debugManager.log('ERROR: Apartment not found:', apartmentId);
            return;
        }
        
        const titleEl = document.getElementById('reviewsModalTitle');
        const apartmentIdEl = document.getElementById('reviewApartmentId');
        const formEl = document.getElementById('reviewForm');
        
        if (titleEl) {
            titleEl.textContent = `Reviews - ${apartment.apartment_name || apartment.apartment_no || 'Apartment'}`;
        }
        if (apartmentIdEl) apartmentIdEl.value = apartmentId;
        if (formEl) formEl.reset();
        
        const reviews = getApartmentReviews(apartmentId);
        const breakdown = getApartmentRatingBreakdown(apartmentId);
        const average = calculateApartmentRating(apartmentId);
        
        debugManager.log('Loaded reviews data:', { reviews: reviews.length, breakdown, average });
        
        if (typeof window.renderRatingOverview === 'function') {
            window.renderRatingOverview(breakdown, average);
        }
        if (typeof window.renderReviews === 'function') {
            window.renderReviews(reviews);
        }
        debugManager.log('Reviews modal rendered');
        
        const modal = new bootstrap.Modal(document.getElementById('reviewsModal'));
        modal.show();
    }

    // Render rating overview
    function renderRatingOverview(breakdown, average) {
        const container = document.getElementById('ratingOverviewContainer');
        if (!container) return;
        
        const totalReviews = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
        const avgRating = average.average_rating ? parseFloat(average.average_rating).toFixed(1) : '0.0';
        
        if (totalReviews === 0) {
            container.innerHTML = `
                <div class="rating-overview">
                    <div class="text-center text-muted">
                        <p class="mb-0">No reviews yet. Be the first to review!</p>
                    </div>
                </div>
            `;
            return;
        }
        
        const percentages = {};
        Object.keys(breakdown).forEach(rating => {
            percentages[rating] = totalReviews > 0 ? (breakdown[rating] / totalReviews * 100).toFixed(0) : 0;
        });
        
        let breakdownHtml = '';
        for (let i = 5; i >= 1; i--) {
            const count = breakdown[i] || 0;
            const percentage = percentages[i] || 0;
            const stars = formatStars(i);
            
            breakdownHtml += `
                <div class="rating-breakdown-item">
                    <div class="rating-breakdown-label">${stars}</div>
                    <div class="rating-breakdown-bar">
                        <div class="rating-breakdown-fill" style="width: ${percentage}%">
                            ${count > 0 ? count : ''}
                        </div>
                    </div>
                    <div class="rating-breakdown-count">${count}</div>
                </div>
            `;
        }
        
        container.innerHTML = `
            <div class="rating-overview">
                <div class="overview-stats">
                    <div class="stat-item">
                        <div class="stat-value">${avgRating}</div>
                        <div class="stat-label">Average Rating</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${totalReviews}</div>
                        <div class="stat-label">Total Reviews</div>
                    </div>
                </div>
                <h6 class="mb-3">Rating Distribution</h6>
                ${breakdownHtml}
            </div>
        `;
    }

    // Render reviews
    function renderReviews(reviews) {
        const container = document.getElementById('reviewsContainer');
        if (!container) return;
        
        if (reviews.length === 0) {
            container.innerHTML = '<p class="text-muted">No reviews yet. Be the first to review!</p>';
            return;
        }
        
        const apartmentIdEl = document.getElementById('reviewApartmentId');
        if (apartmentIdEl) {
            loadApartmentRating(parseInt(apartmentIdEl.value));
        }
        
        let html = '<h6>All Reviews</h6>';
        reviews.forEach(review => {
            const date = new Date(review.created_at);
            const dateStr = formatDateDDMMMYYYYWithTime(date);
            const easternDateStr = formatDateDDMMMYYYYWithTime(date, 'America/New_York');
            const easternTZ = getEasternTimeZone();
            const stars = formatStars(review.rating);
            
            html += `
                <div class="review-item" id="review-item-${review.id}">
                    <div class="review-display" id="review-display-${review.id}">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div class="flex-grow-1">
                                <div class="review-rating">${stars}</div>
                                <div class="review-date">
                                    ${dateStr}
                                    <span class="eastern-date">Eastern: ${easternDateStr} ${easternTZ}</span>
                                </div>
                            </div>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-primary" onclick="editReview(${review.id}, ${review.rating})" title="Edit review">
                                    <span style="font-size: 1rem;">✏️</span> Edit
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteReview(${review.id}, ${review.apartment_id})" title="Delete review">
                                    <span style="font-size: 1rem;">🗑️</span> Delete
                                </button>
                            </div>
                        </div>
                        ${review.comment ? `<p>${escapeHtml(review.comment)}</p>` : '<p class="text-muted"><em>No comment</em></p>'}
                    </div>
                    <div class="review-edit-form" id="review-edit-${review.id}" style="display: none;" data-original-rating="${review.rating}" data-original-comment="${escapeHtml(review.comment || '')}">
                        <div class="mb-2">
                            <label class="form-label small">Rating</label>
                            <div class="review-edit-stars star-rating" id="edit-star-rating-${review.id}">
                                <input type="radio" id="edit-star10-${review.id}" name="edit-rating-${review.id}" value="5">
                                <label for="edit-star10-${review.id}" class="star-label" data-rating="5">
                                    <span class="star-half-left" data-rating="4.5" onclick="selectEditHalfStar(${review.id}, 4.5)"></span>
                                    <span class="star-half-right" data-rating="5" onclick="selectEditHalfStar(${review.id}, 5)"></span>
                                    ★
                                </label>
                                <input type="radio" id="edit-star9-${review.id}" name="edit-rating-${review.id}" value="4.5">
                                <input type="radio" id="edit-star8-${review.id}" name="edit-rating-${review.id}" value="4">
                                <label for="edit-star8-${review.id}" class="star-label" data-rating="4">
                                    <span class="star-half-left" data-rating="3.5" onclick="selectEditHalfStar(${review.id}, 3.5)"></span>
                                    <span class="star-half-right" data-rating="4" onclick="selectEditHalfStar(${review.id}, 4)"></span>
                                    ★
                                </label>
                                <input type="radio" id="edit-star7-${review.id}" name="edit-rating-${review.id}" value="3.5">
                                <input type="radio" id="edit-star6-${review.id}" name="edit-rating-${review.id}" value="3">
                                <label for="edit-star6-${review.id}" class="star-label" data-rating="3">
                                    <span class="star-half-left" data-rating="2.5" onclick="selectEditHalfStar(${review.id}, 2.5)"></span>
                                    <span class="star-half-right" data-rating="3" onclick="selectEditHalfStar(${review.id}, 3)"></span>
                                    ★
                                </label>
                                <input type="radio" id="edit-star5-${review.id}" name="edit-rating-${review.id}" value="2.5">
                                <input type="radio" id="edit-star4-${review.id}" name="edit-rating-${review.id}" value="2">
                                <label for="edit-star4-${review.id}" class="star-label" data-rating="2">
                                    <span class="star-half-left" data-rating="1.5" onclick="selectEditHalfStar(${review.id}, 1.5)"></span>
                                    <span class="star-half-right" data-rating="2" onclick="selectEditHalfStar(${review.id}, 2)"></span>
                                    ★
                                </label>
                                <input type="radio" id="edit-star3-${review.id}" name="edit-rating-${review.id}" value="1.5">
                                <input type="radio" id="edit-star2-${review.id}" name="edit-rating-${review.id}" value="1">
                                <label for="edit-star2-${review.id}" class="star-label" data-rating="1">
                                    <span class="star-half-left" data-rating="0.5" onclick="selectEditHalfStar(${review.id}, 0.5)"></span>
                                    <span class="star-half-right" data-rating="1" onclick="selectEditHalfStar(${review.id}, 1)"></span>
                                    ★
                                </label>
                                <input type="hidden" id="edit-selected-rating-${review.id}" value="">
                            </div>
                            <small class="form-text text-muted">Click a star to rate (0.5-5 stars, click left half for half-star)</small>
                        </div>
                        <div class="mb-2">
                            <label class="form-label small">Comment</label>
                            <textarea class="form-control form-control-sm" id="edit-comment-${review.id}" rows="3" placeholder="Share your thoughts...">${escapeHtml(review.comment || '')}</textarea>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-success" onclick="saveReviewEdit(${review.id}, ${review.apartment_id})">Save</button>
                            <button class="btn btn-sm btn-secondary" onclick="cancelReviewEdit(${review.id})">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    // Save review
    function saveReview() {
        const apartmentIdEl = document.getElementById('reviewApartmentId');
        if (!apartmentIdEl) {
            alert('Please select an apartment');
            return;
        }
        
        const apartmentId = parseInt(apartmentIdEl.value);
        if (!apartmentId) {
            alert('Please select an apartment');
            return;
        }
        
        const selectedRatingInput = document.getElementById('selectedRating');
        let rating = 0;
        if (selectedRatingInput && selectedRatingInput.value) {
            rating = parseFloat(selectedRatingInput.value);
        } else {
            const checkedRadio = document.querySelector('input[name="rating"]:checked');
            if (checkedRadio) {
                rating = parseFloat(checkedRadio.value);
            }
        }
        
        if (rating === 0 || isNaN(rating)) {
            alert('Please select a rating');
            return;
        }
        
        const commentEl = document.getElementById('reviewComment');
        const comment = commentEl ? commentEl.value.trim() || null : null;
        
        debugManager.log('Saving review:', { apartmentId, rating, comment });
        
        const apartment = getApartmentById(apartmentId);
        if (!apartment) {
            alert('Apartment not found');
            return;
        }
        
        if (!apartment.reviews) {
            apartment.reviews = [];
        }
        
        const newReview = {
            id: Date.now(),
            apartment_id: apartmentId,
            rating: rating,
            comment: comment,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        apartment.reviews.push(newReview);
        saveApartmentsToLocalStorage();
        
        debugManager.log('Review saved successfully:', newReview);
        
        viewReviews(apartmentId);
        
        requestAnimationFrame(() => {
            if (typeof window.loadApartments === 'function') {
                window.loadApartments();
            }
            if (typeof window.loadAllApartments === 'function') {
                window.loadAllApartments();
            }
            if (typeof window.loadOverallRating === 'function') {
                window.loadOverallRating();
            }
            
            setTimeout(() => {
                const reviewsTab = document.getElementById('reviews-tab');
                const overviewTab = document.getElementById('overview-tab');
                if (reviewsTab && reviewsTab.classList.contains('active')) {
                    if (typeof window.loadAllReviews === 'function') {
                        window.loadAllReviews();
                    }
                }
                if (overviewTab && overviewTab.classList.contains('active')) {
                    if (typeof window.loadOverview === 'function') {
                        window.loadOverview();
                    }
                }
            }, 50);
        });
    }

    // Delete review
    function deleteReview(reviewId, apartmentId) {
        if (!confirm('Are you sure you want to delete this review?')) {
            return;
        }
        
        const apartment = getApartmentById(apartmentId);
        if (!apartment || !apartment.reviews) {
            alert('Review not found');
            return;
        }
        
        apartment.reviews = apartment.reviews.filter(review => review.id !== reviewId);
        saveApartmentsToLocalStorage();
        
        viewReviews(apartmentId);
        
        requestAnimationFrame(() => {
            if (typeof window.loadApartments === 'function') {
                window.loadApartments();
            }
            if (typeof window.loadAllApartments === 'function') {
                window.loadAllApartments();
            }
            if (typeof window.loadOverallRating === 'function') {
                window.loadOverallRating();
            }
            
            setTimeout(() => {
                const reviewsTab = document.getElementById('reviews-tab');
                const overviewTab = document.getElementById('overview-tab');
                if (reviewsTab && reviewsTab.classList.contains('active')) {
                    if (typeof window.loadAllReviews === 'function') {
                        window.loadAllReviews();
                    }
                }
                if (overviewTab && overviewTab.classList.contains('active')) {
                    if (typeof window.loadOverview === 'function') {
                        window.loadOverview();
                    }
                }
            }, 50);
        });
    }

    // Edit review (show edit form)
    function editReview(reviewId, currentRating) {
        const displayDiv = document.getElementById(`review-display-${reviewId}`);
        const editDiv = document.getElementById(`review-edit-${reviewId}`);
        
        if (displayDiv && editDiv) {
            const numRating = parseFloat(currentRating);
            const ratingInput = document.querySelector(`input[name="edit-rating-${reviewId}"][value="${numRating}"]`);
            if (ratingInput) {
                ratingInput.checked = true;
            } else {
                const fullStarRating = Math.round(numRating);
                const fallbackInput = document.querySelector(`input[name="edit-rating-${reviewId}"][value="${fullStarRating}"]`);
                if (fallbackInput) {
                    fallbackInput.checked = true;
                }
            }
            
            const hiddenInput = document.getElementById(`edit-selected-rating-${reviewId}`);
            if (hiddenInput) {
                hiddenInput.value = numRating;
            }
            
            displayDiv.style.display = 'none';
            editDiv.style.display = 'block';
            
            if (typeof window.updateEditStarColors === 'function') {
                window.updateEditStarColors(reviewId);
            }
        }
    }

    // Cancel review edit
    function cancelReviewEdit(reviewId) {
        const displayDiv = document.getElementById(`review-display-${reviewId}`);
        const editDiv = document.getElementById(`review-edit-${reviewId}`);
        
        if (displayDiv && editDiv) {
            const originalRating = parseInt(editDiv.getAttribute('data-original-rating')) || 1;
            const originalComment = editDiv.getAttribute('data-original-comment') || '';
            
            const ratingInput = document.getElementById(`edit-star${originalRating}-${reviewId}`);
            if (ratingInput) {
                ratingInput.checked = true;
            }
            
            const commentTextarea = document.getElementById(`edit-comment-${reviewId}`);
            if (commentTextarea) {
                commentTextarea.value = originalComment;
            }
            
            displayDiv.style.display = 'block';
            editDiv.style.display = 'none';
        }
    }

    // Save review edit
    function saveReviewEdit(reviewId, apartmentId) {
        debugManager.log('Saving review edit:', { reviewId, apartmentId });
        const selectedRatingInput = document.getElementById(`edit-selected-rating-${reviewId}`);
        let rating = 0;
        if (selectedRatingInput && selectedRatingInput.value) {
            rating = parseFloat(selectedRatingInput.value);
        } else {
            const ratingInput = document.querySelector(`input[name="edit-rating-${reviewId}"]:checked`);
            if (ratingInput) {
                rating = parseFloat(ratingInput.value);
            }
        }
        
        if (rating === 0) {
            debugManager.log('ERROR: No rating selected');
            alert('Please select a rating');
            return;
        }
        
        const commentTextarea = document.getElementById(`edit-comment-${reviewId}`);
        const comment = commentTextarea ? commentTextarea.value.trim() || null : null;
        
        debugManager.log('Review edit data:', { rating, comment });
        
        const apartment = getApartmentById(apartmentId);
        if (!apartment || !apartment.reviews) {
            alert('Review not found');
            return;
        }
        
        const reviewIndex = apartment.reviews.findIndex(review => review.id === reviewId);
        if (reviewIndex === -1) {
            alert('Review not found');
            return;
        }
        
        apartment.reviews[reviewIndex].rating = rating;
        apartment.reviews[reviewIndex].comment = comment;
        apartment.reviews[reviewIndex].updated_at = new Date().toISOString();
        saveApartmentsToLocalStorage();
        
        debugManager.log('Review updated successfully:', apartment.reviews[reviewIndex]);
        
        viewReviews(apartmentId);
        
        requestAnimationFrame(() => {
            if (typeof window.loadApartments === 'function') {
                window.loadApartments();
            }
            if (typeof window.loadAllApartments === 'function') {
                window.loadAllApartments();
            }
            if (typeof window.loadOverallRating === 'function') {
                window.loadOverallRating();
            }
            
            setTimeout(() => {
                const reviewsTab = document.getElementById('reviews-tab');
                const overviewTab = document.getElementById('overview-tab');
                if (reviewsTab && reviewsTab.classList.contains('active')) {
                    if (typeof window.loadAllReviews === 'function') {
                        window.loadAllReviews();
                    }
                }
                if (overviewTab && overviewTab.classList.contains('active')) {
                    if (typeof window.loadOverview === 'function') {
                        window.loadOverview();
                    }
                }
            }, 50);
        });
    }

    // Export all apartments
    function exportApartments() {
        const exportData = {
            apartments: apartments,
            export_date: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const exportJson = JSON.stringify(exportData, null, 2);
        const textarea = document.getElementById('exportTextarea');
        const label = document.getElementById('exportModalLabel');
        if (textarea) textarea.value = exportJson;
        if (label) label.textContent = 'Export Apartments';
        const modal = getOrCreateModal('exportModal');
        if (modal) {
            modal.show();
        }
    }

    // Export timers only
    function exportTimers() {
        const apartments = getApartments();
        const timers = apartments.map(apt => ({
            apartment_id: apt.id,
            apartment_name: apt.apartment_name || apt.location || 'Unnamed',
            owned_number: apt.owned_number,
            due_date: apt.due_date,
            clean_time: apt.clean_time
        })).filter(timer => timer.due_date || timer.clean_time);
        
        const exportData = {
            timers: timers,
            export_date: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const exportJson = JSON.stringify(exportData, null, 2);
        const textarea = document.getElementById('exportTextarea');
        const label = document.getElementById('exportModalLabel');
        if (textarea) textarea.value = exportJson;
        if (label) label.textContent = 'Export Timers';
        const modal = getOrCreateModal('exportModal');
        if (modal) {
            modal.show();
        }
    }

    // Export reviews only
    function exportReviews() {
        const apartments = getApartments();
        const allReviews = [];
        apartments.forEach(apt => {
            const reviews = apt.reviews || [];
            reviews.forEach(review => {
                allReviews.push({
                    id: review.id,
                    apartment_id: review.apartment_id || apt.id,
                    rating: review.rating,
                    comment: review.comment,
                    created_at: review.created_at,
                    updated_at: review.updated_at
                });
            });
        });
        
        const exportData = {
            reviews: allReviews,
            export_date: new Date().toISOString(),
            version: '1.0.0',
            total_reviews: allReviews.length
        };
        
        const exportJson = JSON.stringify(exportData, null, 2);
        const textarea = document.getElementById('exportTextarea');
        const label = document.getElementById('exportModalLabel');
        if (textarea) textarea.value = exportJson;
        if (label) label.textContent = 'Export Reviews';
        const modal = getOrCreateModal('exportModal');
        if (modal) {
            modal.show();
        }
    }

    // Export all data
    function exportAll() {
        const apartments = getApartments();
        const apartmentsData = apartments.map(apt => {
            const { reviews, ...aptWithoutReviews } = apt;
            return aptWithoutReviews;
        });
        
        const timers = apartments.map(apt => ({
            apartment_id: apt.id,
            apartment_name: apt.apartment_name || apt.location || 'Unnamed',
            owned_number: apt.owned_number,
            due_date: apt.due_date,
            clean_time: apt.clean_time
        })).filter(timer => timer.due_date || timer.clean_time);
        
        const allReviews = [];
        apartments.forEach(apt => {
            const reviews = apt.reviews || [];
            reviews.forEach(review => {
                allReviews.push({
                    id: review.id,
                    apartment_id: review.apartment_id || apt.id,
                    rating: review.rating,
                    comment: review.comment,
                    created_at: review.created_at,
                    updated_at: review.updated_at
                });
            });
        });
        
        const exportData = {
            apartments: apartmentsData,
            timers: timers,
            reviews: allReviews,
            export_date: new Date().toISOString(),
            version: '1.0.0',
            total_apartments: apartmentsData.length,
            total_timers: timers.length,
            total_reviews: allReviews.length
        };
        
        const exportJson = JSON.stringify(exportData, null, 2);
        const textarea = document.getElementById('exportTextarea');
        const label = document.getElementById('exportModalLabel');
        if (textarea) textarea.value = exportJson;
        if (label) label.textContent = 'Export All Data';
        const modal = getOrCreateModal('exportModal');
        if (modal) {
            modal.show();
        }
    }

    // Open import modal
    function openImportModal() {
        const textarea = document.getElementById('importTextarea');
        const label = document.getElementById('importModalLabel');
        if (textarea) textarea.value = '';
        if (label) label.textContent = 'Import Apartments';
        const modal = getOrCreateModal('importModal');
        if (modal) {
            modal.show();
        }
    }

    // Open import timers modal
    function openImportTimersModal() {
        const textarea = document.getElementById('importTimersTextarea');
        if (textarea) textarea.value = '';
        const modal = getOrCreateModal('importTimersModal');
        if (modal) {
            modal.show();
        }
    }

    // Open import reviews modal
    function openImportReviewsModal() {
        const textarea = document.getElementById('importReviewsTextarea');
        if (textarea) textarea.value = '';
        const modal = getOrCreateModal('importReviewsModal');
        if (modal) {
            modal.show();
        }
    }

    // Open import all modal
    function openImportAllModal() {
        const textarea = document.getElementById('importAllTextarea');
        if (textarea) textarea.value = '';
        const modal = getOrCreateModal('importAllModal');
        if (modal) {
            modal.show();
        }
    }

    // Import apartments
    function importApartments() {
        const textarea = document.getElementById('importTextarea');
        if (!textarea) {
            alert('Please paste JSON data');
            return;
        }
        
        const importText = textarea.value.trim();
        if (!importText) {
            alert('Please paste JSON data');
            return;
        }
        
        try {
            const imported = JSON.parse(importText);
            const apartmentsToImport = Array.isArray(imported) ? imported : (imported.apartments || []);
            
            if (!Array.isArray(apartmentsToImport) || apartmentsToImport.length === 0) {
                throw new Error('Invalid format: Expected an array of apartments or an object with an apartments array');
            }
            
            const apartments = getApartments();
            let successCount = 0;
            let errorCount = 0;
            const errors = [];
            
            for (const aptData of apartmentsToImport) {
                try {
                    const reviews = aptData.reviews || [];
                    delete aptData.reviews;
                    
                    if (aptData.id) {
                        const apartmentIndex = apartments.findIndex(apt => apt.id === aptData.id);
                        if (apartmentIndex === -1) {
                            // Apartment with this ID doesn't exist, create it
                            apartments.push({
                                ...aptData,
                                reviews: reviews
                            });
                            debugManager.log('Created new apartment with ID:', aptData.id);
                        } else {
                            // Apartment exists, update it
                            const existingReviews = apartments[apartmentIndex].reviews || [];
                            apartments[apartmentIndex] = { ...apartments[apartmentIndex], ...aptData };
                            // Merge reviews: keep existing ones, add new ones
                            apartments[apartmentIndex].reviews = [...existingReviews, ...reviews];
                            debugManager.log('Updated existing apartment with ID:', aptData.id);
                        }
                    } else {
                        // No ID provided, generate a new one
                        const newId = apartments.length > 0 ? Math.max(...apartments.map(apt => apt.id || 0)) + 1 : 1;
                        apartments.push({
                            id: newId,
                            ...aptData,
                            reviews: reviews
                        });
                        debugManager.log('Created new apartment with auto-generated ID:', newId);
                    }
                    
                    successCount++;
                } catch (error) {
                    errorCount++;
                    errors.push(`Apartment ${aptData.apartment_name || aptData.id || 'Unknown'}: ${error.message}`);
                    debugManager.log('Error importing apartment:', aptData, error);
                }
            }
            
            // Update window.apartments to reflect changes
            window.apartments = apartments;
            saveApartmentsToLocalStorage();
            
            const importModal = bootstrap.Modal.getInstance(document.getElementById('importModal'));
            if (importModal) {
                importModal.hide();
            }
            
            let message = `Import completed!\n\nSuccess: ${successCount}\nErrors: ${errorCount}`;
            if (errors.length > 0 && errors.length <= 10) {
                message += '\n\nErrors:\n' + errors.join('\n');
            } else if (errors.length > 10) {
                message += '\n\nFirst 10 errors:\n' + errors.slice(0, 10).join('\n');
            }
            alert(message);
            
            if (typeof window.loadApartments === 'function') {
                window.loadApartments();
            }
            if (typeof window.loadAllApartments === 'function') {
                window.loadAllApartments();
            }
            if (typeof window.loadAllApartmentsForSelector === 'function') {
                window.loadAllApartmentsForSelector();
            }
        } catch (error) {
            if (error instanceof SyntaxError) {
                alert(`Import failed: Invalid JSON format.\n\nError: ${error.message}`);
            } else {
                alert(`Import failed: ${error.message}`);
            }
            debugManager.log('Import error:', error);
        }
    }

    // Import timers only
    function importTimers() {
        const textarea = document.getElementById('importTimersTextarea');
        if (!textarea) {
            alert('Please paste JSON data');
            return;
        }
        
        const importText = textarea.value.trim();
        if (!importText) {
            alert('Please paste JSON data');
            return;
        }
        
        try {
            const imported = JSON.parse(importText);
            const timersToImport = Array.isArray(imported) ? imported : (imported.timers || []);
            
            if (!Array.isArray(timersToImport) || timersToImport.length === 0) {
                throw new Error('Invalid format: Expected an array of timers or an object with a timers array');
            }
            
            let successCount = 0;
            let errorCount = 0;
            const errors = [];
            
            for (const timerData of timersToImport) {
                try {
                    if (!timerData.apartment_id) {
                        throw new Error('Missing apartment_id');
                    }
                    
                    const apartment = getApartmentById(timerData.apartment_id);
                    if (!apartment) {
                        throw new Error('Apartment not found');
                    }
                    
                    if (timerData.due_date) apartment.due_date = timerData.due_date;
                    if (timerData.clean_time) apartment.clean_time = timerData.clean_time;
                    
                    successCount++;
                } catch (error) {
                    errorCount++;
                    errors.push(`Apartment ID ${timerData.apartment_id || 'Unknown'}: ${error.message}`);
                    debugManager.log('Error importing timer:', timerData, error);
                }
            }
            
            saveApartmentsToLocalStorage();
            
            const importTimersModal = bootstrap.Modal.getInstance(document.getElementById('importTimersModal'));
            if (importTimersModal) {
                importTimersModal.hide();
            }
            
            let message = `Timer import completed!\n\nSuccess: ${successCount}\nErrors: ${errorCount}`;
            if (errors.length > 0 && errors.length <= 10) {
                message += '\n\nErrors:\n' + errors.join('\n');
            } else if (errors.length > 10) {
                message += '\n\nFirst 10 errors:\n' + errors.slice(0, 10).join('\n');
            }
            alert(message);
            
            if (typeof window.loadApartments === 'function') {
                window.loadApartments();
            }
            if (typeof window.loadAllApartments === 'function') {
                window.loadAllApartments();
            }
        } catch (error) {
            if (error instanceof SyntaxError) {
                alert(`Import failed: Invalid JSON format.\n\nError: ${error.message}`);
            } else {
                alert(`Import failed: ${error.message}`);
            }
            debugManager.log('Timer import error:', error);
        }
    }

    // Import reviews only
    function importReviews() {
        const textarea = document.getElementById('importReviewsTextarea');
        if (!textarea) {
            alert('Please paste JSON data');
            return;
        }
        
        const importText = textarea.value.trim();
        if (!importText) {
            alert('Please paste JSON data');
            return;
        }
        
        try {
            const imported = JSON.parse(importText);
            const reviewsToImport = Array.isArray(imported) ? imported : (imported.reviews || []);
            
            if (!Array.isArray(reviewsToImport) || reviewsToImport.length === 0) {
                throw new Error('Invalid format: Expected an array of reviews or an object with a reviews array');
            }
            
            let successCount = 0;
            let errorCount = 0;
            const errors = [];
            
            for (const reviewData of reviewsToImport) {
                try {
                    if (!reviewData.apartment_id) {
                        throw new Error('Missing apartment_id');
                    }
                    
                    const apartment = getApartmentById(reviewData.apartment_id);
                    if (!apartment) {
                        throw new Error(`Apartment with ID ${reviewData.apartment_id} not found`);
                    }
                    
                    if (!apartment.reviews) {
                        apartment.reviews = [];
                    }
                    
                    const existingReviewIndex = apartment.reviews.findIndex(r => r.id === reviewData.id);
                    
                    if (existingReviewIndex !== -1) {
                        apartment.reviews[existingReviewIndex] = {
                            ...apartment.reviews[existingReviewIndex],
                            rating: reviewData.rating,
                            comment: reviewData.comment || null,
                            updated_at: reviewData.updated_at || new Date().toISOString(),
                            created_at: reviewData.created_at || apartment.reviews[existingReviewIndex].created_at
                        };
                    } else {
                        const newReview = {
                            id: reviewData.id || Date.now() + Math.random(),
                            apartment_id: reviewData.apartment_id,
                            rating: reviewData.rating,
                            comment: reviewData.comment || null,
                            created_at: reviewData.created_at || new Date().toISOString(),
                            updated_at: reviewData.updated_at || new Date().toISOString()
                        };
                        apartment.reviews.push(newReview);
                    }
                    
                    successCount++;
                } catch (error) {
                    errorCount++;
                    errors.push(`Review ID ${reviewData.id || 'Unknown'} (Apartment ID ${reviewData.apartment_id || 'Unknown'}): ${error.message}`);
                    debugManager.log('Error importing review:', reviewData, error);
                }
            }
            
            saveApartmentsToLocalStorage();
            
            const importReviewsModal = bootstrap.Modal.getInstance(document.getElementById('importReviewsModal'));
            if (importReviewsModal) {
                importReviewsModal.hide();
            }
            
            let message = `Review import completed!\n\nSuccess: ${successCount}\nErrors: ${errorCount}`;
            if (errors.length > 0 && errors.length <= 10) {
                message += '\n\nErrors:\n' + errors.join('\n');
            } else if (errors.length > 10) {
                message += '\n\nFirst 10 errors:\n' + errors.slice(0, 10).join('\n');
            }
            alert(message);
            
            if (typeof window.loadApartments === 'function') {
                window.loadApartments();
            }
            if (typeof window.loadAllApartments === 'function') {
                window.loadAllApartments();
            }
            if (typeof window.loadAllReviews === 'function') {
                window.loadAllReviews();
            }
            if (typeof window.loadOverview === 'function') {
                window.loadOverview();
            }
        } catch (error) {
            if (error instanceof SyntaxError) {
                alert(`Import failed: Invalid JSON format.\n\nError: ${error.message}`);
            } else {
                alert(`Import failed: ${error.message}`);
            }
            debugManager.log('Review import error:', error);
        }
    }

    // Import all data
    function importAll() {
        const textarea = document.getElementById('importAllTextarea');
        if (!textarea) {
            alert('Please paste JSON data');
            return;
        }
        
        const importText = textarea.value.trim();
        if (!importText) {
            alert('Please paste JSON data');
            return;
        }
        
        try {
            const imported = JSON.parse(importText);
            
            let apartmentsImported = 0;
            let apartmentsUpdated = 0;
            let apartmentsErrors = 0;
            let timersImported = 0;
            let timersErrors = 0;
            let reviewsImported = 0;
            let reviewsUpdated = 0;
            let reviewsErrors = 0;
            const errors = [];
            
            if (imported.apartments && Array.isArray(imported.apartments)) {
                const apartments = getApartments();
                for (const aptData of imported.apartments) {
                    try {
                        const reviews = aptData.reviews || [];
                        delete aptData.reviews;
                        
                        if (aptData.id) {
                            const apartmentIndex = apartments.findIndex(apt => apt.id === aptData.id);
                            if (apartmentIndex === -1) {
                                // Apartment with this ID doesn't exist, create it
                                apartments.push({
                                    ...aptData,
                                    reviews: reviews
                                });
                                apartmentsImported++;
                                debugManager.log('Created new apartment with ID:', aptData.id);
                            } else {
                                // Apartment exists, update it
                                const existingReviews = apartments[apartmentIndex].reviews || [];
                                apartments[apartmentIndex] = { ...apartments[apartmentIndex], ...aptData };
                                // Merge reviews: keep existing ones, add new ones
                                apartments[apartmentIndex].reviews = [...existingReviews, ...reviews];
                                apartmentsUpdated++;
                                debugManager.log('Updated existing apartment with ID:', aptData.id);
                            }
                        } else {
                            // No ID provided, generate a new one
                            const newId = apartments.length > 0 ? Math.max(...apartments.map(apt => apt.id || 0)) + 1 : 1;
                            apartments.push({
                                id: newId,
                                ...aptData,
                                reviews: reviews
                            });
                            apartmentsImported++;
                            debugManager.log('Created new apartment with auto-generated ID:', newId);
                        }
                    } catch (error) {
                        apartmentsErrors++;
                        errors.push(`Apartment ${aptData.apartment_name || aptData.id || 'Unknown'}: ${error.message}`);
                        debugManager.log('Error importing apartment:', aptData, error);
                    }
                }
                // Update window.apartments to reflect changes
                window.apartments = apartments;
            }
            
            if (imported.timers && Array.isArray(imported.timers)) {
                for (const timerData of imported.timers) {
                    try {
                        if (!timerData.apartment_id) {
                            throw new Error('Missing apartment_id');
                        }
                        
                        const apartment = getApartmentById(timerData.apartment_id);
                        if (!apartment) {
                            throw new Error('Apartment not found');
                        }
                        
                        if (timerData.due_date) apartment.due_date = timerData.due_date;
                        if (timerData.clean_time) apartment.clean_time = timerData.clean_time;
                        
                        timersImported++;
                    } catch (error) {
                        timersErrors++;
                        errors.push(`Timer (Apartment ID ${timerData.apartment_id || 'Unknown'}): ${error.message}`);
                        debugManager.log('Error importing timer:', timerData, error);
                    }
                }
            }
            
            if (imported.reviews && Array.isArray(imported.reviews)) {
                for (const reviewData of imported.reviews) {
                    try {
                        if (!reviewData.apartment_id) {
                            throw new Error('Missing apartment_id');
                        }
                        
                        const apartment = getApartmentById(reviewData.apartment_id);
                        if (!apartment) {
                            throw new Error(`Apartment with ID ${reviewData.apartment_id} not found`);
                        }
                        
                        if (!apartment.reviews) {
                            apartment.reviews = [];
                        }
                        
                        const existingReviewIndex = apartment.reviews.findIndex(r => r.id === reviewData.id);
                        
                        if (existingReviewIndex !== -1) {
                            apartment.reviews[existingReviewIndex] = {
                                ...apartment.reviews[existingReviewIndex],
                                rating: reviewData.rating,
                                comment: reviewData.comment || null,
                                updated_at: reviewData.updated_at || new Date().toISOString(),
                                created_at: reviewData.created_at || apartment.reviews[existingReviewIndex].created_at
                            };
                            reviewsUpdated++;
                        } else {
                            const newReview = {
                                id: reviewData.id || Date.now() + Math.random(),
                                apartment_id: reviewData.apartment_id,
                                rating: reviewData.rating,
                                comment: reviewData.comment || null,
                                created_at: reviewData.created_at || new Date().toISOString(),
                                updated_at: reviewData.updated_at || new Date().toISOString()
                            };
                            apartment.reviews.push(newReview);
                            reviewsImported++;
                        }
                    } catch (error) {
                        reviewsErrors++;
                        errors.push(`Review ID ${reviewData.id || 'Unknown'} (Apartment ID ${reviewData.apartment_id || 'Unknown'}): ${error.message}`);
                        debugManager.log('Error importing review:', reviewData, error);
                    }
                }
            }
            
            saveApartmentsToLocalStorage();
            
            const importAllModal = bootstrap.Modal.getInstance(document.getElementById('importAllModal'));
            if (importAllModal) {
                importAllModal.hide();
            }
            
            let message = `Import All completed!\n\n`;
            message += `Apartments: ${apartmentsImported} created, ${apartmentsUpdated} updated, ${apartmentsErrors} errors\n`;
            message += `Timers: ${timersImported} imported, ${timersErrors} errors\n`;
            message += `Reviews: ${reviewsImported} created, ${reviewsUpdated} updated, ${reviewsErrors} errors`;
            
            if (errors.length > 0) {
                if (errors.length <= 10) {
                    message += '\n\nErrors:\n' + errors.join('\n');
                } else {
                    message += '\n\nFirst 10 errors:\n' + errors.slice(0, 10).join('\n');
                }
            }
            
            alert(message);
            
            if (typeof window.loadApartments === 'function') {
                window.loadApartments();
            }
            if (typeof window.loadAllApartments === 'function') {
                window.loadAllApartments();
            }
            if (typeof window.loadAllApartmentsForSelector === 'function') {
                window.loadAllApartmentsForSelector();
            }
            if (typeof window.loadAllReviews === 'function') {
                window.loadAllReviews();
            }
            if (typeof window.loadOverview === 'function') {
                window.loadOverview();
            }
        } catch (error) {
            if (error instanceof SyntaxError) {
                alert(`Import failed: Invalid JSON format.\n\nError: ${error.message}`);
            } else {
                alert(`Import failed: ${error.message}`);
            }
            debugManager.log('Import all error:', error);
        }
    }

    // Copy to clipboard helper
    function copyToClipboard(elementId) {
        const textarea = document.getElementById(elementId);
        if (textarea) {
            textarea.select();
            document.execCommand('copy');
            alert('Copied to clipboard!');
        }
    }

    // Export functions to global scope
    window.getOrCreateModal = getOrCreateModal;
    window.openAddModal = openAddModal;
    window.editApartment = editApartment;
    window.saveApartment = saveApartment;
    window.deleteApartment = deleteApartment;
    window.loadApartmentData = loadApartmentData;
    window.saveApartmentFromSelector = saveApartmentFromSelector;
    window.viewReviews = viewReviews;
    window.renderRatingOverview = renderRatingOverview;
    window.renderReviews = renderReviews;
    window.saveReview = saveReview;
    window.deleteReview = deleteReview;
    window.editReview = editReview;
    window.cancelReviewEdit = cancelReviewEdit;
    window.saveReviewEdit = saveReviewEdit;
    window.exportApartments = exportApartments;
    window.exportTimers = exportTimers;
    window.exportReviews = exportReviews;
    window.exportAll = exportAll;
    window.openImportModal = openImportModal;
    window.openImportTimersModal = openImportTimersModal;
    window.openImportReviewsModal = openImportReviewsModal;
    window.openImportAllModal = openImportAllModal;
    window.importApartments = importApartments;
    window.importTimers = importTimers;
    window.importReviews = importReviews;
    window.importAll = importAll;
    window.copyToClipboard = copyToClipboard;

})();
