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

config.schemaUrl = process.env.SCHEMA_URL;
config.schemaPort = process.env.SCHEMA_PORT;

config.hive = new SlaveNode({
  hiveMasterEndpoint: process.env.HIVE_MASTER_ENDPOINT,
  hiveLocalPort: process.env.HIVE_SLAVES_SCHEMA_PORT,
  hiveLocalUrl: process.env.HIVE_SLAVES_SCHEMA_ENDPOINT,
  nodeName: 'notary-schema',
  nodeUrl: process.env.SCHEMA_URL
});
config.logger.info(`[notary-hive] Slave node for notary-schema is up at ${process.env.HIVE_SLAVES_SCHEMA_ENDPOINT}`);

export default config;