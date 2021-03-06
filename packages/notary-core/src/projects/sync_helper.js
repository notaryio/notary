import { exec } from 'child-process-promise';
import { VError } from 'verror';
import _ from 'lodash';

import config from '../config';
import { ProjectWorkspace } from './models';
import ProjectRepository from './project_repository';

let cache = {};

export default {
  /**
   * Synchronize the master branch of all configured projects on startup,
   * we have to do it before exposing any of the API endpoints.
   */
  async syncAllProjectsMasters() {
    config.logger.info('About to download all of the configured projects...');

    const projects = await ProjectRepository.all();

    return Promise.all(
      projects
        .map(project => new ProjectWorkspace({ project, rev: 'master' }))
        .map(workspace => this.syncProjectWorkspace(workspace))
    );
  },

  async syncProjectWorkspace(projectWorkspace, forceSync = false) {
    if (!forceSync && this.wasSynchronizedRecently(projectWorkspace)) {
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
    const expiry = this.looksLikeHash(projectWorkspace.rev) ? 5 : 1 ; //minutes

    return key in cache && cache[key] > Date.now() - expiry * 60 * 1000;
  },

  getCacheKey(projectWorkspace) {
    return `${projectWorkspace.owner}/${projectWorkspace.project.repo}:${projectWorkspace.project
      .dir}@${projectWorkspace.rev}`;
  },

  looksLikeHash(rev) {
    return /[a-fA-F0-9]{32}/.test(rev);
  }
};
