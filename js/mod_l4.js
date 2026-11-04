/* Llista 4 + Seminari 1 — Asímptotes, estudi de funcions, indeterminacions i regla de L'Hôpital */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;

  const theory = `
<h3>Asímptotes</h3>
<div class="box formula">
<b>Vertical</b> $x=a$: $\\lim_{x\\to a^\\pm}f(x)=\\pm\\infty$ (apareix en punts on la funció no està definida: zeros del denominador, $\\ln$ en $0$…).<br>
<b>Horitzontal</b> $y=L$: $\\lim_{x\\to\\pm\\infty}f(x)=L$ (finit). Es mira a $+\\infty$ i a $-\\infty$ per separat.<br>
<b>Obliqua</b> $y=mx+n$ (si no hi ha horitzontal): $m=\\lim\\dfrac{f(x)}{x}$ (finit i $\\ne0$), $n=\\lim\\,[f(x)-mx]$.
</div>
<p>Per a quocients de polinomis: grau num = grau den + 1 ⇒ obliqua; fes la <b>divisió</b> $\\frac{P}{Q}=c(x)+\\frac{R}{Q}$: l'asímptota és $y=c(x)$.</p>

<h3>Estudi complet d'una funció (esquema)</h3>
<ol>
<li>Domini i talls amb els eixos ($f(0)$, $f(x)=0$). Simetries (parella/senar).</li>
<li>Asímptotes (verticals, horitzontals, obliqües).</li>
<li>$f'$: punts crítics, creixement i extrems relatius.</li>
<li>$f''$: concavitat i punts d'inflexió.</li>
<li>Taula resum + dibuix (marca primer asímptotes i punts notables, després uneix-los).</li>
</ol>

<h3>Indeterminacions</h3>
<p>Formes: $\\dfrac00,\\ \\dfrac\\infty\\infty,\\ 0\\cdot\\infty,\\ \\infty-\\infty,\\ 1^\\infty,\\ 0^0,\\ \\infty^0$. <b>No</b> són indeterminacions: $\\frac k0$, $\\infty+\\infty$, $\\infty\\cdot\\infty$, $0^\\infty$, $k^\\infty$ ($k>1$).</p>

<h3>Regla de L'Hôpital</h3>
<div class="box formula">Si $\\lim\\dfrac{f}{g}$ és de la forma $\\dfrac00$ o $\\dfrac{\\infty}{\\infty}$ i existeix $\\lim\\dfrac{f'}{g'}$, llavors $\\displaystyle\\lim\\frac{f}{g}=\\lim\\frac{f'}{g'}$. (Es pot repetir.)</div>
<div class="box warn">Es deriva numerador i denominador <b>per separat</b> (NO és la regla del quocient). I només s'aplica si realment és $0/0$ o $\\infty/\\infty$.</div>

<h3>Com tractar cada forma</h3>
<table class="tbl">
<tr><td>$0\\cdot\\infty$</td><td>Passa un factor al denominador com a invers: $f\\,g=\\dfrac{f}{1/g}$ ⇒ $\\frac00$ o $\\frac\\infty\\infty$. <i>(Deixa al numerador el més "fàcil de derivar" i a baix el que simplifica: $x\\ln x=\\frac{\\ln x}{1/x}$.)</i></td></tr>
<tr><td>$\\infty-\\infty$</td><td>Fes denominador comú o multiplica pel conjugat ⇒ $\\frac00$.</td></tr>
<tr><td>$1^\\infty,\\ 0^0,\\ \\infty^0$</td><td>Escriu $f^g=e^{g\\ln f}$, calcula $\\lim g\\ln f$ (serà $0\\cdot\\infty$) i el resultat és $e^{L}$.</td></tr>
</table>
<div class="box ex"><b>Exemple.</b> $\\lim_{x\\to0^+}x^x$: $\\ln L=x\\ln x=\\frac{\\ln x}{1/x}\\overset{L'H}{=}\\frac{1/x}{-1/x^2}=-x\\to0$ ⇒ el límit és $e^0=1$.</div>
<p><b>Jerarquia de creixement</b> quan $x\\to+\\infty$: $\\ln x\\ll x^n\\ll e^{x}$. Per això $\\frac{\\ln x}{x}\\to0$, $\\frac{x^n}{e^x}\\to0$, $\\frac{e^x}{x^n}\\to\\infty$.</p>
`;

  const gens = [];

  /* Asímptotes d'un quocient de polinomis amb obliqua */
  gens.push({
    id: 'asymp_oblique', title: 'Asímptotes vertical i obliqua', level: 2,
    make(r) {
      const a = r.int(-4, 4), k = r.pick([1, 1, 2, -1]), b = r.int(-5, 5);
      let c;
      do { c = r.int(-6, 6); } while (k * a * a + b * a + c === 0);
      const num = [c, b, k];
      const q = k * a + b, rem = k * a * a + b * a + c; // k x^2+bx+c = (x-a)(k x + (b+ka)) + rem
      const n = b + k * a;
      const prob = P.multi('Troba les asímptotes de $f(x)=\\dfrac{' + M.polyTex(num) + '}{' + H.xm(a) + '}$: la vertical $x=a$ i l\'obliqua $y=mx+n$.',
        [{ label: 'vertical $x=$', ans: a }, { label: 'obliqua $y=$', ans: k + '*x+(' + n + ')', kind: 'fn', ansTex: M.polyTex([n, k]) }],
        ['Vertical: el denominador s\'anul·la en $x=' + a + '$ i el numerador no ($' + rem + '\\ne0$) ⇒ $x=' + a + '$.', 'Divisió: $' + M.polyTex(num) + '=(' + H.xm(a) + ')(' + M.polyTex([n, k]) + ')' + H.sg(rem) + '$.', 'Per tant $f(x)=' + M.polyTex([n, k]) + '+\\dfrac{' + rem + '}{' + H.xm(a) + '}$ i l\'obliqua és $y=' + M.polyTex([n, k]) + '$.'], { range: [-3, 3] });
      prob.solPlot = { fns: [{ f: '(' + M.polyStr(num) + ')/(x-(' + a + '))', label: 'f' }, { f: k + '*x+(' + n + ')', label: 'obliqua' }], xr: [a - 6, a + 6] };
      return prob;
    }
  });

  gens.push({
    id: 'asymp_horiz', title: 'Asímptotes horitzontal i verticals', level: 2,
    make(r) {
      const m = r.nz(-4, 4), k = r.int(1, 5), b = r.int(-3, 3), d = r.int(-3, 3);
      const num = [d, b, m], den = [-k * k, 0, 1];
      const prob = P.multi('Per a $f(x)=\\dfrac{' + M.polyTex(num) + '}{' + M.polyTex(den) + '}$ troba l\'asímptota horitzontal $y=L$ i les dues verticals.',
        [{ label: '$y=$', ans: m }, { label: '$x_1=$', ans: -k }, { label: '$x_2=$', ans: k }],
        ['Mateix grau: $L=\\dfrac{' + m + '}{1}=' + m + '$ (a $\\pm\\infty$).', 'Denominador: $x^2-' + k * k + '=(x-' + k + ')(x+' + k + ')=0$ ⇒ $x=\\pm' + k + '$ (el numerador no s\'hi anul·la en general).'], {});
      const ok = num.length && M.polyEval(num, k) !== 0 && M.polyEval(num, -k) !== 0;
      if (!ok) return null;
      return prob;
    }
  });

  /* ------------ Plantilles de límits amb indeterminació ------------ */
  const AT = { 0: '0', '0+': '0^+', inf: '+\\infty', 1: '1' };
  const lim = (at, ex) => 'Calcula $\\displaystyle\\lim_{x\\to ' + AT[at] + '}' + ex + '$';
  const valOf = (expr, at) => { const f = M.compile(expr); const x = at === 'inf' ? 1e8 : (at === '0' || at === '0+' ? 1e-4 : 1 + 1e-4); return f(x); };
  function limitProblem(t) {
    const exprTex = t.tex || M.tex(t.expr);
    const p = P.num(lim(t.at, exprTex), t.ans, t.steps, { ansTex: t.ansTex || M.numTex(t.ans), tol: 1e-6 });
    if (t.ans === Infinity || t.ans === -Infinity) p.ansTex = t.ans > 0 ? '+\\infty' : '-\\infty';
    p.check = () => {
      const v = valOf(t.expr, t.at);
      if (t.ans === Infinity) return v > 1e3 || v === Infinity;
      if (t.ans === -Infinity) return v < -1e3 || v === -Infinity;
      return Math.abs(v - t.ans) < 3e-3 * Math.max(1, Math.abs(t.ans));
    };
    return p;
  }
  const lh = (num, den) => {
    const dn = M.diff(num), dd = M.diff(den);
    return '$\\dfrac{f\'}{g\'}=\\dfrac{' + M.toTex(dn) + '}{' + M.toTex(dd) + '}$';
  };

  gens.push({
    id: 'lhop_00', title: 'L\'Hôpital: forma 0/0', level: 2,
    make(r) {
      const a = r.int(2, 5), b = r.int(1, 4);
      const pool = [
        () => ({ expr: 'sin(' + a + 'x)/(' + b + 'x)', at: '0', ans: a / b, num: 'sin(' + a + 'x)', den: b + 'x' }),
        () => ({ expr: '(e^(' + a + 'x)-1)/(' + b + 'x)', at: '0', ans: a / b, num: 'e^(' + a + 'x)-1', den: b + 'x' }),
        () => ({ expr: '(1-cos(' + a + 'x))/x^2', at: '0', ans: a * a / 2, num: '1-cos(' + a + 'x)', den: 'x^2', twice: true }),
        () => ({ expr: '(x-sin(x))/x^3', at: '0', ans: 1 / 6, num: 'x-sin(x)', den: 'x^3', twice: true }),
        () => ({ expr: 'ln(1+' + a + 'x)/(' + b + 'x)', at: '0', ans: a / b, num: 'ln(1+' + a + 'x)', den: b + 'x' }),
        () => ({ expr: '(e^x-1-x)/x^2', at: '0', ans: 0.5, num: 'e^x-1-x', den: 'x^2', twice: true }),
        () => ({ expr: 'tan(' + a + 'x)/(' + b + 'x)', at: '0', ans: a / b, num: 'tan(' + a + 'x)', den: b + 'x' }),
        () => ({ expr: '(e^(' + a + 'x)-e^(' + b + 'x))/x', at: '0', ans: a - b, num: 'e^(' + a + 'x)-e^(' + b + 'x)', den: 'x' }),
        () => ({ expr: '(x-atan(x))/x^3', at: '0', ans: 1 / 3, num: 'x-atan(x)', den: 'x^3', twice: true }),
        () => ({ expr: '(sqrt(1+' + a + 'x)-1)/x', at: '0', ans: a / 2, num: 'sqrt(1+' + a + 'x)-1', den: 'x' }),
        () => ({ expr: '(x^2-1)/ln(x)', at: '1', ans: 2, num: 'x^2-1', den: 'ln(x)' }),
        () => ({ expr: '(x^' + a + '-1)/(x-1)', at: '1', ans: a, num: 'x^' + a + '-1', den: 'x-1' })
      ];
      const t = pool[r.int(0, pool.length - 1)]();
      t.steps = ['Substituint, queda $\\dfrac00$: apliquem L\'Hôpital.', 'Derivem: ' + lh(t.num, t.den) + (t.twice ? ' (torna a ser $\\frac00$: repetim L\'Hôpital)' : '') + '.', 'El límit val $' + M.numTex(t.ans) + '$.'];
      return limitProblem(t);
    }
  });

  gens.push({
    id: 'lhop_inf', title: 'L\'Hôpital: forma ∞/∞ i jerarquia', level: 2,
    make(r) {
      const n = r.int(1, 4), a = r.int(1, 3);
      const pool = [
        () => ({ expr: 'ln(x)/x^' + n, at: 'inf', ans: 0, num: 'ln(x)', den: 'x^' + n }),
        () => ({ expr: 'x^' + n + '/e^(' + a + 'x)', at: 'inf', ans: 0, num: 'x^' + n, den: 'e^(' + a + 'x)' }),
        () => ({ expr: 'e^(' + a + 'x)/x^' + n, at: 'inf', ans: Infinity, num: 'e^(' + a + 'x)', den: 'x^' + n }),
        () => ({ expr: '(x^2+' + 3 * a + 'x)/e^x', at: 'inf', ans: 0, num: 'x^2+' + 3 * a + 'x', den: 'e^x' }),
        () => ({ expr: 'x/ln(x)', at: 'inf', ans: Infinity, num: 'x', den: 'ln(x)' }),
        () => ({ expr: 'ln(x)/sqrt(x)', at: 'inf', ans: 0, num: 'ln(x)', den: 'sqrt(x)' }),
        () => ({ expr: '(ln(x))^2/x', at: 'inf', ans: 0, num: '(ln(x))^2', den: 'x' }),
        () => ({ expr: '(' + a + 'x+ln(x))/(x+' + n + ')', at: 'inf', ans: a, num: a + 'x+ln(x)', den: 'x+' + n })
      ];
      const t = pool[r.int(0, pool.length - 1)]();
      t.steps = ['Forma $\\dfrac\\infty\\infty$: L\'Hôpital (repeteix-lo si cal).', lh(t.num, t.den) + '.', 'Resultat: $' + (t.ans === Infinity ? '+\\infty' : M.numTex(t.ans)) + '$. Recorda: $\\ln x\\ll x^n\\ll e^x$ quan $x\\to\\infty$.'];
      return limitProblem(t);
    }
  });

  gens.push({
    id: 'lhop_0inf', title: 'Forma 0·∞', level: 2,
    make(r) {
      const a = r.int(2, 5), n = r.int(1, 3);
      const pool = [
        () => ({ expr: 'x*ln(x)', at: '0+', ans: 0, steps: ['Forma $0\\cdot(-\\infty)$. Escrivim $x\\ln x=\\dfrac{\\ln x}{1/x}$ ($\\frac{-\\infty}{\\infty}$).', 'L\'Hôpital: $\\dfrac{1/x}{-1/x^2}=-x\\to0$.'] }),
        () => ({ expr: 'x^' + (n + 1) + '*ln(x)', at: '0+', ans: 0, steps: ['Forma $0\\cdot(-\\infty)$: $x^{' + (n + 1) + '}\\ln x=\\dfrac{\\ln x}{x^{-' + (n + 1) + '}}$.', 'L\'Hôpital: $\\dfrac{1/x}{-' + (n + 1) + 'x^{-' + (n + 2) + '}}=-\\dfrac{x^{' + (n + 1) + '}}{' + (n + 1) + '}\\to0$.'] }),
        () => ({ expr: 'x^' + n + '*e^(-x)', at: 'inf', ans: 0, steps: ['Forma $\\infty\\cdot0$: $x^{' + n + '}e^{-x}=\\dfrac{x^{' + n + '}}{e^x}$ ($\\frac\\infty\\infty$).', 'Aplicant L\'Hôpital $' + n + '$ cops, el numerador esdevé constant i el denominador segueix sent $e^x$: límit $0$.'] }),
        () => ({ expr: 'x*sin(' + a + '/x)', at: 'inf', ans: a, steps: ['Forma $\\infty\\cdot0$. Posa $t=1/x\\to0^+$: $\\dfrac{\\sin(' + a + 't)}{t}$.', 'L\'Hôpital: $\\dfrac{' + a + '\\cos(' + a + 't)}{1}\\to' + a + '$.'] }),
        () => ({ expr: 'x*(e^(1/x)-1)', at: 'inf', ans: 1, steps: ['Forma $\\infty\\cdot0$. Posa $t=1/x\\to0^+$: $\\dfrac{e^t-1}{t}$.', 'L\'Hôpital: $\\dfrac{e^t}{1}\\to1$.'] }),
        () => ({ expr: 'x*ln(1+' + a + '/x)', at: 'inf', ans: a, steps: ['Forma $\\infty\\cdot0$. Posa $t=1/x\\to0^+$: $\\dfrac{\\ln(1+' + a + 't)}{t}$.', 'L\'Hôpital: $\\dfrac{' + a + '/(1+' + a + 't)}{1}\\to' + a + '$.'] })
      ];
      return limitProblem(pool[r.int(0, pool.length - 1)]());
    }
  });

  gens.push({
    id: 'lhop_pow', title: 'Formes 1^∞, 0^0, ∞^0', level: 3,
    make(r) {
      const a = r.int(1, 4), b = r.int(1, 3);
      const pool = [
        () => ({ expr: '(1+' + a + '/x)^(' + b + 'x)', at: 'inf', ans: Math.exp(a * b), ansTex: 'e^{' + a * b + '}', steps: ['Forma $1^\\infty$: $\\ln L=\\lim ' + b + 'x\\ln(1+' + a + '/x)$ (forma $\\infty\\cdot0$).', 'Amb $t=1/x$: $\\lim\\dfrac{' + b + '\\ln(1+' + a + 't)}{t}=' + a * b + '$ (L\'Hôpital).', '$L=e^{' + a * b + '}$.'] }),
        () => ({ expr: '(1+' + a + 'x)^(' + b + '/x)', at: '0', ans: Math.exp(a * b), ansTex: 'e^{' + a * b + '}', steps: ['Forma $1^\\infty$: $\\ln L=\\lim\\dfrac{' + b + '\\ln(1+' + a + 'x)}{x}$ ($\\frac00$).', 'L\'Hôpital: $' + b + '\\cdot' + a + '=' + a * b + '$ ⇒ $L=e^{' + a * b + '}$.'] }),
        () => ({ expr: 'cos(x)^(1/x^2)', at: '0', ans: Math.exp(-0.5), ansTex: 'e^{-1/2}', steps: ['Forma $1^\\infty$: $\\ln L=\\lim\\dfrac{\\ln\\cos x}{x^2}$ ($\\frac00$).', 'L\'Hôpital: $\\dfrac{-\\tan x}{2x}\\to-\\dfrac12$ ⇒ $L=e^{-1/2}$.'] }),
        () => ({ expr: '(1+sin(x))^(' + a + '/x)', at: '0', ans: Math.exp(a), ansTex: 'e^{' + a + '}', steps: ['Forma $1^\\infty$: $\\ln L=\\lim\\dfrac{' + a + '\\ln(1+\\sin x)}{x}$.', 'L\'Hôpital: $' + a + '\\dfrac{\\cos x}{1+\\sin x}\\to' + a + '$ ⇒ $L=e^{' + a + '}$.'] }),
        () => ({ expr: 'x^x', at: '0+', ans: 1, steps: ['Forma $0^0$: $\\ln L=\\lim x\\ln x=0$ (vist abans).', '$L=e^0=1$.'] }),
        () => ({ expr: 'x^(1/x)', at: 'inf', ans: 1, steps: ['Forma $\\infty^0$: $\\ln L=\\lim\\dfrac{\\ln x}{x}=0$ (L\'Hôpital).', '$L=e^0=1$.'] }),
        () => ({ expr: '(x/(x+' + a + '))^x', at: 'inf', ans: Math.exp(-a), ansTex: 'e^{-' + a + '}', steps: ['Forma $1^\\infty$: $\\dfrac{x}{x+' + a + '}=1-\\dfrac{' + a + '}{x+' + a + '}$.', '$\\ln L=\\lim x\\ln\\dfrac{x}{x+' + a + '}=\\lim\\dfrac{\\ln\\frac{1}{1+' + a + 't}}{t}=-' + a + '$ ($t=1/x$).', '$L=e^{-' + a + '}$.'] })
      ];
      const t = pool[r.int(0, pool.length - 1)]();
      const p = limitProblem(t);
      p.sol = t.steps; p.ansTex = t.ansTex; p.tol = 1e-5;
      return p;
    }
  });

  gens.push({
    id: 'lhop_diff', title: 'Forma ∞−∞', level: 3,
    make(r) {
      const pool = [
        { expr: '1/x-1/sin(x)', at: '0', ans: 0, steps: ['Forma $\\infty-\\infty$. Denominador comú: $\\dfrac{\\sin x-x}{x\\sin x}$ ($\\frac00$).', 'L\'Hôpital: $\\dfrac{\\cos x-1}{\\sin x+x\\cos x}$ ($\\frac00$) → $\\dfrac{-\\sin x}{2\\cos x-x\\sin x}\\to\\dfrac{0}{2}=0$.'] },
        { expr: '1/x-1/(e^x-1)', at: '0', ans: 0.5, steps: ['Denominador comú: $\\dfrac{e^x-1-x}{x(e^x-1)}$ ($\\frac00$).', 'L\'Hôpital dos cops: $\\dfrac{e^x-1}{(e^x-1)+xe^x}\\to\\dfrac{e^x}{2e^x+xe^x}\\to\\dfrac12$.'] },
        { expr: '1/x-1/ln(1+x)', at: '0', ans: -0.5, steps: ['Denominador comú: $\\dfrac{\\ln(1+x)-x}{x\\ln(1+x)}$ ($\\frac00$).', 'Aplicant L\'Hôpital dues vegades s\'arriba a $-\\dfrac12$.'] },
        { expr: '1/(x-1)-1/ln(x)', at: '1', ans: -0.5, steps: ['Denominador comú: $\\dfrac{\\ln x-(x-1)}{(x-1)\\ln x}$ ($\\frac00$).', 'Dues aplicacions de L\'Hôpital donen $-\\dfrac12$.'] },
        { expr: '1/sin(x)^2-1/x^2', at: '0', ans: 1 / 3, steps: ['Denominador comú: $\\dfrac{x^2-\\sin^2x}{x^2\\sin^2x}$ ($\\frac00$).', 'Amb sèries/L\'Hôpital repetit: $\\dfrac13$.'] }
      ];
      return limitProblem(r.pick(pool));
    }
  });

  gens.push({
    id: 'lhop_param', title: 'Límits amb paràmetres', level: 3,
    make(r) {
      const k = r.int(2, 5);
      if (r.int(0, 1)) {
        return P.multi('Troba el valor de $a$ perquè $\\displaystyle\\lim_{x\\to0}\\dfrac{e^{' + k + 'x}-1-ax}{x^2}$ sigui finit, i el valor d\'aquest límit.',
          [{ label: '$a=$', ans: k }, { label: 'límit $=$', ans: k * k / 2 }],
          ['El denominador tendeix a $0$; perquè el límit sigui finit el numerador ha de tendir a $0$ ràpidament. $\\frac00$: L\'Hôpital ⇒ $\\dfrac{' + k + 'e^{' + k + 'x}-a}{2x}$.', 'Perquè torni a ser finit: $' + k + '-a=0$ ⇒ $a=' + k + '$.', 'Una altra aplicació: $\\dfrac{' + k * k + 'e^{' + k + 'x}}{2}\\to\\dfrac{' + k * k + '}{2}$.']);
      }
      return P.multi('Troba $a$ perquè $\\displaystyle\\lim_{x\\to0}\\dfrac{\\sin(' + k + 'x)-ax}{x^3}$ sigui finit, i el valor del límit.',
        [{ label: '$a=$', ans: k }, { label: 'límit $=$', ans: -k * k * k / 6 }],
        ['L\'Hôpital: $\\dfrac{' + k + '\\cos(' + k + 'x)-a}{3x^2}$ ⇒ cal $' + k + '-a=0$ ⇒ $a=' + k + '$.', 'Un cop més: $\\dfrac{-' + k * k + '\\sin(' + k + 'x)}{6x}$ i un cop més: $\\dfrac{-' + k * k * k + '\\cos(' + k + 'x)}{6}\\to-\\dfrac{' + k * k * k + '}{6}$.']);
    }
  });

  Calc.add({
    id: 'l4', num: '4', llista: 'Llista 4 + Seminari', title: 'Asímptotes, estudi de funcions i L\'Hôpital',
    short: 'Asímptotes, estudi complet d\'una funció i totes les indeterminacions amb L\'Hôpital.',
    desc: 'Inclou el "Seminari 1" del resum parcial: indeterminacions 0/0, ∞/∞, 0·∞, 1^∞…',
    theory, gens,
    bank: [
      { q: 'Quina NO és una forma indeterminada?', c: ['$0/0$', '$\\infty-\\infty$', '$1^\\infty$', '$\\infty+\\infty$'], a: 3, e: '$\\infty+\\infty=\\infty$ sempre.' },
      { q: 'L\'Hôpital s\'aplica quan el límit és de la forma…', c: ['qualsevol', '$0/0$ o $\\infty/\\infty$', 'només $0/0$', '$k/0$'], a: 1, e: 'Només aquestes dues.' },
      { q: '$\\lim_{x\\to+\\infty}\\dfrac{\\ln x}{x}=$', c: ['$\\infty$', '1', '0', '$e$'], a: 2, e: 'Jerarquia: $x$ creix més que $\\ln x$.' },
      { q: '$\\lim_{x\\to0^+}x\\ln x=$', c: ['$-\\infty$', '0', '1', '$-1$'], a: 1, e: '$\\frac{\\ln x}{1/x}\\to-x\\to0$.' },
      { q: '$\\lim_{x\\to\\infty}\\left(1+\\frac1x\\right)^x=$', c: ['1', '$\\infty$', '$e$', '0'], a: 2, e: 'Límit notable.' },
      { q: 'Una asímptota obliqua pot existir si…', c: ['hi ha asímptota horitzontal', 'grau num = grau den + 1', 'grau num = grau den', 'mai en funcions racionals'], a: 1, e: 'Divisió de polinomis.' },
      { q: 'Per a $1^\\infty$, el mètode estàndard és…', c: ['conjugat', 'passar a $e^{g\\ln f}$', 'factoritzar', 'regla del quocient'], a: 1, e: 'Es calcula $\\lim g\\ln f$.' },
      { q: '$\\dfrac{f}{g}\\to\\dfrac00$. L\'Hôpital diu que el límit és $\\lim\\ldots$', c: ['$\\left(\\frac fg\\right)\'$', '$\\frac{f\'}{g\'}$', '$\\frac{f\'g-fg\'}{g^2}$', '$f\'g\'$'], a: 1, e: 'Es deriven per separat.' }
    ]
  });
})();
