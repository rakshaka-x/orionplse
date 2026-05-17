import chalk from 'chalk';
import { env, validateEnv } from './config/env';
import { heartbeatEngine } from './engine/heartbeat-engine';
import { createServer } from './server';

const logo = `
 ██████╗ ██████╗ ██╗ ██████╗ ███╗   ██╗
██╔═══██╗██╔══██╗██║██╔═══██╗████╗  ██║
██║   ██║██████╔╝██║██║   ██║██╔██╗ ██║
██║   ██║██╔══██╗██║██║   ██║██║╚██╗██║
╚██████╔╝██║  ██║██║╚██████╔╝██║ ╚████║
 ╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝
         Orion Pulse Lite`;

(async () => {
  validateEnv();
  console.log(chalk.magenta(logo));
  console.log(chalk.cyan(`Interval: ${env.heartbeatIntervalMs} ms`));

  await heartbeatEngine.start();

  const app = createServer();
  const server = app.listen(env.port, () => {
    console.log(chalk.green(`Dashboard running on http://localhost:${env.port}`));
  });

  const shutdown = async () => {
    await heartbeatEngine.stop();
    server.close(() => {
      console.log(chalk.yellow('Graceful shutdown complete.'));
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})();
