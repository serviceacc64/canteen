export const requiredText = (value) => String(value ?? '').trim().length > 0;

export const requiredNumber = (value) => {
  const num = Number.parseFloat(value);
  return Number.isFinite(num);
};

export const minNumber = (value, min = 0) => {
  const num = Number.parseFloat(value);
  return Number.isFinite(num) && num >= min;
};

export const nonNegativeCurrency = (value) => minNumber(value, 0);

export const validateEntryMeta = ({ canteenLocation, date }) => {
  const errors = {};

  if (!requiredText(canteenLocation)) {
    errors.canteenLocation = 'Canteen location is required.';
  }

  if (!requiredText(date)) {
    errors.date = 'Date is required.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  requiredText,
  requiredNumber,
  minNumber,
  nonNegativeCurrency,
  validateEntryMeta,
};
