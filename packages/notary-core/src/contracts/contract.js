import _ from 'lodash';

export default class Contract {
  static Types = {
    PROMISE: 'promise',
    EXPECTATION: 'expectation'
  };

  type = null;
  dir = null;
  integrationType = null;
  upstream = null;
  meta = null;

  constructor(props) {
    _.assign(this, props);
    this.validate();
  }

  validate() {
    if (!_.includes(Contract.Types, this.type)) {
      throw new Error(`Invalid contract type: ${this.type}`);
    }
  }
}
