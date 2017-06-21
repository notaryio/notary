import _ from 'lodash';
import config from '../config';

//todo: rename to ProjectId
export class Project {
  repo = null;
  dir = null;

  constructor(props) {
    _.assign(this, props);
  }
}

export class ProjectInfo {
  name = null;
  meta = null;

  constructor(props) {
    _.assign(this, props);
  }
}

export class ProjectWorkspace {
  project = null;
  rev = null;

  constructor(props) {
    _.assign(this, props);
  }

  getPath() {
    return `${config.tmpDir}/projects/${this.project.repo}/${this.rev}`;
  }

  getContractsPath() {
    return `${this.getPath()}/${this.project.dir}`;
  }

  resolveContractsPath(path) {
    return `${this.getContractsPath()}/${path}`;
  }
}

export class ProjectRevision {
  workspace = null;
  contracts = null;
  info = null;

  constructor(props) {
    _.assign(this, props);
  }

  project() {
    return this.workspace.project;
  }

  rev() {
    return this.workspace.rev;
  }
}
