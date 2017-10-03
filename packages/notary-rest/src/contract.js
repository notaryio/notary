import _ from 'lodash';

export default class Contract {
  projectDisplayName = null;
  projectId = null;
  definitionContentDir = null;
  localContentPath = null;

  constructor(props) {
    _.assign(this, props);
  }
}