import api from './http';
import config from './config';
import sync from './projects/sync_helper';

process.on('unhandledRejection', (reason) => {
  config.logger.error(reason);
});

sync
  //todo: .validateConfiguration()
  .syncAllProjectsMasters()
  .then(function() {
    const server = api.listen(3000, '0.0.0.0', () => config.logger.info('notary-core up & running at 3000...'));
    process.on('exit', () => server.close());
  })
  .catch(err => {
    process.stdout.write('Fatal error occurred: ' + err.message);
    process.exit(1);
  });
