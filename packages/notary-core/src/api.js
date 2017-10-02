import express from 'express';
import config from './config';

import { router as systemRouter } from './system/api_controller';
import { router as projectsRouter } from './projects/controller';

const server = express();

server.use(
  require('express-winston').logger({
    winstonInstance: config.logger,
    meta: true,
    expressFormat: true,
    ignoredRoutes: ['/system/health']
  })
);

server.use('/system', systemRouter);
server.use('/projects', projectsRouter);

server.use(
  require('express-winston').errorLogger({
    winstonInstance: config.logger
  })
);

export default server;
