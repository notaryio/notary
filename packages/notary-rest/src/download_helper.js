import fs from 'fs';

import axios from 'axios';
import tmp from 'tmp-promise';
import unzip from 'unzip';

import config from './config';

tmp.setGracefulCleanup();

export default {
  async downloadContract(projectId, revision, contractName) {
    console.log(`${config.coreUrl}/projects/${projectId}/revisions/${revision}/contracts/${contractName}/raw-content`);

    const response = await axios.get(
      `${config.coreUrl}/projects/${projectId}/revisions/${revision}/contracts/${contractName}/raw-content`,
      { responseType: 'arraybuffer', headers: { 'Content-Type': 'application/zip' } }
    );

    return await tmp.dir({ unsafeCleanup: true }) // create a temp directory with random name; this will be cleaned up automatically on process exit
      .then(o => { // save the download ZIP archive
        return new Promise((resolve, reject) => {
          fs.writeFile(`${o.path}/contract-content.zip`, response.data, 'UTF-8', function(err) {
            if (err) reject(err);
            else resolve(o.path);
          });
        });
      })
      .then(dir => { // extract the downloaded file
        return new Promise((resolve, reject) => {
          fs.createReadStream(`${dir}/contract-content.zip`)
            .pipe(unzip.Extract({ path: `${dir}` }))
            .on('close', () => { resolve(dir) })
            .on('error', reject);
        });
      })
      .then(dir => { // cleanup the ZIP archive
        return new Promise((resolve, reject) => {
          fs.unlink(`${dir}/contract-content.zip`, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(dir);
            }
          })
        });
      });
  },

}