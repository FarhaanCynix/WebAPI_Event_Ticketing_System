const express = require('express');
const router = express.Router();
const { getAllEvents, getEventById, createEvent } = require('../controllers/eventController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', verifyToken, requireRole('admin', 'organiser'), createEvent);

module.exports = router;