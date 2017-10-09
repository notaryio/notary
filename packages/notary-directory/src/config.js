import winston from 'winston';

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

config.directoryUrl = process.env.DIRECTORY_URL;
config.directoryPort = process.env.DIRECTORY_PORT;

export default config;