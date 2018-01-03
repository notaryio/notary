import path from 'path';
import fs from 'fs';

import SwaggerParser from 'swagger-parser';
import { VError } from 'verror';

const promisifiedFileExists = (file) => {
  return new Promise(resolve => {
    fs.access(file, err => (err ? resolve(false) : resolve(true)));
  });
};

const parser = {
  swaggerFile: async (contract) => {
    let file = 'swagger.yml';
    if (!await promisifiedFileExists(path.resolve(contract.localContentPath, file))) {
      file = 'swagger.yaml';
      if (!await promisifiedFileExists(path.resolve(contract.localContentPath, file))) {
        throw new VError(
          `Could not find any a swagger.yaml or swagger.yml file in ${contract.definitionContentDir}`
        );
      }
    }

    return path.resolve(contract.localContentPath, file);
  },

  parse: async (contract) => {
    return SwaggerParser.dereference(
      await parser.swaggerFile(contract),
      { baseDir: contract.localContentPath }
    );
  },

};

export default parser;
