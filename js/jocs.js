/* ===================================================================
   jocs.js — Entrenament «absolut»:
   · #/jocs          Jocs: Contrarellotge, Supervivència, Quin mètode?,
                     Troba l'error, Teoremes + calibració de confiança.
   · #/joc/<id>      Pràctica d'un joc (metode, error, teo) i jocs ràpids
                     (sprint, super).
   · #/teoremes      Fitxes «enuncia i aplica».
   · #/p2/sim        Simulacre del 2n parcial amb el format real
                     (test de 5 opcions + 2 problemes) i correcció amb
                     rúbrica del procediment.
   Avaluació:
   · Els jocs ràpids no pugen rangs (la velocitat fa endevinar), però
     cada error va al repàs d'errors.
   · store.calib: encert quan dius «segur» vs quan dius «dubto».
   =================================================================== */
(function () {
  'use strict';
  if (!window.CalcUI) return;
  const U = CalcUI, { $, $$, esc, app, typeset, QView, renderSide, renderTop, mountPractice } = U;
  const store = Calc.store, RANKS = Calc.RANKS;
  const pill = r => `<span class="rk r${r}">${RANKS[r]}</span>`;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  /* ---------------- Extensions del magatzem de progrés ---------------- */
  const games = () => { const d = store.data(); return d.games || (d.games = { best: {}, hist: [] }); };
  store.calib = (doubt, ok) => {
    const d = store.data(), c = d.calib || (d.calib = { s: [0, 0], d: [0, 0] }), a = c[doubt ? 'd' : 's'];
    a[0]++; if (ok) a[1]++; store.save();
  };
  store.flagError = (key, seed) => {
    const d = store.data();
    d.errors = d.errors.filter(e => !(e.gkey === key && e.seed === seed));
    d.errors.push({ gkey: key, seed, t: Date.now() }); if (d.errors.length > 150) d.errors.shift(); store.save();
  };
  store.gameDone = (id, score, extra) => {
    const g = games(), prev = g.best[id], rec = prev == null || score > prev;
    if (rec) g.best[id] = score;
    g.hist.push(Object.assign({ id, score, t: Date.now() }, extra || {})); if (g.hist.length > 80) g.hist.shift();
    const d = store.data(), dk = Calc.dayStr(new Date()); d.days[dk] = (d.days[dk] || 0) + 1;
    store.save(); return { rec, prev };
  };

  /* ---------------- Blocs de temari ---------------- */
  const BLOCKS = {
    p2: { name: '2n parcial (L7–L13)', ids: Calc.P2_IDS },
    p1: { name: 'Base i 1r parcial', ids: Calc.modules.map(m => m.id).filter(id => !Calc.FOCUS_IDS.includes(id)) },
    tot: { name: 'Tot el curs', ids: Calc.modules.map(m => m.id) }
  };
  const gensOf = ids => Calc.allGens().filter(g => ids.includes(g.mod));
  const gameGens = id => Calc.allGens().filter(g => g.game === id);

  /* Pregunta ràpida (opció múltiple) a partir d'un generador. Els que demanen escriure una funció no serveixen per a jocs ràpids. */
  const quickNo = {};
  function quickQ(g) {
    if (quickNo[g.key]) return null;
    try {
      const p = Calc.make(g, Calc.newSeed());
      if (p.type === 'mc') return p;
      if (p.type === 'num' && isFinite(p.ans)) { const q = Calc.toMC(M.rng(p.seed), p); q.gkey = p.gkey; q.seed = p.seed; q.title = p.title; q.ans = p.ans; return q; }
    } catch (e) { /* res */ }
    quickNo[g.key] = 1; return null;
  }
  function pickQuick(gens, maxLevel) {
    let pool = gens.filter(g => !quickNo[g.key] && (!maxLevel || g.level <= maxLevel));
    if (!pool.length) pool = gens.filter(g => !quickNo[g.key]);
    for (let i = 0; i < 40 && pool.length; i++) {
      // el que més surt a l'examen surt més
      const tot = pool.reduce((a, g) => a + 1 + Calc.examW(g.key), 0); let x = Math.random() * tot, g = pool[0];
      for (const c of pool) { x -= 1 + Calc.examW(c.key); if (x <= 0) { g = c; break; } }
      const q = quickQ(g); if (q) return { g, p: q };
      pool = pool.filter(c => c !== g);
    }
    return null;
  }

  /* ================================================================
     Hub dels jocs
     ================================================================ */
  function avgRank(gs) { return gs.length ? gs.reduce((a, g) => a + store.rank(g.key), 0) / gs.length : 0; }
  function rankChips(gs) { return gs.map(g => `<a class="chip" href="#/mod/${g.mod}/practice?g=${esc(g.id)}" title="${esc(g.title)}">${esc(Calc.byId[g.mod].llista.replace('Llista ', 'L'))} ${RANKS[store.rank(g.key)]}</a>`).join(' '); }
  function calibHtml() {
    const c = store.data().calib;
    if (!c || c.s[0] + c.d[0] < 5) return '<p class="muted small">Encara no hi ha prou dades. A la pràctica, abans de comprovar, marca <b>✔ Segur</b> o <b>🤔 Dubto</b> (tecla <kbd>D</kbd>).</p>';
    const pc = a => a[0] ? Math.round(a[1] / a[0] * 100) : null, s = pc(c.s), d = pc(c.d);
    let msg = '';
    if (s != null && s < 75) msg = '⚠️ Quan dius «segur» falles massa sovint: a l\'examen no revisaries aquests errors. Abans de marcar «segur», comprova el resultat (deriva la primitiva, substitueix a l\'EDO).';
    else if (d != null && c.d[0] >= 5 && d > 80) msg = 'Quan dubtes acostumes a encertar: et falta confiança, no coneixement. Marca «segur» més sovint.';
    else msg = '✅ Bona calibració: saps quan ho saps.';
    return `<div class="grid cols3"><div class="card stat"><b>${s == null ? '—' : s + '%'}</b><span>encerts quan dius «segur» (${c.s[0]})</span></div><div class="card stat"><b>${d == null ? '—' : d + '%'}</b><span>encerts quan dius «dubto» (${c.d[0]})</span></div></div><p class="small">${msg}</p>`;
  }
  function hub() {
    renderSide('jocs');
    const g = games(), best = id => g.best[id] != null ? g.best[id] : '—';
    const card = (icon, title, desc, body) => `<div class="card gamecard"><h3 style="margin-top:0">${icon} ${title}</h3><p class="muted small">${desc}</p>${body}</div>`;
    const blockBtns = (mode) => Object.keys(BLOCKS).map(b => `<a class="btn sm ${b === 'p2' ? 'primary' : ''}" href="#/joc/${mode}?b=${b}">${esc(BLOCKS[b].name)} · rècord ${best(mode + ':' + b)}</a>`).join('');
    const sims = g.hist.filter(h => h.id === 'p2sim');
    app.innerHTML = `<h1>🎮 Jocs d'entrenament</h1>
      <p class="lead">Cada joc entrena una cosa diferent que l'examen demana i que fer exercicis un per un no entrena: <b>velocitat</b>, <b>reconèixer el mètode</b>, <b>trobar errors</b> i <b>enunciar teoremes</b>. Els tres del mig són tipus d'exercici normals: tenen rang i repàs espaiat.</p>
      <div class="grid cols2">
        ${card('⚡', 'Contrarellotge', '5 minuts, tantes preguntes de test com puguis. +1 per encert, −¼ per error (com a l\'examen). Entrena la velocitat i l\'automatisme.', `<div class="row">${blockBtns('sprint')}</div>`)}
        ${card('❤️', 'Supervivència', '3 vides. Les preguntes es tornen més difícils com més avances. Entrena la regularitat: no fallar les fàcils.', `<div class="row">${blockBtns('super')}</div>`)}
        ${card('🧭', 'Quin mètode?', 'Mira una integral o una EDO i digues amb quina tècnica la faries, sense calcular. És el primer pas de tot exercici.', `<div class="row"><a class="btn primary" href="#/joc/metode">▶️ Juga</a></div><div class="small" style="margin-top:8px">${rankChips(gameGens('metode'))}</div>`)}
        ${card('🔎', 'Troba l\'error', 'Una resolució pas a pas amb un error (o cap). Troba el primer pas que falla. És el que has de fer amb el teu examen abans de lliurar-lo.', `<div class="row"><a class="btn primary" href="#/joc/error">▶️ Juga</a></div><div class="small" style="margin-top:8px">${rankChips(gameGens('error'))}</div>`)}
        ${card('📜', 'Teoremes', 'Enunciats exactes (totes les hipòtesis) i si es poden aplicar en un cas concret. A l\'examen poden demanar «enuncieu el teorema».', `<div class="row"><a class="btn primary" href="#/joc/teo">▶️ Juga</a><a class="btn" href="#/teoremes">📇 Fitxes</a></div><div class="small" style="margin-top:8px">${rankChips(gameGens('teo'))}</div>`)}
        ${card('⏱️', 'Simulacre del 2n parcial', 'Format real: 5 preguntes de test de 5 opcions + 2 problemes (integrals i EDOs), amb temps. Et corregeixes el procediment amb una rúbrica.', `<div class="row"><a class="btn primary" href="#/p2/sim">▶️ Comença</a></div><p class="small">${sims.length ? 'Últimes notes: ' + sims.slice(-5).map(h => '<b>' + h.score.toFixed(1) + '</b>').join(' · ') : 'Encara no n\'has fet cap.'}</p>`)}
      </div>
      <h2>🎯 Calibració: saps quan ho saps?</h2>${calibHtml()}`;
    typeset(app);
  }

  /* ================================================================
     Jocs de pràctica (tipus d'exercici amb rang)
     ================================================================ */
  const GP = {
    metode: ['🧭 Quin mètode?', 'Tria la tècnica <b>sense calcular</b>. Si dubtes, marca 🤔 (tecla <kbd>D</kbd>): així un encert a l\'atzar no et puja el rang.'],
    error: ['🔎 Troba l\'error', 'Llegeix cada pas i pregunta\'t: <i>això és veritat?</i> Comprova cada igualtat (derivant, substituint, amb un número). De vegades no hi ha cap error.'],
    teo: ['📜 Teoremes', 'L\'enunciat exacte: hipòtesis i conclusió. Les fitxes completes són a <a href="#/teoremes">📇 Teoremes</a>.']
  };
  function gamePractice(id) {
    renderSide('jocs');
    const gs = gameGens(id);
    app.innerHTML = `<h1>${GP[id][0]}</h1><p class="lead">${GP[id][1]}</p><div class="row small" style="margin-bottom:10px">${rankChips(gs)}</div><div id="gbody"></div>`;
    typeset(app);
    mountPractice($('#gbody'), { gens: gs, activeId: 'jocs' });
  }

  /* ================================================================
     Jocs ràpids: Contrarellotge i Supervivència
     ================================================================ */
  function quickGame(mode, blk) {
    renderSide('jocs');
    const B = BLOCKS[blk] || BLOCKS.p2, gens = gensOf(B.ids), id = mode + ':' + (BLOCKS[blk] ? blk : 'p2');
    const SPRINT = mode === 'sprint', DUR = 300;
    let ok = 0, bad = 0, lives = 3, n = 0, t0 = Date.now(), timer = null, over = false, cur = null;
    const log = [];
    app.innerHTML = `<h1>${SPRINT ? '⚡ Contrarellotge' : '❤️ Supervivència'} <span class="muted" style="font-size:1rem">· ${esc(B.name)}</span></h1>
      <div class="exam-top"><span id="gstat"></span><span class="spacer"></span>${SPRINT ? '<span class="timer" id="gtimer"></span>' : ''}<button class="btn sm" id="gstop">Acaba</button></div>
      <div id="gq"></div><p class="muted small">Tecles <kbd>1</kbd>–<kbd>5</kbd> per triar. Aquí no es pugen rangs (amb pressa s'endevina), però cada error va al <a href="#/review">repàs d'errors</a> perquè el facis amb calma.</p>`;
    const stat = () => {
      const pts = ok - bad / 4;
      $('#gstat').innerHTML = SPRINT ? `✅ <b>${ok}</b> · ❌ <b>${bad}</b> · Punts <b>${pts.toFixed(2)}</b>` : `${'❤️'.repeat(lives)}${'🖤'.repeat(3 - lives)} · Encerts <b>${ok}</b> · Nivell <b>${level()}</b>`;
    };
    const level = () => ok < 5 ? 1 : ok < 12 ? 2 : 3;
    function next() {
      if (over) return;
      const pk = pickQuick(gens, SPRINT ? 0 : level());
      if (!pk) { end(); return; }
      cur = pk; n++;
      const v = new QView(pk.p, { meta: `<span class="qnum">${n}</span><span class="chip">${esc(Calc.byId[pk.g.mod].llista)}</span><span class="chip">${esc(pk.g.title)}</span>`, noActions: true, noKbd: true });
      const host = $('#gq'); host.innerHTML = ''; host.appendChild(v.el); v.drawPlots(); typeset(v.el);
      const t1 = Date.now();
      Calc.cur = v;
      $$('.mc label.opt', v.el).forEach((l, i) => l.addEventListener('click', ev => {
        ev.preventDefault(); if (v.done || over) return;
        const inp = l.querySelector('input'); if (inp) inp.checked = true;
        const good = i === pk.p.correct; v.mark(good); v.lock();
        log.push({ g: pk.g, p: pk.p, ok: good, ms: Date.now() - t1 });
        if (good) { ok++; store.addXp(3); } else { bad++; lives--; store.flagError(pk.g.key, pk.p.seed); }
        stat(); renderTop();
        if (!SPRINT && lives <= 0) { setTimeout(end, 900); return; }
        setTimeout(next, good ? 450 : 1500);
      }));
    }
    function tick() {
      const left = Math.max(0, DUR - Math.floor((Date.now() - t0) / 1000)), t = $('#gtimer');
      if (t) { t.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0'); t.classList.toggle('low', left < 30); }
      if (left <= 0) end();
    }
    function end() {
      if (over) return; over = true; clearInterval(timer); U.setCleanup(null); Calc.cur = null;
      const score = SPRINT ? Math.round((ok - bad / 4) * 100) / 100 : ok;
      const res = log.length ? store.gameDone(id, score, { ok, bad }) : { rec: false };
      const errs = log.filter(x => !x.ok), avg = log.length ? Math.round(log.reduce((a, x) => a + x.ms, 0) / log.length / 1000) : 0;
      app.innerHTML = `<h1>${SPRINT ? '⚡ Contrarellotge' : '❤️ Supervivència'}: ${SPRINT ? score.toFixed(2) + ' punts' : score + ' encerts'}</h1>
        <div class="card">${res.rec ? '<p>🏆 <b>Rècord nou!</b>' + (res.prev != null ? ' (abans ' + res.prev + ')' : '') + '</p>' : `<p>Rècord: <b>${games().best[id] != null ? games().best[id] : '—'}</b></p>`}
          <p>✅ ${ok} · ❌ ${bad} · ${log.length ? Math.round(ok / log.length * 100) : 0}% d'encert · ${avg} s per pregunta</p>
          <div class="row"><a class="btn primary" href="#/joc/${mode}?b=${esc(blk)}&r=${Date.now()}">🔁 Torna-hi</a><a class="btn" href="#/jocs">🎮 Jocs</a>${errs.length ? '<a class="btn" href="#/review">🔁 Repàs d\'errors</a>' : ''}</div></div>
        ${errs.length ? '<h2>Els errors (amb la solució)</h2>' + errs.map(x => `<details class="card" style="margin-bottom:10px"><summary><b>${esc(x.g.title)}</b> <span class="muted small">${esc(Calc.byId[x.g.mod].llista)}</span></summary><div class="qtext">${x.p.q}</div><p>Resposta: ${x.p.choices[x.p.correct]}</p><ol>${(x.p.sol || []).map(s => '<li>' + Calc.pretty(s) + '</li>').join('')}</ol>${Calc.genLink ? Calc.genLink(x.g.key) : ''}</details>`).join('') : '<p>🎉 Cap error.</p>'}`;
      renderTop(); typeset(app); window.scrollTo({ top: 0 });
    }
    $('#gstop').onclick = () => end();
    stat(); next();
    if (SPRINT) { timer = setInterval(tick, 500); tick(); }
    U.setCleanup(() => { over = true; clearInterval(timer); });
  }

  /* ================================================================
     Fitxes de teoremes
     ================================================================ */
  function teoPage() {
    renderSide('teoremes');
    const T = Calc.TEOREMES || [];
    app.innerHTML = `<h1>📜 Teoremes: enuncia i aplica</h1>
      <p class="lead">Per a cada teorema: <b>tapa l'enunciat</b>, escriu-lo en un paper (hipòtesis + conclusió) i després destapa'l i compara. Una hipòtesi oblidada a l'examen és un enunciat incorrecte.</p>
      <div class="row" style="margin-bottom:12px"><button class="btn" id="tAll">👁️ Mostra-ho tot</button><button class="btn" id="tNone">🙈 Amaga-ho tot</button><a class="btn primary" href="#/joc/teo">▶️ Practica amb test (amb rang)</a></div>
      <div class="grid cols2">${T.map(t => `<div class="card teocard"><h3 style="margin-top:0">${esc(t.name)} <span class="chip">${esc(Calc.byId[t.mod].llista)}</span></h3>
        <details class="teo"><summary>Mostra l'enunciat</summary>
          <p><b>Hipòtesis</b></p><ul>${t.hyp.map(h => '<li>' + h + '</li>').join('')}</ul>
          <p><b>Conclusió:</b> ${t.concl}.</p></details>
        <p class="small"><b>Per a què serveix:</b> ${t.use}</p><p class="small">⚠️ ${t.trap}</p></div>`).join('')}</div>`;
    $('#tAll').onclick = () => $$('details.teo').forEach(d => d.open = true);
    $('#tNone').onclick = () => $$('details.teo').forEach(d => d.open = false);
    typeset(app);
  }

  /* ================================================================
     Rúbrica del procediment (simulacre i apartats d'exàmens reals)
     ================================================================ */
  const RUB = [
    ['p', 0.4, 'Plantejament', 'He triat el mètode correcte i l\'he escrit (fórmula, canvi, teorema, equació característica…).'],
    ['d', 0.3, 'Desenvolupament', 'Càlculs sense errors de signe, de fraccions ni de derivades.'],
    ['r', 0.2, 'Resultat', 'El resultat final coincideix amb la solució (qualsevol forma equivalent).'],
    ['x', 0.1, 'Detalls que puntuen', '$+C$, $\\ln|x|$ amb valor absolut, límits canviats en la substitució, condicions inicials imposades a $y_h+y_p$, justificació (teorema, domini).']
  ];
  Calc.RUBRIC = RUB;
  /** Caixa de rúbrica. init: {p,d,r,x} booleans; lockR: el resultat ja l'ha corregit la web. onChange(fracció 0..1). */
  Calc.rubricBox = function (init, lockR, onChange) {
    const b = el('div', 'rubric'), st = Object.assign({ p: false, d: false, r: false, x: false }, init || {});
    const val = () => RUB.reduce((a, [k, w]) => a + (st[k] ? w : 0), 0);
    b.innerHTML = RUB.map(([k, w, t, d]) => `<label class="rubrow"><input type="checkbox" data-k="${k}" ${st[k] ? 'checked' : ''} ${lockR && k === 'r' ? 'disabled' : ''}><span><b>${t}</b> <span class="muted small">(${Math.round(w * 100)}%)</span><br><span class="small">${d}</span></span></label>`).join('') + '<div class="rubval small"></div>';
    const upd = () => { $('.rubval', b).innerHTML = 'Puntuació estimada d\'aquest apartat: <b>' + Math.round(val() * 100) + '%</b> <span class="muted">(orientativa: cada professor reparteix els punts a la seva manera)</span>'; if (onChange) onChange(val(), st); };
    $$('input', b).forEach(i => i.onchange = () => { st[i.dataset.k] = i.checked; upd(); });
    upd(); typeset(b);
    b.value = val; b.state = st;
    return b;
  };
  /** Nota d'autoavaluació (0 ❌ · 1 🤔 · 2 ✅) a partir de la rúbrica. */
  Calc.rubricMark = st => st.p && st.d && st.r && st.x ? 2 : st.p ? 1 : 0;

  /* ================================================================
     Simulacre del 2n parcial
     ================================================================ */
  const CHECK = [
    '$+C$ a totes les primitives (integrals indefinides).',
    '$\\ln|x|$: el valor absolut dins del logaritme.',
    'En una substitució dins d\'una integral definida, he canviat els límits (o he tornat a $x$).',
    'Àrees: positives; he mirat quina funció queda per sobre a cada tros.',
    'EDO: he imposat les condicions inicials a la solució <b>completa</b> ($y_h+y_p$).',
    'He comprovat almenys un resultat: derivant la primitiva o substituint a l\'EDO.',
    'Quan cal, he justificat amb el teorema (TFC, existència i unicitat…).'
  ];
  const PROBS = [
    { title: 'Problema 1 — Integrals', a: ['l7.parts_cyc', 'l7.parts_log', 'l8.int_mixed', 'l8.int_dbl_simple', 'l8.int_cubic', 'l7.trigsub', 'l7.parts', 'l7.subst', 'l8.int_arctan'], b: ['l9.area_parts', 'l9.area_between', 'l9.volume_adv', 'l9.leibniz_adv', 'l9.area_param', 'l9.volume'] },
    { title: 'Problema 2 — Equacions diferencials', a: ['l10.sep_more', 'l10.ode_subst', 'l11.lin_exam', 'l10.growth_lim', 'l10.logistic', 'l11.ivp', 'l10.separable'], b: ['l12.ivp_nh', 'l12.particular', 'l12.ivp', 'l12.res_trig'] }
  ];
  function makeTyped(keys) {
    const gs = keys.map(k => Calc.genByKey(k)).filter(Boolean);
    for (let i = 0; i < 30; i++) {
      const g = gs[Math.floor(Math.random() * gs.length)];
      try { const p = Calc.make(g, Calc.newSeed()); if (p.type !== 'mc') return { g, p }; } catch (e) { /* res */ }
    }
    return null;
  }
  function makeTest5() {
    const gens = gensOf(Calc.P2_IDS).filter(g => Calc.examW(g.key) >= 1 && !g.game), out = [], used = {};
    for (let i = 0; i < 200 && out.length < 5; i++) {
      const pk = pickQuick(gens.filter(g => !used[g.key])); if (!pk) break;
      const p = pk.p, r = M.rng(Calc.newSeed()), CAP = 'Cap opció és correcta';
      let choices = p.choices.slice(), correct = p.correct;
      if (p.ans != null && r() < 0.2) {
        // «Cap opció és correcta» és la bona: totes les opcions numèriques són falses
        const d = M.numDistractors(p.ans, r, 4).map(v => '$' + M.numTex(v) + '$');
        if (new Set(d).size === 4) { choices = r.shuffle(d).concat([CAP]); correct = 4; }
      }
      if (!choices.includes(CAP) && choices.length < 5) choices.push(CAP);
      if (choices.length !== 5) continue; // format real: sempre 5 opcions
      used[pk.g.key] = 1;
      out.push({ g: pk.g, p: Object.assign({}, p, { choices, correct, sol: correct === choices.length - 1 && choices[correct] === CAP && p.correct !== correct ? ['Cap de les opcions és el valor correcte, que és $' + M.numTex(p.ans) + '$.'].concat(p.sol || []) : p.sol }) });
    }
    return out;
  }
  function simPage() {
    renderSide('p2sim');
    app.innerHTML = `<h1>⏱️ Simulacre del 2n parcial</h1>
      <p class="lead">Format del curs actual: <b>5 preguntes de test</b> amb 5 opcions (4 punts: +0,8 per encert, −0,2 per error, 0 en blanc) i <b>2 problemes</b> de 3 punts (integrals i EDOs), números nous cada cop. Fes-lo <b>en paper</b>, com a l'examen, i escriu aquí només els resultats.</p>
      <div class="card"><div class="row"><label>Temps<br><select id="sMin"><option value="90">90 min</option><option value="60">60 min</option><option value="120">120 min</option><option value="0">Sense límit</option></select></label><span class="spacer"></span><button class="btn primary" id="sGo">▶️ Començar</button></div>
      <p class="muted small">La penalització del test (−¼ de pregunta) és la del 1r parcial de 2025; la del 2n pot ser diferent. El repartiment dels problemes i la rúbrica són una estimació.</p></div>
      <div class="card tipcard" style="margin-top:12px"><b>Abans de lliurar (els punts que es perden sense saber-ho):</b><ul>${CHECK.map(c => '<li>' + c + '</li>').join('')}</ul></div>
      <div id="sbody"></div>`;
    typeset(app);
    $('#sGo').onclick = () => simRun(+$('#sMin').value);
  }
  function simRun(minutes) {
    const test = makeTest5(), probs = PROBS.map(P => ({ title: P.title, parts: [makeTyped(P.a), makeTyped(P.b)].filter(Boolean) }));
    const t0 = Date.now(); let timer = null, finished = false;
    app.innerHTML = `<div class="exam-top"><span class="chip accent">Simulacre 2n parcial</span><span class="spacer"></span><span class="timer" id="sTimer"></span><button class="btn primary" id="sEnd">📨 Entregar</button></div><h2>Test (4 punts)</h2><div id="sTest"></div><div id="sProbs"></div><div class="row" style="margin:20px 0 60px"><button class="btn primary" id="sEnd2">📨 Entregar</button></div>`;
    const tv = test.map((x, i) => { const v = new QView(x.p, { meta: `<span class="qnum">${i + 1}</span><span class="chip">Test</span>`, noActions: true, noKbd: true }); $('#sTest').appendChild(v.el); v.drawPlots(); return v; });
    // poder deixar en blanc: clic a l'opció ja triada la desmarca
    tv.forEach(v => $$('.mc label.opt', v.el).forEach(l => l.addEventListener('mousedown', () => { const i = l.querySelector('input'); l.dataset.was = i && i.checked ? '1' : ''; })));
    tv.forEach(v => $$('.mc label.opt', v.el).forEach(l => l.addEventListener('click', e => { const i = l.querySelector('input'); if (l.dataset.was === '1' && i) { e.preventDefault(); i.checked = false; l.dataset.was = ''; } })));
    const pv = [];
    probs.forEach((P, pi) => {
      $('#sProbs').appendChild(el('h2', null, esc(P.title) + ' (3 punts)'));
      P.parts.forEach((x, k) => { const v = new QView(x.p, { meta: `<b>${'abc'[k]})</b><span class="chip">${esc(Calc.byId[x.g.mod].llista)}</span><span class="chip">1,5 punts</span>`, noActions: true }); $('#sProbs').appendChild(v.el); v.drawPlots(); pv.push({ v, x, pi }); });
    });
    const left = () => Math.max(0, minutes * 60 - Math.floor((Date.now() - t0) / 1000));
    function tick() { const l = left(), t = $('#sTimer'); if (t) { t.textContent = String(Math.floor(l / 60)).padStart(2, '0') + ':' + String(l % 60).padStart(2, '0'); t.classList.toggle('low', l < 300); } if (l <= 0) finish(); }
    function ask() {
      const o = el('div', 'overlay'); o.innerHTML = `<div class="dlg"><h2 style="margin-top:0">Abans de lliurar, revisa:</h2><ul>${CHECK.map(c => '<li>' + c + '</li>').join('')}</ul><div class="row"><button class="btn primary" id="dOk">📨 Lliura</button><button class="btn" id="dNo">Encara reviso</button></div></div>`;
      document.body.appendChild(o); typeset(o);
      $('#dOk', o).onclick = () => { o.remove(); finish(); }; $('#dNo', o).onclick = () => o.remove();
    }
    function finish() {
      if (finished) return; finished = true; clearInterval(timer); U.setCleanup(null);
      let tpts = 0, tok = 0, tbad = 0, tbl = 0;
      tv.forEach((v, i) => {
        const a = v.getAnswer(), x = test[i];
        if (a == null) { tbl++; v.feedback('info', '⚪ En blanc: 0 punts.'); }
        else { const ok = a === x.p.correct; if (ok) { tok++; tpts += 0.8; } else { tbad++; tpts -= 0.2; } store.record(x.g.key, ok, x.p, ok ? 'ok' : 'fail'); v.feedback(ok ? 'ok' : 'bad', ok ? '✅ +0,8' : '❌ −0,2'); }
        v.mark(a === x.p.correct); v.lock(); v.showSolution();
      });
      const partVal = []; let ready = false;
      pv.forEach(({ v, x }, j) => {
        const a = v.getAnswer(), empty = v.isEmpty(a), g = empty ? { ok: false } : Calc.grade(x.p, a);
        if (!empty) store.record(x.g.key, g.ok, x.p, g.ok ? 'ok' : 'fail');
        v.mark(g.ok, g.parts); v.lock(); v.showSolution();
        v.feedback(g.ok ? 'ok' : empty ? 'info' : 'bad', (g.ok ? '✅ El resultat és correcte.' : empty ? '⚪ En blanc.' : '❌ El resultat no coincideix.') + ' Ara corregeix-te el <b>procediment</b> amb la rúbrica (compara el teu paper amb la solució):');
        partVal[j] = 0;
        const rb = Calc.rubricBox(g.ok ? { p: true, d: true, r: true, x: true } : { r: false }, true, f => { partVal[j] = f; if (ready) upd(); });
        $('.fbwrap', v.el).appendChild(rb);
        partVal[j] = rb.value();
      });
      const box = el('div', 'card'); box.style.marginBottom = '16px';
      const mins = Math.round((Date.now() - t0) / 60000);
      let saved = false;
      function total() { const pp = partVal.reduce((a, f) => a + 1.5 * f, 0); return { pp, tot: Math.max(0, tpts) + pp }; }
      function upd() {
        const { pp, tot } = total();
        box.innerHTML = `<h2 style="margin-top:0">Nota del simulacre: <span style="color:${tot >= 5 ? 'var(--ok)' : 'var(--bad)'}">${tot.toFixed(2)}</span> / 10</h2>
          <p>Test: <b>${Math.max(0, tpts).toFixed(2)} / 4</b> (✅ ${tok} · ❌ ${tbad} · ⚪ ${tbl}) · Problemes: <b>${pp.toFixed(2)} / 6</b> · ${mins} min</p>
          <p class="small muted">La nota dels problemes surt de la teva rúbrica: marca només el que tens <b>escrit i correcte</b> al paper.</p>
          <div class="row"><button class="btn primary" id="sSave" ${saved ? 'disabled' : ''}>${saved ? '✅ Desada' : '💾 Desa la nota'}</button><a class="btn" href="#/p2/sim">🔁 Un altre simulacre</a><a class="btn" href="#/review">🔁 Repàs d'errors</a></div>`;
        $('#sSave', box).onclick = () => { if (saved) return; saved = true; const t = total().tot; store.addExam({ t: Date.now(), mark: t, n: 9, fmt: 'simulacre 2n parcial', mins }); store.gameDone('p2sim', Math.round(t * 100) / 100, { mins }); renderTop(); upd(); if (Calc.toast) Calc.toast('💾', 'Nota desada', t.toFixed(2) + ' / 10'); };
      }
      $('.exam-top').remove(); $('#sEnd2').parentNode.remove();
      ready = true; app.insertBefore(box, app.firstChild); upd(); renderTop(); typeset(app); window.scrollTo({ top: 0 });
    }
    $('#sEnd').onclick = ask; $('#sEnd2').onclick = ask;
    if (minutes) { timer = setInterval(tick, 1000); tick(); U.setCleanup(() => clearInterval(timer)); } else $('#sTimer').textContent = '∞';
    typeset(app); window.scrollTo({ top: 0 });
  }

  /* ---------------- Rutes ---------------- */
  const qp = () => new URLSearchParams((location.hash.split('?')[1] || ''));
  Calc.routes.push({ re: /^#\/jocs/, fn: hub });
  Calc.routes.push({ re: /^#\/joc\/(metode|error|teo)\b/, fn: m => gamePractice(m[1]) });
  Calc.routes.push({ re: /^#\/joc\/(sprint|super)\b/, fn: m => quickGame(m[1], qp().get('b') || 'p2') });
  Calc.routes.push({ re: /^#\/teoremes/, fn: teoPage });
  Calc.routes.push({ re: /^#\/p2\/sim/, fn: simPage });
  U.route();
})();
