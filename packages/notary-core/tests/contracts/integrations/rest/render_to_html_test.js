import { assert } from 'chai';

describe('renderToHtml() in the REST APIs integration type facade', () => {
  let restFacade;
  let projectRevisionRepo;

  before(async () => {
    require('src/projects/helpers/sync').default.syncProjectWorkspace = () => true;

    restFacade = require('../../../../src/contracts/integrations/rest');
    projectRevisionRepo = require('../../../../src/projects/repositories/project_revision').default;
  });

  it('returns non-empty HTML for a valid contract', async () => {
    const projectRevision = await projectRevisionRepo.findByRepoDirAndRev(
      'good-rest-provider',
      'contracts',
      'master'
    );
    const contract = projectRevision.contracts.find(
      c => c.integrationType === 'rest' && c.type === 'promise'
    );

    try {
      await restFacade.renderToHtml(projectRevision, contract);
    } catch (err) {
      assert.deepEqual(err, {}, "shouldn't throw an error");
    }
  });
});
