export const logError = (context, error, details = {}) => {
  // keep structured logs for migration debugging
  console.error(`[Canteen Error - ${context}]`, {
    error: error?.message || error,
    stack: error?.stack,
    details,
    timestamp: new Date().toISOString(),
  });
};

export const safeParseFloat = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const safeExec = (fn, context = 'safeExec') => {
  try {
    return fn();
  } catch (error) {
    logError(context, error);
    return null;
  }
};

export default {
  logError,
  safeParseFloat,
  safeExec,
};
