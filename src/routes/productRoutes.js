const router = require('express').Router();
const c = require('../controllers/productController');
const { authenticate, optionalAuth, requireRole } = require('../middleware/auth');

const admin = [authenticate, requireRole('admin')];

router.get('/', optionalAuth, c.list);
router.get('/:id', optionalAuth, c.getOne);
router.post('/', ...admin, c.create);
router.put('/:id', ...admin, c.update);
router.delete('/:id', ...admin, c.remove);

module.exports = router;