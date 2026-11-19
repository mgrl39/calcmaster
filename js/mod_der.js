/* =====================================================================
   mod_der.js — Mòdul «Derivar» (portat de Càlcul dx, itinerari
   «Només derivades»). 36 esglaons, de les constants a les derivades
   llargues d'examen, amb exercicis infinits (generadors de dx_lib.js)
   i la mestria de CalcMaster (rang, repàs espaiat, errors).
   També defineix DXLIB.cm: l'adaptador problema-dx → problema-CalcMaster
   que fa servir mod_int.js.
   ===================================================================== */
(function () {
  'use strict';
  const L = (typeof window !== 'undefined' ? window : globalThis).DXLIB, P = Calc.P;
  if (!L) return;

  /* ---------------- Adaptador dx → CalcMaster ---------------- */
  // Els generadors de dx fan servir Math.random: el substituïm pel generador amb llavor
  // de CalcMaster perquè cada exercici sigui reproduïble (repàs d'errors, revisions).
  function withSeed(r, fn) { const old = Math.random; Math.random = r; try { return fn(); } finally { Math.random = old; } }
  const parseCache = new Map();
  function parses(e, v) {
    const k = v + '|' + e;
    if (!parseCache.has(k)) { let ok = false; try { M.parse(String(e), [v]); ok = true; } catch (er) { ok = false; } parseCache.set(k, ok); }
    return parseCache.get(k);
  }
  function constVal(e) {
    try { const f = M.compile(String(e), ['x']), a = f(0.37), b = f(1.71); return isFinite(a) && Math.abs(a - b) < 1e-12 ? a : NaN; } catch (er) { return NaN; }
  }
  const ASK = { d: 'Deriva:', i: 'Calcula la primitiva:', v: 'Calcula:' };
  function qHtml(p) {
    if (p.t === 'c') return p.q;
    let ask = p.ask || ASK[p.t] || '';
    if (p.t === 'd' && !p.ask && /^f\(x\)=/.test(p.q)) ask = 'Calcula $f\'(x)$:';
    let h = ask + `<div class="dxq">$$${p.q}$$</div>`;
    if (p.pre) h += `<div class="small muted">Escriu només el que va després de $${p.pre}$</div>`;
    if (p.t === 'i') h += '<div class="small muted">La constant $+C$ és opcional.</div>';
    return h;
  }
  // Comprovació independent (com p.check als altres mòduls): deriva numèricament i compara.
  function mkCheck(p, v) {
    if (p.ask || p.n || p.tay || p.tan || p.imp || p.par || !p.f || !p.e || (p.v && p.v.length > 1)) return null;
    const lo = (p.dom || [0.3, 1.2])[0], hi = (p.dom || [0.3, 1.2])[1];
    const [F, f] = p.t === 'd' ? [p.f, p.e] : p.t === 'i' ? [p.e, p.f] : [null, null];
    if (!F) return null;
    return () => {
      let Fc, fc; try { Fc = M.compile(F, [v]); fc = M.compile(f, [v]); } catch (e) { return false; }
      let n = 0;
      for (let k = 1; k <= 7; k++) {
        const x = lo + (hi - lo) * k / 8, a = M.numDiff(Fc, x, 1e-5), b = fc(x);
        if (!isFinite(a) || !isFinite(b)) continue;
        if (Math.abs(a - b) > 1e-4 * Math.max(1, Math.abs(b))) return false;
        n++;
      }
      return n >= 3;
    };
  }
  /** Converteix un problema de dx en un problema de CalcMaster (resposta escrita si es pot). */
  function toP(p, r) {
    const q = qHtml(p), sol = (p.s || []).slice();
    const v = p.v && p.v.length === 1 ? p.v[0] : 'x';
    if ((p.t === 'd' || p.t === 'i') && p.e && !(p.v && p.v.length > 1) && !p.imp && parses(p.e, v)) {
      const ansTex = p.t === 'i' ? String(p.a).replace(/\+\s*C\s*$/, '') : p.a;
      const pr = P.fn(q, String(p.e), sol, { ansTex, range: p.dom || [0.3, 1.2], utc: p.t === 'i', v });
      const ck = mkCheck(p, v); if (ck) pr.check = ck;
      return pr;
    }
    if (p.t === 'v' && p.e != null) {
      const val = constVal(p.e);
      if (isFinite(val)) return P.num(q, val, sol, { ansTex: p.a });
    }
    const w = x => (p.t === 'c' ? x : '$' + x + '$');
    return P.mc(r, q, w(p.a), (p.w || []).map(w), sol);
  }
  // Totes les tècniques de les dades (derivar i integrar), per id
  const SK = {};
  [...L.D_UNITS, ...L.I_UNITS].forEach(u => u.items.forEach(s => { SK[s.id] = Object.assign({ unit: u }, s); }));
  /** Generador a partir d'un conjunt de problemes fixos (s'escull amb la llavor). */
  function poolMake(probs, hint) { return r => { const p = toP(r.pick(probs), r); if (hint) p.hint = hint; return p; }; }
  /** Generador a partir d'un generador infinit de dx. */
  function genMake(key, hint) { return r => { const p = withSeed(r, () => L.DX.gen(key)); if (!p) return null; const q = toP(p, r); if (hint) q.hint = hint; return q; }; }
  const ruleHint = tex => (tex ? 'Regla: $' + tex + '$' : undefined);
  // Preguntes conceptuals (tipus 'c') → banc de test del mòdul
  const bankOf = ids => ids.flatMap(id => (SK[id] ? SK[id].p : []).filter(p => p.t === 'c').map(p => ({ q: p.q, c: [p.a, ...p.w], a: 0, e: (p.s || []).join(' ') })));
  const tableHtml = (rows, h1, h2) => `<div class="tablewrap"><table class="tbl"><tr><th>${h1}</th><th>${h2}</th></tr>${rows.map(([a, b]) => `<tr><td>$${a}$</td><td>$${b}$</td></tr>`).join('')}</table></div>`;
  L.cm = { withSeed, toP, SK, poolMake, genMake, ruleHint, bankOf, tableHtml };

  /* ---------------- Mòdul Derivar ---------------- */
  const LEVEL = [1, 1, 2, 2, 3];
  const NEEDS = { 0: ['dertab', 'pot'], 1: ['dertab'], 2: ['regles'], 3: ['cadena'], 4: ['regles', 'cadena'] };
  const NEEDS_ID = { D_ordre: ['regles'], D_tang: ['tangent'], D_logd: ['logdiff'], D_impl: ['implicit'], D_hip: ['dertab'] };
  const gens = L.DNODES.map(n => {
    const sk = (n.sk || []).map(id => SK[id]).filter(Boolean);
    const hint = ruleHint(n.r || (sk[0] && sk[0].r));
    const make = n.gen ? genMake(n.gen, hint) : poolMake(sk.flatMap(s => s.p), hint);
    return { id: n.id.replace(/^D_/, '').toLowerCase(), title: n.n, level: LEVEL[n.g] || 2, needs: NEEDS_ID[n.id] || NEEDS[n.g], desc: n.i, make };
  });
  // Tècniques de derivació i aplicacions que a dx només tenen problemes fixos
  const EXTRA = [
    ['lim', 'Derivada per definició (límit)', 2, ['limits', 'regles']],
    ['inv', 'Derivada de la funció inversa', 3, ['inversa', 'regles']],
    ['arghip', 'Hiperbòliques inverses', 2, ['dertab']],
    ['param', 'Corbes paramètriques', 3, ['regles', 'cadena']],
    ['hop', 'L\'Hôpital (amb derivades)', 3, ['indet']],
    ['tay', 'Polinomi de Taylor', 3, ['taylor']],
    ['mono', 'Creixement i extrems', 3, ['monot']],
    ['curv', 'Curvatura i inflexió', 3, ['concav']],
    ['opt', 'Extrems i optimització', 3, ['optim']],
    ['estudi', 'Estudi complet', 3, ['estudi']],
  ];
  EXTRA.forEach(([id, title, level, needs]) => {
    const s = SK[id];
    if (!s || !s.p.some(p => p.t !== 'c')) return;
    gens.push({ id: 'x_' + id, title, level, needs, desc: s.i, make: poolMake(s.p.filter(p => p.t !== 'c'), ruleHint(s.r)) });
  });

  /* ---------------- Teoria (organitzada com el graf de dx) ---------------- */
  const node = n => `<div class="box"><b>${n.icon ? n.icon + ' · ' : ''}${n.n}</b>${n.r ? `<div class="formula">$$${n.r}$$</div>` : ''}${n.i ? `<p>${n.i}</p>` : ''}</div>`;
  let theory = `<h3>Com funciona aquest apartat</h3>
<p>Derivar és l'eina que fas servir a <b>tots</b> els temes: tangents, extrems, L'Hôpital, Taylor, i també per comprovar qualsevol primitiva. Aquí ho entrenes de zero en <b>36 esglaons</b>, de les constants a les derivades llargues d'examen. Cada esglaó genera exercicis nous cada cop i té el seu rang.</p>
<p><b>Ordre recomanat:</b> segueix les seccions d'aquesta teoria de dalt a baix. Quan un esglaó et surt sol (Competent), passa al següent. Si a un altre tema falles una derivada, torna a l'esglaó que toca.</p>
<p><b>Com escriure la resposta:</b> <code>3x^2+1</code>, <code>e^(2x)</code>, <code>ln(x)</code>, <code>sqrt(x)</code>, <code>sin(x)^2</code>, <code>atan(x)</code>, <code>sec(x)</code>. No cal simplificar: qualsevol expressió equivalent és correcta.</p>
<h3>Taula de derivades</h3>${tableHtml(L.TABLES.d, '$f(x)$', '$f\'(x)$')}`;
  L.DGROUPS.forEach(([t, d], g) => {
    theory += `<h3>${g + 1}. ${t}</h3><p class="muted">${d}</p>` + L.DNODES.filter(n => n.g === g).map(node).join('');
  });
  theory += '<h3>Aplicacions de la derivada</h3>' + EXTRA.map(([id]) => SK[id]).filter(Boolean).map(s => node({ n: s.n, r: s.r, i: s.i })).join('');

  Calc.add({
    id: 'der', num: 'D', llista: 'Derivar', title: 'Derivar: de xⁿ a les derivades llargues d\'examen',
    short: '36 esglaons de derivació (constants → potències → elementals → producte i quocient → cadena → derivades llargues), amb exercicis infinits.',
    desc: 'Portat de «Càlcul dx». És l\'eina de tots els temes del curs: si falles una derivada, entrena-la aquí.',
    theory, gens,
    bank: bankOf(['lim', 'inv', 'opt', 'idea', 'mono', 'curv', 'estudi']),
  });
})();
