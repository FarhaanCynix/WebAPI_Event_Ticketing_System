const pool = require('../config/db');

exports.getAllVenues = async (req, res, next) => {
  try {
    const [venues] = await pool.query('SELECT * FROM venues ORDER BY name ASC');
    res.status(200).json({ success: true, count: venues.length, data: venues });
  } catch (err) {
    next(err);
  }
};

exports.getVenueById = async (req, res, next) => {
  try {
    const [venues] = await pool.query('SELECT * FROM venues WHERE id = ?', [req.params.id]);
    if (venues.length === 0) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }
    res.status(200).json({ success: true, data: venues[0] });
  } catch (err) {
    next(err);
  }
};

exports.createVenue = async (req, res, next) => {
  try {
    const { name, address, capacity, contact_number } = req.body;
    if (!name || !address || !capacity || !contact_number) {
      return res.status(400).json({ success: false, message: 'All venue fields are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO venues (name, address, capacity, contact_number) VALUES (?, ?, ?, ?)',
      [name, address, capacity, contact_number]
    );

    res.status(201).json({
      success: true,
      message: 'Venue created successfully',
      venueId: result.insertId
    });
  } catch (err) {
    next(err);
  }
};