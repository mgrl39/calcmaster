/* =========================================================================
   guide.js — Camí recomanat, recomanacions d'aprenentatge, test de nivell
   mapa del temari (graf) i visualitzador de funcions.
   Tot són SUGGERIMENTS: no bloqueja ni obliga res. Cada avís es pot tancar.
   ========================================================================= */
(function () {
  'use strict';
  const U = window.CalcUI, Calc = window.Calc, store = Calc.store;
  const { $, $$, esc, app, typeset } = U;

  /** Ordre suggerit (de més bàsic a més avançat). */
  const ORDER = ['base', 'l0', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10', 'l11', 'l12', 'l13'];

  /** Què ajuda a saber abans de cada llista (només orientatiu). */
  const PREREQ = {
    l0: [['base', 'Operar amb fraccions, potències i factoritzar és la base de tot el que ve després.']],
    l1: [['l0', 'Per estudiar límits i continuïtat cal dominar domini i composició de funcions.'], ['base', 'Cal manejar bé les manipulacions algebraiques.']],
    l2: [['l1', 'La derivada es defineix com un límit.'], ['l0', 'La regla de la cadena parteix de la composició de funcions.']],
    l3: [['l2', 'Monotonia, extrems i concavitat s\'estudien amb la derivada primera i segona.']],
    l4: [['l1', 'Les asímptotes són límits.'], ['l2', 'L\'Hôpital i l\'estudi de funcions usen derivades.']],
    l5: [['l2', 'Els coeficients de Taylor són derivades successives.'], ['l4', 'L\'ús dels ordres d\'infinitèsim s\'assembla a L\'Hôpital.']],
    l6: [['base', 'La interpolació és sobretot àlgebra: sistemes i polinomis.']],
    l7: [['l2', 'Una primitiva és l\'operació inversa de derivar: si no tens fluïdesa derivant, integrar costa molt.'], ['l5', 'El mètode de Newton usa la derivada i aproximacions successives.']],
    l8: [['l7', 'Les integrals racionals acaben en primitives senzilles (ln, arctan).'], ['base', 'Cal factoritzar polinomis.']],
    l9: [['l7', 'El Teorema Fonamental del Càlcul necessita saber calcular primitives.'], ['l8', 'Moltes integrals definides requereixen fraccions simples.']],
    l10: [['l7', 'Les variables separables es resolen integrant.'], ['l9', 'Cal tenir integrals ben apreses.']],
    l11: [['l10', 'Parteix de les EDOs senzilles de variables separables.'], ['l7', 'Cal saber integrar (inclòs per parts).']],
    l12: [['l11', 'Les EDOs de 2n ordre reutilitzen idees de les de 1r.'], ['base', 'Cal resoldre equacions de 2n grau (també complexes).']],
    l13: [['l9', 'Les preguntes del final barregen integrals i àrees.'], ['l10', 'També surten EDOs i el model logístic.'], ['l12', 'I EDOs de 2n ordre.']]
  };

  const byId = id => Calc.byId[id];
  const weak = m => { const mm = store.modMastery(m); return mm.att === 0 || (mm.acc != null && mm.acc < 0.6); };
  /** Llesta per passar a la següent: totes les habilitats almenys a Practicant, o la prova de mestria superada. */
  const ready = m => !!(store.data().cert || {})[m.id] || m.gens.every(g => store.rank(g.key) >= 3);
  const rank = id => ORDER.indexOf(id);

  /** Prerequisits (transitius) que encara estan fluixos, del més bàsic al menys. */
  function weakPrereqs(id, seen) {
    seen = seen || new Set();
    const out = [];
    (PREREQ[id] || []).forEach(([pid, why]) => {
      if (seen.has(pid) || !byId(pid)) return; seen.add(pid);
      weakPrereqs(pid, seen).forEach(x => out.push(x));
      if (weak(byId(pid))) out.push({ id: pid, why });
    });
    const uniq = []; out.forEach(x => { if (!uniq.some(y => y.id === x.id)) uniq.push(x); });
    return uniq.sort((a, b) => rank(a.id) - rank(b.id));
  }
  const statusTxt = m => { const mm = store.modMastery(m); return mm.att === 0 ? 'encara no l\'has treballat' : mm.acc != null ? 'hi encertes el ' + U.pct(mm.acc) + '%' : 'domini ' + U.pct(mm.value) + '%'; };

  /* ------------------------ Avís suau dins d'una llista ------------------------ */
  const dismissed = () => { try { return JSON.parse(localStorage.getItem('calcmaster.tips') || '{}'); } catch (e) { return {}; } };
  Calc.tipFor = function (m) {
    if (dismissed()[m.id]) return '';
    // Només si ja has provat el prerequisit i t'ha costat (no molestem si encara no l'has tocat: per això hi ha el Camí recomanat).
    const w = weakPrereqs(m.id).filter(x => store.modMastery(byId(x.id)).att > 0).slice(0, 2);
    if (!w.length) return '';
    const items = w.map(x => `<li><a href="#/mod/${x.id}/practice"><b>${esc(byId(x.id).title)}</b></a> <span class="muted">(${statusTxt(byId(x.id))})</span> — ${esc(x.why)}</li>`).join('');
    return `<div class="tipcard" data-tip="${m.id}"><button class="x" title="Tanca" aria-label="Tanca">×</button><b>💡 Suggeriment</b> — Aquest tema va millor si abans tens una mica de base de:<ul>${items}</ul><span class="muted">És només una idea: pots seguir aquí si vols.</span></div>`;
  };
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.tipcard .x');
    if (!b) return;
    const card = b.closest('.tipcard'), id = card.dataset.tip;
    if (id) { const d = dismissed(); d[id] = 1; try { localStorage.setItem('calcmaster.tips', JSON.stringify(d)); } catch (x) { /* res */ } }
    card.remove();
  });

  /* ------------------------ Després de fallar diverses vegades ------------------------ */
  Calc.suggestEasier = function (gen) {
    const m = byId(gen.mod); if (!m) return '';
    const easier = m.gens.filter(g => g.id !== gen.id && g.level < gen.level)
      .sort((a, b) => (store.genMastery(a.key) == null ? -1 : store.genMastery(a.key)) - (store.genMastery(b.key) == null ? -1 : store.genMastery(b.key)) || a.level - b.level)[0];
    const pre = weakPrereqs(m.id)[0];
    let h = '<b>🤔 Costa una mica?</b> No passa res. ';
    if (easier) h += `Pots provar abans un exercici més senzill: <a href="#/mod/${m.id}/practice?g=${easier.id}">${esc(easier.title)}</a>. `;
    if (pre) h += `També pot ajudar repassar <a href="#/mod/${pre.id}/practice">${esc(byId(pre.id).title)}</a> (${statusTxt(byId(pre.id))}). `;
    else if (!easier) h += `Mira la <a href="#/mod/${m.id}/theory">teoria</a> d'aquest tema o fes servir la 💡 pista. `;
    return h + '<span class="muted">Només és una suggerència.</span>';
  };

  /* ------------------------ Següent pas (inici) ------------------------ */
  Calc.nextStep = function () {
    const F = Calc.focusOn && Calc.focusOn();
    const all = ORDER.map(byId).filter(Boolean), inF = m => Calc.FOCUS_IDS.includes(m.id);
    const mods = F ? all.filter(inF).concat(all.filter(m => !inF(m))) : all; // prioritat 2n parcial, però la base també compta
    if (F && !mods.some(m => store.modMastery(m).att > 0)) return { mod: mods[0], why: 'Prioritat 2n parcial: comença per aquí. La base (llistes 0–5) també l\'has de dominar: et sortirà quan una llista la necessiti, i a la pràctica barrejada.' };
    if (!mods.some(m => store.modMastery(m).att > 0)) return { mod: byId('base'), why: 'Bon punt de partida: fonaments d\'àlgebra i funcions (o fes primer el test de nivell). Si ja els domines, salta\'t aquest pas.' };
    const accOf = m => store.modMastery(m).acc;
    const struggling = mods.filter(m => { const mm = store.modMastery(m); return mm.att >= 4 && mm.acc != null && mm.acc < 0.55; }).sort((a, b) => accOf(a) - accOf(b))[0];
    if (struggling) {
      const pre = weakPrereqs(struggling.id)[0];
      if (pre) return { mod: byId(pre.id), why: `${struggling.llista} et costa (encertes el ${U.pct(accOf(struggling))}% últimament). Potser et va bé reforçar abans això: ${pre.why}` };
      return { mod: struggling, why: `Últimament hi encertes el ${U.pct(accOf(struggling))}%: uns quants exercicis més l'enfortiran.` };
    }
    const fresh = mods.find(m => !ready(m));
    if (fresh) return { mod: fresh, why: store.modMastery(fresh).att ? 'Ja hi has començat. Quan totes les habilitats siguin almenys Practicant (o superis la 🏅 prova de mestria), passa a la següent.' : 'Següent tema del camí recomanat. Si ja el saps, fes la 🏅 prova de mestria i salta\'l.' };
    return { mod: null, why: 'Ho tens tot treballat. Fes un examen complet per comprovar-ho.' };
  };

  /* ------------------------ Pàgina «Camí recomanat» ------------------------ */
  function camiPage() {
    U.renderSide('cami');
    const next = Calc.nextStep().mod;
    const F = Calc.focusOn && Calc.focusOn();
    const ord = ORDER.map(byId).filter(Boolean), inF = m => Calc.FOCUS_IDS.includes(m.id);
    const steps = (F ? ord.filter(inF).concat(ord.filter(m => !inF(m))) : ord).map((m, i, arr) => {
      const head = F && (i === 0 ? '<h2>2n parcial (prioritat)</h2>' : !inF(m) && inF(arr[i - 1]) ? '<h2>Base i 1r parcial (també cal dominar-ho)</h2><p class="muted">No es dona per sabut. Integrar necessita derivar; les EDOs necessiten exponencials i equacions; i la recuperació inclou tot el temari.</p>' : '');
      const mm = store.modMastery(m), done = mm.att > 0 && mm.value >= 0.8, cur = next && next.id === m.id;
      const pre = (PREREQ[m.id] || []).map(([pid]) => byId(pid)).filter(Boolean);
      return (head || '') + `<div class="pstep ${done ? 'done' : ''} ${cur ? 'cur' : ''}">
        <div class="row"><h3>${esc(m.llista)} — ${esc(m.title)}</h3><span class="spacer"></span>${cur ? '<span class="chip accent">Suggerit ara</span>' : ''}<span class="chip ${U.moduleStatus(m).cls}">${U.pct(mm.value)}%</span></div>
        <div class="muted">${esc(m.short)}</div>
        ${Calc.learn.STORY[m.id] ? `<div class="small" style="margin-top:4px"><b>Per a què:</b> ${Calc.learn.STORY[m.id][4]}</div>` : ''}
        ${pre.length ? `<div class="muted" style="font-size:.88rem;margin-top:4px">Ajuda saber abans: ${pre.map(p => `<a href="#/mod/${p.id}/theory">${esc(p.llista)}</a>`).join(', ')}</div>` : ''}
        <div class="row" style="margin-top:8px"><a class="btn sm" href="#/mod/${m.id}/theory">📖 Teoria</a><a class="btn sm primary" href="#/mod/${m.id}/practice">✍️ Practicar</a><a class="btn sm" href="#/mod/${m.id}/test">✅ Test</a></div></div>`;
    }).join('');
    app.innerHTML = `<h1>🧭 Camí recomanat</h1>
      ${F ? '<div class="tipcard"><b>🎯 Prioritat 2n parcial.</b> Primer les llistes 6–13, i després la base i les llistes 0–5, que també s\'han de dominar. Si una llista et costa perquè falla una base (per exemple, derivar), t\'ho indico a l\'inici. Les bases més urgents són a <a href="#/eines">🧰 Eines per integrar</a>.</div>' : `<div class="tipcard"><b>🔎 Primer cop?</b> El <a href="#/nivell">test de nivell</a> et diu en 10 minuts per quin pas començar. Que a classe aneu per una llista més avançada no vol dir que les anteriors estiguin dominades: és normal començar pels fonaments.</div>`}
      <p class="lead">Un ordre pensat per anar de lo més bàsic a lo més avançat, perquè cada tema es recolza en l'anterior (per exemple: integrar necessita saber derivar). <b>És només una guia</b>: pots entrar a qualsevol llista en qualsevol moment, saltar-te passos o repetir-ne.</p>
      <div class="path">${steps}</div>
      <div class="card" style="margin-top:6px"><b>🗺️ Vols veure-ho tot de cop?</b> Al <a href="#/mapa">mapa del temari</a> tens com es relaciona cada concepte, pintat de verd el que ja domines.</div>
      ${F ? `<h2>Si vas just de temps pel 2n parcial</h2>
      <div class="card"><p>Mira <a href="#/p2/temes">què surt més</a>, fes els <a href="#/p2">exàmens reals</a> en paper i prova un <a href="#/p2">examen generat del 2n parcial</a>.</p></div>` : `<h2>Si vas just de temps pel 1r parcial</h2>
      <div class="card"><p>Mira <a href="#/p1/temes">què surt més</a> als exàmens, fes algun <a href="#/p1/sim">simulacre</a> i repassa els <a href="#/p1/guia">errors típics</a>.</p></div>`}`;
    typeset(app);
  }
  Calc.routes.push({ re: /^#\/cami/, fn: camiPage });

  /* ------------------------ Test de nivell (diagnòstic) ------------------------ */
  // Una o dues preguntes fàcils de cada tema, de lo més bàsic a lo més avançat. Sense pistes: només serveix per saber on ets.
  const DIAG = [['base', ['frac', 'quad', 'powers', 'logs', 'dertable']], ['l0', ['domain', 'compose']], ['l1', ['limit_inf', 'tangent']], ['l2', ['d_product', 'd_chain']],
    ['l3', ['crit_cubic']], ['l4', ['lhop_00']], ['l5', ['poly0']], ['l6', ['value']], ['l7', ['linear']], ['l8', ['coef2']], ['l9', ['defint']], ['l10', ['growth']], ['l12', ['roots']]];
  function nivellPage() {
    U.renderSide('nivell');
    app.innerHTML = `<h1>🔎 Test de nivell</h1>
      <p class="lead">${DIAG.reduce((a, d) => a + d[1].length, 0)} preguntes curtes, des dels fonaments fins al final del curs. No hi ha pistes: si no en saps una, prem <b>No ho sé</b> (és la informació més útil!). Al final et dic per on et convé començar.</p>
      <div class="card"><div class="row"><b id="dProg"></b><span class="spacer"></span><span class="muted small">Pots deixar-lo a mitges: el que hagis contestat ja compta.</span></div><div class="bar" style="margin-top:6px"><i id="dBar"></i></div></div><div id="dHost"></div>`;
    const qs = [];
    DIAG.forEach(([mid, ids]) => ids.forEach(id => { const g = Calc.genByKey(mid + '.' + id); if (g) qs.push(g); }));
    const res = {}; let i = 0;
    const host = $('#dHost');
    function show() {
      $('#dProg').textContent = 'Pregunta ' + Math.min(i + 1, qs.length) + ' de ' + qs.length;
      $('#dBar').style.width = (i / qs.length * 100) + '%';
      if (i >= qs.length) return result();
      const gen = qs[i], p = Calc.make(gen, Calc.newSeed());
      const v = new U.QView(p, { meta: `<span class="chip accent">${esc(byId(gen.mod).llista)}</span><b>${esc(gen.title)}</b>`, noActions: true, split: true, about: gen.desc ? `<div class="about"><span class="muted small">De què va</span><div>${gen.desc}</div></div>` : '' });
      const act = document.createElement('div'); act.className = 'actions';
      act.innerHTML = '<button class="btn primary" data-d="ok">Comprova</button><button class="btn ok" data-d="next" hidden>Següent →</button><button class="btn" data-d="skip">🤷 No ho sé</button>';
      const kb = $('.kbd', v.el); kb ? kb.before(act) : $('.qmain', v.el).appendChild(act);
      const done = ok => {
        (res[gen.mod] = res[gen.mod] || []).push(ok);
        store.record(gen.key, ok, p); v.lock(); v.mark(ok);
        $('[data-d=ok]', act).hidden = true; $('[data-d=skip]', act).disabled = true; $('[data-d=next]', act).hidden = false;
        v.feedback(ok ? 'ok' : 'info', ok ? '✅ Correcte.' : 'Cap problema: aquí tens com es fa. Ho apuntem per recomanar-te què repassar.' + Calc.refChips(gen.needs, 'Ho trobaràs a'));
        v.showSolution();
      };
      const check = () => {
        if (v.done) return;
        const a = v.getAnswer();
        if (v.isEmpty(a)) { v.feedback('info', 'Escriu una resposta o prem <b>No ho sé</b>.'); return; }
        const g = Calc.grade(p, a);
        if (g.parseError && !g.ok) { v.feedback('info', 'No entenc el format. Revisa parèntesis (<code>x^2</code>, <code>3/4</code>, <code>sqrt(2)</code>).'); return; }
        done(!!g.ok);
      };
      v.o.onCheck = check; v.o.onPick = check; v.o.onNext = () => { i++; show(); }; v.o.onSolution = () => { if (!v.done) done(false); };
      $('[data-d=ok]', act).onclick = check; $('[data-d=skip]', act).onclick = () => { if (!v.done) done(false); }; $('[data-d=next]', act).onclick = v.o.onNext;
      U.placeStable(host, v.el, i > 0); v.drawPlots(); Calc.cur = v;
      setTimeout(() => v.focus(), 40);
    }
    function result() {
      Calc.cur = null;
      const rows = DIAG.map(([mid]) => { const r = res[mid] || [], ok = r.filter(Boolean).length; return { m: byId(mid), ok, n: r.length }; }).filter(x => x.n);
      const first = rows.find(x => x.ok < x.n);
      try { localStorage.setItem('calcmaster.nivell', JSON.stringify({ t: Date.now(), r: rows.map(x => [x.m.id, x.ok, x.n]) })); } catch (e) { /* res */ }
      host.style.minHeight = '';
      host.innerHTML = `<div class="card"><h2 style="margin-top:0">Resultat</h2>
        <div class="diag">${rows.map(x => `<a class="drow ${x.ok === x.n ? 'good' : x.ok ? 'mid' : 'bad'}" href="#/mod/${x.m.id}/theory"><span class="dn">${esc(x.m.num)}</span><span>${esc(x.m.title)}</span><b>${x.ok}/${x.n}</b></a>`).join('')}</div>
        <p style="margin-top:16px">${first ? `👉 Et recomano començar per <b>${esc(first.m.llista)} — ${esc(first.m.title)}</b>: llegeix la teoria i fes uns quants exercicis. Tot el que va després s'hi basa.` : '🎉 Ho tens tot fresc. Ves directament al <a href="#/cami">camí recomanat</a> o a fer exàmens reals.'}</p>
        <div class="row">${first ? `<a class="btn primary" href="#/mod/${first.m.id}/theory">📖 Teoria de ${esc(first.m.llista)}</a><a class="btn" href="#/mod/${first.m.id}/practice">✍️ Practicar</a>` : ''}<a class="btn" href="#/cami">🧭 Camí recomanat</a><a class="btn" href="#/nivell">🔄 Repetir el test</a></div></div>`;
      typeset(host);
    }
    show();
  }
  Calc.routes.push({ re: /^#\/nivell/, fn: nivellPage });

  /* ------------------------ Dibuixa una funció ------------------------ */
  function graficaPage() {
    U.renderSide('grafica');
    const q = new URLSearchParams((location.hash.split('?')[1]) || '');
    app.innerHTML = `<h1>📈 Dibuixa una funció</h1><p class="lead">Escriu una funció i mira-la junt amb la seva derivada i la segona derivada. Així veus què vol dir «$f'>0$ ⇒ creix» o «$f''>0$ ⇒ convexa».</p>
      <div class="card"><div class="row"><label>$f(x)=$</label><input id="gf" class="ans" value="${esc(q.get('f') || 'x^3-3x')}" spellcheck="false"><label>de</label><input id="ga" class="ans num" value="-3"><label>a</label><input id="gb" class="ans num" value="3"></div>
      <div class="row" style="margin-top:8px"><label class="chk"><input type="checkbox" id="g1" checked> $f'$ (taronja)</label><label class="chk"><input type="checkbox" id="g2"> $f''$ (verda)</label><span class="spacer"></span><span id="gmsg" class="muted small"></span></div>
      <canvas class="plot big" id="gc"></canvas><div id="gd" class="small"></div></div>
      <div class="card"><b>Exemples:</b> ${['x^3-3x', 'x*e^(-x)', 'ln(x)/x', '(x^2-1)/(x-2)', 'sin(x)/x', 'x^2*e^(-x^2)'].map(f => `<button class="btn sm" data-f="${f}">${f}</button>`).join(' ')}</div>`;
    typeset(app);
    const draw = () => {
      const f = $('#gf').value.trim(), a = +$('#ga').value, b = +$('#gb').value;
      try {
        const ast = M.parse(f, ['x']); const fs = M.toStr(ast);
        const d1 = M.toStr(M.diff(ast)), d2 = M.toStr(M.diff(M.diff(ast)));
        const fns = [{ f: fs, label: 'f' }];
        if ($('#g1').checked) fns.push({ f: d1, label: "f'", color: getComputedStyle(document.documentElement).getPropertyValue('--warn') });
        if ($('#g2').checked) fns.push({ f: d2, label: "f''", color: getComputedStyle(document.documentElement).getPropertyValue('--ok') });
        if (!(b > a)) throw new Error('interval');
        Calc.plot($('#gc'), { xr: [a, b], fns });
        $('#gmsg').textContent = '';
        $('#gd').innerHTML = `$f'(x)=${M.tex(d1)}$<br>$f''(x)=${M.tex(d2)}$`; typeset($('#gd'));
      } catch (e) { $('#gmsg').textContent = 'No entenc la funció o l\'interval.'; }
    };
    ['#gf', '#ga', '#gb'].forEach(s => $(s).addEventListener('input', draw)); ['#g1', '#g2'].forEach(s => $(s).addEventListener('change', draw));
    $$('[data-f]', app).forEach(b => b.onclick = () => { $('#gf').value = b.dataset.f; draw(); });
    draw();
  }
  Calc.routes.push({ re: /^#\/grafica/, fn: graficaPage });

  /* ------------------------ Mapa del temari (graf de dependències) ------------------------ */
  // Dues vistes: conceptes (detallat) i llistes (general). Cada node es pinta segons el teu domini.
  const SVGNS = 'http://www.w3.org/2000/svg';
  const STATUS = ['No començat', 'Et costa', 'En curs', 'Dominat'];
  /** Domini d'un concepte: mitjana dels 3 millors tipus d'exercici que el fan servir (o de tots, si n'hi ha menys). */
  function conceptStats() {
    const d = store.data(), out = {};
    Object.values(Calc.learn.CONCEPTS).forEach(c => {
      const gens = Calc.allGens().filter(g => (g.needs || []).indexOf(c.id) >= 0);
      let att = 0; const ms = [];
      gens.forEach(g => { const gd = d.gens[g.key]; if (gd) att += gd.att; const m = store.genMastery(g.key); if (m != null) ms.push(m); });
      const k = Math.min(3, gens.length) || 1;
      const val = ms.sort((a, b) => b - a).slice(0, k).reduce((a, b) => a + b, 0) / k;
      out[c.id] = { gens, att, val, st: statusOf(att, val) };
    });
    return out;
  }
  const statusOf = (att, val) => (!att ? 0 : val >= 0.8 ? 3 : val < 0.4 && att >= 3 ? 1 : 2);
  const wrapText = (t, max) => {
    const words = String(t).split(' '), lines = [''];
    words.forEach(w => { const L = lines[lines.length - 1]; if ((L + ' ' + w).trim().length > max && L) lines.push(w); else lines[lines.length - 1] = (L + ' ' + w).trim(); });
    if (lines.length > 2) { lines.length = 2; lines[1] = lines[1].slice(0, max - 1) + '…'; }
    return lines;
  };
  const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(SVGNS, tag); Object.keys(attrs || {}).forEach(k => e.setAttribute(k, attrs[k])); if (parent) parent.appendChild(e); return e; };

  /** Dibuixa un graf per files. rows: [{label, ids:[...]}]; node(id) → {title, sub, val, st, tip}; deps(id) → [ids]. */
  function drawGraph(host, rows, node, deps, onClick, opt) {
    const W = opt.w, H = 54, GX = 16, GY = opt.gy || 96, LW = opt.lw, PER = opt.per;
    const AW = PER * W + (PER - 1) * GX;
    const pos = {}, lines = [];
    let y = 20;
    rows.forEach(r => {
      // ordena per la posició mitjana dels prerequisits (menys encreuaments)
      const bary = id => { const ps = deps(id).filter(p => pos[p]); return ps.length ? ps.reduce((a, p) => a + pos[p].x, 0) / ps.length : null; };
      const ids = r.ids.map((id, i) => ({ id, b: bary(id), i })).sort((a, b) => (a.b == null || b.b == null) ? a.i - b.i : a.b - b.b).map(o => o.id);
      for (let k = 0; k < ids.length; k += PER) {
        const chunk = ids.slice(k, k + PER), tw = chunk.length * W + (chunk.length - 1) * GX;
        let x = LW + (AW - tw) / 2;
        if (k === 0) lines.push({ y, label: r.label });
        chunk.forEach(id => { pos[id] = { x, y }; x += W + GX; });
        y += GY;
      }
    });
    const totalW = LW + AW + 10, totalH = y - GY + H + 24;
    host.innerHTML = '';
    const svg = svgEl('svg', { viewBox: `0 0 ${totalW} ${totalH}`, class: 'graph', role: 'img' }, host);
    const defs = svgEl('defs', {}, svg);
    ['', 'ok'].forEach(k => { const m = svgEl('marker', { id: 'arr' + k, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs); svgEl('path', { d: 'M0,0 L10,5 L0,10 z', class: 'arrow ' + k }, m); });
    lines.forEach(l => {
      svgEl('line', { x1: 0, x2: totalW, y1: l.y - 14, y2: l.y - 14, class: 'band' }, svg);
      const t = svgEl('text', { x: 4, y: l.y + H / 2 + 4, class: 'rowlab' }, svg); t.textContent = l.label;
    });
    const eG = svgEl('g', {}, svg), nG = svgEl('g', {}, svg);
    const edges = [];
    // Reducció transitiva: si A→B→C, no cal dibuixar també A→C (el graf queda molt més net).
    const ancCache = {};
    const ancestors = id => ancCache[id] || (ancCache[id] = deps(id).reduce((set, p) => { set.add(p); ancestors(p).forEach(x => set.add(x)); return set; }, new Set()));
    const direct = id => deps(id).filter(p => !deps(id).some(q => q !== p && ancestors(q).has(p)));
    Object.keys(pos).forEach(id => direct(id).forEach(p => {
      if (!pos[p] || p === id) return;
      const a = pos[p], b = pos[id];
      let d;
      if (Math.abs(a.y - b.y) < 1) { const ax = a.x + W / 2, bx = b.x + W / 2; d = `M${ax},${a.y} Q${(ax + bx) / 2},${a.y - 34} ${bx},${b.y}`; }
      else { const x1 = a.x + W / 2, y1 = a.y + H, x2 = b.x + W / 2, y2 = b.y, dy = (y2 - y1) / 2; d = `M${x1},${y1} C${x1},${y1 + dy} ${x2},${y2 - dy} ${x2},${y2 - 2}`; }
      const ok = node(p).st === 3;
      const e = svgEl('path', { d, class: 'edge' + (ok ? ' ok' : ''), 'marker-end': `url(#arr${ok ? 'ok' : ''})` }, eG);
      edges.push({ from: p, to: id, el: e });
    }));
    const nodes = {};
    Object.keys(pos).forEach(id => {
      const n = node(id), { x, y: yy } = pos[id];
      const g = svgEl('g', { class: 'gnode s' + n.st, transform: `translate(${x},${yy})`, tabindex: 0, 'data-id': id }, nG);
      svgEl('title', {}, g).textContent = n.tip;
      svgEl('rect', { width: W, height: H, rx: 10, class: 'nbox' }, g);
      const tl = wrapText(n.title, opt.chars);
      tl.forEach((ln, i) => { const t = svgEl('text', { x: 10, y: (tl.length === 1 ? 24 : 17) + i * 15, class: 'ntxt' }, g); t.textContent = ln; });
      if (n.st === 3) { const t = svgEl('text', { x: W - 20, y: 20, class: 'ncheck' }, g); t.textContent = '✓'; }
      svgEl('rect', { x: 10, y: H - 11, width: W - 20, height: 4, rx: 2, class: 'nbar' }, g);
      svgEl('rect', { x: 10, y: H - 11, width: Math.max(0, (W - 20) * Math.min(1, n.val)), height: 4, rx: 2, class: 'nfill' }, g);
      g.addEventListener('click', () => onClick(id));
      g.addEventListener('keydown', e => { if (e.key === 'Enter') onClick(id); });
      nodes[id] = g;
    });
    // ressalta la cadena de prerequisits i el que en depèn
    const up = id => deps(id).filter(p => pos[p]), down = id => edges.filter(e => e.from === id).map(e => e.to);
    const walk = (id, f, set) => { f(id).forEach(n => { if (!set.has(n)) { set.add(n); walk(n, f, set); } }); return set; };
    Object.keys(nodes).forEach(id => {
      nodes[id].addEventListener('mouseenter', () => {
        const anc = walk(id, up, new Set()), des = walk(id, down, new Set());
        svg.classList.add('focus');
        Object.keys(nodes).forEach(k => nodes[k].classList.toggle('on', k === id || anc.has(k) || des.has(k)));
        Object.keys(nodes).forEach(k => nodes[k].classList.toggle('anc', anc.has(k)));
        edges.forEach(e => e.el.classList.toggle('on', (e.to === id || anc.has(e.to)) && (anc.has(e.from) || e.from === id) || (e.from === id || des.has(e.from)) && (des.has(e.to) || e.to === id)));
      });
      nodes[id].addEventListener('mouseleave', () => { svg.classList.remove('focus'); Object.values(nodes).forEach(n => n.classList.remove('on', 'anc')); edges.forEach(e => e.el.classList.remove('on')); });
    });
  }

  function mapaPage() {
    U.renderSide('mapa');
    let view = 'c';
    try { view = localStorage.getItem('calcmaster.mapview') || 'c'; } catch (e) { /* res */ }
    const C = Calc.learn.CONCEPTS, cs = conceptStats();
    const nC = Object.keys(C).length, doneC = Object.values(cs).filter(x => x.st === 3).length;
    const mods = ORDER.map(byId).filter(Boolean), doneM = mods.filter(m => { const mm = store.modMastery(m); return mm.att && mm.value >= 0.8; }).length;
    app.innerHTML = `<h1>🗺️ Mapa del temari</h1>
      <p class="lead">Cada caixa és ${view === 'c' ? 'un concepte' : 'una llista'}; cada fletxa vol dir «cal saber això abans». Passa el ratolí per sobre d'una caixa per veure de què depèn i què en depèn. Clica-la per obrir ${view === 'c' ? 'la teoria i els exercicis' : 'la llista'}.</p>
      <div class="mapbar"><div class="seg"><button class="btn sm ${view === 'c' ? 'primary' : ''}" data-v="c">Conceptes (detallat)</button><button class="btn sm ${view === 'm' ? 'primary' : ''}" data-v="m">Llistes (general)</button></div>
        <div class="maplegend">${STATUS.map((s, i) => `<span><i class="lg s${i}"></i>${s}</span>`).join('')}</div>
        <div class="mapprog"><b>${view === 'c' ? doneC + '/' + nC : doneM + '/' + mods.length}</b> ${view === 'c' ? 'conceptes dominats' : 'llistes dominades'}<div class="bar"><i style="width:${Math.round((view === 'c' ? doneC / nC : doneM / mods.length) * 100)}%"></i></div></div></div>
      <div class="graphwrap" id="gwrap"></div>
      <p class="muted small">${view === 'c' ? 'Un concepte es posa <b>verd</b> quan tens almenys 3 tipus d\'exercici que el fan servir (o tots, si n\'hi ha menys) amb un domini ≥ 80%. La barreta de sota mostra com hi vas.' : 'Una llista es posa <b>verda</b> quan el domini mitjà dels seus tipus d\'exercici arriba al 80%.'}</p>`;
    $$('[data-v]', app).forEach(b => b.onclick = () => { try { localStorage.setItem('calcmaster.mapview', b.dataset.v); } catch (e) { /* res */ } mapaPage(); });
    const host = $('#gwrap');
    if (view === 'c') {
      const rows = ORDER.map(id => ({ label: byId(id) ? byId(id).llista.replace('Llista ', 'L').replace(' + Seminari', '') : id, ids: Object.values(C).filter(c => c.mod === id).sort((a, b) => a.sec - b.sec).map(c => c.id) })).filter(r => r.ids.length);
      const deps = id => ((Calc.learn.SECTION_NEEDS[C[id].mod + ':' + C[id].sec]) || []).filter(p => C[p] && p !== id);
      drawGraph(host, rows, id => { const s = cs[id]; return { title: C[id].t, val: s.val, st: s.st, tip: `${C[id].t} — ${STATUS[s.st]} (${U.pct(s.val)}%) · ${s.gens.length} tipus d'exercici` }; }, deps, id => {
        Calc.openRef(id);
        const s = cs[id];
        const gl = s.gens.slice().sort((a, b) => (store.genMastery(a.key) || 0) - (store.genMastery(b.key) || 0)).map(g => { const m = store.genMastery(g.key), lv = U.mlevel(m); return `<a class="gl" href="#/mod/${g.mod}/practice?g=${g.id}"><span class="dot m${lv}"></span>${esc(g.title)}<span class="muted small">${m == null ? 'nou' : U.pct(m) + '%'}</span></a>`; }).join('');
        const b = $('#drawer .dbody');
        if (b && gl) b.insertAdjacentHTML('afterbegin', `<div class="mapgens"><div class="muted small">Exercicis que el fan servir (primer els que menys domines)</div>${gl}</div>`);
      }, { w: 158, lw: 64, per: 6, chars: 18 });
    } else {
      const depsM = id => (PREREQ[id] || []).map(x => x[0]).filter(byId);
      const depth = {}, dep = id => depth[id] != null ? depth[id] : (depth[id] = depsM(id).reduce((a, p) => Math.max(a, dep(p) + 1), 0));
      ORDER.forEach(dep);
      const maxD = Math.max(...Object.values(depth));
      const rows = []; for (let k = 0; k <= maxD; k++) rows.push({ label: 'Nivell ' + (k + 1), ids: ORDER.filter(id => depth[id] === k) });
      drawGraph(host, rows.filter(r => r.ids.length), id => { const m = byId(id), mm = store.modMastery(m); const st = statusOf(mm.att, mm.value); return { title: m.llista.replace(' + Seminari', '') + ' · ' + U.sideName(m), val: mm.value, st, tip: `${m.title} — ${STATUS[st]} (${U.pct(mm.value)}%)` }; }, depsM,
        id => { location.hash = '#/mod/' + id + '/theory'; }, { w: 230, lw: 80, per: 3, chars: 30, gy: 90 });
    }
  }
  Calc.routes.push({ re: /^#\/mapa/, fn: mapaPage });

  /* ------------------------ Què estudiem i per què (guia docent) ------------------------ */
  // Regles de qualificació de la guia docent: M=(P1+P2)/2, NF=0,8·M+0,2·S, recuperació amb màxim 6.
  const fx = (v, d) => v.toFixed(d).replace('.', ',');
  function nota(p1, p2, s) {
    const M = (p1 + p2) / 2;
    if (M < 2.5) return { M, cls: 'bad', txt: `Suspès amb ${fx(M, 2)} i <b>sense dret a recuperació</b> (la mitjana dels parcials és inferior a 2,5).` };
    if (M < 3.5) return { M, cls: 'warn', txt: `Mitjana ${fx(M, 2)}: has d'anar a la <b>recuperació</b> (entre 2,5 i 3,5).` };
    const NF = 0.8 * M + 0.2 * s;
    if (NF >= 5) return { M, NF, cls: 'ok', txt: `<b>Aprovat</b> amb ${fx(NF, 2)} (0,8·${fx(M, 2)} + 0,2·${fx(s, 1)}).` };
    return { M, NF, cls: 'warn', txt: `Nota ${fx(NF, 2)} &lt; 5: has d'anar a la <b>recuperació</b>.` };
  }
  function cursPage() {
    U.renderSide('curs');
    const L = Calc.learn, B = L.BLOCS, ST = L.STORY;
    const modLink = id => { const m = byId(id); if (!m) return ''; const mm = store.modMastery(m), st = statusOf(mm.att, mm.value); return `<a class="mlink s${st}" href="#/mod/${id}/theory" title="${esc(m.title)} — ${STATUS[st]} (${U.pct(mm.value)}%)">${esc(m.llista.replace(' + Seminari', ''))}</a>`; };
    const bloc = b => `<div class="bloc"><div class="bh"><span class="bn">${b.n}</span><div><b>${esc(b.t)}</b><div class="bq">${esc(b.q)}</div></div><span class="chip ${b.exam === 'p1' ? 'accent' : 'warn'}">${b.exam === 'p1' ? '1r parcial' : '2n parcial'}</span></div>
      <p>${b.idea}</p><ul class="bitems">${b.items.map(([t, ids]) => `<li><span>${esc(t)}</span><span class="mls">${ids.map(modLink).join('')}</span></li>`).join('')}</ul></div>`;
    const rows = ORDER.filter(id => ST[id]).map(id => { const s = ST[id], m = byId(id); return `<tr><td>${modLink(id)}</td><td><b>${s[1]}</b><div class="muted small">${esc(m.title)}</div></td><td>${s[2]}</td><td>${s[3]}</td><td>${s[4]}</td></tr>`; }).join('');
    app.innerHTML = `<h1>🎓 Què estudiem i per què</h1>
      <p class="lead">Tot el curs gira al voltant d'una sola idea: <b>entendre com canvien les coses</b>. Primer aprens a mesurar el canvi (derivar), després a aproximar funcions difícils, després a fer el camí invers i acumular (integrar), i finalment a resoldre equacions on la incògnita és una funció que canvia (EDOs). Cada bloc fa servir l'anterior.</p>
      <div class="blocs">${B.map(bloc).join('<div class="barrow" aria-hidden="true">↓</div>')}</div>

      <h2>La cadena, en una línia</h2>
      <div class="card chain"><span>Àlgebra</span>→<span>Funcions</span>→<span>Límits</span>→<span>Derivades</span>→<span>Extrems, gràfiques, L'Hôpital</span>→<span>Taylor, Newton</span>→<span>Primitives (derivar al revés)</span>→<span>Integrals</span>→<span>EDOs</span>
        <p class="muted small" style="margin:10px 0 0">Si una peça falla, totes les de la dreta costen. Per això, si integrar et costa, sovint el problema és derivar. El detall concepte per concepte és al <a href="#/mapa">mapa del temari</a>.</p></div>

      <h2>Llista per llista: què fem i per a què serveix</h2>
      <div class="card tablewrap"><table class="tbl story"><tr><th>Llista</th><th>Pregunta que respon</th><th>Ve de</th><th>Porta a</th><th>Per a què serveix (informàtica)</th></tr>${rows}</table></div>

      <h2>Com t'avaluen (guia docent)</h2>
      <div class="grid cols3">
        <div class="card stat"><b>40%</b><span>1r parcial · blocs 1 i 2 (llistes 0–6 i Newton)</span></div>
        <div class="card stat"><b>40%</b><span>2n parcial · blocs 3 i 4 (llistes 7–12)</span></div>
        <div class="card stat"><b>20%</b><span>2 lliuraments de seminari · <b>no recuperable</b></span></div>
      </div>
      <div class="card" style="margin-top:14px"><ul class="rules">
        <li>$M=\\frac{P_1+P_2}{2}$. Si $M<2{,}5$: suspès <b>sense recuperació</b>.</li>
        <li>Si $2{,}5\\le M<3{,}5$: vas a la recuperació.</li>
        <li>Si $M\\ge3{,}5$: nota final $NF=0{,}8M+0{,}2S$ ($S$ = seminaris). Si $NF\\ge5$, aprovat; si no, recuperació.</li>
        <li>A la recuperació: si $R<3{,}5$, suspès amb $R$; si no, nota $=\\min(0{,}8R+0{,}2S;\;6)$. <b>Màxim un 6.</b></li>
        <li>Si no et presentes al 1r parcial consta com a No avaluable i no pots recuperar-lo (tret de causa justificada).</li>
      </ul><p class="muted small" style="margin:0">Els límits exactes 2,5 i 3,5 la guia no els deixa del tot clars; aquí es tracten com «recuperació» i «nota final» respectivament.</p></div>

      <h2>🧮 Calculadora de nota</h2>
      <div class="card calc"><div class="cin">
        <label>1r parcial<input class="ans num" id="nP1" inputmode="decimal" placeholder="0–10"></label>
        <label>2n parcial<input class="ans num" id="nP2" inputmode="decimal" placeholder="buit = encara no"></label>
        <label>Seminaris (S)<input class="ans num" id="nS" inputmode="decimal" placeholder="0–10"></label>
        <label>Recuperació<input class="ans num" id="nR" inputmode="decimal" placeholder="opcional"></label></div>
        <div id="nOut" class="nout muted">Escriu les notes que tinguis. Si deixes el 2n parcial buit, et dic quant hi necessites.</div></div>`;
    typeset(app);
    const num = id => { const v = $(id).value.trim().replace(',', '.'); return v === '' ? null : Math.max(0, Math.min(10, +v)); };
    const upd = () => {
      const p1 = num('#nP1'), p2 = num('#nP2'), s = num('#nS') == null ? 0 : num('#nS'), R = num('#nR'), out = $('#nOut');
      const sTxt = num('#nS') == null ? ' <span class="muted">(seminaris comptats com a 0; posa la teva nota per afinar)</span>' : '';
      if (p1 == null || isNaN(p1)) { out.className = 'nout muted'; out.innerHTML = 'Escriu almenys la nota del 1r parcial.'; return; }
      let h = '';
      if (p2 == null) {
        const need = Math.max(3.5, (5 - 0.2 * s) / 0.8) * 2 - p1, avoid = 5 - p1;
        h = need <= 10 ? `Per <b>aprovar directament</b> necessites un <b>${fx(Math.max(0, need), 2)}</b> al 2n parcial.` : `Ni amb un 10 al 2n parcial arribaries a aprovar directament: aniries a la recuperació (si la mitjana passa de 2,5).`;
        h += avoid > 0 ? `<br>Per no quedar <b>sense recuperació</b> necessites com a mínim un <b>${fx(avoid, 2)}</b>.` : '';
        out.className = 'nout ' + (need <= 10 ? 'ok' : 'warn');
      } else {
        const r = nota(p1, p2, s); h = r.txt; out.className = 'nout ' + r.cls;
        if (R != null && r.cls === 'warn') h += R < 3.5 ? `<br>Recuperació ${fx(R, 2)} &lt; 3,5 ⇒ suspès amb ${fx(R, 2)}.` : `<br>Amb ${fx(R, 2)} a la recuperació ⇒ nota final <b>${fx(Math.min(0.8 * R + 0.2 * s, 6), 2)}</b> (màxim 6).`;
      }
      out.innerHTML = h + sTxt;
    };
    ['#nP1', '#nP2', '#nS', '#nR'].forEach(id => $(id).addEventListener('input', upd));
  }
  Calc.routes.push({ re: /^#\/curs/, fn: cursPage });

  // La primera ruta s'ha pintat abans de carregar aquest fitxer: torna-la a dibuixar.
  U.route();
})();
