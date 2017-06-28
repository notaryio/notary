import { exec } from 'child-process-promise';
import { VError } from 'verror';

import config from '../../config';
import { ProjectWorkspace } from '../models';
import ProjectRepository from '../repositories/project';

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
    let authParam = `--user 'x-oauth-token:${config.githubToken}' `;
    if (config.githubToken === '') {
      authParam = '';
    }

    const cmd = `
      mkdir -p ${projectWorkspace.getContractsPath()} \\
        && curl --fail --silent ${authParam} -L 'https://api.github.com/repos/${projectWorkspace.owner}/${projectWorkspace
      .project.repo}/tarball/${projectWorkspace.rev}' \\
        | tar xz -C ${projectWorkspace.getPath()} --strip-components 1 --wildcards '*/${projectWorkspace
      .project.dir}/' --anchored
    `;

    return exec(cmd).catch(err => {
      throw new VError(`Synchronization error: ${err.message}`);
    });
  }
};
