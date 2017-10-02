import _ from 'lodash';

import integrations from '../../../contracts/integrations';
import projectRevisionRepository from '../../../projects/repositories/project_revision';

export default class ContractsDetailsViewModel {
  static async create(projectRevision, contract) {
    let instance = {};

    const integrationFacade = integrations.get(contract.integrationType);
    instance.renderedContract = await integrationFacade.renderToHtml(projectRevision, contract);
    if (_.includes(instance.renderedContract, '<html>')) {
      const encodedId = new Buffer(
        `${projectRevision.workspace.project.repo}:${projectRevision.workspace.project.dir}`
      ).toString('base64');
      instance.renderedContractInIframe = true;
      instance.renderedContractIframeSrc = `/contracts/${encodedId}/master/promise/${contract.integrationType}/render`;
    }

    const consumerProjects = await projectRevisionRepository.consumersOf(projectRevision);
    instance.consumersCount = 0;
    consumerProjects.forEach(p => {
      if (
        p.contracts.some(
          c =>
            c.type === 'expectation' &&
            c.integrationType === contract.integrationType &&
            c.upstream.repo === projectRevision.project().repo &&
            c.upstream.dir === projectRevision.project().dir
        )
      ) {
        instance.consumersCount++;
      }
    });

    return instance;
  }
}
