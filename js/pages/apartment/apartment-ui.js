/**
 * Apartment UI Module
 * Contains rendering functions and UI interactions
 */
(function() {
    'use strict';

    // Ensure dependencies are loaded
    if (typeof window.apartmentDebugManager === 'undefined') {
        console.error('apartment-core.js must be loaded before apartment-ui.js');
        return;
    }

    const debugManager = window.apartmentDebugManager;
    // Don't capture apartments as const - always reference window.apartments directly
    // This ensures we get the latest data after initializeApartmentsData() is called
    const getApartments = () => window.apartments || [];
    const hiddenApartments = window.hiddenApartments || [];
    const lockedApartments = window.lockedApartments || [];
    const escapeHtml = window.escapeHtml;
    const formatNumber = window.formatNumber;
    const formatDateDDMMMYYYYWithTime = window.formatDateDDMMMYYYYWithTime;
    const formatLocalDateDDMMMYYYYWithTime = window.formatLocalDateDDMMMYYYYWithTime;
    const getEasternTimeZone = window.getEasternTimeZone;
    const getApartmentById = window.getApartmentById;
    const calculateApartmentRating = window.calculateApartmentRating;
    const getApartmentRatingBreakdown = window.getApartmentRatingBreakdown;
    const calculateOverallRating = window.calculateOverallRating;
    const saveApartmentsToLocalStorage = window.saveApartmentsToLocalStorage;

    // Toggle apartments table visibility
    function toggleApartmentsTable() {
        const tableContainer = document.getElementById('apartmentsTableContainer');
        const toggleBtn = document.getElementById('toggleTableBtn');
        
        if (tableContainer && toggleBtn) {
            const isVisible = tableContainer.style.display !== 'none';
            tableContainer.style.display = isVisible ? 'none' : 'block';
            toggleBtn.textContent = isVisible ? '👁️ Show Table' : '🙈 Hide Table';
            toggleBtn.title = isVisible ? 'Show table' : 'Hide table';
            localStorage.setItem('apartmentsTableVisible', (!isVisible).toString());
        }
    }

    // Format stars with half-star support
    function formatStars(rating) {
        if (!rating || rating === 0) {
            return '☆☆☆☆☆';
        }
        
        const numRating = parseFloat(rating);
        const fullStars = Math.floor(numRating);
        const remainder = numRating % 1;
        const hasHalfStar = remainder >= 0.25 && remainder < 0.75;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '★'.repeat(fullStars);
        
        if (hasHalfStar) {
            stars += '<span style="color: #0d6efd;">★</span>';
        }
        
        stars += '☆'.repeat(emptyStars);
        
        return stars;
    }

    // Select half star rating
    function selectHalfStar(rating) {
        if (event) event.stopPropagation();
        const hiddenInput = document.getElementById('selectedRating');
        if (hiddenInput) {
            hiddenInput.value = rating;
        }
        
        document.querySelectorAll('input[name="rating"]').forEach(radio => {
            radio.checked = false;
        });
        
        const radio = document.querySelector(`input[name="rating"][value="${rating}"]`);
        if (radio) {
            radio.checked = true;
        }
        
        updateStarColors();
    }

    // Select half star for edit form
    function selectEditHalfStar(reviewId, rating) {
        if (event) event.stopPropagation();
        const hiddenInput = document.getElementById(`edit-selected-rating-${reviewId}`);
        if (hiddenInput) {
            hiddenInput.value = rating;
        }
        
        document.querySelectorAll(`input[name="edit-rating-${reviewId}"]`).forEach(radio => {
            radio.checked = false;
        });
        
        const radio = document.querySelector(`input[name="edit-rating-${reviewId}"][value="${rating}"]`);
        if (radio) {
            radio.checked = true;
        }
        
        updateEditStarColors(reviewId);
    }

    // Update star colors for edit form
    function updateEditStarColors(reviewId) {
        const ratingContainer = document.getElementById(`edit-star-rating-${reviewId}`);
        if (!ratingContainer) return;
        
        const selectedRadio = ratingContainer.querySelector(`input[name="edit-rating-${reviewId}"]:checked`);
        const selectedHidden = document.getElementById(`edit-selected-rating-${reviewId}`);
        let selectedRating = 0;
        
        if (selectedHidden && selectedHidden.value) {
            selectedRating = parseFloat(selectedHidden.value);
        } else if (selectedRadio) {
            selectedRating = parseFloat(selectedRadio.value);
        }
        
        if (selectedRating === 0) {
            const labels = ratingContainer.querySelectorAll('.star-label');
            labels.forEach(label => {
                label.style.color = '#ddd';
            });
            return;
        }
        
        const labels = ratingContainer.querySelectorAll('.star-label');
        labels.forEach((label, index) => {
            const starRating = parseFloat(label.getAttribute('data-rating')) || (5 - index);
            if (selectedRating >= starRating) {
                label.style.color = '#ffc107';
            } else {
                label.style.color = '#ddd';
            }
        });
    }

    // Initialize star ratings with half-star support
    function initStarRatings() {
        const starRatings = document.querySelectorAll('.star-rating');
        starRatings.forEach(ratingContainer => {
            const labels = ratingContainer.querySelectorAll('.star-label');
            labels.forEach((label, index) => {
                label.addEventListener('click', function(e) {
                    if (e.target === label || e.target.closest('.star-half-right')) {
                        const rating = parseFloat(label.getAttribute('data-rating'));
                        if (rating) {
                            selectHalfStar(rating);
                        }
                    }
                });
            });
            
            updateStarColors();
        });
    }

    // Update star colors based on selected rating
    function updateStarColors() {
        const starRatings = document.querySelectorAll('.star-rating');
        starRatings.forEach(ratingContainer => {
            const selectedRadio = ratingContainer.querySelector('input[name="rating"]:checked');
            const selectedHidden = document.getElementById('selectedRating');
            let selectedRating = 0;
            
            if (selectedHidden && selectedHidden.value) {
                selectedRating = parseFloat(selectedHidden.value);
            } else if (selectedRadio) {
                selectedRating = parseFloat(selectedRadio.value);
            }
            
            if (selectedRating === 0) {
                const labels = ratingContainer.querySelectorAll('.star-label');
                labels.forEach(label => {
                    label.style.color = '#ddd';
                });
                return;
            }
            
            const labels = ratingContainer.querySelectorAll('.star-label');
            labels.forEach((label, index) => {
                const starRating = parseFloat(label.getAttribute('data-rating')) || (5 - index);
                if (selectedRating >= starRating) {
                    label.style.color = '#ffc107';
                } else if (selectedRating >= starRating - 0.5) {
                    label.style.color = '#ffc107';
                } else {
                    label.style.color = '#ddd';
                }
            });
        });
    }

    // Load all apartments for selector
    function loadAllApartmentsForSelector() {
        const selector = document.getElementById('apartmentSelector');
        if (!selector) return;
        
        selector.innerHTML = '<option value="">-- Select or Create Apartment --</option><option value="new">➕ Create New Apartment</option>';
        
        const sortedApartments = [...apartments].sort((a, b) => {
            if (a.owned_number === null || a.owned_number === undefined) return 1;
            if (b.owned_number === null || b.owned_number === undefined) return -1;
            return a.owned_number - b.owned_number;
        });
        
        sortedApartments.forEach(apt => {
            const option = document.createElement('option');
            option.value = apt.id;
            const ownedNum = apt.owned_number || '--';
            option.textContent = `Owned ${ownedNum} - ${apt.apartment_name || apt.location || 'Unnamed'}`;
            selector.appendChild(option);
        });
    }

    // Load apartment rating
    function loadApartmentRating(apartmentId) {
        debugManager.log('Loading rating for apartment:', apartmentId);
        const stats = calculateApartmentRating(apartmentId);
        debugManager.log('Rating stats for apartment', apartmentId, ':', stats);
        const ratingCell = document.getElementById(`rating-${apartmentId}`);
        if (ratingCell && stats.review_count > 0) {
            const avgRating = parseFloat(stats.average_rating).toFixed(1);
            ratingCell.innerHTML = `${avgRating} ⭐ (${stats.review_count} review${stats.review_count !== 1 ? 's' : ''})`;
            debugManager.log('Updated rating display:', avgRating, 'stars,', stats.review_count, 'reviews');
        } else if (ratingCell) {
            ratingCell.innerHTML = 'No reviews';
            debugManager.log('No reviews for apartment:', apartmentId);
        }
    }

    // Update apartment counter display
    function updateApartmentCounterDisplay() {
        const countElement = document.getElementById('apartmentCount');
        if (countElement) {
            const ownedNumbers = apartments
                .filter(apt => apt.owned_number !== null && apt.owned_number !== undefined)
                .map(apt => apt.owned_number);
            const maxOwnedNumber = ownedNumbers.length > 0 ? Math.max(...ownedNumbers) : 0;
            countElement.textContent = maxOwnedNumber;
        }
        if (typeof window.loadOverallRating === 'function') {
            window.loadOverallRating();
        }
    }

    // Render apartments table
    function renderApartments() {
        const tbody = document.getElementById('apartmentsTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        updateApartmentCounterDisplay();
        
        const apartments = getApartments();
        apartments.forEach(apt => {
            const row = document.createElement('tr');
            
            const dueDateLocal = apt.due_date ? formatLocalDateDDMMMYYYYWithTime(new Date(apt.due_date)) : '--';
            const dueDateEastern = apt.due_date ? formatDateDDMMMYYYYWithTime(new Date(apt.due_date), 'America/New_York') : '--';
            const cleanTimeLocal = apt.clean_time ? formatLocalDateDDMMMYYYYWithTime(new Date(apt.clean_time)) : '--';
            const cleanTimeEastern = apt.clean_time ? formatDateDDMMMYYYYWithTime(new Date(apt.clean_time), 'America/New_York') : '--';
            
            const purchasedPrice = apt.purchased_price ? parseFloat(apt.purchased_price).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) : '--';
            const rentingPrice = apt.renting_out_price ? parseFloat(apt.renting_out_price).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) : '--';
            
            const ratingDisplay = apt.average_rating ? 
                `${parseFloat(apt.average_rating).toFixed(1)} ⭐ (${apt.review_count || 0} reviews)` : 
                'No reviews';
            
            row.innerHTML = `
                <td><strong>${apt.owned_number || '--'}</strong></td>
                <td>${escapeHtml(apt.location || '--')}</td>
                <td>${escapeHtml(apt.apartment_name || '--')}</td>
                <td>${escapeHtml(apt.apartment_no || '--')}</td>
                <td>${escapeHtml(apt.postal || '--')}</td>
                <td>${escapeHtml(apt.apartment_class || '--')}</td>
                <td>$${purchasedPrice}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="rent-price-display me-2" id="rent-price-display-${apt.id}">$${rentingPrice}</span>
                        <button class="btn btn-sm btn-outline-primary" onclick="editRentPrice(${apt.id}, ${apt.renting_out_price || 0})" title="Edit rent price">
                            ✏️
                        </button>
                    </div>
                    <div class="rent-price-edit" id="rent-price-edit-${apt.id}" style="display: none;">
                        <div class="input-group input-group-sm mt-1">
                            <span class="input-group-text">$</span>
                            <input type="text" class="form-control form-control-sm money-input rent-price-input" 
                                   id="rent-price-input-${apt.id}" 
                                   value="${apt.renting_out_price || ''}" 
                                   placeholder="0.00">
                            <button class="btn btn-sm btn-success" onclick="saveRentPrice(${apt.id})" title="Save">
                                ✓
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="cancelRentPriceEdit(${apt.id}, ${apt.renting_out_price || 0})" title="Cancel">
                                ✕
                            </button>
                        </div>
                    </div>
                </td>
                <td>
                    <div>${dueDateLocal}</div>
                    <small class="eastern-date">${dueDateEastern}</small>
                </td>
                <td>
                    <div>${cleanTimeLocal}</div>
                    <small class="eastern-date">${cleanTimeEastern}</small>
                </td>
                <td id="rating-${apt.id}">${ratingDisplay}</td>
                <td>
                    ${lockedApartments.includes(apt.id) ? '' : `
                        <button class="btn btn-sm btn-primary" onclick="editApartment(${apt.id})">Edit</button>
                    `}
                    <button class="btn btn-sm btn-info" onclick="viewReviews(${apt.id})">Reviews</button>
                    ${lockedApartments.includes(apt.id) ? '' : `
                        <button class="btn btn-sm btn-danger" onclick="deleteApartment(${apt.id})">Delete</button>
                    `}
                </td>
            `;
            
            loadApartmentRating(apt.id);
            tbody.appendChild(row);
        });
        
        if (typeof window.NumberFormatter !== 'undefined' && typeof window.NumberFormatter.initNumberFormatting === 'function') {
            window.NumberFormatter.initNumberFormatting({ allowDecimals: true, selector: '.money-input, .rent-price-input' });
        }
    }

    // Load all apartments in card format
    function loadAllApartments() {
        const container = document.getElementById('allApartmentsContainer');
        if (!container) return;
        
        const apartments = getApartments();
        const sortedApartments = [...apartments].sort((a, b) => {
            if (a.owned_number === null || a.owned_number === undefined) return 1;
            if (b.owned_number === null || b.owned_number === undefined) return -1;
            return a.owned_number - b.owned_number;
        });
            
        if (sortedApartments.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No apartments found.</p>';
            const controlsContainer = document.getElementById('apartmentVisibilityControls');
            if (controlsContainer) {
                controlsContainer.innerHTML = '';
            }
            return;
        }
            
        const controlsContainer = document.getElementById('apartmentVisibilityControls');
        if (controlsContainer) {
            const allApartmentsLocked = JSON.parse(localStorage.getItem('allApartmentsLocked') || '[]');
            controlsContainer.innerHTML = sortedApartments.map(apt => {
                const ownedNum = apt.owned_number || '--';
                const isVisible = !hiddenApartments.includes(apt.id);
                const isLocked = allApartmentsLocked.includes(apt.id);
                return `
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="apt-check-${apt.id}" 
                               ${isVisible ? 'checked' : ''} 
                               onchange="toggleApartmentVisibility(${apt.id})">
                        <label class="form-check-label" for="apt-check-${apt.id}">
                            Owned ${ownedNum} ${isLocked ? '🔒' : ''}
                        </label>
                    </div>
                `;
            }).join('');
        }
            
        const apartmentsWithReviews = sortedApartments.map(apt => {
            const reviews = apt.reviews || [];
            if (reviews.length > 0) {
                const avgRating = reviews.reduce((sum, r) => sum + parseFloat(r.rating || 0), 0) / reviews.length;
                apt.average_rating = avgRating.toFixed(1);
            } else {
                apt.average_rating = null;
            }
            return apt;
        });
            
        container.innerHTML = apartmentsWithReviews.map(apt => {
            const ownedNum = apt.owned_number || '--';
            const tabName = `Owned ${ownedNum} - ${escapeHtml(apt.apartment_name || 'Unnamed')}`;
            const tabId = `apt-${apt.id}`;
            
            const isHidden = hiddenApartments.includes(apt.id);
            const allApartmentsLocked = JSON.parse(localStorage.getItem('allApartmentsLocked') || '[]');
            const isLocked = allApartmentsLocked.includes(apt.id);
            
            const dueDateLocal = apt.due_date ? formatLocalDateDDMMMYYYYWithTime(new Date(apt.due_date)) : '--';
            const dueDateEastern = apt.due_date ? formatDateDDMMMYYYYWithTime(new Date(apt.due_date), 'America/New_York') : '--';
            const easternTZ = apt.due_date ? getEasternTimeZone() : '';
            
            const cleanTimeLocal = apt.clean_time ? formatLocalDateDDMMMYYYYWithTime(new Date(apt.clean_time)) : '--';
            const cleanTimeEastern = apt.clean_time ? formatDateDDMMMYYYYWithTime(new Date(apt.clean_time), 'America/New_York') : '--';
            
            const stars = apt.average_rating ? formatStars(parseFloat(apt.average_rating)) : 'No ratings';
            
            return `
                <div class="card mb-4" id="apartment-card-${apt.id}" style="${isHidden ? 'display: none;' : ''}">
                    <div class="card-header bg-info text-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <h4 class="mb-0">${tabName}</h4>
                            <div class="d-flex gap-2">
                                ${!isLocked ? `
                                    <button class="btn btn-sm btn-light" onclick="editApartment(${apt.id})" title="Edit Apartment">
                                        ✏️ Edit
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteApartment(${apt.id})" title="Delete Apartment">
                                        🗑️ Delete
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <ul class="nav nav-tabs mb-3" id="${tabId}-tabs" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="${tabId}-info-tab" data-bs-toggle="tab" data-bs-target="#${tabId}-info" type="button" role="tab">
                                    Info
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="${tabId}-reviews-tab" data-bs-toggle="tab" data-bs-target="#${tabId}-reviews" type="button" role="tab">
                                    Reviews (${apt.reviews.length})
                                </button>
                            </li>
                        </ul>
                        
                        <div class="tab-content" id="${tabId}-content">
                            <div class="tab-pane fade show active" id="${tabId}-info" role="tabpanel">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <strong>Location:</strong> ${escapeHtml(apt.location || 'N/A')}
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <strong>Apartment No.:</strong> ${escapeHtml(apt.apartment_no || 'N/A')}
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <strong>Postal:</strong> ${escapeHtml(apt.postal || 'N/A')}
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <strong>Class:</strong> ${escapeHtml(apt.apartment_class || 'N/A')}
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <strong>Purchased Price:</strong> ${apt.purchased_price ? formatNumber(apt.purchased_price) : 'N/A'}
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <strong>Renting Price:</strong> <span class="rent-price-display" style="font-weight: 700;">${apt.renting_out_price ? formatNumber(apt.renting_out_price) : 'N/A'}</span>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <strong>Due Date:</strong><br>
                                        Local: ${dueDateLocal}<br>
                                        <span class="eastern-date">Eastern: ${dueDateEastern} ${easternTZ}</span>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <strong>Clean Time:</strong><br>
                                        Local: ${cleanTimeLocal}<br>
                                        <span class="eastern-date">Eastern: ${cleanTimeEastern} ${easternTZ}</span>
                                    </div>
                                    ${apt.apartment_description ? `
                                    <div class="col-md-12 mb-3">
                                        <strong>Description:</strong><br>
                                        ${escapeHtml(apt.apartment_description)}
                                    </div>
                                    ` : ''}
                                    <div class="col-md-12 mb-3">
                                        <strong>Rating:</strong> 
                                        <span class="review-rating" style="display: inline-block; margin-left: 0.5rem;">${stars}</span>
                                        ${apt.average_rating ? `<span style="margin-left: 0.5rem; color: var(--text-color); opacity: 0.8;">(${apt.average_rating} from ${apt.reviews.length} review${apt.reviews.length !== 1 ? 's' : ''})</span>` : ''}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="tab-pane fade" id="${tabId}-reviews" role="tabpanel">
                                ${apt.reviews.length === 0 ? `
                                    <div class="text-center py-4">
                                        <p class="text-muted mb-3">No reviews yet.</p>
                                        ${!isLocked ? `
                                            <button class="btn btn-primary" onclick="viewReviews(${apt.id})">
                                                ➕ Add Review
                                            </button>
                                        ` : '<p class="text-muted"><small>🔒 Apartment is locked</small></p>'}
                                    </div>
                                ` : `
                                    ${!isLocked ? `
                                        <div class="mb-4">
                                            <button class="btn btn-primary btn-sm" onclick="viewReviews(${apt.id})">
                                                ➕ Add Review
                                            </button>
                                        </div>
                                    ` : ''}
                                    <div class="reviews-list">
                                    ${apt.reviews.map(review => {
                                        const date = new Date(review.created_at);
                                        const dateStr = formatLocalDateDDMMMYYYYWithTime(date);
                                        const easternDateStr = formatDateDDMMMYYYYWithTime(date, 'America/New_York');
                                        const reviewStars = formatStars(review.rating);
                                        return `
                                            <div class="review-item">
                                                <div class="d-flex justify-content-between align-items-start mb-2">
                                                    <div class="flex-grow-1">
                                                        <div class="review-rating">${reviewStars}</div>
                                                        <div class="review-date">
                                                            ${dateStr}
                                                            <span class="eastern-date">Eastern: ${easternDateStr} ${getEasternTimeZone()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p>${escapeHtml(review.comment || 'No comment')}</p>
                                            </div>
                                        `;
                                    }).join('')}
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Toggle apartment visibility
    function toggleApartmentVisibility(apartmentId) {
        const index = hiddenApartments.indexOf(apartmentId);
        if (index > -1) {
            hiddenApartments.splice(index, 1);
        } else {
            hiddenApartments.push(apartmentId);
        }
        localStorage.setItem('hiddenApartments', JSON.stringify(hiddenApartments));
        
        const apartmentCard = document.getElementById(`apartment-card-${apartmentId}`);
        if (apartmentCard) {
            apartmentCard.style.display = hiddenApartments.includes(apartmentId) ? 'none' : '';
        }
        
        const checkbox = document.getElementById(`apt-check-${apartmentId}`);
        if (checkbox) {
            checkbox.checked = !hiddenApartments.includes(apartmentId);
        }
    }

    // Show all apartments
    function showAllApartments() {
        const apartments = getApartments();
        apartments.forEach(apt => {
            const index = hiddenApartments.indexOf(apt.id);
            if (index > -1) {
                hiddenApartments.splice(index, 1);
            }
            const apartmentCard = document.getElementById(`apartment-card-${apt.id}`);
            if (apartmentCard) {
                apartmentCard.style.display = '';
            }
            const checkbox = document.getElementById(`apt-check-${apt.id}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        localStorage.setItem('hiddenApartments', JSON.stringify(hiddenApartments));
    }

    // Hide all apartments
    function hideAllApartments() {
        const apartments = getApartments();
        apartments.forEach(apt => {
            if (!hiddenApartments.includes(apt.id)) {
                hiddenApartments.push(apt.id);
            }
            const apartmentCard = document.getElementById(`apartment-card-${apt.id}`);
            if (apartmentCard) {
                apartmentCard.style.display = 'none';
            }
            const checkbox = document.getElementById(`apt-check-${apt.id}`);
            if (checkbox) {
                checkbox.checked = false;
            }
        });
        localStorage.setItem('hiddenApartments', JSON.stringify(hiddenApartments));
    }

    // Lock all apartments (only affects "All Apartments" section)
    function lockAllApartments() {
        const allApartmentIds = [];
        document.querySelectorAll('#allApartmentsContainer [id^="apartment-card-"]').forEach(card => {
            const apartmentId = parseInt(card.id.replace('apartment-card-', ''));
            if (!isNaN(apartmentId)) {
                allApartmentIds.push(apartmentId);
            }
        });
        
        const allApartmentsLocked = JSON.parse(localStorage.getItem('allApartmentsLocked') || '[]');
        const updatedLocked = [...new Set([...allApartmentsLocked, ...allApartmentIds])];
        localStorage.setItem('allApartmentsLocked', JSON.stringify(updatedLocked));
        
        allApartmentIds.forEach(apartmentId => {
            const apartmentCard = document.getElementById(`apartment-card-${apartmentId}`);
            if (apartmentCard) {
                apartmentCard.classList.add('locked');
                const editBtn = apartmentCard.querySelector('button[onclick*="editApartment"]');
                const deleteBtn = apartmentCard.querySelector('button[onclick*="deleteApartment"]');
                const addReviewBtn = apartmentCard.querySelector('button[onclick*="openAddReviewModal"]');
                if (editBtn) editBtn.style.display = 'none';
                if (deleteBtn) deleteBtn.style.display = 'none';
                if (addReviewBtn) addReviewBtn.style.display = 'none';
            }
        });
        
        allApartmentIds.forEach(apartmentId => {
            const label = document.querySelector(`label[for="apt-check-${apartmentId}"]`);
            if (label && !label.textContent.includes('🔒')) {
                label.textContent = label.textContent + ' 🔒';
            }
        });
    }

    // Unlock all apartments (only affects "All Apartments" section)
    function unlockAllApartments() {
        localStorage.setItem('allApartmentsLocked', JSON.stringify([]));
        
        document.querySelectorAll('#allApartmentsContainer [id^="apartment-card-"]').forEach(card => {
            const apartmentId = parseInt(card.id.replace('apartment-card-', ''));
            if (!isNaN(apartmentId)) {
                card.classList.remove('locked');
                const editBtn = card.querySelector('button[onclick*="editApartment"]');
                const deleteBtn = card.querySelector('button[onclick*="deleteApartment"]');
                const addReviewBtn = card.querySelector('button[onclick*="openAddReviewModal"]');
                if (editBtn) editBtn.style.display = '';
                if (deleteBtn) deleteBtn.style.display = '';
                if (addReviewBtn) addReviewBtn.style.display = '';
            }
        });
        
        document.querySelectorAll('#apartmentVisibilityControls label').forEach(label => {
            if (label.textContent.includes('🔒')) {
                label.textContent = label.textContent.replace(' 🔒', '');
            }
        });
    }

    // Toggle apartment lock
    function toggleApartmentLock(apartmentId) {
        const index = lockedApartments.indexOf(apartmentId);
        if (index > -1) {
            lockedApartments.splice(index, 1);
        } else {
            lockedApartments.push(apartmentId);
        }
        localStorage.setItem('lockedApartments', JSON.stringify(lockedApartments));
        
        if (typeof window.renderApartments === 'function') {
            window.renderApartments();
        }
        loadAllApartments();
    }

    // Load all reviews for Reviews tab
    function loadAllReviews() {
        const container = document.getElementById('allReviewsContainer');
        if (!container) return;
        
        const apartments = getApartments();
        const allReviews = [];
        apartments.forEach(apt => {
            const reviews = apt.reviews || [];
            reviews.forEach(review => {
                allReviews.push({
                    ...review,
                    apartment_name: apt.apartment_name,
                    apartment_location: apt.location,
                    apartment_id: apt.id
                });
            });
        });
        
        allReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        if (allReviews.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No reviews yet.</p>';
            return;
        }
        
        container.innerHTML = allReviews.map(review => {
            const date = new Date(review.created_at);
            const dateStr = date.toLocaleString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
            });
            const easternDateStr = formatDateDDMMMYYYYWithTime(date, 'America/New_York', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
            });
            const easternTZ = getEasternTimeZone();
            const stars = formatStars(review.rating);
            
            return `
                <div class="review-item">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div class="flex-grow-1">
                            <h6 class="mb-2" style="font-weight: 600; color: var(--text-color);">
                                <strong>${escapeHtml(review.apartment_name)}</strong>
                                <small class="text-muted" style="font-weight: 400;">(${escapeHtml(review.apartment_location)})</small>
                            </h6>
                            <div class="review-rating">${stars}</div>
                        </div>
                        <div class="text-end">
                            <div class="review-date">
                                ${dateStr}
                                <span class="eastern-date">Eastern: ${easternDateStr} ${easternTZ}</span>
                            </div>
                        </div>
                    </div>
                    <p>${escapeHtml(review.comment || 'No comment')}</p>
                </div>
            `;
        }).join('');
    }

    // Load overview statistics
    function loadOverview() {
        const ratingStats = calculateOverallRating();
        
        const totalApartmentsEl = document.getElementById('overviewTotalApartments');
        const overallRatingEl = document.getElementById('overviewOverallRating');
        const totalReviewsEl = document.getElementById('overviewTotalReviews');
        
        const apartments = getApartments();
        if (totalApartmentsEl) {
            totalApartmentsEl.textContent = apartments.length;
        }
        
        if (overallRatingEl) {
            if (ratingStats.review_count > 0) {
                const avgRating = parseFloat(ratingStats.average_rating).toFixed(1);
                const stars = formatStars(parseFloat(avgRating));
                overallRatingEl.innerHTML = `<div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${stars}</div><div>${avgRating}</div>`;
            } else {
                overallRatingEl.innerHTML = '<span style="opacity: 0.7;">No reviews yet</span>';
            }
        }
        
        if (totalReviewsEl) {
            totalReviewsEl.textContent = ratingStats.review_count || 0;
        }
    }

    // Load overall rating across all apartments
    function loadOverallRating() {
        const stats = calculateOverallRating();
        debugManager.log('Overall rating stats:', stats);
        
        const overallRatingEl = document.getElementById('overallRating');
        const overallRatingTextEl = document.getElementById('overallRatingText');
        
        if (overallRatingEl) {
            const reviewCount = parseInt(stats.review_count) || 0;
            const avgRating = stats.average_rating != null ? parseFloat(stats.average_rating) : null;
            
            if (reviewCount > 0 && avgRating != null && !isNaN(avgRating)) {
                const avgRatingFormatted = avgRating.toFixed(1);
                const stars = formatStars(avgRating);
                overallRatingEl.innerHTML = `<span class="text-warning" style="font-size: 1.5rem; display: inline-flex; align-items: center; gap: 0.5rem;">${stars} <strong>${avgRatingFormatted}</strong></span>`;
                if (overallRatingTextEl) {
                    overallRatingTextEl.textContent = `(${reviewCount} review${reviewCount !== 1 ? 's' : ''})`;
                }
            } else {
                overallRatingEl.innerHTML = '<span class="text-warning" style="font-size: 1.5rem;">⭐</span> <span class="text-muted">--</span>';
                if (overallRatingTextEl) {
                    overallRatingTextEl.textContent = '(Overall Rating)';
                }
            }
        }
    }

    // Load all apartments
    function loadApartments() {
        if (typeof window.renderApartments === 'function') {
            window.renderApartments();
        }
        loadAllApartmentsForSelector();
        const loadingAlert = document.getElementById('loadingAlert');
        const tableContainer = document.getElementById('apartmentsTableContainer');
        const noApartmentsAlert = document.getElementById('noApartmentsAlert');
        const apartments = getApartments();
        if (loadingAlert) loadingAlert.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'block';
        if (apartments.length === 0) {
            if (noApartmentsAlert) noApartmentsAlert.style.display = 'block';
        } else {
            if (noApartmentsAlert) noApartmentsAlert.style.display = 'none';
        }
        if (typeof window.checkActionsNeeded === 'function') {
            window.checkActionsNeeded();
        }
    }

    // Edit rent price (show edit form)
    function editRentPrice(apartmentId, currentPrice) {
        const displayDiv = document.getElementById(`rent-price-display-${apartmentId}`);
        const editDiv = document.getElementById(`rent-price-edit-${apartmentId}`);
        const input = document.getElementById(`rent-price-input-${apartmentId}`);
        
        if (displayDiv && editDiv && input) {
            displayDiv.parentElement.style.display = 'none';
            editDiv.style.display = 'block';
            input.focus();
            input.select();
        }
    }

    // Cancel rent price edit
    function cancelRentPriceEdit(apartmentId, originalPrice) {
        const displayDiv = document.getElementById(`rent-price-display-${apartmentId}`);
        const editDiv = document.getElementById(`rent-price-edit-${apartmentId}`);
        const input = document.getElementById(`rent-price-input-${apartmentId}`);
        
        if (displayDiv && editDiv && input) {
            input.value = originalPrice || '';
            displayDiv.parentElement.style.display = 'flex';
            editDiv.style.display = 'none';
        }
    }

    // Save rent price
    function saveRentPrice(apartmentId) {
        debugManager.log('Saving rent price for apartment:', apartmentId);
        const input = document.getElementById(`rent-price-input-${apartmentId}`);
        const displayDiv = document.getElementById(`rent-price-display-${apartmentId}`);
        const editDiv = document.getElementById(`rent-price-edit-${apartmentId}`);
        
        if (!input || !displayDiv || !editDiv) {
            debugManager.log('ERROR: Missing elements for rent price edit');
            return;
        }
        
        const priceValue = window.parseFormattedNumber(input.value);
        debugManager.log('Parsed price value:', priceValue);
        
        const priceToSave = priceValue !== null ? priceValue : null;
        debugManager.log('Price to save:', priceToSave);
        
        const apartment = getApartmentById(apartmentId);
        if (!apartment) {
            alert('Apartment not found');
            return;
        }
        
        apartment.renting_out_price = priceToSave;
        saveApartmentsToLocalStorage();
        
        const formattedPrice = priceToSave ? parseFloat(priceToSave).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) : '--';
        displayDiv.textContent = `$${formattedPrice}`;
        debugManager.log('Updated display with formatted price:', formattedPrice);
        
        displayDiv.parentElement.style.display = 'flex';
        editDiv.style.display = 'none';
    }

    // Export functions to global scope
    window.toggleApartmentsTable = toggleApartmentsTable;
    window.formatStars = formatStars;
    window.selectHalfStar = selectHalfStar;
    window.selectEditHalfStar = selectEditHalfStar;
    window.updateEditStarColors = updateEditStarColors;
    window.initStarRatings = initStarRatings;
    window.updateStarColors = updateStarColors;
    window.loadAllApartmentsForSelector = loadAllApartmentsForSelector;
    window.loadApartmentRating = loadApartmentRating;
    window.updateApartmentCounterDisplay = updateApartmentCounterDisplay;
    window.renderApartments = renderApartments;
    window.loadAllApartments = loadAllApartments;
    window.toggleApartmentVisibility = toggleApartmentVisibility;
    window.showAllApartments = showAllApartments;
    window.hideAllApartments = hideAllApartments;
    window.lockAllApartments = lockAllApartments;
    window.unlockAllApartments = unlockAllApartments;
    window.toggleApartmentLock = toggleApartmentLock;
    window.loadAllReviews = loadAllReviews;
    window.loadOverview = loadOverview;
    window.loadOverallRating = loadOverallRating;
    window.loadApartments = loadApartments;
    window.editRentPrice = editRentPrice;
    window.cancelRentPriceEdit = cancelRentPriceEdit;
    window.saveRentPrice = saveRentPrice;

})();
