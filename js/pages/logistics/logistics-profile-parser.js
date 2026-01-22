// logistics/js/logistics-profile-parser.js
// Text parsing logic for company reputation

// Parse company reputation data from pasted text
window.parseCompanyRepData = function(text) {
    if (window.debug) window.debug.log('=== PARSE COMPANY REP DATA STARTED ===');
    
    const companies = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    if (window.debug) window.debug.log(`Processing ${lines.length} lines`);
    
    // Find the "Company Reputation" section
    let startIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/Company Reputation/i)) {
            startIndex = i + 1; // Start after the header
            if (window.debug) window.debug.log(`Found "Company Reputation" header at line ${i}`);
            break;
        }
    }
    
    // If "Company Reputation" not found, fall back to extracting company names from job list text
    if (startIndex === -1) {
        if (window.debug) window.debug.warn('"Company Reputation" section not found in text - fallback to extracting company names from job list');
        
        // Heuristic: a company name line is followed by a money line like "$12,345"
        const unique = new Set();
        for (let i = 0; i < lines.length - 1; i++) {
            const nameLine = lines[i];
            const nextLine = lines[i + 1];
            
            const nextLineLooksLikeMoney = /^\$[\d,]+$/.test(nextLine);
            const looksLikeName = /^[A-Z][a-zA-Z\s&-]+$/.test(nameLine) && nameLine.length > 2;
            
            if (looksLikeName && nextLineLooksLikeMoney) {
                unique.add(nameLine);
            }
        }
        
        const fallbackCompanies = Array.from(unique).sort().map(companyName => ({
            company_name: companyName,
            motto: '',
            reputation: 0,
            total_earnings: 0,
            __skipUpdateIfExists: true,
            __source: 'job_list_fallback'
        }));
        
        if (window.debug) window.debug.log(`Fallback extracted ${fallbackCompanies.length} unique company/companies`);
        return fallbackCompanies;
    }
    
    // Menu items and section markers that indicate we should stop parsing
    const stopMarkers = [
        /^Contracts$/i,
        /^Profile$/i,
        /^Licenses$/i,
        /^Special Logistics$/i,
        /^Rankings$/i,
        /^History$/i,
        /^Manual$/i,
        /^Exit Dashboard$/i,
        /^Contractor Dashboard$/i,
        /^Level \d+$/i,
        /^Contractor Profile$/i,
        /^ID:/i,
        /^TOTAL EXPERIENCE$/i,
        /^EXP TO NEXT LEVEL$/i,
        /^TRIPS COMPLETED$/i,
        /^TYCOON$/i,
        /^LOGISTICS$/i
    ];
    
    let currentCompany = null;
    
    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if we hit a stop marker (menu item or section header)
        const isStopMarker = stopMarkers.some(marker => marker.test(line));
        if (isStopMarker) {
            if (window.debug) window.debug.log(`Hit stop marker at line ${i}: "${line}" - stopping parse`);
            break; // Stop parsing when we hit a menu item or section header
        }
        
        // Check if this is a company name
        // Company names are typically capitalized, not labels, and not menu items
        const isCompanyName = line.match(/^[A-Z][a-zA-Z\s&-]+$/) && 
                             !line.match(/REPUTATION|TOTAL EARNINGS|Company Reputation/i) &&
                             line.length > 2 &&
                             !isStopMarker;
        
        if (isCompanyName) {
            // Save previous company if exists
            if (currentCompany && currentCompany.company_name) {
                companies.push(currentCompany);
                if (window.debug) window.debug.log(`Saved company: ${currentCompany.company_name}`);
            }
            
            // Start new company
            currentCompany = {
                company_name: line,
                motto: '',
                reputation: 0,
                total_earnings: 0
            };
        }
        
        if (currentCompany) {
            // Extract motto (line after company name, before REPUTATION)
            if (!currentCompany.motto && 
                !line.match(/REPUTATION|TOTAL EARNINGS/i) && 
                line !== currentCompany.company_name &&
                line.length > 0 &&
                !isCompanyName) { // Don't set motto if it's another company name
                currentCompany.motto = line;
            }
            
            // Extract reputation
            if (line.match(/REPUTATION/i) && i + 1 < lines.length) {
                const repValue = parseInt(lines[i + 1]);
                if (!isNaN(repValue)) {
                    currentCompany.reputation = repValue;
                    i++; // Skip next line as we've processed it
                }
            }
            
            // Extract total earnings
            if (line.match(/TOTAL EARNINGS/i) && i + 1 < lines.length) {
                const earningsLine = lines[i + 1];
                const earningsMatch = earningsLine.match(/\$?([\d,]+)/);
                if (earningsMatch) {
                    currentCompany.total_earnings = parseFloat(earningsMatch[1].replace(/,/g, '')) || 0;
                    i++; // Skip next line as we've processed it
                }
            }
        }
    }
    
    // Add last company if exists
    if (currentCompany && currentCompany.company_name) {
        companies.push(currentCompany);
        if (window.debug) window.debug.log(`Saved last company: ${currentCompany.company_name}`);
    }
    
    if (window.debug) {
        window.debug.log(`Parsed ${companies.length} company/companies`);
        companies.forEach((company, idx) => {
            window.debug.log(`Company ${idx + 1}:`, {
                name: company.company_name,
                motto: company.motto,
                reputation: company.reputation,
                earnings: company.total_earnings
            });
        });
    }
    
    if (window.debug) window.debug.log('=== PARSE COMPANY REP DATA COMPLETED ===');
    
    return companies;
};
