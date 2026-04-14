// ─── LOCAL STORAGE DATABASE ────────────────────────────────────────────────────
// Replaces the PHP backend with a localStorage-powered store.

function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function nextId(items, field) {
  return items.length ? Math.max(...items.map(i => i[field] || 0)) + 1 : 1;
}

// ── SEED DATA ─────────────────────────────────────────────────────────────────
function seed() {
  if (localStorage.getItem('__seeded')) return;
  save('movies', [
    { movie_id: 1, title: 'Avengers: Doomsday', genre: 'Action', duration: '2h 30m', rating: 'PG-13', description: 'Earth\'s mightiest heroes face their greatest threat yet.' },
    { movie_id: 2, title: 'Wicked: Part 2',     genre: 'Musical', duration: '2h 15m', rating: 'PG',    description: 'The epic conclusion of the beloved Oz story.' },
    { movie_id: 3, title: 'Sinners',             genre: 'Thriller', duration: '2h 08m', rating: 'R',    description: 'Twin brothers return home to Mississippi, only to encounter forces more terrifying than what they left behind.' },
  ]);
  save('screenings', [
    { screening_id: 1, movie_id: 1, theater: 'Hall 1', show_date: '2026-04-15', show_time: '14:00', movie_title: 'Avengers: Doomsday', rating: 'PG-13', duration: '2h 30m' },
    { screening_id: 2, movie_id: 2, theater: 'Hall 2', show_date: '2026-04-15', show_time: '17:30', movie_title: 'Wicked: Part 2',     rating: 'PG',    duration: '2h 15m' },
    { screening_id: 3, movie_id: 3, theater: 'Hall 3', show_date: '2026-04-16', show_time: '20:00', movie_title: 'Sinners',            rating: 'R',     duration: '2h 08m' },
  ]);
  // Seed seats for all 3 halls
  const seats = [];
  let seatId = 1;
  ['Hall 1','Hall 2','Hall 3'].forEach(hall => {
    'ABCDE'.split('').forEach(row => {
      for (let n = 1; n <= 10; n++) {
        seats.push({ seat_id: seatId++, theater: hall, seat_number: row + n });
      }
    });
  });
  save('seats', seats);
  save('customers', []);
  save('bookings', []);
  localStorage.setItem('__seeded', '1');
}
seed();

// ── MOVIES ────────────────────────────────────────────────────────────────────
export const Movies = {
  all: () => load('movies'),
  add(body) { const list = load('movies'); const item = { movie_id: nextId(list, 'movie_id'), ...body }; list.push(item); save('movies', list); return item; },
  update(id, body) { const list = load('movies').map(m => m.movie_id == id ? { ...m, ...body } : m); save('movies', list); },
  delete(id) { save('movies', load('movies').filter(m => m.movie_id != id)); },
};

// ── SCREENINGS ────────────────────────────────────────────────────────────────
export const Screenings = {
  all() {
    const movies = load('movies');
    return load('screenings').map(s => {
      const mv = movies.find(m => m.movie_id == s.movie_id) || {};
      return { ...s, movie_title: mv.title || '?', rating: mv.rating || '', duration: mv.duration || '' };
    });
  },
  add(body) { const list = load('screenings'); const item = { screening_id: nextId(list, 'screening_id'), ...body }; list.push(item); save('screenings', list); return item; },
  update(id, body) { const list = load('screenings').map(s => s.screening_id == id ? { ...s, ...body } : s); save('screenings', list); },
  delete(id) { save('screenings', load('screenings').filter(s => s.screening_id != id)); },
};

// ── SEATS ─────────────────────────────────────────────────────────────────────
export const Seats = {
  forScreening(screeningId) {
    const screenings = load('screenings');
    const sc = screenings.find(s => s.screening_id == screeningId);
    if (!sc) return [];
    const booked = load('bookings').filter(b => b.screening_id == screeningId).map(b => b.seat_id);
    return load('seats').filter(s => s.theater === sc.theater).map(s => ({ ...s, available: !booked.includes(s.seat_id) }));
  },
  forTheater: (theater) => load('seats').filter(s => s.theater === theater),
  add(body) { const list = load('seats'); const item = { seat_id: nextId(list, 'seat_id'), ...body }; list.push(item); save('seats', list); return item; },
  delete(id) { save('seats', load('seats').filter(s => s.seat_id != id)); },
};

// ── CUSTOMERS ─────────────────────────────────────────────────────────────────
export const Customers = {
  all: () => load('customers'),
  byEmail: (email) => load('customers').find(c => c.email.toLowerCase() === email.toLowerCase()),
  add(body) {
    const list = load('customers');
    if (list.find(c => c.email.toLowerCase() === body.email.toLowerCase())) throw new Error('Email already registered.');
    const item = { customer_id: nextId(list, 'customer_id'), ...body }; list.push(item); save('customers', list); return item;
  },
  update(id, body) { const list = load('customers').map(c => c.customer_id == id ? { ...c, ...body } : c); save('customers', list); },
  delete(id) { save('customers', load('customers').filter(c => c.customer_id != id)); },
};

// ── BOOKINGS ──────────────────────────────────────────────────────────────────
export const Bookings = {
  all() {
    const customers  = load('customers');
    const screenings = Screenings.all();
    const seats      = load('seats');
    return load('bookings').map(b => {
      const c  = customers.find(x => x.customer_id == b.customer_id) || {};
      const sc = screenings.find(x => x.screening_id == b.screening_id) || {};
      const st = seats.find(x => x.seat_id == b.seat_id) || {};
      return { ...b, name: c.name || '?', email: c.email || '', movie_title: sc.movie_title || '?', show_date: sc.show_date || '', show_time: sc.show_time || '', theater: sc.theater || '', seat_number: st.seat_number || '' };
    });
  },
  forCustomer(customerId) { return Bookings.all().filter(b => b.customer_id == customerId); },
  add(body) {
    const list = load('bookings');
    const bookings = [];
    for (const seatId of body.seat_ids) {
      const item = { booking_id: nextId([...list, ...bookings], 'booking_id'), customer_id: body.customer_id, screening_id: body.screening_id, seat_id: seatId, payment_method: body.payment_method, amount: 250, booking_date: new Date().toISOString().slice(0,10), ticket_id: 'TK-' + Math.random().toString(36).slice(2,8).toUpperCase() };
      bookings.push(item);
      list.push(item);
    }
    save('bookings', list);
    return bookings[0];
  },
  delete(id) { save('bookings', load('bookings').filter(b => b.booking_id != id)); },
};
