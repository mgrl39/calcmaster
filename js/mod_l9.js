/* Llista 9 — Integral de Riemann, teorema fonamental del càlcul, àrees, volums,
   longituds, àrees de revolució i integració numèrica (trapezis i Simpson) */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;

  const theory = `
<h3>Què és la integral: sumes de Riemann</h3>
<p>Vols l'àrea sota $f$ entre $a$ i $b$. Idea: parteix $[a,b]$ en $n$ trossos d'amplada $h=\\frac{b-a}{n}$, posa un rectangle a cada tros i suma les àrees.</p>
<div class="box formula">Suma de Riemann: $S_n=\\displaystyle\\sum_{i=1}^{n} f(x_i^*)\\,h$, amb $x_i^*$ un punt de cada tros (esquerra, dreta o punt mig).<br>
<b>Integral</b> $=$ el límit quan els rectangles es fan infinitament estrets: $\\displaystyle\\int_a^b f(x)\\,dx=\\lim_{n\\to\\infty}S_n$.</div>
<div class="box ex"><b>Exemple.</b> $f(x)=x^2$ a $[0,2]$ amb $n=4$ i punt de la dreta: $h=0{,}5$, punts $0{,}5;\\,1;\\,1{,}5;\\,2$.<br>$S_4=0{,}5\\,(0{,}25+1+2{,}25+4)=3{,}75$. El valor exacte és $\\frac83\\approx2{,}667$: amb més rectangles t'hi acostes.</div>
<p>No calcularàs integrals així (és llarg): per això existeix la regla de Barrow. Però és el que <b>vol dir</b> una integral, i és com les calcula un ordinador (vegeu integració numèrica).</p>

<h3>Integral definida i teorema fonamental del càlcul (TFC)</h3>
<div class="box formula">
<b>TFC (1a part):</b> si $f$ és contínua, $G(x)=\\displaystyle\\int_a^xf(t)\\,dt$ és derivable i $G'(x)=f(x)$.<br>
<b>Regla de Barrow (2a part):</b> $\\displaystyle\\int_a^bf(x)\\,dx=F(b)-F(a)$ on $F'=f$.<br>
<b>Regla de Leibniz:</b> $\\dfrac{d}{dx}\\displaystyle\\int_{h(x)}^{g(x)}f(t)\\,dt=f(g(x))\\,g'(x)-f(h(x))\\,h'(x)$.
</div>
<div class="box ex"><b>Exemple (Leibniz).</b> $F(x)=\\int_0^{x^3}e^{t^{5/2}}dt$ ⇒ $F'(x)=e^{(x^3)^{5/2}}\\cdot3x^2$. <b>No cal integrar!</b> (la funció $e^{t^{5/2}}$ no té primitiva elemental): només substituir el límit superior i multiplicar per la seva derivada.</div>
<p><b>Punts crítics de $G(x)=\\int_a^xf$:</b> $G'(x)=f(x)=0$. Signe de $G'=f$ ⇒ creixement; $G''=f'$ ⇒ concavitat.</p>
<p>Propietats: $\\int_a^b=-\\int_b^a$; $\\int_a^b=\\int_a^c+\\int_c^b$; si $f$ és <b>senar</b>, $\\int_{-a}^af=0$; si és <b>parell</b>, $\\int_{-a}^af=2\\int_0^af$. En un canvi de variable <b>canvia també els límits</b>.</p>
<p><b>Valor mitjà</b> de $f$ en $[a,b]$: $\\bar f=\\dfrac{1}{b-a}\\displaystyle\\int_a^bf$. Teorema del valor mitjà integral: existeix $c$ amb $f(c)=\\bar f$.</p>

<h3>Àrees</h3>
<div class="box formula">
Àrea entre $f$ i l'eix $x$: $\\displaystyle\\int_a^b|f(x)|dx$ (<b>parteix</b> per les arrels de $f$ i canvia el signe on és negativa).<br>
Àrea entre dues corbes: $\\displaystyle\\int_a^b|f(x)-g(x)|dx=\\int_a^b(\\text{dalt}-\\text{baix})dx$.
</div>
<p><b>Procediment:</b> (1) dibuixa; (2) talla les corbes ⇒ límits; (3) decideix qui és a dalt a cada tros; (4) integra $\\text{dalt}-\\text{baix}$.</p>
<div class="box warn">$\\int f$ (integral amb signe) $\\ne$ àrea si $f$ canvia de signe. Ex: $\\int_{-1}^1x\\,dx=0$ però l'àrea és $1$.</div>

<h3>Volums de revolució</h3>
<table class="tbl">
<tr><td><b>Discos</b> (gir al voltant de l'eix $x$)</td><td>$V=\\pi\\displaystyle\\int_a^b[f(x)]^2dx$</td></tr>
<tr><td><b>Rentadores</b> (regió entre $f\\ge g\\ge0$)</td><td>$V=\\pi\\displaystyle\\int_a^b\\left([f(x)]^2-[g(x)]^2\\right)dx$</td></tr>
<tr><td><b>Capes cilíndriques</b> (gir al voltant de l'eix $y$)</td><td>$V=2\\pi\\displaystyle\\int_a^bx\\,|f(x)|\\,dx$</td></tr>
</table>

<h3>Longitud d'una corba i àrea d'una superfície de revolució</h3>
<p>Un tros petit de corba és gairebé un segment: per Pitàgores mesura $\\sqrt{dx^2+dy^2}=\\sqrt{1+f'(x)^2}\\,dx$. Sumant-los tots:</p>
<div class="box formula">Longitud: $L=\\displaystyle\\int_a^b\\sqrt{1+f'(x)^2}\\,dx$<br>
Àrea de la superfície en girar $y=f(x)\\ge0$ al voltant de l'eix $X$: $S=2\\pi\\displaystyle\\int_a^b f(x)\\sqrt{1+f'(x)^2}\\,dx$</div>
<div class="box ex"><b>Exemple.</b> $f(x)=\\frac23x^{3/2}$ a $[0,3]$: $f'=\\sqrt x$, $\\sqrt{1+f'^2}=\\sqrt{1+x}$.<br>$L=\\int_0^3\\sqrt{1+x}\\,dx=\\frac23\\left[(1+x)^{3/2}\\right]_0^3=\\frac23(8-1)=\\frac{14}3$.</div>
<div class="box warn">L'arrel $\\sqrt{1+f'^2}$ quasi mai té primitiva. Als exercicis les funcions estan triades perquè surti un quadrat perfecte; si no, es fa amb integració numèrica.</div>

<h3>Integració numèrica: trapezis i Simpson</h3>
<p>Quan no trobes primitiva (p.ex. $\\int e^{-x^2}dx$), aproximes. Parteix $[a,b]$ en $n$ trossos, $h=\\frac{b-a}{n}$, $x_i=a+ih$, $f_i=f(x_i)$.</p>
<div class="box formula"><b>Trapezis</b> (uneix punts amb rectes): $T_n=\\dfrac h2\\left(f_0+2f_1+2f_2+\\dots+2f_{n-1}+f_n\\right)$<br>
<b>Simpson</b> ($n$ parell, uneix punts amb paràboles): $S_n=\\dfrac h3\\left(f_0+4f_1+2f_2+4f_3+\\dots+4f_{n-1}+f_n\\right)$</div>
<p>Truc per recordar-ho: trapezis = <b>1, 2, 2, …, 2, 1</b>; Simpson = <b>1, 4, 2, 4, …, 4, 1</b>.</p>
<div class="box formula">Error: $|E_T|\\le\\dfrac{(b-a)h^2}{12}\\max|f''|$ &nbsp;&nbsp; $|E_S|\\le\\dfrac{(b-a)h^4}{180}\\max|f^{(4)}|$</div>
<p>Simpson és molt més precís: l'error baixa amb $h^4$ en lloc de $h^2$ (si dobles $n$, l'error es divideix per 16 en lloc de per 4).</p>
`;

  const gens = [];
  const tt = s => M.toTex(M.simplify(M.parse(s, ['t'])));
  const simpsonCheck = (f, a, b, v) => () => Math.abs(M.simpson(M.compile(f), a, b, 4000) - v) < 1e-5 * Math.max(1, Math.abs(v));

  gens.push({
    id: 'defint', title: 'Integrals definides (Barrow)', level: 1,
    make(r) {
      const k = r.int(2, 4), a = r.int(1, 3), b = r.nz(-3, 5);
      const pool = [
        () => { const c = [r.int(-3, 3), r.nz(-3, 3), r.nz(-3, 3)], lo = r.int(-2, 1), hi = lo + r.int(1, 3); const f = M.polyStr(c); const v = (M.polyEval([0, c[0], c[1] / 2, c[2] / 3], hi) - M.polyEval([0, c[0], c[1] / 2, c[2] / 3], lo)); return { f, tex: M.polyTex(c), lo, hi, v, st: ['Primitiva: $F(x)=' + M.polyTex([0, c[0], c[1] / 2, c[2] / 3]) + '$.', '$F(' + hi + ')-F(' + lo + ')=' + T(v) + '$.'] }; },
        () => ({ f: 'e^(' + k + 'x)', tex: 'e^{' + k + 'x}', lo: 0, hi: 1, v: (Math.exp(k) - 1) / k, tex2: '\\frac{e^{' + k + '}-1}{' + k + '}', st: ['$F(x)=\\frac{e^{' + k + 'x}}{' + k + '}$ ⇒ $\\frac{e^{' + k + '}-1}{' + k + '}\\approx' + M.round((Math.exp(k) - 1) / k, 4) + '$.'] }),
        () => ({ f: 'sin(' + k + 'x)', tex: '\\sin(' + k + 'x)', lo: 0, hi: Math.PI, hiTex: '\\pi', v: (1 - Math.cos(k * Math.PI)) / k, st: ['$F(x)=-\\frac{\\cos(' + k + 'x)}{' + k + '}$ ⇒ $\\frac{1-\\cos(' + k + '\\pi)}{' + k + '}=' + T((1 - Math.cos(k * Math.PI)) / k) + '$.'] }),
        () => ({ f: '1/x', tex: '\\frac1x', lo: 1, hi: a + 1, v: Math.log(a + 1), tex2: '\\ln ' + (a + 1), st: ['$F(x)=\\ln x$ ⇒ $\\ln ' + (a + 1) + '-\\ln1=\\ln' + (a + 1) + '\\approx' + M.round(Math.log(a + 1), 4) + '$.'] }),
        () => ({ f: 'x*e^(x^2)', tex: 'x\\,e^{x^2}', lo: 0, hi: 1, v: (Math.E - 1) / 2, tex2: '\\frac{e-1}{2}', st: ['$u=x^2$: $F(x)=\\frac{e^{x^2}}{2}$ ⇒ $\\frac{e-1}2$.'] }),
        () => ({ f: 'x*e^x', tex: 'x\\,e^{x}', lo: 0, hi: 1, v: 1, st: ['Parts: $F(x)=xe^x-e^x$ ⇒ $F(1)-F(0)=0-(-1)=1$.'] }),
        () => ({ f: '1/(1+x^2)', tex: '\\frac1{1+x^2}', lo: 0, hi: 1, v: Math.PI / 4, tex2: '\\frac\\pi4', st: ['$F=\\arctan x$ ⇒ $\\arctan1-\\arctan0=\\frac\\pi4$.'] }),
        () => ({ f: 'x/(1+x^2)', tex: '\\frac{x}{1+x^2}', lo: 0, hi: 1, v: Math.log(2) / 2, tex2: '\\frac{\\ln2}{2}', st: ['$F=\\frac12\\ln(1+x^2)$ ⇒ $\\frac12\\ln2$.'] }),
        () => ({ f: 'ln(x)', tex: '\\ln x', lo: 1, hi: Math.E, hiTex: 'e', v: 1, st: ['$F(x)=x\\ln x-x$ ⇒ $(e-e)-(0-1)=1$.'] }),
        () => ({ f: 'sqrt(x)', tex: '\\sqrt x', lo: 0, hi: a * a, v: 2 * a * a * a / 3, st: ['$F(x)=\\frac23x^{3/2}$ ⇒ $\\frac23(' + a * a + ')^{3/2}=\\frac23' + a * a * a + '=' + T(2 * a * a * a / 3) + '$.'] }),
        () => ({ f: 'cos(x)*sin(x)^2', tex: '\\cos x\\sin^2x', lo: 0, hi: Math.PI / 2, hiTex: '\\frac\\pi2', v: 1 / 3, st: ['$u=\\sin x$: $F=\\frac{\\sin^3x}{3}$ ⇒ $\\frac13$.'] })
      ];
      const t = pool[r.int(0, pool.length - 1)]();
      const hiT = t.hiTex || T(t.hi);
      const p = P.num('Calcula $\\displaystyle\\int_{' + T(t.lo) + '}^{' + hiT + '}' + t.tex + '\\,dx$ (pots usar <code>pi</code>, <code>e</code>, <code>ln</code>).', t.v, t.st, { ansTex: t.tex2 || T(t.v), tol: 2e-4 });
      p.check = simpsonCheck(t.f, t.lo, t.hi, t.v);
      return p;
    }
  });

  gens.push({
    id: 'signed_area', title: 'Integral amb signe vs àrea', level: 1,
    make(r) {
      const c = r.int(1, 3), lo = -r.int(1, 3), hi = r.int(c + 1, c + 3);
      // f(x) = x - c  en [lo,hi]
      const I = (hi * hi - lo * lo) / 2 - c * (hi - lo);
      const A = ((c - lo) * (c - lo)) / 2 + ((hi - c) * (hi - c)) / 2;
      return P.multi('Per a $f(x)=x' + H.sg(-c) + '$ a l\'interval $[' + lo + ',' + hi + ']$, calcula la integral $\\int_{' + lo + '}^{' + hi + '}f\\,dx$ i l\'<b>àrea</b> compresa entre la gràfica i l\'eix $x$.',
        [{ label: 'integral $=$', ans: I }, { label: 'àrea $=$', ans: A }],
        ['Integral: $\\left[\\frac{x^2}2-' + c + 'x\\right]_{' + lo + '}^{' + hi + '}=' + T(I) + '$.', '$f$ canvia de signe en $x=' + c + '$: àrea $=\\int_{' + lo + '}^{' + c + '}(' + c + '-x)dx+\\int_{' + c + '}^{' + hi + '}(x-' + c + ')dx=' + T((c - lo) * (c - lo) / 2) + '+' + T((hi - c) * (hi - c) / 2) + '=' + T(A) + '$.'], { plot: { fns: [{ f: 'x-' + c, label: 'f' }], xr: [lo - 1, hi + 1], shade: { top: 'x-' + c, bottom: '0', a: lo, b: hi } } });
    }
  });

  gens.push({
    id: 'leibniz', title: 'Derivada d\'una integral (Leibniz)', level: 2,
    make(r) {
      const ft = r.pick(['e^(t^2)', 'sin(t^2)', 'sqrt(1+t^4)', 'ln(1+t^2)', 't/(1+t^2)', 'cos(t)^2+1', 'e^(-t)*t', 'atan(t)']);
      const g = r.pick(['x^2', 'x^3', 'sqrt(x)', '2x', 'x+1', 'x^2+1']);
      const lowerVar = r.int(0, 3) === 0;
      const h = r.pick(['x', 'x^2', '2x']);
      const fg = M.compose(ft, 't', g), dg = M.diff(g);
      let ans = '(' + M.toStr(fg) + ')*(' + M.toStr(dg) + ')';
      let upperTex = M.tex(g), lower = '0', rule = '$F\'(x)=f(g(x))\\,g\'(x)$ amb $g(x)=' + M.tex(g) + '$.';
      let step2 = '$F\'(x)=' + M.toTex(M.simplify(fg)) + '\\cdot' + M.toTex(dg) + '$.';
      if (lowerVar) {
        const fh = M.compose(ft, 't', h), dh = M.diff(h);
        ans += '-(' + M.toStr(fh) + ')*(' + M.toStr(dh) + ')';
        lower = M.tex(h); rule = '$F\'(x)=f(g(x))g\'(x)-f(h(x))h\'(x)$ amb $g=' + M.tex(g) + '$, $h=' + M.tex(h) + '$.';
        step2 = '$F\'(x)=' + M.toTex(M.simplify(fg)) + '\\cdot' + M.toTex(dg) + '-' + M.toTex(M.simplify(fh)) + '\\cdot' + M.toTex(dh) + '$.';
      }
      return P.fn('Calcula $F\'(x)$ si $F(x)=\\displaystyle\\int_{' + lower + '}^{' + upperTex + '}' + tt(ft) + '\\,dt$.', ans, ['<b>No cal calcular la integral.</b> ' + rule, 'Aquí $f(t)=' + tt(ft) + '$.', step2], { range: [0.3, 1.7] });
    }
  });

  gens.push({
    id: 'ftc_value', title: 'F\'(a) amb el TFC', level: 1,
    make(r) {
      const c = r.int(0, 2), a = r.int(1, 3), k = r.int(1, 3);
      const f = [r.int(1, 5), r.int(-2, 2), 1]; // t^2 + b t + c0
      const g = [0, 0, k]; // k x^2
      const val = M.polyEval(f, k * a * a) * 2 * k * a;
      return P.num('Si $F(x)=\\displaystyle\\int_1^{' + (k === 1 ? '' : k) + 'x^2}(' + M.polyTex(f, 't') + ')\\,dt$, calcula $F\'(' + a + ')$.', val,
        ['TFC + cadena: $F\'(x)=f(g(x))g\'(x)$ amb $g(x)=' + (k === 1 ? '' : k) + 'x^2$, $g\'(x)=' + 2 * k + 'x$.', '$F\'(' + a + ')=f(' + k * a * a + ')\\cdot' + 2 * k * a + '=' + T(M.polyEval(f, k * a * a)) + '\\cdot' + 2 * k * a + '=' + T(val) + '$.']);
    }
  });

  gens.push({
    id: 'ftc_crit', title: 'Punts crítics de F(x)=∫f', level: 2,
    make(r) {
      const [p, q] = H.sortNum(H.distinct(r, 2, -3, 4));
      const f = M.polyMul([-p, 1], [-q, 1]);
      return P.multi('Sigui $F(x)=\\displaystyle\\int_0^x(' + M.polyTex([p * q, -(p + q), 1], 't') + ')\\,dt$. Troba els punts crítics de $F$: l\'abscissa del màxim local i la del mínim local.',
        [{ label: '$x_{\\max}=$', ans: p }, { label: '$x_{\\min}=$', ans: q }],
        ['$F\'(x)=f(x)=' + M.polyTex([p * q, -(p + q), 1]) + '=(' + H.xm(p) + ')(' + H.xm(q) + ')$ (TFC).', '$F\'=0$ ⇒ $x=' + p + '$ i $x=' + q + '$. Signe de $F\'$: $+,-,+$ ⇒ màxim en $' + p + '$ i mínim en $' + q + '$.']);
    }
  });

  gens.push({
    id: 'area_between', title: 'Àrea entre dues corbes', level: 2,
    make(r) {
      const t = r.int(0, 5);
      let q, v, tex, st, plot, f, g, a, b, ans, ansTex;
      if (t === 0) {
        const [p1, q1] = H.sortNum(H.distinct(r, 2, -3, 4));
        f = 'x^2'; g = (p1 + q1) + '*x-(' + p1 * q1 + ')'; a = p1; b = q1; v = Math.pow(q1 - p1, 3) / 6;
        tex = 'y=x^2\\ \\text{ i }\\ y=' + M.polyTex([-p1 * q1, p1 + q1]);
        st = ['Talls: $x^2=' + M.polyTex([-p1 * q1, p1 + q1]) + '$ ⇒ $x=' + p1 + ',' + q1 + '$. Al mig la recta és a dalt.', '$\\int_{' + p1 + '}^{' + q1 + '}(' + M.polyTex([-p1 * q1, p1 + q1, -1]) + ')dx=\\dfrac{(' + q1 + '-' + T(p1) + ')^3}{6}=' + T(v) + '$.'];
      } else if (t === 1) {
        const k = r.int(1, 4); f = String(k * k); g = 'x^2'; a = -k; b = k; v = 4 * k * k * k / 3;
        tex = 'y=x^2\\ \\text{ i }\\ y=' + k * k;
        st = ['Talls: $x^2=' + k * k + '$ ⇒ $x=\\pm' + k + '$.', '$\\int_{-' + k + '}^{' + k + '}(' + k * k + '-x^2)dx=2\\left[' + k * k + 'x-\\frac{x^3}3\\right]_0^{' + k + '}=' + T(v) + '$.'];
      } else if (t === 2) {
        const s = r.pick([1, 2, 3]), A = s * s; f = 'x^3'; g = A + '*x'; a = -s; b = s; v = A * A / 2;
        tex = 'y=x^3\\ \\text{ i }\\ y=' + A + 'x';
        st = ['Talls: $x^3=' + A + 'x$ ⇒ $x=0,\\pm' + s + '$. Hi ha simetria senar: àrea total $=2\\int_0^{' + s + '}(' + A + 'x-x^3)dx$.', '$=2\\left[\\frac{' + A + 'x^2}2-\\frac{x^4}4\\right]_0^{' + s + '}=2\\left(\\frac{' + A * A + '}{2}-\\frac{' + A * A + '}{4}\\right)=' + T(v) + '$.'];
      } else if (t === 3) {
        f = 'sqrt(x)'; g = 'x^2'; a = 0; b = 1; v = 1 / 3; tex = 'y=\\sqrt x\\ \\text{ i }\\ y=x^2';
        st = ['Talls: $\\sqrt x=x^2$ ⇒ $x=0,1$. A $(0,1)$, $\\sqrt x\\ge x^2$.', '$\\int_0^1(\\sqrt x-x^2)dx=\\frac23-\\frac13=\\frac13$.'];
      } else if (t === 4) {
        const k = r.int(1, 2); f = 'e^x'; g = 'e^(-x)'; a = 0; b = k; v = Math.exp(k) + Math.exp(-k) - 2; ansTex = 'e^{' + k + '}+e^{-' + k + '}-2';
        tex = 'y=e^x,\\ y=e^{-x}\\ \\text{ i }\\ x=' + k;
        st = ['Tallen en $x=0$; per a $x>0$, $e^x>e^{-x}$.', '$\\int_0^{' + k + '}(e^x-e^{-x})dx=[e^x+e^{-x}]_0^{' + k + '}=e^{' + k + '}+e^{-' + k + '}-2\\approx' + M.round(v, 4) + '$.'];
      } else {
        f = 'x'; g = 'x^2'; a = 0; b = 1; v = 1 / 6; tex = 'y=x\\ \\text{ i }\\ y=x^2';
        st = ['Talls: $x=x^2$ ⇒ $x=0,1$. A $(0,1)$, $x\\ge x^2$.', '$\\int_0^1(x-x^2)dx=\\frac12-\\frac13=\\frac16$.'];
      }
      const p = P.num('Calcula l\'àrea de la regió tancada entre les corbes $' + tex + '$.', v, st, { ansTex: ansTex || T(v), tol: 2e-4 });
      const fa = M.compile(f), ga = M.compile(g);
      p.check = () => Math.abs(M.simpson(x => Math.abs(fa(x) - ga(x)), a, b, 6000) - v) < 1e-5 * Math.max(1, v);
      p.plot = { fns: [{ f: f, label: 'f' }, { f: g, label: 'g' }], xr: [a - 0.7 * (b - a) - 0.2, b + 0.7 * (b - a) + 0.2], shade: { top: f, bottom: g, a, b } };
      return p;
    }
  });

  gens.push({
    id: 'area_axis', title: 'Àrea entre f i l\'eix x', level: 2,
    make(r) {
      const [p, q] = H.sortNum(H.distinct(r, 2, 1, 5));
      const c = M.polyMul([0, 1], M.polyMul([-p, 1], [-q, 1])); // x(x-p)(x-q)
      const F = x => M.polyEval([0, c[0], c[1] / 2, c[2] / 3, c[3] / 4], x);
      const A1 = Math.abs(F(p) - F(0)), A2 = Math.abs(F(q) - F(p)), A = A1 + A2;
      const prob = P.num('Calcula l\'àrea tancada per la gràfica de $f(x)=' + M.polyTex(c) + '$ i l\'eix d\'abscisses (entre $x=0$ i $x=' + q + '$).', A,
        ['Arrels: $x=0,' + p + ',' + q + '$. $f$ canvia de signe en $x=' + p + '$: cal separar.', '$\\int_0^{' + p + '}f=' + T(F(p) - F(0)) + '$ i $\\int_{' + p + '}^{' + q + '}f=' + T(F(q) - F(p)) + '$.', 'Àrea $=|' + T(F(p) - F(0)) + '|+|' + T(F(q) - F(p)) + '|=' + T(A) + '$.'], { plot: { fns: [{ f: M.polyStr(c), label: 'f' }], xr: [-0.5, q + 0.8], shade: { top: M.polyStr(c), bottom: '0', a: 0, b: q } } });
      prob.check = () => Math.abs(M.simpson(x => Math.abs(M.polyEval(c, x)), 0, q, 6000) - A) < 1e-5 * A;
      return prob;
    }
  });

  gens.push({
    id: 'volume', title: 'Volums de revolució', level: 3,
    make(r) {
      const b = r.int(1, 3);
      const pool = [
        () => ({ q: 'la regió limitada per $y=\\sqrt{x}$, $y=0$ i $x=' + b + '$ al voltant de l\'eix $X$', f: x => x, a: 0, b, v: b * b / 2, tex: T(b * b / 2), st: ['$V=\\pi\\int_0^{' + b + '}(\\sqrt x)^2dx=\\pi\\int_0^{' + b + '}x\\,dx=\\pi\\frac{' + b * b + '}{2}$.'] }),
        () => ({ q: 'la regió limitada per $y=x^2$, $y=0$ i $x=' + b + '$ al voltant de l\'eix $X$', f: x => x * x * x * x, a: 0, b, v: Math.pow(b, 5) / 5, tex: T(Math.pow(b, 5) / 5), st: ['$V=\\pi\\int_0^{' + b + '}x^4dx=\\pi\\frac{' + Math.pow(b, 5) + '}{5}$.'] }),
        () => ({ q: 'la regió limitada per $y=\\sin x$ i $y=0$ entre $x=0$ i $x=\\pi$ al voltant de l\'eix $X$', f: x => Math.sin(x) ** 2, a: 0, b: Math.PI, v: Math.PI / 2, tex: '\\frac\\pi2', st: ['$V=\\pi\\int_0^\\pi\\sin^2x\\,dx=\\pi\\left[\\frac x2-\\frac{\\sin2x}4\\right]_0^\\pi=\\pi\\cdot\\frac\\pi2$.'] }),
        () => ({ q: 'la regió limitada per $y=e^x$, $y=0$, $x=0$ i $x=1$ al voltant de l\'eix $X$', f: x => Math.exp(2 * x), a: 0, b: 1, v: (Math.exp(2) - 1) / 2, tex: '\\frac{e^2-1}{2}', st: ['$V=\\pi\\int_0^1e^{2x}dx=\\pi\\frac{e^2-1}{2}$.'] }),
        () => ({ q: 'la regió limitada per $y=\\frac1x$, $y=0$, $x=1$ i $x=' + (b + 1) + '$ al voltant de l\'eix $X$', f: x => 1 / (x * x), a: 1, b: b + 1, v: 1 - 1 / (b + 1), tex: T(1 - 1 / (b + 1)), st: ['$V=\\pi\\int_1^{' + (b + 1) + '}x^{-2}dx=\\pi\\left[-\\frac1x\\right]_1^{' + (b + 1) + '}=\\pi\\left(1-\\frac1{' + (b + 1) + '}\\right)$.'] }),
        () => ({ q: 'la regió entre $y=x$ i $y=x^2$ (de $x=0$ a $x=1$) al voltant de l\'eix $X$', f: x => x * x - x * x * x * x, a: 0, b: 1, v: 2 / 15, tex: '\\frac{2}{15}', st: ['Rentadores: $V=\\pi\\int_0^1(x^2-x^4)dx=\\pi\\left(\\frac13-\\frac15\\right)=\\frac{2\\pi}{15}$.'] }),
        () => ({ q: 'la regió limitada per $y=x^2$, $y=0$ i $x=' + b + '$ al voltant de l\'eix $Y$ (capes cilíndriques)', f: x => x * x * x, a: 0, b, v: 2 * Math.pow(b, 4) / 4, tex: T(Math.pow(b, 4) / 2), st: ['$V=2\\pi\\int_0^{' + b + '}x\\cdot x^2dx=2\\pi\\frac{' + Math.pow(b, 4) + '}{4}=\\pi\\cdot' + T(Math.pow(b, 4) / 2) + '$.'] })
      ];
      const t = pool[r.int(0, pool.length - 1)]();
      const mult = t.q.includes('eix $Y$') ? 2 : 1;
      const p = P.num('Calcula el volum del cos de revolució generat per ' + t.q + '. Dona <b>$V/\\pi$</b> (el volum dividit per $\\pi$).', t.v, t.st, { ansTex: t.tex, tol: 2e-4 });
      p.check = () => Math.abs(M.simpson(t.f, t.a, t.b, 4000) * mult - t.v) < 1e-5 * Math.max(1, t.v);
      return p;
    }
  });

  gens.push({
    id: 'mean', title: 'Valor mitjà i simetries', level: 1,
    make(r) {
      const t = r.int(0, 2);
      if (t === 0) {
        const b = r.int(2, 5);
        return P.num('Calcula el valor mitjà de $f(x)=x^2$ a l\'interval $[0,' + b + ']$.', b * b / 3, ['$\\bar f=\\frac1{' + b + '}\\int_0^{' + b + '}x^2dx=\\frac1{' + b + '}\\cdot\\frac{' + b * b * b + '}{3}=' + T(b * b / 3) + '$.']);
      }
      if (t === 1) {
        const k = r.int(2, 6);
        return P.num('Calcula $\\displaystyle\\int_{-' + k + '}^{' + k + '}\\left(x^3\\cos x+x\\right)dx$.', 0, ['L\'integrand $x^3\\cos x+x$ és una funció <b>senar</b> i l\'interval és simètric ⇒ la integral val $0$.']);
      }
      const k = r.int(2, 5), val = r.int(2, 9);
      return P.num('Sabem que $\\displaystyle\\int_0^{' + k + '}f(x)\\,dx=' + val * 2 + '$. Calcula $\\displaystyle\\int_0^{' + k / 2 + '}f(2x)\\,dx$.'.replace(k / 2 + '', T(k / 2)), val,
        ['Canvi $u=2x$, $du=2\\,dx$; límits: $x=0\\to u=0$, $x=' + T(k / 2) + '\\to u=' + k + '$.', '$\\int_0^{' + T(k / 2) + '}f(2x)dx=\\frac12\\int_0^{' + k + '}f(u)du=\\frac{' + val * 2 + '}2=' + val + '$.']);
    }
  });


  /* ---- Sumes de Riemann ---- */
  gens.push({
    id: 'riemann', title: 'Suma de Riemann (rectangles)', level: 1,
    make(r) {
      const fs = [['x^2', 'x^2', x => x * x], ['2x+1', '2x+1', x => 2 * x + 1], ['x^3', 'x^3', x => x * x * x], ['4-x^2', '4-x^2', x => 4 - x * x]];
      const [, ftex, f] = fs[r.int(0, fs.length - 1)];
      const b = r.int(1, 2) * 2, n = 4, h = b / n, side = r.pick(['esquerra', 'dreta', 'mig']);
      const xs = []; for (let i = 0; i < n; i++) xs.push(side === 'esquerra' ? i * h : side === 'dreta' ? (i + 1) * h : (i + 0.5) * h);
      const v = h * xs.reduce((a, x) => a + f(x), 0);
      return P.num('Aproxima $\\displaystyle\\int_0^{' + b + '}' + ftex + '\\,dx$ amb una suma de Riemann de $n=4$ rectangles, prenent el punt <b>' + (side === 'mig' ? 'del mig' : 'de la ' + side) + '</b> de cada tros.', v,
        ['Amplada: $h=\\frac{' + b + '-0}{4}=' + T(h) + '$.', 'Punts: $' + xs.map(T).join(',\;') + '$.', 'Valors: $' + xs.map(x => 'f(' + T(x) + ')=' + T(f(x))).join(',\;') + '$.', '$S_4=' + T(h) + '\\cdot(' + xs.map(x => T(f(x))).join('+') + ')=' + T(v) + '$.'], { tol: 1e-4 });
    }
  });

  /* ---- Integració numèrica ---- */
  const NUMF = [
    ['1/x', '\\frac1x', 1, 2, Math.log(2), '\\ln2'], ['e^(-x^2)', 'e^{-x^2}', 0, 1, null], ['1/(1+x^2)', '\\frac1{1+x^2}', 0, 1, Math.PI / 4, '\\frac\\pi4'],
    ['sqrt(1+x^3)', '\\sqrt{1+x^3}', 0, 2, null], ['ln(x)', '\\ln x', 1, 3, 3 * Math.log(3) - 2, '3\\ln3-2'], ['sin(x)/x', '\\frac{\\sin x}{x}', 1, 2, null]
  ];
  function numInt(r, simpson) {
    const [fs, ftex, a, b, exact, exTex] = NUMF[r.int(0, NUMF.length - 1)];
    const n = r.pick([2, 4]), h = (b - a) / n, f = M.compile(fs);
    const xs = [], ys = [], w = [];
    for (let i = 0; i <= n; i++) { xs.push(a + i * h); ys.push(f(a + i * h)); w.push(i === 0 || i === n ? 1 : simpson ? (i % 2 ? 4 : 2) : 2); }
    const S = ys.reduce((s, y, i) => s + w[i] * y, 0) * (simpson ? h / 3 : h / 2);
    const st = ['$h=\\frac{' + T(b) + '-' + T(a) + '}{' + n + '}=' + T(h) + '$, punts $x_i=' + xs.map(T).join(',\;') + '$.',
      '<table class="tbl"><tr><th>$x_i$</th>' + xs.map(x => '<td>$' + T(x) + '$</td>').join('') + '</tr><tr><th>$f(x_i)$</th>' + ys.map(y => '<td>$' + M.round(y, 5) + '$</td>').join('') + '</tr><tr><th>pes</th>' + w.map(k => '<td>$' + k + '$</td>').join('') + '</tr></table>',
      '$' + (simpson ? 'S' : 'T') + '_' + n + '=\\frac{' + T(h) + '}{' + (simpson ? 3 : 2) + '}\\left(' + ys.map((y, i) => (w[i] > 1 ? w[i] + '\\cdot' : '') + M.round(y, 4)).join('+') + '\\right)\\approx' + M.round(S, 5) + '$.'];
    if (exact != null) st.push('Valor exacte: $' + exTex + '\\approx' + M.round(exact, 5) + '$; error $\\approx' + M.round(Math.abs(S - exact), 5) + '$.');
    else st.push('Aquesta funció no té primitiva elemental: per això cal un mètode numèric.');
    return P.num('Aproxima $\\displaystyle\\int_{' + T(a) + '}^{' + T(b) + '}' + ftex + '\\,dx$ amb ' + (simpson ? 'la regla de <b>Simpson</b>' : 'la regla dels <b>trapezis</b>') + ' amb $n=' + n + '$. Dona el resultat amb 4 decimals.', S, st, { tol: 3e-4, ansTex: String(M.round(S, 4)) });
  }
  gens.push({ id: 'trapez', title: 'Integració numèrica: trapezis', level: 1, make(r) { return numInt(r, false); } });
  gens.push({ id: 'simpson', title: 'Integració numèrica: Simpson', level: 2, make(r) { return numInt(r, true); } });

  /* ---- Longitud d'arc i àrea de revolució ---- */
  gens.push({
    id: 'arclen', title: 'Longitud d\'una corba', level: 2,
    make(r) {
      const b = r.int(1, 3) * (r.int(0, 1) ? 1 : 2);
      const pool = [
        () => ({ f: '\\frac23x^{3/2}', a: 0, b, v: 2 / 3 * (Math.pow(1 + b, 1.5) - 1), st: ['$f\'(x)=\\sqrt x$ ⇒ $\\sqrt{1+f\'^2}=\\sqrt{1+x}$.', '$L=\\int_0^{' + b + '}\\sqrt{1+x}\\,dx=\\frac23\\left[(1+x)^{3/2}\\right]_0^{' + b + '}=\\frac23\\left(' + (1 + b) + '^{3/2}-1\\right)$.'] }),
        () => ({ f: 'x^{3/2}', a: 0, b, v: 8 / 27 * (Math.pow(1 + 9 * b / 4, 1.5) - 1), st: ['$f\'(x)=\\frac32\\sqrt x$ ⇒ $\\sqrt{1+\\frac94x}$.', '$L=\\int_0^{' + b + '}\\sqrt{1+\\frac94x}\\,dx=\\frac{8}{27}\\left[\\left(1+\\frac94x\\right)^{3/2}\\right]_0^{' + b + '}$.'] }),
        () => ({ f: '\\frac{x^3}{6}+\\frac{1}{2x}', a: 1, b: 2, v: 17 / 12, st: ['$f\'(x)=\\frac{x^2}2-\\frac1{2x^2}$ ⇒ $1+f\'^2=\\left(\\frac{x^2}2+\\frac1{2x^2}\\right)^2$ (quadrat perfecte!).', '$L=\\int_1^2\\left(\\frac{x^2}2+\\frac1{2x^2}\\right)dx=\\left[\\frac{x^3}6-\\frac1{2x}\\right]_1^2=\\frac{17}{12}$.'] }),
        () => ({ f: '\\ln(\\cos x)', a: 0, b: Math.PI / 4, bTex: '\\frac\\pi4', v: Math.log(1 + Math.SQRT2), st: ['$f\'(x)=-\\tan x$ ⇒ $\\sqrt{1+\\tan^2x}=\\sec x$.', '$L=\\int_0^{\\pi/4}\\sec x\\,dx=\\left[\\ln|\\sec x+\\tan x|\\right]_0^{\\pi/4}=\\ln(1+\\sqrt2)$.'] })
      ];
      const t = pool[r.int(0, pool.length - 1)]();
      return P.num('Calcula la longitud de la corba $y=' + t.f + '$ entre $x=' + T(t.a) + '$ i $x=' + (t.bTex || T(t.b)) + '$.', t.v, ['Fórmula: $L=\\int_a^b\\sqrt{1+f\'(x)^2}\\,dx$.'].concat(t.st, ['$L\\approx' + M.round(t.v, 4) + '$.']), { tol: 2e-4 });
    }
  });
  gens.push({
    id: 'surface', title: 'Àrea d\'una superfície de revolució', level: 3,
    make(r) {
      const b = r.int(1, 4);
      const pool = [
        () => ({ f: 'x', v: Math.SQRT2 * b * b, tex: '\\sqrt2\\cdot' + b * b, st: ['$f\'=1$ ⇒ $\\sqrt{1+f\'^2}=\\sqrt2$.', '$S=2\\pi\\int_0^{' + b + '}x\\sqrt2\\,dx=2\\pi\\sqrt2\\frac{' + b * b + '}{2}=\\pi\\sqrt2\\cdot' + b * b + '$ (és un con).'] }),
        () => ({ f: '\\sqrt x', v: 4 / 3 * (Math.pow(b + 0.25, 1.5) - 0.125), st: ['$f\'=\\frac1{2\\sqrt x}$ ⇒ $f\\sqrt{1+f\'^2}=\\sqrt x\\sqrt{1+\\frac1{4x}}=\\sqrt{x+\\frac14}$.', '$S=2\\pi\\int_0^{' + b + '}\\sqrt{x+\\tfrac14}\\,dx=2\\pi\\cdot\\frac23\\left[\\left(x+\\tfrac14\\right)^{3/2}\\right]_0^{' + b + '}$.'] }),
        () => ({ f: 'x^3', b1: 1, v: (10 * Math.sqrt(10) - 1) / 27, tex: '\\frac{10\\sqrt{10}-1}{27}', st: ['$f\'=3x^2$ ⇒ $S=2\\pi\\int_0^1x^3\\sqrt{1+9x^4}\\,dx$.', 'Canvi $u=1+9x^4$, $du=36x^3dx$: $S=\\frac{2\\pi}{36}\\int_1^{10}\\sqrt u\\,du=\\frac{\\pi}{27}\\left(10\\sqrt{10}-1\\right)$.'] })
      ];
      const t = pool[r.int(0, pool.length - 1)](), B = t.b1 || b;
      return P.num('Calcula l\'àrea de la superfície que s\'obté en girar $y=' + t.f + '$, $x\\in[0,' + B + ']$, al voltant de l\'eix $X$. Dona <b>$S/\\pi$</b>.', t.v, ['Fórmula: $S=2\\pi\\int_a^bf(x)\\sqrt{1+f\'(x)^2}\\,dx$.'].concat(t.st, ['$S/\\pi\\approx' + M.round(t.v, 4) + '$.']), { tol: 2e-4, ansTex: t.tex || T(t.v) });
    }
  });

  Calc.add({
    id: 'l9', num: '9', llista: 'Llista 9', title: 'Integral definida, TFC i aplicacions',
    short: 'Sumes de Riemann, Barrow i TFC, àrees, volums, longituds, àrees de revolució i integració numèrica (trapezis i Simpson).',
    desc: 'Aplicacions geomètriques de la integral. Surt a l\'examen final (Leibniz i àrea).',
    theory, gens,
    bank: [
      { q: '$\\dfrac{d}{dx}\\displaystyle\\int_0^{x^2}\\sqrt{1+t^4}\\,dt=$', c: ['$\\sqrt{1+x^4}$', '$2x\\sqrt{1+x^8}$', '$\\sqrt{1+x^8}$', '$\\frac{x^2}{2}\\sqrt{1+x^4}$'], a: 1, e: 'Leibniz: $f(g)g\'$.' },
      { q: 'L\'àrea entre $f$ i l\'eix $x$ és…', c: ['$\\int_a^bf$', '$\\int_a^b|f|$', '$\\left|\\int_a^bf\\right|$', '$F(b)+F(a)$'], a: 1, e: 'Cal el valor absolut (parteix pels canvis de signe).' },
      { q: '$\\displaystyle\\int_{-2}^{2}x^5\\,dx=$', c: ['$0$', '$64/3$', '$32$', '$2\\cdot\\frac{32}{6}$'], a: 0, e: 'Funció senar en interval simètric.' },
      { q: 'El volum de revolució al voltant de l\'eix $X$ d\'$y=f(x)$, $x\\in[a,b]$ és…', c: ['$\\pi\\int f$', '$\\pi\\int f^2$', '$2\\pi\\int xf$', '$\\int\\pi f$'], a: 1, e: 'Discos de radi $f(x)$.' },
      { q: 'Si $G(x)=\\int_a^xf(t)dt$, $G\'(x)=$', c: ['$f(a)$', '$f(x)$', '$F(x)-F(a)$', '$f\'(x)$'], a: 1, e: 'TFC.' },
      { q: 'La regla de Simpson amb $n=4$ fa servir els pesos…', c: ['$1,2,2,2,1$', '$1,4,2,4,1$', '$1,4,4,4,1$', '$1,3,3,1$'], a: 1, e: 'Simpson: $1,4,2,4,\\dots,4,1$ (multiplicat per $h/3$). Trapezis: $1,2,\\dots,2,1$ (per $h/2$).' },
      { q: 'La longitud de $y=f(x)$ entre $a$ i $b$ és…', c: ['$\\int_a^b f$', '$\\int_a^b\\sqrt{1+f\'^2}$', '$\\int_a^b(1+f\'^2)$', '$\\pi\\int_a^b f^2$'], a: 1, e: 'Cada tros de corba mesura $\\sqrt{dx^2+dy^2}=\\sqrt{1+f\'^2}dx$.' },
      { q: 'Si dobles $n$ a la regla dels trapezis, l\'error aproximadament…', c: ['es divideix per 2', 'es divideix per 4', 'es divideix per 16', 'no canvia'], a: 1, e: 'L\'error de trapezis va amb $h^2$: $h/2$ ⇒ error $/4$. Simpson va amb $h^4$ ⇒ $/16$.' },
      { q: '$\\int_a^bf=$', c: ['$F(a)-F(b)$', '$F(b)-F(a)$', '$F(b)+F(a)$', '$f(b)-f(a)$'], a: 1, e: 'Regla de Barrow.' },
      { q: 'Quan es fa un canvi de variable en una integral definida…', c: ['els límits no canvien', 'cal canviar també els límits', 'es treuen els límits', 'només canvia el límit superior'], a: 1, e: 'O bé desfés el canvi abans d\'avaluar.' }
    ]
  });
})();
