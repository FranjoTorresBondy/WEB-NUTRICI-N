// ══════════════════════════════════════════
//  SUPABASE CONFIG
// ══════════════════════════════════════════
const SUPABASE_URL     = 'https://hmnjtbruliluctslkndq.supabase.co';
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
//  AUTH GUARD
// ══════════════════════════════════════════
async function requirePacienteAuth() {
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
  setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 300); }, 3200);
}

// ══════════════════════════════════════════
//  LOGOUT
// ══════════════════════════════════════════
async function logout() {
  await supabaseReady;
  await _supabase.auth.signOut();
  window.location.href = 'index.html';
}
