import config from './config';
import server from './server';

server.listen(config.directoryPort, '0.0.0.0', () => config.logger.info(`notary-directory up & running at ${config.directoryUrl}...`));
process.on('exit', () => server.close());
