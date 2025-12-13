// Employee Profiles Loader
// Dynamically populates employee profile tables on tier pages based on business name

function loadEmployeeProfiles() {
    // Find all business sections with employee profile tables
    const businessCards = document.querySelectorAll('.card.mt-4');
    
    businessCards.forEach(card => {
        let businessName = null;
        let businessCode = null;
        
        // Try to find business name and code using different methods
        const paragraphs = card.querySelectorAll('p');
        paragraphs.forEach(p => {
            const text = p.textContent || '';
            if (text.includes('Business Code:')) {
                businessCode = text.replace('Business Code:', '').trim();
            }
            if (text.includes('Business Name:')) {
                businessName = text.replace('Business Name:', '').trim();
            }
        });
        
        // If no business name found, try slogan (for tier_2 and tier_3)
        if (!businessName) {
            paragraphs.forEach(p => {
                const text = p.textContent || '';
                if (text.includes('Slogan:')) {
                    businessName = text.replace('Slogan:', '').trim();
                }
            });
        }
        
        // If still no business name but we have a code, try to get business name from config
        if (!businessName && businessCode) {
            const business = getBusinessByCode(businessCode);
            if (business && business.name) {
                businessName = business.name;
            }
        }
        
        if (!businessName) return;
        
        // Find the employee profile table in this card
        const table = card.querySelector('table.table');
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        // Get employees for this business
        const employees = getEmployeesForBusiness(businessName);
        
        if (employees.length > 0) {
            // Clear existing content
            tbody.innerHTML = '';
            
            // Populate with employee data
            employees.forEach(employee => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${employee.image || 'images/default danny.png'}" alt="Employee Image" class="img-fluid" style="width: 50px;"></td>
                    <td>${employee.name}</td>
                    <td>${employee.level || ''}</td>
                    <td>${employee.wage || ''}</td>
                    <td>${employee.trainingStatus || ''}</td>
                    <td>${employee.employedBy || ''}</td>
                    <td>${employee.lore || ''}</td>
                `;
                tbody.appendChild(row);
            });
        } else {
            // If no employees found, show a message
            if (tbody.querySelector('td.text-muted')) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No employees found for this business.</td></tr>';
            }
        }
    });
}

// Load on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for business-profiles.js to populate business names
    setTimeout(loadEmployeeProfiles, 200);
});

// Also reload when API data loads
window.addEventListener('apiDataLoaded', function() {
    setTimeout(loadEmployeeProfiles, 100);
});

