/* ══════════════════════════════════════════════════════════════════════════
   PESTAÑA RECETARIO · recetas que cuadran con cada comida del plan
   ──────────────────────────────────────────────────────────────────────────
   Se carga al final de cada página de paciente, después de recetario-data.js.
   Mismo patrón que comer-fuera.js: lee el PATIENT de la página, inyecta una
   pestaña propia y trabaja contra el plan activo.

   Requiere: recetario-data.js (RECETARIO_CATALOG, RECETARIO_ALIMENTOS,
             RECETARIO_MOMENTOS) cargado antes.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var P = (typeof PATIENT !== 'undefined') ? PATIENT : (window.PATIENT || null);
  if (!P) return;
  if (typeof RECETARIO_CATALOG === 'undefined') return;

  // Igual que comer-fuera: hay planes con `comidas` directo y planes que las
  // agrupan en `planes` con selector de tipo de día.
  var USA_PLANES = !!(P.planes && P.planes.length);
  function planActivo() {
    if (!USA_PLANES) return null;
    var i = (typeof currentPlanIdx !== 'undefined' && currentPlanIdx != null) ? currentPlanIdx : 0;
    return P.planes[i] || P.planes[0];
  }
  function COMIDAS() { var pl = planActivo(); return (pl ? pl.comidas : P.comidas) || []; }
  if (!COMIDAS().length) return;

  var R   = RECETARIO_CATALOG;
  var A   = RECETARIO_ALIMENTOS;
  var MOM = (typeof RECETARIO_MOMENTOS !== 'undefined') ? RECETARIO_MOMENTOS : {};
  var TOL = 60;                       // margen de kcal para considerar que entra
  var $id = function (i) { return document.getElementById(i); };
  var r0  = function (n) { return Math.round(n); };
  var r1  = function (n) { return Math.round(n * 10) / 10; };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c];
    });
  }

  /* ── Macros por porción de cada receta ────────────────────────────────── */
  function macrosDe(rec) {
    if (rec.macrosManual) {
      var n0 = rec.porciones || 1, mm = rec.macrosManual;
      return { kcal:mm.kcal/n0, p:mm.p/n0, c:mm.c/n0, g:mm.g/n0 };
    }
    var t = { kcal:0, p:0, c:0, g:0 };
    (rec.ing || []).forEach(function (i) {
      var a = A[i.a]; if (!a) return;
      var f = i.g / 100;
      t.kcal += a.kcal*f; t.p += a.p*f; t.c += a.c*f; t.g += a.g*f;
    });
    var n = rec.porciones || 1;
    return { kcal:t.kcal/n, p:t.p/n, c:t.c/n, g:t.g/n };
  }
  R.forEach(function (rec) { if (!rec._m) rec._m = macrosDe(rec); });

  /* ── Ajustar una receta al presupuesto de una comida ──────────────────── */
  // Gramajes cocinables: nadie pesa 177.3 g de arroz.
  function gRound(g) {
    if (g >= 50) return Math.round(g / 5) * 5;
    if (g >= 10) return Math.round(g);
    return Math.round(g * 2) / 2;
  }

  // Devuelve cómo llevar la receta a `budget` kcal:
  //   escala    → receta de 1 porción: se reescriben los gramos
  //   porciones → receta que rinde varias: no se toca, se dice cuántas comer
  //   nope      → habría que deformarla demasiado (fuera de ×0.5–×3)
  // En modo escala los macros se recalculan DESDE los gramos ya redondeados,
  // así que el kcal que se muestra es el real, no el objetivo.
  var ajusteCache = {};
  function ajuste(rec, budget) {
    var key = rec.id + '|' + budget;
    if (ajusteCache[key]) return ajusteCache[key];
    var out, m = rec._m;
    if (!m.kcal || !budget) {
      out = { modo:'nope', k:1 };
    } else {
      var k = budget / m.kcal;
      if (k < 0.5 || k > 3) {
        out = { modo:'nope', k:k };
      } else if ((rec.porciones || 1) > 1) {
        var np = Math.round(k * 2) / 2;
        if (np < 0.5) np = 0.5;
        out = { modo:'porciones', k:np, kcal:m.kcal*np, p:m.p*np, c:m.c*np, g:m.g*np };
      } else {
        var ings = (rec.ing || []).map(function (i) {
          return { ref:i, g:gRound(i.g * k) };
        });
        var t = { kcal:0, p:0, c:0, g:0 };
        ings.forEach(function (x) {
          var a = A[x.ref.a]; if (!a) return;
          var f = x.g / 100;
          t.kcal += a.kcal*f; t.p += a.p*f; t.c += a.c*f; t.g += a.g*f;
        });
        out = { modo:'escala', k:k, ings:ings, kcal:t.kcal, p:t.p, c:t.c, g:t.g };
      }
    }
    ajusteCache[key] = out;
    return out;
  }

  /* ── Qué momento del día es cada comida del plan ──────────────────────── */
  // Los planes nombran las comidas con bastante consistencia (Desayuno,
  // Almuerzo, Cena, Snack, Pre Entreno), a veces con emoji delante.
  function momentoDe(nombre) {
    var n = String(nombre || '').toLowerCase();
    if (/pre.?entren|pre.?workout/.test(n))        return 'preentreno';
    if (/desayun|brunch/.test(n))                  return 'desayuno';
    if (/almuerz|lunch/.test(n))                   return 'principal';
    if (/cena|comida\s*2|dinner/.test(n))          return 'principal';
    if (/snack|media\s*ma|media\s*tard|lonche/.test(n)) return 'snack';
    if (/post.?entren/.test(n))                    return 'snack';
    return null;                                   // sin clasificar → se ofrece todo
  }

  /* ── CSS ──────────────────────────────────────────────────────────────── */
  function injectCSS() {
    if ($id('rpStyles')) return;
    var s = document.createElement('style');
    s.id = 'rpStyles';
    s.textContent = [
      '.rp-intro{font-size:13px;color:var(--muted);background:var(--panel2);border:1px dashed var(--line);border-radius:12px;padding:14px 16px;margin:6px 0 18px;line-height:1.6}',
      '.rp-intro b{color:var(--ink)}',
      '.rpdias{display:flex;flex-wrap:wrap;gap:9px;margin-bottom:14px}',
      '.rpdia{appearance:none;cursor:pointer;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:9px 14px;color:var(--muted);font-family:Inter,sans-serif;text-align:left;transition:.2s}',
      '.rpdia:hover{border-color:var(--muted);color:var(--ink)}',
      '.rpdia.active{border-color:var(--navy);background:var(--panel2)}',
      '.rpdia .rpdn{font-weight:600;font-size:13px;display:block;line-height:1.1}',
      '.rpdia .rpdk{font-family:"IBM Plex Mono",monospace;font-size:10.5px;margin-top:4px;display:block;color:var(--faint)}',
      '.rpdia.active .rpdn,.rpdia.active .rpdk{color:var(--navy)}',
      '.rpmeals{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px}',
      '.rpmeal{appearance:none;cursor:pointer;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:11px 15px;color:var(--muted);font-family:Inter,sans-serif;text-align:left;transition:.2s}',
      '.rpmeal:hover{border-color:var(--muted);color:var(--ink)}',
      '.rpmeal.active{border-color:var(--navy);background:var(--panel2)}',
      '.rpmeal .rpmn{font-weight:600;font-size:15px;display:block;line-height:1.1}',
      '.rpmeal .rpmk{font-family:"IBM Plex Mono",monospace;font-size:11px;margin-top:5px;display:block;color:var(--faint)}',
      '.rpmeal.active .rpmn,.rpmeal.active .rpmk{color:var(--navy)}',
      '.rpbudget{font-size:13px;color:var(--muted);margin:2px 0 14px}',
      '.rpbudget b{color:var(--navy)}',
      '.rpfilter{display:flex;align-items:center;gap:9px;font-size:12.5px;color:var(--muted);cursor:pointer;user-select:none;margin-bottom:14px}',
      '.rpfilter .rpmini{width:38px;height:22px;border-radius:99px;background:var(--bg);border:1px solid var(--line);position:relative;transition:.2s;flex-shrink:0}',
      '.rpfilter .rpmini i{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--faint);transition:.2s}',
      '.rpfilter.on .rpmini{background:rgba(165,214,167,.18);border-color:var(--green)}',
      '.rpfilter.on .rpmini i{transform:translateX(16px);background:var(--green)}',
      '.rpgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}',
      '.rpcard{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:15px 16px;cursor:pointer;transition:.18s;text-align:left;font-family:Inter,sans-serif;color:inherit;display:flex;flex-direction:column;gap:10px}',
      '.rpcard:hover{border-color:var(--navy);transform:translateY(-2px)}',
      '.rpctop{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}',
      '.rpcname{font-size:14.5px;font-weight:600;line-height:1.25;color:var(--ink)}',
      '.rpccat{font-family:"IBM Plex Mono",monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-top:4px}',
      '.rpckcal{font-family:"IBM Plex Mono",monospace;font-size:17px;font-weight:700;color:var(--navy);line-height:1;white-space:nowrap}',
      '.rpckcal small{display:block;font-size:8.5px;letter-spacing:.1em;color:var(--faint);font-weight:500;margin-top:3px;text-align:right}',
      '.rpmac{display:flex;gap:6px}',
      '.rpm{flex:1;background:var(--panel2);border-radius:7px;padding:6px 7px;text-align:center}',
      '.rpm b{display:block;font-family:"IBM Plex Mono",monospace;font-size:12.5px;font-weight:700;line-height:1.1}',
      '.rpm span{font-size:8.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}',
      '.rpm.p b{color:var(--green)}.rpm.c b{color:var(--cyan)}.rpm.g b{color:var(--coral)}',
      '.rpfit{font-family:"IBM Plex Mono",monospace;font-size:9.5px;letter-spacing:.07em;text-transform:uppercase;padding:4px 9px;border-radius:5px;align-self:flex-start}',
      '.rpfit.done{background:rgba(196,151,58,.14);color:var(--navy);border:1px solid rgba(196,151,58,.4);font-weight:700}',
      '.rpfit.in{background:rgba(165,214,167,.1);color:var(--green);border:1px solid rgba(165,214,167,.28)}',
      '.rpfit.over{background:rgba(239,83,80,.09);color:var(--coral);border:1px solid rgba(239,83,80,.25)}',
      '.rpsec{font-family:"IBM Plex Mono",monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin:26px 0 12px;display:flex;align-items:center;gap:10px}',
      '.rpsec::after{content:"";flex:1;height:1px;background:var(--line)}',
      '.rpempty{color:var(--faint);font-size:13px;padding:26px 0;text-align:center}',
      /* Ficha */
      '.rpov{position:fixed;inset:0;background:rgba(0,0,0,.84);backdrop-filter:blur(4px);z-index:9000;display:none;overflow-y:auto;padding:26px 14px}',
      '.rpov.on{display:block}',
      '.rpmodal{max-width:700px;margin:0 auto;background:var(--bg2,#111);border:1px solid var(--line);border-radius:17px;overflow:hidden}',
      '.rphead{padding:22px 26px 18px;border-bottom:1px solid var(--line);position:relative;background:var(--panel)}',
      '.rphead .rphc{font-family:"IBM Plex Mono",monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--navy)}',
      '.rphead h3{font-family:"Chakra Petch",sans-serif;font-size:clamp(20px,4vw,27px);font-weight:700;color:#fff;margin:7px 0 0;line-height:1.14;padding-right:44px}',
      '.rphead .rphm{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:9px;font-size:12.5px;color:var(--muted)}',
      '.rpx{position:absolute;top:18px;right:20px;width:32px;height:32px;border-radius:9px;border:1px solid var(--line);background:var(--panel2);color:var(--muted);font-size:20px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center}',
      '.rpx:hover{border-color:var(--coral2);color:var(--coral2)}',
      '.rpbody{padding:22px 26px 28px}',
      '.rpblock{margin-bottom:24px}.rpblock:last-child{margin-bottom:0}',
      '.rpbt{font-family:"IBM Plex Mono",monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);margin-bottom:11px;display:flex;align-items:center;gap:10px}',
      '.rpbt::after{content:"";flex:1;height:1px;background:var(--line)}',
      '.rptot{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}',
      '.rptot div{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px 8px;text-align:center}',
      '.rptot div b{display:block;font-family:"IBM Plex Mono",monospace;font-size:18px;font-weight:700;line-height:1.05}',
      '.rptot div span{font-size:9px;letter-spacing:.09em;text-transform:uppercase;color:var(--faint)}',
      '.rptot .k b{color:var(--navy)}.rptot .pp b{color:var(--green)}.rptot .cc b{color:var(--cyan)}.rptot .gg b{color:var(--coral)}',
      '.rping{width:100%;border-collapse:collapse;font-size:13px}',
      '.rping td{padding:8px 0 8px 12px;border-bottom:1px solid var(--line);text-align:right;font-family:"IBM Plex Mono",monospace;font-size:12px;color:var(--muted);white-space:nowrap}',
      '.rping td:first-child{text-align:left;padding-left:0;font-family:Inter,sans-serif;font-size:13px;color:var(--ink);white-space:normal}',
      '.rping tr:last-child td{border-bottom:none}',
      '.rpest{display:inline-block;margin-left:6px;font-family:"IBM Plex Mono",monospace;font-size:9px;color:var(--amber);border:1px solid rgba(196,151,58,.35);background:rgba(196,151,58,.09);border-radius:4px;padding:1px 5px}',
      '.rplibre{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}',
      '.rplibre span{font-size:11.5px;color:var(--muted);background:var(--panel2);border:1px solid var(--line);border-radius:6px;padding:4px 9px}',
      '.rppasos{list-style:none;counter-reset:rs;padding:0;margin:0}',
      '.rppasos li{counter-increment:rs;position:relative;padding:0 0 13px 36px;font-size:13.5px;color:var(--ink);line-height:1.58}',
      '.rppasos li::before{content:counter(rs,decimal-leading-zero);position:absolute;left:0;top:1px;font-family:"IBM Plex Mono",monospace;font-size:10.5px;font-weight:600;color:var(--navy);border:1px solid var(--line);background:var(--panel);border-radius:7px;width:25px;height:23px;display:flex;align-items:center;justify-content:center}',
      '.rppasos li:last-child{padding-bottom:0}',
      '.rpnote{font-size:12.5px;color:var(--muted);background:var(--panel);border:1px dashed var(--line);border-left:2px solid var(--amber);border-radius:10px;padding:12px 15px;line-height:1.6}',
      '.rptip{font-size:12.5px;color:var(--muted);background:rgba(165,214,167,.06);border:1px solid rgba(165,214,167,.22);border-radius:10px;padding:12px 15px;line-height:1.6}',
      '.rptip b{color:var(--green)}',
      '@media(max-width:640px){.rpgrid{grid-template-columns:1fr}.rptot{grid-template-columns:repeat(2,1fr)}.rping .rpmc{display:none}.rphead,.rpbody{padding-left:18px;padding-right:18px}}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── Estado ───────────────────────────────────────────────────────────── */
  var st = { mealId: null, soloEntran: true };

  function comidasConKcal() {
    return COMIDAS().filter(function (m) { return m.kcal != null; });
  }

  /* ── Pestaña ──────────────────────────────────────────────────────────── */
  function addTab() {
    var nav = $id('tabNav'), panels = $id('tabPanels');
    if (!nav || !panels || $id('tab-recetario')) return false;
    var n = nav.querySelectorAll('.tab').length + 1;
    var btn = document.createElement('button');
    btn.className = 'tab'; btn.id = 'rpTabBtn';
    btn.innerHTML = '<span class="tnum">' + (n < 10 ? '0' : '') + n + '</span> Recetario';
    btn.addEventListener('click', function () {
      if (typeof showTab === 'function') showTab('recetario', btn);
      else {
        var ps = document.querySelectorAll('.panel'), ts = document.querySelectorAll('.tab');
        for (var i = 0; i < ps.length; i++) ps[i].classList.remove('active');
        for (var j = 0; j < ts.length; j++) ts[j].classList.remove('active');
        $id('tab-recetario').classList.add('active'); btn.classList.add('active');
      }
      render();
    });
    nav.appendChild(btn);
    var p = document.createElement('div');
    p.id = 'tab-recetario'; p.className = 'panel';
    panels.appendChild(p);
    return true;
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  function render() {
    var panel = $id('tab-recetario'); if (!panel) return;
    var meals = comidasConKcal();
    if (!meals.length) {
      panel.innerHTML = '<section><div class="rpempty">Este plan no tiene kcal por comida, así que no se puede calcular qué receta entra.</div></section>';
      return;
    }
    if (!st.mealId || !meals.filter(function (m) { return m.id === st.mealId; }).length) {
      st.mealId = meals[0].id;
    }
    var meal = meals.filter(function (m) { return m.id === st.mealId; })[0];
    var budget = meal.kcal || 0;
    var momento = momentoDe(meal.nombre);

    // Selector de tipo de día (solo si el plan los tiene)
    var diasHtml = '';
    if (USA_PLANES) {
      var act = planActivo();
      diasHtml = '<div class="rpdias">' + P.planes.map(function (pl, i) {
        var on = pl === act;
        return '<button class="rpdia' + (on ? ' active' : '') + '" data-pidx="' + i + '">' +
          '<span class="rpdn">' + esc(pl.label) + '</span>' +
          '<span class="rpdk">' + (pl.macros && pl.macros.kcal ? pl.macros.kcal + ' kcal' : esc(pl.sub || '')) + '</span></button>';
      }).join('') + '</div>';
    }

    var mealsHtml = meals.map(function (m) {
      return '<button class="rpmeal' + (m.id === st.mealId ? ' active' : '') + '" data-mid="' + esc(m.id) + '">' +
        '<span class="rpmn">' + esc(m.nombre) + '</span>' +
        '<span class="rpmk">~' + m.kcal + ' kcal</span></button>';
    }).join('');

    // Recetas candidatas: las que pertenecen al momento de esta comida.
    // Si el nombre de la comida no se pudo clasificar, se ofrecen todas las
    // que no sean acompañamiento, en vez de dejar la pestaña vacía.
    var comidas = [], acompanan = [];
    R.forEach(function (rec) {
      var moms = MOM[rec.id] || [];
      var soloAcompana = moms.length === 1 && moms[0] === 'acompana';
      if (moms.indexOf('acompana') >= 0) acompanan.push(rec);
      if (soloAcompana) return;                       // nunca como comida
      if (momento && moms.indexOf(momento) < 0) return;
      comidas.push(rec);
    });

    var vis = comidas.filter(function (rec) {
      return !st.soloEntran || ajuste(rec, budget).modo !== 'nope';
    });
    // Las que menos hay que tocar primero: una receta que ya cae casi en el
    // presupuesto es mejor opción que una que hay que doblar.
    vis.sort(function (a, b) {
      return Math.abs(Math.log(ajuste(a, budget).k || 1)) -
             Math.abs(Math.log(ajuste(b, budget).k || 1));
    });

    function card(rec, pres) {
      var aj = pres ? ajuste(rec, pres) : null;
      var m  = (aj && aj.modo !== 'nope') ? aj : rec._m;
      var fitHtml = '';
      if (aj) {
        if (aj.modo === 'escala') {
          var pct = Math.abs(aj.k - 1) < 0.03
            ? 'Tal cual · ' + r0(aj.kcal) + ' kcal'
            : 'Ajustada ×' + (Math.round(aj.k * 100) / 100) + ' · ' + r0(aj.kcal) + ' kcal';
          fitHtml = '<span class="rpfit done">' + pct + '</span>';
        } else if (aj.modo === 'porciones') {
          fitHtml = '<span class="rpfit in">Come ' + aj.k +
            (aj.k === 1 ? ' porción' : ' porciones') + ' · ' + r0(aj.kcal) + ' kcal</span>';
        } else {
          fitHtml = '<span class="rpfit over">Muy lejos del presupuesto</span>';
        }
      }
      return '<button class="rpcard" data-rid="' + esc(rec.id) + '">' +
        '<div class="rpctop"><div><div class="rpcname">' + esc(rec.name) + '</div>' +
        '<div class="rpccat">' + esc(rec.cat) + (rec.t ? ' · ' + rec.t + ' min' : '') + '</div></div>' +
        '<div class="rpckcal">' + r0(m.kcal) + '<small>KCAL</small></div></div>' +
        '<div class="rpmac">' +
          '<div class="rpm p"><b>' + r1(m.p) + '</b><span>Prot</span></div>' +
          '<div class="rpm c"><b>' + r1(m.c) + '</b><span>Carb</span></div>' +
          '<div class="rpm g"><b>' + r1(m.g) + '</b><span>Gras</span></div>' +
        '</div>' + fitHtml + '</button>';
    }

    var listaHtml = vis.length
      ? '<div class="rpgrid">' + vis.map(function (r) { return card(r, budget); }).join('') + '</div>'
      : '<div class="rpempty">Ninguna receta se puede ajustar a ' + budget + ' kcal sin deformarla. Desactiva «solo las que entran» para verlas todas.</div>';

    // Los acompañamientos no se escalan: van en su cantidad original.
    var acompHtml = acompanan.length
      ? '<div class="rpsec">Para acompañar · aliños, salsas y bebidas</div>' +
        '<div class="rpgrid">' + acompanan.map(function (r) { return card(r, null); }).join('') + '</div>'
      : '';

    panel.innerHTML = '<section>' +
      '<div class="rp-intro">Elige una comida del plan y te muestro las recetas del recetario con las ' +
      '<b>cantidades ya ajustadas</b> a sus calorías. El <b style="color:var(--navy)">×1.2</b> de cada tarjeta ' +
      'es cuánto se agrandó la receta original. Toca cualquiera para ver los gramos exactos y la preparación.</div>' +
      diasHtml +
      '<div class="rpmeals">' + mealsHtml + '</div>' +
      '<div class="rpbudget">Presupuesto de <b>' + esc(meal.nombre) + '</b>: <b>~' + budget + ' kcal</b>' +
        (momento ? '' : ' <span style="color:var(--faint)">(no se pudo identificar el momento del día: se muestran todas)</span>') +
      '</div>' +
      '<div class="rpfilter' + (st.soloEntran ? ' on' : '') + '" id="rpTog">' +
        '<span class="rpmini"><i></i></span> Mostrar solo las que entran en el presupuesto</div>' +
      listaHtml + acompHtml +
      '</section>';

    panel.querySelectorAll('.rpdia').forEach(function (b) {
      b.onclick = function () {
        var i = +b.getAttribute('data-pidx');
        if (typeof window.setPlan === 'function') window.setPlan(i);
        else if (typeof currentPlanIdx !== 'undefined') { try { currentPlanIdx = i; } catch (e) {} }
        st.mealId = null;
        render();
      };
    });
    panel.querySelectorAll('.rpmeal').forEach(function (b) {
      b.onclick = function () { st.mealId = b.getAttribute('data-mid'); render(); };
    });
    var tog = $id('rpTog');
    if (tog) tog.onclick = function () { st.soloEntran = !st.soloEntran; render(); };
    panel.querySelectorAll('.rpcard').forEach(function (b) {
      // Las tarjetas de acompañamiento no llevan presupuesto: van sin ajustar.
      var esAcomp = !!b.closest('.rpgrid').previousElementSibling &&
                    b.closest('.rpgrid').previousElementSibling.classList.contains('rpsec');
      b.onclick = function () {
        abrir(b.getAttribute('data-rid'), esAcomp ? null : budget, meal.nombre);
      };
    });
  }

  /* ── Ficha de receta ──────────────────────────────────────────────────── */
  function overlay() {
    var ov = $id('rpOv');
    if (ov) return ov;
    ov = document.createElement('div');
    ov.id = 'rpOv'; ov.className = 'rpov';
    ov.innerHTML = '<div class="rpmodal" id="rpModal"></div>';
    ov.addEventListener('click', function (e) { if (e.target === ov) cerrar(); });
    document.body.appendChild(ov);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ov.classList.contains('on')) cerrar();
    });
    return ov;
  }
  function cerrar() {
    var ov = $id('rpOv');
    if (ov) ov.classList.remove('on');
    document.body.style.overflow = '';
  }

  function abrir(id, budget, mealNombre) {
    var rec = R.filter(function (x) { return x.id === id; })[0];
    if (!rec) return;
    var ov = overlay(), base = rec.porciones || 1;
    var aj = budget ? ajuste(rec, budget) : null;
    var escalada = aj && aj.modo === 'escala';
    var m = (aj && aj.modo !== 'nope') ? aj : rec._m;

    // Si la receta se escaló, la tabla muestra los gramos ajustados y deja el
    // original al lado, para que se vea qué se cambió y no parezca otra receta.
    var filas = (rec.ing || []).map(function (i, idx) {
      var a = A[i.a]; if (!a) return '';
      var gUsa = escalada ? aj.ings[idx].g : i.g;
      var f = gUsa / 100;
      var reescalado = escalada && gUsa !== i.g;
      var cambio = reescalado
        ? ' <span style="color:var(--faint);font-size:11px">(antes ' + (i.g % 1 ? r1(i.g) : r0(i.g)) + ')</span>'
        : '';
      // El descriptor ("1 unidad", "2 rebanadas") cuenta la cantidad ORIGINAL:
      // al reescalar deja de ser cierto, así que se oculta.
      return '<tr><td>' + esc(a.n) +
        (i.d && !reescalado ? ' <span style="color:var(--faint);font-size:11.5px">· ' + esc(i.d) + '</span>' : '') +
        (i.e ? '<span class="rpest">est</span>' : '') + '</td>' +
        '<td>' + (gUsa % 1 ? r1(gUsa) : r0(gUsa)) + ' g' + cambio + '</td>' +
        '<td style="color:var(--ink);font-weight:600">' + r0(a.kcal*f) + '</td>' +
        '<td class="rpmc">' + r1(a.p*f) + '</td>' +
        '<td class="rpmc">' + r1(a.c*f) + '</td>' +
        '<td class="rpmc">' + r1(a.g*f) + '</td></tr>';
    }).join('');

    var ajusteHtml = '';
    if (aj && aj.modo === 'escala' && Math.abs(aj.k - 1) >= 0.03) {
      ajusteHtml = '<div class="rpblock"><div class="rpnote">Cantidades <b>ajustadas a ' +
        esc(mealNombre || 'esta comida') + '</b> (×' + (Math.round(aj.k*100)/100) +
        '). Se redondearon a gramajes cocinables, por eso el total queda en ' +
        r0(aj.kcal) + ' kcal y no exactamente en ' + budget + '.</div></div>';
    } else if (aj && aj.modo === 'porciones') {
      ajusteHtml = '<div class="rpblock"><div class="rpnote">Esta receta rinde ' + base +
        ' porciones, así que no se tocan las cantidades: para <b>' + esc(mealNombre || 'esta comida') +
        '</b> come <b>' + aj.k + (aj.k === 1 ? ' porción' : ' porciones') + '</b> (' + r0(aj.kcal) + ' kcal).</div></div>';
    } else if (aj && aj.modo === 'nope') {
      ajusteHtml = '<div class="rpblock"><div class="rpnote">Esta receta queda muy lejos del presupuesto de ' +
        esc(mealNombre || 'esta comida') + ', así que se muestra <b>sin ajustar</b>.</div></div>';
    }

    $id('rpModal').innerHTML =
      '<div class="rphead">' +
        '<button class="rpx" id="rpX" aria-label="Cerrar">&times;</button>' +
        '<div class="rphc">' + esc(rec.cat) + '</div>' +
        '<h3>' + esc(rec.name) + '</h3>' +
        '<div class="rphm">' +
          (rec.t ? '<span>⏱ ' + rec.t + ' min</span>' : '') +
          '<span>Rinde ' + base + (base === 1 ? ' porción' : ' porciones') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="rpbody">' +
        '<div class="rpblock"><div class="rpbt">' +
          (escalada ? 'Ajustada a ' + esc(mealNombre || 'esta comida') : 'Por porción') + '</div>' +
          '<div class="rptot">' +
            '<div class="k"><b>' + r0(m.kcal) + '</b><span>kcal</span></div>' +
            '<div class="pp"><b>' + r1(m.p) + '</b><span>proteína g</span></div>' +
            '<div class="cc"><b>' + r1(m.c) + '</b><span>carbos g</span></div>' +
            '<div class="gg"><b>' + r1(m.g) + '</b><span>grasas g</span></div>' +
          '</div></div>' +
        ajusteHtml +
        (rec.nota ? '<div class="rpblock"><div class="rpnote">' + esc(rec.nota) + '</div></div>' : '') +
        (filas ? '<div class="rpblock"><div class="rpbt">Ingredientes</div>' +
          '<table class="rping"><tbody>' + filas + '</tbody></table>' +
          ((rec.libre || []).length
            ? '<div class="rplibre">' + rec.libre.map(function (l) { return '<span>' + esc(l) + '</span>'; }).join('') + '</div>'
            : '') + '</div>' : '') +
        '<div class="rpblock"><div class="rpbt">Preparación</div>' +
          '<ol class="rppasos">' + (rec.pasos || []).map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol></div>' +
        (rec.tip ? '<div class="rpblock"><div class="rptip"><b>Tip.</b> ' + esc(rec.tip) + '</div></div>' : '') +
      '</div>';

    $id('rpX').onclick = cerrar;
    ov.classList.add('on');
    document.body.style.overflow = 'hidden';
  }

  /* ── Arranque ─────────────────────────────────────────────────────────── */
  function boot() {
    injectCSS();
    addTab();
    // El motor de algunas páginas re-renderiza el plan después de este boot.
    [300, 900, 1800].forEach(function (t) {
      setTimeout(function () { if (!$id('tab-recetario')) addTab(); }, t);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 80); });
  } else setTimeout(boot, 80);
})();
