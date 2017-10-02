import util from 'util';

import Ajv from 'ajv';
import { VError } from 'verror';
import _ from 'lodash';

import parser from './parser';
import configParser from './config_parser';

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  v5: true
});

const inspect = o => {
  return util.inspect(o, false, null);
};

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
  if (promiseContract.meta.prototypeName !== expectationContract.meta.prototypeName) {
    throw new VError(
      `Promised prototypeName: ${promiseContract.meta.prototypeName} doesn't` +
        ` match expected prototypeName: ${expectationContract.meta.prototypeName}`
    );
  }

  const promiseContractContent = await parser.parse(
    producerProjectRevision.workspace.resolveContractsPath(promiseContract.dir)
  );
  const expectationContractContent = await parser.parse(
    consumerProjectRevision.workspace.resolveContractsPath(expectationContract.dir)
  );

  if (!_.isMatch(promiseContractContent, expectationContractContent)) {
    throw new VError(
      `Expectation broken: \n\n ${inspect(expectationContractContent)} \n\n` +
        `is not a subset of: \n\n${inspect(promiseContractContent)}\n`
    );
  }
}

/**
 * Validates only the contract schema.
 *
 * @param {ProjectRevision} projectRevision
 * @param {Contract} contract
 * @returns {Promise.<void>}
 */
async function validateContractSchema(projectRevision, contract) {
  const contractContent = await parser.parse(
    projectRevision.workspace.resolveContractsPath(contract.dir)
  );

  if (!contract.meta.prototypeName) {
    throw new VError(
      'Contract definitions of type "schema" needs a meta.prototypeName field defined.'
    );
  }

  const proto = configParser.prototypeByName(contract.meta.prototypeName);
  if (!configParser.prototypeByName(contract.meta.prototypeName)) {
    throw new VError(
      `Invalid prototype ${contract.meta
        .prototypeName}, contact your administrator to get the correct prototype name.`
    );
  }

  const matchesPrototype = ajv.validate(proto.schema, contractContent);
  if (!matchesPrototype) {
    throw new VError(`Contract doesn't match the prototype: ${ajv.errorsText()}`);
  }
}

/**
 * Renders a contract to an HTML string.
 *
 * @param {ProjectRevision} projectRevision
 * @param {Contract} contract
 *
 * @returns {Promise.<string>} HTML rendered contract
 */
async function renderToHtml(projectRevision, contract) {
  const contractContent = await parser.parse(
    projectRevision.workspace.resolveContractsPath(contract.dir)
  );
  let markup = `<table class="notary-modules-schema">`;
  _.toPairs(contractContent).forEach(e => {
    markup += `<tr>`;
    markup += `<td>${e[0]}</td>`;
    if (typeof e[1] === 'object') {
      markup += `<td>${inspect(e[1]).replace(`\n`, `<br>`)}</td>`;
    } else {
      markup += `<td>${e[1]}</td>`;
    }
    markup += `</tr>`;
  });

  markup += `</table>`;
  markup += `
    <style>
    .notary-modules-schema {
      width: 100%
    }
    .notary-modules-schema th, td{
      padding: 15px;
      text-align: left;
    }
    </style>
  `;
  return markup;
}

module.exports = {
  validate,
  validateContractSchema,
  renderToHtml
};
