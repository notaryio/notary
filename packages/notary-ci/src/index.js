import config from './config';
import server from './http';

process.on('unhandledRejection', (reason) => {
  config.logger.error(reason);
});

server.listen(config.ciPort, '0.0.0.0', () => config.logger.info(`notary-ci up & running at ${config.ciUrl}...`));
process.on('exit', () => server.close());
