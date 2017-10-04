import path from 'path';
import fs from 'fs';

import yaml from 'js-yaml';
import glob from 'glob';
import SwaggerParser from 'swagger-parser';
import { VError } from 'verror';
import _ from 'lodash';

export default {
  parse: async (contract) => {
    const files = await new Promise((resolve, reject) => {
      glob(path.join(contract.localContentPath, '**/*.y?(a)ml'), {}, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });

    if (files.length === 0) {
      throw new VError(`Could'nt find any non-empty yaml/yml files in ${contract.definitionContentDir}`);
    }

    const filesContent = await Promise.all(
      files.map(async f => {
        return new Promise((resolve, reject) => {
          fs.readFile(f, (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        });
      })
    );
    const concatenatedContent = filesContent.join(`\n`);

    //todo: change to reduce
    let mergedYaml = '';
    yaml.loadAll(concatenatedContent, function(doc) {
      mergedYaml = _.merge(mergedYaml, doc);
    });

    if (mergedYaml === '') {
      throw new VError(`Could'nt find any non-empty yaml/yml files in ${contract.definitionContentDir}`);
    }

    return SwaggerParser.dereference(mergedYaml, { baseDir: contract.localContentPath });
  },

  //TODO: refactor
  bundle: async (contract) => {
    const files = await new Promise((resolve, reject) => {
      glob(path.join(contract.localContentPath, '**/*.y?(a)ml'), {}, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });

    if (files.length === 0) {
      throw new VError(`Could'nt find any non-empty yaml/yml files in ${contract.definitionContentDir}`);
    }

    const filesContent = await Promise.all(
      files.map(async f => {
        return new Promise((resolve, reject) => {
          fs.readFile(f, (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        });
      })
    );
    const concatenatedContent = filesContent.join(`\n`);

    console.log(concatenatedContent);
    //todo: change to reduce
    let mergedYaml = '';
    yaml.loadAll(concatenatedContent, function(doc) {
      mergedYaml = _.merge(mergedYaml, doc);
    });

    if (mergedYaml === '') {
      throw new VError(`Could'nt find any non-empty yaml/yml files in ${contract.definitionContentDir}`);
    }

    return SwaggerParser.bundle(mergedYaml, { baseDir: contract.localContentPath });
  }
};
