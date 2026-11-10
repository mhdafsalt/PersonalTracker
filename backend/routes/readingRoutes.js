const express = require('express');
const router = express.Router();
const {
  getReadingData,
  createBook,
  updateBook,
  deleteBook,
  logReadingSession,
} = require('../controllers/readingController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getReadingData);
router.post('/books', createBook);
router.route('/books/:id').put(updateBook).delete(deleteBook);
router.post('/sessions', logReadingSession);

module.exports = router;

