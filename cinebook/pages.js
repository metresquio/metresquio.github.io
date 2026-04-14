// ─── PAGES: HOME · AUTH · MY BOOKINGS · BOOKING WIZARD ────────────────────────

import { Movies, Screenings, Seats, Customers, Bookings } from './db.js';
import { state, setCustomer, showPage, showToast } from './core.js';

// ── HOME ──────────────────────────────────────────────────────────────────────
export function loadHomeMovies() {
  const el = document.getElementById('home-movies');
  if (!el) return;
  const movies = Movies.all();
  if (!movies.length) { el.innerHTML = '<div class="empty-state">No movies currently showing.</div>'; return; }
  el.innerHTML = movies.map(m => `
    <div class="movie-card">
      <div class="movie-card-title">${m.title}</div>
      <div class="movie-card-meta">
        <span class="badge badge-gold">${m.rating}</span>
        <span class="badge badge-blue">${m.genre}</span>
        <span class="badge" style="background:var(--paper-gray)">&#9200; ${m.duration}</span>
      </div>
      <div class="movie-card-desc">${m.description || 'No description available.'}</div>
      <button class="btn btn-gold" style="margin-top:14px;width:100%;" onclick="window.__cinebook.startBooking()">Book Now</button>
    </div>`).join('');
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
export function initAuth() {
  document.getElementById('auth-login-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const c = Customers.byEmail(email);
    if (!c) { showToast('Email not found. Please register first.', 'error'); return; }
    setCustomer(c);
    showPage('page-customer-home');
    showToast(`Welcome back, ${c.name.split(' ')[0]}!`);
    loadMyBookings();
  });
  document.getElementById('auth-register-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const body = {
      name:  document.getElementById('reg-name').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      phone: document.getElementById('reg-phone').value.trim(),
    };
    try {
      const c = Customers.add(body);
      setCustomer(c);
      showPage('page-customer-home');
      showToast('Account created! Welcome.');
      loadMyBookings();
    } catch (err) { showToast(err.message, 'error'); }
  });
}

export function showAuthTab(tab) {
  document.getElementById('auth-login').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('auth-register').style.display = tab === 'register' ? 'block' : 'none';
  document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
}

// ── MY BOOKINGS ───────────────────────────────────────────────────────────────
export function loadMyBookings() {
  if (!state.currentCustomer) return;
  const list = document.getElementById('my-bookings-list');
  if (!list) return;
  const bookings = Bookings.forCustomer(state.currentCustomer.customer_id);
  if (!bookings.length) { list.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="icon">&#127903;</div>No bookings yet.</div></td></tr>'; return; }
  list.innerHTML = bookings.map(b => `<tr>
    <td data-label="Booking ID"><strong>${b.booking_id}</strong></td>
    <td data-label="Movie">${b.movie_title}</td>
    <td data-label="Show">${b.show_date} ${b.show_time}</td>
    <td data-label="Seat">${b.theater} — Seat ${b.seat_number}</td>
    <td data-label="Payment"><span class="badge badge-gold">&#8369;${b.amount} ${b.payment_method}</span></td>
    <td data-label="Ticket ID">${b.ticket_id}</td>
  </tr>`).join('');
}

// ── BOOKING WIZARD ────────────────────────────────────────────────────────────
export const wizard = { step: 1, screening: null, selectedSeats: [], paymentMethod: null };

export function startBooking() {
  if (!state.currentCustomer) { showPage('page-auth'); return; }
  Object.assign(wizard, { step: 1, screening: null, selectedSeats: [], paymentMethod: null });
  showPage('page-book');
  updateWizardStep(1);
  loadScreenings();
}

export function updateWizardStep(step) {
  wizard.step = step;
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`wizard-step-${i}`);
    if (el) el.style.display = i === step ? 'block' : 'none';
  }
  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.toggle('active', i + 1 === step);
    s.classList.toggle('done',   i + 1 < step);
  });
  window.scrollTo(0, 0);
}

function loadScreenings() {
  const list = document.getElementById('screening-list');
  if (!list) return;
  const screenings = Screenings.all();
  if (!screenings.length) { list.innerHTML = '<div class="empty-state">No screenings available right now.</div>'; return; }
  list.innerHTML = screenings.map(s => `
    <div class="screening-card card" data-screening='${JSON.stringify(s).replace(/'/g, "&#39;")}'>
      <div class="screening-movie">${s.movie_title}</div>
      <div class="screening-meta">
        <span class="screening-badge">&#128197; ${s.show_date}</span>
        <span class="screening-badge">&#128336; ${s.show_time}</span>
        <span class="screening-badge">&#127917; ${s.theater}</span>
        <span class="screening-badge badge-blue">${s.rating}</span>
        <span class="screening-badge">&#9200; ${s.duration}</span>
      </div>
    </div>`).join('');
  list.querySelectorAll('.screening-card').forEach(card => {
    card.addEventListener('click', () => {
      wizard.screening = JSON.parse(card.dataset.screening);
      list.querySelectorAll('.screening-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      document.getElementById('selected-screening-label').textContent =
        `Selected: ${wizard.screening.movie_title} — ${wizard.screening.show_date} ${wizard.screening.show_time} — ${wizard.screening.theater}`;
    });
  });
}

export function goToSeats() {
  if (!wizard.screening) { showToast('Please select a screening first.', 'error'); return; }
  updateWizardStep(2);
  const area = document.getElementById('seat-area');
  wizard.selectedSeats = [];
  const seats = Seats.forScreening(wizard.screening.screening_id);
  if (!seats.length) { area.innerHTML = '<div class="empty-state">No seats configured for this theater yet.</div>'; return; }
  const rows = {};
  seats.forEach(s => { const r = s.seat_number[0]; if (!rows[r]) rows[r] = []; rows[r].push(s); });
  let html = '<div class="seat-grid"><div class="screen-label">SCREEN</div>';
  for (const [row, rowSeats] of Object.entries(rows)) {
    html += `<div class="seat-row"><span class="seat-row-label">${row}</span>`;
    rowSeats.forEach(s => {
      const cls   = s.available ? 'seat' : 'seat seat-taken';
      const attrs = s.available ? `data-seat-id="${s.seat_id}" data-seat-number="${s.seat_number}"` : '';
      html += `<div class="${cls}" ${attrs}>${s.seat_number.slice(1)}</div>`;
    });
    html += '</div>';
  }
  html += '</div>';
  html += `<div class="seat-legend">
    <div class="seat-legend-item"><div class="legend-box" style="background:#fff"></div> Available</div>
    <div class="seat-legend-item"><div class="legend-box" style="background:#b8922a;border-color:#b8922a"></div> Selected</div>
    <div class="seat-legend-item"><div class="legend-box" style="background:#f4f4f2;border-color:#ddd"></div> Taken</div>
  </div>`;
  area.innerHTML = html;
  area.querySelectorAll('.seat:not(.seat-taken)').forEach(el => {
    el.addEventListener('click', () => {
      const seatId = el.dataset.seatId, seatNumber = el.dataset.seatNumber;
      const idx = wizard.selectedSeats.findIndex(s => s.id === seatId);
      if (idx >= 0) { wizard.selectedSeats.splice(idx, 1); el.classList.remove('seat-selected'); }
      else          { wizard.selectedSeats.push({ id: seatId, number: seatNumber }); el.classList.add('seat-selected'); }
      document.getElementById('seat-selection-summary').textContent =
        wizard.selectedSeats.length > 0 ? `Selected: ${wizard.selectedSeats.map(s => s.number).join(', ')}` : 'No seats selected';
    });
  });
}

export function goToPayment() {
  if (!wizard.selectedSeats.length) { showToast('Please select at least one seat.', 'error'); return; }
  const total = 250 * wizard.selectedSeats.length;
  document.getElementById('payment-summary').innerHTML = `
    <strong>${wizard.screening.movie_title}</strong><br>
    ${wizard.screening.show_date} ${wizard.screening.show_time} — ${wizard.screening.theater}<br>
    Seats: ${wizard.selectedSeats.map(s => s.number).join(', ')}<br>
    <strong>${wizard.selectedSeats.length} ticket(s) &times; &#8369;250 = &#8369;${total}</strong>`;
  updateWizardStep(3);
}

export function selectPayment(method, el) {
  wizard.paymentMethod = method;
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

export function goToConfirm() {
  if (!wizard.paymentMethod) { showToast('Please select a payment method.', 'error'); return; }
  const total = 250 * wizard.selectedSeats.length;
  document.getElementById('confirm-details').innerHTML = `
    <div class="confirm-row"><span>Movie</span><strong>${wizard.screening.movie_title}</strong></div>
    <div class="confirm-row"><span>Show</span><strong>${wizard.screening.show_date} ${wizard.screening.show_time}</strong></div>
    <div class="confirm-row"><span>Theater</span><strong>${wizard.screening.theater}</strong></div>
    <div class="confirm-row"><span>Seats</span><strong>${wizard.selectedSeats.map(s => s.number).join(', ')}</strong></div>
    <div class="confirm-row"><span>Payment</span><strong>${wizard.paymentMethod}</strong></div>
    <div class="confirm-row total-row"><span>Total</span><strong class="text-gold">&#8369;${total}</strong></div>`;
  updateWizardStep(4);
}

export function confirmBooking() {
  try {
    const res = Bookings.add({
      customer_id:    state.currentCustomer.customer_id,
      screening_id:   wizard.screening.screening_id,
      seat_ids:       wizard.selectedSeats.map(s => s.id),
      payment_method: wizard.paymentMethod,
    });
    showToast(`Booking confirmed! ID: ${res.booking_id}`);
    showPage('page-customer-home');
    loadMyBookings();
  } catch (err) { showToast(err.message, 'error'); }
}
