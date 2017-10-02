import config from './config';

export default {
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
        promises: revision.contracts.filter(c => c.type === 'promise').map(c => this.toContract(c, project, revision)),
        expectations: revision.contracts.filter(c => c.type === 'expectation').map(c => this.toContract(c, project, revision))
      },
      _links: {
        self: {
          href: `${config.coreUrl}/projects/${encodedId}/revision/${revision.rev()}`
        }
      }
    };
  },

  toContract(contract, project, revision) {
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
          href: `${config.coreUrl}/projects/${encodedProjectId}`
        },
        revision: {
          href: `${config.coreUrl}/projects/${encodedProjectId}/revisions/${revision.rev()}`
        },
        "raw-content": {
          href: `${baseUri}/contracts/${contract.name}/raw-content`
        }
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

  toEncodedProjectId(project) {
    return Buffer.from(`${project.repo}|${project.dir}`).toString('base64')
  }
}