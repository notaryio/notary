import config from './config';
import downloadHelper from './download_helper';
import schemaValidator from './validator_schema';
import promisesExpectationsValidator from './validator_promises_expectations';
import Contract from './contract';
import server from './http';

process.on('unhandledRejection', (reason) => {
  config.logger.error(reason);
});

config.hive.subscribe('CONTRACT_AVAILABLE_ACTIONS', availableActions) ;

config.hive.subscribe('CONTRACT_VALIDATE_SCHEMA_SCHEMA', validateSchema);

config.hive.subscribe('CONTRACT_VALIDATE_PROMISE_EXPECTATION_SCHEMA', validatePromisesExpectations);

server.listen(config.schemaPort, '0.0.0.0', () => config.logger.info(`notary-schema up & running at ${config.schemaUrl}...`));
process.on('exit', () => server.close());

async function availableActions({ data }) {
  if (data.integrationPlugin === 'schema') {
    const DOWNLOAD_RENDERED_YAML = {
      label: 'Download Rendered YAML',
      name: 'schema-rendered-yaml',
      href: `${config.schemaUrl}/rendered-yaml?project=${data.project}&revision=${data.revision}&contract=${data.contract}`
    };

    return {
      promiseActions: [ DOWNLOAD_RENDERED_YAML ],
      expectationActions: [ DOWNLOAD_RENDERED_YAML ]
    };
  }
}

async function validateSchema({ data }) {
  const { projectDisplayName, projectId, revision, contractDefinition } = data;

  try {
    const contractContentPath = await downloadHelper.downloadContract(projectId, revision, contractDefinition.name);
    await schemaValidator.validate(new Contract({
      projectDisplayName,
      projectId,
      definition: contractDefinition,
      localContentPath: contractContentPath
    }));

    return { errors: null };
  } catch(e) {
    return { errors: e.message };
  }
}

async function validatePromisesExpectations({ data }) {
  const { promise, expectation } = data;

  try {
    const promiseContractContentPath = await downloadHelper.downloadContract(
      promise.projectId, promise.revision, promise.contractDefinition.name
    );
    const expectationContractContentPath = await downloadHelper.downloadContract(
      expectation.projectId, expectation.revision, expectation.contractDefinition.name
    );

    await promisesExpectationsValidator.validate(
      new Contract({
        projectDisplayName: promise.projectDisplayName,
        projectId: promise.projectId,
        definition: promise.contractDefinition,
        localContentPath: promiseContractContentPath
      }),
      new Contract({
        projectDisplayName: expectation.projectDisplayName,
        projectId: expectation.projectId,
        definition: expectation.contractDefinition,
        localContentPath: expectationContractContentPath
      }),
    );

    return { errors: null };
  } catch(e) {
    return { errors: e.message };
  }
}