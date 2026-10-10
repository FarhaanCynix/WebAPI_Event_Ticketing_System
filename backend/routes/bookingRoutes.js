const express = require('express');
const router = express.Router();
const { createBooking, getBookings, cancelBooking } = require('../controllers/bookingController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createBooking);
router.get('/', verifyToken, getBookings);
router.put('/:id/cancel', verifyToken, cancelBooking);

module.exports = router;