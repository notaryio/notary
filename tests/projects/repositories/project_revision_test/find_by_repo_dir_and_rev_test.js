import { assert } from 'chai';
import * as mockery from 'mockery';
import _ from 'lodash';
import { VError } from 'verror';
import sinon from 'sinon';

import { Project, ProjectInfo, ProjectRevision, ProjectWorkspace } from 'src/projects/models';

describe('findByRepoDirAndRev() in  project revisions repository', () => {
  let repo;

  before(() => {
    mockery.resetCache();
    mockery.registerMock('./project', projectRepoMock());
    repo = require('src/projects/repositories/project_revision').default;
  });

  afterEach(() => {
    repo.findByProjectAndRev.restore();
  });

  it('returns correct ProjectRevision when given valid input', async () => {
    const rev = revisionMockGen('repo1', 'dir1', '1c1db5f37632f522ba6741e357af6a85aeebeca8');
    const stub = sinon.stub(repo, 'findByProjectAndRev');
    stub
      .withArgs(
        new Project({ repo: 'repo1', dir: 'dir1' }),
        '1c1db5f37632f522ba6741e357af6a85aeebeca8'
      )
      .returns(rev);

    const actual = await repo.findByRepoDirAndRev(
      'repo1',
      'dir1',
      '1c1db5f37632f522ba6741e357af6a85aeebeca8'
    );

    assert.deepEqual(actual, rev);
  });

  it('throws an error with non-existent project e.g. propagates up errors as expected', async () => {
    const stub = sinon.stub(repo, 'findByProjectAndRev');
    stub.withArgs(new Project({ repo: 'foobar', dir: 'foodir' }), 'master').returns({});

    try {
      await repo.findByRepoDirAndRev('foobar', 'foodir', 'master');
    } catch (err) {
      assert.include(
        err.message,
        'was not found',
        'an error should be thrown with a "not found" message.'
      );
    }

    assert.isTrue(repo.findByProjectAndRev.notCalled);
  });
});

// helper functions
function projectRepoMock() {
  //todo: replace with a sinon stub
  const validProjects = [{ repo: 'repo1', dir: 'dir1' }, { repo: 'repo2', dir: 'dir2' }];

  return {
    findByRepoAndDir: (repo, dir) => {
      if (_.some(validProjects, { repo, dir })) {
        return new Project({ repo, dir });
      } else {
        throw new VError('project was not found');
      }
    }
  };
}

function revisionMockGen(repo, dir, rev) {
  return new ProjectRevision({
    workspace: new ProjectWorkspace({ project: new Project({ repo, dir }), rev }),
    contracts: [],
    info: new ProjectInfo({ name: `project ${repo}:${dir}`, meta: {} })
  });
}
