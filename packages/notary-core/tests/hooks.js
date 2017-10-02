import path from 'path';
import mockery from 'mockery';

// Set NODE_PATH to avoid long ../../../..
process.env.NODE_PATH = path.join(__dirname, '..');
require('module').Module._initPaths();

// Global vars
process.env.TMP_DIR = path.join(__dirname, 'fixtures');
process.env.YML_PATH = path.join(__dirname, 'fixtures', 'config.yml');
process.env.DEFAULT_REPOSITORY_OWNER = 'default-test-organization';

// Global hooks (can+will be overridden on individual suites/specs)
before(() => {
  // Clean up all module cache by default
  mockery.enable({ useCleanCache: true, warnOnUnregistered: false, warnOnReplace: false });
});

after(() => {
  mockery.deregisterAll();
  mockery.disable();
});
