const express = require('express');
const router = express.Router();
const {
  getTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip,
  addTripExpense,
  togglePackingItem,
} = require('../controllers/travelController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getTrips).post(createTrip);
router.route('/:id').get(getTripById).put(updateTrip).delete(deleteTrip);
router.post('/:id/expenses', addTripExpense);
router.put('/:id/packing/:itemId', togglePackingItem);

module.exports = router;

