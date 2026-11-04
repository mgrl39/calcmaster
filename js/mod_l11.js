/* Llista 11 — EDOs lineals de primer ordre (factor integrant), mescles i refredament de Newton */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;

  const theory = `
<h3>EDO lineal de 1r ordre</h3>
<div class="box formula">
$y'+P(x)\\,y=Q(x)$ &nbsp;⇒&nbsp; <b>factor integrant</b> $\\mu(x)=e^{\\int P(x)dx}$<br>
$(\\mu y)'=\\mu Q$ &nbsp;⇒&nbsp; $y=\\dfrac{1}{\\mu(x)}\\left(\\displaystyle\\int\\mu(x)Q(x)\\,dx+C\\right)$
</div>
<ol>
<li><b>Posa-la en forma estàndard</b>: coeficient de $y'$ igual a $1$ (divideix si cal!).</li>
<li>Calcula $\\mu=e^{\\int P}$ (no cal constant a $\\int P$).</li>
<li>Multiplica tota l'equació per $\\mu$: el costat esquerre és $(\\mu y)'$.</li>
<li>Integra, aïlla $y$, i aplica la condició inicial.</li>
</ol>
<div class="box ex"><b>Exemple.</b> $y'+2y=e^{-x}$: $\\mu=e^{2x}$ ⇒ $(e^{2x}y)'=e^{x}$ ⇒ $e^{2x}y=e^x+C$ ⇒ $y=e^{-x}+Ce^{-2x}$.</div>
<p><b>Cas $P=a$ constant, $Q=b$ constant:</b> $y'+ay=b$ ⇒ $y=\\dfrac ba+Ce^{-ax}$ (equilibri $b/a$, estable si $a>0$). La part $Ce^{-ax}$ és el <i>transitori</i>.</p>
<div class="box warn">Si l'equació és $x\\,y'+3y=x^2$, <b>divideix per $x$</b> abans: $y'+\\frac3xy=x$ ⇒ $P=3/x$ ⇒ $\\mu=x^3$.</div>

<h3>Problemes de mescles (dipòsit)</h3>
<p>$\\dfrac{dS}{dt}=\\text{(entra)}-\\text{(surt)}$. Si entra salmorra amb concentració $c$ (g/L) a cabal $q$ (L/min) i el volum $V$ es manté constant (surt el mateix cabal):
$$S'=qc-\\frac{q}{V}S\\ \\Rightarrow\\ S(t)=cV+(S_0-cV)e^{-qt/V}.$$
Quan $t\\to\\infty$, $S\\to cV$ (la concentració del dipòsit tendeix a $c$). Si el volum varia ($V(t)=V_0+(q_e-q_s)t$) la concentració que surt és $S/V(t)$.</p>

<h3>Llei de refredament de Newton</h3>
<div class="box formula">
$T'=-k\\,(T-T_a)$ ⇒ $T(t)=T_a+(T_0-T_a)\\,e^{-kt}$
</div>
<p>$T_a$ = temperatura ambient (equilibri). La diferència $T-T_a$ decau exponencialment. Si tens una dada $T(t_1)$, troba $k$ de $e^{-kt_1}=\\dfrac{T(t_1)-T_a}{T_0-T_a}$. Si la diferència es redueix a la meitat cada $t_1$ minuts, després de $n\\,t_1$ minuts queda $(\\frac12)^n$ de la diferència inicial.</p>
`;

  const gens = [];

  gens.push({
    id: 'mu', title: 'Factor integrant', level: 1,
    make(r) {
      const a = r.int(2, 5), n = r.int(1, 4);
      const pool = [
        [a, 'e^(' + a + 'x)', 'P(x)=' + a, '$\\mu=e^{\\int ' + a + '\\,dx}=e^{' + a + 'x}$'],
        [a + '/x', 'x^' + a, 'P(x)=\\dfrac{' + a + '}{x}', '$\\mu=e^{' + a + '\\ln x}=x^{' + a + '}$ (per a $x>0$)'],
        [(a + 'x'), 'e^(' + a + '*x^2/2)', 'P(x)=' + a + 'x', '$\\mu=e^{\\int ' + a + 'x\\,dx}=e^{' + a + 'x^2/2}$'],
        ['1/x', 'x', 'P(x)=\\dfrac1x', '$\\mu=e^{\\ln x}=x$'],
        ['-' + a + '*x', 'e^(-' + a + '*x^2/2)', 'P(x)=-' + a + 'x', '$\\mu=e^{-' + a + 'x^2/2}$'],
        ['-' + a, 'e^(-' + a + 'x)', 'P(x)=-' + a, '$\\mu=e^{-' + a + 'x}$']
      ];
      const [Ps, mu, Ptex, st] = r.pick(pool);
      return P.fn('Per a l\'equació $y\'+' + M.tex(Ps).replace(/^-/, '(-') + (Ps.toString().startsWith('-') ? ')' : '') + '\\,y=x^2$, calcula el factor integrant $\\mu(x)=e^{\\int P(x)dx}$ (sense constant, per a $x>0$).'.replace('(-', '(-'), mu,
        ['Identifica $' + Ptex + '$.', st + '.'], { range: [0.3, 2.2] });
    }
  });

  /* IVP lineals */
  const linT = [
    r => { const a = r.int(1, 4), b = r.nz(-6, 6), y0 = r.int(-3, 5); return { ode: 'y\'+' + a + 'y=' + b, ic: 'y(0)=' + y0, ans: '(' + b + '/' + a + ')+(' + y0 + '-' + b + '/' + a + ')*e^(-' + a + 'x)', rhs: (x, y) => b - a * y, x0: 0, y0, ansTex: T(b / a) + (y0 - b / a < 0 ? '' : '+') + T(y0 - b / a) + 'e^{-' + a + 'x}', st: ['$\\mu=e^{' + a + 'x}$ ⇒ $(e^{' + a + 'x}y)\'=' + b + 'e^{' + a + 'x}$ ⇒ $e^{' + a + 'x}y=\\frac{' + b + '}{' + a + '}e^{' + a + 'x}+C$.', '$y=\\frac{' + b + '}{' + a + '}+Ce^{-' + a + 'x}$; $y(0)=' + y0 + '$ ⇒ $C=' + T(y0 - b / a) + '$.'] }; },
    r => { const a = r.int(1, 3), y0 = r.int(-3, 4); return { ode: 'y\'+' + a + 'y=e^{-' + a + 'x}', ic: 'y(0)=' + y0, ans: '(x+' + y0 + ')*e^(-' + a + 'x)', rhs: (x, y) => Math.exp(-a * x) - a * y, x0: 0, y0, st: ['$\\mu=e^{' + a + 'x}$ ⇒ $(e^{' + a + 'x}y)\'=1$ ⇒ $e^{' + a + 'x}y=x+C$.', '$y=(x+C)e^{-' + a + 'x}$; $y(0)=' + y0 + '$ ⇒ $C=' + y0 + '$.'] }; },
    r => { const a = r.int(1, 3), n = r.int(1, 3), y1 = r.int(-2, 4); const d = n + 1 + a; return { ode: 'y\'+\\dfrac{' + a + '}{x}y=x^{' + n + '}', ic: 'y(1)=' + y1, ans: 'x^' + (n + 1) + '/' + d + '+(' + y1 + '-1/' + d + ')*x^(-' + a + ')', rhs: (x, y) => Math.pow(x, n) - a * y / x, x0: 1, y0: y1, st: ['$\\mu=x^{' + a + '}$ ⇒ $(x^{' + a + '}y)\'=x^{' + (n + a) + '}$ ⇒ $x^{' + a + '}y=\\frac{x^{' + (n + a + 1) + '}}{' + d + '}+C$.', '$y=\\frac{x^{' + (n + 1) + '}}{' + d + '}+Cx^{-' + a + '}$; $y(1)=' + y1 + '$ ⇒ $C=' + y1 + '-\\frac1{' + d + '}$.'] }; },
    r => { const y0 = r.int(-3, 4); return { ode: 'y\'-y=x', ic: 'y(0)=' + y0, ans: '-x-1+(' + (y0 + 1) + ')*e^x', rhs: (x, y) => x + y, x0: 0, y0, st: ['$\\mu=e^{-x}$ ⇒ $(e^{-x}y)\'=xe^{-x}$ ⇒ $e^{-x}y=-xe^{-x}-e^{-x}+C$ (parts).', '$y=-x-1+Ce^x$; $y(0)=' + y0 + '$ ⇒ $C=' + (y0 + 1) + '$.'] }; },
    r => { const y0 = r.int(-2, 4); return { ode: 'y\'+2xy=x', ic: 'y(0)=' + y0, ans: '1/2+(' + y0 + '-1/2)*e^(-x^2)', rhs: (x, y) => x - 2 * x * y, x0: 0, y0, st: ['$\\mu=e^{x^2}$ ⇒ $(e^{x^2}y)\'=xe^{x^2}$ ⇒ $e^{x^2}y=\\frac12e^{x^2}+C$.', '$y=\\frac12+Ce^{-x^2}$; $y(0)=' + y0 + '$ ⇒ $C=' + T(y0 - 0.5) + '$.'] }; },
    r => { const y1 = r.int(-2, 4); return { ode: 'x\\,y\'-y=x^2', ic: 'y(1)=' + y1, ans: 'x^2+(' + (y1 - 1) + ')*x', rhs: (x, y) => (x * x + y) / x, x0: 1, y0: y1, st: ['Forma estàndard (÷$x$): $y\'-\\frac1xy=x$ ⇒ $\\mu=e^{-\\ln x}=\\frac1x$.', '$(y/x)\'=1$ ⇒ $y/x=x+C$ ⇒ $y=x^2+Cx$; $y(1)=' + y1 + '$ ⇒ $C=' + (y1 - 1) + '$.'] }; }
  ];
  gens.push({
    id: 'ivp', title: 'Problema de Cauchy lineal', level: 2,
    make(r) {
      const t = linT[r.int(0, linT.length - 1)](r);
      const p = P.fn('Resol $' + t.ode + ',\\quad ' + t.ic + '$ (per a $x>0$ si cal).', t.ans, t.st, { range: [0.3, 2.2], ansTex: t.ansTex });
      const f = M.compile(t.ans);
      p.check = () => Math.abs(f(t.x0) - t.y0) < 1e-9 && [0.4, 0.8, 1.3].every(d => { const xx = t.x0 + d; const y = f(xx); return Math.abs(M.numDiff(f, xx) - t.rhs(xx, y)) < 1e-4 * Math.max(1, Math.abs(t.rhs(xx, y))); });
      return p;
    }
  });

  gens.push({
    id: 'mix', title: 'Problemes de mescles', level: 2,
    make(r) {
      const V = r.pick([100, 200, 500]), q = r.pick([5, 10, 20]), c = r.pick([0.1, 0.2, 0.5, 1]), S0 = r.pick([0, 10, 20, 50]);
      const eq = c * V;
      const t = r.int(0, 2);
      const intro = 'Un dipòsit conté ' + V + ' L d\'aigua amb ' + S0 + ' kg de sal dissolta. S\'hi aboca salmorra de ' + String(c).replace('.', ',') + ' kg/L a ' + q + ' L/min i la mescla (ben remenada) surt al mateix cabal. Sigui $S(t)$ els kg de sal al temps $t$ (min). ';
      const sol = eq + '+(' + (S0 - eq) + ')*e^(-' + q / V + '*t)';
      const solSteps = ['$S\'=' + T(q * c) + '-\\dfrac{' + q + '}{' + V + '}S=' + T(q * c) + '-' + T(q / V) + 'S$.', 'Lineal: $S\'+' + T(q / V) + 'S=' + T(q * c) + '$ ⇒ $S(t)=cV+(S_0-cV)e^{-qt/V}$ amb $cV=' + T(eq) + '$.', '$S(t)=' + T(eq) + (S0 - eq < 0 ? '' : '+') + T(S0 - eq) + 'e^{-' + T(q / V) + 't}$.'];
      if (t === 0) {
        const p = P.fn(intro + 'Troba $S(t)$.', sol, solSteps, { v: 't', range: [0.2, 3] });
        p.check = () => true;
        return p;
      }
      if (t === 1) return P.num(intro + 'Quanta sal hi haurà quan $t\\to\\infty$ (kg)?', eq, solSteps.concat(['Quan $t\\to\\infty$, $e^{-qt/V}\\to0$ ⇒ $S\\to cV=' + T(eq) + '$ kg.']));
      const tt = V / q, val = eq + (S0 - eq) / Math.E;
      return P.num(intro + 'Quants kg de sal hi ha al cap de $t=' + tt + '$ min? (Dona el valor numèric, 3 decimals.)', val, solSteps.concat(['$t=' + tt + '$ ⇒ $\\dfrac{qt}{V}=1$ ⇒ $S=' + T(eq) + (S0 - eq < 0 ? '' : '+') + T(S0 - eq) + 'e^{-1}\\approx' + M.round(val, 4) + '$.']), { tol: 1e-3 });
    }
  });

  gens.push({
    id: 'cooling', title: 'Refredament de Newton', level: 2,
    make(r) {
      const Ta = r.pick([0, 5, 10, 20]), T0 = Ta + r.pick([40, 60, 80, 70]);
      const qs = r.pick([[1, 2], [1, 3], [2, 3], [1, 4]]);
      const q = qs[0] / qs[1];
      const t1 = r.pick([5, 10, 15, 20]);
      const T1 = Ta + (T0 - Ta) * q;
      const n = r.pick([2, 3]);
      const t = r.int(0, 2);
      const intro = 'Segons la llei de Newton, la velocitat de refredament d\'un cos és proporcional a la diferència entre la seva temperatura i la de l\'ambient (' + Ta + ' °C). Un cos està a ' + T0 + ' °C i al cap de ' + t1 + ' minuts és a ' + T(T1) + ' °C. ';
      const common = ['$T(t)=' + Ta + '+(' + (T0 - Ta) + ')e^{-kt}$.', 'La diferència es multiplica per $q=\\dfrac{' + T(T1) + '-' + Ta + '}{' + T0 + '-' + Ta + '}=' + T(q) + '$ cada ' + t1 + ' minuts.'];
      if (t === 0) {
        const v = Ta + (T0 - Ta) * Math.pow(q, n);
        return P.num(intro + 'Quina temperatura (°C) tindrà al cap de ' + n * t1 + ' minuts?', v, common.concat(['$T(' + n * t1 + ')=' + Ta + '+' + (T0 - Ta) + '\\cdot' + T(q) + '^{' + n + '}=' + T(v) + '$ °C.']));
      }
      if (t === 1) {
        const k = Math.log(1 / q) / t1;
        return P.num(intro + 'Calcula la constant $k$ de $T(t)=' + Ta + '+' + (T0 - Ta) + 'e^{-kt}$ (min$^{-1}$, 4 decimals).', k, common.concat(['$e^{-' + t1 + 'k}=' + T(q) + '$ ⇒ $k=\\dfrac{\\ln(' + T(1 / q) + ')}{' + t1 + '}\\approx' + M.round(k, 5) + '$.']), { tol: 1e-3 });
      }
      const target = Ta + (T0 - Ta) * Math.pow(q, n);
      return P.num(intro + 'Quant temps (minuts) triga a arribar a ' + T(target) + ' °C?', n * t1, common.concat(['Cal $q^{m}=' + T(Math.pow(q, n)) + '$ amb $m=' + n + '$ intervals de ' + t1 + ' min ⇒ $t=' + n * t1 + '$ min.']));
    }
  });

  Calc.add({
    id: 'l11', num: '11', llista: 'Llista 11', title: 'EDOs lineals de 1r ordre, mescles i refredament',
    short: 'Factor integrant, problemes de Cauchy lineals, dipòsits amb sal i llei de Newton.',
    desc: 'EDOs lineals i les seves aplicacions.',
    theory, gens,
    bank: [
      { q: 'Per a $y\'+P(x)y=Q(x)$, el factor integrant és…', c: ['$e^{\\int Q}$', '$e^{\\int P}$', '$\\int P$', '$P(x)$'], a: 1, e: '$\\mu=e^{\\int P(x)dx}$.' },
      { q: 'Per a $y\'+3y=6$, l\'equilibri és…', c: ['$y=3$', '$y=2$', '$y=6$', '$y=18$'], a: 1, e: '$y_*=b/a=6/3$.' },
      { q: 'Abans de buscar $\\mu$ a $x\\,y\'+3y=x^2$ cal…', c: ['res', 'dividir per $x$', 'multiplicar per $x$', 'derivar'], a: 1, e: 'Forma estàndard: coeficient de $y\'$ igual a 1.' },
      { q: 'Segons Newton, $T\'=-k(T-T_a)$; si $T_0>T_a$ i $k>0$, quan $t\\to\\infty$ el cos tendeix a…', c: ['$T_0$', '$T_a$', '0', '$\\infty$'], a: 1, e: 'S\'iguala a l\'ambient.' },
      { q: 'En un dipòsit de volum constant $V$ amb cabal $q$, la constant de temps és…', c: ['$q/V$', '$V/q$', '$qV$', '$q+V$'], a: 1, e: '$S\\sim e^{-qt/V}$: temps característic $V/q$.' },
      { q: 'La solució de $y\'=ky+b$ té la forma…', c: ['$Ce^{kt}$', '$Ce^{kt}-b/k$', '$b+Ce^t$', '$kt+b$'], a: 1, e: 'Equilibri $-b/k$.' }
    ]
  });
})();
