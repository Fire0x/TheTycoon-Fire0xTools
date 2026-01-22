/**
 * Fishing Storage Module
 * Provides unified localStorage-backed storage for fishing (locations, fish, rewards)
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'fishingData';
    const VERSION = '1.0.0';

    function getDefaultData() {
        return {
            locations: [],
            fish: [],
            rewards: [],
            version: VERSION
        };
    }

    function read() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return getDefaultData();
            const parsed = JSON.parse(stored);
            return {
                ...getDefaultData(),
                ...parsed,
                locations: Array.isArray(parsed.locations) ? parsed.locations : [],
                fish: Array.isArray(parsed.fish) ? parsed.fish : [],
                rewards: Array.isArray(parsed.rewards) ? parsed.rewards : []
            };
        } catch (e) {
            return getDefaultData();
        }
    }

    function write(data) {
        const toSave = {
            ...getDefaultData(),
            ...data,
            locations: Array.isArray(data.locations) ? data.locations : [],
            fish: Array.isArray(data.fish) ? data.fish : [],
            rewards: Array.isArray(data.rewards) ? data.rewards : [],
            version: VERSION
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        return toSave;
    }

    function update(mutator) {
        const current = read();
        const next = mutator({ ...current }) || current;
        return write(next);
    }

    window.FishingStorage = {
        STORAGE_KEY,
        VERSION,
        getDefaultData,
        read,
        write,
        update
    };
})();
