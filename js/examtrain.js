/* ===================================================================
   examtrain.js — Entrenament d'exàmens reals amb mestria.
   Cada apartat (i cada pregunta de test) dels exàmens reals del 1r i del
   2n parcial té un rang. Es resol en paper, es mira la solució i
   t'autoavalues. Per dominar-lo l'has de treure net diverses vegades en
   dies diferents (repàs espaiat): així no és «me'l sé de memòria».
   =================================================================== */
(function () {
  'use strict';
  if (!window.CalcUI || !Calc.examKit) return;
  const U = CalcUI, $ = U.$, $$ = U.$$, esc = U.esc, app = U.app, K = Calc.examKit, el = K.el, store = Calc.store, RANKS = Calc.RANKS;
  const has = n => { try { return typeof (0, eval)(n) !== 'undefined'; } catch (e) { return false; } };
  const E1 = has('REAL_EXAMS') ? REAL_EXAMS : [], E2 = has('P2_EXAMS') ? P2_EXAMS : [];
  const pill = r => `<span class="rk r${r}">${RANKS[r]}</span>`;

  /* ---------- Tots els apartats ---------- */
  let PARTS = null;
  function parts() {
    if (PARTS) return PARTS;
    PARTS = [];
    const push = (par, e, ei) => {
      (e.test || []).forEach((q, k) => { if (q.correct >= 0) PARTS.push({ key: 'P' + par + ':' + e.id + ':t' + k, par, exam: e, ei, title: 'Pregunta de test ' + (k + 1), mc: q, q: q.q, t: q.t ? [q.t] : (K.partTags ? K.partTags(q.q) : []) }); });
      (e.problems || []).forEach((p, pi) => p.parts.forEach((part, k) => PARTS.push({
        key: 'P' + par + ':' + e.id + ':' + pi + ':' + k, par, exam: e, ei, title: p.title, statement: p.statement, q: part.q, sol: part.sol,
        t: part.t || (K.partTags ? K.partTags((p.statement || '') + ' ' + part.q) : [])
      })));
    };
    E2.forEach((e, i) => push(2, e, i)); E1.forEach((e, i) => push(1, e, i));
    return PARTS;
  }
  Calc.examParts = parts;

  /* Migració: autoavaluacions antigues de la pàgina del 2n parcial */
  (function migrate() {
    try {
      if (localStorage.getItem('calcmaster.p2parts.mig')) return;
      const old = JSON.parse(localStorage.getItem('calcmaster.p2parts') || '{}'), d = store.data(), now = Date.now();
      Object.keys(old).forEach(k => {
        const key = 'P2:' + k; if (d.xparts[key]) return;
        const v = old[k], x = { pts: v === 2 ? 1 : 0, days: v === 2 ? 1 : 0, n: 1, due: now, okDay: null, day: null, mark: null, best: 0 };
        x.best = Calc.partRankOf(x); d.xparts[key] = x;
      });
      store.save(); localStorage.setItem('calcmaster.p2parts.mig', '1');
    } catch (e) { /* res */ }
  })();

  const reqTxt = x => {
    if (x && x.best >= 6) return 'rang màxim';
    const nx = Calc.partNext(x), r = Math.min(6, (x ? x.best : 0) + 1);
    return '→ ' + RANKS[r] + ': ' + nx.map(q => (q.done ? '✓ ' : '') + q.have + '/' + q.need + ' ' + q.label).join(' · ');
  };
  const dueTxt = x => { if (!x) return ''; const dd = Math.ceil((x.due - Date.now()) / 864e5); return dd <= 0 ? '<span class="chip warn">toca repàs</span>' : `<span class="muted small">repàs en ${dd} d</span>`; };

  /** Caixa d'autoavaluació amb rang (es fa servir a les pàgines d'examen i a l'entrenament). */
  Calc.exBox = function (key, onChange) {
    const b = el('div', 'selfev');
    const draw = () => {
      const x = store.part(key), today = x && x.day === Calc.dayStr(new Date());
      b.innerHTML = `<div class="row"><span class="muted small">Mestria d'aquest apartat</span>${pill(x ? x.best : 0)}<span class="small">${reqTxt(x)}</span>${dueTxt(x)}</div>
        <div class="row"><span class="muted small">Com t'ha anat${today ? ' avui' : ''}?</span>${[[2, '✅ Resolt sol'], [1, '🤔 A mitges'], [0, '❌ No me n\'he sortit']].map(([n, t]) => `<button type="button" class="btn sm ${today && x.mark === n ? 'primary' : ''}" data-v="${n}">${t}</button>`).join('')}</div>`;
      $$('[data-v]', b).forEach(btn => btn.onclick = () => {
        const info = store.markPart(key, +btn.dataset.v);
        if (info.firstToday && Calc.toast) Calc.toast('⭐', '+' + info.xp + ' XP', info.v === 2 ? 'Apartat d\'examen resolt sol' : 'Apartat d\'examen treballat');
        if (info.to > info.from && Calc.toast) Calc.toast('▲', 'Apartat d\'examen: ' + RANKS[info.to], '');
        if (Calc.afterPart) Calc.afterPart(info); U.renderTop(); draw(); if (onChange) onChange(info);
      });
    };
    draw(); return b;
  };
  /** Marca automàticament una pregunta de test quan es contesta. */
  Calc.exAutoMC = function (block, key, correctIdx) {
    $$('.xopt', block).forEach((o, oi) => o.addEventListener('click', () => {
      const x = store.part(key); if (x && x.day === Calc.dayStr(new Date())) return;
      const info = store.markPart(key, oi === correctIdx ? 2 : 0); if (Calc.afterPart) Calc.afterPart(info); U.renderTop();
    }));
  };

  const dueParts = sel => parts().filter(p => sel(p) && store.partDue(p.key));
  Calc.partsDueCount = () => dueParts(() => true).length;

  /* ---------- Estadístiques ---------- */
  function pstats(sel) {
    const ps = parts().filter(sel), counts = [0, 0, 0, 0, 0, 0, 0];
    ps.forEach(p => counts[store.partRank(p.key)]++);
    return { n: ps.length, counts, dom: counts[5] + counts[6], tried: ps.filter(p => store.part(p.key)).length, due: ps.filter(p => store.partDue(p.key)).length };
  }
  const bar = s => `<div class="mbar">${[6, 5, 4, 3, 2, 1].map(r => s.counts[r] ? `<i class="r${r}" style="width:${s.counts[r] / s.n * 100}%" title="${RANKS[r]}: ${s.counts[r]}"></i>` : '').join('')}</div>`;
  Calc.examStats = pstats;

  /* ---------- Cua: primer els que toca repassar, després els nous (exàmens recents primer), després els més fluixos ---------- */
  function queue(sel) {
    const ps = parts().filter(sel), now = Date.now();
    const score = p => {
      const x = store.part(p.key);
      if (!x) return 500 - p.ei * 10 - (p.par === 2 && Calc.focusOn && Calc.focusOn() ? 0 : 5) + (p.exam.hot ? 5 : 0);
      if (x.due <= now) return 1000 + Math.min(100, (now - x.due) / 864e5) - x.best * 10;
      return 100 - x.best * 10 - (x.due - now) / 864e6;
    };
    return ps.map(p => ({ p, s: score(p) })).sort((a, b) => b.s - a.s).map(o => o.p);
  }

  let scope = null, curKey = null;
  function page() {
    U.renderSide('entrena');
    scope = scope || (Calc.focusOn && Calc.focusOn() ? 'p2' : 'all');
    const sel = p => scope === 'all' || (scope === 'p2' ? p.par === 2 : p.par === 1);
    const s1 = pstats(p => p.par === 1), s2 = pstats(p => p.par === 2), sx = pstats(sel);
    const q = queue(sel), cur = (curKey && q.find(p => p.key === curKey)) || q[0];
    curKey = cur ? cur.key : null;
    app.innerHTML = `<h1>🎓 Entrenament d'exàmens</h1>
      <p class="lead">Els apartats dels exàmens reals, un per un. Resol-lo <b>en paper i sense mirar</b>, obre la solució i sigues sincer. Per <i>dominar</i> un apartat no n'hi ha prou de fer-lo un cop: l'has de treure net <b>${Calc.XP_PTS[5]} vegades en ${Calc.XP_DAYS[5]} dies diferents</b> (el repàs espaiat te'l tornarà a posar quan toqui). Així saps fer-lo, no recordar-lo.</p>
      <div class="grid cols2">
        <div class="card"><div class="row"><b>2n parcial</b><span class="muted small">${s2.dom}/${s2.n} dominats · ${s2.tried} treballats · ${s2.due} per repassar</span></div>${bar(s2)}</div>
        <div class="card"><div class="row"><b>1r parcial</b><span class="muted small">${s1.dom}/${s1.n} dominats · ${s1.tried} treballats · ${s1.due} per repassar</span></div>${bar(s1)}</div>
      </div>
      <div class="row" style="margin:14px 0"><span class="muted small">Exàmens:</span>${[['p2', '2n parcial'], ['p1', '1r parcial'], ['all', 'Tots']].map(([k, t]) => `<button class="btn sm ${scope === k ? 'primary' : ''}" data-sc="${k}">${t}</button>`).join('')}<span class="spacer"></span><span class="muted small">${sx.due ? `<b>${sx.due}</b> per repassar · ` : ''}${sx.n - sx.tried} sense fer</span></div>
      <div id="etHost"></div>`;
    $$('[data-sc]').forEach(b => b.onclick = () => { scope = b.dataset.sc; curKey = null; page(); });
    const host = $('#etHost');
    if (!cur) { host.innerHTML = '<div class="card">No hi ha apartats.</div>'; return; }
    const x = store.part(cur.key);
    const c = el('div', 'card exprob');
    c.appendChild(el('div', 'row', `<span class="chip ${cur.par === 2 ? 'accent' : ''}">${cur.par === 2 ? '2n parcial' : '1r parcial'}</span><a class="chip" href="#/${cur.par === 2 ? 'p2' : 'p1'}/exam/${esc(cur.exam.id)}">${esc(cur.exam.title)}</a><span class="muted small">${esc(cur.title)}</span><span class="spacer"></span>${!x ? '<span class="chip">nou</span>' : x.due <= Date.now() ? '<span class="chip warn">toca repàs</span>' : ''}`));
    if (cur.statement) c.appendChild(el('div', 'qtext', cur.statement));
    if (cur.mc) {
      const item = K.prepMC(cur.mc, true), blk2 = K.mcBlock(item, '', 'instant');
      $$('.xopt', blk2).forEach((o, oi) => o.addEventListener('click', () => { const xx = store.part(cur.key); if (xx && xx.day === Calc.dayStr(new Date())) return; const info = store.markPart(cur.key, oi === item.correctPos ? 2 : 0); if (Calc.afterPart) Calc.afterPart(info); U.renderTop(); next.hidden = false; }));
      c.appendChild(blk2);
    } else {
      c.appendChild(el('div', 'qtext', cur.q));
    }
    const tg = (cur.t || []).filter(t => Calc.byId[t]);
    if (tg.length) c.appendChild(el('div', 'row', '<span class="muted small">Tema:</span>' + tg.map(t => `<button type="button" class="ref" data-theory="${t}">${esc(Calc.byId[t].llista)} · ${esc(U.sideName(Calc.byId[t]))}</button>`).join('')));
    if (!cur.mc) c.appendChild(K.solToggle(cur.sol));
    const next = el('button', 'btn primary', 'Següent apartat →'); next.hidden = !(x && x.day === Calc.dayStr(new Date()));
    if (!cur.mc) c.appendChild(Calc.exBox(cur.key, () => { next.hidden = false; }));
    next.onclick = () => { const q2 = queue(sel).filter(p => p.key !== cur.key); curKey = q2.length ? q2[0].key : null; page(); window.scrollTo({ top: 0 }); };
    const nr = el('div', 'row'); nr.style.marginTop = '12px'; nr.appendChild(el('span', 'spacer')); nr.appendChild(next); c.appendChild(nr);
    host.appendChild(c);
    K.render(app);
  }
  Calc.routes.push({ re: /^#\/entrena/, fn: page });
  U.route();
})();
