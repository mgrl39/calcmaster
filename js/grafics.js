/* =====================================================================
   grafics.js — «📊 Gràfics»: tota la situació en percentatges i gràfics.
   · #/grafics: xifres clau, domini per llista, rangs de cada llista,
     activitat dels últims 30 dies (exercicis, encert, minuts), preparació
     per al 2n parcial (ponderada per com surt a l'examen), arbres
     d'habilitats, punts febles i notes d'exàmens.
   · Gràfics petits a l'inici (Calc.miniDash) i al resum de cada llista
     (afegit a Calc.appsResum).
   Tot surt del progrés guardat en aquest navegador (Calc.store). Cada
   gràfic té tooltip en passar per sobre i una taula amb els números.
   ===================================================================== */
(function () {
  'use strict';
  const Calc = window.Calc, U = window.CalcUI;
  if (!Calc || !U) return;
  const { $, $$, esc, app } = U, store = Calc.store;
  const RANKS = Calc.RANKS, P2 = Calc.P2_IDS || [];
  const pc = v => Math.round((v || 0) * 100);
  const DAY = 864e5;
  const fmtMin = ms => { const m = Math.round((ms || 0) / 60000); return m < 60 ? m + ' min' : (m / 60).toFixed(1).replace('.', ',') + ' h'; };
  const LISTS = () => Calc.modules.filter(m => m.gens && m.gens.length);
  const shortName = m => (m.id === 'base' ? 'Base' : m.id === 'l13' ? 'Final' : 'L' + m.num.replace(/\D.*$/, ''));

  /* ------------------------------ dades ------------------------------ */
  function rankBuckets(gens) {
    const d = store.data(), c = [0, 0, 0, 0, 0, 0, 0, 0]; // 0 mai provat · 1 provat sense rang · 2..7 = rangs 1..6
    gens.forEach(g => { const x = d.gens[g.key]; if (!x || (!x.att && !x.best)) c[0]++; else if (!x.best) c[1]++; else c[x.best + 1]++; });
    return c;
  }
  const BUCKET = ['Mai provat', 'Provat (0 punts)'].concat(RANKS.slice(1));
  const BCOL = ['var(--gx-none)', 'var(--gx-r0)', 'var(--gx-r1)', 'var(--gx-r2)', 'var(--gx-r3)', 'var(--gx-r4)', 'var(--gx-r5)', 'var(--gx-r6)'];
  function domOf(gens) { let s = 0; gens.forEach(g => { s += store.genMastery(g.key) || 0; }); return gens.length ? s / gens.length : 0; }
  function triedOf(gens) { const d = store.data(); return gens.filter(g => d.gens[g.key] && (d.gens[g.key].att || d.gens[g.key].best)).length; }
  function accOf(gens) { let s = 0, n = 0; gens.forEach(g => { const a = store.genAccuracy(g.key); if (a != null) { s += a; n++; } }); return n ? s / n : null; }
  function weighted(gens) { let s = 0, w = 0; gens.forEach(g => { const k = Calc.examW ? Calc.examW(g.key) : 1; s += k * (store.genMastery(g.key) || 0); w += k; }); return w ? s / w : 0; }
  function days(n) {
    const d = store.data(), out = [];
    for (let i = n - 1; i >= 0; i--) { const dt = new Date(Date.now() - i * DAY), k = Calc.dayStr(dt), x = d.dayx[k] || {}; out.push({ k, dt, n: x.n || 0, ok: x.ok || 0, ms: x.ms || 0, xp: x.xp || 0 }); }
    return out;
  }

  /* ------------------------------ peces ------------------------------ */
  const tip = s => ` data-tip="${esc(s)}"`;
  /** barres horitzontals (una sola sèrie, 0..1) */
  function hbars(rows, o) {
    o = o || {};
    const grid = [0, 25, 50, 75, 100].map(v => `<i style="left:${v}%"></i>`).join('');
    return `<div class="gx-hb">${rows.map(r => `<div class="gx-row"${tip(r.tip)}>
      <div class="gx-lab">${r.href ? `<a href="${r.href}">${esc(r.label)}</a>` : esc(r.label)}${r.tag ? ' ' + r.tag : ''}</div>
      <div class="gx-track"><span class="gx-grid">${grid}</span><b class="gx-bar${r.cls ? ' ' + r.cls : ''}" style="width:${Math.max(0, Math.min(100, r.v * 100))}%"></b></div>
      <div class="gx-val">${r.val != null ? r.val : pc(r.v) + '%'}</div></div>`).join('')}
      ${o.axis === false ? '' : `<div class="gx-row gx-axis"><div class="gx-lab"></div><div class="gx-track gx-ticks">${[0, 25, 50, 75, 100].map(v => `<span style="left:${v}%">${v}%</span>`).join('')}</div><div class="gx-val"></div></div>`}</div>`;
  }
  /** barres apilades al 100% per rangs */
  function stackRow(label, c, href) {
    const tot = c.reduce((a, b) => a + b, 0) || 1;
    return `<div class="gx-row"><div class="gx-lab">${href ? `<a href="${href}">${esc(label)}</a>` : esc(label)}</div><div class="gx-stack">${c.map((n, i) => n ? `<b style="flex:${n};background:${BCOL[i]}"${tip(label + ' · ' + BUCKET[i] + ': ' + n + ' de ' + tot + ' tipus (' + pc(n / tot) + '%)')}></b>` : '').join('')}</div><div class="gx-val">${pc((c[6] + c[7]) / tot)}%</div></div>`;
  }
  const legend = () => `<div class="gx-leg">${BUCKET.map((b, i) => `<span><i style="background:${BCOL[i]}"></i>${b}</span>`).join('')}</div>`;
  const table = (head, rows) => `<details class="gx-tbl"><summary>Veure la taula amb els números</summary><div class="tblwrap"><table class="tbl"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></div></details>`;
  const tile = (v, l, sub) => `<div class="gx-tile"><div class="gx-big">${v}</div><div class="gx-tl">${l}</div>${sub ? `<div class="gx-sub">${sub}</div>` : ''}</div>`;
  const ring = (v, l) => { const r = 34, C = 2 * Math.PI * r, f = Math.max(0, Math.min(1, v)); return `<div class="gx-ring"${tip(l + ': ' + pc(v) + '%')}><svg viewBox="0 0 84 84" width="84" height="84"><circle cx="42" cy="42" r="${r}" class="gx-ring-bg"/><circle cx="42" cy="42" r="${r}" class="gx-ring-fg" stroke-dasharray="${(C * f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 42 42)"/><text x="42" y="47" text-anchor="middle">${pc(v)}%</text></svg><div class="gx-tl">${l}</div></div>`; };

  /** columnes per dia (SVG). series: [{key, label, color}] apilades */
  function columns(ds, series, o) {
    o = o || {};
    const W = 640, H = 170, L = 34, B = 22, T = 8, n = ds.length, bw = (W - L - 4) / n;
    const tot = ds.map(x => series.reduce((a, s) => a + (s.get(x) || 0), 0));
    let mx = Math.max(1, ...tot); const step = mx <= 5 ? 1 : mx <= 20 ? 5 : mx <= 50 ? 10 : mx <= 100 ? 25 : Math.ceil(mx / 4 / 50) * 50; mx = Math.ceil(mx / step) * step;
    const y = v => T + (H - T - B) * (1 - v / mx);
    let g = '';
    for (let v = 0; v <= mx; v += step) g += `<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" class="gx-gl"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" class="gx-ax">${o.fmt ? o.fmt(v) : v}</text>`;
    ds.forEach((x, i) => {
      let acc = 0; const cx = L + i * bw;
      series.forEach((s, si) => {
        const v = s.get(x) || 0; if (!v) return;
        const y0 = y(acc), y1 = y(acc + v); acc += v;
        const top = si === series.length - 1 || series.slice(si + 1).every(z => !(z.get(x) || 0));
        const h = Math.max(1, y0 - y1 - (si ? 2 : 0)), rx = top ? Math.min(4, bw * 0.3) : 0;
        g += `<path d="${top ? `M${cx + 2},${y0}V${y1 + rx}q0,-${rx} ${rx},-${rx}h${bw - 4 - 2 * rx}q${rx},0 ${rx},${rx}V${y0}Z` : `M${cx + 2},${y0}V${y0 - h}h${bw - 4}V${y0}Z`}" fill="${s.color}"/>`;
      });
      const lab = x.dt.toLocaleDateString('ca', { day: 'numeric', month: 'short' });
      g += `<rect x="${cx}" y="${T}" width="${bw}" height="${H - T - B}" fill="transparent"${tip(lab + ' · ' + series.map(s => s.label + ': ' + (o.fmt ? o.fmt(s.get(x) || 0) : (s.get(x) || 0))).join(' · '))}/>`;
      if (i % 5 === (n - 1) % 5) g += `<text x="${cx + bw / 2}" y="${H - 6}" text-anchor="middle" class="gx-ax">${lab}</text>`;
    });
    return `<svg class="gx-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(o.aria || '')}">${g}</svg>`;
  }
  /** línia 0..1 (SVG) amb punts; buits on no hi ha dades */
  function line(pts, o) {
    o = o || {};
    const W = 640, H = 170, L = 38, B = 22, T = 10, n = pts.length;
    const x = i => L + (W - L - 12) * (n === 1 ? 0.5 : i / (n - 1)), y = v => T + (H - T - B) * (1 - v / (o.max || 1));
    let g = '';
    (o.ticks || [0, 0.25, 0.5, 0.75, 1]).forEach(v => { g += `<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" class="gx-gl"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" class="gx-ax">${o.fmt ? o.fmt(v) : pc(v) + '%'}</text>`; });
    let path = '', pen = false;
    pts.forEach((p, i) => { if (p.v == null) { pen = false; return; } path += (pen ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(p.v).toFixed(1); pen = true; });
    g += `<path d="${path}" class="gx-line"/>`;
    pts.forEach((p, i) => {
      if (p.v != null) g += `<circle cx="${x(i)}" cy="${y(p.v)}" r="4" class="gx-dot"/><circle cx="${x(i)}" cy="${y(p.v)}" r="12" fill="transparent"${tip(p.tip)}/>`;
      if (p.lab && (n <= 12 || i % 5 === (n - 1) % 5)) g += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle" class="gx-ax">${p.lab}</text>`;
    });
    return `<svg class="gx-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(o.aria || '')}">${g}</svg>`;
  }

  /* ------------------------------ tooltip ------------------------------ */
  // un sol tooltip per a tota la web: qualsevol element amb data-tip dins d'un bloc .gx
  (function () {
    const el = document.createElement('div'); el.id = 'gxtip'; el.hidden = true; document.body.appendChild(el);
    const show = (t, ev) => { el.textContent = t; el.hidden = false; const w = el.offsetWidth, h = el.offsetHeight; let X = ev.clientX + 14, Y = ev.clientY - h - 10; if (X + w > window.innerWidth - 8) X = ev.clientX - w - 14; if (X < 8) X = 8; if (Y < 8) Y = ev.clientY + 16; el.style.left = X + 'px'; el.style.top = Y + 'px'; };
    const on = ev => { const t = ev.target.closest && ev.target.closest('.gx [data-tip]'); if (t) show(t.getAttribute('data-tip'), ev); else el.hidden = true; };
    document.addEventListener('mousemove', on); document.addEventListener('click', on); window.addEventListener('hashchange', () => { el.hidden = true; }); window.addEventListener('scroll', () => { el.hidden = true; }, { passive: true });
  })();

  /* ------------------------------ pàgina ------------------------------ */
  function page() {
    U.renderSide('grafics');
    const d = store.data(), L = LISTS(), all = Calc.allGens();
    const p2g = L.filter(m => P2.includes(m.id)).flatMap(m => m.gens), p1g = L.filter(m => !P2.includes(m.id)).flatMap(m => m.gens);
    const att = Object.values(d.gens).reduce((a, g) => a + (g.att || 0), 0), okn = Object.values(d.gens).reduce((a, g) => a + (g.ok || 0), 0);
    const tried = triedOf(all), acc = accOf(all), streak = store.streakDays ? store.streakDays() : 0;
    const exams = (d.exams || []).filter(e => e.mark != null);
    const ds = days(30), d7 = ds.slice(-7), n7 = d7.reduce((a, x) => a + x.n, 0);
    const empty = !att;

    // 1) xifres clau
    const tiles = `<div class="gx-tiles">
      ${ring(domOf(all), 'Domini de tot')}${ring(domOf(p2g), 'Domini 2n parcial')}${ring(weighted(p2g), '2n parcial (pes d\'examen)')}${ring(domOf(p1g), 'Domini 1r parcial i base')}
      ${tile(tried + '<small>/' + all.length + '</small>', 'Tipus d\'exercici provats', pc(tried / all.length) + '% del total')}
      ${tile(acc == null ? '—' : pc(acc) + '%', 'Encert recent', att ? okn + ' encerts de ' + att + ' intents' : 'encara cap intent')}
      ${tile(fmtMin(d.ms), 'Temps estudiant', n7 + ' exercicis els últims 7 dies')}
      ${tile(streak + (streak === 1 ? ' dia' : ' dies'), 'Ratxa', exams.length ? 'última nota d\'examen: ' + (+exams[exams.length - 1].mark).toFixed(1).replace('.', ',') : 'sense exàmens fets')}</div>`;

    // 2) domini per llista
    const rowsL = L.map(m => { const v = store.modMastery(m).value, t = triedOf(m.gens), a = accOf(m.gens); return { label: shortName(m) + ' · ' + U.sideName(m), href: '#/mod/' + m.id + '/resum', v, tag: P2.includes(m.id) ? '<span class="chip accent gx-chip">2n</span>' : '', tip: (m.llista + ' — ' + U.sideName(m) + ': domini ' + pc(v) + '% · ' + t + '/' + m.gens.length + ' tipus provats' + (a != null ? ' · encert ' + pc(a) + '%' : '')) }; });
    const domL = `<div class="card"><h2>🎯 Domini per llista</h2><p class="muted small">Quin percentatge de cada llista tens dominat. 100% vol dir tots els tipus d'exercici a «Dominat» o més. Clica una llista per anar-hi.</p>
      ${hbars(rowsL)}${table(['Llista', 'Domini', 'Tipus provats', 'Encert recent'], L.map(m => [esc(m.llista + ' · ' + U.sideName(m)), pc(store.modMastery(m).value) + '%', triedOf(m.gens) + '/' + m.gens.length, accOf(m.gens) == null ? '—' : pc(accOf(m.gens)) + '%']))}</div>`;

    // 3) rangs per llista
    const cAll = rankBuckets(all);
    const ranks = `<div class="card"><h2>🏅 En quin rang tens cada tipus d'exercici</h2><p class="muted small">Cada barra és una llista i cada tros, quants tipus d'exercici hi ha a cada rang. A la dreta, el % que ja és Dominat o Mestre.</p>
      ${legend()}<div class="gx-hb gx-stk">${stackRow('Tot CalcMaster', cAll)}<div class="gx-sep"></div>${L.map(m => stackRow(shortName(m) + ' · ' + U.sideName(m), rankBuckets(m.gens), '#/mod/' + m.id + '/resum')).join('')}</div>
      ${table(['Llista'].concat(BUCKET), [['<b>Tot</b>'].concat(cAll)].concat(L.map(m => [esc(m.llista)].concat(rankBuckets(m.gens)))))}</div>`;

    // 4) activitat
    const act = `<div class="card"><h2>📅 Activitat dels últims 30 dies</h2>
      <div class="gx-leg"><span><i style="background:var(--gx-s1)"></i>Encerts a la primera</span><span><i style="background:var(--gx-s2)"></i>Fallats o amb ajuda</span></div>
      ${columns(ds, [{ label: 'Encerts', color: 'var(--gx-s1)', get: x => x.ok }, { label: 'Fallats o amb ajuda', color: 'var(--gx-s2)', get: x => Math.max(0, x.n - x.ok) }], { aria: 'Exercicis per dia' })}
      <h3>Encert per dia</h3>
      ${line(ds.map(x => ({ v: x.n ? x.ok / x.n : null, lab: x.dt.toLocaleDateString('ca', { day: 'numeric', month: 'short' }), tip: x.dt.toLocaleDateString('ca', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · encert ' + (x.n ? pc(x.ok / x.n) : 0) + '% (' + x.ok + ' de ' + x.n + ')' })), { aria: 'Encert per dia' })}
      <h3>Minuts per dia</h3>
      ${columns(ds, [{ label: 'Temps', color: 'var(--gx-s1)', get: x => Math.round(x.ms / 60000) }], { aria: 'Minuts per dia', fmt: v => v + "'" })}
      ${table(['Dia', 'Exercicis', 'Encerts', 'Encert', 'Minuts', 'XP'], ds.slice().reverse().filter(x => x.n || x.ms).map(x => [x.k, x.n, x.ok, x.n ? pc(x.ok / x.n) + '%' : '—', Math.round(x.ms / 60000), x.xp]))}</div>`;

    // 5) preparació 2n parcial
    const p2mods = L.filter(m => P2.includes(m.id));
    const prio = p2g.filter(g => (Calc.examW ? Calc.examW(g.key) : 1) >= 2).map(g => ({ g, w: Calc.examW ? Calc.examW(g.key) : 1, v: store.genMastery(g.key) || 0 })).sort((a, b) => (b.w * (1 - b.v)) - (a.w * (1 - a.v)) || a.v - b.v).slice(0, 10);
    const fire = w => '🔥'.repeat(Math.max(0, w));
    const prep = `<div class="card"><h2>📝 Preparació per al 2n parcial</h2><p class="muted small">El mateix domini però pesant més el que surt més a l'examen (🔥🔥🔥 surt sempre, 🔥 poc). És la xifra que més s'assembla a la nota que podries treure.</p>
      ${hbars(p2mods.map(m => ({ label: shortName(m) + ' · ' + U.sideName(m), href: '#/mod/' + m.id + '/practice', v: weighted(m.gens), tip: m.llista + ': preparació ' + pc(weighted(m.gens)) + '% (pes d\'examen) · domini simple ' + pc(domOf(m.gens)) + '%' })))}
      <h3>Els 10 que més et convé practicar ara</h3><p class="muted small">Surten molt a l'examen i encara no els tens dominats.</p>
      ${prio.length ? hbars(prio.map(x => ({ label: x.g.title.replace(/\$[^$]*\$/g, '…'), href: '#/mod/' + x.g.mod + '/practice?g=' + x.g.id, v: x.v, tag: '<span class="gx-fire">' + fire(x.w) + '</span>', tip: Calc.byId[x.g.mod].llista + ' · ' + x.g.title.replace(/\$[^$]*\$/g, '…') + ': domini ' + pc(x.v) + '% · ' + RANKS[store.rank(x.g.key)] }))) : '<p>✅ Tot el que surt molt ja ho tens dominat.</p>'}</div>`;

    // 6) arbres
    const trees = Calc.TREES ? `<div class="card"><h2>🌳 Arbres d'habilitats</h2>${hbars(Calc.TREES.map(T => { const s = Calc.treeStats(T.id); return { label: T.icon + ' ' + T.t, href: '#/arbre/' + T.id, v: s.pct, tip: T.t + ': ' + pc(s.pct) + '% · ' + s.dom + '/' + s.n + ' peces dominades · ' + s.tried + ' començades' }; }))}</div>` : '';

    // 7) punts febles
    const weak = all.map(g => ({ g, a: store.genAccuracy(g.key), n: (d.gens[g.key] || {}).att || 0 })).filter(x => x.a != null && x.n >= 2).sort((a, b) => a.a - b.a).slice(0, 10);
    const weakC = `<div class="card"><h2>⚠️ On falles més</h2><p class="muted small">Els tipus amb pitjor encert recent (mínim 2 intents). Clica per practicar-los.</p>
      ${weak.length ? hbars(weak.map(x => ({ label: x.g.title.replace(/\$[^$]*\$/g, '…'), href: '#/mod/' + x.g.mod + '/practice?g=' + x.g.id, v: x.a, cls: 'gx-warnbar', tip: Calc.byId[x.g.mod].llista + ' · encert recent ' + pc(x.a) + '% en ' + x.n + ' intents' }))) : '<p class="muted">Encara no hi ha prou intents per saber-ho.</p>'}</div>`;

    // 8) exàmens
    const ex = `<div class="card"><h2>🧾 Notes d'exàmens i simulacres</h2>${exams.length ? line(exams.slice(-20).map(e => ({ v: Math.max(0, Math.min(10, +e.mark)), lab: new Date(e.t).toLocaleDateString('ca', { day: 'numeric', month: 'short' }), tip: new Date(e.t).toLocaleDateString('ca') + ' · ' + (e.fmt || 'examen') + ': ' + (+e.mark).toFixed(2).replace('.', ',') + ' / 10' })), { max: 10, ticks: [0, 2.5, 5, 7.5, 10], fmt: v => String(v).replace('.', ','), aria: 'Notes d\'exàmens' })
      + table(['Data', 'Tipus', 'Nota', 'Minuts'], exams.slice().reverse().map(e => [new Date(e.t).toLocaleDateString('ca'), esc(e.fmt || ''), (+e.mark).toFixed(2).replace('.', ','), e.mins || '—'])) : '<p class="muted">Quan facis un examen generat o un simulacre, la nota sortirà aquí. <a href="#/p2/sim">Fes un simulacre del 2n parcial</a>.</p>'}</div>`;

    app.innerHTML = `<div class="gx"><h1>📊 Gràfics: la teva situació</h1>
      <p class="lead">Tot el teu progrés en percentatges. Passa el ratolí (o toca) per sobre de qualsevol barra per veure'n el detall. Les dades són les d'aquest navegador.</p>
      ${empty ? '<div class="box warn">Encara no has fet cap exercici: els gràfics sortiran buits. Comença per <a href="#/temari">el temari</a> o <a href="#/practice">la pràctica mixta</a>.</div>' : ''}
      ${tiles}${prep}${domL}${ranks}${act}${trees}${weakC}${ex}</div>`;
  }
  Calc.routes.push({ re: /^#\/grafics/, fn: page });

  /* ------------------------- gràfics petits ------------------------- */
  /** targeta per a l'inici */
  Calc.miniDash = function () {
    try {
      const all = Calc.allGens(), L = LISTS(), p2g = L.filter(m => P2.includes(m.id)).flatMap(m => m.gens);
      const ds = days(14);
      return `<div class="card gx gx-mini"><div class="row"><h2 style="margin:0">📊 La teva situació</h2><span class="spacer"></span><a class="btn sm primary" href="#/grafics">Veure tots els gràfics →</a></div>
        <div class="gx-tiles">${ring(domOf(all), 'Domini de tot')}${ring(domOf(p2g), 'Domini 2n parcial')}${ring(weighted(p2g), '2n parcial (pes d\'examen)')}</div>
        ${legend()}<div class="gx-hb gx-stk">${stackRow('Tot CalcMaster', rankBuckets(all))}${stackRow('2n parcial', rankBuckets(p2g))}</div>
        <h3>Exercicis dels últims 14 dies</h3>${columns(ds, [{ label: 'Encerts', color: 'var(--gx-s1)', get: x => x.ok }, { label: 'Fallats o amb ajuda', color: 'var(--gx-s2)', get: x => Math.max(0, x.n - x.ok) }], { aria: 'Exercicis per dia' })}
        <div class="gx-leg"><span><i style="background:var(--gx-s1)"></i>Encerts a la primera</span><span><i style="background:var(--gx-s2)"></i>Fallats o amb ajuda</span></div></div>`;
    } catch (e) { return ''; }
  };

  /** al resum de cada llista: rangs i domini de cada tipus */
  const prevApps = Calc.appsResum;
  Calc.appsResum = function (mid) {
    const base = prevApps ? prevApps(mid) : '';
    const m = Calc.byId[mid]; if (!m || !m.gens || !m.gens.length) return base;
    const d = store.data();
    const rows = m.gens.slice().sort((a, b) => a.level - b.level).map(g => { const v = store.genMastery(g.key) || 0, x = d.gens[g.key], a = store.genAccuracy(g.key); return { label: g.title.replace(/\$[^$]*\$/g, '…'), href: '#/mod/' + m.id + '/practice?g=' + g.id, v, val: x && (x.att || x.best) ? pc(v) + '%' : '—', tip: g.title.replace(/\$[^$]*\$/g, '…') + ': ' + RANKS[store.rank(g.key)] + (x ? ' · ' + x.ok + '/' + x.att + ' encerts' : ' · mai provat') + (a != null ? ' · encert recent ' + pc(a) + '%' : '') }; });
    return base + `<div class="card gx gx-res"><div class="row"><h3 style="margin:0">📊 Gràfics d'aquesta llista</h3><span class="spacer"></span><a class="btn sm" href="#/grafics">Tots els gràfics</a></div>
      ${legend()}<div class="gx-hb gx-stk">${stackRow(m.llista, rankBuckets(m.gens))}</div>
      <details class="gx-tbl" open><summary>Domini de cada tipus d'exercici (${m.gens.length})</summary>${hbars(rows)}</details></div>`;
  };
})();
