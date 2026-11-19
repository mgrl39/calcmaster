/* =====================================================================
   sem3_rapid.js — «⚡ Ràpids» del Seminari 3: exercicis curts a l'estil CalcMaster,
   un per a cada pas dels 4 exercicis del seminari (cadena llarga, x^k·sin(1/x),
   estudi d'una cúbica, P/Q a l'infinit). Números nous cada vegada.
   · No són una mestria a part: merge.js els afegeix com a VARIANT del tipus d'exercici
     de la llista on viu aquest coneixement (l2.chain_multi, l3.crit_cubic, l1.limit_inf…).
   · Calc.sem3.rapid = [{ id, ex (1–4), title, make }]   (claus de font: 'sem3r.<id>')
   ===================================================================== */
(function () {
  'use strict';
  const G = typeof window !== 'undefined' ? window : globalThis;
  const Calc = G.Calc, M = G.M;
  if (!Calc || !Calc.sem3) return;
  const P = Calc.P;
  const T = v => M.numTex(v);
  const frac = (a, b) => { const g = (x, y) => (y ? g(y, x % y) : Math.abs(x)); const d = g(a, b) * (b < 0 ? -1 : 1); return [a / d, b / d]; };
  const fracTex = (a, b) => { const [p, q] = frac(a, b); return q === 1 ? String(p) : (p < 0 ? '-' : '') + '\\frac{' + Math.abs(p) + '}{' + q + '}'; };
  const tx = s => M.tex(s, false);
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  /* ---------------- Exercici 1 · regla de la cadena ---------------- */
  // capes: f(u) i la seva derivada f'(u) (com a text de CalcMaster)
  const OUT = {
    sin: { f: u => `sin(${u})`, d: u => `cos(${u})`, n: '\\sin' },
    cos: { f: u => `cos(${u})`, d: u => `-sin(${u})`, n: '\\cos' },
    sq: { f: u => `(${u})^2`, d: u => `2*(${u})`, n: '(\\cdot)^2' },
    cu: { f: u => `(${u})^3`, d: u => `3*(${u})^2`, n: '(\\cdot)^3' },
    exp: { f: u => `e^(${u})`, d: u => `e^(${u})`, n: 'e^{(\\cdot)}' },
  };
  const INNER = [['x^2', '2*x', 'x^2'], ['x^3', '3*x^2', 'x^3'], ['2*x', '2', '2x'], ['3*x', '3', '3x'], ['x^2+1', '2*x', 'x^2+1']];
  function chain(r, nOuter) {
    const inn = r.pick(INNER);
    let u = inn[0]; const layers = [], kinds = [];
    for (let i = 0; i < nOuter; i++) {
      const prev = kinds[kinds.length - 1];
      let opts = ['sin', 'cos', 'sq', 'cu'];
      if (prev === 'sq' || prev === 'cu') opts = ['sin', 'cos'];
      if ((prev === 'sin' || prev === 'cos') && !kinds.includes('exp') && i === nOuter - 1) opts = opts.concat('exp'); // e^ només sobre una funció acotada
      const k = r.pick(opts); kinds.push(k); layers.push({ k, u }); u = OUT[k].f(u);
    }
    // f'(x) = producte de les derivades de cada capa, de fora cap a dins
    const factors = layers.slice().reverse().map(L => OUT[L.k].d(L.u)).concat(inn[1]);
    const names = kinds.slice().reverse().map(k => OUT[k].n).concat(inn[2]);
    return { f: u, ans: factors.map(s => '(' + s + ')').join('*'), factors, names, layers, inn };
  }
  const rapid = [];
  rapid.push({
    id: 'chain5', ex: 1, level: 2, title: 'Cadena de 3 a 5 capes (com l\'exercici 1)',
    make(r) {
      const c = chain(r, r.int(2, 4));
      return P.fn(`Deriva (regla de la cadena, capa a capa):$$f(x)=${tx(c.f)}$$`, c.ans,
        [`Capes de fora cap a dins: $${c.names.join('\\to ')}$.`, `Una derivada per capa, multiplicades: $$f'(x)=${c.factors.map(s => tx(s)).join('\\cdot ')}$$`],
        { ansTex: c.factors.map(s => tx(s)).join('\\cdot ') });
    },
  });
  rapid.push({
    id: 'chainval', ex: 1, level: 2, title: 'Cadena: f\'(a) en un punt',
    make(r) {
      const c = chain(r, r.int(2, 3));
      const a = r.pick([0.5, 1, 1.5]);
      const v = M.evalAst(M.parse(c.ans), { x: a });
      if (!isFinite(v) || Math.abs(v) < 0.05 || Math.abs(v) > 500) return null;
      return P.num(`$$f(x)=${tx(c.f)}$$Calcula $f'(${T(a)})$ (amb 3 decimals n'hi ha prou).`, v,
        [`$f'(x)=${c.factors.map(s => tx(s)).join('\\cdot ')}$`, `Substitueix $x=${T(a)}$ (calculadora en radiants): $f'(${T(a)})\\approx ${M.round ? M.round(v, 4) : v.toFixed(4)}$.`], { tol: 1e-3 });
    },
  });

  /* ---------------- Exercici 2 · x^k·sin(b/x), f(0)=0 ---------------- */
  const xkf = (r, kmin, kmax) => {
    const k = r.int(kmin, kmax), a = r.pick([1, 1, 2, 3]), b = r.pick([1, 1, 2, 3]), tr = r.pick(['sin', 'cos']);
    const fx = (a === 1 ? '' : a) + (k === 0 ? '' : k === 1 ? 'x' : 'x^{' + k + '}') + '\\' + tr + '\\left(\\tfrac{' + b + '}{x}\\right)';
    return { k, a, b, tr, tex: `f(x)=\\begin{cases}${fx} & x\\neq0\\\\ 0 & x=0\\end{cases}` };
  };
  rapid.push({
    id: 'xk_class', ex: 2, level: 2, title: 'x^k·sin(1/x): contínua? derivable? C¹?',
    make(r) {
      const f = r() < 0.15 ? xkf(r, 0, 0) : xkf(r, 1, 4);
      const ok = f.k === 0 ? 0 : f.k === 1 ? 1 : f.k === 2 ? 2 : 3;
      const why = [
        `$\\${f.tr}(${f.b}/x)$ oscil·la entre $-1$ i $1$ quan $x\\to0$: el límit no existeix, i $f$ no és contínua.`,
        `Contínua: $|f(x)|\\le ${f.a}|x|\\to0$. Però $\\frac{f(h)-f(0)}{h}=${f.a === 1 ? '' : f.a}\\${f.tr}(${f.b}/h)$ no té límit: no és derivable en $0$.`,
        `$\\frac{f(h)-f(0)}{h}=${f.a === 1 ? '' : f.a}h\\,\\${f.tr}(${f.b}/h)\\to0$ (acotada per zero): $f'(0)=0$. Però $f'(x)$ per a $x\\ne0$ conté un terme $\\pm${f.a * f.b}\\${f.tr === 'sin' ? 'cos' : 'sin'}(${f.b}/x)$ que no té límit: $f'$ no és contínua en $0$.`,
        `$\\frac{f(h)-f(0)}{h}=${f.a === 1 ? '' : f.a}h^{${f.k - 1}}\\${f.tr}(${f.b}/h)\\to0$: $f'(0)=0$. I tots els termes de $f'(x)$ porten com a mínim $x^{${f.k - 2}}$ davant d'una acotada: $f'(x)\\to0=f'(0)$. És $C^1$.`,
      ];
      return P.mcFixed(`$$${f.tex}$$Què és cert en $x=0$?`, ['No és contínua en $0$', 'Contínua, però no derivable en $0$', 'Derivable en $0$, però $f\'$ no és contínua en $0$', 'Derivable i $f\'$ contínua en $0$ (és $C^1$)'], ok,
        [why[ok], 'Regla ràpida amb $x^k\\sin(1/x)$: $k=0$ no contínua · $k=1$ contínua · $k=2$ derivable · $k\\ge3$ de classe $C^1$.']);
    },
  });
  rapid.push({
    id: 'xk_der', ex: 2, level: 2, title: 'x^k·sin(b/x): f\'(x) per a x≠0',
    make(r) {
      const f = xkf(r, 2, 4), { k, a, b, tr } = f;
      const ans = tr === 'sin' ? `${k * a}*x^(${k - 1})*sin(${b}/x) - ${a * b}*x^(${k - 2})*cos(${b}/x)` : `${k * a}*x^(${k - 1})*cos(${b}/x) + ${a * b}*x^(${k - 2})*sin(${b}/x)`;
      return P.fn(`$$${f.tex}$$Calcula $f'(x)$ per a $x\\neq0$.`, ans,
        [`Producte: $(x^{${k}})'=${k}x^{${k - 1}}$ i, per la cadena, $\\big(\\${tr}(${b}/x)\\big)'=${tr === 'sin' ? '' : '-'}\\${tr === 'sin' ? 'cos' : 'sin'}(${b}/x)\\cdot\\left(-\\frac{${b}}{x^2}\\right)$.`, `$f'(x)=${tx(ans)}$`]);
    },
  });
  rapid.push({
    id: 'xk_f0', ex: 2, level: 2, title: 'x^k·sin(1/x): f\'(0) i lim f\'(x)',
    make(r) {
      const f = xkf(r, 1, 3), askLim = r() < 0.5;
      const dne = askLim ? f.k <= 2 : f.k === 1;
      const choices = ['$0$', '$1$', '$' + (f.a === 1 ? -1 : f.a) + '$', 'No existeix'];
      return P.mcFixed(`$$${f.tex}$$${askLim ? 'Quant val $\\displaystyle\\lim_{x\\to0}f\'(x)$?' : 'Quant val $f\'(0)$ (per definició)?'}`, choices, dne ? 3 : 0,
        [askLim ? `Per a $x\\ne0$, $f'(x)$ té el terme $${f.a * f.b}x^{${f.k - 2}}\\,\\${f.tr === 'sin' ? 'cos' : 'sin'}(${f.b}/x)$: ${f.k - 2 >= 1 ? 'tendeix a 0 (acotada per una cosa que va a 0)' : 'no té límit (oscil·la' + (f.k === 1 ? ' i creix' : '') + ')'}.`
          : `$\\frac{f(h)-0}{h}=${f.a === 1 ? '' : f.a}h^{${f.k - 1}}\\${f.tr}(${f.b}/h)$: ${f.k >= 2 ? 'tendeix a $0$ (zero per acotada)' : 'oscil·la, no té límit'}.`,
          'Compte: $f\'(0)$ pot existir encara que $\\lim_{x\\to0}f\'(x)$ no existeixi (passa amb $k=2$).']);
    },
  });

  /* ---------------- Exercici 3 · estudi d'una cúbica ---------------- */
  // f'(x) = 3a(x-p)(x-q) amb p<q enters i p+q parell → coeficients enters
  function cubicPQ(r) {
    let p, q; do { p = r.int(-4, 3); q = r.int(p + 1, 5); } while ((p + q) % 2);
    const a = r() < 0.7 ? 1 : -1, d = r.int(-5, 5);
    const c = [d, 3 * a * p * q, -3 * a * (p + q) / 2, a]; // ascendent
    return { p, q, a, c, f: x => M.polyEval(c, x) };
  }
  rapid.push({
    id: 'cubic_ext', ex: 3, level: 2, title: 'Cúbica: màxim, mínim i inflexió',
    make(r) {
      if (r() < 0.45) {
        // tipus seminari: f(x)=ax^3-bx → crítics ±√(b/3a) (irracionals)
        const a = r.pick([1, 1, 2]), b = r.pick([1, 2, 4, 5, 7, 10].filter(v => !Number.isInteger(Math.sqrt(v / (3 * a))))), s = Math.sqrt(b / (3 * a));
        const [pp, qq] = frac(b, 3 * a), st = `\\sqrt{${qq === 1 ? pp : '\\frac{' + pp + '}{' + qq + '}'}}`;
        return P.multi(`$$f(x)=${a === 1 ? '' : a}x^3-${b}x$$Troba l'abscissa del màxim relatiu, del mínim relatiu i del punt d'inflexió.`,
          [{ label: '$x_{\\text{màx}}=$', ans: -s, ansTex: '-' + st }, { label: '$x_{\\text{mín}}=$', ans: s, ansTex: st }, { label: '$x_{\\text{infl}}=$', ans: 0 }],
          [`$f'(x)=${3 * a}x^2-${b}=0\\iff x=\\pm${st}$.`, `Signes de $f'$: $+\\,|\\,-\\,|\\,+$ → màxim a $-${st}$ i mínim a $${st}$.`, `$f''(x)=${6 * a}x$ canvia de signe a $x=0$: inflexió.`, 'Pots escriure les arrels com a sqrt(…)/… o amb decimals.']);
      }
      const C = cubicPQ(r), mx = C.a > 0 ? C.p : C.q, mn = C.a > 0 ? C.q : C.p;
      return P.multi(`$$f(x)=${M.polyTex(C.c)}$$Troba l'abscissa del màxim relatiu, del mínim relatiu i del punt d'inflexió.`,
        [{ label: '$x_{\\text{màx}}=$', ans: mx }, { label: '$x_{\\text{mín}}=$', ans: mn }, { label: '$x_{\\text{infl}}=$', ans: (C.p + C.q) / 2 }],
        [`$f'(x)=${M.polyTex(M.polyDer(C.c))}=${C.a > 0 ? '' : '-'}3\\left(${G.H.xm(C.p)}\\right)\\left(${G.H.xm(C.q)}\\right)$`, `Signes de $f'$: ${C.a > 0 ? '$+\\,|\\,-\\,|\\,+$' : '$-\\,|\\,+\\,|\\,-$'} → màxim a $x=${mx}$, mínim a $x=${mn}$.`, `$f''(x)=0$ a $x=${T((C.p + C.q) / 2)}$ (punt mitjà dels crítics): inflexió.`]);
    },
  });
  rapid.push({
    id: 'cubic_mono', ex: 3, level: 1, title: 'Cúbica: on creix?',
    make(r) {
      const C = cubicPQ(r), I = (a, b) => `(${a},\\,${b})`, out = `$${I('-\\infty', C.p)}\\cup${I(C.q, '+\\infty')}$`, mid = `$${I(C.p, C.q)}$`;
      const ok = C.a > 0 ? out : mid, bad = C.a > 0 ? mid : out;
      return P.mc(r, `$$f(x)=${M.polyTex(C.c)}$$On és <b>creixent</b> $f$?`, ok, [bad, `$${I('-\\infty', C.q)}$`, `$${I(C.p, '+\\infty')}$`],
        [`$f'(x)=${M.polyTex(M.polyDer(C.c))}$ s'anul·la a $x=${C.p}$ i $x=${C.q}$.`, `Signe de $f'$ (prova un punt de cada tros): ${C.a > 0 ? '$+\\,|\\,-\\,|\\,+$' : '$-\\,|\\,+\\,|\\,-$'}. Creix on $f'>0$: ${ok}.`]);
    },
  });
  rapid.push({
    id: 'cubic_abs', ex: 3, level: 2, title: 'Cúbica: extrems absoluts',
    make(r) {
      const C = cubicPQ(r);
      if (r() < 0.5) {
        const pos = C.a > 0;
        const ok = pos ? 'No: $\\lim_{x\\to+\\infty}f=+\\infty$ i $\\lim_{x\\to-\\infty}f=-\\infty$' : 'No: $\\lim_{x\\to+\\infty}f=-\\infty$ i $\\lim_{x\\to-\\infty}f=+\\infty$';
        return P.mc(r, `$$f(x)=${M.polyTex(C.c)}$$Té màxim i mínim <b>absoluts</b> a $\\mathbb R$?`, ok,
          ['Sí: el màxim relatiu i el mínim relatiu són els absoluts', `Sí: a $x=${C.p}$ i $x=${C.q}$`, 'No: perquè $f\'(x)\\neq0$'],
          ['Un polinomi de grau senar va a $\\pm\\infty$ pels dos costats: per a qualsevol $M$ hi ha punts amb $f>M$ i amb $f<-M$.', 'Així ho justifica el seminari: amb els límits a $\\pm\\infty$.']);
      }
      const lo = C.p - r.int(1, 2), hi = C.q + r.int(0, 2), cand = [lo, C.p, C.q, hi].filter(x => x >= lo && x <= hi);
      const wantMax = r() < 0.5, vals = cand.map(C.f), v = wantMax ? Math.max(...vals) : Math.min(...vals);
      return P.num(`$$f(x)=${M.polyTex(C.c)}$$Quin és el <b>${wantMax ? 'màxim' : 'mínim'} absolut</b> (el valor) de $f$ a $[${lo},${hi}]$?`, v,
        [`Candidats: els extrems de l'interval i els crítics de dins ($x=${C.p}$, $x=${C.q}$).`, cand.map(x => `$f(${x})=${T(C.f(x))}$`).join(' · '), `El ${wantMax ? 'més gran' : 'més petit'}: $${T(v)}$.`]);
    },
  });
  rapid.push({
    id: 'cubic_zeros', ex: 3, level: 1, title: 'Cúbica: zeros (factoritzar)',
    make(r) {
      const z = []; while (z.length < 3) { const v = r.int(-4, 4); if (!z.includes(v)) z.push(v); }
      z.sort((a, b) => a - b);
      if (r() < 0.5 && !z.includes(0)) z[r.int(0, 2)] = 0; z.sort((a, b) => a - b);
      if (new Set(z).size < 3) return null;
      const c = M.polyMul(M.polyMul([-z[0], 1], [-z[1], 1]), [-z[2], 1]);
      return P.multi(`Troba els zeros de $f(x)=${M.polyTex(c)}$ (de petit a gran).`, z.map((v, i) => ({ label: `$x_${i + 1}=$`, ans: v })),
        [z.includes(0) ? 'Treu factor comú $x$ i resol el segon grau.' : 'Prova divisors del terme independent (Ruffini) i després resol el segon grau.', `$f(x)=${z.map(v => '(' + (v === 0 ? 'x' : 'x' + (v > 0 ? '-' : '+') + Math.abs(v)) + ')').join('')}$`]);
    },
  });

  /* ---------------- Exercici 4 · P(x)/Q(x) a l'infinit ---------------- */
  const randPoly = (r, n, lead) => { const c = []; for (let i = 0; i < n; i++) c.push(r.int(-6, 6)); c.push(lead); return c; };
  function ratLim(n, m, a, b, dir) {
    if (n < m) return 0;
    if (n === m) return a / b;
    return (a / b) * Math.pow(dir, n - m) > 0 ? Infinity : -Infinity;
  }
  const limTex = v => (v === Infinity ? '+\\infty' : v === -Infinity ? '-\\infty' : Number.isInteger(v) ? String(v) : null);
  rapid.push({
    id: 'ratinf', ex: 4, level: 1, title: 'P(x)/Q(x) quan x→±∞',
    make(r) {
      const n = r.int(1, 3), m = r.int(1, 3), a = r.nz(-5, 5), b = r.nz(-5, 5), dir = r() < 0.65 ? 1 : -1;
      const Pc = randPoly(r, n, a), Qc = randPoly(r, m, b), L = ratLim(n, m, a, b, dir);
      const lt = limTex(L) || fracTex(a, b);
      return P.num(`$$\\lim_{x\\to${dir > 0 ? '+' : '-'}\\infty}\\frac{${M.polyTex(Pc)}}{${M.polyTex(Qc)}}$$Escriu el valor, o <code>inf</code> / <code>-inf</code>.`, L,
        [`Traiem $x^{${n}}$ a dalt i $x^{${m}}$ a baix: $\\dfrac{x^{${n}}(${a}+\\dots)}{x^{${m}}(${b}+\\dots)}=x^{${n - m}}\\cdot\\dfrac{${a}+\\dots}{${b}+\\dots}$, i els «$\\dots$» tendeixen a $0$.`,
          n < m ? `$n<m$: $x^{${n - m}}\\to0$ → el límit és $0$.` : n === m ? `$n=m$: queda $\\frac{a_n}{b_m}=${fracTex(a, b)}$.` : `$n>m$: $x^{${n - m}}\\to${dir > 0 || (n - m) % 2 === 0 ? '+' : '-'}\\infty$ i el signe el decideix també $\\frac{${a}}{${b}}$: $${lt}$.`],
        { ansTex: lt });
    },
  });
  rapid.push({
    id: 'ratgen', ex: 4, level: 2, title: 'P/Q a l\'infinit: el cas general (graus i signes)',
    make(r) {
      const n = r.int(1, 5), m = r.int(1, 5), a = r.nz(-4, 4), b = r.nz(-4, 4), dir = r() < 0.6 ? 1 : -1, L = ratLim(n, m, a, b, dir);
      const choices = ['$+\\infty$', '$-\\infty$', '$' + fracTex(a, b) + '$', '$0$'];
      const ok = L === Infinity ? 0 : L === -Infinity ? 1 : n === m ? 2 : 3;
      return P.mcFixed(`$P$ té grau $n=${n}$ i coeficient principal $a_n=${a}$; $Q$ té grau $m=${m}$ i $b_m=${b}$. Quant val $\\displaystyle\\lim_{x\\to${dir > 0 ? '+' : '-'}\\infty}\\frac{P(x)}{Q(x)}$?`, choices, ok,
        ['$\\frac{P}{Q}=x^{n-m}\\cdot\\frac{a_n+\\dots}{b_m+\\dots}$, i la fracció de la dreta tendeix a $\\frac{a_n}{b_m}$.', n < m ? '$n<m$ → $0$.' : n === m ? '$n=m$ → $\\frac{a_n}{b_m}$.' : `$n>m$ → $\\pm\\infty$: signe de $\\frac{a_n}{b_m}$ (${a * b > 0 ? '+' : '−'})${dir < 0 ? ` per $(-1)^{n-m}=(-1)^{${n - m}}$ (${(n - m) % 2 ? '−' : '+'})` : ''}.`]);
    },
  });

  /* =====================================================================
     🧭 INTUÏCIÓ — endevinar amb criteri. La gràcia és NO fer tot el càlcul: reconèixer
     l'estructura, estimar, descartar opcions impossibles, jutjar si una resposta és plausible.
     Cada tipus porta una «regla de cop d'ull» (rule), que surt com a pista i a la solució.
     Calc.sem3.intuit (claus 'sem3i.<id>'), també variants dels tipus de les llistes (merge.js).
     ===================================================================== */
  const intuit = [];
  const S = v => String(v);
  intuit.push({
    id: 'ch_count', ex: 1, level: 1, title: 'Quants factors tindrà f\'? (sense derivar)',
    rule: 'Cadena: una derivada per capa, totes multiplicades. Compta les capes i ja saps la forma de la resposta.',
    make(r) {
      const c = chain(r, r.int(2, 4)), n = c.factors.length;
      return P.mc(r, `$$f(x)=${tx(c.f)}$$<b>Sense derivar</b>: quants factors (multiplicats) tindrà $f'(x)$ amb la regla de la cadena?`, S(n), [S(n - 1), S(n + 1), S(2), S(n + 2)],
        [`Capes de fora cap a dins: $${c.names.join('\\to ')}$ → ${n} capes → ${n} factors.`, 'Si a l\'examen no et surt sencera, escriu almenys l\'estructura: «derivada de la capa de fora (amb el de dins igual) · derivada de la següent · …». Ja és mig exercici.']);
    },
  });
  intuit.push({
    id: 'ch_pick', ex: 1, level: 2, title: 'Quina pot ser f\'? (descarta les impossibles)',
    rule: 'La bona té un factor per capa, i a cada factor el «de dins» queda igual. Si en falta un, o el de dins ha canviat, descarta-la.',
    make(r) {
      const c = chain(r, r.int(2, 3)), F = c.factors.map(x => tx(x)), ok = F.join('\\cdot ');
      const noInner = F.slice(0, -1).join('\\cdot ');
      const L0 = c.layers[c.layers.length - 1], lost = [tx(OUT[L0.k].d('x'))].concat(F.slice(1)).join('\\cdot ');
      const neg = '-\\left(' + ok + '\\right)';
      return P.mc(r, `$$f(x)=${tx(c.f)}$$Quina d'aquestes <b>pot ser</b> $f'(x)$? Intenta-ho sense derivar: descarta les que no poden ser.`, '$' + ok + '$', ['$' + noInner + '$', '$' + lost + '$', '$' + neg + '$'],
        [`Té ${F.length} capes ($${c.names.join('\\to ')}$): la bona té ${F.length} factors.`, 'Descarta: la que té un factor menys (s\'ha oblidat la derivada de dins), la que ha posat $x$ dins de la capa de fora, i la del signe canviat.']);
    },
  });
  intuit.push({
    id: 'bnd_guess', ex: 2, level: 1, title: '«Zero per acotada»: va a 0 o no existeix?',
    rule: '(cosa que va a 0) · (acotada, com sin(1/x)) → 0. Però sin(1/x) sola, o dividida per una cosa que va a 0, oscil·la: no té límit.',
    make(r) {
      const p = r.int(1, 3), b = r.pick([1, 2, 3]), tr = r.pick(['sin', 'cos']), mode = r.pick(['mul', 'mul', 'only', 'div']);
      const g = `\\${tr}\\left(\\tfrac{${b}}{x}\\right)`, xp = p === 1 ? 'x' : `x^{${p}}`;
      const e = mode === 'mul' ? xp + g : mode === 'only' ? g : `\\dfrac{${g}}{${xp}}`;
      return P.mcFixed(`Sense calcular: quant val $$\\lim_{x\\to0}${e}\\;?$$`, ['$0$', '$1$', 'No existeix', '$+\\infty$'], mode === 'mul' ? 0 : 2,
        [mode === 'mul' ? `$|${xp}${g}|\\le|x|^{${p}}\\to0$: zero per acotada → $0$.` : mode === 'only' ? `$${g}$ oscil·la entre $-1$ i $1$ cada cop més ràpid: no té límit.` : `Dividir l'oscil·lació per una cosa que va a $0$ la fa encara més gran (entre $-\\infty$ i $+\\infty$): no té límit.`,
          'Això és exactament el que es fa a l\'exercici 2 del seminari per veure si $f$ és contínua i derivable en $0$.']);
    },
  });
  const DOM = [
    { t: '\\ln x', r: 1 }, { t: '(\\ln x)^2', r: 1.5 }, { t: '\\sqrt{x}', r: 2 }, { t: 'x', r: 3 }, { t: 'x^3', r: 4 }, { t: 'x^{10}', r: 5 }, { t: '2^x', r: 6 }, { t: 'e^x', r: 6.5 }, { t: 'e^{2x}', r: 7 }, { t: 'x^x', r: 9 },
  ];
  intuit.push({
    id: 'lim_dom', ex: 4, level: 1, title: 'Qui guanya a l\'infinit? (jerarquia)',
    rule: 'A +∞: logaritmes ≪ potències ≪ exponencials ≪ xˣ. Al quocient mana el que creix més: si és a dalt → ∞; si és a baix → 0.',
    make(r) {
      let A, B; do { A = r.pick(DOM); B = r.pick(DOM); } while (Math.abs(A.r - B.r) < 0.5);
      const k = r.pick([1, 2, 3, 5]), sg = r() < 0.25 ? -1 : 1, top = A.r > B.r;
      return P.mcFixed(`Sense fer L'Hôpital, quant val $$\\lim_{x\\to+\\infty}\\frac{${sg < 0 ? '-' : ''}${k === 1 ? '' : k}${A.t}}{${B.t}}\\;?$$`, ['$0$', '$+\\infty$', '$-\\infty$', `$${sg * k}$`], top ? (sg > 0 ? 1 : 2) : 0,
        [`Jerarquia a $+\\infty$: $\\ln x\\ll x^a\\ll a^x\\ll x^x$. Aquí creix més ${top ? 'el numerador' : 'el denominador'} ($${top ? A.t : B.t}$).`, `Per tant el quocient ${top ? 'va a l\'infinit, amb el signe del coeficient' : 'va a $0$'}. Les constants que multipliquen no canvien qui guanya.`]);
    },
  });
  intuit.push({
    id: 'lim_1inf', ex: 4, level: 2, title: '1^∞: el truc de la e',
    rule: '(1 + a/x)^(b·x) → e^(a·b). En general, si f→1 i g→∞: f^g → e^(lim g·(f−1)).',
    make(r) {
      const a = r.nz(-4, 5), b = r.nz(-3, 4), c = r.int(0, 3);
      const base = `\\left(1${a < 0 ? '-' : '+'}\\frac{${Math.abs(a)}}{x${c ? '+' + c : ''}}\\right)`;
      const E = u => '$e^{' + u + '}$';
      return P.mc(r, `Endevina-ho sense calcular: $$\\lim_{x\\to+\\infty}${base}^{${b === 1 ? '' : b === -1 ? '-' : b}x}$$`, E(a * b), [E(a + b), '$1$', E(fracTex(a, b)), '$+\\infty$', E(a)],
        ['És $1^\\infty$, que <b>no</b> val 1. Regla: $\\left(1+\\frac{a}{x}\\right)^{bx}\\to e^{ab}$' + (c ? ' (el $+' + c + '$ del denominador no canvia res a l\'infinit)' : '') + '.', `Aquí $a=${a}$, $b=${b}$: $e^{${a * b}}$. Per què: $e^{\\lim g\\,(f-1)}=e^{\\lim ${b}x\\cdot\\frac{${a}}{x}}=e^{${a * b}}$.`]);
    },
  });
  intuit.push({
    id: 'plaus_pq', ex: 4, level: 1, title: 'És plausible? (P/Q a l\'infinit)',
    rule: 'Abans de calcular, compara graus: dalt < baix → 0 · iguals → aₙ/bₘ · dalt > baix → ±∞.',
    make(r) {
      const n = r.int(1, 4), m = r.int(1, 4), a = r.nz(-5, 5), b = r.nz(-5, 5), L = ratLim(n, m, a, b, 1);
      const Pc = randPoly(r, n, a), Qc = randPoly(r, m, b);
      const cand = [0, a / b, b / a, L].filter((v, i, A) => A.indexOf(v) === i);
      const claim = r.pick(cand), ct = limTex(claim) || (claim === a / b ? fracTex(a, b) : fracTex(b, a));
      const ok = claim === L ? 0 : n < m ? 1 : n > m ? 2 : 3;
      return P.mcFixed(`Un company diu que $$\\lim_{x\\to+\\infty}\\frac{${M.polyTex(Pc)}}{${M.polyTex(Qc)}}=${ct}.$$ Sense fer càlculs: és plausible?`,
        ['Sí, és correcte', 'No: ha de ser $0$ (el grau de baix és més gran)', 'No: ha de ser $\\pm\\infty$ (el grau de dalt és més gran)', 'No: ha de ser el quocient dels coeficients principals (mateix grau)'], ok,
        [`Graus: dalt ${n}, baix ${m}. ${n < m ? 'Dalt < baix → $0$.' : n > m ? 'Dalt > baix → $\\pm\\infty$.' : `Iguals → $\\frac{${a}}{${b}}=${fracTex(a, b)}$.`}`, `El límit és $${limTex(L) || fracTex(a, b)}$.`]);
    },
  });
  intuit.push({
    id: 'cubic_shape', ex: 3, level: 1, title: 'Quina forma té la cúbica? (sense estudiar-la)',
    rule: 'El signe de a diu com acaba (a>0: acaba pujant). Si f\' (de 2n grau) té dues arrels, fa «muntanya i vall»; si no en té, sempre puja o sempre baixa.',
    make(r) {
      let a, b, c, D; do { a = r.nz(-2, 2); b = r.int(-4, 4); c = r.int(-6, 6); D = 4 * b * b - 12 * a * c; } while (D === 0);
      const f = [r.int(-5, 5), c, b, a], ok = D > 0 ? (a > 0 ? 0 : 1) : (a > 0 ? 2 : 3);
      return P.mcFixed(`$$f(x)=${M.polyTex(f)}$$Sense fer la taula: quina forma té la gràfica (d'esquerra a dreta)?`, ['Puja, baixa, puja (↗↘↗)', 'Baixa, puja, baixa (↘↗↘)', 'Sempre puja', 'Sempre baixa'], ok,
        [`$f'(x)=${M.polyTex(M.polyDer(f))}$: discriminant $${D}${D > 0 ? '>0' : '<0'}$ → ${D > 0 ? 'dues arrels: hi ha màxim i mínim' : 'cap arrel: $f\'$ no canvia de signe'}.`, `$a=${a}${a > 0 ? '>0' : '<0'}$: ${a > 0 ? 'acaba pujant' : 'acaba baixant'}.`]);
    },
  });
  intuit.push({
    id: 'infl_mid', ex: 3, level: 1, title: 'On és la inflexió? (el truc del punt mitjà)',
    rule: 'Una cúbica ax³+bx²+… té la inflexió a x = −b/(3a), just al mig dels dos punts crítics.',
    make(r) {
      const a = r.nz(-2, 2), xi = r.int(-3, 3), b = -3 * a * xi, c = r.int(-6, 6), f = [r.int(-5, 5), c, b, a];
      return P.mc(r, `$$f(x)=${M.polyTex(f)}$$Ràpid: a quina $x$ hi ha el punt d'inflexió?`, '$' + T(xi) + '$', [-xi, 3 * xi, xi + 1, xi - 2].map(v => '$' + T(v) + '$'),
        [`$f''(x)=${M.polyTex(M.polyDer(M.polyDer(f)))}=0\\iff x=-\\frac{b}{3a}=${T(xi)}$.`, 'Truc: en una cúbica, la inflexió és el punt mitjà dels dos crítics (la gràfica és simètrica respecte d\'aquest punt).']);
    },
  });
  intuit.push({
    id: 'extr_type', ex: 3, level: 1, title: 'Màxim, mínim o no se sap?',
    rule: 'f\'(c)=0 i f\'\'(c)<0 → màxim · f\'\'(c)>0 → mínim · f\'\'(c)=0 → no se sap. Amb signes: f\' de + a − → màxim; de − a + → mínim.',
    make(r) {
      const c = r.int(-3, 4);
      if (r() < 0.5) {
        const v = r.pick([-6, -2, -1, 0, 1, 3, 5]);
        return P.mcFixed(`Saps que $f'(${c})=0$ i $f''(${c})=${v}$. Què hi ha a $x=${c}$?`, ['Màxim relatiu', 'Mínim relatiu', 'Segur que no és extrem', 'No es pot saber només amb això'], v < 0 ? 0 : v > 0 ? 1 : 3,
          ['Criteri de la 2a derivada: $f\'\'<0$ (còncava, ∩) → màxim; $f\'\'>0$ (∪) → mínim.', 'Si $f\'\'(c)=0$ el criteri no diu res: pot ser màxim, mínim o res ($-x^4$, $x^4$, $x^3$ a $0$). Cal mirar el signe de $f\'$.']);
      }
      const [s1, s2] = r.pick([['+', '-'], ['-', '+'], ['+', '+'], ['-', '-']]);
      return P.mcFixed(`$f'(${c})=0$ i el signe de $f'$ passa de $${s1}$ (a l'esquerra) a $${s2}$ (a la dreta). Què hi ha a $x=${c}$?`, ['Màxim relatiu', 'Mínim relatiu', 'No és extrem', 'No es pot saber només amb això'], s1 === '+' && s2 === '-' ? 0 : s1 === '-' && s2 === '+' ? 1 : 2,
        ['Pensa en una muntanya: puja ($+$) i després baixa ($-$) → màxim; baixa i puja → mínim.', 'Si no canvia de signe, continua pujant (o baixant): no és extrem (com $x^3$ a $0$).']);
    },
  });
  intuit.forEach(g => {
    g.key = 'sem3i.' + g.id;
    g.needs = g.ex === 1 ? ['cadena'] : g.ex === 2 ? ['limits'] : g.ex === 3 ? ['monot', 'concav'] : ['limits', 'indet'];
    const mk = g.make;
    g.make = function (r) {
      const p = mk.call(this, r); if (!p) return p;
      p.hint = '🧭 ' + g.rule;
      p.sol = ['<b>🧭 Regla de cop d\'ull:</b> ' + esc(g.rule)].concat(p.sol || []);
      return p;
    };
  });
  Calc.sem3.intuit = intuit;

  rapid.forEach(g => { g.key = 'sem3r.' + g.id; g.needs = g.ex === 1 ? ['cadena'] : g.ex === 2 ? ['limits', 'regles'] : g.ex === 3 ? ['monot', 'concav', 'absext'] : ['limits', 'asimp']; });
  Calc.sem3.rapid = rapid;
  Calc.sem3.RAPID_EX = { 1: 'Exercici 1 · Regla de la cadena', 2: 'Exercici 2 · x^k·sin(1/x) en x=0', 3: 'Exercici 3 · Estudi d\'una cúbica', 4: 'Exercici 4 · P(x)/Q(x) a l\'infinit' };
})();
