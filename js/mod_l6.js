/* Llista 6 — Interpolació polinòmica: Lagrange, Newton (diferències dividides) i error */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;

  const theory = `
<h3>El problema</h3>
<p>Donats $n+1$ punts $(x_0,y_0),\\dots,(x_n,y_n)$ amb $x_i$ <b>diferents</b>, hi ha un <b>únic</b> polinomi $p$ de grau $\\le n$ que passa per tots (el polinomi interpolador). Pots escriure'l de moltes maneres (Lagrange, Newton…) però és <i>el mateix polinomi</i>: si l'expandeixes, dona igual.</p>

<h3>Fórmula de Lagrange</h3>
<div class="box formula">
$\\displaystyle p(x)=\\sum_{i=0}^{n}y_i\\,L_i(x),\\qquad L_i(x)=\\prod_{j\\ne i}\\frac{x-x_j}{x_i-x_j}$
</div>
<p>$L_i(x_i)=1$ i $L_i(x_j)=0$ si $j\\ne i$. <b>Truc:</b> per a $L_i$, el numerador té tots els factors $(x-x_j)$ <i>menys</i> el $j=i$, i el denominador és el mateix numerador avaluat en $x_i$.</p>
<div class="box ex"><b>Exemple (3 nodes 0, 1, 2).</b> $L_1(x)=\\dfrac{(x-0)(x-2)}{(1-0)(1-2)}=-x(x-2)$.</div>

<h3>Fórmula de Newton (diferències dividides)</h3>
<div class="box formula">
$p(x)=f[x_0]+f[x_0,x_1](x-x_0)+f[x_0,x_1,x_2](x-x_0)(x-x_1)+\\dots$<br>
$f[x_i]=y_i,\\qquad f[x_i,\\dots,x_{i+k}]=\\dfrac{f[x_{i+1},\\dots,x_{i+k}]-f[x_i,\\dots,x_{i+k-1}]}{x_{i+k}-x_i}$
</div>
<p><b>Avantatge:</b> si afegeixes un node, només cal afegir un terme nou (no refer-ho tot). Construeix la taula columna a columna: cada nombre és (el de sota-esquerra menys el de dalt-esquerra) dividit per la diferència de $x$ que "abraça".</p>

<h3>Error d'interpolació</h3>
<div class="box formula">
$f(x)-p(x)=\\dfrac{f^{(n+1)}(\\xi)}{(n+1)!}\\,(x-x_0)(x-x_1)\\cdots(x-x_n)$, per a algun $\\xi$ en el menor interval que conté els nodes i $x$.<br>
Cota: $|f(x)-p(x)|\\le\\dfrac{M}{(n+1)!}\\prod_{i=0}^{n}|x-x_i|$, amb $M=\\max|f^{(n+1)}|$ en l'interval.
</div>
<ul>
<li>Amb $n+1$ nodes, la derivada és la d'ordre $n+1$ (ex: 4 nodes ⇒ $f^{(4)}$).</li>
<li>L'<b>error real</b> és $|f(x)-p(x)|$ (calcula $p(x)$ i resta). Ha de ser $\\le$ la cota.</li>
<li>Per a nodes equiespaiats amb pas $h$: $\\prod|x-x_i|\\le\\dfrac{h^{n+1}n!}{4}$.</li>
</ul>
`;

  const gens = [];

  /** valor del polinomi de Lagrange en t */
  const lagrangeEval = (xs, ys, t) => xs.reduce((s, xi, i) => s + ys[i] * xs.reduce((p, xj, j) => (j === i ? p : p * (t - xj) / (xi - xj)), 1), 0);
  /** coeficients de Newton [f[x0], f[x0,x1], ...] */
  function newtonCoefs(xs, ys) {
    const n = xs.length, d = ys.slice(), out = [d[0]];
    for (let k = 1; k < n; k++) {
      for (let i = 0; i < n - k; i++) d[i] = (d[i + 1] - d[i]) / (xs[i + k] - xs[i]);
      out.push(d[0]);
    }
    return out;
  }
  /** nivell k de diferències dividides com a llista (k=1: f[x_i,x_{i+1}]) */
  function ddLevels(xs, ys) {
    const levels = [ys.slice()];
    for (let k = 1; k < xs.length; k++) {
      const prev = levels[k - 1];
      levels.push(prev.slice(0, prev.length - 1).map((_, i) => (prev[i + 1] - prev[i]) / (xs[i + k] - xs[i])));
    }
    return levels;
  }
  const tableTex = (xs, ys) => '$\\begin{array}{c|' + 'c'.repeat(xs.length) + '}x&' + xs.map(T).join('&') + '\\\\\\hline y&' + ys.map(T).join('&') + '\\end{array}$';
  const randNodes = (r, n, lo, hi) => H.sortNum(H.distinct(r, n, lo, hi));
  const randPoly = (r, deg) => { const c = []; for (let i = 0; i <= deg; i++) c.push(r.int(-3, 3)); if (c[deg] === 0) c[deg] = r.pick([1, -1, 2]); return c; };

  gens.push({
    id: 'basis', title: 'Polinomis de Lagrange L_i(t)', level: 1,
    make(r) {
      const xs = randNodes(r, 3, -3, 4), k = r.int(0, 2);
      let t; do { t = r.int(-3, 5); } while (xs.includes(t));
      const num = xs.map((xj, j) => (j === k ? null : '(t' + H.sg(-xj) + ')')).filter(Boolean).join('');
      const val = xs.reduce((p, xj, j) => (j === k ? p : p * (t - xj) / (xs[k] - xj)), 1);
      const nodes = xs.map(T).join(',\\ ');
      return P.num('Amb els nodes $x_0,x_1,x_2=' + nodes + '$, calcula $L_' + k + '(' + t + ')$ (polinomi de Lagrange).', val,
        ['$L_' + k + '(x)=' + xs.map((xj, j) => (j === k ? '' : '\\dfrac{x' + H.sg(-xj) + '}{' + T(xs[k] - xj) + '}')).join('') + '$.', 'Avaluant en $x=' + t + '$: $' + T(val) + '$.']);
    }
  });

  gens.push({
    id: 'dd', title: 'Diferències dividides', level: 2,
    make(r) {
      const n = r.pick([3, 3, 4]);
      const xs = randNodes(r, n, -2, 5), ys = xs.map(() => r.int(-6, 9));
      const lv = ddLevels(xs, ys);
      const k = n - 1;
      const val = lv[k][0];
      const name = 'f[' + xs.map((_, i) => 'x_' + i).join(',') + ']';
      return P.num('Donada la taula ' + tableTex(xs, ys) + ' calcula la diferència dividida $' + name + '$.', val,
        lv.slice(1).map((l, i) => 'Ordre ' + (i + 1) + ': ' + l.map((v, j) => '$f[x_' + j + ',\\dots,x_' + (j + i + 1) + ']=' + T(v) + '$').join(', ') + '.').concat(['Resposta: $' + T(val) + '$.']));
    }
  });

  gens.push({
    id: 'newton_coefs', title: 'Coeficients del polinomi de Newton', level: 2,
    make(r) {
      const xs = randNodes(r, 3, -2, 4), ys = xs.map(() => r.int(-5, 8));
      const c = newtonCoefs(xs, ys);
      return P.multi('Dona els coeficients $c_0,c_1,c_2$ del polinomi interpolador en forma de Newton $p(x)=c_0+c_1(x-x_0)+c_2(x-x_0)(x-x_1)$ per a la taula ' + tableTex(xs, ys),
        c.map((v, i) => ({ label: '$c_' + i + '=$', ans: v })),
        ['$c_0=f[x_0]=' + T(c[0]) + '$.', '$c_1=\\dfrac{' + T(ys[1]) + '-' + (ys[0] < 0 ? '(' + T(ys[0]) + ')' : T(ys[0])) + '}{' + T(xs[1]) + '-' + (xs[0] < 0 ? '(' + T(xs[0]) + ')' : T(xs[0])) + '}=' + T(c[1]) + '$.', '$c_2=f[x_0,x_1,x_2]=' + T(c[2]) + '$.']);
    }
  });

  gens.push({
    id: 'poly', title: 'Polinomi interpolador (3 o 4 punts)', level: 2,
    make(r) {
      const deg = r.pick([2, 2, 3]), n = deg + 1;
      const xs = randNodes(r, n, -2, 3);
      const c = randPoly(r, deg);
      const ys = xs.map(x => M.polyEval(c, x));
      const nc = newtonCoefs(xs, ys);
      let newtonStr = T(nc[0]);
      let prod = '';
      for (let k = 1; k < n; k++) { prod += '(' + H.xm(xs[k - 1]) + ')'; newtonStr += (nc[k] < 0 ? ' - ' : ' + ') + (Math.abs(nc[k]) === 1 ? '' : T(Math.abs(nc[k]))) + prod; }
      const prob = P.fn('Troba el polinomi $p(x)$ de grau $\\le' + deg + '$ que interpola la taula ' + tableTex(xs, ys) + ' Escriu-lo en $x$ (pots deixar-lo factoritzat o expandit).', M.polyStr(c), [
        'Diferències dividides: ' + ddLevels(xs, ys).slice(1).map((l, i) => l.map(T).join(', ')).join(' | ') + '.',
        'Forma de Newton: $p(x)=' + newtonStr + '$.', 'Expandint: $p(x)=' + M.polyTex(c) + '$.'], { ansTex: M.polyTex(c), range: [-1.7, 2.9] });
      prob.solPlot = { fns: [{ f: M.polyStr(c), label: 'p' }], xr: [xs[0] - 1.5, xs[n - 1] + 1.5], points: xs.map((x, i) => [x, ys[i]]) };
      return prob;
    }
  });

  gens.push({
    id: 'value', title: 'Interpolar en un punt', level: 1,
    make(r) {
      const xs = randNodes(r, 3, -2, 4), ys = xs.map(() => r.int(-5, 9));
      let t; do { t = r.int(-2, 5); } while (xs.includes(t));
      const v = lagrangeEval(xs, ys, t);
      return P.num('Amb la taula ' + tableTex(xs, ys) + ' calcula el valor en $x=' + t + '$ del polinomi interpolador.', v,
        ['Lagrange: $p(' + t + ')=\\sum y_iL_i(' + t + ')$.', xs.map((xi, i) => '$L_' + i + '(' + t + ')=' + T(xs.reduce((p, xj, j) => (j === i ? p : p * (t - xj) / (xi - xj)), 1)) + '$').join(', ') + '.', '$p(' + t + ')=' + T(v) + '$.']);
    }
  });

  gens.push({
    id: 'bound', title: 'Cota de l\'error d\'interpolació', level: 3,
    make(r) {
      const t = r.int(0, 2);
      if (t === 0) {
        const xs = H.sortNum([1.1, 1.3, 1.5, 1.8, 1.4, 1.2, 1.6].filter((_, i) => r.int(0, 1) || i < 0)).slice(0, 4);
        const nodes = xs.length >= 3 ? xs : [1.1, 1.3, 1.5, 1.8];
        const n = nodes.length - 1;
        const x = r.pick([1.9, 1.95, 1.05, 1.7, 1.35]);
        const Mder = Math.pow(Math.PI, n + 1);
        const prodAbs = nodes.reduce((p, xi) => p * Math.abs(x - xi), 1);
        const bound = Mder / M.fact(n + 1) * prodAbs;
        const ys = nodes.map(xi => Math.sin(Math.PI * xi));
        const real = Math.abs(Math.sin(Math.PI * x) - lagrangeEval(nodes, ys, x));
        return P.multi('Aproximem $f(x)=\\sin(\\pi x)$ a $[1,2]$ amb el polinomi interpolador en els nodes $' + nodes.join(',\\ ').replace(/\./g, '{,}') + '$. Calcula, en $x=' + String(x).replace('.', '{,}') + '$, la <b>cota teòrica</b> de l\'error i l\'<b>error real</b> (3 decimals; usa $M=\\pi^{' + (n + 1) + '}$).',
          [{ label: 'cota $=$', ans: bound, tol: 5e-3 }, { label: 'error real $=$', ans: real, tol: 5e-2 }],
          ['Hi ha ' + (n + 1) + ' nodes ⇒ $n=' + n + '$ i cal $f^{(' + (n + 1) + ')}$, amb $|f^{(' + (n + 1) + ')}|\\le\\pi^{' + (n + 1) + '}=' + M.round(Mder, 4) + '$.', 'Cota: $\\dfrac{M}{' + (n + 1) + '!}\\prod|x-x_i|=\\dfrac{' + M.round(Mder, 4) + '}{' + M.fact(n + 1) + '}\\cdot' + M.round(prodAbs, 6) + '=' + M.round(bound, 4) + '$.', 'Error real: $|\\sin(\\pi x)-p(x)|=' + M.round(real, 5) + '$ (és menor que la cota, com cal).']);
      }
      if (t === 1) {
        const x = r.pick([0.5, 0.9, 1.4, 1.7]);
        const nodes = [0, 1, 2], n = 2;
        const Mder = Math.exp(2);
        const prodAbs = nodes.reduce((p, xi) => p * Math.abs(x - xi), 1);
        const bound = Mder / 6 * prodAbs;
        const real = Math.abs(Math.exp(x) - lagrangeEval(nodes, nodes.map(Math.exp), x));
        return P.multi('Aproximem $f(x)=e^x$ a $[0,2]$ amb el polinomi interpolador en els nodes $0,1,2$. Calcula, en $x=' + String(x).replace('.', '{,}') + '$, la <b>cota teòrica</b> i l\'<b>error real</b> (3 decimals; $M=\\max_{[0,2]}|f\'\'\'|=e^2$).',
          [{ label: 'cota $=$', ans: bound, tol: 5e-3 }, { label: 'error real $=$', ans: real, tol: 5e-2 }],
          ['$f\'\'\'(x)=e^x\\le e^2=' + M.round(Mder, 4) + '$ en $[0,2]$.', 'Cota: $\\dfrac{e^2}{3!}|x||x-1||x-2|=' + M.round(bound, 4) + '$.', 'Error real: $|e^x-p(x)|=' + M.round(real, 5) + '$.']);
      }
      const x = r.pick([1.5, 1.25, 2.5, 1.75]);
      const nodes = [1, 2, 3], vals = [0, Math.log(2), Math.log(3)];
      const prodAbs = nodes.reduce((p, xi) => p * Math.abs(x - xi), 1);
      const bound = 2 / 6 * prodAbs; // |f'''|=2/x^3 <=2 en [1,3]
      const real = Math.abs(Math.log(x) - lagrangeEval(nodes, vals, x));
      return P.multi('Aproximem $f(x)=\\ln x$ amb el polinomi interpolador de la taula $x=1,2,3$ ($y=\\ln x$). Calcula, en $x=' + String(x).replace('.', '{,}') + '$, la <b>cota teòrica</b> i l\'<b>error real</b> (3 decimals).',
        [{ label: 'cota $=$', ans: bound, tol: 5e-3 }, { label: 'error real $=$', ans: real, tol: 5e-2 }],
        ['$f\'\'\'(x)=2/x^3$, que és màxim en $x=1$: $M=2$.', 'Cota: $\\dfrac{2}{3!}|x-1||x-2||x-3|=' + M.round(bound, 4) + '$.', 'Error real: $|\\ln x-p(x)|=' + M.round(real, 5) + '$.']);
    }
  });

  Calc.add({
    id: 'l6', num: '6', llista: 'Llista 6', title: 'Interpolació polinòmica',
    short: 'Lagrange, Newton amb diferències dividides i error d\'interpolació.',
    desc: 'Mètode i fórmules a fons.',
    theory, gens,
    bank: [
      { q: 'Amb $n+1$ nodes diferents, el polinomi interpolador té grau…', c: ['exactament $n+1$', 'com a molt $n$', 'com a molt $n+1$', 'qualsevol'], a: 1, e: 'Pot tenir grau menor si els punts estan alineats.' },
      { q: '$L_i(x_j)$ val…', c: ['$1$ sempre', '$\\delta_{ij}$ (1 si $i=j$, 0 si no)', '$x_j$', '$y_i$'], a: 1, e: 'Propietat de la base de Lagrange.' },
      { q: 'L\'error d\'interpolar amb $n+1$ nodes depèn de la derivada d\'ordre…', c: ['$n$', '$n+1$', '$n+2$', '$1$'], a: 1, e: '$f^{(n+1)}(\\xi)/(n+1)!$.' },
      { q: 'En la fórmula de Newton, afegir un node nou…', c: ['obliga a refer tot el polinomi', 'només afegeix un terme nou', 'canvia $c_0$', 'és impossible'], a: 1, e: 'Cal una nova diferència dividida.' },
      { q: '$f[x_0,x_1]=$', c: ['$\\dfrac{f(x_1)-f(x_0)}{x_1-x_0}$', '$\\dfrac{f(x_1)+f(x_0)}{2}$', '$f(x_1)f(x_0)$', '$\\dfrac{x_1-x_0}{f(x_1)-f(x_0)}$'], a: 0, e: 'Pendent de la secant.' },
      { q: 'Dos mètodes d\'interpolació (Lagrange i Newton) amb els mateixos nodes donen…', c: ['polinomis diferents', 'el mateix polinomi', 'només coincideixen en els nodes de l\'extrem', 'grau diferent'], a: 1, e: 'Unicitat del polinomi interpolador.' },
      { q: 'L\'error real d\'interpolació en $x$ és sempre…', c: ['$\\ge$ que la cota teòrica', '$\\le$ que la cota teòrica', '$=0$', 'independent de la cota'], a: 1, e: 'La cota és un màxim garantit.' }
    ]
  });
})();
