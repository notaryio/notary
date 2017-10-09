import _ from 'lodash';
import { VError } from 'verror';

import syncHelper from './sync_helper';
import { ProjectInfo, ProjectRevision, ProjectWorkspace } from './models';
import ProjectRepository from './project_repository';
import ContractRepository from '../contracts/repository';
import Contract from '../contracts/contract';
import Definitions from '../contracts/definition-validator';

export default {
  async all() {
    const allProjects = await ProjectRepository.all();

    return Promise.all(allProjects.map(async p => this.findByProjectAndRev(p, 'master')));
  },

  async findByRepoDirAndRev(repo, dir, rev) {
    const project = await ProjectRepository.findByRepoAndDir(repo, dir);

    return this.findByProjectAndRev(project, rev);
  },

  async findByProjectAndRev(project, rev) {
    rev = _.defaultTo(rev, 'master');

    const workspace = new ProjectWorkspace({ project, rev });
    await syncHelper.syncProjectWorkspace(workspace);
    const contracts = await ContractRepository.allWithinWorkspace(workspace);
    const info = await this.getProjectInfo(workspace);

    return new ProjectRevision({ workspace, contracts, info });
  },

  async consumersOf(producerProjectRevision) {
    const allProjects = await ProjectRepository.all();

    return (await Promise.all(
      allProjects.map(async p => {
        let rev = 'master';
        if (
          p.repo === producerProjectRevision.project().repo &&
          p.dir === producerProjectRevision.project().dir
        ) {
          rev = producerProjectRevision.rev();
        }
        return await this.findByProjectAndRev(p, rev);
      })
    )).filter(projectRevision => {
      const isConsumer =
        projectRevision.contracts !== undefined &&
        projectRevision.contracts
          .filter(c => c.type === Contract.Types.EXPECTATION)
          .some(
            c =>
              c.upstream.repo === producerProjectRevision.project().repo &&
              c.upstream.dir === producerProjectRevision.project().dir
          );

      return isConsumer;
    });
  },

  async getProjectInfo(workspace) {
    try {
      const definition = await Definitions.load(workspace);
      return new ProjectInfo({ name: definition.name, meta: definition.meta });
    } catch (err) {
      throw new VError('Failed to fetch project info: ' + err.message);
    }
  }
};
