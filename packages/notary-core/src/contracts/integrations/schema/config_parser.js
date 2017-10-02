import _ from 'lodash';

import config from '../../../config';
import Prototype from './prototype';

export default {
  /**
   * Return a specific prototype by name
   */
  prototypeByName(name) {
    return this.prototypes().find(p => p.name === name);
  },

  /**
   * Returns a list of registered prototypes from the notary configuration.
   */
  prototypes() {
    if (!_.has(config, 'modules.schema.prototypes')) {
      return [];
    }

    return config.modules.schema.prototypes.map(rawPrototype => {
      return new Prototype({
        name: rawPrototype.name,
        schema: rawPrototype.schema
      });
    });
  }
};
