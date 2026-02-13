/**
 * Mining Theme - Custom color customization
 */
(function () {
    const STORAGE_KEY = 'mining_theme_custom';

    const defaultColors = {
        primary: '#007bff',
        navbar: '#f8f9fa'
    };

    function init() {
        injectUI();
        loadTheme();
    }

    function injectUI() {
        // Add button
        const headerDiv = document.querySelector('main .position-relative');
        if (headerDiv) {
            // Check if debug button exists to position correctly
            const debugBtn = document.getElementById('debugToggleBtn');

            const btn = document.createElement('button');
            btn.className = 'btn btn-sm btn-outline-secondary position-absolute top-0';
            btn.style.right = debugBtn ? '140px' : '0'; // Offset if debug exists
            btn.innerHTML = '🎨 Theme';
            btn.onclick = openModal;
            headerDiv.appendChild(btn);
        }

        // Add Modal
        const modalHtml = `
        <div class="modal fade" id="themeModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content" style="background-color: var(--card-bg); color: var(--text-color);">
                    <div class="modal-header">
                        <h5 class="modal-title">Theme Customization</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="themePrimaryColor" class="form-label">Primary Color/Accent</label>
                            <input type="color" class="form-control form-control-color w-100" id="themePrimaryColor" value="${defaultColors.primary}">
                        </div>
                        <div class="mb-3">
                            <label for="themeNavbarColor" class="form-label">Navbar Background</label>
                            <input type="color" class="form-control form-control-color w-100" id="themeNavbarColor" value="${defaultColors.navbar}">
                            <div class="form-text">Note: Might need a refresh or re-toggle of Dark Mode to align text colors perfectly.</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="themeResetBtn">Reset to Defaults</button>
                        <button type="button" class="btn btn-primary" id="themeSaveBtn">Save & Apply</button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Wire events
        const saveBtn = document.getElementById('themeSaveBtn');
        const resetBtn = document.getElementById('themeResetBtn');

        if (saveBtn) saveBtn.addEventListener('click', saveTheme);
        if (resetBtn) resetBtn.addEventListener('click', resetTheme);
    }

    function openModal() {
        const modal = new bootstrap.Modal(document.getElementById('themeModal'));
        // Load current values into inputs
        const current = getStoredTheme();
        document.getElementById('themePrimaryColor').value = current.primary || defaultColors.primary;
        document.getElementById('themeNavbarColor').value = current.navbar || defaultColors.navbar;
        modal.show();
    }

    function saveTheme() {
        const primary = document.getElementById('themePrimaryColor').value;
        const navbar = document.getElementById('themeNavbarColor').value;

        const data = { primary, navbar };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        applyTheme(data);

        // Close modal
        const el = document.getElementById('themeModal');
        const modal = bootstrap.Modal.getInstance(el);
        if (modal) modal.hide();

        if (window.ToastManager) window.ToastManager.show('Theme Saved', 'Custom colors applied.', 'success');
    }

    function resetTheme() {
        localStorage.removeItem(STORAGE_KEY);
        // Reload page to clear all style overrides cleanly or manually remove props
        // Removing props:
        document.documentElement.style.removeProperty('--btn-primary-bg');
        document.documentElement.style.removeProperty('--link-color');
        document.documentElement.style.removeProperty('--navbar-bg');

        document.getElementById('themePrimaryColor').value = defaultColors.primary;
        document.getElementById('themeNavbarColor').value = defaultColors.navbar;

        const el = document.getElementById('themeModal');
        const modal = bootstrap.Modal.getInstance(el);
        if (modal) modal.hide();

        if (window.ToastManager) window.ToastManager.show('Theme Reset', 'Restored default colors.', 'info');
    }

    function getStoredTheme() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function loadTheme() {
        const data = getStoredTheme();
        if (data.primary || data.navbar) {
            applyTheme(data);
        }
    }

    function applyTheme(data) {
        const root = document.documentElement;
        if (data.primary) {
            root.style.setProperty('--btn-primary-bg', data.primary);
            root.style.setProperty('--link-color', data.primary);
            // Also update text-shadow color for dark mode glow if possible? 
            // Hard without rewriting the CSS rule.
        }
        if (data.navbar) {
            root.style.setProperty('--navbar-bg', data.navbar);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 0);
    }
})();
