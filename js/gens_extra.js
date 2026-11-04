/* ===================================================================
   gens_extra.js — Tipus d'exercici que faltaven perquè cada punt del
   temari tingui la seva pròpia mestria (inequacions racionals i amb
   valor absolut, rectes, equacions trigonomètriques, límits amb arrels
   a l'infinit, asímptotes verticals i asímptotes d'exponencials).
   =================================================================== */
(function () {
  'use strict';
  const P = Calc.P, T = M.numTex;
  const add = (mod, g) => { if (Calc.byId[mod]) Calc.addGen(mod, g); };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const fr = (n, d) => { const g = gcd(n, d); n /= g; d /= g; if (d < 0) { n = -n; d = -d; } return d === 1 ? String(n) : (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; };

  /* ---------- L0: inequació racional (x−p)/(x−q) ⋚ 0 ---------- */
  add('l0', {
    id: 'ineq_rat', title: 'Inequacions racionals (taula de signes)', level: 2,
    desc: 'Inequacions amb una fracció: on s\'anul·la el numerador, on el denominador (mai inclòs) i taula de signes.', needs: ['signe', 'factor'],
    make(r) {
      const [p, q] = H.distinct(r, 2, -6, 6);
      const rel = r.pick(['\\ge', '>', '\\le', '<']), pos = rel === '\\ge' || rel === '>', strict = rel === '>' || rel === '<';
      const lo = Math.min(p, q), hi = Math.max(p, q);
      const inc = v => v === p && !strict; // només l'arrel del numerador es pot incloure
      const L = (v, open) => (open ? '(' : '[') + v, Rb = (v, open) => v + (open ? ')' : ']');
      const outside = (iL, iH) => '$(-\\infty,' + Rb(lo, !iL) + '\\cup' + L(hi, !iH) + ',+\\infty)$';
      const between = (iL, iH) => '$' + L(lo, !iL) + ',' + Rb(hi, !iH) + '$';
      const sol = pos ? outside(inc(lo), inc(hi)) : between(inc(lo), inc(hi));
      const wr = pos ? [between(inc(lo), inc(hi)), outside(!strict, !strict), outside(false, false) === sol ? outside(true, true) : outside(false, false)]
        : [outside(inc(lo), inc(hi)), between(!strict, !strict), between(false, false) === sol ? between(true, true) : between(false, false)];
      return P.mc(r, 'Resol la inequació $\\dfrac{' + H.xm(p) + '}{' + H.xm(q) + '}' + rel + '0$.', sol, wr, [
        'Punts clau: el numerador s\'anul·la a $x=' + p + '$ i el denominador a $x=' + q + '$ (on la fracció <b>no existeix</b>: mai inclòs).',
        'Taula de signes: la fracció és positiva fora de $[' + lo + ',' + hi + ']$ i negativa entre ' + lo + ' i ' + hi + ' (prova un valor de cada tros).',
        (pos ? 'Volem positiu: els trossos de fora.' : 'Volem negatiu: el tros del mig.') + (strict ? ' Desigualtat estricta: cap extrem inclòs.' : ' Amb igualtat s\'inclou $x=' + p + '$ (fa 0), però mai $x=' + q + '$.') + ' Solució: ' + sol]);
    }
  });

  /* ---------- L0: inequació amb valor absolut ---------- */
  add('l0', {
    id: 'ineq_abs', title: 'Inequacions amb valor absolut', level: 1,
    desc: 'Inequacions $|ax+b|<c$ (un interval) i $|ax+b|>c$ (dos trossos).', needs: ['signe'],
    make(r) {
      const m = r.int(-4, 4), h = r.int(1, 4), a = r.pick([1, 1, 2, 3]), c = a * h, b = -a * m;
      const rel = r.pick(['<', '\\le', '>', '\\ge']), less = rel === '<' || rel === '\\le', strict = rel === '<' || rel === '>';
      const x1 = m - h, x2 = m + h;
      const inner = (s) => '$' + (s ? '(' : '[') + x1 + ',' + x2 + (s ? ')' : ']') + '$';
      const outer = (s) => '$(-\\infty,' + x1 + (s ? ')' : ']') + '\\cup' + (s ? '(' : '[') + x2 + ',+\\infty)$';
      const sol = less ? inner(strict) : outer(strict);
      const wr = less ? [outer(strict), inner(!strict), '$(' + (-x2) + ',' + (-x1) + ')$'] : [inner(strict), outer(!strict), '$(' + x2 + ',+\\infty)$'];
      const ax = M.polyTex([b, a]);
      return P.mc(r, 'Resol $|' + ax + '|' + rel + T(c) + '$.', sol, wr.filter(w => w !== sol), [
        less ? '$|u|' + rel + c + '\\iff -' + c + rel + 'u' + rel + c + '$: <b>un sol interval</b> (a prop del centre).' : '$|u|' + rel + c + '\\iff u' + (strict ? '<' : '\\le') + '-' + c + '$ o $u' + rel + c + '$: <b>dos trossos</b> (lluny del centre).',
        '$' + ax + '=\\pm' + c + '$ dona $x=' + x1 + '$ i $x=' + x2 + '$.',
        'Solució: ' + sol]);
    }
  });

  /* ---------- L0: rectes ---------- */
  add('l0', {
    id: 'lines', title: 'Recta per dos punts (pendent i ordenada)', level: 1,
    desc: 'Pendent $m=\\frac{y_2-y_1}{x_2-x_1}$ i equació $y=mx+n$: la base de la recta tangent.', needs: ['frac'],
    make(r) {
      const m = r.nz(-4, 4), n = r.int(-6, 6), [x1, x2] = H.distinct(r, 2, -4, 5);
      const y1 = m * x1 + n, y2 = m * x2 + n;
      return P.multi('Troba la recta $y=mx+n$ que passa per $(' + x1 + ',' + y1 + ')$ i $(' + x2 + ',' + y2 + ')$.', [{ label: '$m=$', ans: m }, { label: '$n=$', ans: n }], [
        'Pendent: $m=\\dfrac{' + y2 + '-(' + y1 + ')}{' + x2 + '-(' + x1 + ')}=\\dfrac{' + (y2 - y1) + '}{' + (x2 - x1) + '}=' + m + '$.',
        'Substitueix un punt: $' + y1 + '=' + m + '\\cdot(' + x1 + ')+n\\Rightarrow n=' + n + '$.',
        'Recta: $y=' + M.polyTex([n, m]) + '$.']);
    }
  });

  /* ---------- Fonaments: equacions trigonomètriques ---------- */
  const ANG = k => { // angle k·π/12 en TeX
    k = ((k % 24) + 24) % 24; if (k === 0) return '0';
    const g = gcd(k, 12), n = k / g, d = 12 / g;
    return (d === 1 ? (n === 1 ? '\\pi' : n + '\\pi') : '\\frac{' + (n === 1 ? '' : n) + '\\pi}{' + d + '}');
  };
  const VALS = [['0', 0], ['\\frac12', 0.5], ['\\frac{\\sqrt2}{2}', Math.SQRT1_2], ['\\frac{\\sqrt3}{2}', Math.sqrt(3) / 2], ['1', 1]];
  const solSet = (fn, v) => {
    const x0 = Math.round((fn === 'sin' ? Math.asin(v) : Math.acos(v)) / (Math.PI / 12));
    const ks = fn === 'sin' ? [x0, 12 - x0] : [x0, -x0];
    return Array.from(new Set(ks.map(k => ((k % 24) + 24) % 24))).sort((a, b) => a - b);
  };
  const setTex = ks => '$x\\in\\{' + ks.map(ANG).join(',\\ ') + '\\}$';
  add('base', {
    id: 'trig_eq', title: 'Equacions trigonomètriques a $[0,2\\pi)$', level: 2,
    desc: 'Resoldre $\\sin x=a$ o $\\cos x=a$: l\'angle de la taula i el seu «simètric» a la circumferència.', needs: ['trig'],
    make(r) {
      const fn = r.pick(['sin', 'cos']), [vt, vv] = r.pick(VALS), neg = vv !== 0 && vv !== 1 ? r.pick([false, true]) : false;
      const v = neg ? -vv : vv, ks = solSet(fn, v), other = solSet(fn === 'sin' ? 'cos' : 'sin', v);
      const sol = setTex(ks);
      const wr = [setTex(other), setTex([ks[0]]), setTex(solSet(fn, -v))].filter((w, i, a) => w !== sol && a.indexOf(w) === i);
      if (wr.length < 2) wr.push(setTex(ks.map(k => k + 6)));
      const vtex = (neg ? '-' : '') + vt;
      return P.mc(r, 'Resol $\\' + fn + ' x=' + vtex + '$ per a $x\\in[0,2\\pi)$.', sol, wr, [
        'Angle de la taula: $' + (fn === 'sin' ? '\\arcsin' : '\\arccos') + '(' + vtex + ')=' + ANG(Math.round((fn === 'sin' ? Math.asin(v) : Math.acos(v)) / (Math.PI / 12))) + '$.',
        fn === 'sin' ? 'El sinus és l\'altura: el mateix valor surt a $x$ i a $\\pi-x$.' : 'El cosinus és l\'abscissa: el mateix valor surt a $x$ i a $2\\pi-x$ (o $-x$).',
        'Dins de $[0,2\\pi)$: ' + sol]);
    }
  });

  /* ---------- L1: límit a l'infinit amb arrels (conjugat) ---------- */
  add('l1', {
    id: 'limit_inf_root', title: 'Límits a l\'infinit amb arrels ($\\infty-\\infty$)', level: 2,
    desc: 'Límits del tipus $\\sqrt{x^2+ax+b}-x$ quan $x\\to\\infty$: multiplicar pel conjugat.', needs: ['limits', 'indet'],
    make(r) {
      const two = r.int(0, 1), a = r.nz(-8, 8), b = r.int(-6, 6), c = two ? r.int(-8, 8) : 0;
      if (two && c === a) return null;
      const ans = (a - c) / 2;
      const rt = (p, q) => '\\sqrt{x^2' + (p ? H.sg(p) + 'x' : '') + (q ? H.sg(q) : '') + '}';
      const tex = two ? rt(a, b) + '-' + rt(c, 0) : rt(a, b) + '-x';
      const pr = P.num('Calcula $\\displaystyle\\lim_{x\\to+\\infty}\\left(' + tex + '\\right)$.', ans, [
        'És $\\infty-\\infty$: multiplica i divideix pel <b>conjugat</b> (la suma de les dues arrels).',
        'Dalt queda la diferència de quadrats: $' + (two ? '(' + (a - c) + ')x' + H.sg(b) : M.polyTex([b, a])) + '$; baix, una cosa que es comporta com $2x$.',
        'Divideix per $x$: $\\dfrac{' + (a - c) + '}{2}=' + fr(a - c, 2) + '$.'], { ansTex: fr(a - c, 2), tol: 1e-6 });
      pr.check = () => { const x = 1e6, v = Math.sqrt(x * x + a * x + b) - (two ? Math.sqrt(x * x + c * x) : x); return Math.abs(v - ans) < 1e-3; };
      return pr;
    }
  });

  /* ---------- L4: asímptotes verticals (i forats) ---------- */
  add('l4', {
    id: 'asymp_vert', title: 'Asímptotes verticals (i discontinuïtats evitables)', level: 2,
    desc: 'On el denominador s\'anul·la hi ha asímptota vertical només si el límit és infinit: si també s\'anul·la el numerador, pot ser un «forat».', needs: ['asimp', 'limits', 'factor'],
    make(r) {
      const [p, q, s] = H.distinct(r, 3, -5, 5);
      const variant = r.int(0, 1);
      if (variant === 0) { // f = (x−p)(x−s)/((x−p)(x−q)): forat a p, AV a q
        const num = M.polyMul([-p, 1], [-s, 1]), den = M.polyMul([-p, 1], [-q, 1]);
        const sol = 'Només $x=' + q + '$';
        return P.mc(r, 'Quines asímptotes verticals té $f(x)=\\dfrac{' + M.polyTex(num) + '}{' + M.polyTex(den) + '}$?', sol,
          ['$x=' + p + '$ i $x=' + q + '$', 'Només $x=' + p + '$', 'Cap', 'Només $x=' + s + '$'], [
            'Factoritza: $f(x)=\\dfrac{(' + H.xm(p) + ')(' + H.xm(s) + ')}{(' + H.xm(p) + ')(' + H.xm(q) + ')}$.',
            'A $x=' + p + '$ el factor es simplifica: $\\lim_{x\\to' + p + '}f=\\frac{' + (p - s) + '}{' + (p - q) + '}$ és <b>finit</b> → és un forat (discontinuïtat evitable), no una asímptota.',
            'A $x=' + q + '$ el denominador fa 0 i el numerador no ($' + (q - p) * (q - s) + '\\ne0$ abans de simplificar) → el límit és infinit: <b>asímptota vertical</b>.']);
      }
      // signe dels límits laterals a l'asímptota x=q de f=(x−s)/(x−q)
      const right = (q - s) > 0 ? '+\\infty' : '-\\infty', left = (q - s) > 0 ? '-\\infty' : '+\\infty';
      const sol = '$\\displaystyle\\lim_{x\\to' + q + '^-}f=' + left + '$, $\\displaystyle\\lim_{x\\to' + q + '^+}f=' + right + '$';
      const sw = '$\\displaystyle\\lim_{x\\to' + q + '^-}f=' + right + '$, $\\displaystyle\\lim_{x\\to' + q + '^+}f=' + left + '$';
      return P.mc(r, 'La funció $f(x)=\\dfrac{' + H.xm(s) + '}{' + H.xm(q) + '}$ té asímptota vertical a $x=' + q + '$. Com són els límits laterals?', sol,
        [sw, '$\\displaystyle\\lim_{x\\to' + q + '^\\pm}f=+\\infty$', '$\\displaystyle\\lim_{x\\to' + q + '^\\pm}f=-\\infty$'], [
          'Prop de $x=' + q + '$ el numerador val gairebé $' + (q - s) + '$ (' + (q - s > 0 ? 'positiu' : 'negatiu') + ').',
          'Per la dreta ($x>' + q + '$) el denominador és un positiu petit; per l\'esquerra, un negatiu petit.',
          'Signe = signe(numerador) · signe(denominador): ' + sol]);
    }
  });

  /* ---------- L4: asímptotes horitzontals de funcions amb e^x ---------- */
  add('l4', {
    id: 'asymp_exp', title: 'Asímptotes horitzontals amb $e^x$ (a $+\\infty$ i a $-\\infty$)', level: 2,
    desc: 'Amb exponencials el límit a $+\\infty$ i a $-\\infty$ pot ser diferent: dues asímptotes horitzontals.', needs: ['asimp', 'log'],
    make(r) {
      const a = r.nz(-5, 5), c = r.int(1, 4), k = r.nz(-4, 4), b = c * k;
      if (a === k) return null;
      return P.multi('Troba les asímptotes horitzontals de $f(x)=\\dfrac{' + (a === 1 ? '' : a === -1 ? '-' : a) + 'e^x' + H.sg(b) + '}{e^x+' + c + '}$.',
        [{ label: 'a $+\\infty$: $y=$', ans: a }, { label: 'a $-\\infty$: $y=$', ans: k }], [
          '$x\\to+\\infty$: $e^x$ domina. Divideix per $e^x$: $\\dfrac{' + a + '+' + b + 'e^{-x}}{1+' + c + 'e^{-x}}\\to' + a + '$.',
          '$x\\to-\\infty$: $e^x\\to0$, queda $\\dfrac{' + b + '}{' + c + '}=' + k + '$.',
          'Dues asímptotes horitzontals: $y=' + a + '$ (dreta) i $y=' + k + '$ (esquerra). El denominador mai s\'anul·la: cap vertical.']);
    }
  });
})();
