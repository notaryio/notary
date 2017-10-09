import winston from 'winston';

import { SlaveNode } from 'notary-hive';

const config = {};

config.logger = new winston.Logger({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      timestamp: true
    })
  ]
});

config.coreUrl = process.env.CORE_URL;

config.restUrl = process.env.REST_URL;
config.restPort = process.env.REST_PORT;

config.hive = new SlaveNode({
  hiveMasterEndpoint: process.env.HIVE_MASTER_ENDPOINT,
  hiveLocalPort: process.env.HIVE_SLAVES_REST_PORT,
  hiveLocalUrl: process.env.HIVE_SLAVES_REST_ENDPOINT,
  nodeName: 'notary-rest',
  nodeUrl: process.env.REST_URL
});
config.logger.info(`[notary-hive] Slave node for notary-rest is up at ${process.env.HIVE_SLAVES_REST_ENDPOINT}`);

export default config;