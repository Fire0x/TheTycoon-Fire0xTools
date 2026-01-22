/**
 * Logistics Storage Module
 * Provides unified localStorage-backed storage for logistics (companies, licenses, jobs, config)
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'logisticsData';
    const VERSION = '1.0.0';

    function getDefaultData() {
        return {
            companies: [],
            licenses: [],
            jobs: [],
            config: {
                repBonusPerCompany: 3,
                levelFilterMode: 'below',
                enabledCalculations: {
                    highestMoney: true,
                    bestConvoy: true,
                    bestHazard: true,
                    highestRep: true,
                    highestRepPerCompany: true,
                    highestRepPerMilePerCompany: true
                },
                userLevel: 1
            },
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
                config: { ...getDefaultData().config, ...(parsed.config || {}) }
            };
        } catch (e) {
            return getDefaultData();
        }
    }

    function write(data) {
        const toSave = {
            ...getDefaultData(),
            ...data,
            config: { ...getDefaultData().config, ...(data.config || {}) },
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

    // Migration from old keys (from original site)
    function migrateFromLegacyKeys() {
        const legacyJobsKey = 'logistics_jobs';
        const legacyConfigKey = 'logistics_config';

        const data = read();
        let changed = false;

        // Jobs
        const legacyJobs = localStorage.getItem(legacyJobsKey);
        if (legacyJobs) {
            try {
                const jobs = JSON.parse(legacyJobs);
                if (Array.isArray(jobs) && data.jobs.length === 0) {
                    data.jobs = jobs;
                    changed = true;
                }
            } catch (_) {}
        }

        // Config
        const legacyConfig = localStorage.getItem(legacyConfigKey);
        if (legacyConfig) {
            try {
                const cfg = JSON.parse(legacyConfig);
                data.config = { ...data.config, ...cfg };
                changed = true;
            } catch (_) {}
        }

        if (changed) write(data);
        return read();
    }

    window.LogisticsStorage = {
        STORAGE_KEY,
        VERSION,
        getDefaultData,
        read,
        write,
        update,
        migrateFromLegacyKeys
    };
})();

