import _ from 'lodash';

const ITYPES_VIEW_MAPPER = {
  rest: 'REST',
  localstorage: 'localstorage',
  schema: 'Schema'
};

export default class ContractsIndexViewModel {
  constructor(allProjectRevisions) {
    allProjectRevisions = _.clone(allProjectRevisions);
    this.contracts = [];
    this.tribes = [];
    this.pods = [];
    this.projects = [];

    allProjectRevisions.forEach(r => {
      r.contracts.filter(c => c.type === 'promise').forEach(c => {
        this.contracts.push({ projectRevision: r, contract: c });
      });
      if (r.contracts.some(c => c.type === 'promise')) {
        r.info.meta.tribe = { display: r.info.meta.tribe, machine: _.kebabCase(r.info.meta.tribe) };
        r.info.meta.pod = { display: r.info.meta.pod, machine: _.kebabCase(r.info.meta.pod) };
        r.info.name = { display: r.info.name, machine: _.kebabCase(r.info.name) };

        this.tribes.push(r.info.meta.tribe);
        this.pods.push(r.info.meta.pod);
        this.projects.push(r.info.name);

        r.info.meta.descriptionTruncated = _.truncate(_.defaultTo(r.info.meta.description, ''), {
          length: 90
        });
      }
    });

    this.tribes = _.uniqBy(this.tribes, 'machine');
    this.pods = _.uniqBy(this.pods, 'machine');
    this.projects = _.uniqBy(this.projects, 'machine');

    this.contracts.map(c => {
      c.contract.keywords = c.projectRevision.info.name.display;
      c.contract.keywords += ' ' + c.projectRevision.info.meta.pod.display;
      c.contract.keywords += ' ' + c.projectRevision.info.meta.tribe.display;
      if (!_.isEmpty(c.projectRevision.info.meta.description)) {
        c.contract.keywords += ' ' + c.projectRevision.info.meta.description;
      }
      if (!_.isEmpty(c.contract.meta.description)) {
        c.contract.keywords += ' ' + c.contract.meta.description;
      }
      c.contract.displayIntegrationType = ITYPES_VIEW_MAPPER[c.contract.integrationType];
      c.contract.keywords += ' ' + c.contract.integrationType;
      c.contract.keywords += ' ' + c.contract.displayIntegrationType;

      const encodedId = new Buffer(
        `${c.projectRevision.workspace.project.repo}:${c.projectRevision.workspace.project.dir}`
      ).toString('base64');
      c.contract.detailsLink = `/contracts/${encodedId}/master/promise/${c.contract
        .integrationType}`;

      return c;
    });
  }
}
