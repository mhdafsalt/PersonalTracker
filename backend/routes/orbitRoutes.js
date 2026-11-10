const express = require('express');
const router = express.Router();
const {
  getOrbitData,
  createContact,
  updateContact,
  deleteContact,
  logCall,
  updateCallLog,
} = require('../controllers/orbitController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getOrbitData);
router.post('/contacts', createContact);
router.route('/contacts/:id').put(updateContact).delete(deleteContact);
router.post('/calls', logCall);
router.route('/calls/:id').put(updateCallLog);

module.exports = router;

