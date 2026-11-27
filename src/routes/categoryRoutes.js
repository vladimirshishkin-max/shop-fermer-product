const router = require('express').Router();
const c = require('../controllers/categoryController');
const { authenticate, requireRole } = require('../middleware/auth');

const admin = [authenticate, requireRole('admin')];

router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', ...admin, c.create);
router.put('/:id', ...admin, c.update);
router.delete('/:id', ...admin, c.remove);

module.exports = router;