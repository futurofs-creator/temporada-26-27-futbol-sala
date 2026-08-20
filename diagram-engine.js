(function(){
  function infer(ex){
    const t=((ex?.name||'')+' '+(ex?.description||'')+' '+(ex?.organization||'')+' '+(ex?.keys||'')+' '+(ex?.objective||'')).toLowerCase();
    let A=5,D=3,W=0;
    const m=t.match(/(\d+)\s*(?:atacantes?|jugadores?)\s*(?:vs|contra|x)\s*(\d+)\s*(?:defensores?|jugadores?)/i);
    if(m){A=+m[1];D=+m[2];} else { const x=t.match(/(\d+)x(\d+)/); if(x){A=+x[1];D=+x[2];} }
    if(/comod[ií]n|comodines/.test(t)) W=Math.max(1,+(t.match(/(\d+)\s*comodines?/)||[,1])[1]);
    return {A,D,W,attackHalf:/finaliz|porter[ií]a|tiro|remate/.test(t),transition:/transici[oó]n|p[eé]rdida|recupera/.test(t),defense:/defensa baja|bascul|ayuda|cobertura|presi[oó]n/.test(t),pass:/pase|circulaci[oó]n|l[ií]nea de pase/.test(t),move:/desplaz|rotaci[oó]n|conducci[oó]n|cambio de direcci[oó]n/.test(t)};
  }
  function person(x,y,cl,label){return `<circle cx="${x}" cy="${y}" r="10" class="${cl}"/>${label?`<text x="${x}" y="${y+4}" text-anchor="middle" font-size="8" fill="#fff" font-weight="700">${label}</text>`:''}`}
  function arrow(x1,y1,x2,y2,cls){return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`}
  window.diagram=function(type,ex){
    const i=infer(ex),A=Math.min(6,Math.max(2,i.A)),D=Math.min(5,Math.max(1,i.D)),W=Math.min(2,i.W), pts=[];
    for(let n=0;n<A;n++)pts.push({x:95+(n%3)*35,y:65+Math.floor(n/3)*80});
    for(let n=0;n<D;n++)pts.push({x:265-(n%3)*35,y:80+Math.floor(n/3)*70});
    let P=''; pts.slice(0,A).forEach((p,n)=>P+=person(p.x,p.y,'att',n+1)); pts.slice(A,A+D).forEach((p,n)=>P+=person(p.x,p.y,'def','D'+(n+1))); for(let n=0;n<W;n++)P+=person(180,55+n*120,'wild','C'+(n+1));
    P+=`<circle cx="145" cy="115" r="5" class="ball"/>`;
    if(i.pass){for(let n=0;n<Math.min(A-1,3);n++)P+=arrow(pts[n].x,pts[n].y,pts[n+1].x,pts[n+1].y,'pass');}
    if(i.move)P+=arrow(pts[0].x,pts[0].y,pts[0].x+45,pts[0].y-25,'run');
    if(i.transition){P+=arrow(145,115,225,115,'transition');P+=arrow(245,80,170,115,'run');}
    if(i.defense){P+=arrow(240,95,205,105,'run');P+=arrow(250,165,215,150,'run');}
    if(i.attackHalf)P+=arrow(220,115,310,115,'shot');
    if(!i.pass&&!i.move&&!i.transition&&!i.defense&&!i.attackHalf)P+=arrow(145,115,195,115,'pass');
    const caption=(ex?.name)||({warmup:'Activación',rondo:'Rondo',possession:'Posesión',finish:'Finalización',transition:'Transición',match:'Partido'}[type]||'Tarea');
    return `<div class="diagram-card"><svg viewBox="0 0 360 230"><defs><marker id="arrPass" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 z" fill="#173b66"/></marker><marker id="arrRun" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 z" fill="#b05a00"/></marker><marker id="arrShot" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 z" fill="#a33"/></marker></defs><rect x="35" y="25" width="290" height="180" rx="8" class="court"/><path d="M180 25v180M35 90h42v50H35M325 90h-42v50h42" class="line"/><circle cx="180" cy="115" r="32" class="line"/>${P}</svg><div class="diagram-caption">${esc(caption)} · ${A} atacantes · ${D} defensores${W?` · ${W} comodín${W>1?'es':''}`:''}</div></div>`;
  };
  const originalRender=window.render;
  window.render=function(){
    const q=$('q').value.toLowerCase(),data=sessions.filter(s=>JSON.stringify(s).toLowerCase().includes(q)),groups={};
    data.forEach(s=>(groups[monthKey(s.session_date)]??=[]).push(s));
    $('app').innerHTML=Object.keys(groups).sort().map(k=>`<details class="month"><summary class="month-title">${monthName(k)}</summary><div class="month-content">${groups[k].sort((a,b)=>(a.session_number||0)-(b.session_number||0)).map(s=>{const ex=Array.isArray(s.content?.exercises)?s.content.exercises:[];return`<details class="card session"><summary><div style="font-size:22px;font-weight:700;padding-right:35px">Sesión ${esc(s.session_number)} <span class="session-date">${esc(formatDate(s.session_date))}</span></div><div class="muted">${esc(s.duration_minutes)} min · ${esc(s.player_min)}-${esc(s.player_max)} jugadores · Carga ${esc(s.load_level)}</div><div><b>Objetivo:</b> ${esc(s.objective)}</div></summary><div class="session-body"><div class="session-actions"><button class="btn edit-session" data-id="${esc(s.id)}">✏️ Editar sesión</button><button class="btn danger delete-session" data-id="${esc(s.id)}" data-number="${esc(s.session_number)}">🗑️ Eliminar sesión</button></div>${ex.map((e,i)=>{const type=e.diagram?.type||'match',g=exerciseGuide(type,s.objective);return`<details class="exercise"><summary><span class="exercise-title">${esc(e.name)}</span><span class="exercise-time">${esc(e.time)}</span></summary><div class="exercise-body">${diagram(type,e)}<div class="detail-box"><b>🎯 Objetivo del ejercicio</b><br>${esc(e.objective||g.focus)}</div><div class="detail-box"><b>📋 Cómo se realiza</b><br>${esc(e.description||g.how)}</div>${e.organization?`<div class="detail-box"><b>👥 Organización</b><br>${esc(e.organization)}</div>`:''}<div class="detail-box"><b>🔑 Claves del entrenador</b><br>${esc(e.coaching_points||e.keys||g.coach)}</div>${Array.isArray(e.rules)&&e.rules.length?`<div class="detail-box"><b>📐 Reglas</b><br>${e.rules.map(esc).join(' · ')}</div>`:''}<div class="detail-box"><b>📈 Progresión</b><br>${esc(e.progressions||g.progress)}</div>${e.common_errors?`<div class="detail-box"><b>⚠️ Errores habituales</b><br>${esc(e.common_errors)}</div>`:''}<div class="exercise-actions"><a class="btn video" target="_blank" rel="noopener" href="${esc(e.video_url||videoSearch(e.name,s.objective))}">🎥 Ver vídeos del ejercicio</a><button class="btn alt change-exercise" data-id="${esc(s.id)}" data-index="${i}">🔄 Cambiar ejercicio</button></div></div></details>`}).join('')}</div></details>`}).join('')}</div></details>`).join('')||'<div class="card empty">No hay sesiones que coincidan.</div>';
  };
  setTimeout(()=>window.render(),0);
})();