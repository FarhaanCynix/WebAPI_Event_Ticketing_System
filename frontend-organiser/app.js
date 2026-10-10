const API_BASE = 'http://localhost:5000/api';
let authToken = localStorage.getItem('organiser_token') || null;
let currentUser = JSON.parse(localStorage.getItem('organiser_user')) || null;
let venuesList = [];

document.addEventListener('DOMContentLoaded', () => {
  updateNavUI();
  if (authToken && currentUser && currentUser.role === 'organiser') {
    showSection('dashboardSection');
  } else {
    showSection('authSection');
  }
});

function showAlert(message, type = 'success') {
  const box = document.getElementById('alertBox');
  box.textContent = message;
  box.className = `alert ${type}`;
  box.classList.remove('hidden');
  setTimeout(() => box.classList.add('hidden'), 4000);
}

function showSection(sectionId) {
  ['authSection', 'dashboardSection', 'createEventSection'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(sectionId).classList.remove('hidden');

  if (sectionId === 'dashboardSection') loadOrganiserEvents();
  if (sectionId === 'createEventSection') loadVenues();
}

function updateNavUI() {
  const greeting = document.getElementById('userGreeting');
  const loginBtn = document.getElementById('navLoginBtn');
  const dashBtn = document.getElementById('navDashboardBtn');
  const createBtn = document.getElementById('navCreateBtn');
  const logoutBtn = document.getElementById('navLogoutBtn');

  if (authToken && currentUser) {
    greeting.textContent = `Organiser: ${currentUser.name}`;
    greeting.classList.remove('hidden');
    loginBtn.classList.add('hidden');
    dashBtn.classList.remove('hidden');
    createBtn.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
  } else {
    greeting.classList.add('hidden');
    loginBtn.classList.remove('hidden');
    dashBtn.classList.add('hidden');
    createBtn.classList.add('hidden');
    logoutBtn.classList.add('hidden');
  }
}

// 1. Organiser Login
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    if (data.user.role !== 'organiser' && data.user.role !== 'admin') {
      throw new Error('Access denied. Only organisers can log into this portal.');
    }

    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('organiser_token', authToken);
    localStorage.setItem('organiser_user', JSON.stringify(currentUser));

    updateNavUI();
    showAlert(`Welcome, ${currentUser.name}!`, 'success');
    showSection('dashboardSection');
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

function handleLogout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('organiser_token');
  localStorage.removeItem('organiser_user');
  updateNavUI();
  showAlert('Logged out successfully', 'success');
  showSection('authSection');
}

// 2. Load Events
async function loadOrganiserEvents() {
  try {
    const res = await fetch(`${API_BASE}/events?page=1&limit=50`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const tbody = document.getElementById('eventsTableBody');
    tbody.innerHTML = '';

    data.data.forEach(ev => {
      const sold = ev.total_tickets - ev.available_tickets;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${ev.title}</strong></td>
        <td>${ev.venue_name || 'Venue ' + ev.venue_id}</td>
        <td>${new Date(ev.event_date).toLocaleString()}</td>
        <td>RM ${parseFloat(ev.ticket_price).toFixed(2)}</td>
        <td>${sold} / ${ev.total_tickets}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

// 3. Load Venues for Creation Form
async function loadVenues() {
  try {
    const res = await fetch(`${API_BASE}/venues`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    venuesList = data.data;
    const select = document.getElementById('evVenue');
    select.innerHTML = '<option value="">-- Choose Venue --</option>';

    venuesList.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = `${v.name} (Capacity: ${v.capacity})`;
      select.appendChild(opt);
    });
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

function updateVenueInfo() {
  const venueId = document.getElementById('evVenue').value;
  const venue = venuesList.find(v => v.id == venueId);
  if (venue) {
    document.getElementById('venueCapacityHint').value = `${venue.capacity} seats max`;
  } else {
    document.getElementById('venueCapacityHint').value = '';
  }
}

// 4. Create Event Handler
async function handleCreateEvent(e) {
  e.preventDefault();
  const title = document.getElementById('evTitle').value;
  const description = document.getElementById('evDesc').value;
  const venue_id = parseInt(document.getElementById('evVenue').value);
  const event_date = document.getElementById('evDate').value.replace('T', ' ') + ':00';
  const ticket_price = parseFloat(document.getElementById('evPrice').value);
  const total_tickets = parseInt(document.getElementById('evTickets').value);

  try {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ title, description, venue_id, event_date, ticket_price, total_tickets })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create event');

    showAlert('Event created successfully!', 'success');
    showSection('dashboardSection');
  } catch (err) {
    showAlert(err.message, 'error');
  }
}// Organiser portal developed by Hanis 
