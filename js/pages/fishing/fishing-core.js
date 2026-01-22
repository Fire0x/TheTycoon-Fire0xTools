// fishing/js/fishing-core.js
// Core data management for fishing locations and rewards (localStorage)

// Initialize fishing data structures
let fishingLocations = [];
let fishingRewards = [];

// Generate unique ID
function generateId() {
    return 'fish_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Load fishing locations from localStorage
function loadFishingLocations() {
    try {
        if (typeof FishingStorage === 'undefined') {
            if (window.debug) window.debug.error('FishingStorage API not available');
            fishingLocations = [];
            return fishingLocations;
        }
        
        const data = FishingStorage.read();
        fishingLocations = data.locations || [];
        
        if (window.debug) window.debug.log('✅ Loaded', fishingLocations.length, 'fishing locations from localStorage');
        return fishingLocations;
    } catch (error) {
        console.error('Error loading fishing locations:', error);
        fishingLocations = [];
        if (window.debug) window.debug.error('❌ Error loading fishing locations:', error);
        return fishingLocations;
    }
}

// Load fishing rewards from localStorage
function loadFishingRewards() {
    try {
        if (typeof FishingStorage === 'undefined') {
            if (window.debug) window.debug.error('FishingStorage API not available');
            fishingRewards = [];
            return fishingRewards;
        }
        
        const data = FishingStorage.read();
        fishingRewards = data.rewards || [];
        
        if (window.debug) window.debug.log('✅ Loaded', fishingRewards.length, 'fishing rewards from localStorage');
        return fishingRewards;
    } catch (error) {
        console.error('Error loading fishing rewards:', error);
        fishingRewards = [];
        if (window.debug) window.debug.error('❌ Error loading fishing rewards:', error);
        return fishingRewards;
    }
}

// Get fishing location by ID
function getFishingLocationById(id) {
    return fishingLocations.find(loc => loc.id === id.toString());
}

// Get fishing location by name
function getFishingLocationByName(name) {
    return fishingLocations.find(loc => loc.locationName === name);
}

// Get fishing reward by ID
function getFishingRewardById(id) {
    return fishingRewards.find(reward => reward.id === id.toString());
}

// Create new fishing location
function createFishingLocation(locationData) {
    try {
        if (typeof FishingStorage === 'undefined') {
            throw new Error('FishingStorage API not available');
        }
        
        const newLocation = {
            id: generateId(),
            locationName: locationData.locationName || '',
            postal: locationData.postal || '',
            fishingIndex: locationData.fishingIndex !== null && locationData.fishingIndex !== undefined ? locationData.fishingIndex : null,
            fishingIndexName: locationData.fishingIndexName || ''
        };
        
        // Update local cache
        fishingLocations.push(newLocation);
        
        // Save to localStorage
        FishingStorage.update(data => {
            data.locations = [...fishingLocations];
            return data;
        });
        
        if (window.debug) window.debug.log('➕ Created fishing location:', newLocation);
        return newLocation;
    } catch (error) {
        console.error('Error creating fishing location:', error);
        if (window.debug) window.debug.error('❌ Error creating fishing location:', error);
        throw error;
    }
}

// Update fishing location
function updateFishingLocation(id, locationData) {
    try {
        if (typeof FishingStorage === 'undefined') {
            throw new Error('FishingStorage API not available');
        }
        
        const index = fishingLocations.findIndex(loc => loc.id === id.toString());
        if (index === -1) {
            if (window.debug) window.debug.error('❌ Location not found:', id);
            return null;
        }
        
        const updatedLocation = {
            ...fishingLocations[index],
            locationName: locationData.locationName || fishingLocations[index].locationName,
            postal: locationData.postal !== undefined ? locationData.postal : fishingLocations[index].postal,
            fishingIndex: locationData.fishingIndex !== null && locationData.fishingIndex !== undefined ? locationData.fishingIndex : fishingLocations[index].fishingIndex,
            fishingIndexName: locationData.fishingIndexName !== undefined ? locationData.fishingIndexName : fishingLocations[index].fishingIndexName
        };
        
        // Update local cache
        fishingLocations[index] = updatedLocation;
        
        // Save to localStorage
        FishingStorage.update(data => {
            data.locations = [...fishingLocations];
            return data;
        });
        
        if (window.debug) window.debug.log('✏️ Updated fishing location:', updatedLocation);
        return updatedLocation;
    } catch (error) {
        console.error('Error updating fishing location:', error);
        if (window.debug) window.debug.error('❌ Error updating fishing location:', error);
        throw error;
    }
}

// Delete fishing location
function deleteFishingLocation(id) {
    try {
        if (typeof FishingStorage === 'undefined') {
            if (window.debug) window.debug.error('FishingStorage API not available');
            return false;
        }
        
        const index = fishingLocations.findIndex(loc => loc.id === id.toString());
        if (index === -1) {
            if (window.debug) window.debug.error('❌ Location not found:', id);
            return false;
        }
        
        // Update local cache
        fishingLocations.splice(index, 1);
        
        // Save to localStorage
        FishingStorage.update(data => {
            data.locations = [...fishingLocations];
            return data;
        });
        
        if (window.debug) window.debug.log('🗑️ Deleted fishing location:', id);
        return true;
    } catch (error) {
        console.error('Error deleting fishing location:', error);
        if (window.debug) window.debug.error('❌ Error deleting fishing location:', error);
        return false;
    }
}

// Create new fishing reward
function createFishingReward(rewardData) {
    try {
        if (typeof FishingStorage === 'undefined') {
            throw new Error('FishingStorage API not available');
        }
        
        const newReward = {
            id: generateId(),
            item: rewardData.item || '',
            levelRequirement: rewardData.levelRequirement !== null && rewardData.levelRequirement !== undefined ? rewardData.levelRequirement : null,
            notes: rewardData.notes || '',
            claimed: rewardData.claimed === true || rewardData.claimed === 1
        };
        
        // Update local cache
        fishingRewards.push(newReward);
        
        // Save to localStorage
        FishingStorage.update(data => {
            data.rewards = [...fishingRewards];
            return data;
        });
        
        if (window.debug) window.debug.log('➕ Created fishing reward:', newReward);
        return newReward;
    } catch (error) {
        console.error('Error creating fishing reward:', error);
        if (window.debug) window.debug.error('❌ Error creating fishing reward:', error);
        throw error;
    }
}

// Update fishing reward
function updateFishingReward(id, rewardData) {
    try {
        if (typeof FishingStorage === 'undefined') {
            throw new Error('FishingStorage API not available');
        }
        
        const index = fishingRewards.findIndex(reward => reward.id === id.toString());
        if (index === -1) {
            if (window.debug) window.debug.error('❌ Reward not found:', id);
            return null;
        }
        
        const updatedReward = {
            ...fishingRewards[index],
            item: rewardData.item !== undefined ? rewardData.item : fishingRewards[index].item,
            levelRequirement: rewardData.levelRequirement !== null && rewardData.levelRequirement !== undefined ? rewardData.levelRequirement : fishingRewards[index].levelRequirement,
            notes: rewardData.notes !== undefined ? rewardData.notes : fishingRewards[index].notes,
            claimed: rewardData.claimed !== undefined ? (rewardData.claimed === true || rewardData.claimed === 1) : fishingRewards[index].claimed
        };
        
        // Update local cache
        fishingRewards[index] = updatedReward;
        
        // Save to localStorage
        FishingStorage.update(data => {
            data.rewards = [...fishingRewards];
            return data;
        });
        
        if (window.debug) window.debug.log('✏️ Updated fishing reward:', updatedReward);
        return updatedReward;
    } catch (error) {
        console.error('Error updating fishing reward:', error);
        if (window.debug) window.debug.error('❌ Error updating fishing reward:', error);
        throw error;
    }
}

// Delete fishing reward
function deleteFishingReward(id) {
    try {
        if (typeof FishingStorage === 'undefined') {
            if (window.debug) window.debug.error('FishingStorage API not available');
            return false;
        }
        
        const index = fishingRewards.findIndex(reward => reward.id === id.toString());
        if (index === -1) {
            if (window.debug) window.debug.error('❌ Reward not found:', id);
            return false;
        }
        
        // Update local cache
        fishingRewards.splice(index, 1);
        
        // Save to localStorage
        FishingStorage.update(data => {
            data.rewards = [...fishingRewards];
            return data;
        });
        
        if (window.debug) window.debug.log('🗑️ Deleted fishing reward:', id);
        return true;
    } catch (error) {
        console.error('Error deleting fishing reward:', error);
        if (window.debug) window.debug.error('❌ Error deleting fishing reward:', error);
        return false;
    }
}

// Export functions to window for global access
window.fishingCore = {
    loadFishingLocations,
    loadFishingRewards,
    getFishingLocationById,
    getFishingLocationByName,
    getFishingRewardById,
    createFishingLocation,
    updateFishingLocation,
    deleteFishingLocation,
    createFishingReward,
    updateFishingReward,
    deleteFishingReward,
    getLocations: () => fishingLocations,
    getRewards: () => fishingRewards
};
