const API_BASE = 'http://localhost:5000/api';
let authToken = localStorage.getItem('admin_token') || null;
let currentUser = JSON.parse(localStorage.getItem('admin_user')) || null;

document.addEventListener('DOMContentLoaded', () => {
  updateNavUI();
  if (authToken && currentUser && currentUser.role === 'admin') {
    showSection('bookingsSection');
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
  ['authSection', 'bookingsSection', 'venuesSection'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(sectionId).classList.remove('hidden');

  if (sectionId === 'bookingsSection') loadAllBookings();
  if (sectionId === 'venuesSection') loadVenues();
}

function updateNavUI() {
  const greeting = document.getElementById('userGreeting');
  const loginBtn = document.getElementById('navLoginBtn');
  const bookingsBtn = document.getElementById('navBookingsBtn');
  const venuesBtn = document.getElementById('navVenuesBtn');
  const logoutBtn = document.getElementById('navLogoutBtn');

  if (authToken && currentUser) {
    greeting.textContent = `Admin: ${currentUser.name}`;
    greeting.classList.remove('hidden');
    loginBtn.classList.add('hidden');
    bookingsBtn.classList.remove('hidden');
    venuesBtn.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
  } else {
    greeting.classList.add('hidden');
    loginBtn.classList.remove('hidden');
    bookingsBtn.classList.add('hidden');
    venuesBtn.classList.add('hidden');
    logoutBtn.classList.add('hidden');
  }
}

// 1. Admin Authentication
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

    if (data.user.role !== 'admin') {
      throw new Error('Access denied. Administrator privileges required.');
    }

    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('admin_token', authToken);
    localStorage.setItem('admin_user', JSON.stringify(currentUser));

    updateNavUI();
    showAlert(`Welcome, Administrator ${currentUser.name}!`, 'success');
    showSection('bookingsSection');
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

function handleLogout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  updateNavUI();
  showAlert('Admin session terminated', 'success');
  showSection('authSection');
}

// 2. Global Bookings Overview
async function loadAllBookings() {
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const bookings = data.data || [];
    document.getElementById('totalBookingsCount').textContent = bookings.length;

    let revenue = 0;
    bookings.forEach(b => {
      if (b.booking_status === 'confirmed') revenue += parseFloat(b.total_amount);
    });
    document.getElementById('totalRevenueAmount').textContent = `RM ${revenue.toFixed(2)}`;

    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '';

    bookings.forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code>${b.booking_reference}</code></td>
        <td>${b.customer_name || 'N/A'}<br><small style="color:#a8a29e;">${b.customer_email || ''}</small></td>
        <td>${b.event_title}</td>
        <td>${b.venue_name}</td>
        <td>${b.quantity}</td>
        <td>RM ${parseFloat(b.total_amount).toFixed(2)}</td>
        <td><span class="badge ${b.booking_status}">${b.booking_status}</span></td>
        <td>
          ${b.booking_status === 'confirmed' 
            ? `<button class="btn-cancel" onclick="cancelBooking(${b.id})">Cancel</button>` 
            : `<span style="color:#78716c; font-size:0.8rem;">None</span>`}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

// 3. Cancel Booking as Admin
async function cancelBooking(id) {
  if (!confirm('Are you sure you want to cancel this booking and return the tickets to the event pool?')) return;

  try {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showAlert('Booking cancelled and inventory replenished successfully!', 'success');
    loadAllBookings();
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

// 4. Venues Overview
async function loadVenues() {
  try {
    const res = await fetch(`${API_BASE}/venues`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const tbody = document.getElementById('venuesTableBody');
    tbody.innerHTML = '';

    data.data.forEach(v => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${v.id}</td>
        <td><strong>${v.name}</strong></td>
        <td>${v.location}</td>
        <td>${v.capacity} seats</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    showAlert(err.message, 'error');
  }
}