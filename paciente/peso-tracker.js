/* peso-tracker.js — registro de peso corporal
   Tabla Supabase: registros_peso (id, paciente_slug, fecha, peso, nota, created_at)
   Requiere: PATIENT.slug, @supabase/supabase-js@2 ya cargados.
*/
(function () {
  const SB_URL  = 'https://hmnjtbruliluctslkndq.supabase.co';
  const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtbmp0YnJ1bGlsdWN0c2xrbmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjAxNjksImV4cCI6MjA5NzAzNjE2OX0.IYmCcvjdlbH1L0QoSoGIpwudRehSQINR1hNoWG02Cc4';
  const HEADERS = { 'Content-Type':'application/json', apikey:SB_ANON, Authorization:'Bearer '+SB_ANON };

  let _sb=null, _pesos=[], _editId=null;

  function today(){ return new Date().toISOString().slice(0,10); }

  function boot(){
    try{ if(typeof PATIENT==='undefined'||!PATIENT.slug){setTimeout(boot,100);return;} }
    catch(e){setTimeout(boot,100);return;}
    injectTab();
    function initSb(){ if(window.supabase){_sb=window.supabase.createClient(SB_URL,SB_ANON);}else{setTimeout(initSb,200);} }
    initSb();
  }

  function injectTab(){
    const nav=document.getElementById('tabNav');
    const panels=document.getElementById('tabPanels');
    if(!nav||!panels||document.getElementById('tab-peso'))return;
    const btn=document.createElement('button');
    btn.className='tab'; btn.id='tab-btn-peso';
    btn.innerHTML='<span class="tnum">⚖</span> Mi Peso';
    btn.onclick=function(){activateTab(btn);};
    nav.appendChild(btn);
    const panel=document.createElement('div');
    panel.id='tab-peso'; panel.className='panel';
    panel.innerHTML=buildPanelHTML();
    panels.appendChild(panel);
    panel.querySelector('#peso-form').addEventListener('submit',handleSubmit);
    panel.querySelector('#peso-cancel-edit').addEventListener('click',cancelEdit);
  }

  function activateTab(btn){
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.getElementById('tab-peso').classList.add('active');
    btn.classList.add('active');
    if(!_pesos.length) loadPesos();
  }

  function buildPanelHTML(){
    return `<div class="wrap"><section style="padding:30px 0">
  <div class="sec-h"><span class="ix">01</span><h2>Registro de peso</h2><div class="rule"></div></div>
  <div id="peso-chart-wrap" style="margin-bottom:20px"></div>
  <div class="card" style="margin-bottom:20px">
    <div id="peso-edit-banner" style="display:none;font-size:12px;color:var(--amber);margin-bottom:12px;font-weight:600">
      ✏️ Editando registro — <button id="peso-cancel-edit" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:12px;text-decoration:underline">cancelar</button>
    </div>
    <form id="peso-form" style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end">
      <div style="flex:1;min-width:130px">
        <label style="font-family:'IBM Plex Mono';font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);display:block;margin-bottom:5px">Fecha</label>
        <input id="peso-fecha" type="date" value="${today()}" required style="width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:9px 11px;color:var(--ink);font-size:14px;font-family:'Inter';outline:none">
      </div>
      <div style="flex:1;min-width:110px">
        <label style="font-family:'IBM Plex Mono';font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);display:block;margin-bottom:5px">Peso (kg)</label>
        <input id="peso-valor" type="number" step="0.1" min="20" max="300" placeholder="75.4" required style="width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:9px 11px;color:var(--ink);font-size:14px;font-family:'Inter';outline:none">
      </div>
      <div style="flex:2;min-width:160px">
        <label style="font-family:'IBM Plex Mono';font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);display:block;margin-bottom:5px">Nota (opcional)</label>
        <input id="peso-nota" type="text" placeholder="ej. en ayunas, con ropa..." style="width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:9px 11px;color:var(--ink);font-size:14px;font-family:'Inter';outline:none">
      </div>
      <button type="submit" id="peso-submit-btn" style="background:var(--gold,#C4973A);color:#000;border:none;border-radius:10px;padding:10px 22px;font-family:'IBM Plex Mono';font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;white-space:nowrap">Guardar</button>
    </form>
    <div id="peso-msg" style="margin-top:10px;font-size:12px;display:none"></div>
  </div>
  <div class="card"><div id="peso-list"><p style="color:var(--muted);font-size:13px">Cargando...</p></div></div>
</section></div>`;
  }

  async function loadPesos(){
    const r=await fetch(`${SB_URL}/rest/v1/registros_peso?paciente_slug=eq.${encodeURIComponent(PATIENT.slug)}&order=fecha.asc`,{headers:HEADERS});
    _pesos=r.ok?(await r.json()):[];
    renderList();
    renderChart();
  }

  function renderChart(){
    const wrap=document.getElementById('peso-chart-wrap');
    if(!wrap) return;
    if(!_pesos.length){wrap.innerHTML='';return;}
    const MESES=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    function fF(d){const[y,m,day]=d.split('-');return `${day} ${MESES[+m-1]} ${y}`;}
    const pesos=_pesos.map(p=>parseFloat(p.peso));
    const fechas=_pesos.map(p=>p.fecha);
    const W=560,H=140,PL=44,PR=16,PT=12,PB=28;
    const minP=Math.min(...pesos)-1, maxP=Math.max(...pesos)+1;
    const xS=i=>PL+(i/(pesos.length-1||1))*(W-PL-PR);
    const yS=v=>PT+(1-(v-minP)/(maxP-minP))*(H-PT-PB);
    let gridLines='',gridLabels='';
    for(let i=0;i<=4;i++){
      const v=minP+(maxP-minP)*(i/4), y=yS(v);
      gridLines+=`<line x1="${PL}" x2="${W-PR}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,.06)" stroke-width="1"/>`;
      gridLabels+=`<text x="${PL-4}" y="${y+4}" text-anchor="end" fill="#666" font-size="9" font-family="IBM Plex Mono">${v.toFixed(1)}</text>`;
    }
    const pts=pesos.map((v,i)=>`${xS(i)},${yS(v)}`).join(' ');
    const fillPts=`${xS(0)},${H-PB} ${pts} ${xS(pesos.length-1)},${H-PB}`;
    let xLabels='';
    const step=Math.ceil(pesos.length/8);
    fechas.forEach((f,i)=>{if(i%step===0||i===fechas.length-1){const[,m,day]=f.split('-');xLabels+=`<text x="${xS(i)}" y="${H-4}" text-anchor="middle" fill="#666" font-size="9" font-family="IBM Plex Mono">${day}/${MESES[+m-1]}</text>`;}});
    const dots=pesos.map((v,i)=>`<circle cx="${xS(i)}" cy="${yS(v)}" r="3.5" fill="var(--gold,#C4973A)" stroke="var(--bg,#080808)" stroke-width="1.5"><title>${fF(fechas[i])}: ${v.toFixed(1)} kg${_pesos[i].nota?' — '+_pesos[i].nota:''}</title></circle>`).join('');
    const n=pesos.length;
    const sumX=pesos.reduce((_,__,i)=>_+i,0),sumY=pesos.reduce((a,v)=>a+v,0);
    const sumXY=pesos.reduce((a,v,i)=>a+i*v,0),sumX2=pesos.reduce((a,_,i)=>a+i*i,0);
    const slope=(n*sumXY-sumX*sumY)/(n*sumX2-sumX*sumX||1);
    const intercept=(sumY-slope*sumX)/n;
    const trend=n>2?`<line x1="${xS(0)}" y1="${yS(intercept)}" x2="${xS(n-1)}" y2="${yS(intercept+slope*(n-1))}" stroke="#ef5350" stroke-width="1.2" stroke-dasharray="4 3" opacity=".6"/>`:'';
    const delta=pesos[n-1]-pesos[0];
    const deltaStr=(delta>0?'+':'')+delta.toFixed(1)+' kg';
    const deltaCol=delta<0?'#26a69a':delta>0?'#ef5350':'#888';
    wrap.innerHTML=`<div class="card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <span style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)">Evolución del peso</span>
        <span style="font-family:'IBM Plex Mono';font-size:14px;font-weight:700;color:${deltaCol}">${deltaStr}</span>
        <span style="font-size:11px;color:var(--muted)">${n} registros</span>
      </div>
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block">
        ${gridLines}${gridLabels}
        <polygon points="${fillPts}" fill="rgba(196,151,58,.08)"/>
        <polyline points="${pts}" fill="none" stroke="var(--gold,#C4973A)" stroke-width="2" stroke-linejoin="round"/>
        ${trend}${dots}${xLabels}
      </svg>
    </div>`;
  }

  function renderList(){
    const el=document.getElementById('peso-list');
    if(!el) return;
    if(!_pesos.length){el.innerHTML='<p style="color:var(--muted);font-size:13px;font-style:italic">Sin registros aún. ¡Agrega tu primer peso!</p>';return;}
    const MESES=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const rows=[..._pesos].reverse().map(p=>{
      const[y,m,day]=p.fecha.split('-');
      return `<tr>
        <td style="font-family:'IBM Plex Mono';font-size:12px;color:var(--gold,#C4973A)">${day} ${MESES[+m-1]} ${y}</td>
        <td style="font-family:'IBM Plex Mono';font-size:14px;font-weight:700">${parseFloat(p.peso).toFixed(1)} <span style="font-size:11px;color:var(--muted)">kg</span></td>
        <td style="font-size:12px;color:var(--muted)">${p.nota||'—'}</td>
        <td style="white-space:nowrap">
          <button onclick="window._pesoEdit('${p.id}')" style="background:none;border:none;cursor:pointer;font-size:14px;padding:0 4px" title="Editar">✏️</button>
          <button onclick="window._pesoDel('${p.id}')" style="background:none;border:none;cursor:pointer;font-size:14px;padding:0 4px" title="Eliminar">🗑️</button>
        </td>
      </tr>`;
    }).join('');
    el.innerHTML=`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr>
        <th style="text-align:left;padding:6px 10px;font-family:'IBM Plex Mono';font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);border-bottom:1px solid var(--line)">Fecha</th>
        <th style="text-align:left;padding:6px 10px;font-family:'IBM Plex Mono';font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);border-bottom:1px solid var(--line)">Peso</th>
        <th style="text-align:left;padding:6px 10px;font-family:'IBM Plex Mono';font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);border-bottom:1px solid var(--line)">Nota</th>
        <th style="border-bottom:1px solid var(--line)"></th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
  }

  async function handleSubmit(e){
    e.preventDefault();
    const fecha=document.getElementById('peso-fecha').value;
    const peso=parseFloat(document.getElementById('peso-valor').value);
    const nota=document.getElementById('peso-nota').value.trim();
    if(!fecha||isNaN(peso)) return;
    const btn=document.getElementById('peso-submit-btn');
    btn.disabled=true; btn.textContent='Guardando...';
    const body={paciente_slug:PATIENT.slug,fecha,peso,nota:nota||null};
    let ok=false;
    if(_editId){
      const r=await fetch(`${SB_URL}/rest/v1/registros_peso?id=eq.${_editId}`,{method:'PATCH',headers:{...HEADERS,Prefer:'return=minimal'},body:JSON.stringify(body)});
      ok=r.ok;
    } else {
      const r=await fetch(`${SB_URL}/rest/v1/registros_peso`,{method:'POST',headers:{...HEADERS,Prefer:'return=minimal'},body:JSON.stringify(body)});
      ok=r.ok;
    }
    btn.disabled=false; btn.textContent='Guardar';
    showMsg(ok?'✓ Guardado':'✗ Error al guardar',ok);
    if(ok){cancelEdit();_pesos=[];await loadPesos();}
  }

  window._pesoEdit=function(id){
    const p=_pesos.find(x=>x.id===id);
    if(!p) return;
    _editId=id;
    document.getElementById('peso-fecha').value=p.fecha;
    document.getElementById('peso-valor').value=parseFloat(p.peso).toFixed(1);
    document.getElementById('peso-nota').value=p.nota||'';
    document.getElementById('peso-edit-banner').style.display='block';
    document.getElementById('peso-submit-btn').textContent='Actualizar';
    document.getElementById('peso-fecha').scrollIntoView({behavior:'smooth',block:'center'});
  };

  window._pesoDel=async function(id){
    if(!confirm('¿Eliminar este registro?')) return;
    const r=await fetch(`${SB_URL}/rest/v1/registros_peso?id=eq.${id}`,{method:'DELETE',headers:HEADERS});
    if(r.ok){_pesos=[];await loadPesos();}
  };

  function cancelEdit(){
    _editId=null;
    document.getElementById('peso-edit-banner').style.display='none';
    document.getElementById('peso-submit-btn').textContent='Guardar';
    document.getElementById('peso-form').reset();
    document.getElementById('peso-fecha').value=today();
  }

  function showMsg(txt,ok){
    const el=document.getElementById('peso-msg');
    if(!el) return;
    el.textContent=txt; el.style.color=ok?'#a5d6a7':'#ef9a9a'; el.style.display='block';
    setTimeout(()=>{el.style.display='none';},2500);
  }

  boot();
})();
