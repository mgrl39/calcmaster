/* ===================================================================
   p1_ui.js — Tot el material del 1r Parcial dins de CalcMaster:
   llistes oficials resoltes (una per una), exàmens reals 2018–2026,
   simulacre, banc de tests, teoria d'examen, recursos
   i el selector «Combina llistes» (pràctica / test / examen amb les
   llistes que triïs).
   Les dades venen de p1/data/*.js (projecte anterior, ja integrat).
   =================================================================== */
(function () {
  'use strict';
  if (!window.CalcUI) return;
  const U = CalcUI, $ = U.$, $$ = U.$$, esc = U.esc, app = U.app, typeset = U.typeset, QView = U.QView, MODS = Calc.modules;
  const P1 = U.P1_IDS;
  // les dades són `const` globals (no pengen de window): es comproven amb una avaluació indirecta
  const has = n => { try { return typeof (0, eval)(n) !== 'undefined'; } catch (e) { return false; } };
  const LISTS = has('CLASS_LISTS') ? CLASS_LISTS : [], EXAMS = has('REAL_EXAMS') ? REAL_EXAMS : [];
  const modOfList = id => 'l' + String(id).replace(/\D/g, '');
  const ls = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* res */ } }
  };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const LISTNAME = { l0: 'Llista 0', l1: 'Llista 1', l2: 'Llista 2', l3: 'Llista 3', l4: 'Llista 4', l5: 'Llista 5' };
  const LISTTOPIC = { l0: 'Bàsics: inequacions, valor absolut, rectes, domini, exp/log, trigonometria', l1: 'Bolzano, límits i continuïtat', l2: 'Derivades, Rolle, valor mitjà, implícita', l3: 'Creixement, extrems, optimització, concavitat', l4: 'Asímptotes, estudi de funcions, L\'Hôpital', l5: 'Polinomi de Taylor i fita de l\'error' };
  const pdf = f => 'recursos/pdf/' + encodeURIComponent(f);

  /* ------------------------------------------------------------------
     Gràfiques SVG (<div class="plot" data-f=…>) de les solucions
     ------------------------------------------------------------------ */
  function niceStep(range) { const raw = range / 8, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }
  function buildPlot(ds) {
    const W = 420, H = 280, NS = 'http://www.w3.org/2000/svg';
    const [x0, x1] = ds.xr.split(',').map(Number), [y0, y1] = ds.yr.split(',').map(Number);
    const sx = x => (x - x0) / (x1 - x0) * W, sy = y => H - (y - y0) / (y1 - y0) * H;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('class', 'plot-svg'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Esbós de y = ' + ds.f);
    const add = (tag, attrs) => { const n = document.createElementNS(NS, tag); Object.keys(attrs).forEach(k => n.setAttribute(k, attrs[k])); svg.appendChild(n); return n; };
    const stepX = (x1 - x0) > 20 ? 5 : 1, stepY = niceStep(y1 - y0);
    for (let x = Math.ceil(x0 / stepX) * stepX; x <= x1; x += stepX) add('line', { x1: sx(x), x2: sx(x), y1: 0, y2: H, class: 'plot-grid' });
    for (let y = Math.ceil(y0 / stepY) * stepY; y <= y1; y += stepY) add('line', { x1: 0, x2: W, y1: sy(y), y2: sy(y), class: 'plot-grid' });
    if (y0 < 0 && y1 > 0) add('line', { x1: 0, x2: W, y1: sy(0), y2: sy(0), class: 'plot-axis' });
    if (x0 < 0 && x1 > 0) add('line', { x1: sx(0), x2: sx(0), y1: 0, y2: H, class: 'plot-axis' });
    for (let x = Math.ceil(x0 / stepX) * stepX; x <= x1; x += stepX) { if (x === 0 || x <= x0 || x >= x1) continue; add('text', { x: sx(x), y: Math.min(H - 4, Math.max(12, sy(0) + 13)), class: 'plot-label', 'text-anchor': 'middle' }).textContent = x; }
    for (let y = Math.ceil(y0 / stepY) * stepY; y <= y1; y += stepY) { if (Math.abs(y) < 1e-9 || y <= y0 || y >= y1) continue; add('text', { x: Math.min(W - 4, Math.max(4, sx(0) + 4)), y: sy(y) - 2, class: 'plot-label' }).textContent = +y.toFixed(2); }
    const vas = ds.va ? ds.va.split(',').map(Number) : [];
    vas.forEach(v => add('line', { x1: sx(v), x2: sx(v), y1: 0, y2: H, class: 'plot-asym' }));
    (ds.lines ? ds.lines.split(';') : []).forEach(expr => { const g = M.compile(expr); add('line', { x1: sx(x0), y1: sy(g(x0)), x2: sx(x1), y2: sy(g(x1)), class: 'plot-asym' }); });
    const f = M.compile(ds.f), N = 800;
    let d = '', pen = false, prevX = null;
    for (let i = 0; i <= N; i++) {
      const x = x0 + (x1 - x0) * i / N; let y; try { y = f(x); } catch (e) { y = NaN; }
      const crossVA = prevX !== null && vas.some(v => (prevX - v) * (x - v) <= 0);
      if (!isFinite(y) || crossVA || y > y1 + (y1 - y0) || y < y0 - (y1 - y0)) { pen = false; prevX = x; continue; }
      d += (pen ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1) + ' '; pen = true; prevX = x;
    }
    const cp = document.createElementNS(NS, 'clipPath'); cp.id = 'clip' + Math.random().toString(36).slice(2);
    const r = document.createElementNS(NS, 'rect'); r.setAttribute('width', W); r.setAttribute('height', H); cp.appendChild(r); svg.appendChild(cp);
    add('path', { d, class: 'plot-curve', 'clip-path': 'url(#' + cp.id + ')' });
    (ds.pts ? ds.pts.split(';') : []).forEach(p => { const [px, py] = p.split(',').map(Number); add('circle', { cx: sx(px), cy: sy(py), r: 4, class: 'plot-pt' }); });
    return svg;
  }
  function drawPlots(root) {
    $$('.plot[data-f]:not([data-drawn])', root).forEach(div => {
      div.dataset.drawn = '1';
      try { div.appendChild(buildPlot(div.dataset)); } catch (e) { div.textContent = '(no s\'ha pogut dibuixar la gràfica)'; }
    });
  }
  const render = root => { typeset(root); drawPlots(root); };
  function solToggle(html, label) {
    const w = el('div', 'soltoggle'), b = el('button', 'btn sm', label || '👁️ Solució'), s = el('div', 'solbox'); s.hidden = true; s.innerHTML = Calc.pretty ? Calc.pretty(html) : html;
    b.onclick = () => { s.hidden = !s.hidden; b.textContent = s.hidden ? (label || '👁️ Solució') : '🙈 Amaga'; if (!s.hidden) render(s); };
    w.appendChild(b); w.appendChild(s); return w;
  }

  /* ------------------------------------------------------------------
     Etiquetatge per llista (L0–L5…) del banc de tests i dels exàmens
     ------------------------------------------------------------------ */
  function tagText(t) {
    t = String(t).toLowerCase();
    if (/taylor|residu|lagrange|polinomi d.aproxim|\\sin\(0|\\sin 0|e\^\{0|error (menor|més petit)|error.*10\^/.test(t)) return 'l5';
    if (/interpol|diferències dividides/.test(t)) return 'l6';
    if (/newton/.test(t)) return 'l7';
    if (/asímpt|asimpt|hôpital|hopital|l'h|indetermin|0\^0|1\^\\infty|\\infty\^0|\\frac\{\\ln x\}\{x\}|esbós/.test(t)) return 'l4';
    if (/extrem|creix|decreix|inflexi|concav|convex|màxim|mínim|maxim|minim|optimit|f''|punt crític/.test(t)) return 'l3';
    if (/derivad|tangent|rolle|valor mitj|implícit|f'\(|cadena/.test(t)) return 'l2';
    if (/bolzano|contín|contin|límit|limit|lim|arrel|única solució|weierstrass|teorema|zeros|quantes solucions/.test(t)) return 'l1';
    return 'l0';
  }
  const BANK_OVERRIDE = [['Quantes solucions reals té', 'l1'], ['f$ és un polinomi de grau 3', 'l2'], ['teorema del valor mitjà', 'l2'], ['error d\'interpolació', 'l6'], ['\\ln(x^4+1)', 'l4']];
  function tagBank(b) { const o = BANK_OVERRIDE.find(x => b.q.indexOf(x[0]) >= 0 || (b.e || '').indexOf(x[0]) >= 0); return o ? o[1] : tagText(b.q + ' ' + (b.e || '')); }
  /** Les preguntes de test reals passen als bancs dels mòduls => surten als tests i exàmens. */
  (function loadBanks() {
    const seen = new Set(), srcs = [];
    if (has('EXAM_TEST_BANK')) EXAM_TEST_BANK.forEach(q => srcs.push(q));
    if (has('CONCEPTUAL_MC')) CONCEPTUAL_MC.forEach(q => srcs.push(Object.assign({ src: 'Banc conceptual' }, q)));
    EXAMS.forEach(e => (e.test || []).forEach(q => srcs.push(Object.assign({ src: 'Parcial ' + e.id }, q))));
    srcs.forEach(q => {
      if (q.correct < 0) return;
      const key = q.q.replace(/\s+/g, '').slice(0, 70);
      if (seen.has(key)) return; seen.add(key);
      const b = { q: q.q, c: q.options, a: q.correct, e: q.exp, p1: true, src: q.src || '' };
      const m = Calc.byId[tagBank(b)]; if (m) { m.bank.push(b); b.mod = m.id; }
    });
  })();
  const p1Bank = () => MODS.flatMap(m => m.bank.filter(b => b.p1).map(b => Object.assign({ mod: m.id }, b)));

  /* Parts d'exàmens etiquetades per llista */
  function partTags(text) {
    const t = String(text).toLowerCase(), tags = new Set();
    if (/taylor|residu/.test(t)) tags.add('l5');
    if (/creixement|decreixement|extrem|concavitat|convexitat|inflexi|màxim|mínim/.test(t)) tags.add('l3');
    if (/asímpt|esbós|gràfic|hôpital/.test(t)) tags.add('l4');
    if (/\\lim|límit|lim_/.test(t)) tags.add(/\^\{|\^\\|\(1/.test(t) ? 'l4' : 'l1');
    if (/tangent|derivada|rolle|valor mitj/.test(t)) tags.add('l2');
    if (/única solució|una única|zero|almenys una|bolzano|contínua|continuïtat/.test(t)) tags.add('l1');
    if (/solucions de l'equació|equació e\^|inequaci|conjunt|valors de \$x\$ tals|\|\\|\\ln\|/.test(t)) tags.add('l0');
    if (!tags.size) tags.add(tagText(t));
    return Array.from(tags).filter(x => P1.includes(x));
  }
  function examParts() {
    const out = [];
    EXAMS.forEach(e => (e.problems || []).forEach((p, pi) => p.parts.forEach((part, k) => {
      out.push({ exam: e, pi, k, p, part, tags: partTags((p.statement || '') + ' ' + part.q), key: 'E:' + e.id + ':' + pi + ':' + k });
    })));
    return out;
  }

  /* ------------------------------------------------------------------
     Preguntes de test (opció múltiple) per als bancs reals
     ------------------------------------------------------------------ */
  const LETTERS = 'abcde';
  function prepMC(q, doShuffle) {
    const opts = q.options.map((text, idx) => ({ text, idx }));
    const order = doShuffle ? shuffle(opts) : opts;
    return Object.assign({}, q, { order, correctPos: order.findIndex(o => o.idx === q.correct), selected: null });
  }
  function mcBlock(item, num, mode) {
    const b = el('div', 'xq'), stem = el('div', 'xq-stem', (num !== '' ? '<b>' + num + '.</b> ' : '') + item.q);
    if (item.src) stem.appendChild(el('span', 'chip', esc(item.src)));
    b.appendChild(stem);
    item.order.forEach((o, oi) => {
      const btn = el('button', 'xopt', '<span class="xl">(' + LETTERS[oi] + ')</span> ' + o.text);
      btn.type = 'button';
      btn.onclick = () => {
        if (btn.disabled) return;
        if (mode === 'instant') { item.selected = oi; reveal(item, b); return; }
        item.selected = item.selected === oi ? null : oi;
        $$('.xopt', b).forEach((x, xi) => x.classList.toggle('sel', xi === item.selected));
      };
      b.appendChild(btn);
    });
    render(b); return b;
  }
  function reveal(item, block) {
    $$('.xopt', block).forEach((o, oi) => { o.disabled = true; if (oi === item.correctPos) o.classList.add('good'); else if (oi === item.selected) o.classList.add('wrong'); });
    if (!$('.xq-exp', block)) {
      const st = item.correctPos < 0 ? '' : item.selected === null ? '⚪ En blanc. ' : item.selected === item.correctPos ? '✅ ' : '❌ ';
      const e = el('div', 'xq-exp', st + (item.exp || '')); block.appendChild(e); render(e);
    }
  }
  const scoreMC = (items, ok1, bad1) => { let ok = 0, bad = 0, blank = 0; items.forEach(i => { if (i.selected === null) blank++; else if (i.selected === i.correctPos) ok++; else bad++; }); return { ok, bad, blank, points: Math.max(0, ok1 * ok - bad1 * bad) }; };

  /* ------------------------------------------------------------------
     Pestanyes extra dins de cada llista (L0–L5)
     ------------------------------------------------------------------ */
  const doneStore = { get: () => ls.get('calcmaster.p1done', {}), set: v => ls.set('calcmaster.p1done', v) };

  function listTab(body, m) {
    const L = LISTS.find(l => modOfList(l.id) === m.id);
    if (!L) { body.innerHTML = '<div class="card">No hi ha llista oficial per a aquest mòdul.</div>'; return; }
    const done = doneStore.get();
    const key = it => L.id + ':' + it.n;
    const nDone = () => L.items.filter(it => done[key(it)]).length;
    const pdfName = { l0: 'llista0.pdf', l1: 'llista1.pdf', l2: 'llista2.pdf', l3: 'llista3.pdf', l4: 'Hoja4.pdf', l5: 'Hoja5.pdf' }[m.id];
    body.innerHTML = `<div class="card"><div class="row"><h3 style="margin:0">${esc(L.title)}</h3><span class="spacer"></span><span class="chip warn" title="Importància a l'examen">${'★'.repeat(L.stars || 1)}${'☆'.repeat(3 - (L.stars || 1))}</span></div>
      <p class="muted" style="margin:6px 0">${esc(L.topic)}</p><div class="box warn" style="margin:8px 0">${L.exam}</div>
      <div class="row"><a class="btn sm" target="_blank" rel="noopener" href="${pdf(pdfName)}">📄 Enunciat original (PDF)</a><span class="spacer"></span><span id="ldone" class="muted"></span></div><div class="bar" style="margin-top:8px"><i id="lbar"></i></div></div>
      <p class="muted">Intenta cada exercici en paper <b>abans</b> de mirar la solució. Marca'l com a fet quan el dominis. Si l'exercici té una resposta numèrica, la pots comprovar a l'instant.</p><div id="litems"></div>`;
    const upd = () => { const n = nDone(); $('#ldone', body).textContent = n + '/' + L.items.length + ' fets'; $('#lbar', body).style.width = (n / L.items.length * 100) + '%'; };
    L.items.forEach(it => {
      const c = el('div', 'card litem' + (done[key(it)] ? ' isdone' : ''));
      c.innerHTML = `<div class="row"><span class="chip accent">Exercici ${esc(it.n)}</span><span class="spacer"></span><label class="chk"><input type="checkbox" ${done[key(it)] ? 'checked' : ''}> fet</label></div><div class="qtext">${it.q}</div>`;
      $('input[type=checkbox]', c).onchange = e => { const d = doneStore.get(); if (e.target.checked) d[key(it)] = 1; else delete d[key(it)]; doneStore.set(d); done[key(it)] = e.target.checked ? 1 : 0; c.classList.toggle('isdone', e.target.checked); upd(); };
      if (it.check) {
        const r = el('div', 'row chkrow', `<label>${esc(it.check.label)}</label><input class="ans" placeholder="el teu resultat" autocomplete="off" spellcheck="false"><button class="btn sm primary">Comprova</button><span class="chkres"></span>`);
        $('button', r).onclick = () => {
          const v = $('input', r).value.trim(), out = $('.chkres', r);
          if (!v) { out.textContent = ''; return; }
          const g = M.checkNum(v, it.check.value, 1e-3);
          out.innerHTML = g.parseError ? '… no ho entenc' : g.ok ? '✅ correcte' : '❌ encara no';
          out.className = 'chkres ' + (g.ok ? 'okc' : 'badc');
        };
        $('input', r).addEventListener('keydown', e => { if (e.key === 'Enter') $('button', r).click(); });
        c.appendChild(r);
      }
      c.appendChild(solToggle(it.sol));
      $('#litems', body).appendChild(c);
    });
    upd(); render(body);
  }

  function examsTab(body, m) {
    const n = m.id.replace(/\D/g, '');
    const topics = has('TOPIC_RANKING') ? TOPIC_RANKING.filter(t => new RegExp('L' + n + '(?!\\d)').test(t.lists)) : [];
    const parts = examParts().filter(x => x.tags.includes(m.id));
    const tests = m.bank.filter(b => b.p1);
    let h = `<p class="muted">Tot el que ha sortit als exàmens reals relacionat amb aquesta llista (etiquetat automàticament; alguns apartats toquen més d'una llista).</p>`;
    if (topics.length) h += '<h3>Temes d\'aquesta llista que cauen a l\'examen</h3>' + topics.map(t => `<div class="card topic"><div class="row"><span class="tier t${t.tier}">${t.tier}</span><b>${esc(t.topic)}</b><span class="spacer"></span><span class="chip">${esc(t.weight)}</span></div><div class="muted">${esc(t.why)}</div><div class="row">${(t.links || []).map(l => linkBtn(l)).join('')}</div></div>`).join('');
    h += `<h3>Apartats d'exàmens reals (${parts.length})</h3><div id="eparts"></div>`;
    body.innerHTML = h + `<h3>Preguntes de test reals (${tests.length})</h3><p class="muted">Ja formen part del <a href="#/mod/${m.id}/test">Test</a> d'aquesta llista i del mode examen.</p><a class="btn" href="#/p1/test?l=${m.id}">Fer-ne un test ara</a>`;
    const host = $('#eparts', body);
    parts.forEach(x => {
      const c = el('div', 'card epart');
      c.innerHTML = `<div class="row"><span class="chip accent">${esc(x.exam.id.replace(/^R/, 'Recu '))}</span><b>${esc(x.p.title)}</b><span class="spacer"></span><a class="btn sm ghost" href="#/p1/exam/${x.exam.id}">Veure examen</a></div>${x.p.statement ? '<div class="muted">' + x.p.statement + '</div>' : ''}<div class="qtext">${x.part.q}</div>`;
      c.appendChild(solToggle(x.part.sol)); host.appendChild(c);
    });
    if (!parts.length) host.innerHTML = '<div class="muted">Cap apartat etiquetat per a aquesta llista.</div>';
    render(body);
  }

  const TEORIA_MAP = { l0: [0, 1, 2], l1: [4], l2: [5, 6], l3: [7, 9], l4: [3, 8], l5: [10], l6: [11], l7: [12] };
  function theoryExtra(m) {
    if (!has('P1_TEORIA') || !TEORIA_MAP[m.id]) return '';
    return '<h2>Apunts generals</h2><p class="muted">Resum ràpid d\'aquest tema.</p>' + TEORIA_MAP[m.id].map(i => P1_TEORIA[i]).filter(Boolean).map(t => `<details class="tsec"><summary>${esc(t.title)}</summary><div class="tbody">${t.html}</div></details>`).join('');
  }
  Calc.extraTabs = m => P1.includes(m.id) ? [{ id: 'list', label: '📋 Llista oficial', render: listTab }, { id: 'exams', label: '🎓 A l\'examen', render: examsTab }] : [];
  Calc.theoryExtra = theoryExtra;

  /* ------------------------------------------------------------------
     Enllaços (pla / temes) cap a les pàgines de la web
     ------------------------------------------------------------------ */
  const CAT2GEN = { derivative: ['l2', 'derivative'], tangent: ['l1', 'tangent'], limit: ['l1', 'limit'], continuity: ['l1', 'continuity'], logDerivative: ['l2', 'logDerivative'], inequality: ['l0', 'inequality'], expQuadratic: ['l0', 'expQuadratic'], absExtrema: ['l3', 'absExtrema'], functionStudy: ['l4', 'functionStudy'], asymptote: ['l4', 'asymptote'], powLimit: ['l4', 'powLimit'], taylorProblem: ['l5', 'taylorProblem'], taylorDegree: ['l5', 'taylorDegree'], interpolation: ['l6', 'interpolation'], newton: ['l7', 'newton'] };
  function linkHref(l) {
    if (l.goto === 'examens') return l.exam ? '#/p1/exam/' + l.exam : '#/p1/exams';
    if (l.goto === 'llistes') return l.list ? '#/mod/' + modOfList(l.list) + '/list' : '#/p1';
    if (l.goto === 'teoria') return '#/p1/teoria';
    if (l.goto === 'test') return '#/p1/test';
    if (l.goto === 'simulacre') return '#/p1/sim';
    if (l.goto === 'exercicis') { const c = CAT2GEN[l.cat]; return c ? '#/mod/' + c[0] + '/practice?g=p1_' + c[1] : '#/practice'; }
    return '#/p1';
  }
  const linkBtn = l => `<a class="btn sm" href="${linkHref(l)}">${esc(l.l)}</a>`;

  /* ------------------------------------------------------------------
     Centre del 1r Parcial
     ------------------------------------------------------------------ */
  function hub() {
    U.renderSide('p1');
    const nBank = p1Bank().length, nGen = P1.reduce((a, id) => a + Calc.byId[id].gens.length, 0);
    const card = id => {
      const m = Calc.byId[id], mm = Calc.store.modMastery(m), L = LISTS.find(l => modOfList(l.id) === id), done = doneStore.get();
      const nd = L ? L.items.filter(it => done[L.id + ':' + it.n]).length : 0;
      return `<div class="card modcard"><div class="row"><span class="chip accent">${LISTNAME[id]}</span>${L ? '<span class="chip warn">' + '★'.repeat(L.stars || 1) + '</span>' : ''}<span class="spacer"></span><span class="pct">${U.pct(mm.value)}%</span></div>
        <h3>${esc(U.sideName(m))}</h3><p>${esc(LISTTOPIC[id])}</p><div class="bar"><i style="width:${U.pct(mm.value)}%"></i></div>
        <div class="muted" style="font-size:.85rem">${L ? nd + '/' + L.items.length + ' exercicis de la llista fets · ' : ''}${m.gens.length} tipus d'exercici</div>
        <div class="row"><a class="btn sm primary" href="#/mod/${id}/list">📋 Llista</a><a class="btn sm" href="#/mod/${id}/theory">📖 Teoria</a><a class="btn sm" href="#/mod/${id}/practice">✍️ Practicar</a><a class="btn sm" href="#/mod/${id}/test">✅ Test</a><a class="btn sm" href="#/mod/${id}/exams">🎓 Examen</a></div></div>`;
    };
    const S = has('TOPIC_RANKING') ? TOPIC_RANKING.filter(t => t.tier === 'S') : [];
    app.innerHTML = `<section class="hero"><h1>📘 Resum del 1r parcial</h1><p>Tot el material del primer parcial en un sol lloc: <b>cada llista per separat</b> (llista oficial resolta, teoria, generador infinit, test i apartats d'examen) i, quan vulguis, <b>les combines</b> en una sola sessió.</p>
      <div class="row"><a class="btn primary" href="#/mix">🧩 Tria llistes i barreja</a><a class="btn" href="#/p1/exams">🔥 Exàmens reals</a><a class="btn" href="#/p1/sim">⏱️ Simulacre</a><a class="btn" href="#/cami">🧭 Camí recomanat</a></div></section>
      <div class="grid cols3" style="margin-top:16px"><div class="card stat"><b>${EXAMS.length}</b><span>exàmens reals amb solució</span></div><div class="card stat"><b>${nGen}</b><span>tipus d'exercici generables (L0–L5)</span></div><div class="card stat"><b>${nBank}</b><span>preguntes de test reals/conceptuals</span></div></div>
      <h2>Les llistes, una per una</h2><div class="grid cols2">${P1.map(card).join('')}</div>
      <h2>Prioritat màxima <span class="chip warn">sortit als últims parcials</span></h2><div class="card">${S.map(t => `<div class="row topicrow"><span class="tier tS">S</span><div><b>${esc(t.topic)}</b><div class="muted" style="font-size:.85rem">${esc(t.lists)} · ${esc(t.weight)}</div></div><span class="spacer"></span><a class="btn sm" href="#/p1/temes">Detall</a></div>`).join('')}</div>
      <h2>Eines</h2><div class="grid cols3">
        <a class="card toolcard" href="#/p1/patrons"><b>🎲 Simulador de patrons</b><span>Problemes oberts de llistes i exàmens, a l'atzar.</span></a>
        <a class="card toolcard" href="#/p1/test"><b>✅ Banc de tests reals</b><span>Format 2025: +0,8 / −0,2.</span></a>
        <a class="card toolcard" href="#/p1/guia"><b>🧠 Plantilles i errors típics</b><span>Com redactar Bolzano, estudi de funció…</span></a>
        <a class="card toolcard" href="#/p1/resolts"><b>🧾 Problemes resolts</b><span>Estudis de funció complets pas a pas.</span></a>
        <a class="card toolcard" href="#/p1/teoria"><b>📚 Apunts generals</b><span>13 blocs, amb cercador.</span></a>
        <a class="card toolcard" href="#/recursos"><b>📎 PDFs i recursos</b><span>Llistes, exàmens, resums i derivades 100.</span></a></div>`;
    typeset(app);
  }

  /* ------------------------------------------------------------------
     Combina llistes
     ------------------------------------------------------------------ */
  function mix() {
    U.renderSide('mix');
    const cur = new Set(Calc.sel.get());
    const row = m => { const mm = Calc.store.modMastery(m); return `<label class="mixopt"><input type="checkbox" value="${m.id}" ${cur.has(m.id) ? 'checked' : ''}><span class="num">${esc(m.num)}</span><span class="t">${esc(U.sideName(m))}</span><span class="muted">${U.pct(mm.value)}%</span></label>`; };
    app.innerHTML = `<h1>🧩 Tria llistes i barreja</h1><p class="lead">Marca les llistes que vulguis i practica-les barrejades, com a l'examen (on no et diuen de quin tema és cada pregunta). La selecció es recorda.</p>
      <div class="card"><div class="row" style="margin-bottom:10px">
        <button class="btn sm" data-pre="p1">Parcial 1 complet (L0–L5)</button><button class="btn sm" data-pre="weak">Només les que em costen</button><button class="btn sm" data-pre="a">L0–L2</button><button class="btn sm" data-pre="b">L3–L5</button><button class="btn sm" data-pre="all">Tot el curs</button><button class="btn sm ghost" data-pre="none">Cap</button></div>
        <h4 class="mixh">1r Parcial</h4><div class="mixgrid">${MODS.filter(m => P1.includes(m.id)).map(row).join('')}</div>
        <h4 class="mixh">Fonaments</h4><div class="mixgrid">${MODS.filter(m => m.id === 'base').map(row).join('')}</div>
        <h4 class="mixh">Resta del curs (llistes 6–13)</h4><div class="mixgrid">${MODS.filter(m => !U.CLASS_DONE.has(m.id)).map(row).join('')}</div></div>
      <div class="row" style="margin:14px 0"><span id="mixinfo" class="muted"></span><span class="spacer"></span></div>
      <div class="row"><button class="btn primary" data-run="practice">✍️ Practicar la selecció</button><button class="btn" data-run="test">✅ Test de la selecció</button><button class="btn" data-run="exam">📝 Examen de la selecció</button><button class="btn" data-run="patrons">🎲 Patrons oberts</button></div><div id="tabbody" style="margin-top:16px"></div>`;
    const chosen = () => $$('.mixgrid input:checked', app).map(i => i.value);
    const upd = () => {
      const c = chosen(), ms = c.map(id => Calc.byId[id]);
      $('#mixinfo').textContent = c.length ? c.length + ' llistes · ' + ms.reduce((a, m) => a + m.gens.length, 0) + ' tipus d\'exercici · ' + ms.reduce((a, m) => a + m.bank.length, 0) + ' preguntes de teoria' : 'Selecciona almenys una llista';
      Calc.sel.set(c.length ? c : Calc.sel.get());
    };
    $$('.mixgrid input', app).forEach(i => i.onchange = upd);
    $$('[data-pre]', app).forEach(b => b.onclick = () => {
      const k = b.getAttribute('data-pre');
      const weak = new Set(MODS.filter(m => P1.includes(m.id) && (Calc.store.modMastery(m).att === 0 || Calc.store.modMastery(m).value < 0.7)).map(m => m.id));
      $$('.mixgrid input', app).forEach(i => { const id = i.value; i.checked = k === 'all' || (k === 'p1' && P1.includes(id)) || (k === 'a' && ['l0', 'l1', 'l2'].includes(id)) || (k === 'b' && ['l3', 'l4', 'l5'].includes(id)) || (k === 'weak' && weak.has(id)); });
      upd();
    });
    $$('[data-run]', app).forEach(b => b.onclick = () => {
      const c = chosen(); if (!c.length) { alert('Escull almenys una llista.'); return; }
      Calc.sel.set(c);
      const ms = c.map(id => Calc.byId[id]), host = $('#tabbody');
      const run = b.getAttribute('data-run');
      if (run === 'practice') { host.innerHTML = ''; const d = el('div'); host.appendChild(d); U.mountPractice(d, { gens: ms.flatMap(m => m.gens), activeId: 'mix', scroll: false }); }
      else if (run === 'test') { U.testTab(host, { id: 'mix', llista: 'Mescla', title: 'Mescla', bank: ms.flatMap(m => m.bank), gens: ms.flatMap(m => m.gens) }); }
      else if (run === 'patrons') { location.hash = '#/p1/patrons'; }
      else { U.examConfig.cfg = { mods: c, fmt: 'mixt', n: Math.min(20, Math.max(8, c.length * 3)), min: 60, hard: false }; location.hash = '#/exam'; }
    });
    upd();
  }

  /* ------------------------------------------------------------------
     Exàmens reals
     ------------------------------------------------------------------ */
  const EXAM_PDF = {
    2026: ['primer-parcial-2026.pdf'], 2025: ['wuolah-free-Calcul-enunciat-Parcial-1-2025.pdf.pdf'], 2024: ['wuolah-free-Parcial-1-Calcul-2024.pdf', 'wuolah-free-Parcial-1-2023-2024.pdf', 'wuolah-free-Parcial-1-2023-2024-41.pdf', 'wuolah-free-Parcial-1-2023-24.pdf'],
    2023: ['wuolah-free-parcial-1-2023.pdf', 'wuolah-free-Parcial-1-Calcul-2223.pdf', 'wuolah-free-ExamenParcial1-2023.pdf'], 2022: ['wuolah-free-CorreccioParcial2022.pdf'],
    2021: ['wuolah-free-PrimerParcial26A2021.pdf', 'wuolah-free-ExamenParcial1-2021.pdf'], 2020: ['wuolah-free-ExamenParcial1-2020.pdf'],
    2019: ['wuolah-free-Parcial-1-2018-2019.pdf'], R2019: ['wuolah-free-Recu-P1-2018-2019.pdf'], 2018: ['wuolah-free-Parcial-1-2017-2018.pdf'], R2018: ['wuolah-free-Recu-P1-2017-2018.pdf']
  };
  function examsPage() {
    U.renderSide('p1exams');
    const done = ls.get('calcmaster.examsdone', {});
    app.innerHTML = `<h1>🔥 Exàmens reals del 1r Parcial</h1><p class="lead">${EXAMS.length} exàmens (2018–2026) amb la solució completa. Fes-los en paper i compara. Cada examen té també el seu simulacre complet amb la solució.</p>
      <div class="grid cols2">${EXAMS.map(e => {
    const nT = (e.test || []).length, nP = (e.problems || []).reduce((a, p) => a + p.parts.length, 0);
    return `<a class="card examcard ${e.hot ? 'hot' : ''}" href="#/p1/exam/${e.id}"><div class="row"><b>${esc(e.title)}</b><span class="spacer"></span>${done[e.id] ? '<span class="chip ok">✓ fet</span>' : ''}</div><div class="row"><span class="chip ${e.hot ? 'warn' : ''}">${esc(e.tag)}</span></div><div class="muted" style="font-size:.88rem">${nT ? nT + ' preguntes de test · ' : ''}${nP} apartats de problemes</div></a>`;
  }).join('')}</div>`;
  }
  function examPage(id) {
    U.renderSide('p1exams');
    const e = EXAMS.find(x => x.id === id);
    if (!e) { app.innerHTML = '<p>Examen no trobat. <a href="#/p1/exams">Tornar</a></p>'; return; }
    const i = EXAMS.indexOf(e), prev = EXAMS[i + 1], next = EXAMS[i - 1];
    const done = ls.get('calcmaster.examsdone', {});
    const pf = EXAM_PDF[id] || [];
    app.innerHTML = `<div class="crumbs"><a href="#/">Inici</a> › <a href="#/p1/exams">Exàmens reals</a> › ${esc(e.id)}</div><div class="row"><h1>${esc(e.title)}</h1><span class="spacer"></span><label class="chk"><input type="checkbox" id="exdone" ${done[id] ? 'checked' : ''}> examen fet</label></div>
      <p class="muted">📋 ${esc(e.format)}</p>${pf.length ? '<div class="row">' + pf.map((f, k) => `<a class="btn sm" target="_blank" rel="noopener" href="${pdf(f)}">📄 PDF original${pf.length > 1 ? ' ' + (k + 1) : ''}</a>`).join('') + '</div>' : ''}<div id="exbody"></div>
      <div class="row" style="margin-top:22px">${prev ? `<a class="btn" href="#/p1/exam/${prev.id}">← ${esc(prev.id)}</a>` : ''}<span class="spacer"></span>${next ? `<a class="btn" href="#/p1/exam/${next.id}">${esc(next.id)} →</a>` : ''}</div>`;
    $('#exdone').onchange = ev => { const d = ls.get('calcmaster.examsdone', {}); if (ev.target.checked) d[id] = 1; else delete d[id]; ls.set('calcmaster.examsdone', d); };
    const host = $('#exbody');
    if (e.test && e.test.length) {
      host.appendChild(el('h2', null, 'Preguntes de test <span class="muted small">(clica una opció: es corregeix a l\'instant)</span>'));
      e.test.forEach((q, k) => { const b = mcBlock(prepMC(q, false), k + 1, 'instant'); if (q.correct >= 0 && Calc.exAutoMC) Calc.exAutoMC(b, 'P1:' + e.id + ':t' + k, q.correct); host.appendChild(b); });
    }
    (e.problems || []).forEach((p, pi) => {
      const c = el('div', 'card exprob'); c.appendChild(el('h3', null, esc(p.title)));
      if (p.statement) c.appendChild(el('div', 'qtext', p.statement));
      p.parts.forEach((part, k) => {
        const pp = el('div', 'exampart'); pp.appendChild(el('div', 'qtext', part.q));
        const tg = partTags((p.statement || '') + ' ' + part.q);
        pp.appendChild(el('div', 'row', '<span class="muted small">Tema:</span>' + tg.map(t => `<button type="button" class="ref" data-theory="${t}" title="Obre la teoria al costat">${LISTNAME[t]} · ${esc(U.sideName(Calc.byId[t]))}</button><a class="chip" href="#/mod/${t}/practice">Practicar</a>`).join('')));
        pp.appendChild(solToggle(part.sol)); if (Calc.exBox) pp.appendChild(Calc.exBox('P1:' + e.id + ':' + pi + ':' + k)); c.appendChild(pp);
      });
      host.appendChild(c);
    });
    render(app);
  }

  /* ------------------------------------------------------------------
     Simulacre estil 2025 (variants generades)
     ------------------------------------------------------------------ */
  function simPage() {
    U.renderSide('p1sim');
    app.innerHTML = `<h1>⏱️ Simulacre d'examen estil 2025</h1><p class="lead">Mateix format que el parcial de novembre de 2025: <b>4 preguntes de test</b> (+1, −0,25 per error, en blanc 0) i <b>2 problemes</b> de 3 punts (estudi de funció amb extrems absoluts, i Taylor amb fita de l'error). Números nous cada cop.</p>
      <div class="card"><div class="row"><label>Temps<br><select id="simMin"><option value="90">90 min</option><option value="60">60 min</option><option value="120">120 min</option><option value="0">Sense límit</option></select></label><span class="spacer"></span><button class="btn primary" id="simGo">▶️ Començar</button></div></div><div id="simbody"></div>`;
    $('#simGo').onclick = () => simRun(+$('#simMin').value);
  }
  function simRun(minutes) {
    if (!has('ExamGen')) { alert('No s\'ha carregat el generador d\'examen.'); return; }
    const ex = ExamGen.exam(), host = $('#simbody'), t0 = Date.now(); let timer = null, finished = false;
    host.innerHTML = '';
    const top = el('div', 'exam-top', '<span class="chip accent">Simulacre</span><span class="spacer"></span><span class="timer" id="simTimer"></span><button class="btn primary" id="simEnd">📨 Entregar</button>'); host.appendChild(top);
    host.appendChild(el('h2', null, 'Test (4 punts)'));
    const items = ex.test.map(q => prepMC(q, true)), blocks = items.map((it, i) => { const b = mcBlock(it, i + 1, 'deferred'); host.appendChild(b); return b; });
    host.appendChild(el('h2', null, 'Problemes (3 + 3 punts)'));
    const titles = ['Problema 1 (3 punts) — estudi de funció i extrems absoluts', 'Problema 2 (3 punts) — Taylor i fita de l\'error'];
    const probs = [ex.p1, ex.p2].map((q, k) => { const p = Calc.p1.adapt(q); const v = new QView(p, { meta: '<b>' + titles[k] + '</b>', noActions: true, noKbd: true }); host.appendChild(v.el); return { p, v, title: titles[k] }; });
    const left = () => Math.max(0, minutes * 60 - Math.floor((Date.now() - t0) / 1000));
    function tick() { if (!minutes) return; const l = left(), t = $('#simTimer'); if (t) { t.textContent = String(Math.floor(l / 60)).padStart(2, '0') + ':' + String(l % 60).padStart(2, '0'); t.classList.toggle('low', l < 300); } if (l <= 0) finish(); }
    function finish() {
      if (finished) return; finished = true; clearInterval(timer); U.setCleanup(null);
      items.forEach((it, i) => reveal(it, blocks[i]));
      const s = scoreMC(items, 1, 0.25); let pp = 0; const lines = [];
      probs.forEach(x => {
        const a = x.v.getAnswer(), g = Calc.grade(x.p, a), n = g.parts.length, k = g.parts.filter(Boolean).length, pts = 3 * k / n; pp += pts;
        x.v.mark(g.ok, g.parts); x.v.lock(); x.v.showSolution(); lines.push(esc(x.title.split(' — ')[0]) + ': <b>' + pts.toFixed(2) + ' / 3</b> (' + k + '/' + n + ' caselles)');
      });
      const tot = s.points + pp; top.remove();
      Calc.store.addExam({ t: Date.now(), mark: tot, n: 6, fmt: 'simulacre', mins: Math.round((Date.now() - t0) / 60000) }); U.renderTop();
      const r = el('div', 'card'); r.innerHTML = `<h2 style="margin-top:0">Nota del simulacre: ${tot.toFixed(2)} / 10</h2><p>Test: <b>${s.points.toFixed(2)} / 4</b> (✅ ${s.ok} · ❌ ${s.bad} · ⚪ ${s.blank})</p><p>${lines.join('<br>')}</p><p class="muted">A l'examen real els problemes es corregeixen pel <b>raonament escrit</b>: compara el teu procediment amb les solucions.</p><button class="btn primary" id="simAgain">🎲 Un altre simulacre</button>`;
      host.insertBefore(r, host.firstChild); $('#simAgain', r).onclick = simPage; window.scrollTo({ top: 0 }); render(host);
    }
    $('#simEnd').onclick = () => { if (confirm('Segur que vols entregar?')) finish(); };
    if (minutes) { timer = setInterval(tick, 1000); tick(); U.setCleanup(() => clearInterval(timer)); }
    render(host); window.scrollTo({ top: 0 });
  }

  /* ------------------------------------------------------------------
     Temes que més surten, guia, resolts, apunts
     ------------------------------------------------------------------ */
  function temesPage() {
    U.renderSide('p1temes');
    const cols = EXAM_COLS, N = cols.length;
    const TIER = { S: ['Surt gairebé sempre', 'Prioritat màxima'], A: ['Surt molt sovint', 'Molt important'], B: ['Surt de tant en tant', 'Important'], C: ['Ha sortit poc', 'Llegeix-ho un cop'] };
    const card = t => {
      const n = t.seen.length, f = n / N;
      return `<div class="topic t${t.tier}"><div class="topic-h"><span class="tier t${t.tier}">${t.tier}</span><div class="topic-t"><b>${esc(t.topic)}</b><div class="muted small">${esc(t.lists)} · ${esc(t.weight)}</div></div><div class="freq" title="Ha sortit a ${n} de ${N} exàmens"><b>${n}/${N}</b><span>exàmens</span></div></div>
        <div class="freqbar"><i style="width:${Math.round(f * 100)}%"></i></div>
        <div class="years">${cols.map(c => `<span class="yr ${t.seen.indexOf(c) >= 0 ? 'on' : ''}" title="${t.seen.indexOf(c) >= 0 ? 'Va sortir' : 'No va sortir'} el ${esc(c)}">${esc(c)}</span>`).join('')}</div>
        <p>${esc(t.why)}</p><div class="row">${(t.links || []).map(linkBtn).join('')}</div></div>`;
    };
    app.innerHTML = `<h1>📈 Què surt més a l'examen</h1><p class="lead">Els temes del 1r parcial ordenats per com de sovint han sortit als ${N} exàmens reals (2018–2026). Cada targeta mostra en quins anys va sortir i on practicar-lo.</p>
      <div class="legend">${Object.keys(TIER).map(k => `<span><span class="tier t${k}">${k}</span> ${TIER[k][0]}</span>`).join('')}</div>` +
      Object.keys(TIER).map(k => { const ts = TOPIC_RANKING.filter(t => t.tier === k); return ts.length ? `<h2><span class="tier t${k}">${k}</span> ${TIER[k][1]}</h2><div class="topics">${ts.map(card).join('')}</div>` : ''; }).join('');
    render(app);
  }
  function guiaPage() {
    U.renderSide('p1guia');
    app.innerHTML = `<h1>🧠 Plantilles i errors típics</h1><p class="lead">Com redactar el que et demanen (l'examen es puntua pel raonament) i els errors que més punts costen.</p><h2>Plantilles de resposta</h2>${TEMPLATES.map(t => `<div class="card" style="margin-bottom:12px"><h3 style="margin-top:0">${t.t}</h3><div>${t.b}</div></div>`).join('')}<h2>Errors que costen punts</h2><div class="card"><ul>${COMMON_ERRORS.map(x => '<li>' + x + '</li>').join('')}</ul></div>`;
    render(app);
  }
  function resoltsPage() {
    U.renderSide('p1resolts');
    app.innerHTML = '<h1>🧾 Problemes resolts</h1><p class="lead">Estudis de funció i altres problemes complets, pas a pas.</p>';
    SOLVED_PROBLEMS.forEach(p => { const c = el('div', 'card'); c.style.marginBottom = '14px'; c.innerHTML = `<h3 style="margin-top:0">${esc(p.title)}</h3><div class="qtext">${p.statement}</div>`; c.appendChild(solToggle(p.solutionHtml)); app.appendChild(c); });
    render(app);
  }
  function teoriaPage() {
    U.renderSide('p1teoria');
    app.innerHTML = `<h1>📚 Apunts generals</h1><p class="lead">Resum per consultar ràpid: 13 blocs amb l'essencial de cada tema. Per a la teoria completa, entra a la llista corresponent.</p><div class="card"><input id="tsearch" class="search" placeholder="🔍 Cerca (Hôpital, Taylor, Bolzano…)"></div><div id="tlist"></div>`;
    const list = $('#tlist');
    P1_TEORIA.forEach((t, i) => { const d = el('details', 'tsec'); if (i === 0) d.open = true; d.innerHTML = `<summary>${esc(t.title)}</summary><div class="tbody">${t.html}</div>`; list.appendChild(d); });
    $('#tsearch').oninput = e => { const q = e.target.value.toLowerCase().trim(); $$('details', list).forEach(d => { const hit = !q || d.textContent.toLowerCase().indexOf(q) >= 0; d.hidden = !hit; if (q && hit) d.open = true; }); };
    render(app);
  }
  function chuletaPage() {
    U.renderSide('p1chuleta');
    app.innerHTML = `<div class="row"><h1>📝 Xuleta d'una pàgina</h1><span class="spacer"></span><a class="btn sm" target="_blank" rel="noopener" href="chuleta.html">Obrir a part / imprimir</a></div><iframe class="frame" src="chuleta.html" title="Xuleta"></iframe>`;
  }

  /* ------------------------------------------------------------------
     Banc de tests reals (format 2025 o pràctica)
     ------------------------------------------------------------------ */
  function testPage(h) {
    U.renderSide('p1test');
    const q = new URLSearchParams((h.split('?')[1]) || ''), pre = q.get('l');
    const cur = new Set(pre ? [pre] : P1);
    app.innerHTML = `<h1>✅ Banc de tests reals</h1><p class="lead">Preguntes tipus test dels exàmens reals i del banc conceptual, de la llista (o llistes) que triïs.</p>
      <div class="card"><div class="row" style="margin-bottom:8px">${P1.map(id => `<label class="mixopt"><input type="checkbox" value="${id}" ${cur.has(id) ? 'checked' : ''}><span class="t">${LISTNAME[id]}</span></label>`).join('')}</div>
      <div class="row"><label>Format <select id="tfmt"><option value="2025">Examen 2025 (5 preguntes, +0,8 / −0,2, en blanc 0)</option><option value="prac">Pràctica (10 preguntes, +1)</option></select></label><span class="spacer"></span><button class="btn primary" id="tgo">▶️ Començar</button></div><div class="muted" id="tinfo"></div></div><div id="trun"></div>`;
    const bank = p1Bank(), chosen = () => $$('.mixopt input:checked', app).map(i => i.value);
    const pool = () => bank.filter(b => chosen().includes(b.mod));
    const info = () => { $('#tinfo').textContent = pool().length + ' preguntes disponibles amb aquesta selecció'; };
    $$('.mixopt input', app).forEach(i => i.onchange = info); info();
    $('#tgo').onclick = () => {
      const fmt = $('#tfmt').value, n = fmt === '2025' ? 5 : 10, run = $('#trun'); const pl = pool();
      if (!pl.length) { alert('No hi ha preguntes amb aquesta selecció.'); return; }
      run.innerHTML = ''; const picked = shuffle(pl).slice(0, n).map(b => prepMC({ q: b.q, options: b.c, correct: b.a, exp: b.e, src: (b.src ? b.src + ' · ' : '') + LISTNAME[b.mod] }, true));
      run.appendChild(el('p', 'muted', fmt === '2025' ? 'Torna a clicar una opció per desmarcar-la (en blanc). +0,8 / −0,2.' : 'Tria una opció a cada pregunta i prem «Finalitza».'));
      const blocks = picked.map((it, i) => { const b = mcBlock(it, i + 1, 'deferred'); run.appendChild(b); return b; });
      const fin = el('button', 'btn primary', 'Finalitza el test'); run.appendChild(fin);
      fin.onclick = () => {
        picked.forEach((it, i) => reveal(it, blocks[i])); fin.hidden = true;
        const s = scoreMC(picked, fmt === '2025' ? 0.8 : 1, fmt === '2025' ? 0.2 : 0), res = el('div', 'card');
        res.innerHTML = fmt === '2025' ? `<h3>Nota: ${s.points.toFixed(1)} / ${(picked.length * 0.8).toFixed(1)}</h3><p>✅ ${s.ok} · ❌ ${s.bad} · ⚪ ${s.blank}</p><p class="muted">Amb +0,8/−0,2 i 5 opcions, si pots descartar almenys una opció, val la pena arriscar.</p>` : `<h3>Resultat: ${s.ok} / ${picked.length}</h3>`;
        run.appendChild(res); res.scrollIntoView({ behavior: 'smooth' });
      };
      render(run);
    };
  }

  /* ------------------------------------------------------------------
     Simulador de patrons (problemes oberts, autoavaluació)
     ------------------------------------------------------------------ */
  function patronsPage() {
    U.renderSide('p1');
    const state = ls.get('calcmaster.patrons', {}), selIds = new Set((x => x.length ? x : P1)(Calc.sel.get().filter(id => P1.includes(id))));
    const pool = [];
    LISTS.forEach(l => { const mid = modOfList(l.id); l.items.forEach(it => pool.push({ key: 'L:' + l.id + ':' + it.n, mod: mid, src: LISTNAME[mid] + ' · ' + it.n, w: l.stars || 1, q: it.q, sol: it.sol })); });
    examParts().forEach(x => pool.push({ key: x.key, mod: x.tags[0], tags: x.tags, src: x.exam.id.replace(/^R/, 'Recu ') + ' · ' + x.p.title, w: x.exam.hot ? 3 : 2, q: (x.p.statement ? x.p.statement + ' ' : '') + x.part.q, sol: x.part.sol }));
    let onlySel = true, minW = 1, cur = null;
    app.innerHTML = `<h1>🎲 Simulador de patrons</h1><p class="lead">Problemes oberts de les llistes i dels exàmens reals, a l'atzar. Resol-lo en paper, mira la solució i marca si el domines. Només surten els que encara no domines.</p>
      <div class="card"><div class="row"><label class="chk"><input type="checkbox" id="pSel" checked> Només les llistes de la meva selecció (${[...selIds].map(i => LISTNAME[i]).join(', ') || 'cap'}) <a href="#/mix">(canviar)</a></label><label>Pes mínim <select id="pW"><option value="1">tot</option><option value="2">importants</option><option value="3">només clau</option></select></label><span class="spacer"></span><b id="pMeter"></b></div></div><div id="pbox" style="margin-top:14px"></div>`;
    const group = () => pool.filter(p => p.w >= minW && (!onlySel || (p.tags ? p.tags.some(t => selIds.has(t)) : selIds.has(p.mod))));
    const meter = () => { const g = group(), n = g.filter(p => state[p.key] === 'ok').length; $('#pMeter').textContent = n + '/' + g.length + ' dominats'; };
    function pick() {
      const g = group().filter(p => state[p.key] !== 'ok'), box = $('#pbox'); meter();
      if (!g.length) { box.innerHTML = '<div class="card"><h2>🎉 Has dominat tots els patrons d\'aquesta selecció</h2><button class="btn" id="pReset">Reiniciar</button></div>'; $('#pReset').onclick = () => { group().forEach(p => delete state[p.key]); ls.set('calcmaster.patrons', state); pick(); }; return; }
      const w = g.map(p => (state[p.key] === 'ko' ? 3 : 1) * p.w); let t = Math.random() * w.reduce((a, b) => a + b, 0), i = 0; for (; i < w.length - 1; i++) { t -= w[i]; if (t <= 0) break; }
      cur = g[i]; box.innerHTML = `<div class="card"><div class="row"><span class="chip accent">${esc(cur.src)}</span></div><div class="qtext">${cur.q}</div><div id="pSol"></div><div class="row" style="margin-top:10px"><button class="btn" id="pShow">👁️ Veure solució</button><span class="spacer"></span><button class="btn ghost" id="pSkip">Saltar</button></div></div>`;
      $('#pShow').onclick = () => { const s = $('#pSol'); s.innerHTML = '<div class="solbox">' + cur.sol + '</div><div class="row" style="margin-top:10px"><button class="btn ok" id="pOk">✅ Ho domino</button><button class="btn" id="pKo">🔁 Repassar</button></div>'; render(s); $('#pOk').onclick = () => { state[cur.key] = 'ok'; ls.set('calcmaster.patrons', state); pick(); }; $('#pKo').onclick = () => { state[cur.key] = 'ko'; ls.set('calcmaster.patrons', state); pick(); }; $('#pShow').hidden = true; };
      $('#pSkip').onclick = pick; render(box);
    }
    $('#pSel').onchange = e => { onlySel = e.target.checked; pick(); }; $('#pW').onchange = e => { minW = +e.target.value; pick(); };
    pick();
  }

  /* ------------------------------------------------------------------
     PDFs i recursos
     ------------------------------------------------------------------ */
  const RES = [
    ['Llistes oficials', [['llista0.pdf', 'Llista 0 — Bàsics'], ['llista1.pdf', 'Llista 1 — Bolzano, límits i continuïtat'], ['llista2.pdf', 'Llista 2 — Derivades'], ['llista3.pdf', 'Llista 3 — Extrems i optimització'], ['Hoja4.pdf', 'Llista 4 — Asímptotes i L\'Hôpital'], ['Hoja5.pdf', 'Llista 5 — Taylor']]],
    ['Guia i apunts del professorat', [['Càlcul - g103802a2026-27iCAT.pdf', 'Guia docent (continguts i avaluació)'], ['BASICS032_corr.pdf', 'Diapositives: bàsics (nombres, intervals, potències…)'], ['Derivades_corr.pdf', 'Diapositives: continuïtat, Bolzano, derivades, TVM, Rolle…'], ['Derivades de 100 funcions.pdf', 'Derivades de 100 funcions (es pot practicar aquí: Llista 2 › Derivades 100)']]],
    ['Resums i formularis (companys)', [['wuolah-free-Resum-1r-Parcial.pdf', 'Resum 1r parcial'], ['wuolah-free-Calcul-Resum-Parcial-1.pdf', 'Resum 1r parcial (Càlcul)'], ['wuolah-free-Calculo-Resumen-parcial-1.pdf', 'Resumen parcial 1'], ['wuolah-free-Apunts1rParcial.pdf', 'Apunts 1r parcial'], ['wuolah-free-Calcul-Formulari-Parcial-1.pdf', 'Formulari parcial 1'], ['wuolah-free-Calcul-Formulari-Parcial-1-1.pdf', 'Formulari parcial 1 (2)']]],
    ['Problemes i preparació', [['wuolah-free-CP1P-Calcul-Preparacio-1r-Parcial-.pdf', 'Preparació 1r parcial (seminaris, indeterminacions…)'], ['wuolah-free-TotsProblemesSemanaPrimerParcial.pdf', 'Tots els problemes de les setmanes (manuscrit)']]],
    ['Exàmens', [['primer-parcial-2026.pdf', 'Parcial 1 — 2026 (amb solucions)'], ['wuolah-free-Calcul-enunciat-Parcial-1-2025.pdf.pdf', 'Parcial 1 — novembre 2025'], ['wuolah-free-Parcial-1-Calcul-2024.pdf', 'Parcial 1 — abril 2024'], ['wuolah-free-Parcial-1-2023-2024.pdf', 'Parcial 1 — 2023-24 (còpia)'], ['wuolah-free-Parcial-1-2023-2024-41.pdf', 'Parcial 1 — 2023-24 (còpia 2)'], ['wuolah-free-Parcial-1-2023-24.pdf', 'Parcial 1 — 2023-24 (còpia 3)'], ['wuolah-free-parcial-1-2023.pdf', 'Parcial 1 — abril 2023'], ['wuolah-free-Parcial-1-Calcul-2223.pdf', 'Parcial 1 — 2022-23 (foto)'], ['wuolah-free-ExamenParcial1-2023.pdf', 'Parcial 1 — 2023 (resolt a mà)'], ['wuolah-free-CorreccioParcial2022.pdf', 'Parcial 1 — 2022 (correcció)'], ['wuolah-free-PrimerParcial26A2021.pdf', 'Parcial 1 — 26 abril 2021'], ['wuolah-free-ExamenParcial1-2021.pdf', 'Parcial 1 — 2021 (resolt a mà)'], ['wuolah-free-ExamenParcial1-2020.pdf', 'Parcial 1 — 2020 (resolt a mà)'], ['wuolah-free-Parcial-1-2018-2019.pdf', 'Parcial 1 — 2018-19'], ['wuolah-free-Recu-P1-2018-2019.pdf', 'Recuperació — 2018-19'], ['wuolah-free-Parcial-1-2017-2018.pdf', 'Parcial 1 — 2017-18'], ['wuolah-free-Recu-P1-2017-2018.pdf', 'Recuperació — 2017-18']]],
    ['Exàmens del 2n parcial', [['p2-solucionari-test.pdf', 'Parcial 2 — solucionari amb test (format actual; pàg. 1 malmesa)'], ['p2-gener-2025-enunciat-parcial.pdf', 'Parcial 2 — gener 2025 (enunciats Ex. 2–3 i test 4–5)'], ['p2-gener-2025-solucions-oficials.pdf', 'Parcial 2 — gener 2025 (solucions oficials parcials; pàg. 1 malmesa)'], ['p2-gener-2025-solucions-alumne.pdf', 'Parcial 2 — gener 2025 (resolt per un alumne)'], ['recu-juny-2024.pdf', 'Recuperació — juny 2024 (tot el temari)'], ['p2-juny-2024.pdf', 'Parcial 2 — juny 2024'], ['wuolah-free-Parcial2-Calculo-2223.pdf', 'Parcial 2 — juny 2023']]]
  ];
  function recursosPage() {
    U.renderSide('recursos');
    app.innerHTML = '<h1>📎 PDFs i recursos</h1><p class="lead">Tots els documents originals, guardats a <code>recursos/pdf/</code>. S\'obren al visor del navegador.</p><div class="card tipcard nopdf-only">📄 Aquesta versió publicada <b>no inclou els PDFs</b>: són material amb drets d\'autor (UAB i Wuolah) i no es pugen a internet. Obre la web en local amb la carpeta <code>recursos/pdf/</code> per tenir-los. Els exàmens resolts, les llistes i la teoria sí que hi són.</div><div class="pdflist">' + RES.map(([t, fs]) => `<h2>${esc(t)}</h2><div class="card">${fs.map(([f, d]) => `<div class="row resrow"><a href="${pdf(f)}" target="_blank" rel="noopener">📄 ${esc(d)}</a><span class="spacer"></span><span class="muted small">${esc(f)}</span></div>`).join('')}</div>`).join('') + '</div>';
  }

  /* ------------------------------------------------------------------
     Rutes
     ------------------------------------------------------------------ */
  const R = (re, fn) => Calc.routes.push({ re, fn });
  R(/^#\/p1\/?$/, hub);
  R(/^#\/mix/, mix);
  R(/^#\/p1\/exams\/?$/, examsPage);
  R(/^#\/p1\/exam\/(\w+)/, m => examPage(m[1]));
  R(/^#\/p1\/sim/, simPage);
  R(/^#\/p1\/temes/, temesPage);
  R(/^#\/p1\/guia/, guiaPage);
  R(/^#\/p1\/resolts/, resoltsPage);
  R(/^#\/p1\/teoria/, teoriaPage);
  R(/^#\/p1\/chuleta/, chuletaPage);
  R(/^#\/p1\/test/, (m, h) => testPage(h));
  R(/^#\/p1\/patrons/, patronsPage);
  R(/^#\/recursos/, recursosPage);

  /* Publicada a internet sense els PDFs (tenen drets d'autor i no es pugen a GitHub): s'amaguen els enllaços.
     En local (file://) es deixen sempre. */
  if (/^https?:/.test(location.protocol)) {
    const noPdf = () => { Calc.noPdf = true; document.body.classList.add('nopdf'); };
    try { fetch(pdf('primer-parcial-2026.pdf'), { method: 'HEAD', cache: 'no-store' }).then(r => { if (!r.ok) noPdf(); }, noPdf); } catch (e) { noPdf(); }
  }

  /* Peces reutilitzades per p2_ui.js */
  Calc.examKit = { el, ls, pdf, render, solToggle, prepMC, mcBlock, partTags };

  /* Targeta d'accés a l'inici */
  Calc.p1Banner = Calc.dashExtra = () => `<div class="card p1banner" style="margin-top:16px"><div class="row"><div><div class="muted" style="font-size:.8rem;text-transform:uppercase;letter-spacing:.08em">1r Parcial</div><h3 style="margin:2px 0">📘 Resum del 1r parcial</h3><div class="muted">Llistes 0–5 una per una, ${EXAMS.length} exàmens reals, simulacre i el que surt més.</div></div><span class="spacer"></span><a class="btn primary" href="#/p1">Obrir</a><a class="btn" href="#/p1/temes">📈 Què surt més</a></div></div>`;

  U.route();
})();
