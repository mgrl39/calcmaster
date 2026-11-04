/* Mòdul B — Fonaments: àlgebra, potències, logaritmes, trigonometria, taules de derivades i primitives */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;

  const theory = `
<h3>Per què aquest mòdul?</h3>
<p>El 90% dels errors en Càlcul <b>no són de càlcul</b>: són d'àlgebra (signes, fraccions, factoritzar). Si domines això, tota la resta flueix. Fes-lo ràpid fins que et surti sense pensar.</p>

<h3>1. Fraccions</h3>
<div class="box formula">
$\\dfrac{a}{b}+\\dfrac{c}{d}=\\dfrac{ad+bc}{bd}$ &nbsp;&nbsp; $\\dfrac{a}{b}\\cdot\\dfrac{c}{d}=\\dfrac{ac}{bd}$ &nbsp;&nbsp; $\\dfrac{a/b}{c/d}=\\dfrac{ad}{bc}$
</div>
<div class="box warn">Error típic: $\\dfrac{a+b}{c+d}\\neq\\dfrac{a}{c}+\\dfrac{b}{d}$. Només pots <i>separar</i> el numerador: $\\dfrac{a+b}{c}=\\dfrac{a}{c}+\\dfrac{b}{c}$.</div>

<h3>2. Equacions de segon grau i factorització</h3>
<div class="box formula">
$ax^2+bx+c=0 \\Rightarrow x=\\dfrac{-b\\pm\\sqrt{b^2-4ac}}{2a}$ &nbsp;&nbsp; $ax^2+bx+c=a(x-x_1)(x-x_2)$
</div>
<ul>
<li>Discriminant $\\Delta=b^2-4ac$: $>0$ dues arrels reals, $=0$ una de doble, $<0$ complexes ($x=\\alpha\\pm\\beta i$).</li>
<li>Suma d'arrels $x_1+x_2=-b/a$, producte $x_1x_2=c/a$. Truc per factoritzar $x^2+bx+c$: busca dos nombres que <i>sumin</i> $b$ i <i>multipliquin</i> $c$ (signes oposats al resultat!).</li>
<li>Productes notables: $(a\\pm b)^2=a^2\\pm2ab+b^2$, $(a-b)(a+b)=a^2-b^2$.</li>
</ul>

<h3>3. Signe d'una expressió (inequacions)</h3>
<p>Per resoldre $p(x)\\ge0$: troba les arrels, dibuixa la recta, i mira el signe a cada interval (prova un punt). Per a una parabòla $ax^2+bx+c$ amb $a>0$: <b>fora</b> de les arrels és positiva, <b>entre</b> les arrels és negativa. És la base del domini, de la monotonia ($f'$) i de la concavitat ($f''$).</p>

<h3>4. Potències, arrels, exponencials i logaritmes</h3>
<div class="box formula">
$a^m a^n=a^{m+n}$ &nbsp; $\\dfrac{a^m}{a^n}=a^{m-n}$ &nbsp; $(a^m)^n=a^{mn}$ &nbsp; $a^{-n}=\\dfrac1{a^n}$ &nbsp; $\\sqrt[n]{a^m}=a^{m/n}$<br>
$\\ln(ab)=\\ln a+\\ln b$ &nbsp; $\\ln\\frac ab=\\ln a-\\ln b$ &nbsp; $\\ln a^n=n\\ln a$ &nbsp; $\\ln e^x=x$ &nbsp; $e^{\\ln x}=x$ &nbsp; $\\ln 1=0$, $\\ln e=1$
</div>
<div class="box warn">$\\sqrt{a^2+b^2}\\ne a+b$ i $\\ln(a+b)\\ne\\ln a+\\ln b$. Aquests dos errors són els més freqüents.</div>

<h3>5. Trigonometria imprescindible</h3>
<table class="tbl"><tr><th>$\\theta$</th><th>0</th><th>$\\pi/6$</th><th>$\\pi/4$</th><th>$\\pi/3$</th><th>$\\pi/2$</th><th>$\\pi$</th></tr>
<tr><td>$\\sin$</td><td>0</td><td>$\\frac12$</td><td>$\\frac{\\sqrt2}2$</td><td>$\\frac{\\sqrt3}2$</td><td>1</td><td>0</td></tr>
<tr><td>$\\cos$</td><td>1</td><td>$\\frac{\\sqrt3}2$</td><td>$\\frac{\\sqrt2}2$</td><td>$\\frac12$</td><td>0</td><td>$-1$</td></tr>
<tr><td>$\\tan$</td><td>0</td><td>$\\frac{\\sqrt3}3$</td><td>1</td><td>$\\sqrt3$</td><td>—</td><td>0</td></tr></table>
<p>$\\sin^2x+\\cos^2x=1$, $\\sin 2x=2\\sin x\\cos x$, $\\cos2x=\\cos^2x-\\sin^2x$, $\\sin^2x=\\frac{1-\\cos2x}2$, $\\cos^2x=\\frac{1+\\cos2x}2$.</p>

<h3>6. Taula de derivades (memoritza-la!)</h3>
<table class="tbl">
<tr><td>$(x^n)'=nx^{n-1}$</td><td>$(e^x)'=e^x$</td><td>$(a^x)'=a^x\\ln a$</td></tr>
<tr><td>$(\\ln x)'=\\frac1x$</td><td>$(\\sin x)'=\\cos x$</td><td>$(\\cos x)'=-\\sin x$</td></tr>
<tr><td>$(\\tan x)'=\\frac1{\\cos^2x}$</td><td>$(\\arctan x)'=\\frac1{1+x^2}$</td><td>$(\\arcsin x)'=\\frac1{\\sqrt{1-x^2}}$</td></tr>
</table>
<p>Amb regla de la cadena: $[f(g(x))]'=f'(g(x))\\cdot g'(x)$.</p>
`;

  const gens = [];

  /* 1. Fraccions */
  gens.push({
    id: 'frac', title: 'Operar fraccions', level: 1,
    make(r) {
      const [a, c] = [r.nz(-5, 5), r.nz(-5, 5)], [b, d] = [r.int(2, 7), r.int(2, 7)];
      const op = r.pick(['+', '-', '*', '/']);
      let ans, desc;
      const A = a / b, C = c / d;
      if (op === '+') { ans = A + C; desc = 'suma'; }
      else if (op === '-') { ans = A - C; desc = 'resta'; }
      else if (op === '*') { ans = A * C; desc = 'producte'; }
      else { ans = A / C; desc = 'quocient'; }
      const sym = { '+': '+', '-': '-', '*': '\\cdot', '/': ':' }[op];
      const f = (n, m) => '\\frac{' + n + '}{' + m + '}';
      const sol = [];
      if (op === '+' || op === '-') sol.push('Denominador comú $' + b * d + '$: $\\frac{' + a * d + (op === '+' ? ' + ' : ' - ') + '(' + c * b + ')}{' + b * d + '}$');
      if (op === '*') sol.push('Numeradors per numeradors i denominadors per denominadors: $\\frac{' + a * c + '}{' + b * d + '}$');
      if (op === '/') sol.push('Dividir és multiplicar per la inversa: $' + f(a, b) + '\\cdot' + f(d, c) + '$');
      sol.push('Simplifica: $' + T(ans) + '$');
      return P.num('Calcula aquesta ' + (desc === 'producte' || desc === 'quocient' ? 'operació (' + desc + ')' : desc) + ' i dona el resultat simplificat: $' + f(a, b) + ' ' + sym + ' ' + f(c, d) + '$', ans, sol);
    }
  });

  /* 2. Equació de segon grau */
  gens.push({
    id: 'quad', title: 'Equacions de 2n grau', level: 1,
    make(r) {
      const [p, q] = H.sortNum(H.distinct(r, 2, -7, 7));
      const a = r.pick([1, 1, 2, -1, 3]);
      const c = M.polyMul([-p, 1], [-q, 1]).map(v => v * a);
      const disc = c[1] * c[1] - 4 * c[2] * c[0];
      const tex = M.polyTex(c);
      return P.multi('Resol $' + tex + '=0$. Escriu les dues solucions (primer la menor).', [
        { label: '$x_1=$', ans: p, ansTex: T(p) }, { label: '$x_2=$', ans: q, ansTex: T(q) }],
        ['Discriminant: $\\Delta=' + c[1] + '^2-4\\cdot' + (c[2] < 0 ? '(' + c[2] + ')' : c[2]) + '\\cdot' + (c[0] < 0 ? '(' + c[0] + ')' : c[0]) + '=' + disc + '$, $\\sqrt\\Delta=' + Math.sqrt(disc) + '$.',
          '$x=\\dfrac{' + (-c[1]) + '\\pm' + Math.sqrt(disc) + '}{' + 2 * c[2] + '}$ ⇒ $x=' + p + '$ i $x=' + q + '$.']);
    }
  });

  /* 3. Factorització */
  gens.push({
    id: 'factor', title: 'Factoritzar polinomis', level: 1,
    make(r) {
      const [p, q] = H.distinct(r, 2, -6, 6, true);
      const c = M.polyMul([-p, 1], [-q, 1]);
      const tex = M.polyTex(c);
      const ok = '$(' + H.xm(p) + ')(' + H.xm(q) + ')$';
      const wr = ['$(' + H.xm(-p) + ')(' + H.xm(-q) + ')$', '$(' + H.xm(p) + ')(' + H.xm(-q) + ')$', '$(' + H.xm(-p) + ')(' + H.xm(q) + ')$'];
      return P.mc(r, 'Quina és la factorització de $' + tex + '$?', ok, wr, [
        'Busquem dos nombres amb suma $' + c[1] + '$ i producte $' + c[0] + '$: són $' + (-p) + '$ i $' + (-q) + '$.',
        'Per tant les arrels són $x=' + p + '$ i $x=' + q + '$, i el polinomi és ' + ok + '.']);
    }
  });

  /* 4. Inequacions / signe */
  gens.push({
    id: 'ineq', title: 'Signe de la paràbola (inequacions)', level: 2,
    make(r) {
      const [p, q] = H.sortNum(H.distinct(r, 2, -6, 6));
      const a = r.pick([1, -1]);
      const geq = r.pick([true, false]);
      const poly = M.polyMul([-p, 1], [-q, 1]).map(v => v * a);
      const outside = (a > 0) === geq; // fora de les arrels?
      const rel = geq ? '\\ge' : '\\le';
      const sol = outside ? '$(-\\infty,' + p + ']\\cup[' + q + ',+\\infty)$' : '$[' + p + ',' + q + ']$';
      const wr = outside ? ['$[' + p + ',' + q + ']$', '$(-\\infty,' + p + ')\\cup(' + q + ',+\\infty)$', '$(' + p + ',' + q + ')$']
        : ['$(-\\infty,' + p + ']\\cup[' + q + ',+\\infty)$', '$(' + p + ',' + q + ')$', '$(-\\infty,' + p + ')\\cup(' + q + ',+\\infty)$'];
      return P.mc(r, 'Resol la inequació $' + M.polyTex(poly) + rel + '0$.', sol, wr, [
        'Arrels: $x=' + p + '$ i $x=' + q + '$.',
        'El coeficient principal és ' + (a > 0 ? 'positiu: la paràbola és negativa entre les arrels i positiva fora.' : 'negatiu: la paràbola és positiva entre les arrels i negativa fora.'),
        'Com que volem $' + rel + '0$ (amb igualtat, arrels incloses): ' + sol]);
    }
  });

  /* 5. Potències i arrels */
  gens.push({
    id: 'powers', title: 'Potències i arrels', level: 1,
    make(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        const b = r.pick([2, 3, 5]), m = r.int(2, 6), n = r.int(1, 5), k = r.int(1, 4);
        const e = m + n - k;
        const ans = Math.pow(b, e);
        return P.num('Calcula $\\dfrac{' + b + '^{' + m + '}\\cdot ' + b + '^{' + n + '}}{' + b + '^{' + k + '}}$', ans, ['Sumem exponents a dalt i restem el de baix: $' + b + '^{' + m + '+' + n + '-' + k + '}=' + b + '^{' + e + '}=' + ans + '$.']);
      }
      if (t === 1) {
        const b = r.pick([4, 9, 16, 25, 36, 49]);
        const n = r.pick([-1, -2, 3, 1.5]);
        const ans = Math.pow(b, n);
        return P.num('Calcula $' + b + '^{' + T(n) + '}$', ans, ['$' + b + '^{' + T(n) + '}$ amb $' + b + '=' + Math.sqrt(b) + '^2$ ⇒ ' + ((n === -1 || n === -2) ? 'exponent negatiu = invers: $1/' + Math.pow(b, -n) + '$' : (n === 1.5 ? '$a^{3/2}=\\sqrt a^{\\,3}=' + Math.pow(Math.sqrt(b), 3) + '$' : '$' + Math.pow(b, 3) + '$')) + '.']);
      }
      if (t === 2) {
        const a = r.int(2, 5), k = r.int(2, 4);
        const ans = a;
        return P.num('Simplifica $\\sqrt[' + k + ']{' + a + '^{' + k + '}}$', ans, ['$\\sqrt[n]{a^n}=a$ (per $a>0$).']);
      }
      const a = r.int(2, 4), b = r.int(1, 3);
      return P.num('Calcula $\\left(\\dfrac{' + a + '}{' + (a + b) + '}\\right)^{-2}\\cdot ' + a + '^{2}$', Math.pow((a + b) / a, 2) * a * a, ['Exponent negatiu: gira la fracció: $\\left(\\frac{' + (a + b) + '}{' + a + '}\\right)^2\\cdot ' + a + '^2=' + Math.pow(a + b, 2) + '$.']);
    }
  });

  /* 6. Logaritmes */
  gens.push({
    id: 'logs', title: 'Logaritmes i exponencials', level: 1,
    make(r) {
      const t = r.int(0, 3);
      if (t === 0) { const n = r.int(2, 6), k = r.int(2, 5); return P.num('Calcula $\\ln\\left(e^{' + n + '}\\right)+e^{\\ln ' + k + '}$', n + k, ['$\\ln e^{n}=n$ i $e^{\\ln k}=k$: $' + n + '+' + k + '=' + (n + k) + '$.']); }
      if (t === 1) { const b = r.pick([2, 3, 5]), n = r.int(2, 5); return P.num('Calcula $\\log_{' + b + '}(' + Math.pow(b, n) + ')$', n, ['$' + b + '^{' + n + '}=' + Math.pow(b, n) + '$, per tant el logaritme és $' + n + '$.']); }
      if (t === 2) { const a = r.int(2, 5); return P.num('Simplifica $\\ln(e^{' + a + '})-\\ln(e^{-1})$', a + 1, ['$\\ln e^a=a$: $' + a + '-(-1)=' + (a + 1) + '$.']); }
      const a = r.int(2, 4);
      return P.num('Resol $e^{' + a + 'x}=e^{' + a * 3 + '}$ per a $x$', 3, ['La funció exponencial és injectiva: $' + a + 'x=' + a * 3 + '$ ⇒ $x=3$.']);
    }
  });

  /* 7. Valors trigonomètrics exactes */
  gens.push({
    id: 'trig', title: 'Valors trigonomètrics exactes', level: 1,
    make(r) {
      const angs = [[0, '0'], [Math.PI / 6, '\\frac{\\pi}{6}'], [Math.PI / 4, '\\frac{\\pi}{4}'], [Math.PI / 3, '\\frac{\\pi}{3}'], [Math.PI / 2, '\\frac{\\pi}{2}'], [Math.PI, '\\pi'], [2 * Math.PI / 3, '\\frac{2\\pi}{3}'], [3 * Math.PI / 4, '\\frac{3\\pi}{4}'], [5 * Math.PI / 6, '\\frac{5\\pi}{6}'], [3 * Math.PI / 2, '\\frac{3\\pi}{2}']];
      const [a, s] = r.pick(angs);
      const [fname, f] = r.pick([['\\sin', Math.sin], ['\\cos', Math.cos]]);
      const v = f(a);
      return P.num('Calcula el valor exacte de $' + fname + '\\left(' + s + '\\right)$. (Pots escriure arrels: <code>sqrt(3)/2</code>)', Math.abs(v) < 1e-12 ? 0 : v, ['Mira el cercle unitat: $' + fname + '\\left(' + s + '\\right)=' + (Math.abs(v) < 1e-12 ? '0' : M.round(v, 6)) + '$.'], { tol: 1e-6 });
    }
  });

  /* 8. Taula de derivades (drill) */
  gens.push({
    id: 'dertable', title: 'Derivades immediates', level: 1,
    make(r) {
      const a = r.int(2, 6);
      const pool = [
        ['x^' + a, a + '*x^' + (a - 1)], ['e^(' + a + 'x)', a + '*e^(' + a + 'x)'], ['sin(' + a + 'x)', a + '*cos(' + a + 'x)'],
        ['cos(' + a + 'x)', '-' + a + '*sin(' + a + 'x)'], ['ln(x)', '1/x'], ['sqrt(x)', '1/(2*sqrt(x))'], ['1/x', '-1/x^2'],
        ['atan(x)', '1/(1+x^2)'], ['tan(x)', '1/cos(x)^2'], [a + '^x', a + '^x*ln(' + a + ')'], ['ln(' + a + 'x)', '1/x'], ['x^(' + a + '/2)', '(' + a + '/2)*x^(' + a + '/2-1)']
      ];
      const [f, d] = r.pick(pool);
      const p = P.fn('Deriva $f(x)=' + M.tex(f) + '$.', d, ['Taula de derivades: $f\'(x)=' + M.toTex(M.diff(f)) + '$.']);
      p.check = () => M.checkFn(d, M.toStr(M.diff(f)), {}).ok;
      return p;
    }
  });

  /* 9. Taula de primitives (drill) */
  gens.push({
    id: 'inttable', title: 'Primitives immediates (taula)', level: 1,
    make(r) {
      const a = r.int(2, 6), n = r.int(2, 6);
      const pool = [
        ['x^' + n, 'x^' + (n + 1) + '/' + (n + 1)], ['e^(' + a + 'x)', 'e^(' + a + 'x)/' + a], ['sin(' + a + 'x)', '-cos(' + a + 'x)/' + a],
        ['cos(' + a + 'x)', 'sin(' + a + 'x)/' + a], ['1/x', 'ln(x)'], ['1/(1+x^2)', 'atan(x)'], [a + '/x', a + '*ln(x)'], ['1/(' + a + 'x)', 'ln(x)/' + a],
        ['sqrt(x)', '2*x^(3/2)/3'], ['1/x^2', '-1/x'], [a + 'x^' + n, a + '*x^' + (n + 1) + '/' + (n + 1)], ['1/sqrt(x)', '2*sqrt(x)']
      ];
      const [f, F] = r.pick(pool);
      const p = P.fn('Calcula $\\displaystyle\\int ' + M.tex(f) + '\\,dx$ (la constant $C$ és opcional).', F, ['Taula de primitives: $\\int ' + M.tex(f) + '\\,dx=' + M.tex(F) + '+C$.'], { utc: true });
      p.check = () => { const g = M.compile(F), ff = M.compile(f); return Math.abs(M.numDiff(g, 1.3) - ff(1.3)) < 1e-5; };
      return p;
    }
  });

  Calc.add({
    id: 'base', num: 'B', llista: 'Base', title: 'Fonaments: àlgebra i funcions elementals',
    short: 'Fraccions, factorització, potències, logs, trigonometria, taules de derivades i primitives.',
    desc: 'Si portes anys sense estudiar càlcul, comença aquí. És la base de tot.',
    theory, gens,
    bank: [
      { q: 'Quina igualtat és <b>falsa</b>?', c: ['$\\ln(ab)=\\ln a+\\ln b$', '$\\ln(a+b)=\\ln a+\\ln b$', '$\\ln a^n=n\\ln a$', '$e^{\\ln x}=x$ ($x>0$)'], a: 1, e: 'El logaritme transforma <i>productes</i> en sumes, no sumes en sumes.' },
      { q: '$\\dfrac{a+b}{c+d}$ és igual a…', c: ['$\\frac ac+\\frac bd$', '$\\frac{a}{c}+\\frac{b}{c}$', 'cap de les anteriors', '$\\frac{a}{c}\\cdot\\frac{b}{d}$'], a: 2, e: 'No es pot separar un denominador que és una suma.' },
      { q: 'Les arrels de $x^2-5x+6$ són…', c: ['$1$ i $6$', '$2$ i $3$', '$-2$ i $-3$', '$-1$ i $-6$'], a: 1, e: 'Suma $5$, producte $6$: $2$ i $3$.' },
      { q: '$\\sqrt{x^2}$ és igual a…', c: ['$x$', '$|x|$', '$\\pm x$', '$x^2$'], a: 1, e: 'L\'arrel quadrada és sempre $\\ge0$.' },
      { q: '$\\sin^2x+\\cos^2x=$', c: ['$0$', '$1$', '$\\sin2x$', '$2$'], a: 1, e: 'Identitat fonamental.' },
      { q: 'Quan $\\Delta=b^2-4ac<0$, l\'equació de 2n grau té…', c: ['dues arrels reals', 'una arrel doble', 'cap arrel real (dues complexes conjugades)', 'infinites arrels'], a: 2, e: 'Les arrels són $\\alpha\\pm\\beta i$.' },
      { q: '$(a+b)^2=$', c: ['$a^2+b^2$', '$a^2+2ab+b^2$', '$a^2-2ab+b^2$', '$2a+2b$'], a: 1, e: 'Recorda el terme creuat $2ab$.' },
      { q: '$x^{-3}$ és igual a…', c: ['$-x^3$', '$\\frac{1}{x^3}$', '$-\\frac1{x^3}$', '$\\frac{1}{x^{-3}}$'], a: 1, e: 'Exponent negatiu = invers.' }
    ]
  });
})();
