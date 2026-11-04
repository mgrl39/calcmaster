/* ===================================================================
   app.js — Interfície: tauler, teoria, pràctica amb correcció immediata,
   tests, mode examen, repàs d'errors, progrés i formulari.
   =================================================================== */
(function () {
  'use strict';
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const app = $('#app');
  const store = Calc.store;
  const MODS = Calc.modules;
  const CLASS_DONE = new Set(['base', 'l0', 'l1', 'l2', 'l3', 'l4', 'l5']); // fonaments + temari del 1r parcial
  const P1_IDS = ['l0', 'l1', 'l2', 'l3', 'l4', 'l5']; // llistes del 1r parcial
  Calc.P2_IDS = ['l7', 'l8', 'l9', 'l10', 'l11', 'l12', 'l13']; // temari del 2n parcial (blocs 3 i 4)
  /* Prioritat «2n parcial»: les llistes 6–13 surten primer i pesen més a la pràctica barrejada.
     Res es dona per sabut: la base i el 1r parcial (0–5) es veuen igual i també tenen mestria.
     Es pot desactivar a l'inici («Mateix pes a tot el curs»). */
  const FOCUS_KEY = 'calcmaster.focus';
  Calc.FOCUS_IDS = ['l6', 'l7', 'l8', 'l9', 'l10', 'l11', 'l12', 'l13'];
  Calc.focusOn = () => { try { return localStorage.getItem(FOCUS_KEY) !== 'all'; } catch (e) { return true; } };
  Calc.setFocus = on => { try { localStorage.setItem(FOCUS_KEY, on ? 'p2' : 'all'); } catch (e) { /* res */ } route(); };
  Calc.inFocus = id => !Calc.focusOn() || Calc.FOCUS_IDS.includes(id);
  /* Selecció de llistes combinables (persistent): serveix per a pràctica, test i examen. */
  const SEL_KEY = 'calcmaster.sel';
  const sel = {
    get() {
      let a = null;
      try { a = JSON.parse(localStorage.getItem(SEL_KEY) || 'null'); } catch (e) { a = null; }
      a = Array.isArray(a) ? a.filter(id => Calc.byId[id]) : null;
      return a && a.length ? a : (Calc.focusOn() ? Calc.FOCUS_IDS : MODS.map(m => m.id)).slice();
    },
    set(a) { try { localStorage.setItem(SEL_KEY, JSON.stringify(a)); } catch (e) { /* res */ } }
  };
  Calc.sel = sel; Calc.routes = []; Calc.extraTabs = null; Calc.theoryExtra = null;
  let cleanup = null; // funció a cridar en canviar de ruta (timers…)

  function typeset(el) {
    try {
      renderMathInElement(el, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false, strict: false });
    } catch (e) { /* KaTeX no disponible */ }
  }
  const SIDE_NAME = { base: 'Fonaments', l0: 'Funcions i domini', l1: 'Límits i continuïtat', l2: 'Derivades', l3: 'Extrems i optimització', l4: 'Asímptotes i L\'Hôpital', l5: 'Taylor', l6: 'Interpolació', l7: 'Newton i primitives', l8: 'Fraccions simples', l9: 'Integral definida', l10: 'EDO: separables', l11: 'EDO lineals 1r ordre', l12: 'EDO 2n ordre', l13: 'Final (estil examen)' };
  const sideName = m => SIDE_NAME[m.id] || m.title;
  const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);
  const mlevel = m => (m == null ? 0 : m < 0.5 ? 1 : m < 0.8 ? 2 : 3);
  const pct = v => Math.round(v * 100);
  const levelName = ['Sense començar', 'Cal practicar', 'Ho dominaràs aviat', 'Dominat'];

  document.documentElement.setAttribute('data-theme', 'dark'); // només mode fosc
  $('#menuBtn').onclick = () => document.body.classList.toggle('menu-open');

  /* ------------------------ Text de solucions: més aireat ------------------------ */
  /** Talla una fórmula en pantalla llarga en diverses línies (a cada ⇒ o salt \quad de primer nivell). */
  function splitTop(tex) {
    const out = []; let depth = 0, env = 0, last = 0;
    const tok = /\\(q?quad|(?:Long)?[Rr]ightarrow|iff|Leftrightarrow)(?![a-zA-Z])/y;
    for (let i = 0; i < tex.length; i++) {
      const c = tex[i];
      if (c === '\\') {
        if (tex[i + 1] === '{' || tex[i + 1] === '}') { i++; continue; }
        if (tex.startsWith('\\begin', i)) env++; else if (tex.startsWith('\\end', i)) env--;
        else if (!depth && !env) { tok.lastIndex = i; const m = tok.exec(tex); if (m) { out.push(tex.slice(last, i)); last = /quad/.test(m[1]) ? i + m[0].length : i; i += m[0].length - 1; } }
      } else if (c === '{') depth++; else if (c === '}') depth--;
    }
    out.push(tex.slice(last));
    const clean = x => x.replace(/^(\s|\\[;,!]|\\q?quad)+|(\s|\\[;,!]|\\q?quad)+$/g, '');
    return out.map(clean).filter(Boolean);
  }
  function prettyMath(html) {
    return String(html).replace(/\$\$([\s\S]+?)\$\$/g, (m, t) => { const parts = splitTop(t); return parts.length > 1 ? parts.map(x => '$$' + x + '$$').join('') : m; });
  }
  /** Converteix els salts <br> d'una solució en passos separats. */
  function pretty(html) {
    html = prettyMath(html);
    if (/<(table|div|ul|ol)\b/i.test(html) || !/<br\s*\/?>/i.test(html)) return html;
    return html.split(/(?:<br\s*\/?>\s*)+/i).filter(x => x.trim()).map(x => '<div class="st">' + x + '</div>').join('');
  }
  Calc.pretty = pretty; Calc.prettyMath = prettyMath;

  /* ------------------------ Referències a la teoria (panell lateral) ------------------------ */
  const secCache = {};
  /** Seccions de la teoria d'un mòdul: [{title, html}] (una per cada <h3>). */
  function theorySections(m) {
    if (secCache[m.id]) return secCache[m.id];
    const parts = String(m.theory || '').split(/<h3>/i).slice(1);
    return (secCache[m.id] = parts.map(x => { const k = x.indexOf('</h3>'); return { title: x.slice(0, k), html: x.slice(k + 5) }; }));
  }
  Calc.theorySections = theorySections;
  const concept = id => Calc.learn && Calc.learn.CONCEPTS[id];
  /** Botons «cal saber» que obren el panell lateral amb la teoria. */
  function refChips(ids, label) {
    const cs = (ids || []).map(concept).filter(Boolean);
    if (!cs.length) return '';
    return `<div class="refs"><span class="rlab">${label || 'Cal saber'}:</span>${cs.map(c => `<button type="button" class="ref" data-ref="${c.id}" title="Obre un recordatori al costat">${esc(c.t)}</button>`).join('')}</div>`;
  }
  Calc.refChips = refChips;
  function drawer() {
    let d = $('#drawer');
    if (!d) {
      d = document.createElement('aside'); d.id = 'drawer'; d.className = 'drawer'; d.hidden = true;
      d.innerHTML = '<div class="dhead"><b class="dtitle"></b><button class="x" title="Tanca (Esc)" aria-label="Tanca">×</button></div><div class="dbody"></div>';
      document.body.appendChild(d);
      $('.x', d).onclick = closeDrawer;
    }
    return d;
  }
  function closeDrawer() { const d = $('#drawer'); if (d) d.hidden = true; document.body.classList.remove('drawer-open'); }
  function showDrawer(title, html) {
    const d = drawer();
    $('.dtitle', d).innerHTML = title; $('.dbody', d).innerHTML = html; $('.dbody', d).scrollTop = 0;
    d.hidden = false; document.body.classList.add('drawer-open');
    typeset(d);
  }
  /** Obre el recordatori d'un concepte + la secció de teoria completa, sense sortir de la pàgina. */
  function openRef(id) {
    const c = concept(id); if (!c) return;
    const m = Calc.byId[c.mod], sec = m && theorySections(m)[c.sec];
    const needs = Calc.learn.SECTION_NEEDS[c.mod + ':' + c.sec];
    showDrawer('📖 ' + esc(c.t), `<div class="dshort"><div class="muted small">En una frase</div>${c.s}</div>
      ${needs ? refChips(needs, 'I això es basa en') : ''}
      ${sec ? `<h3>${sec.title}</h3><div class="theory">${sec.html}</div>` : ''}
      ${m ? `<div class="row" style="margin-top:14px"><a class="btn sm" href="#/mod/${m.id}/theory?s=${c.sec}">Obre a la teoria de ${esc(m.llista)}</a><a class="btn sm" href="#/mod/${m.id}/practice">Practica ${esc(sideName(m))}</a></div>` : ''}`);
  }
  /** Obre tota la teoria d'un mòdul al panell (seccions plegables). */
  function openTheory(id) {
    const m = Calc.byId[id]; if (!m) return;
    showDrawer('📖 ' + esc(m.llista) + ' — teoria', sectionize(m.theory, m.id, true));
  }
  Calc.openRef = openRef; Calc.openTheory = openTheory; Calc.closeDrawer = closeDrawer;
  document.addEventListener('click', e => {
    const r = e.target.closest && e.target.closest('[data-ref]');
    if (r) { e.preventDefault(); openRef(r.getAttribute('data-ref')); return; }
    const t = e.target.closest && e.target.closest('[data-theory]');
    if (t) { e.preventDefault(); openTheory(t.getAttribute('data-theory')); }
  });

  /* ------------------------ Reset del progrés ------------------------ */
  function resetAll() {
    if (!confirm('Vols esborrar TOT el progrés (exercicis, errors, exàmens, llistes marcades…)? No es pot desfer.')) return false;
    store.reset();
    try { ['v1', 'sel', 'p1done', 'examsdone', 'patrons', 'plan', 'theme', 'tips'].forEach(k => localStorage.removeItem('calcmaster.' + k)); Object.keys(localStorage).filter(k => k.indexOf('calcmaster.') === 0 && k !== 'calcmaster.side').forEach(k => localStorage.removeItem(k)); } catch (e) { /* res */ }
    renderTop();
    route();
    return true;
  }
  Calc.resetAll = resetAll;

  /* ------------------------------ Capçalera i menú ------------------------------ */
  function ring(v, size) {
    const r = 9, c = 2 * Math.PI * r;
    return `<svg class="ring" viewBox="0 0 24 24"><circle cx="12" cy="12" r="${r}" fill="none" stroke="var(--panel2)" stroke-width="3.5"/><circle cx="12" cy="12" r="${r}" fill="none" stroke="${v >= 0.8 ? 'var(--ok)' : 'var(--accent)'}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${(c * v).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 12 12)"/></svg>`;
  }
  function renderTop() {
    const d = store.data();
    const tot = Object.values(d.gens).reduce((a, g) => a + g.att, 0), ok = Object.values(d.gens).reduce((a, g) => a + g.ok, 0);
    if (Calc.topStats) { $('#topStats').innerHTML = Calc.topStats(); return; }
    $('#topStats').innerHTML = `<span class="hide-sm">Resoltes: <b>${tot}</b></span><span class="hide-sm">Encert: <b>${tot ? pct(ok / tot) : 0}%</b></span><span>🔥 <b>${store.streakDays()}</b> d</span><span>⭐ <b>${d.xp}</b> XP</span>`;
  }
  function renderSide(active) {
    const errs = store.data().errors.length;
    const item = (href, icon, text, extra, id) => `<a class="item ${active === id ? 'active' : ''}" href="${href}"><span class="num">${icon}</span><span class="t">${text}</span>${extra || ''}</a>`;
    const modItem = m => { const mm = store.modMastery(m); return `<a class="item ${active === m.id ? 'active' : ''}" href="#/mod/${m.id}/practice"><span class="num">${esc(m.num)}</span><span class="t">${esc(sideName(m))}</span>${ring(mm.value)}</a>`; };
    let openState = {};
    try { openState = JSON.parse(localStorage.getItem('calcmaster.side') || '{}'); } catch (e) { /* res */ }
    const grp = (id, title, html, closed) => `<details data-g="${id}" ${openState[id] === false || (closed && openState[id] !== true) ? '' : 'open'}><summary>${title}</summary>${html}</details>`;
    const F = Calc.focusOn(), due = Calc.dueCount ? Calc.dueCount() : 0, xdue = Calc.partsDueCount ? Calc.partsDueCount() : 0;
    const p1Items = item('#/p1/exams', '🔥', 'Exàmens reals 1r parcial', '', 'p1exams') + item('#/p1/sim', '⏱️', 'Simulacre 1r parcial', '', 'p1sim') + item('#/p1/temes', '📈', 'Què surt al 1r parcial', '', 'p1temes') + item('#/p1', '📘', 'Resum 1r parcial', '', 'p1');
    $('#side').innerHTML =
      item('#/', '🏠', 'Inici', '', 'home') + item('#/mestria', '🏆', 'Mestria i constància', '', 'mestria') + item('#/curs', '🎓', 'Què estudiem i per què', '', 'curs') + item('#/cami', '🧭', 'Camí recomanat', '', 'cami') + item('#/mapa', '🗺️', 'Mapa del temari', '', 'mapa') + item('#/nivell', '🔎', 'Test de nivell', '', 'nivell') +
      grp('prac', 'Practicar', item('#/practice', '🎯', 'Pràctica mixta', '', 'practice') + item('#/mix', '🧩', 'Tria llistes i barreja', '', 'mix') + item('#/repas', '🧠', 'Repàs del dia', due ? `<span class="chip accent">${due}</span>` : '', 'repas') + item('#/review', '🔁', 'Repàs d\'errors', errs ? `<span class="chip warn">${errs}</span>` : '', 'review') + item('#/eines', '🧰', 'Eines per integrar', '', 'eines') + item('#/p1/test', '✅', 'Banc de tests', '', 'p1test')) +
      grp('exam', 'Exàmens (el que compta)', item('#/entrena', '🎓', 'Entrenament d\'exàmens', xdue ? `<span class="chip accent">${xdue}</span>` : '', 'entrena') + item('#/exam', '📝', 'Examen generat', '', 'exam') + item('#/p2', '🔥', 'Exàmens reals 2n parcial', '', 'p2exams') + item('#/p2/temes', '📈', 'Què surt al 2n parcial', '', 'p2temes') + p1Items) +
      (F ? grp('temari', 'Temari 2n parcial (L6–L13)', MODS.filter(m => Calc.FOCUS_IDS.includes(m.id)).map(modItem).join('')) + grp('temari1', 'Base i 1r parcial (també s\'entrena)', MODS.filter(m => !Calc.FOCUS_IDS.includes(m.id)).map(modItem).join(''))
        : grp('temari', 'Temari (cada llista)', MODS.map(modItem).join(''))) +
      grp('consulta', 'Consulta', item('#/formulari', '📐', 'Formulari', '', 'formulari') + item('#/p1/teoria', '📚', 'Apunts generals', '', 'p1teoria') + item('#/p1/guia', '🧠', 'Plantilles i errors típics', '', 'p1guia') + item('#/p1/resolts', '🧾', 'Problemes resolts', '', 'p1resolts') + item('#/grafica', '📈', 'Dibuixa una funció', '', 'grafica') + item('#/p1/chuleta', '📝', 'Xuleta', '', 'p1chuleta') + item('#/recursos', '📎', 'PDFs originals', '', 'recursos')) +
      '<div class="sidefoot"><button class="btn sm" id="keysBtn" title="Dreceres de teclat">⌨️ Dreceres</button><button class="btn sm danger" id="resetBtn">🗑️ Reset progrés</button></div>';
    $$('#side details').forEach(d => d.addEventListener('toggle', () => { openState[d.dataset.g] = d.open; try { localStorage.setItem('calcmaster.side', JSON.stringify(openState)); } catch (e) { /* res */ } }));
    $('#keysBtn').onclick = showKeys; $('#resetBtn').onclick = resetAll;
  }

  /* =========================================================================
     QView — una pregunta amb entrada de resposta, comprovació i solució
     ========================================================================= */
  const KEYS = [['^', '^'], ['√', 'sqrt('], ['π', 'pi'], ['e^', 'e^('], ['ln', 'ln('], ['sin', 'sin('], ['cos', 'cos('], ['arctan', 'atan('], ['abs', 'abs('], ['/', '/'], ['( )', '()'], ['∞', 'inf']];
  function previewTex(str, v) {
    str = String(str).trim();
    if (!str) return '';
    str = str.replace(/\+\s*[cC]\s*$/, '');
    try { return M.toTex(M.parse(str, [v || 'x'])); } catch (e) { return null; }
  }
  class QView {
    constructor(p, o) {
      this.p = p; this.o = o || {}; this.hints = 0; this.attempts = 0; this.done = false; this.recorded = false;
      this.el = document.createElement('div'); this.el.className = 'qcard';
      this.lastInput = null;
      this.build();
    }
    build() {
      const p = this.p;
      if (this.o.split) this.el.classList.add('split');
      let h = `<div class="qmain"><div class="qmeta">${this.o.meta || ''}</div><div class="qtext">${p.q}</div>`;
      if (p.plot) h += '<canvas class="plot" data-plot="q"></canvas>';
      h += '<div class="answers">';
      if (p.type === 'mc') {
        h += '<div class="mc">' + p.choices.map((c, i) => `<label class="opt"><input type="radio" name="mc-${this.id()}" value="${i}"><span>${c}</span></label>`).join('') + '</div>';
      } else if (p.type === 'multi') {
        h += p.fields.map((f, i) => `<div class="ansblock"><div class="ansrow">${f.label ? `<label>${f.label}</label>` : ''}<input class="ans" data-i="${i}" autocomplete="off" spellcheck="false" placeholder="${f.kind === 'fn' ? 'expressió en x' : 'valor'}"></div><div class="preview" data-i="${i}"></div></div>`).join('');
      } else {
        h += `<div class="ansblock"><div class="ansrow"><input class="ans" data-i="0" autocomplete="off" spellcheck="false" placeholder="${p.type === 'fn' ? 'La teva resposta (p.ex. 3x^2+1)' : 'La teva resposta (p.ex. 3/4 o sqrt(2))'}"></div><div class="preview" data-i="0"></div></div>`;
      }
      h += '</div>';
      if (!this.o.noActions) h += `<div class="actions"><button class="btn primary" data-act="check" title="Enter">Comprova</button><button class="btn ok" data-act="next" title="Enter o N" hidden>Següent →</button><button class="btn" data-act="hint" title="Shift+Enter o H">💡 Pista</button>${this.o.example ? '<button class="btn" data-act="example" title="E">📘 Exemple</button>' : ''}<button class="btn ghost" data-act="solution" title="Ctrl+Enter o S">Solució</button></div>`;
      if (p.type !== 'mc' && !this.o.noKbd) h += '<div class="kbd">' + KEYS.map(k => `<button type="button" data-ins="${esc(k[1])}">${esc(k[0])}</button>`).join('') + '</div>';
      const about = this.o.about ? `<div class="needbox">${this.o.about}</div>` : '';
      h += `</div><div class="qside">${about}<div class="fbwrap"></div><div class="hintbox" hidden></div><div class="exbox"></div><div class="solwrap"></div></div>`;
      this.el.innerHTML = h;
      this.bind();
      typeset(this.el);
    }
    id() { return this._id || (this._id = Math.random().toString(36).slice(2, 8)); }
    bind() {
      const el = this.el;
      $$('input.ans', el).forEach(inp => {
        inp.addEventListener('focus', () => { this.lastInput = inp; });
        inp.addEventListener('input', () => this.updatePreview(inp));
        inp.addEventListener('keydown', e => {
          if (e.key === 'Escape') { inp.blur(); return; }
          if (e.key !== 'Enter') return;
          e.preventDefault();
          if (this.done) this.o.onNext && this.o.onNext();
          else if (e.ctrlKey || e.metaKey) this.o.onSolution && this.o.onSolution();
          else if (e.shiftKey) this.o.onHint && this.o.onHint();
          else this.o.onCheck && this.o.onCheck();
        });
      });
      $$('.mc label.opt', el).forEach(l => l.addEventListener('click', () => {
        if (this.done) return;
        $$('.mc label.opt', el).forEach(x => x.classList.remove('sel')); l.classList.add('sel');
        this.o.onPick && setTimeout(() => this.o.onPick(), 0);
      }));
      $$('[data-ins]', el).forEach(b => b.addEventListener('click', () => this.insert(b.getAttribute('data-ins'))));
      $$('[data-act]', el).forEach(b => b.addEventListener('click', () => {
        const a = b.getAttribute('data-act');
        if (a === 'check') this.o.onCheck && this.o.onCheck();
        if (a === 'hint') this.o.onHint && this.o.onHint();
        if (a === 'solution') this.o.onSolution && this.o.onSolution();
        if (a === 'next') this.o.onNext && this.o.onNext();
        if (a === 'example') this.o.onExample && this.o.onExample();
      }));
    }
    insert(txt) {
      const inp = this.lastInput || $('input.ans', this.el);
      if (!inp || inp.disabled) return;
      const s = inp.selectionStart != null ? inp.selectionStart : inp.value.length, e = inp.selectionEnd != null ? inp.selectionEnd : s;
      inp.value = inp.value.slice(0, s) + txt + inp.value.slice(e);
      const pos = txt === '()' ? s + 1 : s + txt.length;
      inp.focus({ preventScroll: true }); inp.setSelectionRange(pos, pos); this.updatePreview(inp);
    }
    updatePreview(inp) {
      const pv = $('.preview[data-i="' + inp.getAttribute('data-i') + '"]', this.el);
      if (!pv) return;
      const t = previewTex(inp.value, this.p.v);
      if (t === '' ) pv.textContent = '';
      else if (t === null) pv.textContent = '… (format no reconegut)';
      else { try { katex.render(t, pv, { throwOnError: false }); } catch (e) { pv.textContent = ''; } }
    }
    focus() { const i = $('input.ans', this.el); if (i) i.focus({ preventScroll: true }); }
    getAnswer() {
      const p = this.p;
      if (p.type === 'mc') { const c = $('input[type=radio]:checked', this.el); if (c) return +c.value; const sel = $$('.mc label.opt', this.el).findIndex(l => l.classList.contains('sel')); return sel >= 0 ? sel : null; }
      const vals = $$('input.ans', this.el).map(i => i.value);
      return p.type === 'multi' ? vals : vals[0];
    }
    isEmpty(a) { return a == null || (Array.isArray(a) ? a.every(x => !String(x).trim()) : (typeof a === 'string' && !a.trim())); }
    lock() {
      this.done = true;
      $$('input', this.el).forEach(i => { i.disabled = true; });
      $$('.kbd button, [data-act=hint], [data-act=solution]', this.el).forEach(b => { b.disabled = true; });
      const ck = $('[data-act=check]', this.el), nx = $('[data-act=next]', this.el);
      if (ck && nx) { ck.hidden = true; nx.hidden = false; }
    }
    mark(ok, parts) {
      const p = this.p;
      this.el.classList.toggle('ok', ok); this.el.classList.toggle('bad', !ok);
      if (p.type === 'mc') {
        $$('.mc label.opt', this.el).forEach((l, i) => { l.classList.remove('sel', 'good', 'wrong'); if (i === p.correct) l.classList.add('good'); else if (l.querySelector('input').checked) l.classList.add('wrong'); });
      } else if (p.type === 'multi' && parts) {
        $$('input.ans', this.el).forEach((inp, i) => { inp.classList.toggle('good', !!parts[i]); inp.classList.toggle('wrong', !parts[i]); });
      } else {
        $$('input.ans', this.el).forEach(inp => { inp.classList.toggle('good', ok); inp.classList.toggle('wrong', !ok); });
      }
    }
    feedback(kind, html) {
      $('.fbwrap', this.el).innerHTML = html ? `<div class="fb ${kind}">${html}</div>` : '';
      typeset($('.fbwrap', this.el));
    }
    showHint() {
      const steps = this.p.sol || [];
      const box = $('.hintbox', this.el);
      if (this.p.hint && !this.hintShown) { this.hintShown = true; this.hints = Math.max(this.hints, 1); box.hidden = false; box.innerHTML = '<b>💡 Pista:</b> ' + esc(this.p.hint); typeset(box); return; }
      if (!steps.length) { box.hidden = false; box.textContent = 'No hi ha pista per a aquest exercici.'; return; }
      this.hints = Math.min(this.hints + 1, steps.length);
      box.hidden = false;
      box.innerHTML = '<b>💡 Pista ' + this.hints + '/' + steps.length + ':</b><ol>' + steps.slice(0, this.hints).map(s => '<li>' + Calc.pretty(s) + '</li>').join('') + '</ol>';
      typeset(box);
    }
    showSolution() {
      const p = this.p;
      $('.hintbox', this.el).hidden = true;
      const w = $('.solwrap', this.el);
      const at = Calc.answerTex(p);
      w.innerHTML = `<div class="sol"><div class="tag">Solució</div>${at ? `<div class="ans-line">Resposta: ${at}</div>` : ''}<ol>${(p.sol || []).map(s => '<li>' + Calc.pretty(s) + '</li>').join('')}</ol>${p.solPlot ? '<canvas class="plot" data-plot="s"></canvas>' : ''}</div>`;
      typeset(w); this.drawPlots();
    }
    drawPlots() {
      requestAnimationFrame(() => {
        const q = $('canvas[data-plot="q"]', this.el), s = $('canvas[data-plot="s"]', this.el);
        try { if (q && this.p.plot) Calc.plot(q, this.p.plot); if (s && this.p.solPlot) Calc.plot(s, this.p.solPlot); } catch (e) { /* gràfic opcional */ }
      });
    }
  }

  const helpBlock = `<details class="help"><summary>Com escric les respostes?</summary>
  Potències <code>x^2</code> · fraccions <code>3/4</code> · arrels <code>sqrt(x)</code> · <code>e^(2x)</code> · <code>ln(x)</code> · <code>sin(x)</code> · <code>pi</code> · <code>abs(x)</code> · infinit <code>inf</code>. El producte implícit funciona (<code>2x</code>, <code>3(x+1)</code>). En primitives pots afegir <code>+C</code> (és opcional). Es corregeix de manera numèrica, així que <b>qualsevol forma equivalent</b> és correcta. Decimals amb coma o punt.</details>`;

  /* ------------------------ Selecció adaptativa d'exercicis ------------------------ */
  let lastKey = null;
  function pickGen(gens) {
    const d = store.data();
    const ws = gens.map(g => {
      const m = store.genMastery(g.key), a = store.genAccuracy(g.key);
      let w = m == null ? 1.7 : (1.25 - m) + 0.12;
      if (store.isDue(g.key)) w *= 1.6; // li toca repàs
      if (a != null && a < 0.5) w *= 1.4; // et costa: surt més
      if (Calc.examW) w *= [0.35, 0.8, 1.15, 1.5][Calc.examW(g.key)]; // el que surt a l'examen, més
      if (Calc.focusOn && Calc.focusOn() && Calc.FOCUS_IDS.includes(g.mod)) w *= 1.6; // prioritat 2n parcial
      if (g.key === lastKey && gens.length > 1) w *= 0.15;
      return Math.max(w, 0.05);
    });
    let t = Math.random() * ws.reduce((a, b) => a + b, 0), i = 0;
    for (; i < ws.length - 1; i++) { t -= ws[i]; if (t <= 0) break; }
    lastKey = gens[i].key;
    return gens[i];
  }
  /** Text «de què va» + conceptes necessaris, per a la columna dreta. */
  const aboutOf = gen => (Calc.rankLine ? Calc.rankLine(gen.key) : '') + (gen.desc ? `<div class="about"><span class="muted small">De què va</span><div>${gen.desc}</div></div>` : '') + refChips(gen.needs, 'Cal saber');
  /** Exemple semblant (una altra llavor) amb la solució, per aprendre abans de provar. */
  function exampleHtml(gen, seed) {
    let p; try { p = Calc.make(gen, seed); } catch (e) { return ''; }
    const at = Calc.answerTex(p);
    return `<div class="sol example"><div class="tag">📘 Exemple semblant resolt <span class="muted small">(no compta com a error)</span></div><div class="qtext">${p.q}</div>${at ? `<div class="ans-line">Resposta: ${at}</div>` : ''}<ol>${(p.sol || []).map(x => '<li>' + pretty(x) + '</li>').join('')}</ol></div>`;
  }
  Calc.exampleHtml = exampleHtml; Calc.aboutOf = aboutOf;
  const metaOf = (gen, extra) => `<span class="chip accent">${esc(Calc.byId[gen.mod].llista)}</span><b>${esc(gen.title)}</b><span class="stars" title="Dificultat">${stars(gen.level)}</span>${extra || ''}`;

  /* =========================================================================
     Sessió de pràctica (correcció immediata)
     cfg: { gens:[...], items?:[{gkey,seed}], fixed?:bool }
     ========================================================================= */
  /** Posa una targeta nova sense que la pàgina salti: conserva l'alçada i alinea la targeta sempre al mateix lloc. */
  function placeStable(host, el, notFirst) {
    host.style.minHeight = Math.max(host.offsetHeight, parseInt(host.style.minHeight) || 0) + 'px';
    host.innerHTML = ''; host.appendChild(el);
    const top = host.getBoundingClientRect().top, to = () => window.scrollTo({ top: Math.max(0, top + window.scrollY - 90), behavior: 'instant' });
    if (notFirst) { if (top < 60) to(); return; } // només si la pregunta havia quedat amagada per dalt
    const act = el.querySelector('.actions'); // primera pregunta: que els botons es vegin sense haver de baixar
    if (act && act.getBoundingClientRect().bottom > window.innerHeight - 10) to();
  }
  Calc.placeStable = placeStable;

  function mountPractice(root, cfg) {
    const sess = { n: 0, ok: 0, streak: 0, xp: 0 };
    root.innerHTML = '<div class="sessbar"></div><div class="qhost"></div>' + helpBlock;
    const bar = $('.sessbar', root), host = $('.qhost', root);
    let queue = cfg.items ? cfg.items.slice() : null, current = null, mounted = false;
    const updBar = () => {
      bar.innerHTML = `<span class="chip">Sessió</span><span>Resoltes: <b>${sess.n}</b></span><span>Correctes: <b>${sess.ok}</b></span><span>🔥 Seguides: <b>${sess.streak}</b></span><span>⭐ +<b>${sess.xp}</b> XP</span>` + (queue ? `<span>Pendents: <b>${queue.length + (current && !current.finished ? 1 : 0)}</b></span>` : '');
    };
    function next() {
      let gen, seed;
      if (queue) {
        if (!queue.length) { host.innerHTML = '<div class="card"><h2>🎉 Repàs completat!</h2><p>Has revisat tots els exercicis pendents. Torna a la pràctica o fes un examen.</p><a class="btn primary" href="#/exam">Mode examen</a></div>'; updBar(); renderSide('review'); return; }
        const it = queue.shift(); gen = Calc.genByKey(it.gkey); seed = it.seed;
        if (!gen) return next();
      } else { gen = cfg.fixed ? cfg.gens[0] : pickGen(cfg.gens); seed = Calc.newSeed(); }
      let p;
      try { p = Calc.make(gen, seed); } catch (e) { console.error(e); return next(); }
      const v = new QView(p, { meta: metaOf(gen), split: true, about: aboutOf(gen), example: !cfg.noExample });
      const st = { finished: false };
      current = st;
      const check = () => {
        if (v.done) return;
        const a = v.getAnswer();
        if (v.isEmpty(a)) { v.feedback('info', 'Escriu una resposta primer. Si no saps per on començar, prova 💡 <b>Pista</b> o 📘 <b>Exemple</b>.'); return; }
        const g = Calc.grade(p, a);
        if (g.parseError && !g.ok) { v.feedback('info', 'No entenc el que has escrit (no compta com a error). Revisa que els parèntesis tanquin i el format: <code>x^2</code>, <code>3/4</code>, <code>sqrt(2)</code>, <code>e^(2x)</code>, <code>ln(x)</code>. Mira la vista prèvia sota la casella.'); return; }
        v.attempts++;
        if (g.ok) {
          const first = v.attempts === 1 && v.hints === 0;
          let info = null;
          if (!v.recorded) { info = store.record(gen.key, first, p, first ? 'ok' : 'assist'); v.recorded = true; sess.n++; sess.xp += info.xp; if (first) { sess.ok++; sess.streak++; } else sess.streak = 0; }
          v.mark(true, g.parts); v.lock(); st.finished = true;
          const gain = info && Calc.gainHtml ? Calc.gainHtml(info) : '';
          v.feedback('ok', (first ? '✅ <b>Correcte!</b> Mira igualment la solució: potser hi ha un camí més curt.' : v.attempts === 1 ? '✅ <b>Correcte</b>, amb pista. Compta com a esforç (+XP), però per pujar de rang l\'has d\'encertar sense ajuda.' : '✅ <b>Correcte</b>, tot i que no a la primera. Aquest tipus tornarà a sortir al repàs perquè el fixis.') + gain);
          v.showSolution(); finish();
        } else {
          let info = null;
          if (!v.recorded) { info = store.record(gen.key, false, p, 'fail'); v.recorded = true; sess.n++; sess.xp += info.xp; sess.streak = 0; }
          v.mark(false, g.parts);
          if (p.type !== 'mc') { $$('input.ans', v.el).forEach(i => i.classList.remove('good', 'wrong')); if (g.parts) $$('input.ans', v.el).forEach((inp, i) => { inp.classList.add(g.parts[i] ? 'good' : 'wrong'); }); else $$('input.ans', v.el).forEach(inp => inp.classList.add('wrong')); v.el.classList.remove('bad'); }
          else { v.lock(); st.finished = true; v.showSolution(); finish(); }
          if (v.attempts >= 3 && p.type !== 'mc' && Calc.suggestEasier && !v.tipShown) { const t = Calc.suggestEasier(gen, p); if (t) { v.tipShown = true; $('.hintbox', v.el).insertAdjacentHTML('afterend', '<div class="tipcard">' + t + '</div>'); } }
          const whyMsg = g.why && Calc.learn ? '<div style="margin-top:6px">' + Calc.learn.WHY[g.why] + '</div>' : '';
          const partsMsg = g.parts && p.type === 'multi' ? `<div class="small" style="margin-top:4px">Bé ${g.parts.filter(Boolean).length} de ${g.parts.length} caselles (les vermelles són les que fallen).</div>` : '';
          const tries = v.attempts === 1 ? 'Torna-ho a provar.' : v.attempts === 2 ? 'Prova amb una 💡 pista o mira l\'📘 exemple.' : 'Si et bloqueges, mira la solució: aprendre de la solució també compta.';
          v.feedback('bad', (p.type === 'mc' ? '❌ <b>No és aquesta.</b> Mira per què a la solució.' : '❌ <b>Encara no.</b> ' + tries) + whyMsg + partsMsg + (v.attempts >= 2 ? refChips(gen.needs, 'Repassa') : '') + (info && Calc.gainHtml ? Calc.gainHtml(info) : ''));
          renderTop(); renderSide(cfg.activeId);
          updBar();
        }
      };
      function finish() { $('[data-act=next]', v.el) && ($('[data-act=next]', v.el).hidden = false); $('[data-act=check]', v.el) && ($('[data-act=check]', v.el).hidden = true); renderTop(); renderSide(cfg.activeId); updBar(); }
      v.o.onCheck = check; v.o.onPick = () => { if (p.type === 'mc') check(); };
      v.o.onHint = () => { if (!v.done) v.showHint(); };
      v.o.onSolution = () => {
        let info = null;
        if (!v.recorded) { info = store.record(gen.key, false, p, 'seen'); v.recorded = true; sess.n++; sess.xp += info.xp; sess.streak = 0; }
        v.mark(false); v.lock(); st.finished = true; v.feedback('info', 'Solució mostrada. Llegeix-la pas a pas; aquest exercici tornarà al <b>repàs d\'errors</b> perquè el facis tu. Mirar la solució no et treu punts de mestria.' + refChips(gen.needs, 'Repassa') + (info && Calc.gainHtml ? Calc.gainHtml(info) : '')); v.showSolution(); finish();
      };
      v.o.onExample = () => { const b = $('.exbox', v.el); b.innerHTML = exampleHtml(gen, Calc.newSeed()); typeset(b); };
      v.o.onNext = () => { next(); };
      // Evita que la pàgina «salti»: mantenim l'alçada anterior i la targeta nova es col·loca sempre a la mateixa posició de pantalla.
      placeStable(host, v.el, mounted); v.drawPlots(); updBar();
      Calc.cur = v;
      mounted = true;
      setTimeout(() => v.focus(), 50);
    }
    next();
  }

  /* =========================================================================
     Pàgines
     ========================================================================= */
  function moduleStatus(m) {
    const mm = store.modMastery(m);
    if (!mm.att) return { cls: '', text: 'No començat' };
    if (mm.value >= 0.8) return { cls: 'ok', text: 'Dominat' };
    return { cls: 'accent', text: 'En curs' };
  }

  function recommend() {
    const withAtt = MODS.map(m => ({ m, mm: store.modMastery(m) }));
    const any = withAtt.some(x => x.mm.att > 0);
    if (!any) return { mod: Calc.byId.base, why: 'Comença pels fonaments: és el que més t\'ajudarà després de molts anys sense càlcul.' };
    const weak = withAtt.filter(x => x.mm.att >= 3 && x.mm.acc != null && x.mm.acc < 0.6).sort((a, b) => a.mm.acc - b.mm.acc)[0];
    if (weak) return { mod: weak.m, why: `Hi encertes el ${pct(weak.mm.acc)}% últimament: reforça-ho abans de continuar.` };
    const fresh = withAtt.find(x => x.mm.att === 0);
    if (fresh) return { mod: fresh.m, why: 'Següent tema del camí recomanat.' };
    return { mod: null, why: 'Ho tens tot treballat! Fes un examen complet per comprovar-ho.' };
  }

  function focusBar() {
    return Calc.focusOn()
      ? `<div class="card focusbar" style="margin-top:16px"><div class="row"><div><b>🎯 Prioritat: 2n parcial</b><div class="muted small">Les llistes 6–13 i els exàmens del 2n parcial surten primer i pesen més a la pràctica barrejada. Però <b>res es dona per sabut</b>: la base i les llistes 0–5 també s'entrenen i tenen mestria.</div></div><span class="spacer"></span><button class="btn sm" id="focusToggle">Mateix pes a tot el curs</button></div></div>`
      : `<div class="card focusbar" style="margin-top:16px"><div class="row"><div><b>📚 Tot el curs amb el mateix pes</b><div class="muted small">Totes les llistes, de 0 a 13, en ordre.</div></div><span class="spacer"></span><button class="btn sm" id="focusToggle">🎯 Prioritzar el 2n parcial</button></div></div>`;
  }
  function dashboard() {
    renderSide('home');
    const d = store.data(), rec = (Calc.nextStep || recommend)();
    const tot = Object.values(d.gens).reduce((a, g) => a + g.att, 0), ok = Object.values(d.gens).reduce((a, g) => a + g.ok, 0);
    const total = MODS.reduce((a, m) => a + m.gens.length, 0), mastered = MODS.reduce((a, m) => a + m.gens.filter(g => (store.genMastery(g.key) || 0) >= 0.8 && (d.gens[g.key] || {}).att >= 3).length, 0);
    const card = m => {
      const mm = store.modMastery(m), s = moduleStatus(m);
      return `<div class="card modcard"><div class="row"><span class="chip accent">${esc(m.llista)}</span><span class="chip ${s.cls}">${s.text}</span><span class="spacer"></span><span class="pct">${pct(mm.value)}%</span></div>
        <h3>${esc(m.title)}</h3><p>${esc(m.short)}</p><div class="bar"><i style="width:${pct(mm.value)}%"></i></div>
        <div class="row"><a class="btn sm" href="#/mod/${m.id}/theory">📖 Teoria</a><a class="btn sm primary" href="#/mod/${m.id}/practice">✍️ Practicar</a><a class="btn sm" href="#/mod/${m.id}/test">✅ Test</a></div></div>`;
    };
    const last = d.exams.slice(-3).reverse();
    app.innerHTML = `
      <section class="hero"><h1>CalcMaster</h1>
        <p>Aprèn el temari de Càlcul des de zero: teoria clara, exercicis infinits amb correcció a l'instant, exemples resolts i exàmens reals fins al 2026. Si alguna cosa dona per fet un concepte, el tens enllaçat. Prem <kbd>?</kbd> per veure les dreceres.</p>
        <div class="row"><a class="btn primary" href="#/practice">🎯 Pràctica mixta</a><a class="btn" href="#/exam">📝 Mode examen</a><a class="btn" href="#/review">🔁 Repàs d'errors${d.errors.length ? ' (' + d.errors.length + ')' : ''}</a><a class="btn" href="#/curs">🎓 Què estudiem i per què</a><a class="btn" href="#/cami">🧭 Camí recomanat</a><a class="btn" href="#/mapa">🗺️ Mapa del temari</a></div></section>
      ${Calc.dashMestria ? Calc.dashMestria() : ''}
      ${focusBar()}
      ${tot < 10 && !Calc.focusOn() ? `<div class="card tipcard" style="margin-top:16px"><b>🔎 No saps per on començar?</b> Fes el <a href="#/nivell">test de nivell</a> (uns 10 minuts): et diu què tens fresc i què convé repassar, des dels fonaments. No cal haver fet res abans.</div>` : ''}
      <div class="card next-card" style="margin-top:16px"><div class="row"><div><div class="muted" style="font-size:.8rem;text-transform:uppercase;letter-spacing:.08em">Suggeriment (no obligatori)</div>
        <h3 style="margin:2px 0">${rec.mod ? esc(rec.mod.llista) + ' — ' + esc(rec.mod.title) : 'Examen de prova'}</h3><div class="muted">${esc(rec.why)}</div></div><span class="spacer"></span>
        ${rec.mod ? `<a class="btn primary" href="#/mod/${rec.mod.id}/practice">Practicar</a>` : '<a class="btn primary" href="#/exam">Fer examen</a>'}</div></div>
      <div class="grid cols3" style="margin-top:16px">
        <div class="card stat"><b>${tot}</b><span>exercicis resolts</span></div>
        <div class="card stat"><b>${tot ? pct(ok / tot) : 0}%</b><span>encert global</span></div>
        <div class="card stat"><b>${mastered}/${total}</b><span>tipus d'exercici dominats</span></div>
      </div>
      ${Calc.dashExtra ? Calc.dashExtra() : ''}
      ${last.length ? `<h2>Últims exàmens</h2><div class="card">${last.map(e => `<div class="row"><span>${new Date(e.t).toLocaleDateString('ca')}</span><b>${e.mark.toFixed(1)}/10</b><span class="muted">${e.n} preguntes · ${e.fmt}</span></div>`).join('')}</div>` : ''}
      ${Calc.focusOn() ? `<h2>Llistes 6–13 <span class="chip accent">2n parcial · prioritat</span></h2><div class="grid cols2">${MODS.filter(m => !CLASS_DONE.has(m.id)).map(card).join('')}</div>
      <h2>Base i llistes 0–5 <span class="chip">també s'han de dominar</span></h2><p class="muted">No es dona res per sabut: derivar, límits, asímptotes, inequacions o trigonometria són la base de tot el que ve, i entren a la recuperació.</p>
      ${Calc.p1Banner ? Calc.p1Banner() : ''}<div class="grid cols2" style="margin-top:12px">${MODS.filter(m => CLASS_DONE.has(m.id)).map(card).join('')}</div>`
    : `<h2>Fonaments</h2><div class="grid cols2">${MODS.filter(m => m.id === 'base').map(card).join('')}</div>
      <h2>Llistes 0–5 <span class="chip">1r parcial</span></h2><div class="grid cols2">${MODS.filter(m => CLASS_DONE.has(m.id) && m.id !== 'base').map(card).join('')}</div>
      <h2>Llistes 6–13</h2><div class="grid cols2">${MODS.filter(m => !CLASS_DONE.has(m.id)).map(card).join('')}</div>`}`;
    const fb = $('#focusToggle'); if (fb) fb.onclick = () => Calc.setFocus(!Calc.focusOn());
    typeset(app);
  }

  function moduleView(id, tab) {
    const m = Calc.byId[id];
    if (!m) { app.innerHTML = '<p>Mòdul no trobat.</p>'; return; }
    tab = tab || 'practice';
    const extra = (Calc.extraTabs && Calc.extraTabs(m)) || [];
    const gq = new URLSearchParams((location.hash.split('?')[1]) || '').get('g');
    if (gq && tab === 'practice') (practiceTab.sel = practiceTab.sel || {})[m.id] = gq;
    renderSide(m.id);
    const mm = store.modMastery(m);
    const idx = MODS.indexOf(m), prev = MODS[idx - 1], nxt = MODS[idx + 1];
    app.innerHTML = `<div class="modhead"><div class="crumbs"><a href="#/">Inici</a><span>› Temari › ${esc(m.llista)}</span><span class="chip ${moduleStatus(m).cls}" title="Domini mitjà dels tipus d'exercici">${pct(mm.value)}% · ${mm.covered}/${mm.total} tipus fets</span>${Calc.modChip ? Calc.modChip(m) : ''}<span class="spacer"></span>${prev ? `<a href="#/mod/${prev.id}/${tab}" title="${esc(prev.title)}">← ${esc(prev.llista)}</a>` : ''}${nxt ? `<a href="#/mod/${nxt.id}/${tab}" title="${esc(nxt.title)}">${esc(nxt.llista)} →</a>` : ''}</div>
      <h1>${esc(m.title)}</h1>
      <p class="lead">${esc(m.short)}</p></div>${onSom(m)}${(Calc.tipFor && Calc.tipFor(m)) || ''}
      <div class="tabs"><a class="${tab === 'theory' ? 'active' : ''}" href="#/mod/${id}/theory">📖 Teoria</a><a class="${tab === 'practice' ? 'active' : ''}" href="#/mod/${id}/practice">✍️ Pràctica</a><a class="${tab === 'test' ? 'active' : ''}" href="#/mod/${id}/test">✅ Test</a>${extra.map(t => `<a class="${tab === t.id ? 'active' : ''}" href="#/mod/${id}/${t.id}">${t.label}</a>`).join('')}</div><div id="tabbody"></div>`;
    const body = $('#tabbody');
    $$('.onsom, .tipcard', app).forEach(typeset);
    const xt = extra.find(t => t.id === tab);
    if (xt) xt.render(body, m);
    else if (tab === 'theory') theoryTab(body, m, +new URLSearchParams((location.hash.split('?')[1]) || '').get('s') || 0);
    else if (tab === 'test') testTab(body, m);
    else practiceTab(body, m);
  }

  /** Franja «On som»: bloc del curs, pregunta que respon, d'on ve, cap a on porta i per a què serveix. */
  function onSom(m) {
    const L = Calc.learn, st = L && L.STORY[m.id];
    if (!st) return '';
    const b = L.BLOCS[st[0] - 1];
    let open = false;
    try { open = localStorage.getItem('calcmaster.onsom') === '1'; } catch (e) { /* res */ }
    return `<details class="onsom" ${open ? 'open' : ''} ontoggle="try{localStorage.setItem('calcmaster.onsom',this.open?'1':'0')}catch(e){}"><summary><span class="ob">📍 ${b ? 'Bloc ' + b.n + ' · ' + esc(b.t) : 'Base del curs'}</span><span class="oq">${st[1]}</span><span class="ox">${esc(st[5])}</span></summary>
      <div class="ogrid"><div><b>Ve de</b><p>${st[2]}</p></div><div><b>Porta a</b><p>${st[3]}</p></div><div><b>Per a què serveix</b><p>${st[4]}</p></div></div>
      <div class="small muted">Vegeu <a href="#/curs">què estudiem i per què</a> · <a href="#/mapa">mapa del temari</a></div></details>`;
  }

  /** Divideix la teoria en seccions plegables (a cada <h3>), amb el que cal saber abans de cada una. */
  function sectionize(html, modId, allClosed, openIdx) {
    const parts = String(html).split(/<h3>/i);
    if (parts.length < 3) return `<div class="card">${html}</div>`;
    const needs = (Calc.learn && Calc.learn.SECTION_NEEDS) || {};
    let out = parts[0].trim() ? `<div class="card">${parts[0]}</div>` : '';
    for (let i = 1; i < parts.length; i++) {
      const k = parts[i].indexOf('</h3>'), n = i - 1;
      const open = allClosed ? false : (openIdx != null ? n === openIdx : i === 1);
      out += `<details class="tsec" id="${modId ? 'sec-' + modId + '-' + n : ''}" ${open ? 'open' : ''}><summary>${parts[i].slice(0, k)}</summary><div class="tbody">${modId ? refChips(needs[modId + ':' + n], 'Abans cal saber') : ''}${parts[i].slice(k + 5)}</div></details>`;
    }
    return out;
  }
  Calc.sectionize = sectionize;

  function theoryTab(body, m, s) {
    const it = Calc.learn && Calc.learn.INTRO[m.id];
    const intro = it ? `<div class="intro"><div class="ilab">💡 La idea en 30 segons</div><p>${it[0]}</p><p class="muted"><b>Per a què serveix:</b> ${it[1]}</p>${refChips(it[2], 'Abans cal saber')}</div>` : '';
    body.innerHTML = intro + `<p class="muted small">Clica cada apartat per obrir-lo. Els botons <span class="ref">així</span> obren un recordatori del que cal saber, sense sortir d'aquí.</p><div class="theory">${sectionize(m.theory, m.id, false, s || 0)}</div>${(Calc.theoryExtra && Calc.theoryExtra(m)) || ''}
      <h2>Exemple resolt</h2><p class="muted">Cada cop que cliquis, es genera un exemple nou amb tots els passos.</p>
      <div class="row"><button class="btn primary" id="exBtn">🔄 Un altre exemple</button></div><div id="exBox"></div>
      <div class="row" style="margin-top:22px"><a class="btn primary" href="#/mod/${m.id}/practice">Ja ho tinc: a practicar →</a><a class="btn" href="#/mod/${m.id}/test">Fer el test</a></div>`;
    typeset(body);
    const show = () => {
      const gen = m.gens[Math.floor(Math.random() * m.gens.length)];
      const p = Calc.make(gen, Calc.newSeed());
      const v = new QView(p, { meta: metaOf(gen, ''), noActions: true, noKbd: true, about: aboutOf(gen) });
      $$('input', v.el).forEach(i => { i.disabled = true; });
      $('.answers', v.el).hidden = true; $('.kbd', v.el) && ($('.kbd', v.el).hidden = true);
      const box = $('#exBox'); box.innerHTML = ''; box.appendChild(v.el); v.showSolution(); v.drawPlots();
    };
    $('#exBtn').onclick = show; show();
    if (s) { const d = $('#sec-' + m.id + '-' + s); if (d) setTimeout(() => d.scrollIntoView({ block: 'start' }), 60); }
  }

  function practiceTab(body, m) {
    const sel = (practiceTab.sel = practiceTab.sel || {});
    let cur = sel[m.id] || '*';
    if (cur !== '*' && !m.gens.some(g => g.id === cur)) cur = '*';
    const exi = g => Calc.examW ? ['· no surt a l\'examen', '', '🔥', '🔥🔥🔥'][Calc.examW(g.key)] : '';
    const opt = g => `<option value="${g.id}" ${cur === g.id ? 'selected' : ''}>${exi(g)} ${esc(g.title)} — ${Calc.RANKS[store.rank(g.key)]}${store.isDue(g.key) ? ' · toca repàs' : ''}</option>`;
    const groups = [1, 2, 3].map(l => { const gs = m.gens.filter(g => g.level === l); return gs.length ? `<optgroup label="${['', '★ Bàsic', '★★ Mitjà', '★★★ Difícil'][l]}">${gs.map(opt).join('')}</optgroup>` : ''; }).join('');
    const g = m.gens.find(x => x.id === cur);
    const desc = g ? `${g.desc || ''} <span class="stars" title="Dificultat">${stars(g.level)}</span> ${Calc.examChip ? Calc.examChip(g.key) + ' <span class="muted small">' + Calc.examLabel(g.key) + '</span>' : ''}` : 'Et va posant exercicis de <b>tots els tipus</b> d\'aquesta llista. Surten més sovint els que encara no has fet o en què falles, i menys els que ja domines.';
    body.innerHTML = `<div class="gensel"><label for="genSel">Què vols practicar?</label><select id="genSel"><option value="*" ${cur === '*' ? 'selected' : ''}>🎲 De tot (prioritza el que et costa)</option>${groups}</select><button class="btn sm" data-theory="${m.id}" title="Obre la teoria al costat">📖 Teoria al costat</button><div class="gdesc">${desc}</div></div><div id="pbody"></div>`;
    $('#genSel', body).onchange = e => { sel[m.id] = e.target.value; practiceTab(body, m); };
    typeset($('.gdesc', body));
    const gens = cur === '*' ? m.gens : m.gens.filter(x => x.id === cur);
    mountPractice($('#pbody'), { gens, fixed: cur !== '*', activeId: m.id });
  }

  /* ------------------------ Tests (opció múltiple) ------------------------ */
  function bankToProblem(r, b, mod) {
    const order = r.shuffle(b.c.map((_, i) => i));
    return { type: 'mc', q: b.q, choices: order.map(i => b.c[i]), correct: order.indexOf(b.a), sol: [b.e || ''], title: 'Pregunta de teoria', mod: mod.id, fromBank: true };
  }
  function buildTest(mod, n) {
    const r = M.rng(Calc.newSeed());
    const out = [];
    const bank = r.shuffle(mod.bank).slice(0, Math.ceil(n / 2));
    bank.forEach(b => out.push({ p: bankToProblem(r, b, mod), mod }));
    let guard = 0;
    while (out.length < n && guard++ < 60 && mod.gens.length) {
      const g = pickGen(mod.gens);
      try {
        const p = Calc.make(g, Calc.newSeed()), q = Calc.toMC(r, p);
        if (q) { q.gkey = g.key; q.seed = p.seed; q.title = g.title; out.push({ p: q, mod, gen: g }); }
      } catch (e) { /* salta */ }
    }
    while (out.length < n && mod.bank.length > out.length) { const b = mod.bank[out.length]; out.push({ p: bankToProblem(r, b, mod), mod }); }
    return r.shuffle(out).slice(0, n);
  }
  function testTab(body, m) {
    const N = Math.min(10, m.bank.length + m.gens.length * 2);
    const items = buildTest(m, N);
    let i = 0, score = 0;
    const results = [];
    function show() {
      if (i >= items.length) {
        const mark = score / items.length * 10;
        body.innerHTML = `<div class="card"><h2>Resultat del test</h2><div class="score-big">${score}/${items.length}</div><p class="muted">Nota: <b>${mark.toFixed(1)}/10</b></p>
          <div class="pill-row">${results.map((r, k) => `<span class="chip ${r ? 'ok' : 'warn'}">${k + 1} ${r ? '✓' : '✗'}</span>`).join('')}</div>
          <div class="row" style="margin-top:14px"><button class="btn primary" id="again">🔄 Un altre test</button>${Calc.byId[m.id] ? `<a class="btn" href="#/mod/${m.id}/practice">Practicar el que falla</a>` : '<a class="btn" href="#/mix">Canviar la selecció</a>'}</div></div>`;
        $('#again').onclick = () => testTab(body, m);
        return;
      }
      const { p, mod, gen } = items[i];
      const v = new QView(p, { meta: `<span class="chip accent">Pregunta ${i + 1}/${items.length}</span><b>${esc(p.title || 'Test')}</b>`, noActions: true, split: true, about: gen ? aboutOf(gen) : '' });
      const nxt = document.createElement('div'); nxt.className = 'actions';
      nxt.innerHTML = '<button class="btn ok" style="visibility:hidden" title="Enter o N">' + (i + 1 === items.length ? 'Veure resultat →' : 'Següent →') + '</button><span class="muted small">Tria una opció (tecles 1–' + p.choices.length + ').</span>';
      $('.qmain', v.el).appendChild(nxt);
      v.o.onPick = () => {
        if (v.done) return;
        const a = v.getAnswer(), g = Calc.grade(p, a);
        v.mark(g.ok); v.lock(); if (g.ok) score++;
        results.push(g.ok);
        if (gen) store.record(gen.key, g.ok, p);
        v.feedback(g.ok ? 'ok' : 'bad', (g.ok ? '✅ <b>Correcte!</b>' : '❌ <b>Incorrecte.</b> La bona està marcada en verd.') + (!g.ok && gen ? refChips(gen.needs, 'Repassa') : ''));
        v.showSolution(); nxt.firstChild.style.visibility = 'visible'; renderTop(); renderSide(Calc.byId[m.id] ? m.id : 'mix');
      };
      v.o.onNext = () => { i++; show(); };
      nxt.firstChild.onclick = v.o.onNext;
      let host = $('.testhost', body);
      if (!host) { body.innerHTML = '<div class="bar testbar" style="margin-bottom:12px"><i></i></div><div class="testhost"></div>'; host = $('.testhost', body); }
      $('.testbar i', body).style.width = (i / items.length * 100) + '%';
      placeStable(host, v.el, i > 0); v.drawPlots(); Calc.cur = v;
    }
    show();
  }

  /* ------------------------ Pràctica mixta global ------------------------ */
  function practiceAll() {
    renderSide('practice');
    const scope = practiceAll.scope || 'all';
    app.innerHTML = `<h1>🎯 Pràctica mixta</h1><p class="lead">Exercicis de diversos temes barrejats, com a l'examen. Surten més sovint els tipus que <b>més surten a l'examen</b> (🔥), els que encara no has fet o en què falles${Calc.focusOn() ? ', i els del 2n parcial' : ''}.</p>
      <div class="row" style="margin-bottom:14px"><label>Abast: <select id="scopeSel"><option value="all">Totes les llistes</option><option value="class">Fonaments + Llistes 0–5 (1r parcial)</option><option value="next">Llistes 6–13 (2n parcial)</option><option value="sel">La meva selecció (Tria llistes)</option></select></label></div><div id="pbody"></div>`;
    $('#scopeSel').value = scope;
    $('#scopeSel').onchange = e => { practiceAll.scope = e.target.value; practiceAll(); };
    const gens = MODS.filter(m => scope === 'all' || (scope === 'sel' ? sel.get().includes(m.id) : scope === 'class' ? CLASS_DONE.has(m.id) : !CLASS_DONE.has(m.id))).flatMap(m => m.gens);
    mountPractice($('#pbody'), { gens, activeId: 'practice' });
  }

  /* ------------------------ Repàs d'errors ------------------------ */
  function review() {
    renderSide('review');
    const errs = store.data().errors.slice().reverse();
    app.innerHTML = '<h1>🔁 Repàs d\'errors</h1><p class="lead">Els mateixos exercicis que has fallat (amb els mateixos nombres). Quan en resolguis un bé a la primera, desapareix de la llista.</p><div id="pbody"></div>';
    if (!errs.length) { $('#pbody').innerHTML = '<div class="card"><h2>🎉 No tens errors pendents</h2><p>Segueix practicant o fes un examen per trobar punts febles.</p><a class="btn primary" href="#/practice">Pràctica mixta</a></div>'; return; }
    mountPractice($('#pbody'), { items: errs, activeId: 'review' });
  }

  /* ------------------------ Mode examen ------------------------ */
  function examConfig() {
    renderSide('exam');
    const cfg = examConfig.cfg = examConfig.cfg || { mods: sel.get(), fmt: 'mixt', n: 10, min: 60, hard: false };
    app.innerHTML = `<h1>📝 Mode examen</h1><p class="lead">Simula un examen real: sense correcció fins que entreguis, amb temporitzador i nota sobre 10. Les preguntes es generen de nou cada cop.</p>
      <div class="card"><h3 style="margin-top:0">Temes</h3>
        <div class="row" style="margin-bottom:8px"><button class="btn sm" data-q="all">Tots</button><button class="btn sm" data-q="sel">La meva selecció</button><button class="btn sm" data-q="class">Fonaments + L0–L5</button><button class="btn sm" data-q="next">Llistes 6–13</button><button class="btn sm" data-q="p2">2n parcial (L7–L13)</button><button class="btn sm" data-q="none">Cap</button></div>
        <div class="optlist grid cols3">${MODS.map(m => `<label><input type="checkbox" value="${m.id}" ${cfg.mods.includes(m.id) ? 'checked' : ''}> <b>${esc(m.num)}</b> ${esc(sideName(m))}</label>`).join('')}</div></div>
      <div class="card" style="margin-top:14px"><div class="row" style="gap:22px">
        <label>Format<br><select id="fFmt"><option value="mixt">Mixt (test + problemes)</option><option value="test">Només test</option><option value="prob">Només problemes</option></select></label>
        <label>Preguntes<br><select id="fN">${[6, 8, 10, 12, 15, 20].map(n => `<option>${n}</option>`).join('')}</select></label>
        <label>Temps<br><select id="fMin">${[[0, 'Sense límit'], [20, '20 min'], [30, '30 min'], [45, '45 min'], [60, '60 min'], [90, '90 min'], [120, '120 min']].map(x => `<option value="${x[0]}">${x[1]}</option>`).join('')}</select></label>
        <label><input type="checkbox" id="fHard"> Només nivell mitjà/alt (examen real)</label></div></div>
      <div class="row" style="margin-top:16px"><button class="btn primary" id="startExam">▶️ Començar examen</button></div>`;
    $('#fFmt').value = cfg.fmt; $('#fN').value = cfg.n; $('#fMin').value = cfg.min; $('#fHard').checked = cfg.hard;
    $$('[data-q]').forEach(b => b.onclick = () => {
      const q = b.getAttribute('data-q');
      $$('.optlist input').forEach(i => { const id = i.value; i.checked = q === 'all' || (q === 'sel' && sel.get().includes(id)) || (q === 'class' && CLASS_DONE.has(id)) || (q === 'next' && !CLASS_DONE.has(id)) || (q === 'p2' && Calc.P2_IDS.includes(id)); });
    });
    $('#startExam').onclick = () => {
      cfg.mods = $$('.optlist input:checked').map(i => i.value);
      cfg.fmt = $('#fFmt').value; cfg.n = +$('#fN').value; cfg.min = +$('#fMin').value; cfg.hard = $('#fHard').checked;
      if (!cfg.mods.length) { alert('Escull almenys un tema.'); return; }
      examRun(cfg);
    };
  }
  function buildExam(cfg) {
    const r = M.rng(Calc.newSeed());
    const mods = r.shuffle(cfg.mods.map(id => Calc.byId[id]));
    const nTest = cfg.fmt === 'test' ? cfg.n : (cfg.fmt === 'prob' ? 0 : Math.round(cfg.n * 0.3));
    const used = {}, qs = [];
    const pickG = (mod, needConv) => {
      let pool = mod.gens.filter(g => !cfg.hard || g.level >= 2);
      if (!pool.length) pool = mod.gens;
      pool = pool.slice().sort((a, b) => (used[a.key] || 0) - (used[b.key] || 0));
      const min = used[pool[0].key] || 0;
      const cands = pool.filter(g => (used[g.key] || 0) === min);
      return r.pick(cands);
    };
    let k = 0, guard = 0;
    while (qs.length < cfg.n && guard++ < 400) {
      const mod = mods[k++ % mods.length], isTest = qs.length < nTest;
      if (isTest && mod.bank.length && r() < 0.5) {
        const b = r.pick(mod.bank);
        if (qs.some(x => x.p.q === b.q)) continue;
        qs.push({ p: bankToProblem(r, b, mod), mod, kind: 'test' }); continue;
      }
      if (!mod.gens.length) continue;
      const g = pickG(mod);
      try {
        let p = Calc.make(g, Calc.newSeed());
        if (isTest) { const q = Calc.toMC(r, p); if (!q) continue; q.gkey = g.key; q.seed = p.seed; q.title = g.title; p = q; }
        used[g.key] = (used[g.key] || 0) + 1;
        qs.push({ p, mod, gen: g, kind: isTest ? 'test' : 'prob' });
      } catch (e) { /* salta */ }
    }
    return qs;
  }
  function examRun(cfg) {
    const qs = buildExam(cfg);
    const t0 = Date.now(), total = cfg.min * 60;
    let timer = null, submitted = false;
    app.innerHTML = `<div class="exam-top"><span class="chip accent">Examen</span><span id="prog">0/${qs.length} contestades</span><span class="spacer"></span>${cfg.min ? '<span class="timer" id="timer"></span>' : ''}<button class="btn primary" id="submitBtn">📨 Entregar</button></div><div id="qlist"></div><div class="row" style="margin-bottom:60px"><button class="btn primary" id="submitBtn2">📨 Entregar examen</button></div>`;
    const list = $('#qlist');
    const views = qs.map((q, i) => {
      const v = new QView(q.p, { meta: `<span class="qnum">${i + 1}</span><span class="chip">${q.kind === 'test' ? 'Test' : 'Problema'}</span><span class="chip accent">${esc(q.mod.llista)}</span>`, noActions: true });
      list.appendChild(v.el); v.drawPlots();
      v.el.addEventListener('input', upd); v.el.addEventListener('click', upd);
      return v;
    });
    function upd() { $('#prog').textContent = views.filter(v => !v.isEmpty(v.getAnswer())).length + '/' + qs.length + ' contestades'; }
    function tick() {
      if (!cfg.min) return;
      const left = Math.max(0, total - Math.floor((Date.now() - t0) / 1000));
      const el = $('#timer'); if (!el) return;
      el.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0');
      el.classList.toggle('low', left < 300);
      if (left <= 0) submit(true);
    }
    function submit(auto) {
      if (submitted) return;
      const blank = views.filter(v => v.isEmpty(v.getAnswer())).length;
      if (!auto && blank && !confirm('Et queden ' + blank + ' preguntes en blanc. Vols entregar igualment?')) return;
      submitted = true; clearInterval(timer); cleanup = null;
      const per = {};
      let sum = 0;
      views.forEach((v, i) => {
        const q = qs[i], a = v.getAnswer();
        let score = 0, g = { ok: false };
        if (!v.isEmpty(a)) { g = Calc.grade(q.p, a); score = g.ok ? 1 : (g.parts ? g.parts.filter(Boolean).length / g.parts.length * 0.5 : 0); }
        sum += score; q.score = score;
        const mk = per[q.mod.id] || (per[q.mod.id] = { n: 0, s: 0, mod: q.mod }); mk.n++; mk.s += score;
        v.mark(g.ok, g.parts); v.lock();
        v.feedback(g.ok ? 'ok' : 'bad', v.isEmpty(a) ? '⚪ En blanc (0 punts).' : (g.ok ? '✅ Correcte (1 punt).' : '❌ Incorrecte' + (score ? ' (' + score.toFixed(2) + ' punts parcials)' : ' (0 punts).')));
        v.showSolution();
        if (q.gen) store.record(q.gen.key, g.ok, q.p);
      });
      const mark = sum / qs.length * 10;
      store.addExam({ t: Date.now(), mark, n: qs.length, fmt: { mixt: 'mixt', test: 'test', prob: 'problemes' }[cfg.fmt], mins: Math.round((Date.now() - t0) / 60000) });
      renderTop(); renderSide('exam');
      const rows = Object.values(per).map(x => `<tr><td>${esc(x.mod.llista)}</td><td>${esc(x.mod.title.split(':')[0])}</td><td>${x.s.toFixed(1)}/${x.n}</td><td><div class="bar"><i style="width:${x.s / x.n * 100}%"></i></div></td></tr>`).join('');
      const weak = Object.values(per).filter(x => x.s / x.n < 0.6).map(x => `<a class="chip warn" href="#/mod/${x.mod.id}/practice">${esc(x.mod.llista)}</a>`).join(' ');
      const summary = document.createElement('div');
      summary.className = 'card'; summary.style.marginBottom = '16px';
      summary.innerHTML = `<h2 style="margin-top:0">Resultat de l'examen</h2><div class="row" style="gap:30px"><div><div class="score-big" style="color:${mark >= 5 ? 'var(--ok)' : 'var(--bad)'}">${mark.toFixed(1)}</div><div class="muted">sobre 10</div></div><div><b>${sum.toFixed(1)}</b> punts de ${qs.length} · ${Math.round((Date.now() - t0) / 60000)} min</div></div>
        <table class="hm" style="margin-top:12px"><tr><th>Llista</th><th>Tema</th><th>Punts</th><th style="width:30%"></th></tr>${rows}</table>
        ${weak ? '<p><b>Punts febles per repassar:</b> ' + weak + '</p>' : '<p>🎉 Cap punt feble clar. Bon treball!</p>'}
        <div class="row"><a class="btn primary" href="#/exam">Un altre examen</a><a class="btn" href="#/review">Repàs d'errors</a></div>`;
      $('.exam-top').remove(); $('#submitBtn2').parentNode.remove();
      app.insertBefore(summary, app.firstChild); window.scrollTo({ top: 0 });
      typeset(app);
    }
    $('#submitBtn').onclick = () => submit(false); $('#submitBtn2').onclick = () => submit(false);
    if (cfg.min) { timer = setInterval(tick, 1000); tick(); cleanup = () => clearInterval(timer); }
    typeset(app); window.scrollTo({ top: 0 });
  }

  function formulariPage() {
    renderSide('formulari');
    app.innerHTML = '<h1>📐 Formulari</h1><p class="lead">Tot el curs en una pàgina (pots imprimir-la amb Ctrl+P).</p>' + Calc.formulari.map(s => `<div class="card theory" style="margin-bottom:14px"><h3>${s.title}</h3>${s.html}</div>`).join('');
    typeset(app);
  }

  /* ------------------------------ Router ------------------------------ */
  function route() {
    if (cleanup) { cleanup(); cleanup = null; }
    Calc.cur = null; closeDrawer();
    document.body.classList.remove('menu-open');
    const h = location.hash || '#/';
    let m;
    renderTop();
    const ext = Calc.routes.find(r => r.re.test(h));
    if (ext) { ext.fn(h.match(ext.re), h); window.scrollTo({ top: 0 }); return; }
    if ((m = h.match(/^#\/mod\/(\w+)(?:\/(\w+))?/))) moduleView(m[1], m[2]);
    else if (h.startsWith('#/practice')) practiceAll();
    else if (h.startsWith('#/exam')) examConfig();
    else if (h.startsWith('#/review')) review();
    else if (h.startsWith('#/formulari')) formulariPage();
    else dashboard();
    if (!h.startsWith('#/practice') && !h.startsWith('#/mod')) window.scrollTo({ top: 0 });
  }
  /* ------------------------ Dreceres de teclat ------------------------ */
  const SHORTCUTS = [
    ['Enter', 'Comprova la resposta (o passa a la següent si ja has acabat)'],
    ['Shift + Enter', 'Demana una pista (dins la casella de resposta)'],
    ['Ctrl + Enter', 'Mostra la solució (dins la casella de resposta)'],
    ['Esc', 'Surt de la casella de resposta'],
    ['/', 'Torna a la casella de resposta'],
    ['H', 'Pista'], ['S', 'Veure solució'], ['E', 'Exemple semblant resolt'], ['N', 'Pregunta següent'],
    ['1 – 6', 'Tria l\'opció d\'un test'],
    ['G  i', 'Inici'], ['G  p', 'Pràctica mixta'], ['G  e', 'Mode examen'], ['G  r', 'Repàs d\'errors'],
    ['G  c', 'Camí recomanat'], ['G  t', 'Mapa del temari'], ['G  q', 'Què estudiem i per què'], ['G  f', 'Formulari'], ['G  m', 'Mestria i constància'],
    ['?', 'Mostra / amaga aquesta ajuda']
  ];
  function showKeys() {
    if ($('#keysOv')) { $('#keysOv').remove(); return; }
    const o = document.createElement('div'); o.className = 'overlay'; o.id = 'keysOv';
    o.innerHTML = '<div class="dlg"><h2 style="margin-top:0">⌨️ Dreceres de teclat</h2><div class="keys">' + SHORTCUTS.map(r => `<span>${r[0].split(/\s+/).map(k => k === '+' || k === '–' ? k : `<kbd>${esc(k)}</kbd>`).join(' ')}</span><span>${esc(r[1])}</span>`).join('') + '</div><p class="muted">Les lletres només funcionen quan no estàs escrivint en una casella.</p><div class="row"><button class="btn primary" id="keysClose">Tanca</button></div></div>';
    o.addEventListener('click', e => { if (e.target === o) o.remove(); });
    document.body.appendChild(o); $('#keysClose').onclick = () => o.remove();
  }
  Calc.showKeys = showKeys;
  const GO = { i: '#/', p: '#/practice', e: '#/exam', r: '#/review', c: '#/cami', t: '#/mapa', q: '#/curs', f: '#/formulari', m: '#/mestria' };
  let goPending = 0;
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if (e.key === 'Escape') { const o = $('#keysOv'); if (o) o.remove(); else closeDrawer(); return; }
    if (typing) return;
    const k = e.key, v = Calc.cur;
    if (k === '?') { e.preventDefault(); showKeys(); return; }
    if (goPending && Date.now() - goPending < 1500) { goPending = 0; if (GO[k.toLowerCase()]) { e.preventDefault(); location.hash = GO[k.toLowerCase()]; return; } }
    if (k === 'g' || k === 'G') { goPending = Date.now(); return; }
    if (!v || !v.el.isConnected) return;
    if (k === '/') { e.preventDefault(); v.focus(); return; }
    if (v.done && (k === 'n' || k === 'N' || k === 'Enter')) { e.preventDefault(); v.o.onNext && v.o.onNext(); return; }
    if (k === 'n' || k === 'N') { if (v.done) v.o.onNext && v.o.onNext(); return; }
    if ((k === 'h' || k === 'H') && !v.done) { v.o.onHint && v.o.onHint(); return; }
    if ((k === 's' || k === 'S') && !v.done) { v.o.onSolution && v.o.onSolution(); return; }
    if ((k === 'e' || k === 'E') && v.o.onExample) { v.o.onExample(); return; }
    if (/^[1-9]$/.test(k) && v.p.type === 'mc' && !v.done) { const l = $$('.mc label.opt', v.el)[+k - 1]; if (l) { e.preventDefault(); l.click(); const r = l.querySelector('input'); if (r) r.checked = true; v.o.onPick && v.o.onPick(); } return; }
    if (k === 'Enter' && v.p.type === 'mc' && !v.done) { v.o.onCheck && v.o.onCheck(); }
  });

  window.CalcUI = { $, $$, esc, app, typeset, QView, renderSide, renderTop, mountPractice, practiceTab, testTab, buildExam, examRun, examConfig, bankToProblem, pickGen, stars, pct, mlevel, levelName, moduleStatus, sideName, P1_IDS, CLASS_DONE, helpBlock, route, showKeys, refChips, openRef, aboutOf, placeStable, setCleanup: f => { cleanup = f; } };
  window.addEventListener('hashchange', route);
  if (Calc.ready) Calc.ready.forEach(f => f());
  route();
})();
