/**
 * Number Formatter Utility
 * Provides number formatting with commas for display and input fields
 */

/**
 * Format a number with commas (thousand separators)
 * @param {number|string} num - The number to format
 * @param {boolean} allowDecimals - Whether to allow decimal places (default: true)
 * @returns {string} Formatted number string
 */
function formatNumber(num, allowDecimals = true) {
    if (num === null || num === undefined || num === '') {
        return '';
    }
    
    // Convert to number if string
    const number = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
    
    if (isNaN(number)) {
        return '';
    }
    
    // Format with commas
    if (allowDecimals && number % 1 !== 0) {
        // Has decimals - for small numbers (< 1000), don't add commas, just preserve decimals
        if (Math.abs(number) < 1000) {
            // Small decimal number - return as-is without commas
            return number.toString();
        }
        // Large decimal number - format with commas and preserve decimal places
        const decimalPlaces = (number.toString().split('.')[1] || '').length;
        const maxDecimals = Math.min(decimalPlaces, 10); // Cap at 10 decimal places
        return number.toLocaleString('en-US', { 
            minimumFractionDigits: maxDecimals > 0 ? maxDecimals : 0,
            maximumFractionDigits: maxDecimals > 0 ? maxDecimals : 10
        });
    } else {
        // Integer - format without decimals
        return number.toLocaleString('en-US');
    }
}

/**
 * Format a number for display (always with commas, no decimals unless needed)
 * @param {number|string} num - The number to format
 * @returns {string} Formatted number string
 */
function formatNumberDisplay(num) {
    if (num === null || num === undefined || num === '') {
        return '0';
    }
    
    const number = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
    
    if (isNaN(number)) {
        return '0';
    }
    
    return number.toLocaleString('en-US');
}

/**
 * Remove commas and return numeric value
 * @param {string} str - String with commas
 * @returns {number} Numeric value
 */
function parseFormattedNumber(str) {
    if (!str) return 0;
    const cleaned = String(str).replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

/**
 * Format input field value as user types
 * @param {HTMLInputElement} input - The input element
 * @param {boolean} allowDecimals - Whether to allow decimal places
 */
function formatInputOnInput(input, allowDecimals = true) {
    // Get cursor position before formatting
    const cursorPos = input.selectionStart;
    const valueBefore = input.value;
    
    // Remove all non-numeric characters (except decimal point if allowed)
    let cleaned = input.value.replace(/[^\d.]/g, '');
    
    // If decimals not allowed, remove decimal point
    if (!allowDecimals) {
        cleaned = cleaned.replace(/\./g, '');
    } else {
        // Only allow one decimal point
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }
    }
    
    // Preserve decimal part with trailing zeros
    const hasDecimal = cleaned.includes('.');
    let integerPart = '';
    let decimalPart = '';
    
    if (hasDecimal) {
        const parts = cleaned.split('.');
        integerPart = parts[0] || '';
        decimalPart = parts[1] || '';
    } else {
        integerPart = cleaned;
    }
    
    // Parse integer part
    const num = parseFloat(cleaned) || 0;
    
    // For small decimal numbers (< 1000), don't format with commas while typing
    // This prevents issues with typing decimals like 0.08
    if (allowDecimals && Math.abs(num) < 1000 && num % 1 !== 0) {
        // Small decimal - preserve trailing zeros
        if (hasDecimal) {
            input.value = integerPart + '.' + decimalPart;
        } else {
            input.value = cleaned;
        }
        // Restore cursor position (skip for number inputs)
        if (input.type !== 'number') {
            try {
                const newCursorPos = Math.max(0, Math.min(input.value.length, cursorPos));
                input.setSelectionRange(newCursorPos, newCursorPos);
            } catch (e) {
                // Ignore selection range errors
            }
        }
        return;
    }
    
    // For number inputs, don't add commas - they don't support formatted values
    if (input.type === 'number') {
        // Number inputs should only contain numeric values (no commas)
        input.value = cleaned;
        return;
    }
    
    // Format integer part with commas (only for text inputs)
    const formattedInteger = integerPart ? parseInt(integerPart.replace(/,/g, '') || '0', 10).toLocaleString('en-US') : '0';
    
    // Combine formatted integer with preserved decimal part
    let formatted = formattedInteger;
    if (hasDecimal && decimalPart !== '') {
        formatted += '.' + decimalPart;
    } else if (hasDecimal && decimalPart === '' && valueBefore.endsWith('.')) {
        // User just typed decimal point, preserve it
        formatted += '.';
    }
    
    // Update input value
    input.value = formatted;
    
    // Restore cursor position (adjust for added/removed commas)
    // Note: setSelectionRange doesn't work on input[type="number"]
    if (input.type !== 'number') {
        try {
            const diff = formatted.length - valueBefore.length;
            const newCursorPos = Math.max(0, Math.min(formatted.length, cursorPos + diff));
            input.setSelectionRange(newCursorPos, newCursorPos);
        } catch (e) {
            // Ignore selection range errors (e.g., for number inputs)
        }
    }
}

/**
 * Initialize number formatting for all number inputs on the page
 * @param {Object} options - Configuration options
 * @param {boolean} options.allowDecimals - Default allow decimals (default: true)
 * @param {string} options.selector - Custom selector for inputs (default: 'input[type="number"], .number-input, .money-input, .stock-input')
 */
function initNumberFormatting(options = {}) {
    const {
        allowDecimals = true,
        selector = 'input[type="number"], .number-input, .money-input, .stock-input, input.number-format'
    } = options;
    
    // Find all number inputs
    const inputs = document.querySelectorAll(selector);
    
    inputs.forEach(input => {
        // Determine if this input should allow decimals
        // Check if step attribute allows decimals (step < 1 or step="any" or has decimal in step)
        const stepValue = input.getAttribute('step');
        const hasDecimalStep = stepValue && (stepValue === 'any' || parseFloat(stepValue) < 1 || stepValue.includes('.'));
        const inputAllowDecimals = input.type === 'number' && hasDecimalStep
            ? true 
            : input.classList.contains('money-input') || input.classList.contains('process-input-weight') || input.classList.contains('process-output-weight')
            ? true 
            : allowDecimals;
        
        // Format on input
        input.addEventListener('input', function() {
            formatInputOnInput(this, inputAllowDecimals);
        });
        
        // Format on blur (when user leaves the field)
        input.addEventListener('blur', function() {
            // Number inputs should not be formatted with commas
            if (this.type === 'number') {
                // Just ensure it's a valid number
                const num = parseFormattedNumber(this.value);
                this.value = (num === null || num === undefined || isNaN(num)) ? '' : num.toString();
                return;
            }
            
            // Preserve trailing zeros in decimal part (for text inputs only)
            const value = this.value;
            if (inputAllowDecimals && value.includes('.')) {
                const parts = value.split('.');
                const integerPart = parts[0].replace(/,/g, '');
                const decimalPart = parts[1] || '';
                
                // Format integer part with commas
                const formattedInteger = integerPart ? parseInt(integerPart || '0', 10).toLocaleString('en-US') : '0';
                
                // Preserve decimal part with trailing zeros
                if (decimalPart !== '') {
                    this.value = formattedInteger + '.' + decimalPart;
                } else {
                    this.value = formattedInteger;
                }
            } else {
                const num = parseFormattedNumber(this.value);
                this.value = formatNumber(num, inputAllowDecimals);
            }
        });
        
        // Format initial value if present (skip number inputs)
        if (input.value && input.type !== 'number') {
            const num = parseFormattedNumber(input.value);
            input.value = formatNumber(num, inputAllowDecimals);
        }
    });
}

/**
 * Format all number displays on the page
 * Finds elements with data-format-number attribute and formats their content
 */
function formatNumberDisplays() {
    const displays = document.querySelectorAll('[data-format-number]');
    displays.forEach(element => {
        const num = parseFormattedNumber(element.textContent);
        element.textContent = formatNumberDisplay(num);
    });
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initNumberFormatting();
            formatNumberDisplays();
        });
    } else {
        initNumberFormatting();
        formatNumberDisplays();
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatNumber,
        formatNumberDisplay,
        parseFormattedNumber,
        formatInputOnInput,
        initNumberFormatting,
        formatNumberDisplays
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.NumberFormatter = {
        formatNumber,
        formatNumberDisplay,
        parseFormattedNumber,
        formatInputOnInput,
        initNumberFormatting,
        formatNumberDisplays
    };
}

