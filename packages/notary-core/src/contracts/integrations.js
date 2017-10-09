//TODO: temp, remove after plugins comms is up
const mock = {
  validate: async () => {},
  validateContractSchema: async () => {},
  renderToHtml: async () => {}
};

const types = {
  rest: mock,
  schema: mock,
  localstorage: mock
};

export default {
  exists: integration => !!types[integration],
  get: integration => types[integration]
};
