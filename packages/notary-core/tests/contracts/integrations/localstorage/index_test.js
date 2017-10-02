import { assert } from 'chai';

describe('validateContractSchema() in the localstorage integration type facade', () => {
  let localstorageFacade;
  let projectRevisionRepo;

  before(async () => {
    require('src/projects/helpers/sync').default.syncProjectWorkspace = () => true;
    localstorageFacade = require('src/contracts/integrations/localstorage');
    projectRevisionRepo = require('src/projects/repositories/project_revision').default;
  });

  it('passes if given input is valid', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-localstorage-provider',
      'contracts',
      'master'
    );
    const contract = projectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'localstorage'
    );

    try {
      await localstorageFacade.validateContractSchema(projectRevision, contract);
    } catch (err) {
      assert.deepEqual(err, {}, "shouldn't throw an error.");
    }
  });

  it('throws an error if a localstorage.yml file was not found in the contract directory', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'broken-localstorage-provider',
      'contracts',
      'master'
    );
    const contract = projectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'localstorage'
    );

    try {
      await localstorageFacade.validateContractSchema(projectRevision, contract);
    } catch (err) {
      assert.include(err.message, "localstorage.yml' doesn't exist");
    }
  });

  it('throws an error if a localstorage.yml file was found but with invalid schema', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'broken-localstorage-provider',
      'contracts',
      'rev-promise-localstorage-invalid-schema'
    );
    const contract = projectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'localstorage'
    );

    try {
      await localstorageFacade.validateContractSchema(projectRevision, contract);
    } catch (err) {
      assert.include(err.message, 'Invalid contracts/promises/localstorage/localstorage.yml file');
    }
  });
});

describe('validate() in the localstorage integration type facade', () => {
  let localstorageFacade;
  let projectRevisionRepo;

  before(async () => {
    require('src/projects/helpers/sync').default.syncProjectWorkspace = () => true;
    localstorageFacade = require('src/contracts/integrations/localstorage');
    projectRevisionRepo = require('src/projects/repositories/project_revision').default;
  });

  it('passes if given consumer expectations are a subset of the producer promises', async () => {
    const producerProjectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-localstorage-provider',
      'contracts',
      'master'
    );
    const promise = producerProjectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'local-storage'
    );
    const consumerProjectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-consumer',
      'contracts',
      'master'
    );
    const expectation = consumerProjectRevision.contracts.find(
      c => c.type === 'expectation' && c.integrationType === 'local-storage'
    );

    try {
      await localstorageFacade.validate(
        producerProjectRevision,
        consumerProjectRevision,
        promise,
        expectation
      );
    } catch (err) {
      assert.deepEqual(err, {}, "shouldn't throw an error.");
    }
  });
});
