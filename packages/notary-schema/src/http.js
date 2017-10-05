import _ from 'lodash';
import express from 'express';
import json2yaml from 'json2yaml';

import config from './config';
import downloadHelper from './download_helper';
import parser from './parser';
import Contract from "./contract";

const server = express();

server.get('/rendered-yaml', async (req, res) => {
  const { project, revision, contract } = req.query;

  const localContentPath = await downloadHelper.downloadContract(project, revision, contract);
  const swaggerDoc = await parser.parse(localContentPath);

  const sanitizedSwaggerDoc = _.pick(swaggerDoc, _.keys(swaggerDoc));

  res.send(json2yaml.stringify(sanitizedSwaggerDoc));
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
