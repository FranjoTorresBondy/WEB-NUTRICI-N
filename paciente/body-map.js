/* ══════════════════════════════════════════════════════════════════════════
   MÓDULO COMPARTIDO · Mapa corporal (Evaluación)
   Dibuja una figura humana con la ubicación de cada pliegue (mm) y perímetro
   (cm) medido, con sus valores, toggle Pliegues/Perímetros y resumen de
   composición (Faulkner). Lee PATIENT.antro. Se inyecta en #tab-eval.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var P = (typeof PATIENT !== 'undefined') ? PATIENT : (window.PATIENT || null);
  if (!P) return;
  var A = P.antro;
  if (Array.isArray(A)) A = A[A.length - 1];
  if (!A || typeof A !== 'object') return;

  var $id = function (i) { return document.getElementById(i); };
  var has = function (v) { return v != null && !isNaN(parseFloat(v)); };

  // ── Definición de puntos sobre la figura (viewBox 0 0 320 560) ──
  // side: 'l' etiqueta a la izquierda, 'r' a la derecha
  var PLIEGUES = [
    { key: 'tri',    label: 'Tricipital',   x: 90,  y: 182, side: 'l' },
    { key: 'bi',     label: 'Bicipital',    x: 106, y: 150, side: 'l' },
    { key: 'sub',    label: 'Subescapular', x: 142, y: 136, side: 'r' },
    { key: 'supra',  label: 'Supraespinal', x: 146, y: 252, side: 'r' },
    { key: 'cresta', label: 'Cresta ilíaca',x: 126, y: 238, side: 'l' },
    { key: 'abd',    label: 'Abdominal',    x: 152, y: 230, side: 'r' },
    { key: 'pierna', label: 'Muslo (frente)',x: 138, y: 376, side: 'l' },
    { key: 'pant',   label: 'Pantorrilla',  x: 138, y: 478, side: 'l' }
  ];
  var PERIMS = [
    { key: 'brazRelaj', label: 'Brazo relajado',  x: 95,  y: 162, band: [84, 106] },
    { key: 'brazFlex',  label: 'Brazo flexionado',x: 95,  y: 190, band: [84, 106] },
    { key: 'abdom',     label: 'Cintura / abdomen',x: 160, y: 246, band: [123, 197] },
    { key: 'cadera',    label: 'Cadera',          x: 160, y: 306, band: [114, 206] },
    { key: 'muslo',     label: 'Muslo',           x: 139, y: 372, band: [122, 156] },
    { key: 'pantPer',   label: 'Pantorrilla',     x: 139, y: 478, band: [122, 156] }
  ];

  var FIGURE =
    '<ellipse cx="160" cy="46" rx="25" ry="29"/>' +
    '<rect x="151" y="72" width="18" height="16" rx="4"/>' +
    '<path d="M112,92 L208,92 L196,250 L206,312 L166,318 L160,300 L154,318 L114,312 L124,250 Z"/>' +
    '<rect x="84" y="96" width="22" height="212" rx="11"/>' +
    '<rect x="214" y="96" width="22" height="212" rx="11"/>' +
    '<rect x="122" y="316" width="34" height="226" rx="16"/>' +
    '<rect x="164" y="316" width="34" height="226" rx="16"/>' +
    '<ellipse cx="139" cy="548" rx="18" ry="9"/>' +
    '<ellipse cx="181" cy="548" rx="18" ry="9"/>';

  var mode = 'pliegues', active = -1;

  function injectCSS() {
    if ($id('bmStyles')) return;
    var s = document.createElement('style');
    s.id = 'bmStyles';
    s.textContent = [
      '.bmcard{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:20px 22px;box-shadow:var(--shadow);margin-bottom:22px}',
      '.bmhead{display:flex;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px}',
      '.bmhead h3{font-family:"Libre Franklin",sans-serif;font-weight:600;font-size:16px;color:var(--ink)}',
      '.bmtog{margin-left:auto;display:flex;gap:6px;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:3px}',
      '.bmtog button{appearance:none;cursor:pointer;background:none;border:none;border-radius:8px;padding:7px 14px;font-family:Inter,sans-serif;font-size:12.5px;font-weight:600;color:var(--muted);transition:.15s}',
      '.bmtog button.on{background:var(--navy);color:#000}',
      '.bmwrap{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}',
      '.bmfig{flex:0 0 210px;max-width:210px}',
      '.bmfig svg{width:100%;height:auto;display:block}',
      '.bm-body{fill:var(--panel2);stroke:var(--line);stroke-width:2}',
      '.bm-band{stroke:var(--navy);stroke-width:2;stroke-dasharray:4 3;opacity:.55}',
      '.bmdot{fill:var(--bg);stroke:var(--navy);stroke-width:2;cursor:pointer;transition:.15s}',
      '.bmdot.on{fill:var(--navy)}',
      '.bmnum{font-family:"IBM Plex Mono",monospace;font-size:11px;font-weight:700;fill:var(--navy);pointer-events:none}',
      '.bmnum.on{fill:#000}',
      '.bmleg{flex:1;min-width:220px}',
      '.bmrow{display:flex;align-items:center;gap:12px;padding:9px 10px;border-radius:9px;cursor:pointer;transition:.15s;border:1px solid transparent}',
      '.bmrow:hover{background:var(--bg2)}',
      '.bmrow.on{background:rgba(196,151,58,.1);border-color:rgba(196,151,58,.35)}',
      '.bmrow .bi{width:22px;height:22px;flex-shrink:0;border-radius:50%;border:1.5px solid var(--navy);display:flex;align-items:center;justify-content:center;font-family:"IBM Plex Mono",monospace;font-size:11px;font-weight:700;color:var(--navy)}',
      '.bmrow.on .bi{background:var(--navy);color:#000}',
      '.bmrow .bn{flex:1;min-width:0;font-size:13px;color:var(--ink)}',
      '.bmrow .bv{font-family:"IBM Plex Mono",monospace;font-size:14px;font-weight:700;color:var(--ink);white-space:nowrap}',
      '.bmrow .bv small{font-size:10px;color:var(--muted);font-weight:500;margin-left:2px}',
      '.bmchips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;padding-top:16px;border-top:1px solid var(--line)}',
      '.bmchip{background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:8px 12px;min-width:84px}',
      '.bmchip .cl{font-family:"IBM Plex Mono",monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}',
      '.bmchip .cv{font-family:"Libre Franklin",sans-serif;font-size:18px;font-weight:700;color:var(--navy);margin-top:3px}',
      '.bmchip .cv small{font-size:11px;color:var(--muted);font-weight:500}',
      '.bmnote{font-size:11px;color:var(--faint);margin-top:12px;font-style:italic}',
      '@media(max-width:560px){.bmwrap{gap:14px}.bmfig{flex-basis:150px;max-width:150px;margin:0 auto}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function fmt(v, unit) {
    var n = parseFloat(v);
    var t = (Math.abs(n - Math.round(n)) < 0.05) ? String(Math.round(n)) : n.toFixed(1);
    return t + ' <small>' + unit + '</small>';
  }

  function items() {
    var list = (mode === 'pliegues') ? PLIEGUES : PERIMS;
    return list.filter(function (m) { return has(A[m.key]); });
  }

  function compChips() {
    var chips = [];
    if (has(A.tri) && has(A.sub) && has(A.supra) && has(A.abd) && has(A.peso)) {
      var s4 = parseFloat(A.tri) + parseFloat(A.sub) + parseFloat(A.supra) + parseFloat(A.abd);
      var pg = 5.783 + 0.153 * s4;
      var mg = parseFloat(A.peso) * pg / 100;
      var mm = parseFloat(A.peso) - mg;
      chips.push(['% Grasa', pg.toFixed(1), '%']);
      chips.push(['Masa grasa', mg.toFixed(1), 'kg']);
      chips.push(['Masa magra', mm.toFixed(1), 'kg']);
    }
    var s6keys = ['tri', 'sub', 'supra', 'abd', 'pierna', 'pant'];
    if (s6keys.every(function (k) { return has(A[k]); })) {
      var s6 = s6keys.reduce(function (a, k) { return a + parseFloat(A[k]); }, 0);
      chips.push(['Σ6 pliegues', s6.toFixed(1), 'mm']);
      if (has(A.bi) && has(A.cresta)) chips.push(['Σ8 pliegues', (s6 + parseFloat(A.bi) + parseFloat(A.cresta)).toFixed(1), 'mm']);
    }
    if (has(A.imc)) chips.push(['IMC', parseFloat(A.imc).toFixed(1), '']);
    return chips;
  }

  function render() {
    var card = $id('bodyMapCard'); if (!card) return;
    var its = items();
    if (active >= its.length) active = -1;
    var unit = (mode === 'pliegues') ? 'mm' : 'cm';

    // SVG markers
    var bands = '', dots = '';
    its.forEach(function (m, i) {
      var on = (i === active);
      if (mode === 'perimetros' && m.band) {
        bands += '<line class="bm-band" x1="' + m.band[0] + '" y1="' + m.y + '" x2="' + m.band[1] + '" y2="' + m.y + '"/>';
      }
      dots += '<circle class="bmdot' + (on ? ' on' : '') + '" data-i="' + i + '" cx="' + m.x + '" cy="' + m.y + '" r="' + (on ? 11 : 9) + '"/>' +
              '<text class="bmnum' + (on ? ' on' : '') + '" x="' + m.x + '" y="' + (m.y + 4) + '" text-anchor="middle">' + (i + 1) + '</text>';
    });

    var svg = '<svg viewBox="0 0 320 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa corporal">' +
      '<g class="bm-body">' + FIGURE + '</g>' + bands + dots + '</svg>';

    // Legend
    var leg = its.map(function (m, i) {
      return '<div class="bmrow' + (i === active ? ' on' : '') + '" data-i="' + i + '">' +
        '<span class="bi">' + (i + 1) + '</span>' +
        '<span class="bn">' + m.label + '</span>' +
        '<span class="bv">' + fmt(A[m.key], unit) + '</span></div>';
    }).join('') || '<div class="bmnote">No hay datos de ' + (mode === 'pliegues' ? 'pliegues' : 'perímetros') + ' para este paciente.</div>';

    var chips = compChips().map(function (c) {
      return '<div class="bmchip"><div class="cl">' + c[0] + '</div><div class="cv">' + c[1] + ' <small>' + c[2] + '</small></div></div>';
    }).join('');

    card.innerHTML =
      '<div class="bmhead"><h3>Mapa corporal</h3>' +
        '<div class="bmtog">' +
          '<button data-mode="pliegues" class="' + (mode === 'pliegues' ? 'on' : '') + '">Pliegues</button>' +
          '<button data-mode="perimetros" class="' + (mode === 'perimetros' ? 'on' : '') + '">Perímetros</button>' +
        '</div></div>' +
      '<div class="bmwrap"><div class="bmfig">' + svg + '</div><div class="bmleg">' + leg + '</div></div>' +
      (chips ? '<div class="bmchips">' + chips + '</div>' : '') +
      '<div class="bmnote">Toca un punto o una fila para resaltar dónde se mide. ' +
        (mode === 'pliegues' ? 'Pliegues cutáneos en mm (lado derecho, protocolo ISAK).' : 'Perímetros en cm.') + '</div>';

    card.querySelectorAll('.bmtog button').forEach(function (b) {
      b.onclick = function () { mode = b.getAttribute('data-mode'); active = -1; render(); };
    });
    var sel = function (el) { var i = +el.getAttribute('data-i'); active = (active === i) ? -1 : i; render(); };
    card.querySelectorAll('.bmrow').forEach(function (r) { r.onclick = function () { sel(r); }; });
    card.querySelectorAll('.bmdot').forEach(function (d) { d.onclick = function () { sel(d); }; });
  }

  function evalPanel() {
    var p = $id('tab-eval');
    if (p) return p;
    // fallback: panel que contenga la tabla de pliegues
    var panels = document.querySelectorAll('.panel');
    for (var i = 0; i < panels.length; i++) {
      if (/Pliegues|Antropometr/i.test(panels[i].textContent)) return panels[i];
    }
    return null;
  }

  function inject() {
    if ($id('bodyMapCard')) return true;
    var panel = evalPanel(); if (!panel) return false;
    var host = panel.querySelector('.wrap') || panel;
    var card = document.createElement('div');
    card.id = 'bodyMapCard'; card.className = 'bmcard';
    if (host.firstChild) host.insertBefore(card, host.firstChild);
    else host.appendChild(card);
    // si insertamos dentro de .wrap>section, mejor colocarlo antes de la primera section
    render();
    return true;
  }

  function boot() {
    injectCSS();
    inject();
    [250, 700, 1500].forEach(function (t) { setTimeout(inject, t); });
    var root = $id('tabPanels') || document.body;
    if (window.MutationObserver) {
      var mo = new MutationObserver(function () {
        if (mo._b) return; mo._b = true;
        setTimeout(function () { if (!$id('bodyMapCard')) inject(); mo._b = false; }, 0);
      });
      mo.observe(root, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 80); });
  else setTimeout(boot, 80);
})();
