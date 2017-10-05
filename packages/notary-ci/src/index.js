import config from './config';
import server from './http';

server.listen(config.ciPort, '0.0.0.0', () => config.logger.info(`notary-ci up & running at ${config.ciUrl}...`));
process.on('exit', () => server.close());
