// logistics/js/logistics-license-calculations.js
// License-based job analysis calculations

// Filter jobs by license requirements
// Returns jobs that match the license's parseString, where license is purchased and user level >= license level
window.filterJobsByLicense = function(jobs, license, userLevel) {
    if (window.debug) window.debug.log(`[LICENSE-CALC] Filtering jobs for license: ${license.name} (parseString: ${license.parseString})`);
    
    // Check if license is purchased
    if (!license.purchased) {
        if (window.debug) window.debug.log(`[LICENSE-CALC] License ${license.name} is not purchased, skipping`);
        return [];
    }
    
    // Check if user level meets license requirement
    if (userLevel < license.level) {
        if (window.debug) window.debug.log(`[LICENSE-CALC] User level ${userLevel} is below license level ${license.level}, skipping`);
        return [];
    }
    
    // Check if license has a parseString
    if (!license.parseString || !license.parseString.trim()) {
        if (window.debug) window.debug.log(`[LICENSE-CALC] License ${license.name} has no parseString, skipping`);
        return [];
    }
    
    // Filter jobs that match the license's parseString
    const matchingJobs = jobs.filter(job => {
        const requiresLicense = job.jobType && job.jobType.some(type => 
            type.includes(license.parseString)
        );
        
        if (window.debug && requiresLicense) {
            window.debug.log(`[LICENSE-CALC] Job ${job.jobName} matches license ${license.name} (parseString: ${license.parseString})`);
        }
        
        return requiresLicense;
    });
    
    if (window.debug) window.debug.log(`[LICENSE-CALC] Found ${matchingJobs.length} job(s) matching license ${license.name}`);
    
    return matchingJobs;
};

// Calculate highest pay per license
window.calculateHighestPayPerLicense = function(jobs, licenses, userLevel) {
    if (window.debug) window.debug.log('[LICENSE-CALC] Calculating highest pay per license...');
    
    const results = [];
    
    licenses.forEach(license => {
        const licenseJobs = window.filterJobsByLicense(jobs, license, userLevel);
        
        if (licenseJobs.length === 0) {
            if (window.debug) window.debug.log(`[LICENSE-CALC] No jobs found for license: ${license.name}`);
            return;
        }
        
        // Find job with highest pay
        const bestJob = licenseJobs.reduce((best, current) => {
            return current.money > best.money ? current : best;
        }, licenseJobs[0]);
        
        results.push({
            license: license,
            job: bestJob,
            value: bestJob.money
        });
        
        if (window.debug) window.debug.log(`[LICENSE-CALC] Highest pay for ${license.name}: $${bestJob.money} (${bestJob.jobName})`);
    });
    
    // Sort by pay (highest first)
    const sorted = results.sort((a, b) => b.value - a.value);
    
    if (window.debug) window.debug.log(`[LICENSE-CALC] Calculated highest pay for ${sorted.length} license(s)`);
    
    return sorted;
};

// Calculate highest rep per license
window.calculateHighestRepPerLicense = function(jobs, licenses, userLevel) {
    if (window.debug) window.debug.log('[LICENSE-CALC] Calculating highest rep per license...');
    
    const results = [];
    
    licenses.forEach(license => {
        const licenseJobs = window.filterJobsByLicense(jobs, license, userLevel);
        
        if (licenseJobs.length === 0) {
            if (window.debug) window.debug.log(`[LICENSE-CALC] No jobs found for license: ${license.name}`);
            return;
        }
        
        // Find job with highest rep
        const bestJob = licenseJobs.reduce((best, current) => {
            return current.rep > best.rep ? current : best;
        }, licenseJobs[0]);
        
        results.push({
            license: license,
            job: bestJob,
            value: bestJob.rep
        });
        
        if (window.debug) window.debug.log(`[LICENSE-CALC] Highest rep for ${license.name}: ${bestJob.rep} REP (${bestJob.jobName})`);
    });
    
    // Sort by rep (highest first)
    const sorted = results.sort((a, b) => b.value - a.value);
    
    if (window.debug) window.debug.log(`[LICENSE-CALC] Calculated highest rep for ${sorted.length} license(s)`);
    
    return sorted;
};

// Calculate highest pay per company per license
window.calculateHighestPayPerCompanyPerLicense = function(jobs, licenses, userLevel) {
    if (window.debug) window.debug.log('[LICENSE-CALC] Calculating highest pay per company per license...');
    
    const results = [];
    
    licenses.forEach(license => {
        const licenseJobs = window.filterJobsByLicense(jobs, license, userLevel);
        
        if (licenseJobs.length === 0) {
            if (window.debug) window.debug.log(`[LICENSE-CALC] No jobs found for license: ${license.name}`);
            return;
        }
        
        // Group by company
        const byCompany = {};
        licenseJobs.forEach(job => {
            if (!byCompany[job.company]) {
                byCompany[job.company] = [];
            }
            byCompany[job.company].push(job);
        });
        
        // Find best job for each company
        Object.keys(byCompany).forEach(company => {
            const companyJobs = byCompany[company];
            const bestJob = companyJobs.reduce((best, current) => {
                return current.money > best.money ? current : best;
            }, companyJobs[0]);
            
            results.push({
                license: license,
                company: company,
                job: bestJob,
                value: bestJob.money
            });
            
            if (window.debug) window.debug.log(`[LICENSE-CALC] Highest pay for ${license.name} at ${company}: $${bestJob.money} (${bestJob.jobName})`);
        });
    });
    
    // Sort by pay (highest first)
    const sorted = results.sort((a, b) => b.value - a.value);
    
    if (window.debug) window.debug.log(`[LICENSE-CALC] Calculated highest pay per company for ${sorted.length} license-company combination(s)`);
    
    return sorted;
};

// Calculate highest rep per company per license
window.calculateHighestRepPerCompanyPerLicense = function(jobs, licenses, userLevel) {
    if (window.debug) window.debug.log('[LICENSE-CALC] Calculating highest rep per company per license...');
    
    const results = [];
    
    licenses.forEach(license => {
        const licenseJobs = window.filterJobsByLicense(jobs, license, userLevel);
        
        if (licenseJobs.length === 0) {
            if (window.debug) window.debug.log(`[LICENSE-CALC] No jobs found for license: ${license.name}`);
            return;
        }
        
        // Group by company
        const byCompany = {};
        licenseJobs.forEach(job => {
            if (!byCompany[job.company]) {
                byCompany[job.company] = [];
            }
            byCompany[job.company].push(job);
        });
        
        // Find best job for each company
        Object.keys(byCompany).forEach(company => {
            const companyJobs = byCompany[company];
            const bestJob = companyJobs.reduce((best, current) => {
                return current.rep > best.rep ? current : best;
            }, companyJobs[0]);
            
            results.push({
                license: license,
                company: company,
                job: bestJob,
                value: bestJob.rep
            });
            
            if (window.debug) window.debug.log(`[LICENSE-CALC] Highest rep for ${license.name} at ${company}: ${bestJob.rep} REP (${bestJob.jobName})`);
        });
    });
    
    // Sort by rep (highest first)
    const sorted = results.sort((a, b) => b.value - a.value);
    
    if (window.debug) window.debug.log(`[LICENSE-CALC] Calculated highest rep per company for ${sorted.length} license-company combination(s)`);
    
    return sorted;
};
