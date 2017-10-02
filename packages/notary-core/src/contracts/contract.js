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
  name = null;

  constructor(props) {
    _.assign(this, props);
    this.validate();

    if (!this.name) {
      this.name = this.meta.name ? this.meta.name : `default__${this.type}__${this.integrationType}`;
    }
  }

  validate() {
    if (!_.includes(Contract.Types, this.type)) {
      throw new Error(`Invalid contract type: ${this.type}`);
    }
  }
}
