/**
 * Employee Data Loader
 * Loads employee data from new N* tables (NEmployees, NBusiness, NTiers) via API
 */

class EmployeeLoader {
    constructor() {
        this.apiUrl = '/n';
        this.data = null;
    }

    /**
     * Load employee data from NEmployees and enrich with NBusiness + NTiers
     */
    async loadEmployeeData() {
        try {
            const [empRes, bizRes, tierRes] = await Promise.all([
                fetch(`${this.apiUrl}/employees`),
                fetch(`${this.apiUrl}/businesses`),
                fetch(`${this.apiUrl}/tiers`)
            ]);

            if (!empRes.ok) throw new Error('Failed to load NEmployees');
            if (!bizRes.ok) throw new Error('Failed to load NBusiness');
            if (!tierRes.ok) throw new Error('Failed to load NTiers');

            const [employees, businesses, tiers] = await Promise.all([
                empRes.json(),
                bizRes.json(),
                tierRes.json()
            ]);

            console.log(`📦 Loaded ${employees.length} NEmployees, ${businesses.length} NBusiness, ${tiers.length} NTiers for About page`);

            // Build lookup maps
            const businessByCode = {};
            businesses.forEach(biz => {
                if (biz.business_code) {
                    businessByCode[biz.business_code] = biz;
                }
            });

            const tierById = {};
            tiers.forEach(tier => {
                if (tier.id) {
                    tierById[tier.id] = tier;
                }
            });

            // Enrich employees with business_name and tier info
            const enriched = employees.map(emp => {
                const business = emp.business_code ? businessByCode[emp.business_code] : null;
                const tier = business && business.tier_id ? tierById[business.tier_id] : null;

                return {
                    ...emp,
                    business_name: business ? (business.business_name || 'N/A') : 'N/A',
                    business_tier_id: business ? business.tier_id : null,
                    business_tier_number: tier ? tier.tier_number : null,
                    business_tier_name: tier ? tier.tier_name : null
                };
            });

            this.data = enriched;
            return enriched;
        } catch (error) {
            console.error('❌ Could not load employee data from N* APIs:', error);
            this.data = [];
            return [];
        }
    }

    /**
     * Get all employees
     */
    async getAllEmployees() {
        if (!this.data) {
            await this.loadEmployeeData();
        }
        return this.data || [];
    }

    /**
     * Populate employee table
     */
    async populateEmployeeTable() {
        const employees = await this.getAllEmployees();
        const tbody = document.querySelector('#employeeTable tbody');
        
        if (!tbody) {
            console.warn('⚠️ Employee table tbody not found');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (employees.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4" class="text-center text-muted">No employees found</td>';
            tbody.appendChild(row);
            return;
        }
        
        // Sort employees: First by Business Code (ascending), then OneLonelyDad first within same business, then by name
        const sortedEmployees = employees.sort((a, b) => {
            const codeA = a.business_code || '';
            const codeB = b.business_code || '';
            
            // First sort by business code (ascending)
            if (codeA !== codeB) {
                return codeA.localeCompare(codeB);
            }
            
            // Within same business code, OneLonelyDad first
            if (a.name === 'OneLonelyDad') return -1;
            if (b.name === 'OneLonelyDad') return 1;
            
            // Then by name
            return a.name.localeCompare(b.name);
        });
        
        sortedEmployees.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.name || 'N/A'}</td>
                <td>${employee.training_status || 'Not Started'}</td>
                <td>${employee.business_code || 'N/A'}</td>
                <td>${employee.business_name || 'N/A'}</td>
            `;
            tbody.appendChild(row);
        });
        
        console.log(`✅ Populated ${sortedEmployees.length} employees in table`);
    }
}

// Initialize and populate on page load
document.addEventListener('DOMContentLoaded', function() {
    const loader = new EmployeeLoader();
    loader.populateEmployeeTable();
});

