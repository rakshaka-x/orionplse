import { env } from '../config/env';
import { upsertHeartbeat } from '../services/supabase';
import { getLogs, log } from '../utils/logger';

export interface EngineState {
  running: boolean;
  startedAt?: string;
  lastSuccessAt?: string;
  nextPingAt?: string;
  successCount: number;
  errorCount: number;
  uptimeMs: number;
  dbConnected: boolean;
  lastError?: string;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

class HeartbeatEngine {
  private isRunning = false;
  private startedAt?: Date;
  private lastSuccessAt?: Date;
  private nextPingAt?: Date;
  private successCount = 0;
  private errorCount = 0;
  private dbConnected = false;
  private lastError?: string;
  private loopPromise?: Promise<void>;

  start = async (): Promise<void> => {
    if (this.isRunning) {
      log('warn', 'Heartbeat engine is already running.');
      return;
    }

    this.isRunning = true;
    this.startedAt = new Date();
    log('info', `Heartbeat engine started. Interval=${env.heartbeatIntervalMs}ms`);
    this.loopPromise = this.runLoop();
  };

  stop = async (): Promise<void> => {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.nextPingAt = undefined;
    if (this.loopPromise) await this.loopPromise;
    log('warn', 'Heartbeat engine stopped.');
  };

  status = (): EngineState => ({
    running: this.isRunning,
    startedAt: this.startedAt?.toISOString(),
    lastSuccessAt: this.lastSuccessAt?.toISOString(),
    nextPingAt: this.nextPingAt?.toISOString(),
    successCount: this.successCount,
    errorCount: this.errorCount,
    uptimeMs: this.startedAt ? Date.now() - this.startedAt.getTime() : 0,
    dbConnected: this.dbConnected,
    lastError: this.lastError
  });

  getLogs = getLogs;

  pingNow = async (message = 'scheduled heartbeat'): Promise<boolean> => this.tryPing(message);

  private async runLoop(): Promise<void> {
    await this.tryPing('startup ping');

    while (this.isRunning) {
      this.nextPingAt = new Date(Date.now() + env.heartbeatIntervalMs);
      await sleep(env.heartbeatIntervalMs);
      if (!this.isRunning) break;
      await this.tryPing('scheduled heartbeat');
    }
  }

  private async tryPing(message: string): Promise<boolean> {
    try {
      await upsertHeartbeat(message);
      this.lastSuccessAt = new Date();
      this.successCount += 1;
      this.dbConnected = true;
      this.lastError = undefined;
      log('success', `Heartbeat updated (row id=${env.heartbeatRowId}).`);
      return true;
    } catch (error) {
      this.errorCount += 1;
      this.dbConnected = false;
      this.lastError = error instanceof Error ? error.message : 'Unknown DB error';
      log('error', `Heartbeat failed: ${this.lastError}`);
      await this.retryWithBackoff();
      return false;
    }
  }

  private async retryWithBackoff(): Promise<void> {
    if (!this.isRunning) return;
    const retryMs = Math.min(60_000, Math.max(5_000, Math.floor(env.heartbeatIntervalMs / 10)));
    this.nextPingAt = new Date(Date.now() + retryMs);
    log('warn', `Retry scheduled in ${retryMs}ms.`);
    await sleep(retryMs);
    if (!this.isRunning) return;
    await this.tryPing('retry heartbeat');
  }
}

export const heartbeatEngine = new HeartbeatEngine();
