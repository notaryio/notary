import express from 'express';

import config from './config';
import downloadHelper from './download_helper';
import parser from './parser';
import Contract from './contract';

const server = express();

server.get('/single-file-swagger', async (req, res) => {
  const { project, revision, contract } = req.query;

  const localContentPath = await downloadHelper.downloadContract(project, revision, contract);
  const swaggerDoc = await parser.bundle(new Contract({
    projectId: project,
    projectDisplayName: project,
    localContentPath
  }));

  const { swagger, info, paths, produces, definitions } = swaggerDoc;

  res.send({ swagger, info, paths, produces, definitions });
});

server.use(
  require('express-winston').logger({
    winstonInstance: config.logger,
    meta: true,
    expressFormat: true
  })
);

server.use(
  require('express-winston').errorLogger({
    winstonInstance: config.logger
  })
);

export default server;
