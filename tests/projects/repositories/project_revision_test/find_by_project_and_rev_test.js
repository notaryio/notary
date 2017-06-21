import { assert } from 'chai';
import mockery from 'mockery';
import _ from 'lodash';
import { VError } from 'verror';
import sinon from 'sinon';

import { Project, ProjectInfo, ProjectRevision, ProjectWorkspace } from 'src/projects/models';

describe('findByProjectAndRev() in  project revisions repository', () => {
  let repo;

  before(() => {
    mockery.resetCache();
    require('src/projects/helpers/sync').default.syncProjectWorkspace = () => true;
    mockery.registerMock('../../contracts/repository', contractRepoStub());
    repo = require('src/projects/repositories/project_revision').default;
  });

  afterEach(() => {
    // if getProjectInfo was stubbed during a test, restore it
    if (_.isFunction(repo.getProjectInfo.restore)) {
      repo.getProjectInfo.restore();
    }
  });

  it('returns correct ProjectRevision when given valid input', async () => {
    const stub = sinon.stub(repo, 'getProjectInfo');
    stub
      .withArgs(
        new ProjectWorkspace({
          project: new Project({ repo: 'repo1', dir: 'contracts' }),
          rev: 'master'
        })
      )
      .returns(new ProjectInfo({ name: 'dummy project', meta: {} }));

    const actual = await repo.findByProjectAndRev(
      new Project({ repo: 'repo1', dir: 'contracts' }),
      'master'
    );

    assert.deepEqual(
      actual,
      new ProjectRevision({
        workspace: new ProjectWorkspace({
          project: new Project({ repo: 'repo1', dir: 'contracts' }),
          rev: 'master'
        }),
        contracts: [],
        info: new ProjectInfo({ name: 'dummy project', meta: {} })
      })
    );
  });

  it('returns correct ProjectRevision when given valid input, defaulting rev to "master"', async () => {
    const stub = sinon.stub(repo, 'getProjectInfo');
    stub
      .withArgs(
        new ProjectWorkspace({
          project: new Project({ repo: 'repo2', dir: 'contracts' }),
          rev: 'master'
        })
      )
      .returns(new ProjectInfo({ name: 'dummy project', meta: {} }));

    const actual = await repo.findByProjectAndRev(new Project({ repo: 'repo2', dir: 'contracts' }));

    assert.deepEqual(
      actual,
      new ProjectRevision({
        workspace: new ProjectWorkspace({
          project: new Project({ repo: 'repo2', dir: 'contracts' }),
          rev: 'master'
        }),
        contracts: [],
        info: new ProjectInfo({ name: 'dummy project', meta: {} })
      })
    );
  });

  it('throws an error when synchronization fails', async () => {
    try {
      await repo.findByProjectAndRev(
        new Project({ repo: 'invalid-repo', dir: 'invalid-dir' }),
        'master'
      );
    } catch (err) {
      assert.include(err.message, 'Failed to fetch project info');
    }
  });

  it('throws an error when loading contract fails, invalid contracts.yml', async () => {
    try {
      await repo.findByProjectAndRev(
        new Project({ repo: 'repo2', dir: 'contracts' }),
        '1c1db5f37632f522ba6741e357af6a85aeebeca8'
      );
    } catch (err) {
      assert.include(err.message, 'Failed to fetch contracts');
    }
  });

  it('throws an error when loading project info fails, invalid contracts.yml', async () => {
    const stub = sinon.stub(repo, 'getProjectInfo');
    stub
      .withArgs(
        new ProjectWorkspace({
          project: new Project({ repo: 'repo1', dir: 'contracts' }),
          rev: 'master'
        })
      )
      .throws(new VError('Failed to fetch project info'));

    try {
      await repo.findByProjectAndRev(new Project({ repo: 'repo1', dir: 'contracts' }), 'master');
    } catch (err) {
      assert.include(err.message, 'Failed to fetch project info');
    }
  });
});

// helper functions
const workspaces = [
  { repo: 'repo1', dir: 'contracts', rev: 'master', validContracts: true },
  { repo: 'repo2', dir: 'contracts', rev: 'master', validContracts: true },
  {
    repo: 'repo2',
    dir: 'contracts',
    rev: '1c1db5f37632f522ba6741e357af6a85aeebeca8',
    validContracts: false
  }
];

// function projectRepoStub() {
//   const repo = {};
//   const stub = sinon.stub(repo, 'findByRepoAndDir');
//
//   projects.forEach(p => {
//     stub
//     .withArgs(p.repo, p.dir)
//     .returns(p);
//   });
//
//   return stub;
// }

function contractRepoStub() {
  const stub = sinon.stub({}, 'findAllWithinWorkspace');

  workspaces.filter(w => w.validContracts).forEach(w => {
    stub
      .withArgs(
        new ProjectWorkspace({ project: new Project({ repo: w.repo, dir: w.dir }), rev: w.rev })
      )
      .returns(Promise.resolve([]));
  });

  workspaces.filter(w => !w.validContracts).forEach(w => {
    stub
      .withArgs(
        new ProjectWorkspace({ project: new Project({ repo: w.repo, dir: w.dir }), rev: w.rev })
      )
      .throws(new VError('Failed to fetch contracts'));
  });

  return { findAllWithinWorkspace: stub };
}
