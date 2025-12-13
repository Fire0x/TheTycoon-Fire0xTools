// Theme switching functionality
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'dark'; // Default to dark mode
        this.init();
    }

    init() {
        // Set initial theme
        this.setTheme(this.theme);

        // Wire dropdown items if present
        this.setupThemeDropdown();

        // Create and add fallback toggle button to pages without dropdown
        this.addThemeToggle();
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Update toggle button icon
        const toggleBtn = document.querySelector('.theme-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
        }

        // Update dropdown active state
        const options = document.querySelectorAll('.theme-option[data-theme-option]');
        options.forEach(opt => {
            const optTheme = opt.getAttribute('data-theme-option');
            if (optTheme === theme) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }

    toggleTheme() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setupThemeDropdown() {
        const options = document.querySelectorAll('.theme-option[data-theme-option]');
        if (!options.length) return;

        options.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.preventDefault();
                const theme = opt.getAttribute('data-theme-option');
                if (theme) {
                    this.setTheme(theme);
                }
            });
        });
    }

    addThemeToggle() {
        // If a dropdown-based theme selector exists, don't add the button
        if (document.querySelector('.theme-option[data-theme-option]')) {
            return;
        }

        // Find the navbar
        const navbar = document.querySelector('.navbar-nav');
        if (navbar) {
            // Create toggle button
            const toggleBtn = document.createElement('li');
            toggleBtn.className = 'nav-item';
            toggleBtn.innerHTML = `
                <button class="theme-toggle nav-link" title="Toggle theme">
                    ${this.theme === 'dark' ? '☀️' : '🌙'}
                </button>
            `;

            // Add click event
            toggleBtn.querySelector('.theme-toggle').addEventListener('click', () => {
                this.toggleTheme();
            });

            // Insert at the end of navbar
            navbar.appendChild(toggleBtn);
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});
