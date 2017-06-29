import { VError } from 'verror';

import ProjectRepository from '../repositories/project';

export default {
  repoIsConfigured: (repo, dir) => {
    return ProjectRepository.findByRepoAndDir(repo, dir).catch(() => {
      throw new VError(`Invalid repository: "${repo}" & dir: "${dir}".`);
    });
  }
};
