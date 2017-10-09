import _ from 'lodash';

export default class Prototype {
  name = null;
  schema = null;
  compiledSchema = null;

  constructor(props) {
    _.assign(this, props);
  }
}
