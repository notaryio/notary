import express from 'express';
import axios from 'axios';

import config from './config';
import ContractsIndexViewModel from './view_models/contracts_index';
import ContractsDetailsViewModel from './view_models/contracts_details';

const router = express.Router();

router.get('/', async (req, res) => {
  const apiResponse = await axios
    .get(`${config.coreUrl}/master-revisions`);

  res.render(__dirname + '/views/contracts_list', new ContractsIndexViewModel(apiResponse.data));
});

router.get('/:projectRepoAndDir/:rev/:type/:integrationType', async (req, res) => {
  const { projectRepoAndDir, rev, type, integrationType } = req.params;
  const [ project, dir ] = new Buffer(projectRepoAndDir, 'base64').toString('ascii').split(':');
  console.log(project, dir);
  const projectId = Buffer.from(`${project}|${dir}`).toString('base64');

  const apiResponse = await axios
    .get(`${config.coreUrl}/projects/${projectId}/revisions/${rev}`);
  const contract = apiResponse.data._embedded[`${type}s`].find(
    c => c.integrationType === integrationType
  );
  res.render(
    __dirname + '/views/contracts_details',
    await ContractsDetailsViewModel.create(apiResponse.data, contract)
  );
});

router.get('/:projectRepoAndDir/:rev/:type/:integrationType/render', async (req, res) => {
  const { projectRepoAndDir, rev, type, integrationType } = req.params;
  const [ project, dir ] = new Buffer(projectRepoAndDir, 'base64').toString('ascii').split(':');
  const projectId = Buffer.from(`${project}|${dir}`).toString('base64');

  const apiResponse = await axios
    .get(`${config.coreUrl}/projects/${projectId}/revisions/${rev}`);
  const contract = apiResponse.data._embedded[`${type}s`].find(
    c => c.integrationType === integrationType
  );
  const viewModel = await ContractsDetailsViewModel.create(apiResponse.data, contract);

  res.send(viewModel.renderedContract);
});

export { router };
