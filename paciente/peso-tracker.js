/* peso-tracker.js — registro diario de peso
   Se auto-inyecta como tab "⚖️ Mi Peso" en todos los planes de paciente.
   Requiere: PATIENT.slug, supabase.js (ya cargados en cada plan).
   Tabla Supabase: peso_registro (id, paciente, fecha, peso, nota, created_at)
*/
(function () {
  const SB_URL  = 'https://hmnjtbruliluctslkndq.supabase.co';
  const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtbmp0YnJ1bGlsdWN0c2xrbmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjAxNjksImV4cCI6MjA5NzAzNjE2OX0.IYmCcvjdlbH1L0QoSoGIpwudRehSQINR1hNoWG02Cc4';
  const HEADERS = { 'Content-Type':'application/json', apikey: SB_ANON, Authorization: 'Bearer ' + SB_ANON };

  let _sb = null;
  let _pesos = [];
  let _chart = null;
  let _editId = null;

  /* ── boot ── */
  function boot() {
    if (!window.PATIENT || !window.supabase) { setTimeout(boot, 200); return; }
    _sb = window.supabase.createClient(SB_URL, SB_ANON);
    injectTab();
  }

  /* ── inject tab button + panel ── */
  function injectTab() {
    const nav    = document.getElementById('tabNav');
    const panels = document.getElementById('tabPanels');
    if (!nav || !panels) return;
    if (document.getElementById('tab-peso')) return; // already injected

    /* Tab button */
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.id = 'tab-btn-peso';
    btn.innerHTML = '<span class="tnum">⚖</span> Mi Peso';
    btn.onclick = function () { activateTab(btn); };
    nav.appendChild(btn);

    /* Panel */
    const panel = document.createElement('div');
    panel.id = 'tab-peso';
    panel.className = 'panel';
    panel.innerHTML = buildPanelHTML();
    panels.appendChild(panel);

    /* Events */
    panel.querySelector('#peso-form').addEventListener('submit', handleSubmit);
    panel.querySelector('#peso-cancel-edit').addEventListener('click', cancelEdit);
  }

  function activateTab(btn) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-peso').classList.add('active');
    btn.classList.add('active');
    if (!_pesos.length) loadPesos();
  }

  /* ── panel HTML ── */
  function buildPanelHTML() {
    const hoy = new Date().toISOString().slice(0, 10);
    return `
<div class="wrap"><section style="padding:30px 0">
  <div class="sec-h"><span class="ix">01</span><h2>Registro de peso</h2><div class="rule"></div></div>

  <!-- chart -->
  <div class="chart-card" style="margin-bottom:20px">
    <h3>Evolución del peso</h3>
    <p class="cap">Registros guardados</p>
    <div class="chart-wrap"><canvas id="peso-chart"></canvas></div>
  </div>

  <!-- form -->
  <div class="card" style="margin-bottom:20px">
    <div id="peso-edit-banner" style="display:none;font-size:12px;color:var(--amber);margin-bottom:12px;font-weight:600">
      ✏️ Editando registro — <button id="peso-cancel-edit" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:12px;text-decoration:underline">cancelar</button>
    </div>
    <form id="peso-form" style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end">
      <div style="flex:1;min-width:130px">
        <label style="font-family:'IBM Plex Mono';font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);display:block;margin-bottom:5px">Fecha</label>
        <input id="peso-fecha" type="date" value="${hoy}" required
          style="width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:9px 11px;color:var(--ink);font-size:14px;font-family:'Inter';outline:none">
      </div>
      <div style="flex:1;min-width:110px">
        <label style="font-family:'IBM Plex Mono';font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);display:block;margin-bottom:5px">Peso (kg)</label>
        <input id="peso-valor" type="number" step="0.1" min="20" max="300" placeholder="75.4" required
          style="width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:9px 11px;color:var(--ink);font-size:14px;font-family:'Inter';outline:none">
      </div>
      <div style="flex:2;min-width:160px">
        <label style="font-family:'IBM Plex Mono';font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);display:block;margin-bottom:5px">Nota (opcional)</label>
        <input id="peso-nota" type="text" placeholder="ej. en ayunas, con ropa..."
          style="width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:9px 11px;color:var(--ink);font-size:14px;font-family:'Inter';outline:none">
      </div>
      <button type="submit" id="peso-submit-btn"
        style="background:var(--navy, #C4973A);color:#000;border:none;border-radius:10px;padding:10px 22px;font-family:'IBM Plex Mono';font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;white-space:nowrap">
        Guardar
      </button>
    </form>
    <div id="peso-msg" style="margin-top:10px;font-size:12px;display:none"></div>
  </div>

  <!-- table -->
  <div class="card">
    <div id="peso-list"><p style="color:var(--muted);font-size:13px">Cargando...</p></div>
  </div>
</section></div>`;
  }

  /* ── load ── */
  async function loadPesos() {
    const r = await fetch(
      `${SB_URL}/rest/v1/peso_registro?paciente=eq.${encodeURIComponent(PATIENT.slug)}&order=fecha.asc`,
      { headers: HEADERS }
    );
    _pesos = r.ok ? (await r.json()) : [];
    renderList();
    renderChart();
  }

  /* ── render table ── */
  function renderList() {
    const el = document.getElementById('peso-list');
    if (!el) return;
    if (!_pesos.length) {
      el.innerHTML = '<p style="color:var(--muted);font-size:13px;font-style:italic">Sin registros aún. ¡Agrega tu primer peso!</p>';
      return;
    }
    const rows = [..._pesos].reverse().map(p => {
      const d = p.fecha.split('-'); const fecha = `${d[2]}/${d[1]}/${d[0]}`;
      return `<tr>
        <td style="font-family:'IBM Plex Mono';font-size:12px;color:var(--amber, #C4973A)">${fecha}</td>
        <td style="font-family:'IBM Plex Mono';font-size:14px;font-weight:700;color:var(--ink)">${parseFloat(p.peso).toFixed(1)} <span style="font-size:11px;color:var(--muted)">kg</span></td>
        <td style="font-size:12px;color:var(--muted)">${p.nota || '—'}</td>
        <td style="white-space:nowrap">
          <button onclick="window._pesoEdit(${p.id})" style="background:none;border:none;cursor:pointer;font-size:14px;padding:0 4px" title="Editar">✏️</button>
          <button onclick="window._pesoDel(${p.id})" style="background:none;border:none;cursor:pointer;font-size:14px;padding:0 4px" title="Eliminar">🗑️</button>
        </td>
      </tr>`;
    }).join('');
    el.innerHTML = `<div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr>
          <th style="text-align:left;padding:6px 10px;font-family:'IBM Plex Mono';font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);border-bottom:1px solid var(--line)">Fecha</th>
          <th style="text-align:left;padding:6px 10px;font-family:'IBM Plex Mono';font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);border-bottom:1px solid var(--line)">Peso</th>
          <th style="text-align:left;padding:6px 10px;font-family:'IBM Plex Mono';font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);border-bottom:1px solid var(--line)">Nota</th>
          <th style="border-bottom:1px solid var(--line)"></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }

  /* ── render chart ── */
  function renderChart() {
    const canvas = document.getElementById('peso-chart');
    if (!canvas || !window.Chart) return;
    if (_chart) { _chart.destroy(); _chart = null; }
    if (!_pesos.length) return;

    const labels = _pesos.map(p => { const d = p.fecha.split('-'); return `${d[2]}/${d[1]}`; });
    const vals   = _pesos.map(p => parseFloat(p.peso));
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--navy').trim() || '#C4973A';

    _chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Peso (kg)',
          data: vals,
          borderColor: accent,
          backgroundColor: accent + '18',
          borderWidth: 2.5,
          pointRadius: 5,
          pointBackgroundColor: accent,
          fill: true,
          tension: 0.3,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y.toFixed(1)} kg` } } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { color: '#888', font: { family: 'IBM Plex Mono', size: 11 } } },
          y: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { color: '#888', font: { family: 'IBM Plex Mono', size: 11 }, callback: v => v + ' kg' } }
        }
      }
    });
  }

  /* ── form submit ── */
  async function handleSubmit(e) {
    e.preventDefault();
    const fecha = document.getElementById('peso-fecha').value;
    const peso  = parseFloat(document.getElementById('peso-valor').value);
    const nota  = document.getElementById('peso-nota').value.trim();
    if (!fecha || isNaN(peso)) return;

    const btn = document.getElementById('peso-submit-btn');
    btn.disabled = true; btn.textContent = 'Guardando...';

    const body = { paciente: PATIENT.slug, fecha, peso, nota: nota || null };
    let ok = false;

    if (_editId) {
      const r = await fetch(`${SB_URL}/rest/v1/peso_registro?id=eq.${_editId}`, {
        method: 'PATCH', headers: { ...HEADERS, Prefer: 'return=minimal' }, body: JSON.stringify(body)
      });
      ok = r.ok;
    } else {
      const r = await fetch(`${SB_URL}/rest/v1/peso_registro`, {
        method: 'POST', headers: { ...HEADERS, Prefer: 'return=minimal' }, body: JSON.stringify(body)
      });
      ok = r.ok;
    }

    btn.disabled = false; btn.textContent = 'Guardar';
    showMsg(ok ? '✓ Guardado' : '✗ Error al guardar', ok);
    if (ok) { cancelEdit(); await loadPesos(); }
  }

  /* ── edit / delete ── */
  window._pesoEdit = function(id) {
    const p = _pesos.find(x => x.id === id);
    if (!p) return;
    _editId = id;
    document.getElementById('peso-fecha').value = p.fecha;
    document.getElementById('peso-valor').value = parseFloat(p.peso).toFixed(1);
    document.getElementById('peso-nota').value  = p.nota || '';
    document.getElementById('peso-edit-banner').style.display = 'block';
    document.getElementById('peso-submit-btn').textContent = 'Actualizar';
    document.getElementById('peso-fecha').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  window._pesoDel = async function(id) {
    if (!confirm('¿Eliminar este registro?')) return;
    const r = await fetch(`${SB_URL}/rest/v1/peso_registro?id=eq.${id}`, {
      method: 'DELETE', headers: HEADERS
    });
    if (r.ok) await loadPesos();
  };

  function cancelEdit() {
    _editId = null;
    document.getElementById('peso-edit-banner').style.display = 'none';
    document.getElementById('peso-submit-btn').textContent = 'Guardar';
    document.getElementById('peso-form').reset();
    document.getElementById('peso-fecha').value = new Date().toISOString().slice(0, 10);
  }

  function showMsg(txt, ok) {
    const el = document.getElementById('peso-msg');
    if (!el) return;
    el.textContent = txt;
    el.style.color = ok ? 'var(--green, #a5d6a7)' : 'var(--coral, #ef9a9a)';
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 2500);
  }

  boot();
})();
