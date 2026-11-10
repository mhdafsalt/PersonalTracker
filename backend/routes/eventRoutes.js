const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  addParticipant,
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getEvents).post(createEvent);
router.route('/:id').get(getEventById).put(updateEvent).delete(deleteEvent);
router.post('/:id/participants', addParticipant);

module.exports = router;

