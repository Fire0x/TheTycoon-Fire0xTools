/**
 * Toast Manager - Handles displaying Bootstrap toasts
 */
class ToastManager {
    constructor(containerId = 'miningToastContainer') {
        this.containerId = containerId;
    }

    /**
     * Show a toast message
     * @param {string} title - Toast title
     * @param {string} message - Toast body message
     * @param {string} type - 'success', 'danger', 'warning', 'info'
     */
    show(title, message, type = 'info') {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('Toast container not found:', this.containerId);
            return;
        }

        const id = 'toast-' + Date.now();
        const icon = this.getIcon(type);
        const headerBg = this.getHeaderBg(type);
        const textColor = type === 'light' ? 'text-dark' : 'text-white';

        const html = `
            <div id="${id}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header ${headerBg} ${textColor}">
                    <strong class="me-auto">${icon} ${title}</strong>
                    <small>Just now</small>
                    <button type="button" class="btn-close ${type !== 'light' ? 'btn-close-white' : ''}" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;

        // Create temporary element to parse HTML
        const template = document.createElement('div');
        template.innerHTML = html.trim();
        const toastEl = template.firstChild;

        container.appendChild(toastEl);

        // Initialize Bootstrap Toast
        if (window.bootstrap && window.bootstrap.Toast) {
            const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
            toast.show();

            // Remove from DOM after hidden
            toastEl.addEventListener('hidden.bs.toast', () => {
                toastEl.remove();
            });
        }
    }

    getIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'danger': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '📢';
        }
    }

    getHeaderBg(type) {
        switch (type) {
            case 'success': return 'bg-success';
            case 'danger': return 'bg-danger';
            case 'warning': return 'bg-warning text-dark';
            case 'info': return 'bg-info';
            default: return 'bg-light';
        }
    }
}

// Expose globally
window.ToastManager = new ToastManager();
