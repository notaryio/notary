const types = {
  rest: require('./rest'),
  localstorage: require('./localstorage'),
  schema: require('./schema')
};

export default {
  exists: integration => !!types[integration],
  get: integration => types[integration]
};
