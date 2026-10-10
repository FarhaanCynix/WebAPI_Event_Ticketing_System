-- 5 Seed Users (password is bcrypt hash for 'Password123')
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@eventhub.com', '$2a$10$wTfkQhE0QxKj1m9JgR9KveV.nK.p2r5Q8v9E0mYmB2r8h2f8u5qO2', 'admin'),
('KL Events Co', 'organiser1@eventhub.com', '$2a$10$wTfkQhE0QxKj1m9JgR9KveV.nK.p2r5Q8v9E0mYmB2r8h2f8u5qO2', 'organiser'),
('Soundwave Productions', 'organiser2@eventhub.com', '$2a$10$wTfkQhE0QxKj1m9JgR9KveV.nK.p2r5Q8v9E0mYmB2r8h2f8u5qO2', 'organiser'),
('John Doe', 'john@gmail.com', '$2a$10$wTfkQhE0QxKj1m9JgR9KveV.nK.p2r5Q8v9E0mYmB2r8h2f8u5qO2', 'customer'),
('Jane Smith', 'jane@gmail.com', '$2a$10$wTfkQhE0QxKj1m9JgR9KveV.nK.p2r5Q8v9E0mYmB2r8h2f8u5qO2', 'customer');

-- 5 Seed Venues
INSERT INTO venues (name, address, capacity, contact_number) VALUES
('Axiata Arena', 'Bukit Jalil, 57000 Kuala Lumpur', 16000, '03-89920888'),
('Kuala Lumpur Convention Centre (KLCC)', 'Kuala Lumpur City Centre, 50088 KL', 3000, '03-23332888'),
('Plenary Hall KLCC', 'Jalan Pinang, 50450 Kuala Lumpur', 2800, '03-23332888'),
('Zepp Kuala Lumpur', 'Bukit Bintang City Centre, 55100 KL', 2400, '03-27060500'),
('Mega Star Arena', 'Sungei Wang Plaza, 55100 Kuala Lumpur', 5000, '03-21448888');

-- 5 Seed Events
INSERT INTO events (title, description, event_date, venue_id, organiser_id, ticket_price, total_tickets, available_tickets) VALUES
('CyberTech Asia 2026', 'Premier annual cybersecurity conference and exhibition', '2026-11-12 09:00:00', 2, 2, 150.00, 500, 480),
('Rock Revival Live', 'Live rock concert featuring regional indie bands', '2026-11-20 20:00:00', 4, 3, 85.00, 1000, 950),
('Cloud & DevOps Summit', 'Hands-on enterprise cloud architecture workshop', '2026-12-05 10:00:00', 3, 2, 200.00, 300, 290),
('Anime & Gaming Expo', 'Pop culture festival, cosplay competitions, and gaming', '2026-12-18 10:00:00', 1, 3, 40.00, 3000, 2980),
('New Year Countdown Rave', 'Electronic music festival ringing in the new year', '2026-12-31 21:00:00', 5, 3, 120.00, 2500, 2450);

-- 5 Seed Bookings
INSERT INTO bookings (booking_reference, user_id, event_id, quantity, total_amount, booking_status) VALUES
('BK-2026-0001', 4, 1, 2, 300.00, 'confirmed'),
('BK-2026-0002', 5, 2, 1, 85.00, 'confirmed'),
('BK-2026-0003', 4, 3, 1, 200.00, 'confirmed'),
('BK-2026-0004', 5, 4, 4, 160.00, 'confirmed'),
('BK-2026-0005', 4, 5, 2, 240.00, 'confirmed');