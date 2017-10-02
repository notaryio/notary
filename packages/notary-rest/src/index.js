import config from './config';

config.hive.subscribe('CONTRACT_AVAILABLE_ACTIONS', async ({ data }) => {
  if (data.integrationPlugin === 'rest') {
    return {
      promiseActions: [
        {
          label: 'Download Swagger file',
          name: 'rest-single-file-swagger',
          href: `${config.restUrl}/single-file-swagger?project=${data.project}&revision=${data.revision}&contract=${data.contract}`
        }
      ],
      expectationActions: [
        {
          label: 'Download Swagger file',
          name: 'rest-single-file-swagger',
          href: `${config.restUrl}/single-file-swagger?project=${data.project}&revision=${data.revision}&contract=${data.contract}`
        }
      ]
    };
  }
});