import fs from 'fs';
import path from 'path';

import _ from 'lodash';
import yaml from 'js-yaml';

import Prototype from './prototype';

const configPath = process.env.YML_PATH || path.join(__dirname, '..', 'sample-config.yml');
const config = yaml.load(fs.readFileSync(configPath));

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
