// logistics/js/logistics-parser.js
// Text parsing logic for jobs

// Parse job data from pasted text
window.parseJobData = function(text) {
    if (window.debug) window.debug.log('=== PARSE JOB DATA STARTED ===');
    
    const jobs = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    if (window.debug) window.debug.log(`Processing ${lines.length} lines`);
    
    let currentJob = null;
    let jobLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if this is a company name (usually starts a new job)
        // Company names are typically capitalized, not numbers, and not special patterns
        const isCompanyName = line.match(/^[A-Z][a-zA-Z\s&-]+$/) && 
                             !line.match(/^\$|To:|Lvl|XP|Rep|Accept|Level|Required|FRAGILE|HEAVY|CONVOY|HIGH|ADR/i) &&
                             line.length > 2;
        
        // Check if this is a status line (end of job block)
        const isStatusLine = line.match(/Accept Job|Level Too Low/i);
        
        if (isCompanyName && currentJob && currentJob.status === 'Accept Job') {
            // Save previous job if it's acceptable
            jobs.push(currentJob);
            if (window.debug) window.debug.log(`Saved job: ${currentJob.jobName}`);
        }
        
        if (isCompanyName) {
            // Start new job
            currentJob = {
                company: line,
                destination: '',
                jobName: '',
                money: 0,
                xp: 0,
                rep: 0,
                level: 1,
                distance: 0,
                distanceRaw: '',
                jobType: [],
                status: '',
                timeDuration: '',
                timeDateTime: null,
                timeRaw: '',
                parsedAt: new Date().toISOString(),
                edited: false
            };
            jobLines = [];
        }
        
        if (currentJob) {
            jobLines.push(line);
            
            // Extract money
            const moneyMatch = line.match(/\$([\d,]+)/);
            if (moneyMatch && currentJob.money === 0) {
                currentJob.money = parseInt(moneyMatch[1].replace(/,/g, '')) || 0;
            }
            
            // Extract destination from "To: Location (distance km)"
            const toMatch = line.match(/To:\s*([^(]+)\s*\(([\d.]+)\s*km\)/i);
            if (toMatch && !currentJob.destination) {
                currentJob.destination = toMatch[1].trim();
                currentJob.distance = parseFloat(toMatch[2]) || 0;
                currentJob.distanceRaw = `${toMatch[2]} km`;
            }
            
            // Extract time information: "2h 12m ( 12:13PM on January 18th, 2026 )"
            // Pattern matches: duration with optional date/time in parentheses
            // Handles formats like: "2h 12m", "2h12m", "2h 12m ( 12:13PM on January 18th, 2026 )"
            // Matches lines that start with time pattern (standalone time lines)
            const timeMatch = line.match(/^(\d+h\s*\d+m)\s*(?:\(([^)]+)\))?\s*$/i);
            if (timeMatch && !currentJob.timeRaw) {
                currentJob.timeDuration = timeMatch[1].trim(); // "2h 12m"
                currentJob.timeDateTime = timeMatch[2] ? timeMatch[2].trim() : null; // "12:13PM on January 18th, 2026"
                currentJob.timeRaw = line.trim(); // Full line for reference
                if (window.debug) window.debug.log(`Extracted time for job: ${currentJob.timeDuration}${currentJob.timeDateTime ? ' (' + currentJob.timeDateTime + ')' : ''}`);
            }
            
            // Extract job type tags
            const jobTypeTags = ['FRAGILE', 'HEAVY', 'CONVOY (MAX 4)', 'HIGH_VALUE', 'HIGH TIER', 'ADR_1', 'ADR_2', 'ADR_3', 'ADR_4', 'ADR_6', 'ADR_8'];
            jobTypeTags.forEach(tag => {
                if (line.includes(tag) && !currentJob.jobType.includes(tag)) {
                    currentJob.jobType.push(tag);
                    if (window.debug) window.debug.log(`Found job type tag: ${tag} for job: ${currentJob.company}`);
                }
            });
            
            // Extract level
            const levelMatch = line.match(/Lvl\s*(\d+)/i);
            if (levelMatch && currentJob.level === 1) {
                currentJob.level = parseInt(levelMatch[1]) || 1;
            }
            
            // Extract XP
            const xpMatch = line.match(/(\d+)\s*XP/i);
            if (xpMatch && currentJob.xp === 0) {
                currentJob.xp = parseInt(xpMatch[1]) || 0;
            }
            
            // Extract REP
            const repMatch = line.match(/[+-]?(\d+)\s*Rep/i);
            if (repMatch && currentJob.rep === 0) {
                currentJob.rep = parseInt(repMatch[1]) || 0;
                if (line.includes('-')) {
                    currentJob.rep = -currentJob.rep;
                }
            }
            
            // Extract status
            if (isStatusLine) {
                if (line.match(/Accept Job/i)) {
                    currentJob.status = 'Accept Job';
                } else if (line.match(/Level Too Low/i)) {
                    currentJob.status = 'Level Too Low';
                }
            }
        }
    }
    
    // Add last job if exists and is acceptable
    if (currentJob && currentJob.status === 'Accept Job') {
        // Format job name
        currentJob.jobName = `${currentJob.company} to ${currentJob.destination}`;
        jobs.push(currentJob);
        if (window.debug) window.debug.log(`Saved last job: ${currentJob.jobName}`);
    }
    
    // Filter to only include "Accept Job" status
    const acceptedJobs = jobs.filter(job => job.status === 'Accept Job');
    
    if (window.debug) {
        window.debug.log(`Parsed ${jobs.length} job(s), ${acceptedJobs.length} with "Accept Job" status`);
        acceptedJobs.forEach((job, idx) => {
            window.debug.log(`Job ${idx + 1}:`, {
                name: job.jobName,
                money: job.money,
                xp: job.xp,
                rep: job.rep,
                level: job.level,
                distance: job.distance,
                jobType: job.jobType,
                timeDuration: job.timeDuration,
                timeDateTime: job.timeDateTime
            });
        });
    }
    
    if (window.debug) window.debug.log('=== PARSE JOB DATA COMPLETED ===');
    
    return acceptedJobs;
};

// Parse and save jobs
window.parseAndSaveJobs = function() {
    if (window.debug) window.debug.log('=== PARSE AND SAVE JOBS STARTED ===');
    
    const input = document.getElementById('jobPasteInput');
    if (!input || !input.value.trim()) {
        alert('Please paste job data first!');
        return;
    }
    
    const text = input.value;
    if (window.debug) window.debug.log('Parsing job data...');
    
    const parsed = window.parseJobData(text);
    
    if (parsed.length === 0) {
        alert('No valid jobs found with "Accept Job" status. Please check the format.');
        return;
    }
    
    // Add jobs to storage
    parsed.forEach(job => {
        window.addJob(job);
    });
    
    // Clear input
    input.value = '';
    
    // Render jobs and analysis
    if (typeof window.renderJobs === 'function') {
        window.renderJobs();
    }
    if (typeof window.renderAnalysis === 'function') {
        window.renderAnalysis();
    }
    
    alert(`Successfully added ${parsed.length} job(s)!`);
    
    if (window.debug) window.debug.log('=== PARSE AND SAVE JOBS COMPLETED ===');
};
