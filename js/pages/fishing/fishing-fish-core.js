// fishing/js/fishing-fish-core.js
// Core data management for fish items linked to fishing indexes (localStorage)

// Initialize fish data structure
let fishingFish = [];

// Generate unique ID
function generateFishId() {
    return 'fish_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Load all fish from localStorage
function loadFishingFish() {
    try {
        if (typeof FishingStorage === 'undefined') {
            if (window.debug) window.debug.error('FishingStorage API not available');
            fishingFish = [];
            return fishingFish;
        }
        
        const data = FishingStorage.read();
        fishingFish = data.fish || [];
        
        if (window.debug) window.debug.log('✅ Loaded', fishingFish.length, 'fish items from localStorage');
        return fishingFish;
    } catch (error) {
        console.error('Error loading fish:', error);
        fishingFish = [];
        if (window.debug) window.debug.error('❌ Error loading fish:', error);
        return fishingFish;
    }
}

// Load fish by fishing index (filter from in-memory array)
function loadFishByIndex(fishingIndex) {
    try {
        // Ensure fish are loaded
        if (fishingFish.length === 0) {
            loadFishingFish();
        }
        
        const fish = fishingFish.filter(f => f.fishingIndex === fishingIndex);
        if (window.debug) window.debug.log('✅ Loaded', fish.length, 'fish items for index', fishingIndex);
        return fish;
    } catch (error) {
        console.error('Error loading fish by index:', error);
        if (window.debug) window.debug.error('❌ Error loading fish by index:', error);
        return [];
    }
}

// Get fish by ID
function getFishById(id) {
    return fishingFish.find(fish => fish.id === id.toString());
}

// Get fish by fishing index
function getFishByIndex(fishingIndex) {
    return fishingFish.filter(fish => fish.fishingIndex === fishingIndex);
}

// Create new fish item
function createFish(fishData) {
    try {
        if (typeof FishingStorage === 'undefined') {
            throw new Error('FishingStorage API not available');
        }
        
        // Handle fishingIndex - 0 is a valid value, so check for null/undefined/NaN specifically
        let fishing_index = null;
        if (fishData.fishingIndex !== null && fishData.fishingIndex !== undefined && !isNaN(fishData.fishingIndex)) {
            fishing_index = parseInt(fishData.fishingIndex);
        }
        
        const newFish = {
            id: generateFishId(),
            fishingIndex: fishing_index,
            fishName: fishData.fishName || '',
            fishSize: fishData.fishSize || '',
            fishRarity: fishData.fishRarity || '',
            notes: fishData.notes || ''
        };
        
        // Update local cache
        fishingFish.push(newFish);
        
        // Save to localStorage
        FishingStorage.update(data => {
            data.fish = [...fishingFish];
            return data;
        });
        
        if (window.debug) window.debug.log('➕ Created fish item:', newFish);
        return newFish;
    } catch (error) {
        console.error('Error creating fish:', error);
        if (window.debug) window.debug.error('❌ Error creating fish:', error);
        throw error;
    }
}

// Update fish item
function updateFish(id, fishData) {
    try {
        if (typeof FishingStorage === 'undefined') {
            throw new Error('FishingStorage API not available');
        }
        
        const index = fishingFish.findIndex(fish => fish.id === id.toString());
        if (index === -1) {
            if (window.debug) window.debug.error('❌ Fish not found:', id);
            return null;
        }
        
        // Handle fishingIndex - 0 is a valid value
        let fishing_index = fishingFish[index].fishingIndex;
        if (fishData.fishingIndex !== null && fishData.fishingIndex !== undefined && !isNaN(fishData.fishingIndex)) {
            fishing_index = parseInt(fishData.fishingIndex);
        } else if (fishData.fishingIndex === null || fishData.fishingIndex === undefined) {
            // Keep existing value if not provided
            fishing_index = fishingFish[index].fishingIndex;
        }
        
        const updatedFish = {
            ...fishingFish[index],
            fishingIndex: fishing_index,
            fishName: fishData.fishName !== undefined ? fishData.fishName : fishingFish[index].fishName,
            fishSize: fishData.fishSize !== undefined ? fishData.fishSize : fishingFish[index].fishSize,
            fishRarity: fishData.fishRarity !== undefined ? fishData.fishRarity : fishingFish[index].fishRarity,
            notes: fishData.notes !== undefined ? fishData.notes : fishingFish[index].notes
        };
        
        // Update local cache
        fishingFish[index] = updatedFish;
        
        // Save to localStorage
        FishingStorage.update(data => {
            data.fish = [...fishingFish];
            return data;
        });
        
        if (window.debug) window.debug.log('✏️ Updated fish item:', updatedFish);
        return updatedFish;
    } catch (error) {
        console.error('Error updating fish:', error);
        if (window.debug) window.debug.error('❌ Error updating fish:', error);
        throw error;
    }
}

// Delete fish item
function deleteFish(id) {
    try {
        if (typeof FishingStorage === 'undefined') {
            if (window.debug) window.debug.error('FishingStorage API not available');
            return false;
        }
        
        const index = fishingFish.findIndex(fish => fish.id === id.toString());
        if (index === -1) {
            if (window.debug) window.debug.error('❌ Fish not found:', id);
            return false;
        }
        
        // Update local cache
        fishingFish.splice(index, 1);
        
        // Save to localStorage
        FishingStorage.update(data => {
            data.fish = [...fishingFish];
            return data;
        });
        
        if (window.debug) window.debug.log('🗑️ Deleted fish item:', id);
        return true;
    } catch (error) {
        console.error('Error deleting fish:', error);
        if (window.debug) window.debug.error('❌ Error deleting fish:', error);
        return false;
    }
}

// Export functions to window for global access
window.fishingFishCore = {
    loadFishingFish,
    loadFishByIndex,
    getFishById,
    getFishByIndex: (index) => getFishByIndex(index),
    createFish,
    updateFish,
    deleteFish,
    getFish: () => fishingFish
};
