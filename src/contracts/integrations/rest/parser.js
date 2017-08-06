import path from 'path';
import fs from 'fs';

import yaml from 'js-yaml';
import glob from 'glob';
import SwaggerParser from 'swagger-parser';
import { VError } from 'verror';
import _ from 'lodash';

export default {
  parse: async baseDir => {
    const files = await new Promise((resolve, reject) => {
      glob(path.join(baseDir, '**/*.y?(a)ml'), {}, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });

    if (files.length === 0) {
      throw new VError(`Could'nt find any non-empty yaml/yml files in ${baseDir}`);
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
      throw new VError(`Could'nt find any non-empty yaml/yml files in ${baseDir}`);
    }

    return SwaggerParser.dereference(mergedYaml, { baseDir: baseDir });
  }
};
