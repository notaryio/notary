import config from './config';
import downloadHelper from './download_helper';
import schemaValidator from './validator_schema';
import promisesExpectationsValidator from './validator_promises_expectations';
import Contract from './contract';
import server from './http';

config.hive.subscribe('CONTRACT_AVAILABLE_ACTIONS', availableActions) ;

config.hive.subscribe('CONTRACT_VALIDATE_SCHEMA_REST', validateSchema);

config.hive.subscribe('CONTRACT_VALIDATE_PROMISE_EXPECTATION_REST', validatePromisesExpectations);

server.listen(config.restPort, '0.0.0.0', () => config.logger.info(`notary-rest up & running at ${config.restUrl}...`));
process.on('exit', () => server.close());

async function availableActions({ data }) {
  if (data.integrationPlugin === 'rest') {
    const DOWNLOAD_SWAGGER_FILE_ACTION = {
      label: 'Download Swagger file',
      name: 'rest-single-file-swagger',
      href: `${config.restUrl}/single-file-swagger?project=${data.project}&revision=${data.revision}&contract=${data.contract}`
    };

    return {
      promiseActions: [ DOWNLOAD_SWAGGER_FILE_ACTION ],
      expectationActions: [ DOWNLOAD_SWAGGER_FILE_ACTION ]
    };
  }
}

async function validateSchema({ data }) {
  const { projectDisplayName, projectId, revision, contractDefinition } = data;

  try {
    const contractContentPath = await downloadHelper.downloadContract(projectId, revision, contractDefinition.name);
    await schemaValidator.validateContractSchema(new Contract({
      projectDisplayName,
      projectId,
      definitionContentDir: contractDefinition.dir,
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
        definitionContentDir: promise.contractDefinition.dir,
        localContentPath: promiseContractContentPath
      }),
      new Contract({
        projectDisplayName: expectation.projectDisplayName,
        projectId: expectation.projectId,
        definitionContentDir: expectation.contractDefinition.dir,
        localContentPath: expectationContractContentPath
      }),
    );

    return { errors: null };
  } catch(e) {
    return { errors: e.message };
  }
}