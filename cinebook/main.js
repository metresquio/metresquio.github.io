// ─── MAIN ENTRY ───────────────────────────────────────────────────────────────

import { state, loadSession, logout, showPage, initModalOverlayClose, closeModal } from './core.js';
import { loadHomeMovies, initAuth, showAuthTab, startBooking, loadMyBookings,
         updateWizardStep, goToSeats, goToPayment, selectPayment, goToConfirm, confirmBooking } from './pages.js';
import { initAdminLogin, showAdminTab, openAddMovie, saveMovie,
         openAddScreening, saveScreening, loadSeatAdmin, saveCustomer } from './admin.js';

// Expose for inline onclick in movie cards
window.__cinebook = { startBooking };

// ── MOBILE NAV ────────────────────────────────────────────────────────────────
function toggleMobileNav() {
  document.getElementById('mobile-nav').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
}
function closeMobileNav() {
  document.getElementById('mobile-nav').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}
document.addEventListener('click', e => {
  const nav = document.getElementById('mobile-nav');
  const ham = document.getElementById('hamburger');
  if (nav?.classList.contains('open') && !nav.contains(e.target) && !ham.contains(e.target)) closeMobileNav();
});

// ── WIRE UP BUTTONS ───────────────────────────────────────────────────────────
document.querySelector('.site-logo')?.addEventListener('click', () => showPage('page-home'));
document.getElementById('btn-nav-home')?.addEventListener('click',        () => showPage('page-home'));
document.getElementById('btn-nav-customer')?.addEventListener('click',    () => showPage('page-auth'));
document.getElementById('btn-nav-admin')?.addEventListener('click',       () => showPage('page-admin-login'));
document.getElementById('btn-logout')?.addEventListener('click',          () => { logout(); showPage('page-home'); });
document.getElementById('hamburger')?.addEventListener('click',           toggleMobileNav);
document.getElementById('mobile-btn-home')?.addEventListener('click',     () => { closeMobileNav(); showPage('page-home'); });
document.getElementById('mobile-btn-customer')?.addEventListener('click', () => { closeMobileNav(); showPage('page-auth'); });
document.getElementById('mobile-btn-admin')?.addEventListener('click',    () => { closeMobileNav(); showPage('page-admin-login'); });
document.getElementById('mobile-btn-logout')?.addEventListener('click',   () => { logout(); closeMobileNav(); showPage('page-home'); });

document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.addEventListener('click', () => showAuthTab(btn.dataset.tab)));
document.getElementById('btn-hero-book')?.addEventListener('click',        startBooking);
document.getElementById('btn-hero-mybookings')?.addEventListener('click',  () => showPage('page-auth'));
document.getElementById('btn-book-tickets')?.addEventListener('click',     startBooking);

document.getElementById('btn-go-seats')?.addEventListener('click',         goToSeats);
document.getElementById('btn-go-payment')?.addEventListener('click',       goToPayment);
document.getElementById('btn-go-confirm')?.addEventListener('click',       goToConfirm);
document.getElementById('btn-confirm-booking')?.addEventListener('click',  confirmBooking);
document.getElementById('btn-wizard-back-1')?.addEventListener('click',    () => updateWizardStep(1));
document.getElementById('btn-wizard-back-2')?.addEventListener('click',    () => updateWizardStep(2));
document.getElementById('btn-wizard-back-3')?.addEventListener('click',    () => updateWizardStep(3));

document.querySelectorAll('.payment-option').forEach(el => el.addEventListener('click', () => selectPayment(el.dataset.method, el)));
document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.addEventListener('click', () => showAdminTab(btn.dataset.tab)));

document.getElementById('btn-add-movie')?.addEventListener('click',        openAddMovie);
document.getElementById('btn-add-screening')?.addEventListener('click',    openAddScreening);
document.getElementById('movie-form')?.addEventListener('submit',          saveMovie);
document.getElementById('screening-form')?.addEventListener('submit',      saveScreening);
document.getElementById('customer-form')?.addEventListener('submit',       saveCustomer);

document.getElementById('seat-hall-btn-1')?.addEventListener('click', () => loadSeatAdmin('Hall 1'));
document.getElementById('seat-hall-btn-2')?.addEventListener('click', () => loadSeatAdmin('Hall 2'));
document.getElementById('seat-hall-btn-3')?.addEventListener('click', () => loadSeatAdmin('Hall 3'));

document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.closeModal)));

// ── INIT ──────────────────────────────────────────────────────────────────────
initAuth();
initAdminLogin();
initModalOverlayClose();
loadSession();
loadHomeMovies();
