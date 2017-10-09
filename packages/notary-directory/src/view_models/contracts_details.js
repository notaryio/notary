import util from 'util';

import _ from 'lodash';
import axios from 'axios';
import prettySwag from 'pretty-swag';
import yaml from 'js-yaml';

import config from '../config';

const inspect = o => {
  return util.inspect(o, false, null);
};

export default class ContractsDetailsViewModel {
  static async create(projectRevision, contract) {
    let instance = {
      directoryUrl: config.directoryUrl
    };

    switch (contract.integrationType) {
      case 'rest':
        instance.renderedContract = await ContractsDetailsViewModel.rest(contract);
        break;
      case 'schema':
        instance.renderedContract = await ContractsDetailsViewModel.schema(contract);
        break;
      default:
        instance.renderedContract = '';
    }

    if (_.includes(instance.renderedContract, '<html>')) {
      const encodedId = new Buffer(
        `${projectRevision.repositoryName}:${projectRevision.contractsDirectory}`
      ).toString('base64');
      instance.renderedContractInIframe = true;
      instance.renderedContractIframeSrc = `${config.directoryUrl}/contracts/${encodedId}/master/promise/${contract.integrationType}/render`;
    }

    return instance;
  }

  static async rest(contract) {
    const response = await axios
      .get(`${contract._links['rest-single-file-swagger'].href}`);
    const swaggerSpec = response.data;

    const config = {
      format: 'singleFile',
      noRequest: true,
      noNav: true,
      noFooter: true
    };

    return new Promise((resolve, reject) => {
      prettySwag.run(swaggerSpec, null, config, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  static async schema(contract) {
    const response = await axios
      .get(`${contract._links['schema-rendered-yaml'].href}`);
    const schemaYaml = response.data;

    let schema = {};
    yaml.loadAll(schemaYaml, function(doc) {
      schema = _.merge(schema, doc);
    });

    let markup = `<table class="notary-modules-schema">`;
    _.toPairs(schema).forEach(e => {
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
}
