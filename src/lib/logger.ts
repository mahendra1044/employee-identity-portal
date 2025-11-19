// Minimal logger wrapper for browser/server environments
type LogArgs = any[];

function safeLog(method: 'info' | 'warn' | 'error' | 'debug') {
  return (...args: LogArgs) => {
    if (typeof console !== 'undefined' && console[method]) {
      // Keep output pinhole-friendly for tests and minimal overhead
      try {
        console[method](...args);
      } catch {
        // ignore
      }
    }
  };
}

export const logger = {
  info: safeLog('info'),
  warn: safeLog('warn'),
  error: safeLog('error'),
  debug: safeLog('debug'),
};

export default logger;
