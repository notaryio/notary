const types = {
  rest: require('./rest'),
  localstorage: require('./localstorage')
};

export default {
  exists: integration => !!types[integration],
  get: integration => types[integration]
};
