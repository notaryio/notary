import config from './config';

config.hive.subscribe('AVAILABLE_ACTIONS_REST', async ({name, publisher, data}) => {
  return {
    'promiseActions': ['rest-completeSwagger', 'omar-is-awesome'],
    'expectationActions': ['rest-completeSwagger']
  };
});