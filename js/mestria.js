/* ===================================================================
   mestria.js — Mestria i constància: rangs per habilitat, XP i nivells,
   ratxa, objectiu i missions del dia, calendari d'esforç, repàs espaciat,
   proves de mestria per llista, assoliments i projecció cap al 2n parcial.
   =================================================================== */
(function () {
  'use strict';
  const U = window.CalcUI, { $, $$, esc, app, typeset, QView, renderSide, renderTop, mountPractice, pct } = U;
  const store = Calc.store, MODS = Calc.modules, RANKS = Calc.RANKS, RP = Calc.RANK_PTS, P2 = Calc.P2_IDS;
  const DAY = 864e5;
  const D = () => store.data();
  const fx = (x, n) => (+x).toFixed(n == null ? 1 : n).replace('.', ',');
  const gensOf = ids => MODS.filter(m => ids.includes(m.id)).flatMap(m => m.gens);
  const P1_MODS = MODS.filter(m => !P2.includes(m.id)).map(m => m.id);
  const ALL = MODS.map(m => m.id);

  /* ------------------------------ Nivells (XP) ------------------------------ */
  // Els títols segueixen l'ordre del temari: com més puges, més lluny has arribat.
  const TITLES = ['Nouvingut', 'Curiós', 'Aprenent d\'àlgebra', 'Domador de fraccions', 'Explorador de funcions', 'Caçador de límits', 'Continu', 'Derivador',
    'Regla de la cadena', 'Optimitzador', 'Dibuixant de gràfiques', 'Mestre de l\'Hôpital', 'Taylorista', 'Interpolador', 'Newtonià', 'Integrador',
    'Partidor (per parts)', 'Fraccionador', 'Riemann', 'Arquimedes', 'Simpsonià', 'Resolutor d\'EDOs', 'Lineal', 'Oscil·lador', 'Bernoulli',
    'Leibniz', 'Newton', 'Cauchy', 'Euler', 'Gauss'];
  const need = L => 100 + 40 * (L - 1);
  function lvlInfo(xp) {
    let L = 1, acc = 0;
    while (xp >= acc + need(L)) { acc += need(L); L++; }
    return { L, into: xp - acc, need: need(L), p: (xp - acc) / need(L), title: TITLES[Math.min(L, TITLES.length) - 1] + (L > TITLES.length ? ' +' + (L - TITLES.length) : '') };
  }

  /* ------------------------------ Rangs ------------------------------ */
  const pill = r => `<span class="rk r${r}">${RANKS[r]}</span>`;
  const gd = key => D().gens[key] || { att: 0, ok: 0, pts: 0, best: 0, due: 0, hist: [] };
  const nextTxt = g => g.best >= 6 ? 'rang màxim' : '→ ' + RANKS[g.best + 1] + ': ' + Calc.nextReq(g).map(q => (q.done ? '✓ ' : '') + q.have + '/' + q.need + ' ' + q.label).join(' · ');
  const toNext = g => { if (g.best >= 6) return 1; const r = Calc.nextReq(g); return r.reduce((a, q) => a + Math.min(1, q.have / q.need), 0) / r.length; };
  const hm = ms => { const m = Math.round((ms || 0) / 6e4); return m < 60 ? m + ' min' : fx(m / 60) + ' h'; };
  const pl = (n, a, b) => n + ' ' + (n === 1 ? a : b);
  const reqOf = i => [pl(RP[i], 'punt', 'punts'), Calc.RANK_DAYS[i] ? pl(Calc.RANK_DAYS[i], 'dia', 'dies') : '', Calc.RANK_REVS[i] ? pl(Calc.RANK_REVS[i], 'repàs', 'repassos') : ''].filter(Boolean).join(' · ');
  const dueTxt = g => {
    if (g.best < 2) return '';
    const dd = Math.ceil((g.due - Date.now()) / DAY);
    return dd <= 0 ? '<span class="chip warn">toca repàs</span>' : `<span class="muted small">repàs en ${dd} d</span>`;
  };
  Calc.rankLine = key => {
    const g = gd(key);
    return `<div class="rankline"><div class="row"><span class="muted small">La teva mestria</span>${pill(g.best)}<span class="small">${nextTxt(g)}</span>${dueTxt(g)}</div>${Calc.examChip ? `<div class="small" style="margin-top:4px">${Calc.examChip(key)} <span class="muted">${Calc.examLabel(key)}</span></div>` : ''}<div class="mbar1"><i class="r${Math.min(6, g.best + 1)}" style="width:${pct(toNext(g))}%"></i></div></div>`;
  };
  Calc.gainHtml = info => {
    const g = gd(info.key), up = info.to > info.from;
    let t;
    if (info.kind === 'ok') t = `<b>+${info.xp} XP</b> · +1 punt${info.revOk ? ' · <b>🧠 repàs superat</b>' : ''} · ${pill(g.best)} ${nextTxt(g)}${up ? ' · <b>▲ Has pujat de rang!</b>' : ''}`;
    else if (info.kind === 'fail') t = `<b>+${info.xp} XP</b> per l'esforç · ${info.ptsFrom > info.pts ? '−1 punt' : 'cap punt'} (${nextTxt(g)}). <span class="muted">El rang no baixa mai.</span>`;
    else t = `<b>+${info.xp} XP</b> per l'esforç · sense punts de mestria (${info.kind === 'assist' ? 'amb pista' : 'solució mirada'}). <span class="muted">Torna-ho a provar sense ajuda per pujar.</span>`;
    return `<div class="gain">${t}</div>`;
  };
  const dueGens = () => Calc.allGens().filter(g => store.isDue(g.key)); // el repàs inclou tot: el que has après no es dona per sabut
  Calc.dueCount = () => dueGens().length;

  /** Estadístiques d'un conjunt de llistes. */
  function domStats(ids) {
    const gens = gensOf(ids), counts = [0, 0, 0, 0, 0, 0, 0];
    let val = 0;
    gens.forEach(g => { const r = store.rank(g.key); counts[r]++; val += store.genMastery(g.key) || 0; });
    return { n: gens.length, counts, val: gens.length ? val / gens.length : 0, dom: counts[5] + counts[6], gens };
  }
  const distBar = (s, h) => `<div class="mbar${h ? ' big' : ''}">${[6, 5, 4, 3, 2, 1].map(r => s.counts[r] ? `<i class="r${r}" style="width:${s.counts[r] / s.n * 100}%" title="${RANKS[r]}: ${s.counts[r]}"></i>` : '').join('')}</div>`;
  const legend = () => `<div class="legend">${RANKS.map((r, i) => `<span><i class="dot r${i}"></i>${r} <span class="muted">${i ? reqOf(i) : ''}</span></span>`).join('')}</div>`;
  Calc.modChip = m => {
    const s = domStats([m.id]), c = D().cert[m.id];
    return `<span class="chip" title="Habilitats Dominades d'aquesta llista">🟢 ${s.dom}/${s.n} dominades</span><a class="chip ${c ? 'ok' : 'accent'}" href="#/prova/${m.id}" title="Demostra que ja ho saps i salta't la pràctica">${c ? '🏅 Certificada' : '🏅 Prova de mestria'}</a>`;
  };

  /* ------------------------------ Toasts ------------------------------ */
  function toast(icon, title, sub) {
    let box = $('#toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = 'toast';
    t.innerHTML = `<span class="ti">${icon}</span><div><b>${esc(title)}</b>${sub ? `<div class="muted small">${esc(sub)}</div>` : ''}</div>`;
    box.appendChild(t);
    while (box.children.length > 3) box.firstElementChild.remove();
    setTimeout(() => t.classList.add('out'), 4200); setTimeout(() => t.remove(), 4700);
  }
  Calc.toast = toast;

  /* ------------------------------ Missions del dia ------------------------------ */
  const MISSIONS = {
    ups: { t: 'Puja de rang 2 habilitats', v: x => x.ups, n: 2 },
    row: { t: 'Encerta 5 seguits a la primera', v: x => x.bestRow, n: 5 },
    time: { t: 'Estudia 20 minuts', v: x => Math.floor(x.ms / 6e4), n: 20 },
    gens: { t: 'Treballa 4 tipus d\'exercici diferents', v: x => Object.keys(x.gens).length, n: 4 },
    p2: { t: 'Fes 8 exercicis del temari del 2n parcial', v: x => x.p2, n: 8 },
    rev: { t: 'Fes 5 exercicis del repàs del dia', v: x => x.rev, n: 5 },
    ok: { t: 'Encerta 10 exercicis a la primera', v: x => x.ok, n: 10 },
    xpart: { t: 'Treballa 2 apartats d\'exàmens reals', v: x => x.xpart || 0, n: 2 }
  };
  const MIS_XP = 25, GOAL_XP = 30;
  function missions() {
    const t = store.today();
    if (!t.mis) {
      const pool = Object.keys(MISSIONS).filter(k => k !== 'rev' || Calc.dueCount() >= 5);
      let h = 0; for (const c of Calc.dayStr()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      const r = M.rng(h); t.mis = r.shuffle(pool).slice(0, 3); t.misDone = {}; store.save();
    }
    return t.mis.map(id => { const m = MISSIONS[id]; return { id, t: m.t, n: m.n, v: Math.min(m.n, m.v(t)), done: !!t.misDone[id] }; });
  }

  /* ------------------------------ Assoliments ------------------------------ */
  function stats() {
    const d = D(), gens = Object.values(d.gens);
    const days = Object.values(d.dayx);
    const allS = domStats(ALL), p1S = domStats(P1_MODS), p2S = domStats(P2);
    let nivell = false; try { nivell = !!localStorage.getItem('calcmaster.nivell'); } catch (e) { /* res */ }
    return {
      n: gens.reduce((a, g) => a + g.att, 0), ok: gens.reduce((a, g) => a + g.ok, 0), streak: store.streakDays(), bestStreak: store.bestStreak(), bestRow: d.bestRow,
      dom: allS.dom, domP1: p1S.dom === p1S.n, domP2: p2S.dom === p2S.n, domAll: allS.dom === allS.n, mestre: allS.counts[6],
      cert: Object.keys(d.cert).length, goals: days.filter(x => x.goalHit).length, hours: d.ms / 36e5, rev: days.reduce((a, x) => a + (x.rev || 0), 0),
      exams: d.exams.length, examPass: d.exams.some(e => e.mark >= 5), nivell, activeDays: Object.keys(d.days).length,
      xtried: Object.keys(d.xparts || {}).filter(k => /^P[12]:/.test(k)).length, xdom: Object.keys(d.xparts || {}).filter(k => /^P[12]:/.test(k) && d.xparts[k].best >= 5).length,
      ltried: Object.keys(d.xparts || {}).filter(k => /^L:/.test(k)).length, ldom: Object.keys(d.xparts || {}).filter(k => /^L:/.test(k) && d.xparts[k].best >= 5).length,
      xP2all: Calc.examStats ? (x => x.tried === x.n && x.n > 0)(Calc.examStats(p => p.par === 2)) : false
    };
  }
  const ACH = [
    ['first', '🌱', 'Primer pas', 'Resol el teu primer exercici', s => s.n >= 1],
    ['ok10', '✏️', 'Escalfant', '10 encerts a la primera', s => s.ok >= 10],
    ['ok50', '📗', 'En marxa', '50 encerts a la primera', s => s.ok >= 50],
    ['ok100', '💯', 'Centenari', '100 encerts a la primera', s => s.ok >= 100],
    ['ok250', '🧱', 'Constructor', '250 encerts a la primera', s => s.ok >= 250],
    ['ok500', '🏗️', 'Obra gran', '500 encerts a la primera', s => s.ok >= 500],
    ['ok1000', '🏔️', 'Mil', '1.000 encerts a la primera', s => s.ok >= 1000],
    ['ok2000', '🌌', 'Imparable', '2.000 encerts a la primera', s => s.ok >= 2000],
    ['st3', '🔥', 'Tres dies', 'Ratxa de 3 dies seguits', s => s.bestStreak >= 3],
    ['st7', '📅', 'Una setmana', 'Ratxa de 7 dies seguits', s => s.bestStreak >= 7],
    ['st14', '🗓️', 'Dues setmanes', 'Ratxa de 14 dies seguits', s => s.bestStreak >= 14],
    ['st30', '🏆', 'Un mes sencer', 'Ratxa de 30 dies seguits', s => s.bestStreak >= 30],
    ['row5', '⚡', 'Cinc seguides', '5 encerts seguits a la primera', s => s.bestRow >= 5],
    ['row10', '🌩️', 'Deu seguides', '10 encerts seguits a la primera', s => s.bestRow >= 10],
    ['row25', '🚀', 'Vint-i-cinc seguides', '25 encerts seguits a la primera', s => s.bestRow >= 25],
    ['dom1', '🟢', 'Primer domini', 'Una habilitat a Dominat', s => s.dom >= 1],
    ['dom10', '🌿', 'Deu dominades', '10 habilitats a Dominat', s => s.dom >= 10],
    ['dom50', '🌳', 'Cinquanta dominades', '50 habilitats a Dominat', s => s.dom >= 50],
    ['domP2', '📘', 'Preparat per al 2n parcial', 'Tot el temari del 2n parcial a Dominat', s => s.domP2],
    ['domP1', '📕', 'Primer parcial superat', 'Tot el temari del 1r parcial a Dominat', s => s.domP1],
    ['domAll', '👑', 'Tot el temari', 'Totes les habilitats a Dominat', s => s.domAll],
    ['mestre1', '🥇', 'Mestre', 'Una habilitat a rang Mestre', s => s.mestre >= 1],
    ['cert1', '🏅', 'Certificat', 'Supera una prova de mestria', s => s.cert >= 1],
    ['cert5', '🎖️', 'Cinc certificats', 'Supera 5 proves de mestria', s => s.cert >= 5],
    ['certAll', '🎓', 'Tot certificat', 'Supera la prova de totes les llistes', s => s.cert >= MODS.length],
    ['goal1', '🎯', 'Objectiu complert', 'Compleix l\'objectiu diari', s => s.goals >= 1],
    ['goal10', '🎯', 'Deu objectius', 'Compleix l\'objectiu diari 10 dies', s => s.goals >= 10],
    ['h1', '⏱️', 'Una hora', '1 hora d\'estudi actiu', s => s.hours >= 1],
    ['h10', '⌛', 'Deu hores', '10 hores d\'estudi actiu', s => s.hours >= 10],
    ['h30', '🕰️', 'Trenta hores', '30 hores d\'estudi actiu', s => s.hours >= 30],
    ['rev20', '🧠', 'Memòria llarga', '20 exercicis de repàs fets quan tocava', s => s.rev >= 20],
    ['nivell', '🔎', 'Saps on ets', 'Fes el test de nivell', s => s.nivell],
    ['exam1', '📝', 'Primer examen', 'Acaba un examen generat', s => s.exams >= 1],
    ['exam5', '✅', 'Aprovat', 'Treu un 5 o més en un examen generat', s => s.examPass],
    ['h50', '🏋️', 'Cinquanta hores', '50 hores d\'estudi actiu', s => s.hours >= 50],
    ['h100', '🗿', 'Cent hores', '100 hores d\'estudi actiu: això és entrenar', s => s.hours >= 100],
    ['xp1', '📄', 'A l\'examen real', 'Treballa el primer apartat d\'un examen real', s => s.xtried >= 1],
    ['xp25', '📚', 'Vint-i-cinc apartats', 'Treballa 25 apartats d\'exàmens reals', s => s.xtried >= 25],
    ['xpP2', '🧾', 'Tot el 2n parcial vist', 'Treballa tots els apartats dels exàmens del 2n parcial', s => s.xP2all],
    ['xd1', '🎓', 'Apartat dominat', 'Domina un apartat d\'examen real', s => s.xdom >= 1],
    ['xd20', '🧑‍🎓', 'Vint apartats dominats', 'Domina 20 apartats d\'exàmens reals', s => s.xdom >= 20],
    ['ll10', '📋', 'De la llista al paper', 'Treballa 10 exercicis de les llistes oficials', s => s.ltried >= 10],
    ['ll50', '🗂️', 'Llistes a fons', 'Treballa 50 exercicis de les llistes oficials', s => s.ltried >= 50],
    ['lld10', '🏗️', 'Deu exercicis de llista dominats', 'Domina 10 exercicis de les llistes oficials', s => s.ldom >= 10]
  ];
  function checkAch(quiet) {
    const d = D(), s = stats(); let any = false;
    ACH.forEach(([id, icon, t, desc, f]) => { if (!d.ach[id] && f(s)) { d.ach[id] = Date.now(); any = true; if (!quiet) toast(icon, 'Assoliment: ' + t, desc); } });
    if (any) store.save();
  }

  /* ------------------------------ Després de cada resposta ------------------------------ */
  store.on(info => {
    const d = D(), t = store.today();
    const before = lvlInfo(d.xp - info.xp).L;
    if (t.n === 1 && store.streakDays() > 1) toast('🔥', `Ratxa de ${store.streakDays()} dies`, 'Has tornat avui. Així es fa.');
    if (info.to > info.from && info.to >= 5) { const g = Calc.genByKey(info.key); toast(info.to === 6 ? '🥇' : '🟢', `${RANKS[info.to]}: ${g ? g.title : ''}`, info.to === 6 ? 'Rang màxim.' : 'Aquesta habilitat ja la domines.'); }
    if (!t.goalHit && t.n >= d.goal) { t.goalHit = true; store.addXp(GOAL_XP); toast('🎯', 'Objectiu del dia complert', `${d.goal} exercicis avui (+${GOAL_XP} XP)`); }
    (t.mis || []).forEach(id => { const m = MISSIONS[id]; if (!t.misDone[id] && m.v(t) >= m.n) { t.misDone[id] = 1; store.addXp(MIS_XP); toast('✅', 'Missió complerta', `${m.t} (+${MIS_XP} XP)`); } });
    const after = lvlInfo(d.xp); if (after.L > before) toast('⭐', `Nivell ${after.L}: ${after.title}`, 'Has pujat de nivell.');
    (d.recent = d.recent || []).push(info.kind === 'ok' ? 1 : info.kind === 'fail' ? -1 : 0); if (d.recent.length > 60) d.recent.shift();
    setTimeout(() => checkAch(false), 0);
  });

  /** Després d'autoavaluar un apartat d'examen: missions, nivell i assoliments. */
  Calc.afterPart = info => {
    const d = D(), t = store.today(), before = lvlInfo(d.xp - (info.xp || 0)).L;
    (t.mis || []).forEach(id => { const m = MISSIONS[id]; if (!t.misDone[id] && m.v(t) >= m.n) { t.misDone[id] = 1; store.addXp(MIS_XP); toast('✅', 'Missió complerta', `${m.t} (+${MIS_XP} XP)`); } });
    const after = lvlInfo(d.xp); if (after.L > before) toast('⭐', `Nivell ${after.L}: ${after.title}`, 'Has pujat de nivell.');
    store.save(); setTimeout(() => checkAch(false), 0);
  };

  /* ------------------------------ Barra superior ------------------------------ */
  Calc.topStats = () => {
    const d = D(), li = lvlInfo(d.xp), t = store.today(), st = store.streakDays(), active = !!d.days[Calc.dayStr()];
    const r = 8, c = 2 * Math.PI * r, gp = Math.min(1, t.n / d.goal);
    return `<a class="tlvl" href="#/mestria" title="${esc(li.title)} · ${li.into}/${li.need} XP per al nivell ${li.L + 1}"><span class="lv">Nv ${li.L}</span><span class="xpbar"><i style="width:${pct(li.p)}%"></i></span><span class="hide-sm muted">${esc(li.title)}</span></a>
      <a class="tchip ${active ? '' : 'off'}" href="#/mestria" title="${active ? 'Ratxa de dies seguits' : 'Encara no has fet res avui: fes un exercici per mantenir la ratxa'}">🔥 <b>${st}</b></a>
      <a class="tchip" href="#/mestria" title="Objectiu del dia: ${t.n}/${d.goal} exercicis"><svg class="gring" viewBox="0 0 20 20"><circle cx="10" cy="10" r="${r}" fill="none" stroke="var(--panel3)" stroke-width="3"/><circle cx="10" cy="10" r="${r}" fill="none" stroke="${gp >= 1 ? 'var(--ok)' : 'var(--accent)'}" stroke-width="3" stroke-linecap="round" stroke-dasharray="${(c * gp).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 10 10)"/></svg><b>${t.n}/${d.goal}</b></a>`;
  };

  /* ------------------------------ Calendari d'esforç ------------------------------ */
  function heatmap(weeks) {
    const d = D(), now = new Date(); now.setHours(12, 0, 0, 0);
    const start = new Date(now); start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - 7 * (weeks - 1));
    const lvl = n => (!n ? 0 : n < 5 ? 1 : n < 15 ? 2 : n < 30 ? 3 : 4);
    let cols = '', months = '';
    for (let w = 0; w < weeks; w++) {
      let cells = '';
      for (let k = 0; k < 7; k++) {
        const dt = new Date(start); dt.setDate(start.getDate() + w * 7 + k);
        const key = Calc.dayStr(dt), n = d.days[key] || 0, fut = dt > now;
        cells += `<i class="h${fut ? 'f' : lvl(n)}" title="${dt.toLocaleDateString('ca', { weekday: 'short', day: 'numeric', month: 'short' })}: ${n} exercicis"></i>`;
      }
      const first = new Date(start); first.setDate(start.getDate() + w * 7);
      months += `<span>${first.getDate() <= 7 ? first.toLocaleDateString('ca', { month: 'short' }) : ''}</span>`;
      cols += `<div class="hcol">${cells}</div>`;
    }
    return `<div class="heat"><div class="hmon" style="grid-template-columns:repeat(${weeks},1fr)">${months}</div><div class="hgrid">${cols}</div><div class="hleg muted small">Menys <i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i> Més</div></div>`;
  }
  function weekSum(offset) {
    const d = D(), now = new Date(); let n = 0, ms = 0, ups = 0, ok = 0;
    const mon = new Date(now); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7) - 7 * offset);
    for (let k = 0; k < 7; k++) { const dt = new Date(mon); dt.setDate(mon.getDate() + k); const x = d.dayx[Calc.dayStr(dt)]; n += d.days[Calc.dayStr(dt)] || 0; if (x) { ms += x.ms; ups += x.ups; ok += x.ok; } }
    return { n, ms, ups, ok };
  }

  /* ------------------------------ Projecció ------------------------------ */
  /** Quants exercicis et falten perquè tot un conjunt quedi a Dominat, al teu encert actual. */
  function projection(ids) {
    const d = D(), s = domStats(ids);
    const remaining = s.gens.reduce((a, g) => { const x = gd(g.key); return a + (x.best >= 5 ? 0 : Math.max(0, RP[5] - x.pts)); }, 0);
    const minDays = s.gens.reduce((a, g) => { const x = gd(g.key); return x.best >= 5 ? a : Math.max(a, Calc.RANK_DAYS[5] - (x.days || 0)); }, 0);
    const rec = d.recent || [], net = rec.length >= 10 ? rec.reduce((a, b) => a + b, 0) / rec.length : 0.6;
    const totAtt = Object.values(d.gens).reduce((a, g) => a + g.att, 0);
    const minPer = totAtt >= 10 ? Math.min(6, Math.max(0.6, d.ms / 6e4 / totAtt)) : 1.5;
    let n7 = 0; for (let k = 0; k < 7; k++) { const dt = new Date(); dt.setDate(dt.getDate() - k); n7 += d.days[Calc.dayStr(dt)] || 0; }
    const ex = net > 0.05 ? Math.ceil(remaining / net) : Infinity;
    return { remaining, net, ex, hours: ex * minPer / 60, minPer, rate: n7 / 7, s, measured: rec.length >= 10, minDays };
  }
  const daysTo = iso => { if (!iso) return null; const t = new Date(iso + 'T09:00:00'); return Math.ceil((t - Date.now()) / DAY); };

  /** Nota necessària al 2n parcial (regles de la guia docent). */
  function needP2(p1, s) {
    const direct = 2 * Math.max(3.5, (5 - 0.2 * s) / 0.8) - p1, recu = 5 - p1;
    return { direct, recu };
  }

  /* ------------------------------ Tauler d'inici ------------------------------ */
  Calc.dashMestria = () => {
    const d = D(), li = lvlInfo(d.xp), t = store.today(), mis = missions(), due = Calc.dueCount(), dl = daysTo(d.p2date), pj = projection(P2);
    return `<div class="card mstrip" style="margin-top:16px">
      <div class="mcol"><div class="muted small">Nivell ${li.L}</div><b>${esc(li.title)}</b><div class="mbar1"><i class="r4" style="width:${pct(li.p)}%"></i></div><div class="muted small">${li.into}/${li.need} XP</div></div>
      <div class="mcol"><div class="muted small">Avui</div><b>${t.n}/${d.goal} exercicis</b><div class="mbar1"><i class="${t.n >= d.goal ? 'r5' : 'r4'}" style="width:${pct(Math.min(1, t.n / d.goal))}%"></i></div><div class="muted small">🔥 ratxa ${store.streakDays()} d · ${Math.round(t.ms / 6e4)} min</div></div>
      <div class="mcol mis">${mis.map(m => `<div class="${m.done ? 'done' : ''}">${m.done ? '✅' : '⬜'} ${esc(m.t)} <span class="muted">${m.v}/${m.n}</span></div>`).join('')}</div>
      <div class="mcol"><a class="btn ${due ? 'primary' : ''} sm" href="#/repas">🧠 Repàs del dia${due ? ' (' + due + ')' : ''}</a>
        <div class="muted small" style="margin-top:6px">2n parcial: ${pj.s.dom}/${pj.s.n} dominades${dl != null && dl >= 0 ? ` · falten ${dl} dies` : ''}</div><a class="small" href="#/mestria">Veure la meva mestria →</a></div></div>`;
  };

  /* ------------------------------ Pàgina de mestria ------------------------------ */
  function mestriaPage() {
    renderSide('mestria'); checkAch(true);
    const d = D(), li = lvlInfo(d.xp), s = stats(), t = store.today(), mis = missions(), due = Calc.dueCount();
    const all = domStats(ALL), p1 = domStats(P1_MODS), p2 = domStats(P2);
    const w0 = weekSum(0), w1 = weekSum(1);
    const pj2 = projection(P2), pjA = projection(ALL), dl = daysTo(d.p2date);
    const cmp = (a, b) => (b ? (a >= b ? `<span class="okc">▲ ${a - b}</span>` : `<span class="badc">▼ ${b - a}</span>`) : '');

    const projTxt = (pj, label, days) => {
      if (pj.remaining === 0) return `<p>✅ <b>${label}: tot Dominat.</b> Ara toca mantenir-ho amb el repàs del dia i fer exàmens.</p>`;
      if (!isFinite(pj.ex)) return `<p>⚠️ <b>${label}:</b> al teu encert actual no avances: falles gairebé tant com encertes (cada encert suma 1 punt i cada error en resta 1). Baixa de dificultat (exercicis ★), fes servir 📘 Exemple i 💡 Pista, i torna a pujar.</p>`;
      const perDay = days && days > 0 ? Math.ceil(pj.ex / days) : null;
      return `<p><b>${label}:</b> et falten <b>${pj.remaining}</b> punts de mestria ≈ <b>${pj.ex}</b> exercicis ≈ <b>${fx(pj.hours)} h</b> al teu ritme (${fx(pj.minPer)} min/exercici${pj.measured ? ` i guanyant de mitjana ${fx(pj.net, 2)} punts per exercici` : ', estimat'}).
        <br>Com a mínim <b>${pj.minDays} dies diferents</b> de pràctica: cada habilitat necessita ${Calc.RANK_DAYS[5]} dies amb encerts i ${Calc.RANK_REVS[5]} repassos superats. Per molt que facis en un dia, no es domina en un dia.
        ${perDay ? `<br>Amb ${days} dies: <b>${perDay} exercicis/dia</b>. Ara en fas <b>${fx(pj.rate)}</b>/dia (mitjana 7 dies) ${pj.rate >= perDay ? '— <span class="okc">vas bé</span>' : '— <span class="badc">cal apujar el ritme</span>'}.` : ''}</p>`;
    };

    const np = d.p1 != null && d.p1 !== '' ? needP2(+d.p1, d.semi == null ? 7 : +d.semi) : null;
    const notaTxt = np ? `<ul class="tight">
        <li>Per no suspendre sense dret a recuperació necessites <b>més d'un ${fx(Math.max(0, np.recu))}</b> al 2n parcial (la mitjana dels parcials ha de passar de 2,5).</li>
        <li>Per aprovar directament: <b>${np.direct > 10 ? 'no és possible amb aquestes notes' : 'un ' + fx(Math.max(0, np.direct)) + ' o més'}</b> al 2n parcial (cal mitjana ≥ 3,5 i 0,8·M + 0,2·S ≥ 5).</li>
        <li>Si vas a recuperació, aquest examen substitueix els parcials (la nota màxima és 6), així que <b>entra tot el temari</b>: dominar també el 1r parcial no és temps perdut.</li>
        <li>Els lliuraments dels seminaris (20%) <b>no es recuperen</b>: els que queden, fes-los molt bé.</li></ul>` : '<p class="muted">Posa la teva nota (o la que esperes) del 1r parcial i et dic què necessites al 2n.</p>';

    const listRow = m => {
      const st = domStats([m.id]), c = d.cert[m.id], cl = (d.certLast || {})[m.id];
      return `<div class="lrow"><a class="ln" href="#/mod/${m.id}/practice"><span class="num">${esc(m.num)}</span><span>${esc(U.sideName(m))}</span></a>${distBar(st)}<span class="small nowrap" title="Dominades / total · temps entrenat">${st.dom}/${st.n} · ${hm(m.gens.reduce((a, g) => a + (gd(g.key).ms || 0), 0))}</span>
        <a class="chip ${c ? 'ok' : ''}" href="#/prova/${m.id}" title="${c ? 'Certificada el ' + new Date(c.t).toLocaleDateString('ca') : cl ? 'Últim intent: ' + pct(cl.s) + '%' : 'Encara no l\'has provat'}">${c ? '🏅 ' + pct(c.s) + '%' : cl ? '🏅 ' + pct(cl.s) + '% (no superada)' : '🏅 Prova'}</a></div>`;
    };
    const modMs = m => m.gens.reduce((a, g) => a + (gd(g.key).ms || 0), 0);
    const skillRows = MODS.map(m => `<tr><td colspan="4"><b>${esc(m.llista)}</b> — ${esc(m.title)} <span class="muted small">· ${hm(modMs(m))} entrenades</span></td></tr>` + m.gens.map(g => {
      const x = gd(g.key);
      return `<tr><td style="padding-left:18px"><a href="#/mod/${m.id}/practice?g=${g.id}">${esc(g.title)}</a> <span class="stars">${U.stars(g.level)}</span> ${Calc.examChip ? Calc.examChip(g.key) : ''}</td><td>${pill(x.best)}</td><td class="small">${nextTxt(x)} ${dueTxt(x)}</td><td class="muted small">${x.ok}/${x.att} · ${hm(x.ms)}</td></tr>`;
    }).join('')).join('');

    app.innerHTML = `<h1>🏆 Mestria i constància</h1>
      <p class="lead">Aquí es veu el teu esforç en números. Cada tipus d'exercici és una <b>habilitat</b> amb un rang (de <i>Nou</i> a <i>Mestre</i>). Dominar no és fer un exercici dos cops: és <b>entrenar-lo</b>. Encertar a la primera i sense pista suma 1 punt; fallar en resta 1; amb pista o mirant la solució, 0. Per pujar de rang calen <b>punts</b>, <b>dies diferents</b> amb encerts i <b>repassos superats</b> (encertar-lo quan el repàs espaiat te'l torna a posar). Per exemple, <i>Dominat</i> = ${reqOf(5)}; <i>Mestre</i> = ${reqOf(6)}. <b>El rang no baixa mai</b>: el que caduca és la «forma», per això hi ha repassos.</p>
      <div class="grid cols4 mstats">
        <div class="card stat"><b>Nv ${li.L}</b><span>${esc(li.title)}</span><div class="mbar1"><i class="r4" style="width:${pct(li.p)}%"></i></div><span class="muted small">${d.xp} XP · ${li.need - li.into} per pujar</span></div>
        <div class="card stat"><b>🔥 ${s.streak}</b><span>dies seguits</span><span class="muted small">millor: ${s.bestStreak} · ${s.activeDays} dies actius</span></div>
        <div class="card stat"><b>${s.n}</b><span>exercicis fets</span><span class="muted small">${s.ok} a la primera</span></div>
        <div class="card stat"><b>${fx(s.hours)} h</b><span>d'estudi actiu</span><span class="muted small">aquesta setmana ${Math.round(w0.ms / 6e4)} min</span></div>
      </div>

      <div class="grid cols2" style="margin-top:16px">
        <div class="card"><h3 style="margin-top:0">📅 Avui</h3>
          <div class="row"><b>${t.n}/${d.goal}</b><span class="muted">exercicis (objectiu)</span><span class="spacer"></span><label class="small muted">Objectiu diari <select id="goalSel">${[5, 10, 15, 20, 30, 40, 60].map(n => `<option ${n === d.goal ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
          <div class="mbar1 big"><i class="${t.n >= d.goal ? 'r5' : 'r4'}" style="width:${pct(Math.min(1, t.n / d.goal))}%"></i></div>
          <div class="mis" style="margin-top:10px">${mis.map(m => `<div class="${m.done ? 'done' : ''}">${m.done ? '✅' : '⬜'} ${esc(m.t)} <span class="muted">${m.v}/${m.n} · +${MIS_XP} XP</span></div>`).join('')}</div>
          <div class="row" style="margin-top:12px"><a class="btn ${due ? 'primary' : ''}" href="#/repas">🧠 Repàs del dia${due ? ' (' + due + ')' : ''}</a><a class="btn" href="#/practice">🎯 Pràctica mixta</a></div></div>
        <div class="card"><h3 style="margin-top:0">📈 Constància</h3>${heatmap(20)}
          <table class="wk"><tr><th></th><th>Aquesta setmana</th><th>La passada</th></tr>
            <tr><td>Exercicis</td><td><b>${w0.n}</b> ${cmp(w0.n, w1.n)}</td><td>${w1.n}</td></tr>
            <tr><td>Minuts</td><td><b>${Math.round(w0.ms / 6e4)}</b> ${cmp(Math.round(w0.ms / 6e4), Math.round(w1.ms / 6e4))}</td><td>${Math.round(w1.ms / 6e4)}</td></tr>
            <tr><td>Rangs pujats</td><td><b>${w0.ups}</b> ${cmp(w0.ups, w1.ups)}</td><td>${w1.ups}</td></tr></table></div>
      </div>

      <h2>🎯 Objectiu: aprovar</h2>
      <div class="card">
        <div class="row" style="gap:18px;flex-wrap:wrap">
          <label class="small">Data del 2n parcial <input type="date" id="p2date" value="${esc(d.p2date || '')}"></label>
          <label class="small">Nota del 1r parcial (o la que esperes) <input type="number" id="p1n" min="0" max="10" step="0.1" style="width:5em" value="${d.p1 != null ? esc(d.p1) : ''}"></label>
          <label class="small">Nota esperada dels seminaris <input type="number" id="semn" min="0" max="10" step="0.1" style="width:5em" value="${d.semi != null ? esc(d.semi) : 7}"></label>
        </div>
        ${notaTxt}
        ${dl != null ? `<p class="small muted">${dl >= 0 ? `Falten <b>${dl}</b> dies per al 2n parcial.` : 'La data del 2n parcial ja ha passat.'}</p>` : '<p class="small muted">Posa la data del 2n parcial (la trobaràs al Campus Virtual) i calcularé quants exercicis per dia et calen.</p>'}
        ${projTxt(pj2, 'Temari del 2n parcial (Llistes 7–13)', dl)}
        ${projTxt(pjA, 'Tot el temari (per a la recuperació)', null)}
        <p class="muted small">La projecció es recalcula cada cop amb el teu encert i el teu temps reals. Com més practiques, més exacta és.</p>
      </div>

      <h2>🗺️ Domini del temari</h2>
      <div class="card">
        <div class="row"><b style="font-size:1.4rem">${pct(all.val)}%</b><span class="muted">domini global · ${all.dom}/${all.n} habilitats a Dominat</span></div>
        ${distBar(all, true)}${legend()}
        ${(() => { const gs = Calc.allGens(); let sw = 0, sv = 0; gs.forEach(g => { const w = Calc.examW ? Calc.examW(g.key) : 1; sw += w; sv += w * (store.genMastery(g.key) || 0); }); const hot = gs.filter(g => Calc.examW && Calc.examW(g.key) === 3), hd = hot.filter(g => store.rank(g.key) >= 5).length;
          return `<p style="margin:10px 0 0"><b>${pct(sw ? sv / sw : 0)}%</b> <span class="muted">domini ponderat pel que surt a l'examen · ${hd}/${hot.length} habilitats 🔥🔥🔥 (surten a gairebé tots els exàmens) a Dominat</span></p>`; })()}
        <div class="grid cols2" style="margin-top:12px">
          <div><div class="row"><b>1r parcial</b><span class="muted small">${p1.dom}/${p1.n} · ${pct(p1.val)}%</span></div>${distBar(p1)}</div>
          <div><div class="row"><b>2n parcial</b><span class="muted small">${p2.dom}/${p2.n} · ${pct(p2.val)}%</span></div>${distBar(p2)}</div>
        </div>
      </div>
      <div class="grid" style="margin-top:12px">
        <div class="card"><h3 style="margin-top:0">2n parcial <span class="chip accent">ara</span></h3>${MODS.filter(m => P2.includes(m.id)).map(listRow).join('')}</div>
        <div class="card"><h3 style="margin-top:0">Fonaments i 1r parcial</h3>${MODS.filter(m => !P2.includes(m.id)).map(listRow).join('')}</div>
      </div>
      <p class="muted small">🏅 <b>Prova de mestria</b>: si creus que una llista ja la saps, demostra-ho. Sense pistes; si encertes el 80%, la llista queda certificada i cada habilitat encertada puja directament a <i>Practicant</i>. <i>Dominat</i> només s'aconsegueix entrenant.</p>
      ${Calc.examStats ? (() => { const a = Calc.examStats(p => p.par === 2), b = Calc.examStats(p => p.par === 1); const row = (t, x) => `<div><div class="row"><b>${t}</b><span class="muted small">${x.dom}/${x.n} dominats · ${x.tried} treballats${x.due ? ' · <b>' + x.due + ' per repassar</b>' : ''}</span></div>${distBar({ n: x.n, counts: x.counts })}</div>`;
        return `<h2>🎓 Apartats d'exàmens reals</h2><div class="card"><p class="muted" style="margin-top:0">Cada apartat dels exàmens reals té el seu rang. Per dominar-ne un l'has de treure net ${Calc.XP_PTS[5]} vegades en ${Calc.XP_DAYS[5]} dies diferents.</p><div class="grid cols2">${row('2n parcial', a)}${row('1r parcial', b)}</div><div class="row" style="margin-top:10px"><a class="btn primary" href="#/entrena">🎓 Entrenament d'exàmens</a></div></div>`; })() : ''}

      <h2>🏅 Assoliments <span class="muted small">${Object.keys(d.ach).length}/${ACH.length}</span></h2>
      <div class="achgrid">${ACH.map(([id, icon, tt, desc]) => { const u = d.ach[id]; return `<div class="ach ${u ? 'on' : ''}" title="${u ? 'Aconseguit el ' + new Date(u).toLocaleDateString('ca') : 'Encara no'}"><span class="ai">${u ? icon : '🔒'}</span><div><b>${esc(tt)}</b><div class="muted small">${esc(desc)}</div></div></div>`; }).join('')}</div>

      <h2>📋 Totes les habilitats</h2>
      <details class="card"><summary>Veure el rang, el temps i si surt a l'examen de cada tipus d'exercici (${all.n})</summary><table class="hm sk">${skillRows}</table></details>

      <h2>💾 Còpia de seguretat</h2><div class="row"><button class="btn" id="exp">⬇️ Exportar progrés</button><label class="btn">⬆️ Importar<input id="imp" type="file" accept=".json" hidden></label><span class="spacer"></span><button class="btn danger" id="rst">🗑️ Esborrar tot el progrés</button></div>
      <p class="muted">El progrés es guarda només en aquest navegador. Exporta'l de tant en tant per no perdre'l.</p>`;

    const saveField = (k, v) => { d[k] = v; store.save(); mestriaPage(); };
    $('#goalSel').onchange = e => { d.goal = +e.target.value; store.save(); renderTop(); mestriaPage(); };
    $('#p2date').onchange = e => saveField('p2date', e.target.value || null);
    $('#p1n').onchange = e => saveField('p1', e.target.value === '' ? null : Math.max(0, Math.min(10, +e.target.value.replace(',', '.'))));
    $('#semn').onchange = e => saveField('semi', e.target.value === '' ? null : Math.max(0, Math.min(10, +e.target.value.replace(',', '.'))));
    $('#exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(D())], { type: 'application/json' })); a.download = 'calcmaster-progres-' + Calc.dayStr() + '.json'; a.click(); };
    $('#imp').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(tx => { try { const o = JSON.parse(tx); if (!o.gens) throw 0; localStorage.setItem('calcmaster.v1', JSON.stringify(o)); location.reload(); } catch (x) { alert('Fitxer no vàlid.'); } }); };
    $('#rst').onclick = () => Calc.resetAll();
  }

  /* ------------------------------ Repàs del dia ------------------------------ */
  function repasPage(mt, h) {
    renderSide('repas');
    const due = dueGens(), xd = Calc.partsDueCount ? Calc.partsDueCount() : 0, ld = Calc.listsDueCount ? Calc.listsDueCount() : 0;
    const next = Calc.allGens().map(g => gd(g.key)).filter(g => g.best >= 2 && g.due > Date.now()).sort((a, b) => a.due - b.due)[0];
    app.innerHTML = `<h1>🧠 Repàs del dia</h1><p class="lead">Les habilitats que ja havies après i que toca refrescar abans que s'oblidin. Cada rang té el seu interval: Aprenent 1 dia, Practicant 2, Competent 4, Dominat 8, Mestre 21. Si l'encertes, el repàs següent s'allunya; si falles, torna a sortir aviat.</p>` +
      (xd ? `<div class="card tipcard" style="margin-bottom:12px">🎓 També tens <b>${xd}</b> apartats d'exàmens reals per repassar. <a href="#/entrena">Entrenament d'exàmens →</a></div>` : '') +
      (ld ? `<div class="card tipcard" style="margin-bottom:12px">📋 I <b>${ld}</b> exercicis de les llistes oficials per repassar. <a href="#/llistes">Llistes oficials →</a></div>` : '') +
      (due.length ? `<div class="card" style="margin-bottom:12px"><b>${due.length}</b> habilitats per repassar: <span class="muted small">${due.slice(0, 12).map(g => esc(g.title)).join(' · ')}${due.length > 12 ? ' …' : ''}</span></div><div id="rbody"></div>`
        : `<div class="card"><h2>🎉 No tens res pendent</h2><p>${next ? 'El pròxim repàs és el ' + new Date(next.due).toLocaleDateString('ca', { weekday: 'long', day: 'numeric', month: 'long' }) + '.' : 'Quan una habilitat arribi a Aprenent, apareixerà aquí quan li toqui.'} Mentrestant, avança amb el temari del 2n parcial.</p><div class="row"><a class="btn primary" href="#/practice">🎯 Pràctica mixta</a><a class="btn" href="#/mestria">🏆 Mestria</a></div></div>`);
    if (due.length) mountPractice($('#rbody'), { gens: due, activeId: 'repas' });
    typeset(app);
  }

  /* ------------------------------ Prova de mestria ------------------------------ */
  const CERT_PASS = 0.8;
  function certPage(mt) {
    const m = Calc.byId[mt[1]];
    if (!m) { app.innerHTML = '<p>Llista no trobada.</p>'; return; }
    renderSide(m.id);
    const d = D(), c = d.cert[m.id], cl = (d.certLast || {})[m.id], n = Math.max(6, Math.min(10, m.gens.length));
    app.innerHTML = `<div class="crumbs"><a href="#/mestria">Mestria</a><span>› Prova de mestria › ${esc(m.llista)}</span></div>
      <h1>🏅 Prova de mestria — ${esc(m.title)}</h1>
      <div class="card" id="certIntro"><p>Si creus que aquesta llista ja la saps, demostra-ho i salta't la pràctica.</p>
        <ul class="tight"><li><b>${n} preguntes</b> de tipus diferents de la llista.</li><li>Sense pistes, sense exemples i sense solució fins al final (com a l'examen).</li>
        <li>Si encertes el <b>${pct(CERT_PASS)}%</b>, la llista queda <b>certificada</b>, guanyes 100 XP i cada habilitat encertada puja com a mínim a <i>Practicant</i> (per dominar-la cal entrenar-la).</li>
        <li>Si no la superes, no perds cap rang: veuràs exactament què has de practicar.</li></ul>
        ${c ? `<p class="okc">Ja la vas certificar el ${new Date(c.t).toLocaleDateString('ca')} amb un ${pct(c.s)}%.</p>` : cl ? `<p class="muted">Últim intent: ${pct(cl.s)}%.</p>` : ''}
        <div class="row"><button class="btn primary" id="certGo">Començar la prova</button><a class="btn" href="#/mod/${m.id}/practice">Encara no: practicar</a></div></div><div id="certBody"></div>`;
    $('#certGo').onclick = () => { $('#certIntro').remove(); certRun(m, n, $('#certBody')); };
  }
  function certRun(m, n, host) {
    const r = M.rng(Calc.newSeed());
    let pool = r.shuffle(m.gens.slice());
    while (pool.length < n) pool = pool.concat(r.shuffle(m.gens.slice()));
    const items = pool.slice(0, n).map(g => { try { return { g, p: Calc.make(g, Calc.newSeed()) }; } catch (e) { return null; } }).filter(Boolean);
    const res = []; let i = 0;
    function show() {
      if (i >= items.length) return finish();
      const { g, p } = items[i];
      const v = new QView(p, { meta: `<span class="chip accent">Pregunta ${i + 1}/${items.length}</span><b>${esc(g.title)}</b><span class="stars">${U.stars(g.level)}</span>`, noActions: true, split: true, about: '<div class="muted small">Prova de mestria: sense ajuda. Si no ho saps, prem «No ho sé» i continua.</div>' });
      const act = document.createElement('div'); act.className = 'actions';
      act.innerHTML = `<button class="btn primary" data-c="ok" title="Enter">${i + 1 === items.length ? 'Respon i acaba' : 'Respon i continua →'}</button><button class="btn ghost" data-c="skip">No ho sé</button><span class="muted small">${res.filter(x => x.ok).length} encertades de ${res.length}</span>`;
      $('.qmain', v.el).appendChild(act);
      const answer = skip => {
        if (v.done) return;
        const a = v.getAnswer();
        if (!skip && v.isEmpty(a)) { v.feedback('info', 'Escriu una resposta o prem «No ho sé».'); return; }
        const gr = skip ? { ok: false } : Calc.grade(p, a);
        if (gr.parseError && !gr.ok) { v.feedback('info', 'No entenc el que has escrit (no compta). Revisa el format: <code>x^2</code>, <code>3/4</code>, <code>sqrt(2)</code>.'); return; }
        v.done = true;
        store.record(g.key, gr.ok, p, gr.ok ? 'ok' : 'fail');
        res.push({ g, p, a: skip ? null : a, ok: gr.ok });
        i++; show();
      };
      $('[data-c=ok]', act).onclick = () => answer(false); $('[data-c=skip]', act).onclick = () => answer(true);
      v.o.onCheck = () => answer(false); v.o.onPick = () => { };
      U.placeStable(host, v.el, i > 0); v.drawPlots(); Calc.cur = v; setTimeout(() => v.focus(), 50);
    }
    function finish() {
      const d = D(), ok = res.filter(x => x.ok).length, sc = ok / res.length, pass = sc >= CERT_PASS - 1e-9;
      (d.certLast = d.certLast || {})[m.id] = { t: Date.now(), s: sc };
      if (pass) {
        const prev = d.cert[m.id];
        d.cert[m.id] = { t: Date.now(), s: Math.max(sc, prev ? prev.s : 0) };
        res.filter(x => x.ok).forEach(x => store.boost(x.g.key, 3));
        if (!prev) store.addXp(100);
      }
      store.save(); checkAch(false); renderTop(); renderSide(m.id); Calc.cur = null;
      const ansTxt = x => x.a == null ? '<i>no contestada</i>' : esc(Array.isArray(x.a) ? x.a.join(' ; ') : x.p.type === 'mc' ? '' : x.a);
      host.style.minHeight = '';
      host.innerHTML = `<div class="card"><h2 style="margin-top:0">${pass ? '🏅 Prova superada!' : 'Encara no'}</h2><div class="score-big">${ok}/${res.length}</div>
        <p>${pass ? `Llista <b>certificada</b>. Les habilitats encertades han pujat a <i>Practicant</i> (com a mínim). Per arribar a <i>Dominat</i> cal entrenar-les en dies diferents i superar els repassos.` : `Necessitaves el ${pct(CERT_PASS)}%. No has perdut cap rang. Practica les que han fallat (a sota) i torna-ho a provar quan vulguis.`}</p>
        <div class="row"><button class="btn primary" id="again">🔄 Tornar a provar</button><a class="btn" href="#/mod/${m.id}/practice">✍️ Practicar la llista</a><a class="btn" href="#/mestria">🏆 Mestria</a></div></div>
        <div class="certres">${res.map((x, k) => `<details class="card ${x.ok ? 'okb' : 'badb'}"><summary>${x.ok ? '✅' : '❌'} ${k + 1}. ${esc(x.g.title)} ${x.ok ? '' : `<a class="small" href="#/mod/${m.id}/practice?g=${x.g.id}">practicar →</a>`}</summary>
          <div class="qtext">${x.p.q}</div>${x.p.type === 'mc' ? '' : `<div class="small">La teva resposta: ${ansTxt(x)}</div>`}<div class="ans-line">Correcta: ${Calc.answerTex(x.p)}</div><ol>${(x.p.sol || []).map(st => '<li>' + Calc.pretty(st) + '</li>').join('')}</ol></details>`).join('')}</div>`;
      $('#again').onclick = () => certRun(m, n, host);
      typeset(host);
    }
    show();
  }

  Calc.routes.push({ re: /^#\/(?:mestria|progress)/, fn: mestriaPage });
  Calc.routes.push({ re: /^#\/repas/, fn: repasPage });
  Calc.routes.push({ re: /^#\/prova\/(\w+)/, fn: certPage });
  checkAch(true); // el que ja tenies d'abans es desbloqueja sense avisos
  Calc.mestria = { lvlInfo, domStats, projection, needP2, missions, stats, checkAch, ACH };
  U.route();
})();
