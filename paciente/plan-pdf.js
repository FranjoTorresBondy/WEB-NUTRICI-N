/* ══════════════════════════════════════════════════════════════════════════
   MÓDULO COMPARTIDO · Descargar plan en PDF imprimible
   Arma un documento limpio desde PATIENT (comidas, macros, especificaciones,
   hidratación, objetivos) y abre el diálogo de impresión → "Guardar como PDF".
   Agrega un botón "PDF" en la barra de pestañas. Independiente del motor.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var P = (typeof PATIENT !== 'undefined') ? PATIENT : (window.PATIENT || null);
  if (!P || !P.comidas || !P.comidas.length) return;

  var $id = function (i) { return document.getElementById(i); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c];
    });
  }

  function injectCSS() {
    if ($id('pdfBtnStyles')) return;
    var s = document.createElement('style');
    s.id = 'pdfBtnStyles';
    s.textContent = [
      '#tabNav{overflow-x:auto;flex-wrap:nowrap;scrollbar-width:none;-ms-overflow-style:none}',
      '#tabNav::-webkit-scrollbar{display:none}',
      '.pdfbtn{position:sticky;right:0;z-index:5;flex-shrink:0;align-self:center;margin:0 0 0 8px;appearance:none;cursor:pointer;',
      'background:var(--navy,#C4973A);color:#000;border:none;border-radius:8px;',
      'font-family:"IBM Plex Mono",monospace;font-size:11px;font-weight:700;letter-spacing:.04em;',
      'text-transform:uppercase;padding:7px 12px;display:inline-flex;align-items:center;gap:5px;',
      'transition:.15s;white-space:nowrap;box-shadow:-12px 0 14px -4px rgba(8,8,8,.96)}',
      '.pdfbtn:hover{opacity:.85}',
      '.pdfbtn.pdfbtn-fixed{position:fixed;top:12px;right:12px;z-index:60;box-shadow:0 4px 16px rgba(0,0,0,.4)}',
      '@media print{.pdfbtn{display:none!important}}'
    ].join('');
    document.head.appendChild(s);
  }

  // ── Construye el HTML imprimible ──────────────────────────────────────────
  function buildDoc() {
    var m = P.macros || {};
    var nombre = (P.nombre || 'Paciente').replace(/\n/g, ' ');
    var fecha = P.fecha || (P.antro && P.antro.fecha) || '';
    var tipo = P.tipoPlan || '';

    var head = '<div class="phead"><div class="pbrand">FRANJO TORRES BONDY · NUTRICIÓN DEPORTIVA</div>' +
      '<h1>' + esc(nombre) + '</h1><div class="psub">' +
      (m.kcal != null ? '<b>' + m.kcal + '</b> kcal/día' : '') +
      (tipo ? ' &nbsp;·&nbsp; ' + esc(tipo) : '') +
      (fecha ? ' &nbsp;·&nbsp; ' + esc(fecha) : '') + '</div>' +
      (m.p != null ? '<div class="pmacros"><span>' + m.p + ' g Proteína</span><span>' + m.c + ' g Carbohidratos</span><span>' + m.g + ' g Grasas</span></div>' : '') +
      '</div>';

    var obj = '';
    if (P.objetivos && P.objetivos.length) {
      obj = '<div class="pblock"><h2>Objetivos</h2><ul class="pobj">' +
        P.objetivos.map(function (o) { return '<li>' + o + '</li>'; }).join('') + '</ul></div>';
    }

    var meals = P.comidas.map(function (meal) {
      var mac = (meal.kcal != null)
        ? '<span class="mmac">' + meal.kcal + ' kcal' + (meal.p != null ? ' · ' + meal.p + 'P / ' + meal.c + 'C / ' + meal.g + 'G' : '') + '</span>'
        : '';
      var groups = (meal.grupos || []).map(function (g) {
        var ops = (g.ops || []).map(function (o) { return '<li>' + o + '</li>'; }).join('');
        return '<div class="pgrp"><div class="pglabel">' + esc(g.label) + '</div><ul>' + ops + '</ul></div>';
      }).join('');
      var nota = meal.nota ? '<div class="mnota">' + meal.nota + '</div>' : '';
      return '<div class="pmeal"><div class="pmhead"><h3>' + esc(meal.nombre) + '</h3>' + mac + '</div>' + groups + nota + '</div>';
    }).join('');

    var hidro = '';
    if (P.hidratacion && P.hidratacion.length) {
      hidro = '<div class="pblock"><h2>Hidratación</h2><div class="phydro">' +
        P.hidratacion.map(function (h) { return '<div class="phcard"><span class="l">' + esc(h.label) + '</span><span class="v">' + esc(h.valor) + ' L</span></div>'; }).join('') +
        '</div></div>';
    }

    var specs = '';
    if (P.specs && P.specs.length) {
      specs = '<div class="pblock pspecs"><h2>Especificaciones</h2><div class="pspecgrid">' +
        P.specs.map(function (sp) {
          var items = (sp.items || []).map(function (it) {
            if (typeof it === 'string' && it.indexOf('##') === 0) return '<div class="pssub">' + it.slice(2) + '</div>';
            return '<div class="psli">' + it + '</div>';
          }).join('');
          return '<div class="pspec"><h4>' + esc(sp.titulo) + '</h4>' + items + '</div>';
        }).join('') + '</div></div>';
    }

    var vin = '';
    if (P.vinagretas && P.vinagretas.length) {
      vin = '<div class="pblock"><h2>Salsas y aderezos</h2><div class="pvingrid">' +
        P.vinagretas.map(function (v) { return '<div class="pvin"><div class="pvname">' + esc(v.nombre) + '</div><div class="pvdesc">' + (v.desc || '') + '</div></div>'; }).join('') +
        '</div></div>';
    }

    var notaSpecs = P.notaSpecs ? '<div class="pnote">' + P.notaSpecs + '</div>' : '';

    var css =
      '@page{margin:1.3cm;}' +
      '*{box-sizing:border-box;margin:0;padding:0}' +
      'body{font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1c1c1c;font-size:11px;line-height:1.5;background:#fff;padding:4px}' +
      '.phead{border-bottom:3px solid #C4973A;padding-bottom:12px;margin-bottom:16px}' +
      '.pbrand{font-size:8.5px;letter-spacing:.22em;color:#8a6d20;font-weight:700;text-transform:uppercase}' +
      '.phead h1{font-size:30px;font-weight:800;letter-spacing:-.01em;margin:6px 0 4px;color:#111;text-transform:uppercase}' +
      '.psub{font-size:12px;color:#444}.psub b{color:#8a6d20;font-size:15px}' +
      '.pmacros{display:flex;gap:16px;margin-top:8px;font-size:10.5px;color:#333}' +
      '.pmacros span{background:#f4f1e8;border:1px solid #e6dfc9;border-radius:5px;padding:3px 9px;font-weight:600}' +
      '.pblock{margin:16px 0;break-inside:avoid}' +
      '.pblock h2{font-size:13px;color:#8a6d20;text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:10px}' +
      '.pobj{list-style:none}.pobj li{padding-left:16px;position:relative;margin:5px 0}.pobj li:before{content:"→";position:absolute;left:0;color:#C4973A;font-weight:800}' +
      '.pmeals{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
      '.pmeal{border:1px solid #e2e2e2;border-radius:8px;padding:11px 13px;break-inside:avoid}' +
      '.pmhead{display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:1px solid #eee;padding-bottom:6px;margin-bottom:8px}' +
      '.pmhead h3{font-size:14px;font-weight:700;color:#111}' +
      '.mmac{font-size:9.5px;color:#8a6d20;font-weight:700;text-align:right;white-space:nowrap}' +
      '.pgrp{margin:7px 0}.pglabel{font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:#a06f00;font-weight:700;margin-bottom:3px}' +
      '.pgrp ul{list-style:none}.pgrp li{padding-left:12px;position:relative;margin:2px 0;font-size:10.5px;color:#333}.pgrp li:before{content:"•";position:absolute;left:2px;color:#bbb}' +
      '.mnota{font-size:9.5px;color:#666;font-style:italic;border-top:1px dashed #ddd;margin-top:8px;padding-top:6px}' +
      '.phydro{display:flex;gap:12px}.phcard{border:1px solid #e2e2e2;border-radius:8px;padding:8px 16px;text-align:center}.phcard .l{display:block;font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#888}.phcard .v{display:block;font-size:18px;font-weight:800;color:#0a7ea4;margin-top:2px}' +
      '.pspecgrid{columns:2;column-gap:18px}.pspec{break-inside:avoid;margin-bottom:12px}.pspec h4{font-size:11px;color:#8a6d20;margin-bottom:4px}' +
      '.pssub{font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#a06f00;font-weight:700;margin:6px 0 3px}' +
      '.psli{padding-left:12px;position:relative;margin:2px 0;font-size:10px;color:#333}.psli:before{content:"•";position:absolute;left:2px;color:#bbb}' +
      '.pvingrid{columns:2;column-gap:18px}.pvin{break-inside:avoid;margin-bottom:9px}.pvname{font-size:10.5px;font-weight:700;color:#8a6d20}.pvdesc{font-size:9.5px;color:#444}' +
      '.pnote{font-size:9.5px;color:#555;background:#f7f5ee;border:1px dashed #ddd;border-radius:6px;padding:9px 11px;margin-top:10px}' +
      '.pfoot{margin-top:20px;border-top:1px solid #ddd;padding-top:10px;font-size:9px;color:#888;display:flex;justify-content:space-between}';

    return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">' +
      '<title>Plan Nutricional - ' + esc(nombre) + (fecha ? ' - ' + esc(fecha) : '') + '</title>' +
      '<style>' + css + '</style></head><body>' +
      head + obj +
      '<div class="pblock"><h2>Plan alimentario diario</h2><div class="pmeals">' + meals + '</div></div>' +
      hidro + specs + vin + notaSpecs +
      '<div class="pfoot"><span>FRANJO TORRES BONDY · NUTRICIÓN</span><span>franjo.torres.b@gmail.com · +51 992 832 991</span></div>' +
      '</body></html>';
  }

  function downloadPdf() {
    var ifr = document.createElement('iframe');
    ifr.setAttribute('aria-hidden', 'true');
    ifr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
    document.body.appendChild(ifr);
    var d = ifr.contentWindow.document;
    d.open(); d.write(buildDoc()); d.close();
    var go = function () {
      try { ifr.contentWindow.focus(); ifr.contentWindow.print(); } catch (e) {}
      setTimeout(function () { if (ifr.parentNode) ifr.parentNode.removeChild(ifr); }, 1500);
    };
    setTimeout(go, 400);
  }

  function addButton() {
    if ($id('cfPdfBtn')) return true;
    var b = document.createElement('button');
    b.id = 'cfPdfBtn'; b.type = 'button'; b.className = 'pdfbtn';
    b.innerHTML = '⬇ PDF';
    b.setAttribute('aria-label', 'Descargar plan en PDF');
    b.onclick = downloadPdf;
    var nav = $id('tabNav');
    if (nav) { nav.appendChild(b); return true; }
    b.className = 'pdfbtn pdfbtn-fixed';
    document.body.appendChild(b);
    return true;
  }

  function boot() {
    injectCSS();
    addButton();
    [300, 900, 1800].forEach(function (t) { setTimeout(addButton, t); });
    var nav = $id('tabNav');
    if (nav && window.MutationObserver) {
      var mo = new MutationObserver(function () {
        if (!$id('cfPdfBtn')) addButton();
      });
      mo.observe(nav, { childList: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 80); });
  else setTimeout(boot, 80);
})();
