const pool = require('../config/db');

// GET /events with search & pagination
exports.getAllEvents = async (req, res, next) => {
  try {
    let { page = 1, limit = 5, search = '', sort = 'event_date', order = 'ASC' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const allowedSort = ['event_date', 'ticket_price', 'title'];
    const sortCol = allowedSort.includes(sort) ? sort : 'event_date';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let countQuery = 'SELECT COUNT(*) as total FROM events WHERE 1=1';
    let dataQuery = `
      SELECT e.*, v.name AS venue_name, u.name AS organiser_name 
      FROM events e
      JOIN venues v ON e.venue_id = v.id
      JOIN users u ON e.organiser_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      countQuery += ' AND (title LIKE ? OR description LIKE ?)';
      dataQuery += ' AND (e.title LIKE ? OR e.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    dataQuery += ` ORDER BY e.${sortCol} ${sortOrder} LIMIT ? OFFSET ?`;
    const [events] = await pool.query(dataQuery, [...params, limit, offset]);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalRecords: total,
      totalPages: Math.ceil(total / limit),
      data: events
    });
  } catch (err) {
    next(err);
  }
};

// GET event by ID
exports.getEventById = async (req, res, next) => {
  try {
    const query = `
      SELECT e.*, v.name AS venue_name, v.address AS venue_address, u.name AS organiser_name 
      FROM events e
      JOIN venues v ON e.venue_id = v.id
      JOIN users u ON e.organiser_id = u.id
      WHERE e.id = ?
    `;
    const [events] = await pool.query(query, [req.params.id]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, data: events[0] });
  } catch (err) {
    next(err);
  }
};

// POST create event
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, event_date, venue_id, ticket_price, total_tickets } = req.body;
    if (!title || !event_date || !venue_id || !total_tickets) {
      return res.status(400).json({ success: false, message: 'Missing required event fields' });
    }

    const [venues] = await pool.query('SELECT capacity FROM venues WHERE id = ?', [venue_id]);
    if (venues.length === 0) {
      return res.status(404).json({ success: false, message: 'Venue does not exist' });
    }
    if (total_tickets > venues[0].capacity) {
      return res.status(400).json({
        success: false,
        message: `Total tickets cannot exceed venue capacity (${venues[0].capacity})`
      });
    }

    const organiser_id = req.user.id;
    const [result] = await pool.query(
      `INSERT INTO events (title, description, event_date, venue_id, organiser_id, ticket_price, total_tickets, available_tickets)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, event_date, venue_id, organiser_id, ticket_price || 0.00, total_tickets, total_tickets]
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      eventId: result.insertId
    });
  } catch (err) {
    next(err);
  }
};