import _ from 'lodash';
import axios from 'axios';
import express from 'express';

import config from './config';
import responseHelper from './response_helper';

const server = express();

server.get('/projects/:repo/validate', async (req, res) => {
  const { repo } = req.params;
  const { rev } = req.query;
  const dir = req.query.dir ? _.trimEnd(req.query.dir, '/') : 'contracts';
  const projectId = new Buffer(`${repo}|${dir}`).toString('base64');

  try {
    const apiResponse = await axios
      .post(`${config.coreUrl}/projects/${projectId}/revisions/${rev}/reports`);

    if (!apiResponse.data.errors) {
      res.send(responseHelper.wrapSuccess(`All contracts are valid.`, req.headers['user-agent']));
    } else {
      throw new Error(apiResponse.data.errors);
    }
  } catch (err) {
    res
      .status(500)
      .send(
        responseHelper.wrapError(
          `${repo}:${dir}/ @ ${rev} ` + `is not valid: \n\n` + err,
          req.headers['user-agent']
        )
      )
      .end();
  }
});

// On-demand sync of the master branch. Should be called whenever master is updated.
server.get('/projects/:repo/sync', async (req, res) => {
  const { repo } = req.params;
  const { rev } = req.query;
  const dir = req.query.dir ? _.trimEnd(req.query.dir, '/') : 'contracts';
  const projectId = new Buffer(`${repo}|${dir}`).toString('base64');

  try {
    const apiResponse = await axios
      .post(`${config.coreUrl}/projects/${projectId}/revisions/${rev}`);

    res.send(responseHelper.wrapSuccess(`${repo}:${dir}/ @ ${rev} synced`, req.headers['user-agent']));
  } catch (err) {
    res
      .status(500)
      .send(
        responseHelper.wrapError(
          `${repo}:${dir}/ @ ${rev} ` + `failed to sync: \n\n` + err,
          req.headers['user-agent']
        )
      )
      .end();
  }
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
