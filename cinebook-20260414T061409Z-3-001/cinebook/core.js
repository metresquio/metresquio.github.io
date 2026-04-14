// ─── CORE: STATE · ROUTER · TOAST · MODAL ─────────────────────────────────────

// ── STATE ─────────────────────────────────────────────────────────────────────
export const state = { currentCustomer: null, isAdmin: false };

export function setCustomer(c) {
  state.currentCustomer = c;
  sessionStorage.setItem('customer', JSON.stringify(c));
  updateHeaderUI();
}

export function loadSession() {
  const s = sessionStorage.getItem('customer');
  if (s) { state.currentCustomer = JSON.parse(s); updateHeaderUI(); }
}

export function logout() {
  state.currentCustomer = null;
  state.isAdmin = false;
  sessionStorage.clear();
  updateHeaderUI();
}

export function updateHeaderUI() {
  const show = !!(state.currentCustomer || state.isAdmin);
  const btnLogout       = document.getElementById('btn-logout');
  const btnMobileLogout = document.getElementById('mobile-btn-logout');
  const lbl             = document.getElementById('header-user-label');
  const mlbl            = document.getElementById('mobile-user-label');
  if (btnLogout)       btnLogout.style.display       = show ? 'inline-flex' : 'none';
  if (btnMobileLogout) btnMobileLogout.style.display  = show ? 'block'      : 'none';
  if (state.currentCustomer) {
    const name = `Hi, ${state.currentCustomer.name.split(' ')[0]}`;
    if (lbl)  { lbl.textContent  = name; lbl.classList.add('visible'); }
    if (mlbl) { mlbl.textContent = name; mlbl.style.display = 'block'; }
  } else {
    if (lbl)  lbl.classList.remove('visible');
    if (mlbl) mlbl.style.display = 'none';
  }
}

// ── ROUTER ────────────────────────────────────────────────────────────────────
import { loadHomeMovies } from './pages.js';

export function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  if (id === 'page-home') loadHomeMovies();
  window.scrollTo(0, 0);
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
let toastContainer = null;
function getContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}
export function showToast(msg, type = 'success') {
  const container = getContainer();
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span>${type === 'error' ? '✕' : '✓'}</span> ${msg}`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
export function openModal(id) { document.getElementById(id)?.classList.add('open'); }
export function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
export function initModalOverlayClose() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
  });
}
