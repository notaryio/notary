import path from 'path';
import fs from 'fs';

import sinon from 'sinon';
import mockery from 'mockery';
import { assert } from 'chai';

describe('syncAllProjectsOnStartup() in the sync helper', () => {
  let syncHelper;

  before(() => {
    syncHelper = require('src/projects/helpers/sync').default;
  });

  it('calls syncProjectWorkspace() on all entries in the projects.yml file', async () => {
    const stub = sinon.stub(syncHelper, 'syncProjectWorkspace');
    stub.returns(Promise.resolve(true));

    await syncHelper.syncAllProjectsOnStartup();
    assert.equal(syncHelper.syncProjectWorkspace.callCount, 8);
  }).timeout(15000);
});

describe('syncProjectWorkspace() in the sync helper', () => {
  let syncHelper;
  let models;

  before(() => {
    mockery.resetCache();
    require('src/config').default.tmpDir = '/tmp';
    models = require('src/projects/models');
    syncHelper = require('src/projects/helpers/sync').default;
  });

  it('downloads & unpacks correct contracts/ directory', async () => {
    const workspace = new models.ProjectWorkspace({
      project: new models.Project({ repo: 'notary', dir: 'examples/barebones' }),
      rev: 'master',
      owner: 'omarahm'
    });

    await syncHelper.syncProjectWorkspace(workspace);

    assert.isTrue(fs.existsSync(path.join(workspace.getContractsPath(), 'contracts.yml')));
  }).timeout(15000);

  it('throws an error for non-existing repository in Github', async () => {
    const workspace = new models.ProjectWorkspace({
      project: new models.Project({ repo: 'non-existing-repo', dir: 'whatever' }),
      rev: 'master'
    });

    try {
      await syncHelper.syncProjectWorkspace(workspace);
    } catch (err) {
      assert.include(err.message, 'Synchronization error');
    }
  }).timeout(15000);
});
