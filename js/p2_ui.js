/* ===================================================================
   p2_ui.js — Exàmens reals del 2n Parcial (integrals i EDOs):
   llistat, cada examen amb solucions pas a pas i autoavaluació
   per apartat (dona XP), i «Què surt al 2n parcial».
   Dades: p2/data/exams_p2.js. Reutilitza les peces de p1_ui.js.
   =================================================================== */
(function () {
  'use strict';
  if (!window.CalcUI || !Calc.examKit) return;
  const U = CalcUI, $ = U.$, $$ = U.$$, esc = U.esc, app = U.app, K = Calc.examKit, el = K.el, ls = K.ls;
  const has = n => { try { return typeof (0, eval)(n) !== 'undefined'; } catch (e) { return false; } };
  const EXAMS = has('P2_EXAMS') ? P2_EXAMS : [], TOPICS = has('P2_TOPICS') ? P2_TOPICS : [], COLS = has('P2_COLS') ? P2_COLS : [];
  const P2 = Calc.P2_IDS || ['l7', 'l8', 'l9', 'l10', 'l11', 'l12', 'l13'];
  const listName = id => 'Llista ' + id.slice(1);
  const DONE = 'calcmaster.p2done';

  /* Les preguntes de test reals del 2n parcial passen als bancs de les llistes */
  EXAMS.forEach(e => (e.test || []).forEach(q => {
    const m = Calc.byId[q.t]; if (!m || q.correct < 0) return;
    if (m.bank.some(b => b.q === q.q)) return;
    m.bank.push({ q: q.q, c: q.options, a: q.correct, e: q.exp, p2: true, src: e.title, mod: m.id });
  }));

  /* Comptadors d'apartats: cada apartat i cada pregunta de test tenen una clau */
  const items = e => {
    const out = [];
    (e.test || []).forEach((q, k) => out.push({ key: e.id + ':t' + k, t: [q.t] }));
    (e.problems || []).forEach((p, pi) => p.parts.forEach((part, k) => out.push({ key: e.id + ':' + pi + ':' + k, t: part.t || [] })));
    return out;
  };
  const prog = e => { const it = items(e).map(i => 'P2:' + i.key), st = Calc.store; return { n: it.length, done: it.filter(k => st.part(k)).length, ok: it.filter(k => st.partRank(k) >= 5).length, due: it.filter(k => st.partDue(k)).length }; };

  /* ------------------------------------------------------------------ */
  function hub() {
    U.renderSide('p2exams');
    const tot = EXAMS.reduce((a, e) => { const p = prog(e); a.n += p.n; a.d += p.done; a.ok += p.ok; return a; }, { n: 0, d: 0, ok: 0 });
    const modRow = id => {
      const m = Calc.byId[id]; if (!m) return '';
      const mm = Calc.store.modMastery(m), v = U.pct(mm.value);
      return `<a class="p2mod" href="#/mod/${id}/practice"><span class="num">${esc(m.num)}</span><span class="t">${esc(U.sideName(m))}</span><span class="mbar1"><i class="r4" style="width:${v}%"></i></span><b>${v}%</b></a>`;
    };
    app.innerHTML = `<h1>🔥 Exàmens reals del 2n parcial</h1>
      <p class="lead">Integrals (Llistes 7–9) i equacions diferencials (Llistes 10–13). ${EXAMS.length} exàmens amb la solució pas a pas, comprovada numèricament. Fes-los en paper, obre la solució i marca com t'ha anat. Cada apartat té el seu rang: per dominar-lo l'has de treure net diverses vegades en dies diferents. L'<a href="#/entrena">🎓 Entrenament d'exàmens</a> te'ls va posant quan toca.</p>
      <div class="card"><div class="row"><div><b>${tot.d}/${tot.n}</b> apartats treballats · <b>${tot.ok}</b> dominats</div><span class="spacer"></span><a class="btn" href="#/p2/temes">📈 Què surt més</a><a class="btn" href="#/eines">🧰 Eines per integrar</a><button class="btn primary" id="p2gen">📝 Examen generat del 2n parcial</button></div>
        <div class="mbar1" style="margin-top:10px"><i class="r4" style="width:${tot.n ? Math.round(100 * tot.d / tot.n) : 0}%"></i></div></div>
      <h2>Exàmens</h2>
      <div class="grid cols2">${EXAMS.map(e => {
    const p = prog(e), done = ls.get(DONE, {})[e.id];
    return `<a class="card examcard ${e.hot ? 'hot' : ''}" href="#/p2/exam/${e.id}"><div class="row"><b>${esc(e.title)}</b><span class="spacer"></span>${done ? '<span class="chip ok">✓ fet</span>' : ''}</div><div class="row"><span class="chip ${e.hot ? 'warn' : ''}">${esc(e.tag)}</span></div><div class="muted" style="font-size:.88rem">${p.n} apartats · ${p.done} treballats · ${p.ok} dominats${p.due ? ' · <b>' + p.due + ' per repassar</b>' : ''}</div><div class="mbar1" style="margin-top:6px"><i class="r4" style="width:${p.n ? Math.round(100 * p.done / p.n) : 0}%"></i></div></a>`;
  }).join('')}</div>
      <h2>El teu domini de les llistes del 2n parcial</h2>
      <div class="card">${P2.map(modRow).join('')}</div>
      <p class="muted small">Recorda: la nota del 2n parcial compta un 40%. Si el 1r parcial t'ha anat malament, aquí és on es recupera terreny (mira-ho a <a href="#/mestria">Mestria › Objectiu: aprovar</a>).</p>`;
    $('#p2gen').onclick = () => { U.examConfig.cfg = { mods: P2.filter(id => Calc.byId[id]), fmt: 'mixt', n: 10, min: 90, hard: true }; location.hash = '#/exam'; };
  }

  function examPage(id) {
    U.renderSide('p2exams');
    const e = EXAMS.find(x => x.id === id);
    if (!e) { app.innerHTML = '<p>Examen no trobat. <a href="#/p2">Tornar</a></p>'; return; }
    const i = EXAMS.indexOf(e), prev = EXAMS[i + 1], next = EXAMS[i - 1], done = ls.get(DONE, {}), pf = e.pdf || [];
    app.innerHTML = `<div class="crumbs"><a href="#/">Inici</a> › <a href="#/p2">Exàmens del 2n parcial</a> › ${esc(e.title)}</div>
      <div class="row"><h1>${esc(e.title)}</h1><span class="spacer"></span><label class="chk"><input type="checkbox" id="exdone" ${done[id] ? 'checked' : ''}> examen fet</label></div>
      <p class="muted">📋 ${esc(e.format)}</p>
      ${pf.length ? '<div class="row">' + pf.map((f, k) => `<a class="btn sm" target="_blank" rel="noopener" href="${K.pdf(f)}">📄 PDF original${pf.length > 1 ? ' ' + (k + 1) : ''}</a>`).join('') + '</div>' : ''}
      <div class="card" id="p2prog"></div><div id="exbody"></div>
      <div class="row" style="margin-top:22px">${prev ? `<a class="btn" href="#/p2/exam/${prev.id}">← ${esc(prev.title)}</a>` : ''}<span class="spacer"></span>${next ? `<a class="btn" href="#/p2/exam/${next.id}">${esc(next.title)} →</a>` : ''}</div>`;
    $('#exdone').onchange = ev => { const d = ls.get(DONE, {}); if (ev.target.checked) d[id] = 1; else delete d[id]; ls.set(DONE, d); };
    const updProg = () => { const p = prog(e); $('#p2prog').innerHTML = `<div class="row"><span><b>${p.done}/${p.n}</b> apartats treballats · <b>${p.ok}</b> dominats</span><span class="spacer"></span><span class="muted small">resolt sol +15 XP · a mitges +6 · no me n'he sortit +3 (un cop al dia per apartat)</span></div><div class="mbar1" style="margin-top:8px"><i class="r4" style="width:${p.n ? Math.round(100 * p.done / p.n) : 0}%"></i></div>`; };
    updProg();
    const host = $('#exbody');
    const topicRow = ts => el('div', 'row', '<span class="muted small">Tema:</span>' + ts.filter(t => Calc.byId[t]).map(t => `<button type="button" class="ref" data-theory="${t}" title="Obre la teoria al costat">${listName(t)} · ${esc(U.sideName(Calc.byId[t]))}</button><a class="chip" href="#/mod/${t}/practice">Practicar</a>`).join(''));
    const selfBox = key => Calc.exBox('P2:' + key, updProg);
    if (e.test && e.test.length) {
      host.appendChild(el('h2', null, 'Preguntes de test <span class="muted small">(clica una opció: es corregeix a l\'instant)</span>'));
      e.test.forEach((q, k) => {
        const blk = K.mcBlock(K.prepMC(q, false), k + 1, 'instant'), key = e.id + ':t' + k;
        Calc.exAutoMC(blk, 'P2:' + key, q.correct); $$('.xopt', blk).forEach(o => o.addEventListener('click', () => setTimeout(updProg, 0)));
        blk.appendChild(topicRow([q.t])); host.appendChild(blk);
      });
    }
    (e.problems || []).forEach((p, pi) => {
      const c = el('div', 'card exprob'); c.appendChild(el('h3', null, esc(p.title)));
      if (p.statement) c.appendChild(el('div', 'qtext', p.statement));
      p.parts.forEach((part, k) => {
        const pp = el('div', 'exampart'); pp.appendChild(el('div', 'qtext', part.q));
        pp.appendChild(topicRow(part.t || []));
        pp.appendChild(K.solToggle(part.sol)); pp.appendChild(selfBox(e.id + ':' + pi + ':' + k)); c.appendChild(pp);
      });
      host.appendChild(c);
    });
    K.render(app);
  }

  /* ------------------------------------------------------------------ */
  function temesPage() {
    U.renderSide('p2temes');
    const N = COLS.length;
    const TIER = { S: ['Surt gairebé sempre', 'Prioritat màxima'], A: ['Surt molt sovint (sovint dins d\'un altre exercici)', 'Molt important'], B: ['Surt de tant en tant', 'Important'], C: ['No ha sortit encara', 'Llegeix-ho un cop'] };
    const card = t => {
      const n = t.seen.length;
      return `<div class="topic t${t.tier}"><div class="topic-h"><span class="tier t${t.tier}">${t.tier}</span><div class="topic-t"><b>${esc(t.topic)}</b><div class="muted small">${t.lists.map(listName).join(', ')}</div></div><div class="freq" title="Ha sortit a ${n} de ${N} exàmens"><b>${n}/${N}</b><span>exàmens</span></div></div>
        <div class="freqbar"><i style="width:${Math.round(100 * n / N)}%"></i></div>
        <div class="years">${COLS.map(([id, name]) => `<span class="yr ${t.seen.indexOf(id) >= 0 ? 'on' : ''}" title="${t.seen.indexOf(id) >= 0 ? 'Va sortir' : 'No va sortir'}: ${esc(name)}">${esc(name)}</span>`).join('')}</div>
        <p>${t.why}</p><div class="row">${t.lists.filter(id => Calc.byId[id]).map(id => `<a class="chip" href="#/mod/${id}/practice">Practicar ${listName(id)}</a><button type="button" class="ref" data-theory="${id}">Teoria</button>`).join('')}</div></div>`;
    };
    app.innerHTML = `<h1>📈 Què surt al 2n parcial</h1><p class="lead">Temes ordenats per com de sovint han sortit als ${N} exàmens del 2n parcial que tenim (inclosa la recuperació de 2024). Amb només ${N} exàmens és una pista, no una garantia: el professorat pot preguntar qualsevol cosa de la guia docent.</p>
      <div class="legend">${Object.keys(TIER).map(k => `<span><span class="tier t${k}">${k}</span> ${TIER[k][0]}</span>`).join('')}</div>` +
      Object.keys(TIER).map(k => { const ts = TOPICS.filter(t => t.tier === k); return ts.length ? `<h2><span class="tier t${k}">${k}</span> ${TIER[k][1]}</h2><div class="topics">${ts.map(card).join('')}</div>` : ''; }).join('');
    K.render(app);
  }

  /* ------------------------------------------------------------------
     Eines per integrar: el mínim del 1r parcial que fan servir les llistes 7–13
     ------------------------------------------------------------------ */
  const TOOLS = [
    ['base.dertable', 'Integrar és derivar al revés: si no reconeixes $(\\sin x)\'=\\cos x$, no veuràs que $\\int\\cos x=\\sin x$.'],
    ['base.inttable', 'La taula de primitives: la fas servir a cada exercici de les llistes 7–13.'],
    ['l2.d_chain', 'El canvi de variable és la regla de la cadena al revés. També el TFC amb límits $x^3$, $x^4$…'],
    ['l2.d_product', 'La integració per parts és la regla del producte al revés.'],
    ['base.factor', 'Les fraccions simples comencen factoritzant el denominador (Ruffini).'],
    ['base.quad', 'Polinomi característic de les EDOs de 2n ordre: arrels reals, doble o complexes.'],
    ['base.logs', 'Les EDOs separables acaben amb $\\ln|y|=\\dots$ i cal aïllar amb exponencials.']
  ];
  function einesPage() {
    U.renderSide('eines');
    const gens = TOOLS.map(([k]) => Calc.genByKey(k)).filter(Boolean);
    const rk = k => { const r = Calc.store.rank(k); return `<span class="rk r${r}">${esc(Calc.RANKS[r])}</span>`; };
    const ready = gens.filter(g => Calc.store.rank(g.key) >= 3).length;
    app.innerHTML = `<h1>🧰 Eines per integrar</h1>
      <p class="lead">Aquestes ${gens.length} habilitats de la base i del 1r parcial surten <b>dins de cada exercici</b> del 2n parcial: són les més urgents. Ara en tens <b>${ready}/${gens.length}</b> a Practicant o més. La resta del 1r parcial també s'ha de dominar (és base i entra a la recuperació): ho trobaràs al temari i a la pràctica barrejada.</p>
      <div class="card">${TOOLS.filter(([k]) => Calc.genByKey(k)).map(([k, why]) => { const g = Calc.genByKey(k); return `<div class="toolrow"><div><b>${esc(g.title)}</b> ${rk(k)}<div class="muted small">${why}</div></div></div>`; }).join('')}</div>
      <h2>Practica-les barrejades</h2><div id="pbody"></div>`;
    K.render(app);
    U.mountPractice($('#pbody'), { gens, activeId: 'eines' });
  }

  const R = (re, fn) => Calc.routes.push({ re, fn });
  R(/^#\/p2\/?$/, hub);
  R(/^#\/p2\/exams\/?$/, hub);
  R(/^#\/p2\/exam\/(\w+)/, m => examPage(m[1]));
  R(/^#\/p2\/temes/, temesPage);
  R(/^#\/eines/, einesPage);

  /* Targeta a l'inici, al costat de la del 1r parcial */
  const prevExtra = Calc.dashExtra;
  Calc.dashExtra = () => `<div class="card p1banner" style="margin-top:16px"><div class="row"><div><div class="muted" style="font-size:.8rem;text-transform:uppercase;letter-spacing:.08em">2n Parcial</div><h3 style="margin:2px 0">🔥 Exàmens reals del 2n parcial</h3><div class="muted">Integrals i EDOs: ${EXAMS.length} exàmens resolts pas a pas, i el que surt més.</div></div><span class="spacer"></span><a class="btn primary" href="#/p2">Obrir</a><a class="btn" href="#/p2/temes">📈 Què surt</a></div></div>` + (prevExtra && !(Calc.focusOn && Calc.focusOn()) ? prevExtra() : '');

  U.route();
})();
