import fs from 'fs';
import path from 'path';

import Ajv from 'ajv';
import yaml from 'js-yaml';
import _ from 'lodash';
import { VError } from 'verror';

import Integrations from './integrations';

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  v5: true
});

ajv.addSchema(
  yaml.load(fs.readFileSync(path.join(__dirname, 'definition-schema.yml'))),
  'ContractsDefinitionSchema'
);

ajv.addKeyword('integrationTypeMustBeEnabled', {
  type: 'string',
  validate: function(_, integration) {
    return Integrations.exists(integration);
  }
});

function validateSchema(definition) {
  const valid = ajv.validate('ContractsDefinitionSchema', definition);

  if (!valid) {
    throw new VError(
      ajv.errors
        .map(e => {
          return `Invalid contracts.yml file: ${e.message} @ .root${e.dataPath}`;
        })
        .join(`\n`)
    );
  }
}

export default {
  async load(workspace) {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(workspace.getContractsPath(), 'contracts.yml'), function(err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    }).then(defRaw => {
      const def = yaml.load(defRaw);
      validateSchema(def);

      return _.defaultsDeep(def, { contracts: { promises: [], expectations: [] } });
    });
  }
};
