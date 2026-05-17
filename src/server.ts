import express from 'express';
import { heartbeatEngine } from './engine/heartbeat-engine';
import { dashboardHtml } from './ui/dashboard';

export const createServer = () => {
  const app = express();
  app.use(express.json());

  app.get('/', (_req, res) => res.type('html').send(dashboardHtml));
  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/status', (_req, res) => res.json(heartbeatEngine.status()));
  app.get('/api/logs', (_req, res) => res.json(heartbeatEngine.getLogs()));
  app.post('/api/start', async (_req, res) => {
    await heartbeatEngine.start();
    res.json({ ok: true });
  });
  app.post('/api/stop', async (_req, res) => {
    await heartbeatEngine.stop();
    res.json({ ok: true });
  });
  app.post('/api/ping-now', async (_req, res) => {
    await heartbeatEngine.pingNow('manual ping');
    res.json({ ok: true });
  });

  return app;
};
