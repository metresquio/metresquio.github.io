// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────

import { Movies, Screenings, Seats, Customers, Bookings } from './db.js';
import { state, showPage, showToast, openModal, closeModal, updateHeaderUI } from './core.js';

const ADMIN_PASSWORD = 'admin123';

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export function initAdminLogin() {
  document.getElementById('admin-login-form')?.addEventListener('submit', e => {
    e.preventDefault();
    if (document.getElementById('admin-password').value !== ADMIN_PASSWORD) { showToast('Incorrect password.', 'error'); return; }
    state.isAdmin = true;
    updateHeaderUI();
    showPage('page-admin');
    loadAdminBookings();
    showAdminTab('bookings');
    showToast('Welcome, Admin!');
  });
}

// ── TAB SWITCHING ─────────────────────────────────────────────────────────────
export function showAdminTab(tab) {
  document.querySelectorAll('.admin-tab-content').forEach(t => t.style.display = 'none');
  document.getElementById(`admin-tab-${tab}`).style.display = 'block';
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  if (tab === 'bookings')   loadAdminBookings();
  if (tab === 'movies')     loadAdminMovies();
  if (tab === 'screenings') loadAdminScreenings();
  if (tab === 'customers')  loadAdminCustomers();
  if (tab === 'seats') document.getElementById('seat-admin-panel').innerHTML = '<div class="text-muted text-sm">Select a hall above to manage its seats.</div>';
}

// ── BOOKINGS ──────────────────────────────────────────────────────────────────
function loadAdminBookings() {
  const list = document.getElementById('admin-bookings-list');
  if (!list) return;
  const bookings = Bookings.all();
  if (!bookings.length) { list.innerHTML = '<tr><td colspan="8"><div class="empty-state">No bookings yet.</div></td></tr>'; return; }
  list.innerHTML = bookings.map(b => `<tr>
    <td data-label="Booking ID"><strong>${b.booking_id}</strong></td>
    <td data-label="Date">${b.booking_date}</td>
    <td data-label="Customer">${b.name}<br><span class="text-muted text-sm">${b.email}</span></td>
    <td data-label="Movie">${b.movie_title}</td>
    <td data-label="Show">${b.show_date} ${b.show_time}<br><span class="text-muted text-sm">${b.theater}</span></td>
    <td data-label="Seat">Seat ${b.seat_number}</td>
    <td data-label="Payment"><span class="badge badge-gold">&#8369;${b.amount} ${b.payment_method}</span></td>
    <td data-label="Action"><button class="btn btn-danger btn-sm" data-booking-id="${b.booking_id}">Cancel</button></td>
  </tr>`).join('');
  list.querySelectorAll('[data-booking-id]').forEach(btn => btn.addEventListener('click', () => {
    if (!confirm(`Cancel booking ${btn.dataset.bookingId}?`)) return;
    Bookings.delete(btn.dataset.bookingId); showToast(`Booking ${btn.dataset.bookingId} cancelled.`); loadAdminBookings();
  }));
}

// ── MOVIES ────────────────────────────────────────────────────────────────────
function loadAdminMovies() {
  const list = document.getElementById('admin-movies-list');
  if (!list) return;
  const rows = Movies.all();
  if (!rows.length) { list.innerHTML = '<tr><td colspan="7"><div class="empty-state">No movies yet.</div></td></tr>'; return; }
  list.innerHTML = rows.map(m => `<tr>
    <td data-label="ID"><strong>${m.movie_id}</strong></td>
    <td data-label="Title">${m.title}</td>
    <td data-label="Genre"><span class="badge badge-blue">${m.genre}</span></td>
    <td data-label="Duration">${m.duration}</td>
    <td data-label="Rating"><span class="badge badge-gold">${m.rating}</span></td>
    <td data-label="Description" class="text-muted text-sm" style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${m.description || '—'}</td>
    <td data-label="Actions" class="action-btns">
      <button class="btn btn-outline btn-sm" data-movie='${JSON.stringify(m).replace(/'/g,"&#39;")}'>Edit</button>
      <button class="btn btn-danger btn-sm" data-delete-movie="${m.movie_id}">Delete</button>
    </td>
  </tr>`).join('');
  list.querySelectorAll('[data-movie]').forEach(btn => btn.addEventListener('click', () => openEditMovie(JSON.parse(btn.dataset.movie))));
  list.querySelectorAll('[data-delete-movie]').forEach(btn => btn.addEventListener('click', () => {
    if (!confirm('Delete this movie?')) return;
    Movies.delete(btn.dataset.deleteMovie); showToast('Movie deleted.'); loadAdminMovies();
  }));
}

export function openAddMovie() {
  document.getElementById('movie-modal-title').textContent = 'Add Movie';
  ['movie-edit-id','m-title','m-genre','m-duration','m-desc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('m-rating').value = '';
  openModal('modal-movie');
}
function openEditMovie(m) {
  document.getElementById('movie-modal-title').textContent = 'Edit Movie';
  document.getElementById('movie-edit-id').value = m.movie_id;
  document.getElementById('m-title').value = m.title;
  document.getElementById('m-genre').value = m.genre;
  document.getElementById('m-duration').value = m.duration;
  document.getElementById('m-rating').value = m.rating;
  document.getElementById('m-desc').value = m.description || '';
  openModal('modal-movie');
}
export function saveMovie(e) {
  e.preventDefault();
  const id = document.getElementById('movie-edit-id').value;
  const body = { title: document.getElementById('m-title').value.trim(), genre: document.getElementById('m-genre').value.trim(), duration: document.getElementById('m-duration').value.trim(), rating: document.getElementById('m-rating').value, description: document.getElementById('m-desc').value.trim() };
  if (id) { Movies.update(id, body); showToast('Movie updated.'); } else { Movies.add(body); showToast('Movie added.'); }
  closeModal('modal-movie'); loadAdminMovies();
}

// ── SCREENINGS ────────────────────────────────────────────────────────────────
function loadAdminScreenings() {
  const list = document.getElementById('admin-screenings-list');
  if (!list) return;
  const rows = Screenings.all();
  if (!rows.length) { list.innerHTML = '<tr><td colspan="6"><div class="empty-state">No screenings yet.</div></td></tr>'; return; }
  list.innerHTML = rows.map(s => `<tr>
    <td data-label="ID"><strong>${s.screening_id}</strong></td>
    <td data-label="Movie">${s.movie_title}</td>
    <td data-label="Theater">${s.theater}</td>
    <td data-label="Date">${s.show_date}</td>
    <td data-label="Time">${s.show_time}</td>
    <td data-label="Actions" class="action-btns">
      <button class="btn btn-outline btn-sm" data-screening='${JSON.stringify(s).replace(/'/g,"&#39;")}'>Edit</button>
      <button class="btn btn-danger btn-sm" data-delete-screening="${s.screening_id}">Delete</button>
    </td>
  </tr>`).join('');
  list.querySelectorAll('[data-screening]').forEach(btn => btn.addEventListener('click', () => openEditScreening(JSON.parse(btn.dataset.screening))));
  list.querySelectorAll('[data-delete-screening]').forEach(btn => btn.addEventListener('click', () => {
    if (!confirm('Delete this screening?')) return;
    Screenings.delete(btn.dataset.deleteScreening); showToast('Screening deleted.'); loadAdminScreenings();
  }));
}

export function openAddScreening() {
  document.getElementById('screening-modal-title').textContent = 'Add Screening';
  ['screening-edit-id','s-date','s-time'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('s-theater').value = '';
  populateMovieSelect(null);
  openModal('modal-screening');
}
function openEditScreening(s) {
  document.getElementById('screening-modal-title').textContent = 'Edit Screening';
  document.getElementById('screening-edit-id').value = s.screening_id;
  document.getElementById('s-theater').value = s.theater;
  document.getElementById('s-date').value = s.show_date;
  document.getElementById('s-time').value = s.show_time;
  populateMovieSelect(s.movie_id);
  openModal('modal-screening');
}
function populateMovieSelect(selectedId) {
  const sel = document.getElementById('s-movie-id');
  const movies = Movies.all();
  sel.innerHTML = '<option value="">Select movie…</option>' + movies.map(m => `<option value="${m.movie_id}" ${m.movie_id == selectedId ? 'selected' : ''}>${m.title}</option>`).join('');
}
export function saveScreening(e) {
  e.preventDefault();
  const id = document.getElementById('screening-edit-id').value;
  const body = { movie_id: +document.getElementById('s-movie-id').value, theater: document.getElementById('s-theater').value, show_date: document.getElementById('s-date').value, show_time: document.getElementById('s-time').value };
  if (id) { Screenings.update(id, body); showToast('Screening updated.'); } else { Screenings.add(body); showToast('Screening added.'); }
  closeModal('modal-screening'); loadAdminScreenings();
}

// ── SEATS ─────────────────────────────────────────────────────────────────────
export function loadSeatAdmin(hall) {
  ['Hall 1','Hall 2','Hall 3'].forEach((h, i) => {
    const btn = document.getElementById(`seat-hall-btn-${i + 1}`);
    if (btn) btn.className = h === hall ? 'btn btn-primary' : 'btn btn-outline';
  });
  const panel = document.getElementById('seat-admin-panel');
  const seats = Seats.forTheater(hall);
  const rows = {};
  seats.forEach(s => { const r = s.seat_number[0]; if (!rows[r]) rows[r] = []; rows[r].push(s); });
  let html = `<div style="margin-bottom:14px;font-weight:600;">${hall} — ${seats.length} seat(s)</div>`;
  if (seats.length) {
    html += '<div class="seat-admin-grid">';
    for (const [row, rowSeats] of Object.entries(rows)) {
      html += `<div class="seat-admin-row"><strong style="width:22px;font-size:0.78rem;color:var(--ink-muted)">${row}</strong>`;
      rowSeats.forEach(s => { html += `<span class="seat-admin-chip">${s.seat_number}<button data-delete-seat="${s.seat_id}">&#x2715;</button></span>`; });
      html += '</div>';
    }
    html += '</div>';
  } else { html += '<div class="empty-state" style="padding:16px;">No seats in this theater yet.</div>'; }
  html += `<div class="divider"></div>
    <p class="text-sm" style="margin-bottom:12px;font-weight:600;">Add Seat to ${hall}</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;">
      <div class="form-group" style="min-width:80px;"><label>Row</label><select id="new-seat-row" style="width:90px;">${['A','B','C','D','E','F','G','H'].map(r => `<option>${r}</option>`).join('')}</select></div>
      <div class="form-group" style="min-width:90px;"><label>Seat #</label><input id="new-seat-num" type="number" min="1" max="30" placeholder="1" style="width:100px;" /></div>
      <button class="btn btn-gold" id="btn-add-seat">+ Add Seat</button>
    </div>
    <p class="text-muted text-sm" style="margin-top:8px;">e.g. Row A, Seat 1 → <strong>A1</strong></p>`;
  panel.innerHTML = html;
  panel.querySelectorAll('[data-delete-seat]').forEach(btn => btn.addEventListener('click', () => {
    if (!confirm('Remove this seat?')) return;
    Seats.delete(btn.dataset.deleteSeat); showToast('Seat removed.'); loadSeatAdmin(hall);
  }));
  document.getElementById('btn-add-seat')?.addEventListener('click', () => {
    const row = document.getElementById('new-seat-row').value;
    const num = document.getElementById('new-seat-num').value.trim();
    if (!num) { showToast('Enter a seat number.', 'error'); return; }
    Seats.add({ theater: hall, seat_number: row + num }); showToast(`Seat ${row + num} added.`); loadSeatAdmin(hall);
  });
}

// ── CUSTOMERS ─────────────────────────────────────────────────────────────────
function loadAdminCustomers() {
  const list = document.getElementById('admin-customers-list');
  if (!list) return;
  const rows = Customers.all();
  if (!rows.length) { list.innerHTML = '<tr><td colspan="5"><div class="empty-state">No customers found.</div></td></tr>'; return; }
  list.innerHTML = rows.map(c => `<tr>
    <td data-label="ID"><strong>${c.customer_id}</strong></td>
    <td data-label="Name">${c.name}</td>
    <td data-label="Email">${c.email}</td>
    <td data-label="Phone">${c.phone}</td>
    <td data-label="Actions" class="action-btns">
      <button class="btn btn-outline btn-sm" data-customer='${JSON.stringify(c).replace(/'/g,"&#39;")}'>Edit</button>
      <button class="btn btn-danger btn-sm" data-delete-customer="${c.customer_id}">Delete</button>
    </td>
  </tr>`).join('');
  list.querySelectorAll('[data-customer]').forEach(btn => btn.addEventListener('click', () => {
    const c = JSON.parse(btn.dataset.customer);
    document.getElementById('c-edit-id').value = c.customer_id;
    document.getElementById('c-name').value = c.name;
    document.getElementById('c-email').value = c.email;
    document.getElementById('c-phone').value = c.phone;
    openModal('modal-customer');
  }));
  list.querySelectorAll('[data-delete-customer]').forEach(btn => btn.addEventListener('click', () => {
    if (!confirm('Delete this customer?')) return;
    Customers.delete(btn.dataset.deleteCustomer); showToast('Customer deleted.'); loadAdminCustomers();
  }));
}
export function saveCustomer(e) {
  e.preventDefault();
  const id = document.getElementById('c-edit-id').value;
  const body = { name: document.getElementById('c-name').value.trim(), email: document.getElementById('c-email').value.trim(), phone: document.getElementById('c-phone').value.trim() };
  Customers.update(id, body); showToast('Customer updated.'); closeModal('modal-customer'); loadAdminCustomers();
}
