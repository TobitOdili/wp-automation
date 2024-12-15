export const logger = {
  info: (...args) => console.info('[Server]', ...args),
  error: (...args) => console.error('[Server]', ...args),
  warn: (...args) => console.warn('[Server]', ...args),
  debug: (...args) => console.debug('[Server]', ...args)
};