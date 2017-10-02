import { assert } from 'chai';

describe('wrapSuccess()/wrapError() in response helper', () => {
  it(
    'wrapSuccess()/wrapError() returns correct browser-friendly success message' +
      'if the request is done by browser',
    () => {
      const helper = require('src/projects/helpers/response').default;
      assert.include(helper.wrapError(`\n\n test content`, 'Chrome'), 'color: red');
    }
  );
  it(
    'wrapSuccess()/wrapError() returns correct command line-friendly success' +
      ' message if the request is done by curl/wget',
    () => {
      const helper = require('src/projects/helpers/response').default;
      assert.include(helper.wrapSuccess(`\n\n test content`, 'wget'), '[32m');
    }
  );
});
