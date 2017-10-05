import util from 'util';

import { VError } from 'verror';
import _ from 'lodash';

import parser from './parser';

const inspect = o => {
  return util.inspect(o, false, null);
};

export default {
  async validate(
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
}
