const express = require('express');
const router = express.Router();
const {
  getCreativeProjects,
  createCreativeProject,
  updateCreativeProject,
  deleteCreativeProject,
} = require('../controllers/creativeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getCreativeProjects).post(createCreativeProject);
router.route('/:id').put(updateCreativeProject).delete(deleteCreativeProject);

module.exports = router;

