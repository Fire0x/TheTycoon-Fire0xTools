/**
 * Fishing Storage Module
 * Provides unified localStorage-backed storage for fishing (locations, fish, rewards)
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'fishingData';
    const VERSION = '1.0.0';

    function getDefaultData() {
        // Default fishing locations (converted from database format)
        const defaultLocations = [
            {
                id: '1',
                locationName: 'Del Perro Pier',
                postal: '688',
                fishingIndex: 0,
                fishingIndexName: 'Amazon River'
            },
            {
                id: '2',
                locationName: 'Paleto Cove',
                postal: '154',
                fishingIndex: 1,
                fishingIndexName: 'Great Barrier Reef'
            },
            {
                id: '3',
                locationName: 'Northern Islands',
                postal: '001',
                fishingIndex: 2,
                fishingIndexName: 'Loch Ness'
            },
            {
                id: '4',
                locationName: 'Pacific Ocean (Near Pelato)',
                postal: '012',
                fishingIndex: 7,
                fishingIndexName: 'Alaskan Waters'
            },
            {
                id: '5',
                locationName: 'San Andreas (North East Pelato)',
                postal: '071',
                fishingIndex: 8,
                fishingIndexName: 'Nile River'
            },
            {
                id: '6',
                locationName: 'Light House lane (Gordo Lighthouse)',
                postal: '081',
                fishingIndex: 3,
                fishingIndexName: 'Caribbean Sea'
            },
            {
                id: '7',
                locationName: 'Catfish View',
                postal: '086',
                fishingIndex: 4,
                fishingIndexName: 'Norweigian Fjord'
            },
            {
                id: '8',
                locationName: 'Sanchianki Island (East of)',
                postal: '336',
                fishingIndex: 9,
                fishingIndexName: 'Pacific Deep'
            },
            {
                id: '9',
                locationName: 'Taviam Arch',
                postal: '556',
                fishingIndex: 5,
                fishingIndexName: 'Mississippi Delta'
            },
            {
                id: '10',
                locationName: 'South Beach Del Perro',
                postal: '690',
                fishingIndex: 6,
                fishingIndexName: 'Coral Bay'
            }
        ];

        // Default fishing rewards (converted from database format)
        const defaultRewards = [
            {
                id: '1',
                item: 'Dinghy (Small)',
                levelRequirement: 10,
                notes: 'dinghy2',
                claimed: false
            },
            {
                id: '2',
                item: 'Dinghy',
                levelRequirement: 20,
                notes: 'Dinghy',
                claimed: false
            },
            {
                id: '3',
                item: 'Dinghy (Sport)',
                levelRequirement: 30,
                notes: 'dinghy3',
                claimed: false
            },
            {
                id: '4',
                item: 'Dinghy (Rescue)',
                levelRequirement: 40,
                notes: 'dinghy4',
                claimed: false
            },
            {
                id: '5',
                item: 'Jetmax',
                levelRequirement: 50,
                notes: 'jetmax',
                claimed: false
            },
            {
                id: '6',
                item: 'Longfin',
                levelRequirement: 60,
                notes: 'longfin',
                claimed: false
            },
            {
                id: '7',
                item: 'Marquis',
                levelRequirement: 70,
                notes: 'speeder2',
                claimed: false
            },
            {
                id: '8',
                item: 'Speeder (Classic)',
                levelRequirement: 90,
                notes: 'speeder',
                claimed: false
            },
            {
                id: '9',
                item: 'Squalo',
                levelRequirement: 100,
                notes: 'squalo',
                claimed: false
            },
            {
                id: '10',
                item: 'Toro (Sport)',
                levelRequirement: 110,
                notes: 'toro2',
                claimed: false
            },
            {
                id: '11',
                item: 'Patrol Boat',
                levelRequirement: 130,
                notes: 'patrolboat',
                claimed: false
            }
        ];

        return {
            locations: defaultLocations,
            fish: [],
            rewards: defaultRewards,
            version: VERSION
        };
    }

    function read() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                // No stored data - return defaults and save them
                const defaults = getDefaultData();
                write(defaults);
                return defaults;
            }
            const parsed = JSON.parse(stored);
            const result = {
                ...getDefaultData(),
                ...parsed,
                locations: Array.isArray(parsed.locations) ? parsed.locations : [],
                fish: Array.isArray(parsed.fish) ? parsed.fish : [],
                rewards: Array.isArray(parsed.rewards) ? parsed.rewards : []
            };
            
            // If locations array is empty, populate with defaults
            if (result.locations.length === 0) {
                result.locations = getDefaultData().locations;
            }
            
            // If rewards array is empty, populate with defaults
            if (result.rewards.length === 0) {
                result.rewards = getDefaultData().rewards;
            }
            
            // Save if we added defaults
            if (result.locations.length === getDefaultData().locations.length && 
                result.rewards.length === getDefaultData().rewards.length) {
                write(result);
            }
            
            return result;
        } catch (e) {
            // Error parsing - return defaults and save them
            const defaults = getDefaultData();
            write(defaults);
            return defaults;
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
