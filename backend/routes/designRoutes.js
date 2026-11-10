const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientDetails,
  createClient,
  updateClient,
  deleteClient,
  getDesignProjects,
  createDesignProject,
  updateDesignProject,
  deleteDesignProject,
} = require('../controllers/designController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/clients').get(getClients).post(createClient);
router.route('/clients/:id').get(getClientDetails).put(updateClient).delete(deleteClient);

router.route('/projects').get(getDesignProjects).post(createDesignProject);
router.route('/projects/:id').put(updateDesignProject).delete(deleteDesignProject);

module.exports = router;

