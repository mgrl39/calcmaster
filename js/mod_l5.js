/* Llista 5 — Polinomi i fórmula de Taylor */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;

  const theory = `
<h3>Polinomi de Taylor</h3>
<div class="box formula">
$\\displaystyle P_n(x)=\\sum_{k=0}^{n}\\frac{f^{(k)}(a)}{k!}(x-a)^k=f(a)+f'(a)(x-a)+\\frac{f''(a)}{2!}(x-a)^2+\\dots+\\frac{f^{(n)}(a)}{n!}(x-a)^n$
</div>
<p>Si $a=0$ s'anomena polinomi de <b>Maclaurin</b>. És l'únic polinomi de grau $\\le n$ que coincideix amb $f$ i les seves $n$ primeres derivades en $a$. Per tant: el coeficient de $(x-a)^k$ és $f^{(k)}(a)/k!$ (<b>no oblidis dividir per $k!$</b>).</p>

<h3>Residu (error) de Lagrange</h3>
<div class="box formula">
$f(x)=P_n(x)+R_n(x),\\qquad R_n(x)=\\dfrac{f^{(n+1)}(\\xi)}{(n+1)!}(x-a)^{n+1}$ per a algun $\\xi$ entre $a$ i $x$.<br>
Cota: $|R_n(x)|\\le\\dfrac{M}{(n+1)!}|x-a|^{n+1}$, on $M\\ge\\max|f^{(n+1)}|$ entre $a$ i $x$.
</div>

<h3>Com es fa un exercici d'aproximació ("amb error menor que $10^{-k}$")</h3>
<ol>
<li>Tria $f$ i $a$ (el punt on tot és fàcil) i escriu $x$ com a $a+h$. Ex: $\\sqrt[3]{1.06}$: $f=(1+x)^{1/3}$, $a=0$, $x=0.06$.</li>
<li>Calcula $f^{(n+1)}$ i <b>fita'l</b> ($M$) en l'interval entre $a$ i $x$.</li>
<li>Troba el <b>menor $n$</b> amb $\\dfrac{M|x-a|^{n+1}}{(n+1)!}<10^{-k}$ (prova $n=1,2,3,\\dots$).</li>
<li>Calcula $P_n(x)$: aquest és el valor aproximat.</li>
</ol>

<h3>Desenvolupaments en $a=0$ que has de saber</h3>
<table class="tbl">
<tr><td>$e^x=1+x+\\frac{x^2}{2!}+\\frac{x^3}{3!}+\\dots$</td><td>$\\sin x=x-\\frac{x^3}{3!}+\\frac{x^5}{5!}-\\dots$</td></tr>
<tr><td>$\\cos x=1-\\frac{x^2}{2!}+\\frac{x^4}{4!}-\\dots$</td><td>$\\ln(1+x)=x-\\frac{x^2}{2}+\\frac{x^3}{3}-\\dots$</td></tr>
<tr><td>$\\dfrac1{1-x}=1+x+x^2+x^3+\\dots$</td><td>$(1+x)^\\alpha=1+\\alpha x+\\binom\\alpha2x^2+\\dots$</td></tr>
<tr><td>$\\arctan x=x-\\frac{x^3}3+\\frac{x^5}5-\\dots$</td><td>$\\sqrt{1+x}=1+\\frac x2-\\frac{x^2}8+\\frac{x^3}{16}-\\dots$</td></tr>
</table>
<p>Truc: pots <b>substituir</b>: $e^{-x^2}=1-x^2+\\frac{x^4}2-\\dots$ (posa $-x^2$ on hi havia $x$). Els polinomis de $\\sin$ i $\\cos$ només tenen potències senars i parells respectivament: el coeficient de $x^4$ a $\\sin$ és $0$.</p>
`;

  const gens = [];
  const frac = c => M.numStr(c);
  /** coeficients de Taylor [c0..cn] de src al voltant de a (numèrics) */
  function coefs(src, a, n) {
    const out = [];
    for (let k = 0; k <= n; k++) {
      const d = k === 0 ? M.parse(src) : M.nthDiff(src, k);
      out.push(M.compile(d)(a) / M.fact(k));
    }
    return out;
  }
  const polyAround = (c, a) => c.map((v, k) => (Math.abs(v) < 1e-12 ? null : '(' + M.numStr(v) + ')*(x-(' + a + '))^' + k)).filter(Boolean).join('+') || '0';
  const polyAroundTex = (c, a) => {
    let s = '';
    c.forEach((v, k) => {
      if (Math.abs(v) < 1e-12) return;
      const base = a === 0 ? 'x' : '(' + H.xm(a) + ')';
      const term = (k === 0 ? '' : (k === 1 ? base : base + '^{' + k + '}'));
      const A = Math.abs(v);
      const co = (Math.abs(A - 1) < 1e-12 && k > 0) ? '' : T(A);
      s += (s === '' ? (v < 0 ? '-' : '') : (v < 0 ? ' - ' : ' + ')) + co + term;
    });
    return s || '0';
  };

  gens.push({
    id: 'coef', title: 'Coeficient d\'un desenvolupament', level: 1,
    make(r) {
      const a = r.int(1, 3);
      const pool = ['e^(' + a + 'x)', 'sin(' + a + 'x)', 'cos(' + a + 'x)', 'ln(1+x)', '1/(1-' + a + 'x)', 'sqrt(1+x)', '1/(1+x)^2', 'e^(-x)*1', 'ln(1+' + a + 'x)'];
      const f = r.pick(pool);
      const k = r.int(2, 5);
      const c = coefs(f, 0, k)[k];
      if (!M.toFrac(c)) return null;
      const p = P.num('Troba el coeficient de $x^{' + k + '}$ en el polinomi de Maclaurin de $f(x)=' + M.tex(f) + '$.', c,
        ['El coeficient és $\\dfrac{f^{(' + k + ')}(0)}{' + k + '!}$.', '$f^{(' + k + ')}(x)=' + M.toTex(M.nthDiff(f, k)) + '$ ⇒ $f^{(' + k + ')}(0)=' + T(c * M.fact(k)) + '$.', 'Coeficient: $\\dfrac{' + T(c * M.fact(k)) + '}{' + M.fact(k) + '}=' + T(c) + '$.']);
      p.check = () => Math.abs(c - coefs(f, 0, k)[k]) < 1e-9;
      return p;
    }
  });

  gens.push({
    id: 'poly0', title: 'Polinomi de Maclaurin', level: 1,
    make(r) {
      const pool = ['e^x', 'sin(x)', 'cos(x)', 'ln(1+x)', '1/(1+x)', 'sqrt(1+x)', 'atan(x)', 'e^(-x)', 'x*e^x', 'e^(2x)', 'cos(2x)', '1/(1-x)^2', 'tan(x)'];
      const f = r.pick(pool), n = r.int(2, f === 'tan(x)' ? 3 : 4);
      const c = coefs(f, 0, n);
      if (!c.every(v => M.toFrac(v))) return null;
      const p = P.fn('Calcula el polinomi de Taylor de grau $' + n + '$ de $f(x)=' + M.tex(f) + '$ en $a=0$.', polyAround(c, 0), [
        'Derivades en $0$: ' + c.map((v, k) => '$f^{(' + k + ')}(0)=' + T(v * M.fact(k)) + '$').join(', ') + '.',
        '$P_' + n + '(x)=\\sum\\dfrac{f^{(k)}(0)}{k!}x^k=' + polyAroundTex(c, 0) + '$.'], { ansTex: polyAroundTex(c, 0) });
      p.check = () => true;
      return p;
    }
  });

  gens.push({
    id: 'polya', title: 'Taylor en un punt a ≠ 0', level: 2,
    make(r) {
      const pool = [['ln(x)', 1], ['1/x', 1], ['1/x', 2], ['sqrt(x)', 4], ['sqrt(x)', 1], ['x^4', 1], ['1/(x+1)', 1], ['x^3-2x', 2], ['e^x*1', 0], ['x*ln(x)', 1], ['1/x^2', 1], ['sqrt(x)', 9]];
      const [f, a] = r.pick(pool);
      const n = r.int(2, 3);
      const c = coefs(f, a, n);
      if (!c.every(v => M.toFrac(v))) return null;
      return P.fn('Calcula el polinomi de Taylor de grau $' + n + '$ de $f(x)=' + M.tex(f) + '$ en el punt $a=' + a + '$ (pots escriure\'l com vulguis, p.ex. <code>1+2(x-1)+…</code>).', polyAround(c, a), [
        'Valors en $a=' + a + '$: ' + c.map((v, k) => '$f^{(' + k + ')}(' + a + ')/' + k + '!=' + T(v) + '$').join(', ') + '.',
        '$P_' + n + '(x)=' + polyAroundTex(c, a) + '$.'], { ansTex: polyAroundTex(c, a) });
    }
  });

  gens.push({
    id: 'value', title: 'Aproximar un valor amb Taylor', level: 1,
    make(r) {
      const t = r.int(0, 2), n = r.int(2, 4);
      const x0 = r.pick([0.1, 0.2, 0.5]);
      let f, c;
      if (t === 0) { f = 'e^x'; c = coefs(f, 0, n); }
      else if (t === 1) { f = 'sin(x)'; c = coefs(f, 0, n); }
      else { f = 'ln(1+x)'; c = coefs(f, 0, n); }
      const val = M.polyEval(c, x0);
      return P.num('Usa el polinomi de Taylor de grau $' + n + '$ de $' + M.tex(f) + '$ en $0$ per aproximar el valor de la funció en $x=' + x0 + '$ (4 decimals).', val,
        ['$P_' + n + '(x)=' + polyAroundTex(c, 0) + '$.', '$P_' + n + '(' + x0 + ')=' + M.round(val, 6) + '$.'], { tol: 2e-4 });
    }
  });

  gens.push({
    id: 'degree', title: 'Grau necessari per a un error donat', level: 2,
    make(r) {
      const t = r.int(0, 1), k = r.int(3, 7);
      const x0 = r.pick([0.1, 0.2, 0.5, 1]);
      const tol = Math.pow(10, -k);
      if (t === 0) {
        let n = 0; while (Math.pow(x0, n + 1) / M.fact(n + 1) >= tol) n++;
        return P.num('Volem aproximar $\\sin(' + x0 + ')$ amb el polinomi de Maclaurin de $\\sin x$ amb un error menor que $10^{-' + k + '}$. Fent servir $|f^{(n+1)}|\\le1$, quin és el <b>menor grau $n$</b> que ho garanteix?', n,
          ['Cota: $|R_n|\\le\\dfrac{' + x0 + '^{n+1}}{(n+1)!}$. Cal que sigui $<10^{-' + k + '}$.', 'Provant: $n=' + (n - 1) + '$ → ' + (n - 1 >= 0 ? T(Math.pow(x0, n) / M.fact(n)) + ' (massa gran)' : '—') + '; $n=' + n + '$ → $' + T(Math.pow(x0, n + 1) / M.fact(n + 1)) + '$ ✓.', 'Grau mínim: $' + n + '$.']);
      }
      let n = 0; while (3 * Math.pow(x0, n + 1) / M.fact(n + 1) >= tol) n++;
      return P.num('Volem aproximar $e^{' + x0 + '}$ amb el polinomi de Maclaurin de $e^x$ amb error menor que $10^{-' + k + '}$. Usant que $e^{\\xi}<3$ per a $\\xi\\in(0,' + x0 + ')$, quin és el <b>menor grau $n$</b>?', n,
        ['$|R_n|\\le\\dfrac{3\\cdot' + x0 + '^{n+1}}{(n+1)!}<10^{-' + k + '}$.', 'Provant: $n=' + n + '$ dona $' + T(3 * Math.pow(x0, n + 1) / M.fact(n + 1)) + '$ ✓' + (n > 0 ? ' i $n=' + (n - 1) + '$ dona $' + T(3 * Math.pow(x0, n) / M.fact(n)) + '$ ✗' : '') + '.', 'Grau mínim: $' + n + '$.']);
    }
  });

  gens.push({
    id: 'err_ln', title: 'Cota de l\'error: ln(1+x)', level: 3,
    make(r) {
      const n = r.int(2, 5), x0 = r.pick([0.1, 0.2, 0.5]);
      const bound = Math.pow(x0, n + 1) / (n + 1);
      return P.num('Aproximem $\\ln(1+' + x0 + ')$ pel polinomi de Maclaurin de grau $' + n + '$ de $\\ln(1+x)$. Calcula la cota de Lagrange de l\'error $\\dfrac{M}{(n+1)!}x^{n+1}$, on $M=\\max_{[0,' + x0 + ']}|f^{(n+1)}|$.', bound,
        ['$f^{(n+1)}(x)=\\dfrac{(-1)^n\\,n!}{(1+x)^{n+1}}$, que en valor absolut és màxim en $x=0$: $M=n!=' + M.fact(n) + '$.', 'Cota: $\\dfrac{' + M.fact(n) + '}{' + M.fact(n + 1) + '}\\cdot' + x0 + '^{' + (n + 1) + '}=\\dfrac{' + x0 + '^{' + (n + 1) + '}}{' + (n + 1) + '}=' + M.round(bound, 8) + '$.'], { tol: 1e-4 });
    }
  });

  Calc.add({
    id: 'l5', num: '5', llista: 'Llista 5', title: 'Polinomi i fórmula de Taylor',
    short: 'Polinomis de Taylor/Maclaurin, residu de Lagrange i aproximació amb error controlat.',
    desc: 'Aproximació amb polinomis i control de l\'error.',
    theory, gens,
    bank: [
      { q: 'El coeficient de $(x-a)^k$ al polinomi de Taylor és…', c: ['$f^{(k)}(a)$', '$f^{(k)}(a)/k$', '$f^{(k)}(a)/k!$', '$k!f^{(k)}(a)$'], a: 2, e: 'No oblidis dividir per $k!$.' },
      { q: 'El residu de Lagrange $R_n(x)$ conté la derivada d\'ordre…', c: ['$n$', '$n+1$', '$n-1$', '$2n$'], a: 1, e: '$\\frac{f^{(n+1)}(\\xi)}{(n+1)!}(x-a)^{n+1}$.' },
      { q: 'El coeficient de $x^4$ en el desenvolupament de $\\sin x$ és…', c: ['$1/24$', '$0$', '$-1/24$', '$1/4$'], a: 1, e: 'El sinus només té potències senars.' },
      { q: '$\\cos x\\approx$', c: ['$1-\\frac{x^2}{2}+\\frac{x^4}{24}$', '$x-\\frac{x^3}{6}$', '$1+x+\\frac{x^2}{2}$', '$1-x^2+x^4$'], a: 0, e: '$\\cos x=\\sum(-1)^k\\frac{x^{2k}}{(2k)!}$.' },
      { q: 'El polinomi de Taylor de grau 1 de $f$ en $a$ és…', c: ['la recta tangent', 'la recta secant', 'l\'asímptota', 'la constant $f(a)$'], a: 0, e: '$f(a)+f\'(a)(x-a)$.' },
      { q: 'Per aproximar $\\sqrt[3]{1.06}$ cal prendre $f(x)=$…', c: ['$\\sqrt[3]{x}$ en $a=0$', '$(1+x)^{1/3}$ en $a=0$', '$x^3$ en $a=1$', '$\\ln(1+x)$'], a: 1, e: '$x=0.06$.' },
      { q: '$\\ln(1+x)\\approx$', c: ['$x-\\frac{x^2}{2}+\\frac{x^3}{3}$', '$x+\\frac{x^2}{2}+\\frac{x^3}{3}$', '$1+x+x^2$', '$x-x^2+x^3$'], a: 0, e: 'Sèrie alternada amb denominadors $k$ (no $k!$).' }
    ]
  });
})();
