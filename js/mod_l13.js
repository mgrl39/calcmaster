/* Llista 13 — Final: preguntes tipus test (estil examen final de gener) */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;

  const theory = `
<h3>Com és l'examen final (segons els models anteriors)</h3>
<p>L'examen té una part <b>test</b> (opció múltiple) i una part de <b>problemes</b>. Els tipus de pregunta que han sortit (de l'exemple de gener) són:</p>
<ol>
<li><b>EDO logística</b> $y'=50y\\left(1-\\frac{y}{10000}\\right)$, $y(0)=10$: resolució per separació + fraccions simples, i preguntes del tipus <i>"és cert que $y(t)\\le10000$?"</i> (la solució tendeix a $K$ però no el supera).</li>
<li><b>Regla de Leibniz</b>: $F(x)=\\int_0^{x^3}e^{t^{5/2}}dt$ ⇒ $F'(x)=3x^2e^{x^{15/2}}$.</li>
<li><b>Àrea entre corbes</b> amb valor absolut ($y=-|x|$ i $y=1-2x^2$): com s'expressa amb una integral (simetria!) i amb quins límits.</li>
<li><b>Primitiva d'una funció racional</b> amb denominador cúbic (Ruffini + fraccions simples, amb arrels no enteres).</li>
<li><b>EDO de 2n ordre amb paràmetres</b>: discutir quantes solucions té un problema de valors inicials segons el signe del discriminant; solució general d'$a(x)y+b(x)y'=0$ (separables) i PVI lineal.</li>
</ol>
<div class="box ex"><b>Estratègia per al test:</b> no et deixis cap pregunta; descarta opcions <i>comprovant</i> (deriva la candidata, substitueix valors, mira límits). Per a "és cert que…" pensa en un <b>contraexemple</b>.</div>
<p>Per practicar, usa el <b>Mode Examen</b> (barreja de totes les llistes amb temporitzador) i el mòdul de <b>Repàs d'errors</b>.</p>
`;

  const gens = [];

  gens.push({
    id: 'area_expr', title: 'Àrea amb valor absolut: quina integral?', level: 3,
    make(r) {
      const b = r.pick([1, 2, 3]), x1 = r.pick([1, 2]);
      const a = b * x1 * x1 - x1;
      if (a <= 0) return null;
      const ok = '$2\\displaystyle\\int_0^{' + x1 + '}\\left(' + a + '-' + (b === 1 ? '' : b) + 'x^2+x\\right)dx$';
      const wr = [
        '$\\displaystyle\\int_{-' + x1 + '}^{' + x1 + '}\\left(' + a + '-' + (b === 1 ? '' : b) + 'x^2-x\\right)dx$',
        '$2\\displaystyle\\int_0^{' + x1 + '}\\left(' + a + '-' + (b === 1 ? '' : b) + 'x^2-x\\right)dx$',
        '$\\displaystyle\\int_0^{' + x1 + '}\\left(' + a + '-' + (b === 1 ? '' : b) + 'x^2+x\\right)dx$'
      ];
      const p = P.mc(r, 'L\'àrea de la regió limitada per les corbes $y=-|x|$ i $y=' + a + '-' + (b === 1 ? '' : b) + 'x^2$ es pot calcular com…', ok, wr,
        ['Talls: per a $x\\ge0$, $-x=' + a + '-' + b + 'x^2$ ⇒ $' + b + 'x^2-x-' + a + '=0$ ⇒ $x=' + x1 + '$. Per simetria els talls són $x=\\pm' + x1 + '$.', 'La paràbola és a dalt: $\\text{dalt}-\\text{baix}=(' + a + '-' + b + 'x^2)-(-|x|)=' + a + '-' + b + 'x^2+|x|$.', 'La regió és simètrica respecte de l\'eix $y$ ⇒ $2\\int_0^{' + x1 + '}(' + a + '-' + b + 'x^2+x)dx$.']);
      return p;
    }
  });

  gens.push({
    id: 'leibniz_mc', title: 'Leibniz: tria la derivada', level: 2,
    make(r) {
      const ft = r.pick([['e^{t^{2}}', 'e^'], ['\\sin(t^2)', 'sin'], ['\\sqrt{1+t^{4}}', 'sqrt']]);
      const [m] = [r.int(2, 4)];
      const f = r.pick(['e^(t^2)', 'sin(t^3)', 'ln(1+t^2)', 'cos(t^2)']);
      const gx = r.pick(['x^2', 'x^3', '2x', 'sqrt(x)']);
      const fg = M.compose(f, 't', gx), dg = M.diff(gx);
      const ok = '$' + M.toTex(M.simplify(fg)) + '\\cdot' + M.toTex(dg) + '$';
      const wrong1 = '$' + M.toTex(M.simplify(fg)) + '$';
      const wrong2 = '$' + M.toTex(M.simplify(M.compose(f, 't', 'x'))) + '\\cdot' + M.toTex(dg) + '$';
      const Fi = M.parse(f, ['t']);
      const wrong3 = '$' + M.toTex(M.simplify(M.diff(M.subst(Fi, 't', M.parse(gx))))) + '$';
      const ft_tex = M.toTex(M.simplify(Fi));
      return P.mc(r, 'Si $F(x)=\\displaystyle\\int_0^{' + M.tex(gx) + '}' + ft_tex + '\\,dt$, llavors $F\'(x)=$', ok, [wrong1, wrong2, wrong3].filter(w => w !== ok),
        ['Regla de Leibniz: $F\'(x)=f(g(x))\\cdot g\'(x)$.', 'Aquí $f(t)=' + ft_tex + '$, $g(x)=' + M.tex(gx) + '$ ⇒ ' + ok + '.']);
    }
  });

  gens.push({
    id: 'logistic_mc', title: 'Logística: afirmacions vertaderes/falses', level: 2,
    make(r) {
      const rr = r.pick([2, 5, 50]), K = r.pick([100, 1000, 10000]), y0 = r.pick([1, 10]);
      const stmts = [
        ['$y(t)\\le' + K + '$ per a tot $t\\ge0$', true, 'La solució creix cap a $K$ sense superar-lo (el valor $y=' + K + '$ és un equilibri i les solucions no es poden creuar).'],
        ['$\\displaystyle\\lim_{t\\to+\\infty}y(t)=' + K + '$', true, 'La capacitat de càrrega és $K=' + K + '$.'],
        ['$\\displaystyle\\lim_{t\\to+\\infty}y(t)=+\\infty$', false, 'La població està fitada per $K=' + K + '$.'],
        ['$y(t)$ és decreixent', false, 'Com que $0<y_0<K$, $y\'=ry(1-y/K)>0$: creix.'],
        ['$y(t)=' + y0 + '$ per a tot $t$', false, '$y_0$ no és un equilibri (els equilibris són $0$ i $' + K + '$).'],
        ['$y(t)>0$ per a tot $t\\ge0$', true, '$y=0$ és un equilibri i les solucions no es poden creuar: com que $y_0>0$, $y>0$.']
      ];
      const [s, truth, why] = r.pick(stmts);
      return P.mcFixed('Considera $y\'=' + rr + 'y\\left(1-\\dfrac{y}{' + K + '}\\right)$, $y(0)=' + y0 + '$. L\'afirmació «' + s + '» és…', ['Vertadera', 'Falsa'], truth ? 0 : 1, [why]);
    }
  });

  gens.push({
    id: 'ivp_exist', title: 'EDO 2n ordre amb paràmetre: tipus d\'arrels', level: 3,
    make(r) {
      const b = r.int(2, 8), c = r.int(1, 12);
      const disc = b * b - 4 * c;
      const kind = disc > 0 ? 'Dues arrels reals diferents' : (disc === 0 ? 'Una arrel real doble' : 'Dues arrels complexes conjugades');
      const sol = disc > 0 ? '$y=C_1e^{r_1x}+C_2e^{r_2x}$' : (disc === 0 ? '$y=(C_1+C_2x)e^{rx}$' : '$y=e^{\\alpha x}(C_1\\cos\\beta x+C_2\\sin\\beta x)$');
      const all = ['Dues arrels reals diferents', 'Una arrel real doble', 'Dues arrels complexes conjugades'];
      return P.mc(r, 'Per a l\'equació $y\'\'+' + b + 'y\'+' + c + 'y=0$, l\'equació característica $r^2+' + b + 'r+' + c + '=0$ té…', kind, all.filter(a => a !== kind),
        ['$\\Delta=b^2-4c=' + b * b + '-' + 4 * c + '=' + disc + '$.', disc > 0 ? '$\\Delta>0$ ⇒ dues arrels reals diferents.' : (disc === 0 ? '$\\Delta=0$ ⇒ arrel doble.' : '$\\Delta<0$ ⇒ complexes: ' + sol + '.')]);
    }
  });

  Calc.add({
    id: 'l13', num: '13', llista: 'Final', title: 'Final: estil examen (test)',
    short: 'Preguntes tipus test com les de l\'examen final: logística, Leibniz, àrees, EDOs amb paràmetres.',
    desc: 'Preguntes en l\'estil exacte de l\'examen final. Prepara\'t amb el Mode Examen.',
    theory, gens,
    bank: [
      { q: 'La solució de $y\'=50y(1-y/10000)$, $y(0)=10$ satisfà…', c: ['$y(t)>10000$ per a $t$ gran', '$y(t)\\le10000$ per a tot $t\\ge0$', '$y(t)\\to0$', '$y(t)$ oscil·la'], a: 1, e: 'Creix cap a $K=10000$ sense superar-lo.' },
      { q: '$\\dfrac{d}{dx}\\displaystyle\\int_0^{x^3}e^{t^{5/2}}dt=$', c: ['$e^{x^{15/2}}$', '$3x^2e^{x^{15/2}}$', '$3x^2e^{x^{5/2}}$', '$e^{x^3}$'], a: 1, e: '$f(x^3)\\cdot3x^2$ amb $(x^3)^{5/2}=x^{15/2}$.' },
      { q: 'Per a una EDO d\'ordre 2 $a\\,y\'\'+b\\,y\'+c\\,y=0$ amb $\\Delta=b^2-4ac<0$ i condicions $y(0)=y_0$, $y\'(0)=v_0$, el problema té…', c: ['cap solució', 'una única solució', 'infinites solucions', 'dues solucions'], a: 1, e: 'Existència i unicitat per a equacions lineals de coeficients constants.' },
      { q: 'La integral $\\int\\dfrac{1}{(x-1)(x^2-9x+7)}dx$ es descompon en fraccions simples amb…', c: ['dues fraccions', 'tres fraccions amb denominadors lineals (les arrels de $x^2-9x+7$ són reals: $\\Delta=53>0$)', 'una sola', 'una arctan'], a: 1, e: '$\\Delta=81-28=53>0$: arrels irracionals però reals.' },
      { q: 'A $y\'=y\\cdot g(x)$, la solució general és…', c: ['$y=Ce^{\\int g}$', '$y=\\int g+C$', '$y=Cg(x)$', '$y=e^{g}$'], a: 0, e: 'Separables: $\\ln|y|=\\int g+C$.' },
      { q: 'L\'àrea entre $y=-|x|$ i $y=1-2x^2$ és…', c: ['$2\\int_0^1(1-2x^2+x)dx$', '$\\int_{-1}^{1}(1-2x^2-x)dx$', '$\\int_0^1(1-2x^2+x)dx$', '$\\int_{-1}^{1}(1-2x^2)dx$'], a: 0, e: 'Talls $x=\\pm1$; simetria parell: doble de $(0,1)$ amb $|x|=x$.' },
      { q: 'Si $F(x)=\\int_a^xf(t)dt$ amb $f$ contínua, $F$ és…', c: ['contínua però no derivable', 'derivable amb $F\'=f$', 'constant', 'discontínua'], a: 1, e: 'TFC.' },
      { q: 'El polinomi interpolador de 5 punts diferents té grau…', c: ['exactament 5', 'com a molt 4', 'com a molt 5', 'com a molt 3'], a: 1, e: '$n+1=5$ nodes ⇒ grau $\\le4$.' },
      { q: 'Si $f(a)f(b)<0$ i $f$ és contínua, llavors…', c: ['$f$ és monòtona', 'hi ha almenys una arrel en $(a,b)$', 'hi ha exactament una arrel', '$f\'$ té una arrel'], a: 1, e: 'Bolzano (només "almenys una").' },
      { q: '$\\lim_{x\\to0}\\dfrac{e^x-1-x}{x^2}=$', c: ['0', '1/2', '1', '$\\infty$'], a: 1, e: 'Taylor o dues aplicacions de L\'Hôpital.' }
    ]
  });
})();
