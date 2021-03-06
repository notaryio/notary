import path from 'path';
import fs from 'fs';

import winston from 'winston';
import yaml from 'js-yaml';

import { MasterNode } from 'notary-hive';

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

if (process.env.CORE_URL) {
  config.coreUrl = process.env.CORE_URL;
}

if (!config.coreUrl) {
  throw new Error('Fatal error, you need to set the CORE_URL environment variable.')
}

config.logger = logger;
config.tmpDir = tmpDir;
config.hive = new MasterNode(process.env.HIVE_MASTER_PORT);
config.logger.info(`[notary-hive] Master node is up at :${process.env.HIVE_MASTER_PORT}`);

export default config;
