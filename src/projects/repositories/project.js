import fs from 'fs';

import yaml from 'js-yaml';
import { VError } from 'verror';
import _ from 'lodash';

import { Project } from '../models';
import config from '../../config';

const projectsRaw = yaml.load(fs.readFileSync(config.projectsYmlPath));

export default {
  async all() {
    return projectsRaw.projects.map(p => {
      return new Project({
        repo: p.repo,
        dir: _.defaultTo(p.dir, 'contracts'),
        owner: _.defaultTo(p.repoOwner, config.defaultRepoOwner)
      });
    });
  },

  async findByRepoAndDir(repo, dir) {
    const projects = await this.all();
    const project = projects.find(p => p.repo === repo && p.dir === dir);

    if (!project) {
      throw new VError(`Project with repo: ${repo} & dir: ${dir} was not found.`);
    }

    return project;
  }
};
