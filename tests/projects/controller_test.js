import { assert } from 'chai';
import request from 'superagent';

describe('GET /projects/{repo}/validate', function() {
  let server;

  before(async () => {
    require('src/projects/helpers/sync').default.syncProjectWorkspace = () => true;
    server = require('src/api').default.listen(3000);
  });

  after(() => {
    server.close();
  });

  it('should return 200 for valid projects', async () => {
    try {
      const res = await request.get(
        'localhost:3000/projects/good-rest-provider/validate?rev=master'
      );
      assert.equal(res.statusCode, 200);
    } catch (err) {
      assert.deepEqual(err, {}, "shouldn't throw an error.");
    }
  });

  it('should return 500 for invalid projects', async () => {
    try {
      await request.get('localhost:3000/projects/non-existing-repo/validate?rev=master');
    } catch (err) {
      assert.equal(err.status, 500);
    }
  });
});

describe('GET /projects/{repo}/sync', function() {
  let server;
  before(async () => {
    require('src/projects/helpers/sync').default.syncProjectWorkspace = () => true;
    server = require('src/api').default.listen(3000);
  });

  after(() => {
    server.close();
  });

  it('should return 200 for valid projects', async () => {
    try {
      const res = await request.get('localhost:3000/projects/good-rest-provider/sync');
      assert.equal(res.statusCode, 200);
    } catch (err) {
      assert.deepEqual(err, {}, "shouldn't throw an error.");
    }
  });

  it('should return 500 for invalid projects', async () => {
    try {
      await request.get('localhost:3000/projects/non-existing-repo/sync');
    } catch (err) {
      assert.equal(err.status, 500);
    }
  });
});
