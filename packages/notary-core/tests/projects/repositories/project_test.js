import { assert } from 'chai';
import { Project } from 'src/projects/models';

describe('all() in  projects repository', () => {
  let repo;

  before(() => {
    repo = require('src/projects/repositories/project').default;
  });

  it('returns parsed projects correctly', async () => {
    const actual = await repo.all();
    assert.includeDeepMembers(actual, [
      new Project({ repo: 'barebones', dir: 'contracts', owner: 'default-test-organization' }),
      new Project({
        repo: 'good-rest-provider',
        dir: 'contracts',
        owner: 'default-test-organization'
      }),
      new Project({
        repo: 'good-rest-consumer',
        dir: 'contracts',
        owner: 'default-test-organization'
      }),
      new Project({
        repo: 'broken-rest-provider',
        dir: 'contracts',
        owner: 'default-test-organization'
      }),
      new Project({
        repo: 'broken-rest-consumer',
        dir: 'contracts',
        owner: 'default-test-organization'
      })
      // new Project({ repo: 'good-localstorage-provider', dir: 'contracts' }),
      // new Project({ repo: 'good-localstorage-consumer', dir: 'contracts' }),
      // new Project({ repo: 'broken-localstorage-provider', dir: 'contracts' }),
      // new Project({ repo: 'broken-localstorage-consumer', dir: 'contracts' }),
    ]);
  });

  it('returns object with proper default dir of "contracts"', async () => {
    const actual = await repo.all();
    assert.deepEqual(
      actual[0],
      new Project({ repo: 'barebones', dir: 'contracts', owner: 'default-test-organization' })
    );
  });
});

describe('findByRepoAndDir() in  projects repository', () => {
  let repo;

  before(() => {
    repo = require('src/projects/repositories/project').default;
  });

  it('returns correct object when provided with valid params', async () => {
    const actual = await repo.findByRepoAndDir('good-rest-provider', 'contracts');
    assert.deepEqual(
      actual,
      new Project({
        repo: 'good-rest-provider',
        dir: 'contracts',
        owner: 'default-test-organization'
      })
    );
  });

  it('throws an error when provided with a non-existing repo & dir', async () => {
    try {
      await repo.findByRepoAndDir('foobar', 'contracts');
    } catch (err) {
      assert.include(
        err.message,
        'was not found',
        'an error should be thrown with a "not found" message.'
      );
    }
  });
});
