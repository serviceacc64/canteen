export const formatPeso = (value) => {
  const amount = Number.isFinite(value) ? value : 0;
  return '₱' + new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const parseAmount = (value) => {
  const cents = Number.isFinite(Number(value)) ? Number(value) : 0;
  return cents / 100;
};

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
