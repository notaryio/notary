import fs from 'fs';
import path from 'path';

import Ajv from 'ajv';
import yaml from 'js-yaml';
import _ from 'lodash';
import { VError } from 'verror';
import { inspect } from 'util';

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  v5: true
});

ajv.addSchema(
  yaml.load(fs.readFileSync(path.join(__dirname, 'schema.yml'))),
  'LocalStorageContractDefinitionSchema'
);

async function loadContract(projectRevision, contract) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(projectRevision.workspace.getContractsPath(), contract.dir, 'localstorage.yml'),
      function(err, data) {
        if (err) reject(err);
        else resolve(data);
      }
    );
  }).then(localstorageRawContract => {
    return yaml.load(localstorageRawContract);
  });
}

/**
 * Renders a contract to an HTML string.
 *
 * @returns {Promise.<string>} HTML rendered contract
 */
async function renderToHtml() {
  return 'Localstorage contracts rendering is not implemented yet...';
}

/**
 * Validates only the contract schema.
 *
 * @param {ProjectRevision} projectRevision
 * @param {Contract} contract
 * @returns {Promise.<void>}
 */
async function validateContractSchema(projectRevision, contract) {
  try {
    await new Promise((resolve, reject) => {
      const fullPath = path.join(
        projectRevision.workspace.getContractsPath(),
        contract.dir,
        'localstorage.yml'
      );
      fs.access(fullPath, fs.constants.R_OK | fs.constants.R_OK, err => {
        if (err) {
          reject(
            new VError(
              `'${projectRevision.project().dir}/${contract.dir}/localstorage.yml' doesn't exist`
            )
          );
        } else {
          resolve();
        }
      });
    });
  } catch (err) {
    throw err;
  }

  return loadContract(projectRevision, contract).then(localstorageContract => {
    const valid = ajv.validate('LocalStorageContractDefinitionSchema', localstorageContract);

    if (!valid) {
      throw new VError(
        ajv.errors
          .map(e => {
            return (
              `Invalid ${projectRevision.project().dir}/${contract.dir}/localstorage.yml ` +
              `file: ${e.message} @ .root${e.dataPath}`
            );
          })
          .join(`\n`)
      );
    }
  });
}

/**
 * Cross-checks producer promises with consumer expectations.
 *
 * @param {ProjectRevision} producerProjectRevision
 * @param {ProjectRevision} consumerProjectRevision
 * @param {Contract} promiseContract
 * @param {Contract} expectationContract
 * @returns {Promise.<void>}
 */
async function validate(
  producerProjectRevision,
  consumerProjectRevision,
  promiseContract,
  expectationContract
) {
  const promiseContractContent = await loadContract(producerProjectRevision, promiseContract);
  const expectationContractContent = await loadContract(
    consumerProjectRevision,
    expectationContract
  );

  if (!_.isMatch(promiseContractContent, expectationContractContent)) {
    throw new VError(
      `Expectation broken: \n\n ${inspect(promiseContractContent)} \n\nis not a subset of: \n\n${inspect(expectationContractContent)}\n`
    );
  }
}

module.exports = {
  validate,
  validateContractSchema,
  renderToHtml
};
