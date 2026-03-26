/**
 * Shared Form Utilities - Reusable across dashboard/entry/view pages
 * Clean, functional approach with currency formatting & toasts
 */

const CURRENCY_SYMBOL = '₱';
const CURRENCY_OPTIONS = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
};

/**
 * Escape HTML to prevent XSS in dynamic content
 */
export function escapeHtml(str) {
  if (!str) return '';
  const map = {
    '&': '&amp;',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#39;'
  };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}

/**
 * Format number as currency (₱1,234.00)
 */
export function formatCurrency(value) {
  const num = parseFloat(value) || 0;
  return CURRENCY_SYMBOL + num.toLocaleString('en-PH', CURRENCY_OPTIONS);
}

/**
 * Update DOM element with formatted currency
 */
export function updateCurrencyDisplay(selector, value) {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (el) {
    el.textContent = formatCurrency(value);
  }
}

/**
 * Show success/error toast (accessible)
 */
export function showToast(message, isError = false) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  
  const timeout = toast._hideTimeout;
  if (timeout) clearTimeout(timeout);
  toast._hideTimeout = setTimeout(() => {
    toast.classList.remove('show', 'error');
  }, 3000);
}

/**
 * Parse form section data (reusable for sales/purchases/etc.)
 * @param {string} sectionSelector - e.g. '[data-section="sales"]'
 */
export function collectSectionData(sectionSelector) {
  const section = document.querySelector(sectionSelector);
  if (!section) return [];
  
  return Array.from(section.querySelectorAll('.input-row:not(.add-entry-row)')).map(row => {
    const label = row.querySelector('label');
    const input = row.querySelector('input[type="number"]');
    const category = row.dataset.category || row.closest('[data-category]')?.dataset.category || 'General';
    
    if (!label || !input || parseFloat(input.value) === 0) return null;
    
    return {
      category,
      item_name: label.textContent.trim().replace(/^<b>|<\/b>$/g, ''),
      amount: parseFloat(input.value)
    };
  }).filter(Boolean);
}

// Export default for tree-shaking
export default {
  escapeHtml,
  formatCurrency,
  updateCurrencyDisplay,
  showToast,
  collectSectionData
};

