import Parser from './parser';
import Validator from './validator';
import Renderer from './renderer';

/**
 * Renders a contract to an HTML string.
 *
 * @param {ProjectRevision} projectRevision
 * @param {Contract} contract
 *
 * @returns {Promise.<string>} HTML rendered contract
 */
async function renderToHtml(projectRevision, contract) {
  const swaggerSpec = await Parser.parse(
    projectRevision.workspace.resolveContractsPath(contract.dir)
  );

  return await Renderer.render(swaggerSpec);
}

/**
 * Validates only the contract schema.
 *
 * @param {ProjectRevision} projectRevision
 * @param {Contract} contract
 * @returns {Promise.<void>}
 */
async function validateContractSchema(projectRevision, contract) {
  await Parser.parse(projectRevision.workspace.resolveContractsPath(contract.dir));
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
  const producerSwagger = await Parser.parse(
    producerProjectRevision.workspace.resolveContractsPath(promiseContract.dir)
  ).catch(err =>
    Promise.reject(
      `Error! producer contract at ${producerProjectRevision.project().repo}:` +
        `${producerProjectRevision.project().dir}/${promiseContract.dir}` +
        err.message
    )
  );

  const consumerSwagger = await Parser.parse(
    consumerProjectRevision.workspace.resolveContractsPath(expectationContract.dir)
  ).catch(err =>
    Promise.reject(
      `Error! consumer contract at ${consumerProjectRevision.project().repo}:` +
        `${consumerProjectRevision.project().dir}/${expectationContract.dir}` +
        err.message
    )
  );

  return await Validator.isSubset(producerSwagger, consumerSwagger);
}

module.exports = {
  validate,
  validateContractSchema,
  renderToHtml
};
