import { exec } from 'child-process-promise';
import { VError } from 'verror';
import _ from 'lodash';

import config from '../../config';
import { ProjectWorkspace } from '../models';
import ProjectRepository from '../repositories/project';

let cache = {};

export default {
  /**
   * Synchronize the master branch of all configured projects on startup,
   * we have to do it before exposing any of the API endpoints.
   */
  async syncAllProjectsOnStartup() {
    config.logger.info('About to download all of the configured projects...');

    const projects = await ProjectRepository.all();

    return Promise.all(
      projects
        .map(project => new ProjectWorkspace({ project, rev: 'master' }))
        .map(workspace => this.syncProjectWorkspace(workspace))
    );
  },

  async syncProjectWorkspace(projectWorkspace) {
    if (this.wasSynchronizedRecently(projectWorkspace)) {
      return Promise.resolve(true);
    }

    let authParam = `--user 'x-oauth-token:${config.githubToken}' `;
    if (!config.githubToken) {
      authParam = '';
    }

    const repoOwner = _.defaultTo(projectWorkspace.project.owner, config.defaultRepositoryOwner);
    const cmd = `
      mkdir -p ${projectWorkspace.getContractsPath()} \\
        && curl --fail --silent ${authParam} -L 'https://api.github.com/repos/${repoOwner}/${projectWorkspace
      .project.repo}/tarball/${projectWorkspace.rev}' \\
        | tar xz -C ${projectWorkspace.getPath()} --strip-components 1 --wildcards '*/${projectWorkspace
      .project.dir}/' --anchored
    `;

    return exec(cmd)
      .then(() => {
        cache[this.getCacheKey(projectWorkspace)] = Date.now();
      })
      .catch(err => {
        throw new VError(`Synchronization error: ${err.message}`);
      });
  },

  wasSynchronizedRecently(projectWorkspace) {
    const key = this.getCacheKey(projectWorkspace);

    return key in cache && cache[key] > Date.now() - 60 * 1000;
  },

  getCacheKey(projectWorkspace) {
    return `${projectWorkspace.owner}/${projectWorkspace.project.repo}:${projectWorkspace.project
      .dir}@${projectWorkspace.rev}`;
  }
};
