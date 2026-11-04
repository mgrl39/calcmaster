/* ===================================================================
   listtrain.js — Les llistes oficials (L0–L13), cada una amb el seu
   apartat per practicar-la exercici per exercici, amb mestria.
   · Pestanya «📋 Llista oficial» a TOTES les llistes (abans només L0–L5).
   · Mode «Entrenar»: un exercici cada vegada (primer els que toca
     repassar, després els nous, després els més fluixos).
   · Mode «Tota la llista»: tots els exercicis amb la seva caixa de mestria.
   · Pàgina #/llistes: totes les llistes amb el seu progrés.
   Cada exercici té rang com un apartat d'examen (store.markPart):
   per dominar-lo l'has de resoldre net en dies diferents.
   La llista 13 és el final de gener de 2025: comparteix la mestria
   amb la pàgina de l'examen (mateixes claus P2:2025:…).
   =================================================================== */
(function () {
  'use strict';
  if (!window.CalcUI || !Calc.examKit || !Calc.exBox) return;
  const U = CalcUI, $ = U.$, $$ = U.$$, esc = U.esc, app = U.app, K = Calc.examKit, el = K.el, store = Calc.store, RANKS = Calc.RANKS;
  const has = n => { try { return typeof (0, eval)(n) !== 'undefined'; } catch (e) { return false; } };
  const L1 = has('CLASS_LISTS') ? CLASS_LISTS : [], L2 = has('CLASS_LISTS_P2') ? CLASS_LISTS_P2 : [];
  const modOf = id => 'l' + String(id).replace(/\D/g, '');
  const pill = r => `<span class="rk r${r}">${RANKS[r]}</span>`;
  const today = () => Calc.dayStr(new Date());
  const EXG = Calc.EXGEN || {};

  const PDF = { l0: 'llista0.pdf', l1: 'llista1.pdf', l2: 'llista2.pdf', l3: 'llista3.pdf', l4: 'Hoja4.pdf', l5: 'Hoja5.pdf' };

  const R13 = "És <b>un examen real sencer</b>: el que hi practiques compta també a l'<a href=\"#/entrena\">Entrenament d'exàmens</a> (és el mateix progrés).";

  /* Llistes 0–5: cada exercici → el tipus d'exercici (generador) que l'entrena */
  const P1G = {
    L0: { '1': 'l0.p1_inequality', '2': 'l0.ineq_abs', '3': 'l0.ineq_abs', '4': 'l0.lines', '5–6': 'l0.lines', '7': 'l0.domain', '8–10': 'l0.transform', '11': 'l0.compose', '12': 'l0.p1_expQuadratic', '13–14': 'base.logs', '15–18': 'base.trig_eq' },
    L1: { '1': 'l1.bolzano_vals', '2': 'l1.bolzano_mc', '3': 'l1.p1_bolzano', '4': 'l1.limit_lateral', '5': 'l1.p1_continuity', '6': 'l1.cont_param', '7': 'l1.cont_param', '8': 'l1.cont_two', '9 (a–h)': 'l1.limit_factor', '9 (i–p)': 'l1.limit_inf', '10': 'l1.limit_factor', '11': 'l1.tangent', '12': 'l1.tangent_ext' },
    L2: { '1 (a–h)': 'l2.d_mixed', '1 (i–p)': 'l2.d_chain', '1 (q–t)': 'l2.d_logdiff', '2': 'l2.d_chain', '3': 'l2.d_related', '4': 'l2.tvm', '5': 'l2.tvm', '6': 'l2.d_implicit', '7': 'l2.tvm', '8': 'l2.roots_count', '9': 'l2.roots_count' },
    L3: { '1(a)': 'l3.crit_rational', '1(b)': 'l3.monotony', '1(c)': 'l3.monotony', '1(d)': 'l3.monotony', '2': 'l3.crit_cubic', '3': 'l3.crit_exp', '4': 'l3.monotony', '5': 'l3.optim_page', '6': 'l3.optim_basic', '7': 'l3.inflection', '8': 'l3.inflection', '9': 'l3.inflection', '10': 'l3.abs_extrema' },
    L4: { '1(a)': 'l4.asymp_oblique', '1(b)': 'l4.asymp_oblique', '1(c)': 'l4.p1_functionStudy', '1(d)': 'l4.p1_functionStudy', '1(e)': 'l4.p1_functionStudy', '1(f)': 'l4.p1_functionStudy', '2': 'l4.asymp_vert', '3': 'l4.asymp_vert', '4': 'l4.lhop_diff', '5': 'l4.lhop_pow', '6': 'l4.lhop_param' },
    L5: { '1': 'l5.coef', '2': 'l5.poly0', '3': 'l5.value', '4': 'l5.value', '5': 'l5.degree' }
  };

  /* ---------- Totes les llistes, amb els exercicis normalitzats ---------- */
  let ALL = null;
  function lists() {
    if (ALL) return ALL;
    ALL = [];
    L1.concat(L2).forEach(L => {
      const mid = modOf(L.id); if (!Calc.byId[mid]) return;
      ALL.push({ mid, L, title: L.title, short: L.short || ('Llista ' + mid.slice(1)), stars: L.stars || 1, topic: L.topic, exam: L.exam, pdf: L.pdf || PDF[mid], p2: L2.includes(L),
        items: L.items.map(it => ({ key: 'L:' + L.id + ':' + it.n, n: 'Exercici ' + it.n, q: it.q, sol: it.sol, check: it.check, g: it.g || (P1G[L.id] && P1G[L.id][it.n]) })) });
    });
    // L13 = final de gener de 2025 (mateixos apartats que la pàgina de l'examen)
    if (Calc.byId.l13 && Calc.examParts) {
      const ps = Calc.examParts().filter(p => p.par === 2 && p.exam.id === '2025');
      if (ps.length) ALL.push({ mid: 'l13', title: 'Llista 13 — Final de gener de 2025 (format examen)', short: 'Llista 13', stars: 3, p2: true, exam13: ps[0].exam, pdf: 'llista13.pdf',
        topic: "És l'examen final de gener de 2025 complet: preguntes de test, EDOs (separable, lineal, 2n ordre), fraccions simples i volum de revolució.",
        exam: R13, items: ps.map(p => ({ key: p.key, n: p.title, statement: p.statement, q: p.q, sol: p.sol, mc: p.mc })) });
    }
    ALL.sort((a, b) => +a.mid.slice(1) - +b.mid.slice(1));
    return ALL;
  }
  const listOf = mid => lists().find(x => x.mid === mid);
  Calc.listOf = listOf;

  /* Migració: els antics «fet» (casella) passen a ser un primer encert */
  (function migrate() {
    try {
      if (localStorage.getItem('calcmaster.p1done.mig')) return;
      const old = JSON.parse(localStorage.getItem('calcmaster.p1done') || '{}'), d = store.data(), now = Date.now();
      Object.keys(old).forEach(k => {
        if (!old[k]) return; const key = 'L:' + k; if (d.xparts[key]) return;
        const x = { pts: 1, days: 1, n: 1, due: now, okDay: null, day: null, mark: null, best: 0 };
        x.best = Calc.partRankOf(x); d.xparts[key] = x;
      });
      store.save(); localStorage.setItem('calcmaster.p1done.mig', '1');
    } catch (e) { /* res */ }
  })();

  /* ---------- Estadístiques i cua ---------- */
  function stats(X) {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    X.items.forEach(it => counts[store.partRank(it.key)]++);
    return { n: X.items.length, counts, dom: counts[5] + counts[6], tried: X.items.filter(it => store.part(it.key)).length, due: X.items.filter(it => store.partDue(it.key)).length };
  }
  Calc.listStats = mid => { const X = listOf(mid); return X ? stats(X) : null; };
  Calc.listsDueCount = () => lists().reduce((a, X) => a + (X.mid === 'l13' ? 0 : stats(X).due), 0); // L13 ja compta a l'entrenament d'exàmens
  const bar = s => `<div class="mbar">${[6, 5, 4, 3, 2, 1].map(r => s.counts[r] ? `<i class="r${r}" style="width:${s.counts[r] / s.n * 100}%" title="${RANKS[r]}: ${s.counts[r]}"></i>` : '').join('')}</div>`;
  function queue(X) {
    const now = Date.now();
    const score = (it, i) => {
      const x = store.part(it.key);
      if (!x) return 500 - i;                                        // nous, en l'ordre de la llista
      if (x.due <= now) return 1000 + Math.min(100, (now - x.due) / 864e5) - x.best * 10;
      return 100 - x.best * 10 - (x.due - now) / 864e6;
    };
    return X.items.map((it, i) => ({ it, s: score(it, i) })).sort((a, b) => b.s - a.s).map(o => o.it);
  }

  /* ---------- Una targeta d'exercici ---------- */
  function itemCard(X, it, onDone) {
    const x = store.part(it.key), c = el('div', 'card litem exprob');
    c.appendChild(el('div', 'row', `<span class="chip accent">${esc(it.n)}</span>${!x ? '<span class="chip">nou</span>' : x.due <= Date.now() ? '<span class="chip warn">toca repàs</span>' : ''}<span class="spacer"></span>${pill(x ? x.best : 0)}`));
    if (it.statement) c.appendChild(el('div', 'muted', it.statement));
    if (it.mc) {
      const item = K.prepMC(it.mc, true), blk = K.mcBlock(item, '', 'instant');
      $$('.xopt', blk).forEach((o, oi) => o.addEventListener('click', () => {
        const xx = store.part(it.key); if (xx && xx.day === today()) return;
        const info = store.markPart(it.key, oi === item.correctPos ? 2 : 0); if (Calc.afterPart) Calc.afterPart(info); U.renderTop(); if (onDone) onDone(info);
      }));
      c.appendChild(blk); if (EXG[it.key]) c.appendChild(el('div', '', Calc.genLink(EXG[it.key]))); K.render(c); return c;
    }
    c.appendChild(el('div', 'qtext', it.q));
    if (it.check && window.M && M.checkNum) {
      const r = el('div', 'row chkrow', `<label>${esc(it.check.label)}</label><input class="ans" placeholder="el teu resultat" autocomplete="off" spellcheck="false"><button class="btn sm primary" type="button">Comprova</button><span class="chkres"></span>`);
      $('button', r).onclick = () => {
        const v = $('input', r).value.trim(), out = $('.chkres', r);
        if (!v) { out.textContent = ''; return; }
        const g = M.checkNum(v, it.check.value, it.check.tol || 1e-3);
        out.innerHTML = g.parseError ? '… no ho entenc' : g.ok ? '✅ correcte' : '❌ encara no';
        out.className = 'chkres ' + (g.ok ? 'okc' : 'badc');
      };
      $('input', r).addEventListener('keydown', e => { if (e.key === 'Enter') $('button', r).click(); });
      c.appendChild(r);
    }
    c.appendChild(K.solToggle(it.sol));
    c.appendChild(Calc.exBox(it.key, onDone, { what: "Exercici de la llista" }));
    if (it.g) { const gk = it.g.includes('.') ? it.g : X.mid + '.' + it.g; const h = Calc.genLink(gk, 'Més exercicis com aquest (infinits, amb correcció):'); if (h) c.appendChild(el('div', '', h)); }
    K.render(c);
    return c;
  }

  /* ---------- Pestanya «📋 Llista oficial» ---------- */
  let mode = null, curKey = {};
  function listTab(body, m) {
    const X = listOf(m.id);
    if (!X) { body.innerHTML = '<div class="card">Aquesta secció no té llista oficial.</div>'; return; }
    if (!mode) { try { mode = localStorage.getItem('calcmaster.listmode') || 'train'; } catch (e) { mode = 'train'; } }
    const s = stats(X);
    const pdfBtn = X.pdf ? `<a class="btn sm" target="_blank" rel="noopener" href="${K.pdf(X.pdf)}">📄 PDF original${X.p2 ? ' (resolució d\'un company)' : ''}</a>` : '';
    const examBtn = X.exam13 ? `<a class="btn sm" href="#/p2/exam/2025">🔥 Veure l'examen sencer</a>` : '';
    body.innerHTML = `<div class="card"><div class="row"><h3 style="margin:0">${esc(X.title)}</h3><span class="spacer"></span><span class="chip warn" title="Importància a l'examen">${'★'.repeat(X.stars)}${'☆'.repeat(3 - X.stars)}</span></div>
      <p class="muted" style="margin:6px 0">${esc(X.topic || '')}</p>${X.exam ? `<div class="box warn" style="margin:8px 0">${X.exam}</div>` : ''}
      <div class="row">${pdfBtn}${examBtn}<span class="spacer"></span><span class="muted small"><b>${s.dom}/${s.n}</b> dominats · ${s.tried} treballats${s.due ? ` · <b>${s.due} per repassar</b>` : ''}</span></div>${bar(s)}
      <p class="muted small" style="margin:8px 0 0">Resol cada exercici <b>en paper i sense mirar</b>, obre la solució i autoavalua't. Per <i>dominar</i> un exercici l'has de treure net ${Calc.XP_PTS[5]} vegades en ${Calc.XP_DAYS[5]} dies diferents: el repàs te'l tornarà a posar quan toqui.</p></div>
      <div class="row" style="margin:12px 0"><button type="button" class="btn sm ${mode === 'train' ? 'primary' : ''}" data-mode="train">🎯 Entrenar (un per un)</button><button type="button" class="btn sm ${mode === 'all' ? 'primary' : ''}" data-mode="all">📋 Tota la llista (${s.n})</button></div>
      <div id="lhost"></div>`;
    $$('[data-mode]', body).forEach(b => b.onclick = () => { mode = b.dataset.mode; try { localStorage.setItem('calcmaster.listmode', mode); } catch (e) { /* res */ } listTab(body, m); });
    K.render(body.firstElementChild);
    const host = $('#lhost', body);
    if (mode === 'all') {
      X.items.forEach(it => host.appendChild(itemCard(X, it, () => refreshHead(body, X))));
    } else {
      const q = queue(X), cur = (curKey[X.mid] && q.find(it => it.key === curKey[X.mid])) || q[0];
      curKey[X.mid] = cur.key;
      const x = store.part(cur.key);
      const next = el('button', 'btn primary', 'Següent exercici →'); next.type = 'button';
      next.hidden = !(x && x.day === today());
      host.appendChild(itemCard(X, cur, () => { next.hidden = false; refreshHead(body, X); }));
      next.onclick = () => { const q2 = queue(X).filter(it => it.key !== cur.key); curKey[X.mid] = q2.length ? q2[0].key : cur.key; listTab(body, m); body.scrollIntoView({ block: 'start' }); };
      const nr = el('div', 'row'); nr.appendChild(el('span', 'muted small', 'Ordre: primer els que toca repassar, després els nous, després els més fluixos.')); nr.appendChild(el('span', 'spacer')); nr.appendChild(next);
      host.appendChild(nr);
    }
  }
  function refreshHead(body, X) {
    const s = stats(X), sp = $$('.card .row .muted.small', body)[0], b = $('.card .mbar', body);
    if (sp) sp.innerHTML = `<b>${s.dom}/${s.n}</b> dominats · ${s.tried} treballats${s.due ? ` · <b>${s.due} per repassar</b>` : ''}`;
    if (b) b.outerHTML = bar(s);
  }

  /* La pestanya substitueix la de p1_ui (casella «fet») i s'afegeix a totes les llistes */
  const prevTabs = Calc.extraTabs;
  Calc.extraTabs = m => {
    const t = ((prevTabs && prevTabs(m)) || []).filter(x => x.id !== 'list');
    return listOf(m.id) ? [{ id: 'list', label: '📋 Llista oficial', render: listTab }].concat(t) : t;
  };

  /* ---------- Pàgina #/llistes ---------- */
  function page() {
    U.renderSide('llistes');
    const F = Calc.focusOn && Calc.focusOn();
    const Ls = lists(), A = Ls.filter(X => X.p2), B = Ls.filter(X => !X.p2);
    const tot = Ls.reduce((a, X) => { const s = stats(X); a.n += s.n; a.dom += s.dom; a.tried += s.tried; a.due += s.due; return a; }, { n: 0, dom: 0, tried: 0, due: 0 });
    const card = X => {
      const s = stats(X), m = Calc.byId[X.mid];
      return `<div class="card modcard"><div class="row"><span class="chip accent">${esc(X.short)}</span><span class="chip warn" title="Importància a l'examen">${'★'.repeat(X.stars)}</span><span class="spacer"></span>${s.due ? `<span class="chip warn">${s.due} per repassar</span>` : ''}</div>
        <h3>${esc(U.sideName(m))}</h3><div class="muted small">${s.n} exercicis · <b>${s.dom}</b> dominats · ${s.tried} treballats</div>${bar(s)}
        <div class="row"><a class="btn sm primary" href="#/mod/${X.mid}/list">🎯 Entrenar la llista</a><a class="btn sm" href="#/mod/${X.mid}/theory">📖 Teoria</a><a class="btn sm" href="#/mod/${X.mid}/practice">✍️ Generador</a></div></div>`;
    };
    const secA = `<h2>2n parcial (llistes 6–13)</h2><div class="grid cols2">${A.map(card).join('')}</div>`;
    const secB = `<h2>Base i 1r parcial (llistes 0–5)${F ? ' — també cal dominar-les' : ''}</h2><div class="grid cols2">${B.map(card).join('')}</div>`;
    app.innerHTML = `<h1>📋 Llistes oficials</h1><p class="lead">Cada llista de classe, exercici per exercici, amb la solució verificada i <b>mestria per exercici</b>. Entra a una llista i prem <i>Entrenar</i>: et posarà els exercicis un a un (primer els que toca repassar). El <i>Generador</i> et dona exercicis nous infinits del mateix tipus.</p>
      <div class="card"><div class="row"><b>Total</b><span class="muted small"><b>${tot.dom}/${tot.n}</b> exercicis dominats · ${tot.tried} treballats${tot.due ? ` · <b>${tot.due} per repassar</b>` : ''}</span></div></div>
      ${F ? secA + secB : secB + secA}`;
  }
  Calc.routes.push({ re: /^#\/llistes/, fn: page });
  /* ---------- Pàgina #/cobertura: res nou a l'examen ---------- */
  function covPage() {
    U.renderSide('cobertura');
    const parts = (Calc.examParts ? Calc.examParts() : []).filter(p => p.par === 2);
    const gRank = k => store.rank ? store.rank(k) : 0;
    const row = (title, sub, pk, gk) => {
      const g = gk && Calc.genByKey(gk), pr = store.partRank(pk), gr = g ? gRank(gk) : 0;
      return `<tr><td><b>${title}</b><div class="muted small">${sub}</div></td><td>${pill(pr)}</td><td>${g ? `<a href="#/mod/${gk.split('.')[0]}/practice?g=${esc(gk.split('.')[1])}">${esc(g.title)}</a> ${Calc.examChip ? Calc.examChip(gk) : ''}` : '<span class="muted">—</span>'}</td><td>${g ? pill(gr) : ''}</td></tr>`;
    };
    const strip = h => String(h).replace(/<[^>]+>/g, '').replace(/\$[^$]*\$/g, '…').slice(0, 70);
    const withG = parts.filter(p => EXG[p.key] && Calc.genByKey(EXG[p.key]));
    const domBoth = withG.filter(p => store.partRank(p.key) >= 5 && gRank(EXG[p.key]) >= 5).length;
    const byExam = {};
    parts.forEach(p => { (byExam[p.exam.id] = byExam[p.exam.id] || { e: p.exam, ps: [] }).ps.push(p); });
    const exHtml = Object.values(byExam).map(({ e, ps }) => `<h3>${esc(e.title)} <a class="btn sm ghost" href="#/p2/exam/${esc(e.id)}">Veure l'examen</a></h3>
      <div class="tablewrap"><table class="tbl"><tr><th>Apartat</th><th>Rang de l'apartat</th><th>Tipus d'exercici que l'entrena</th><th>Rang</th></tr>${ps.map(p => row(esc(p.title), esc(strip(p.q)), p.key, EXG[p.key])).join('')}</table></div>`).join('');
    const Ls = lists(), nIt = Ls.reduce((a, X) => a + X.items.length, 0), nG = Ls.reduce((a, X) => a + X.items.filter(it => it.g || EXG[it.key]).length, 0);
    const lsHtml = Ls.map(X => { const its = X.items, ng = its.filter(it => it.g || EXG[it.key]).length; const s = stats(X);
      return `<tr><td><a href="#/mod/${X.mid}/list">${esc(X.short)}</a></td><td>${its.length}</td><td>${ng === its.length ? '✅' : ng + '/' + its.length}</td><td>${s.dom}/${s.n}</td><td style="min-width:90px">${bar(s)}</td></tr>`; }).join('');
    app.innerHTML = `<h1>✅ Res nou a l'examen</h1>
      <p class="lead">L'objectiu: que el dia del 2n parcial cap exercici et sigui nou. Cada apartat de <b>tots els exàmens reals</b> del 2n parcial té aquí el seu <b>tipus d'exercici entrenable</b> (exercicis nous infinits, amb correcció i mestria) i cada exercici de les <b>14 llistes</b> també. Quan l'apartat i el seu tipus estiguin a <i>Dominat</i>, aquell exercici ja no et pot sorprendre.</p>
      <div class="grid cols3"><div class="card stat"><b>${withG.length}/${parts.length}</b><span>apartats d'examen amb tipus d'exercici entrenable</span></div><div class="card stat"><b>${nG}/${nIt}</b><span>exercicis de llista amb tipus d'exercici entrenable</span></div><div class="card stat"><b>${domBoth}/${withG.length}</b><span>apartats d'examen dominats (l'apartat i el tipus)</span></div></div>
      <div class="card tipcard" style="margin-top:12px">Com fer-ho servir: obre l'apartat a l'<a href="#/entrena">Entrenament d'exàmens</a>, resol-lo en paper i, si t'ha costat, fes 5–10 exercicis del seu tipus fins que surtin sols. Torna-hi els dies que el repàs t'ho demani.</div>
      <h2>Exàmens reals del 2n parcial</h2>${exHtml}
      <h2>Llistes oficials</h2><div class="tablewrap"><table class="tbl"><tr><th>Llista</th><th>Exercicis</th><th>Amb tipus entrenable</th><th>Dominats</th><th></th></tr>${lsHtml}</table></div>
      <p class="muted small">Els apartats del 1r parcial també tenen mestria a l'<a href="#/entrena">Entrenament d'exàmens</a> i els seus temes, tipus d'exercici a les llistes 0–5.</p>`;
    K.render(app);
  }
  Calc.routes.push({ re: /^#\/cobertura/, fn: covPage });

  U.route();
})();
