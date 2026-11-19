/* =====================================================================
   mod_sem3.js — Mòdul «Seminari 3» dins de CalcMaster.
   Les 36 habilitats de l'antic entrenador del seminari (derivades, cadena,
   límits i acotació, L'Hôpital, extrems, quocients a l'infinit) són ara
   tipus d'exercici de CalcMaster: tenen rang, repàs espaiat, XP i entren
   al temari. El motor que genera els exercicis és el de sem3_lib.js.
   · Calc.sem3       kit compartit amb sem3_ui.js (tipus de resposta,
                     conversió a problema de CalcMaster, resposta de referència)
   ===================================================================== */
(function () {
  'use strict';
  const S3 = (typeof window !== 'undefined' ? window : globalThis).SEM3;
  if (!S3) return;
  const X = S3.M, P = Calc.P;
  const CM = (typeof window !== 'undefined' ? window : globalThis).M;
  const SAMPLE = [-1.93, -1.37, -1.08, -0.83, -0.61, -0.41, -0.27, 0.19, 0.33, 0.52, 0.74, 0.97, 1.21, 1.46, 1.72, 2.03];
  /** Com equivFn de l'entrenador, però avaluant l'arbre de CalcMaster. */
  function cmEquiv(ast, trueF, pts) {
    let ok = 0, bad = 0;
    const ev = x => CM.evalAst(ast, { x, h: x });
    for (const x of pts || SAMPLE) {
      const t = trueF(x);
      if (!isFinite(t) || Math.abs(t) > 1e7) continue;
      const u = ev(x);
      if (!isFinite(u)) { bad++; continue; }
      if (X.close(u, t, 1e-6)) ok++; else return false;
    }
    return ok >= 3 && bad <= ok / 3;
  }

  /* ---------- tipus de resposta (els mateixos que l'app original) ---------- */
  const TYPES = {
    // Les expressions i els valors es llegeixen amb l'intèrpret de CalcMaster (el mateix de tota la web:
    // entén sinx, sin^2x, |x|, arctg, sen, 3,5…); si no se'n surt, amb el de l'antic entrenador.
    expr: {
      ph: 'p. ex.  2x*cos(x^2)', keys: ['sin(', 'cos(', 'tan(', 'e^(', 'ln(', 'sqrt(', '^', '/', '()'],
      parse: s => { try { const a = CM.parse(s, ['x', 'h']); return { cm: a, tex: CM.toTex(a) }; } catch (e) { const a = X.parse(s); return { ast: a, tex: X.tex(a) }; } },
      prev: p => p.tex, cmp: (p, part) => (p.cm ? cmEquiv(p.cm, part.f, part.pts) : X.equivFn(p.ast, part.f, part.pts)),
    },
    value: {
      ph: 'p. ex.  6   ·   3/2   ·   sqrt(3)/3', keys: ['/', 'sqrt(', 'pi', '()'],
      parse: s => { try { const a = CM.parse(s, []), v = CM.evalAst(a, {}); if (isFinite(v)) return { v, tex: CM.toTex(a) }; } catch (e) { /* l'antic */ } return X.parseValue(s); },
      prev: p => p.tex, cmp: (p, part) => X.close(p.v, part.v),
    },
    limit: {
      ph: 'p. ex.  3/2   ·   inf   ·   -inf   ·   no existeix', keys: ['inf', '-inf', 'no existeix', '/', 'sqrt(', 'e^('],
      parse: X.parseLimit, prev: p => X.limitTeX(p), cmp: (p, part) => X.sameLimit(p, part.lim),
    },
    list: {
      ph: 'p. ex.  0, -1, sqrt(3)/3   ·   cap', keys: ['sqrt(', '/', ', ', 'cap'],
      parse: X.parseList, prev: p => X.listTeX(p), cmp: (p, part) => X.sameList(p, part.list),
    },
    intervals: {
      ph: 'p. ex.  (-inf, -1) U (1, inf)   ·   cap', keys: ['(', '-inf', 'inf', ', ', ')', ' U ', 'sqrt(', 'cap'],
      parse: X.parseIntervals, prev: p => X.intervalsTeX(p), cmp: (p, part) => X.sameIntervals(p, part.intervals),
    },
  };
  const KEYNAMES = { 'sin(': 'sin', 'cos(': 'cos', 'tan(': 'tan', 'e^(': 'e^', 'ln(': 'ln', 'sqrt(': '√', '()': '( )', '-inf': '−∞', inf: '∞', 'no existeix': 'no existeix', ', ': ',', ' U ': '∪', cap: 'cap' };
  const keysOf = t => TYPES[t].keys.map(k => [KEYNAMES[k] || k, k]);
  /** Resposta correcta en LaTeX. */
  function answerTeX(part) {
    if (part.type === 'mcq') { const o = part.options.find(x => x.ok); return o.tex ? '$' + o.tex + '$' : o.html; }
    if (part.type === 'limit') return '$' + X.limitTeX(part.lim) + '$';
    if (part.type === 'value' && !part.answerTeX) return '$' + X.numTeX(part.v) + '$';
    if (part.type === 'order') return '<ol>' + part.items.map(t => `<li>${t}</li>`).join('') + '</ol>';
    return '$' + part.answerTeX + '$';
  }
  /** Corregeix una resposta escrita: true / false; llança error si no s'entén. */
  function check(part, str) { const T = TYPES[part.type]; return !!T.cmp(T.parse(String(str)), part); }
  /** Una resposta de referència en text (per a les proves automàtiques). */
  function refAnswer(part) {
    const num = v => (Number.isInteger(v) ? String(v) : String(+v.toPrecision(15)));
    const lim = l => (l.k === 'num' ? num(l.v) : l.k === 'inf' ? (l.s > 0 ? 'inf' : '-inf') : 'no existeix');
    const end = e => (e.v === Infinity ? 'inf' : e.v === -Infinity ? '-inf' : num(e.v));
    if (part.type === 'expr') return typeof part.ans === 'string' ? part.ans : null;
    if (part.type === 'value') return num(part.v);
    if (part.type === 'limit') return lim(part.lim);
    if (part.type === 'list') return part.list.length ? part.list.map(e => num(e.v)).join(', ') : 'cap';
    if (part.type === 'intervals') return part.intervals.length ? part.intervals.map(iv => `(${end(iv.a)}, ${end(iv.b)})`).join(' U ') : 'cap';
    return null;
  }
  /** Converteix un apartat de l'antic motor en un problema de CalcMaster. */
  function toProblem(part, extra) {
    const sol = part.why ? [part.why] : [];
    const o = Object.assign({ hint: part.hint ? String(part.hint).replace(/<[^>]+>/g, '') : undefined, sem3: part }, extra || {});
    if (part.type === 'mcq') {
      const ok = part.options.findIndex(x => x.ok);
      return P.mcFixed(part.label, part.options.map(x => (x.tex ? '$' + x.tex + '$' : x.html)), ok, sol, o);
    }
    const T = TYPES[part.type];
    const at = answerTeX(part).replace(/^\$|\$$/g, '');
    return P.multi(part.label, [{ label: '', kind: 'custom', ph: T.ph, prev: s => T.prev(T.parse(s)), check: s => ({ ok: check(part, s) }), ansTex: at }], sol, Object.assign(o, { keys: keysOf(part.type) }));
  }
  /** Executa f amb Math.random substituït per l'aleatori amb llavor r (exercicis reproduïbles). */
  function seeded(r, f) { const old = Math.random; Math.random = r; try { return f(); } finally { Math.random = old; } }
  Calc.sem3 = { S3, TYPES, answerTeX, check, refAnswer, toProblem, seeded, keysOf };

  /* ---------- habilitats → tipus d'exercici ---------- */
  const NEEDS = { A: ['dertab', 'regles'], B: ['cadena'], C: ['limits', 'cont'], D: ['indet', 'lhop', 'formes'], E: ['quad', 'factor', 'signe'], F: ['monot', 'concav', 'absext'], G: ['limits', 'asimp'] };
  const AREA_LEVEL = { A: 1, E: 1, B: 2, C: 2, G: 2, D: 3, F: 3 };
  const store = () => Calc.store;
  const gens = S3.SK.SKILLS.map(sk => ({
    id: sk.id.replace(/-/g, '_'), title: sk.name, level: AREA_LEVEL[sk.area], needs: NEEDS[sk.area], area: sk.area, s3: sk.id,
    about: sk.th,
    make(r) {
      // dificultat segons el teu rang en aquesta habilitat: Nou/Iniciat → fàcil, fins a Practicant → mitjà, després → difícil
      const key = this.rankKey || this.key || ('sem3.' + this.id), rk = store() ? store().rank(key) : 0;
      const tier = rk <= 1 ? 1 : rk <= 3 ? 2 : 3;
      const part = seeded(r, () => S3.SK.gen(sk.id, tier));
      return toProblem(part, { tier });
    },
  }));

  /* ---------- teoria: les 6 parts del seminari + com escriure les respostes ---------- */
  const TNAME = { chain: '1 · Regla de la cadena', limder: '2 · Derivada via límit (x^k sin(1/x))', study: '3 · Estudi d\'una funció', ratlim: '4 · Límits de quocients a l\'infinit', hopital: 'Regla de l\'Hôpital', extrem: 'Extrems relatius', syntax: 'Com escriure les respostes a la web' };
  const theory = Object.keys(TNAME).filter(k => S3.THEORY[k]).map(k => `<h3>${TNAME[k]}</h3>` + S3.THEORY[k].replace(/<h3>/gi, '<h4>').replace(/<\/h3>/gi, '</h4>')).join('\n');

  // Les habilitats NO són un mòdul a part: merge.js les col·loca a la llista on pertanyen (L1–L4, Fonaments),
  // com a variant d'un tipus d'exercici que ja hi era o com a tipus nou. Així la mestria és una sola.
  Calc.sem3.gens = gens;
  Calc.sem3.theory = theory;
  Calc.sem3.TNAME = TNAME;
  Calc.sem3.bank = [

      { q: '$\\sin^2(x^3)$ vol dir…', c: ['$\\sin(\\sin(x^3))$', '$\\big(\\sin(x^3)\\big)^2$', '$\\sin(x^6)$', '$\\sin(x^3)\\cdot x^3$'], a: 1, e: 'El quadrat és la capa de fora: $(\\sin(x^3))^2$.' },
      { q: 'Quantes capes té $\\cos(\\sin(\\sin^2(x^2)))$ (comptant $x^2$)?', c: ['3', '4', '5', '2'], a: 2, e: '$\\cos\\to\\sin\\to\\square^2\\to\\sin\\to x^2$: 5 factors a la derivada.' },
      { q: '$\\lim_{x\\to0}x^2\\sin(1/x)=$', c: ['no existeix', '$0$', '$1$', '$\\infty$'], a: 1, e: 'Zero per acotada: $|x^2\\sin(1/x)|\\le x^2\\to0$.' },
      { q: 'Si $n<m$, $\\lim_{x\\to+\\infty}\\frac{P_n(x)}{Q_m(x)}=$', c: ['$\\frac{a_n}{b_m}$', '$0$', '$\\pm\\infty$', 'no existeix'], a: 1, e: 'El denominador creix més ràpid.' },
      { q: 'Per demostrar que $f(x)=x^3-x$ no té màxim absolut a $\\mathbb R$ n\'hi ha prou amb…', c: ['$f\'(x)\\neq0$', '$\\lim_{x\\to+\\infty}f(x)=+\\infty$', '$f(0)=0$', '$f\'\'(0)=0$'], a: 1, e: 'Si $f$ creix sense límit, cap valor és el màxim.' },
      { q: 'Un punt amb $f\'(c)=0$ i $f\'\'(c)>0$ és…', c: ['màxim relatiu', 'mínim relatiu', 'inflexió', 'no se sap'], a: 1, e: 'Criteri de la 2a derivada: còncava cap amunt → vall.' },
    ]
  ;
})();
