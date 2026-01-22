// fishing/js/fishing-ui.js
// UI rendering and interaction functions for fishing management

// Escape HTML to prevent XSS and ensure text displays correctly
function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Render location selector dropdown
function renderLocationSelector() {
    const selector = document.getElementById('fishingLocationSelector');
    if (!selector) return;
    
    const locations = window.fishingCore.getLocations();
    
    // Sort locations by fishingIndex (nulls last)
    const sortedLocations = [...locations].sort((a, b) => {
        if (a.fishingIndex === null && b.fishingIndex === null) return 0;
        if (a.fishingIndex === null) return 1;
        if (b.fishingIndex === null) return -1;
        return a.fishingIndex - b.fishingIndex;
    });
    
    // Clear existing options except first two
    selector.innerHTML = '<option value="">-- Select or Create Location --</option><option value="new">➕ Create New Location</option>';
    
    // Add location options
    sortedLocations.forEach(location => {
        const option = document.createElement('option');
        option.value = location.id;
        let indexPart = '';
        if (location.fishingIndex !== null && location.fishingIndexName) {
            indexPart = ` - [${location.fishingIndex}] ${location.fishingIndexName}`;
        } else if (location.fishingIndex !== null) {
            indexPart = ` - [${location.fishingIndex}]`;
        } else if (location.fishingIndexName) {
            indexPart = ` - ${location.fishingIndexName}`;
        }
        const displayText = `${location.locationName || ''}${location.postal ? ` (${location.postal})` : ''}${indexPart}`;
        option.textContent = displayText;
        selector.appendChild(option);
    });
    
    if (window.debug) window.debug.log('🔄 Rendered location selector with', sortedLocations.length, 'locations');
}

// Render location details form
function renderLocationDetails(locationId) {
    const container = document.getElementById('locationDetailsContainer');
    if (!container) return;
    
    if (!locationId) {
        container.style.display = 'none';
        return;
    }
    
    const location = window.fishingCore.getFishingLocationById(locationId);
    if (!location) {
        container.style.display = 'none';
        return;
    }
    
    // Populate form fields
    const nameField = document.getElementById('locationName');
    const postalField = document.getElementById('locationPostal');
    const indexField = document.getElementById('fishingIndex');
    const indexNameField = document.getElementById('fishingIndexName');
    const deleteBtn = document.getElementById('deleteLocationBtn');
    
    if (nameField) nameField.value = location.locationName || '';
    if (postalField) postalField.value = location.postal || '';
    if (indexField) indexField.value = location.fishingIndex !== null ? location.fishingIndex : '';
    if (indexNameField) indexNameField.value = location.fishingIndexName || '';
    if (deleteBtn) deleteBtn.style.display = 'inline-block';
    
    container.style.display = 'block';
    
    // Show fish section and load fish if fishing index exists
    const fishSection = document.getElementById('fishItemsSection');
    const addFishBtn = fishSection ? fishSection.querySelector('button[onclick="openFishModal()"]') : null;
    
    if (fishSection) {
        fishSection.style.display = 'block';
        if (location.fishingIndex !== null) {
            // Enable Add Fish button
            if (addFishBtn) {
                addFishBtn.disabled = false;
                addFishBtn.classList.remove('btn-secondary');
                addFishBtn.classList.add('btn-success');
            }
            renderFishItems(location.fishingIndex);
        } else {
            // Disable Add Fish button and show message
            if (addFishBtn) {
                addFishBtn.disabled = true;
                addFishBtn.classList.remove('btn-success');
                addFishBtn.classList.add('btn-secondary');
            }
            const fishContainer = document.getElementById('fishItemsContainer');
            if (fishContainer) {
                fishContainer.innerHTML = '<p class="text-muted text-center">⚠️ Please set a <strong>Fishing Index</strong> for this location to add fish.</p>';
            }
        }
    }
    
    if (window.debug) window.debug.log('🔄 Rendered location details for:', location.locationName);
}

// Render all locations list
function renderAllLocations() {
    const container = document.getElementById('allLocationsContainer');
    if (!container) return;
    
    const locations = window.fishingCore.getLocations();
    
    if (locations.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No fishing locations yet. Click "Add Location" to create one.</p>';
        return;
    }
    
    // Sort locations by fishingIndex (nulls last)
    const sortedLocations = [...locations].sort((a, b) => {
        if (a.fishingIndex === null && b.fishingIndex === null) return 0;
        if (a.fishingIndex === null) return 1;
        if (b.fishingIndex === null) return -1;
        return a.fishingIndex - b.fishingIndex;
    });
    
    container.innerHTML = sortedLocations.map(location => {
        const escapedId = escapeHtml(location.id);
        const escapedName = escapeHtml(location.locationName || 'Unnamed Location');
        const escapedPostal = location.postal ? escapeHtml(location.postal) : '';
        const escapedIndex = location.fishingIndex !== null ? location.fishingIndex : '';
        const escapedIndexName = location.fishingIndexName ? escapeHtml(location.fishingIndexName) : '';
        return `
        <div class="location-card">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <div class="location-name">${escapedName}</div>
                    ${location.postal ? `<span class="location-postal">📮 ${escapedPostal}</span>` : ''}
                    ${location.fishingIndex !== null ? `<span class="location-index">🎣 Index: ${escapedIndex}${escapedIndexName ? ` (${escapedIndexName})` : ''}</span>` : ''}
                </div>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-primary" onclick="editLocation('${escapedId.replace(/'/g, "\\'")}')">
                        ✏️ Edit
                    </button>
                    <button type="button" class="btn btn-sm btn-danger" onclick="deleteLocationFromList('${escapedId.replace(/'/g, "\\'")}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
    
    if (window.debug) window.debug.log('🔄 Rendered', locations.length, 'locations');
}

// Render all rewards
function renderAllRewards() {
    const container = document.getElementById('rewardsContainer');
    if (!container) return;
    
    const rewards = window.fishingCore.getRewards();
    
    if (rewards.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No fishing rewards yet. Click "Add Reward" to create one.</p>';
        return;
    }
    
    // Sort rewards by level requirement (ascending), with null levels at the end
    const sortedRewards = [...rewards].sort((a, b) => {
        // If both have levels, sort by level
        if (a.levelRequirement !== null && b.levelRequirement !== null) {
            return a.levelRequirement - b.levelRequirement;
        }
        // If only a has a level, a comes first
        if (a.levelRequirement !== null && b.levelRequirement === null) {
            return -1;
        }
        // If only b has a level, b comes first
        if (a.levelRequirement === null && b.levelRequirement !== null) {
            return 1;
        }
        // Both are null, maintain original order
        return 0;
    });
    
    container.innerHTML = sortedRewards.map(reward => {
        const escapedId = escapeHtml(reward.id);
        const escapedItem = escapeHtml(reward.item || 'Unnamed Item');
        const escapedLevel = reward.levelRequirement !== null ? reward.levelRequirement : '';
        const escapedNotes = reward.notes ? escapeHtml(reward.notes) : '';
        const isClaimed = reward.claimed === true;
        const claimedBadge = isClaimed ? '<span class="badge bg-success ms-2">✓ Claimed</span>' : '<span class="badge bg-secondary ms-2">Not Claimed</span>';
        return `
        <div class="reward-card ${isClaimed ? 'claimed-reward' : ''}">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <div class="reward-item">${escapedItem}${claimedBadge}</div>
                    ${reward.levelRequirement !== null ? `<span class="reward-level">📊 Level: ${escapedLevel}</span>` : ''}
                    ${reward.notes ? `<div class="reward-notes">📝 ${escapedNotes}</div>` : ''}
                </div>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-primary" onclick="editReward('${escapedId.replace(/'/g, "\\'")}')">
                        ✏️ Edit
                    </button>
                    <button type="button" class="btn btn-sm btn-danger" onclick="deleteRewardFromList('${escapedId.replace(/'/g, "\\'")}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
    
    if (window.debug) window.debug.log('🔄 Rendered', rewards.length, 'rewards');
}

// Open location modal
window.openLocationModal = function(locationId = null) {
    const modal = new bootstrap.Modal(document.getElementById('locationModal'));
    const title = document.getElementById('locationModalTitle');
    const form = document.getElementById('locationForm');
    const idField = document.getElementById('locationId');
    
    // Reset form
    if (form) form.reset();
    
    if (locationId) {
        // Edit mode
        const location = window.fishingCore.getFishingLocationById(locationId);
        if (location) {
            if (title) title.textContent = 'Edit Fishing Location';
            if (idField) idField.value = location.id;
            if (document.getElementById('modalLocationName')) document.getElementById('modalLocationName').value = location.locationName || '';
            if (document.getElementById('modalLocationPostal')) document.getElementById('modalLocationPostal').value = location.postal || '';
            if (document.getElementById('modalFishingIndex')) document.getElementById('modalFishingIndex').value = location.fishingIndex !== null ? location.fishingIndex : '';
            if (document.getElementById('modalFishingIndexName')) document.getElementById('modalFishingIndexName').value = location.fishingIndexName || '';
        }
    } else {
        // Add mode
        if (title) title.textContent = 'Add Fishing Location';
        if (idField) idField.value = '';
    }
    
    modal.show();
};

// Open reward modal
window.openRewardModal = function(rewardId = null) {
    const modal = new bootstrap.Modal(document.getElementById('rewardModal'));
    const title = document.getElementById('rewardModalTitle');
    const form = document.getElementById('rewardForm');
    const idField = document.getElementById('rewardId');
    
    // Reset form
    if (form) form.reset();
    
    if (rewardId) {
        // Edit mode
        const reward = window.fishingCore.getFishingRewardById(rewardId);
        if (reward) {
            if (title) title.textContent = 'Edit Fishing Reward';
            if (idField) idField.value = reward.id;
            if (document.getElementById('rewardItem')) document.getElementById('rewardItem').value = reward.item || '';
            if (document.getElementById('rewardLevelRequirement')) document.getElementById('rewardLevelRequirement').value = reward.levelRequirement !== null ? reward.levelRequirement : '';
            if (document.getElementById('rewardNotes')) document.getElementById('rewardNotes').value = reward.notes || '';
            if (document.getElementById('rewardClaimed')) document.getElementById('rewardClaimed').checked = reward.claimed === true;
        }
    } else {
        // Add mode
        if (title) title.textContent = 'Add Fishing Reward';
        if (idField) idField.value = '';
        if (document.getElementById('rewardClaimed')) document.getElementById('rewardClaimed').checked = false;
    }
    
    modal.show();
};

// Load location data when selector changes
window.loadLocationData = function() {
    const selector = document.getElementById('fishingLocationSelector');
    if (!selector) return;
    
    const selectedValue = selector.value;
    
    if (selectedValue === 'new') {
        openLocationModal();
        selector.value = '';
        return;
    }
    
    if (selectedValue === '') {
        renderLocationDetails(null);
        return;
    }
    
    renderLocationDetails(selectedValue);
};

// Save location data from form
window.saveLocationData = function() {
    const selector = document.getElementById('fishingLocationSelector');
    const nameField = document.getElementById('locationName');
    const postalField = document.getElementById('locationPostal');
    const indexField = document.getElementById('fishingIndex');
    const indexNameField = document.getElementById('fishingIndexName');
    
    if (!selector || !nameField) return;
    
    const locationId = selector.value;
    if (!locationId) {
        alert('Please select a location first or create a new one.');
        return;
    }
    
    const locationData = {
        locationName: nameField.value.trim(),
        postal: postalField ? postalField.value.trim() : '',
        fishingIndex: indexField && indexField.value ? parseInt(indexField.value) : null,
        fishingIndexName: indexNameField ? indexNameField.value.trim() : ''
    };
    
    if (!locationData.locationName) {
        alert('Location name is required.');
        return;
    }
    
    try {
        const updated = window.fishingCore.updateFishingLocation(locationId, locationData);
        if (updated) {
            renderLocationSelector();
            renderAllLocations();
            alert('Location data saved successfully!');
        } else {
            alert('Error saving location data.');
        }
    } catch (error) {
        console.error('Error saving location:', error);
        alert('Error saving location data: ' + error.message);
    }
};

// Save location from modal
window.saveLocationFromModal = function() {
    const form = document.getElementById('locationForm');
    if (!form || !form.checkValidity()) {
        if (form) form.reportValidity();
        return;
    }
    
    const idField = document.getElementById('locationId');
    const nameField = document.getElementById('modalLocationName');
    const postalField = document.getElementById('modalLocationPostal');
    const indexField = document.getElementById('modalFishingIndex');
    const indexNameField = document.getElementById('modalFishingIndexName');
    
    if (!nameField) return;
    
    const locationData = {
        locationName: nameField.value.trim(),
        postal: postalField ? postalField.value.trim() : '',
        fishingIndex: indexField && indexField.value ? parseInt(indexField.value) : null,
        fishingIndexName: indexNameField ? indexNameField.value.trim() : ''
    };
    
    if (!locationData.locationName) {
        alert('Location name is required.');
        return;
    }
    
    const locationId = idField ? idField.value : null;
    
    try {
        if (locationId) {
            // Update existing
            const updated = window.fishingCore.updateFishingLocation(locationId, locationData);
            if (updated) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('locationModal'));
                if (modal) modal.hide();
                renderLocationSelector();
                renderLocationDetails(locationId);
                renderAllLocations();
            }
        } else {
            // Create new
            const newLocation = window.fishingCore.createFishingLocation(locationData);
            if (newLocation) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('locationModal'));
                if (modal) modal.hide();
                renderLocationSelector();
                // Select the new location
                const selector = document.getElementById('fishingLocationSelector');
                if (selector) {
                    selector.value = newLocation.id;
                    renderLocationDetails(newLocation.id);
                }
                renderAllLocations();
            }
        }
    } catch (error) {
        console.error('Error saving location:', error);
        alert('Error saving location: ' + error.message);
    }
};

// Save reward from modal
window.saveRewardFromModal = function() {
    const form = document.getElementById('rewardForm');
    if (!form || !form.checkValidity()) {
        if (form) form.reportValidity();
        return;
    }
    
    const idField = document.getElementById('rewardId');
    const itemField = document.getElementById('rewardItem');
    const levelField = document.getElementById('rewardLevelRequirement');
    const notesField = document.getElementById('rewardNotes');
    const claimedField = document.getElementById('rewardClaimed');
    
    if (!itemField) return;
    
    const rewardData = {
        item: itemField.value.trim(),
        levelRequirement: levelField && levelField.value ? parseInt(levelField.value) : null,
        notes: notesField ? notesField.value.trim() : '',
        claimed: claimedField ? claimedField.checked : false
    };
    
    if (!rewardData.item) {
        alert('Item name is required.');
        return;
    }
    
    const rewardId = idField ? idField.value : null;
    
    try {
        if (rewardId) {
            // Update existing
            const updated = window.fishingCore.updateFishingReward(rewardId, rewardData);
            if (updated) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('rewardModal'));
                if (modal) modal.hide();
                renderAllRewards();
            }
        } else {
            // Create new
            const newReward = window.fishingCore.createFishingReward(rewardData);
            if (newReward) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('rewardModal'));
                if (modal) modal.hide();
                renderAllRewards();
            }
        }
    } catch (error) {
        console.error('Error saving reward:', error);
        alert('Error saving reward: ' + error.message);
    }
};

// Delete location
window.deleteLocation = function() {
    const selector = document.getElementById('fishingLocationSelector');
    if (!selector || !selector.value) {
        alert('Please select a location to delete.');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this location?')) {
        return;
    }
    
    try {
        const deleted = window.fishingCore.deleteFishingLocation(selector.value);
        if (deleted) {
            selector.value = '';
            renderLocationDetails(null);
            renderLocationSelector();
            renderAllLocations();
            alert('Location deleted successfully!');
        } else {
            alert('Error deleting location.');
        }
    } catch (error) {
        console.error('Error deleting location:', error);
        alert('Error deleting location: ' + error.message);
    }
};

// Edit location from list
window.editLocation = function(locationId) {
    const selector = document.getElementById('fishingLocationSelector');
    if (selector) selector.value = locationId;
    renderLocationDetails(locationId);
    // Scroll to location details container instead of top
    const container = document.getElementById('locationDetailsContainer');
    if (container && container.style.display !== 'none') {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// Delete location from list
window.deleteLocationFromList = function(locationId) {
    if (!confirm('Are you sure you want to delete this location?')) {
        return;
    }
    
    try {
        const deleted = window.fishingCore.deleteFishingLocation(locationId);
        if (deleted) {
            const selector = document.getElementById('fishingLocationSelector');
            if (selector && selector.value === locationId) {
                selector.value = '';
                renderLocationDetails(null);
            }
            renderLocationSelector();
            renderAllLocations();
        }
    } catch (error) {
        console.error('Error deleting location:', error);
        alert('Error deleting location: ' + error.message);
    }
};

// Edit reward from list
window.editReward = function(rewardId) {
    openRewardModal(rewardId);
};

// Delete reward from list
window.deleteRewardFromList = function(rewardId) {
    if (!confirm('Are you sure you want to delete this reward?')) {
        return;
    }
    
    try {
        const deleted = window.fishingCore.deleteFishingReward(rewardId);
        if (deleted) {
            renderAllRewards();
        }
    } catch (error) {
        console.error('Error deleting reward:', error);
        alert('Error deleting reward: ' + error.message);
    }
};

// Render fish for a fishing index
function renderFishItems(fishingIndex) {
    const container = document.getElementById('fishItemsContainer');
    const section = document.getElementById('fishItemsSection');
    if (!container || !section) return;
    
    if (fishingIndex === null || fishingIndex === undefined) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    container.innerHTML = '<p class="text-muted text-center">Loading fish...</p>';
    
    try {
        // Load fish for this index
        const fish = window.fishingFishCore.loadFishByIndex(fishingIndex);
        
        if (fish.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No fish yet. Click "Add Fish" to create one.</p>';
            return;
        }
        
        // Sort fish by id to ensure consistent order (matching database ORDER BY id)
        const sortedFish = [...fish].sort((a, b) => {
            const idA = parseInt(a.id) || 0;
            const idB = parseInt(b.id) || 0;
            return idA - idB;
        });
        
        container.innerHTML = `
            <div class="row">
                ${sortedFish.map(f => {
                    const escapedId = escapeHtml(f.id);
                    const escapedName = escapeHtml(f.fishName || 'Unnamed Fish');
                    const escapedSize = f.fishSize ? escapeHtml(f.fishSize) : '';
                    const escapedRarity = f.fishRarity ? escapeHtml(f.fishRarity) : '';
                    const escapedNotes = f.notes ? escapeHtml(f.notes) : '';
                    return `
                    <div class="col-md-3 col-sm-6 mb-3">
                        <div class="fish-card card h-100">
                            <div class="card-body">
                                <h6 class="card-title fw-bold mb-2">${escapedName}</h6>
                                <div class="d-flex gap-1 mb-2 flex-wrap">
                                    ${escapedSize ? `<span class="badge bg-info">📏 ${escapedSize}</span>` : ''}
                                    ${escapedRarity ? `<span class="badge bg-warning text-dark">⭐ ${escapedRarity}</span>` : ''}
                                </div>
                                ${escapedNotes ? `<p class="card-text text-muted small mb-3">${escapedNotes}</p>` : '<div class="mb-3"></div>'}
                                <div class="d-flex gap-2">
                                    <button type="button" class="btn btn-sm btn-primary flex-fill" onclick="editFish('${escapedId.replace(/'/g, "\\'")}')">
                                        ✏️ Edit
                                    </button>
                                    <button type="button" class="btn btn-sm btn-danger flex-fill" onclick="deleteFishFromList('${escapedId.replace(/'/g, "\\'")}')">
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                }).join('')}
            </div>
        `;
        
        if (window.debug) window.debug.log('🔄 Rendered', fish.length, 'fish for index', fishingIndex);
    } catch (error) {
        console.error('Error rendering fish:', error);
        container.innerHTML = '<p class="text-danger text-center">Error loading fish.</p>';
    }
}

// Open fish modal
window.openFishModal = function(fishId = null, fishingIndex = null) {
    const modal = new bootstrap.Modal(document.getElementById('fishModal'));
    const title = document.getElementById('fishModalTitle');
    const form = document.getElementById('fishForm');
    const idField = document.getElementById('fishId');
    const indexField = document.getElementById('fishFishingIndex');
    
    // Reset form
    if (form) form.reset();
    
    // Set fishing index if provided, otherwise try to get from current location
    if (fishingIndex !== null && indexField) {
        indexField.value = fishingIndex;
    } else if (!fishId) {
        // Try to get fishing index from current location
        const selector = document.getElementById('fishingLocationSelector');
        if (selector && selector.value) {
            const location = window.fishingCore.getFishingLocationById(selector.value);
            if (location && location.fishingIndex !== null && indexField) {
                indexField.value = location.fishingIndex;
            } else if (!location || location.fishingIndex === null) {
                // No fishing index set - show alert
                alert('Please set a Fishing Index for this location before adding fish.');
                return;
            }
        } else {
            // No location selected
            alert('Please select a location with a Fishing Index before adding fish.');
            return;
        }
    }
    
    if (fishId) {
        // Edit mode
        const fish = window.fishingFishCore.getFishById(fishId);
        if (fish) {
            if (title) title.textContent = 'Edit Fish';
            if (idField) idField.value = fish.id;
            if (indexField) indexField.value = fish.fishingIndex !== null ? fish.fishingIndex : '';
            if (document.getElementById('fishName')) document.getElementById('fishName').value = fish.fishName || '';
            if (document.getElementById('fishSize')) document.getElementById('fishSize').value = fish.fishSize || '';
            if (document.getElementById('fishRarity')) document.getElementById('fishRarity').value = fish.fishRarity || '';
            if (document.getElementById('fishNotes')) document.getElementById('fishNotes').value = fish.notes || '';
        }
    } else {
        // Add mode
        if (title) title.textContent = 'Add Fish';
        if (idField) idField.value = '';
    }
    
    modal.show();
};

// Save fish from modal
window.saveFishFromModal = function() {
    const form = document.getElementById('fishForm');
    if (!form || !form.checkValidity()) {
        if (form) form.reportValidity();
        return;
    }
    
    const idField = document.getElementById('fishId');
    const indexField = document.getElementById('fishFishingIndex');
    const nameField = document.getElementById('fishName');
    const sizeField = document.getElementById('fishSize');
    const rarityField = document.getElementById('fishRarity');
    const notesField = document.getElementById('fishNotes');
    
    if (!nameField || !indexField) return;
    
    // Parse fishing index - handle 0 as valid value
    const fishingIndexValue = indexField.value.trim();
    const fishingIndex = fishingIndexValue === '' ? null : parseInt(fishingIndexValue);
    
    const fishData = {
        fishingIndex: isNaN(fishingIndex) ? null : fishingIndex,
        fishName: nameField.value.trim(),
        fishSize: sizeField ? sizeField.value.trim() : '',
        fishRarity: rarityField ? rarityField.value.trim() : '',
        notes: notesField ? notesField.value.trim() : ''
    };
    
    if (!fishData.fishName) {
        alert('Fish name is required.');
        return;
    }
    
    if (fishData.fishingIndex === null || fishData.fishingIndex === undefined || isNaN(fishData.fishingIndex)) {
        alert('Fishing index is required and must be a valid number.');
        return;
    }
    
    const fishId = idField ? idField.value : null;
    
    try {
        if (fishId) {
            // Update existing
            const updated = window.fishingFishCore.updateFish(fishId, fishData);
            if (updated) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('fishModal'));
                if (modal) modal.hide();
                // Reload fish for this index
                renderFishItems(fishData.fishingIndex);
                // Reload all fish to update cache
                window.fishingFishCore.loadFishingFish();
            }
        } else {
            // Create new
            const newFish = window.fishingFishCore.createFish(fishData);
            if (newFish) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('fishModal'));
                if (modal) modal.hide();
                // Reload fish for this index
                renderFishItems(fishData.fishingIndex);
            }
        }
    } catch (error) {
        console.error('Error saving fish:', error);
        alert('Error saving fish: ' + error.message);
    }
};

// Edit fish from list
window.editFish = function(fishId) {
    const fish = window.fishingFishCore.getFishById(fishId);
    if (fish) {
        openFishModal(fishId, fish.fishingIndex);
    }
};

// Delete fish from list
window.deleteFishFromList = function(fishId) {
    if (!confirm('Are you sure you want to delete this fish?')) {
        return;
    }
    
    try {
        const fish = window.fishingFishCore.getFishById(fishId);
        const fishingIndex = fish ? fish.fishingIndex : null;
        
        const deleted = window.fishingFishCore.deleteFish(fishId);
        if (deleted) {
            // Reload fish for this index
            if (fishingIndex !== null) {
                renderFishItems(fishingIndex);
            }
            // Reload all fish to update cache
            window.fishingFishCore.loadFishingFish();
        }
    } catch (error) {
        console.error('Error deleting fish:', error);
        alert('Error deleting fish: ' + error.message);
    }
};

// Toggle fish paste area
window.toggleFishPasteArea = function() {
    const pasteArea = document.getElementById('fishPasteArea');
    if (pasteArea) {
        pasteArea.style.display = pasteArea.style.display === 'none' ? 'block' : 'none';
        if (pasteArea.style.display === 'block') {
            const input = document.getElementById('fishPasteInput');
            if (input) input.value = '';
        }
    }
};

// Parse fish data from pasted text
function parseFishData(text, fishingIndex) {
    if (!text || !text.trim()) return [];
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const fishData = [];
    const sizeKeywords = ['small', 'medium', 'large', 'tiny', 'huge', 'giant', 'mini'];
    const rarityKeywords = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'secret fish'];
    
    // Skip header lines
    const skipHeaders = ['📖 fish index', 'back', '×', 'fish index'];
    let pastHeader = false;
    
    // Skip footer patterns
    const footerPattern = /\d+\s*\/\s*\d+\s*discovered/i;
    
    let currentFish = null;
    let expectingName = false; // Track if we just saw 🐟 and are expecting a name
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip if it's a footer line
        if (footerPattern.test(line)) {
            break; // Stop parsing at footer
        }
        
        // Check if we've passed the header
        const lowerLine = line.toLowerCase();
        if (!pastHeader) {
            if (skipHeaders.some(header => lowerLine.includes(header))) {
                continue; // Skip header lines
            }
            // Skip location names (usually single words or short phrases, not fish-related)
            if (!line.includes('🐟') && !line.includes('❓') && !line.includes('???') && 
                line.length < 30 && !sizeKeywords.some(s => lowerLine.includes(s)) &&
                !rarityKeywords.some(r => lowerLine.includes(r))) {
                // Might be a location name, skip it
                pastHeader = true;
                continue;
            }
            pastHeader = true;
        }
        
        // Skip single question mark separators (but not "???")
        if (line === '❓' || line === '?' || (line.match(/^[?❓]+$/) && line !== '???')) {
            continue;
        }
        
        // Handle "???" placeholders
        if (line === '???') {
            // Check if next non-empty line is "Secret Fish"
            let nextLine = '';
            let nextLineIndex = i + 1;
            // Skip separators to find the next actual content
            while (nextLineIndex < lines.length) {
                const candidate = lines[nextLineIndex].trim();
                if (candidate && candidate !== '❓' && candidate !== '?' && !candidate.match(/^[?❓]+$/)) {
                    nextLine = candidate;
                    break;
                }
                nextLineIndex++;
            }
            const nextLineLower = nextLine.toLowerCase();
            
            if (nextLineLower === 'secret fish') {
                // Secret placeholder: name = "???", rarity = "Secret Fish"
                fishData.push({
                    fishingIndex: fishingIndex,
                    fishName: '???',
                    fishSize: '',
                    fishRarity: 'Secret Fish',
                    notes: ''
                });
                // Skip to after "Secret Fish"
                i = nextLineIndex;
            } else {
                // Non-secret placeholder: just name = "???"
                // Save immediately - it's always a standalone entry
                fishData.push({
                    fishingIndex: fishingIndex,
                    fishName: '???',
                    fishSize: '',
                    fishRarity: '',
                    notes: ''
                });
            }
            continue;
        }
        
        // Check if line is a size
        const isSize = sizeKeywords.some(size => lowerLine === size || lowerLine.includes(size));
        
        // Check if line is a rarity
        const isRarity = rarityKeywords.some(rarity => lowerLine === rarity);
        
        // Check if line contains fish emoji
        const hasFishEmoji = line.includes('🐟') || line.includes('🐠') || line.includes('🐡');
        
        // If line has fish emoji, prepare for new fish
        if (hasFishEmoji) {
            // Save previous fish if exists and complete
            if (currentFish && currentFish.fishName && currentFish.fishName !== '???') {
                fishData.push(currentFish);
            }
            // Set flag that we're expecting a name next
            expectingName = true;
            currentFish = {
                fishingIndex: fishingIndex,
                fishName: '',
                fishSize: '',
                fishRarity: '',
                notes: ''
            };
        } 
        // If we're expecting a name (just saw 🐟)
        else if (expectingName && currentFish) {
            if (line.length > 0 && !isSize && !isRarity) {
                currentFish.fishName = line;
                expectingName = false;
            }
        }
        // If we have a current fish with a name, assign size/rarity
        else if (currentFish && currentFish.fishName && currentFish.fishName !== '???') {
            if (isSize && !currentFish.fishSize) {
                currentFish.fishSize = line;
            } else if (isRarity && !currentFish.fishRarity) {
                currentFish.fishRarity = line;
                // After rarity, this fish is complete, save it
                fishData.push(currentFish);
                currentFish = null;
                expectingName = false;
            }
        }
    }
    
    // Add last fish if it has a name
    if (currentFish && currentFish.fishName) {
        fishData.push(currentFish);
    }
    
    return fishData;
}

// Parse and import fish from pasted text
window.parseAndImportFish = function() {
    const input = document.getElementById('fishPasteInput');
    if (!input || !input.value.trim()) {
        alert('Please paste fish data first!');
        return;
    }
    
    // Get current fishing index
    const selector = document.getElementById('fishingLocationSelector');
    if (!selector || !selector.value) {
        alert('Please select a location with a Fishing Index first!');
        return;
    }
    
    const location = window.fishingCore.getFishingLocationById(selector.value);
    if (!location || location.fishingIndex === null) {
        alert('Please set a Fishing Index for this location first!');
        return;
    }
    
    const fishingIndex = location.fishingIndex;
    const text = input.value;
    
    if (window.debug) window.debug.log('Parsing fish data for index:', fishingIndex);
    
    const parsedFish = parseFishData(text, fishingIndex);
    
    if (parsedFish.length === 0) {
        alert('No valid fish data found. Please check the format.');
        return;
    }
    
    // Get existing fish for this index
    const existingFish = window.fishingFishCore.loadFishByIndex(fishingIndex);
    const existingFishMap = new Map();
    existingFish.forEach(f => {
        existingFishMap.set(f.fishName.toLowerCase(), f);
    });
    
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Process each parsed fish
    for (const fishData of parsedFish) {
        if (!fishData.fishName || fishData.fishName.trim() === '') {
            continue;
        }
        
        const fishNameLower = fishData.fishName.toLowerCase();
        const existing = existingFishMap.get(fishNameLower);
        
        if (existing) {
            // Check if anything changed
            const hasChanges = 
                (fishData.fishSize && fishData.fishSize !== (existing.fishSize || '')) ||
                (fishData.fishRarity && fishData.fishRarity !== (existing.fishRarity || '')) ||
                (fishData.notes && fishData.notes !== (existing.notes || ''));
            
            if (hasChanges) {
                try {
                    const updateData = {};
                    if (fishData.fishSize) updateData.fishSize = fishData.fishSize;
                    if (fishData.fishRarity) updateData.fishRarity = fishData.fishRarity;
                    if (fishData.notes) updateData.notes = fishData.notes;
                    
                    window.fishingFishCore.updateFish(existing.id, {
                        fishingIndex: existing.fishingIndex,
                        fishName: existing.fishName,
                        ...updateData
                    });
                    updatedCount++;
                } catch (error) {
                    console.error('Error updating fish:', error);
                }
            } else {
                skippedCount++;
            }
        } else {
            // Create new fish
            try {
                window.fishingFishCore.createFish(fishData);
                createdCount++;
            } catch (error) {
                console.error('Error creating fish:', error);
            }
        }
    }
    
    // Clear input
    input.value = '';
    
    // Hide paste area
    toggleFishPasteArea();
    
    // Reload fish items
    renderFishItems(fishingIndex);
    window.fishingFishCore.loadFishingFish();
    
    // Show results
    const message = `Import complete!\n` +
                   `✅ Created: ${createdCount}\n` +
                   `✏️ Updated: ${updatedCount}\n` +
                   `⏭️ Skipped: ${skippedCount}`;
    alert(message);
    
    if (window.debug) window.debug.log(`Imported ${createdCount} new, updated ${updatedCount}, skipped ${skippedCount} fish`);
};

// Render all fish (read-only view without edit/delete buttons)
function renderAllFish() {
    const container = document.getElementById('allFishContainer');
    if (!container) return;
    
    container.innerHTML = '<p class="text-muted text-center">Loading fish...</p>';
    
    try {
        // Load all fish
        const allFish = window.fishingFishCore.loadFishingFish();
        
        if (allFish.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No fish yet.</p>';
            return;
        }
        
        // Sort fish by fishing_index, then by id
        const sortedFish = [...allFish].sort((a, b) => {
            const indexA = a.fishingIndex !== null ? a.fishingIndex : 999999;
            const indexB = b.fishingIndex !== null ? b.fishingIndex : 999999;
            if (indexA !== indexB) {
                return indexA - indexB;
            }
            const idA = parseInt(a.id) || 0;
            const idB = parseInt(b.id) || 0;
            return idA - idB;
        });
        
        // Count discovered fish (non-placeholder fish)
        const discoveredCount = sortedFish.filter(f => f.fishName !== '???').length;
        const totalCount = sortedFish.length;
        
        // Group fish by fishing index
        const fishByIndex = {};
        sortedFish.forEach(fish => {
            const index = fish.fishingIndex !== null ? fish.fishingIndex : 'No Index';
            if (!fishByIndex[index]) {
                fishByIndex[index] = [];
            }
            fishByIndex[index].push(fish);
        });
        
        // Get location names for each index
        const locations = window.fishingCore.getLocations();
        const indexToLocation = {};
        locations.forEach(loc => {
            if (loc.fishingIndex !== null) {
                indexToLocation[loc.fishingIndex] = loc;
            }
        });
        
        // Render summary at the top
        let html = `
            <div class="alert alert-info mb-4 text-center">
                <h4 class="mb-0">🐟 Total Fish Discovery: <strong>${discoveredCount} / ${totalCount}</strong></h4>
            </div>
        `;
        
        // Render grouped by index with collapse functionality
        const sortedIndexes = Object.keys(fishByIndex).sort((a, b) => {
            if (a === 'No Index') return 1;
            if (b === 'No Index') return -1;
            return parseInt(a) - parseInt(b);
        });
        
        sortedIndexes.forEach((index, idx) => {
            const fish = fishByIndex[index];
            const location = indexToLocation[index];
            const indexName = location && location.fishingIndexName ? location.fishingIndexName : '';
            const locationName = location ? location.locationName : '';
            const collapseId = `collapse-index-${index === 'No Index' ? 'none' : index}`;
            const headingId = `heading-index-${index === 'No Index' ? 'none' : index}`;
            const fishCount = fish.length;
            const discoveredInIndex = fish.filter(f => f.fishName !== '???').length;
            
            html += `
                <div class="card mb-3">
                    <div class="card-header" id="${headingId}">
                        <button class="btn btn-link text-decoration-none text-white w-100 text-start p-0" 
                                type="button" 
                                data-bs-toggle="collapse" 
                                data-bs-target="#${collapseId}" 
                                aria-expanded="${idx === 0 ? 'true' : 'false'}" 
                                aria-controls="${collapseId}">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">
                                    🎣 Fishing Index: ${index === 'No Index' ? 'No Index' : `[${index}]`} 
                                    ${indexName ? `- ${escapeHtml(indexName)}` : ''}
                                    ${locationName ? `(${escapeHtml(locationName)})` : ''}
                                </h5>
                                <div class="d-flex align-items-center gap-2">
                                    <span class="badge bg-light text-dark">${discoveredInIndex} / ${fishCount}</span>
                                    <span class="text-white">${idx === 0 ? '▼' : '▶'}</span>
                                </div>
                            </div>
                        </button>
                    </div>
                    <div id="${collapseId}" 
                         class="collapse ${idx === 0 ? 'show' : ''}" 
                         aria-labelledby="${headingId}">
                        <div class="card-body">
                            <div class="row">
                                ${fish.map(f => {
                                    const escapedName = escapeHtml(f.fishName || 'Unnamed Fish');
                                    const escapedSize = f.fishSize ? escapeHtml(f.fishSize) : '';
                                    const escapedRarity = f.fishRarity ? escapeHtml(f.fishRarity) : '';
                                    const escapedNotes = f.notes ? escapeHtml(f.notes) : '';
                                    return `
                                    <div class="col-md-3 col-sm-6 mb-3">
                                        <div class="fish-card card h-100">
                                            <div class="card-body">
                                                <h6 class="card-title fw-bold mb-2">${escapedName}</h6>
                                                <div class="d-flex gap-1 mb-2 flex-wrap">
                                                    ${escapedSize ? `<span class="badge bg-info">📏 ${escapedSize}</span>` : ''}
                                                    ${escapedRarity ? `<span class="badge bg-warning text-dark">⭐ ${escapedRarity}</span>` : ''}
                                                </div>
                                                ${escapedNotes ? `<p class="card-text text-muted small mb-0">${escapedNotes}</p>` : ''}
                                            </div>
                                        </div>
                                    </div>
                                `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        if (window.debug) window.debug.log('🔄 Rendered', sortedFish.length, 'fish across', Object.keys(fishByIndex).length, 'indexes');
    } catch (error) {
        console.error('Error rendering all fish:', error);
        container.innerHTML = '<p class="text-danger text-center">Error loading fish.</p>';
    }
}

// Copy JSON to clipboard
window.copyFishingJson = function(elementId) {
    const textarea = document.getElementById(elementId);
    if (textarea) {
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices
        try {
            document.execCommand('copy');
            alert('✅ Copied to clipboard!');
        } catch (err) {
            // Fallback for modern browsers
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textarea.value).then(() => {
                    alert('✅ Copied to clipboard!');
                }).catch(() => {
                    alert('❌ Failed to copy. Please select and copy manually.');
                });
            } else {
                alert('❌ Failed to copy. Please select and copy manually.');
            }
        }
    }
};

// Export render functions
window.fishingUI = {
    renderLocationSelector,
    renderLocationDetails,
    renderAllLocations,
    renderAllRewards,
    renderFishItems,
    renderAllFish
};
