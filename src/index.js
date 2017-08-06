import api from './api';
import gui from './endpoints/directory_gui/server';
import config from './config';
import sync from './projects/helpers/sync';

sync
  //todo: .validateConfiguration()
  .syncAllProjectsOnStartup()
  .then(function() {
    const server = api.listen(3000, '0.0.0.0', () => config.logger.info('API server running'));
    process.on('exit', () => server.close());
  })
  .then(function() {
    const server = gui.listen(4000, '0.0.0.0', () => config.logger.info('GUI Server running'));
    process.on('exit', () => server.close());
  })
  .catch(err => {
    process.stdout.write('Fatal error occurred: ' + err.message);
    process.exit(1);
  });
