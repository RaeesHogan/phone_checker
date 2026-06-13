type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

interface LogPayload {
  level: LogLevel;
  source: string;
  message: string;
  details?: any;
  requestId?: string;
  stackTrace?: string;
}

/**
 * Structured logger for AI-readable JSON logs.
 */
export const logger = {
  info(source: string, message: string, details?: any, requestId?: string) {
    this.log({ level: 'INFO', source, message, details, requestId });
  },

  warn(source: string, message: string, details?: any, requestId?: string) {
    this.log({ level: 'WARNING', source, message, details, requestId });
  },

  error(source: string, message: string, error?: any, requestId?: string) {
    this.log({
      level: 'ERROR',
      source,
      message: error instanceof Error ? error.message : message,
      stackTrace: error instanceof Error ? error.stack : undefined,
      details: error instanceof Error ? undefined : error,
      requestId,
    });
  },

  critical(source: string, message: string, error?: any, requestId?: string) {
    this.log({
      level: 'CRITICAL',
      source,
      message: error instanceof Error ? error.message : message,
      stackTrace: error instanceof Error ? error.stack : undefined,
      details: error instanceof Error ? undefined : error,
      requestId,
    });
  },

  log(payload: LogPayload) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...payload,
    };

    // Output JSON for structured logging (AI-readable)
    console.log(JSON.stringify(logEntry));

    // In a real implementation, we would also persist to the SystemLog table here
    // But since this is a utility, we use the JSON output for external monitoring.
  },
};
