/* Llista 0 — Funcions: domini, composició, inversa, simetries, transformacions */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;

  const theory = `
<h3>Domini d'una funció</h3>
<p>El <b>domini</b> és el conjunt de $x$ per als quals $f(x)$ té sentit (dona un nombre real). Només has de vigilar <b>tres perills</b>:</p>
<div class="box formula">
<b>1.</b> Denominador $\\neq 0$: $\\dfrac{1}{g(x)}$ ⇒ $g(x)\\neq0$.<br>
<b>2.</b> Arrel d'índex parell: $\\sqrt{g(x)}$ ⇒ $g(x)\\ge0$. (Arrel cúbica: cap restricció.)<br>
<b>3.</b> Logaritme: $\\ln g(x)$ ⇒ $g(x)>0$ (estricte!).
</div>
<p>Si hi ha diversos perills, el domini és la <b>intersecció</b> de totes les condicions.</p>
<div class="box ex"><b>Exemple.</b> $f(x)=\\sqrt{x(x-1)}$. Cal $x^2-x\\ge0$. Arrels $0$ i $1$; parabòla oberta cap amunt ⇒ positiva fora de les arrels. $\\text{Dom}=(-\\infty,0]\\cup[1,+\\infty)$.</div>

<h3>Composició i inversa</h3>
<ul>
<li>$(f\\circ g)(x)=f(g(x))$: primer s'aplica $g$ i després $f$. En general $f\\circ g\\ne g\\circ f$.</li>
<li>Inversa $f^{-1}$: escriu $y=f(x)$, <b>aïlla $x$</b>, i intercanvia els noms $x\\leftrightarrow y$. Només existeix si $f$ és injectiva. La gràfica de $f^{-1}$ és la simètrica respecte de $y=x$.</li>
<li>Parelles clàssiques: $e^x\\leftrightarrow\\ln x$, $x^2\\ (x\\ge0)\\leftrightarrow\\sqrt x$, $x^3\\leftrightarrow\\sqrt[3]{x}$.</li>
</ul>

<h3>Simetries</h3>
<ul>
<li><b>Parell</b>: $f(-x)=f(x)$ (simètrica respecte l'eix $y$). Ex: $x^2$, $\\cos x$, $|x|$.</li>
<li><b>Senar</b>: $f(-x)=-f(x)$ (simètrica respecte l'origen). Ex: $x^3$, $\\sin x$, $\\tan x$.</li>
<li>Producte: parell·parell = parell, senar·senar = parell, parell·senar = senar.</li>
</ul>

<h3>Transformacions de gràfiques</h3>
<table class="tbl">
<tr><td>$f(x-h)$</td><td>trasllada $h$ a la <b>dreta</b></td></tr>
<tr><td>$f(x)+k$</td><td>trasllada $k$ <b>amunt</b></td></tr>
<tr><td>$-f(x)$</td><td>reflexió respecte de l'eix $x$</td></tr>
<tr><td>$f(-x)$</td><td>reflexió respecte de l'eix $y$</td></tr>
<tr><td>$a\\,f(x)$</td><td>estira verticalment (factor $a$)</td></tr>
<tr><td>$f(bx)$</td><td>comprimeix horitzontalment (factor $1/b$)</td></tr>
<tr><td>$|f(x)|$</td><td>la part negativa es reflecteix cap amunt</td></tr>
</table>
<div class="box warn">Atenció: $f(x-3)$ mou a la <b>dreta</b> (signe contrari al que sembla).</div>
<p>Parabòla $y=a(x-h)^2+k$: vèrtex $(h,k)$, oberta cap amunt si $a>0$.</p>
`;

  const gens = [];

  /* Domini */
  gens.push({
    id: 'domain', title: 'Domini d\'una funció', level: 1,
    make(r) {
      const t = r.int(0, 4);
      const [p, q] = H.sortNum(H.distinct(r, 2, -6, 6));
      const U = '\\cup', I = H.INF, N = H.NINF;
      const poly = (a) => M.polyTex(M.polyMul([-p, 1], [-q, 1]).map(v => v * a));
      let f, ok, wr, sol;
      if (t === 0) {
        f = '\\sqrt{' + poly(1) + '}';
        ok = `$(${N},${p}]${U}[${q},${I})$`;
        wr = [`$[${p},${q}]$`, `$(${N},${p})${U}(${q},${I})$`, `$\\mathbb{R}$`];
        sol = ['Cal $' + poly(1) + '\\ge0$. Arrels $' + p + '$ i $' + q + '$.', 'Parabòla oberta cap amunt ⇒ $\\ge0$ fora de les arrels (arrels incloses, perquè $\\sqrt0$ existeix).'];
      } else if (t === 1) {
        f = '\\sqrt{' + poly(-1) + '}';
        ok = `$[${p},${q}]$`;
        wr = [`$(${N},${p}]${U}[${q},${I})$`, `$(${p},${q})$`, `$\\mathbb{R}$`];
        sol = ['Cal $' + poly(-1) + '\\ge0$ ⇔ $' + poly(1) + '\\le0$.', 'Parabòla oberta cap avall ⇒ $\\ge0$ entre les arrels, incloent-les.'];
      } else if (t === 2) {
        f = '\\dfrac{1}{' + poly(1) + '}';
        ok = `$\\mathbb{R}\\setminus\\{${p},${q}\\}$`;
        wr = [`$(${p},${q})$`, `$\\mathbb{R}\\setminus\\{${-p},${-q}\\}$`, `$\\mathbb{R}$`];
        sol = ['El denominador no pot ser $0$: $' + poly(1) + '=0$ ⇔ $x=' + p + '$ o $x=' + q + '$.'];
      } else if (t === 3) {
        f = '\\ln(' + H.xm(p) + ')';
        ok = `$(${p},${I})$`;
        wr = [`$[${p},${I})$`, `$(${N},${p})$`, `$(${N},${p}]$`];
        sol = ['Cal $' + H.xm(p) + '>0$ (estricte!) ⇒ $x>' + p + '$.'];
      } else {
        const c = q + r.int(1, 3);
        f = '\\dfrac{\\sqrt{' + H.xm(p) + '}}{' + H.xm(c) + '}';
        ok = `$[${p},${I})\\setminus\\{${c}\\}$`;
        wr = [`$[${p},${I})$`, `$(${p},${I})\\setminus\\{${c}\\}$`, `$\\mathbb{R}\\setminus\\{${c}\\}$`];
        sol = ['Arrel: $' + H.xm(p) + '\\ge0$ ⇒ $x\\ge' + p + '$.', 'Denominador: $x\\ne' + c + '$, i $' + c + '>' + p + '$ és dins l\'interval, per tant s\'ha d\'excloure.'];
      }
      return P.mc(r, 'Quin és el domini de $f(x)=' + f + '$?', ok, wr, sol);
    }
  });

  /* Composició */
  const FP = ['x^2+1', '2x-3', 'sqrt(x)', '1/x', 'e^x', 'ln(x)', 'sin(x)', '3x+1'];
  const GP = ['x+1', '2x', 'x^2+1', '3x+2', 'sqrt(x)'];
  gens.push({
    id: 'compose', title: 'Composició de funcions', level: 1,
    make(r) {
      const f = r.pick(FP);
      let g = r.pick(GP);
      if (g === f) g = 'x+1';
      const comp = M.compose(f.replace(/x/g, 't'), 't', g);
      const compS = M.toStr(comp);
      if (r.int(0, 1)) {
        const p = P.fn('Siguin $f(x)=' + M.tex(f) + '$ i $g(x)=' + M.tex(g) + '$. Calcula $(f\\circ g)(x)$.', compS,
          ['$(f\\circ g)(x)=f(g(x))$: substitueix $x$ a $f$ per $g(x)=' + M.tex(g) + '$.', '$(f\\circ g)(x)=' + M.toTex(M.simplify(comp)) + '$.']);
        p.check = () => true;
        return p;
      }
      const a = r.int(1, 4);
      const gv = M.compile(g)(a), fv = M.compile(f)(gv);
      const ans = M.compile(compS)(a);
      if (!isFinite(ans) || Math.abs(ans) > 500) return null;
      return P.num('Siguin $f(x)=' + M.tex(f) + '$ i $g(x)=' + M.tex(g) + '$. Calcula $(f\\circ g)(' + a + ')$ (pots deixar $e$, $\\sqrt{\\ }$…).', ans,
        ['Primer $g(' + a + ')=' + T(gv) + '$.', 'Després $f(g(' + a + '))=f(' + T(gv) + ')=' + T(ans) + '$.'], { tol: 1e-6 });
    }
  });

  /* Inversa */
  gens.push({
    id: 'inverse', title: 'Funció inversa', level: 2,
    make(r) {
      const a = r.int(2, 5), b = r.nz(-5, 5);
      const k = r.int(0, 4);
      let f, inv, steps;
      if (k === 0) { f = a + 'x' + (b > 0 ? '+' + b : b); inv = '(x-(' + b + '))/' + a; steps = ['$y=' + a + 'x' + H.sg(b) + '$ ⇒ $x=\\dfrac{y' + H.sg(-b) + '}{' + a + '}$.']; }
      else if (k === 1) { f = 'x^3' + (b > 0 ? '+' + b : b); inv = 'cbrt(x-(' + b + '))'; steps = ['$y=x^3' + H.sg(b) + '$ ⇒ $x=\\sqrt[3]{y' + H.sg(-b) + '}$.']; }
      else if (k === 2) { f = 'e^x' + (b > 0 ? '+' + b : b); inv = 'ln(x-(' + b + '))'; steps = ['$y=e^x' + H.sg(b) + '$ ⇒ $e^x=y' + H.sg(-b) + '$ ⇒ $x=\\ln(y' + H.sg(-b) + ')$.']; }
      else if (k === 3) { f = 'ln(x)' + (b > 0 ? '+' + b : b); inv = 'e^(x-(' + b + '))'; steps = ['$y=\\ln x' + H.sg(b) + '$ ⇒ $\\ln x=y' + H.sg(-b) + '$ ⇒ $x=e^{y' + H.sg(-b) + '}$.']; }
      else { f = '1/(x' + (b > 0 ? '+' + b : b) + ')'; inv = '1/x-(' + b + ')'; steps = ['$y=\\dfrac1{x' + H.sg(b) + '}$ ⇒ $x' + H.sg(b) + '=\\dfrac1y$ ⇒ $x=\\dfrac1y' + H.sg(-b) + '$.']; }
      steps.push('Intercanviant els noms: $f^{-1}(x)=' + M.tex(inv) + '$.');
      return P.fn('Calcula la funció inversa de $f(x)=' + M.tex(f) + '$ (escriu-la en la variable $x$).', inv, steps, { range: [Math.max(0.5, b > 0 ? b + 0.5 : 0.5), 3] });
    }
  });

  /* Paritat */
  gens.push({
    id: 'parity', title: 'Funcions parelles i senars', level: 1,
    make(r) {
      const a = r.int(2, 5), b = r.int(1, 4);
      const pool = [
        ['x^3-' + a + 'x', 'senar'], ['x^2+cos(x)', 'parell'], ['x^2+' + a + 'x', 'cap'], ['x*sin(x)', 'parell'], ['e^x', 'cap'],
        ['x^3*cos(x)', 'senar'], ['abs(x)+' + b, 'parell'], ['e^x-e^(-x)', 'senar'], ['x^4-' + a + 'x^2+' + b, 'parell'], ['sin(x)+x^2', 'cap'], ['x/(x^2+' + b + ')', 'senar'], ['x^2*sin(x)', 'senar'], ['x^5+x^3+x', 'senar'], ['ln(x^2+' + b + ')', 'parell']
      ];
      const [f, k] = r.pick(pool);
      const lab = { parell: '$f$ és <b>parell</b>', senar: '$f$ és <b>senar</b>', cap: '$f$ <b>no és ni parell ni senar</b>' };
      const fc = M.compile(f);
      const x0 = 1.37;
      const fm = fc(-x0), fp = fc(x0);
      const ok = Math.abs(fm - fp) < 1e-9 ? 'parell' : (Math.abs(fm + fp) < 1e-9 ? 'senar' : 'cap');
      if (ok !== k) return null;
      return P.mc(r, 'Classifica la funció $f(x)=' + M.tex(f) + '$.', lab[k], Object.keys(lab).filter(z => z !== k).map(z => lab[z]),
        ['Calcula $f(-x)=' + M.tex(M.toStr(M.subst(M.parse(f), 'x', M.parse('(-x)')))) + '$ i compara amb $f(x)$.', 'Resultat: ' + lab[k] + '.']);
    }
  });

  /* Transformacions */
  gens.push({
    id: 'transform', title: 'Transformacions de gràfiques', level: 1,
    make(r) {
      if (r.int(0, 1)) {
        const a = r.pick([1, 2, -1, -2, 3]), h = r.nz(-4, 4), k = r.nz(-5, 5);
        const eq = (a === 1 ? '' : (a === -1 ? '-' : a)) + '(' + H.xm(h) + ')^2' + H.sg(k);
        return P.multi('Troba el <b>vèrtex</b> $(h,k)$ de la paràbola $y=' + eq + '$.', [{ label: '$h=$', ans: h }, { label: '$k=$', ans: k }],
          ['Forma $y=a(x-h)^2+k$: el vèrtex és $(h,k)=(' + h + ',' + k + ')$.', 'Compte: $(x' + H.sg(-h).trim() + ')$ correspon a $h=' + h + '$.']);
      }
      const h = r.nz(-4, 4), k = r.nz(-4, 4);
      const dir = h > 0 ? 'a la dreta' : 'a l\'esquerra', ver = k > 0 ? 'amunt' : 'avall';
      const ok = Math.abs(h) + ' unitats ' + dir + ' i ' + Math.abs(k) + ' ' + ver;
      const opts = [ok, Math.abs(h) + ' unitats ' + (h > 0 ? 'a l\'esquerra' : 'a la dreta') + ' i ' + Math.abs(k) + ' ' + ver, Math.abs(h) + ' unitats ' + dir + ' i ' + Math.abs(k) + ' ' + (k > 0 ? 'avall' : 'amunt'), Math.abs(h) + ' unitats ' + (h > 0 ? 'a l\'esquerra' : 'a la dreta') + ' i ' + Math.abs(k) + ' ' + (k > 0 ? 'avall' : 'amunt')];
      return P.mc(r, 'La gràfica de $y=f(x' + H.sg(-h).trim() + ')' + H.sg(k) + '$ s\'obté de la de $y=f(x)$ desplaçant-la…', opts[0], opts.slice(1),
        ['$f(x-h)$ mou $h$ cap a la dreta (si $h<0$, cap a l\'esquerra).', 'Aquí $h=' + h + '$ i $k=' + k + '$: ' + ok + '.']);
    }
  });

  Calc.add({
    id: 'l0', num: '0', llista: 'Llista 0', title: 'Funcions: domini, composició, inversa, transformacions',
    short: 'Domini, composició, inversa, simetries i transformacions de gràfiques.',
    desc: 'Repàs de funcions elementals: el que cal saber abans de límits i derivades.',
    theory, gens,
    bank: [
      { q: 'El domini de $\\ln(x^2-4)$ és…', c: ['$(-2,2)$', '$(-\\infty,-2)\\cup(2,+\\infty)$', '$[2,+\\infty)$', '$\\mathbb R\\setminus\\{2\\}$'], a: 1, e: '$x^2-4>0$ ⇒ fora de $[-2,2]$.' },
      { q: 'Si $f$ és senar i $g$ és senar, $f\\cdot g$ és…', c: ['senar', 'parell', 'ni l\'un ni l\'altre', 'depèn'], a: 1, e: '$(-)(-)=(+)$: $f(-x)g(-x)=f(x)g(x)$.' },
      { q: 'La gràfica de $f(x+2)$ és la de $f(x)$ desplaçada…', c: ['2 a la dreta', '2 a l\'esquerra', '2 amunt', '2 avall'], a: 1, e: '$x+2$: el valor es repeteix 2 unitats abans.' },
      { q: 'La inversa de $f(x)=e^{x}$ és…', c: ['$1/e^x$', '$\\ln x$', '$-e^x$', '$e^{-x}$'], a: 1, e: '$\\ln(e^x)=x$.' },
      { q: '$(f\\circ g)(x)$ significa…', c: ['$f(x)g(x)$', '$f(g(x))$', '$g(f(x))$', '$f(x)+g(x)$'], a: 1, e: 'Primer $g$, després $f$.' },
      { q: 'El domini de $\\sqrt[3]{x-5}$ és…', c: ['$[5,+\\infty)$', '$(5,+\\infty)$', '$\\mathbb R$', '$\\mathbb R\\setminus\\{5\\}$'], a: 2, e: 'Les arrels d\'índex senar existeixen per a tot real.' }
    ]
  });
})();
