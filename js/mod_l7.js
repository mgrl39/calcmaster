/* Llista 7 — Mètode de Newton i primitives (immediates, substitució, parts, trigonomètriques) */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;

  const theory = `
<h3>Mètode de Newton–Raphson (arrels de $f(x)=0$)</h3>
<div class="box formula">
$\\displaystyle x_{n+1}=x_n-\\frac{f(x_n)}{f'(x_n)}$
</div>
<ul>
<li>Idea: tria $x_0$ proper a l'arrel, traça la tangent en $(x_n,f(x_n))$ i pren on talla l'eix $x$.</li>
<li>Convergència <b>quadràtica</b> (els decimals correctes es dupliquen cada iteració) si $f'\\ne0$ i $x_0$ és prou proper. Falla si $f'(x_n)\\approx0$.</li>
<li><b>Per trobar un extrem</b> de $f$ (mínim, màxim) o un <b>punt d'inflexió</b>: aplica Newton a $g=f'$ (extrem) o a $g=f''$ (inflexió): $x_{n+1}=x_n-\\dfrac{f'(x_n)}{f''(x_n)}$.</li>
<li>Per "sis xifres decimals correctes": itera fins que $|x_{n+1}-x_n|<5\\cdot10^{-7}$ (treballa amb 7–8 decimals a la calculadora). Un mínim absolut en $[a,b]$: compara amb els extrems.</li>
</ul>
<div class="box ex"><b>Exemple.</b> $\\sqrt2$: $f=x^2-2$, $x_{n+1}=\\frac12\\left(x_n+\\frac2{x_n}\\right)$. De $x_0=1.5$: $1.41667,\\ 1.414216,\\ 1.414214$.</div>

<h3>Primitives: mètodes</h3>
<p>$\\int f(x)\\,dx=F(x)+C$ si $F'=f$. <b>Comprova sempre derivant el resultat.</b> Taula bàsica (amb $u=u(x)$):</p>
<table class="tbl">
<tr><td>$\\int u^n u'=\\frac{u^{n+1}}{n+1}$ ($n\\ne-1$)</td><td>$\\int\\frac{u'}{u}=\\ln|u|$</td><td>$\\int e^uu'=e^u$</td></tr>
<tr><td>$\\int\\cos u\\,u'=\\sin u$</td><td>$\\int\\sin u\\,u'=-\\cos u$</td><td>$\\int\\frac{u'}{1+u^2}=\\arctan u$</td></tr>
<tr><td>$\\int\\frac{u'}{\\sqrt{1-u^2}}=\\arcsin u$</td><td>$\\int\\frac{dx}{\\cos^2x}=\\tan x$</td><td>$\\int a^x=\\frac{a^x}{\\ln a}$</td></tr>
</table>

<h3>Substitució (canvi de variable)</h3>
<p>Busca una funció $u(x)$ <b>la derivada de la qual</b> apareix multiplicant. Posa $u=g(x)$, $du=g'(x)dx$ i reescriu <i>tot</i> en $u$.</p>
<div class="box ex"><b>Exemple.</b> $\\int x\\,e^{x^2}dx$: $u=x^2$, $du=2x\\,dx$ ⇒ $\\frac12\\int e^u du=\\frac12e^{x^2}+C$.</div>

<h3>Integració per parts</h3>
<div class="box formula">$\\displaystyle\\int u\\,dv=u\\,v-\\int v\\,du$ &nbsp;&nbsp; <i>(regla mnemotècnica del resum: "Un dia vi una vaca vestida de uniforme" = $\\int u\\,dv=uv-\\int v\\,du$)</i></div>
<p><b>Quin és $u$?</b> Ordre <b>LIATE</b>: Logarítmica, Inversa trigonomètrica, Algebraica (polinomi), Trigonomètrica, Exponencial. Pren com a $u$ la que aparegui primer. Casos típics:</p>
<ul>
<li>$\\int x^n e^{ax},\\ \\int x^n\\sin ax$: $u=x^n$ (repeteix $n$ cops).</li>
<li>$\\int x^n\\ln x,\\ \\int\\ln x,\\ \\int\\arctan x$: $u=\\ln x$ (o $\\arctan x$), $dv=x^n dx$ (o $dx$).</li>
<li>$\\int e^x\\sin x$: dues parts i <b>reapareix la integral inicial</b>: aïlla-la.</li>
</ul>

<h3>Integrals trigonomètriques (del resum)</h3>
<ul>
<li>Potència <b>senar</b> de $\\sin$ (o $\\cos$): separa un factor i usa $\\sin^2=1-\\cos^2$; posa $u=\\cos x$. Ex: $\\int\\sin^3x\\cos^2x\\,dx=\\int(1-\\cos^2x)\\cos^2x\\sin x\\,dx=-\\frac{\\cos^3x}{3}+\\frac{\\cos^5x}{5}+C$.</li>
<li>Potències <b>parelles</b>: $\\sin^2x=\\frac{1-\\cos2x}{2}$, $\\cos^2x=\\frac{1+\\cos2x}2$.</li>
</ul>
`;

  const gens = [];

  /* ------------------------------ Newton ------------------------------ */
  const NPOOL = [
    ['x^2-2', [1, 1.5, 2]], ['x^2-5', [2, 3]], ['x^3-2', [1.5, 1]], ['x^3-x-1', [1.5, 1]], ['cos(x)-x', [1, 0.5]],
    ['e^x-3', [1, 1.5]], ['x-e^(-x)', [0.5, 1]], ['x^3-2x-1', [2, 1.5]], ['ln(x)+x-2', [1.5, 2]], ['x^5-x-1', [1.2, 1]], ['x^2-7', [3, 2.5]], ['x*e^x-1', [0.5, 1]]
  ];
  gens.push({
    id: 'newton', title: 'Mètode de Newton: iteracions', level: 1,
    make(r) {
      const [g, x0s] = r.pick(NPOOL), x0 = r.pick(x0s), k = r.pick([1, 2]);
      const f = M.compile(g), df = M.compile(M.diff(g));
      let x = x0; const its = [x0];
      for (let i = 0; i < k; i++) { x = x - f(x) / df(x); its.push(x); }
      const rows = its.slice(1).map((v, i) => '$x_{' + (i + 1) + '}=x_{' + i + '}-\\dfrac{f(x_{' + i + '})}{f\'(x_{' + i + '})}=' + M.round(v, 7) + '$').join('; ');
      const p = P.num('Aplica el mètode de Newton a $f(x)=' + M.tex(g) + '$ amb $x_0=' + x0 + '$. Calcula $x_{' + k + '}$ (6 decimals).', x,
        ['$f\'(x)=' + M.toTex(M.diff(g)) + '$ i $x_{n+1}=x_n-\\dfrac{f(x_n)}{f\'(x_n)}$.', rows + '.'], { tol: 2e-6 });
      return p;
    }
  });

  gens.push({
    id: 'newton_extreme', title: 'Newton per a extrems i inflexions', level: 2,
    make(r) {
      const pool = [
        ['x^4/4-x^2-x', 'x^3-2x-1', 'mínim', [2]],
        ['x^4/4-x', 'x^3-1', 'mínim', [2, 1.5]],
        ['e^x-3x', 'e^x-3', 'mínim', [1, 2]],
        ['x^3/3-x^2+x-1', 'x^2-2x+1', 'punt crític', [2]],
        ['x-2*sin(x)', '1-2cos(x)', 'punt crític', [1, 0.8]],
        ['x^4-3x^2+x', '4x^3-6x+1', 'extrem', [1, -1.5]]
      ];
      const [f, g, kind, x0s] = r.pick(pool), x0 = r.pick(x0s);
      const dg = M.compile(M.diff(g)), gf = M.compile(g);
      let x = x0; const its = [];
      for (let i = 0; i < 2; i++) { x = x - gf(x) / dg(x); its.push(x); }
      return P.num('Volem trobar un extrem de $f(x)=' + M.tex(f) + '$ resolent $f\'(x)=' + M.tex(g) + '=0$ amb Newton i $x_0=' + x0 + '$. Calcula $x_2$ (6 decimals).', x,
        ['Newton aplicat a $f\'$: $x_{n+1}=x_n-\\dfrac{f\'(x_n)}{f\'\'(x_n)}$ amb $f\'\'(x)=' + M.toTex(M.diff(g)) + '$.', '$x_1=' + M.round(its[0], 7) + '$, $x_2=' + M.round(its[1], 7) + '$.'], { tol: 2e-6 });
    }
  });

  /* ------------------------------ Primitives ------------------------------ */
  const mkPrim = (title, f, F, steps, range) => {
    const p = P.fn('Calcula $\\displaystyle\\int ' + M.tex(f) + '\\,dx$.', F, steps, { utc: true, ansTex: M.tex(F), range: range });
    p.check = () => { const g = M.compile(F), ff = M.compile(f); const [lo, hi] = range || [0.3, 2.7]; return [0.2, 0.5, 0.8].every(t => { const x = lo + (hi - lo) * t; if (!isFinite(ff(x))) return true; return Math.abs(M.numDiff(g, x) - ff(x)) < 1e-4 * Math.max(1, Math.abs(ff(x))); }); };
    return p;
  };

  gens.push({
    id: 'linear', title: 'Primitives amb (ax+b)', level: 1,
    make(r) {
      const a = r.int(2, 5), b = r.nz(-4, 4), n = r.int(2, 5);
      const lin = a + 'x' + (b > 0 ? '+' + b : b), L = M.tex(lin);
      const pool = [
        [() => '(' + lin + ')^' + n, '(' + lin + ')^' + (n + 1) + '/' + (a * (n + 1)), 'Posa $u=' + L + '$, $du=' + a + '\\,dx$: $\\frac1{' + a + '}\\int u^{' + n + '}du=\\frac{u^{' + (n + 1) + '}}{' + a * (n + 1) + '}$.'],
        [() => '1/(' + lin + ')', 'ln(' + lin + ')/' + a, '$u=' + L + '$: $\\frac1{' + a + '}\\int\\frac{du}{u}=\\frac1{' + a + '}\\ln|u|$.'],
        [() => 'e^(' + lin + ')', 'e^(' + lin + ')/' + a, '$u=' + L + '$: $\\frac1{' + a + '}\\int e^udu=\\frac{e^{' + L + '}}{' + a + '}$.'],
        [() => 'sin(' + lin + ')', '-cos(' + lin + ')/' + a, '$u=' + L + '$: $\\frac1{' + a + '}\\int\\sin u\\,du=-\\frac{\\cos u}{' + a + '}$.'],
        [() => 'cos(' + lin + ')', 'sin(' + lin + ')/' + a, '$u=' + L + '$: $\\frac1{' + a + '}\\int\\cos u\\,du=\\frac{\\sin u}{' + a + '}$.'],
        [() => 'sqrt(' + lin + ')', '2*(' + lin + ')^(3/2)/(' + 3 * a + ')', '$u=' + L + '$: $\\frac1{' + a + '}\\int u^{1/2}du=\\frac{2u^{3/2}}{' + 3 * a + '}$.'],
        [() => '1/(1+(' + a + 'x)^2)', 'atan(' + a + 'x)/' + a, '$u=' + a + 'x$: $\\frac1{' + a + '}\\arctan u$.']
      ];
      const [fg, Fs, st] = r.pick(pool);
      const f = fg();
      const needsPositive = f.includes('sqrt') || f.startsWith('1/(' + lin);
      const lo = needsPositive ? Math.max(0.5, -b / a + 0.5) : 0.3;
      return mkPrim('', f, Fs, [st], [lo + 0.1, lo + 2.5]);
    }
  });

  gens.push({
    id: 'split', title: 'Primitives de quocients simples', level: 1,
    make(r) {
      const a = r.nz(-4, 4), b = r.nz(-5, 5), c = r.nz(-6, 6);
      const t = r.int(0, 2);
      if (t === 0) { // (a x^3 + b x^2 + c)/x^2
        const f = '(' + a + 'x^3+(' + b + ')x^2+(' + c + '))/x^2';
        return mkPrim('', f, '(' + a + ')*x^2/2+(' + b + ')*x-(' + c + ')/x', ['Separa la fracció: $' + a + 'x+' + b + '+\\dfrac{' + c + '}{x^2}$ i integra terme a terme.'], [0.4, 2.7]);
      }
      if (t === 1) { // (x^2+a)/sqrt(x)
        const f = '(x^2+(' + a + '))/sqrt(x)';
        return mkPrim('', f, '2*x^(5/2)/5+2*(' + a + ')*sqrt(x)', ['Separa: $x^{3/2}+' + a + 'x^{-1/2}$ i integra: $\\frac{x^{5/2}}{5/2}+' + a + '\\frac{x^{1/2}}{1/2}$.'], [0.4, 2.7]);
      }
      const f = '(x+(' + a + '))^2/x';
      return mkPrim('', f, 'x^2/2+2*(' + a + ')*x+(' + a * a + ')*ln(x)', ['Desenvolupa: $\\dfrac{x^2+' + 2 * a + 'x+' + a * a + '}{x}=x+' + 2 * a + '+\\dfrac{' + a * a + '}{x}$.'], [0.4, 2.7]);
    }
  });

  gens.push({
    id: 'subst', title: 'Integració per substitució', level: 2,
    make(r) {
      const a = r.int(1, 4), n = r.int(2, 5), k = r.int(2, 3);
      const pool = [
        () => mkPrim('', 'x*(x^2+' + a + ')^' + n, '(x^2+' + a + ')^' + (n + 1) + '/' + 2 * (n + 1), ['$u=x^2+' + a + '$, $du=2x\\,dx$ ⇒ $\\frac12\\int u^{' + n + '}du=\\frac{u^{' + (n + 1) + '}}{' + 2 * (n + 1) + '}$.'], [0.3, 2.7]),
        () => mkPrim('', 'x*e^(' + k + 'x^2)', 'e^(' + k + 'x^2)/' + 2 * k, ['$u=' + k + 'x^2$, $du=' + 2 * k + 'x\\,dx$ ⇒ $\\frac{1}{' + 2 * k + '}\\int e^udu$.'], [0.3, 1.5]),
        () => mkPrim('', 'cos(x)*sin(x)^' + n, 'sin(x)^' + (n + 1) + '/' + (n + 1), ['$u=\\sin x$, $du=\\cos x\\,dx$ ⇒ $\\int u^{' + n + '}du=\\frac{u^{' + (n + 1) + '}}{' + (n + 1) + '}$.'], [0.3, 2.7]),
        () => mkPrim('', 'ln(x)/x', 'ln(x)^2/2', ['$u=\\ln x$, $du=\\frac{dx}{x}$ ⇒ $\\int u\\,du=\\frac{u^2}{2}$.'], [0.3, 2.7]),
        () => mkPrim('', 'e^x/(1+e^x)', 'ln(1+e^x)', ['$u=1+e^x$, $du=e^xdx$ ⇒ $\\int\\frac{du}{u}=\\ln|u|$.'], [0.3, 2.7]),
        () => mkPrim('', 'x/(x^2+' + a + ')', 'ln(x^2+' + a + ')/2', ['$u=x^2+' + a + '$, $du=2x\\,dx$ ⇒ $\\frac12\\int\\frac{du}{u}$.'], [0.3, 2.7]),
        () => mkPrim('', '1/(x*ln(x))', 'ln(ln(x))', ['$u=\\ln x$, $du=\\frac{dx}x$ ⇒ $\\int\\frac{du}{u}=\\ln|\\ln x|$.'], [1.5, 4]),
        () => mkPrim('', 'sin(x)*cos(x)^' + n, '-cos(x)^' + (n + 1) + '/' + (n + 1), ['$u=\\cos x$, $du=-\\sin x\\,dx$ ⇒ $-\\int u^{' + n + '}du$.'], [0.3, 1.4]),
        () => mkPrim('', 'x*sqrt(x^2+' + a + ')', '(x^2+' + a + ')^(3/2)/3', ['$u=x^2+' + a + '$, $du=2x\\,dx$ ⇒ $\\frac12\\int u^{1/2}du=\\frac{u^{3/2}}3$.'], [0.3, 2.7]),
        () => mkPrim('', 'e^(sqrt(x))/sqrt(x)', '2*e^(sqrt(x))', ['$u=\\sqrt x$, $du=\\frac{dx}{2\\sqrt x}$ ⇒ $2\\int e^udu$.'], [0.3, 2.7]),
        () => mkPrim('', 'x^2/(x^3+' + a + ')', 'ln(x^3+' + a + ')/3', ['$u=x^3+' + a + '$, $du=3x^2dx$ ⇒ $\\frac13\\ln|u|$.'], [0.3, 2.7]),
        () => mkPrim('', 'atan(x)/(1+x^2)', 'atan(x)^2/2', ['$u=\\arctan x$, $du=\\frac{dx}{1+x^2}$ ⇒ $\\frac{u^2}2$.'], [0.3, 2.7])
      ];
      return pool[r.int(0, pool.length - 1)]();
    }
  });

  gens.push({
    id: 'parts', title: 'Integració per parts', level: 2,
    make(r) {
      const a = r.int(1, 4), n = r.int(1, 3);
      const pool = [
        () => mkPrim('', 'x*e^(' + a + 'x)', 'x*e^(' + a + 'x)/' + a + '-e^(' + a + 'x)/' + a * a, ['$u=x$, $dv=e^{' + a + 'x}dx$ ⇒ $du=dx$, $v=\\frac{e^{' + a + 'x}}{' + a + '}$.', '$\\int=\\frac{xe^{' + a + 'x}}{' + a + '}-\\frac1{' + a + '}\\int e^{' + a + 'x}dx=\\frac{xe^{' + a + 'x}}{' + a + '}-\\frac{e^{' + a + 'x}}{' + a * a + '}$.']),
        () => mkPrim('', 'x*sin(' + a + 'x)', '-x*cos(' + a + 'x)/' + a + '+sin(' + a + 'x)/' + a * a, ['$u=x$, $dv=\\sin(' + a + 'x)dx$ ⇒ $v=-\\frac{\\cos(' + a + 'x)}{' + a + '}$.', '$\\int=-\\frac{x\\cos(' + a + 'x)}{' + a + '}+\\frac1{' + a + '}\\int\\cos(' + a + 'x)dx=-\\frac{x\\cos(' + a + 'x)}{' + a + '}+\\frac{\\sin(' + a + 'x)}{' + a * a + '}$.']),
        () => mkPrim('', 'x*cos(' + a + 'x)', 'x*sin(' + a + 'x)/' + a + '+cos(' + a + 'x)/' + a * a, ['$u=x$, $dv=\\cos(' + a + 'x)dx$ ⇒ $v=\\frac{\\sin(' + a + 'x)}{' + a + '}$.', '$\\int=\\frac{x\\sin(' + a + 'x)}{' + a + '}-\\frac1{' + a + '}\\int\\sin(' + a + 'x)dx=\\frac{x\\sin(' + a + 'x)}{' + a + '}+\\frac{\\cos(' + a + 'x)}{' + a * a + '}$.']),
        () => mkPrim('', 'x^' + n + '*ln(x)', 'x^' + (n + 1) + '*ln(x)/' + (n + 1) + '-x^' + (n + 1) + '/' + (n + 1) * (n + 1), ['$u=\\ln x$, $dv=x^{' + n + '}dx$ ⇒ $du=\\frac{dx}x$, $v=\\frac{x^{' + (n + 1) + '}}{' + (n + 1) + '}$.', '$\\int=\\frac{x^{' + (n + 1) + '}\\ln x}{' + (n + 1) + '}-\\frac1{' + (n + 1) + '}\\int x^{' + n + '}dx$.']),
        () => mkPrim('', 'ln(x)', 'x*ln(x)-x', ['$u=\\ln x$, $dv=dx$ ⇒ $du=\\frac{dx}x$, $v=x$.', '$\\int=x\\ln x-\\int1\\,dx=x\\ln x-x$.']),
        () => mkPrim('', 'atan(x)', 'x*atan(x)-ln(1+x^2)/2', ['$u=\\arctan x$, $dv=dx$ ⇒ $du=\\frac{dx}{1+x^2}$, $v=x$.', '$\\int=x\\arctan x-\\int\\frac{x}{1+x^2}dx=x\\arctan x-\\frac12\\ln(1+x^2)$.']),
        () => mkPrim('', 'x^2*e^x', 'e^x*(x^2-2x+2)', ['Primera part: $u=x^2$, $dv=e^xdx$ ⇒ $x^2e^x-2\\int xe^xdx$.', 'Segona part: $\\int xe^xdx=xe^x-e^x$. Total: $e^x(x^2-2x+2)$.']),
        () => mkPrim('', 'x*e^(-x)', '-e^(-x)*(x+1)', ['$u=x$, $dv=e^{-x}dx$ ⇒ $v=-e^{-x}$: $-xe^{-x}+\\int e^{-x}dx=-xe^{-x}-e^{-x}$.']),
        () => mkPrim('', 'e^x*sin(x)', 'e^x*(sin(x)-cos(x))/2', ['Dues parts (cíclic): $I=e^x\\sin x-\\int e^x\\cos x\\,dx=e^x\\sin x-e^x\\cos x-I$.', 'Aïllant: $2I=e^x(\\sin x-\\cos x)$ ⇒ $I=\\frac{e^x(\\sin x-\\cos x)}{2}$.'])
      ];
      return pool[r.int(0, pool.length - 1)]();
    }
  });

  gens.push({
    id: 'trigint', title: 'Integrals trigonomètriques', level: 2,
    make(r) {
      const pool = [
        () => mkPrim('', 'sin(x)^3*cos(x)^2', '-cos(x)^3/3+cos(x)^5/5', ['$\\sin^3x=\\sin x(1-\\cos^2x)$. Amb $u=\\cos x$: $-\\int(1-u^2)u^2du=-\\frac{u^3}3+\\frac{u^5}5$.']),
        () => mkPrim('', 'sin(x)^2*cos(x)^3', 'sin(x)^3/3-sin(x)^5/5', ['$\\cos^3x=\\cos x(1-\\sin^2x)$. Amb $u=\\sin x$: $\\int u^2(1-u^2)du=\\frac{u^3}3-\\frac{u^5}5$.']),
        () => mkPrim('', 'sin(x)^2', 'x/2-sin(2x)/4', ['$\\sin^2x=\\frac{1-\\cos2x}{2}$ ⇒ $\\frac x2-\\frac{\\sin2x}4$.']),
        () => mkPrim('', 'cos(x)^2', 'x/2+sin(2x)/4', ['$\\cos^2x=\\frac{1+\\cos2x}{2}$ ⇒ $\\frac x2+\\frac{\\sin2x}4$.']),
        () => mkPrim('', 'sin(x)^3', '-cos(x)+cos(x)^3/3', ['$\\sin^3x=\\sin x(1-\\cos^2x)$; $u=\\cos x$: $-\\int(1-u^2)du=-u+\\frac{u^3}3$.']),
        () => mkPrim('', 'cos(x)^3', 'sin(x)-sin(x)^3/3', ['$\\cos^3x=\\cos x(1-\\sin^2x)$; $u=\\sin x$: $\\int(1-u^2)du=u-\\frac{u^3}3$.']),
        () => mkPrim('', 'sin(x)*cos(x)', 'sin(x)^2/2', ['$u=\\sin x$, $du=\\cos x\\,dx$ ⇒ $\\frac{u^2}2$.']),
        () => mkPrim('', 'tan(x)', '-ln(cos(x))', ['$\\tan x=\\frac{\\sin x}{\\cos x}$; $u=\\cos x$: $-\\ln|\\cos x|$.'], [0.2, 1.3]),
        () => mkPrim('', 'sin(x)^3*cos(x)', 'sin(x)^4/4', ['$u=\\sin x$ ⇒ $\\int u^3du=\\frac{u^4}4$.'])
      ];
      return pool[r.int(0, pool.length - 1)]();
    }
  });

  Calc.add({
    id: 'l7', num: '7', llista: 'Llista 7', title: 'Mètode de Newton i primitives',
    short: 'Newton–Raphson (arrels, extrems) i càlcul de primitives per substitució, parts i trigonomètriques.',
    desc: 'Newton + tot el càlcul de primitives a mà.',
    theory, gens,
    bank: [
      { q: 'La fórmula del mètode de Newton és…', c: ['$x_{n+1}=x_n+f(x_n)/f\'(x_n)$', '$x_{n+1}=x_n-f(x_n)/f\'(x_n)$', '$x_{n+1}=x_n-f\'(x_n)/f(x_n)$', '$x_{n+1}=f(x_n)/f\'(x_n)$'], a: 1, e: 'Intersecció de la tangent amb l\'eix $x$.' },
      { q: 'Per trobar un <b>mínim</b> de $f$ amb Newton s\'aplica el mètode a…', c: ['$f$', '$f\'$', '$f\'\'$', '$F$'], a: 1, e: 'Cal resoldre $f\'=0$: $x_{n+1}=x_n-f\'/f\'\'$.' },
      { q: '$\\int\\dfrac{1}{x}dx=$', c: ['$\\ln x$', '$\\ln|x|+C$', '$-1/x^2$', '$x^{-1}$'], a: 1, e: 'Amb valor absolut i constant.' },
      { q: 'A $\\int x\\ln x\\,dx$ per parts, $u$ és…', c: ['$x$', '$\\ln x$', '$x\\ln x$', 'cap'], a: 1, e: 'LIATE: la logarítmica primer.' },
      { q: '$\\int e^x\\sin x\\,dx$ es resol…', c: ['per substitució', 'per parts dues vegades i aïllant la integral', 'amb fraccions simples', 'no té primitiva'], a: 1, e: 'Cas cíclic.' },
      { q: '$\\int\\cos^2x\\,dx=$', c: ['$\\frac{\\cos^3x}3$', '$\\frac x2+\\frac{\\sin2x}4+C$', '$\\sin^2x$', '$-\\frac{\\sin^3x}{3}$'], a: 1, e: '$\\cos^2x=\\frac{1+\\cos2x}2$.' },
      { q: '$\\int2x\\,e^{x^2}dx=$', c: ['$e^{x^2}+C$', '$2e^{x^2}$', '$x^2e^{x^2}$', '$e^{2x}$'], a: 0, e: '$u=x^2$.' },
      { q: 'La convergència del mètode de Newton és…', c: ['lineal', 'quadràtica (si $f\'\\ne0$ i $x_0$ proper)', 'sempre garantida', 'cúbica'], a: 1, e: 'Els decimals correctes es dupliquen.' }
    ]
  });
})();
