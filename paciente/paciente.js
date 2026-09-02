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

    // Collect selected option texts per meal for readable admin view
    const resumen = {};
    document.querySelectorAll('.meal[data-mealid]').forEach(mealEl => {
      const mid = mealEl.dataset.mealid;
      const textos = [];
      mealEl.querySelectorAll('.opt.selected').forEach(opt => {
        const txt = opt.querySelector('.opt-text');
        if (txt) textos.push(txt.textContent.trim().replace(/\s+/g, ' '));
      });
      if (textos.length) resumen[mid] = textos;
    });
    if (Object.keys(resumen).length) datos.resumen = resumen;

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

    // Limpiar selecciones: borrar de localStorage y resetear mealState en memoria
    const mealKeyStr = typeof MEAL_KEY === 'function' ? MEAL_KEY() : `${slug}-meals-v1`;
    localStorage.removeItem(mealKeyStr);
    if (typeof mealState !== 'undefined') {
      Object.keys(mealState).forEach(k => delete mealState[k]);
    }

    // Limpiar notas y fotos del día
    document.querySelectorAll('.meal[data-mealid]').forEach(mealEl => {
      const mid = mealEl.dataset.mealid;
      localStorage.removeItem(_noteKey(slug, mid));
      const ta = mealEl.querySelector('.meal-note-input');
      if (ta) ta.value = '';
      removePhoto(mid);
    });

    // Re-renderizar el plan con estado limpio
    if (typeof renderNutr === 'function') renderNutr();
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

/* ══════════════════════════════════════════════════════════════════════════
   COMPOSICIÓN CORPORAL + INTERPRETACIÓN
   Módulo compartido por todos los planes. paciente.js se carga después del
   script inline de cada plan, así que aquí ya existen PATIENT y renderEval.
   El cuadro se inyecta en #tab-eval .evalwrap y reemplaza cualquier bloque de
   composición que el plan traiga escrito a mano, para que todos se vean igual.
   Solo se muestran las filas que tienen dato: nada se inventa.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function num(v) { return typeof v === 'number' && !isNaN(v) ? v : null; }
  function f1(v) { return v != null ? +v.toFixed(1) : null; }

  // Deriva todo lo que se pueda de una medición.
  function ccData(a) {
    if (!a) return null;
    var peso = num(a.peso);
    if (!peso) return null;

    var s6 = null, s8 = null;
    if (a.tri != null && a.sub != null && a.supra != null && a.abd != null && a.pierna != null && a.pant != null) {
      s6 = f1(a.tri + a.sub + a.supra + a.abd + a.pierna + a.pant);
      if (a.bi != null && a.cresta != null) s8 = f1(s6 + a.bi + a.cresta);
    }

    // % grasa: primero el valor cargado desde la hoja ISAK. Si no hay, se estima
    // con Faulkner clásico sobre la sumatoria de 4 pliegues y se marca como tal.
    var pctG = num(a.pctGrasa), pctGEstim = false;
    if (pctG == null && a.tri != null && a.sub != null && a.supra != null && a.abd != null) {
      pctG = f1(5.783 + 0.153 * (a.tri + a.sub + a.supra + a.abd));
      pctGEstim = true;
    }

    var fat = num(a.fatKg);
    if (fat == null && pctG != null) fat = f1(peso * pctG / 100);

    var mus = num(a.muscKg);
    if (mus == null && num(a.pctMusc) != null) mus = f1(peso * a.pctMusc / 100);

    var ose = num(a.oseoKg);
    if (ose == null && num(a.pctOseo) != null) ose = f1(peso * a.pctOseo / 100);

    var imo = num(a.imo);
    if (imo == null && mus && ose) imo = +(mus / ose).toFixed(2);

    var icc = num(a.icc);
    if (icc == null && num(a.abdom) && num(a.cadera)) icc = +(a.abdom / a.cadera).toFixed(2);

    var ict = (num(a.abdom) && num(a.talla)) ? +(a.abdom / a.talla).toFixed(2) : null;

    return {
      fecha: a.fecha, peso: peso, talla: num(a.talla), imc: num(a.imc),
      s6: s6, s8: s8, pctG: pctG, pctGEstim: pctGEstim,
      pctMusc: num(a.pctMusc), pctOseo: num(a.pctOseo),
      fat: fat, mus: mus, ose: ose, imo: imo,
      magra: fat != null ? f1(peso - fat) : null,
      icc: icc, ict: ict, abdom: num(a.abdom)
    };
  }

  function row(label, val, bold) {
    if (val == null) return '';
    return '<div class="row' + (bold ? ' bold' : '') + '"><span>' + label + '</span><span>' + val + '</span></div>';
  }

  function ccBox(d) {
    var html = row('% Grasa (Faulkner)' + (d.pctGEstim ? ' *' : ''), d.pctG != null ? d.pctG + ' %' : null)
      + row('Masa grasa', d.fat != null ? d.fat + ' kg' : null, true)
      + row('% Músculo (Lee)', d.pctMusc != null ? d.pctMusc + ' %' : null)
      + row('Masa muscular', d.mus != null ? d.mus + ' kg' : null, true)
      + row('Masa ósea (Rocha)', d.ose != null ? d.ose + ' kg' : null)
      + row('IMO (músculo/hueso)', d.imo, true)
      + row('Masa magra', d.magra != null ? d.magra + ' kg' : null, true);
    if (!html) return '';
    var nota = d.pctGEstim
      ? '<div style="font-size:10.5px;color:var(--faint);font-style:italic;padding:8px 0 0">* Estimado con Faulkner a partir de los pliegues. Pendiente cargar el valor de la hoja ISAK.</div>'
      : '';
    return '<div class="evgroup" data-cc-box><div class="gh">Composición Corporal</div>' + html + nota + '</div>';
  }

  // ── Interpretación ────────────────────────────────────────────────────────
  // Umbrales alineados con los del panel de admin (admin-registros.html).
  var META_GRASA = { f: [17, 22], m: [10, 15] };
  var REF_S6     = { f: [55, 80, 100, 130], m: [40, 60, 80, 110] };
  var REF_ICC    = { f: 0.85, m: 1.00 };

  function nivelS6(s6, sexo) {
    var r = REF_S6[sexo];
    if (s6 > r[3]) return 'sedentario';
    if (s6 > r[2]) return 'activo / fitness';
    if (s6 > r[1]) return 'atleta entrenado';
    return 'deportista de élite';
  }

  function ccInterp(d, prev, sexo) {
    var out = [];

    if (d.fat != null && d.magra != null) {
      var t = '<b>Tu composición hoy:</b> ' + d.fat + ' kg de grasa y ' + d.magra + ' kg de masa libre de grasa';
      if (d.mus != null && d.ose != null) {
        t += ', de los cuales ' + d.mus + ' kg son músculo y ' + d.ose + ' kg hueso (IMO ' + d.imo + ')';
      }
      out.push({ t: t + '.', c: 'ink' });
    }

    if (sexo && d.s6 != null) {
      out.push({ t: '<b>Σ6 de ' + d.s6 + ' mm</b> te ubica en rango de <b>' + nivelS6(d.s6, sexo) + '</b>.', c: 'ink' });
    }

    if (sexo && d.pctG != null && !d.pctGEstim) {
      var meta = META_GRASA[sexo];
      if (d.pctG > meta[1]) {
        var faltan = ((d.pctG - meta[1]) / 100 * d.peso).toFixed(1);
        out.push({ t: 'Para entrar a la zona óptima de rendimiento (' + meta[0] + '–' + meta[1] + ' %) te faltan &asymp; <b>' + faltan + ' kg de grasa</b>.', c: 'amber' });
      } else if (d.pctG < meta[0]) {
        out.push({ t: 'Tu % de grasa está por debajo del rango de referencia (' + meta[0] + '–' + meta[1] + ' %). No es un problema en sí, pero conviene conversarlo en consulta.', c: 'amber' });
      } else {
        out.push({ t: 'Tu % de grasa está en <b>zona óptima</b> para rendimiento deportivo.', c: 'green' });
      }
    }

    // El IMC no distingue músculo de grasa: avisar cuando se contradicen.
    if (d.imc != null && d.imc >= 25 && sexo && d.pctG != null && !d.pctGEstim && d.pctG <= META_GRASA[sexo][1]) {
      out.push({ t: '<b>Tu IMC dice ' + d.imc + '</b>, que en una tabla genérica se leería como sobrepeso — pero ese número no distingue músculo de grasa. Con ' + d.pctG + ' % de grasa, tu peso es sobre todo masa magra: <b>en tu caso el IMC no aplica</b>.', c: 'green' });
    }

    var riesgo = [];
    if (d.ict != null) riesgo.push('Índice cintura/talla ' + d.ict + ' (meta &lt; 0.50)');
    if (d.icc != null && sexo) riesgo.push('ICC ' + d.icc + ' (meta &lt; ' + REF_ICC[sexo].toFixed(2) + ')');
    if (riesgo.length) {
      var alto = (d.ict != null && d.ict >= 0.50) || (d.icc != null && sexo && d.icc > REF_ICC[sexo]);
      var ok = riesgo.length > 1 ? 'ambos en <b>zona saludable</b>.' : 'en <b>zona saludable</b>.';
      out.push({
        t: riesgo.join(' e ') + ': ' + (alto ? 'conviene revisar la distribución de grasa abdominal.' : ok),
        c: alto ? 'amber' : 'green'
      });
    }

    if (prev) {
      var p = ccData(prev);
      if (p) {
        var ds = [];
        var delta = function (act, ant, u, lbl) {
          if (act == null || ant == null) return;
          var v = +(act - ant).toFixed(1);
          if (v === 0) return;
          ds.push(lbl + ' ' + (v > 0 ? '+' : '−') + Math.abs(v) + ' ' + u);
        };
        delta(d.peso, p.peso, 'kg', 'peso');
        delta(d.s8, p.s8, 'mm', 'Σ8');
        // Grasa y músculo solo se comparan si AMBAS mediciones traen el valor
        // real de la hoja ISAK. Contrastar un dato real contra una estimación
        // hecha con otra fórmula da diferencias falsas.
        if (!d.pctGEstim && !p.pctGEstim) delta(d.fat, p.fat, 'kg', 'masa grasa');
        delta(d.mus, p.mus, 'kg', 'masa muscular');
        delta(d.abdom, p.abdom, 'cm', 'cintura');
        if (ds.length) out.push({ t: '<b>Desde el ' + p.fecha + ':</b> ' + ds.join(' · ') + '.', c: 'ink' });
      }
    }

    return out;
  }

  var COLOR = { ink: 'var(--muted)', amber: 'var(--amber)', green: 'var(--green)' };

  function interpCard(msgs) {
    if (!msgs.length) return '';
    return '<div class="card" data-cc-interp style="max-width:none;margin-top:16px">'
      + '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);margin-bottom:12px">Qué dicen estos números</div>'
      + msgs.map(function (m) {
          return '<div style="font-size:13px;line-height:1.65;color:' + COLOR[m.c] + ';padding:5px 0 5px 14px;border-left:2px solid ' + COLOR[m.c] + ';margin-bottom:8px">' + m.t + '</div>';
        }).join('')
      + '<div style="font-size:10.5px;color:var(--faint);font-style:italic;margin-top:10px">Lo que importa no es el número exacto de una medición, sino cómo cambia entre una y otra. Cualquier duda la vemos en consulta.</div>'
      + '</div>';
  }

  // Medición anterior: la última del historial que no sea la actual.
  function prevAntro() {
    var h = (typeof PATIENT !== 'undefined' && PATIENT.antroHistorial) || [];
    for (var i = h.length - 1; i >= 0; i--) {
      if (h[i] && h[i].fecha !== PATIENT.antro.fecha) return h[i];
    }
    return null;
  }

  var injecting = false;

  function ccInject() {
    if (injecting) return;
    if (typeof PATIENT === 'undefined' || !PATIENT.antro) return;
    // Algunos planes parten la evaluación en más de un .evalwrap: el cuadro va
    // en el último, y la limpieza tiene que barrer todos.
    var wraps = document.querySelectorAll('#tab-eval .evalwrap');
    if (!wraps.length) return;
    var wrap = wraps[wraps.length - 1];

    var d = ccData(PATIENT.antro);
    if (!d) return;
    var box = ccBox(d);
    if (!box) return;

    injecting = true;
    try {
      // Fuera cualquier bloque de composición previo (el del plan o el nuestro).
      Array.prototype.forEach.call(document.querySelectorAll('#tab-eval .evgroup'), function (g) {
        var h = g.querySelector('.gh');
        // Los planes titulan este bloque de varias formas: "Composición Corporal",
        // "Composición Corporal · Faulkner", "Composición · Faulkner".
        if (h && /^\s*composici[oó]n\b/i.test(h.textContent)) g.parentNode.removeChild(g);
      });
      var old = document.querySelector('#tab-eval [data-cc-interp]');
      if (old) old.parentNode.removeChild(old);

      wrap.insertAdjacentHTML('beforeend', box);
      var card = interpCard(ccInterp(d, prevAntro(), PATIENT.sexo || null));
      if (card) wrap.insertAdjacentHTML('afterend', card);
    } finally {
      injecting = false;
    }
  }

  // renderEval se declara global en el script inline del plan, así que se puede
  // envolver desde acá.
  function hook() {
    if (typeof window.renderEval !== 'function') return false;
    if (window.renderEval.__ccHooked) return true;
    var orig = window.renderEval;
    var wrapped = function () {
      var r = orig.apply(this, arguments);
      try { ccInject(); } catch (e) { console.warn('[composicion corporal]', e); }
      return r;
    };
    wrapped.__ccHooked = true;
    window.renderEval = wrapped;
    return true;
  }

  function start() {
    hook();
    ccInject(); // por si la pestaña de evaluación ya se pintó
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
  window.addEventListener('load', start);
}());
