// Centralized logging utility to replace console.log statements

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logs: LogEntry[] = [];

  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown,
  ) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data,
    };

    this.logs.push(entry);

    // Keep only last 100 logs in memory
    if (this.logs.length > 100) {
      this.logs.shift();
    }

    // Only log to console in development
    if (this.isDevelopment) {
      const logMethod = console[level] || console.log;
      const prefix = context ? `[${context}]` : '';
      logMethod(`${prefix} ${message}`, data || '');
    }
  }

  debug(message: string, context?: string, data?: unknown) {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: unknown) {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: unknown) {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, data?: unknown) {
    this.log('error', message, context, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
