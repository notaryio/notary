import path from 'path';

import express from 'express';
import exphbs from 'express-handlebars';

import config from './config';
import { router as contractsRouter } from './contracts_controller';

const server = express();

server.use(express.static(path.join(__dirname, 'public')));
server.engine('.hbs', exphbs({ extname: '.hbs' }));
server.set('view engine', '.hbs');
server.use(
  require('express-winston').logger({
    winstonInstance: config.logger,
    meta: true,
    expressFormat: true
  })
);

server.get('/', function(req, res) {
  res.redirect('/contracts');
});
server.get('/projects', function(req, res) {
  res.redirect('/contracts');
});
server.use('/contracts', contractsRouter);

server.use(
  require('express-winston').errorLogger({
    winstonInstance: config.logger
  })
);

export default server;
