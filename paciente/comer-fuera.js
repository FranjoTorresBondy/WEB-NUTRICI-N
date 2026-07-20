/* ══════════════════════════════════════════════════════════════════════════
   MÓDULO COMPARTIDO · Comer Fuera + Progreso diario + Tope por grupo
   Se carga al final de cada página de paciente (después del motor inline).
   Trabaja sobre el DOM renderizado, por eso funciona en todas las variantes
   del motor. Requiere: guia-data.js (GUIA_CATALOG) cargado antes.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var P = (typeof PATIENT !== 'undefined') ? PATIENT : (window.PATIENT || null);
  if (!P || !P.comidas || !P.comidas.length) return;              // no aplica

  var CAT = (typeof GUIA_CATALOG !== 'undefined') ? GUIA_CATALOG : [];
  var TOL = 50;
  var $id = function (i) { return document.getElementById(i); };

  /* ── CSS ──────────────────────────────────────────────────────────────── */
  function injectCSS() {
    if ($id('cfStyles')) return;
    var s = document.createElement('style');
    s.id = 'cfStyles';
    s.textContent = [
      '.fuera-intro{font-size:13px;color:var(--muted);background:var(--panel2);border:1px dashed var(--line);border-radius:12px;padding:14px 16px;margin:6px 0 18px;line-height:1.6}',
      '.fuera-intro b{color:var(--ink)}',
      '.fmeals{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px}',
      '.fmeal{appearance:none;cursor:pointer;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:11px 15px;color:var(--muted);font-family:Inter,sans-serif;text-align:left;transition:.2s}',
      '.fmeal:hover{border-color:var(--muted);color:var(--ink)}',
      '.fmeal.active{border-color:var(--navy);background:var(--panel2)}',
      '.fmeal .fmn{font-weight:600;font-size:15px;display:block;line-height:1.1}',
      '.fmeal .fmk{font-family:"IBM Plex Mono",monospace;font-size:11px;margin-top:5px;display:block;color:var(--faint)}',
      '.fmeal.active .fmn,.fmeal.active .fmk{color:var(--navy)}',
      '.fbudget{font-size:13px;color:var(--muted);margin:2px 0 16px}',
      '.fbudget b{color:var(--navy)}',
      '.fchips{display:flex;gap:8px;overflow-x:auto;padding-bottom:12px;scrollbar-width:none}',
      '.fchips::-webkit-scrollbar{display:none}',
      '.fchip{appearance:none;cursor:pointer;white-space:nowrap;background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:6px 13px;font-size:12px;color:var(--muted);transition:.15s;flex-shrink:0}',
      '.fchip:hover{border-color:var(--muted);color:var(--ink)}',
      '.fchip.active{background:var(--navy);border-color:var(--navy);color:#000;font-weight:600}',
      '.ffilter{display:flex;align-items:center;gap:9px;font-size:12.5px;color:var(--muted);cursor:pointer;user-select:none;margin-bottom:10px}',
      '.ffilter .fmini{width:38px;height:22px;border-radius:99px;background:var(--bg);border:1px solid var(--line);position:relative;transition:.2s;flex-shrink:0}',
      '.ffilter .fmini i{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--faint);transition:.2s}',
      '.ffilter.on .fmini{background:rgba(165,214,167,.18);border-color:var(--green)}',
      '.ffilter.on .fmini i{transform:translateX(16px);background:var(--green)}',
      '.flist{border:1px solid var(--line);border-radius:14px;overflow:hidden}',
      '.fcat{font-family:"IBM Plex Mono",monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);padding:12px 16px 6px;background:var(--panel2)}',
      '.fopt{display:flex;align-items:center;gap:12px;padding:12px 16px;border-top:1px solid var(--line);transition:background .15s}',
      '.fopt.sel{background:rgba(196,151,58,.09)}',
      '.fstep{display:flex;align-items:center;gap:5px;flex-shrink:0}',
      '.fqbtn{width:26px;height:26px;border-radius:7px;border:1px solid var(--line);background:var(--panel2);color:var(--ink);font-size:16px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;transition:.15s}',
      '.fqbtn:hover:not(:disabled){border-color:var(--navy);color:var(--navy)}',
      '.fqbtn:disabled{opacity:.3;cursor:default}',
      '.fqn{font-family:"IBM Plex Mono",monospace;font-size:15px;font-weight:700;min-width:16px;text-align:center;color:var(--faint)}',
      '.fqn.on{color:var(--navy)}',
      '.fbody{flex:1;min-width:0}',
      '.fdish{font-weight:600;font-size:14px;color:var(--ink);line-height:1.25}',
      '.fplace{font-size:11px;color:var(--faint);margin-top:1px;text-transform:uppercase;letter-spacing:.05em}',
      '.fmac{text-align:right;flex-shrink:0;font-family:"IBM Plex Mono",monospace;font-size:11.5px;color:var(--muted);line-height:1.5}',
      '.fmac .k{color:var(--ink);font-weight:600}.fmac .p{color:var(--green)}',
      '.fbadge{font-family:"IBM Plex Mono",monospace;font-size:9.5px;font-weight:700;letter-spacing:.06em;margin-top:4px;display:block}',
      '.fbadge.in{color:var(--green)}.fbadge.out{color:#e0a537}.fbadge.done{color:#7bd88f}',
      '.fempty{padding:26px 16px;text-align:center;color:var(--faint);font-size:12.5px;font-style:italic}',
      '.fcart{position:fixed;left:0;right:0;bottom:0;z-index:30;background:var(--panel);border-top:1px solid var(--line);box-shadow:0 -6px 24px rgba(0,0,0,.55);padding:13px 20px calc(13px + env(safe-area-inset-bottom))}',
      '.fcart .fcin{max-width:1180px;margin:0 auto;display:flex;align-items:center;gap:16px}',
      '.fcart .fcleft{flex:1;min-width:0}',
      '.fcart .fck{font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:23px;color:#fff;line-height:1}',
      '.fcart .fck small{font-family:Inter,sans-serif;font-size:12px;color:var(--muted);font-weight:500}',
      '.fcart .fcst{font-size:12px;margin-top:5px}',
      '.fcart .fcst.ok{color:var(--green)}.fcart .fcst.low{color:var(--faint)}.fcart .fcst.over{color:var(--coral)}',
      '.fclear{background:none;border:none;color:var(--coral);font-size:11.5px;cursor:pointer;text-decoration:underline;padding:0}',
      '.fcart .fcdiff{text-align:right;flex-shrink:0}',
      '.fcart .fcdiff .fcn{font-family:"Chakra Petch",sans-serif;font-weight:700;font-size:27px;line-height:1;color:var(--navy)}',
      '.fcart .fcdiff .fcl{font-family:"IBM Plex Mono",monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);margin-top:3px}',
      '.pmac{font-family:"IBM Plex Mono",monospace;font-size:11.5px;margin-top:5px;color:var(--muted)}',
      '.gcount{font-family:"IBM Plex Mono",monospace;font-size:10px;font-weight:600;color:var(--faint);margin-left:4px}',
      '.gcount.full{color:var(--navy)}',
      '.opt.cf-block{opacity:.45}',
      '#tab-plan .cf-spacer,#tab-fuera .cf-spacer{height:104px}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ── Utilidades de grupo (leen el DOM, agnósticas del motor) ──────────── */
  function groupInfo(pick) {
    var opts = pick.querySelectorAll('.opt');
    var max = 1, count = 0;
    for (var i = 0; i < opts.length; i++) {
      var dm = parseInt(opts[i].getAttribute('data-max'), 10);
      if (!isNaN(dm)) max = dm;
      var c = opts[i].querySelector('.opt-cnt');
      if (c) count += (parseInt(c.textContent, 10) || 0);
      else if (opts[i].classList.contains('selected')) count += 1;
    }
    return { max: max, count: count, opts: opts };
  }

  /* ── 1) TOPE POR GRUPO ────────────────────────────────────────────────── */
  function capClicks() {
    document.addEventListener('click', function (e) {
      try {
        var t = e.target;
        if (!t || !t.closest) return;
        var opt = t.closest('.opt'); if (!opt) return;
        var pick = t.closest('.pick'); if (!pick) return;
        var gi = groupInfo(pick);
        if (gi.count < gi.max) return;                 // todavía hay cupo

        var btn = t.closest('.opt-btn');
        var increasing;
        if (btn) increasing = (btn.textContent || '').trim().indexOf('+') === 0;
        else     increasing = !opt.classList.contains('selected');
        if (!increasing) return;                       // restar/desmarcar: permitido

        e.preventDefault(); e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        opt.classList.add('cf-block');
        setTimeout(function () { opt.classList.remove('cf-block'); }, 220);
      } catch (err) { /* nunca bloquear por un error */ }
    }, true);
  }

  /* Etiqueta x/max y + deshabilitado */
  function decorateGroups() {
    var picks = document.querySelectorAll('#tab-plan .pick');
    for (var i = 0; i < picks.length; i++) {
      var pick = picks[i], gi = groupInfo(pick);
      var k = pick.querySelector('.k'); if (!k) continue;
      var tag = k.querySelector('.gcount');
      if (!tag) { tag = document.createElement('span'); tag.className = 'gcount'; k.appendChild(tag); }
      tag.textContent = ' ' + gi.count + '/' + gi.max;
      tag.className = 'gcount' + (gi.count >= gi.max ? ' full' : '');
      for (var j = 0; j < gi.opts.length; j++) {
        var btns = gi.opts[j].querySelectorAll('.opt-btn');
        for (var b = 0; b < btns.length; b++) {
          if ((btns[b].textContent || '').trim().indexOf('+') === 0) btns[b].disabled = (gi.count >= gi.max);
        }
      }
    }
  }

  /* ── 2) BARRA DE PROGRESO DEL DÍA ─────────────────────────────────────── */
  function progressTotals() {
    var out = { kcal: 0, p: 0, c: 0, g: 0 };
    var meals = document.querySelectorAll('#tab-plan .meal[data-mealid]');
    for (var i = 0; i < meals.length; i++) {
      var mid = meals[i].getAttribute('data-mealid');
      var data = null;
      for (var d = 0; d < P.comidas.length; d++) if (P.comidas[d].id === mid) data = P.comidas[d];
      if (!data || data.kcal == null) continue;
      var picks = meals[i].querySelectorAll('.pick');
      var tot = 0, got = 0;
      for (var q = 0; q < picks.length; q++) {
        var gi = groupInfo(picks[q]);
        tot += gi.max; got += Math.min(gi.count, gi.max);
      }
      if (!tot) continue;
      var f = got / tot;
      out.kcal += data.kcal * f; out.p += (data.p || 0) * f;
      out.c += (data.c || 0) * f; out.g += (data.g || 0) * f;
    }
    out.kcal = Math.round(out.kcal); out.p = Math.round(out.p);
    out.c = Math.round(out.c); out.g = Math.round(out.g);
    return out;
  }

  function renderProgress() {
    var panel = $id('tab-plan'); if (!panel || !P.macros) return;
    if (!panel.querySelector('.cf-spacer')) {
      var sp = document.createElement('div'); sp.className = 'cf-spacer'; panel.appendChild(sp);
    }
    var m = P.macros, t = progressTotals();
    var rest = Math.max(0, m.kcal - t.kcal), done = rest === 0 && t.kcal > 0;
    var stTxt = done ? '¡Completaste tu día! 🎯'
      : t.kcal > 0 ? 'Te faltan ' + rest + ' kcal por marcar.'
      : 'Marca tus opciones y ve sumando.';
    var bar = $id('cfProgress');
    if (!bar) {
      bar = document.createElement('div'); bar.id = 'cfProgress'; bar.className = 'fcart';
      panel.appendChild(bar);
    }
    bar.innerHTML =
      '<div class="fcin"><div class="fcleft">' +
        '<div class="fck">' + t.kcal + ' <small>/ ' + m.kcal + ' kcal</small></div>' +
        '<div class="pmac">P <b style="color:var(--green)">' + t.p + '</b>/' + m.p + 'g &nbsp;·&nbsp; ' +
          'C <b style="color:var(--cyan)">' + t.c + '</b>/' + m.c + 'g &nbsp;·&nbsp; ' +
          'G <b style="color:var(--amber)">' + t.g + '</b>/' + m.g + 'g</div>' +
        '<div class="fcst ' + (done ? 'ok' : 'low') + '">' + stTxt + '</div>' +
      '</div><div class="fcdiff"><div class="fcn">' + rest + '</div><div class="fcl">restantes</div></div></div>';
  }

  /* ── 3) PESTAÑA COMER FUERA ───────────────────────────────────────────── */
  var st = { mealId: null, cat: 'Todas', soloEntran: true, qty: {} };
  function fMeals() { return P.comidas.filter(function (m) { return m.kcal != null; }); }
  function fCats() {
    var seen = {}, out = ['Todas'];
    for (var i = 0; i < CAT.length; i++) if (!seen[CAT[i].cat]) { seen[CAT[i].cat] = 1; out.push(CAT[i].cat); }
    return out;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  function addTab() {
    var nav = $id('tabNav'), panels = $id('tabPanels');
    if (!nav || !panels || $id('tab-fuera')) return false;
    var n = nav.querySelectorAll('.tab').length + 1;
    var btn = document.createElement('button');
    btn.className = 'tab'; btn.id = 'cfTabBtn';
    btn.innerHTML = '<span class="tnum">' + (n < 10 ? '0' : '') + n + '</span> Comer Fuera';
    btn.addEventListener('click', function () {
      if (typeof showTab === 'function') showTab('fuera', btn);
      else {
        var ps = document.querySelectorAll('.panel'), ts = document.querySelectorAll('.tab');
        for (var i = 0; i < ps.length; i++) ps[i].classList.remove('active');
        for (var j = 0; j < ts.length; j++) ts[j].classList.remove('active');
        $id('tab-fuera').classList.add('active'); btn.classList.add('active');
      }
      renderFuera();
    });
    nav.appendChild(btn);
    var p = document.createElement('div'); p.id = 'tab-fuera'; p.className = 'panel';
    panels.appendChild(p);
    return true;
  }

  function renderFuera() {
    var panel = $id('tab-fuera'); if (!panel) return;
    var meals = fMeals();
    if (!st.mealId && meals.length) st.mealId = meals[0].id;
    var meal = null;
    for (var i = 0; i < P.comidas.length; i++) if (P.comidas[i].id === st.mealId) meal = P.comidas[i];
    var budget = (meal && meal.kcal) || 500;

    var S = 0, PR = 0, nPort = 0;
    for (var k in st.qty) {
      if (!st.qty[k] || !CAT[k]) continue;
      S += CAT[k].kcal * st.qty[k]; PR += CAT[k].p * st.qty[k]; nPort += st.qty[k];
    }
    var diff = budget - S;

    var mealsHtml = meals.map(function (m) {
      return '<button class="fmeal' + (m.id === st.mealId ? ' active' : '') + '" data-mid="' + esc(m.id) + '">' +
        '<span class="fmn">' + esc(m.nombre) + '</span><span class="fmk">~' + m.kcal + ' kcal</span></button>';
    }).join('');

    var chipsHtml = fCats().map(function (c) {
      return '<button class="fchip' + (st.cat === c ? ' active' : '') + '" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
    }).join('');

    var opts = [];
    for (var x = 0; x < CAT.length; x++) {
      var o = CAT[x];
      if (st.cat !== 'Todas' && o.cat !== st.cat) continue;
      if (st.soloEntran && !(st.qty[x] > 0) && (S + o.kcal > budget + TOL)) continue;
      opts.push({ o: o, i: x });
    }
    opts.sort(function (a, b) { return a.o.kcal - b.o.kcal; });

    var listHtml, last = null;
    if (!CAT.length) listHtml = '<div class="fempty">No se pudo cargar el catálogo (guia-data.js).</div>';
    else if (!opts.length) listHtml = '<div class="fempty">Nada más entra en lo que te queda. Quita una porción o desactiva “solo las que entran”.</div>';
    else listHtml = opts.map(function (e) {
      var o = e.o, n = st.qty[e.i] || 0, tAdd = S + o.kcal, bc, bt;
      if (Math.abs(budget - tAdd) <= TOL) { bc = 'done'; bt = 'COMPLETA ✓'; }
      else if (tAdd <= budget + TOL)      { bc = 'in';   bt = 'ENTRA'; }
      else                                { bc = 'out';  bt = 'SE PASA'; }
      var lbl = (st.cat === 'Todas' && o.cat !== last) ? '<div class="fcat">' + esc(o.cat) + '</div>' : '';
      last = o.cat;
      return lbl + '<div class="fopt' + (n > 0 ? ' sel' : '') + '">' +
        '<div class="fstep">' +
          '<button class="fqbtn" data-i="' + e.i + '" data-act="dec"' + (n < 1 ? ' disabled' : '') + '>−</button>' +
          '<span class="fqn' + (n > 0 ? ' on' : '') + '">' + n + '</span>' +
          '<button class="fqbtn" data-i="' + e.i + '" data-act="inc">+</button>' +
        '</div>' +
        '<div class="fbody"><div class="fdish">' + esc(o.dish) + '</div><div class="fplace">' +
          esc(o.rest) + (o.qty ? ' · ' + esc(o.qty) : '') + '</div></div>' +
        '<div class="fmac"><span class="k">' + o.kcal + ' kcal</span> · <span class="p">' + o.p + 'g P</span>' +
          '<span class="fbadge ' + bc + '">' + bt + '</span></div></div>';
    }).join('');

    var stCls = 'low', stTxt = 'Elige lo que vas a comer y ve sumando.';
    if (S > 0) {
      if (Math.abs(diff) <= TOL) { stCls = 'ok'; stTxt = 'En objetivo (±50 kcal). ¡Listo!'; }
      else if (diff > TOL)       { stTxt = 'Te faltan ' + diff + ' kcal — complementa con algo de la lista.'; }
      else                       { stCls = 'over'; stTxt = 'Te pasaste ' + (-diff) + ' kcal del presupuesto.'; }
    }

    panel.innerHTML =
      '<div class="wrap"><section>' +
      '<div class="sec-h"><span class="ix">01</span><h2>Comer fuera sin salirte del plan</h2><div class="rule"></div></div>' +
      '<div class="fuera-intro">Elige <b>en qué comida</b> vas a comer fuera y usa <b>− / +</b> para sumar porciones (puedes <b>repetir la misma</b>). Abajo ves cuántas kcal llevas vs. las que tienes para esa comida. Badge <b style="color:var(--navy)">COMPLETA ✓</b> = te deja justo (±50 kcal).</div>' +
      '<div class="fmeals">' + mealsHtml + '</div>' +
      '<div class="fbudget">Presupuesto de <b>' + esc(meal ? meal.nombre : '') + '</b>: <b>~' + budget + ' kcal</b></div>' +
      '<div class="fchips">' + chipsHtml + '</div>' +
      '<div class="ffilter' + (st.soloEntran ? ' on' : '') + '" id="cfFilter"><div class="fmini"><i></i></div><span>Solo las que entran en lo que te queda</span></div>' +
      '<div class="flist">' + listHtml + '</div><div class="cf-spacer"></div>' +
      '</section></div>' +
      '<div class="fcart"><div class="fcin"><div class="fcleft">' +
        '<div class="fck">' + S + ' <small>/ ' + budget + ' kcal · ' + PR + 'g P</small></div>' +
        '<div class="fcst ' + stCls + '">' + stTxt + (nPort ? ' · <button class="fclear" id="cfClear">limpiar (' + nPort + ')</button>' : '') + '</div>' +
      '</div><div class="fcdiff"><div class="fcn">' + Math.abs(diff) + '</div><div class="fcl">' +
        (diff > 0 ? 'te faltan' : diff < 0 ? 'te pasas' : 'exacto') + ' kcal</div></div></div></div>';

    panel.querySelectorAll('.fmeal').forEach(function (b) {
      b.onclick = function () { st.mealId = b.getAttribute('data-mid'); st.qty = {}; renderFuera(); };
    });
    panel.querySelectorAll('.fchip').forEach(function (b) {
      b.onclick = function () { st.cat = b.getAttribute('data-cat'); renderFuera(); };
    });
    panel.querySelectorAll('.fqbtn').forEach(function (b) {
      b.onclick = function () {
        var i = b.getAttribute('data-i'), cur = st.qty[i] || 0;
        st.qty[i] = b.getAttribute('data-act') === 'inc' ? cur + 1 : Math.max(0, cur - 1);
        renderFuera();
      };
    });
    var f = $id('cfFilter'); if (f) f.onclick = function () { st.soloEntran = !st.soloEntran; renderFuera(); };
    var c = $id('cfClear');  if (c) c.onclick = function () { st.qty = {}; renderFuera(); };
  }

  /* ── Arranque ─────────────────────────────────────────────────────────── */
  function boot() {
    injectCSS();
    addTab();
    capClicks();
    decorateGroups();
    renderProgress();
    var plan = $id('tab-plan');
    if (plan && window.MutationObserver) {
      var mo = new MutationObserver(function () {
        if (mo._busy) return; mo._busy = true;
        setTimeout(function () { try { decorateGroups(); renderProgress(); } catch (e) {} mo._busy = false; }, 0);
      });
      mo.observe(plan, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 60); });
  else setTimeout(boot, 60);
})();
