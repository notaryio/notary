import _ from 'lodash';

import config from '../config';

const ITYPES_VIEW_MAPPER = {
  rest: 'REST',
  schema: 'Schema',
  localstorage: 'Localstorage'
};

export default class ContractsIndexViewModel {
  constructor(apiResponse) {
    this.directoryUrl = config.directoryUrl;

    this.contracts = [];
    this.tribes = [];
    this.pods = [];
    this.projects = [];

    apiResponse._embedded.revisions.forEach(r => {
      r._embedded.promises.forEach(c => {
        this.contracts.push({ projectRevision: r, contract: c });
      });
      if (r._embedded.promises && r._embedded.promises.length > 0) {
        r.manifest.annotations.tribe = { display: r.manifest.annotations.tribe, machine: _.kebabCase(r.manifest.annotations.tribe) };
        r.manifest.annotations.pod = { display: r.manifest.annotations.pod, machine: _.kebabCase(r.manifest.annotations.pod) };
        r.manifest.annotations.name = { display: r.manifest.annotations.name, machine: _.kebabCase(r.manifest.annotations.name) };

        this.tribes.push(r.manifest.annotations.tribe);
        this.pods.push(r.manifest.annotations.pod);
        this.projects.push(r.manifest.annotations.name);

        r.manifest.annotations.descriptionTruncated = _.truncate(_.defaultTo(r.manifest.annotations.description, ''), {
          length: 90
        });
      }
    });

    this.tribes = _.uniqBy(this.tribes, 'machine');
    this.pods = _.uniqBy(this.pods, 'machine');
    this.projects = _.uniqBy(this.projects, 'machine');

    this.contracts.map(c => {
      c.contract.keywords = c.projectRevision.manifest.annotations.name.display;
      c.contract.keywords += ' ' + c.projectRevision.manifest.annotations.pod.display;
      c.contract.keywords += ' ' + c.projectRevision.manifest.annotations.tribe.display;
      if (!_.isEmpty(c.projectRevision.manifest.annotations.description)) {
        c.contract.keywords += ' ' + c.projectRevision.manifest.annotations.description;
      }
      if (!_.isEmpty(c.contract.annotations.description)) {
        c.contract.keywords += ' ' + c.contract.annotations.description;
      }
      c.contract.displayIntegrationType = ITYPES_VIEW_MAPPER[c.contract.integrationType];
      c.contract.keywords += ' ' + c.contract.integrationType;
      c.contract.keywords += ' ' + c.contract.displayIntegrationType;

      const encodedId = new Buffer(
        `${c.projectRevision.repositoryName}:${c.projectRevision.contractsDirectory}`
      ).toString('base64');
      c.contract.detailsLink = `${config.directoryUrl}/contracts/${encodedId}/master/promise/${c.contract
        .integrationType}`;

      return c;
    });
  }
}
