import _ from 'lodash';
import config from './config';

export default {
  serviceIndex(plugins) {
    let pluginsLinks = {};
    plugins.forEach(p => {
        pluginsLinks[_.camelCase(`${p}Contracts`)] = {
          href: `${config.coreUrl}/integration-plugins/${p}/contracts`
        };
    });

    return {
      _links: {
        self: {
          href: `${config.coreUrl}/`
        },
        projects: {
          href: `${config.coreUrl}/projects`
        },
        masterRevisions: {
          href: `${config.coreUrl}/master-revisions`
        },
        ...pluginsLinks
      }
    };
  },

  toProject(project) {
    const encodedId = this.toEncodedProjectId(project);
    return {
      repositoryName: project.repo,
      repositoryOwner: project.owner,
      contractsDirectory: project.dir,
      _links: {
        self: {
          href: `${config.coreUrl}/projects/${encodedId}`
        },
        revision: {
          href: `${config.coreUrl}/projects/${encodedId}/revisions/{revision}`,
          templated: true
        },
        masterRevision: {
          href: `${config.coreUrl}/projects/${encodedId}/revisions/master`
        }
      }
    };
  },

  async toProjectRevision(project, revision) {
    const encodedId = this.toEncodedProjectId(project);

    return {
      repositoryName: project.repo,
      repositoryOwner: project.owner,
      revision: revision.rev(),
      contractsDirectory: project.dir,
      manifest: {
        annotations: {
          name: revision.info.name,
          ...revision.info.meta
        }
      },
      _embedded: {
        promises: await Promise.all(
          revision.contracts.filter(c => c.type === 'promise').map(async c => await this.toContract(c, project, revision))
        ),
        expectations: await Promise.all(
          revision.contracts.filter(c => c.type === 'expectation').map(async c => await this.toContract(c, project, revision))
        )
      },
      _links: {
        self: {
          href: `${config.coreUrl}/projects/${encodedId}/revision/${revision.rev()}`
        }
      }
    };
  },

  async toContract(contract, project, revision) {
    const encodedProjectId = this.toEncodedProjectId(project);
    const baseUri = `${config.coreUrl}/projects/${encodedProjectId}/revisions/${revision.rev()}`;

    const base = {
      name: contract.name,
      type: contract.type,
      dir: contract.dir,
      integrationType: contract.integrationType,
      annotations: contract.meta,
      _links: {
        project: {
          href: `${config.coreUrl}/projects/${encodedProjectId}`,
          label: 'Get contract\'s project'
        },
        revision: {
          href: `${config.coreUrl}/projects/${encodedProjectId}/revisions/${revision.rev()}`,
          label: 'Get contract\'s revision'
        },
        "raw-content": {
          href: `${baseUri}/contracts/${contract.name}/raw-content`,
          label: 'Download contract\'s content as a ZIP archive'
        },
        ...(await this.extraActions(project, revision, contract))
      }
    };

    if (contract.type === 'expectation') {
      return {
        ...base,
        upstream: contract.upstream
      };
    }

    //It's a promise contract
    return {
      ...base,
      // _links: {
      //   ...base._links,
      //   consumers: {
      //     href: `${baseUri}/contracts/${contract.name}/consumers`
      //   }
      // }
    };
  },

  async extraActions(project, revision, contract) {
    const response = await config.hive.publish('CONTRACT_AVAILABLE_ACTIONS', {
      project: this.toEncodedProjectId(project),
      revision: revision.rev(),
      contract: contract.name,
      integrationPlugin: contract.integrationType,
    }, false, 'notary-core');

    let actions = {};
    response.forEach(r => {
      const typeActions = r[`${contract.type}Actions`];
      if (!typeActions) return;
      typeActions.forEach(a => {
        actions[a.name] = {
          href: a.href,
          label: a.label
        }
      });
    });

    return actions;
  },

  toEncodedProjectId(project) {
    return Buffer.from(`${project.repo}|${project.dir}`).toString('base64');
  }
}