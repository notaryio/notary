import path from 'path';
import fs from 'fs';

import winston from 'winston';
import yaml from 'js-yaml';

const logger = new winston.Logger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      timestamp: true
    })
  ]
});

const tmpDir = process.env.TMP_DIR || path.join(__dirname, '..', 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

const configPath = process.env.YML_PATH || path.join(__dirname, '..', 'sample-config.yml');
let config = yaml.load(fs.readFileSync(configPath));
if (process.env.GITHUB_TOKEN) {
  config.githubToken = process.env.GITHUB_TOKEN;
}
if (process.env.DEFAULT_REPOSITORY_OWNER) {
  config.defaultRepositoryOwner = process.env.DEFAULT_REPOSITORY_OWNER;
}

config.logger = logger;
config.tmpDir = tmpDir;

export default config;
