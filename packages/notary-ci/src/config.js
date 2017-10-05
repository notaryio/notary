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
config.ciUrl = process.env.CI_URL;
config.ciPort = process.env.CI_PORT;

export default config;