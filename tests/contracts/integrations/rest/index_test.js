import { assert } from 'chai';

describe('validateContractSchema() in the REST APIs integration type facade', () => {
  let restFacade;
  let projectRevisionRepo;

  before(async () => {
    require('src/projects/helpers/sync').default.syncProjectWorkspace = () => true;
    restFacade = require('src/contracts/integrations/rest');
    projectRevisionRepo = require('src/projects/repositories/project_revision').default;
  });

  it('passes if given input is valid', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-rest-provider',
      'contracts',
      'master'
    );
    const contract = projectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'rest'
    );
    try {
      await restFacade.validateContractSchema(projectRevision, contract);
    } catch (err) {
      assert.deepEqual(err, {}, "shouldn't throw an error.");
    }
  });

  it('passes when the swagger file is split into different files & directories with different nesting levels', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-rest-provider',
      'contracts',
      'rev-nested-definitions'
    );
    const contract = projectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'rest'
    );
    try {
      await restFacade.validateContractSchema(projectRevision, contract);
    } catch (err) {
      assert.deepEqual(err, {}, "shouldn't throw an error.");
    }
  });

  it('throws an error if the rest-contracts directory is empty', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'broken-rest-provider',
      'contracts',
      'rev-missing-contracts'
    );
    const contract = projectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'rest'
    );
    try {
      await restFacade.validateContractSchema(projectRevision, contract);
    } catch (err) {
      assert.include(err.message, "Could'nt find any non-empty");
    }
  });

  //todo: split this to more specific test cases
  it('throws an error if the concatenated YML file is not a valid Swagger file', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'broken-rest-provider',
      'contracts',
      'rev-promise-rest-invalid-schema'
    );
    const contract = projectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'rest'
    );
    try {
      await restFacade.validateContractSchema(projectRevision, contract);
    } catch (err) {
      assert.include(err.message, 'not a valid Swagger API definition');
    }
  });
});

describe('validate() in the REST APIs integration type facade', () => {
  let restFacade;
  let projectRevisionRepo;

  before(async () => {
    require('src/projects/helpers/sync').default.syncProjectWorkspace = () => true;
    restFacade = require('src/contracts/integrations/rest');
    projectRevisionRepo = require('src/projects/repositories/project_revision').default;
  });

  it('passes if given consumer expectations are a subset of the producer promises', async () => {
    const producerProjectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-rest-provider',
      'contracts',
      'master'
    );
    const promise = producerProjectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'rest'
    );
    const consumerProjectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-consumer',
      'contracts',
      'master'
    );
    const expectation = consumerProjectRevision.contracts.find(
      c => c.type === 'expectation' && c.integrationType === 'rest'
    );

    try {
      await restFacade.validate(
        producerProjectRevision,
        consumerProjectRevision,
        promise,
        expectation
      );
    } catch (err) {
      assert.deepEqual(err, {}, "shouldn't throw an error.");
    }
  });
  it('throws an error if consumer expected endpoints are not a subset of the producer promised endpoints', async () => {
    const producerProjectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-rest-provider',
      'contracts',
      'master'
    );
    const promise = producerProjectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'rest'
    );
    const consumerProjectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'broken-rest-consumer',
      'contracts',
      'rev-unimplemented-endpoint'
    );
    const expectation = consumerProjectRevision.contracts.find(
      c => c.type === 'expectation' && c.integrationType === 'rest'
    );

    try {
      await restFacade.validate(
        producerProjectRevision,
        consumerProjectRevision,
        promise,
        expectation
      );
    } catch (err) {
      assert.include(err.message, 'Expectation broken');
    }
  });
  it("throws an error if consumer expected basePath doesn't match the producer promised basePath", async () => {
    const producerProjectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-rest-provider',
      'contracts',
      'master'
    );
    const promise = producerProjectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'rest'
    );
    const consumerProjectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'broken-rest-consumer',
      'contracts',
      'rev-expect-basepath-mismatch'
    );
    const expectation = consumerProjectRevision.contracts.find(
      c => c.type === 'expectation' && c.integrationType === 'rest'
    );

    try {
      await restFacade.validate(
        producerProjectRevision,
        consumerProjectRevision,
        promise,
        expectation
      );
    } catch (err) {
      assert.include(err.message, 'Expectation broken');
      assert.include(err.message, 'basePath --> /api');
      assert.include(err.message, 'basePath --> /api/v2');
    }
  });
  it('throws an error if consumer expected supported schemes(HTTP, HTTPS) are not a subset of the producer promised schemes', async () => {
    const producerProjectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-rest-provider',
      'contracts',
      'master'
    );
    const promise = producerProjectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'rest'
    );
    const consumerProjectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'broken-rest-consumer',
      'contracts',
      'rev-expect-scheme-mismatch'
    );
    const expectation = consumerProjectRevision.contracts.find(
      c => c.type === 'expectation' && c.integrationType === 'rest'
    );

    try {
      await restFacade.validate(
        producerProjectRevision,
        consumerProjectRevision,
        promise,
        expectation
      );
    } catch (err) {
      assert.include(err.message, 'Expectation broken');
      assert.include(err.message, "Expected: schemes --> 0 --> 'https'");
      assert.include(err.message, "Promised: schemes --> 0 --> 'http'");
    }
  });
});
