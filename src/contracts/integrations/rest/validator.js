import util from 'util';

import _ from 'lodash';
import { VError } from 'verror';

export default {
  async isSubset(producerSwagger, consumerSwagger) {
    const inspect = o => {
      return util.inspect(o, false, null);
    };
    const validateBasePath = (producerSwagger, consumerSwagger) => {
      if (producerSwagger.basePath !== consumerSwagger.basePath) {
        throw new VError(
          `Expectation broken: ${inspect(producerSwagger.basePath)} != ${inspect(
            consumerSwagger.basePath
          )}`
        );
      }
    };
    const validateSchemes = (producerSwagger, consumerSwagger) => {
      if (!_.isMatch(producerSwagger.schemes, consumerSwagger.schemes)) {
        throw new VError(
          `Expectation broken: \n\n ${inspect(
            consumerSwagger.schemes
          )} \n\nis not a subset of: \n\n${inspect(producerSwagger.schemes)}\n`
        );
      }
    };
    const validatePaths = (producerSwagger, consumerSwagger) => {
      if (!_.isMatch(producerSwagger.paths, consumerSwagger.paths)) {
        throw new VError(
          `Expectation broken: \n\n ${inspect(
            consumerSwagger.paths
          )} \n\nis not a subset of: \n\n${inspect(producerSwagger.paths)}`
        );
      }
    };
    const validateResponses = () => {};

    //todo: validate info.version
    validateBasePath(producerSwagger, consumerSwagger);
    validateSchemes(producerSwagger, consumerSwagger);
    validatePaths(producerSwagger, consumerSwagger);
    validateResponses(producerSwagger, consumerSwagger);
  }
};
