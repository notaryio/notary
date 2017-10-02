import express from 'express';

import ContractsValidation from '../contracts/validation';
import projectsValidationService from './helpers/validation';
import ProjectRevisionRepository from './repositories/project_revision';
import syncHelper from './helpers/sync';
import responseHelper from './helpers/response';
import { Project, ProjectWorkspace } from './models';
import _ from 'lodash';

const router = express.Router();

router.get('/:repo/validate', async (req, res, next) => {
  const repo = req.params.repo;
  const dir = req.query.dir ? _.trimEnd(req.query.dir, '/') : 'contracts';
  const rev = req.query.rev;

  try {
    const projectRevision = await ProjectRevisionRepository.findByRepoDirAndRev(repo, dir, rev);

    await ContractsValidation.isValid(projectRevision);

    res.send(responseHelper.wrapSuccess(`All contracts are valid.`, req.headers['user-agent']));
  } catch (err) {
    res
      .status(500)
      .send(
        responseHelper.wrapError(
          `${repo}:${dir}/ @ ${rev} ` + `is not valid: \n\n` + err.message,
          req.headers['user-agent']
        )
      )
      .end();
    next(err);
  }
});

// On-demand sync of the master branch. Should be called whenever master is updated.
router.get('/:repo/sync', async (req, res, next) => {
  const repo = req.params.repo;
  const dir = req.query.dir ? _.trimEnd(req.query.dir, '/') : 'contracts';

  try {
    const projectWorkspace = new ProjectWorkspace({
      project: new Project({ repo, dir }),
      rev: 'master'
    });
    await projectsValidationService.repoIsConfigured(repo, dir);
    await syncHelper.syncProjectWorkspace(projectWorkspace);

    res.send('repo updated');
  } catch (err) {
    res.status(500).send(err).end();
    next(err);
  }
});

export { router };
