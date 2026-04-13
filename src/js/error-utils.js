// Centralized Error Handling & Utilities for Canteen App
// Prevents crashes, shows user-friendly messages, logs for devs

// Show user-friendly toast (success/error/loading)
function showToast(type = 'info', message = '', duration = 4000) {
  const toast = document.getElementById('appToast');
  if (!toast) {
    // Fallback: create toast
    const newToast = document.createElement('div');
    newToast.id = 'appToast';
    newToast.className = `toast toast-${type}`;
    newToast.innerHTML = `<span>${message}</span><button class="toast-close">&times;</button>`;
    document.body.appendChild(newToast);
    const closeBtn = newToast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => newToast.remove());
    setTimeout(() => newToast.remove(), duration);
    return;
  }
  
  toast.className = `toast toast-${type} show`;
  toast.querySelector('span') || toast.appendChild(document.createElement('span'));
  toast.querySelector('span').textContent = message;
  const closeBtn = toast.querySelector('.toast-close') || document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.textContent = '×';
  closeBtn.onclick = () => toast.classList.remove('show');
  if (!toast.querySelector('.toast-close')) toast.appendChild(closeBtn);
  
  setTimeout(() => toast.classList.remove('show'), duration);
}

// Error-specific toast
function showErrorToast(message) {
  showToast('error', message);
  logError('User Error', message);
}

// Dev logging (structured)
function logError(context, error, details = {}) {
  console.error(`[Canteen Error - ${context}]`, {
    error: error.message || error,
    stack: error.stack,
    details,
    timestamp: new Date().toISOString()
  });
}

// Safe DOM query (prevent null errors)
function safeQuery(selector, fallback = null) {
  try {
    const el = document.querySelector(selector);
    return el || fallback;
  } catch (e) {
    logError('DOM Query Failed', e, { selector });
    return fallback;
  }
}

function safeGetId(id, fallback = null) {
  return safeQuery(`#${id}`, fallback);
}

// Safe parse float
function safeParseFloat(value, fallback = 0) {
  try {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch (e) {
    logError('ParseFloat Failed', e, { value });
    return fallback;
  }
}

// Safe date parse
function safeParseDate(value, fallback = '') {
  try {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? fallback : date;
  } catch (e) {
    logError('Date Parse Failed', e, { value });
    return fallback;
  }
}

// Safe exec async (try-catch promise)
async function safeAsync(fn, context = 'Async Op') {
  try {
    return await fn();
  } catch (error) {
    logError(context, error);
    showErrorToast(`Operation failed. Please try again.`);
    return null;
  }
}

// Export for use (simulate modules)
window.ErrorUtils = {
  showToast, showErrorToast, logError, safeQuery, safeGetId,
  safeParseFloat, safeParseDate, safeAsync
};

