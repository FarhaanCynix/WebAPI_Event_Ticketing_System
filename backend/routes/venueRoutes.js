const express = require('express');
const router = express.Router();
const { getAllVenues, getVenueById, createVenue } = require('../controllers/venueController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', getAllVenues);
router.get('/:id', getVenueById);
router.post('/', verifyToken, requireRole('admin', 'organiser'), createVenue);

module.exports = router;