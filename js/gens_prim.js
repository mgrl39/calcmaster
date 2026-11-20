/* ===================================================================
   gens_prim.js — Càlcul de primitives: el que faltava.
   · L8 (racionals): pas 0 (quasi immediata), quin pas toca, divisió
     de grau 4 entre grau 3, Ruffini amb arrels irracionals (1±√2),
     forma de les fraccions simples, constants irracionals i la
     integral sencera (divisió + Ruffini + fraccions + logaritmes).
   · L7 (polinomis trigonomètrics): potència senar, tot parell,
     quina estratègia, i sumes de diversos termes.
   · L7 (no elementals): e^{x²}, e^{-x²}, sin(x²)…: quines no tenen
     primitiva elemental i com s'escriu la primitiva com a integral.
   Cada generador de primitives porta un check() independent que
   deriva numèricament la resposta i la compara amb l'integrand.
   =================================================================== */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;
  const add = (mod, g) => { if (Calc.byId[mod]) Calc.addGen(mod, g); };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  /** fracció exacta n/d (enters) → TeX */
  const frac = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; };
  const near = (a, b, tol) => Math.abs(a - b) <= (tol || 1e-6) * Math.max(1, Math.abs(b));
  const derivCheck = (F, f, xs) => { const Fc = M.compile(F); return xs.every(x => near(M.numDiff(Fc, x), f(x), 1e-5)); };
  const peval = (p, x) => p.reduceRight((acc, c) => acc * x + c, 0);
  const pmul = (p, q) => { const o = new Array(p.length + q.length - 1).fill(0); p.forEach((x, i) => q.forEach((y, j) => { o[i + j] += x * y; })); return o; };
  const padd = (p, q) => { const o = new Array(Math.max(p.length, q.length)).fill(0); p.forEach((x, i) => { o[i] += x; }); q.forEach((x, i) => { o[i] += x; }); return o; };
  const pscale = (p, k) => p.map(c => c * k);
  const ptex = p => M.polyTex(p.slice());
  const pstr = p => p.map((c, i) => '(' + c + ')*x^' + i).join('+'); // per a M.compile
  const xm = v => H.xm(v);
  const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
  /** «+ \frac{a}{b}·cosa» amb el signe al davant (primer terme sense +) */
  const term = (n, d, body, first) => {
    if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); n /= g; d /= g;
    if (n === 0) return '';
    const s = n < 0 ? '-' : (first ? '' : '+'), a = Math.abs(n);
    if (d === 1) return s + (a === 1 ? '' : a) + body;
    return s + '\\frac{' + (a === 1 ? '' : a) + body + '}{' + d + '}';
  };
  const join = terms => { let out = ''; terms.forEach(([n, d, body]) => { out += term(n, d, body, !out); }); return out || '0'; };

  /* ======================= L8: FUNCIONS RACIONALS ======================= */

  /* Pas 0: el numerador és (un múltiple de) la derivada del denominador */
  add('l8', {
    id: 'quasi_log', title: 'Pas 0: quasi immediata (∫Q′/Q = ln|Q|)', level: 1,
    desc: 'Abans de descompondre, mira si el numerador és (un múltiple de) la derivada del denominador: llavors surt un logaritme directament.', needs: ['fracs', 'intfracs'],
    make(r) {
      let Q, R;
      if (r.int(0, 2) < 2) { // quadràtic sense arrels: x²+bx+c amb Δ<0
        const b = r.int(-4, 4), c = Math.floor(b * b / 4) + r.int(1, 4);
        Q = [c, b, 1]; R = [-2, 2];
      } else { // cúbic x³+px+q
        const p = r.int(-3, 3), q = r.nz(-4, 4);
        Q = [q, p, 0, 1]; const B = 1 + Math.max(Math.abs(p), Math.abs(q)); R = [B + 0.3, B + 2.3];
      }
      const dQ = Q.slice(1).map((c, i) => c * (i + 1));
      // numerador = (kn/kd)·Q', amb coeficients enters
      const g = dQ.reduce((a, c) => gcd(a, c), 0);
      const opts = [[1, 1], [2, 1], [3, 1], [-1, 1]]; if (g > 1) opts.push([1, g]);
      const [kn, kd] = r.pick(opts);
      const num = dQ.map(c => c * kn / kd);
      const neg = Q.length === 3; // Q>0 sempre (sense abs) si és el quadràtic
      const lnQ = neg ? '\\ln(' + ptex(Q) + ')' : '\\ln|' + ptex(Q) + '|';
      const ansTex = term(kn, kd, lnQ, true);
      const F = '(' + kn + '/' + kd + ')*ln(abs(' + pstr(Q) + '))';
      const f = x => peval(num, x) / peval(Q, x);
      const p = P.fn('Calcula $\\displaystyle\\int\\frac{' + ptex(num) + '}{' + ptex(Q) + '}\\,dx$.', F, [
        '<b>Pas 0: és quasi immediata?</b> Deriva el denominador: $(' + ptex(Q) + ')\'=' + ptex(dQ) + '$.',
        'El numerador és $' + (kn === kd ? '' : frac(kn, kd) + '\\cdot') + '(' + ptex(dQ) + ')$: és ' + (kn === kd ? 'exactament' : 'un múltiple de') + ' la derivada. No cal dividir ni fer fraccions simples!',
        '$\\displaystyle\\int\\frac{Q\'}{Q}dx=\\ln|Q|$ ⇒ resultat: $' + ansTex + '+C$.' + (neg ? ' (Aquí $' + ptex(Q) + '>0$ sempre, el valor absolut no cal.)' : '')
      ], { utc: true, ansTex, range: R });
      p.check = () => derivCheck(F, f, [R[0] + 0.3, (R[0] + R[1]) / 2, R[1] - 0.2]);
      p.integrand = '(' + pstr(num) + ')/(' + pstr(Q) + ')';
      return p;
    }
  });

  /* Quin és el primer pas? (mètode complet) */
  const STEP = [
    'Pas 0: és quasi immediata (surt $\\ln|Q|$)',
    'Dividir: $\\text{grau}(P)\\ge\\text{grau}(Q)$',
    'Factoritzar $Q$ i fer fraccions simples',
    'Completar quadrats (surt una arctangent)'
  ];
  add('l8', {
    id: 'first_step', title: 'Racionals: quin és el primer pas?', level: 1,
    desc: 'El mètode té un ordre: (0) quasi immediata? (1) dividir si grau(P) ≥ grau(Q) (2) factoritzar (3) fraccions simples (4) integrar.', needs: ['fracs'],
    make(r) {
      const t = r.int(0, 3);
      let num, den, why;
      if (t === 0) {
        const b = r.int(-3, 3), c = r.int(-6, 6); den = [c, b, 1]; num = pscale([b, 2], r.pick([1, 2, 3]));
        why = 'El numerador és un múltiple de $(' + ptex(den) + ')\'=' + ptex([b, 2]) + '$: directament $\\ln|Q|$.';
      } else if (t === 1) {
        const a = r.int(-3, 3), b = r.nz(-3, 3), deg = r.pick([2, 3]);
        den = pmul([-a, 1], [-b, 1]); num = deg === 3 ? [r.int(-4, 4), r.int(-3, 3), r.nz(-2, 2), 1] : [r.nz(-5, 5), r.int(-3, 3), 1];
        why = 'grau$(P)=' + (num.length - 1) + '\\ge2=$ grau$(Q)$: primer cal fer la divisió $P=c\\,Q+r$ (amb grau$(r)<$ grau$(Q)$).';
      } else if (t === 2) {
        const [a, b] = H.distinct(r, 2, -3, 3); den = pmul([-a, 1], [-b, 1]);
        num = r.int(0, 1) ? [r.nz(-6, 6)] : [r.nz(-5, 5), r.pick([1, 2, 3])];
        // el numerador no ha de ser múltiple de la derivada 2x-(a+b)
        if (num.length === 2 && num[0] * 2 === -(a + b) * num[1]) return null;
        why = 'grau$(P)\\lt$ grau$(Q)$ i el numerador no és la derivada de $Q$. $Q$ té arrels ($' + a + '$ i $' + b + '$): factoritza i fraccions simples.';
      } else {
        const h = r.int(-3, 3), k = r.int(1, 3); den = [h * h + k * k, -2 * h, 1]; num = [r.pick([1, 2, 3, 5])];
        why = '$' + ptex(den) + '=(' + xm(h) + ')^2+' + k * k + '$ no té arrels (discriminant $\\lt0$) i el numerador és constant: completa quadrats i surt $\\arctan$.';
      }
      if (num.every(c => c === 0)) return null;
      return P.mc(r, 'Vols calcular $\\displaystyle\\int\\frac{' + ptex(num) + '}{' + ptex(den) + '}\\,dx$. Quin és el <b>primer</b> pas?', STEP[t], STEP.filter((_, i) => i !== t), [
        why,
        'Ordre del mètode: <b>(0)</b> quasi immediata? → <b>(1)</b> dividir si cal → <b>(2)</b> factoritzar $Q$ → <b>(3)</b> fraccions simples → <b>(4)</b> integrar cada fracció.'
      ], { data: { num, den, t } });
    }
  });

  /* Divisió de grau 4 entre grau 3 (com l'exemple de classe) */
  add('l8', {
    id: 'polydiv_cubic', title: 'Divisió: grau 4 entre grau 3', level: 2,
    desc: '$P=c(x)\\,Q+r(x)$ amb grau$(r)<$ grau$(Q)$, igual que $14=4\\cdot3+2$. Després $\\int\\frac PQ=\\int c+\\int\\frac rQ$.', needs: ['fracs', 'factor'],
    make(r) {
      const Q = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3), 1];
      const c = [r.int(-4, 4), r.pick([1, 1, 1, 2])];
      const rem = [r.int(-6, 6), r.int(-7, 7), r.int(-8, 8)];
      if (rem[2] === 0 && rem[1] === 0) return null;
      const Pp = padd(pmul(c, Q), rem);
      // passos de la divisió (dues restes)
      const s1 = pscale(Q.concat([]), c[1]); const m1 = [0].concat(s1); // c1·x·Q
      const after1 = padd(Pp, pscale(m1, -1)); // grau ≤ 3
      const m2 = pscale(Q, after1[3] || 0);
      const after2 = padd(after1, pscale(m2, -1));
      const cut = p => { const o = p.slice(); while (o.length > 1 && o[o.length - 1] === 0) o.pop(); return o; };
      return P.multi('Divideix $P(x)=' + ptex(Pp) + '$ entre $Q(x)=' + ptex(Q) + '$. Escriu el quocient $c(x)=c_1x+c_0$ i el residu $r(x)=r_2x^2+r_1x+r_0$.',
        [{ label: '$c_1=$', ans: c[1] }, { label: '$c_0=$', ans: c[0] }, { label: '$r_2=$', ans: rem[2] }, { label: '$r_1=$', ans: rem[1] }, { label: '$r_0=$', ans: rem[0] }],
        [
          'Com que grau$(P)=4\\ge3=$ grau$(Q)$, cal dividir (com amb enters: $14=4\\cdot3+2$, el residu sempre és més petit que el divisor).',
          'Primer terme del quocient: $\\frac{' + ptex([0, 0, 0, 0, Pp[4]]) + '}{x^3}=' + ptex([0, c[1]]) + '$. Resta: $' + ptex(Pp) + '-(' + ptex(m1) + ')=' + ptex(cut(after1)) + '$.',
          c[0] ? 'Segon terme: $\\frac{' + ptex([0, 0, 0, after1[3]]) + '}{x^3}=' + T(after1[3]) + '$. Resta: $' + ptex(cut(after1)) + '-(' + ptex(m2) + ')=' + ptex(cut(after2)) + '$ (grau $\\lt3$: ja és el residu).' : 'El que queda ja té grau $\\lt3$: és el residu (i $c_0=0$).',
          'Per tant $' + ptex(Pp) + '=(' + ptex(c) + ')(' + ptex(Q) + ')+(' + ptex(cut(rem)) + ')$ i $\\displaystyle\\int\\frac PQdx=\\int(' + ptex(c) + ')\\,dx+\\int\\frac{' + ptex(cut(rem)) + '}{' + ptex(Q) + '}dx$.'
        ], { data: { P: Pp, Q } });
    }
  });

  /* Denominador cúbic amb una arrel entera i dues d'irracionals h±√k */
  const KS = [2, 3, 5, 6, 7];
  const cubicIrr = r => {
    const a = r.nz(-3, 3), h = r.int(-2, 2), k = r.pick(KS);
    if (h * h === k) return null;
    const q2 = [h * h - k, -2 * h, 1]; // x²-2hx+(h²-k), arrels h±√k
    return { a, h, k, q2, Q: pmul([-a, 1], q2) };
  };
  const sq = k => '\\sqrt{' + k + '}';
  const rootTex = (h, k, s) => (h ? h + (s > 0 ? '+' : '-') : (s > 0 ? '' : '-')) + sq(k);
  const ruffTable = (coefs, a) => {
    const row2 = [], row3 = [coefs[0]];
    for (let i = 1; i < coefs.length; i++) { row2.push(row3[i - 1] * a); row3.push(coefs[i] + row3[i - 1] * a); }
    return '<table class="tbl ruff"><tr><td></td>' + coefs.map(c => '<td>$' + c + '$</td>').join('') + '</tr><tr><td>$' + a + '$</td><td></td>' + row2.map(c => '<td>$' + c + '$</td>').join('') + '</tr><tr><td></td>' + row3.map((c, i) => '<td>' + (i === row3.length - 1 ? '<b>$' + c + '$</b>' : '$' + c + '$') + '</td>').join('') + '</tr></table>';
  };
  const divisors = n => { n = Math.abs(n); const o = []; for (let d = 1; d <= n; d++) if (n % d === 0) o.push(d); return o; };

  add('l8', {
    id: 'ruffini_irr', title: 'Factoritzar el denominador: Ruffini + fórmula (arrels h ± √k)', level: 2,
    desc: 'Si $Q(a)=0$, $Q=(x-a)\\,Q_1$. Candidats a arrel entera: divisors del terme independent. La quadràtica que queda pot tenir arrels irracionals com $1\\pm\\sqrt2$.', needs: ['factor', 'fracs'],
    make(r) {
      const c = cubicIrr(r); if (!c) return null;
      const { a, h, k, q2, Q } = c;
      const cand = divisors(Q[0]).flatMap(d => [d, -d]);
      const tried = cand.filter(d => d !== a).slice(0, 2).map(d => '$Q(' + d + ')=' + peval(Q, d) + '$');
      const coefs = Q.slice().reverse();
      return P.multi('Factoritza $Q(x)=' + ptex(Q) + '$. Troba l\'arrel entera $a$, el factor quadràtic $x^2+px+q$ i les seves dues arrels.',
        [{ label: 'arrel entera $a=$', ans: a }, { label: '$p=$', ans: q2[1] }, { label: '$q=$', ans: q2[0] },
          { label: 'arrel gran $x_1=$', ans: h + Math.sqrt(k), ansTex: rootTex(h, k, 1), ph: 'p.ex. 1+sqrt(2)' }, { label: 'arrel petita $x_2=$', ans: h - Math.sqrt(k), ansTex: rootTex(h, k, -1), ph: 'p.ex. 1-sqrt(2)' }],
        [
          'Candidats a arrel entera: divisors de $' + Q[0] + '$, és a dir $\\pm' + divisors(Q[0]).join(',\\pm') + '$. ' + (tried.length ? 'Per exemple ' + tried.join(', ') + ' (no són arrels).' : ''),
          '$Q(' + a + ')=0$ ⇒ Ruffini amb $' + a + '$:' + ruffTable(coefs, a),
          '$Q(x)=(' + xm(a) + ')(' + ptex(q2) + ')$. Fórmula: $x=\\frac{' + (-q2[1]) + '\\pm\\sqrt{' + (q2[1] * q2[1] - 4 * q2[0]) + '}}{2}=' + (h ? h + '\\pm' : '\\pm') + sq(k) + '$.',
          '$Q(x)=(' + xm(a) + ')\\big(x-(' + rootTex(h, k, 1) + ')\\big)\\big(x-(' + rootTex(h, k, -1) + ')\\big)$.'
        ], { data: { Q } });
    }
  });

  /* Quina forma tenen les fraccions simples? */
  const LET = 'ABCDEFGHIJ';
  add('l8', {
    id: 'decomp_form', title: 'Forma de les fraccions simples', level: 1,
    desc: 'Cada factor aporta: $(x-a)\\to\\frac{A}{x-a}$; $(x-a)^k\\to k$ fraccions; $x^2+bx+c$ irreductible $\\to\\frac{Dx+E}{x^2+bx+c}$.', needs: ['fracs'],
    make(r) {
      const roots = H.distinct(r, 3, -3, 3);
      const nf = r.int(2, 3), facs = [];
      const kinds = r.shuffle(['s', 'm', 'q', 's']).slice(0, nf);
      if (!kinds.some(k => k !== 's')) return null;
      let ri = 0;
      kinds.forEach(kd => {
        if (kd === 's') facs.push({ t: 's', a: roots[ri++] });
        else if (kd === 'm') facs.push({ t: 'm', a: roots[ri++], k: r.int(2, 3) });
        else facs.push({ t: 'q', p: r.pick([[1, 0, 1], [4, 0, 1], [1, 1, 1], [2, 2, 1], [5, 2, 1]]) });
      });
      if (facs.filter(f => f.t === 'q').length > 1) return null;
      const den = facs.map(f => f.t === 'q' ? '(' + ptex(f.p) + ')' : '(' + xm(f.a) + ')' + (f.t === 'm' ? '^' + f.k : '')).join('');
      // mode: 0 correcte, 1 sense potències intermèdies, 2 quadràtic amb constant, 3 múltiple amb numerador lineal
      const build = mode => {
        let li = 0; const L = () => LET[li++]; const parts = [];
        facs.forEach(f => {
          if (f.t === 's') parts.push('\\frac{' + L() + '}{' + xm(f.a) + '}');
          else if (f.t === 'm') {
            if (mode === 1) parts.push('\\frac{' + L() + '}{(' + xm(f.a) + ')^' + f.k + '}');
            else if (mode === 3) parts.push('\\frac{' + L() + 'x+' + L() + '}{(' + xm(f.a) + ')^' + f.k + '}');
            else for (let j = 1; j <= f.k; j++) parts.push('\\frac{' + L() + '}{' + (j === 1 ? xm(f.a) : '(' + xm(f.a) + ')^' + j) + '}');
          } else {
            if (mode === 2) parts.push('\\frac{' + L() + '}{' + ptex(f.p) + '}');
            else { const a = L(), b = L(); parts.push('\\frac{' + a + 'x+' + b + '}{' + ptex(f.p) + '}'); }
          }
        });
        return '$' + parts.join('+') + '$';
      };
      const ok = build(0);
      // paranys extra: denominadors sense potències ni quadràtic sencer, i tots els numeradors de grau 1
      const flat = '$' + facs.map((f, i) => '\\frac{' + LET[i] + '}{' + (f.t === 'q' ? ptex(f.p) : xm(f.a)) + '}').join('+') + '$';
      const allLin = '$' + facs.map((f, i) => '\\frac{' + LET[2 * i] + 'x+' + LET[2 * i + 1] + '}{' + (f.t === 'q' ? ptex(f.p) : f.t === 'm' ? '(' + xm(f.a) + ')^' + f.k : xm(f.a)) + '}').join('+') + '$';
      const wr = [...new Set([1, 2, 3].map(build).concat([flat, allLin]))].filter(w => w !== ok).slice(0, 3);
      if (wr.length < 3) return null;
      const nconst = facs.reduce((s, f) => s + (f.t === 's' ? 1 : f.t === 'm' ? f.k : 2), 0);
      return P.mc(r, 'Quina és la descomposició en fraccions simples de $\\dfrac{p(x)}{' + den + '}$ (amb grau$(p)\\lt' + nconst + '$)?', ok, wr, [
        'Regla: $(x-a)\\to\\frac{A}{x-a}$; $(x-a)^k\\to\\frac{A_1}{x-a}+\\dots+\\frac{A_k}{(x-a)^k}$ (totes les potències!); $x^2+bx+c$ irreductible $\\to\\frac{Dx+E}{x^2+bx+c}$ (numerador de grau 1).',
        'Comprovació ràpida: hi ha d\'haver tantes constants com el grau del denominador ($' + nconst + '$).'
      ], { data: { nconst } });
    }
  });

  /* Constants amb arrels irracionals (substituint cada arrel) */
  const irrSetup = r => {
    const c = cubicIrr(r); if (!c) return null;
    const A = r.nz(-3, 3), S = r.int(-8, 8), Tt = r.nz(-5, 5);
    if (S % 2 && Tt % 2 === 0) return null; // B=(S+Tt√k)/2 ha de ser "net"
    // r(x) = A·q2 + (x-a)·(S(x-h) + Tt·k)  ⇒  B=(S+Tt√k)/2 (arrel h+√k), C=(S−Tt√k)/2
    const rem = padd(pscale(c.q2, A), pmul([-c.a, 1], [-S * c.h + Tt * c.k, S]));
    if (rem.every(v => v === 0)) return null;
    const half = (s, t) => (S === 0 ? '' : String(s)) + (t < 0 ? '-' : (S === 0 ? '' : '+')) + (Math.abs(t) === 1 ? '' : Math.abs(t)) + sq(c.k);
    const Btex = '\\frac{' + half(S, Tt) + '}{2}', Ctex = '\\frac{' + half(S, -Tt) + '}{2}';
    return Object.assign(c, { A, S, Tt, rem, B: (S + Tt * Math.sqrt(c.k)) / 2, C: (S - Tt * Math.sqrt(c.k)) / 2, Btex, Ctex, x1: c.h + Math.sqrt(c.k), x2: c.h - Math.sqrt(c.k) });
  };
  const fstr = v => '(' + v + ')';
  const remTrim = p => { const o = p.slice(); while (o.length > 1 && o[o.length - 1] === 0) o.pop(); return o; };

  add('l8', {
    id: 'coef_irr', title: 'Constants A, B, C amb arrels irracionals', level: 3,
    desc: 'Dues fraccions iguals amb el mateix denominador tenen el mateix numerador. Més ràpid que el sistema: substitueix $x$ per cada arrel (també les irracionals).', needs: ['fracs', 'consts'],
    make(r) {
      const s = irrSetup(r); if (!s) return null;
      const { a, h, k, q2, Q, A, rem, Btex, Ctex } = s;
      const x1 = rootTex(h, k, 1), x2 = rootTex(h, k, -1);
      const ph = 'p.ex. (7+5sqrt(2))/2';
      return P.multi('Descompon $\\dfrac{' + ptex(remTrim(rem)) + '}{(' + xm(a) + ')(' + ptex(q2) + ')}=\\dfrac{A}{' + xm(a) + '}+\\dfrac{B}{x-(' + x1 + ')}+\\dfrac{C}{x-(' + x2 + ')}$.',
        [{ label: '$A=$', ans: A }, { label: '$B=$', ans: s.B, ansTex: Btex, ph }, { label: '$C=$', ans: s.C, ansTex: Ctex, ph }],
        [
          'Les arrels de $' + ptex(q2) + '$ són $' + x1 + '$ i $' + x2 + '$. Multiplica per $Q$: $' + ptex(remTrim(rem)) + '=A\\big(' + ptex(q2) + '\\big)+B(' + xm(a) + ')\\big(x-(' + x2 + ')\\big)+C(' + xm(a) + ')\\big(x-(' + x1 + ')\\big)$.',
          '$x=' + a + '$ anul·la $B$ i $C$: $' + peval(rem, a) + '=A\\cdot(' + peval(q2, a) + ')$ ⇒ $A=' + A + '$.',
          '$x=' + x1 + '$ anul·la $A$ i $C$: $B=\\dfrac{r(x_1)}{(x_1-' + T(a) + ')(x_1-x_2)}=' + Btex + '$ (aquí $x_1-x_2=2' + sq(k) + '$).',
          'Igual amb $x=' + x2 + '$: $C=' + Ctex + '$. (Sortir conjugades és normal: el numerador té coeficients enters.)',
          'Alternativa: igualar coeficients de $x^2$, $x$ i el terme independent i resoldre el sistema $3\\times3$ (més llarg).'
        ], { data: { rem, Q, a, x1: s.x1, x2: s.x2 } });
    }
  });

  add('l8', {
    id: 'int_full_irr', title: 'Integral racional completa (dividir + Ruffini + arrels h ± √k)', level: 3,
    desc: 'El procés sencer de teoria: divisió (si cal), Ruffini, fórmula de segon grau amb arrels irracionals, fraccions simples i logaritmes.', needs: ['fracs', 'consts', 'intfracs', 'factor'],
    make(r) {
      const s = irrSetup(r); if (!s) return null;
      const { a, h, k, q2, Q, A, rem } = s;
      const div = r.int(0, 2) > 0;
      const c = div ? [r.int(-3, 3), r.pick([1, 1, 2])] : [0];
      const num = div ? padd(pmul(c, Q), rem) : remTrim(rem);
      const x1 = rootTex(h, k, 1), x2 = rootTex(h, k, -1);
      const hi = Math.max(a, s.x1);
      const polyF = div ? '(' + c[1] + ')*x^2/2+(' + c[0] + ')*x+' : '';
      const F = polyF + A + '*ln(abs(x-(' + a + ')))+' + fstr(s.B) + '*ln(abs(x-' + fstr(s.x1) + '))+' + fstr(s.C) + '*ln(abs(x-' + fstr(s.x2) + '))';
      const polyT = div ? join([[c[1], 2, 'x^2'], [c[0], 1, 'x']]) : '';
      const hasP = polyT && polyT !== '0';
      const ansTex = (hasP ? polyT : '') + term(A, 1, '\\ln|' + xm(a) + '|', !hasP) + '+' + s.Btex + '\\ln|x-(' + x1 + ')|+' + s.Ctex + '\\ln|x-(' + x2 + ')|';
      const f = x => peval(num, x) / peval(Q, x);
      const steps = [];
      if (div) steps.push('Grau 4 ≥ grau 3: divideix. $' + ptex(num) + '=(' + ptex(c) + ')(' + ptex(Q) + ')+(' + ptex(remTrim(rem)) + ')$, així que $\\int\\frac PQ=\\int(' + ptex(c) + ')dx+\\int\\frac{' + ptex(remTrim(rem)) + '}{Q}dx$.');
      else steps.push('Grau 2 $\\lt$ grau 3 i el numerador no és la derivada de $Q$: no cal dividir.');
      steps.push('Ruffini: $Q(' + a + ')=0$ ⇒ $Q=(' + xm(a) + ')(' + ptex(q2) + ')$, i $' + ptex(q2) + '=0\\Rightarrow x=' + (h ? h + '\\pm' : '\\pm') + sq(k) + '$.');
      steps.push('Fraccions simples: $\\frac{A}{' + xm(a) + '}+\\frac{B}{x-(' + x1 + ')}+\\frac{C}{x-(' + x2 + ')}$; substituint cada arrel: $A=' + A + '$, $B=' + s.Btex + '$, $C=' + s.Ctex + '$.');
      steps.push('Cada fracció dona un logaritme: $\\int\\frac{A}{x-a}dx=A\\ln|x-a|$.');
      steps.push('Resultat: $' + ansTex + '+C$.');
      const p = P.fn('Calcula $\\displaystyle\\int\\frac{' + ptex(num) + '}{' + ptex(Q) + '}\\,dx$.', F, steps, { utc: true, ansTex, range: [hi + 0.4, hi + 3] });
      p.check = () => derivCheck(F, f, [hi + 0.6, hi + 1.5, hi + 2.7]);
      p.integrand = '(' + pstr(num) + ')/(' + pstr(Q) + ')';
      return p;
    }
  });

  /* =================== L7: POLINOMIS TRIGONOMÈTRICS =================== */
  const pw = (fn, n) => n === 1 ? '\\' + fn + ' x' : '\\' + fn + '^{' + n + '}x';
  const pws = (fn, n) => n === 1 ? fn + '(x)' : fn + '(x)^' + n;
  /** primitiva de sin^n cos^m amb una potència senar. Torna {F, tex, steps} (coeficient 1) */
  const oddPrim = (n, m, use) => {
    // use = 's' → guardem un sin (n senar), u = cos x;  use = 'c' → guardem un cos (m senar), u = sin x
    const odd = use === 's' ? n : m, other = use === 's' ? m : n, j = (odd - 1) / 2;
    const U = use === 's' ? 'cos' : 'sin', V = use === 's' ? 'sin' : 'cos', sgn = use === 's' ? -1 : 1;
    const terms = []; let F = '';
    for (let i = 0; i <= j; i++) {
      const e = other + 2 * i + 1, cn = sgn * binom(j, i) * (i % 2 ? -1 : 1);
      terms.push([cn, e, pw(U, e)]); F += '+(' + cn + '/' + e + ')*' + pws(U, e);
    }
    const tex = join(terms);
    const inner = [];
    for (let i = 0; i <= j; i++) { const e = other + 2 * i, cn = binom(j, i) * (i % 2 ? -1 : 1); inner.push([cn, 1, e === 0 ? '1' : pw(U, e)]); }
    const innerTex = join(inner).replace(/(^|[+-])1(?=[+-]|$)/, '$11');
    const steps = [
      'Potència senar: $\\' + V + '^{' + odd + '}x$. Ens en <b>guardem un</b>: $\\' + V + '^{' + odd + '}x=\\' + V + ' x\\,(\\' + V + '^2x)^{' + j + '}$ i passem la resta a $\\' + U + '$ amb $\\' + V + '^2x=1-\\' + U + '^2x$.',
      '$\\displaystyle\\int ' + (n ? pw('sin', n) : '') + (m ? pw('cos', m) : '') + '\\,dx=\\int\\' + V + ' x\\,(1-\\' + U + '^2x)^{' + j + '}' + (other ? pw(U, other) : '') + '\\,dx=\\int\\' + V + ' x\\left(' + innerTex + '\\right)dx$.',
      'Cada terme és quasi immediat: $\\int\\' + V + ' x\\,\\' + U + '^kx\\,dx=' + (sgn < 0 ? '-' : '') + '\\frac{\\' + U + '^{k+1}x}{k+1}$ (o bé $u=\\' + U + ' x$, $du=' + (sgn < 0 ? '-' : '') + '\\' + V + ' x\\,dx$).'
    ];
    return { F: F.slice(1), tex, steps };
  };
  /** primitives (verificades per check) dels casos tot parell; coeficient 1 */
  const EVEN = {
    '2,0': { F: 'x/2-sin(2x)/4', tex: '\\frac{x}{2}-\\frac{\\sin 2x}{4}', st: ['$\\sin^2x=\\frac{1-\\cos2x}{2}$.', '$\\int\\frac{1-\\cos2x}{2}dx=\\frac x2-\\frac{\\sin2x}{4}$.'] },
    '0,2': { F: 'x/2+sin(2x)/4', tex: '\\frac{x}{2}+\\frac{\\sin 2x}{4}', st: ['$\\cos^2x=\\frac{1+\\cos2x}{2}$ (surt de $1=\\sin^2x+\\cos^2x$ i $\\cos2x=\\cos^2x-\\sin^2x$, sumant-les).', '$\\int\\frac{1+\\cos2x}{2}dx=\\frac12\\left(x+\\frac{\\sin2x}{2}\\right)$.'] },
    '2,2': { F: 'x/8-sin(4x)/32', tex: '\\frac{x}{8}-\\frac{\\sin 4x}{32}', st: ['Passa-ho tot a cosinus: $\\sin^2x\\cos^2x=(1-\\cos^2x)\\cos^2x=\\cos^2x-\\cos^4x$.', '$\\int\\cos^2x=\\frac x2+\\frac{\\sin2x}4$; $\\int\\cos^4x=\\frac{3x}8+\\frac{\\sin2x}4+\\frac{\\sin4x}{32}$.', 'Restant: $\\frac x8-\\frac{\\sin4x}{32}$. (Més curt: $\\sin x\\cos x=\\frac{\\sin2x}2$ ⇒ $\\sin^2x\\cos^2x=\\frac{\\sin^22x}{4}=\\frac{1-\\cos4x}{8}$.)'] },
    '0,4': { F: '3x/8+sin(2x)/4+sin(4x)/32', tex: '\\frac{3x}{8}+\\frac{\\sin 2x}{4}+\\frac{\\sin 4x}{32}', st: ['$\\cos^4x=\\left(\\frac{1+\\cos2x}{2}\\right)^2=\\frac14\\left(1+2\\cos2x+\\cos^22x\\right)$.', 'Torna a baixar el grau: $\\cos^22x=\\frac{1+\\cos4x}{2}$.', '$\\frac14\\left(x+\\sin2x+\\frac x2+\\frac{\\sin4x}{8}\\right)=\\frac{3x}8+\\frac{\\sin2x}4+\\frac{\\sin4x}{32}$.'] },
    '4,0': { F: '3x/8-sin(2x)/4+sin(4x)/32', tex: '\\frac{3x}{8}-\\frac{\\sin 2x}{4}+\\frac{\\sin 4x}{32}', st: ['$\\sin^4x=\\left(\\frac{1-\\cos2x}{2}\\right)^2=\\frac14\\left(1-2\\cos2x+\\cos^22x\\right)$.', '$\\cos^22x=\\frac{1+\\cos4x}{2}$.', '$\\frac14\\left(x-\\sin2x+\\frac x2+\\frac{\\sin4x}{8}\\right)=\\frac{3x}8-\\frac{\\sin2x}4+\\frac{\\sin4x}{32}$.'] },
    '2,4': { F: 'x/16-sin(4x)/64+sin(2x)^3/48', tex: '\\frac{x}{16}-\\frac{\\sin 4x}{64}+\\frac{\\sin^3 2x}{48}', st: ['$\\sin^2x\\cos^4x=(\\sin x\\cos x)^2\\cos^2x=\\frac{\\sin^22x}{4}\\cdot\\frac{1+\\cos2x}{2}$.', '$=\\frac{\\sin^22x}{8}+\\frac{\\sin^22x\\cos2x}{8}$. El primer amb angle doble, el segon és quasi immediat ($u=\\sin2x$).', '$\\frac18\\left(\\frac x2-\\frac{\\sin4x}{8}\\right)+\\frac{\\sin^32x}{48}$.'] },
    '4,2': { F: 'x/16-sin(4x)/64-sin(2x)^3/48', tex: '\\frac{x}{16}-\\frac{\\sin 4x}{64}-\\frac{\\sin^3 2x}{48}', st: ['$\\sin^4x\\cos^2x=(\\sin x\\cos x)^2\\sin^2x=\\frac{\\sin^22x}{4}\\cdot\\frac{1-\\cos2x}{2}$.', '$=\\frac{\\sin^22x}{8}-\\frac{\\sin^22x\\cos2x}{8}$.', '$\\frac18\\left(\\frac x2-\\frac{\\sin4x}{8}\\right)-\\frac{\\sin^32x}{48}$.'] }
  };
  const monoTex = (n, m) => (n ? pw('sin', n) : '') + (m ? (n ? '\\,' : '') + pw('cos', m) : '');
  const monoStr = (n, m) => [n ? pws('sin', n) : '', m ? pws('cos', m) : ''].filter(Boolean).join('*');
  const trigCheck = (F, n, m, k) => () => derivCheck(F, x => k * Math.pow(Math.sin(x), n) * Math.pow(Math.cos(x), m), [0.35, 0.8, 1.2, 2.1]);
  const kTex = k => k === 1 ? '' : k === -1 ? '-' : String(k);

  add('l7', {
    id: 'trig_odd', title: 'Polinomi trigonomètric: alguna potència senar', level: 2,
    desc: '$\\int\\sin^nx\\cos^mx$ amb $n$ o $m$ senar: guarda\'n un de la potència senar, passa la resta amb $\\sin^2+\\cos^2=1$ i queda quasi immediata.', needs: ['trigint', 'subst'],
    make(r) {
      const use = r.pick(['s', 'c']);
      const odd = r.pick([1, 3, 3, 5]), other = r.pick([0, 2, 2, 4, 6]);
      if (odd === 1 && other === 0) return null;
      const n = use === 's' ? odd : other, m = use === 's' ? other : odd;
      const k = r.pick([1, 1, 1, 2, 3, -1]);
      const o = oddPrim(n, m, use);
      const F = '(' + k + ')*(' + o.F + ')';
      const ansTex = k === 1 ? o.tex : kTex(k) + '\\left(' + o.tex + '\\right)';
      const p = P.fn('Calcula $\\displaystyle\\int ' + kTex(k) + monoTex(n, m) + '\\,dx$.', F, o.steps.concat(['Resultat: $' + ansTex + '+C$.', '⚠️ Si et guardes la potència <b>parella</b>, no funciona: no queda cap $\\sin x$ o $\\cos x$ sol per fer de derivada.']), { utc: true, ansTex, range: [0.3, 2.3] });
      p.check = trigCheck(F, n, m, k); p.integrand = '(' + k + ')*' + monoStr(n, m);
      return p;
    }
  });

  add('l7', {
    id: 'trig_even', title: 'Polinomi trigonomètric: totes les potències parelles', level: 2,
    desc: 'Si tot és parell no pots guardar-te\'n un: baixa el grau amb l\'angle doble, $\\cos^2x=\\frac{1+\\cos2x}{2}$, $\\sin^2x=\\frac{1-\\cos2x}{2}$.', needs: ['trigint', 'trig'],
    make(r) {
      const key = r.pick(Object.keys(EVEN)); const [n, m] = key.split(',').map(Number); const e = EVEN[key];
      const k = r.pick([1, 1, 2, 3, 4, 8, -1]);
      const F = '(' + k + ')*(' + e.F + ')';
      const ansTex = k === 1 ? e.tex : kTex(k) + '\\left(' + e.tex + '\\right)';
      const p = P.fn('Calcula $\\displaystyle\\int ' + kTex(k) + monoTex(n, m) + '\\,dx$.', F, ['Totes les potències són <b>parelles</b>: no te\'n pots guardar cap. Baixa el grau amb l\'angle doble.'].concat(e.st, ['Resultat: $' + ansTex + '+C$.']), { utc: true, ansTex, range: [0.3, 2.3] });
      p.check = trigCheck(F, n, m, k); p.integrand = '(' + k + ')*' + monoStr(n, m);
      return p;
    }
  });

  const STRAT = [
    'Guardar un $\\sin x$ i passar la resta a $\\cos x$ (amb $\\sin^2x=1-\\cos^2x$)',
    'Guardar un $\\cos x$ i passar la resta a $\\sin x$ (amb $\\cos^2x=1-\\sin^2x$)',
    'Baixar el grau amb l\'angle doble ($\\cos^2x=\\frac{1+\\cos2x}{2}$)',
    'Per parts amb $u=\\sin^nx$'
  ];
  add('l7', {
    id: 'trig_strategy', title: 'Polinomi trigonomètric: quina estratègia?', level: 1,
    desc: 'Senar ⇒ te\'n guardes un de la senar. Tot parell ⇒ angle doble. Saber-ho triar és mig exercici.', needs: ['trigint'],
    make(r) {
      const t = r.int(0, 2);
      let n, m;
      if (t === 0) { n = r.pick([1, 3, 5, 7]); m = r.pick([0, 2, 4, 6]); }
      else if (t === 1) { m = r.pick([1, 3, 5, 7]); n = r.pick([0, 2, 4, 6]); }
      else { n = r.pick([0, 2, 4]); m = r.pick([2, 4, 6]); }
      if (n + m < 2) return null;
      const why = t === 2 ? 'Totes dues potències són parelles ($' + n + '$ i $' + m + '$): no et pots guardar cap factor senar. Cal <b>baixar el grau</b> amb l\'angle doble.'
        : 'La potència ' + (t === 0 ? 'del sinus ($' + n + '$)' : 'del cosinus ($' + m + '$)') + ' és <b>senar</b>: te\'n guardes un i la resta (parella) la passes a ' + (t === 0 ? 'cosinus' : 'sinus') + '. Queda $\\int' + (t === 0 ? '\\sin x\\cdot(\\text{polinomi en }\\cos x)' : '\\cos x\\cdot(\\text{polinomi en }\\sin x)') + '$: quasi immediata.';
      return P.mc(r, 'Per calcular $\\displaystyle\\int ' + monoTex(n, m) + '\\,dx$, què fas?', STRAT[t], STRAT.filter((_, i) => i !== t), [why,
        'Regla: <b>alguna potència senar</b> → te\'n guardes un d\'aquella; <b>tot parell</b> → angle doble. (Si ho fas amb la parella, no funciona.)']);
    }
  });

  /* Suma de termes (com l'exemple de classe amb √2, π i 3/2) */
  const COEF = [
    { s: 'sqrt(2)', t: '\\sqrt2', v: Math.SQRT2 }, { s: 'pi', t: '\\pi', v: Math.PI }, { s: '(3/2)', t: '\\tfrac32', v: 1.5 },
    { s: '2', t: '2', v: 2 }, { s: '(1/2)', t: '\\tfrac12', v: 0.5 }, { s: 'sqrt(3)', t: '\\sqrt3', v: Math.sqrt(3) }, { s: '3', t: '3', v: 3 }
  ];
  add('l7', {
    id: 'trigpoly', title: 'Polinomi trigonomètric sencer (suma de termes)', level: 3,
    desc: 'Integra terme a terme: a cada tros decideix si hi ha potència senar (te\'n guardes una) o si tot és parell (angle doble).', needs: ['trigint', 'subst'],
    make(r) {
      const cs = r.shuffle(COEF.slice()).slice(0, 3);
      const sg = [1, r.pick([1, -1]), r.pick([1, -1])];
      const t1 = { n: r.pick([3, 5]), m: r.pick([0, 2]), use: 's' };
      const t2 = { n: r.pick([2, 4, 6]), m: r.pick([3, 5]), use: 'c' };
      const ev = r.pick(['2,2', '0,2', '2,0', '0,4']); const [en, em] = ev.split(',').map(Number);
      const parts = [t1, t2].map(t => Object.assign(oddPrim(t.n, t.m, t.use), t));
      parts.push({ n: en, m: em, F: EVEN[ev].F, tex: EVEN[ev].tex, st: EVEN[ev].st });
      let F = '', qT = '', aT = '';
      parts.forEach((pt, i) => {
        const c = cs[i], s = sg[i];
        F += '+(' + s + ')*' + c.s + '*(' + pt.F + ')';
        qT += (i === 0 ? '' : s < 0 ? '-' : '+') + c.t + monoTex(pt.n, pt.m);
        aT += (i === 0 ? '' : s < 0 ? '-' : '+') + c.t + '\\left(' + pt.tex + '\\right)';
      });
      F = F.slice(1);
      const f = x => parts.reduce((acc, pt, i) => acc + sg[i] * cs[i].v * Math.pow(Math.sin(x), pt.n) * Math.pow(Math.cos(x), pt.m), 0);
      const p = P.fn('Calcula $\\displaystyle\\int\\left(' + qT + '\\right)dx$.', F, [
        'Linealitat: integra cada tros per separat i multiplica per la seva constant.',
        '<b>Tros 1</b> ($' + monoTex(t1.n, t1.m) + '$, sinus senar): guarda un $\\sin x$, la resta a cosinus ⇒ $' + parts[0].tex + '$.',
        '<b>Tros 2</b> ($' + monoTex(t2.n, t2.m) + '$, cosinus senar): guarda un $\\cos x$, la resta a sinus ⇒ $' + parts[1].tex + '$.',
        '<b>Tros 3</b> ($' + monoTex(en, em) + '$, tot parell): angle doble. ' + EVEN[ev].st.join(' '),
        'Resultat: $' + aT + '+C$.'
      ], { utc: true, ansTex: aT, range: [0.3, 2.3] });
      p.check = () => derivCheck(F, f, [0.35, 0.8, 1.3, 2.1]);
      p.integrand = parts.map((pt, i) => '(' + sg[i] + ')*' + cs[i].s + '*' + monoStr(pt.n, pt.m)).join('+');
      return p;
    }
  });

  /* ================= L7: INTEGRALS NO ELEMENTALS (e^{x²}) ================= */
  const NOEL = ['e^{x^2}', 'e^{-x^2}', '\\sin(x^2)', '\\cos(x^2)', '\\frac{\\sin x}{x}', '\\frac{e^x}{x}', '\\frac{1}{\\ln x}'];
  const SIEL = [['x\\,e^{x^2}', '$u=x^2$: $\\frac12e^{x^2}$'], ['x\\,e^{-x^2}', '$u=-x^2$: $-\\frac12e^{-x^2}$'], ['x\\cos(x^2)', '$u=x^2$: $\\frac12\\sin(x^2)$'], ['\\ln x', 'per parts: $x\\ln x-x$'],
    ['x\\,e^x', 'per parts: $(x-1)e^x$'], ['\\frac{2x}{x^2+1}', '$\\ln(x^2+1)$'], ['\\frac{1}{1+x^2}', '$\\arctan x$'], ['x\\sin(x^2)', '$u=x^2$: $-\\frac12\\cos(x^2)$'], ['\\frac{\\ln x}{x}', '$u=\\ln x$: $\\frac{\\ln^2x}{2}$']];
  add('l7', {
    id: 'nonelem', title: 'Integrals no elementals: e^(x²) i companyia', level: 1,
    desc: 'La primitiva de $e^{x^2}$ existeix però no es pot escriure amb funcions elementals: només com a integral, $F(x)=\\int_0^xe^{t^2}dt$. Passa també amb $e^{-x^2}$ (campana de Gauss).', needs: ['primit', 'tfc'],
    make(r) {
      const t = r.int(0, 4);
      if (t === 0) {
        const bad = r.pick(NOEL), good = r.shuffle(SIEL.slice()).slice(0, 3);
        return P.mc(r, 'Quina d\'aquestes funcions <b>no</b> té primitiva elemental?', '$' + bad + '$', good.map(g => '$' + g[0] + '$'), [
          '$' + bad + '$ no té primitiva expressable amb funcions elementals (polinomis, arrels, $e^x$, $\\ln$, trigonomètriques i les seves inverses, combinades).',
          'Les altres sí: ' + good.map(g => '$' + g[0] + '$ → ' + g[1]).join('; ') + '.',
          'Fixa\'t: $x\\,e^{x^2}$ sí que en té perquè la $x$ fa de derivada de $x^2$. Sense aquesta $x$, no hi ha manera.'
        ]);
      }
      if (t === 1) {
        const good = r.pick(SIEL), bad = r.shuffle(NOEL.slice()).slice(0, 3);
        return P.mc(r, 'Quina d\'aquestes funcions <b>sí</b> té primitiva elemental?', '$' + good[0] + '$', bad.map(b => '$' + b + '$'), [
          '$' + good[0] + '$: ' + good[1] + '.', 'Les altres ($' + bad.join('$, $') + '$) són exemples clàssics de primitives <b>no elementals</b>.'
        ]);
      }
      if (t === 2) {
        const g = r.pick([['e^{x^2}', 'e^{t^2}', '\\frac{e^{x^2}}{2x}'], ['e^{-x^2}', 'e^{-t^2}', '-\\frac{e^{-x^2}}{2x}'], ['\\sin(x^2)', '\\sin(t^2)', '-\\frac{\\cos(x^2)}{2x}']]);
        return P.mc(r, 'Com escrius una primitiva de $' + g[0] + '$?', '$F(x)=\\displaystyle\\int_0^x ' + g[1] + '\\,dt$', ['$F(x)=' + g[2] + '$', 'No en té: la funció no és integrable', '$F(x)=' + g[0].replace('x^2', 'x^3') + '/3$'], [
          'La primitiva <b>existeix</b> (la funció és contínua, i pel teorema fonamental $F(x)=\\int_0^x' + g[1] + 'dt$ compleix $F\'(x)=' + g[0] + '$), però no es pot escriure com a composició de funcions elementals.',
          'Compte amb el parany $' + g[2] + '$: si la derives, per la regla del quocient <b>no</b> torna a donar $' + g[0] + '$.'
        ]);
      }
      if (t === 3) {
        return P.mc(r, 'Intentes $\\int e^{x^2}dx$ per parts amb $u=e^{x^2}$, $dv=dx$ (el mateix truc que per a $\\int\\ln x\\,dx$). Què passa?', 'Queda $xe^{x^2}-2\\int x^2e^{x^2}dx$: pitjor que al principi', ['Surt $xe^{x^2}-e^{x^2}+C$', 'Surt $\\frac{e^{x^2}}{2}+C$', 'Torna a sortir la mateixa integral i l\'aïlles (cas cíclic)'], [
          'Amb $\\ln x$ funciona: $\\int1\\cdot\\ln x\\,dx=x\\ln x-\\int x\\cdot\\frac1x\\,dx=x\\ln x-x+C$, perquè $x\\cdot\\frac1x=1$ simplifica.',
          'Amb $e^{x^2}$: $du=2xe^{x^2}dx$, $v=x$ ⇒ $xe^{x^2}-\\int2x^2e^{x^2}dx$. La integral nova és <b>més</b> complicada. No és culpa del mètode: no hi ha primitiva elemental.'
        ]);
      }
      const g = r.pick([['e^{t^2}', 'e^{x^2}', '2xe^{x^2}'], ['e^{-t^2}', 'e^{-x^2}', '-2xe^{-x^2}']]);
      return P.mc(r, 'Si $F(x)=\\displaystyle\\int_0^x ' + g[0] + '\\,dt$, quant val $F\'(x)$?', '$' + g[1] + '$', ['$' + g[2] + '$', '$' + g[1] + '-1$', 'No es pot saber perquè no hi ha primitiva'], [
        'Teorema fonamental del càlcul: $\\left(\\int_a^x f(t)\\,dt\\right)\'=f(x)$. No cal saber la primitiva per derivar-la!',
        'Per això $F$ és una primitiva de $' + g[1] + '$ encara que no la puguem escriure amb fórmules elementals.'
      ]);
    }
  });
})();
