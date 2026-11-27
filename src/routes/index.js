const router = require('express').Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/categories', require('./categoryRoutes'));

router.use('/products', require('./productRoutes'));

router.use('/auth', require('./authRoutes'));

module.exports = router;

