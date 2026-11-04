/* Llista 3 — Monotonia, extrems, optimització, concavitat, extrems absoluts */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;

  const theory = `
<h3>Monotonia i extrems relatius (1r criteri)</h3>
<div class="box formula">
$f'>0$ en un interval ⇒ $f$ <b>creixent</b> &nbsp;|&nbsp; $f'<0$ ⇒ <b>decreixent</b>.<br>
<b>Punt crític:</b> $f'(c)=0$ o $f'(c)$ no existeix (però $c$ és al domini).
</div>
<p><b>Procediment (4 passos):</b></p>
<ol>
<li>Domini de $f$.</li>
<li>Calcula $f'$ i troba els punts crítics ($f'=0$).</li>
<li>Taula de signes de $f'$ als intervals que determinen els punts crítics (i els punts fora del domini).</li>
<li>Canvi de $+$ a $-$ ⇒ <b>màxim</b> local; de $-$ a $+$ ⇒ <b>mínim</b> local. Sense canvi ⇒ cap extrem.</li>
</ol>
<div class="box ex"><b>2n criteri:</b> si $f'(c)=0$: $f''(c)>0$ ⇒ mínim; $f''(c)<0$ ⇒ màxim; $f''(c)=0$ ⇒ no es pot concloure (usa el 1r criteri).</div>

<h3>Concavitat i punts d'inflexió</h3>
<p>$f''>0$ ⇒ <b>convexa</b> ("∪", cap amunt); $f''<0$ ⇒ <b>còncava</b> ("∩", cap avall). Un <b>punt d'inflexió</b> és on $f''$ canvia de signe (cal $f''(c)=0$ <i>i</i> canvi de signe: $x^4$ té $f''(0)=0$ però no és inflexió).</p>

<h3>Extrems absoluts en un interval tancat</h3>
<p><b>Weierstrass:</b> si $f$ és contínua en $[a,b]$, té màxim i mínim absoluts. Recepta: avalua $f$ als <b>extrems</b> $a$, $b$ i als <b>punts crítics</b> de dins l'interval; el més gran és el màxim, el més petit el mínim. En intervals oberts o infinits pot no haver-n'hi: mira límits.</p>

<h3>Optimització (problemes de "màxim/mínim")</h3>
<ol>
<li>Dibuixa i posa noms a les variables.</li>
<li>Escriu <b>la funció a optimitzar</b> (àrea, volum, cost…).</li>
<li>Usa la <b>restricció</b> per eliminar variables fins a tenir $f(x)$ d'una sola variable. Digues el domini de $x$.</li>
<li>Deriva, $f'=0$, comprova que és màxim/mínim (signe de $f'$ o $f''$) i mira també els extrems del domini.</li>
<li>Respon la pregunta amb <b>unitats</b> (no només l'$x$!).</li>
</ol>
<div class="box ex"><b>Exemple.</b> Rectangle de perímetre $20$ amb àrea màxima: $y=10-x$, $A(x)=x(10-x)$, $A'=10-2x=0$ ⇒ $x=5$ ⇒ és un quadrat, $A=25$ ($A''=-2<0$ ⇒ màxim).</div>
`;

  const gens = [];
  const cubic = (p, q, c) => [c, 6 * p * q, -3 * (p + q), 2]; // f' = 6(x-p)(x-q)

  gens.push({
    id: 'crit_cubic', title: 'Extrems relatius d\'un polinomi', level: 1,
    make(r) {
      const [p, q] = H.sortNum(H.distinct(r, 2, -4, 5));
      const c = r.int(-6, 6);
      const f = cubic(p, q, c);
      const fp = M.polyEval(f, p), fq = M.polyEval(f, q);
      const lo = p - 2, hi = q + 2;
      const prob = P.multi('Per a $f(x)=' + M.polyTex(f) + '$, troba l\'abscissa del <b>màxim</b> local i del <b>mínim</b> local.',
        [{ label: '$x_{\\max}=$', ans: p }, { label: '$x_{\\min}=$', ans: q }],
        ['$f\'(x)=' + M.polyTex(M.polyDer(f)) + '=6(' + H.xm(p) + ')(' + H.xm(q) + ')$ ⇒ punts crítics $x=' + p + '$ i $x=' + q + '$.',
          'Signe de $f\'$: $+$ a $(-\\infty,' + p + ')$, $-$ a $(' + p + ',' + q + ')$, $+$ a $(' + q + ',+\\infty)$.',
          'Canvi $+\\to-$ en $x=' + p + '$ ⇒ <b>màxim</b>, $f(' + p + ')=' + T(fp) + '$. Canvi $-\\to+$ en $x=' + q + '$ ⇒ <b>mínim</b>, $f(' + q + ')=' + T(fq) + '$.']);
      prob.solPlot = { fns: [{ f: M.polyStr(f), label: 'f' }], xr: [lo, hi], points: [[p, fp, 'màx'], [q, fq, 'mín']] };
      return prob;
    }
  });

  gens.push({
    id: 'monotony', title: 'Intervals de creixement', level: 1,
    make(r) {
      const [p, q] = H.sortNum(H.distinct(r, 2, -4, 5));
      const c = r.int(-6, 6), f = cubic(p, q, c);
      const U = '\\cup';
      const ok = `$(-\\infty,${p})${U}(${q},+\\infty)$`;
      const wr = [`$(${p},${q})$`, `$(-\\infty,${q})${U}(${p},+\\infty)$`, `$(${-q},${-p})$`, `$(${-p},${-q})${U}(-\\infty,${p})$`].filter(w => w !== ok);
      return P.mc(r, 'Per a $f(x)=' + M.polyTex(f) + '$, en quins intervals és <b>creixent</b>?', ok, wr.slice(0, 3),
        ['$f\'(x)=6(' + H.xm(p) + ')(' + H.xm(q) + ')$: parabòla oberta cap amunt, $>0$ fora de les arrels.', 'Creixent a $(-\\infty,' + p + ')$ i $(' + q + ',+\\infty)$; decreixent a $(' + p + ',' + q + ')$.']);
    }
  });

  gens.push({
    id: 'crit_rational', title: 'Extrem de x²+k/x', level: 2,
    make(r) {
      const m = r.int(1, 4), k = 2 * m * m * m;
      return P.multi('Troba el punt crític de $f(x)=x^2+\\dfrac{' + k + '}{x}$ amb $x>0$ i el valor de $f$ en aquest punt.',
        [{ label: '$x=$', ans: m }, { label: '$f(x)=$', ans: 3 * m * m }],
        ['$f\'(x)=2x-\\dfrac{' + k + '}{x^2}=0$ ⇒ $2x^3=' + k + '$ ⇒ $x^3=' + m * m * m + '$ ⇒ $x=' + m + '$.', '$f\'\'(x)=2+\\dfrac{' + 2 * k + '}{x^3}>0$ ⇒ <b>mínim</b>.', '$f(' + m + ')=' + m * m + '+' + k / m + '=' + 3 * m * m + '$.']);
    }
  });

  gens.push({
    id: 'crit_exp', title: 'Extrems amb e^x i ln x', level: 2,
    make(r) {
      const t = r.int(0, 3);
      if (t === 0) {
        const k = r.int(2, 6);
        return P.multi('Troba el punt crític de $f(x)=e^x-' + k + 'x$ i el valor de $f$ en ell. (Pots usar <code>ln</code>.)',
          [{ label: '$x=$', ans: Math.log(k), ansTex: '\\ln ' + k }, { label: '$f(x)=$', ans: k - k * Math.log(k), ansTex: k + '-' + k + '\\ln ' + k }],
          ['$f\'(x)=e^x-' + k + '=0$ ⇒ $x=\\ln ' + k + '$.', '$f\'\'=e^x>0$ ⇒ mínim. $f(\\ln' + k + ')=' + k + '-' + k + '\\ln' + k + '$.']);
      }
      if (t === 1) {
        const k = r.int(2, 4);
        return P.multi('Troba el punt crític de $f(x)=x-' + k + '\\ln x$ ($x>0$) i el valor de $f$ en ell. (Pots usar <code>ln</code>.)',
          [{ label: '$x=$', ans: k }, { label: '$f(x)=$', ans: k - k * Math.log(k), ansTex: k + '-' + k + '\\ln ' + k }],
          ['$f\'(x)=1-\\dfrac{' + k + '}{x}=0$ ⇒ $x=' + k + '$.', '$f\'\'=\\dfrac{' + k + '}{x^2}>0$ ⇒ mínim. $f(' + k + ')=' + k + '-' + k + '\\ln ' + k + '$.']);
      }
      if (t === 2) {
        return P.multi('Troba el punt crític de $f(x)=x\\ln x$ ($x>0$) i el valor de $f$ en ell. (Pots usar <code>e</code>.)',
          [{ label: '$x=$', ans: 1 / Math.E, ansTex: '\\frac1e' }, { label: '$f(x)=$', ans: -1 / Math.E, ansTex: '-\\frac1e' }],
          ['$f\'(x)=\\ln x+1=0$ ⇒ $x=e^{-1}$.', '$f\'\'=1/x>0$ ⇒ mínim. $f(1/e)=\\frac1e\\cdot(-1)=-\\frac1e$.']);
      }
      return P.multi('Troba el punt on $f(x)=x\\,e^{-x}$ té el seu màxim i el valor màxim. (Pots usar <code>e</code>.)',
        [{ label: '$x=$', ans: 1 }, { label: '$f(x)=$', ans: 1 / Math.E, ansTex: '\\frac1e' }],
        ['$f\'(x)=e^{-x}-xe^{-x}=e^{-x}(1-x)=0$ ⇒ $x=1$.', '$f\'>0$ si $x<1$, $f\'<0$ si $x>1$ ⇒ <b>màxim</b>, $f(1)=e^{-1}$.']);
    }
  });

  gens.push({
    id: 'optim_basic', title: 'Optimització: rectangles', level: 2,
    make(r) {
      const t = r.int(0, 2);
      if (t === 0) {
        const s = r.int(2, 9), per = 4 * s;
        return P.num('Entre tots els rectangles de perímetre $' + per + '$ m, quina és l\'àrea màxima (m²)?', s * s,
          ['Costats $x$ i $y=' + per / 2 + '-x$. Àrea $A(x)=x(' + per / 2 + '-x)$.', '$A\'=' + per / 2 + '-2x=0$ ⇒ $x=' + s + '$, $y=' + s + '$ (quadrat), $A=' + s * s + '$ m².']);
      }
      if (t === 1) {
        const s = r.int(2, 9), A = s * s;
        return P.num('Entre tots els rectangles d\'àrea $' + A + '$ m², quin és el perímetre mínim (m)?', 4 * s,
          ['$y=' + A + '/x$, perímetre $p(x)=2x+\\dfrac{' + 2 * A + '}{x}$.', '$p\'=2-\\dfrac{' + 2 * A + '}{x^2}=0$ ⇒ $x=' + s + '$ (quadrat). $p=' + 4 * s + '$ m.']);
      }
      const m = r.int(2, 8), L = 4 * m;
      return P.num('Es vol tancar un corral rectangular contra un riu (el costat del riu no necessita tanca) amb $' + L + '$ m de tanca. Quina és l\'àrea màxima (m²)?', 2 * m * m,
        ['Amb $x$ els dos costats perpendiculars i $y$ el paral·lel: $2x+y=' + L + '$ ⇒ $y=' + L + '-2x$.', '$A(x)=x(' + L + '-2x)$, $A\'=' + L + '-4x=0$ ⇒ $x=' + m + '$, $y=' + 2 * m + '$.', '$A=' + m + '\\cdot' + 2 * m + '=' + 2 * m * m + '$ m².']);
    }
  });

  gens.push({
    id: 'optim_box', title: 'Optimització: caixa sense tapa', level: 3,
    make(r) {
      const k = r.int(1, 5), s = 6 * k;
      return P.multi('D\'una planxa quadrada de $' + s + '$ cm de costat es retalla un quadrat de costat $x$ a cada cantonada i es plega per fer una caixa sense tapa. Troba el $x$ que maximitza el volum i el volum màxim.',
        [{ label: '$x=$', ans: k }, { label: '$V_{\\max}=$', ans: 2 * s * s * s / 27 }],
        ['$V(x)=x(' + s + '-2x)^2$ amb $0<x<' + s / 2 + '$.', '$V\'(x)=(' + s + '-2x)^2-4x(' + s + '-2x)=(' + s + '-2x)(' + s + '-6x)=0$ ⇒ $x=' + k + '$ (l\'altra, $x=' + s / 2 + '$, dona $V=0$).', '$V(' + k + ')=' + k + '\\cdot' + (s - 2 * k) + '^2=' + 2 * s * s * s / 27 + '$ cm³.']);
    }
  });

  gens.push({
    id: 'optim_page', title: 'Optimització: pàgina amb marges', level: 3,
    make(r) {
      const m = r.pick([1, 2, 3]), k = r.pick([1, 2, 3]), n = m * k * k, s = r.pick([4, 9, 16, 25, 36, 64, 81, 100]);
      const w = Math.sqrt(n * s / m) * 1; // amplada impresa òptima: w^2 = n*A/m
      if (!M.isInt(w)) return null;
      const A = s;
      const h = A / w;
      return P.multi('Una pàgina ha de tenir una àrea impresa de $' + A + '$ cm². Els marges superior i inferior fan $' + m + '$ cm cadascun i els laterals $' + n + '$ cm cadascun. Troba les dimensions de la pàgina (ample × alt) de superfície mínima.',
        [{ label: 'ample $=$', ans: w + 2 * n }, { label: 'alt $=$', ans: h + 2 * m }],
        ['Àrea impresa $w\\cdot h=' + A + '$. Pàgina: $(w+' + 2 * n + ')(h+' + 2 * m + ')$ amb $h=' + A + '/w$.', 'Superfície $S(w)=' + (A + 4 * m * n) + '+' + 2 * m + 'w+\\dfrac{' + 2 * n * A + '}{w}$.', '$S\'=' + 2 * m + '-\\dfrac{' + 2 * n * A + '}{w^2}=0$ ⇒ $w^2=' + n * A / m + '$ ⇒ $w=' + w + '$, $h=' + h + '$.', 'Pàgina: $' + (w + 2 * n) + '\\times' + (h + 2 * m) + '$ cm.']);
    }
  });

  gens.push({
    id: 'optim_dist', title: 'Optimització: punt més proper a la corba', level: 3,
    make(r) {
      const k = r.int(1, 6);
      return P.num('Quina és l\'ordenada $y$ del punt de la paràbola $y=x^2$ més proper al punt $(0,' + k + ')$?', k - 0.5,
        ['Distància² $d^2=x^2+(x^2-' + k + ')^2$. Amb $u=x^2$: $g(u)=u+(u-' + k + ')^2$.', '$g\'(u)=1+2(u-' + k + ')=0$ ⇒ $u=' + k + '-\\tfrac12=' + (k - 0.5) + '$.', '$g\'\'=2>0$ ⇒ mínim. Com que $y=u=x^2$, l\'ordenada és $' + (k - 0.5) + '$.']);
    }
  });

  gens.push({
    id: 'inflection', title: 'Concavitat i punts d\'inflexió', level: 2,
    make(r) {
      if (r.int(0, 1)) {
        const [p, q] = H.sortNum(H.distinct(r, 2, -3, 4));
        const f = [0, 0, 6 * p * q, -2 * (p + q), 1]; // x^4 -2(p+q)x^3 + 6pq x^2
        const f2 = M.polyDer(M.polyDer(f));
        const prob = P.multi('Troba els punts d\'inflexió (abscisses) de $f(x)=' + M.polyTex(f) + '$. Primer el menor.',
          [{ label: '$x_1=$', ans: p }, { label: '$x_2=$', ans: q }],
          ['$f\'\'(x)=' + M.polyTex(f2) + '=12(' + H.xm(p) + ')(' + H.xm(q) + ')$.', 'S\'anul·la en $x=' + p + '$ i $x=' + q + '$ i canvia de signe en tots dos ($+,-,+$) ⇒ són punts d\'inflexió.']);
        prob.solPlot = { fns: [{ f: M.polyStr(f), label: 'f' }], xr: [p - 1.5, q + 1.5], points: [[p, M.polyEval(f, p)], [q, M.polyEval(f, q)]] };
        return prob;
      }
      const h = r.int(-3, 3), a = -3 * h, b = r.int(-6, 6), c = r.int(-5, 5);
      const f = [c, b, a, 1];
      const prob = P.multi('Per a $f(x)=' + M.polyTex(f) + '$ troba l\'abscissa del punt d\'inflexió i el valor de $f$ en aquest punt.',
        [{ label: '$x=$', ans: h }, { label: '$f(x)=$', ans: M.polyEval(f, h) }],
        ['$f\'\'(x)=6x' + (a ? H.sg(2 * a) : '') + '=0$ ⇒ $x=' + h + '$ (és de grau 3: $f\'\'$ és una recta, així que canvia de signe).', 'És còncava a l\'esquerra i convexa a la dreta. $f(' + h + ')=' + M.polyEval(f, h) + '$.']);
      prob.solPlot = { fns: [{ f: M.polyStr(f), label: 'f' }], xr: [h - 4, h + 4], points: [[h, M.polyEval(f, h)]] };
      return prob;
    }
  });

  gens.push({
    id: 'abs_extrema', title: 'Extrems absoluts en [a,b]', level: 2,
    make(r) {
      const [p, q] = H.sortNum(H.distinct(r, 2, -3, 3));
      const c = r.int(-4, 4), f = cubic(p, q, c);
      const lo = p - r.int(1, 2), hi = q + r.int(1, 2);
      const cand = [lo, hi, p, q];
      const vals = cand.map(x => [x, M.polyEval(f, x)]);
      const mx = vals.reduce((a, b) => (b[1] > a[1] ? b : a)), mn = vals.reduce((a, b) => (b[1] < a[1] ? b : a));
      const prob = P.multi('Troba el <b>màxim</b> i el <b>mínim</b> absoluts (els valors) de $f(x)=' + M.polyTex(f) + '$ a l\'interval $[' + lo + ',' + hi + ']$.',
        [{ label: 'màxim $=$', ans: mx[1] }, { label: 'mínim $=$', ans: mn[1] }],
        ['Punts crítics: $f\'=6(' + H.xm(p) + ')(' + H.xm(q) + ')=0$ ⇒ $x=' + p + ',' + q + '$ (tots dos dins l\'interval).', 'Avaluem als candidats: ' + vals.map(v => '$f(' + v[0] + ')=' + T(v[1]) + '$').join(', ') + '.', 'Màxim $' + T(mx[1]) + '$ (en $x=' + mx[0] + '$) i mínim $' + T(mn[1]) + '$ (en $x=' + mn[0] + '$).']);
      prob.solPlot = { fns: [{ f: M.polyStr(f), label: 'f' }], xr: [lo - 0.3, hi + 0.3], points: [[mx[0], mx[1], 'màx'], [mn[0], mn[1], 'mín']] };
      return prob;
    }
  });

  Calc.add({
    id: 'l3', num: '3', llista: 'Llista 3', title: 'Creixement, extrems, optimització i concavitat',
    short: 'Punts crítics, signe de f\', extrems relatius i absoluts, inflexions, problemes d\'optimització.',
    desc: 'Aplicacions de la derivada: estudi de funcions i problemes de màxims i mínims.',
    theory, gens,
    bank: [
      { q: 'Si $f\'(c)=0$ i $f\'\'(c)<0$, llavors $c$ és…', c: ['mínim local', 'màxim local', 'punt d\'inflexió', 'no es pot saber'], a: 1, e: 'Còncava ⇒ màxim.' },
      { q: 'Si $f\'(x)>0$ en $(a,b)$, $f$ és…', c: ['decreixent', 'creixent', 'còncava', 'constant'], a: 1, e: 'Signe de $f\'$ ⇒ monotonia.' },
      { q: '$f(x)=x^4$ en $x=0$ té…', c: ['inflexió', 'mínim local', 'màxim local', 'res'], a: 1, e: '$f\'$ passa de $-$ a $+$. Compte: $f\'\'(0)=0$ però NO és inflexió.' },
      { q: 'Un punt d\'inflexió és on…', c: ['$f\'$ canvia de signe', '$f\'\'$ canvia de signe', '$f=0$', '$f\'\'=0$ sense més condició'], a: 1, e: 'Canvi de concavitat.' },
      { q: 'Per trobar el màxim absolut de $f$ contínua en $[a,b]$ cal comparar…', c: ['només els punts crítics', 'només els extrems', 'extrems i punts crítics', 'els punts d\'inflexió'], a: 2, e: 'Weierstrass.' },
      { q: 'En un problema d\'optimització, el primer pas després del dibuix és…', c: ['derivar', 'escriure la funció a optimitzar i la restricció', 'resoldre $f=0$', 'calcular límits'], a: 1, e: 'Cal tenir una funció d\'una sola variable.' },
      { q: '$f(x)=x^3$ té en $x=0$…', c: ['mínim', 'màxim', 'punt d\'inflexió', 'asímptota'], a: 2, e: '$f\'(0)=0$ però $f\'\\ge0$ sempre: no és extrem; $f\'\'$ canvia de signe.' },
      { q: 'Si $f\'\'>0$ en un interval, la gràfica és…', c: ['còncava (∩)', 'convexa (∪)', 'decreixent', 'creixent'], a: 1, e: 'Convexa = cap amunt.' }
    ]
  });
})();
