import chalk from 'chalk';

export type LogLevel = 'info' | 'success' | 'warn' | 'error';

export interface LogEntry {
  at: string;
  level: LogLevel;
  message: string;
}

const history: LogEntry[] = [];
const MAX_LOGS = 200;

const palette: Record<LogLevel, (v: string) => string> = {
  info: chalk.cyan,
  success: chalk.green,
  warn: chalk.yellow,
  error: chalk.red
};

export const log = (level: LogLevel, message: string): void => {
  const at = new Date().toISOString();
  const line = `[${at}] ${level.toUpperCase()} ${message}`;
  history.push({ at, level, message });
  if (history.length > MAX_LOGS) history.shift();
  console.log(palette[level](line));
};

export const getLogs = (): LogEntry[] => [...history];
