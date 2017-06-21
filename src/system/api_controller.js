import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
  res
    .send({
      status: 'alive'
    })
    .end();
});

export { router };
