// ══════════════════════════════════════════
//  SUPABASE CONFIG — reemplaza con tus claves
// ══════════════════════════════════════════
const SUPABASE_URL = 'https://hmnjtbruliluctslkndq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtbmp0YnJ1bGlsdWN0c2xrbmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjAxNjksImV4cCI6MjA5NzAzNjE2OX0.IYmCcvjdlbH1L0QoSoGIpwudRehSQINR1hNoWG02Cc4';

let _supabase;
const supabaseReady = new Promise((resolve) => {
  const check = setInterval(() => {
    if (window.supabase) {
      _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      clearInterval(check);
      resolve();
    }
  }, 50);
});

// ══════════════════════════════════════════
//  GUARD — páginas protegidas
// ══════════════════════════════════════════
async function requireAuth() {
  await supabaseReady;
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

// ══════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ══════════════════════════════════════════
//  SIDEBAR MOBILE
// ══════════════════════════════════════════
function initSidebar() {
  const burger = document.getElementById('burgerBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!burger) return;

  burger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });
}

// ══════════════════════════════════════════
//  LOGOUT
// ══════════════════════════════════════════
async function logout() {
  await supabaseReady;
  await _supabase.auth.signOut();
  window.location.href = 'index.html';
}

// ══════════════════════════════════════════
//  INICIALES PARA AVATAR
// ══════════════════════════════════════════
function getInitials(name) {
  if (!name) return 'F';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ══════════════════════════════════════════
//  MODAL HELPERS
// ══════════════════════════════════════════
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

// Cerrar modal al click fuera
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ══════════════════════════════════════════
//  FORMATO FECHA
// ══════════════════════════════════════════
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}
