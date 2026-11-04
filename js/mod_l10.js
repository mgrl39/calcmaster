/* Llista 10 — Equacions diferencials: conceptes, variables separables, modelització (creixement, logística) */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;

  const theory = `
<h3>Conceptes bàsics</h3>
<ul>
<li>Una <b>EDO</b> relaciona una funció $y(x)$ amb les seves derivades. L'<b>ordre</b> és el de la derivada més alta. És <b>lineal</b> si $y,y',y''\\dots$ apareixen només a la 1a potència i no multiplicades entre elles (ex: $y'+xy=e^x$ és lineal; $y'=y^2$ i $yy''=1$ no).</li>
<li><b>Solució general</b>: família amb constants arbitràries (una per ordre). <b>Solució particular</b>: s'obté imposant condicions inicials ($y(x_0)=y_0$). Un <b>problema de Cauchy</b> = EDO + condició inicial.</li>
<li><b>Comprovar que $y$ és solució</b>: deriva-la i substitueix a l'equació (cal que es compleixi per a tot $x$). Per a solucions implícites $F(x,y)=C$: deriva implícitament.</li>
</ul>

<h3>Variables separables: $y'=f(x)\\,g(y)$</h3>
<div class="box formula">
$\\dfrac{dy}{g(y)}=f(x)\\,dx\\ \\Rightarrow\\ \\displaystyle\\int\\frac{dy}{g(y)}=\\int f(x)\\,dx+C$
</div>
<ol>
<li>Separa: tot el que porta $y$ cap a un costat amb $dy$, tot el que porta $x$ cap a l'altre amb $dx$.</li>
<li>Integra els dos costats (només <b>una</b> constant $C$).</li>
<li>Aïlla $y$ si pots. <b>Usa la condició inicial</b> per trobar $C$.</li>
<li>Vigila les <b>solucions constants perdudes</b> ($g(y)=0$ és solució: $y\\equiv y_*$).</li>
</ol>
<div class="box ex"><b>Exemple.</b> $y'=xy$, $y(0)=3$: $\\int\\frac{dy}y=\\int x\\,dx$ ⇒ $\\ln|y|=\\frac{x^2}2+C$ ⇒ $y=Ke^{x^2/2}$; $y(0)=3$ ⇒ $K=3$: $y=3e^{x^2/2}$.</div>

<h3>Models de població</h3>
<table class="tbl">
<tr><td><b>Exponencial (Malthus)</b></td><td>$y'=ky$ ⇒ $y=y_0e^{kt}$. $k>0$ creixement, $k<0$ decaïment. Temps de duplicació $\\frac{\\ln2}{k}$; vida mitjana $\\frac{\\ln2}{|k|}$.</td></tr>
<tr><td><b>Logístic</b></td><td>$y'=ry\\left(1-\\dfrac yK\\right)$ ⇒ $y(t)=\\dfrac{K}{1+\\left(\\frac K{y_0}-1\\right)e^{-rt}}$. Capacitat de càrrega $K$; $\\lim_{t\\to\\infty}y=K$; creix més ràpid quan $y=K/2$.</td></tr>
</table>
<p><b>Resolució del logístic</b> (és el de l'examen final): $\\int\\frac{dy}{y(1-y/K)}=\\int r\\,dt$; fraccions simples: $\\frac{1}{y(1-y/K)}=\\frac1y+\\frac{1/K}{1-y/K}$ ⇒ $\\ln\\left|\\dfrac{y}{1-y/K}\\right|=rt+C$ ⇒ $\\dfrac{y}{1-y/K}=Ae^{rt}$ ⇒ aïlla $y$.</p>
<p><b>Equilibris</b> de $y'=F(y)$: els $y_*$ amb $F(y_*)=0$. Són <b>estables</b> si $F$ passa de $+$ a $-$ (la solució s'hi atreu) i inestables si de $-$ a $+$.</p>
`;

  const gens = [];

  /* Classificació */
  gens.push({
    id: 'classify', title: 'Ordre i linealitat', level: 1,
    make(r) {
      const pool = [
        ['y\'\'+3y\'+2y=x', 'ordre 2, lineal'], ['y\'=y^2', 'ordre 1, no lineal'], ['y\'+xy=e^x', 'ordre 1, lineal'], ['y\\,y\'\'=1', 'ordre 2, no lineal'],
        ['y\'=\\sin(y)', 'ordre 1, no lineal'], ['y\'\'\'+y=0', 'ordre 3, lineal'], ['x\\,y\'=2y', 'ordre 1, lineal'], ['(y\')^2+y=x', 'ordre 1, no lineal'],
        ['y\'\'-4y=\\cos x', 'ordre 2, lineal'], ['y\'=xy(1-y)', 'ordre 1, no lineal'], ['y\'\'+y\\,y\'=0', 'ordre 2, no lineal']
      ];
      const [eq, ok] = r.pick(pool);
      const all = ['ordre 1, lineal', 'ordre 1, no lineal', 'ordre 2, lineal', 'ordre 2, no lineal', 'ordre 3, lineal'];
      const wr = r.shuffle(all.filter(a => a !== ok)).slice(0, 3);
      return P.mc(r, 'Classifica l\'equació diferencial $' + eq + '$.', ok, wr, ['L\'ordre és el de la derivada més alta. És lineal si $y$ i les seves derivades només apareixen a la 1a potència i sense productes entre elles.']);
    }
  });

  gens.push({
    id: 'verify', title: 'Comprovar si és solució', level: 1,
    make(r) {
      const k = r.int(2, 4), t = r.int(0, 3);
      let q, yes, st;
      if (t === 0) {
        const m = r.pick([k, k, k + 1, -k]); yes = m === k;
        q = 'L\'equació $y\'=' + k + 'y$ i la funció $y=Ce^{' + m + 'x}$.';
        st = ['$y\'=' + m + 'Ce^{' + m + 'x}$ i $' + k + 'y=' + k + 'Ce^{' + m + 'x}$.', yes ? 'Coincideixen: és solució.' : 'Només coincideixen si $' + m + '=' + k + '$: no és solució.'];
      } else if (t === 1) {
        const m = r.pick([k, k, k + 1, 1]); yes = m === k;
        q = 'L\'equació $x\\,y\'=' + k + 'y$ i la funció $y=Cx^{' + m + '}$.';
        st = ['$xy\'=x\\cdot' + m + 'Cx^{' + (m - 1) + '}=' + m + 'Cx^{' + m + '}$ i $' + k + 'y=' + k + 'Cx^{' + m + '}$.', yes ? 'Són iguals: és solució.' : 'Cal $' + m + '=' + k + '$: no és solució.'];
      } else if (t === 2) {
        const m = r.pick([k, -k, k, k + 1]); yes = Math.abs(m) === k;
        q = 'L\'equació $y\'\'=' + k * k + 'y$ i la funció $y=e^{' + m + 'x}$.';
        st = ['$y\'\'=' + m * m + 'e^{' + m + 'x}$ i $' + k * k + 'y=' + k * k + 'e^{' + m + 'x}$.', yes ? '$' + m * m + '=' + k * k + '$: és solució.' : '$' + m * m + '\\ne' + k * k + '$: no és solució.'];
      } else {
        const sgn = r.pick([1, -1]); yes = sgn === 1;
        q = 'L\'equació $y\'=y+x$ i la funció $y=Ce^{x}' + (yes ? '-x-1' : '-x') + '$.';
        st = ['$y\'=Ce^x-1$ i $y+x=Ce^x' + (yes ? '-x-1+x=Ce^x-1' : '-x+x=Ce^x') + '$.', yes ? 'Coincideixen: és solució.' : '$Ce^x-1\\ne Ce^x$: no és solució.'];
      }
      return P.mcFixed('És solució? ' + q, ['Sí, és solució', 'No, no ho és'], yes ? 0 : 1, st);
    }
  });

  /* Separables amb condició inicial */
  const sepTemplates = [
    r => { const a = r.nz(-3, 3), y0 = r.nz(-4, 4); return { ode: 'y\'=' + (a === 1 ? '' : a === -1 ? '-' : a) + 'y', ic: 'y(0)=' + y0, ans: y0 + '*e^(' + a + 'x)', rhs: (x, y) => a * y, x0: 0, y0, st: ['Separa: $\\frac{dy}{y}=' + a + 'dx$ ⇒ $\\ln|y|=' + a + 'x+C$ ⇒ $y=Ke^{' + a + 'x}$.', '$y(0)=' + y0 + '$ ⇒ $K=' + y0 + '$.'] }; },
    r => { const a = r.nz(-2, 3), y0 = r.nz(-3, 3); return { ode: 'y\'=' + (a === 1 ? '' : a === -1 ? '-' : a) + 'x\\,y', ic: 'y(0)=' + y0, ans: y0 + '*e^(' + a + '*x^2/2)', rhs: (x, y) => a * x * y, x0: 0, y0, st: ['$\\frac{dy}y=' + a + 'x\\,dx$ ⇒ $\\ln|y|=\\frac{' + a + 'x^2}2+C$ ⇒ $y=Ke^{' + a + 'x^2/2}$.', '$y(0)=' + y0 + '$ ⇒ $K=' + y0 + '$.'] }; },
    r => { const y0 = r.int(1, 4); return { ode: 'y\'=\\dfrac{x}{y}', ic: 'y(0)=' + y0, ans: 'sqrt(x^2+' + y0 * y0 + ')', rhs: (x, y) => x / y, x0: 0, y0, st: ['$y\\,dy=x\\,dx$ ⇒ $\\frac{y^2}2=\\frac{x^2}2+C$ ⇒ $y^2=x^2+C\'$.', '$y(0)=' + y0 + '$ ⇒ $C\'=' + y0 * y0 + '$ i com $y>0$: $y=\\sqrt{x^2+' + y0 * y0 + '}$.'] }; },
    r => { const a = r.int(1, 3), y0 = r.int(1, 4); return { ode: 'y\'=-' + (a === 1 ? '' : a) + 'y^2', ic: 'y(0)=' + y0, ans: y0 + '/(1+' + a * y0 + '*x)', rhs: (x, y) => -a * y * y, x0: 0, y0, st: ['$\\frac{dy}{y^2}=-' + a + 'dx$ ⇒ $-\\frac1y=-' + a + 'x+C$ ⇒ $y=\\frac{1}{' + a + 'x-C}$.', '$y(0)=' + y0 + '$ ⇒ $-C=\\frac1{' + y0 + '}$ ⇒ $y=\\dfrac{' + y0 + '}{1+' + a * y0 + 'x}$.'] }; },
    r => { const y0 = r.int(1, 4); return { ode: 'y\'=y\\cos x', ic: 'y(0)=' + y0, ans: y0 + '*e^(sin(x))', rhs: (x, y) => y * Math.cos(x), x0: 0, y0, st: ['$\\frac{dy}y=\\cos x\\,dx$ ⇒ $\\ln|y|=\\sin x+C$ ⇒ $y=Ke^{\\sin x}$.', '$y(0)=' + y0 + '$ ⇒ $K=' + y0 + '$.'] }; },
    r => { const y0 = r.int(0, 3); return { ode: 'y\'=e^{x-y}', ic: 'y(0)=' + y0, ans: 'ln(e^x+' + (Math.exp(y0) - 1) + ')', rhs: (x, y) => Math.exp(x - y), x0: 0, y0, ansTex: '\\ln\\left(e^x+e^{' + y0 + '}-1\\right)', st: ['$y\'=e^xe^{-y}$ ⇒ $e^ydy=e^xdx$ ⇒ $e^y=e^x+C$.', '$y(0)=' + y0 + '$ ⇒ $e^{' + y0 + '}=1+C$ ⇒ $C=e^{' + y0 + '}-1$ ⇒ $y=\\ln(e^x+e^{' + y0 + '}-1)$.'] }; },
    r => { const y0 = r.nz(-3, 3), a = r.int(1, 3); return { ode: 'y\'=(y-1)\\,' + (a === 1 ? '' : a) + 'x', ic: 'y(0)=' + y0, ans: '1+(' + (y0 - 1) + ')*e^(' + a + '*x^2/2)', rhs: (x, y) => (y - 1) * a * x, x0: 0, y0, st: ['$\\frac{dy}{y-1}=' + a + 'x\\,dx$ ⇒ $y-1=Ke^{' + a + 'x^2/2}$.', '$y(0)=' + y0 + '$ ⇒ $K=' + (y0 - 1) + '$.'] }; },
    r => { const n = r.int(2, 4), y1 = r.nz(-3, 3); return { ode: 'x\\,y\'=' + n + 'y', ic: 'y(1)=' + y1, ans: y1 + '*x^' + n, rhs: (x, y) => n * y / x, x0: 1, y0: y1, st: ['$\\frac{dy}y=\\frac{' + n + '}{x}dx$ ⇒ $\\ln|y|=' + n + '\\ln x+C$ ⇒ $y=Kx^{' + n + '}$.', '$y(1)=' + y1 + '$ ⇒ $K=' + y1 + '$.'] }; }
  ];
  gens.push({
    id: 'separable', title: 'Variables separables amb condició inicial', level: 2,
    make(r) {
      const t = sepTemplates[r.int(0, sepTemplates.length - 1)](r);
      const range = t.x0 === 1 ? [0.4, 2.7] : [0.1, 1.2];
      const p = P.fn('Resol el problema de Cauchy $' + t.ode + ',\\quad ' + t.ic + '$. Escriu $y(x)$.', t.ans, t.st, { range, ansTex: t.ansTex });
      const f = M.compile(t.ans);
      p.check = () => Math.abs(f(t.x0) - t.y0) < 1e-9 && [0.3, 0.6, 0.9].every(x => { const xx = t.x0 + x; const y = f(xx); return Math.abs(M.numDiff(f, xx) - t.rhs(xx, y)) < 1e-4 * Math.max(1, Math.abs(t.rhs(xx, y))); });
      return p;
    }
  });

  /* Logístic */
  gens.push({
    id: 'logistic', title: 'Equació logística', level: 3,
    make(r) {
      const rr = r.int(1, 3), K = r.pick([10, 20, 50, 100]), y0 = r.pick([1, 2, 5]);
      if (K / y0 === 1 || y0 >= K) return null;
      const t = r.int(0, 2);
      const ode = 'y\'=' + (rr === 1 ? '' : rr) + 'y\\left(1-\\dfrac{y}{' + K + '}\\right),\\quad y(0)=' + y0;
      const sol = K + '/(1+(' + (K / y0 - 1) + ')*e^(-' + rr + '*t))';
      const stepsAll = ['Separa: $\\dfrac{dy}{y(1-y/' + K + ')}=' + rr + '\\,dt$. Fraccions simples: $\\frac1y+\\frac{1/' + K + '}{1-y/' + K + '}$.', 'Integrant: $\\ln\\left|\\dfrac{y}{1-y/' + K + '}\\right|=' + rr + 't+C$ ⇒ $\\dfrac{y}{1-y/' + K + '}=Ae^{' + rr + 't}$.', 'Amb $y(0)=' + y0 + '$: $A=\\dfrac{' + y0 + '}{1-' + y0 + '/' + K + '}=\\dfrac{' + K * y0 + '}{' + (K - y0) + '}$.', 'Aïllant: $y(t)=\\dfrac{' + K + '}{1+' + T(K / y0 - 1) + 'e^{-' + rr + 't}}$.'];
      if (t === 0) {
        const p = P.fn('Resol el problema de Cauchy $' + ode + '$. Escriu $y(t)$.', sol, stepsAll, { v: 't', range: [0.1, 2.2], ansTex: '\\dfrac{' + K + '}{1+' + T(K / y0 - 1) + 'e^{-' + rr + 't}}' });
        const f = M.compile(sol, ['t']);
        p.check = () => Math.abs(f(0) - y0) < 1e-9 && [0.4, 1, 1.7].every(x => Math.abs(M.numDiff(f, x) - rr * f(x) * (1 - f(x) / K)) < 1e-4);
        return p;
      }
      if (t === 1) {
        return P.num('La població d\'una espècie compleix $' + ode + '$. Calcula $\\displaystyle\\lim_{t\\to+\\infty}y(t)$ (la capacitat de càrrega).', K,
          ['$y(t)=\\dfrac{' + K + '}{1+' + T(K / y0 - 1) + 'e^{-' + rr + 't}}$ i $e^{-' + rr + 't}\\to0$ ⇒ el límit és $' + K + '$.', 'També es veu directament: els equilibris són $y=0$ i $y=' + K + '$, i la solució (que comença a $y_0\\in(0,' + K + ')$ i creix) s\'atreu cap a $' + K + '$.']);
      }
      const th = Math.log(K / y0 - 1) / rr;
      return P.num('Amb $' + ode + '$, en quin instant $t$ la població val $y=' + K / 2 + '$ (la meitat de $K$)? Dona el valor numèric (3 decimals).', th,
        stepsAll.concat(['$y=' + K / 2 + '$ ⇒ $1+' + T(K / y0 - 1) + 'e^{-' + rr + 't}=2$ ⇒ $e^{-' + rr + 't}=\\dfrac1{' + T(K / y0 - 1) + '}$ ⇒ $t=\\dfrac{\\ln(' + T(K / y0 - 1) + ')}{' + rr + '}\\approx' + M.round(th, 4) + '$.']), { tol: 1e-3 });
    }
  });

  gens.push({
    id: 'equilibria', title: 'Equilibris i estabilitat', level: 2,
    make(r) {
      const [b, a] = H.sortNum(H.distinct(r, 2, -3, 4));
      return P.multi('Per a l\'equació $y\'=(' + T(a) + '-y)(' + H.xm(b, 'y') + ')$, troba els dos equilibris: l\'<b>estable</b> i l\'<b>inestable</b>.',
        [{ label: 'estable $y=$', ans: a }, { label: 'inestable $y=$', ans: b }],
        ['Equilibris: $F(y)=(' + T(a) + '-y)(' + H.xm(b, 'y') + ')=0$ ⇒ $y=' + a + '$ i $y=' + b + '$.', 'Per a $' + b + '<y<' + a + '$: $F>0$ ⇒ $y$ creix cap a $' + a + '$. Per a $y>' + a + '$: $F<0$ ⇒ baixa cap a $' + a + '$. Per a $y<' + b + '$: $F<0$ ⇒ s\'allunya de $' + b + '$.', 'Estable: $' + a + '$. Inestable: $' + b + '$.']);
    }
  });

  gens.push({
    id: 'growth', title: 'Creixement exponencial i desintegració', level: 1,
    make(r) {
      const t = r.int(0, 2);
      if (t === 0) {
        const N0 = r.pick([100, 200, 500, 1000]), ratio = r.pick([2, 3]), Th = r.pick([2, 3, 5]), n = r.pick([2, 3]);
        return P.num('Una població de bacteris creix a una velocitat proporcional al nombre d\'individus. Inicialment n\'hi ha ' + N0 + ' i al cap de ' + Th + ' hores n\'hi ha ' + N0 * ratio + '. Quants n\'hi haurà al cap de ' + n * Th + ' hores?', N0 * Math.pow(ratio, n),
          ['$y\'=ky$ ⇒ $y=y_0e^{kt}$. De $y(' + Th + ')=' + ratio + 'y_0$: $e^{' + Th + 'k}=' + ratio + '$.', '$y(' + n * Th + ')=y_0\\left(e^{' + Th + 'k}\\right)^{' + n + '}=' + N0 + '\\cdot' + ratio + '^{' + n + '}=' + N0 * Math.pow(ratio, n) + '$.']);
      }
      if (t === 1) {
        const h = r.pick([5, 8, 10, 24]), m0 = r.pick([100, 200, 80]), n = r.int(2, 4);
        return P.num('Una substància radioactiva té una vida mitjana de ' + h + ' anys (en triga ' + h + ' a reduir-se a la meitat). Si inicialment hi ha ' + m0 + ' g, quants grams en queden al cap de ' + n * h + ' anys?', m0 / Math.pow(2, n),
          ['$y=y_0e^{-kt}$ amb $e^{-' + h + 'k}=\\frac12$.', 'Al cap de ' + n * h + ' anys han passat ' + n + ' vides mitjanes: $y=' + m0 + '\\cdot\\left(\\frac12\\right)^{' + n + '}=' + T(m0 / Math.pow(2, n)) + '$ g.']);
      }
      const k = r.int(2, 6);
      return P.num('Una població creix segons $y\'=\\dfrac{' + k + '}{10}y$ ($t$ en anys). Quant triga a duplicar-se (anys, 3 decimals)?', Math.log(2) / (k / 10),
        ['$y=y_0e^{' + T(k / 10) + 't}$. Dupl.: $e^{' + T(k / 10) + 't}=2$ ⇒ $t=\\dfrac{\\ln2}{' + T(k / 10) + '}\\approx' + M.round(Math.log(2) / (k / 10), 4) + '$ anys.'], { tol: 1e-3 });
    }
  });

  gens.push({
    id: 'epidemic', title: 'Propagació d\'un virus (logística amb dades)', level: 3,
    make(r) {
      const K = r.pick([500, 1000, 2000]), N0 = r.pick([1, 2, 5, 10]), N1 = r.pick([20, 40, 50, 80, 100]), T0 = r.pick([2, 3, 4]);
      if (N1 <= N0 || N1 >= K / 2) return null;
      const q = (K / N1 - 1) / (K / N0 - 1);
      const N2 = K / (1 + (K / N0 - 1) * q * q);
      return P.num('Un estudiant portador d\'un virus torna a un campus aïllat de ' + K + ' estudiants. La velocitat de propagació és proporcional al nombre d\'infectats $N$ i de no infectats $(' + K + '-N)$. Si hi ha $N(0)=' + N0 + '$ infectat i $N(' + T0 + ')=' + N1 + '$ després de ' + T0 + ' dies, quants n\'hi haurà al cap de ' + 2 * T0 + ' dies? (Arrodoneix a la unitat.)', N2,
        ['$N\'=cN(' + K + '-N)$ és logística: $N(t)=\\dfrac{' + K + '}{1+(' + K / N0 + '-1)e^{-' + K + 'ct}}$ ($K=' + K + '$).', 'De $N(' + T0 + ')=' + N1 + '$: $e^{-' + K + 'c\\cdot' + T0 + '}=\\dfrac{' + K + '/' + N1 + '-1}{' + K + '/' + N0 + '-1}=' + M.round(q, 6) + '$.', 'Per a $t=' + 2 * T0 + '$ el factor és el quadrat: $N=\\dfrac{' + K + '}{1+' + (K / N0 - 1) + '\\cdot' + M.round(q * q, 8) + '}\\approx' + M.round(N2, 2) + '$.'], { tol: 3e-3 });
    }
  });

  Calc.add({
    id: 'l10', num: '10', llista: 'Llista 10', title: 'EDOs: conceptes, variables separables i models',
    short: 'Ordre, linealitat, comprovar solucions, variables separables, creixement i equació logística.',
    desc: 'Inici del bloc d\'equacions diferencials.',
    theory, gens,
    bank: [
      { q: 'La solució general d\'una EDO d\'ordre 2 conté…', c: ['cap constant', 'una constant', 'dues constants arbitràries', 'tres constants'], a: 2, e: 'Una constant per ordre.' },
      { q: 'Una EDO $y\'=f(x)g(y)$ es resol…', c: ['per variables separades', 'amb el polinomi característic', 'amb factor integrant sempre', 'derivant'], a: 0, e: '$\\int\\frac{dy}{g(y)}=\\int f(x)dx$.' },
      { q: 'Si $y\'=ky$ amb $k>0$, la solució…', c: ['decreix exponencialment', 'creix exponencialment', 'és constant', 'oscil·la'], a: 1, e: '$y=y_0e^{kt}$.' },
      { q: 'En el model logístic $y\'=ry(1-y/K)$, $\\lim_{t\\to\\infty}y(t)$ (si $y_0>0$) és…', c: ['0', '$r$', '$K$', '$\\infty$'], a: 2, e: 'Capacitat de càrrega.' },
      { q: 'La condició inicial serveix per determinar…', c: ['l\'ordre', 'la constant arbitrària', 'la linealitat', 'el domini'], a: 1, e: 'Selecciona una solució particular.' },
      { q: 'Quan separes variables, el que has de vigilar és…', c: ['perdre solucions constants ($g(y)=0$)', 'res', 'que $y>0$', 'que $x=0$'], a: 0, e: 'Dividir per $g(y)$ pot perdre $y\\equiv y_*$.' },
      { q: 'En el logístic, la població creix més ràpidament quan $y$ val…', c: ['$K$', '$K/2$', '$0$', '$y_0$'], a: 1, e: '$y\'=ry(1-y/K)$ és màxim en $y=K/2$.' }
    ]
  });
})();
