import prettySwag from 'pretty-swag';

export default {
  async render(swaggerSpec) {
    const config = {
      format: 'singleFile',
      noRequest: true,
      noNav: true,
      noFooter: true
    };

    return new Promise((resolve, reject) => {
      prettySwag.run(swaggerSpec, null, config, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
};
