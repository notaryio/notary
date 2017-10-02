import _ from 'lodash';
import { VError } from 'verror';

import Contract from './contract';
import Definitions from './definition-validator';

export default {
  async allWithinWorkspace(workspace) {
    try {
      const definition = await Definitions.load(workspace);

      const promises = definition.contracts.promises.map(promise => {
        return new Contract({
          type: Contract.Types.PROMISE,
          dir: promise.dir,
          integrationType: promise.integration,
          meta: _.defaultTo(promise.meta, {})
        });
      });
      const expectations = definition.contracts.expectations.map(expectation => {
        return new Contract({
          type: Contract.Types.EXPECTATION,
          dir: expectation.dir,
          integrationType: expectation.integration,
          meta: _.defaultTo(expectation.meta, {}),
          upstream: {
            repo: expectation.upstream.repo,
            dir: _.defaultTo(expectation.upstream.dir, 'contracts')
          }
        });
      });

      return promises.concat(expectations);
    } catch (err) {
      throw new VError(
        err,
        `Failed to fetch contracts for workspace: ${workspace.project.repo}/${workspace.project
          .dir}` +
          `@ ${workspace.rev}` +
          err.message
      );
    }
  }
};
