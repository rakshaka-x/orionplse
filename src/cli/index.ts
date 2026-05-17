#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { env } from '../config/env';

const program = new Command();
const baseUrl = `http://127.0.0.1:${env.port}`;

async function request(path: string, method: 'GET' | 'POST' = 'GET'): Promise<any> {
  const res = await fetch(`${baseUrl}${path}`, { method });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

program.name('pulse').description('Orion Pulse Lite CLI');

program.command('start').description('Start heartbeat loop on running service').action(async () => {
  try {
    await request('/api/start', 'POST');
    console.log(chalk.green('Pulse started.'));
  } catch (error) {
    console.log(chalk.red('Could not start pulse. Is the server running?'));
    throw error;
  }
});

program.command('stop').description('Stop heartbeat loop on running service').action(async () => {
  await request('/api/stop', 'POST');
  console.log(chalk.yellow('Pulse stopped.'));
});

program.command('status').action(async () => {
  const s = await request('/api/status');
  console.log(chalk.cyan('Heartbeat status'));
  console.log(`Running: ${s.running}`);
  console.log(`Supabase Connected: ${s.dbConnected}`);
  console.log(`Next Ping: ${s.nextPingAt ?? 'N/A'}`);
  console.log(`Last Success: ${s.lastSuccessAt ?? 'N/A'}`);
  console.log(`Errors: ${s.errorCount}`);
  console.log(`Interval: ${env.heartbeatIntervalMs}ms`);
});

program.command('ping-now').action(async () => {
  await request('/api/ping-now', 'POST');
  console.log(chalk.green('Manual ping complete.'));
});

program.command('logs').action(async () => {
  const logs = await request('/api/logs');
  logs.forEach((l: { at: string; level: string; message: string }) => {
    console.log(`[${l.at}] ${l.level.toUpperCase()} ${l.message}`);
  });
});

program.parseAsync();
