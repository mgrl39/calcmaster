/* Llista 8 — Descomposició en fraccions simples i integració de funcions racionals */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;

  const theory = `
<h3>Idea</h3>
<p>Per calcular $\\displaystyle\\int\\frac{p(x)}{q(x)}dx$ amb $p,q$ polinomis:</p>
<p>No hi ha una fórmula directa: cal seguir un procediment per passos.</p>
<ol start="0">
<li><b>És quasi immediata?</b> Si el numerador és (un múltiple de) la derivada del denominador, surt un logaritme: $\\displaystyle\\int\\frac{2x+1}{x^2+x+1}\\,dx=\\ln|x^2+x+1|+C$. No cal res més.</li>
<li>Si $\\deg p\\ge\\deg q$: <b>divideix</b> $p=c\\,q+R$ ⇒ $\\dfrac pq=c(x)+\\dfrac Rq$ amb $\\deg R<\\deg q$. Integra $c(x)$ directament. (Com amb enters: $14=4\\cdot3+2$, el residu sempre és més petit que el divisor.)</li>
<li><b>Factoritza</b> el denominador $q$. Si $q(a)=0$, llavors $q(x)=q_1(x)(x-a)$ (Ruffini). Els candidats a arrel entera són els <b>divisors del terme independent</b>. Teorema fonamental de l'àlgebra (versió real): tot polinomi es factoritza en factors de grau 1 i factors de grau 2 irreductibles. La quadràtica que queda es resol amb la fórmula, i les arrels poden ser irracionals ($1\\pm\\sqrt2$).</li>
<li>Descompon $\\dfrac Rq$ en <b>fraccions simples</b> segons els factors de $q$:</li>
<li>Calcula les constants i integra cada fracció.</li>
</ol>

<h3>Taula de descomposició</h3>
<table class="tbl">
<tr><th>Factor de $q$</th><th>Fraccions simples</th></tr>
<tr><td>$(x-a)$ (arrel simple)</td><td>$\\dfrac{A}{x-a}$</td></tr>
<tr><td>$(x-a)^k$ (arrel múltiple)</td><td>$\\dfrac{A_1}{x-a}+\\dfrac{A_2}{(x-a)^2}+\\dots+\\dfrac{A_k}{(x-a)^k}$</td></tr>
<tr><td>$x^2+bx+c$ irreductible ($\\Delta<0$)</td><td>$\\dfrac{Ax+B}{x^2+bx+c}$</td></tr>
</table>

<h3>Càlcul de les constants</h3>
<ul>
<li><b>Mètode dels residus (arrels simples):</b> multiplica per $q$ i substitueix $x=a$ (que anul·la els altres termes). Ex: $9x-6=A(x+2)+B(x-1)$; $x=1$: $3=3A\\Rightarrow A=1$; $x=-2$: $-24=-3B\\Rightarrow B=8$.</li>
<li><b>Identificar coeficients:</b> desenvolupa i iguala les potències de $x$ (sistema lineal). Combina-ho amb valors de $x$ que et convinguin.</li>
</ul>

<h3>Integrals de les fraccions simples</h3>
<div class="box formula">
$\\displaystyle\\int\\frac{A}{x-a}dx=A\\ln|x-a|$ &nbsp;&nbsp; $\\displaystyle\\int\\frac{A}{(x-a)^k}dx=\\frac{A}{(1-k)(x-a)^{k-1}}$ ($k\\ge2$)<br>
$\\displaystyle\\int\\frac{Ax+B}{x^2+bx+c}dx$: separa $=\\frac A2\\int\\frac{2x+b}{x^2+bx+c}dx+\\left(B-\\frac{Ab}2\\right)\\int\\frac{dx}{x^2+bx+c}$.<br>
Primera part: $\\ln(x^2+bx+c)$. Segona: completa quadrats $x^2+bx+c=(x+h)^2+k^2$ ⇒ $\\frac1k\\arctan\\frac{x+h}k$.
</div>
<div class="box warn">Si el numerador és la derivada del denominador, directament $\\int\\frac{q'}{q}=\\ln|q|$ (no cal descompondre).</div>

<h3>Exemple complet (tots els passos)</h3>
<p>$\\displaystyle\\int\\frac{x^4-2x-1}{x^3-3x^2+x+1}\\,dx$</p>
<details class="theory"><summary><b>Pas 1: divisió</b> (grau 4 ≥ grau 3)</summary>
<ul>
<li>$x^4-(x^4-3x^3+x^2+x)=3x^3-x^2-3x-1$</li>
<li>$3x^3-x^2-3x-1-(3x^3-9x^2+3x+3)=8x^2-6x-4$</li>
</ul>
<p>Quocient $c(x)=x+3$, residu $r(x)=8x^2-6x-4$:</p>
<p>$$x^4-2x-1=(x+3)(x^3-3x^2+x+1)+(8x^2-6x-4)$$</p>
<p>$$\\int\\frac{x^4-2x-1}{x^3-3x^2+x+1}\\,dx=\\int(x+3)\\,dx+\\int\\frac{8x^2-6x-4}{x^3-3x^2+x+1}\\,dx$$</p>
</details>
<details class="theory"><summary><b>Pas 2: factoritzar</b> (Ruffini + fórmula)</summary>
<p>Candidats: divisors de $1$, és a dir $\\pm1$. Amb $x=-1$ el residu és $-4$ (no és arrel). Amb $x=1$:</p>
<table class="tbl ruff"><tr><td></td><td>$1$</td><td>$-3$</td><td>$1$</td><td>$1$</td></tr><tr><td>$1$</td><td></td><td>$1$</td><td>$-2$</td><td>$-1$</td></tr><tr><td></td><td>$1$</td><td>$-2$</td><td>$-1$</td><td><b>$0$</b></td></tr></table>
<p>$x^3-3x^2+x+1=(x-1)(x^2-2x-1)$ i $x^2-2x-1=0\\Rightarrow x=\\frac{2\\pm\\sqrt8}{2}=1\\pm\\sqrt2$:</p>
<p>$$Q(x)=(x-1)\\big(x-(1+\\sqrt2)\\big)\\big(x-(1-\\sqrt2)\\big)$$</p>
</details>
<details class="theory"><summary><b>Pas 3: fraccions simples</b></summary>
<p>$$\\frac{8x^2-6x-4}{(x-1)(x-(1+\\sqrt2))(x-(1-\\sqrt2))}=\\frac{A}{x-1}+\\frac{B}{x-(1+\\sqrt2)}+\\frac{C}{x-(1-\\sqrt2)}$$</p>
<p>Si dues fraccions amb el mateix denominador són iguals, els numeradors també:</p>
<p>$$8x^2-6x-4=A(x^2-2x-1)+B\\big(x^2-(2-\\sqrt2)x+(1-\\sqrt2)\\big)+C\\big(x^2-(2+\\sqrt2)x+(1+\\sqrt2)\\big)$$</p>
<p>Igualant coeficients surt un sistema:</p>
<p>$$\\begin{cases}8=A+B+C\\\\-6=-2A-(2-\\sqrt2)B-(2+\\sqrt2)C\\\\-4=-A+(1-\\sqrt2)B+(1+\\sqrt2)C\\end{cases}$$</p>
<p>És més ràpid substituir $x$ per cada arrel ($x=1$ anul·la $B$ i $C$, etc.):</p>
<p>$$A=1,\\quad B=\\frac{7+5\\sqrt2}{2},\\quad C=\\frac{7-5\\sqrt2}{2}$$</p>
<p>Exemple de la forma general:</p>
<p>$$\\frac{p(x)}{(x-1)^2(x+1)(x+3)^3(x^2+x+1)}=\\frac{A}{x-1}+\\frac{B}{(x-1)^2}+\\frac{C}{x+1}+\\frac{D}{x+3}+\\frac{E}{(x+3)^2}+\\frac{F}{(x+3)^3}+\\frac{Gx+H}{x^2+x+1}$$</p>
</details>
<details class="theory"><summary><b>Pas 4: integrar</b> i resultat</summary>
<p>$\\displaystyle\\int\\frac{A}{x-a}dx=A\\ln|x-a|+C$, &nbsp; $\\displaystyle\\int\\frac{B}{(x-a)^k}dx=\\frac{B(x-a)^{1-k}}{1-k}+C$ ($k\\ge2$). Per a un factor irreductible de grau 2: completa quadrats fins a una arctangent, $(\\arctan x)'=\\frac{1}{1+x^2}$ (abans separa la part que dona un logaritme).</p>
<div class="box formula">$$\\int\\frac{x^4-2x-1}{x^3-3x^2+x+1}\\,dx=\\frac{x^2}{2}+3x+\\ln|x-1|+\\frac{7+5\\sqrt2}{2}\\ln|x-1-\\sqrt2|+\\frac{7-5\\sqrt2}{2}\\ln|x-1+\\sqrt2|+C$$</div>
</details>
<div class="box ex"><b>Resum del mètode:</b> (0) quasi immediata? → (1) dividir si cal → (2) factoritzar $Q$ → (3) fraccions simples → (4) integrar cada fracció.</div>
`;

  const gens = [];
  /** comprova numèricament que F' = integrand en l'interval donat */
  const chkInt = (F, fx, range) => () => { const g = M.compile(F); return [0.2, 0.5, 0.8].every(t => { const x = range[0] + (range[1] - range[0]) * t; return Math.abs(M.numDiff(g, x) - fx(x)) < 1e-4 * Math.max(1, Math.abs(fx(x))); }); };
  /** fraccions simples: A/(x-a)+B/(x-b) amb enters */
  gens.push({
    id: 'coef2', title: 'Constants A, B (arrels simples)', level: 1,
    make(r) {
      const [a, b] = H.distinct(r, 2, -4, 4);
      const A = r.nz(-6, 6), B = r.nz(-6, 6);
      const num = [-(A * b + B * a), A + B]; // (A+B)x - (A b + B a)
      if (num[1] === 0 && num[0] === 0) return null;
      const den = M.polyMul([-a, 1], [-b, 1]);
      return P.multi('Descompon $\\dfrac{' + M.polyTex(num) + '}{(' + H.xm(a) + ')(' + H.xm(b) + ')}=\\dfrac{A}{' + H.xm(a) + '}+\\dfrac{B}{' + H.xm(b) + '}$. Troba $A$ i $B$.',
        [{ label: '$A=$', ans: A }, { label: '$B=$', ans: B }],
        ['Multiplica per $(' + H.xm(a) + ')(' + H.xm(b) + ')$: $' + M.polyTex(num) + '=A(' + H.xm(b) + ')+B(' + H.xm(a) + ')$.', '$x=' + a + '$: $' + M.polyEval(num, a) + '=A(' + T(a - b) + ')$ ⇒ $A=' + A + '$.', '$x=' + b + '$: $' + M.polyEval(num, b) + '=B(' + T(b - a) + ')$ ⇒ $B=' + B + '$.']);
    }
  });

  gens.push({
    id: 'coef3', title: 'Constants A, B, C (tres arrels)', level: 2,
    make(r) {
      const rs = H.distinct(r, 3, -3, 3);
      const [a, b, c] = rs;
      const A = r.nz(-4, 4), B = r.nz(-4, 4), C = r.nz(-4, 4);
      const num = M.polyAdd(M.polyAdd(M.polyScale(M.polyMul([-b, 1], [-c, 1]), A), M.polyScale(M.polyMul([-a, 1], [-c, 1]), B)), M.polyScale(M.polyMul([-a, 1], [-b, 1]), C));
      const f = (z) => '(' + H.xm(z) + ')';
      return P.multi('Descompon $\\dfrac{' + M.polyTex(num) + '}{' + f(a) + f(b) + f(c) + '}=\\dfrac{A}{' + H.xm(a) + '}+\\dfrac{B}{' + H.xm(b) + '}+\\dfrac{C}{' + H.xm(c) + '}$. Troba $A$, $B$ i $C$.',
        [{ label: '$A=$', ans: A }, { label: '$B=$', ans: B }, { label: '$C=$', ans: C }],
        ['Mètode dels residus: substitueix $x=' + a + ',' + b + ',' + c + '$ al numerador.', '$A=\\dfrac{p(' + a + ')}{(' + a + '-' + T(b) + ')(' + a + '-' + T(c) + ')}=' + A + '$, i anàlogament $B=' + B + '$, $C=' + C + '$.']);
    }
  });

  gens.push({
    id: 'int_simple', title: 'Integral: dues arrels simples', level: 1,
    make(r) {
      const [a, b] = H.distinct(r, 2, -3, 3);
      const A = r.nz(-5, 5), B = r.nz(-5, 5);
      const num = [-(A * b + B * a), A + B];
      const hi = Math.max(a, b) + 0.6;
      const F = '(' + A + ')*ln(x-(' + a + '))+(' + B + ')*ln(x-(' + b + '))';
      const p = P.fn('Calcula $\\displaystyle\\int\\dfrac{' + M.polyTex(num) + '}{(' + H.xm(a) + ')(' + H.xm(b) + ')}\\,dx$ (per a $x>' + Math.max(a, b) + '$).', F, [
        'Descomposició: $\\dfrac{A}{' + H.xm(a) + '}+\\dfrac{B}{' + H.xm(b) + '}$ amb $A=' + A + '$, $B=' + B + '$.', '$\\int=' + A + '\\ln|' + H.xm(a) + '|+' + B + '\\ln|' + H.xm(b) + '|+C$.'], { utc: true, range: [hi, hi + 3], ansTex: A + '\\ln|' + H.xm(a) + '|' + H.sg(B) + '\\ln|' + H.xm(b) + '|' });
      p.check = chkInt(F, x => M.polyEval(num, x) / (M.polyEval([-a, 1], x) * M.polyEval([-b, 1], x)), [hi, hi + 3]);
      return p;
    }
  });

  gens.push({
    id: 'int_repeated', title: 'Integral: arrel doble', level: 2,
    make(r) {
      const a = r.int(-3, 3), A = r.nz(-4, 4), B = r.nz(-5, 5);
      const num = [B - A * a, A];
      const F = '(' + A + ')*ln(x-(' + a + '))-(' + B + ')/(x-(' + a + '))';
      const p = P.fn('Calcula $\\displaystyle\\int\\dfrac{' + M.polyTex(num) + '}{(' + H.xm(a) + ')^2}\\,dx$ (per a $x>' + a + '$).', F, [
        '$\\dfrac{' + M.polyTex(num) + '}{(' + H.xm(a) + ')^2}=\\dfrac{A}{' + H.xm(a) + '}+\\dfrac{B}{(' + H.xm(a) + ')^2}$ ⇒ $' + M.polyTex(num) + '=A(' + H.xm(a) + ')+B$.', 'Coeficient de $x$: $A=' + A + '$; terme independent: $B-Aa=' + (B - A * a) + '$ ⇒ $B=' + B + '$.', '$\\int=' + A + '\\ln|' + H.xm(a) + '|-\\dfrac{' + B + '}{' + H.xm(a) + '}+C$.'], { utc: true, range: [a + 0.4, a + 3.4], ansTex: A + '\\ln|' + H.xm(a) + '|-\\dfrac{' + B + '}{' + H.xm(a) + '}' });
      p.check = chkInt(F, x => M.polyEval(num, x) / Math.pow(x - a, 2), [a + 0.4, a + 3.4]);
      return p;
    }
  });

  gens.push({
    id: 'int_arctan', title: 'Integral: denominador irreductible', level: 2,
    make(r) {
      const h = r.int(-3, 3), k = r.int(1, 3), b = 2 * h, c = h * h + k * k;
      const A = r.int(-3, 3), B = r.nz(-4, 4);
      const num = [A * b + B, 2 * A];
      const den = [c, b, 1];
      const F = '(' + A + ')*ln(x^2+(' + b + ')x+(' + c + '))+(' + B + '/' + k + ')*atan((x+(' + h + '))/' + k + ')';
      const p = P.fn('Calcula $\\displaystyle\\int\\dfrac{' + M.polyTex(num) + '}{' + M.polyTex(den) + '}\\,dx$.', F, [
        '$' + M.polyTex(den) + '=(' + H.xm(-h) + ')^2+' + k * k + '$ (irreductible: $\\Delta<0$).', 'Separa: $\\dfrac{' + M.polyTex(num) + '}{' + M.polyTex(den) + '}=' + A + '\\dfrac{2x' + H.sg(b) + '}{' + M.polyTex(den) + '}+\\dfrac{' + B + '}{' + M.polyTex(den) + '}$.', 'Primer terme: $' + A + '\\ln(' + M.polyTex(den) + ')$. Segon: $\\dfrac{' + B + '}{' + k + '}\\arctan\\dfrac{x' + H.sg(h) + '}{' + k + '}$.'], { utc: true, range: [-2, 3], ansTex: (A ? A + '\\ln(' + M.polyTex(den) + ')+' : '') + '\\frac{' + B + '}{' + k + '}\\arctan\\frac{x' + H.sg(h) + '}{' + k + '}' });
      p.check = chkInt(F, x => M.polyEval(num, x) / M.polyEval(den, x), [-2, 3]);
      return p;
    }
  });

  gens.push({
    id: 'polydiv', title: 'Divisió de polinomis', level: 1,
    make(r) {
      const a = r.int(-4, 4), k = r.pick([1, 1, 2]);
      const b = r.int(-5, 5), c = r.int(-6, 6);
      const num = [c, b, k]; // k x^2 + b x + c
      const q1 = k, q0 = b + k * a, rem = c + a * (b + k * a);
      return P.multi('Divideix $' + M.polyTex(num) + '$ entre $' + H.xm(a) + '$: escriu quocient $q(x)=q_1x+q_0$ i residu $R$.',
        [{ label: '$q_1=$', ans: q1 }, { label: '$q_0=$', ans: q0 }, { label: '$R=$', ans: rem }],
        ['Ruffini amb $a=' + a + '$: coeficients ' + k + ', ' + b + ', ' + c + '.', 'Baixa $' + k + '$; $' + k + '\\cdot' + a + '+' + b + '=' + q0 + '$; $' + q0 + '\\cdot' + a + '+' + c + '=' + rem + '$.', '$\\dfrac{' + M.polyTex(num) + '}{' + H.xm(a) + '}=' + M.polyTex([q0, q1]) + '+\\dfrac{' + rem + '}{' + H.xm(a) + '}$.']);
    }
  });

  gens.push({
    id: 'int_improper', title: 'Integral: grau num ≥ grau den', level: 2,
    make(r) {
      const a = r.int(-3, 3), b = r.int(-4, 4), c = r.int(-5, 5);
      const q0 = a + b, rem = a * a + a * b + c;
      const F = 'x^2/2+(' + q0 + ')*x+(' + rem + ')*ln(x-(' + a + '))';
      const p = P.fn('Calcula $\\displaystyle\\int\\dfrac{' + M.polyTex([c, b, 1]) + '}{' + H.xm(a) + '}\\,dx$ (per a $x>' + a + '$).', F, [
        'Grau num $\\ge$ grau den: divideix. $\\dfrac{' + M.polyTex([c, b, 1]) + '}{' + H.xm(a) + '}=x' + H.sg(q0) + '+\\dfrac{' + rem + '}{' + H.xm(a) + '}$.', '$\\int=\\dfrac{x^2}2' + H.sg(q0) + 'x' + H.sg(rem) + '\\ln|' + H.xm(a) + '|+C$.'], { utc: true, range: [a + 0.4, a + 3.4], ansTex: '\\frac{x^2}2' + H.sg(q0) + 'x' + H.sg(rem) + '\\ln|' + H.xm(a) + '|' });
      p.check = chkInt(F, x => (x * x + b * x + c) / (x - a), [a + 0.4, a + 3.4]);
      return p;
    }
  });

  Calc.add({
    id: 'l8', num: '8', llista: 'Llista 8', title: 'Fraccions simples i integrals racionals',
    short: 'Descomposició en fraccions simples (arrels simples, múltiples, irreductibles) i integració.',
    desc: 'Llista d\'integrals de quocients de polinomis.',
    theory, gens,
    bank: [
      { q: 'Si $\\deg p\\ge\\deg q$, el primer pas és…', c: ['descompondre directament', 'dividir $p$ entre $q$', 'derivar', 'substituir'], a: 1, e: 'Cal $\\deg R<\\deg q$.' },
      { q: 'A $\\dfrac{1}{(x-1)^2(x+2)}$ la descomposició és…', c: ['$\\frac{A}{x-1}+\\frac{B}{x+2}$', '$\\frac{A}{x-1}+\\frac{B}{(x-1)^2}+\\frac{C}{x+2}$', '$\\frac{A}{(x-1)^2}+\\frac{B}{x+2}$', '$\\frac{Ax+B}{(x-1)^2}+\\frac{C}{x+2}$'], a: 1, e: 'Una fracció per cada potència fins a $k$.' },
      { q: 'Un factor $x^2+4$ dona una fracció simple de la forma…', c: ['$\\frac{A}{x^2+4}$', '$\\frac{Ax+B}{x^2+4}$', '$\\frac{A}{x-2}+\\frac{B}{x+2}$', '$\\frac{A}{x}+\\frac{B}{4}$'], a: 1, e: 'Numerador de grau 1.' },
      { q: '$\\int\\dfrac{1}{x^2+9}dx=$', c: ['$\\ln(x^2+9)$', '$\\frac13\\arctan\\frac x3+C$', '$\\arctan x$', '$\\frac{1}{18x}$'], a: 1, e: '$\\frac1k\\arctan\\frac xk$.' },
      { q: '$\\int\\dfrac{2x}{x^2+1}dx=$', c: ['$\\arctan x$', '$\\ln(x^2+1)+C$', '$2\\arctan x$', '$\\frac{1}{x^2+1}$'], a: 1, e: 'Numerador = derivada del denominador.' },
      { q: 'A $\\int\\dfrac{2x+1}{x^2+x+1}dx$, el primer que fas és…', c: ['dividir', 'fraccions simples', 'res: és quasi immediata, $\\ln|x^2+x+1|+C$', 'per parts'], a: 2, e: 'El numerador és la derivada del denominador (pas 0).' },
      { q: 'Candidats a arrel entera de $x^3-3x^2+x+1$:', c: ['$\\pm1$', '$\\pm1,\\pm3$', '$0,\\pm1$', 'cap'], a: 0, e: 'Divisors del terme independent ($1$).' },
      { q: 'Les arrels de $x^2-2x-1$ són…', c: ['$1\\pm\\sqrt2$', '$-1\\pm\\sqrt2$', '$1$ i $-1$', 'no en té'], a: 0, e: '$x=\\frac{2\\pm\\sqrt8}{2}=1\\pm\\sqrt2$.' },
      { q: '$\\int\\dfrac{1}{(x-3)^2}dx=$', c: ['$\\ln|x-3|$', '$-\\dfrac{1}{x-3}+C$', '$\\dfrac{1}{x-3}$', '$-\\dfrac2{(x-3)^3}$'], a: 1, e: '$\\int u^{-2}du=-u^{-1}$.' }
    ]
  });
})();
