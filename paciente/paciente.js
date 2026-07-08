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

// ══════════════════════════════════════════
//  REGISTRO DIARIO — nota + foto por comida
// ══════════════════════════════════════════
const _photoFiles = {};   // mealId → File
const _notesDraft = {};   // mealId → string

function _todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function _noteKey(slug, mealId) {
  return `${slug}-note-${_todayStr()}-${mealId}`;
}

function injectMealLog(mealEl) {
  if (mealEl.querySelector('.meal-log')) return;
  const mealId = mealEl.dataset.mealid;
  if (!mealId) return;
  const slug = (typeof PATIENT !== 'undefined') ? PATIENT.slug : 'paciente';
  const savedNote = localStorage.getItem(_noteKey(slug, mealId)) || '';

  const log = document.createElement('div');
  log.className = 'meal-log';
  log.innerHTML = `
    <div class="meal-log-label">📋 ¿Comiste algo diferente hoy?</div>
    <textarea class="meal-note-input" placeholder="Ej: comí pizza en un cumpleaños, tomé jugo de naranja...">${savedNote}</textarea>
    <div class="meal-photo-row">
      <button class="meal-photo-btn" onclick="triggerPhotoInput('${mealId}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        Adjuntar foto
      </button>
      <input type="file" id="photo-input-${mealId}" accept="image/*" style="display:none" onchange="onPhotoSelected('${mealId}', this)">
      <img class="meal-photo-preview" id="photo-preview-${mealId}" src="" alt="foto">
      <button class="meal-photo-remove" id="photo-remove-${mealId}" onclick="removePhoto('${mealId}')">×</button>
    </div>`;

  const textarea = log.querySelector('.meal-note-input');
  textarea.addEventListener('input', () => {
    localStorage.setItem(_noteKey(slug, mealId), textarea.value);
  });

  mealEl.querySelector('.body').appendChild(log);
}

function triggerPhotoInput(mealId) {
  document.getElementById(`photo-input-${mealId}`)?.click();
}

function onPhotoSelected(mealId, input) {
  const file = input.files[0];
  if (!file) return;
  _photoFiles[mealId] = file;
  const url = URL.createObjectURL(file);
  const preview = document.getElementById(`photo-preview-${mealId}`);
  const removeBtn = document.getElementById(`photo-remove-${mealId}`);
  preview.src = url;
  preview.classList.add('visible');
  removeBtn.classList.add('visible');
}

function removePhoto(mealId) {
  delete _photoFiles[mealId];
  const preview = document.getElementById(`photo-preview-${mealId}`);
  const removeBtn = document.getElementById(`photo-remove-${mealId}`);
  const input = document.getElementById(`photo-input-${mealId}`);
  preview.src = '';
  preview.classList.remove('visible');
  removeBtn.classList.remove('visible');
  if (input) input.value = '';
}

async function guardarDia() {
  const btn = document.getElementById('btn-guardar-dia');
  if (!btn) return;
  btn.disabled = true;
  btn.classList.add('loading');
  btn.querySelector('.btn-label').textContent = 'Guardando...';

  try {
    await supabaseReady;
    const slug = (typeof PATIENT !== 'undefined') ? PATIENT.slug : 'paciente';
    const fecha = _todayStr();
    const datos = {};

    // Collect selections from mealState (defined per-file)
    const state = (typeof mealState !== 'undefined') ? mealState : {};
    datos.selecciones = state;

    // Collect notes
    document.querySelectorAll('.meal[data-mealid]').forEach(mealEl => {
      const mid = mealEl.dataset.mealid;
      const ta = mealEl.querySelector('.meal-note-input');
      if (ta && ta.value.trim()) {
        if (!datos.notas) datos.notas = {};
        datos.notas[mid] = ta.value.trim();
      }
    });

    // Upload photos
    const photoUrls = {};
    for (const [mealId, file] of Object.entries(_photoFiles)) {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${slug}/${fecha}/${mealId}.${ext}`;
      const { error: upErr } = await _supabase.storage
        .from('fotos-comidas')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (!upErr) {
        const { data: urlData } = _supabase.storage.from('fotos-comidas').getPublicUrl(path);
        photoUrls[mealId] = urlData.publicUrl;
      }
    }
    if (Object.keys(photoUrls).length) datos.fotos = photoUrls;

    // Save to Supabase
    const { error } = await _supabase
      .from('registros_diarios')
      .upsert({ paciente: slug, fecha, datos }, { onConflict: 'paciente,fecha' });

    if (error) throw error;
    showToast('✅ Registro del día guardado', 'success');

    // Limpiar selecciones y notas del día
    localStorage.removeItem(typeof MEAL_KEY !== 'undefined' ? MEAL_KEY : `${slug}-meals-v1`);
    document.querySelectorAll('.meal[data-mealid]').forEach(mealEl => {
      const mid = mealEl.dataset.mealid;
      localStorage.removeItem(_noteKey(slug, mid));
      mealEl.querySelectorAll('.opt.selected').forEach(opt => opt.classList.remove('selected'));
      mealEl.querySelectorAll('.cb').forEach(cb => cb.textContent = '');
      mealEl.querySelectorAll('.opt-cnt').forEach(cnt => cnt.textContent = '0');
      const ta = mealEl.querySelector('.meal-note-input');
      if (ta) ta.value = '';
      removePhoto(mid);
    });
  } catch (e) {
    console.error(e);
    showToast('Error al guardar. Intenta de nuevo.', 'error');
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.querySelector('.btn-label').textContent = 'Guardar mi día';
  }
}

function injectGuardarBtn(mealsContainer) {
  if (mealsContainer.parentElement?.querySelector('.guardar-dia-wrap')) return;
  const wrap = document.createElement('div');
  wrap.className = 'guardar-dia-wrap';
  wrap.innerHTML = `<button class="btn-guardar-dia" id="btn-guardar-dia" onclick="guardarDia()">
    <div class="spin"></div>
    <span class="btn-label">💾 Guardar mi día</span>
  </button>`;
  mealsContainer.insertAdjacentElement('afterend', wrap);
}

// MutationObserver: detecta tarjetas .meal y les inyecta el log automáticamente
(function initDailyLogObserver() {
  function processNode(node) {
    if (node.nodeType !== 1) return;
    node.querySelectorAll('.meal[data-mealid]').forEach(injectMealLog);
    if (node.classList?.contains('meal') && node.dataset.mealid) injectMealLog(node);
    node.querySelectorAll('.meals').forEach(injectGuardarBtn);
    if (node.classList?.contains('meals')) injectGuardarBtn(node);
  }
  const obs = new MutationObserver(mutations => {
    mutations.forEach(m => m.addedNodes.forEach(processNode));
  });
  function start() {
    obs.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll('.meal[data-mealid]').forEach(injectMealLog);
    document.querySelectorAll('.meals').forEach(injectGuardarBtn);
  }
  // Usar setTimeout para correr después de que init() del paciente termine
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(start, 0));
  } else {
    setTimeout(start, 0);
  }
}());
