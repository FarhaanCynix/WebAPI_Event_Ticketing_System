const API_BASE = 'http://localhost:5000/api';
let authToken = localStorage.getItem('token') || null;
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

let currentPage = 1;
const pageLimit = 6;
let selectedEvent = null;

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
  updateNavUI();
  if (authToken) {
    showSection('eventsSection');
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
  ['authSection', 'eventsSection', 'bookingsSection'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(sectionId).classList.remove('hidden');

  if (sectionId === 'eventsSection') loadEvents();
  if (sectionId === 'bookingsSection') loadMyBookings();
}

function updateNavUI() {
  const userGreeting = document.getElementById('userGreeting');
  const navLoginBtn = document.getElementById('navLoginBtn');
  const navBookingsBtn = document.getElementById('navBookingsBtn');
  const navLogoutBtn = document.getElementById('navLogoutBtn');

  if (authToken && currentUser) {
    userGreeting.textContent = `Hi, ${currentUser.name}`;
    userGreeting.classList.remove('hidden');
    navLoginBtn.classList.add('hidden');
    navBookingsBtn.classList.remove('hidden');
    navLogoutBtn.classList.remove('hidden');
  } else {
    userGreeting.classList.add('hidden');
    navLoginBtn.classList.remove('hidden');
    navBookingsBtn.classList.add('hidden');
    navLogoutBtn.classList.add('hidden');
  }
}

function switchAuthTab(tab) {
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
}

// 1. Authentication Handlers
async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: 'customer' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    showAlert('Registration successful! Please login.', 'success');
    switchAuthTab('login');
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

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

    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(currentUser));

    updateNavUI();
    showAlert('Welcome back!', 'success');
    showSection('eventsSection');
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

function handleLogout() {
  authToken = null;
  currentUser = null;
  localStorage.clear();
  updateNavUI();
  showAlert('Logged out successfully', 'success');
  showSection('authSection');
}

// 2. Events & Search Handlers
async function loadEvents(search = '') {
  try {
    const res = await fetch(`${API_BASE}/events?page=${currentPage}&limit=${pageLimit}&search=${encodeURIComponent(search)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const list = document.getElementById('eventsList');
    list.innerHTML = '';

    if (data.data.length === 0) {
      list.innerHTML = '<p>No events found.</p>';
      return;
    }

    data.data.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.innerHTML = `
        <div>
          <h3>${ev.title}</h3>
          <p class="event-meta">📍 ${ev.venue_name || 'Venue'} | 📅 ${new Date(ev.event_date).toLocaleDateString()}</p>
          <p style="margin-bottom: 10px; font-size: 0.9rem; color: #cbd5e1;">${ev.description}</p>
        </div>
        <div>
          <p class="event-price">RM ${parseFloat(ev.ticket_price).toFixed(2)}</p>
          <p style="font-size: 0.85rem; margin-bottom: 10px;">Available: ${ev.available_tickets}</p>
          <button class="btn primary" onclick='openBookingModal(${JSON.stringify(ev)})' ${ev.available_tickets <= 0 ? 'disabled' : ''}>
            ${ev.available_tickets > 0 ? 'Book Tickets' : 'Sold Out'}
          </button>
        </div>
      `;
      list.appendChild(card);
    });

    document.getElementById('pageInfo').textContent = `Page ${data.pagination.page} of ${data.pagination.totalPages || 1}`;
    document.getElementById('prevPageBtn').disabled = data.pagination.page <= 1;
    document.getElementById('nextPageBtn').disabled = data.pagination.page >= data.pagination.totalPages;
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

function searchEvents() {
  const query = document.getElementById('searchInput').value;
  currentPage = 1;
  loadEvents(query);
}

function changePage(delta) {
  currentPage += delta;
  const query = document.getElementById('searchInput').value;
  loadEvents(query);
}

// 3. Booking Modal Handlers
function openBookingModal(event) {
  if (!authToken) {
    showAlert('Please login before booking tickets!', 'error');
    showSection('authSection');
    return;
  }
  selectedEvent = event;
  document.getElementById('modalEventTitle').textContent = `Book Tickets: ${event.title}`;
  document.getElementById('modalEventPrice').textContent = `Price: RM ${parseFloat(event.ticket_price).toFixed(2)} per ticket`;
  document.getElementById('ticketQuantity').value = 1;
  updateTotalPrice();
  document.getElementById('bookingModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('bookingModal').classList.add('hidden');
}

function updateTotalPrice() {
  const qty = parseInt(document.getElementById('ticketQuantity').value) || 0;
  const total = qty * parseFloat(selectedEvent.ticket_price);
  document.getElementById('modalTotalPrice').textContent = total.toFixed(2);
}

async function submitBooking() {
  const quantity = parseInt(document.getElementById('ticketQuantity').value);
  if (!quantity || quantity <= 0) {
    showAlert('Please choose a valid quantity', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ event_id: selectedEvent.id, quantity })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Booking failed');

    showAlert('Ticket booked successfully!', 'success');
    closeModal();
    showSection('bookingsSection');
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

// 4. My Bookings Handler
async function loadMyBookings() {
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const list = document.getElementById('myBookingsList');
    list.innerHTML = '';

    if (data.data.length === 0) {
      list.innerHTML = '<p>You have no active bookings yet.</p>';
      return;
    }

    data.data.forEach(b => {
      const card = document.createElement('div');
      card.className = 'booking-card';
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(b.booking_reference)}`;
      card.innerHTML = `
        <h3>${b.event_title}</h3>
        <p style="color: #94a3b8; font-size: 0.85rem; margin: 5px 0;">Ref: ${b.booking_reference}</p>
        <p>Tickets: <strong>${b.quantity}</strong> | Total: <strong>RM ${parseFloat(b.total_amount).toFixed(2)}</strong></p>
        <img src="${qrUrl}" alt="Ticket QR Code" width="150" height="150" />
        <span style="display:inline-block; padding: 4px 10px; background:#065f46; color:#a7f3d0; border-radius:4px; font-size:0.8rem; text-transform:uppercase;">
          ${b.booking_status}
        </span>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    showAlert(err.message, 'error');
  }
}