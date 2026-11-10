const express = require('express');
const router = express.Router();
const {
  getStudyData,
  createSubject,
  deleteSubject,
  logStudySession,
  deleteStudySession,
} = require('../controllers/studyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getStudyData);
router.post('/subjects', createSubject);
router.delete('/subjects/:id', deleteSubject);
router.post('/sessions', logStudySession);
router.delete('/sessions/:id', deleteStudySession);

module.exports = router;

