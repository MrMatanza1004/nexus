// ─────────────────────────────────────────────
// NEXUS — Structured Logging
// ─────────────────────────────────────────────
// Wraps console methods with structured JSON output
// that can be ingested by log services (Axiom, Logtail, etc.)

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 }
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.info

function log(level, message, meta = {}) {
  if (LOG_LEVELS[level] < currentLevel) return

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'nexus',
    ...meta,
  }

  const output = JSON.stringify(entry)
  switch (level) {
    case 'error': console.error(output); break
    case 'warn':  console.warn(output);  break
    default:      console.log(output);   break
  }
}

export const logger = {
  debug: (msg, meta) => log('debug', msg, meta),
  info:  (msg, meta) => log('info', msg, meta),
  warn:  (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
}
