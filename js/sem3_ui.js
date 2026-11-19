/* =====================================================================
   sem3_ui.js — l'apartat «⭐ Seminari 3» de CalcMaster
   · #/seminari                 pla (què fer avui), com és el seminari, tipus d'exercici amb mestria
   · #/seminari/ex/<tema>?d=n   exercici sencer tipus seminari (apartats amb correcció a l'instant)
   · #/seminari/lli[/<id>]      18 lliçons des de zero
   · #/seminari/hab[/<àrea>|/g/<id>]  les 36 habilitats (tipus d'exercici del mòdul sem3) per àrees
   · #/seminari/sim             simulacre: 4 exercicis, 50 minuts, compten els 3 millors
   · #/seminari/original        el full del seminari 2023-24 resolt i redactat
   El seminari NO té tipus d'exercici propis: les seves 36 habilitats són tipus d'exercici de les
   llistes (L1–L4, Fonaments), fusionades per merge.js. Per això la mestria és la mateixa a tot arreu.
   Mestria (tot del sistema de CalcMaster):
   · cada tipus d'exercici sencer és un «apartat» (store.markPart 'S3:<tema>'):
     per arribar a Dominat cal treure'l net diverses vegades en dies diferents;
   · cada apartat d'un exercici sencer suma a l'habilitat que entrena (store.record 'sem3.<id>').
   ===================================================================== */
(function () {
  'use strict';
  if (!window.CalcUI || !Calc.sem3) return;
  const U = CalcUI, { $, $$, esc, app, typeset, renderSide, mountPractice } = U;
  const K = Calc.sem3, S3 = K.S3, store = Calc.store, RANKS = Calc.RANKS;
  const TRY = [1, 0.7, 0.5, 0.35, 0.25], MAXW = { mcq: 2, order: 3 };
  const PDF = 'recursos/pdf/Seminari-3-mati-2023-2024.pdf';

  /* ---------------- els 6 tipus d'exercici del seminari ---------------- */
  const TOPICS = {
    chain: { icon: '⛓️', name: 'Regla de la cadena', ex: 'Exercici 1', desc: 'Derivar composicions de 2–5 capes, mostrant l\'ordre en què aplica la regla.', area: 'B' },
    limder: { icon: '🎯', name: 'Derivada via límit', ex: 'Exercici 2', desc: '$x^k\\sin(1/x)$: derivada fora de 0, límit de $f\'$ en 0 per acotació, derivabilitat.', area: 'C' },
    study: { icon: '📈', name: 'Estudi d\'una funció', ex: 'Exercici 3', desc: 'Zeros, punts crítics, creixement, extrems, inflexió, concavitat, límits i esbós.', area: 'F' },
    ratlim: { icon: '∞', name: 'Quocients a l\'infinit', ex: 'Exercici 4', desc: 'Límit de $P(x)/Q(x)$ quan $x\\to\\pm\\infty$ segons els graus.', area: 'G' },
    hopital: { icon: '🏥', name: 'Regla de l\'Hôpital', ex: 'Format d\'enguany', desc: '$\\frac00$, $\\frac\\infty\\infty$, $0\\cdot\\infty$, $\\infty-\\infty$, $1^\\infty$…', area: 'D' },
    extrem: { icon: '⛰️', name: 'Extrems relatius', ex: 'Format d\'enguany', desc: 'Punts crítics, monotonia, màxims i mínims (amb $e^x$, $\\ln x$…), criteri de la 2a derivada.', area: 'F' },
  };
  const TIDS = Object.keys(TOPICS);
  const AREAS = { A: 'Derivades', B: 'Regla de la cadena', C: 'Límits i acotació', D: 'Regla de l\'Hôpital', E: 'Equacions i signes', F: 'Extrems relatius', G: 'Quocients a l\'infinit' };
  const pkey = t => 'S3:' + t;
  const pill = r => `<span class="rk r${r}">${RANKS[r]}</span>`;
  // habilitat del seminari → tipus d'exercici de la llista on viu (una sola mestria)
  const gkey = skill => (Calc.SKILL_KEY || {})['sem3.' + String(skill).replace(/-/g, '_')] || null;
  const SK = () => (K.gens || []).map(g => ({ src: g, area: g.area, key: gkey(g.s3) })).filter(x => x.key && Calc.genByKey(x.key));
  /** Tipus d'exercici (de les llistes) que entrena el seminari, sense repetir; opcionalment d'una àrea. */
  const gensOf = area => { const seen = new Set(); return SK().filter(x => (!area || x.area === area) && !seen.has(x.key) && seen.add(x.key)).map(x => Calc.genByKey(x.key)); };
  const areaOfGen = key => { const x = SK().find(y => y.key === key); return x ? x.area : null; };
  const data = () => { const d = store.data(); d.s3 = d.s3 || { l: {}, orig: 0, sims: [] }; return d.s3; };

  /* =====================================================================
     Motor d'exercicis sencers (portat de l'antic entrenador, amb l'aspecte
     de CalcMaster): cada apartat es comprova a l'instant; la nota baixa amb
     els intents (100% · 70% · 50%…) i amb la pista (−25%).
     ===================================================================== */
  function mountEx(host, ex, opts) {
    opts = opts || {};
    const exam = opts.mode === 'exam';
    const st = ex.parts.map(() => ({ wrong: 0, hint: false, done: false, earned: 0, revealed: false, choice: null, order: [], sh: null }));
    let finished = false;
    host.innerHTML = `<article class="card s3x">
      <header class="row">${opts.head || ''}<span class="spacer"></span>${exam || !ex.parts.length ? '' : '<span class="s3score muted small"></span>'}</header>
      <div class="s3stmt">${ex.statement || ''}</div>
      <div class="s3parts"></div>
      <footer class="s3foot"></footer>
      ${ex.solution ? `<section class="s3sol" hidden><h3>Resolució completa</h3>${ex.solution}</section>` : ''}</article>`;
    const partsEl = $('.s3parts', host);
    ex.parts.forEach((p, i) => partsEl.appendChild(buildPart(p, i)));
    typeset(host);
    updateFoot();

    function partEl(i) { return $(`.s3part[data-i="${i}"]`, host); }
    function buildPart(part, i) {
      const el = document.createElement('div');
      el.className = 's3part'; el.dataset.i = i;
      const letter = String.fromCharCode(97 + i);
      let body;
      if (part.type === 'mcq') body = `<div class="s3opts">${part.options.map((o, j) => `<button type="button" class="s3opt" data-j="${j}">${o.tex ? '$' + o.tex + '$' : o.html}</button>`).join('')}</div>`;
      else if (part.type === 'order') {
        let sh; do { sh = part.items.map((_, k) => k).sort(() => Math.random() - 0.5); } while (part.items.length > 1 && sh.every((k, j) => k === j));
        st[i].sh = sh;
        body = '<div class="s3ord"><p class="muted small">Toca els passos en l\'ordre correcte (toca\'n un de dalt per treure\'l).</p><ol class="s3ordans"></ol><div class="s3ordpool"></div></div>';
      } else {
        const T = K.TYPES[part.type];
        body = `<div class="ansrow"><input class="ans" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="${esc(T.ph)}" aria-label="Resposta ${letter}"></div>
          <div class="kbd">${K.keysOf(part.type).map(([t, k]) => `<button type="button" data-k="${esc(k)}" tabindex="-1">${esc(t)}</button>`).join('')}</div>
          <div class="preview muted small">Vista prèvia de la teva resposta</div>`;
      }
      el.innerHTML = `<div class="s3ph"><b class="s3let">${letter})</b><div class="s3lab">${part.label}</div><span class="s3st"></span></div>${body}
        <div class="s3fb" aria-live="polite"></div>
        ${exam ? '' : `<div class="row s3act"><button type="button" class="btn primary sm chk">Comprova</button>${part.hint ? '<button type="button" class="btn sm hintb">💡 Pista <small>(−25%)</small></button>' : ''}<button type="button" class="btn ghost sm revb">Veure resposta <small>(0 punts)</small></button></div>`}
        <div class="hintbox" hidden>${part.hint || ''}</div>`;
      const inp = $('.ans', el);
      if (inp) {
        const T = K.TYPES[part.type], prev = $('.preview', el);
        const upd = () => {
          const v = inp.value.trim();
          if (!v) { prev.className = 'preview muted small'; prev.textContent = 'Vista prèvia de la teva resposta'; return; }
          try { const p = T.parse(v); prev.className = 'preview'; prev.innerHTML = window.katex ? katex.renderToString(T.prev(p), { throwOnError: false }) : esc(v); } catch (e) { prev.className = 'preview err small'; prev.textContent = '⚠ ' + e.message; }
        };
        inp.addEventListener('input', upd);
        inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !exam) { e.preventDefault(); check(i); } });
        $$('[data-k]', el).forEach(b => b.addEventListener('mousedown', e => {
          e.preventDefault(); if (st[i].done) return;
          const k = b.dataset.k, s = inp.selectionStart ?? inp.value.length, en = inp.selectionEnd ?? inp.value.length;
          if (k === 'cap' || k === 'no existeix') inp.value = k;
          else if (k === '()') { inp.value = inp.value.slice(0, s) + '()' + inp.value.slice(en); inp.setSelectionRange(s + 1, s + 1); }
          else { inp.value = inp.value.slice(0, s) + k + inp.value.slice(en); inp.setSelectionRange(s + k.length, s + k.length); }
          inp.focus(); upd();
        }));
      } else if (part.type === 'mcq') {
        $$('.s3opt', el).forEach(b => b.addEventListener('click', () => {
          if (st[i].done || b.disabled) return;
          st[i].choice = +b.dataset.j; $$('.s3opt', el).forEach(o => o.classList.toggle('sel', o === b));
        }));
      }
      if (part.type === 'order') setTimeout(() => renderOrd(i), 0);
      if (!exam) {
        $('.chk', el).onclick = () => check(i);
        const hb = $('.hintb', el);
        if (hb) hb.onclick = () => { if (st[i].done) return; st[i].hint = true; const hbx = $('.hintbox', el); hbx.hidden = false; hb.disabled = true; typeset(hbx); };
        $('.revb', el).onclick = () => reveal(i);
      }
      return el;
    }
    function renderOrd(i) {
      const el = partEl(i), part = ex.parts[i], s = st[i];
      $('.s3ordans', el).innerHTML = s.order.map(k => `<li><button type="button" class="s3ordit in" data-k="${k}">${part.items[k]}</button></li>`).join('');
      $('.s3ordpool', el).innerHTML = s.sh.filter(k => !s.order.includes(k)).map(k => `<button type="button" class="s3ordit" data-k="${k}">${part.items[k]}</button>`).join('');
      typeset(el);
      $$('.s3ordit', el).forEach(b => b.onclick = () => { if (s.done) return; const k = +b.dataset.k; if (b.classList.contains('in')) s.order = s.order.filter(x => x !== k); else s.order.push(k); renderOrd(i); });
    }
    function setFb(i, html, kind) { const fb = $('.s3fb', partEl(i)); fb.className = 's3fb fb ' + kind; fb.innerHTML = html; typeset(fb); }
    function lockPart(i, ok) {
      const el = partEl(i);
      el.classList.add(ok ? 'ok' : 'bad', 'done');
      $$('input, .s3opt, .chk, .hintb, .revb, [data-k], .s3ordit', el).forEach(x => { x.disabled = true; });
      $('.s3st', el).textContent = ok ? '✓' : '✗';
      if (ex.parts[i].type === 'mcq') $$('.s3opt', el).forEach((o, j) => { if (ex.parts[i].options[j].ok) o.classList.add('right'); });
    }
    function evaluate(i, silent) {
      const part = ex.parts[i], s = st[i];
      if (part.type === 'mcq') { if (s.choice == null) { if (!silent) setFb(i, 'Tria una opció primer.', 'info'); return null; } return part.options[s.choice].ok; }
      if (part.type === 'order') { if (s.order.length !== part.items.length) { if (!silent) setFb(i, 'Col·loca tots els passos abans de comprovar.', 'info'); return null; } return s.order.every((k, j) => k === j); }
      try { return K.check(part, $('.ans', partEl(i)).value); } catch (e) { if (!silent) setFb(i, '⚠ ' + esc(e.message) + ' <small>(no compta com a intent)</small>', 'info'); return null; }
    }
    // cada apartat compta per a l'habilitat de CalcMaster que entrena
    function rec(i, ok, kind) { const part = ex.parts[i]; const k = opts.record && part.skill ? gkey(part.skill) : null; if (k) { try { store.record(k, ok, { sub: 'sem3.' + String(part.skill).replace(/-/g, '_') }, kind); } catch (e) { /* res */ } } }
    function check(i) {
      const part = ex.parts[i], s = st[i];
      if (s.done || finished) return;
      const ok = evaluate(i); if (ok === null) return;
      if (ok) {
        const f = TRY[Math.min(s.wrong, TRY.length - 1)] * (s.hint ? 0.75 : 1);
        s.earned = f; s.done = true;
        const first = s.wrong === 0 && !s.hint;
        setFb(i, `${first ? '🎉 Perfecte, a la primera!' : '✓ Correcte!'} <b>+${Math.round(f * 100)}%</b> d'aquest apartat. <span class="small">Resposta: ${K.answerTeX(part)}</span>`, 'ok');
        lockPart(i, true); rec(i, true, first ? 'ok' : 'assist');
      } else {
        s.wrong++;
        if (s.wrong === 1) rec(i, false, 'fail');
        const max = MAXW[part.type];
        if (max && s.wrong >= max) { s.done = true; s.earned = 0; setFb(i, `✗ Incorrecte. Resposta correcta: ${K.answerTeX(part)}`, 'bad'); lockPart(i, false); }
        else {
          let extra = '';
          if (part.type === 'mcq') { const b = $(`.s3opt[data-j="${s.choice}"]`, partEl(i)); b.classList.add('wrong'); b.classList.remove('sel'); b.disabled = true; s.choice = null; extra = ' Només et queda un intent.'; }
          if (part.type === 'order') { let g = 0; while (g < s.order.length && s.order[g] === g) g++; extra = g === 1 ? ' El primer pas és correcte.' : g ? ` Els ${g} primers passos són correctes.` : ' El primer pas ja no és correcte.'; }
          setFb(i, `✗ Incorrecte.${extra} Torna-ho a provar (ara val com a màxim un ${Math.round(TRY[Math.min(s.wrong, TRY.length - 1)] * 100)}%).${s.wrong >= 2 && !s.hint && part.hint ? ' Potser t\'ajuda la <b>pista</b>.' : ''}`, 'bad');
        }
      }
      updateFoot();
      if (st.every(x => x.done)) finish();
    }
    function reveal(i) {
      const s = st[i]; if (s.done) return;
      s.done = true; s.revealed = true; s.earned = 0;
      setFb(i, `Resposta: ${K.answerTeX(ex.parts[i])}`, 'info'); lockPart(i, false);
      if (!s.wrong) rec(i, false, 'seen');
      updateFoot();
      if (st.every(x => x.done)) finish();
    }
    function nota() { return st.length ? Math.round(st.reduce((a, s) => a + s.earned, 0) / st.length * 100) / 10 : 10; }
    function updateFoot() {
      if (exam) return;
      const sc = $('.s3score', host); if (sc) sc.innerHTML = `${st.filter(s => s.done).length}/${st.length} apartats · <b>${nota().toFixed(1)}</b>/10`;
      if (finished) return;
      const foot = $('.s3foot', host);
      if (!ex.parts.length) { foot.innerHTML = '<button type="button" class="btn primary" data-a="read">✓ Ho he llegit i entès</button>'; $('[data-a=read]', foot).onclick = finish; return; }
      foot.innerHTML = `<button type="button" class="btn ghost" data-a="giveup">Rendir-me i veure ${ex.solution ? 'la resolució' : 'les respostes'}</button>`;
      $('[data-a=giveup]', foot).onclick = () => { if (!confirm('Els apartats que no hagis resolt valdran 0 punts. Continuar?')) return; st.forEach((s, i) => { if (!s.done) reveal(i); }); };
    }
    function finish() {
      if (finished) return;
      finished = true;
      const n = nota(), clean = st.every(s => !s.hint && !s.revealed);
      const res = opts.onDone ? opts.onDone({ nota: n, clean }) || {} : {};
      const msg = !ex.parts.length ? 'Lliçó completada.' : n === 10 ? 'Impecable.' : n >= 8.5 ? 'Molt bé! Gairebé perfecte.' : n >= 6 ? 'Bé, però repassa els apartats fallats.' : 'Rellegeix la resolució amb calma i torna-ho a provar.';
      const foot = $('.s3foot', host);
      foot.innerHTML = `<div class="s3res"><div class="s3grade g${n >= 9 ? 'a' : n >= 7 ? 'b' : n >= 5 ? 'c' : 'd'}">${n.toFixed(1)}</div>
        <div><b>${opts.gradeLabel || 'Nota de l\'exercici'}</b><br>${msg}${res.html || ''}</div><span class="spacer"></span>
        <div class="row">${ex.solution ? '<button type="button" class="btn" data-a="sol">📖 Resolució completa</button>' : ''}${opts.retry ? '<button type="button" class="btn" data-a="retry">↻ Un altre</button>' : ''}${opts.onNext ? `<button type="button" class="btn primary" data-a="next">${opts.nextLabel || 'Següent →'}</button>` : ''}</div></div>`;
      typeset(foot);
      const sol = $('.s3sol', host);
      if (sol) { $('[data-a=sol]', foot).onclick = () => { sol.hidden = !sol.hidden; if (!sol.hidden) { typeset(sol); sol.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }; if (n < 10) { sol.hidden = false; typeset(sol); } }
      if (opts.retry) $('[data-a=retry]', foot).onclick = opts.retry;
      if (opts.onNext) $('[data-a=next]', foot).onclick = opts.onNext;
    }
    function grade() {
      ex.parts.forEach((part, i) => { const s = st[i]; const ok = evaluate(i, true) === true; s.done = true; s.earned = ok ? 1 : 0; setFb(i, ok ? `✓ Correcte. ${K.answerTeX(part)}` : `✗ Resposta correcta: ${K.answerTeX(part)}`, ok ? 'ok' : 'bad'); lockPart(i, ok); rec(i, ok, ok ? 'ok' : 'fail'); });
      finished = true;
      const sol = $('.s3sol', host); if (sol) { sol.hidden = false; typeset(sol); }
      return nota();
    }
    return { grade, nota };
  }
  Calc.sem3Ex = mountEx;

  /* ---------------- mestria dels exercicis sencers ---------------- */
  // net (sense pistes ni respostes vistes) i ≥ 8,5 → resolució neta; ≥ 5 → a mitges; menys → malament
  const vOf = (n, clean) => (n >= 8.5 && clean ? 2 : n >= 5 ? 1 : 0);
  function markTopic(t, n, clean) {
    const r = store.markPart(pkey(t), vOf(n, clean));
    const up = r.to > r.from ? ` · <b>${RANKS[r.from]} → ${RANKS[r.to]}</b>` : '';
    return { html: `<div class="small" style="margin-top:4px">${pill(r.to)} ${vOf(n, clean) === 2 ? 'Resolució neta ✓' : vOf(n, clean) === 1 ? 'A mitges (no puja el rang)' : 'Malament (resta)'}${up}${r.xp ? ` · +${r.xp} XP` : ''}</div>` };
  }
  const topicInfo = t => { const x = store.part(pkey(t)); return { r: x ? x.best : 0, n: x ? x.n : 0, due: store.partDue(pkey(t)), x }; };

  /* ---------------- capçalera i pestanyes de l'apartat ---------------- */
  const TABS = [['', '🗺️ Pla'], ['rap', '⚡ Ràpids'], ['intu', '🧭 Intuïció'], ['teoria', '📖 Teoria'], ['ex', '✍️ Exercicis'], ['lli', '🎓 Lliçons'], ['hab', '⚡ Habilitats'], ['sim', '⏱️ Simulacre'], ['original', '📄 Seminari resolt']];
  function shell(active, inner) {
    renderSide('seminari');
    const ss = Calc.semStats();
    app.innerHTML = `<div class="crumbs small muted"><a href="#/">Inici</a> › <a href="#/temari">Temari</a> › Seminaris › Seminari 3</div>
      <div class="row" style="align-items:baseline"><h1 style="margin:0">📝 Seminari 3</h1><span class="chip">1r parcial · Bloc 1 (L1–L4)</span><span class="spacer"></span><span class="muted small">${Math.round(ss.pct * 100)}% de domini · ${ss.dom}/${ss.n} habilitats dominades</span></div>
      <p class="muted small" style="margin:6px 0 0">Els seminaris compten un 20% de la nota final. Aquest no té exercicis propis: entrena les habilitats de les llistes L1–L4 (la mateixa mestria que allà) en el format del seminari.</p>
      <div class="tabs s3tabs">${TABS.map(([id, t]) => `<a href="#/seminari${id ? '/' + id : ''}" class="${active === id ? 'active' : ''}">${t}</a>`).join('')}</div>
      <div id="s3body">${inner || ''}</div>`;
    return $('#s3body');
  }

  /* ---------------- #/seminari: pla ---------------- */
  function planPage() {
    const d = data(), gs = gensOf();
    const gst = gs.map(g => ({ g, r: store.rank(g.key), acc: store.genAccuracy ? store.genAccuracy(g.key) : null }));
    const triedTypes = TIDS.filter(t => topicInfo(t).n > 0).length;
    const weak = gst.filter(x => x.acc != null && x.acc < 0.6).length;
    const today = Calc.dayStr();
    const simToday = (store.data().exams || []).some(e => /Seminari 3/.test(e.fmt || '') && Calc.dayStr(new Date(e.t)) === today);
    const lessonsDone = Object.keys(d.l).length;
    const steps = [
      [d.orig > 0, '📄', 'Llegeix el seminari de l\'any passat resolt', 'Com s\'han d\'escriure les respostes: cada pas justificat. 15 min.', '#/seminari/original', 'Llegir'],
      [triedTypes >= 4, '✍️', 'Un exercici sencer de cada tipus', `${triedTypes}/6 tipus fets. Comença per Mitjà; si et costa, Fàcil.`, '#/seminari/ex', 'Exercicis'],
      [gst.some(x => x.r > 0) && !weak, '⚡', 'Reforça les habilitats on falles', weak ? `${weak} habilitats per sota del 60% d'encert.` : 'Sessions curtes de 8–10 preguntes, per àrees.', '#/seminari/hab', 'Habilitats'],
      [simToday, '⏱️', 'Simulacre de 50 minuts', 'Sense pistes ni correcció fins al final. Compten els 3 millors de 4.', '#/seminari/sim', 'Simulacre'],
      [false, '🧾', 'Abans del seminari: la teoria en 10 minuts', 'Les 4 regles (cadena, acotació, signes de f\', graus) i els errors típics.', '#/seminari/teoria', 'Teoria'],
    ];
    const body = shell('', `
      <a class="card s3rapcta" href="#/seminari/rap"><b>⚡ Poc temps? Fes «Ràpids»</b><span class="muted small"> — preguntes curtes, una per cada pas dels 4 exercicis del seminari (cadena, x^k·sin(1/x), cúbica, P/Q). Números nous cada vegada.</span></a>
      <a class="card s3rapcta" href="#/estudi"><b>📐 Exercici 3 = estudi de funció: xuleta i conceptes</b><span class="muted small"> — màxim/mínim relatiu, convexa/còncava, inflexió, què cal escriure, i l'estudi complet per apartats com al parcial.</span></a>
      <a class="card s3rapcta" href="#/seminari/intu"><b>🧭 No ho saps fer? Aprèn a endevinar amb criteri</b><span class="muted small"> — regles de cop d'ull per saber com ha de ser la resposta abans de fer el càlcul, i què escriure a l'examen quan t'encalles.</span></a>
      <div class="card next-card"><div class="row"><div><div class="muted small" style="text-transform:uppercase;letter-spacing:.08em">Preparar el seminari</div>
        <h2 style="margin:2px 0">Pla en 5 passos</h2><div class="muted small">Fes-ho en ordre. El que fas aquí puja el rang de les mateixes habilitats de L1–L4 (i al revés).</div></div></div>
        <ol class="s3plan">${steps.map(([ok, ic, t, why, href, b]) => `<li class="${ok ? 'done' : ''}"><span class="s3chk">${ok ? '✓' : ic}</span><div><b>${t}</b><div class="muted small">${why}</div></div><span class="spacer"></span><a class="btn sm ${ok ? '' : 'primary'}" href="${href}">${b}</a></li>`).join('')}</ol></div>
      <div class="grid cols2" style="margin-top:14px">
        <div class="card"><h3 style="margin-top:0">Com és el seminari</h3><ul class="small">
          <li><b>50 minuts</b>, en grup de 2–3 persones (només podeu parlar entre vosaltres).</li>
          <li>Hi ha <b>4 exercicis i n'heu de resoldre 3</b>.</li>
          <li>Només <b>boli, calculadora científica elemental i els apunts de classe</b>.</li>
          <li>S'entrega el full d'enunciats amb nom, cognoms i NIU de tots, grapat amb les resolucions.</li>
          <li>Es valora <b>el procediment</b>: «no simplifiqueu, mostreu que sabeu aplicar la regla en l'ordre que toca».</li></ul></div>
        <div class="card"><h3 style="margin-top:0">Què hi pot sortir</h3><p class="small"><b>Full 2023-24</b> (el que tens resolt): 1. regla de la cadena · 2. derivada via límit ($x^3\\sin(1/x)$) · 3. estudi de $x^3-x$ · 4. límit de quocients de polinomis a l'infinit.</p>
          <p class="small"><b>Format que preveia l'entrenador</b>: cadena, derivada via límit, extrems relatius (o estudi) i L'Hôpital.</p>
          <p class="small muted">No sabem l'enunciat exacte d'enguany: per això s'entrenen els 6 tipus.</p>
          <p class="small"><a href="#/seminari/sim">⏱️ Fes un simulacre amb qualsevol dels dos formats</a></p></div></div>
      <h2>Tipus d'exercici del seminari</h2><p class="muted small">Rang de cada tipus: per pujar cal treure'l <b>net</b> (≥ 8,5 sense pistes) en dies diferents, com els apartats d'examen.</p>
      <div class="grid cols3">${TIDS.map(topicCard).join('')}</div>
      <div class="grid cols3" style="margin-top:14px">
        <a class="card s3link" href="#/seminari/lli"><b>🎓 Lliçons</b><div class="muted small">${lessonsDone}/${S3.LESSONS.list.length} fetes · des de zero, amb comprovacions</div></a>
        <a class="card s3link" href="#/seminari/hab"><b>⚡ Habilitats</b><div class="muted small">${gst.filter(x => x.r >= 5).length}/${gs.length} dominades · ${gst.filter(x => x.r > 0).length} començades</div></a>
        <a class="card s3link" href="#/seminari/sim"><b>⏱️ Simulacre</b><div class="muted small">${(d.sims || []).length ? 'Última nota: ' + d.sims[d.sims.length - 1].nota.toFixed(1) : 'Encara cap'}</div></a></div>`);
    typeset(body);
  }
  function topicCard(t) {
    const T = TOPICS[t], ti = topicInfo(t);
    return `<div class="card s3topic"><div class="row"><span class="s3ico">${T.icon}</span><div><b>${T.name}</b><div class="muted small">${T.ex}</div></div><span class="spacer"></span>${pill(ti.r)}</div>
      <p class="small">${T.desc}</p><div class="muted small">${ti.n ? ti.n + ' dies practicat' + (ti.due ? ' · 🧠 toca repàs' : '') : 'Encara no l\'has fet'}</div>
      <div class="row" style="margin-top:8px">${[1, 2, 3].map(d => `<a class="btn sm ${d === 2 ? 'primary' : ''}" href="#/seminari/ex/${t}?d=${d}">${['Fàcil', 'Mitjà', 'Difícil'][d - 1]}</a>`).join('')}</div></div>`;
  }

  /* ---------------- #/seminari/ex ---------------- */
  function exList() { const body = shell('ex', `<p class="lead">Exercicis sencers com els del seminari, generats a l'atzar. Cada apartat es comprova a l'instant; al final tens la resolució completa redactada.</p><div class="grid cols3">${TIDS.map(topicCard).join('')}</div>`); typeset(body); }
  function exPage(t, diff) {
    if (!TOPICS[t]) return exList();
    const T = TOPICS[t], ti = topicInfo(t);
    const body = shell('ex', `<div class="row small" style="margin-bottom:8px"><a href="#/seminari/ex">← Tots els tipus</a><span class="spacer"></span>${['Fàcil', 'Mitjà', 'Difícil'].map((n, k) => `<a class="chip ${diff === k + 1 ? 'accent' : ''}" href="#/seminari/ex/${t}?d=${k + 1}">${n}</a>`).join('')}</div><div id="s3ex"></div>`);
    const ex = S3.G.generate(t, diff);
    mountEx($('#s3ex', body), ex, {
      record: true,
      head: `<span class="chip accent">${T.icon} ${T.name}</span><span class="chip">${['Fàcil', 'Mitjà', 'Difícil'][diff - 1]}</span>${pill(ti.r)}`,
      onDone: ({ nota, clean }) => { const r = markTopic(t, nota, clean); d3sav(); return r; },
      retry: () => exPage(t, diff), onNext: () => { location.hash = '#/seminari/ex/' + TIDS[(TIDS.indexOf(t) + 1) % TIDS.length] + '?d=' + diff; }, nextLabel: 'Següent tipus →',
    });
  }
  const d3sav = () => { try { store.save(); } catch (e) { /* res */ } U.renderTop && U.renderTop(); };

  /* ---------------- #/seminari/lli ---------------- */
  function lessonsPage() {
    const d = data(), L = S3.LESSONS.list, blocks = [];
    L.forEach(l => { if (!blocks.includes(l.block)) blocks.push(l.block); });
    const body = shell('lli', `<p class="lead">Des de zero: cada lliçó explica una idea i la comprova amb preguntes curtes. Si vas just de temps, prioritza les marcades amb ⭐.</p>
      ${blocks.map(b => `<h2>${esc(b)}</h2><div class="grid cols2">${L.filter(l => l.block === b).map(l => { const n = d.l[l.id]; const star = /cadena|acotada|punt amb un límit|taula de signes|terme dominant|Hôpital|criteris|original/i.test(l.title); return `<a class="card s3link" href="#/seminari/lli/${l.id}"><div class="row"><b>${star ? '⭐ ' : ''}${l.title}</b><span class="spacer"></span>${n != null ? `<span class="chip ${n >= 7 ? 'ok' : ''}">✓ ${n.toFixed(1)}</span>` : ''}</div></a>`; }).join('')}</div>`).join('')}`);
    typeset(body);
  }
  function lessonPage(id) {
    const L = S3.LESSONS.list, k = L.findIndex(l => l.id === id); if (k < 0) return lessonsPage();
    const les = L[k], next = L[k + 1];
    const body = shell('lli', `<div class="row small" style="margin-bottom:8px"><a href="#/seminari/lli">← Totes les lliçons</a><span class="spacer"></span><span class="muted">${k + 1}/${L.length} · ${esc(les.block)}</span></div><div id="s3ex"></div>`);
    mountEx($('#s3ex', body), { statement: `<h2 style="margin-top:0">${les.title}</h2><div class="theory">${les.body}</div>`, parts: les.parts }, {
      gradeLabel: 'Nota de la lliçó',
      onDone: ({ nota }) => { const d = data(), first = d.l[les.id] == null; d.l[les.id] = Math.max(d.l[les.id] || 0, nota); let xp = 0; if (first && nota >= 7) { xp = 20; store.addXp(xp); } d3sav(); return { html: xp ? `<br><span class="small">+${xp} XP</span>` : '' }; },
      retry: () => lessonPage(id), onNext: next ? () => { location.hash = '#/seminari/lli/' + next.id; } : () => { location.hash = '#/seminari/ex'; }, nextLabel: next ? 'Següent lliçó →' : 'Anar als exercicis →',
    });
  }

  /* ---------------- #/seminari/hab ---------------- */
  function habPage(area, gid) {
    if (gid) {
      const g = Calc.genByKey(gid); if (!g) return habPage();
      const m = Calc.byId[g.mod];
      const body = shell('hab', `<div class="row small"><a href="#/seminari/hab">← Totes les habilitats</a><span class="spacer"></span><a href="#/mod/${g.mod}/resum">És de ${esc(m.llista)}</a></div><h2>${g.title}</h2>${g.about ? `<div class="box formula small">${g.about}</div>` : ''}<div id="s3pr"></div>`);
      typeset(body); mountPractice($('#s3pr', body), { gens: [g], activeId: 'seminari' }); return;
    }
    if (area && AREAS[area]) {
      const gs = gensOf(area);
      const body = shell('hab', `<div class="row small"><a href="#/seminari/hab">← Totes les àrees</a></div><h2>${esc(AREAS[area])}</h2><p class="muted small">Pràctica barrejada de les ${gs.length} habilitats d'aquesta àrea. La dificultat puja sola amb el rang de cada habilitat.</p><div id="s3pr"></div>`);
      typeset(body); mountPractice($('#s3pr', body), { gens: gs, activeId: 'seminari' }); return;
    }
    const rows = Object.keys(AREAS).map(a => {
      const gs = gensOf(a);
      return `<div class="card"><div class="row"><h3 style="margin:0">${esc(AREAS[a])}</h3><span class="spacer"></span><a class="btn sm primary" href="#/seminari/hab/${a}">▶ Practica l'àrea</a></div>
        <div class="s3skills">${gs.map(g => { const r = store.rank(g.key), acc = store.genAccuracy ? store.genAccuracy(g.key) : null; return `<a class="s3sk" href="#/seminari/hab/g/${g.key}"><span>${g.title} <span class="chip">${esc(Calc.byId[g.mod].llista.replace(' + Seminari', ''))}</span></span><span class="spacer"></span>${acc != null ? `<span class="small ${acc < 0.6 ? 'bad' : 'muted'}">${Math.round(acc * 100)}%</span>` : ''}${pill(r)}</a>`; }).join('')}</div></div>`;
    }).join('');
    const body = shell('hab', `<p class="lead">Les peces que hi ha dins dels exercicis del seminari, agrupades per àrees. Cada una és un tipus d'exercici <b>de la seva llista</b> (L1–L4 o Fonaments): el rang és el mateix aquí, a la llista, al repàs del dia i als jocs.</p><div class="card"><b>🌳 En forma d'arbre</b> (què cal saber abans de què, i què domines): <a href="#/arbre/der">📐 Derivades i cadena</a> · <a href="#/arbre/lim">🎯 Límits i L'Hôpital (0/0, ∞/∞, 1^∞…)</a> · <a href="#/arbre/ext">⛰️ Extrems</a></div><div class="grid cols2">${rows}</div>`);
    typeset(body);
  }

  /* ---------------- #/seminari/sim ---------------- */
  const FORMATS = {
    nou: { name: 'Format previst per enguany', topics: () => ['chain', 'limder', Math.random() < 0.6 ? 'extrem' : 'study', 'hopital'] },
    orig: { name: 'Format del full 2023-24', topics: () => ['chain', 'limder', 'study', 'ratlim'] },
  };
  let simTimer = null;
  function simPage(fmt) {
    if (simTimer) { clearInterval(simTimer); simTimer = null; }
    const d = data();
    if (!fmt || !FORMATS[fmt]) {
      const body = shell('sim', `<div class="card"><h2 style="margin-top:0">⏱️ Simulacre del seminari</h2><ul>
        <li><b>50 minuts</b>, <b>4 exercicis</b> de nivell difícil. Com al seminari, <b>compten els 3 millors</b>.</li>
        <li><b>No hi ha correcció ni pistes fins que entreguis.</b> Fes-lo amb paper al costat, com al seminari de veritat.</li>
        <li>En entregar: nota de cada exercici, resolucions completes, i cada tipus d'exercici puja (o no) de rang.</li></ul>
        <div class="row">${Object.entries(FORMATS).map(([k, f], i) => `<a class="btn ${i ? '' : 'primary'}" href="#/seminari/sim/${k}">▶ ${f.name}</a>`).join('')}</div></div>
        ${d.sims.length ? `<h3>Últims simulacres</h3><div class="tablewrap card"><table class="tbl"><tr><th>Data</th><th>Format</th><th>Nota</th><th>Temps</th></tr>${d.sims.slice(-8).reverse().map(s => `<tr><td>${new Date(s.t).toLocaleString('ca')}</td><td>${esc(FORMATS[s.fmt] ? FORMATS[s.fmt].name : s.fmt)}</td><td><b>${s.nota.toFixed(1)}</b></td><td>${s.mins} min</td></tr>`).join('')}</table></div>` : ''}`);
      typeset(body); return;
    }
    const topics = FORMATS[fmt].topics(), exs = topics.map(t => S3.G.generate(t, 3)), t0 = Date.now(), ends = t0 + 50 * 60e3;
    const body = shell('sim', `<div class="card s3bar row"><b>${FORMATS[fmt].name}</b><span class="spacer"></span><span class="s3timer" id="s3t">50:00</span><button type="button" class="btn primary" id="s3end">Entregar</button></div>
      ${exs.map((_, i) => `<h2>Exercici ${i + 1} · ${TOPICS[topics[i]].name}</h2><div id="s3e${i}"></div>`).join('')}
      <div class="row" style="margin:16px 0"><span class="spacer"></span><button type="button" class="btn primary" id="s3end2">Entregar el simulacre</button></div><div id="s3res"></div>`);
    const ctl = exs.map((ex, i) => mountEx($('#s3e' + i, body), ex, { mode: 'exam', record: true, head: `<span class="chip">${TOPICS[topics[i]].icon} ${TOPICS[topics[i]].name}</span>` }));
    let done = false;
    const tick = () => { const left = Math.max(0, ends - Date.now()), m = Math.floor(left / 60e3), s = Math.floor(left % 60e3 / 1e3), el = $('#s3t'); if (!el) { clearInterval(simTimer); return; } el.textContent = `${m}:${String(s).padStart(2, '0')}`; el.classList.toggle('low', left < 5 * 60e3); if (!left) end(true); };
    simTimer = setInterval(tick, 1000); tick();
    U.setCleanup(() => { if (simTimer) clearInterval(simTimer); simTimer = null; });
    function end(auto) {
      if (done) return;
      if (!auto && !confirm('Entregar el simulacre? Es corregeix tot i ja no podràs canviar res.')) return;
      done = true; clearInterval(simTimer); simTimer = null;
      const notes = ctl.map(c => c.grade()), best3 = notes.slice().sort((a, b) => b - a).slice(0, 3), nota = Math.round(best3.reduce((a, b) => a + b, 0) / 3 * 10) / 10;
      const mins = Math.round((Date.now() - t0) / 60e3);
      const marks = topics.map((t, i) => markTopic(t, notes[i], true));
      d.sims.push({ t: Date.now(), fmt, nota, notes, mins }); if (d.sims.length > 30) d.sims.shift();
      store.addExam({ t: Date.now(), mark: nota, n: 4, fmt: 'Seminari 3 (' + FORMATS[fmt].name + ')', mins });
      d3sav();
      $('#s3t').textContent = 'Entregat'; $('#s3end').disabled = true; $('#s3end2').disabled = true;
      const res = $('#s3res');
      res.innerHTML = `<div class="card next-card"><h2 style="margin-top:0">Nota del simulacre: ${nota.toFixed(1)} / 10</h2><p class="muted small">Mitjana dels 3 millors exercicis de 4 · ${mins} min.</p>
        <div class="tablewrap"><table class="tbl"><tr><th>Exercici</th><th>Nota</th><th>Compta</th><th>Rang del tipus</th></tr>${topics.map((t, i) => `<tr><td>${i + 1}. ${TOPICS[t].name}</td><td><b>${notes[i].toFixed(1)}</b></td><td>${best3.includes(notes[i]) ? '✓' : '—'}</td><td>${marks[i].html}</td></tr>`).join('')}</table></div>
        <p class="small">Les resolucions completes són sota cada exercici. Revisa sobretot els apartats en vermell i torna a fer aquell tipus a <a href="#/seminari/ex">Exercicis</a>.</p></div>`;
      typeset(res); res.scrollIntoView({ behavior: 'smooth' });
    }
    $('#s3end').onclick = () => end(false); $('#s3end2').onclick = () => end(false);
  }

  /* ---------------- #/seminari/rap: exercicis ràpids (estil CalcMaster) ---------------- */
  function rapPage(only) {
    const R = (K.rapid || []).filter(g => Calc.srcGen(g.key));
    const sel = only ? R.filter(g => g.id === only || 'e' + g.ex === only) : R;
    const rk = g => { const x = Calc.srcData(g.key); return x ? x.best || 0 : 0; };
    const att = g => { const x = Calc.srcData(g.key); return x ? x.att || 0 : 0; };
    const rows = [1, 2, 3, 4].map(e => `<div class="card"><div class="row"><b>${esc(K.RAPID_EX[e])}</b><span class="spacer"></span><a class="btn sm" href="#/seminari/rap/e${e}">Practica l'exercici ${e}</a></div>
      ${R.filter(g => g.ex === e).map(g => { const t = Calc.srcGen(g.key); return `<a class="s3sk" href="#/seminari/rap/${g.id}"><span>${esc(g.title)} <span class="chip">${esc(Calc.byId[t.mod].llista.replace(' + Seminari', ''))}</span></span><span class="spacer"></span><span class="small muted">${att(g)} fets</span>${pill(rk(g))}</a>`; }).join('')}</div>`).join('');
    const body = shell('rap', `<p class="lead">Preguntes curtes que són <b>els passos dels 4 exercicis del seminari</b>: amb números nous cada vegada, resposta escrita i correcció a l'instant. Cada una compta per al tipus d'exercici de la seva llista (mateix rang que allà).</p>
      ${only ? `<div class="row small"><a href="#/seminari/rap">← Tots els ràpids</a><span class="spacer"></span><b>${esc(sel.length === 1 ? sel[0].title : K.RAPID_EX[only.slice(1)] || '')}</b></div>` : `<div class="row"><a class="btn primary" href="#/seminari/rap/tot">▶ Sessió ràpida: els 4 exercicis barrejats</a><span class="muted small">Recomanat: 10–15 preguntes. Si una falla, mira la solució i fes-ne una altra del mateix tipus.</span></div>`}
      <div id="s3rp"></div>${only ? '' : `<div class="grid cols2" style="margin-top:12px">${rows}</div>`}`);
    void body;
    if (!only) return;
    const pool = only === 'tot' ? R : sel;
    if (!pool.length) return;
    const gens = []; pool.forEach(g => { const t = Calc.srcGen(g.key); if (!gens.includes(t)) gens.push(t); });
    U.mountPractice($('#s3rp'), { gens, seedFor: t => { const ss = pool.filter(g => Calc.srcGen(g.key) === t); return Calc.seedFor(t, ss[Math.floor(Math.random() * ss.length)].key); } });
  }

  /* ---------------- #/seminari/intu: endevinar amb criteri ---------------- */
  // Regles de cop d'ull per exercici (les dels generadors 🧭 + altres comprovacions útils)
  const EXTRA = {
    1: ['Comprova en un punt: calcula f(x) en x=1 i x=1,01 amb la calculadora; (f(1,01)−f(1))/0,01 ha de donar aproximadament el teu f\'(1).',
        'La capa de fora es deriva <b>deixant el de dins igual</b>: (sin(x²))\' comença amb cos(x²), mai amb cos(x).'],
    2: ['Per a x^k·sin(1/x): k=0 no contínua · k=1 contínua però no derivable · k=2 derivable però f\' no contínua · k≥3 de classe C¹.',
        'f\'(0) es calcula <b>per definició</b> (lim de (f(h)−f(0))/h), no posant x=0 a la fórmula de f\'(x).'],
    3: ['Un polinomi de grau senar no té màxim ni mínim absoluts a ℝ (va a ±∞ pels dos costats).',
        'Els zeros de f\' només són candidats: si f\' no canvia de signe, no és extrem.',
        'En un interval tancat [a,b], el màxim absolut és el més gran entre f(a), f(b) i f als crítics de dins.'],
    4: ['Si surt un número "rar" en un límit de P/Q a l\'infinit, mira els graus: només pot ser 0, aₙ/bₘ o ±∞.',
        'Signe a −∞: x^(n−m) canvia de signe si n−m és senar.'],
  };
  function intuPage(only) {
    const I = (K.intuit || []).filter(g => Calc.srcGen(g.key));
    const sel = only ? I.filter(g => g.id === only || 'e' + g.ex === only) : I;
    const rk = g => { const x = Calc.srcData(g.key); return x ? x.best || 0 : 0; };
    const att = g => { const x = Calc.srcData(g.key); return x ? x.att || 0 : 0; };
    const sheet = [1, 2, 3, 4].map(e => `<div class="card"><div class="row"><b>${esc(K.RAPID_EX[e])}</b><span class="spacer"></span>${I.some(g => g.ex === e) ? `<a class="btn sm" href="#/seminari/intu/e${e}">Practica</a>` : ''}</div>
      <ul class="small s3rules">${I.filter(g => g.ex === e).map(g => `<li><a href="#/seminari/intu/${g.id}"><b>${esc(g.title)}</b></a> ${pill(rk(g))} <span class="muted">(${att(g)} fets)</span><div>🧭 ${esc(g.rule)}</div></li>`).join('')}
      ${(EXTRA[e] || []).map(t => `<li><div>✔︎ ${t}</div></li>`).join('')}</ul></div>`).join('');
    shell('intu', `<p class="lead">Quan no saps fer un exercici sencer, no cal deixar-lo en blanc ni respondre a l'atzar. Moltes vegades pots saber <b>com ha de ser la resposta</b> (quants factors té, quin signe, si és 0 o ∞, on és més o menys) amb una regla de cop d'ull. Aquí les entrenes.</p>
      ${only ? `<div class="row small"><a href="#/seminari/intu">← Totes les regles</a><span class="spacer"></span><b>${esc(sel.length === 1 ? sel[0].title : K.RAPID_EX[only.slice(1)] || '')}</b></div><div id="s3ip"></div>` : `
      <div class="card"><h3 style="margin-top:0">El mètode en 3 passos (per a qualsevol exercici)</h3><ol class="small">
        <li><b>Reconeix el tipus.</b> «És una composició», «és 0·acotada», «és P/Q a l'infinit», «és 1^∞». El tipus ja et diu la forma de la resposta.</li>
        <li><b>Aplica la regla de cop d'ull</b> (les de sota) per tenir una resposta aproximada o almenys la forma.</li>
        <li><b>Comprova si és plausible:</b> signe, grau, un valor amb la calculadora. Si la teva resposta contradiu la regla, segurament t'has equivocat en un pas.</li></ol>
        <div class="small muted">A l'examen: si t'encalles, <b>escriu la regla i l'estructura</b> («per la regla de la cadena, f\'=cos(…)·…», «és zero per acotada perquè |sin|≤1»). Sovint és la meitat dels punts.</div></div>
      <div class="row" style="margin:12px 0"><a class="btn primary" href="#/seminari/intu/tot">▶ Sessió d'intuïció: tot barrejat</a><span class="muted small">Preguntes ràpides de triar; la regla surt a la pista (💡) i a la solució.</span></div>
      <div class="grid cols2">${sheet}</div>`}`);
    if (!only) return;
    const pool = only === 'tot' ? I : sel;
    if (!pool.length) return;
    const gens = []; pool.forEach(g => { const t = Calc.srcGen(g.key); if (!gens.includes(t)) gens.push(t); });
    U.mountPractice($('#s3ip'), { gens, seedFor: t => { const ss = pool.filter(g => Calc.srcGen(g.key) === t); return Calc.seedFor(t, ss[Math.floor(Math.random() * ss.length)].key); } });
  }

  // Des de qualsevol pràctica: si aquest tipus d'exercici té una regla de cop d'ull, enllaça-la
  Calc.intuHtml = key => {
    const g = (K.intuit || []).find(x => { const t = Calc.srcGen(x.key); return t && (t.key === key || x.key === key); });
    return g ? `<div class="small" style="margin-top:6px">🧭 <b>Per endevinar amb criteri:</b> ${esc(g.rule)} <a href="#/seminari/intu/${g.id}">Entrena-ho →</a></div>` : '';
  };

  /* ---------------- #/seminari/teoria ---------------- */
  function theoryPage() {
    const secs = String(K.theory || '').split(/<h3>/i).slice(1).map(x => { const k = x.indexOf('</h3>'); return [x.slice(0, k), x.slice(k + 5)]; });
    const body = shell('teoria', `<p class="lead">El que cal saber per al seminari. Cada part enllaça amb la llista on s'entrena.</p>
      ${secs.map(([t, h], i) => `<details class="card theory" ${i < 4 ? 'open' : ''}><summary><b>${t}</b></summary>${h}</details>`).join('')}
      <div class="card"><b>On s'entrena cada cosa:</b> <a href="#/mod/l2/resum">L2 · derivades i cadena</a> · <a href="#/mod/l1/resum">L1 · límits</a> · <a href="#/mod/l3/resum">L3 · extrems</a> · <a href="#/mod/l4/resum">L4 · L'Hôpital i estudi</a></div>`);
    typeset(body);
  }

  /* ---------------- #/seminari/original ---------------- */
  function origPage() {
    const d = data();
    const body = shell('original', `<div class="row"><p class="lead" style="margin:0">El full del <b>Tercer seminari 2023-24</b>, resolt i redactat com s'hauria d'entregar.</p><span class="spacer"></span><a class="btn sm" href="${PDF}" target="_blank" rel="noopener">📄 Enunciat original (PDF)</a></div>
      <div class="card theory s3orig">${S3.LESSONS.ORIGINAL}</div>
      <div class="row" style="margin:12px 0"><button type="button" class="btn ${d.orig ? '' : 'primary'}" id="s3read">${d.orig ? '✓ Ja l\'has llegit' : '✓ Llegit i entès'}</button><span class="spacer"></span><a class="btn" href="#/seminari/ex">Ara fes-ne de nous →</a></div>`);
    typeset(body);
    $('#s3read').onclick = () => { if (!d.orig) { d.orig = Date.now(); store.addXp(10); d3sav(); } location.hash = '#/seminari'; };
  }

  /* ---------------- al resum de L1–L4: enllaç a les habilitats del seminari ---------------- */
  const MOD_AREAS = { l1: ['C', 'G'], l2: ['A', 'B'], l3: ['F', 'E'], l4: ['D', 'G'] };
  Calc.appsResum = function (mid) {
    const as = MOD_AREAS[mid]; if (!as) return '';
    const gs = gensOf().filter(g => g.mod === mid); if (!gs.length) return '';
    const dom = gs.filter(g => store.rank(g.key) >= 5).length;
    return `<div class="card" style="margin-top:12px"><div class="row"><div><b>📝 Aquest tema surt al Seminari 3</b><div class="muted small">${gs.length} tipus d'exercici d'aquesta llista (${dom} dominats) són peces del seminari. El que practiques aquí compta allà, i al revés.</div></div><span class="spacer"></span><a class="btn sm" href="#/seminari">Obrir el Seminari 3</a></div></div>`;
  };

  /* ---------------- estadístiques (temari i mapa) ---------------- */
  Calc.semStats = function () {
    const gs = gensOf(), V = Calc.RANK_VAL;
    const n = gs.length, dom = gs.filter(g => store.rank(g.key) >= 5).length, tried = gs.filter(g => (store.data().gens[g.key] || {}).att).length;
    const pct = n ? gs.reduce((a, g) => a + V[store.rank(g.key)], 0) / n : 0;
    const types = TIDS.map(t => topicInfo(t)), tdom = types.filter(x => x.r >= 5).length;
    const att = gs.reduce((a, g) => a + ((store.data().gens[g.key] || {}).att || 0), 0);
    const accs = gs.map(g => store.genAccuracy(g.key)).filter(a => a != null);
    return { n, dom, tried, pct, tdom, tn: TIDS.length, att, acc: accs.length ? accs.reduce((a, b) => a + b, 0) / accs.length : null, gens: gs };
  };
  Calc.SEMINARS = { sem3: { id: 'sem3', name: 'Seminari 3', short: 'Cadena, derivada via límit, estudi, quocients', href: '#/seminari', after: ['l1', 'l2', 'l3', 'l4'] } };

  /* ---------------- rutes ---------------- */
  Calc.routes.push({ re: /^#\/seminari/, fn: () => {
    const h = location.hash.replace(/^#\/seminari\/?/, ''), [path, qs] = h.split('?'), seg = path.split('/').filter(Boolean);
    const q = new URLSearchParams(qs || '');
    if (seg[0] === 'ex') return seg[1] ? exPage(seg[1], Math.min(3, Math.max(1, +q.get('d') || 2))) : exList();
    if (seg[0] === 'lli') return seg[1] ? lessonPage(seg[1]) : lessonsPage();
    if (seg[0] === 'hab') return seg[1] === 'g' ? habPage(null, seg[2]) : habPage(seg[1]);
    if (seg[0] === 'sim') return simPage(seg[1]);
    if (seg[0] === 'original') return origPage();
    if (seg[0] === 'teoria') return theoryPage();
    if (seg[0] === 'rap') return rapPage(seg[1]);
    if (seg[0] === 'intu') return intuPage(seg[1]);
    return planPage();
  } });
  U.route(); // torna a pintar el menú (grup Seminaris) i la ruta actual
})();
