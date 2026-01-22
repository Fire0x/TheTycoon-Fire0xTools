// logistics/js/logistics-calculations.js
// Calculate best money, convoy ratings, rep per distance

// Filter jobs by level (updated to support exact or below)
window.filterByLevel = function(jobs, userLevel) {
    if (!userLevel || userLevel <= 0) {
        return jobs; // Return all if no level specified
    }
    
    const mode = window.LogisticsConfig?.levelFilterMode || 'below';
    let filtered;
    
    if (mode === 'exact') {
        filtered = jobs.filter(job => job.level === userLevel);
    } else {
        filtered = jobs.filter(job => job.level <= userLevel);
    }
    
    if (window.debug) {
        window.debug.log(`Filtered ${jobs.length} jobs to ${filtered.length} jobs (level ${mode === 'exact' ? '==' : '<='} ${userLevel})`);
    }
    
    return filtered;
};

// Calculate best money (highest first)
window.calculateBestMoney = function(jobs) {
    if (window.debug) window.debug.log('Calculating best money...');
    
    const sorted = [...jobs].sort((a, b) => b.money - a.money);
    
    if (window.debug && sorted.length > 0) {
        window.debug.log(`Top money job: ${sorted[0].jobName} - $${sorted[0].money}`);
    }
    
    return sorted;
};

// Calculate best convoy overall rating
window.calculateBestConvoy = function(jobs) {
    if (window.debug) window.debug.log('Calculating best convoy ratings...');
    
    // Filter to only convoy jobs
    const convoyJobs = jobs.filter(job => 
        job.jobType.some(type => type.includes('CONVOY'))
    );
    
    if (window.debug) window.debug.log(`Found ${convoyJobs.length} convoy job(s)`);
    
    // Calculate overall rating per distance: (Money + XP + Rep) / distance
    const jobsWithRating = convoyJobs.map(job => {
        const rating = job.distance > 0 
            ? (job.money + job.xp + job.rep) / job.distance 
            : 0;
        return {
            ...job,
            overallRating: rating
        };
    });
    
    // Sort by rating (highest first)
    const sorted = jobsWithRating.sort((a, b) => b.overallRating - a.overallRating);
    
    if (window.debug && sorted.length > 0) {
        window.debug.log(`Top convoy job: ${sorted[0].jobName} - Rating: ${sorted[0].overallRating.toFixed(2)}`);
    }
    
    return sorted;
};

// Calculate best hazard jobs (ADR_4 or similar hazard types)
window.calculateBestHazard = function(jobs) {
    if (window.debug) window.debug.log('Calculating best hazard jobs...');
    
    // Filter to only hazard jobs (ADR_4 or jobs with HAZARD in jobType)
    const hazardJobs = jobs.filter(job => 
        job.jobType.some(type => 
            type.includes('ADR') || 
            type.includes('HAZARD') || 
            type.includes('HAZARDOUS')
        )
    );
    
    if (window.debug) window.debug.log(`Found ${hazardJobs.length} hazard job(s)`);
    
    // Calculate overall rating per distance: (Money + XP + Rep) / distance
    const jobsWithRating = hazardJobs.map(job => {
        const rating = job.distance > 0 
            ? (job.money + job.xp + job.rep) / job.distance 
            : 0;
        return {
            ...job,
            overallRating: rating
        };
    });
    
    // Sort by rating (highest first)
    const sorted = jobsWithRating.sort((a, b) => b.overallRating - a.overallRating);
    
    if (window.debug && sorted.length > 0) {
        window.debug.log(`Top hazard job: ${sorted[0].jobName} - Rating: ${sorted[0].overallRating.toFixed(2)}`);
    }
    
    return sorted;
};

// Calculate highest rep (not per distance)
window.calculateHighestRep = function(jobs) {
    if (window.debug) window.debug.log('Calculating highest rep...');
    
    const sorted = [...jobs].sort((a, b) => b.rep - a.rep);
    
    if (window.debug && sorted.length > 0) {
        window.debug.log(`Top rep job: ${sorted[0].jobName} - ${sorted[0].rep} REP`);
    }
    
    return sorted;
};

// Calculate best rep per distance grouped by company (updated with +3 bonus)
window.calculateBestRepPerDistance = function(jobs) {
    if (window.debug) window.debug.log('Calculating best rep per distance by company...');
    
    const repBonus = window.LogisticsConfig?.repBonusPerCompany || 0;
    
    // Group by company
    const byCompany = {};
    
    jobs.forEach(job => {
        if (!byCompany[job.company]) {
            byCompany[job.company] = [];
        }
        byCompany[job.company].push(job);
    });
    
    // Calculate best rep per distance for each company
    const companyResults = [];
    
    Object.keys(byCompany).forEach(company => {
        const companyJobs = byCompany[company];
        
        // Calculate rep per distance for each job (with bonus)
        const jobsWithRatio = companyJobs.map(job => {
            const repWithBonus = job.rep + repBonus;
            const repPerKm = job.distance > 0 ? repWithBonus / job.distance : 0;
            return {
                ...job,
                repPerKm: repPerKm,
                repWithBonus: repWithBonus
            };
        });
        
        // Find best job for this company
        const bestJob = jobsWithRatio.reduce((best, current) => {
            return current.repPerKm > best.repPerKm ? current : best;
        }, jobsWithRatio[0]);
        
        if (bestJob) {
            companyResults.push(bestJob);
        }
    });
    
    // Sort by rep per km (highest first)
    const sorted = companyResults.sort((a, b) => b.repPerKm - a.repPerKm);
    
    if (window.debug) {
        window.debug.log(`Found best rep jobs for ${sorted.length} company/companies`);
        if (sorted.length > 0) {
            window.debug.log(`Top rep job: ${sorted[0].jobName} (${sorted[0].company}) - ${sorted[0].repPerKm.toFixed(2)} rep/km`);
        }
    }
    
    return sorted;
};

// Calculate best rep per mile grouped by company
window.calculateBestRepPerMilePerCompany = function(jobs) {
    if (window.debug) window.debug.log('Calculating best rep per mile by company...');
    
    const repBonus = window.LogisticsConfig?.repBonusPerCompany || 0;
    const kmToMile = 0.621371; // Conversion factor
    
    // Group by company
    const byCompany = {};
    
    jobs.forEach(job => {
        if (!byCompany[job.company]) {
            byCompany[job.company] = [];
        }
        byCompany[job.company].push(job);
    });
    
    // Calculate best rep per mile for each company
    const companyResults = [];
    
    Object.keys(byCompany).forEach(company => {
        const companyJobs = byCompany[company];
        
        // Calculate rep per mile for each job (with bonus)
        const jobsWithRatio = companyJobs.map(job => {
            const repWithBonus = job.rep + repBonus;
            const distanceInMiles = job.distance * kmToMile;
            const repPerMile = distanceInMiles > 0 ? repWithBonus / distanceInMiles : 0;
            return {
                ...job,
                repPerMile: repPerMile,
                repWithBonus: repWithBonus,
                distanceInMiles: distanceInMiles
            };
        });
        
        // Find best job for this company
        const bestJob = jobsWithRatio.reduce((best, current) => {
            return current.repPerMile > best.repPerMile ? current : best;
        }, jobsWithRatio[0]);
        
        if (bestJob) {
            companyResults.push(bestJob);
        }
    });
    
    // Sort by rep per mile (highest first)
    const sorted = companyResults.sort((a, b) => b.repPerMile - a.repPerMile);
    
    if (window.debug) {
        window.debug.log(`Found best rep per mile jobs for ${sorted.length} company/companies`);
        if (sorted.length > 0) {
            window.debug.log(`Top rep per mile job: ${sorted[0].jobName} (${sorted[0].company}) - ${sorted[0].repPerMile.toFixed(2)} rep/mile`);
        }
    }
    
    return sorted;
};

// Calculate highest rep per company (not per distance, just highest rep job for each company)
window.calculateHighestRepPerCompany = function(jobs) {
    if (window.debug) window.debug.log('Calculating highest rep per company...');
    
    const repBonus = window.LogisticsConfig?.repBonusPerCompany || 0;
    
    // Group by company
    const byCompany = {};
    
    jobs.forEach(job => {
        if (!byCompany[job.company]) {
            byCompany[job.company] = [];
        }
        byCompany[job.company].push(job);
    });
    
    // Find highest rep job for each company
    const companyResults = [];
    
    Object.keys(byCompany).forEach(company => {
        const companyJobs = byCompany[company];
        
        // Find job with highest rep (with bonus)
        const bestJob = companyJobs.reduce((best, current) => {
            const bestRep = (best.rep || 0) + repBonus;
            const currentRep = (current.rep || 0) + repBonus;
            return currentRep > bestRep ? current : best;
        }, companyJobs[0]);
        
        if (bestJob) {
            companyResults.push({
                ...bestJob,
                repWithBonus: (bestJob.rep || 0) + repBonus
            });
        }
    });
    
    // Sort by rep with bonus (highest first)
    const sorted = companyResults.sort((a, b) => b.repWithBonus - a.repWithBonus);
    
    if (window.debug) {
        window.debug.log(`Found highest rep jobs for ${sorted.length} company/companies`);
        if (sorted.length > 0) {
            window.debug.log(`Top rep job: ${sorted[0].jobName} (${sorted[0].company}) - ${sorted[0].repWithBonus} REP`);
        }
    }
    
    return sorted;
};

// Use NumberFormatter utility for number formatting

// Format ratio (2 decimal places)
window.formatRatio = function(ratio) {
    return ratio.toFixed(2);
};
