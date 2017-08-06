// Individual integration-types logic are stubbed here and not tested. Check
// ./tests/integrations/*
import { assert } from 'chai';
import { VError } from 'verror';

describe('isValid() in the contracts validation service', () => {
  let projectRevisionRepo;

  before(async () => {
    require('src/projects/helpers/sync').default.syncProjectWorkspace = () => true;
    projectRevisionRepo = require('src/projects/repositories/project_revision').default;
  });

  it('passes when all checks are green', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'barebones',
      'contracts',
      'master'
    );

    require('src/contracts/integrations').default = stubIntegration(true, true);
    const service = require('src/contracts/validation').default;

    try {
      await service.isValid(projectRevision);
    } catch (err) {
      assert.deepEqual(err, {}, "shouldn't throw an error.");
    }
  });

  it('passes when multiple promises of the same integration type is defined but with unqiue meta.name', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-schema-provider',
      'contracts',
      'master'
    );

    require('src/contracts/integrations').default = stubIntegration(true, true);
    const service = require('src/contracts/validation').default;

    try {
      await service.isValid(projectRevision);
    } catch (err) {
      assert.deepEqual(err, {}, "shouldn't throw an error.");
    }
  });

  it('throws an error on multiple promises of the same integration type with no unqiue meta.name', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'broken-rest-provider',
      'contracts',
      'rev-multiple-promises'
    );

    require('src/contracts/integrations').default = stubIntegration(true, true);
    const service = require('src/contracts/validation').default;

    try {
      await service.isValid(projectRevision);
    } catch (err) {
      assert.include(
        err.message,
        'Error, project promises of type rest is not uniquely identifiable.'
      );
    }
  });

  it('throws an error if any of contracts schema is not valid', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'barebones',
      'contracts',
      'master'
    );

    require('src/contracts/integrations').default = stubIntegration(true, true);
    const service = require('src/contracts/validation').default;

    try {
      await service.isValid(projectRevision);
    } catch (err) {
      assert.include(err.message, 'of type rest is not valid');
    }
  });

  // todo: change the integration type mapper stub to change behavior for different params
  // it('throws an error if the project under test break any of the consumers', async () => {});
  // it('throws an error if the project under test has any expectation from an upstream that was not met', async () => {});
});

// helper functions
function stubIntegration(returnIsValidContract, returnIsValid) {
  return {
    exists: () => true,
    get: () => ({
      validate: () => {
        return returnIsValid ? Promise.resolve() : Promise.reject(new VError(`todo: fill in this`));
      },
      validateContractSchema: () => {
        return returnIsValidContract ? Promise.resolve() : Promise.reject(new VError());
      }
    })
  };
}
