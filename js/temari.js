/* ===================================================================
   temari.js — Veure-ho tot i saber on ets:
   · #/temari          El meu temari: blocs → temes, amb els 3 percentatges
                       de cada tema i el «focus» (tria què estudies).
   · #/mod/<id>/resum  Resum d'un tema: on és dins del curs, per a què
                       serveix, què domines i què no, què fer ara.
   · #/focus           Practica només els temes que has triat.
   · #/guia            Com funciona la web: el cicle d'estudi i què vol
                       dir cada percentatge i cada rang.
   · Franja «🧭 Per a què serveix aquesta pàgina» a totes les pàgines.
   =================================================================== */
(function () {
  'use strict';
  if (!window.CalcUI) return;
  const U = CalcUI, { $, $$, esc, app, typeset, renderSide, mountPractice } = U;
  const store = Calc.store, RANKS = Calc.RANKS, L = Calc.learn || {};
  const pill = r => `<span class="rk r${r}">${RANKS[r]}</span>`;
  const pc = v => Math.round((v || 0) * 100);
  const ORDER = ['base', 'l0', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10', 'l11', 'l12', 'l13'].filter(id => Calc.byId[id]);
  const STORY = L.STORY || {}, BLOCS = L.BLOCS || [];

  /* ---------------- Blocs del curs ---------------- */
  const GROUPS = [
    { id: 'b0', n: 0, t: 'Fonaments', q: 'Tinc l\'àlgebra prou fresca?', par: 'Tots dos parcials', ids: ['base', 'l0'] },
    { id: 'b1', n: 1, ids: ['l1', 'l2', 'l3', 'l4'] },
    { id: 'b2', n: 2, ids: ['l5', 'l6'] },
    { id: 'b3', n: 3, ids: ['l7', 'l8', 'l9'] },
    { id: 'b4', n: 4, ids: ['l10', 'l11', 'l12'] },
    { id: 'b5', n: 5, t: 'Repàs final tipus test', q: 'Ho sé reconèixer barrejat?', par: '2n parcial', ids: ['l13'] }
  ].map(g => { const b = BLOCS[g.n - 1]; return Object.assign({ t: b ? b.t : '', q: b ? b.q : '', par: b ? (b.exam === 'p1' ? '1r parcial' : '2n parcial') : '' }, g, { ids: g.ids.filter(id => Calc.byId[id]) }); });
  // Newton (L7) és del 1r parcial però les primitives del 2n: el tema L7 va al bloc 3.
  const groupOf = id => GROUPS.find(g => g.ids.includes(id));
  Calc.groupOf = groupOf;

  /* ---------------- Estadístiques d'un tema ---------------- */
  const parts = () => (Calc.examParts ? Calc.examParts() : []);
  function temaStats(id) {
    const m = Calc.byId[id], mm = store.modMastery(m);
    const gs = m.gens, dom = gs.filter(g => store.rank(g.key) >= 5).length, tried = gs.filter(g => (store.data().gens[g.key] || {}).att).length;
    const due = gs.filter(g => store.isDue(g.key)).length;
    const ls = Calc.listStats ? Calc.listStats(id) : null;
    const xp = parts().filter(p => p.par === 2 ? (p.t || []).includes(id) : (p.t || []).includes(id));
    const xdom = xp.filter(p => store.partRank(p.key) >= 5).length, xtried = xp.filter(p => store.part(p.key)).length;
    const exw = gs.length ? gs.reduce((a, g) => a + Calc.examW(g.key), 0) / gs.length : 0;
    return { m, mm, pct: mm.value, n: gs.length, dom, tried, due, ls, xp, xdom, xtried, exw };
  }
  Calc.temaStats = temaStats;
  const bar = (a, b, cls) => `<div class="tbar ${cls || ''}"><i style="width:${b ? Math.round(a / b * 100) : 0}%"></i></div>`;
  const statusTxt = s => !s.tried ? ['No començat', 's0'] : s.pct >= 0.8 ? ['Dominat', 's3'] : s.mm.acc != null && s.mm.acc < 0.5 ? ['Et costa', 's1'] : ['En curs', 's2'];
  const heat = w => w >= 2.2 ? '🔥🔥🔥' : w >= 1.5 ? '🔥🔥' : w >= 0.7 ? '🔥' : '·';

  /* ---------------- Focus: què vull estudiar ---------------- */
  const FKEY = 'calcmaster.focusSet';
  const getFocus = () => { try { return JSON.parse(localStorage.getItem(FKEY) || '[]').filter(id => Calc.byId[id]); } catch (e) { return []; } };
  const setFocus = a => { try { localStorage.setItem(FKEY, JSON.stringify(a)); } catch (e) { /* res */ } };
  Calc.getFocusSet = getFocus;

  /* ================================================================
     #/temari
     ================================================================ */
  function temaCard(id, focus) {
    const s = temaStats(id), m = s.m, st = STORY[id] || [], [stt, scl] = statusTxt(s);
    const row = (lab, a, b, href, help) => `<a class="trow" href="${href}" title="${esc(help)}"><span>${lab}</span>${bar(a, b)}<b>${a}/${b}</b></a>`;
    return `<div class="card tcard ${focus.includes(id) ? 'infocus' : ''}">
      <div class="row tchead"><span class="chip accent">${esc(m.llista)}</span><span class="chip ${scl}">${stt}</span><span class="muted small" title="Quant surt a l'examen">${heat(s.exw)}</span><span class="spacer"></span>
        <label class="fchk" title="Afegeix-lo al teu focus"><input type="checkbox" data-f="${id}" ${focus.includes(id) ? 'checked' : ''}> Focus</label></div>
      <a class="ttitle" href="#/mod/${id}/resum"><b>${esc(m.title)}</b></a>
      ${st[1] ? `<div class="tq">❓ ${st[1]}</div>` : ''}
      <div class="tbig"><span class="tpct">${pc(s.pct)}%</span><span class="muted small">domini del tema</span></div>
      ${row('Tipus d\'exercici', s.dom, s.n, '#/mod/' + id + '/practice', 'Tipus d\'exercici a Dominat o més')}
      ${s.ls ? row('Llista oficial', s.ls.dom, s.ls.n, '#/mod/' + id + '/list', 'Exercicis de la llista de classe a Dominat') : ''}
      ${s.xp.length ? row('Apartats d\'examen', s.xdom, s.xp.length, '#/mod/' + id + '/resum#xparts', 'Apartats d\'exàmens reals d\'aquest tema a Dominat') : ''}
      ${s.due ? `<div class="small">🧠 <b>${s.due}</b> per repassar avui</div>` : ''}
      <div class="row" style="margin-top:8px"><a class="btn sm primary" href="#/mod/${id}/resum">📊 Resum</a><a class="btn sm" href="#/mod/${id}/theory">📖 Teoria</a><a class="btn sm" href="#/mod/${id}/practice">✍️ Practica</a></div></div>`;
  }
  function temariPage() {
    renderSide('temari');
    const focus = getFocus();
    const all = ORDER.map(temaStats), nG = all.reduce((a, s) => a + s.n, 0), dG = all.reduce((a, s) => a + s.dom, 0);
    const allL = all.filter(s => s.ls), nL = allL.reduce((a, s) => a + s.ls.n, 0), dL = allL.reduce((a, s) => a + s.ls.dom, 0);
    const xp = parts(), dX = xp.filter(p => store.partRank(p.key) >= 5).length;
    const grpPct = g => { const ss = g.ids.map(temaStats); return ss.reduce((a, s) => a + s.pct * s.n, 0) / Math.max(1, ss.reduce((a, s) => a + s.n, 0)); };
    app.innerHTML = `<h1>🗂️ El meu temari</h1>
      <p class="lead">Tot el curs separat per <b>blocs</b> i <b>temes</b> (cada tema és una llista de classe). De cada tema veus quant en domines i on. Clica un tema per veure'n el <b>resum</b>, i marca <b>Focus</b> als que vulguis treballar ara.</p>
      <div class="grid cols4">
        <div class="card stat"><b>${pc(all.reduce((x, t) => x + t.pct * t.n, 0) / nG)}%</b><span>domini global (${dG}/${nG} tipus d'exercici a Dominat)</span></div>
        <div class="card stat"><b>${nL ? pc(dL / nL) : 0}%</b><span>exercicis de llista dominats (${dL}/${nL})</span></div>
        <div class="card stat"><b>${xp.length ? pc(dX / xp.length) : 0}%</b><span>apartats d'examen dominats (${dX}/${xp.length})</span></div>
        <div class="card stat"><b>${Calc.dueCount ? Calc.dueCount() : 0}</b><span>repassos pendents avui</span></div>
      </div>
      <details class="card pctinfo" style="margin-top:12px"><summary><b>Què vol dir cada percentatge?</b></summary>
        <ul><li><b>Domini del tema</b> (el número gran): mitjana del rang de tots els tipus d'exercici del tema. Un tipus a <i>Dominat</i> compta 100%, a <i>Competent</i> 75%, a <i>Practicant</i> 60%, a <i>Aprenent</i> 40% i a <i>Iniciat</i> 20%. Puja quan encertes <b>sense ajuda</b>, en <b>dies diferents</b>, i superes els <b>repassos</b>.</li>
        <li><b>Tipus d'exercici</b>: quants tipus d'exercici (generadors amb números nous cada cop) tens a <i>Dominat</i> o més.</li>
        <li><b>Llista oficial</b>: exercicis de la llista de classe que has resolt sol diverses vegades (t'autoavalues).</li>
        <li><b>Apartats d'examen</b>: apartats d'exàmens reals d'aquest tema que domines. És el que més s'assembla a la nota.</li></ul>
        <p class="small">Detalls dels rangs a <a href="#/guia">❓ Com funciona</a>.</p></details>
      <div class="card focusbox" id="fbox"></div>
      ${GROUPS.filter(g => g.ids.length).map(g => `<section class="tgroup"><div class="tghead"><h2>${g.n ? 'Bloc ' + g.n + ' · ' : ''}${esc(g.t)}</h2><span class="chip">${esc(g.par)}</span><span class="muted">${g.q}</span><span class="spacer"></span><span class="tgpct">${pc(grpPct(g))}%</span></div>
        <div class="grid cols3">${g.ids.map(id => temaCard(id, focus)).join('')}</div></section>`).join('')}`;
    const drawFocus = () => {
      const f = getFocus(), gens = f.flatMap(id => Calc.byId[id].gens);
      $('#fbox').innerHTML = f.length
        ? `<div class="row"><b>🎯 El teu focus:</b>${f.map(id => `<span class="chip accent">${esc(Calc.byId[id].llista)}</span>`).join('')}<span class="muted small">${gens.length} tipus d'exercici</span><span class="spacer"></span><a class="btn primary" href="#/focus">▶️ Practica només això</a><button class="btn sm ghost" id="fclear">Treu el focus</button></div>`
        : `<div class="row"><b>🎯 Focus</b><span class="muted small">Marca «Focus» als temes que vols treballar ara i practica'ls barrejats (només aquests). Així controles què estudies.</span></div>`;
      const c = $('#fclear'); if (c) c.onclick = () => { setFocus([]); temariPage(); };
    };
    drawFocus();
    $$('[data-f]', app).forEach(i => i.onchange = () => { let f = getFocus(); f = i.checked ? f.concat(i.dataset.f) : f.filter(x => x !== i.dataset.f); setFocus(ORDER.filter(id => f.includes(id))); i.closest('.tcard').classList.toggle('infocus', i.checked); drawFocus(); });
    typeset(app);
  }

  /* ================================================================
     #/focus
     ================================================================ */
  function focusPage() {
    renderSide('temari');
    const f = getFocus();
    if (!f.length) { app.innerHTML = '<h1>🎯 El meu focus</h1><div class="card"><p>Encara no has triat cap tema.</p><a class="btn primary" href="#/temari">🗂️ Tria temes al temari</a></div>'; return; }
    const gens = f.flatMap(id => Calc.byId[id].gens);
    app.innerHTML = `<h1>🎯 El meu focus</h1><p class="lead">Exercicis barrejats <b>només</b> d'aquests temes: ${f.map(id => `<a class="chip accent" href="#/mod/${id}/resum">${esc(Calc.byId[id].llista)} · ${esc(U.sideName(Calc.byId[id]))}</a>`).join(' ')}. Surten més els que menys domines i els que toca repassar. <a href="#/temari">Canvia el focus</a>.</p><div id="fbody"></div>`;
    typeset(app);
    mountPractice($('#fbody'), { gens, activeId: 'temari' });
  }

  /* ================================================================
     Pestanya 📊 Resum d'un tema
     ================================================================ */
  function nextAction(s) {
    const m = s.m, gs = m.gens.slice();
    const due = gs.filter(g => store.isDue(g.key));
    if (due.length) return { t: `Repassa ${due.length === 1 ? 'el tipus que toca' : 'els ' + due.length + ' tipus que toquen'} avui`, why: 'Si no repasses quan toca, s\'oblida i el rang no puja.', href: '#/repas', btn: '🧠 Repàs del dia' };
    if (!s.tried) return { t: 'Comença per la teoria (la idea en 30 segons) i fes el primer tipus d\'exercici', why: 'Encara no has practicat res d\'aquest tema.', href: '#/mod/' + m.id + '/theory', btn: '📖 Teoria' };
    const fresh = gs.filter(g => !(store.data().gens[g.key] || {}).att).sort((a, b) => a.level - b.level || Calc.examW(b.key) - Calc.examW(a.key))[0];
    const weak = gs.filter(g => { const a = store.genAccuracy(g.key); return a != null && a < 0.5; })[0];
    if (weak) return { t: 'Reforça «' + weak.title.replace(/\$[^$]*\$/g, '…') + '»', why: 'És on més falles ara mateix: mira l\'exemple resolt i torna-hi.', href: '#/mod/' + m.id + '/practice?g=' + weak.id, btn: '✍️ Practica' };
    if (fresh) return { t: 'Prova un tipus que encara no has fet: «' + fresh.title.replace(/\$[^$]*\$/g, '…') + '»', why: 'Per dominar el tema no n\'ha de quedar cap sense provar.', href: '#/mod/' + m.id + '/practice?g=' + fresh.id, btn: '✍️ Practica' };
    if (s.ls && s.ls.dom < s.ls.n) return { t: 'Fes exercicis de la llista oficial', why: 'Són els que es fan a classe i s\'assemblen als d\'examen.', href: '#/mod/' + m.id + '/list', btn: '📋 Llista oficial' };
    if (s.xp.length && s.xdom < s.xp.length) return { t: 'Entrena els apartats d\'examen d\'aquest tema', why: 'És la prova real que el domines.', href: '#/entrena', btn: '🎓 Entrenament d\'exàmens' };
    return { t: 'Puja de rang: continua practicant en dies diferents', why: 'Els rangs alts demanen dies diferents i repassos superats.', href: '#/mod/' + m.id + '/practice', btn: '✍️ Practica' };
  }
  function resumTab(body, m) {
    const s = temaStats(m.id), st = STORY[m.id] || [], g = groupOf(m.id), C = L.CONCEPTS || {};
    $$('.onsom').forEach(o => o.remove()); // el resum ja ho diu
    const pre = (Calc.PREREQ && Calc.PREREQ[m.id]) || [], post = Object.keys(Calc.PREREQ || {}).filter(k => (Calc.PREREQ[k] || []).some(x => x[0] === m.id));
    const mini = id => { const t = temaStats(id); return `<a class="chip" href="#/mod/${id}/resum">${esc(Calc.byId[id].llista)} · ${pc(t.pct)}%</a>`; };
    const na = nextAction(s);
    // tipus d'exercici agrupats per concepte del tema
    const cs = Object.values(C).filter(c => c.mod === m.id).sort((a, b) => a.sec - b.sec), used = new Set();
    const grow = gg => { used.add(gg.key); const r = store.rank(gg.key), a = store.genAccuracy(gg.key), gd = store.data().gens[gg.key]; return `<tr><td><a href="#/mod/${m.id}/practice?g=${esc(gg.id)}">${esc(gg.title)}</a>${gg.game ? ' <span class="chip">joc</span>' : ''}</td><td>${pill(r)}</td><td>${a == null ? '<span class="muted">—</span>' : pc(a) + '%'}</td><td>${gd ? gd.att : 0}</td><td>${Calc.examChip ? Calc.examChip(gg.key) : ''}</td></tr>`; };
    let rows = '';
    cs.forEach(c => { const gs = m.gens.filter(gg => !used.has(gg.key) && (gg.needs || []).includes(c.id)); if (gs.length) rows += `<tr class="sub"><td colspan="5"><b>${esc(c.t)}</b> <a class="small" href="#/mod/${m.id}/theory?s=${c.sec}">📖 teoria</a></td></tr>` + gs.map(grow).join(''); });
    const rest = m.gens.filter(gg => !used.has(gg.key));
    if (rest.length) rows += `<tr class="sub"><td colspan="5"><b>${cs.length ? 'Altres' : 'Tipus d\'exercici'}</b></td></tr>` + rest.map(grow).join('');
    const xp = s.xp.map(p => `<tr><td>${esc(p.exam.title)}</td><td>${esc(p.title)}</td><td>${pill(store.partRank(p.key))}</td></tr>`).join('');
    body.innerHTML = `
      <div class="card whereis"><div class="row"><span class="chip accent">${g ? (g.n ? 'Bloc ' + g.n + ' · ' : '') + esc(g.t) : ''}</span><span class="chip">${esc(st[5] || (g && g.par) || '')}</span><span class="muted small">Quant surt a l'examen: ${heat(s.exw)}</span></div>
        ${st[1] ? `<h3 style="margin:8px 0 4px">❓ ${st[1]}</h3>` : ''}${L.INTRO && L.INTRO[m.id] ? `<p>${[].concat(L.INTRO[m.id])[0]}</p>` : ''}
        <div class="ogrid"><div><b>Abans cal</b><p>${pre.length ? pre.map(x => mini(x[0])).join(' ') : '—'}</p>${st[2] ? `<p class="small muted">${st[2]}</p>` : ''}</div><div><b>Després et serveix per</b><p>${post.length ? post.map(mini).join(' ') : '—'}</p>${st[3] ? `<p class="small muted">${st[3]}</p>` : ''}</div>${st[4] ? `<div><b>Per a què serveix</b><p class="small">${st[4]}</p></div>` : ''}</div></div>
      <div class="grid cols4" style="margin-top:12px">
        <div class="card stat"><b>${pc(s.pct)}%</b><span>domini del tema</span></div>
        <div class="card stat"><b>${s.dom}/${s.n}</b><span>tipus d'exercici dominats</span></div>
        <div class="card stat"><b>${s.ls ? s.ls.dom + '/' + s.ls.n : '—'}</b><span>llista oficial dominada</span></div>
        <div class="card stat"><b>${s.xp.length ? s.xdom + '/' + s.xp.length : '—'}</b><span>apartats d'examen dominats</span></div></div>
      <div class="card next-card" style="margin-top:12px"><div class="row"><div><div class="muted small" style="text-transform:uppercase;letter-spacing:.08em">Què faig ara en aquest tema?</div><h3 style="margin:2px 0">${na.t}</h3><div class="muted small">${na.why}</div></div><span class="spacer"></span><a class="btn primary" href="${na.href}">${na.btn}</a></div></div>
      <h2>Tots els tipus d'exercici del tema</h2><p class="muted small">Agrupats pel concepte de teoria que treballen. Encert = últims intents (pesa més el recent). 🔥 = quant surt a l'examen.</p>
      <div class="tablewrap card"><table class="tbl"><tr><th>Tipus d'exercici</th><th>Rang</th><th>Encert</th><th>Intents</th><th>Examen</th></tr>${rows}</table></div>
      ${xp ? `<h2 id="xparts">Apartats d'exàmens reals d'aquest tema</h2><div class="tablewrap card"><table class="tbl"><tr><th>Examen</th><th>Apartat</th><th>Rang</th></tr>${xp}</table></div><p class="small"><a href="#/entrena">🎓 Entrena'ls</a></p>` : ''}`;
    typeset(body);
    if (location.hash.includes('#xparts')) setTimeout(() => { const x = $('#xparts'); if (x) x.scrollIntoView(); }, 50);
  }
  const prevTabs = Calc.extraTabs;
  Calc.extraTabs = m => [{ id: 'resum', label: '📊 Resum', render: resumTab, first: true }].concat((prevTabs && prevTabs(m)) || []);

  /* ================================================================
     #/guia — com funciona la web
     ================================================================ */
  const CYCLE = [
    ['1', '📖', 'Entendre', 'Saber què és i per què funciona.', [['#/temari', '🗂️ El meu temari'], ['#/mapa', '🗺️ Mapa'], ['', '📊 Resum i 📖 Teoria de cada tema']], 'Quan comences un tema o quan un exercici et sona a xinès.'],
    ['2', '✍️', 'Practicar', 'Fer exercicis nous (números diferents cada cop) fins que surtin sols.', [['', '✍️ Pràctica de cada tema'], ['#/focus', '🎯 El meu focus'], ['#/jocs', '🎮 Jocs (mètode, errors, teoremes)']], 'Cada dia. És el que fa pujar els rangs.'],
    ['3', '📋', 'Llistes oficials', 'Els exercicis de classe, en paper, amb la solució verificada.', [['#/llistes', '📋 Llistes oficials']], 'Quan un tipus ja et surt: comprova que saps fer els de veritat.'],
    ['4', '🧠', 'Consolidar', 'Repassar just quan t\'ho demana el sistema (abans que s\'oblidi).', [['#/repas', '🧠 Repàs del dia'], ['#/review', '🔁 Repàs d\'errors']], 'Cada dia, primer de tot (5–15 min).'],
    ['5', '🎓', 'Examen', 'Resoldre exàmens reals i simulacres amb temps, i corregir-te el procediment.', [['#/entrena', '🎓 Entrenament d\'exàmens'], ['#/p2/sim', '⏱️ Simulacre 2n parcial'], ['#/cobertura', '✅ Res nou a l\'examen']], 'Quan un bloc està a Competent o més, i un simulacre per setmana.']
  ];
  function guiaPage() {
    renderSide('guia');
    const RP = Calc.RANK_PTS || [], RD = Calc.RANK_DAYS || [], RR = Calc.RANK_REVS || [];
    app.innerHTML = `<h1>❓ Com funciona la web</h1>
      <p class="lead">Tot el que hi ha aquí serveix per a un dels 5 passos del cicle d'estudi. Si no saps què fer, segueix el cicle d'esquerra a dreta per a cada tema. Cada pàgina té a dalt la franja <b>🧭</b> que et diu en quin pas ets.</p>
      <div class="cycle">${CYCLE.map(c => `<div class="cstep"><div class="cnum">${c[0]}</div><div class="cico">${c[1]}</div><h3>${c[2]}</h3><p class="small">${c[3]}</p><div class="clinks">${c[4].map(([h, t]) => h ? `<a href="${h}">${t}</a>` : `<span class="muted">${t}</span>`).join('')}</div><p class="small muted"><b>Quan:</b> ${c[5]}</p></div>`).join('<div class="carrow">→</div>')}</div>
      <h2>Com està organitzat el contingut</h2>
      <div class="card"><div class="hier"><div><b>Bloc</b><span class="small muted">4 blocs del curs + fonaments (p. ex. «Càlcul integral»)</span></div><div class="harr">⊃</div><div><b>Tema</b><span class="small muted">una llista de classe (p. ex. «L8 · Fraccions simples»)</span></div><div class="harr">⊃</div><div><b>Concepte</b><span class="small muted">una secció de teoria (p. ex. «Càlcul de les constants»)</span></div><div class="harr">⊃</div><div><b>Tipus d'exercici</b><span class="small muted">un generador amb números nous cada cop, amb rang propi</span></div></div>
      <p class="small">A més: <b>exercicis de llista</b> (els de classe) i <b>apartats d'examen</b> (els dels exàmens reals) també tenen rang. Al <a href="#/temari">temari</a> veus els tres per a cada tema.</p></div>
      <h2>Rangs: què cal per pujar</h2>
      <div class="tablewrap card"><table class="tbl"><tr><th>Rang</th><th>Punts</th><th>Dies diferents</th><th>Repassos superats</th><th>Compta al %</th></tr>${RANKS.map((r, i) => `<tr><td>${pill(i)}</td><td>${RP[i] != null ? RP[i] : ''}</td><td>${RD[i] || '—'}</td><td>${RR[i] || '—'}</td><td>${Calc.RANK_VAL ? pc(Calc.RANK_VAL[i]) + '%' : ''}</td></tr>`).join('')}</table></div>
      <p class="small">+1 punt per encert a la primera i sense ajuda (marcant ✔ Segur); −1 per error. Amb pista o amb 🤔 Dubto: XP però cap punt. Un tipus «toca repàs» quan ha passat el temps que diu el rang: si l'encertes, compta com a repàs superat.</p>
      <h2>Percentatges</h2>
      <div class="card"><ul><li><b>Domini d'un tema</b>: mitjana del valor del rang de tots els seus tipus d'exercici (taula de dalt, columna «Compta al %»).</li><li><b>Domini d'un bloc</b>: el mateix, amb tots els tipus d'exercici del bloc.</li><li><b>Mapa (conceptes)</b>: un concepte es posa verd quan els 3 millors tipus d'exercici que el fan servir tenen un domini mitjà ≥ 80%.</li><li><b>X/Y dominats</b>: quants elements estan a <i>Dominat</i> o <i>Mestre</i>.</li></ul></div>`;
    typeset(app);
  }

  /* ================================================================
     Franja «🧭 Per a què serveix aquesta pàgina»
     ================================================================ */
  const STEP = ['', '📖 Entendre', '✍️ Practicar', '📋 Llistes', '🧠 Consolidar', '🎓 Examen', '📚 Consultar', '🏠 Orientar-te'];
  const PURPOSE = [
    [/^#\/?$/, 7, 'Resum del dia i suggeriment de què fer.', 'Quan obres la web.'],
    [/^#\/temari/, 7, 'Tot el curs separat per blocs i temes, amb què domines de cada un. Tria el teu focus.', 'Per decidir què estudies.'],
    [/^#\/guia/, 7, 'Explica cada part de la web i què vol dir cada percentatge.', 'Quan dubtes per a què serveix una cosa.'],
    [/^#\/mapa/, 1, 'Com es relacionen els conceptes i els temes (què cal saber abans de què).', 'Quan un tema et costa: mira què hi ha a sota i repassa-ho.'],
    [/^#\/curs/, 7, 'La guia docent: blocs, notes i com es calcula la nota final.', 'Per entendre què compta.'],
    [/^#\/cami/, 7, 'Un ordre recomanat per recórrer el temari.', 'Si no saps per quin tema començar.'],
    [/^#\/nivell/, 7, 'Test curt per saber quins fonaments tens frescos.', 'Al principi, un cop.'],
    [/^#\/mestria/, 7, 'El teu esforç en números: rangs, XP, ratxa i assoliments.', 'Per veure el progrés.'],
    [/^#\/mod\/\w+\/resum/, 1, 'Tot sobre aquest tema: on és del curs, per a què serveix, què domines i què et toca fer.', 'Quan entres a un tema.'],
    [/^#\/mod\/\w+\/theory/, 1, 'La teoria del tema, per seccions, amb el que cal saber abans.', 'Abans de practicar un tipus nou, o quan falles per no entendre-ho.'],
    [/^#\/mod\/\w+\/test/, 2, 'Preguntes de test del tema (com les de l\'examen).', 'Per comprovar que reconeixes els conceptes.'],
    [/^#\/mod\/\w+\/list/, 3, 'Els exercicis de la llista de classe d\'aquest tema, amb mestria per exercici.', 'Quan ja et surten els tipus d\'exercici.'],
    [/^#\/mod\/\w+\/exams/, 5, 'Què ha sortit d\'aquest tema als exàmens.', 'Per saber què et demanaran.'],
    [/^#\/mod\//, 2, 'Exercicis nous d\'aquest tema, amb correcció immediata. Cada tipus té el seu rang.', 'Cada dia: és el que fa pujar el domini.'],
    [/^#\/focus/, 2, 'Practica barrejat només els temes que has triat.', 'Quan vols concentrar-te en uns temes concrets.'],
    [/^#\/(practice|mix)/, 2, 'Exercicis barrejats de diversos temes (com a l\'examen, on no et diuen el tema).', 'Quan ja tens els temes treballats per separat.'],
    [/^#\/jocs|^#\/joc\//, 2, 'Jocs que entrenen el que fer exercicis no entrena: velocitat, reconèixer el mètode, trobar errors, teoremes.', 'Per escalfar o quan estàs cansat.'],
    [/^#\/teoremes/, 1, 'Enunciats exactes dels teoremes: tapa\'ls, escriu-los i compara.', 'Abans de l\'examen i quan un exercici diu «justifica».'],
    [/^#\/eines/, 2, 'Les eines de base que surten dins de cada exercici del 2n parcial.', 'Si falles integrals per culpa de l\'àlgebra o les derivades.'],
    [/^#\/llistes/, 3, 'Totes les llistes de classe, amb el teu progrés.', 'Per triar quina llista fer.'],
    [/^#\/repas/, 4, 'El que toca repassar avui perquè no s\'oblidi.', 'Cada dia, primer de tot.'],
    [/^#\/review/, 4, 'Els exercicis que has fallat, per tornar-los a fer.', 'Després de practicar o d\'un examen.'],
    [/^#\/cobertura/, 5, 'Cada apartat dels exàmens reals amb el tipus d\'exercici que l\'entrena.', 'Per assegurar que res de l\'examen et serà nou.'],
    [/^#\/entrena/, 5, 'Apartats d\'exàmens reals, un per un, amb mestria i repàs espaiat.', 'Quan un tema ja és a Competent.'],
    [/^#\/p2\/sim|^#\/p1\/sim/, 5, 'Simulacre complet amb temps i format real.', 'Un per setmana; l\'última setmana, més.'],
    [/^#\/exam/, 5, 'Examen generat amb els temes que triïs.', 'Per provar-te barrejat.'],
    [/^#\/(formulari|p1\/teoria|p1\/guia|p1\/resolts|p1\/chuleta|grafica|recursos)/, 6, 'Material de consulta.', 'Quan necessites mirar una fórmula o un exemple.'],
    [/^#\/p1\/test/, 2, 'Banc de preguntes de test de tot el curs.', 'Per entrenar el format test.'],
    [/^#\/p[12]\/temes/, 5, 'Quins temes surten més als exàmens.', 'Per prioritzar.'],
    [/^#\/p[12]/, 5, 'Exàmens reals resolts.', 'Per veure el format i entrenar-los.'],
    [/^#\/(formulari|p1\/teoria|p1\/guia|p1\/resolts|p1\/chuleta|grafica|recursos)/, 6, 'Material de consulta.', 'Quan necessites mirar una fórmula o un exemple.']
  ];
  function purposeFor(h) { return PURPOSE.find(p => p[0].test(h)); }
  function stripHtml(h) {
    const p = purposeFor(h); if (!p) return '';
    let where = '';
    const mm = h.match(/^#\/mod\/(\w+)/);
    if (mm && Calc.byId[mm[1]]) { const g = groupOf(mm[1]), s = temaStats(mm[1]); where = `<span class="pwhere">${g ? (g.n ? 'Bloc ' + g.n + ' · ' : '') + esc(g.t) + ' › ' : ''}<b>${esc(Calc.byId[mm[1]].llista)}</b> · ${pc(s.pct)}%</span>`; }
    return `<span class="pustep">${STEP[p[1]]}</span>${where}<span class="ptxt">${p[2]}</span><span class="pwhen">⏱ ${p[3]}</span><a class="phelp" href="#/guia" title="Com funciona la web">?</a>`;
  }
  let lastStrip = '';
  function ensureStrip() {
    const a = document.getElementById('app'); if (!a) return;
    const html = stripHtml(location.hash || '#/');
    let s = a.querySelector(':scope > .purpose');
    if (!html) { if (s) s.remove(); return; }
    if (s && s === a.firstElementChild && s.dataset.h === location.hash && lastStrip === html) return;
    if (!s) { s = document.createElement('div'); s.className = 'purpose'; }
    s.innerHTML = html; s.dataset.h = location.hash; lastStrip = html;
    if (a.firstElementChild !== s) a.insertBefore(s, a.firstChild);
  }
  Calc.ensureStrip = ensureStrip;
  try { new MutationObserver(() => ensureStrip()).observe(document.getElementById('app'), { childList: true }); } catch (e) { /* sense observer */ }
  window.addEventListener('hashchange', () => setTimeout(ensureStrip, 0));

  /* ---------------- Rutes ---------------- */
  Calc.routes.push({ re: /^#\/temari/, fn: temariPage });
  Calc.routes.push({ re: /^#\/focus/, fn: focusPage });
  Calc.routes.push({ re: /^#\/guia/, fn: guiaPage });
  U.route();
  ensureStrip();
})();
