import util from 'util';
import { diff } from 'deep-diff';

import _ from 'lodash';
import { VError } from 'verror';

const inspect = o => {
  return util.inspect(o, false, null);
};

export default {
  async isSubset(producerSwagger, consumerSwagger) {
    const validateBasePath = (producerSwagger, consumerSwagger) => {
      if (producerSwagger.basePath !== consumerSwagger.basePath) {
        throw new VError(
          `Expectation broken: \n ` +
            `- Expected: basePath --> ${consumerSwagger.basePath}` +
            `- Promised: basePath --> ${producerSwagger.basePath}`
        );
      }
    };
    const validateSchemes = (producerSwagger, consumerSwagger) => {
      const { isSubset, report } = this.subsetReport(
        producerSwagger.schemes,
        consumerSwagger.schemes,
        'schemes'
      );
      if (!isSubset) {
        throw new VError(`Expectation broken: \n ${report}`);
      }
    };
    const validatePaths = (producerSwagger, consumerSwagger) => {
      const { isSubset, report } = this.subsetReport(
        producerSwagger.paths,
        consumerSwagger.paths,
        'paths'
      );
      if (!isSubset) {
        throw new VError(`Expectation broken: \n${report}`);
      }
    };
    const validateResponses = () => {};

    //todo: validate info.version
    validateBasePath(producerSwagger, consumerSwagger);
    validateSchemes(producerSwagger, consumerSwagger);
    validatePaths(producerSwagger, consumerSwagger);
    validateResponses(producerSwagger, consumerSwagger);
  },

  /*
   * Checks if rhs is a subset of lhs or not while generating a report.
   *
   * @return { isSubset: boolean, differences: array, report: string }
   */
  subsetReport(lhs, rhs, reportPrefix = '') {
    if (reportPrefix !== '') {
      reportPrefix = `${reportPrefix} -->`;
    }

    if (lhs === undefined) {
      lhs = [];
    }
    if (rhs === undefined) {
      rhs = [];
    }

    let differences = diff(lhs, rhs);

    if (differences) {
      differences = differences
        // we don't care if the rhs is missing a field from lhs, it only needs to be a sub-set
        .filter(d => {
          const arrayDeletion = d.kind === 'A' && d.item.kind === 'D';

          return d.kind !== 'D' && !arrayDeletion;
        });
    }

    if (differences === undefined || differences.length === 0) {
      return { isSubset: true, differences: [], report: '' };
    }

    let report = '';

    differences.forEach(d => {
      if (d.kind === 'N') {
        report += `  - Expected: ${reportPrefix} ${_.join(d.path, ' --> ')}\n`;
        report += `  - Promised: ${reportPrefix} [none, entry missing]\n`;
      } else if (d.kind === 'E') {
        report += `  - Expected: ${reportPrefix} ${_.join(d.path, ' --> ')} --> ${inspect(
          d.rhs
        )}\n`;
        report += `  - Promised: ${reportPrefix} ${_.join(d.path, ' --> ')} --> ${inspect(
          d.lhs
        )}\n`;
      } else if (d.kind === 'A') {
        if (d.item.kind === 'N') {
          report += `  - Expected: ${reportPrefix} ${_.join(
            d.path,
            ' --> '
          )} --> [Array item with value: ${inspect(d.item.rhs)}] \n`;
          report += `  - Promised: ${reportPrefix} ${_.join(
            d.path,
            ' --> '
          )} --> [Array item missing]\n`;
        }
      }
      report += `\n\n`;
    });
    return { isSubset: false, differences, report };
  }
};
