/* Llista 1 — Bolzano, continuïtat, límits, recta tangent */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;

  const theory = `
<h3>Teorema de Bolzano</h3>
<div class="box formula">Si $f$ és <b>contínua</b> en $[a,b]$ i $f(a)\\cdot f(b)<0$ (signes oposats), llavors existeix $c\\in(a,b)$ amb $f(c)=0$.</div>
<p><b>Com s'escriu a l'examen</b> (3 passos): (1) $f$ és contínua (polinomi, exponencial…); (2) calcula $f(a)$ i $f(b)$ i digues que tenen signe diferent; (3) conclusió: per Bolzano hi ha una arrel a $(a,b)$.</p>
<p><b>Truc</b> per a "$f(c)=k$": aplica Bolzano a $g(x)=f(x)-k$. Per a "hi ha tres nombres tals que…": troba tres canvis de signe en tres intervals disjunts (polinomi de grau 3 ⇒ com a molt 3 arrels).</p>
<p>El <b>Teorema del valor intermedi</b> és la versió general: una funció contínua en $[a,b]$ pren tots els valors entre $f(a)$ i $f(b)$.</p>

<h3>Continuïtat</h3>
<p>$f$ és contínua en $a$ si $\\lim_{x\\to a}f(x)=f(a)$, és a dir, es compleixen <b>tres coses</b>: existeix $f(a)$, existeix el límit, i són iguals. Per a funcions a trossos cal igualar els <b>límits laterals</b> al punt de canvi:</p>
<div class="box formula">$\\lim_{x\\to a^-}f(x)=\\lim_{x\\to a^+}f(x)=f(a)$</div>
<p>Per trobar paràmetres: planteja una equació per cada punt de canvi (una incògnita ⇒ una equació; dues ⇒ sistema).</p>
<p>Tipus de discontinuïtat: <b>evitable</b> (el límit existeix però $\\neq f(a)$ o $f(a)$ no existeix), <b>de salt</b> (laterals finits diferents), <b>asimptòtica</b> (límit infinit).</p>

<h3>Càlcul de límits (receptes)</h3>
<ul>
<li><b>Substitueix primer.</b> Si dona un nombre, ja està.</li>
<li>$\\dfrac{0}{0}$ amb polinomis: <b>factoritza</b> i simplifica $(x-a)$. Amb arrels: <b>multiplica pel conjugat</b>.</li>
<li>$x\\to\\pm\\infty$ amb quocient de polinomis: divideix per la potència més gran del denominador. Grau num $<$ grau den ⇒ 0; iguals ⇒ quocient de coeficients principals; num $>$ den ⇒ $\\pm\\infty$.</li>
<li>$\\sqrt{x^2+ax}-x$ quan $x\\to+\\infty$: multiplica i divideix pel conjugat ⇒ $a/2$.</li>
<li>$\\dfrac{k}{0}$: el límit és $\\pm\\infty$ o no existeix; <b>estudia els límits laterals</b> (el signe).</li>
<li>Límits notables: $\\lim_{x\\to0}\\frac{\\sin x}{x}=1$, $\\lim_{x\\to0}\\frac{e^x-1}{x}=1$, $\\lim_{x\\to\\infty}\\left(1+\\frac1x\\right)^x=e$.</li>
</ul>

<h3>Recta tangent</h3>
<div class="box formula">Tangent a $y=f(x)$ en $x=a$: &nbsp; $y=f(a)+f'(a)(x-a)$</div>
<p>Si et demanen la tangent que passa per un punt <b>exterior</b> $(p,q)$ (que no és de la corba): anomena $t$ el punt de tangència, escriu la tangent en $t$ i obliga-la a passar per $(p,q)$ ⇒ equació en $t$.</p>
`;

  const gens = [];
  const cubicTex = c => M.polyTex(c);

  gens.push({
    id: 'bolzano_mc', title: 'Bolzano: en quin interval hi ha arrel?', level: 1,
    make(r) {
      const a = r.int(1, 4), c = r.int(-6, 6), k = r.int(-4, 4);
      const f = [c, a, 0, 1]; // x^3 + a x + c  (monòtona)
      const fx = x => M.polyEval(f, x);
      const root = M.bisect(fx, -8, 8);
      const k0 = Math.floor(root);
      const ivs = [k0 - 1, k0, k0 + 1, k0 + 2];
      const wrongs = ivs.filter(v => v !== k0).map(v => '$[' + v + ',' + (v + 1) + ']$');
      return P.mc(r, 'Per al teorema de Bolzano, la funció $f(x)=' + cubicTex(f) + '$ té segur una arrel a l\'interval…', '$[' + k0 + ',' + (k0 + 1) + ']$', wrongs,
        ['$f$ és un polinomi ⇒ contínua. Calculem signes: ' + ivs.map(v => '$f(' + v + ')=' + T(fx(v)) + '$').join(', ') + '.',
          'El canvi de signe és a $[' + k0 + ',' + (k0 + 1) + ']$.']);
    }
  });

  gens.push({
    id: 'bolzano_vals', title: 'Bolzano: calcula f(a) i f(b)', level: 1,
    make(r) {
      const p = r.int(-3, 2), q = p + r.int(2, 3);
      const k = r.int(1, 5);
      const f = [r.int(-8, 8) * 1, r.nz(-3, 3), r.nz(-2, 2), 1];
      const fa = M.polyEval(f, p), fb = M.polyEval(f, q);
      return P.multi('Volem aplicar Bolzano a $f(x)=' + M.polyTex(f) + '$ en $[' + p + ',' + q + ']$. Calcula $f(' + p + ')$ i $f(' + q + ')$.',
        [{ label: '$f(' + p + ')=$', ans: fa }, { label: '$f(' + q + ')=$', ans: fb }],
        ['$f(' + p + ')=' + T(fa) + '$ i $f(' + q + ')=' + T(fb) + '$.', fa * fb < 0 ? 'Signes oposats ⇒ per Bolzano hi ha arrel a $(' + p + ',' + q + ')$.' : 'Mateix signe ⇒ Bolzano <b>no</b> garanteix res en aquest interval.']);
    }
  });

  gens.push({
    id: 'limit_factor', title: 'Límits 0/0: factoritzar i conjugat', level: 2,
    make(r) {
      const t = r.int(0, 3);
      const a = r.nz(-4, 4);
      if (t === 0) {
        const q = a + r.nz(-4, 4);
        const num = M.polyMul([-a, 1], [-q, 1]);
        return P.num('Calcula $\\displaystyle\\lim_{x\\to ' + a + '}\\dfrac{' + M.polyTex(num) + '}{' + H.xm(a) + '}$', a - q,
          ['Substituir dona $0/0$. Factoritza el numerador: $(' + H.xm(a) + ')(' + H.xm(q) + ')$.', 'Simplifica $(' + H.xm(a) + ')$: el límit és $\\lim (' + H.xm(q) + ')=' + (a - q) + '$.']);
      }
      if (t === 1) {
        const num = [-Math.pow(a, 3), 0, 0, 1];
        return P.num('Calcula $\\displaystyle\\lim_{x\\to ' + a + '}\\dfrac{x^3' + H.sg(-Math.pow(a, 3)) + '}{' + H.xm(a) + '}$', 3 * a * a,
          ['$x^3-a^3=(x-a)(x^2+ax+a^2)$ amb $a=' + a + '$.', 'Simplifica i substitueix: $3a^2=' + 3 * a * a + '$.']);
      }
      if (t === 2) {
        const m = r.int(2, 5), k = r.int(1, 6), x0 = m * m - k;
        return P.num('Calcula $\\displaystyle\\lim_{x\\to ' + x0 + '}\\dfrac{\\sqrt{x' + H.sg(k) + '}-' + m + '}{' + H.xm(x0) + '}$', 1 / (2 * m),
          ['$0/0$. Multiplica i divideix pel conjugat $\\sqrt{x' + H.sg(k) + '}+' + m + '$.', 'El numerador queda $(x' + H.sg(k) + ')-' + m * m + '=' + H.xm(x0) + '$, que se simplifica.', 'Queda $\\lim\\dfrac{1}{\\sqrt{x' + H.sg(k) + '}+' + m + '}=\\dfrac1{' + 2 * m + '}$.']);
      }
      return P.num('Calcula $\\displaystyle\\lim_{x\\to ' + a + '}\\dfrac{x^2-' + a * a + '}{' + H.xm(a) + '}$', 2 * a, ['$x^2-a^2=(x-a)(x+a)$ ⇒ el límit és $2a=' + 2 * a + '$.']);
    }
  });

  gens.push({
    id: 'limit_inf', title: 'Límits a l\'infinit', level: 1,
    make: null
  });
  gens[gens.length - 1].make = function (r) {
    const t = r.int(0, 3);
    if (t === 0) {
      const a = r.nz(-5, 5), b = r.int(-4, 4), c = r.nz(1, 5), d = r.int(-4, 4), e = r.int(-3, 3);
      return P.num('Calcula $\\displaystyle\\lim_{x\\to+\\infty}\\dfrac{' + M.polyTex([b, d, a]) + '}{' + M.polyTex([e, 0, c]) + '}$', a / c,
        ['Mateix grau (2) a dalt i a baix ⇒ el límit és el quocient dels coeficients principals: $\\dfrac{' + a + '}{' + c + '}=' + T(a / c) + '$.']);
    }
    if (t === 1) {
      const a = r.nz(-5, 5), c = r.int(1, 4), d = r.int(-4, 4);
      return P.num('Calcula $\\displaystyle\\lim_{x\\to+\\infty}\\dfrac{' + M.polyTex([r.int(-4, 4), a]) + '}{' + M.polyTex([d, 1, c]) + '}$', 0,
        ['El grau del numerador (1) és menor que el del denominador (2) ⇒ el límit és $0$.']);
    }
    if (t === 2) {
      const a = r.int(1, 4) * 2 * r.sign();
      return P.num('Calcula $\\displaystyle\\lim_{x\\to+\\infty}\\left(\\sqrt{x^2' + H.sg(a) + 'x}-x\\right)$', a / 2,
        ['Forma $\\infty-\\infty$. Multiplica i divideix pel conjugat: $\\dfrac{(x^2' + H.sg(a) + 'x)-x^2}{\\sqrt{x^2' + H.sg(a) + 'x}+x}=\\dfrac{' + a + 'x}{\\sqrt{x^2' + H.sg(a) + 'x}+x}$.', 'Divideix per $x$: $\\dfrac{' + a + '}{\\sqrt{1' + H.sg(a) + '/x}+1}\\to\\dfrac{' + a + '}{2}=' + a / 2 + '$.']);
    }
    const a = r.nz(-4, 4), c = r.int(1, 4);
    return P.num('Calcula $\\displaystyle\\lim_{x\\to+\\infty}\\dfrac{' + M.polyTex([r.int(-3, 3), 0, 0, a]) + '}{' + M.polyTex([1, 0, c]) + '}$', a > 0 ? Infinity : -Infinity,
      ['Grau del numerador (3) $>$ grau del denominador (2): el límit és infinit, amb el signe de $' + a + '/' + c + '$.', 'Resposta: $' + (a > 0 ? '+' : '-') + '\\infty$ (escriu <code>inf</code> o <code>-inf</code>).'], { ansTex: a > 0 ? '+\\infty' : '-\\infty' });
  };

  gens.push({
    id: 'limit_lateral', title: 'Límits laterals (funcions a trossos)', level: 2,
    make(r) {
      const a = r.int(-3, 3), b = r.int(-4, 4), k = r.nz(-3, 3), c = r.int(-4, 4);
      const left = a * a + b, right = k * a + c;
      return P.multi('Considera $f(x)=\\begin{cases}x^2' + H.sg(b) + ' & x<' + a + '\\\\ ' + M.polyTex([c, k]) + ' & x\\ge ' + a + '\\end{cases}$. Calcula els límits laterals en $x=' + a + '$.',
        [{ label: '$\\lim_{x\\to ' + a + '^-}f=$', ans: left }, { label: '$\\lim_{x\\to ' + a + '^+}f=$', ans: right }],
        ['Per l\'esquerra ($x<' + a + '$) s\'usa la primera fórmula: $' + a + '^2' + H.sg(b) + '=' + left + '$.', 'Per la dreta s\'usa la segona: $' + k + '\\cdot' + (a < 0 ? '(' + a + ')' : a) + H.sg(c) + '=' + right + '$.', left === right ? 'Coincideixen ⇒ el límit existeix i és contínua.' : 'Són diferents ⇒ discontinuïtat de salt.']);
    }
  });

  gens.push({
    id: 'cont_param', title: 'Continuïtat: troba el paràmetre', level: 2,
    make: null
  });
  gens[gens.length - 1].make = (function () {
    return function (r) {
      const t = r.int(0, 2);
      if (t === 0) {
        const a = r.int(1, 3), c = r.int(-4, 4);
        const val = a * a - c, kv = (val - 1) / a;
        return P.num('Determina $k$ perquè $f(x)=\\begin{cases}kx+1 & x<' + a + '\\\\ x^2' + H.sg(-c) + ' & x\\ge ' + a + '\\end{cases}$ sigui contínua en $x=' + a + '$.', kv,
          ['Esquerra: $' + a + 'k+1$. Dreta: $' + a + '^2' + H.sg(-c) + '=' + val + '$.', 'Igualem: $' + a + 'k+1=' + val + '$ ⇒ $k=' + T(kv) + '$.']);
      }
      if (t === 1) {
        const a = r.nz(-4, 4);
        return P.num('Determina $k$ perquè $f(x)=\\begin{cases}\\dfrac{x^2-' + a * a + '}{' + H.xm(a) + '} & x\\ne ' + a + '\\\\ k & x=' + a + '\\end{cases}$ sigui contínua en $x=' + a + '$.', 2 * a,
          ['El límit és $\\lim\\dfrac{(x-a)(x+a)}{x-a}=2a=' + 2 * a + '$.', 'Cal $f(' + a + ')=k$ igual al límit ⇒ $k=' + 2 * a + '$.']);
      }
      const k = r.int(2, 6);
      return P.num('Determina $k$ perquè $f(x)=\\begin{cases}\\dfrac{\\sin(' + k + 'x)}{x} & x\\ne0\\\\ k & x=0\\end{cases}$ sigui contínua en $x=0$.', k,
        ['$\\lim_{x\\to0}\\dfrac{\\sin(' + k + 'x)}{x}=' + k + '\\cdot\\lim\\dfrac{\\sin(' + k + 'x)}{' + k + 'x}=' + k + '$.', 'Per tant $k=' + k + '$.']);
    };
  })();

  gens.push({
    id: 'cont_two', title: 'Continuïtat amb dos paràmetres', level: 3,
    make(r) {
      const p = r.int(-2, 0), q = p + r.int(2, 3);
      const a = r.nz(-3, 3), b = r.int(-4, 4);
      const al = r.nz(-3, 3), be = a * p + b - al * p;
      const ga = r.nz(-3, 3), de = a * q + b - ga * q;
      return P.multi('Troba $a$ i $b$ perquè sigui contínua a tot $\\mathbb R$: $f(x)=\\begin{cases}' + M.polyTex([be, al]) + ' & x\\le ' + p + '\\\\ ax+b & ' + p + '<x<' + q + '\\\\ ' + M.polyTex([de, ga]) + ' & x\\ge ' + q + '\\end{cases}$',
        [{ label: '$a=$', ans: a }, { label: '$b=$', ans: b }],
        ['En $x=' + p + '$: $' + M.polyEval([be, al], p) + '=' + p + 'a+b$.', 'En $x=' + q + '$: $' + q + 'a+b=' + M.polyEval([de, ga], q) + '$.', 'Restant: $' + (q - p) + 'a=' + (M.polyEval([de, ga], q) - M.polyEval([be, al], p)) + '$ ⇒ $a=' + a + '$, $b=' + b + '$.']);
    }
  });

  gens.push({
    id: 'tangent', title: 'Recta tangent en un punt', level: 1,
    make(r) {
      const pool = [
        () => { const c = [r.int(-4, 4), r.nz(-3, 3), r.nz(-2, 2), 1]; const a = r.int(-2, 2); return [M.polyStr(c), M.polyTex(c), a]; },
        () => { const c = [r.int(-4, 4), r.nz(-4, 4), r.nz(-3, 3)]; const a = r.int(-3, 3); return [M.polyStr(c), M.polyTex(c), a]; },
        () => { const a = r.pick([1, 4, 9]); return ['sqrt(x)', '\\sqrt{x}', a]; },
        () => { const a = r.int(1, 4); return ['1/x', '\\frac1x', a]; },
        () => ['ln(x)', '\\ln x', 1],
        () => { const a = r.int(0, 2); return ['x*e^x', 'xe^{x}', 0]; }
      ];
      const [src, tex, a] = r.pick(pool)();
      const f = M.compile(src), d = M.compile(M.diff(src));
      const fa = f(a), da = d(a);
      if (!M.toFrac(fa) || !M.toFrac(da)) return null;
      const ans = '(' + M.numStr(fa) + ')+(' + M.numStr(da) + ')*(x-(' + a + '))';
      return P.fn('Escriu l\'equació de la recta tangent a $f(x)=' + tex + '$ en $x=' + a + '$ (escriu $y=\\dots$ com una expressió en $x$).', ans,
        ['$f(' + a + ')=' + T(fa) + '$.', '$f\'(x)=' + M.toTex(M.diff(src)) + '$ ⇒ $f\'(' + a + ')=' + T(da) + '$.', 'Tangent: $y=f(a)+f\'(a)(x-a)=' + T(fa) + (da < 0 ? '-' : '+') + T(Math.abs(da)) + '(x' + H.sg(-a) + ')$.'],
        { range: [-1.7, 2.9] });
    }
  });

  gens.push({
    id: 'tangent_ext', title: 'Tangents des d\'un punt exterior', level: 3,
    make(r) {
      const [t1, t2] = H.sortNum(H.distinct(r, 2, -4, 4));
      const px = (t1 + t2) / 2, py = t1 * t2;
      return P.multi('Troba els punts de tangència (abscisses) de les rectes tangents a $y=x^2$ que passen pel punt $\\left(' + T(px) + ',' + py + '\\right)$. Primer la menor.',
        [{ label: '$t_1=$', ans: t1 }, { label: '$t_2=$', ans: t2 }],
        ['Tangent en $x=t$: $y=t^2+2t(x-t)=2tx-t^2$.', 'Passa per $(' + T(px) + ',' + py + ')$: $' + py + '=2t\\cdot' + (px < 0 ? '(' + T(px) + ')' : T(px)) + '-t^2$ ⇒ $t^2' + H.sg(-2 * px) + 't' + H.sg(py) + '=0$.', 'Solucions: $t=' + t1 + '$ i $t=' + t2 + '$.']);
    }
  });

  Calc.add({
    id: 'l1', num: '1', llista: 'Llista 1', title: 'Bolzano, continuïtat, límits i recta tangent',
    short: 'Teorema de Bolzano, continuïtat de funcions a trossos, límits i tangents.',
    desc: 'Primer bloc fort del curs: límits i continuïtat.',
    theory, gens,
    bank: [
      { q: 'Per aplicar Bolzano a $f$ en $[a,b]$ cal que…', c: ['$f$ sigui derivable', '$f$ sigui contínua i $f(a)f(b)<0$', '$f(a)=f(b)$', '$f$ sigui creixent'], a: 1, e: 'Continuïtat + signes oposats als extrems.' },
      { q: '$\\lim_{x\\to0}\\dfrac{\\sin x}{x}=$', c: ['0', '1', '$\\infty$', 'No existeix'], a: 1, e: 'Límit notable.' },
      { q: 'Una discontinuïtat de salt es produeix quan…', c: ['el límit és infinit', 'els límits laterals existeixen i són diferents', 'no existeix $f(a)$ però el límit sí', 'la funció no està definida'], a: 1, e: 'Laterals finits diferents.' },
      { q: '$\\lim_{x\\to+\\infty}\\dfrac{3x^2+1}{5x^2-x}=$', c: ['0', '$3/5$', '$\\infty$', '$-1$'], a: 1, e: 'Mateix grau: quocient de coeficients principals.' },
      { q: 'Si $f(x)=\\dfrac{|x|}{x}$, llavors $\\lim_{x\\to0}f(x)$…', c: ['val 1', 'val $-1$', 'no existeix (laterals $-1$ i $1$)', 'val 0'], a: 2, e: 'Per l\'esquerra $-1$, per la dreta $1$.' },
      { q: 'La recta tangent a $f$ en $x=a$ és…', c: ['$y=f(a)+f\'(a)(x-a)$', '$y=f\'(a)x$', '$y=f(a)(x-a)$', '$y=f(x)+f\'(a)$'], a: 0, e: 'Punt $(a,f(a))$ i pendent $f\'(a)$.' },
      { q: '$\\lim_{x\\to2}\\dfrac{x^2-4}{x-2}=$', c: ['0', '2', '4', 'No existeix'], a: 2, e: '$(x+2)\\to4$.' },
      { q: 'Si $f$ és contínua en $[0,1]$, $f(0)=-2$ i $f(1)=3$, llavors…', c: ['$f$ té una arrel a $(0,1)$', '$f$ és creixent', '$f$ és derivable', '$f(0.5)=0.5$'], a: 0, e: 'Bolzano.' }
    ]
  });
})();
