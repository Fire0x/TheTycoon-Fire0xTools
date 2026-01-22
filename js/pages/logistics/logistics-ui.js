// logistics/js/logistics-ui.js
// Render job cards and analysis sections

// Cache DOM elements
let cachedElements = {
    jobsContainer: null,
    emptyState: null,
    analysisSection: null,
    userLevelInput: null
};

// Initialize cached elements
window.initCachedElements = function() {
    cachedElements.jobsContainer = document.getElementById('jobsContainer');
    cachedElements.emptyState = document.getElementById('emptyState');
    cachedElements.analysisSection = document.getElementById('analysisSection');
    cachedElements.userLevelInput = document.getElementById('userLevelInput');
    
    if (window.debug) {
        window.debug.log('Cached elements initialized:', {
            jobsContainer: !!cachedElements.jobsContainer,
            emptyState: !!cachedElements.emptyState,
            analysisSection: !!cachedElements.analysisSection,
            userLevelInput: !!cachedElements.userLevelInput
        });
    }
    
    return cachedElements.jobsContainer && cachedElements.emptyState;
};

// Initialize on load
function ensureCachedElements() {
    if (!window.initCachedElements()) {
        setTimeout(() => {
            if (!window.initCachedElements() && window.debug) {
                window.debug.warn('Elements still not found after retry');
            }
        }, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureCachedElements);
} else {
    ensureCachedElements();
}

// Escape HTML
window.escapeHtml = function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Get user level
function getUserLevel() {
    const input = cachedElements.userLevelInput;
    if (!input) return 0;
    return parseInt(input.value) || 0;
}

// Update level filter
window.updateLevelFilter = function() {
    if (window.debug) window.debug.log('Level filter updated');
    
    // Save userLevel to localStorage
    const userLevel = getUserLevel();
    if (typeof LogisticsStorage !== 'undefined') {
        LogisticsStorage.update(data => {
            if (!data.config) data.config = {};
            data.config.userLevel = userLevel || 1;
            return data;
        });
        if (window.debug) window.debug.log(`Saved userLevel: ${userLevel} to localStorage`);
    }
    
    window.renderJobs();
    window.renderAnalysis();
};

// Render jobs
window.renderJobs = function() {
    if (window.debug) window.debug.log('=== RENDER JOBS STARTED ===');
    
    let jobs = window.getAllJobs() || [];
    const userLevel = getUserLevel();
    
    // Filter by level
    if (userLevel > 0) {
        jobs = window.filterByLevel(jobs, userLevel);
    }
    
    if (window.debug) window.debug.log(`Rendering ${jobs.length} job(s)`);
    
    let container = cachedElements.jobsContainer;
    let emptyState = cachedElements.emptyState;
    
    if (!container || !emptyState) {
        if (window.debug) window.debug.warn('Cached elements not found, reinitializing...');
        window.initCachedElements();
        container = cachedElements.jobsContainer;
        emptyState = cachedElements.emptyState;
    }
    
    if (!container || !emptyState) {
        if (window.debug) window.debug.error('Container or emptyState not found!');
        return;
    }
    
    if (jobs.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        if (window.debug) window.debug.log('No jobs to render, showing empty state');
        return;
    }
    
    emptyState.style.display = 'none';
    
    const html = jobs.map(job => {
        const escapedName = window.escapeHtml(job.jobName || 'Unknown');
        const escapedCompany = window.escapeHtml(job.company || '');
        const escapedDestination = window.escapeHtml(job.destination || '');
        const escapedDistance = window.escapeHtml(job.distanceRaw || `${job.distance} km`);
        
        // Job type badges
        const jobTypeBadges = job.jobType.map(type => {
            const badgeClass = type.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
            return `<span class="job-type-badge ${badgeClass}">${window.escapeHtml(type)}</span>`;
        }).join('');
        
        // Level indicator
        const levelClass = userLevel > 0 && job.level > userLevel ? 'too-low' : 'available';
        const levelText = userLevel > 0 && job.level > userLevel ? 'Level Too Low' : `Lvl ${job.level}`;
        
        return `
            <div class="card job-card" id="job-${job.id}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h4 class="card-title mb-1">${escapedName}</h4>
                            <p class="text-muted mb-0 small">ID: ${job.id}</p>
                        </div>
                        <div class="text-end">
                            <span class="level-indicator ${levelClass}">${levelText}</span>
                            ${job.edited ? '<span class="badge bg-warning ms-2">Edited</span>' : ''}
                        </div>
                    </div>
                    ${jobTypeBadges ? `<div class="mb-2">${jobTypeBadges}</div>` : ''}
                    <hr>
                    <div class="job-info">
                        <strong>Company:</strong>
                        <span class="ms-2">${escapedCompany}</span>
                    </div>
                    <div class="job-info">
                        <strong>Destination:</strong>
                        <span class="ms-2">${escapedDestination}</span>
                    </div>
                    <div class="job-info">
                        <strong>💰 Money:</strong>
                        <span class="ms-2">$${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.money) : job.money.toLocaleString('en-US')}</span>
                    </div>
                    <div class="job-info">
                        <strong>🎯 XP:</strong>
                        <span class="ms-2">${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.xp) : job.xp.toLocaleString('en-US')}</span>
                    </div>
                    <div class="job-info">
                        <strong>⭐ REP:</strong>
                        <span class="ms-2">${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.rep) : job.rep.toLocaleString('en-US')}</span>
                    </div>
                    <div class="job-info">
                        <strong>📏 Distance:</strong>
                        <span class="ms-2">${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(parseFloat(job.distance.toFixed(1))) : job.distance.toFixed(1)} km</span>
                    </div>
                    ${job.timeDuration ? `
                    <div class="job-info">
                        <strong>⏱️ Time:</strong>
                        <span class="ms-2">${window.escapeHtml(job.timeDuration)}${job.timeDateTime ? ` (${window.escapeHtml(job.timeDateTime)})` : ''}</span>
                    </div>
                    ` : ''}
                    <div class="job-info">
                        <strong>Level:</strong>
                        <span class="ms-2">${job.level}</span>
                    </div>
                    <hr>
                    <button class="btn btn-danger btn-sm" onclick="removeJobById('${job.id}')">🗑️ Remove Job</button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `<div class="job-cards-grid">${html}</div>`;
    
    if (window.debug) window.debug.log(`Rendered ${jobs.length} job(s) to DOM`);
    if (window.debug) window.debug.log('=== RENDER JOBS COMPLETED ===');
};

// Update job field
window.updateJobField = function(jobId, field, value) {
    const numValue = field === 'distance' ? parseFloat(value) : parseInt(value);
    
    if (field === 'company' || field === 'destination') {
        window.updateJob(jobId, { [field]: value });
        window.renderAnalysis();
        return;
    }
    
    if (!isNaN(numValue)) {
        window.updateJob(jobId, { [field]: numValue });
        window.renderAnalysis();
    }
};

// Remove job by ID
window.removeJobById = function(jobId) {
    if (confirm('Are you sure you want to remove this job?')) {
        window.removeJob(jobId);
        window.renderJobs();
        window.renderAnalysis();
    }
};

// Render analysis
window.renderAnalysis = function() {
    if (window.debug) window.debug.log('=== RENDER ANALYSIS STARTED ===');
    
    let jobs = window.getAllJobs() || [];
    const userLevel = getUserLevel();
    
    // Filter by level
    if (userLevel > 0) {
        jobs = window.filterByLevel(jobs, userLevel);
    }
    
    if (jobs.length === 0) {
        const section = cachedElements.analysisSection;
        if (section) {
            section.style.display = 'none';
        }
        return;
    }
    
    const section = cachedElements.analysisSection;
    if (section) {
        section.style.display = 'block';
    }
    
    const config = window.LogisticsConfig || {};
    const enabled = config.enabledCalculations || {};
    
    // Calculate analyses (only if enabled)
    if (enabled.highestMoney !== false) {
        const bestMoney = window.calculateBestMoney(jobs);
        const moneyContainer = document.getElementById('highestMoneyContainer');
        if (moneyContainer) {
            if (bestMoney.length === 0) {
                moneyContainer.innerHTML = '<p class="text-muted">No jobs found.</p>';
            } else {
                moneyContainer.innerHTML = bestMoney.slice(0, 10).map((job, idx) => `
                    <div class="analysis-card ${idx < 3 ? 'top-3' : ''}">
                        <div class="card-header">
                            <strong>${window.escapeHtml(job.jobName || 'Unknown')}</strong>
                        </div>
                        <div class="value-display">$${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.money) : job.money.toLocaleString('en-US')}</div>
                        <div class="job-details">
                            <div>Distance: ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(parseFloat(job.distance.toFixed(1))) : job.distance.toFixed(1)} km</div>
                            <div>XP: ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.xp) : job.xp.toLocaleString('en-US')} | REP: ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.rep) : job.rep.toLocaleString('en-US')}</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }
    
    if (enabled.bestConvoy !== false) {
        const bestConvoy = window.calculateBestConvoy(jobs);
        const convoyContainer = document.getElementById('bestConvoyContainer');
        if (convoyContainer) {
            if (bestConvoy.length === 0) {
                convoyContainer.innerHTML = '<p class="text-muted">No convoy jobs found.</p>';
            } else {
                convoyContainer.innerHTML = bestConvoy.slice(0, 10).map((job, idx) => `
                    <div class="analysis-card ${idx < 3 ? 'top-3' : ''}">
                        <div class="card-header">
                            <strong>${window.escapeHtml(job.jobName || 'Unknown')}</strong>
                        </div>
                        <div class="value-display">${window.formatRatio(job.overallRating)}</div>
                        <div class="job-details">
                            <div>Overall Rating: ($${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.money) : job.money.toLocaleString('en-US')} + ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.xp) : job.xp.toLocaleString('en-US')} XP + ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.rep) : job.rep.toLocaleString('en-US')} REP) / ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(parseFloat(job.distance.toFixed(1))) : job.distance.toFixed(1)} km</div>
                            <div>Distance: ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(parseFloat(job.distance.toFixed(1))) : job.distance.toFixed(1)} km</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }
    
    if (enabled.bestHazard !== false) {
        const bestHazard = window.calculateBestHazard(jobs);
        const hazardContainer = document.getElementById('bestHazardContainer');
        if (hazardContainer) {
            if (bestHazard.length === 0) {
                hazardContainer.innerHTML = '<p class="text-muted">No hazard jobs found.</p>';
            } else {
                hazardContainer.innerHTML = bestHazard.slice(0, 10).map((job, idx) => `
                    <div class="analysis-card ${idx < 3 ? 'top-3' : ''}">
                        <div class="card-header">
                            <strong>${window.escapeHtml(job.jobName || 'Unknown')}</strong>
                        </div>
                        <div class="value-display">${window.formatRatio(job.overallRating)}</div>
                        <div class="job-details">
                            <div>Overall Rating: ($${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.money) : job.money.toLocaleString('en-US')} + ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.xp) : job.xp.toLocaleString('en-US')} XP + ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.rep) : job.rep.toLocaleString('en-US')} REP) / ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(parseFloat(job.distance.toFixed(1))) : job.distance.toFixed(1)} km</div>
                            <div>Distance: ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(parseFloat(job.distance.toFixed(1))) : job.distance.toFixed(1)} km</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }
    
    if (enabled.highestRep !== false) {
        const highestRep = window.calculateHighestRep(jobs);
        const repOnlyContainer = document.getElementById('highestRepOnlyContainer');
        if (repOnlyContainer) {
            if (highestRep.length === 0) {
                repOnlyContainer.innerHTML = '<p class="text-muted">No jobs found.</p>';
            } else {
                repOnlyContainer.innerHTML = highestRep.slice(0, 10).map((job, idx) => `
                    <div class="analysis-card ${idx < 3 ? 'top-3' : ''}">
                        <div class="card-header">
                            <strong>${window.escapeHtml(job.jobName || 'Unknown')}</strong>
                        </div>
                        <div class="value-display">${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.rep) : job.rep.toLocaleString('en-US')} REP</div>
                        <div class="job-details">
                            <div>Money: $${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.money) : job.money.toLocaleString('en-US')} | XP: ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.xp) : job.xp.toLocaleString('en-US')}</div>
                            <div>Distance: ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(parseFloat(job.distance.toFixed(1))) : job.distance.toFixed(1)} km</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }
    
    if (enabled.highestRepPerCompany !== false) {
        const bestRep = window.calculateBestRepPerDistance(jobs);
        const repContainer = document.getElementById('highestRepContainer');
        if (repContainer) {
            if (bestRep.length === 0) {
                repContainer.innerHTML = '<p class="text-muted">No jobs found.</p>';
            } else {
                const repBonus = config.repBonusPerCompany || 0;
                repContainer.innerHTML = bestRep.slice(0, 10).map((job, idx) => `
                    <div class="analysis-card ${idx < 3 ? 'top-3' : ''}">
                        <div class="card-header">
                            <strong>${window.escapeHtml(job.company || 'Unknown')}</strong>
                            <br><small class="text-muted">${window.escapeHtml(job.jobName || '')}</small>
                        </div>
                        <div class="value-display">${window.formatRatio(job.repPerKm)}</div>
                        <div class="job-details">
                            <div>Rep per km: ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.repWithBonus || job.rep) : (job.repWithBonus || job.rep).toLocaleString('en-US')} REP${repBonus > 0 ? ` (+${repBonus} bonus)` : ''} / ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(parseFloat(job.distance.toFixed(1))) : job.distance.toFixed(1)} km</div>
                            <div>Money: $${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.money) : job.money.toLocaleString('en-US')} | XP: ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.xp) : job.xp.toLocaleString('en-US')}</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }
    
    if (enabled.highestRepPerMilePerCompany !== false) {
        const bestRepPerMile = window.calculateBestRepPerMilePerCompany(jobs);
        const repPerMileContainer = document.getElementById('highestRepPerMileContainer');
        if (repPerMileContainer) {
            if (bestRepPerMile.length === 0) {
                repPerMileContainer.innerHTML = '<p class="text-muted">No jobs found.</p>';
            } else {
                const repBonus = config.repBonusPerCompany || 0;
                repPerMileContainer.innerHTML = bestRepPerMile.slice(0, 10).map((job, idx) => `
                    <div class="analysis-card ${idx < 3 ? 'top-3' : ''}">
                        <div class="card-header">
                            <strong>${window.escapeHtml(job.company || 'Unknown')}</strong>
                            <br><small class="text-muted">${window.escapeHtml(job.jobName || '')}</small>
                        </div>
                        <div class="value-display">${window.formatRatio(job.repPerMile)}</div>
                        <div class="job-details">
                            <div>Rep per mile: ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.repWithBonus || job.rep) : (job.repWithBonus || job.rep).toLocaleString('en-US')} REP${repBonus > 0 ? ` (+${repBonus} bonus)` : ''} / ${window.formatRatio(job.distanceInMiles)} miles</div>
                            <div>Money: $${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.money) : job.money.toLocaleString('en-US')} | XP: ${window.NumberFormatter ? window.NumberFormatter.formatNumberDisplay(job.xp) : job.xp.toLocaleString('en-US')}</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }
    
    if (window.debug) window.debug.log('=== RENDER ANALYSIS COMPLETED ===');
};

// Clear all jobs and refresh
window.clearAllJobsAndRefresh = function() {
    if (window.clearAllJobs && window.clearAllJobs()) {
        window.renderJobs();
        window.renderAnalysis();
    }
};

// Update rep bonus
window.updateRepBonus = function() {
    const input = document.getElementById('repBonusInput');
    if (input && window.LogisticsConfig) {
        window.LogisticsConfig.repBonusPerCompany = parseInt(input.value) || 0;
        window.LogisticsConfig.save();
        window.renderAnalysis();
    }
};

// Update level filter mode
window.updateLevelFilterMode = function() {
    const checked = document.querySelector('input[name="levelFilterMode"]:checked');
    if (checked && window.LogisticsConfig) {
        window.LogisticsConfig.levelFilterMode = checked.value;
        window.LogisticsConfig.save();
        
        // Update help text
        const levelFilterHelp = document.getElementById('levelFilterHelp');
        if (levelFilterHelp) {
            levelFilterHelp.textContent = checked.value === 'exact' 
                ? 'Only jobs at your exact level will be shown'
                : 'Only jobs at or below this level will be shown';
        }
        
        window.renderJobs();
        window.renderAnalysis();
    }
};// Toggle calculation
window.toggleCalculation = function(calcName) {
    if (window.LogisticsConfig) {
        const checkbox = document.getElementById(`calc${calcName.charAt(0).toUpperCase() + calcName.slice(1)}`);
        if (checkbox) {
            window.LogisticsConfig.enabledCalculations[calcName] = checkbox.checked;
            window.LogisticsConfig.save();
            window.renderAnalysis();
        }
    }
};
