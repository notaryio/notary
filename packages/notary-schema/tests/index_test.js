import { assert } from 'chai';

describe('validateContractSchema() in the Schema integration type facade', () => {
  let schemaFacade;
  let projectRevisionRepo;

  before(async () => {
    require('src/projects/helpers/sync').default.syncProjectWorkspace = () => true;
    schemaFacade = require('src/contracts/integrations/schema');
    projectRevisionRepo = require('src/projects/repositories/project_revision').default;
  });

  it('passes if given input is valid', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-schema-provider',
      'contracts',
      'master'
    );
    const contract = projectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'schema' && c.meta.name === 'add-to-basket'
    );
    try {
      await schemaFacade.validateContractSchema(projectRevision, contract);
    } catch (err) {
      assert.deepEqual(err, {}, "shouldn't throw an error.");
    }
  });

  it('throws an error if the schema-contracts directory is empty', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'broken-schema-provider',
      'contracts',
      'rev-empty-contract-dir'
    );
    const contract = projectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'schema'
    );

    try {
      await schemaFacade.validateContractSchema(projectRevision, contract);
    } catch (err) {
      assert.include(err.message, "Could'nt find any non-empty");
    }
  });

  it("throws an error if the contract definition doesn't have the meta.prototypeName field", async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'broken-schema-provider',
      'contracts',
      'rev-missing-prototype'
    );
    const contract = projectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'schema'
    );

    try {
      await schemaFacade.validateContractSchema(projectRevision, contract);
    } catch (err) {
      assert.include(err.message, 'needs a meta.prototypeName field defined');
    }
  });

  it('throws an error if the contract definition meta.prototypeName is incorrect', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'broken-schema-provider',
      'contracts',
      'rev-incorrect-prototype'
    );
    const contract = projectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'schema'
    );

    try {
      await schemaFacade.validateContractSchema(projectRevision, contract);
    } catch (err) {
      assert.include(err.message, 'Invalid prototype non-existing-prototype');
    }
  });

  it("throws an error if the contract doesn't follow the prototype schema definition", async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'broken-schema-provider',
      'contracts',
      'rev-mismatching-schema-contract'
    );
    const contract = projectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'schema'
    );

    try {
      await schemaFacade.validateContractSchema(projectRevision, contract);
    } catch (err) {
      assert.include(err.message, "data should have required property 'name'");
    }
  });
});

describe('validate() in the schema integration type facade', () => {
  let schemaFacade;
  let projectRevisionRepo;

  before(async () => {
    require('src/projects/helpers/sync').default.syncProjectWorkspace = () => true;
    schemaFacade = require('src/contracts/integrations/schema');
    projectRevisionRepo = require('src/projects/repositories/project_revision').default;
  });

  it('passes if given consumer expectations are a subset of the producer promises', async () => {
    const producerProjectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-schema-provider',
      'contracts',
      'master'
    );
    const promise = producerProjectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'schema' && c.meta.name === 'add-to-basket'
    );
    const consumerProjectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-schema-consumer',
      'contracts',
      'master'
    );
    const expectation = consumerProjectRevision.contracts.find(
      c =>
        c.type === 'expectation' &&
        c.integrationType === 'schema' &&
        c.meta.name === 'add-to-basket'
    );

    try {
      await schemaFacade.validate(
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

describe('renderToHtml() in the schema integration type facade', () => {
  let schemaFacade;
  let projectRevisionRepo;

  before(async () => {
    require('src/projects/helpers/sync').default.syncProjectWorkspace = () => true;
    schemaFacade = require('src/contracts/integrations/schema');
    projectRevisionRepo = require('src/projects/repositories/project_revision').default;
  });

  it('returns HTML representation of a defined contract', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-schema-provider',
      'contracts',
      'master'
    );

    const contract = projectRevision.contracts.find(
      c => c.type === 'promise' && c.integrationType === 'schema' && c.meta.name === 'add-to-basket'
    );

    try {
      const html = await schemaFacade.renderToHtml(projectRevision, contract);
      assert.include(html, 'add-to-basket');
    } catch (err) {
      assert.deepEqual(err, {}, "shouldn't throw an error.");
    }
  });
});
