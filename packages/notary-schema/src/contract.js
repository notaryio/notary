import _ from 'lodash';

export default class Contract {
  projectDisplayName = null;
  projectId = null;
  definition = null;
  localContentPath = null;

  constructor(props) {
    _.assign(this, props);
  }
}