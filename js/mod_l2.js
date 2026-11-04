/* Llista 2 — Derivades, regla de la cadena, derivació implícita, raons de canvi, Rolle i valor mitjà */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;

  const theory = `
<h3>Regles de derivació</h3>
<div class="box formula">
<b>Suma:</b> $(f\\pm g)'=f'\\pm g'$ &nbsp;&nbsp; <b>Constant:</b> $(kf)'=kf'$<br>
<b>Producte:</b> $(fg)'=f'g+fg'$<br>
<b>Quocient:</b> $\\left(\\dfrac fg\\right)'=\\dfrac{f'g-fg'}{g^2}$<br>
<b>Cadena:</b> $[f(g(x))]'=f'(g(x))\\cdot g'(x)$ &nbsp; (deriva "de fora cap a dins")
</div>
<table class="tbl">
<tr><td>$(x^n)'=nx^{n-1}$</td><td>$(\\sqrt x)'=\\frac1{2\\sqrt x}$</td><td>$(1/x)'=-1/x^2$</td></tr>
<tr><td>$(e^{u})'=e^{u}u'$</td><td>$(a^x)'=a^x\\ln a$</td><td>$(\\ln u)'=u'/u$</td></tr>
<tr><td>$(\\sin u)'=u'\\cos u$</td><td>$(\\cos u)'=-u'\\sin u$</td><td>$(\\tan u)'=u'/\\cos^2u$</td></tr>
<tr><td>$(\\arctan u)'=\\frac{u'}{1+u^2}$</td><td>$(\\arcsin u)'=\\frac{u'}{\\sqrt{1-u^2}}$</td><td>$(\\arccos u)'=-\\frac{u'}{\\sqrt{1-u^2}}$</td></tr>
</table>
<div class="box ex"><b>Exemple (cadena).</b> $f(x)=\\sin(x^2+1)$: exterior $\\sin$, interior $x^2+1$ ⇒ $f'(x)=\\cos(x^2+1)\\cdot2x$.</div>
<div class="box warn">Error típic: $(f g)'\\ne f'g'$ i $(f/g)'\\ne f'/g'$. I oblidar el factor $g'(x)$ de la cadena.</div>

<h3>Derivació logarítmica</h3>
<p>Per a $f(x)=u(x)^{v(x)}$ (variable a la base <i>i</i> a l'exponent): $\\ln f=v\\ln u$ ⇒ $\\dfrac{f'}{f}=v'\\ln u+\\dfrac{vu'}{u}$ ⇒ $f'=f\\left(v'\\ln u+\\dfrac{vu'}u\\right)$. Ex: $(x^x)'=x^x(\\ln x+1)$.</p>

<h3>Derivació implícita</h3>
<p>Si la corba ve donada per $F(x,y)=c$: deriva <b>tota</b> l'equació respecte de $x$ pensant que $y=y(x)$ (cada $y$ porta un $y'$), i aïlla $y'$.</p>
<div class="box ex"><b>Exemple.</b> $x^2+y^2=25$ ⇒ $2x+2yy'=0$ ⇒ $y'=-x/y$. En $(3,4)$: $y'=-3/4$.</div>
<p>Fórmula ràpida: $y'=-\\dfrac{F_x}{F_y}$.</p>

<h3>Raons de canvi relacionades</h3>
<ol>
<li>Dibuixa i posa noms a les magnituds que varien amb el temps.</li>
<li>Escriu una equació que les relacioni (àrea, Pitàgores, volum…).</li>
<li><b>Deriva respecte de $t$</b> (regla de la cadena!).</li>
<li><b>Substitueix</b> les dades de l'instant concret <i>després</i> de derivar.</li>
</ol>

<h3>Teorema de Rolle i del valor mitjà</h3>
<div class="box formula">
<b>Rolle:</b> $f$ contínua en $[a,b]$, derivable en $(a,b)$ i $f(a)=f(b)$ ⇒ existeix $c\\in(a,b)$ amb $f'(c)=0$.<br>
<b>Valor mitjà (Lagrange):</b> existeix $c\\in(a,b)$ amb $f'(c)=\\dfrac{f(b)-f(a)}{b-a}$.
</div>
<p><b>Aplicació clàssica: comptar arrels.</b> Si $f'$ no s'anul·la mai (p.ex. $f'>0$), $f$ té <i>com a molt</i> una arrel (si en tingués dues, Rolle donaria un $c$ amb $f'(c)=0$). Combina-ho amb Bolzano (que dona <i>almenys</i> una) per a "exactament una". Si $f'$ s'anul·la en $k$ punts, $f$ té com a molt $k+1$ arrels.</p>
`;

  const gens = [];

  /* helper: problema de derivada */
  function derivProblem(src, intro, ruleSteps) {
    const ast = M.parse(src);
    const d = M.diff(ast);
    const steps = (ruleSteps || []).concat(['$f\'(x)=' + M.toTex(d) + '$']);
    const p = P.fn(intro + ' $f(x)=' + M.toTex(M.simplify(ast)) + '$', M.toStr(d), steps, { range: [0.3, 2.7] });
    p.check = () => { const f = M.compile(src), g = M.compile(M.toStr(d)); const pts = [0.6, 1.3, 1.9, 2.4].filter(x => isFinite(g(x)) && isFinite(f(x))); return pts.length >= 2 && pts.every(x => Math.abs(M.numDiff(f, x) - g(x)) < 1e-4 * Math.max(1, Math.abs(g(x)))); };
    return p;
  }

  gens.push({
    id: 'd_poly', title: 'Derivades de polinomis i potències', level: 1,
    make(r) {
      const t = r.int(0, 3);
      const a = r.nz(-6, 6), b = r.nz(-6, 6), n = r.int(2, 6), m = r.int(1, 4);
      let f;
      if (t === 0) f = a + 'x^' + n + '+(' + b + ')x^' + m + '+' + r.int(1, 9);
      else if (t === 1) f = 'x^(' + r.pick([1, 3, 5]) + '/' + r.pick([2, 3, 4]) + ')+' + a + '/x';
      else if (t === 2) f = 'sqrt(x)+(' + a + ')/x^' + r.int(2, 3) + '+x';
      else f = '(' + r.int(1, 4) + 'x+(' + b + '))^' + r.int(3, 5);
      return derivProblem(f, 'Calcula la derivada de', ['Aplica la regla de la potència $(x^n)\'=nx^{n-1}$ terme a terme' + (t === 3 ? ' i la regla de la cadena.' : '.')]);
    }
  });

  gens.push({
    id: 'd_product', title: 'Regla del producte', level: 1,
    make(r) {
      const u = r.pick(['x^2', 'x^3', '2x+1', 'sqrt(x)', 'x', 'x^2+1']);
      const v = r.pick(['e^x', 'sin(x)', 'cos(x)', 'ln(x)', 'e^(2x)', 'atan(x)']);
      const du = M.diff(u), dv = M.diff(v);
      return derivProblem('(' + u + ')*(' + v + ')', 'Deriva', ['$u=' + M.tex(u) + '$, $v=' + M.tex(v) + '$ ⇒ $u\'=' + M.toTex(du) + '$, $v\'=' + M.toTex(dv) + '$.', 'Regla del producte: $(uv)\'=u\'v+uv\'$.']);
    }
  });

  gens.push({
    id: 'd_quotient', title: 'Regla del quocient', level: 1,
    make(r) {
      const u = r.pick(['x', 'x^2+1', 'e^x', 'sin(x)', 'ln(x)', '3x-2']);
      const v = r.pick(['x^2+1', 'x+2', 'e^x+1', 'x^2+x+1', 'x+1']);
      if (u === v) return null;
      const du = M.diff(u), dv = M.diff(v);
      return derivProblem('(' + u + ')/(' + v + ')', 'Deriva', ['$u=' + M.tex(u) + '$, $v=' + M.tex(v) + '$ ⇒ $u\'=' + M.toTex(du) + '$, $v\'=' + M.toTex(dv) + '$.', 'Regla del quocient: $\\left(\\frac uv\\right)\'=\\frac{u\'v-uv\'}{v^2}$.']);
    }
  });

  gens.push({
    id: 'd_chain', title: 'Regla de la cadena', level: 2,
    make(r) {
      const a = r.int(2, 5), b = r.int(1, 4), n = r.int(3, 6);
      const inner = r.pick(['x^2+' + b, a + 'x+' + b, 'x^3-' + b + 'x', '1+x^2', a + 'x^2-' + b]);
      const outer = r.pick([
        u => 'sin(' + u + ')', u => 'cos(' + u + ')', u => 'e^(' + u + ')', u => 'ln(' + u + ')', u => 'sqrt(' + u + ')', u => '(' + u + ')^' + n, u => 'atan(' + u + ')', u => 'tan(' + u + ')'
      ]);
      const f = outer(inner);
      return derivProblem(f, 'Deriva', ['Funció exterior de la funció interior $u=' + M.tex(inner) + '$, $u\'=' + M.toTex(M.diff(inner)) + '$.', 'Regla de la cadena: $[F(u)]\'=F\'(u)\\cdot u\'$.']);
    }
  });

  gens.push({
    id: 'd_mixed', title: 'Derivades combinades (examen)', level: 3,
    make(r) {
      const a = r.int(2, 4);
      const pool = [
        'x^2*e^(-x)', 'e^x*sin(' + a + 'x)', 'ln(x^2+1)/x', 'sqrt(x)*ln(x)', 'x*sqrt(x^2+' + a + ')', 'e^(x^2)*cos(x)',
        '(x^2+1)^3*sin(x)', 'atan(x)*x^2', 'ln(sin(x)+2)', 'x/(e^x+1)', 'sin(x)^2*cos(x)', 'e^(sin(x))', '(x+1)/sqrt(x^2+1)', 'x^2*ln(x)-x^2/2'
      ];
      return derivProblem(r.pick(pool), 'Deriva', ['Identifica l\'estructura (producte, quocient o cadena) i aplica les regles de fora cap a dins.']);
    }
  });

  gens.push({
    id: 'd_logdiff', title: 'Derivació logarítmica (x^x...)', level: 3,
    make(r) {
      const a = r.int(2, 3);
      const pool = [['x', 'x'], ['x', 'sin(x)'], ['x^2+1', 'x'], ['x', '1/x'], ['x', a + 'x'], ['cos(x)+2', 'x'], ['x', 'sqrt(x)']];
      const [u, v] = r.pick(pool);
      const f = '(' + u + ')^(' + v + ')';
      const inner = M.diff('(' + v + ')*ln(' + u + ')');
      const p = derivProblem(f, 'Deriva', ['Pren logaritmes: $\\ln f=v\\ln u$ amb $u=' + M.tex(u) + '$, $v=' + M.tex(v) + '$.', 'Deriva: $\\dfrac{f\'}{f}=' + M.toTex(inner) + '$ ⇒ $f\'=f\\cdot\\left(' + M.toTex(inner) + '\\right)$.']);
      p.range = [0.3, 2.7];
      return p;
    }
  });

  gens.push({
    id: 'd_second', title: 'Segona derivada en un punt', level: 2,
    make(r) {
      const pool = [['x^4-3x^3+x', [-1, 0, 1, 2]], ['x*e^x', [0]], ['sin(2x)', [0]], ['x^2*ln(x)', [1]], ['1/x^2', [1, 2]], ['sqrt(x)', [1, 4]], ['x^3*e^(-x)', [0, 1]], ['e^(2x)*x', [0]]];
      const [f, pts] = r.pick(pool);
      const a = r.pick(pts);
      const d2 = M.nthDiff(f, 2);
      const v = M.compile(d2)(a);
      if (!M.toFrac(v)) return null;
      const p = P.num('Calcula $f\'\'(' + a + ')$ per a $f(x)=' + M.tex(f) + '$.', v,
        ['$f\'(x)=' + M.toTex(M.diff(f)) + '$.', '$f\'\'(x)=' + M.toTex(d2) + '$.', '$f\'\'(' + a + ')=' + T(v) + '$.']);
      p.check = () => { const g = M.compile(f); const h = 1e-3; return Math.abs((g(a + h) - 2 * g(a) + g(a - h)) / (h * h) - v) < 1e-3 * Math.max(1, Math.abs(v)) + 1e-3; };
      return p;
    }
  });

  /* Derivació implícita */
  gens.push({
    id: 'd_implicit', title: 'Derivació implícita', level: 2,
    make(r) {
      const t = r.int(0, 4);
      let F, eq, pt, c, Fx, Fy, formula;
      if (t === 0) { pt = r.pick([[3, 4], [4, 3], [5, 12], [-3, 4], [6, 8]]); c = pt[0] * pt[0] + pt[1] * pt[1]; F = (x, y) => x * x + y * y; eq = 'x^2+y^2=' + c; formula = "2x+2yy'=0 \\Rightarrow y'=-\\dfrac{x}{y}"; }
      else if (t === 1) { pt = r.pick([[1, 1], [1, 2], [2, 1], [2, 3], [3, 1]]); c = pt[0] * pt[0] + pt[0] * pt[1] + pt[1] * pt[1]; F = (x, y) => x * x + x * y + y * y; eq = 'x^2+xy+y^2=' + c; formula = "2x+y+xy'+2yy'=0 \\Rightarrow y'=-\\dfrac{2x+y}{x+2y}"; }
      else if (t === 2) { pt = r.pick([[2, 1], [1, 2], [3, 1], [1, 3], [2, 3]]); c = pt[0] * pt[1] * pt[1] + pt[0] * pt[0] * pt[1]; F = (x, y) => x * y * y + x * x * y; eq = 'xy^2+x^2y=' + c; formula = "y^2+2xyy'+2xy+x^2y'=0 \\Rightarrow y'=-\\dfrac{y^2+2xy}{2xy+x^2}"; }
      else if (t === 3) { pt = r.pick([[1, 1], [2, 1], [1, 2], [3, 2]]); c = pt[0] * pt[0] * pt[1] + Math.pow(pt[1], 3); F = (x, y) => x * x * y + y * y * y; eq = 'x^2y+y^3=' + c; formula = "2xy+x^2y'+3y^2y'=0 \\Rightarrow y'=-\\dfrac{2xy}{x^2+3y^2}"; }
      else { pt = r.pick([[5, 3], [5, 4], [13, 5], [10, 6]]); c = pt[0] * pt[0] - pt[1] * pt[1]; F = (x, y) => x * x - y * y; eq = 'x^2-y^2=' + c; formula = "2x-2yy'=0 \\Rightarrow y'=\\dfrac{x}{y}"; }
      const h = 1e-5, [x0, y0] = pt;
      const Fx_ = (F(x0 + h, y0) - F(x0 - h, y0)) / (2 * h), Fy_ = (F(x0, y0 + h) - F(x0, y0 - h)) / (2 * h);
      const slope = -Fx_ / Fy_;
      const sl = M.toFrac(slope) ? M.toFrac(slope)[0] / M.toFrac(slope)[1] : slope;
      const p = P.num('Calcula la pendent $\\dfrac{dy}{dx}$ de la corba $' + eq + '$ en el punt $(' + x0 + ',' + y0 + ')$.', sl,
        ['Deriva tot respecte de $x$ (recorda que $y=y(x)$): $' + formula + '$.', 'Substitueix $(x,y)=(' + x0 + ',' + y0 + ')$: $y\'=' + T(sl) + '$.'], { tol: 1e-5 });
      p.check = () => Math.abs(F(x0, y0) - c) < 1e-9;
      return p;
    }
  });

  /* Raons de canvi */
  gens.push({
    id: 'd_related', title: 'Raons de canvi relacionades', level: 2,
    make(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        const v = r.int(1, 4), L = r.int(2, 9);
        return P.num('El costat d\'un quadrat creix a ' + v + ' cm/s. Calcula la velocitat de creixement de l\'àrea (en cm²/s) quan el costat val ' + L + ' cm.', 2 * L * v,
          ['$A=s^2$ ⇒ $\\dfrac{dA}{dt}=2s\\dfrac{ds}{dt}$.', 'Amb $s=' + L + '$ i $ds/dt=' + v + '$: $dA/dt=2\\cdot' + L + '\\cdot' + v + '=' + 2 * L * v + '$ cm²/s.']);
      }
      if (t === 1) {
        const v = r.int(1, 4), R = r.int(2, 8);
        return P.num('El radi d\'un cercle creix a ' + v + ' cm/s. Calcula la rapidesa de variació de l\'àrea (cm²/s) quan $r=' + R + '$ cm. (Pots escriure <code>pi</code>.)', 2 * Math.PI * R * v,
          ['$A=\\pi r^2$ ⇒ $\\dfrac{dA}{dt}=2\\pi r\\dfrac{dr}{dt}$.', '$=2\\pi\\cdot' + R + '\\cdot' + v + '=' + 2 * R * v + '\\pi$ cm²/s $\\approx' + M.round(2 * Math.PI * R * v, 3) + '$.'], { ansTex: (2 * R * v) + '\\pi' });
      }
      if (t === 2) {
        const v = r.int(1, 3), R = r.int(2, 6);
        return P.num('S\'infla un globus esfèric i el radi creix a ' + v + ' cm/s. Quant creix el volum (cm³/s) quan $r=' + R + '$ cm? (Pots escriure <code>pi</code>.)', 4 * Math.PI * R * R * v,
          ['$V=\\frac43\\pi r^3$ ⇒ $\\dfrac{dV}{dt}=4\\pi r^2\\dfrac{dr}{dt}$.', '$=4\\pi\\cdot' + R * R + '\\cdot' + v + '=' + 4 * R * R * v + '\\pi$ cm³/s.'], { ansTex: (4 * R * R * v) + '\\pi' });
      }
      const [a, b, L] = r.pick([[6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]);
      const v = r.int(1, 3);
      return P.num('Una escala de ' + L + ' m llisca per una paret: el peu s\'allunya de la paret a ' + v + ' m/s. Amb quina velocitat (m/s) baixa l\'extrem superior quan el peu és a ' + a + ' m de la paret? (Dona el valor amb signe: $dy/dt$.)', -a * v / b,
        ['$x^2+y^2=' + L * L + '$ ⇒ $2xx\'+2yy\'=0$ ⇒ $y\'=-\\dfrac{x}{y}x\'$.', 'Si $x=' + a + '$, $y=\\sqrt{' + L * L + '-' + a * a + '}=' + b + '$. Llavors $y\'=-\\dfrac{' + a + '}{' + b + '}\\cdot' + v + '=' + T(-a * v / b) + '$ m/s.']);
    }
  });

  /* Teorema del valor mitjà: troba c */
  gens.push({
    id: 'tvm', title: 'Teorema del valor mitjà: troba c', level: 2,
    make(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        const a = r.int(-3, 1), b = a + r.int(2, 5), k = r.nz(-3, 3), m = r.int(-3, 3);
        return P.num('Troba el $c\\in(' + a + ',' + b + ')$ que dona el teorema del valor mitjà per a $f(x)=x^2' + (m ? H.sg(m) + 'x' : '') + '$.', (a + b) / 2,
          ['$f\'(x)=2x' + (m ? H.sg(m) : '') + '$ i $\\dfrac{f(b)-f(a)}{b-a}=' + T(((b * b + m * b) - (a * a + m * a)) / (b - a)) + '$.', 'Igualem: $2c' + (m ? H.sg(m) : '') + '=' + T(((b * b + m * b) - (a * a + m * a)) / (b - a)) + '$ ⇒ $c=' + T((a + b) / 2) + '$.']);
      }
      if (t === 1) {
        const b = r.int(2, 5);
        return P.num('Troba el $c\\in(0,' + b + ')$ del teorema del valor mitjà per a $f(x)=x^3$.', b / Math.sqrt(3),
          ['$f\'(c)=3c^2$ i la pendent mitjana és $\\dfrac{' + b + '^3-0}{' + b + '}=' + b * b + '$.', '$3c^2=' + b * b + '$ ⇒ $c=\\dfrac{' + b + '}{\\sqrt3}\\approx' + M.round(b / Math.sqrt(3), 4) + '$.'], { tol: 1e-5 });
      }
      if (t === 2) {
        const a = r.int(1, 3), k = r.int(2, 4), b = a * k * k;
        return P.num('Troba el $c\\in(' + a + ',' + b + ')$ del teorema del valor mitjà per a $f(x)=\\dfrac1x$ (positiu).', Math.sqrt(a * b),
          ['$f\'(c)=-\\dfrac1{c^2}$ i $\\dfrac{f(b)-f(a)}{b-a}=\\dfrac{1/' + b + '-1/' + a + '}{' + (b - a) + '}=-\\dfrac1{' + a * b + '}$.', '$c^2=' + a * b + '$ ⇒ $c=' + Math.sqrt(a * b) + '$.']);
      }
      const b = r.int(1, 2);
      const c = Math.log((Math.exp(b) - 1) / b);
      return P.num('Troba el $c\\in(0,' + b + ')$ del teorema del valor mitjà per a $f(x)=e^x$. (Dona el valor numèric, 4 decimals.)', c,
        ['$f\'(c)=e^c$ i la pendent mitjana és $\\dfrac{e^{' + b + '}-1}{' + b + '}$.', '$c=\\ln\\dfrac{e^{' + b + '}-1}{' + b + '}\\approx' + M.round(c, 4) + '$.'], { tol: 1e-3 });
    }
  });

  gens.push({
    id: 'roots_count', title: 'Quantes arrels reals? (Rolle + Bolzano)', level: 3,
    make(r) {
      const t = r.int(0, 2);
      if (t === 0) {
        const a = r.int(1, 6), b = r.int(-9, 9);
        return P.num('Quantes arrels reals té $f(x)=x^3' + H.sg(a).replace(/ /g, '') + 'x' + (b ? H.sg(b) : '') + '$? (Un nombre.)'.replace('+ ', '+'), 1,
          ['$f\'(x)=3x^2+' + a + '>0$ per a tot $x$ ⇒ $f$ és estrictament creixent ⇒ com a molt una arrel (Rolle).', '$\\lim_{x\\to\\pm\\infty}f=\\pm\\infty$ ⇒ per Bolzano en té almenys una. Per tant <b>exactament 1</b>.']);
      }
      if (t === 1) {
        const a = r.int(1, 5), b = r.int(-6, 6);
        return P.num('Quantes arrels reals té $f(x)=x^5+' + a + 'x' + (b ? H.sg(b) : '') + '$?', 1,
          ['$f\'(x)=5x^4+' + a + '>0$ ⇒ estrictament creixent ⇒ com a molt una arrel.', 'Grau senar ⇒ té almenys una arrel (Bolzano). Total: <b>1</b>.']);
      }
      let b = r.int(-5, 5); if (Math.abs(b) === 2) b = 3;
      const cnt = Math.abs(b) > 2 ? 1 : 3;
      return P.num('Quantes arrels reals té $f(x)=x^3-3x' + (b ? H.sg(b) : '') + '$?', cnt,
        ['$f\'(x)=3x^2-3=0$ ⇒ $x=\\pm1$. $f(-1)=' + (b + 2) + '$ (màxim local) i $f(1)=' + (b - 2) + '$ (mínim local).', cnt === 3 ? 'Màxim $>0$ i mínim $<0$: la corba talla l\'eix tres cops ⇒ <b>3</b> arrels.' : 'Màxim i mínim del mateix signe: només talla l\'eix un cop ⇒ <b>1</b> arrel.']);
    }
  });

  Calc.add({
    id: 'l2', num: '2', llista: 'Llista 2', title: 'Derivades: regles, implícita, raons de canvi, Rolle i valor mitjà',
    short: 'Totes les regles de derivació, derivació implícita i logarítmica, raons relacionades, Rolle i TVM.',
    desc: 'La derivada és l\'eina central de tot el curs: aquí s\'ha de ser automàtic.',
    theory, gens,
    bank: [
      { q: '$\\dfrac{d}{dx}\\left[x^2\\sin x\\right]=$', c: ['$2x\\cos x$', '$2x\\sin x+x^2\\cos x$', '$2x\\sin x-x^2\\cos x$', '$x^2\\cos x$'], a: 1, e: 'Producte: $u\'v+uv\'$.' },
      { q: '$\\dfrac{d}{dx}\\ln(x^2+1)=$', c: ['$\\frac1{x^2+1}$', '$\\frac{2x}{x^2+1}$', '$\\ln(2x)$', '$\\frac{2x}{x^2}$'], a: 1, e: '$u\'/u$.' },
      { q: '$\\dfrac{d}{dx}e^{3x}=$', c: ['$e^{3x}$', '$3e^{3x}$', '$3xe^{3x-1}$', '$e^{3}$'], a: 1, e: 'Cadena: $e^{u}u\'$.' },
      { q: 'El teorema de Rolle exigeix…', c: ['$f(a)=f(b)$, contínua en $[a,b]$ i derivable en $(a,b)$', '$f$ creixent', '$f(a)f(b)<0$', '$f\'$ contínua'], a: 0, e: 'Tres hipòtesis.' },
      { q: 'Si $f\'(x)>0$ per a tot $x$, llavors $f$ té com a molt…', c: ['0 arrels', '1 arrel', '2 arrels', 'infinites arrels'], a: 1, e: 'Estrictament creixent ⇒ injectiva.' },
      { q: '$\\dfrac{d}{dx}x^x=$', c: ['$x\\cdot x^{x-1}$', '$x^x\\ln x$', '$x^x(\\ln x+1)$', '$x^x$'], a: 2, e: 'Derivació logarítmica.' },
      { q: 'En derivació implícita de $x^2+y^2=1$ s\'obté…', c: ['$y\'=x/y$', '$y\'=-x/y$', '$y\'=-y/x$', '$y\'=2x$'], a: 1, e: '$2x+2yy\'=0$.' },
      { q: '$\\dfrac{d}{dx}\\left(\\dfrac{x}{x+1}\\right)=$', c: ['$\\frac{1}{(x+1)^2}$', '$\\frac{1}{x+1}$', '$\\frac{2x+1}{(x+1)^2}$', '$\\frac{-1}{(x+1)^2}$'], a: 0, e: '$\\frac{(x+1)-x}{(x+1)^2}$.' }
    ]
  });
})();
