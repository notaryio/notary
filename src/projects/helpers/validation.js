import { VError } from 'verror';

import ProjectRepository from '../repositories/project';

export default {
  repoIsConfigured: (repo, dir) => {
    return ProjectRepository.findByRepoAndDir(repo, dir).catch(() => {
      throw new VError(
        `Invalid repository: "${repo}" & dir: "${dir}".` +
          ` Make sure you added an entry in github.com/goeuro/c7s/projects.yml`
      );
    });
  }
};
