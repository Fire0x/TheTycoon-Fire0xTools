// logistics/js/logistics-core.js
// Core data and storage

// Store jobs array (loaded from LogisticsStorage)
let jobs = [];

// Generate unique ID
function generateId() {
    return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Save to localStorage using LogisticsStorage API
window.saveToStorage = function() {
    try {
        if (typeof LogisticsStorage === 'undefined') {
            if (window.debug) window.debug.error('LogisticsStorage API not available');
            return;
        }
        
        // Update jobs in unified storage
        LogisticsStorage.update(data => {
            data.jobs = [...jobs];
            return data;
        });
        
        if (window.debug) window.debug.log(`Saved ${jobs.length} job(s) to storage`);
    } catch (error) {
        if (window.debug) window.debug.error('Error saving to storage:', error);
    }
};

// Load from localStorage using LogisticsStorage API
window.loadFromStorage = function() {
    if (window.debug) window.debug.log('Loading jobs from storage...');
    
    try {
        if (typeof LogisticsStorage === 'undefined') {
            if (window.debug) window.debug.error('LogisticsStorage API not available');
            jobs = [];
            return;
        }
        
        // Migrate from legacy keys if needed
        LogisticsStorage.migrateFromLegacyKeys();
        
        // Load from unified storage
        const data = LogisticsStorage.read();
        jobs = data.jobs || [];
        
        if (window.debug) window.debug.log(`Loaded ${jobs.length} job(s) from storage`);
    } catch (e) {
        if (window.debug) window.debug.error('Error loading from storage:', e);
        jobs = [];
    }
};

// Add job
window.addJob = function(jobData) {
    const job = {
        id: jobData.id || generateId(),
        company: jobData.company || '',
        destination: jobData.destination || '',
        jobName: jobData.jobName || (jobData.company && jobData.destination ? `${jobData.company} to ${jobData.destination}` : ''),
        money: jobData.money || 0,
        xp: jobData.xp || 0,
        rep: jobData.rep || 0,
        level: jobData.level || 1,
        distance: jobData.distance || 0,
        distanceRaw: jobData.distanceRaw || '',
        jobType: jobData.jobType || [],
        status: jobData.status || 'Accept Job',
        timeDuration: jobData.timeDuration || '',
        timeDateTime: jobData.timeDateTime || null,
        timeRaw: jobData.timeRaw || '',
        parsedAt: jobData.parsedAt || new Date().toISOString(),
        edited: jobData.edited || false
    };
    
    jobs.push(job);
    window.saveToStorage();
    
    if (window.debug) window.debug.log(`Added job: ${job.jobName} (ID: ${job.id})`);
    
    return job;
};

// Remove job
window.removeJob = function(jobId) {
    const index = jobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
        const job = jobs[index];
        jobs.splice(index, 1);
        window.saveToStorage();
        
        if (window.debug) window.debug.log(`Removed job: ${job.jobName} (ID: ${jobId})`);
        return true;
    }
    return false;
};

// Update job
window.updateJob = function(jobId, updates) {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
        Object.assign(job, updates);
        // Update jobName if company or destination changed
        if (updates.company || updates.destination) {
            job.jobName = `${job.company} to ${job.destination}`;
        }
        job.edited = true;
        window.saveToStorage();
        
        if (window.debug) window.debug.log(`Updated job: ${job.jobName} (ID: ${jobId})`, updates);
        return job;
    }
    return null;
};

// Get all jobs
window.getAllJobs = function() {
    return jobs;
};

// Clear all jobs
window.clearAllJobs = function() {
    if (confirm('Are you sure you want to clear ALL jobs? This cannot be undone.')) {
        jobs = [];
        window.saveToStorage();
        
        if (window.debug) window.debug.log('Cleared all jobs');
        return true;
    }
    return false;
};

// Export for use in other modules
// Initialize window.jobs if not already set
if (!window.jobs) {
    window.jobs = jobs;
}

// Update the local jobs variable when window.jobs changes
Object.defineProperty(window, 'jobs', {
    get: function() {
        return jobs;
    },
    set: function(value) {
        jobs = value;
    },
    configurable: true
});
