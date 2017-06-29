import { assert } from 'chai';

describe('getProjectInfo() in projects revision repository', () => {
  let models;
  let repo;

  before(async () => {
    require('src/projects/helpers/sync').default.syncProjectWorkspace = () => true;
    models = require('src/projects/models');
    repo = require('src/projects/repositories/project_revision').default;
  });

  it('returns correct object with valid input', async () => {
    const actual = await repo.getProjectInfo(
      new models.ProjectWorkspace({
        project: new models.Project({ repo: 'barebones', dir: 'contracts' }),
        rev: 'master'
      })
    );

    assert.deepEqual(
      actual,
      new models.ProjectInfo({
        name: 'Simple Project 1',
        meta: {
          email: 'team@company.com',
          tribe: 'tribe-name',
          pod: 'team-name'
        }
      })
    );
  });
});
