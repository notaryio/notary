import request from 'superagent';
import { assert } from 'chai';
import api from 'src/api';

describe('GET /system/health', function() {
  let server;
  before(() => {
    server = api.listen(3000);
  });
  after(() => {
    server.close();
  });

  it('should be healthy', () => {
    return request
      .get('localhost:3000/system/health')
      .then(res => assert.equal(res.statusCode, 200));
  });
});
