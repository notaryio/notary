import path from 'path';
import fs from 'fs';

import winston from 'winston';

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

const githubToken = process.env.GITHUB_TOKEN || '';
const projectsYmlPath = process.env.YML_PATH || path.join(__dirname, '..', 'sample-projects.yml');
const defaultRepoOwner = process.env.DEFAULT_REPOSITORY_OWNER || '';

export default {
  logger,
  tmpDir,
  githubToken,
  projectsYmlPath,
  defaultRepoOwner
};
