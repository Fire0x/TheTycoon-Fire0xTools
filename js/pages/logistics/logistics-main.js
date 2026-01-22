// logistics/js/logistics-main.js
// Page initialization and event handlers

// Initialize debug manager
const debug = new DebugManager({
    prefix: '[Logistics Debug]',
    storageKey: 'logisticsDebugMode',
    buttonId: 'debugToggleBtn',
    textId: 'debugToggleText'
});
window.debug = debug; // Make debug available globally

// How to Use Section Collapse State
const HOW_TO_USE_STORAGE_KEY = 'logistics_how_to_use_expanded';
const PROFILE_PASTE_STORAGE_KEY = 'logistics_profile_paste_expanded';
const COMPANY_REPUTATION_STORAGE_KEY = 'logistics_company_reputation_expanded';
const COMPANY_REPUTATION_EDITABLE_STORAGE_KEY = 'logistics_company_reputation_editable_expanded';
const COMPANY_REPUTATION_DISPLAY_STORAGE_KEY = 'logistics_company_reputation_display_expanded';
const MY_LICENSES_STORAGE_KEY = 'logistics_my_licenses_expanded';
const JOB_ANALYSIS_STORAGE_KEY = 'logistics_job_analysis_expanded';
const IMPORT_JOB_DATA_STORAGE_KEY = 'logistics_import_job_data_expanded';
const ANALYSIS_STORAGE_KEY = 'logistics_analysis_expanded';
const HIGHEST_MONEY_STORAGE_KEY = 'logistics_highest_money_expanded';
const BEST_CONVOY_STORAGE_KEY = 'logistics_best_convoy_expanded';
const HIGHEST_REP_STORAGE_KEY = 'logistics_highest_rep_expanded';
const JOBS_SECTION_STORAGE_KEY = 'logistics_jobs_section_expanded';
const CONFIG_STORAGE_KEY = 'logistics_config_expanded';
const BEST_HAZARD_STORAGE_KEY = 'logistics_best_hazard_expanded';
const HIGHEST_REP_ONLY_STORAGE_KEY = 'logistics_highest_rep_only_expanded';
const HIGHEST_REP_PER_MILE_STORAGE_KEY = 'logistics_highest_rep_per_mile_expanded';

// Initialize How to Use collapse state
window.initHowToUseCollapse = function() {
    const stored = localStorage.getItem(HOW_TO_USE_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true'; // Default to expanded
    
    const collapseElement = document.getElementById('howToUseCollapse');
    const toggleIcon = document.getElementById('howToUseToggle');
    const toggleButton = document.querySelector('[data-bs-target="#howToUseCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, {
            toggle: false
        });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        // Listen for collapse events
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(HOW_TO_USE_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(HOW_TO_USE_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Initialize Profile Paste collapse state
window.initProfilePasteCollapse = function() {
    const stored = localStorage.getItem(PROFILE_PASTE_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true'; // Default to expanded
    
    const collapseElement = document.getElementById('profilePasteCollapse');
    const toggleIcon = document.getElementById('profilePasteToggle');
    const toggleButton = document.querySelector('[data-bs-target="#profilePasteCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, {
            toggle: false
        });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        // Listen for collapse events
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(PROFILE_PASTE_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(PROFILE_PASTE_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Initialize Company Reputation (Editable) collapse state
window.initCompanyReputationEditableCollapse = function() {
    const stored = localStorage.getItem(COMPANY_REPUTATION_EDITABLE_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true'; // Default to expanded
    
    const collapseElement = document.getElementById('companyReputationEditableCollapse');
    const toggleIcon = document.getElementById('companyReputationEditableToggle');
    const toggleButton = document.querySelector('[data-bs-target="#companyReputationEditableCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, {
            toggle: false
        });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        // Listen for collapse events
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(COMPANY_REPUTATION_EDITABLE_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(COMPANY_REPUTATION_EDITABLE_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Initialize Company Reputation (Display) collapse state
window.initCompanyReputationDisplayCollapse = function() {
    const stored = localStorage.getItem(COMPANY_REPUTATION_DISPLAY_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true'; // Default to expanded
    
    const collapseElement = document.getElementById('companyReputationDisplayCollapse');
    const toggleIcon = document.getElementById('companyReputationDisplayToggle');
    const toggleButton = document.querySelector('[data-bs-target="#companyReputationDisplayCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, {
            toggle: false
        });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        // Listen for collapse events
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(COMPANY_REPUTATION_DISPLAY_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(COMPANY_REPUTATION_DISPLAY_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Initialize My Licenses collapse state
window.initMyLicensesCollapse = function() {
    const stored = localStorage.getItem(MY_LICENSES_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true';
    
    const collapseElement = document.getElementById('myLicensesCollapse');
    const toggleIcon = document.getElementById('myLicensesToggle');
    const toggleButton = document.querySelector('[data-bs-target="#myLicensesCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(MY_LICENSES_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(MY_LICENSES_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Initialize Job Analysis collapse state
window.initJobAnalysisCollapse = function() {
    const stored = localStorage.getItem(JOB_ANALYSIS_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true';
    
    const collapseElement = document.getElementById('jobAnalysisCollapse');
    const toggleIcon = document.getElementById('jobAnalysisToggle');
    const toggleButton = document.querySelector('[data-bs-target="#jobAnalysisCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(JOB_ANALYSIS_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(JOB_ANALYSIS_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Initialize Import Job Data collapse state
window.initImportJobDataCollapse = function() {
    const stored = localStorage.getItem(IMPORT_JOB_DATA_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true';
    
    const collapseElement = document.getElementById('importJobDataCollapse');
    const toggleIcon = document.getElementById('importJobDataToggle');
    const toggleButton = document.querySelector('[data-bs-target="#importJobDataCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(IMPORT_JOB_DATA_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(IMPORT_JOB_DATA_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Initialize Analysis collapse state
window.initAnalysisCollapse = function() {
    const stored = localStorage.getItem(ANALYSIS_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true';
    
    const collapseElement = document.getElementById('analysisCollapse');
    const toggleIcon = document.getElementById('analysisToggle');
    const toggleButton = document.querySelector('[data-bs-target="#analysisCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(ANALYSIS_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(ANALYSIS_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Initialize Highest Money collapse state
window.initHighestMoneyCollapse = function() {
    const stored = localStorage.getItem(HIGHEST_MONEY_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true';
    
    const collapseElement = document.getElementById('highestMoneyCollapse');
    const toggleIcon = document.getElementById('highestMoneyToggle');
    const toggleButton = document.querySelector('[data-bs-target="#highestMoneyCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(HIGHEST_MONEY_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(HIGHEST_MONEY_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Initialize Best Convoy collapse state
window.initBestConvoyCollapse = function() {
    const stored = localStorage.getItem(BEST_CONVOY_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true';
    
    const collapseElement = document.getElementById('bestConvoyCollapse');
    const toggleIcon = document.getElementById('bestConvoyToggle');
    const toggleButton = document.querySelector('[data-bs-target="#bestConvoyCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(BEST_CONVOY_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(BEST_CONVOY_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Initialize Highest Rep collapse state
window.initHighestRepCollapse = function() {
    const stored = localStorage.getItem(HIGHEST_REP_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true';
    
    const collapseElement = document.getElementById('highestRepCollapse');
    const toggleIcon = document.getElementById('highestRepToggle');
    const toggleButton = document.querySelector('[data-bs-target="#highestRepCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(HIGHEST_REP_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(HIGHEST_REP_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Initialize Jobs Section collapse state
window.initJobsSectionCollapse = function() {
    const stored = localStorage.getItem(JOBS_SECTION_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true';
    
    const collapseElement = document.getElementById('jobsSectionCollapse');
    const toggleIcon = document.getElementById('jobsSectionToggle');
    const toggleButton = document.querySelector('[data-bs-target="#jobsSectionCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(JOBS_SECTION_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(JOBS_SECTION_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Initialize Config collapse state
window.initConfigCollapse = function() {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true';
    
    const collapseElement = document.getElementById('configCollapse');
    const toggleIcon = document.getElementById('configToggle');
    const toggleButton = document.querySelector('[data-bs-target="#configCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(CONFIG_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(CONFIG_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Initialize Best Hazard collapse state
window.initBestHazardCollapse = function() {
    const stored = localStorage.getItem(BEST_HAZARD_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true';
    
    const collapseElement = document.getElementById('bestHazardCollapse');
    const toggleIcon = document.getElementById('bestHazardToggle');
    const toggleButton = document.querySelector('[data-bs-target="#bestHazardCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(BEST_HAZARD_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(BEST_HAZARD_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Initialize Highest Rep Only collapse state
window.initHighestRepOnlyCollapse = function() {
    const stored = localStorage.getItem(HIGHEST_REP_ONLY_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true';
    
    const collapseElement = document.getElementById('highestRepOnlyCollapse');
    const toggleIcon = document.getElementById('highestRepOnlyToggle');
    const toggleButton = document.querySelector('[data-bs-target="#highestRepOnlyCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(HIGHEST_REP_ONLY_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(HIGHEST_REP_ONLY_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Initialize Highest Rep Per Mile collapse state
window.initHighestRepPerMileCollapse = function() {
    const stored = localStorage.getItem(HIGHEST_REP_PER_MILE_STORAGE_KEY);
    const shouldExpand = stored === null ? true : stored === 'true';
    
    const collapseElement = document.getElementById('highestRepPerMileCollapse');
    const toggleIcon = document.getElementById('highestRepPerMileToggle');
    const toggleButton = document.querySelector('[data-bs-target="#highestRepPerMileCollapse"]');
    
    if (collapseElement && typeof bootstrap !== 'undefined') {
        const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
        
        if (!shouldExpand) {
            bsCollapse.hide();
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            bsCollapse.show();
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        }
        
        collapseElement.addEventListener('shown.bs.collapse', function() {
            localStorage.setItem(HIGHEST_REP_PER_MILE_STORAGE_KEY, 'true');
            if (toggleIcon) toggleIcon.textContent = '▼';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'true');
        });
        
        collapseElement.addEventListener('hidden.bs.collapse', function() {
            localStorage.setItem(HIGHEST_REP_PER_MILE_STORAGE_KEY, 'false');
            if (toggleIcon) toggleIcon.textContent = '▶';
            if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
        });
    }
};

// Update Local time
window.updateAESTTime = function() {
    const now = new Date();
    const localOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    const localTime = now.toLocaleString(navigator.language || 'en-US', localOptions);
    const aestTimeEl = document.getElementById('aestTime');
    if (aestTimeEl) {
        aestTimeEl.textContent = localTime;
    }
};

// Initialize page
function initializeLogisticsPage() {
    if (window.debug) window.debug.log('Initializing logistics page...');
    
    // Ensure cached elements are initialized
    if (typeof window.initCachedElements === 'function') {
        window.initCachedElements();
    }
    
    window.initHowToUseCollapse();
    window.initProfilePasteCollapse();
    window.initCompanyReputationEditableCollapse();
    window.initCompanyReputationDisplayCollapse();
    window.initMyLicensesCollapse();
    window.initConfigCollapse();
    window.initJobAnalysisCollapse();
    window.initImportJobDataCollapse();
    window.initAnalysisCollapse();
    window.initHighestMoneyCollapse();
    window.initBestConvoyCollapse();
    window.initHighestRepCollapse();
    window.initBestHazardCollapse();
    window.initHighestRepOnlyCollapse();
    window.initHighestRepPerMileCollapse();
    window.initJobsSectionCollapse();
    window.loadFromStorage();
    
    // Load userLevel from localStorage and set in input
    if (typeof LogisticsStorage !== 'undefined') {
        const data = LogisticsStorage.read();
        const userLevelInput = document.getElementById('userLevelInput');
        if (userLevelInput && data.config && data.config.userLevel !== undefined) {
            userLevelInput.value = data.config.userLevel || 1;
            if (window.debug) window.debug.log(`Loaded userLevel: ${data.config.userLevel} from localStorage`);
        }
    }
    
    // Load and initialize config
    if (window.LogisticsConfig) {
        // Set rep bonus input
        const repBonusInput = document.getElementById('repBonusInput');
        if (repBonusInput) {
            repBonusInput.value = window.LogisticsConfig.repBonusPerCompany || 3;
        }
        
        // Set level filter mode
        const levelFilterInput = document.getElementById(`levelFilter${window.LogisticsConfig.levelFilterMode === 'exact' ? 'Exact' : 'Below'}`);
        if (levelFilterInput) {
            levelFilterInput.checked = true;
        }
        
        // Update level filter help text
        const levelFilterHelp = document.getElementById('levelFilterHelp');
        if (levelFilterHelp) {
            levelFilterHelp.textContent = window.LogisticsConfig.levelFilterMode === 'exact' 
                ? 'Only jobs at your exact level will be shown'
                : 'Only jobs at or below this level will be shown';
        }
        
        // Set calculation checkboxes
        Object.entries(window.LogisticsConfig.enabledCalculations).forEach(([key, enabled]) => {
            const checkbox = document.getElementById(`calc${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (checkbox) {
                checkbox.checked = enabled !== false;
            }
        });
    }
    
    // Company config currently only stores optional company settings (no UI here)
    
    if (window.debug) window.debug.log('Calling renderJobs and renderCompanyCards...');
    window.renderJobs();
    
    // Load and render companies
    if (typeof window.renderCompanyCards === 'function') {
        window.renderCompanyCards();
    }
    
    // Load and render reputation display
    if (typeof window.renderCompanyReputationDisplay === 'function') {
        window.renderCompanyReputationDisplay();
    }
    
    // Load and render licenses
    if (typeof window.loadLicenses === 'function') {
        window.loadLicenses();
    }
    
    window.renderAnalysis();
    
    window.updateAESTTime();
    setInterval(window.updateAESTTime, 1000);
    
    // Initialize number formatting for input fields
    if (typeof window.NumberFormatter !== 'undefined' && typeof window.NumberFormatter.initNumberFormatting === 'function') {
        // Format money and earnings inputs (no decimals)
        window.NumberFormatter.initNumberFormatting({
            selector: 'input[data-field="money"], input[data-field="total_earnings"]',
            allowDecimals: false
        });
        
        // Format price inputs (allow decimals)
        window.NumberFormatter.initNumberFormatting({
            selector: 'input[data-field="price"], .price-input',
            allowDecimals: true
        });
        
        if (window.debug) window.debug.log('Number formatting initialized');
    }
    
    if (window.debug) window.debug.log('Logistics page initialized');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLogisticsPage);
} else {
    // DOM already ready, but wait a tick to ensure all scripts are loaded
    setTimeout(initializeLogisticsPage, 0);
}
