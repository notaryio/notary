import express from 'express';
import { Project } from '../../projects/models';
import ProjectRevisionRepository from '../../projects/repositories/project_revision';
import ContractsIndexViewModel from './view_models/contracts_index';
import ContractsDetialsViewModel from './view_models/contracts_details';

const router = express.Router();

router.get('/', async (req, res) => {
  const allProjectRevisions = await ProjectRevisionRepository.all();

  res.render(__dirname + '/views/contracts_list', new ContractsIndexViewModel(allProjectRevisions));
});

router.get('/:projectRepoAndDir/:rev/:type/:integrationType', async (req, res) => {
  const decoded = new Buffer(req.params.projectRepoAndDir, 'base64').toString('ascii');
  const repo = decoded.split(':')[0];
  const dir = decoded.split(':')[1];
  const rev = req.params.rev;
  const type = req.params.type;
  const integrationType = req.params.integrationType;
  const project = new Project({ repo: repo, dir: dir });

  const projectRevision = await ProjectRevisionRepository.findByProjectAndRev(project, rev);
  const contract = projectRevision.contracts.find(
    c => c.type === type && c.integrationType === integrationType
  );
  res.render(
    __dirname + '/views/contracts_details',
    await ContractsDetialsViewModel.create(projectRevision, contract)
  );
});

router.get('/:projectRepoAndDir/:rev/:type/:integrationType/render', async (req, res) => {
  const decoded = new Buffer(req.params.projectRepoAndDir, 'base64').toString('ascii');
  const repo = decoded.split(':')[0];
  const dir = decoded.split(':')[1];
  const rev = req.params.rev;
  const type = req.params.type;
  const integrationType = req.params.integrationType;
  const project = new Project({ repo: repo, dir: dir });

  const projectRevision = await ProjectRevisionRepository.findByProjectAndRev(project, rev);
  const contract = projectRevision.contracts.find(
    c => c.type === type && c.integrationType === integrationType
  );
  const viewModel = await ContractsDetialsViewModel.create(projectRevision, contract);

  res.send(viewModel.renderedContract);
});

export { router };
