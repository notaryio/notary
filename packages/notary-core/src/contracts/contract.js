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
      if (this.meta.name) {
        this.name = this.meta.name
      } else {
        if (this.type === 'expectation') {
          this.name = `expectation_upstream_${Buffer.from(`${this.upstream.repo}|${this.upstream.dir}`).toString('base64')}__${this.integrationType}`;
        } else {
          this.name = `promise__default__${this.integrationType}`;
        }
      }
    }
  }

  validate() {
    if (!_.includes(Contract.Types, this.type)) {
      throw new Error(`Invalid contract type: ${this.type}`);
    }
  }
}
