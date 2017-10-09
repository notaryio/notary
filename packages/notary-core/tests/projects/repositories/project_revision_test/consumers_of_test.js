import { assert } from 'chai';
import mockery from 'mockery';

describe('consumersOf() in projects revision repository', () => {
  let repo;

  before(async () => {
    mockery.resetCache();
    require('src/projects/helpers/sync').default.syncProjectWorkspace = () => true;
    repo = require('src/projects/repositories/project_revision').default;
  });

  it('returns empty if there are no promises in contracts.yml', async () => {
    const projectRevision = await repo.findByRepoDirAndRev('good-consumer', 'contracts', 'master');
    const actualConsumers = await repo.consumersOf(projectRevision);

    assert.deepEqual(actualConsumers, []);
  });

  it('returns empty if there are promises in contracts.yml, but no consumers', async () => {
    const projectRevision = await repo.findByRepoDirAndRev(
      'barebones',
      'contracts',
      'rev-missing-paths'
    );
    const actualConsumers = await repo.consumersOf(projectRevision);

    assert.deepEqual(actualConsumers, []);
  });

  it('returns all consumers for promises in contracts.yml', async () => {
    const projectRevision = await repo.findByRepoDirAndRev(
      'good-rest-provider',
      'contracts',
      'master'
    );
    const actualConsumers = await repo.consumersOf(projectRevision);

    const goodConsumer = await repo.findByRepoDirAndRev('good-consumer', 'contracts', 'master');
    const goodRest = await repo.findByRepoDirAndRev('good-rest-consumer', 'contracts', 'master');

    assert.sameDeepMembers(actualConsumers, [goodConsumer, goodRest]);
  });

  // Because devs will be able to adjust codebase/contracts on the same PR
  it(
    'returns a consumer object with the current rev(not master) if the project' +
      " is self-consuming it's own promises",
    async () => {
      const projectRevision = await repo.findByRepoDirAndRev(
        'good-rest-provider',
        'contracts',
        'rev-self-consume'
      );
      const actualConsumers = await repo.consumersOf(projectRevision);

      const project4Revision = await repo.findByRepoDirAndRev(
        'good-rest-provider',
        'contracts',
        'rev-self-consume'
      );

      assert.includeDeepMembers(actualConsumers, [project4Revision]);
    }
  );
});
