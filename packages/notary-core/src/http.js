import express from 'express';
import bodyParser from 'body-parser';
import zip from 'express-zip';
import recursive from 'recursive-readdir';
import _ from 'lodash';

import config from './config';
import projectRepository from './projects/project_repository';
import revisionRepository from './projects/project_revision_repository';
import hal from './hal';
import syncHelper from './projects/sync_helper';
import { Project, ProjectWorkspace } from './projects/models';
import contractsValidator from './contracts/validation';

const server = express();

server.get('/projects', async (req, res) => {
  const projects = await projectRepository.all();

  res.send({
    count: projects.length,
    _embedded: {
      projects: projects.map(p => hal.toProject(p))
    },
    _links: {
      self: {
        href: `${config.coreUrl}//projects`
      }
    }
  });
});

server.get('/projects/:id', async (req, res) => {
  const [repo, directory] = Buffer.from(req.params['id'], 'base64').toString().split('|');
  const project = await projectRepository.findByRepoAndDir(repo, directory);

  res.send(hal.toProject(project));
});

server.get('/projects/:id/revisions/:revision', async (req, res) => {
  const [repo, directory] = Buffer.from(req.params['id'], 'base64').toString().split('|');
  const project = await projectRepository.findByRepoAndDir(repo, directory);
  const revision = await revisionRepository.findByProjectAndRev(project, req.params['revision']);

  res.send(await hal.toProjectRevision(project, revision));
});

server.post('/projects/:id/revisions/:revision', async (req, res) => {
  const [repo, dir] = Buffer.from(req.params['id'], 'base64').toString().split('|');
  await syncHelper.syncProjectWorkspace(
    new ProjectWorkspace({project: new Project({repo, dir}), rev: req.params['revision']}),
    false
  );

  res.redirect(`/projects/${req.params['id']}/revisions/${req.params['revision']}`);
});

server.post('/projects/:id/revisions/:revision/reports', async (req, res) => {
  const [repo, directory] = Buffer.from(req.params['id'], 'base64').toString().split('|');
  const project = await projectRepository.findByRepoAndDir(repo, directory);
  const revision = await revisionRepository.findByProjectAndRev(project, req.params['revision']);

  try {
    await contractsValidator.isValid(revision);
    res.send({errors: null})
  } catch (e) {
    res.send({errors: e.message});
  }
});

server.get('/projects/:id/revisions/:revision/contracts/:name/raw-content', async (req, res) => {
  const [repo, directory] = Buffer.from(req.params['id'], 'base64').toString().split('|');
  const project = await projectRepository.findByRepoAndDir(repo, directory);
  const revision = await revisionRepository.findByProjectAndRev(project, req.params['revision']);
  const contract = revision.contracts.find(c => c.name === req.params['name']);

  recursive(`${revision.workspace.resolveContractsPath(contract.dir)}`, (err, files) => {
    if (err) {
      res.status(500).send(err);
    }

    files = files.map(f => {
      return {path: f, name: f.split(contract.dir)[1].substr(1)};
    });
    res.zip(files, `${project.repo}_${revision.rev()}_${contract.name}.zip`);
  });
});

server.get('/master-revisions', async (req, res) => {
  const projects = await projectRepository.all();
  const projectsWithMasterRevision = await Promise.all(projects.map(async (project) => {
    return {project, masterRevision: await revisionRepository.findByProjectAndRev(project, 'master')};
  }));
  const halRevisions = await Promise.all(
    projectsWithMasterRevision.map(async (p) => await hal.toProjectRevision(p.project, p.masterRevision))
  );

  res.send({
    count: halRevisions.length,
    _embedded: {
      revisions: halRevisions
    },
    _links: {
      self: {
        href: `${config.coreUrl}/master-revisions`
      }
    }
  });
});

server.get('/integration-plugins/:name/contracts', async (req, res) => {
  const projects = await projectRepository.all();
  const projectsWithMasterRevision = await Promise.all(projects.map(async (project) => {
    return {project, masterRevision: await revisionRepository.findByProjectAndRev(project, 'master')};
  }));
  let halContracts = [];
  projectsWithMasterRevision.forEach(pair => {
    pair.masterRevision.contracts.filter(c => c.integrationType === req.params['name']).forEach(c => {
      halContracts.push(hal.toContract(c, pair.project, pair.masterRevision));
    });
  });

  res.send({
    count: halContracts.length,
    _embedded: {
      contracts: halContracts
    },
    _links: {
      self: {
        href: `${config.coreUrl}/integration-plugins/${req.params['name']}/contracts`
      }
    }
  });
});

server.use(bodyParser.json());
server.use(
  require('express-winston').logger({
    winstonInstance: config.logger,
    meta: true,
    expressFormat: true
  })
);

server.use(
  require('express-winston').errorLogger({
    winstonInstance: config.logger
  })
);

export default server;
