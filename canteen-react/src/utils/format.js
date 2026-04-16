export const formatPeso = (value) => {
  const amount = Number.isFinite(value) ? value : 0;
  return '₱' + new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const parseAmount = (value) => Number.isFinite(parseFloat(value)) ? parseFloat(value) : 0;

export const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (s) => {
  const map = {
    '&': '&amp;',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#39;',
  };
  return map[s];
});
